<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Customization;
use App\Models\CustomizationOption;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use App\Models\Wishlist;
use App\Models\RecentlyViewedProduct;
use App\Models\ProductActivity;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Illuminate\Support\Carbon;

class EcommerceExperienceTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();
    }

    // ==========================================
    // 1. PRODUCT DETAIL
    // ==========================================
    public function test_active_product_can_be_viewed()
    {
        $category = Category::create(['name' => 'Decor', 'slug' => 'decor', 'is_active' => true]);
        $product = Product::create([
            'category_id' => $category->id,
            'name' => 'Active Product',
            'slug' => 'active-product',
            'price' => 500,
            'stock_quantity' => 10,
            'is_active' => true,
        ]);
        
        $response = $this->get('/product/' . $product->slug);
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('Frontend/ProductDetail'));
    }

    public function test_inactive_product_cannot_be_publicly_viewed()
    {
        $category = Category::create(['name' => 'Decor', 'slug' => 'decor', 'is_active' => true]);
        $product = Product::create([
            'category_id' => $category->id,
            'name' => 'Inactive Product',
            'slug' => 'inactive-product',
            'price' => 500,
            'stock_quantity' => 10,
            'is_active' => false,
        ]);
        
        $response = $this->get('/product/' . $product->slug);
        $response->assertStatus(404);
    }

    // ==========================================
    // 2. VARIANT SECURITY
    // ==========================================
    public function test_valid_variant_accepted_in_cart()
    {
        $category = Category::create(['name' => 'Decor', 'slug' => 'decor', 'is_active' => true]);
        $product = Product::create(['category_id' => $category->id, 'name' => 'P1', 'slug' => 'p1', 'price' => 500, 'stock_quantity' => 10, 'is_active' => true]);
        
        $variant = ProductVariant::create(['product_id' => $product->id, 'type' => 'Size', 'value' => 'Small', 'price_adjustment' => 0, 'stock_quantity' => 10, 'is_active' => true]);

        $response = $this->post('/cart/add/' . $product->id, ['quantity' => 1, 'variant_id' => $variant->id]);
        $response->assertSessionHasNoErrors();
        $this->assertArrayHasKey($product->id . '-' . $variant->id . '-', session('cart'));
    }

    public function test_variant_belonging_to_another_product_rejected()
    {
        $category = Category::create(['name' => 'Decor', 'slug' => 'decor', 'is_active' => true]);
        $product1 = Product::create(['category_id' => $category->id, 'name' => 'P1', 'slug' => 'p1', 'price' => 500, 'stock_quantity' => 10, 'is_active' => true]);
        $product2 = Product::create(['category_id' => $category->id, 'name' => 'P2', 'slug' => 'p2', 'price' => 500, 'stock_quantity' => 10, 'is_active' => true]);
        
        $variant2 = ProductVariant::create(['product_id' => $product2->id, 'type' => 'Size', 'value' => 'Small', 'price_adjustment' => 0, 'stock_quantity' => 10, 'is_active' => true]);

        $response = $this->post('/cart/add/' . $product1->id, ['quantity' => 1, 'variant_id' => $variant2->id]);
        $response->assertSessionHasErrors(['variant']);
    }

    public function test_nonexistent_variant_rejected()
    {
        $category = Category::create(['name' => 'Decor', 'slug' => 'decor', 'is_active' => true]);
        $product = Product::create(['category_id' => $category->id, 'name' => 'P1', 'slug' => 'p1', 'price' => 500, 'stock_quantity' => 10, 'is_active' => true]);

        $response = $this->post('/cart/add/' . $product->id, ['quantity' => 1, 'variant_id' => 999]);
        $response->assertSessionHasErrors(['variant']);
    }

    public function test_inactive_variant_rejected()
    {
        $category = Category::create(['name' => 'Decor', 'slug' => 'decor', 'is_active' => true]);
        $product = Product::create(['category_id' => $category->id, 'name' => 'P1', 'slug' => 'p1', 'price' => 500, 'stock_quantity' => 10, 'is_active' => true]);
        
        $variant = ProductVariant::create(['product_id' => $product->id, 'type' => 'Size', 'value' => 'Small', 'price_adjustment' => 0, 'stock_quantity' => 10, 'is_active' => false]);

        $response = $this->post('/cart/add/' . $product->id, ['quantity' => 1, 'variant_id' => $variant->id]);
        $response->assertSessionHasErrors(['variant']);
    }

    // ==========================================
    // 3. CUSTOMIZATION SECURITY
    // ==========================================
    public function test_valid_customization_accepted()
    {
        $category = Category::create(['name' => 'Decor', 'slug' => 'decor', 'is_active' => true]);
        $product = Product::create(['category_id' => $category->id, 'name' => 'P1', 'slug' => 'p1', 'price' => 500, 'stock_quantity' => 10, 'is_active' => true]);
        
        $customization = Customization::create(['name' => 'Color', 'is_active' => true]);
        $option = CustomizationOption::create(['customization_id' => $customization->id, 'name' => 'Red', 'price_adjustment' => 50]);
        $product->customizations()->attach($customization->id);

        $response = $this->post('/cart/add/' . $product->id, ['quantity' => 1, 'customizations' => [$option->id]]);
        $response->assertSessionHasNoErrors();
    }

    public function test_customization_belonging_to_another_product_rejected()
    {
        $category = Category::create(['name' => 'Decor', 'slug' => 'decor', 'is_active' => true]);
        $product = Product::create(['category_id' => $category->id, 'name' => 'P1', 'slug' => 'p1', 'price' => 500, 'stock_quantity' => 10, 'is_active' => true]);
        
        $customization = Customization::create(['name' => 'Color', 'is_active' => true]);
        $option = CustomizationOption::create(['customization_id' => $customization->id, 'name' => 'Red', 'price_adjustment' => 50]);
        // Note: deliberately not attaching to $product

        $response = $this->post('/cart/add/' . $product->id, ['quantity' => 1, 'customizations' => [$option->id]]);
        $response->assertSessionHasErrors(['customization']);
    }

    public function test_invalid_customization_payload_rejected()
    {
        $category = Category::create(['name' => 'Decor', 'slug' => 'decor', 'is_active' => true]);
        $product = Product::create(['category_id' => $category->id, 'name' => 'P1', 'slug' => 'p1', 'price' => 500, 'stock_quantity' => 10, 'is_active' => true]);

        $response = $this->post('/cart/add/' . $product->id, ['quantity' => 1, 'customizations' => 'not-an-array']);
        $response->assertSessionHasErrors(['customizations']);
    }

    public function test_cart_quantity_works()
    {
        $category = Category::create(['name' => 'Decor', 'slug' => 'decor', 'is_active' => true]);
        $product = Product::create(['category_id' => $category->id, 'name' => 'P1', 'slug' => 'p1', 'price' => 500, 'stock_quantity' => 10, 'is_active' => true]);
        
        $this->post('/cart/add/' . $product->id, ['quantity' => 3]);
        
        $cart = session('cart');
        $this->assertNotEmpty($cart);
        $key = array_key_first($cart);
        $this->assertEquals(3, $cart[$key]['quantity']);
        $this->assertEquals(500, $cart[$key]['price']);
    }

    // ==========================================
    // 4. AUTHORITATIVE PRICING
    // ==========================================
    public function test_authoritative_price_prevents_tampering()
    {
        $category = Category::create(['name' => 'Decor', 'slug' => 'decor', 'is_active' => true]);
        $product = Product::create(['category_id' => $category->id, 'name' => 'P1', 'slug' => 'p1', 'price' => 500, 'stock_quantity' => 10, 'is_active' => true]);
        
        $variant = ProductVariant::create(['product_id' => $product->id, 'type' => 'Size', 'value' => 'Large', 'price_adjustment' => 100, 'stock_quantity' => 10, 'is_active' => true]);
        
        $customization = Customization::create(['name' => 'Gold Foil', 'is_active' => true]);
        $option = CustomizationOption::create(['customization_id' => $customization->id, 'name' => 'Yes', 'price_adjustment' => 10]);
        $product->customizations()->attach($customization->id);

        // Attempting to send a tampered price
        $response = $this->post('/cart/add/' . $product->id, [
            'quantity' => 1,
            'variant_id' => $variant->id,
            'customizations' => [$option->id],
            'price' => 1 // malicious tampering attempt
        ]);

        $response->assertSessionHasNoErrors();

        // Check authoritative cart price
        $cart = session('cart');
        $key = $product->id . '-' . $variant->id . '-' . $option->id;
        
        $this->assertEquals(610, $cart[$key]['price']); // 500 + 100 + 10
    }

    // ==========================================
    // 6. WISHLIST
    // ==========================================
    public function test_user_can_toggle_wishlist()
    {
        $user = User::factory()->create();
        $category = Category::create(['name' => 'Decor', 'slug' => 'decor', 'is_active' => true]);
        $product = Product::create(['category_id' => $category->id, 'name' => 'P1', 'slug' => 'p1', 'price' => 500, 'is_active' => true]);

        // Add
        $this->actingAs($user)->post('/wishlist/' . $product->id)->assertRedirect();
        $this->assertDatabaseHas('wishlists', ['user_id' => $user->id, 'product_id' => $product->id]);
        
        // Remove
        $this->actingAs($user)->post('/wishlist/' . $product->id)->assertRedirect();
        $this->assertDatabaseMissing('wishlists', ['user_id' => $user->id, 'product_id' => $product->id]);
    }
    
    public function test_unauthenticated_user_cannot_access_wishlist()
    {
        $this->get('/wishlist')->assertRedirect('/login');
    }

    public function test_user_sees_only_own_wishlist()
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();
        
        $category = Category::create(['name' => 'Decor', 'slug' => 'decor', 'is_active' => true]);
        $product1 = Product::create(['category_id' => $category->id, 'name' => 'P1', 'slug' => 'p1', 'price' => 500, 'is_active' => true]);
        $product2 = Product::create(['category_id' => $category->id, 'name' => 'P2', 'slug' => 'p2', 'price' => 500, 'is_active' => true]);
        
        Wishlist::create(['user_id' => $user1->id, 'product_id' => $product1->id]);
        Wishlist::create(['user_id' => $user2->id, 'product_id' => $product2->id]);
        
        $response = $this->actingAs($user1)->get('/wishlist');
        $response->assertStatus(200);
        
        $response->assertInertia(fn ($page) => $page
            ->component('Frontend/Wishlist')
            ->has('wishlistedProducts', 1)
            ->where('wishlistedProducts.0.id', $product1->id)
        );
    }

    // ==========================================
    // 7. RECENTLY VIEWED & ACTIVITY
    // ==========================================
    public function test_recently_viewed_updates_viewed_at_instead_of_duplicate()
    {
        $user = User::factory()->create();
        $category = Category::create(['name' => 'Decor', 'slug' => 'decor', 'is_active' => true]);
        $product = Product::create(['category_id' => $category->id, 'name' => 'P1', 'slug' => 'p1', 'price' => 500, 'is_active' => true]);

        // First view
        $this->actingAs($user)->get('/product/' . $product->slug);
        
        $record = RecentlyViewedProduct::where('user_id', $user->id)->where('product_id', $product->id)->first();
        $this->assertNotNull($record);
        $firstViewedAt = $record->viewed_at;

        // Second view, shift time to test update
        Carbon::setTestNow(now()->addMinutes(5));
        $this->actingAs($user)->get('/product/' . $product->slug);

        $this->assertEquals(1, RecentlyViewedProduct::where('user_id', $user->id)->where('product_id', $product->id)->count());
        $record = RecentlyViewedProduct::where('user_id', $user->id)->where('product_id', $product->id)->first();
        $this->assertNotEquals($firstViewedAt, $record->viewed_at);
        Carbon::setTestNow();
    }

    public function test_user_cannot_access_another_users_recently_viewed()
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();
        
        $category = Category::create(['name' => 'Decor', 'slug' => 'decor', 'is_active' => true]);
        $product1 = Product::create(['category_id' => $category->id, 'name' => 'P1', 'slug' => 'p1', 'price' => 500, 'is_active' => true]);
        $product2 = Product::create(['category_id' => $category->id, 'name' => 'P2', 'slug' => 'p2', 'price' => 500, 'is_active' => true]);
        
        RecentlyViewedProduct::create(['user_id' => $user1->id, 'product_id' => $product1->id, 'viewed_at' => now()]);
        RecentlyViewedProduct::create(['user_id' => $user2->id, 'product_id' => $product2->id, 'viewed_at' => now()]);
        
        $response = $this->actingAs($user1)->get('/recently-viewed');
        $response->assertStatus(200);
        
        $response->assertInertia(fn ($page) => $page
            ->component('Frontend/RecentlyViewed')
            ->has('products', 1)
            ->where('products.0.id', $product1->id)
        );
    }
    
    // ==========================================
    // 9. RELATED PRODUCTS
    // ==========================================
    public function test_related_products_exclude_current_and_inactive()
    {
        $category = Category::create(['name' => 'Decor', 'slug' => 'decor', 'is_active' => true]);
        $currentProduct = Product::create(['category_id' => $category->id, 'name' => 'Current', 'slug' => 'current', 'price' => 500, 'is_active' => true]);
        $relatedActive = Product::create(['category_id' => $category->id, 'name' => 'Related 1', 'slug' => 'r1', 'price' => 500, 'is_active' => true]);
        $relatedInactive = Product::create(['category_id' => $category->id, 'name' => 'Related 2', 'slug' => 'r2', 'price' => 500, 'is_active' => false]);
        
        $response = $this->get('/product/' . $currentProduct->slug);
        
        $response->assertInertia(fn ($page) => $page
            ->component('Frontend/ProductDetail')
            ->has('similarProducts', 1)
            ->where('similarProducts.0.id', $relatedActive->id)
        );
    }
}
