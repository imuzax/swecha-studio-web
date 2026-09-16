<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminCategoryTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->admin = User::factory()->create(['is_admin' => true]);
        $this->customer = User::factory()->create(['is_admin' => false]);
    }

    public function test_admin_can_view_categories_list()
    {
        Category::factory()->count(3)->create();

        $response = $this->actingAs($this->admin)->get(route('admin.categories.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('Admin/Categories/Index'));
    }

    public function test_non_admin_cannot_access_categories()
    {
        $response = $this->actingAs($this->customer)->get(route('admin.categories.index'));
        $response->assertStatus(403);
    }

    public function test_admin_can_create_category()
    {
        $data = [
            'name' => 'Test Category',
            'is_active' => true,
            'seo_title' => 'SEO Title',
            'seo_description' => 'SEO Description'
        ];

        $response = $this->actingAs($this->admin)->post(route('admin.categories.store'), $data);

        $response->assertRedirect(route('admin.categories.index'));
        $this->assertDatabaseHas('categories', [
            'name' => 'Test Category',
            'slug' => 'test-category',
            'seo_title' => 'SEO Title'
        ]);
    }

    public function test_category_requires_unique_name()
    {
        Category::factory()->create(['name' => 'Existing Category']);

        $data = [
            'name' => 'Existing Category',
            'is_active' => true
        ];

        $response = $this->actingAs($this->admin)->post(route('admin.categories.store'), $data);

        $response->assertSessionHasErrors('name');
    }

    public function test_cannot_delete_category_with_products()
    {
        $category = Category::factory()->create();
        Product::factory()->create(['category_id' => $category->id]);

        $response = $this->actingAs($this->admin)->delete(route('admin.categories.destroy', $category->id));

        $response->assertRedirect();
        $response->assertSessionHas('error', 'Cannot delete category with associated products.');
        $this->assertDatabaseHas('categories', ['id' => $category->id]);
    }

    public function test_can_delete_empty_category()
    {
        $category = Category::factory()->create();

        $response = $this->actingAs($this->admin)->delete(route('admin.categories.destroy', $category->id));

        $response->assertRedirect(route('admin.categories.index'));
        $this->assertDatabaseMissing('categories', ['id' => $category->id]);
    }
}
