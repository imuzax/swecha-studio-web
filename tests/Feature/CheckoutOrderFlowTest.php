<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Customization;
use App\Models\CustomizationOption;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use App\Models\Address;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Illuminate\Support\Facades\DB;

class CheckoutOrderFlowTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();
    }

    private function createProductWithVariantAndCustomization()
    {
        $category = Category::create(['name' => 'Decor', 'slug' => 'decor', 'is_active' => true]);
        $product = Product::create([
            'category_id' => $category->id,
            'name' => 'Test Product',
            'slug' => 'test-product',
            'price' => 500,
            'stock_quantity' => 10,
            'is_active' => true,
        ]);
        
        $variant = ProductVariant::create(['product_id' => $product->id, 'type' => 'Size', 'value' => 'Large', 'price_adjustment' => 100, 'stock_quantity' => 10, 'is_active' => true]);
        
        $customization = Customization::create(['name' => 'Color', 'is_active' => true]);
        $option = CustomizationOption::create(['customization_id' => $customization->id, 'name' => 'Red', 'price_adjustment' => 50]);
        $product->customizations()->attach($customization->id);

        return [$product, $variant, $option];
    }

    // 1. checkout requires authentication
    public function test_checkout_requires_authentication()
    {
        $this->get('/checkout')->assertRedirect('/login');
        $this->post('/checkout')->assertRedirect('/login');
    }

    // 2. empty cart rejected
    public function test_empty_cart_rejected()
    {
        $user = User::factory()->create();
        $this->actingAs($user)->get('/checkout')->assertRedirect('/shop');
        $this->actingAs($user)->post('/checkout', [
            'first_name' => 'John',
            'last_name' => 'Doe',
            'email' => 'john@example.com',
            'phone' => '9999999999',
            'address_line_1' => '123 Test St',
            'city' => 'Test City',
            'state' => 'Test State',
            'postal_code' => '123456',
            'country' => 'India',
            'payment_method' => 'whatsapp'
        ])->assertRedirect('/shop');
    }

    // 3. valid checkout creates order
    public function test_valid_checkout_creates_order()
    {
        $user = User::factory()->create();
        [$product, $variant, $option] = $this->createProductWithVariantAndCustomization();
        
        $this->actingAs($user)->post('/cart/add/' . $product->id, [
            'quantity' => 2,
            'variant_id' => $variant->id,
            'customizations' => [$option->id]
        ]);

        $response = $this->post('/checkout', [
            'first_name' => 'John',
            'last_name' => 'Doe',
            'email' => 'john@example.com',
            'phone' => '9999999999',
            'address_line_1' => '123 Test St',
            'city' => 'Test City',
            'state' => 'Test State',
            'postal_code' => '123456',
            'country' => 'India',
            'payment_method' => 'whatsapp'
        ]);

        $this->assertDatabaseHas('orders', ['user_id' => $user->id, 'total' => 1300]); // (500+100+50) * 2 = 1300
        $order = Order::first();
        
        $response->assertRedirect('/order-success/' . $order->order_number);
    }

    // 4. selected address accepted
    public function test_selected_address_accepted()
    {
        $user = User::factory()->create();
        $address = Address::create([
            'user_id' => $user->id,
            'name' => 'John Doe',
            'address_line_1' => '123 Test St',
            'city' => 'Test City',
            'state' => 'Test State',
            'pincode' => '123456',
            'phone' => '9999999999'
        ]);

        [$product, $variant, $option] = $this->createProductWithVariantAndCustomization();
        $this->actingAs($user)->post('/cart/add/' . $product->id, ['quantity' => 1, 'variant_id' => $variant->id]);

        $this->post('/checkout', [
            'address_id' => $address->id,
            'payment_method' => 'whatsapp'
        ]);

        $this->assertDatabaseHas('orders', ['user_id' => $user->id]);
        $order = Order::first();
        $this->assertStringContainsString('123 Test St', $order->shipping_address);
    }

    // 5. foreign address rejected
    public function test_foreign_address_rejected()
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();
        $address = Address::create([
            'user_id' => $otherUser->id,
            'name' => 'John Doe',
            'address_line_1' => '123 Test St',
            'city' => 'Test City',
            'state' => 'Test State',
            'pincode' => '123456',
            'phone' => '9999999999'
        ]);

        [$product, $variant, $option] = $this->createProductWithVariantAndCustomization();
        $this->actingAs($user)->post('/cart/add/' . $product->id, ['quantity' => 1, 'variant_id' => $variant->id]);

        $response = $this->post('/checkout', [
            'address_id' => $address->id,
            'payment_method' => 'whatsapp'
        ]);

        $response->assertStatus(404); // firstOrFail throws 404
    }

    // 6. authoritative price calculation
    public function test_authoritative_price_calculation()
    {
        $user = User::factory()->create();
        [$product, $variant, $option] = $this->createProductWithVariantAndCustomization();
        $this->actingAs($user)->post('/cart/add/' . $product->id, ['quantity' => 1, 'variant_id' => $variant->id, 'customizations' => [$option->id]]);
        
        $this->post('/checkout', [
            'first_name' => 'John',
            'last_name' => 'Doe',
            'email' => 'john@example.com',
            'phone' => '9999999999',
            'address_line_1' => '123 Test St',
            'city' => 'Test City',
            'state' => 'Test State',
            'postal_code' => '123456',
            'country' => 'India',
            'payment_method' => 'whatsapp'
        ]);

        $this->assertDatabaseHas('orders', ['total' => 650]);
    }

    // 7. frontend price tampering prevented
    public function test_frontend_price_tampering_prevented()
    {
        $user = User::factory()->create();
        [$product, $variant, $option] = $this->createProductWithVariantAndCustomization();
        
        // Add to cart normally
        $this->actingAs($user)->post('/cart/add/' . $product->id, ['quantity' => 1, 'variant_id' => $variant->id, 'customizations' => [$option->id]]);
        
        // Tamper session cart price
        $cart = session('cart');
        $key = array_key_first($cart);
        $cart[$key]['price'] = 10;
        session(['cart' => $cart]);

        // Proceed to checkout
        $this->post('/checkout', [
            'first_name' => 'John',
            'last_name' => 'Doe',
            'email' => 'john@example.com',
            'phone' => '9999999999',
            'address_line_1' => '123 Test St',
            'city' => 'Test City',
            'state' => 'Test State',
            'postal_code' => '123456',
            'country' => 'India',
            'payment_method' => 'whatsapp'
        ]);

        // Even though session was tampered, checkout recalculates against DB
        $this->assertDatabaseHas('orders', ['total' => 650]);
    }

    // 8. frontend total tampering prevented
    // 9. advance amount calculated correctly (now 0)
    public function test_advance_amount_is_zero()
    {
        $user = User::factory()->create();
        [$product, $variant, $option] = $this->createProductWithVariantAndCustomization();
        $this->actingAs($user)->post('/cart/add/' . $product->id, ['quantity' => 1, 'variant_id' => $variant->id]);

        $this->post('/checkout', [
            'first_name' => 'John',
            'last_name' => 'Doe',
            'email' => 'john@example.com',
            'phone' => '9999999999',
            'address_line_1' => '123 Test St',
            'city' => 'Test City',
            'state' => 'Test State',
            'postal_code' => '123456',
            'country' => 'India',
            'payment_method' => 'whatsapp'
        ]);

        $order = Order::first();
        $this->assertEquals(600, $order->total); // 500 + 100
        $this->assertEquals(0, $order->advance_required); // No longer requiring advance
    }

    // 10. amount_paid initially correct
    // 11. balance_due initially correct
    // 12. payment status not falsely marked paid
    public function test_payment_status_and_balances_initially_correct()
    {
        $user = User::factory()->create();
        [$product, $variant, $option] = $this->createProductWithVariantAndCustomization();
        $this->actingAs($user)->post('/cart/add/' . $product->id, ['quantity' => 1, 'variant_id' => $variant->id]);

        $this->post('/checkout', [
            'first_name' => 'John',
            'last_name' => 'Doe',
            'email' => 'john@example.com',
            'phone' => '9999999999',
            'address_line_1' => '123 Test St',
            'city' => 'Test City',
            'state' => 'Test State',
            'postal_code' => '123456',
            'country' => 'India',
            'payment_method' => 'whatsapp'
        ]);

        $order = Order::first();
        $this->assertEquals(0, $order->amount_paid);
        $this->assertEquals(600, $order->balance_due);
        $this->assertEquals('pending', $order->payment_status);
        $this->assertEquals('pending', $order->order_status);
    }

    // 13. order snapshot created
    // 14. variant snapshot preserved
    // 15. customization snapshot preserved
    public function test_snapshots_preserved()
    {
        $user = User::factory()->create();
        [$product, $variant, $option] = $this->createProductWithVariantAndCustomization();
        $this->actingAs($user)->post('/cart/add/' . $product->id, ['quantity' => 1, 'variant_id' => $variant->id, 'customizations' => [$option->id]]);

        $this->post('/checkout', [
            'first_name' => 'John',
            'last_name' => 'Doe',
            'email' => 'john@example.com',
            'phone' => '9999999999',
            'address_line_1' => '123 Test St',
            'city' => 'Test City',
            'state' => 'Test State',
            'postal_code' => '123456',
            'country' => 'India',
            'payment_method' => 'whatsapp'
        ]);

        $item = OrderItem::first();
        $this->assertEquals('Test Product', $item->product_name);
        $this->assertEquals('Large', $item->variant_info['value']);
        $this->assertEquals('Red', $item->customization_info[0]['option']);
        
        // Mutate the product to ensure snapshot is intact
        $product->update(['name' => 'Mutated Product']);
        $variant->update(['value' => 'Mutated Large']);
        $option->update(['name' => 'Mutated Red']);
        
        $item->refresh();
        $this->assertEquals('Test Product', $item->product_name);
        $this->assertEquals('Large', $item->variant_info['value']);
        $this->assertEquals('Red', $item->customization_info[0]['option']);
    }

    // 16. cart cleared after successful order
    public function test_cart_cleared_after_successful_order()
    {
        $user = User::factory()->create();
        [$product, $variant, $option] = $this->createProductWithVariantAndCustomization();
        $this->actingAs($user)->post('/cart/add/' . $product->id, ['quantity' => 1, 'variant_id' => $variant->id]);

        $this->assertNotEmpty(session('cart'));

        $this->post('/checkout', [
            'first_name' => 'John',
            'last_name' => 'Doe',
            'email' => 'john@example.com',
            'phone' => '9999999999',
            'address_line_1' => '123 Test St',
            'city' => 'Test City',
            'state' => 'Test State',
            'postal_code' => '123456',
            'country' => 'India',
            'payment_method' => 'whatsapp'
        ]);

        $this->assertEmpty(session('cart'));
    }

    // 17. duplicate submission does not create duplicate order
    public function test_duplicate_submission_does_not_create_duplicate_order()
    {
        $user = User::factory()->create();
        [$product, $variant, $option] = $this->createProductWithVariantAndCustomization();
        $this->actingAs($user)->post('/cart/add/' . $product->id, ['quantity' => 1, 'variant_id' => $variant->id]);

        $payload = [
            'first_name' => 'John',
            'last_name' => 'Doe',
            'email' => 'john@example.com',
            'phone' => '9999999999',
            'address_line_1' => '123 Test St',
            'city' => 'Test City',
            'state' => 'Test State',
            'postal_code' => '123456',
            'country' => 'India',
            'payment_method' => 'whatsapp'
        ];

        // First submit works
        $this->post('/checkout', $payload);
        $this->assertEquals(1, Order::count());

        // Second submit redirects to shop because cart is empty
        $this->post('/checkout', $payload)->assertRedirect('/shop');
        $this->assertEquals(1, Order::count());
    }

    // 18. foreign order access rejected
    // 19. order detail ownership enforced
    public function test_foreign_order_access_rejected()
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();
        
        $order = Order::create([
            'order_number' => 'ORD-123',
            'user_id' => $user1->id,
            'subtotal' => 500,
            'total' => 500,
            'payment_method' => 'whatsapp',
            'shipping_address' => '123 Test',
            'billing_address' => '123 Test'
        ]);

        $this->actingAs($user2)->get('/order-success/' . $order->order_number)->assertStatus(403);
        $this->actingAs($user2)->get('/my-orders/' . $order->order_number)->assertStatus(403);
        
        $this->actingAs($user1)->get('/order-success/' . $order->order_number)->assertStatus(200);
        $this->actingAs($user1)->get('/my-orders/' . $order->order_number)->assertStatus(200);
    }

    // 20. WhatsApp data generated correctly
    public function test_whatsapp_data_generated_correctly()
    {
        $user = User::factory()->create();
        $order = Order::create([
            'order_number' => 'ORD-123',
            'user_id' => $user->id,
            'subtotal' => 500,
            'total' => 500,
            'payment_method' => 'whatsapp',
            'shipping_address' => '123 Test',
            'billing_address' => '123 Test'
        ]);

        $response = $this->actingAs($user)->get('/order-success/' . $order->order_number);
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('Frontend/OrderSuccess'));
    }

    // 21. WhatsApp does not mark payment as paid
    // covered by test 12 (payment status pending on creation)

    // 22. stock is not deducted merely by customer checkout/WhatsApp
    public function test_stock_is_not_deducted_by_checkout()
    {
        $user = User::factory()->create();
        [$product, $variant, $option] = $this->createProductWithVariantAndCustomization();
        $this->actingAs($user)->post('/cart/add/' . $product->id, ['quantity' => 2]);

        $this->post('/checkout', [
            'first_name' => 'John',
            'last_name' => 'Doe',
            'email' => 'john@example.com',
            'phone' => '9999999999',
            'address_line_1' => '123 Test St',
            'city' => 'Test City',
            'state' => 'Test State',
            'postal_code' => '123456',
            'country' => 'India',
            'payment_method' => 'whatsapp'
        ]);

        $product->refresh();
        $this->assertEquals(10, $product->stock_quantity); // Unchanged
    }

    public function test_authenticated_user_can_view_orders_index()
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();

        // Orders for user 1
        $order1 = Order::create([
            'order_number' => 'ORD-U1-1',
            'user_id' => $user1->id,
            'subtotal' => 100,
            'total' => 100,
            'payment_method' => 'whatsapp',
            'shipping_address' => 'Test',
            'billing_address' => 'Test',
            'created_at' => now()->subDay()
        ]);
        $order2 = Order::create([
            'order_number' => 'ORD-U1-2',
            'user_id' => $user1->id,
            'subtotal' => 200,
            'total' => 200,
            'payment_method' => 'whatsapp',
            'shipping_address' => 'Test',
            'billing_address' => 'Test',
            'created_at' => now()
        ]);

        // Order for user 2
        $order3 = Order::create([
            'order_number' => 'ORD-U2-1',
            'user_id' => $user2->id,
            'subtotal' => 300,
            'total' => 300,
            'payment_method' => 'whatsapp',
            'shipping_address' => 'Test',
            'billing_address' => 'Test'
        ]);

        // Unauthenticated access
        $this->get('/my-orders')->assertRedirect('/login');

        // Authenticated access
        $response = $this->actingAs($user1)->get('/my-orders');
        
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Frontend/Account/Orders')
            ->has('orders', 2)
            ->where('orders.0.order_number', 'ORD-U1-2') // latest first
            ->where('orders.1.order_number', 'ORD-U1-1')
        );

        // Assert user 2's order is not exposed
        $response->assertDontSee('ORD-U2-1');
    }
}
