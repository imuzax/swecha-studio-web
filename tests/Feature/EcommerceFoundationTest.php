<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\Product;
use App\Models\Category;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\ProductVariant;
use App\Models\Customization;
use App\Models\CustomizationOption;
use App\Models\Wishlist;

class EcommerceFoundationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Seed base dependencies
        $this->category = Category::create(['name' => 'Test Cat', 'slug' => 'test-cat', 'is_active' => true]);
        
        $this->product = Product::create([
            'category_id' => $this->category->id,
            'name' => 'Concrete Jar',
            'slug' => 'concrete-jar',
            'price' => 100,
            'stock_quantity' => 10,
            'is_active' => true
        ]);
        
        // Variant
        $this->variant = ProductVariant::create([
            'product_id' => $this->product->id,
            'type' => 'Size',
            'value' => 'Large',
            'price_adjustment' => 20,
            'stock_quantity' => 5
        ]);
        
        // Customizations
        $this->colorCust = Customization::create(['name' => 'Colour']);
        $this->colorOption = CustomizationOption::create(['customization_id' => $this->colorCust->id, 'name' => 'Blue', 'price_adjustment' => 5]);
        
        $this->foilCust = Customization::create(['name' => 'Detailing']);
        $this->foilOption = CustomizationOption::create(['customization_id' => $this->foilCust->id, 'name' => 'Gold Foil', 'price_adjustment' => 10]);
        
        $this->product->customizations()->attach([$this->colorCust->id, $this->foilCust->id]);
    }

    public function test_authoritative_pricing_calculations()
    {
        // 1. Base price
        $this->assertEquals(100, $this->product->calculatePrice());

        // 2. Variant price (+20)
        $this->assertEquals(120, $this->product->calculatePrice($this->variant->id));

        // 3. Color only (+5)
        $this->assertEquals(105, $this->product->calculatePrice(null, [$this->colorOption->id]));

        // 4. Gold foil only (+10)
        $this->assertEquals(110, $this->product->calculatePrice(null, [$this->foilOption->id]));

        // 5. Color + Gold Foil (+15)
        $this->assertEquals(115, $this->product->calculatePrice(null, [$this->colorOption->id, $this->foilOption->id]));

        // 6. Variant + Color + Gold Foil (100 + 20 + 5 + 10 = 135)
        $this->assertEquals(135, $this->product->calculatePrice($this->variant->id, [$this->colorOption->id, $this->foilOption->id]));
    }

    public function test_invalid_variant_throws_exception()
    {
        $this->expectException(\Exception::class);
        $this->product->calculatePrice(999); // Invalid variant ID
    }

    public function test_invalid_customization_throws_exception()
    {
        $this->expectException(\Exception::class);
        $this->product->calculatePrice(null, [999]); // Invalid customization option ID
    }

    public function test_checkout_does_not_deduct_stock_and_calculates_advance()
    {
        $user = User::factory()->create();
        
        // Simulate Cart Session for Checkout
        // User cart has 3 Concrete Jars with Color + Foil
        session()->put('cart', [
            'item-1' => [
                'id' => $this->product->id,
                'quantity' => 3,
                'variant_id' => null,
                'customizations' => [$this->colorOption->id, $this->foilOption->id],
                'name' => 'Concrete Jar',
                'price' => 10 // manipulated price, should be ignored
            ]
        ]);

        $response = $this->actingAs($user)->post(route('checkout.process'), [
            'first_name' => 'John',
            'last_name' => 'Doe',
            'email' => 'john@example.com',
            'phone' => '1234567890',
            'address_line_1' => '123 Test St',
            'city' => 'Testville',
            'state' => 'Test State',
            'postal_code' => '12345',
            'country' => 'Testland',
            'payment_method' => 'whatsapp'
        ]);
        
        $order = Order::first();
        
        $this->assertNotNull($order);
        
        // 1. Backend recalculated price (3 * 115 = 345)
        $this->assertEquals(345, $order->total);
        $this->assertEquals(345, OrderItem::first()->line_total);
        
        // 2. Advance Required is 0
        $this->assertEquals(0, $order->advance_required);
        $this->assertEquals(0, $order->amount_paid);
        $this->assertEquals(345, $order->balance_due);
        
        // 3. Stock remains untouched (10 originally)
        $this->assertEquals(10, $this->product->fresh()->stock_quantity);
    }

    public function test_wishlist_ownership()
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();

        $wishlist = Wishlist::create([
            'user_id' => $user1->id,
            'product_id' => $this->product->id
        ]);

        $this->assertEquals($user1->id, $wishlist->user->id);
        $this->assertNotEquals($user2->id, $wishlist->user->id);
    }

    public function test_checkout_index_rejects_invalid_variant()
    {
        $user = User::factory()->create();
        
        session()->put('cart', [
            'item-1' => [
                'id' => $this->product->id,
                'quantity' => 1,
                'variant_id' => 999, // Invalid variant
                'customizations' => [],
                'name' => 'Concrete Jar',
                'price' => 100
            ]
        ]);

        $response = $this->actingAs($user)->get(route('checkout.index'));
        $response->assertRedirect(route('cart.index'));
        $response->assertSessionHas('error');
    }

    public function test_admin_confirmation_deducts_stock_idempotently()
    {
        $admin = User::factory()->create(['is_admin' => true]);

        // Create a pending order
        $order = Order::create([
            'user_id' => $admin->id,
            'order_number' => 'ORD-TEST999',
            'order_status' => 'Pending',
            'payment_status' => 'Pending',
            'payment_method' => 'whatsapp',
            'subtotal' => 100,
            'total' => 100,
            'shipping_address' => 'Test',
            'billing_address' => 'Test',
            'advance_required' => 50,
            'amount_paid' => 0,
            'balance_due' => 100
        ]);

        OrderItem::create([
            'order_id' => $order->id,
            'product_id' => $this->product->id,
            'product_name' => 'Test',
            'quantity' => 2,
            'price_at_purchase' => 100,
            'line_total' => 200,
        ]);

        // Stock before (10)
        $this->assertEquals(10, $this->product->fresh()->stock_quantity);

        // 1. Pending -> Processing (Deducts stock)
        $response = $this->actingAs($admin)->put(route('admin.orders.update', $order), [
            'order_status' => 'processing',
            'payment_status' => 'pending'
        ]);

        $this->assertEquals(8, $this->product->fresh()->stock_quantity);
        $this->assertEquals(1, $order->fresh()->is_stock_deducted);

        // 2. Processing -> Shipped (Does NOT deduct again)
        $response = $this->actingAs($admin)->put(route('admin.orders.update', $order), [
            'order_status' => 'shipped',
            'payment_status' => 'pending'
        ]);

        $this->assertEquals(8, $this->product->fresh()->stock_quantity);
    }
}
