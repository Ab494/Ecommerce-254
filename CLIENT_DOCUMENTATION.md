# 254 Convex Communication LTD - E-Commerce Platform

## Project Documentation for Client

---

## 1. Project Overview

This is a complete e-commerce website for **254 Convex Communication LTD**, a Kenyan company specializing in:
- Electronics & Smartphones
- CCTV Surveillance Systems
- Home & Office Appliances
- Printer & Office Equipment
- Value Added Services (VAS)

---

## 2. Technology Stack

| Component | Technology | Hosting |
|-----------|------------|---------|
| Frontend | Next.js 16 (React) | Vercel |
| Backend | Express.js (Node.js) | Render |
| Database | MongoDB | MongoDB Atlas |
| Payments | M-Pesa (Daraja API) | Safaricom |
| Emails | Resend | Cloud |
| Source Code | GitHub | GitHub |

---

## 3. How the System Works

### Customer Flow:
1. **Browse Products** - Visit the website to view products
2. **Add to Cart** - Select products and add to shopping cart
3. **Checkout** - Enter delivery details and phone number
4. **Payment** - Pay via M-Pesa STK Push
5. **Confirmation** - Receive order confirmation via email

### Admin Flow:
1. **Login** - Access admin panel at `/admin`
2. **Manage Products** - Add, edit, or delete products
3. **View Orders** - See all customer orders
4. **Process Orders** - Mark orders as completed

---

## 4. Website Pages

| Page | URL | Description |
|------|-----|-------------|
| Home | `/` | Main landing page with hero section and partners |
| Products | `/products` | Browse all products |
| Product Details | `/products/[id]` | View single product with variants |
| Cart | `/cart` | View shopping cart |
| Checkout | `/checkout` | Enter details and pay |
| Order Confirmation | `/order-confirmation/[id]` | Order success page |
| About | `/about` | Company information |
| Contact | `/contact` | Contact form |
| Admin Login | `/admin/login` | Admin login page |
| Admin Dashboard | `/admin` | Product & order management |

---

## 5. Managing Products (For Admin)

### Access Admin Panel:
1. Go to: `https://[your-domain]/admin/login`
2. Login with admin credentials

### Add New Product:
1. Click **"Add Product"** button
2. Fill in:
   - Product Name
   - Description
   - Price (KES)
   - Category
   - Stock Quantity
   - Product Images
   - Color Variants (optional)
3. Click **"Save Product"**

### Edit Product:
1. Click on a product in the list
2. Modify fields as needed
3. Click **"Update Product"**

### Delete Product:
1. Click the **delete icon** on a product
2. Confirm deletion

---

## 6. Managing Orders (For Admin)

### View Orders:
1. Go to `/admin` page
2. Scroll to **"Recent Orders"** section

### Order Status:
- **Pending** - Awaiting payment confirmation
- **Completed** - Payment received, order fulfilled
- **Failed** - Payment failed or cancelled

---

## 7. M-Pesa Payment Integration

### How it Works:
1. Customer enters phone number at checkout
2. System sends **STK Push** to customer's phone
3. Customer enters M-Pesa PIN to confirm
4. Safaricom sends callback to backend
5. Order is confirmed and email sent

### M-Pesa Credentials (Backend):
These are set in the Render backend environment variables:
- `MPESA_CONSUMER_KEY`
- `MPESA_CONSUMER_SECRET`
- `MPESA_SHORTCODE`
- `MPESA_PASSKEY`
- `MPESA_CALLBACK_URL`

---

## 8. Email Notifications

### How Emails Work:
- Order confirmations sent to customer's email
- Uses **Resend** service for delivery

### Email Settings (Backend):
- `RESEND_API_KEY` - Resend API key
- `SENDER_EMAIL` - Email address for sending
- `COMPANY_NAME` - Your company name

---

## 9. Deployment URLs

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend | `https://[your-vercel-app].vercel.app` | Customer website |
| Backend | `https://ecommerce-254.onrender.com` | API & admin |

---

## 10. Updating the Website

### Method 1: Via GitHub (Recommended)

1. Make changes to the code locally
2. Push to GitHub:
   ```bash
   git add .
   git commit -m "Your changes"
   git push origin main
   ```
3. Vercel automatically deploys changes

### Method 2: Via Admin Panel

1. Go to `/admin`
2. Add/edit products directly
3. Changes appear immediately

---

## 11. Environment Variables

### Frontend (Vercel):
| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_API_URL` | `https://ecommerce-254.onrender.com` |

### Backend (Render):
| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB connection string |
| `MPESA_CONSUMER_KEY` | M-Pesa API key |
| `MPESA_CONSUMER_SECRET` | M-Pesa API secret |
| `MPESA_SHORTCODE` | Business shortcode |
| `MPESA_PASSKEY` | M-Pesa passkey |
| `MPESA_CALLBACK_URL` | Payment callback URL |
| `RESEND_API_KEY` | Resend email API key |
| `SENDER_EMAIL` | Email address for orders |
| `COMPANY_NAME` | Your company name |
| `ADMIN_USERNAME` | Admin login username |
| `ADMIN_PASSWORD` | Admin login password |
| `JWT_SECRET` | Secret for authentication |

---

## 12. Support & Troubleshooting

### Common Issues:

**Website not loading:**
- Check Vercel deployment status
- Verify environment variables are set

**Payments not working:**
- Check M-Pesa credentials in Render
- Verify callback URL is accessible

**Emails not sending:**
- Check Resend API key in Render
- Verify sender email is approved in Resend

**Products not showing:**
- Ensure MongoDB is connected
- Check database has products

---

## 13. Contact Information

For technical support:
- Email: `support@254convexcomltd.co.ke`
- Phone: `[Your Phone Number]`

---

## 14. File Structure

```
Ecommerce-254/
├── app/                    # Next.js pages
│   ├── admin/             # Admin dashboard
│   ├── api/               # API routes
│   ├── products/          # Product pages
│   ├── cart/              # Shopping cart
│   └── checkout/          # Checkout
├── components/            # React components
│   ├── home/              # Home page sections
│   ├── admin/             # Admin components
│   └── ui/                # UI components
├── lib/                   # Utilities & models
│   ├── models/            # Database models
│   ├── api.ts             # API utilities
│   └── cart-context.tsx   # Cart state
├── public/                # Static files
│   └── images/            # Images & logos
└── backend/               # Express.js backend
    └── src/routes/        # API endpoints
```

---

**Document Version:** 1.0  
**Last Updated:** February 2026  
**Created For:** 254 Convex Communication LTD
