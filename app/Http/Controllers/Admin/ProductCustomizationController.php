<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Customization;
use Illuminate\Http\Request;

class ProductCustomizationController extends Controller
{
    public function attach(Request $request, Product $product)
    {
        $data = $request->validate([
            'customization_id' => 'required|exists:customizations,id',
        ]);

        $product->customizations()->syncWithoutDetaching([$data['customization_id']]);

        return redirect()->back()->with('success', 'Customization attached successfully.');
    }

    public function detach(Product $product, Customization $customization)
    {
        $product->customizations()->detach($customization->id);

        return redirect()->back()->with('success', 'Customization detached successfully.');
    }
}
