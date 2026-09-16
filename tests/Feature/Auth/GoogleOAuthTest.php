<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Socialite\Facades\Socialite;
use Tests\TestCase;

class GoogleOAuthTest extends TestCase
{
    use RefreshDatabase;

    protected function mockGoogleUser($email, $googleId = '123456789', $name = 'Google User')
    {
        $abstractUser = \Mockery::mock('Laravel\Socialite\Two\User');
        $abstractUser->shouldReceive('getId')->andReturn($googleId);
        $abstractUser->shouldReceive('getName')->andReturn($name);
        $abstractUser->shouldReceive('getEmail')->andReturn($email);
        $abstractUser->shouldReceive('getAvatar')->andReturn('avatar.jpg');

        $provider = \Mockery::mock('Laravel\Socialite\Contracts\Provider');
        $provider->shouldReceive('user')->andReturn($abstractUser);

        Socialite::shouldReceive('driver')->with('google')->andReturn($provider);
    }

    protected function mockGoogleError()
    {
        $provider = \Mockery::mock('Laravel\Socialite\Contracts\Provider');
        $provider->shouldReceive('user')->andThrow(new \Exception('Google API Error'));

        Socialite::shouldReceive('driver')->with('google')->andReturn($provider);
    }

    public function test_google_redirect_route_works()
    {
        $response = $this->get('/auth/google');
        $response->assertRedirectContains('accounts.google.com');
    }

    public function test_existing_user_with_matching_google_id_can_log_in()
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'google_id' => '123456789',
        ]);

        $this->mockGoogleUser('test@example.com', '123456789');

        $response = $this->get('/auth/google/callback');
        $response->assertRedirect(route('dashboard'));
        $this->assertAuthenticatedAs($user);
    }

    public function test_new_google_user_is_created_as_normal_customer()
    {
        $this->mockGoogleUser('newuser@example.com', '987654321');

        $response = $this->get('/auth/google/callback');
        
        $this->assertDatabaseHas('users', [
            'email' => 'newuser@example.com',
            'google_id' => '987654321',
            'is_admin' => 0,
        ]);

        $response->assertRedirect(route('dashboard'));
        $this->assertAuthenticated();
    }

    public function test_existing_email_without_google_id_cannot_be_silently_linked()
    {
        User::factory()->create([
            'email' => 'existing@example.com',
            'google_id' => null,
            'password' => Hash::make('password123'),
        ]);

        $this->mockGoogleUser('existing@example.com', '55555');

        $response = $this->get('/auth/google/callback');
        
        // Should redirect to link account page
        $response->assertRedirect(route('oauth.link.show'));
        $this->assertGuest();
        
        $this->assertTrue(session()->has('oauth_pending_link'));
    }

    public function test_existing_email_can_securely_link_google_after_password_auth()
    {
        $user = User::factory()->create([
            'email' => 'existing2@example.com',
            'google_id' => null,
            'password' => Hash::make('password123'),
        ]);

        $this->mockGoogleUser('existing2@example.com', '66666');

        $this->get('/auth/google/callback');

        // Submit link form
        $response = $this->post('/auth/google/link', [
            'password' => 'password123',
        ]);

        $response->assertRedirect(route('dashboard'));
        $this->assertAuthenticatedAs($user);
        
        $this->assertDatabaseHas('users', [
            'email' => 'existing2@example.com',
            'google_id' => '66666',
        ]);
        
        $this->assertFalse(session()->has('oauth_pending_link'));
    }

    public function test_google_callback_errors_are_handled_safely()
    {
        $this->mockGoogleError();

        $response = $this->get('/auth/google/callback');
        $response->assertRedirect(route('login'));
        $response->assertSessionHas('error', 'Google authentication failed or was cancelled.');
    }

    public function test_missing_google_email_is_rejected_safely()
    {
        $this->mockGoogleUser(null, '77777');

        $response = $this->get('/auth/google/callback');
        $response->assertRedirect(route('login'));
        $response->assertSessionHas('error', 'We need an email address to authenticate you.');
    }

    public function test_existing_email_password_auth_still_works()
    {
        $user = User::factory()->create([
            'email' => 'regular@example.com',
            'password' => Hash::make('password123'),
        ]);

        $response = $this->post('/login', [
            'email' => 'regular@example.com',
            'password' => 'password123',
        ]);

        $this->assertAuthenticatedAs($user);
        $response->assertRedirect(route('dashboard'));
    }
}
