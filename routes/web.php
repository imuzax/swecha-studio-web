<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

use App\Http\Controllers\FrontendController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\BulkEnquiryController;
use App\Models\Order;

Route::get('/', [FrontendController::class, 'home'])->name('home');

Route::get('/sitemap.xml', function () {
    $products = \App\Models\Product::where('is_active', true)->select('slug', 'updated_at')->get();
    $categories = \App\Models\Category::where('is_active', true)->select('slug', 'updated_at')->get();
    return response()->view('sitemap', compact('products', 'categories'))->header('Content-Type', 'text/xml');
});
Route::get('/shop', [FrontendController::class, 'shop'])->name('shop');
Route::get('/product/{slug}', [FrontendController::class, 'productDetail'])->name('product.detail');
Route::get('/workshops', [\App\Http\Controllers\WorkshopController::class, 'index'])->name('workshops.index');
Route::get('/workshops/{slug}', [\App\Http\Controllers\WorkshopController::class, 'show'])->name('workshops.show');
Route::post('/bulk-enquiries', [BulkEnquiryController::class, 'store'])->middleware('throttle:10,1')->name('bulk-enquiries.store');

// Cart Routes
Route::get('/cart', [CartController::class, 'index'])->name('cart.index');
Route::middleware('throttle:30,1')->group(function () {
    Route::post('/cart/add/{product}', [CartController::class, 'add'])->name('cart.add');
    Route::put('/cart/update/{id}', [CartController::class, 'update'])->name('cart.update');
    Route::delete('/cart/remove/{id}', [CartController::class, 'remove'])->name('cart.remove');
});

    // Wishlist Routes (moved out temporarily if needed, wait, I'm just moving checkout routes)

Route::get('/dashboard', function () {
    $orders = Order::where('user_id', auth()->id())
                    ->latest()
                    ->take(5)
                    ->get();
    
    return Inertia::render('Dashboard', [
        'recentOrders' => $orders
    ]);
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    // Checkout Routes
    Route::get('/checkout', [CheckoutController::class, 'index'])->name('checkout.index');
    Route::post('/checkout', [CheckoutController::class, 'process'])->middleware('throttle:10,1')->name('checkout.process');
    Route::get('/order-success/{order}', [CheckoutController::class, 'success'])->name('order.success');

    Route::get('/my-orders', function () {
        $orders = Order::with('items.product.images')->where('user_id', auth()->id())->latest()->get();
        return Inertia::render('Frontend/Account/Orders', ['orders' => $orders]);
    })->name('account.orders');
    
    Route::get('/my-orders/{order:order_number}', function (Order $order) {
        if ($order->user_id !== auth()->id()) abort(403);
        $order->load('items.product.images');
        return Inertia::render('Frontend/Account/OrderDetails', ['order' => $order]);
    })->name('account.order.details');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('/addresses', [\App\Http\Controllers\AddressController::class, 'index'])->name('addresses.index');
    Route::get('/addresses/create', [\App\Http\Controllers\AddressController::class, 'create'])->name('addresses.create');
    Route::post('/addresses', [\App\Http\Controllers\AddressController::class, 'store'])->name('addresses.store');
    Route::get('/addresses/{address}/edit', [\App\Http\Controllers\AddressController::class, 'edit'])->name('addresses.edit');
    Route::put('/addresses/{address}', [\App\Http\Controllers\AddressController::class, 'update'])->name('addresses.update');
    Route::delete('/addresses/{address}', [\App\Http\Controllers\AddressController::class, 'destroy'])->name('addresses.destroy');
    Route::put('/addresses/{address}/default', [\App\Http\Controllers\AddressController::class, 'setDefault'])->name('addresses.setDefault');

    // Wishlist Routes
    Route::get('/wishlist', [\App\Http\Controllers\WishlistController::class, 'index'])->name('wishlist.index');
    Route::post('/wishlist/{product}', [\App\Http\Controllers\WishlistController::class, 'toggle'])->name('wishlist.toggle');
});

// Recently Viewed Routes (public)
Route::get('/recently-viewed', [\App\Http\Controllers\RecentlyViewedController::class, 'index'])->name('recently_viewed.index');

Route::post('/analytics/track', [\App\Http\Controllers\AnalyticsController::class, 'track'])->name('analytics.track')->middleware('throttle:60,1');

require __DIR__.'/auth.php';

use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\ProductController;
use App\Http\Controllers\Admin;

Route::middleware('guest')->group(function () {
    Route::get('admin/login', [App\Http\Controllers\Admin\Auth\AdminLoginController::class, 'create'])->name('admin.login');
    Route::post('admin/login', [App\Http\Controllers\Admin\Auth\AdminLoginController::class, 'store']);
});

Route::middleware(['auth', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::resource('categories', Admin\CategoryController::class)->except(['show']);
    Route::resource('products', Admin\ProductController::class);
    Route::resource('workshops', Admin\WorkshopController::class);
    Route::delete('workshops/{workshop}/images/{image}', [Admin\WorkshopController::class, 'removeImage'])->name('workshops.images.destroy');
    
    // Workshop Bookings
    Route::get('workshops/{workshop}/bookings', [Admin\WorkshopBookingController::class, 'index'])->name('workshops.bookings.index');
    Route::post('workshops/{workshop}/dates/{date}/bookings', [Admin\WorkshopBookingController::class, 'store'])->name('workshops.bookings.store');
    Route::delete('workshops/{workshop}/dates/{date}/bookings/{booking}', [Admin\WorkshopBookingController::class, 'destroy'])->name('workshops.bookings.destroy');

    Route::delete('products/{product}/images/{image}', [Admin\ProductController::class, 'destroyImage'])->name('products.images.destroy');
    
    // Product Variants
    Route::post('products/{product}/variants', [Admin\ProductVariantController::class, 'store'])->name('products.variants.store');
    Route::put('products/{product}/variants/{variant}', [Admin\ProductVariantController::class, 'update'])->name('products.variants.update');
    Route::delete('products/{product}/variants/{variant}', [Admin\ProductVariantController::class, 'destroy'])->name('products.variants.destroy');
    
    // Customizations
    Route::get('customizations', [Admin\CustomizationController::class, 'index'])->name('customizations.index');
    Route::post('products/{product}/customizations', [Admin\ProductCustomizationController::class, 'attach'])->name('products.customizations.attach');
    Route::delete('products/{product}/customizations/{customization}', [Admin\ProductCustomizationController::class, 'detach'])->name('products.customizations.detach');
    
    // E-commerce Management Routes
    Route::resource('orders', Admin\OrderController::class)->only(['index', 'show', 'update']);
    Route::resource('customers', Admin\CustomerController::class)->only(['index', 'show']);
    
    // System Tools Routes
    Route::get('/reports/orders', [Admin\SystemController::class, 'exportOrders'])->name('reports.orders');
    Route::get('/backups/download', [Admin\SystemController::class, 'downloadBackup'])->name('backups.download');
    
    // Site Settings
    Route::get('/settings', [Admin\SettingsController::class, 'index'])->name('settings.index');
    Route::post('/settings', [Admin\SettingsController::class, 'update'])->name('settings.update');
});
