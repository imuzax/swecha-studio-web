<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\Setting;
use App\Models\User;
use App\Models\BulkEnquiry;
use App\Models\Product;

class BulkEnquiryTest extends TestCase
{
    use RefreshDatabase;

    public function test_bulk_enquiry_can_be_submitted()
    {
        Setting::create(['key' => 'whatsapp_number', 'value' => '919876543210']);

        $response = $this->postJson(route('bulk-enquiries.store'), [
            'name' => 'John Doe',
            'phone' => '9876543210',
            'email' => 'john@example.com',
            'reference_info' => 'Wavy Tray',
            'requested_quantity' => 10,
            'message' => 'Need this in custom blue.'
        ]);

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true
        ]);
        
        // Assert whatsapp_url contains encoded text
        $this->assertStringContainsString('https://wa.me/919876543210', $response->json('whatsapp_url'));
        $this->assertStringContainsString('John', $response->json('whatsapp_url'));
        $this->assertStringContainsString('10', $response->json('whatsapp_url'));
        $this->assertStringContainsString('blue', $response->json('whatsapp_url'));

        $this->assertDatabaseHas('bulk_enquiries', [
            'name' => 'John Doe',
            'phone' => '9876543210',
            'reference_info' => 'Wavy Tray',
            'status' => 'pending'
        ]);
    }

    public function test_bulk_enquiry_captures_auth_user()
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->postJson(route('bulk-enquiries.store'), [
            'name' => 'John Doe',
            'phone' => '9876543210',
        ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('bulk_enquiries', [
            'name' => 'John Doe',
            'user_id' => $user->id,
        ]);
    }
}
