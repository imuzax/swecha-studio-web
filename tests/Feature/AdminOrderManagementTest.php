<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminOrderManagementTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        // Create an admin user
        $this->admin = User::factory()->create(['is_admin' => true]);
        // Create a normal customer
        $this->customer = User::factory()->create(['is_admin' => false]);
    }

    private function createDummyOrder($user = null)
    {
        $user = $user ?? $this->customer;
        
        $order = Order::create([
            'order_number' => 'ORD-TEST' . uniqid(),
            'user_id' => $user->id,
            'order_status' => 'pending',
            'payment_status' => 'pending',
            'payment_method' => 'whatsapp',
            'subtotal' => 1000,
            'total' => 1000,
            'advance_required' => 500,
            'amount_paid' => 0,
            'balance_due' => 1000,
            'shipping_address' => 'Test Address',
            'billing_address' => 'Test Address'
        ]);

        $category = \App\Models\Category::firstOrCreate(
            ['slug' => 'test-category'],
            ['name' => 'Test Category']
        );

        $product = Product::create([
            'category_id' => $category->id,
            'name' => 'Test Product',
            'slug' => 'test-product-' . uniqid(),
            'price' => 1000,
            'stock_quantity' => 10,
            'is_active' => true,
        ]);

        $variant = ProductVariant::create([
            'product_id' => $product->id,
            'type' => 'Size',
            'value' => 'Large',
            'price_adjustment' => 0,
            'stock_quantity' => 5,
            'is_active' => true,
        ]);

        OrderItem::create([
            'order_id' => $order->id,
            'product_id' => $product->id,
            'product_name' => $product->name,
            'quantity' => 2,
            'price_at_purchase' => 500,
            'line_total' => 1000,
            'variant_info' => [
                'id' => $variant->id,
                'type' => 'Size',
                'value' => 'Large',
                'price_adjustment' => 0
            ]
        ]);

        return [$order, $product, $variant];
    }

    // 1. unauthenticated admin route blocked
    public function test_unauthenticated_admin_route_blocked()
    {
        $this->get('/admin/orders')->assertRedirect('/login');
    }

    // 2. normal customer blocked from admin orders
    public function test_normal_customer_blocked_from_admin_orders()
    {
        $this->actingAs($this->customer)->get('/admin/orders')->assertStatus(403);
    }

    // 3. authorized admin can list orders
    public function test_authorized_admin_can_list_orders()
    {
        $this->actingAs($this->admin)->get('/admin/orders')->assertStatus(200);
    }

    // 4. admin pagination works
    public function test_admin_pagination_works()
    {
        for ($i = 0; $i < 20; $i++) {
            $this->createDummyOrder();
        }
        $response = $this->actingAs($this->admin)->get('/admin/orders');
        $response->assertStatus(200);
        $this->assertCount(15, $response->viewData('page')['props']['orders']['data']);
    }

    // 5. admin search works
    public function test_admin_search_works()
    {
        [$order] = $this->createDummyOrder();
        $order->update(['order_number' => 'UNIQUE-SEARCH']);
        $response = $this->actingAs($this->admin)->get('/admin/orders?search=UNIQUE-SEARCH');
        $this->assertCount(1, $response->viewData('page')['props']['orders']['data']);
    }

    // 6. admin status filter works
    public function test_admin_status_filter_works()
    {
        [$order1] = $this->createDummyOrder();
        $order1->update(['order_status' => 'delivered']);
        
        [$order2] = $this->createDummyOrder();
        $order2->update(['order_status' => 'pending']);
        
        $response = $this->actingAs($this->admin)->get('/admin/orders?status=delivered');
        $this->assertCount(1, $response->viewData('page')['props']['orders']['data']);
    }

    // 7. admin can view order details
    public function test_admin_can_view_order_details()
    {
        [$order] = $this->createDummyOrder();
        $response = $this->actingAs($this->admin)->get('/admin/orders/' . $order->id);
        $response->assertStatus(200);
        $this->assertEquals($order->order_number, $response->viewData('page')['props']['order']['order_number']);
    }

    // 8. customer cannot access admin order detail
    public function test_customer_cannot_access_admin_order_detail()
    {
        [$order] = $this->createDummyOrder();
        $this->actingAs($this->customer)->get('/admin/orders/' . $order->id)->assertStatus(403);
    }

    // 9. admin can update valid order status
    public function test_admin_can_update_valid_order_status()
    {
        [$order] = $this->createDummyOrder();
        $this->actingAs($this->admin)->put('/admin/orders/' . $order->id, [
            'order_status' => 'pending',
            'payment_status' => 'pending',
            'amount_paid' => 0
        ])->assertSessionHas('success');
        
        $this->assertEquals('pending', $order->fresh()->order_status);
    }

    // 10. invalid status rejected
    public function test_invalid_status_rejected()
    {
        [$order] = $this->createDummyOrder();
        $this->actingAs($this->admin)->put('/admin/orders/' . $order->id, [
            'order_status' => 'INVALID_STATUS',
            'payment_status' => 'pending'
        ])->assertSessionHasErrors('order_status');
    }

    // 11. order status does not automatically mark payment paid
    public function test_order_status_does_not_automatically_mark_payment_paid()
    {
        [$order] = $this->createDummyOrder();
        // Update to processing but payment still pending
        $this->actingAs($this->admin)->put('/admin/orders/' . $order->id, [
            'order_status' => 'processing',
            'payment_status' => 'pending',
            'amount_paid' => 0
        ]);
        
        $fresh = $order->fresh();
        $this->assertEquals('processing', $fresh->order_status);
        $this->assertEquals('pending', $fresh->payment_status); // payment untouched
    }

    // 12. stock not deducted before confirmation
    public function test_stock_not_deducted_before_confirmation()
    {
        [$order, $product, $variant] = $this->createDummyOrder();
        $this->assertFalse((bool)$order->is_stock_deducted);
        $this->assertEquals(5, $variant->fresh()->stock_quantity); // Initially 5
    }

    // 13. stock deducted at correct processing/confirmation stage
    public function test_stock_deducted_at_correct_processing_stage()
    {
        [$order, $product, $variant] = $this->createDummyOrder();
        
        $this->actingAs($this->admin)->put('/admin/orders/' . $order->id, [
            'order_status' => 'processing',
            'payment_status' => 'pending'
        ]);

        $this->assertTrue((bool)$order->fresh()->is_stock_deducted);
        $this->assertEquals(3, $variant->fresh()->stock_quantity); // 5 - 2 = 3
    }

    // 14. stock deduction is idempotent
    public function test_stock_deduction_is_idempotent()
    {
        [$order, $product, $variant] = $this->createDummyOrder();
        
        // Deduct once
        $this->actingAs($this->admin)->put('/admin/orders/' . $order->id, [
            'order_status' => 'processing',
            'payment_status' => 'pending'
        ]);
        $this->assertEquals(3, $variant->fresh()->stock_quantity);

        // Update again, e.g. shipped
        $this->actingAs($this->admin)->put('/admin/orders/' . $order->id, [
            'order_status' => 'shipped',
            'payment_status' => 'pending'
        ]);
        // Stock should remain 3, not deduct again
        $this->assertEquals(3, $variant->fresh()->stock_quantity);
    }

    // 17. insufficient stock prevents invalid processing
    public function test_insufficient_stock_prevents_invalid_processing()
    {
        [$order, $product, $variant] = $this->createDummyOrder();
        
        // Manually drop stock to 1 (but order requires 2)
        $variant->update(['stock_quantity' => 1]);

        $this->actingAs($this->admin)->put('/admin/orders/' . $order->id, [
            'order_status' => 'processing',
            'payment_status' => 'pending'
        ])->assertSessionHas('error'); // Exception caught

        $this->assertFalse((bool)$order->fresh()->is_stock_deducted);
        $this->assertEquals('pending', $order->fresh()->order_status); // Transaction rolled back
        $this->assertEquals(1, $variant->fresh()->stock_quantity);
    }

    // 19. unauthorized payment mutation blocked
    public function test_unauthorized_payment_mutation_blocked()
    {
        [$order] = $this->createDummyOrder();
        $this->actingAs($this->customer)->put('/admin/orders/' . $order->id, [
            'order_status' => 'pending',
            'payment_status' => 'paid',
            'amount_paid' => 1000
        ])->assertStatus(403);
    }

    // 20. valid payment update maintains balance correctly
    public function test_valid_payment_update_maintains_balance_correctly()
    {
        [$order] = $this->createDummyOrder();
        
        $this->actingAs($this->admin)->put('/admin/orders/' . $order->id, [
            'order_status' => 'pending',
            'payment_status' => 'pending',
            'amount_paid' => 400
        ]);

        $fresh = $order->fresh();
        $this->assertEquals(400, $fresh->amount_paid);
        $this->assertEquals(600, $fresh->balance_due); // 1000 - 400
        $this->assertEquals('pending', $fresh->payment_status);

        // Now pay in full
        $this->actingAs($this->admin)->put('/admin/orders/' . $order->id, [
            'order_status' => 'pending',
            'payment_status' => 'pending',
            'amount_paid' => 1000
        ]);

        $fresh2 = $order->fresh();
        $this->assertEquals(1000, $fresh2->amount_paid);
        $this->assertEquals(0, $fresh2->balance_due);
        $this->assertEquals('paid', $fresh2->payment_status); // auto updated
    }

    // 22. historical order snapshot remains intact
    public function test_historical_order_snapshot_remains_intact()
    {
        [$order, $product, $variant] = $this->createDummyOrder();
        $item = $order->items()->first();
        
        $this->assertNotNull($item->variant_info);
        $this->assertEquals('Large', $item->variant_info['value']);
    }

    // 23. customer-facing My Orders still works
    public function test_customer_facing_my_orders_still_works()
    {
        [$order] = $this->createDummyOrder();
        $this->actingAs($this->customer)->get('/my-orders')->assertStatus(200);
    }

    // 24. customer-facing Order Details still works
    public function test_customer_facing_order_details_still_works()
    {
        [$order] = $this->createDummyOrder();
        $this->actingAs($this->customer)->get('/my-orders/' . $order->order_number)->assertStatus(200);
    }
}
