# NXTSTORE - Premium Multi-Vendor E-Commerce Platform

Welcome to the **NXTSTORE** documentation. This guide is written in detail so that even a beginner can easily understand the project's folder structure, architecture, files, technologies, and setup steps.

---

## 🚀 Tech Stack Used

This project is built using modern, industry-standard web technologies:

1. **Next.js 15 (App Router)**: A framework for building fast React applications. It handles routing (pages), client and server rendering, and API routes.
2. **React 19**: A popular JavaScript library for building interactive user interfaces.
3. **Prisma ORM**: A database toolkit that maps our relational database records into clean TypeScript code.
4. **PostgreSQL**: A powerful, reliable relational database that stores users, products, stores, orders, and reviews.
5. **Clerk Authentication**: A secure user sign-in and management service (handles signup, login, session validation, and profiles).
6. **Razorpay API**: India's leading payment gateway used to process online card payments, UPI, Netbanking, and wallet checkouts.
7. **Nodemailer**: A Node.js module used to send HTML order confirmation emails to customers and sellers.
8. **TailwindCSS (v4)**: A utility-first styling engine used to build clean, modern dark/light mode interfaces.
9. **Zustand**: A light and fast state management store used to sync the shopping cart state.

---

## 📁 Project Directory Structure Explained

Below is the directory tree of our application. Let's break down what each folder does:

```text
ecommerce-platform/
├── prisma/                       # Database Configurations
│   ├── schema.prisma             # Database schema mapping models (User, Order, Product, etc.)
│   └── seed.ts                   # Seed script to prepopulate database with dummy categories, brands, & products
│
├── public/                       # Static Assets
│   └── images/                   # Local images used for categories and fallback images
│
├── src/                          # Application Source Code
│   ├── actions/                  # Next.js Server Actions (Backend functions called directly from client)
│   │   ├── admin.actions.ts      # Stats retrieval for system administrators
│   │   ├── checkout.actions.ts   # Core payment flow (Razorpay Order creation, verification, COD orders)
│   │   ├── order.actions.ts      # Seller order fulfillment tracking
│   │   └── product.actions.ts    # Product listings additions, variant updates, and deletions
│   │
│   ├── app/                      # App Router Routes (Visible URLs and layout templates)
│   │   ├── (auth)/               # Clerk authentication pages (Sign-In / Sign-Up)
│   │   ├── (store)/              # Customer-facing storefront
│   │   │   ├── shop/             # Product catalog grid page
│   │   │   ├── products/[id]/    # Individual product details showcase page
│   │   │   ├── checkout/         # Unified shopping cart checkout page
│   │   │   │   ├── page.tsx      # Entry logic for checkout
│   │   │   │   └── success/      # Order receipt success screen showing real items
│   │   │   └── page.tsx          # Homepage showing collections, banner animations, and new arrivals
│   │   │
│   │   ├── admin/                # Global Admin dashboard
│   │   └── seller/               # Multi-vendor merchant store controls
│   │
│   ├── components/               # Reusable User Interface (UI) Components
│   │   ├── shared/               # Universal UI elements (Navbar, Footer, MovingBanner marquee)
│   │   ├── shop/                 # Product display elements (CheckoutClient, ProductGrid)
│   │   ├── seller/               # Merchant components (SellerSidebar, SellerProductsClient)
│   │   └── admin/                # Platform management components
│   │
│   ├── lib/                      # Base integrations
│   │   ├── db.ts                 # Prisma connection pool initializer
│   │   └── mail.ts               # Nodemailer transporter and custom HTML email layout generators
│   │
│   ├── store/                    # Zustand stores
│   │   └── cart.store.ts         # Client cart state (adds, removes, counts items, saves to localStorage)
│   │
│   ├── types/                    # TypeScript interfaces
│   └── schemas/                  # Zod validation rules
```

---

## 🔑 Key Files & What They Do

Here is a simple explanation of the most important files we added or modified:

### 1. [schema.prisma](file:///e:/ecommerce-platform/prisma/schema.prisma)
The blueprint of our database. It defines:
- `User`: Stored with Clerk ID, email, name, and Role (Customer, Seller, Admin).
- `Store`: Linked to a Seller, contains product listings.
- `Product` & `ProductVariant`: Defines the items, stock volumes, sizes, and colors.
- `Order` & `OrderItem`: Records transaction total, shipping addresses, payment status, and references the items purchased.

