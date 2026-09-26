# 03. Database & Security Architecture

## Database Engine
MySQL (Using Laravel Eloquent ORM). 

## Core Database Tables
Design the database to remain scalable beyond thousands of products using proper indexes and foreign keys.

- `users` (Admin and Customers)
- `addresses` (Customer shipping/billing details)
- `categories` (Product categories)
- `products` (ID, Name, Slug, Short/Full Description, Price, Sale Price, Stock, etc.)
- `product_images` (Must be stored separately to support multiple images per product)
- `carts` & `cart_items` (Server-controlled cart state)
- `orders` & `order_items` (Must store historical purchase price. Never calculate past order totals using current product prices)
- `payments` (Tracking Razorpay/Cashfree transaction IDs and statuses)
- `shipments` (Courier, Tracking Info)
- `complaints` & `complaint_images` (Damage/Complaint management system)
- `settings` (Store business configurations like WhatsApp numbers, emails without hardcoding)

## Data Integrity & Transactions
- **Transactions**: Use database transactions for all critical operations (e.g., creating orders, updating stock, recording payments). Do not leave DB in a partially completed state.
- **Stock Management**: Lock/revalidate inventory on the server side before order creation. Prevent overselling race conditions.

## Security Architecture
- Never expose secret payment keys in React frontend code.
- **Webhooks**: Server must verify payment success via Webhooks. Do not trust frontend success callbacks.
- Laravel policies to ensure customers can only access their own profiles, carts, orders, and complaints.
- Ensure file upload restrictions (images only, size limits) especially for complaints and product uploads.
