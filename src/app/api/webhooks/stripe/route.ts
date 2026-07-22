import { headers } from "next/headers";
import Stripe from "stripe";
import { db } from "@/lib/db";
import { apiError, apiSuccess } from "@/lib/api-response";

interface CustomSession {
  metadata?: {
    orderId?: string;
    userId?: string;
  };
  shipping_details?: {
    address?: {
      line1?: string;
      city?: string;
      state?: string;
      postal_code?: string;
      country?: string;
    };
  } | null;
}

let stripeInstance: Stripe | null = null;
function getStripe() {
  if (!stripeInstance) {
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
      apiVersion: "2024-04-10" as unknown as never,
    });
  }
  return stripeInstance;
}

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get("Stripe-Signature") as string;

  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Stripe Webhook Signature Verification Failed:", message);
    return apiError(`Webhook Error: ${message}`, 400);
  }

  const session = event.data.object as unknown as CustomSession;

  if (event.type === "checkout.session.completed") {
    // Retrieve the order ID we injected into the metadata during checkout creation
    const orderId = session.metadata?.orderId;
    
    if (!orderId) {
      return apiError("Missing orderId in metadata", 400);
    }

    // Extract address data from the Stripe session
    const shippingDetails = session.shipping_details;
    const address = shippingDetails?.address;

    if (address) {
      // First, ensure the address exists or create it
      const userAddress = await db.address.create({
        data: {
          userId: session.metadata?.userId as string,
          street: address.line1 || "",
          city: address.city || "",
          state: address.state || "",
          zipCode: address.postal_code || "",
          country: address.country || "",
        }
      });

      // Update the Order to PAID and attach the shipping address
      await db.order.update({
        where: { id: orderId },
        data: {
          status: "PAID",
          isPaid: true,
          addressId: userAddress.id,
        },
      });

      // Here you would also decrement product inventory based on the order items
      // by pulling the order items from the DB and running a Prisma update on the variants.
    }
  }

  return apiSuccess("Webhook processed successfully");
}
