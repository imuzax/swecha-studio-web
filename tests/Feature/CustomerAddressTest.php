<?php

namespace Tests\Feature;

use App\Models\Address;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class CustomerAddressTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    public function test_unauthenticated_user_cannot_access_addresses()
    {
        $response = $this->get(route('addresses.index'));
        $response->assertRedirect(route('login'));
    }

    public function test_authenticated_user_can_view_their_addresses()
    {
        $user = User::factory()->create();
        Address::factory()->create(['user_id' => $user->id]);

        $response = $this->actingAs($user)->get(route('addresses.index'));
        $response->assertStatus(200);
    }

    public function test_user_can_add_new_address()
    {
        $user = User::factory()->create();
        $payload = [
            'type' => 'shipping',
            'name' => 'John Doe',
            'phone' => '1234567890',
            'address_line_1' => '123 Main St',
            'city' => 'Anytown',
            'state' => 'State',
            'pincode' => '123456',
            'is_default' => true,
        ];

        $response = $this->actingAs($user)->post(route('addresses.store'), $payload);
        $response->assertRedirect(route('addresses.index'));

        $this->assertDatabaseHas('addresses', [
            'user_id' => $user->id,
            'name' => 'John Doe',
            'is_default' => true,
        ]);
    }

    public function test_user_can_update_their_address()
    {
        $user = User::factory()->create();
        $address = Address::factory()->create(['user_id' => $user->id]);

        $payload = [
            'type' => 'shipping',
            'name' => 'Updated Name',
            'phone' => '1234567890',
            'address_line_1' => '123 Main St',
            'city' => 'Anytown',
            'state' => 'State',
            'pincode' => '123456',
            'is_default' => false,
        ];

        $response = $this->actingAs($user)->put(route('addresses.update', $address), $payload);
        $response->assertRedirect(route('addresses.index'));

        $this->assertDatabaseHas('addresses', [
            'id' => $address->id,
            'name' => 'Updated Name',
        ]);
    }

    public function test_user_cannot_update_another_users_address()
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();
        $address = Address::factory()->create(['user_id' => $user1->id]);

        $payload = [
            'type' => 'shipping',
            'name' => 'Hacked Name',
            'phone' => '1234567890',
            'address_line_1' => '123 Main St',
            'city' => 'Anytown',
            'state' => 'State',
            'pincode' => '123456',
            'is_default' => false,
        ];

        $response = $this->actingAs($user2)->put(route('addresses.update', $address), $payload);
        $response->assertStatus(403);

        $this->assertDatabaseMissing('addresses', [
            'id' => $address->id,
            'name' => 'Hacked Name',
        ]);
    }

    public function test_user_can_delete_their_address()
    {
        $user = User::factory()->create();
        $address = Address::factory()->create(['user_id' => $user->id]);

        $response = $this->actingAs($user)->delete(route('addresses.destroy', $address));
        $response->assertRedirect(route('addresses.index'));

        $this->assertDatabaseMissing('addresses', [
            'id' => $address->id,
        ]);
    }

    public function test_user_cannot_delete_another_users_address()
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();
        $address = Address::factory()->create(['user_id' => $user1->id]);

        $response = $this->actingAs($user2)->delete(route('addresses.destroy', $address));
        $response->assertStatus(403);

        $this->assertDatabaseHas('addresses', [
            'id' => $address->id,
        ]);
    }

    public function test_setting_default_address_unsets_other_defaults()
    {
        $user = User::factory()->create();
        $address1 = Address::factory()->create(['user_id' => $user->id, 'is_default' => true]);
        $address2 = Address::factory()->create(['user_id' => $user->id, 'is_default' => false]);

        $response = $this->actingAs($user)->put(route('addresses.setDefault', $address2));
        $response->assertRedirect(route('addresses.index'));

        $this->assertEquals(0, $address1->fresh()->is_default);
        $this->assertEquals(1, $address2->fresh()->is_default);
    }
}
