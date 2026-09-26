<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\RecentlyViewedProduct;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RecentlyViewedController extends Controller
{
    public function index(Request $request)
    {
        $userId = auth()->id();
        $sessionId = session()->getId();

        $query = RecentlyViewedProduct::query();
        if ($userId) {
            $query->where('user_id', $userId);
        } else {
            $query->where('session_id', $sessionId)->whereNull('user_id');
        }

        $recentProductIds = $query->orderBy('viewed_at', 'desc')
            ->take(20)
            ->pluck('product_id');

        // Preserve order
        $products = collect();
        
        if ($recentProductIds->count() > 0) {
            $products = Product::with('images', 'category')
                ->whereIn('id', $recentProductIds)
                ->where('is_active', true)
                ->get()
                ->sortBy(function ($product) use ($recentProductIds) {
                    return array_search($product->id, $recentProductIds->toArray());
                })->values();
                
            // Check wishlist status
            if ($userId) {
                $wishlistedIds = \App\Models\Wishlist::where('user_id', $userId)
                    ->whereIn('product_id', $products->pluck('id'))
                    ->pluck('product_id')
                    ->toArray();
                    
                $products->map(function($product) use ($wishlistedIds) {
                    $product->is_wishlisted = in_array($product->id, $wishlistedIds);
                    return $product;
                });
            }
        }

        return Inertia::render('Frontend/RecentlyViewed', [
            'products' => $products
        ]);
    }
}
