<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\Order;
use App\Models\Product;

class AdminDashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_dashboard_shows_correct_intelligence_metrics()
    {
        $admin = User::factory()->create(['is_admin' => true]);
        
        $customer = User::factory()->create();

        // Create some orders
        Order::create([
            'user_id' => $customer->id,
            'order_number' => 'ORD-1',
            'subtotal' => 1500,
            'total' => 1500,
            'amount_paid' => 1500,
            'balance_due' => 0,
            'advance_required' => 0,
            'order_status' => 'pending',
            'payment_status' => 'pending',
            'payment_method' => 'cash',
            'shipping_address' => json_encode(['address_line_1' => '123 Main St']),
            'billing_address' => json_encode(['address_line_1' => '123 Main St'])
        ]);
        
        Order::create([
            'user_id' => $customer->id,
            'order_number' => 'ORD-2',
            'subtotal' => 2000,
            'total' => 2000,
            'amount_paid' => 1000,
            'balance_due' => 1000,
            'advance_required' => 0,
            'order_status' => 'pending',
            'payment_status' => 'pending',
            'payment_method' => 'cash',
            'shipping_address' => json_encode(['address_line_1' => '123 Main St']),
            'billing_address' => json_encode(['address_line_1' => '123 Main St'])
        ]);

        Order::create([
            'user_id' => $customer->id,
            'order_number' => 'ORD-3',
            'subtotal' => 5000,
            'total' => 5000,
            'amount_paid' => 5000,
            'balance_due' => 0,
            'advance_required' => 0,
            'order_status' => 'cancelled', // Should be excluded
            'payment_status' => 'pending',
            'payment_method' => 'cash',
            'shipping_address' => json_encode(['address_line_1' => '123 Main St']),
            'billing_address' => json_encode(['address_line_1' => '123 Main St'])
        ]);

        $category = \App\Models\Category::create(['name' => 'Cat1', 'slug' => 'cat-1']);
        $product1 = Product::create(['category_id' => $category->id, 'name' => 'P1', 'slug' => 'p1', 'price' => 100, 'sales_count' => 10, 'is_active' => true]);
        $product2 = Product::create(['category_id' => $category->id, 'name' => 'P2', 'slug' => 'p2', 'price' => 100, 'sales_count' => 5, 'is_active' => true]);
        $product3 = Product::create(['category_id' => $category->id, 'name' => 'P3', 'slug' => 'p3', 'price' => 100, 'sales_count' => 0, 'is_active' => true]); // Should be excluded

        $response = $this->actingAs($admin)->get('/admin/dashboard');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/Dashboard')
            ->where('stats.total_order_value', '3500.00')
            ->where('stats.amount_collected', '2500.00')
            ->has('popular_products', 2)
            ->where('popular_products.0.id', $product1->id)
        );
    }
}
