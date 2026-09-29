<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Product;
use App\Models\Category;
use App\Models\Order;

class DashboardController extends Controller
{
    public function index()
    {
        $total_order_value = Order::whereNotIn('order_status', ['cancelled'])->sum('total');
        $amount_collected = Order::whereNotIn('order_status', ['cancelled'])->sum('amount_paid');

        $monthly_sales = Order::selectRaw('SUM(total) as revenue, DATE_FORMAT(created_at, "%Y-%m") as month_label')
            ->whereNotIn('order_status', ['cancelled'])
            ->groupBy('month_label')
            ->orderBy('month_label', 'desc')
            ->take(6)
            ->get();

        $popular_products = Product::where('sales_count', '>', 0)
            ->with(['images' => function($q) { $q->orderBy('sort_order')->take(1); }])
            ->orderBy('sales_count', 'desc')
            ->take(5)
            ->get()
            ->map(function($product) {
                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'sales_count' => $product->sales_count,
                    'image' => $product->images->first() ? $product->images->first()->path : null,
                ];
            });

        $current_month_order_count = Order::whereNotIn('order_status', ['cancelled'])
            ->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->count();

        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'total_products' => Product::count(),
                'active_products' => Product::where('is_active', true)->count(),
                'low_stock_products' => Product::where('stock_quantity', '<=', 5)->count(),
                'total_categories' => Category::count(),
                'total_orders' => Order::count(),
                'pending_orders' => Order::where('order_status', 'pending')->count(),
                'processing_orders' => Order::where('order_status', 'processing')->count(),
                'completed_orders' => Order::where('order_status', 'delivered')->count(),
                'cancelled_orders' => Order::where('order_status', 'cancelled')->count(),
                'current_month_order_count' => $current_month_order_count,
                'total_order_value' => $total_order_value,
                'amount_collected' => $amount_collected,
                'total_workshops' => \App\Models\Workshop::count(),
                'upcoming_workshop_dates' => \App\Models\WorkshopDate::where('date', '>=', now()->toDateString())->count(),
                'total_workshop_bookings' => \App\Models\WorkshopBooking::count(),
            ],
            'monthly_sales' => $monthly_sales,
            'popular_products' => $popular_products,
            'recent_orders' => Order::with('user')
                ->latest()
                ->take(5)
                ->get()
                ->map(function ($order) {
                    return [
                        'id' => $order->id,
                        'order_number' => $order->order_number,
                        'customer' => $order->user ? $order->user->name : 'Guest',
                        'status' => $order->order_status,
                        'date' => $order->created_at->diffForHumans(),
                        'total' => '₹' . number_format($order->total, 2)
                    ];
                }),
            'analytics_summary' => \App\Models\AnalyticsEvent::selectRaw('event_name, count(*) as count')
                ->where('created_at', '>=', now()->subDays(30))
                ->groupBy('event_name')
                ->get()
                ->pluck('count', 'event_name')
        ]);
    }
}
