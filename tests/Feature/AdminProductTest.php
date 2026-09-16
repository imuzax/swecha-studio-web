<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class AdminProductTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->admin = User::factory()->create(['is_admin' => true]);
        $this->category = Category::factory()->create();
    }

    public function test_admin_can_view_products_list_with_pagination()
    {
        Product::factory()->count(20)->create(['category_id' => $this->category->id]);

        $response = $this->actingAs($this->admin)->get(route('admin.products.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('Admin/Products/Index'));
        // It should paginate by 15
        $this->assertCount(15, $response->viewData('page')['props']['products']['data']);
    }

    public function test_admin_can_create_product_with_images()
    {
        Storage::fake('public');

        $data = [
            'name' => 'New Test Product',
            'category_id' => $this->category->id,
            'price' => 199.99,
            'stock_quantity' => 10,
            'sku' => 'TEST-001',
            'seo_title' => 'Test SEO',
            'is_active' => true,
            'images' => [
                UploadedFile::fake()->create('img1.jpg', 100, 'image/jpeg'),
                UploadedFile::fake()->create('img2.jpg', 100, 'image/jpeg'),
            ]
        ];

        $response = $this->actingAs($this->admin)->post(route('admin.products.store'), $data);

        $response->assertRedirect(route('admin.products.index'));
        $this->assertDatabaseHas('products', [
            'sku' => 'TEST-001',
            'name' => 'New Test Product',
            'seo_title' => 'Test SEO',
        ]);

        $product = Product::where('sku', 'TEST-001')->first();
        $this->assertCount(2, $product->images);
        $this->assertTrue((bool)$product->images()->first()->is_primary);
    }

    public function test_sku_must_be_unique()
    {
        Product::factory()->create(['sku' => 'UNIQUE-001', 'category_id' => $this->category->id]);

        $data = [
            'name' => 'Another Product',
            'category_id' => $this->category->id,
            'price' => 50,
            'stock_quantity' => 5,
            'sku' => 'UNIQUE-001'
        ];

        $response = $this->actingAs($this->admin)->post(route('admin.products.store'), $data);
        $response->assertSessionHasErrors('sku');
    }

    public function test_admin_can_delete_image()
    {
        Storage::fake('public');
        $product = Product::factory()->create(['category_id' => $this->category->id]);
        
        $image1 = $product->images()->create([
            'path' => 'products/img1.jpg',
            'is_primary' => true,
            'sort_order' => 0
        ]);
        
        $image2 = $product->images()->create([
            'path' => 'products/img2.jpg',
            'is_primary' => false,
            'sort_order' => 1
        ]);

        $response = $this->actingAs($this->admin)->delete(route('admin.products.images.destroy', [
            'product' => $product->id, 
            'image' => $image1->id
        ]));

        $response->assertRedirect();
        $this->assertDatabaseMissing('product_images', ['id' => $image1->id]);
        
        // Image 2 should become primary since image 1 was deleted
        $this->assertTrue((bool)$image2->fresh()->is_primary);
    }

    public function test_max_10_images_limit_on_update()
    {
        Storage::fake('public');
        $product = Product::factory()->create(['category_id' => $this->category->id]);
        
        for ($i = 0; $i < 9; $i++) {
            $product->images()->create([
                'path' => 'products/img' . $i . '.jpg',
                'is_primary' => $i === 0,
                'sort_order' => $i
            ]);
        }

        // Product has 9 images. Try to upload 2 more, which should fail (9 + 2 = 11)
        $data = [
            'name' => 'Updated Product',
            'category_id' => $this->category->id,
            'price' => 199.99,
            'stock_quantity' => 10,
            'images' => [
                UploadedFile::fake()->create('img10.jpg', 100, 'image/jpeg'),
                UploadedFile::fake()->create('img11.jpg', 100, 'image/jpeg'),
            ]
        ];

        $response = $this->actingAs($this->admin)->put(route('admin.products.update', $product->id), $data);
        $response->assertSessionHasErrors('images');
        
        $this->assertCount(9, $product->fresh()->images);
    }
}