### 2. [mail.ts](file:///e:/ecommerce-platform/src/lib/mail.ts)
The email delivery center. It contains:
- `sendEmail`: Connects to your SMTP mail server. If you haven't added SMTP credentials yet, it detects this and automatically prints a simulated text receipt of the email to your terminal console instead of crashing.
- `generateCustomerEmailTemplate`: Creates a beautiful, responsive green-themed HTML email containing a breakdown invoice table, payment indicators (Razorpay vs COD), and delivery guidelines.
- `generateSellerEmailTemplate`: Creates a detailed merchant notification message instructing the seller where to ship and what items to package.

### 3. [checkout.actions.ts](file:///e:/ecommerce-platform/src/actions/checkout.actions.ts)
The backend checkout controller. It handles three primary actions:
- `createRazorpayOrder`: Validates shipping addresses, saves a `PENDING` order in the database, connects to Razorpay via their SDK, creates a transaction order, and returns tokens to the client.
- `verifyRazorpayPayment`: Accepts Razorpay signatures, performs secure cryptographical SHA256 verification to verify the payment is real, marks the database order as `PAID` (`isPaid = true`), and fires confirmation emails.
- `createCODOrder`: Creates a Cash on Delivery order in the database, sets it as `PROCESSING` (unpaid, since cash is collected later), and sends the confirmation emails.

### 4. [CheckoutClient.tsx](file:///e:/ecommerce-platform/src/components/shop/CheckoutClient.tsx)
The checkout UI. It provides:
- An input step for shipping details.
- A **modern checkout selection screen** with cards for **Online Payment (via Razorpay)** or **Cash on Delivery (COD)**.
- Script loaders that trigger the official Razorpay popups dynamically.
- Interactive loading spinners while transactions are being processed.

### 5. [success/page.tsx](file:///e:/ecommerce-platform/src/app/(store)/checkout/success/page.tsx)
The success screen. Instead of displaying mock/hardcoded totals:
- It reads the `orderId` from the URL.
- Queries database details using Prisma.
- Displays copyable order receipts, invoice items, specific delivery timelines, payment statuses, and addresses.

### 6. [SellerProductsClient.tsx](file:///e:/ecommerce-platform/src/components/seller/SellerProductsClient.tsx)
The seller product listing client.
- We added a **"No Brand (Generic)"** default option in the brand dropdown to resolve the listing issue.
- If a product does not belong to a brand, it defaults to generic and saves cleanly.
- Resolved TypeScript compiler type errors.

---

## 🛠️ Step-by-Step Setup Guide

Follow these steps to run the project on your local machine:

### 1. Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed.

### 2. Configure Environment Variables
Create or open `file:///e:/ecommerce-platform/.env.local` and configure your credentials:

```ini
# Clerk Authentication (Required to Sign-In)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_pub_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

# Razorpay API Credentials (Provided)
RAZORPAY_KEY_ID=rzp_test_TGQVqSOYfRQhA3
RAZORPAY_KEY_SECRET=piabO5qAKJfb71IN23rejoZb
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_TGQVqSOYfRQhA3

# Nodemailer SMTP Email Credentials (Optional)
SMTP_HOST=your_smtp_host (e.g. smtp.mailtrap.io or smtp.gmail.com)
SMTP_PORT=587
SMTP_USER=your_smtp_username
SMTP_PASS=your_smtp_password
MAIL_FROM="NXTSTORE <noreply@nxtstore.com>"
```

*Note: If Nodemailer SMTP credentials are left empty, emails will simply print directly to the developer console log.*

### 3. Database Initial Setup
1. In your `file:///e:/ecommerce-platform/.env` file, specify your local database connection:
   ```ini
   DATABASE_URL="postgresql://username:password@localhost:5432/nxtstore_db?schema=public"
   ```
2. Run database migrations to construct the tables:
   ```bash
   npx prisma migrate dev
   ```
3. Seed initial categories, brands, and products:
   ```bash
   npx prisma db seed
   ```

### 4. Start Development Server
1. Boot up the local Next.js environment:
   ```bash
   npm run dev
   ```
2. Open [http://localhost:3000](http://localhost:3000) in your web browser.

---

## 💳 Checkout Testing Guidelines

To test the payment integrations:
1. Log in to your Clerk account, add items to the cart, and proceed to checkout.
2. Enter your address details.
3. Select **Cash on Delivery (COD)** and click **Place COD Order**:
   - The app will redirect to `/checkout/success` and show your receipt in Rupees (₹).
   - Check the terminal console to inspect the customer and merchant notification email printouts.
4. Select **Pay Online (Razorpay)** and click **Proceed to Pay**:
   - The secure Razorpay payment drawer will slide open.
   - Select **Netbanking** or **UPI** (e.g. State Bank of India, HDFC Bank, etc.).
   - Click **Success** on the test gateway page.
   - The gateway closes, signature verification succeeds, and the page redirects to your verified order confirmation showing paid receipt metadata.
