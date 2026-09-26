<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Http\Request;

class ProductVariantController extends Controller
{
    public function store(Request $request, Product $product)
    {
        $data = $request->validate([
            'type' => 'required|string|max:50',
            'value' => 'required|string|max:100',
            'sku' => 'nullable|string|max:100',
            'price_adjustment' => 'required|numeric',
            'stock_quantity' => 'required|integer|min:0',
            'is_active' => 'boolean',
        ]);

        $product->variants()->create($data);

        return redirect()->back()->with('success', 'Variant added successfully.');
    }

    public function update(Request $request, Product $product, ProductVariant $variant)
    {
        if ($variant->product_id !== $product->id) {
            abort(404);
        }

        $data = $request->validate([
            'type' => 'required|string|max:50',
            'value' => 'required|string|max:100',
            'sku' => 'nullable|string|max:100',
            'price_adjustment' => 'required|numeric',
            'stock_quantity' => 'required|integer|min:0',
            'is_active' => 'boolean',
        ]);

        $variant->update($data);

        return redirect()->back()->with('success', 'Variant updated successfully.');
    }

    public function destroy(Product $product, ProductVariant $variant)
    {
        if ($variant->product_id !== $product->id) {
            abort(404);
        }

        // Add protection for ordered variants if necessary later, or just soft delete. 
        // For now, hard delete is standard unless orders are strictly tied (order_items usually store snapshot).
        $variant->delete();

        return redirect()->back()->with('success', 'Variant deleted successfully.');
    }
}
