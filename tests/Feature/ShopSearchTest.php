<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use Inertia\Testing\AssertableInertia as Assert;

class ShopSearchTest extends TestCase
{
    use RefreshDatabase;

    public function test_shop_search_works_without_sql_errors()
    {
        $category = Category::factory()->create(['is_active' => true]);
        
        $product = Product::factory()->create([
            'name' => 'Unique Searchable Product',
            'is_active' => true,
            'category_id' => $category->id,
        ]);

        $response = $this->get('/shop?q=Unique');

        $response->assertStatus(200);
        
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Frontend/Shop')
            ->has('products.data', 1)
            ->where('products.data.0.name', 'Unique Searchable Product')
        );
    }
}
