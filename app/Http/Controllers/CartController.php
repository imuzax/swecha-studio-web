<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CartController extends Controller
{
    public function index()
    {
        $cart = session()->get('cart', []);
        
        if (!empty($cart)) {
            $productIds = array_column($cart, 'id');
            $products = Product::with(['variants', 'customizations.options'])
                ->whereIn('id', $productIds)
                ->get()
                ->keyBy('id');

            // Ensure authoritative pricing from DB and purge invalid/inactive items
            foreach ($cart as $key => &$item) {
                $product = $products->get($item['id']);
                if ($product && $product->is_active) {
                    try {
                        $item['price'] = $product->calculatePrice($item['variant_id'] ?? null, $item['customizations'] ?? []);
                        $item['key'] = $key;
                    } catch (\Exception $e) {
                        unset($cart[$key]);
                        continue;
                    }
                } else {
                    unset($cart[$key]);
                }
            }
            session()->put('cart', $cart);
        }

        $total = array_reduce($cart, function($carry, $item) {
            return $carry + ($item['price'] * $item['quantity']);
        }, 0);

        return Inertia::render('Frontend/Cart', [
            'cart' => array_values($cart), // Return as simple array
            'total' => $total
        ]);
    }

    public function add(Request $request, Product $product)
    {
        if (!$product->is_active) {
            return redirect()->back()->withErrors(['product' => 'This product is currently unavailable.']);
        }

        $request->validate([
            'quantity' => 'required|integer|min:1',
            'customizations' => 'nullable|array',
            'buy_now' => 'nullable|boolean'
        ]);

        $variantId = $request->variant_id ?? null;
        $customizations = $request->customizations ?? [];

        // Validate Variant
        if ($variantId) {
            $variant = $product->variants()->find($variantId);
            if (!$variant || !$variant->is_active) {
                return redirect()->back()->withErrors(['variant' => 'Invalid or inactive variant selected.']);
            }
        } else {
            // If product has variants, require one to be selected
            if ($product->variants()->where('is_active', true)->exists()) {
                return redirect()->back()->withErrors(['variant' => 'Please select a variant.']);
            }
        }

        // Validate Customizations
        if (!empty($customizations)) {
            $options = \App\Models\CustomizationOption::whereIn('id', $customizations)->get();
            if ($options->count() !== count($customizations)) {
                return redirect()->back()->withErrors(['customization' => 'Invalid customization options.']);
            }
            foreach ($options as $option) {
                if (!$product->customizations()->where('customization_id', $option->customization_id)->exists()) {
                    return redirect()->back()->withErrors(['customization' => 'Customization not valid for this product.']);
                }
            }
        }

        $cart = session()->get('cart', []);

        // Use a unique key based on product, variant, and customizations
        sort($customizations);
        $key = $product->id . '-' . $variantId . '-' . implode('-', $customizations);

        $existingQuantity = isset($cart[$key]) ? $cart[$key]['quantity'] : 0;
        $newQuantity = $existingQuantity + $request->quantity;

        // Stock validation
        $availableStock = isset($variant) && $variant ? $variant->stock_quantity : $product->stock_quantity;
        if ($newQuantity > $availableStock) {
            return redirect()->back()->withErrors(['quantity' => "Not enough stock available. Only {$availableStock} left."]);
        }

        if (isset($cart[$key])) {
            $cart[$key]['quantity'] = $newQuantity;
            $cart[$key]['key'] = $key;
        } else {
            try {
                $calculatedPrice = $product->calculatePrice($variantId, $customizations);
            } catch (\Exception $e) {
                return redirect()->back()->withErrors(['error' => 'Invalid configuration.']);
            }

            $cart[$key] = [
                'key' => $key,
                'id' => $product->id,
                'variant_id' => $variantId,
                'customizations' => $customizations,
                'name' => $product->name,
                'price' => $calculatedPrice,
                'quantity' => $request->quantity,
                'slug' => $product->slug,
                'image' => $product->images->count() > 0 ? $product->images[0]->path : null
            ];
        }

        session()->put('cart', $cart);

        // Record activity
        if (auth()->check()) {
            \App\Models\ProductActivity::create([
                'product_id' => $product->id,
                'user_id' => auth()->id(),
                'type' => 'cart_add',
                'quantity' => $request->quantity
            ]);
        }

        if ($request->boolean('buy_now')) {
            return redirect()->route('checkout.index');
        }

        return redirect()->back()->with('success', 'Product added to cart successfully!');
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'quantity' => 'required|integer|min:1'
        ]);

        $cart = session()->get('cart', []);

        // Match by exact key first
        $targetKey = isset($cart[$id]) ? $id : null;
        if (!$targetKey) {
            foreach ($cart as $k => $item) {
                if (($item['key'] ?? null) === $id) {
                    $targetKey = $k;
                    break;
                }
            }
        }

        if ($targetKey && isset($cart[$targetKey])) {
            $productId = $cart[$targetKey]['id'];
            $product = \App\Models\Product::find($productId);
            
            if (!$product || !$product->is_active) {
                unset($cart[$targetKey]);
                session()->put('cart', $cart);
                return redirect()->back()->withErrors(['error' => 'Product is no longer available.']);
            }

            $variantId = $cart[$targetKey]['variant_id'] ?? null;
            $variant = $variantId ? $product->variants()->find($variantId) : null;
            $availableStock = $variant ? $variant->stock_quantity : $product->stock_quantity;

            if ($request->quantity > $availableStock) {
                return redirect()->back()->withErrors(['quantity' => "Cannot update quantity. Only {$availableStock} available in stock."]);
            }

            $cart[$targetKey]['quantity'] = $request->quantity;
            $cart[$targetKey]['key'] = $targetKey;
            session()->put('cart', $cart);
        }

        return redirect()->back()->with('success', 'Cart updated successfully');
    }

    public function remove($id)
    {
        $cart = session()->get('cart', []);

        $targetKey = isset($cart[$id]) ? $id : null;
        if (!$targetKey) {
            foreach ($cart as $k => $item) {
                if (($item['key'] ?? null) === $id) {
                    $targetKey = $k;
                    break;
                }
            }
        }

        if ($targetKey && isset($cart[$targetKey])) {
            unset($cart[$targetKey]);
            session()->put('cart', $cart);
        }

        return redirect()->back()->with('success', 'Product removed from cart');
    }
}
