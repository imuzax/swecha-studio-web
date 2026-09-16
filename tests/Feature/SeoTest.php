<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SeoTest extends TestCase
{
    use RefreshDatabase;

    public function test_sitemap_contains_active_product_and_category_urls()
    {
        $category = Category::create([
            'name' => 'Active Cat', 
            'slug' => 'active-cat',
            'is_active' => true
        ]);
        
        $inactiveCategory = Category::create([
            'name' => 'Inactive Cat', 
            'slug' => 'inactive-cat',
            'is_active' => false
        ]);
        
        $product = Product::create([
            'name' => 'Active Product',
            'slug' => 'active-product',
            'category_id' => $category->id,
            'price' => 100,
            'stock_quantity' => 10,
            'is_active' => true
        ]);
        
        $inactiveProduct = Product::create([
            'name' => 'Inactive Product',
            'slug' => 'inactive-product',
            'category_id' => $category->id,
            'price' => 100,
            'stock_quantity' => 10,
            'is_active' => false
        ]);

        $response = $this->get('/sitemap.xml');
        $response->assertStatus(200);
        $response->assertHeader('Content-Type', 'text/xml; charset=UTF-8');
        
        $response->assertSee(url('/shop?category=active-cat'));
        $response->assertSee(url('/product/active-product'));
        
        // Excludes inactive product and category
        $response->assertDontSee(url('/product/inactive-product'));
        $response->assertDontSee(url('/shop?category=inactive-cat'));
    }

    public function test_robots_txt_exists_and_is_correct()
    {
        $path = public_path('robots.txt');
        $this->assertFileExists($path);
        
        $content = file_get_contents($path);
        $this->assertStringContainsString('User-agent: *', $content);
        $this->assertStringContainsString('Disallow: /admin/', $content);
        $this->assertStringContainsString('Sitemap:', $content);
    }
}
