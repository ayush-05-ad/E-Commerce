"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import Razorpay from "razorpay";
import crypto from "crypto";
import { CartItem } from "@/types/cart.types";
import { z } from "zod";
import { sendEmail, generateCustomerEmailTemplate, generateSellerEmailTemplate } from "@/lib/mail";

const addressValidationSchema = z.object({
  street: z.string().min(5, "Street address must be at least 5 characters long"),
  city: z.string().min(2, "City must be at least 2 characters long"),
  state: z.string().min(2, "State must be at least 2 characters long"),
  zipCode: z.string().min(3, "Zip code must be at least 3 characters long"),
  country: z.string().min(2, "Country must be at least 2 characters long"),
  phone: z.string().min(8, "Phone number must be at least 8 digits"),
});

// Helper to check if credentials are set
const hasRazorpayConfig = process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET;

// Create Razorpay instance conditionally
function getRazorpay() {
  if (!hasRazorpayConfig) return null;
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  });
}

// 1. Create a Razorpay Order (Server Action)
export async function createRazorpayOrder(
  cartItems: CartItem[],
  addressData: z.infer<typeof addressValidationSchema>
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    const user = await db.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    if (cartItems.length === 0) {
      return { success: false, error: "Cart is empty" };
    }

    // Validate Address
    const validatedAddress = addressValidationSchema.parse(addressData);

    // Get product to check Store
    const firstProduct = await db.product.findUnique({
      where: { id: cartItems[0].productId },
      select: { storeId: true },
    });

    if (!firstProduct) {
      return { success: false, error: "Product not found" };
    }

    // Create shipping address in DB
    const address = await db.address.create({
      data: {
        userId: user.id,
        street: validatedAddress.street,
        city: validatedAddress.city,
        state: validatedAddress.state,
        zipCode: validatedAddress.zipCode,
        country: validatedAddress.country,
      },
    });

    const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const shipping = subtotal > 100 || subtotal === 0 ? 0 : 10;
    const tax = subtotal * 0.08;
    const total = subtotal + shipping + tax;

    // Create Pending Order in DB
    const order = await db.order.create({
      data: {
        userId: user.id,
        storeId: firstProduct.storeId,
        status: "PENDING",
        isPaid: false,
        total: total,
        addressId: address.id,
        phone: addressData.phone,
        items: {
          create: cartItems.map((item) => ({
            productId: item.productId,
            variantId: item.id.startsWith("default") ? null : item.id,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
    });

    // Create Razorpay Order
    const amountInINR = Math.round(total); // Direct Rupee pricing
    const rzp = getRazorpay();

    if (!rzp) {
      // Return a mock order details if keys are missing
      const mockRazorpayOrderId = `rzp_mock_${Math.random().toString(36).substring(2, 10)}`;
      await db.order.update({
        where: { id: order.id },
        data: { razorpayOrderId: mockRazorpayOrderId },
      });

      return {
        success: true,
        orderId: order.id,
        razorpayOrderId: mockRazorpayOrderId,
        amount: amountInINR * 100,
        currency: "INR",
        keyId: "rzp_test_mock_keys",
        isMock: true,
      };
    }

    const rzpOrder = await rzp.orders.create({
      amount: amountInINR * 100, // paise
      currency: "INR",
      receipt: order.id,
    });

    await db.order.update({
      where: { id: order.id },
      data: { razorpayOrderId: rzpOrder.id },
    });

    return {
      success: true,
      orderId: order.id,
      razorpayOrderId: rzpOrder.id,
      amount: rzpOrder.amount,
      currency: "INR",
      keyId: process.env.RAZORPAY_KEY_ID,
      isMock: false,
    };
  } catch (error) {
    console.error("Create Razorpay Order Error:", error);
    return { success: false, error: "Failed to initialize payment order" };
  }
}

// 2. Verify Razorpay Signature and dispatch emails
export async function verifyRazorpayPayment(
  orderId: string,
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    // Verify signature if not using mock payment mode
    if (!razorpayOrderId.startsWith("rzp_mock")) {
      if (!hasRazorpayConfig) {
        return { success: false, error: "Razorpay credentials are not set." };
      }
      const generated_signature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
        .update(razorpayOrderId + "|" + razorpayPaymentId)
        .digest("hex");

      if (generated_signature !== razorpaySignature) {
        return { success: false, error: "Invalid payment signature verification." };
      }
    }

    // Update order status to PAID
    const order = await db.order.update({
      where: { id: orderId },
      data: {
        isPaid: true,
        status: "PAID",
      },
      include: {
        user: true,
        address: true,
        store: {
          include: {
            seller: true,
          },
        },
        items: {
          include: {
            product: true,
            variant: true,
          },
        },
      },
    });

    // Construct email payload
    const mailDetails = {
      orderId: order.id,
      date: new Date(order.createdAt).toLocaleDateString(),
      customerName: order.user.name,
      customerEmail: order.user.email,
      phone: order.phone || "",
      shippingAddress: {
        street: order.address?.street || "",
        city: order.address?.city || "",
        state: order.address?.state || "",
        zipCode: order.address?.zipCode || "",
        country: order.address?.country || "",
      },
      items: order.items.map((i) => ({
        name: i.product.name,
        size: i.variant?.size,
        color: i.variant?.color,
        quantity: i.quantity,
        price: i.price,
      })),
      total: order.total,
      paymentMethod: "Razorpay" as const,
    };

    // Send emails (fail-safe)
    try {
      const customerHtml = generateCustomerEmailTemplate(mailDetails);
      const sellerHtml = generateSellerEmailTemplate(mailDetails);

      await Promise.all([
        sendEmail({
          to: order.user.email,
          subject: `Order Confirmed: ${order.id.slice(0, 8)}`,
          html: customerHtml,
        }),
        sendEmail({
          to: order.store.seller.email,
          subject: `New Store Sale: ${order.id.slice(0, 8)}`,
          html: sellerHtml,
        }),
      ]);
    } catch (mailError) {
      console.error("Nodemailer dispatch failed during checkout validation:", mailError);
    }

    return { success: true, orderId: order.id };
  } catch (error) {
    console.error("Verify Razorpay Payment Error:", error);
    return { success: false, error: "Failed to verify payment." };
  }
}

// 3. Create COD Order (Server Action)
export async function createCODOrder(
  cartItems: CartItem[],
  addressData: z.infer<typeof addressValidationSchema>
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    const user = await db.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    if (cartItems.length === 0) {
      return { success: false, error: "Cart is empty" };
    }

    // Validate Address
    const validatedAddress = addressValidationSchema.parse(addressData);

    // Get store ID
    const firstProduct = await db.product.findUnique({
      where: { id: cartItems[0].productId },
      select: { storeId: true },
    });

    if (!firstProduct) {
      return { success: false, error: "Product not found" };
    }

    // Create shipping address record
    const address = await db.address.create({
      data: {
        userId: user.id,
        street: validatedAddress.street,
        city: validatedAddress.city,
        state: validatedAddress.state,
        zipCode: validatedAddress.zipCode,
        country: validatedAddress.country,
      },
    });

    const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const shipping = subtotal > 100 || subtotal === 0 ? 0 : 10;
    const tax = subtotal * 0.08;
    const total = subtotal + shipping + tax;

    // Create COD Order (starts as PROCESSING, unpaid)
    const order = await db.order.create({
      data: {
        userId: user.id,
        storeId: firstProduct.storeId,
        status: "PROCESSING",
        isPaid: false,
        total: total,
        addressId: address.id,
        phone: addressData.phone,
        razorpayOrderId: "COD", // Demarcates COD
        items: {
          create: cartItems.map((item) => ({
            productId: item.productId,
            variantId: item.id.startsWith("default") ? null : item.id,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: {
        user: true,
        address: true,
        store: {
          include: {
            seller: true,
          },
        },
        items: {
          include: {
            product: true,
            variant: true,
          },
        },
      },
    });

    // Send order confirmation emails for COD (fail-safe)
    const mailDetails = {
      orderId: order.id,
      date: new Date(order.createdAt).toLocaleDateString(),
      customerName: order.user.name,
      customerEmail: order.user.email,
      phone: order.phone || "",
      shippingAddress: {
        street: order.address?.street || "",
        city: order.address?.city || "",
        state: order.address?.state || "",
        zipCode: order.address?.zipCode || "",
        country: order.address?.country || "",
      },
      items: order.items.map((i) => ({
        name: i.product.name,
        size: i.variant?.size,
        color: i.variant?.color,
        quantity: i.quantity,
        price: i.price,
      })),
      total: order.total,
      paymentMethod: "COD" as const,
    };

    try {
      const customerHtml = generateCustomerEmailTemplate(mailDetails);
      const sellerHtml = generateSellerEmailTemplate(mailDetails);

      await Promise.all([
        sendEmail({
          to: order.user.email,
          subject: `COD Order Confirmed: ${order.id.slice(0, 8)}`,
          html: customerHtml,
        }),
        sendEmail({
          to: order.store.seller.email,
          subject: `New Store COD Order: ${order.id.slice(0, 8)}`,
          html: sellerHtml,
        }),
      ]);
    } catch (mailError) {
      console.error("Nodemailer dispatch failed during COD order placement:", mailError);
    }

    return { success: true, orderId: order.id };
  } catch (error) {
    console.error("Create COD Order Error:", error);
    return { success: false, error: "Failed to create Cash on Delivery order." };
  }
}
