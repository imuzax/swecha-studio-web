<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $query = Order::with('user')->latest();

        // Search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('order_number', 'like', "%{$search}%")
                  ->orWhereHas('user', function ($uq) use ($search) {
                      $uq->where('name', 'like', "%{$search}%")
                         ->orWhere('email', 'like', "%{$search}%")
                         ->orWhere('phone', 'like', "%{$search}%");
                  });
            });
        }

        // Filters
        if ($request->filled('status')) {
            $query->where('order_status', $request->status);
        }
        if ($request->filled('payment')) {
            $query->where('payment_status', $request->payment);
        }

        $orders = $query->paginate(15)
            ->withQueryString()
            ->through(fn($order) => [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'customer' => $order->user ? $order->user->name : 'Guest',
                'status' => $order->order_status,
                'payment_status' => $order->payment_status,
                'total' => '₹' . number_format($order->total, 2),
                'created_at' => $order->created_at->format('d M Y, h:i A'),
            ]);

        return Inertia::render('Admin/Orders/Index', [
            'orders' => $orders,
            'filters' => $request->only(['search', 'status', 'payment']),
        ]);
    }

    public function show(Order $order)
    {
        $order->load(['user', 'items.product']);

        $shippingAddress = $order->shipping_address;
        $extractedPhone = null;
        if (preg_match('/Phone:\s*([^\n]+)/', $shippingAddress, $matches)) {
            $extractedPhone = trim($matches[1]);
        }

        return Inertia::render('Admin/Orders/Show', [
            'order' => [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'status' => $order->order_status,
                'payment_status' => $order->payment_status,
                'payment_method' => $order->payment_method,
                'subtotal' => $order->subtotal,
                'shipping_cost' => $order->shipping_cost,
                'discount' => $order->discount,
                'total' => $order->total,
                'shipping_address' => $order->shipping_address,
                'billing_address' => $order->billing_address,
                'notes' => $order->notes,
                'courier_name' => $order->courier_name,
                'tracking_number' => $order->tracking_number,
                'tracking_url' => $order->tracking_url,
                'created_at' => $order->created_at->format('d M Y, h:i A'),
                'customer' => $order->user ? [
                    'name' => $order->user->name,
                    'email' => $order->user->email,
                    'phone' => $extractedPhone ?? ($order->user->phone ?? 'N/A')
                ] : [
                    'name' => 'Guest',
                    'email' => 'N/A',
                    'phone' => $extractedPhone ?? 'N/A'
                ],
                'advance_required' => $order->advance_required,
                'amount_paid' => $order->amount_paid,
                'balance_due' => $order->balance_due,
                'items' => $order->items->map(fn($item) => [
                    'id' => $item->id,
                    'product_name' => $item->product_name,
                    'quantity' => $item->quantity,
                    'price' => $item->price_at_purchase,
                    'subtotal' => $item->line_total,
                    'variant_info' => $item->variant_info,
                    'customization_info' => $item->customization_info,
                ])
            ]
        ]);
    }

    public function update(Request $request, Order $order)
    {
        $validated = $request->validate([
            'order_status' => 'sometimes|required|string|in:pending,processing,shipped,delivered,cancelled',
            'payment_status' => 'sometimes|required|string|in:pending,paid,failed,refunded',
            'amount_paid' => 'nullable|numeric|min:0',
            'courier_name' => 'nullable|string|max:255',
            'tracking_number' => 'nullable|string|max:255',
            'tracking_url' => 'nullable|url|max:255',
        ]);

        $newOrderStatus = $validated['order_status'] ?? $order->order_status;
        $statusRequiresStockDeduction = in_array($newOrderStatus, ['processing', 'shipped', 'delivered']);

        try {
            \Illuminate\Support\Facades\DB::transaction(function () use ($order, $validated, $newOrderStatus, $statusRequiresStockDeduction) {
                // Lock and refresh the order record to guarantee concurrency safety
                $order = Order::lockForUpdate()->with('items')->findOrFail($order->id);

                // If it needs deduction and hasn't been deducted yet
                if ($statusRequiresStockDeduction && !$order->is_stock_deducted) {
                    foreach ($order->items as $item) {
                        if (!empty($item->variant_info) && isset($item->variant_info['id'])) {
                            $stockModel = \App\Models\ProductVariant::lockForUpdate()->find($item->variant_info['id']);
                        } else {
                            $stockModel = \App\Models\Product::lockForUpdate()->find($item->product_id);
                        }

                        if (!$stockModel || $stockModel->stock_quantity < $item->quantity) {
                            throw new \Exception("Insufficient stock for {$item->product_name}. Available: " . ($stockModel ? $stockModel->stock_quantity : 0));
                        }

                        $stockModel->stock_quantity -= $item->quantity;
                        $stockModel->save();

                        // Increment sales count for the product
                        $product = \App\Models\Product::find($item->product_id);
                        if ($product) {
                            $product->increment('sales_count', $item->quantity);
                        }
                    }
                    $order->is_stock_deducted = true;
                }

                // If order is cancelled and stock was previously deducted, restore stock and decrement sales count
                if ($newOrderStatus === 'cancelled' && $order->is_stock_deducted) {
                    foreach ($order->items as $item) {
                        if (!empty($item->variant_info) && isset($item->variant_info['id'])) {
                            $stockModel = \App\Models\ProductVariant::lockForUpdate()->find($item->variant_info['id']);
                        } else {
                            $stockModel = \App\Models\Product::lockForUpdate()->find($item->product_id);
                        }

                        if ($stockModel) {
                            $stockModel->stock_quantity += $item->quantity;
                            $stockModel->save();
                        }

                        $product = \App\Models\Product::find($item->product_id);
                        if ($product) {
                            $product->decrement('sales_count', min($product->sales_count, $item->quantity));
                        }
                    }
                    $order->is_stock_deducted = false;
                }

                if (isset($validated['amount_paid'])) {
                    if ($validated['amount_paid'] > $order->total) {
                        throw new \Exception("Amount paid cannot exceed the total order amount.");
                    }
                    $order->amount_paid = $validated['amount_paid'];
                    $order->balance_due = max(0, $order->total - $order->amount_paid);
                    if ($order->balance_due <= 0 && (!isset($validated['payment_status']) || $validated['payment_status'] === 'pending')) {
                        $validated['payment_status'] = 'paid';
                    }
                }
                
                if (isset($validated['payment_status'])) {
                    $order->payment_status = $validated['payment_status'];
                    unset($validated['payment_status']);
                }
                
                if (isset($validated['order_status'])) {
                    $order->order_status = $validated['order_status'];
                    unset($validated['order_status']);
                }
                
                unset($validated['amount_paid']);
                $order->update($validated);
            });
        } catch (\Exception $e) {
            return redirect()->back()->with('error', $e->getMessage());
        }

        return redirect()->back()->with('success', 'Order updated successfully.');
    }
}
