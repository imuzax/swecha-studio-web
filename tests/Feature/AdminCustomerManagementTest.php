<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\Order;
use App\Models\Address;

class AdminCustomerManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_view_customers_list()
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $customer = User::factory()->create(['is_admin' => false]);

        $response = $this->actingAs($admin)->get('/admin/customers');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/Customers/Index')
            ->has('customers.data', 1)
        );
    }

    public function test_admin_can_search_customers()
    {
        $admin = User::factory()->create(['is_admin' => true]);
        User::factory()->create(['name' => 'Alice Doe', 'email' => 'alice@example.com']);
        User::factory()->create(['name' => 'Bob Smith', 'email' => 'bob@example.com']);

        $response = $this->actingAs($admin)->get('/admin/customers?search=alice');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/Customers/Index')
            ->has('customers.data', 1)
            ->where('customers.data.0.name', 'Alice Doe')
        );
    }

    public function test_admin_can_view_customer_details()
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $customer = User::factory()->create(['is_admin' => false]);

        $order = Order::create([
            'user_id' => $customer->id,
            'order_number' => 'ORD-123',
            'order_status' => 'pending',
            'payment_status' => 'pending',
            'payment_method' => 'cash',
            'shipping_address' => json_encode(['address_line_1' => '123 Main St']),
            'billing_address' => json_encode(['address_line_1' => '123 Main St']),
            'subtotal' => 100,
            'total' => 100,
            'amount_paid' => 0,
            'balance_due' => 100,
            'advance_required' => 0
        ]);
        $address = Address::create([
            'user_id' => $customer->id,
            'name' => 'John Doe',
            'phone' => '1234567890',
            'address_line_1' => '123 Main St',
            'city' => 'Anytown',
            'state' => 'CA',
            'pincode' => '123456'
        ]);

        $response = $this->actingAs($admin)->get('/admin/customers/' . $customer->id);

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/Customers/Show')
            ->has('customer.addresses', 1)
            ->has('orders.data', 1)
        );
    }

    public function test_admin_cannot_view_another_admin_in_customer_details()
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $otherAdmin = User::factory()->create(['is_admin' => true]);

        $response = $this->actingAs($admin)->get('/admin/customers/' . $otherAdmin->id);

        $response->assertStatus(404);
    }
}
