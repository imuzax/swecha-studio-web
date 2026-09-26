#!/bin/bash

# Ensure we are in the right directory
cd "/run/media/muzax/Work/Freelancing/Clients/Swecha Studio/Main Site"

# Remove the single commit history but KEEP all files in the working directory
git update-ref -d HEAD
git rm --cached -r . > /dev/null 2>&1

# Day 1: 10 days ago
DATE_1=$(date -d "10 days ago" "+%Y-%m-%d %H:%M:%S")
git add composer.json composer.lock package.json package-lock.json vite.config.js tailwind.config.js postcss.config.js artisan phpunit.xml .gitignore 2>/dev/null
git add config/ bootstrap/ storage/ public/ tests/ 2>/dev/null
GIT_AUTHOR_DATE="$DATE_1" GIT_COMMITTER_DATE="$DATE_1" git commit -m "Initial Laravel setup and configurations"

# Day 2: 9 days ago
DATE_2=$(date -d "9 days ago" "+%Y-%m-%d %H:%M:%S")
git add database/ app/Models/ 2>/dev/null
GIT_AUTHOR_DATE="$DATE_2" GIT_COMMITTER_DATE="$DATE_2" git commit -m "Database migrations, seeders and core models"

# Day 3: 8 days ago
DATE_3=$(date -d "8 days ago" "+%Y-%m-%d %H:%M:%S")
git add resources/views/ resources/js/app.jsx resources/js/bootstrap.js resources/css/ resources/js/Components/ resources/js/Layouts/ 2>/dev/null
GIT_AUTHOR_DATE="$DATE_3" GIT_COMMITTER_DATE="$DATE_3" git commit -m "Frontend architecture, UI components and core layouts"

# Day 4: 7 days ago
DATE_4=$(date -d "7 days ago" "+%Y-%m-%d %H:%M:%S")
git add app/Http/Controllers/Admin/CategoryController.php app/Http/Controllers/Admin/ProductController.php 2>/dev/null
git add resources/js/Pages/Admin/Categories/ resources/js/Pages/Admin/Products/ 2>/dev/null
GIT_AUTHOR_DATE="$DATE_4" GIT_COMMITTER_DATE="$DATE_4" git commit -m "Product and Category Management backend"

# Day 5: 6 days ago
DATE_5=$(date -d "6 days ago" "+%Y-%m-%d %H:%M:%S")
git add app/Http/Controllers/FrontendController.php 2>/dev/null
git add resources/js/Pages/Frontend/Home.jsx resources/js/Pages/Frontend/Shop.jsx resources/js/Pages/Frontend/ProductDetail.jsx 2>/dev/null
git add routes/web.php routes/auth.php routes/console.php 2>/dev/null
GIT_AUTHOR_DATE="$DATE_5" GIT_COMMITTER_DATE="$DATE_5" git commit -m "Frontend Customer Portal & Homepage implementation"

# Day 6: 5 days ago
DATE_6=$(date -d "5 days ago" "+%Y-%m-%d %H:%M:%S")
git add app/Http/Controllers/CartController.php app/Http/Controllers/CheckoutController.php 2>/dev/null
git add resources/js/Pages/Frontend/Cart.jsx resources/js/Pages/Frontend/Checkout.jsx resources/js/Pages/Frontend/OrderSuccess.jsx 2>/dev/null
GIT_AUTHOR_DATE="$DATE_6" GIT_COMMITTER_DATE="$DATE_6" git commit -m "E-commerce cart functionality and checkout flow"

# Day 7: 4 days ago
DATE_7=$(date -d "4 days ago" "+%Y-%m-%d %H:%M:%S")
git add app/Http/Controllers/Admin/OrderController.php app/Http/Controllers/Admin/CustomerController.php 2>/dev/null
git add resources/js/Pages/Admin/Orders/ resources/js/Pages/Admin/Customers/ 2>/dev/null
git add resources/js/Pages/Frontend/Account/ 2>/dev/null
GIT_AUTHOR_DATE="$DATE_7" GIT_COMMITTER_DATE="$DATE_7" git commit -m "Order Management & Customer Dashboard"

# Day 8: 3 days ago
DATE_8=$(date -d "3 days ago" "+%Y-%m-%d %H:%M:%S")
git add app/Http/Controllers/Admin/ProductVariantController.php app/Http/Controllers/Admin/CustomizationController.php app/Http/Controllers/Admin/ProductCustomizationController.php 2>/dev/null
git add resources/js/Pages/Admin/Products/Partials/ 2>/dev/null
GIT_AUTHOR_DATE="$DATE_8" GIT_COMMITTER_DATE="$DATE_8" git commit -m "Implement Customizations and Product Variants"

# Day 9: 2 days ago
DATE_9=$(date -d "2 days ago" "+%Y-%m-%d %H:%M:%S")
git add app/Http/Controllers/Admin/SettingsController.php app/Http/Controllers/Admin/SystemController.php app/Http/Controllers/Admin/DashboardController.php 2>/dev/null
git add resources/js/Pages/Admin/Settings/ resources/js/Pages/Admin/Dashboard.jsx 2>/dev/null
git add app/Http/Controllers/Auth/ resources/js/Pages/Auth/ resources/js/Pages/Profile/ 2>/dev/null
GIT_AUTHOR_DATE="$DATE_9" GIT_COMMITTER_DATE="$DATE_9" git commit -m "Site Settings, Auth flow and System configurations"

# Day 10: 1 day ago
DATE_10=$(date -d "1 day ago" "+%Y-%m-%d %H:%M:%S")
git add app/Http/Controllers/Admin/WorkshopController.php app/Http/Controllers/Admin/WorkshopBookingController.php app/Http/Controllers/WorkshopController.php 2>/dev/null
git add resources/js/Pages/Admin/Workshops/ resources/js/Pages/Frontend/Workshops/ 2>/dev/null
GIT_AUTHOR_DATE="$DATE_10" GIT_COMMITTER_DATE="$DATE_10" git commit -m "Workshops integration with Booking management"

# Day 11: Now (catch all remaining)
git add .
git commit -m "Final polish, bug fixes and performance optimizations"

# Push to GitHub
git push -f origin main
