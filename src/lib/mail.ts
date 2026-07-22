import nodemailer from "nodemailer";

interface MailProductItem {
  name: string;
  size?: string | null;
  color?: string | null;
  quantity: number;
  price: number;
}

interface MailOrderDetails {
  orderId: string;
  date: string;
  customerName: string;
  customerEmail: string;
  phone: string;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  items: MailProductItem[];
  total: number;
  paymentMethod: "COD" | "Razorpay";
}

export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  const hasSMTPConfig =
    process.env.SMTP_HOST &&
    process.env.SMTP_PORT &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS;

  if (!hasSMTPConfig) {
    console.log("\n========================================================");
    console.log(`[MOCK MAIL DISPATCH]`);
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`SMTP Credentials missing. Mocking mail dispatch...`);
    console.log("========================================================\n");
    return { success: true, mock: true };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_PORT === "465",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const info = await transporter.sendMail({
      from: process.env.MAIL_FROM || '"NXTSTORE" <noreply@nxtstore.com>',
      to,
      subject,
      html,
    });

    console.log(`Email dispatched successfully: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Nodemailer Send Error:", error);
    return { success: false, error };
  }
}

export function generateCustomerEmailTemplate(order: MailOrderDetails): string {
  const itemsHtml = order.items
    .map(
      (item) => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; font-size: 14px; color: #1f2937;">
        <strong>${item.name}</strong>
        ${item.size || item.color ? `<div style="font-size: 11px; color: #6b7280; margin-top: 4px;">${item.size ? `Size: ${item.size}` : ""} ${item.color ? ` &bull; Color: ${item.color}` : ""}</div>` : ""}
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; font-size: 14px; color: #4b5563; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; font-size: 14px; color: #1f2937; text-align: right;">₹${item.price.toFixed(2)}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; font-size: 14px; color: #1f2937; text-align: right; font-weight: bold;">₹${(item.price * item.quantity).toFixed(2)}</td>
    </tr>
  `
    )
    .join("");

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Order Confirmation - NXTSTORE</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f9fafb; margin: 0; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
        <!-- Header -->
        <div style="background-color: #18181b; padding: 32px; text-align: center;">
          <div style="display: inline-block; background-color: #ffffff; color: #18181b; font-weight: 900; font-size: 20px; padding: 8px 16px; border-radius: 8px; letter-spacing: -0.05em; margin-bottom: 16px;">
            NXT<span style="color: #71717a;">STORE</span>
          </div>
          <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 800; tracking-tight: -0.025em;">Thank you for your order!</h1>
          <p style="color: #a1a1aa; margin: 8px 0 0 0; font-size: 14px;">We've received your order and are processing it.</p>
        </div>

        <!-- Order Summary Card -->
        <div style="padding: 32px;">
          <div style="background-color: #f3f4f6; border-radius: 12px; padding: 16px; margin-bottom: 24px; font-size: 13px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="color: #6b7280; padding-bottom: 4px;">Order ID</td>
                <td style="text-align: right; font-weight: bold; color: #1f2937; padding-bottom: 4px;">${order.orderId}</td>
              </tr>
              <tr>
                <td style="color: #6b7280; padding-bottom: 4px;">Date</td>
                <td style="text-align: right; font-weight: bold; color: #1f2937; padding-bottom: 4px;">${order.date}</td>
              </tr>
              <tr>
                <td style="color: #6b7280;">Payment Method</td>
                <td style="text-align: right; font-weight: bold; color: #059669; text-transform: uppercase;">${order.paymentMethod === "COD" ? "Cash on Delivery" : "Online via Razorpay"}</td>
              </tr>
            </table>
          </div>

          <h3 style="font-size: 16px; font-weight: 800; color: #111827; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 0.05em;">Items Ordered</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
            <thead>
              <tr style="background-color: #f9fafb;">
                <th style="padding: 8px 12px; border-bottom: 2px solid #e5e7eb; font-size: 11px; text-transform: uppercase; color: #9ca3af; text-align: left;">Product</th>
                <th style="padding: 8px 12px; border-bottom: 2px solid #e5e7eb; font-size: 11px; text-transform: uppercase; color: #9ca3af; text-align: center; width: 40px;">Qty</th>
                <th style="padding: 8px 12px; border-bottom: 2px solid #e5e7eb; font-size: 11px; text-transform: uppercase; color: #9ca3af; text-align: right; width: 80px;">Price</th>
                <th style="padding: 8px 12px; border-bottom: 2px solid #e5e7eb; font-size: 11px; text-transform: uppercase; color: #9ca3af; text-align: right; width: 80px;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
              <tr>
                <td colspan="2" style="padding: 16px 12px 4px 12px; font-size: 14px; color: #4b5563;">Subtotal</td>
                <td colspan="2" style="padding: 16px 12px 4px 12px; font-size: 14px; text-align: right; color: #1f2937; font-weight: 500;">₹${order.total.toFixed(2)}</td>
              </tr>
              <tr>
                <td colspan="2" style="padding: 4px 12px; font-size: 14px; color: #4b5563;">Shipping</td>
                <td colspan="2" style="padding: 4px 12px; font-size: 14px; text-align: right; color: #1f2937; font-weight: 500;">Free</td>
              </tr>
              <tr style="font-weight: 900; font-size: 16px; color: #111827;">
                <td colspan="2" style="padding: 12px; border-top: 1px solid #d1d5db;">Grand Total</td>
                <td colspan="2" style="padding: 12px; border-top: 1px solid #d1d5db; text-align: right;">₹${order.total.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>

          <div style="border-top: 1px solid #e5e7eb; padding-top: 24px;">
            <div>
              <h4 style="font-size: 12px; font-weight: 800; text-transform: uppercase; color: #9ca3af; margin: 0 0 8px 0; letter-spacing: 0.05em;">Shipping Address</h4>
              <p style="margin: 0; font-size: 13px; color: #4b5563; line-height: 1.5;">
                <strong>${order.customerName}</strong><br>
                ${order.shippingAddress.street}<br>
                ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}<br>
                ${order.shippingAddress.country}<br>
                <span style="font-size: 11px; color: #9ca3af;">Contact: ${order.phone}</span>
              </p>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #f9fafb; border-top: 1px solid #e5e7eb; padding: 24px; text-align: center; font-size: 12px; color: #9ca3af;">
          <p style="margin: 0 0 8px 0;">If you have any questions about this order, please contact our support.</p>
          <p style="margin: 0;">&copy; 2026 NXTSTORE. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function generateSellerEmailTemplate(order: MailOrderDetails): string {
  const itemsHtml = order.items
    .map(
      (item) => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; font-size: 14px; color: #1f2937;">
        <strong>${item.name}</strong>
        ${item.size || item.color ? `<div style="font-size: 11px; color: #6b7280; margin-top: 4px;">${item.size ? `Size: ${item.size}` : ""} ${item.color ? ` &bull; Color: ${item.color}` : ""}</div>` : ""}
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; font-size: 14px; color: #4b5563; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; font-size: 14px; color: #1f2937; text-align: right; font-weight: bold;">₹${(item.price * item.quantity).toFixed(2)}</td>
    </tr>
  `
    )
    .join("");

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>New Order Notification - NXTSTORE</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
        <!-- Header -->
        <div style="background-color: #047857; padding: 32px; text-align: center;">
          <div style="display: inline-block; background-color: #ffffff; color: #047857; font-weight: 900; font-size: 20px; padding: 8px 16px; border-radius: 8px; letter-spacing: -0.05em; margin-bottom: 16px;">
            NXT<span style="color: #34d399;">STORE</span>
          </div>
          <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 800;">New Sale Confirmed!</h1>
          <p style="color: #a7f3d0; margin: 8px 0 0 0; font-size: 14px;">An order has been placed for your products.</p>
        </div>

        <!-- Info Summary -->
        <div style="padding: 32px;">
          <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 16px; margin-bottom: 24px; font-size: 13px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="color: #374151; padding-bottom: 4px;">Order ID</td>
                <td style="text-align: right; font-weight: bold; color: #111827; padding-bottom: 4px;">${order.orderId}</td>
              </tr>
              <tr>
                <td style="color: #374151; padding-bottom: 4px;">Buyer Name</td>
                <td style="text-align: right; font-weight: bold; color: #111827; padding-bottom: 4px;">${order.customerName}</td>
              </tr>
              <tr>
                <td style="color: #374151; padding-bottom: 4px;">Buyer Email</td>
                <td style="text-align: right; font-weight: bold; color: #111827; padding-bottom: 4px;">${order.customerEmail}</td>
              </tr>
              <tr>
                <td style="color: #374151;">Fulfillment Type</td>
                <td style="text-align: right; font-weight: bold; color: #047857; text-transform: uppercase;">${order.paymentMethod === "COD" ? "Collect Cash on Delivery (COD)" : "Prepaid via Razorpay"}</td>
              </tr>
            </table>
          </div>

          <h3 style="font-size: 16px; font-weight: 800; color: #111827; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 0.05em;">Order Details</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
            <thead>
              <tr style="background-color: #f9fafb;">
                <th style="padding: 8px 12px; border-bottom: 2px solid #e5e7eb; font-size: 11px; text-transform: uppercase; color: #9ca3af; text-align: left;">Product</th>
                <th style="padding: 8px 12px; border-bottom: 2px solid #e5e7eb; font-size: 11px; text-transform: uppercase; color: #9ca3af; text-align: center; width: 40px;">Qty</th>
                <th style="padding: 8px 12px; border-bottom: 2px solid #e5e7eb; font-size: 11px; text-transform: uppercase; color: #9ca3af; text-align: right; width: 80px;">Earnings</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
              <tr style="font-weight: 900; font-size: 16px; color: #111827;">
                <td colspan="2" style="padding: 12px; border-top: 1px solid #d1d5db;">Total Payout</td>
                <td style="padding: 12px; border-top: 1px solid #d1d5db; text-align: right;">₹${order.total.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>

          <div style="border-top: 1px solid #e5e7eb; padding-top: 24px;">
            <h4 style="font-size: 12px; font-weight: 800; text-transform: uppercase; color: #9ca3af; margin: 0 0 8px 0; letter-spacing: 0.05em;">Deliver To</h4>
            <p style="margin: 0; font-size: 13px; color: #4b5563; line-height: 1.5;">
              <strong>${order.customerName}</strong><br>
              ${order.shippingAddress.street}<br>
              ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}<br>
              ${order.shippingAddress.country}<br>
              <span style="font-size: 11px; color: #9ca3af;">Contact: ${order.phone}</span>
            </p>
          </div>
          
          <div style="margin-top: 24px; padding: 12px; background-color: #fef3c7; border: 1px solid #fde68a; border-radius: 8px; font-size: 12px; color: #92400e;">
            <strong>Fulfillment Note:</strong> Please pack these products carefully and ship them to the customer address. If the order is COD, instruct the carrier to collect cash.
          </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #f9fafb; border-top: 1px solid #e5e7eb; padding: 24px; text-align: center; font-size: 12px; color: #9ca3af;">
          <p style="margin: 0;">&copy; 2026 NXTSTORE Portal. Confidential merchant details.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
