<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Address;
use App\Http\Requests\CheckoutRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use App\Models\Setting;
use App\Models\AnalyticsEvent;

class CheckoutController extends Controller
{
    public function index()
    {
        $cart = session()->get('cart', []);
        
        if (empty($cart)) {
            return redirect()->route('shop')->with('error', 'Your cart is empty.');
        }

        $total = 0;
        $productIds = array_column($cart, 'id');
        $products = Product::with(['variants', 'customizations.options'])->whereIn('id', $productIds)->get()->keyBy('id');

        foreach ($cart as &$item) {
            $product = $products->get($item['id']);
            if (!$product || !$product->is_active) {
                return redirect()->route('cart.index')->with('error', 'One or more items in your cart are no longer available. Please review your cart.');
            }
            try {
                $item['price'] = $product->calculatePrice($item['variant_id'] ?? null, $item['customizations'] ?? []);
                $total += $item['price'] * $item['quantity'];
            } catch (\Exception $e) {
                return redirect()->route('cart.index')->with('error', 'Invalid product configuration detected in cart. Please remove invalid items.');
            }
        }

        $addresses = [];
        if (auth()->check()) {
            $addresses = auth()->user()->addresses;
        }

        return Inertia::render('Frontend/Checkout', [
            'cart' => array_values($cart),
            'total' => $total,
            'addresses' => $addresses
        ]);
    }

