<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminVariantTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->admin = User::factory()->create(['is_admin' => true]);
        $this->category = Category::factory()->create();
        $this->product = Product::factory()->create(['category_id' => $this->category->id]);
    }

    public function test_admin_can_add_variant_to_product()
    {
        $data = [
            'type' => 'Size',
            'value' => 'XL',
            'sku' => 'TEST-XL',
            'price_adjustment' => 50,
            'stock_quantity' => 10,
            'is_active' => true
        ];

        $response = $this->actingAs($this->admin)->post(route('admin.products.variants.store', $this->product->id), $data);
        
        $response->assertRedirect();
        $this->assertDatabaseHas('product_variants', [
            'product_id' => $this->product->id,
            'sku' => 'TEST-XL',
            'value' => 'XL',
            'price_adjustment' => 50
        ]);
    }

    public function test_admin_can_update_variant()
    {
        $variant = $this->product->variants()->create([
            'type' => 'Size',
            'value' => 'L',
            'price_adjustment' => 0,
            'stock_quantity' => 5,
            'is_active' => true
        ]);

        $data = [
            'type' => 'Size',
            'value' => 'L',
            'sku' => 'TEST-L-UPDATED',
            'price_adjustment' => 25,
            'stock_quantity' => 15,
            'is_active' => false
        ];

        $response = $this->actingAs($this->admin)->put(route('admin.products.variants.update', [$this->product->id, $variant->id]), $data);
        
        $response->assertRedirect();
        $this->assertDatabaseHas('product_variants', [
            'id' => $variant->id,
            'sku' => 'TEST-L-UPDATED',
            'price_adjustment' => 25,
            'is_active' => false
        ]);
    }

    public function test_admin_can_delete_variant()
    {
        $variant = $this->product->variants()->create([
            'type' => 'Color',
            'value' => 'Red',
            'price_adjustment' => 0,
            'stock_quantity' => 5,
            'is_active' => true
        ]);

        $response = $this->actingAs($this->admin)->delete(route('admin.products.variants.destroy', [$this->product->id, $variant->id]));

        $response->assertRedirect();
        $this->assertDatabaseMissing('product_variants', ['id' => $variant->id]);
    }
}
