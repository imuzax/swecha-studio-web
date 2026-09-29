<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FrontendController extends Controller
{
    public function home()
    {
        // 1. Trending (Activity in last 30 days, must have activity)
        $trendingProducts = Product::with('images', 'category')
            ->where('is_active', true)
            ->withCount(['activities as recent_activity' => function($q) {
                $q->where('created_at', '>=', now()->subDays(30));
            }])
            ->having('recent_activity', '>', 0)
            ->orderByDesc('recent_activity')
            ->take(8)
            ->get();

        $trendingIds = $trendingProducts->pluck('id')->toArray();

        // 2. Popular (lifetime sales, must have sales, avoid duplicates)
        $popularProducts = Product::with('images', 'category')
            ->where('is_active', true)
            ->where('sales_count', '>', 0)
            ->whereNotIn('id', $trendingIds)
            ->orderByDesc('sales_count')
            ->take(8)
            ->get();

        $usedIds = array_merge($trendingIds, $popularProducts->pluck('id')->toArray());

        // 3. Most Viewed (avoid duplicates)
        $mostViewedProducts = Product::with('images', 'category')
            ->where('is_active', true)
            ->where('views_count', '>', 0)
            ->whereNotIn('id', $usedIds)
            ->orderByDesc('views_count')
            ->take(8)
            ->get();

        $usedIds = array_merge($usedIds, $mostViewedProducts->pluck('id')->toArray());

        // 4. New Arrivals (avoid duplicates)
        $newArrivals = Product::with('images', 'category')
            ->where('is_active', true)
            ->whereNotIn('id', $usedIds)
            ->latest()
            ->take(8)
            ->get();

        $userId = auth()->id();
        if ($userId) {
            $allIds = $trendingProducts->pluck('id')
                ->concat($popularProducts->pluck('id'))
                ->concat($mostViewedProducts->pluck('id'))
                ->concat($newArrivals->pluck('id'))
                ->unique();
                
            $wishlistedIds = \App\Models\Wishlist::where('user_id', $userId)
                ->whereIn('product_id', $allIds)
                ->pluck('product_id')
                ->toArray();
            
            $addWishlistFlag = function($product) use ($wishlistedIds) {
                $product->is_wishlisted = in_array($product->id, $wishlistedIds);
                return $product;
            };

            $trendingProducts->transform($addWishlistFlag);
            $popularProducts->transform($addWishlistFlag);
            $mostViewedProducts->transform($addWishlistFlag);
            $newArrivals->transform($addWishlistFlag);
        }

        $totalProductCount = Product::where('is_active', true)->count();
        $categories = Category::withCount(['products' => function ($query) {
            $query->where('is_active', true);
        }])->where('is_active', true)->orderBy('sort_order')->orderBy('name')->get();

        return Inertia::render('Frontend/Home', [
            'trendingProducts' => $trendingProducts,
            'popularProducts' => $popularProducts,
            'mostViewedProducts' => $mostViewedProducts,
            'newArrivals' => $newArrivals,
            'categories' => $categories,
            'totalProductCount' => $totalProductCount,
        ]);
    }

    public function shop(Request $request)
    {
        $query = Product::with('images', 'category')->where('is_active', true);

        // Search Query
        $isSearch = false;
        $searchQuery = null;
        if ($request->filled('q')) {
            $isSearch = true;
            $searchQuery = trim($request->q);
            $query->where(function($sub) use ($searchQuery) {
                $sub->where('name', 'like', '%' . $searchQuery . '%')
                    ->orWhere('short_description', 'like', '%' . $searchQuery . '%')
                    ->orWhere('full_description', 'like', '%' . $searchQuery . '%');
            });
        }

        // Category Filter
        if ($request->filled('category')) {
            $query->whereHas('category', function($q) use ($request) {
                $q->where('slug', $request->category);
            });
        }

        // Price Min/Max (calculating with effective selling price)
        if ($request->filled('min') && is_numeric($request->min)) {
            $query->whereRaw("COALESCE(NULLIF(sale_price, 0), price) >= ?", [floatval($request->min)]);
        }
        if ($request->filled('max') && is_numeric($request->max)) {
            $query->whereRaw("COALESCE(NULLIF(sale_price, 0), price) <= ?", [floatval($request->max)]);
        }

        // Custom Poured / Made to Order
        if ($request->filled('made_to_order') && ($request->made_to_order === '1' || $request->made_to_order === true || $request->made_to_order === 'true')) {
            $query->where('is_made_to_order', true);
        }

        // Sort
        if ($request->filled('sort')) {
            switch ($request->sort) {
                case 'latest':
                    $query->latest();
                    break;
                case 'price_asc':
                    $query->orderByRaw('COALESCE(NULLIF(sale_price, 0), price) ASC');
                    break;
                case 'price_desc':
                    $query->orderByRaw('COALESCE(NULLIF(sale_price, 0), price) DESC');
                    break;
                case 'popular':
                default:
                    $query->orderByDesc('sales_count')->latest();
                    break;
            }
        } else {
            $query->orderByDesc('sales_count')->latest();
        }

        $products = $query->paginate(12)->withQueryString();

        $categories = Category::withCount(['products' => function ($query) {
            $query->where('is_active', true);
        }])->where('is_active', true)->orderBy('sort_order')->orderBy('name')->get();
        $totalAvailable = Product::where('is_active', true)->count();

        // If it's a search, maybe fetch similar products
        $similarProducts = collect();
        if ($isSearch && $products->isEmpty()) {
            $similarProducts = Product::with('images', 'category')
                ->where('is_active', true)
                ->orderBy('sales_count', 'desc')
                ->take(4)
                ->get();
        }

        $userId = auth()->id();
        if ($userId) {
            $allIds = $products->pluck('id')->concat($similarProducts->pluck('id'))->unique();
            $wishlistedIds = \App\Models\Wishlist::where('user_id', $userId)
                ->whereIn('product_id', $allIds)
                ->pluck('product_id')
                ->toArray();
            
            $products->getCollection()->transform(function($product) use ($wishlistedIds) {
                $product->is_wishlisted = in_array($product->id, $wishlistedIds);
                return $product;
            });

            if ($similarProducts->isNotEmpty()) {
                $similarProducts->transform(function($product) use ($wishlistedIds) {
                    $product->is_wishlisted = in_array($product->id, $wishlistedIds);
                    return $product;
                });
            }
        }

        return Inertia::render('Frontend/Shop', [
            'products' => $products,
            'categories' => $categories,
            'filters' => $request->only(['category', 'q', 'min', 'max', 'made_to_order', 'sort']),
            'isSearch' => $isSearch,
            'searchQuery' => $searchQuery,
            'totalAvailable' => $totalAvailable,
            'similarProducts' => $similarProducts
        ]);
    }

    public function productDetail($slug)
    {
        $product = Product::with([
            'images', 
            'category', 
            'variants' => function($q) { $q->where('is_active', true); },
            'customizations.options'
        ])
            ->where('is_active', true)
            ->where('slug', $slug)
            ->firstOrFail();

        $userId = auth()->id();
        $sessionId = session()->getId();
        $isWishlisted = false;

        if ($userId) {
            // Check if wishlisted
            $isWishlisted = \App\Models\Wishlist::where('user_id', $userId)
                ->where('product_id', $product->id)
                ->exists();
        }

        // Session-based throttling for views and activity with 30-minute cooldown
        $viewedProducts = session()->get('viewed_products', []);
        $now = now();
        $cooldownMinutes = 30;
        $canRecordView = true;
        
        if (isset($viewedProducts[$product->id])) {
            $lastViewed = \Carbon\Carbon::parse($viewedProducts[$product->id]);
            if ($now->diffInMinutes($lastViewed) < $cooldownMinutes) {
                $canRecordView = false;
            }
        }
        
        if ($canRecordView) {
            // Increment total views safely
            $product->increment('views_count');
            
            // Record product activity (view)
            \App\Models\ProductActivity::create([
                'product_id' => $product->id,
                'user_id' => $userId,
                'session_id' => $userId ? null : $sessionId,
                'type' => 'view',
                'quantity' => 1
            ]);
            
            $viewedProducts[$product->id] = $now->toDateTimeString();
            session()->put('viewed_products', $viewedProducts);
        }

        // Record recently viewed (auth or guest) - always update timestamp
        $recentQuery = \App\Models\RecentlyViewedProduct::where('product_id', $product->id);
        if ($userId) {
            $recentQuery->where('user_id', $userId);
        } else {
            $recentQuery->where('session_id', $sessionId)->whereNull('user_id');
        }

        $recentRecord = $recentQuery->first();
            
        if ($recentRecord) {
            $recentRecord->update(['viewed_at' => now()]);
        } else {
            \App\Models\RecentlyViewedProduct::create([
                'user_id' => $userId,
                'session_id' => $userId ? null : $sessionId,
                'product_id' => $product->id,
                'viewed_at' => now()
            ]);
        }

        // Get similar products
        $similarProductsQuery = Product::with('images', 'category')
            ->where('is_active', true)
            ->where('category_id', $product->category_id)
            ->where('id', '!=', $product->id);

        $similarProducts = $similarProductsQuery
            ->orderByDesc('sales_count')
            ->orderByDesc('views_count')
            ->take(4)
            ->get();

        if ($userId) {
            // Append wishlisted status to similar products
            $wishlistedIds = \App\Models\Wishlist::where('user_id', $userId)
                ->whereIn('product_id', $similarProducts->pluck('id'))
                ->pluck('product_id')
                ->toArray();
            
            foreach ($similarProducts as $sp) {
                $sp->is_wishlisted = in_array($sp->id, $wishlistedIds);
            }
        }

        return Inertia::render('Frontend/ProductDetail', [
            'product' => $product,
            'similarProducts' => $similarProducts,
            'isWishlisted' => $isWishlisted
        ]);
    }
}
