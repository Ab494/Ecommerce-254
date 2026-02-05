# Ecommerce Project (Separated Backend & Frontend)

This project has been separated into two distinct parts:

## Project Structure

```
Ecommerce-254/
├── frontend/          # Next.js frontend application (current root)
│   ├── app/          # Next.js App Router pages
│   ├── components/   # React components
│   ├── lib/          # Frontend utilities and API service
│   ├── hooks/        # Custom React hooks
│   └── ...
│
└── backend/          # Express.js backend API
    ├── src/
    │   ├── index.ts          # Main server entry point
    │   └── routes/           # API route handlers
    │       ├── products.ts
    │       ├── orders.ts
    │       ├── payments.ts
    │       └── upload.ts
    ├── package.json
    └── .env.example
```

## Getting Started

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Update the `.env` file with your configuration:
   - `MONGODB_URI` - Your MongoDB connection string
   - `DARAJA_CONSUMER_KEY` - M-Pesa API consumer key
   - `DARAJA_CONSUMER_SECRET` - M-Pesa API consumer secret
   - `DARAJA_BUSINESS_SHORTCODE` - Your M-Pesa business shortcode
   - `DARAJA_PASSKEY` - M-Pesa passkey
   - `PORT` - Backend server port (default: 3001)
   - `FRONTEND_URL` - Frontend URL for CORS (default: http://localhost:3000)

5. Start the backend server:
   ```bash
   # Development mode
   npm run dev

   # Production build
   npm run build
   npm start
   ```

The backend will run on `http://localhost:3001`

### Frontend Setup

1. Create a `.env.local` file in the root directory:
   ```bash
   cp .env.example .env.local
   ```

2. Update `NEXT_PUBLIC_API_URL` to point to your backend:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:3001
   ```

3. Start the frontend:
   ```bash
   npm run dev
   ```

The frontend will run on `http://localhost:3000`

## API Endpoints

### Products
- `GET /api/products` - Get all products
- `GET /api/products?category=<category>` - Get products by category
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Orders
- `GET /api/orders` - Get all orders
- `GET /api/orders/:id` - Get single order
- `POST /api/orders` - Create order

### Payments
- `POST /api/payments/initiate` - Initiate M-Pesa STK push
- `POST /api/payments/callback` - M-Pesa payment callback
- `GET /api/payments/status/:checkoutRequestId` - Check payment status

### Upload
- `POST /api/upload` - Upload single image
- `POST /api/upload/multiple` - Upload multiple images
- `DELETE /api/upload/:filename` - Delete uploaded file

## Environment Variables

### Backend (.env)
| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB connection string |
| `DARAJA_CONSUMER_KEY` | M-Pesa API consumer key |
| `DARAJA_CONSUMER_SECRET` | M-Pesa API consumer secret |
| `DARAJA_BUSINESS_SHORTCODE` | M-Pesa business shortcode |
| `DARAJA_PASSKEY` | M-Pesa passkey |
| `PORT` | Backend server port |
| `FRONTEND_URL` | Frontend URL for CORS |

### Frontend (.env.local)
| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Backend API URL |
| `NEXT_PUBLIC_APP_URL` | Frontend URL (for callbacks) |

## Tech Stack

### Frontend
- Next.js 14+ (App Router)
- React 19
- TypeScript
- Tailwind CSS
- Radix UI components

### Backend
- Express.js
- MongoDB with Mongoose
- TypeScript
- M-Pesa Daraja API integration
