<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Setting;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Tests\TestCase;

class AdminSettingsSecurityTest extends TestCase
{
    use RefreshDatabase;

    protected $admin;
    protected $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->admin = User::factory()->create(['is_admin' => true]);
        $this->user = User::factory()->create(['is_admin' => false]);
    }

    public function test_non_admin_cannot_update_settings()
    {
        $response = $this->actingAs($this->user)->post(route('admin.settings.update'), [
            'site_name' => 'Hacked Name'
        ]);

        $response->assertStatus(403);
    }

    public function test_admin_cannot_mass_assign_unallowed_keys()
    {
        $response = $this->actingAs($this->admin)->post(route('admin.settings.update'), [
            'site_name' => 'Valid Name',
            'injected_malicious_key' => 'hacked_value'
        ]);

        $response->assertRedirect();
        
        $this->assertDatabaseHas('settings', [
            'key' => 'site_name',
            'value' => 'Valid Name'
        ]);
        
        $this->assertDatabaseMissing('settings', [
            'key' => 'injected_malicious_key'
        ]);
    }

    public function test_admin_cannot_upload_svg_due_to_xss_risk()
    {
        $svgFile = UploadedFile::fake()->create('malicious.svg', 100, 'image/svg+xml');

        $response = $this->actingAs($this->admin)->post(route('admin.settings.update'), [
            'site_logo' => $svgFile
        ]);

        $response->assertSessionHasErrors('site_logo');
        $this->assertDatabaseMissing('settings', [
            'key' => 'site_logo'
        ]);
    }
}
