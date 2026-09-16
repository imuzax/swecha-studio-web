<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;
use App\Models\User;
use App\Models\Setting;

class AdminSettingsTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_update_settings_with_logo()
    {
        Storage::fake('public');
        
        $admin = User::factory()->create(['is_admin' => true]);

        $response = $this->actingAs($admin)->post('/admin/settings', [
            'site_name' => 'New Store Name',
            'site_logo' => UploadedFile::fake()->create('logo.png', 10, 'image/png'),
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('settings', [
            'key' => 'site_name',
            'value' => 'New Store Name',
        ]);

        $logoSetting = Setting::where('key', 'site_logo')->first();
        $this->assertNotNull($logoSetting);
        Storage::disk('public')->assertExists($logoSetting->value);
    }

    public function test_admin_can_update_settings_with_favicon()
    {
        Storage::fake('public');
        $admin = User::factory()->create(['is_admin' => true]);

        $response = $this->actingAs($admin)->post('/admin/settings', [
            'site_favicon' => UploadedFile::fake()->create('favicon.png', 5, 'image/png'),
        ]);

        $response->assertRedirect();
        $faviconSetting = Setting::where('key', 'site_favicon')->first();
        $this->assertNotNull($faviconSetting);
        Storage::disk('public')->assertExists($faviconSetting->value);
    }

    public function test_invalid_file_types_are_rejected()
    {
        $admin = User::factory()->create(['is_admin' => true]);

        $response = $this->actingAs($admin)->post('/admin/settings', [
            'site_logo' => UploadedFile::fake()->create('document.pdf', 10, 'application/pdf'),
            'site_favicon' => UploadedFile::fake()->create('document.pdf', 5, 'application/pdf'),
        ]);

        $response->assertSessionHasErrors(['site_logo', 'site_favicon']);
    }

    public function test_oversized_files_are_rejected()
    {
        $admin = User::factory()->create(['is_admin' => true]);

        $response = $this->actingAs($admin)->post('/admin/settings', [
            'site_logo' => UploadedFile::fake()->create('logo.png', 11000, 'image/png'), // 11MB (limit is 10240KB = 10MB)
            'site_favicon' => UploadedFile::fake()->create('favicon.png', 2500, 'image/png'), // 2.5MB (limit is 2048KB = 2MB)
        ]);

        $response->assertSessionHasErrors(['site_logo', 'site_favicon']);
    }

    public function test_non_admin_cannot_modify_settings()
    {
        $customer = User::factory()->create(['is_admin' => false]);

        $response = $this->actingAs($customer)->post('/admin/settings', [
            'site_name' => 'Hacked Name',
        ]);

        $response->assertStatus(403);
    }

    public function test_existing_logo_replacement_deletes_old_file()
    {
        Storage::fake('public');
        $admin = User::factory()->create(['is_admin' => true]);

        // First upload
        $this->actingAs($admin)->post('/admin/settings', [
            'site_logo' => UploadedFile::fake()->create('old_logo.png', 10, 'image/png'),
        ]);

        $oldSetting = Setting::where('key', 'site_logo')->first();
        $oldPath = $oldSetting->value;
        Storage::disk('public')->assertExists($oldPath);

        // Second upload
        $this->actingAs($admin)->post('/admin/settings', [
            'site_logo' => UploadedFile::fake()->create('new_logo.png', 10, 'image/png'),
        ]);

        $newSetting = Setting::where('key', 'site_logo')->first();
        $newPath = $newSetting->value;
        Storage::disk('public')->assertExists($newPath);

        // Old file should be deleted
        Storage::disk('public')->assertMissing($oldPath);
    }
}
