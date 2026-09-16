<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Category;
use App\Models\Product;
use App\Models\Customization;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminCustomizationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->admin = User::factory()->create(['is_admin' => true]);
        $this->category = Category::factory()->create();
        $this->product = Product::factory()->create(['category_id' => $this->category->id]);
    }

    public function test_admin_can_attach_customization_to_product()
    {
        $customization = Customization::create([
            'name' => 'Engraving',
            'type' => 'Text',
            'is_active' => true
        ]);

        $response = $this->actingAs($this->admin)->post(route('admin.products.customizations.attach', $this->product->id), [
            'customization_id' => $customization->id
        ]);
        
        $response->assertRedirect();
        
        $this->assertDatabaseHas('customization_product', [
            'product_id' => $this->product->id,
            'customization_id' => $customization->id
        ]);
    }

    public function test_admin_can_detach_customization_from_product()
    {
        $customization = Customization::create([
            'name' => 'Engraving',
            'type' => 'Text',
            'is_active' => true
        ]);

        $this->product->customizations()->attach($customization->id);

        $response = $this->actingAs($this->admin)->delete(route('admin.products.customizations.detach', [
            'product' => $this->product->id,
            'customization' => $customization->id
        ]));
        
        $response->assertRedirect();
        
        $this->assertDatabaseMissing('customization_product', [
            'product_id' => $this->product->id,
            'customization_id' => $customization->id
        ]);
    }
}