    public function process(CheckoutRequest $request)
    {
        $cart = session()->get('cart', []);
        
        if (empty($cart)) {
            return redirect()->route('shop');
        }

        $maxAttempts = 3;
        for ($attempt = 1; $attempt <= $maxAttempts; $attempt++) {
            try {
                return DB::transaction(function () use ($request, $cart) {
                    $total = 0;
                    $orderItemsData = [];
                    $productIds = array_column($cart, 'id');
                    
                    // Lock products for read/update to prevent race conditions during transaction
                    $products = Product::with(['variants', 'customizations.options'])->whereIn('id', $productIds)->lockForUpdate()->get()->keyBy('id');

                    // Pre-fetch all customization options across all cart items in a single query (optimization)
                    $allCustomizationIds = [];
                    foreach ($cart as $item) {
                        if (!empty($item['customizations'])) {
                            $allCustomizationIds = array_merge($allCustomizationIds, $item['customizations']);
                        }
                    }
                    $allCustomizationIds = array_unique($allCustomizationIds);
                    $customizationOptionsMap = !empty($allCustomizationIds)
                        ? \App\Models\CustomizationOption::with('customization')->whereIn('id', $allCustomizationIds)->get()->keyBy('id')
                        : collect();

            // Secure Calculation & Stock Validation
            foreach ($cart as $item) {
                $product = $products->get($item['id']);
                
                if (!$product || !$product->is_active) {
                    return redirect()->route('shop')->with('error', "Product {$item['name']} is no longer available.");
                }
                
                $variantModel = null;
                if (!empty($item['variant_id'])) {
                    $variantModel = $product->variants->firstWhere('id', $item['variant_id']);
                }
                
                $availableStock = $variantModel ? $variantModel->stock_quantity : $product->stock_quantity;

                if ($availableStock < $item['quantity']) {
                    return redirect()->route('cart.index')->with('error', "Not enough stock for {$product->name}. Only {$availableStock} left.");
                }

                try {
                    $price = $product->calculatePrice($item['variant_id'] ?? null, $item['customizations'] ?? []);
                } catch (\Exception $e) {
                    return redirect()->route('shop')->with('error', "Invalid configuration for {$product->name}.");
                }

                // Prepare Snapshot Data (using eager-loaded variant)
                $variantInfo = null;
                if ($variantModel) {
                    $variantInfo = [
                        'id' => $variantModel->id,
                        'type' => $variantModel->type,
                        'value' => $variantModel->value,
                        'price_adjustment' => $variantModel->price_adjustment,
                    ];
                }

                $customizationInfo = [];
                if (!empty($item['customizations'])) {
                    foreach ($item['customizations'] as $optId) {
                        $opt = $customizationOptionsMap->get($optId);
                        if ($opt) {
                            $customizationInfo[] = [
                                'id' => $opt->id,
                                'customization' => $opt->customization ? $opt->customization->name : '',
                                'option' => $opt->name,
                                'price_adjustment' => $opt->price_adjustment,
                            ];
                        }
                    }
                }

                $lineTotal = $price * $item['quantity'];
                $total += $lineTotal;

                $orderItemsData[] = [
                    'product_id' => $product->id,
                    'variant_id' => $variantModel ? $variantModel->id : null,
                    'product_name' => $product->name, // Snapshot
                    'quantity' => $item['quantity'],
                    'price_at_purchase' => $price,
                    'line_total' => $lineTotal,
                    'variant_info' => $variantInfo, // Snapshot array
                    'customization_info' => $customizationInfo, // Snapshot array
                ];
            }

            // Address Handling
            if ($request->filled('address_id')) {
                $address = Address::where('id', $request->address_id)->where('user_id', auth()->id())->firstOrFail();
                $formattedAddress = implode("\n", array_filter([
                    $address->name,
                    $address->address_line_1,
                    $address->address_line_2,
                    $address->city . ', ' . $address->state . ' - ' . $address->pincode,
                    'India',
                    'Phone: ' . $address->phone,
                    'Email: ' . auth()->user()->email
                ]));
            } else {
                $formattedAddress = implode("\n", array_filter([
                    $request->first_name . ' ' . $request->last_name,
                    $request->address_line_1,
                    $request->address_line_2,
                    $request->city . ', ' . $request->state . ' - ' . $request->postal_code,
                    $request->country,
                    'Phone: ' . $request->phone,
                    'Email: ' . $request->email
                ]));
                
                // Optionally save this new address for the user
                if (auth()->check()) {
                    Address::create([
                        'user_id' => auth()->id(),
                        'name' => $request->first_name . ' ' . $request->last_name,
                        'address_line_1' => $request->address_line_1,
                        'address_line_2' => $request->address_line_2,
                        'city' => $request->city,
                        'state' => $request->state,
                        'pincode' => $request->postal_code,
                        'phone' => $request->phone,
                        'is_default' => auth()->user()->addresses()->count() === 0
                    ]);
                }
            }

            $order = new Order();
            
            do {
                $orderNumber = 'ORD-' . strtoupper(Str::random(10));
            } while (Order::where('order_number', $orderNumber)->exists());
            
            $order->order_number = $orderNumber;
            $order->user_id = auth()->id() ?? null;
            $order->subtotal = $total;
            $order->shipping_cost = 0;
            $order->discount = 0;
            $order->total = $total;
            
            $order->order_status = 'pending';
            $order->payment_status = 'pending';
            $order->payment_method = 'whatsapp';
            $order->amount_paid = 0;
            $order->balance_due = $total;
            $order->advance_required = 0; // Removing 50% advance calc from flow
            
            $order->shipping_address = $formattedAddress;
            $order->billing_address = $formattedAddress;
            
            $order->save();

            // Create Order Items
            foreach ($orderItemsData as $data) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $data['product_id'],
                    'variant_id' => $data['variant_id'] ?? null,
                    'product_name' => $data['product_name'],
                    'quantity' => $data['quantity'],
                    'price_at_purchase' => $data['price_at_purchase'],
                    'line_total' => $data['line_total'],
                    'variant_info' => $data['variant_info'],
                    'customization_info' => $data['customization_info'],
                ]);
            }

            // Clear Cart & set session authorization for success page
            session()->forget('cart');
            session()->put('last_order', $order->order_number);

            AnalyticsEvent::create([
                'event_name' => 'whatsapp_checkout',
                'user_id' => auth()->id(),
                'session_id' => session()->getId(),
                'url' => route('checkout.process'),
                'ip_address' => $request->ip(),
                'user_agent' => substr($request->userAgent(), 0, 1000),
                'properties' => [
                    'order_number' => $order->order_number,
                    'total' => $total,
                    'payment_method' => $order->payment_method
                ]
            ]);

            return redirect()->route('order.success', $order->order_number);
        });
            } catch (\Illuminate\Database\QueryException $e) {
                // 1062 is MySQL duplicate entry, meaning order_number collision
                if (isset($e->errorInfo[1]) && $e->errorInfo[1] == 1062 && $attempt < $maxAttempts) {
                    continue; // Retry transaction and generate new number
                }
                throw $e; // Rethrow if max attempts reached or different error
            }
        }
    }

    public function success($orderNumber)
    {
        $order = Order::with('items')->where('order_number', $orderNumber)->firstOrFail();
        
        // Ensure ownership / privacy
        if (auth()->check() && auth()->id() !== $order->user_id) {
            abort(403, 'Unauthorized access to this order.');
        } elseif (!auth()->check() && session()->get('last_order') !== $orderNumber) {
            abort(403, 'Unauthorized access to this order.');
        }

        $whatsappNumber = Setting::where('key', 'whatsapp_number')->first()->value ?? '';
        
        return Inertia::render('Frontend/OrderSuccess', [
            'order' => $order,
            'whatsappNumber' => $whatsappNumber
        ]);
    }
}
