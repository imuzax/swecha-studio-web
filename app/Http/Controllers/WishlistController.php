<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Wishlist;
use Illuminate\Http\Request;
use Inertia\Inertia;

class WishlistController extends Controller
{
    public function index(Request $request)
    {
        $wishlistedProducts = Product::with('images', 'category')
            ->whereHas('wishlistedBy', function ($q) use ($request) {
                $q->where('user_id', $request->user()->id);
            })
            ->where('is_active', true)
            ->get();
            
        // Map is_wishlisted = true for the frontend
        $wishlistedProducts->map(function($product) {
            $product->is_wishlisted = true;
            return $product;
        });

        return Inertia::render('Frontend/Wishlist', [
            'wishlistedProducts' => $wishlistedProducts
        ]);
    }

    public function toggle(Request $request, Product $product)
    {
        $userId = $request->user()->id;
        
        $wishlist = Wishlist::where('user_id', $userId)
            ->where('product_id', $product->id)
            ->first();

        if ($wishlist) {
            $wishlist->delete();
            return redirect()->back()->with('success', 'Removed from wishlist.');
        } else {
            Wishlist::create([
                'user_id' => $userId,
                'product_id' => $product->id
            ]);
            
            \App\Models\ProductActivity::create([
                'product_id' => $product->id,
                'user_id' => $userId,
                'type' => 'wishlist_add',
                'quantity' => 1
            ]);

            return redirect()->back()->with('success', 'Added to wishlist.');
        }
    }
}
