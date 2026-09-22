<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CustomerController extends Controller
{
    public function index(Request $request)
    {
        $query = User::where('is_admin', false)->withCount('orders');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        $customers = $query->latest()
            ->paginate(15)
            ->withQueryString()
            ->through(fn($user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone ?? 'N/A',
                'orders_count' => $user->orders_count,
                'joined_at' => $user->created_at->format('d M Y'),
            ]);

        return Inertia::render('Admin/Customers/Index', [
            'customers' => $customers,
            'filters' => $request->only('search')
        ]);
    }

    public function show(User $customer)
    {
        if ($customer->is_admin) {
            abort(404);
        }

        $customer->load('addresses');
        
        $orders = $customer->orders()
            ->latest()
            ->paginate(10)
            ->through(fn($order) => [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'date' => $order->created_at->format('d M Y, h:i A'),
                'total' => $order->total,
                'order_status' => $order->order_status,
                'payment_status' => $order->payment_status,
                'amount_paid' => $order->amount_paid,
            ]);

        return Inertia::render('Admin/Customers/Show', [
            'customer' => [
                'id' => $customer->id,
                'name' => $customer->name,
                'email' => $customer->email,
                'phone' => $customer->phone ?? 'N/A',
                'joined_at' => $customer->created_at->format('d M Y'),
                'addresses' => $customer->addresses,
            ],
            'orders' => $orders
        ]);
    }
}
