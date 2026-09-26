# Swecha Studio - Production Deployment & Backup Guide

This document outlines the steps required to deploy the Swecha Studio ecommerce application to a production environment.

## 1. System Requirements
- **PHP:** 8.3+
- **PHP Extensions:** pdo_mysql, bcmath, ctype, fileinfo, json, mbstring, openssl, tokenizer, xml.
- **Database:** MySQL 8.0+ or MariaDB 10.4+
- **Node.js & npm:** Required for building frontend assets (`npm ci`, `npm run build`).
- **Web Server:** Nginx or Apache, pointing to the `/public` directory.
- **HTTPS:** An active SSL/TLS certificate is mandatory for secure checkout, sessions, and cookies.

## 2. Environment Configuration
Create a `.env` file based on `.env.example`. Ensure the following critical settings are applied:

```env
APP_NAME="Swecha Studio"
APP_ENV=production
APP_KEY=base64:your_generated_app_key
APP_DEBUG=false
APP_URL=https://your-domain.com

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=your_production_db
DB_USERNAME=your_db_user
DB_PASSWORD=your_secure_password

SESSION_SECURE_COOKIE=true
```
*Note: Never set `APP_DEBUG=true` in production, as it exposes sensitive environment variables and stack traces.*

## 3. Deployment Steps

1. **Install Composer Dependencies:**
   ```bash
   composer install --optimize-autoloader --no-dev
   ```

2. **Generate Application Key (First deployment only):**
   ```bash
   php artisan key:generate
   ```

3. **Install NPM Dependencies & Build Assets:**
   ```bash
   npm ci
   npm run build
   ```

4. **Run Database Migrations:**
   ```bash
   php artisan migrate --force
   ```

5. **Create Storage Symlink:**
   This allows uploaded product images to be publicly accessible.
   ```bash
   php artisan storage:link
   ```

6. **Optimize Configuration:**
   Cache the configuration, routes, and views for production performance.
   ```bash
   php artisan optimize
   ```

7. **File Permissions:**
   Ensure the web server (e.g., `www-data` or `nginx`) has write permissions to the following directories:
   - `storage/`
   - `bootstrap/cache/`

## 4. Operational Backup Strategy
The application relies on both the database and the local filesystem for persistent data. **You must configure external automated backups at the server/hosting level.**

Your backup strategy must include:
1. **The MySQL Database:** Daily SQL dumps containing products, orders, and customer data.
2. **The Storage Directory:** Daily backups of `storage/app/public/`, which contains all uploaded product images, site logos, and favicons. If this directory is lost, all images will break.
3. **The .env File:** Securely backup your `.env` file since it contains the `APP_KEY`. If the key is lost, active sessions and any encrypted data will become irretrievable.

## 5. Client Handover & Business Rules

### Payment & Order Workflow
- **Payment Gateway:** Payment integration is pending/planned. The existing Razorpay code is PAYMENT SCAFFOLDING ONLY. Customers must use WhatsApp checkout.
- **Advance Rule:** The old 50% advance rule has been removed. Orders are negotiated via WhatsApp (`advance_required` is 0).
- **Stock Management:** For WhatsApp orders, stock is only deducted when an Admin manually updates the order status to processing, shipped, or delivered.

### Admin Setup Procedure
To create your first admin user, you can run the following Artisan command via SSH:
```bash
php artisan tinker
> \App\Models\User::factory()->create(['email' => 'admin@your-domain.com', 'is_admin' => true]);
```
Alternatively, log in with an existing customer account and manually set `is_admin = 1` in the database. 

### Local Setup & Development Stack
- **Stack:** Laravel 13.x, React, Inertia.js, Vite, TailwindCSS.
- **Local Dev:** Use `composer install`, `npm install`, set `.env` with a local MySQL DB, run `php artisan migrate --seed`, and start the servers using `php artisan serve` and `npm run dev`.

---

## 6. Future Authentication Architecture (Phase 10/11)

The application currently relies on standard Laravel session-based authentication using email and password. In a future update, we plan to shift to an OTP and Social Login architecture to reduce friction and improve conversion rates.

### Planned Changes
1. **Google OAuth 2.0:** Integration via Laravel Socialite.
2. **OTP Login (WhatsApp/SMS):** Replacing passwords with secure OTPs.
3. **Database Changes:** The `users` table will require `google_id`, `avatar`, and `phone_verified_at` columns. Passwords will become nullable.
4. **Registration Flow:** Users will no longer be forced to set passwords. Account creation will happen instantly upon Google authentication or OTP verification.
5. **Checkout Flow:** Guest checkout will remain, but returning customers will have a seamless 1-click login experience.
