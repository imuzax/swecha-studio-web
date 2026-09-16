<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class CategoryManagementTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('public');
    }

    public function test_admin_can_create_category_with_valid_image()
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $file = UploadedFile::fake()->create('category.jpg', 600, 'image/jpeg');

        $response = $this->actingAs($admin)->post('/admin/categories', [
            'name' => 'Test Category',
            'is_active' => true,
            'image' => $file,
        ]);

        $response->assertRedirect(route('admin.categories.index'));
        $category = Category::where('name', 'Test Category')->first();
        $this->assertNotNull($category->image);
        Storage::disk('public')->assertExists($category->image);
    }

    public function test_invalid_image_type_is_rejected()
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $file = UploadedFile::fake()->create('document.pdf', 100, 'application/pdf');

        $response = $this->actingAs($admin)->post('/admin/categories', [
            'name' => 'Test Category',
            'is_active' => true,
            'image' => $file,
        ]);

        $response->assertSessionHasErrors('image');
        $this->assertDatabaseMissing('categories', ['name' => 'Test Category']);
    }

    public function test_oversized_image_is_rejected()
    {
        $admin = User::factory()->create(['is_admin' => true]);
        // 21000 kilobytes = 21MB, max is 20480KB (20MB)
        $file = UploadedFile::fake()->create('large.jpg', 21000, 'image/jpeg');

        $response = $this->actingAs($admin)->post('/admin/categories', [
            'name' => 'Test Category',
            'is_active' => true,
            'image' => $file,
        ]);

        $response->assertSessionHasErrors('image');
    }

    public function test_admin_can_update_category_with_replacement_image()
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $oldFile = UploadedFile::fake()->create('old.jpg', 100, 'image/jpeg');
        $oldPath = $oldFile->store('categories', 'public');
        
        $category = Category::create([
            'name' => 'Existing Category',
            'slug' => 'existing-category',
            'is_active' => true,
            'image' => $oldPath,
        ]);

        $newFile = UploadedFile::fake()->create('new.jpg', 100, 'image/jpeg');

        $response = $this->actingAs($admin)->put('/admin/categories/' . $category->id, [
            'name' => 'Updated Category',
            'is_active' => true,
            'image' => $newFile,
        ]);

        $response->assertRedirect(route('admin.categories.index'));
        
        $category->refresh();
        $this->assertNotEquals($oldPath, $category->image);
        Storage::disk('public')->assertExists($category->image);
        Storage::disk('public')->assertMissing($oldPath);
    }

    public function test_existing_image_remains_when_no_replacement_is_supplied()
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $oldFile = UploadedFile::fake()->create('old.jpg', 100, 'image/jpeg');
        $oldPath = $oldFile->store('categories', 'public');
        
        $category = Category::create([
            'name' => 'Existing Category',
            'slug' => 'existing-category',
            'is_active' => true,
            'image' => $oldPath,
        ]);

        $response = $this->actingAs($admin)->put('/admin/categories/' . $category->id, [
            'name' => 'Updated Category',
            'is_active' => true,
        ]);

        $response->assertRedirect(route('admin.categories.index'));
        
        $category->refresh();
        $this->assertEquals($oldPath, $category->image);
        Storage::disk('public')->assertExists($oldPath);
    }

    public function test_category_deletion_removes_image()
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $oldFile = UploadedFile::fake()->create('old.jpg', 100, 'image/jpeg');
        $oldPath = $oldFile->store('categories', 'public');
        
        $category = Category::create([
            'name' => 'Existing Category',
            'slug' => 'existing-category',
            'is_active' => true,
            'image' => $oldPath,
        ]);

        $response = $this->actingAs($admin)->delete('/admin/categories/' . $category->id);

        $response->assertRedirect(route('admin.categories.index'));
        $this->assertDatabaseMissing('categories', ['id' => $category->id]);
        Storage::disk('public')->assertMissing($oldPath);
    }

    public function test_inactive_category_is_excluded_from_shared_active_categories()
    {
        Category::create(['name' => 'Active Cat', 'slug' => 'active-cat', 'is_active' => true]);
        Category::create(['name' => 'Inactive Cat', 'slug' => 'inactive-cat', 'is_active' => false]);

        $response = $this->get('/');
        
        $response->assertStatus(200);
        $page = $response->viewData('page');
        
        $activeCategories = $page['props']['active_categories'];
        
        $this->assertContains('Active Cat', collect($activeCategories)->pluck('name'));
        $this->assertNotContains('Inactive Cat', collect($activeCategories)->pluck('name'));
    }

    public function test_category_sort_order_is_respected()
    {
        Category::create(['name' => 'Cat B', 'slug' => 'cat-b', 'is_active' => true, 'sort_order' => 2]);
        Category::create(['name' => 'Cat A', 'slug' => 'cat-a', 'is_active' => true, 'sort_order' => 1]);

        $response = $this->get('/');
        
        $page = $response->viewData('page');
        $activeCategories = $page['props']['active_categories'];
        
        $this->assertEquals('Cat A', $activeCategories[0]['name']);
        $this->assertEquals('Cat B', $activeCategories[1]['name']);
    }
}
