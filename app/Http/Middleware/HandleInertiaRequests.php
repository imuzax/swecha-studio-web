<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $cart = session()->get('cart', []);
        $cartCount = array_reduce($cart, function($carry, $item) {
            return $carry + $item['quantity'];
        }, 0);
        $cartSubtotal = array_reduce($cart, function($carry, $item) {
            return $carry + ($item['price'] * $item['quantity']);
        }, 0);

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user(),
            ],
            'cart' => array_values($cart),
            'cart_subtotal' => $cartSubtotal,
            'cart_count' => $cartCount,
            'flash' => [
                'success' => session('success'),
                'error' => session('error'),
            ],
            'site_settings' => \App\Models\Setting::pluck('value', 'key')->toArray(),
            'active_categories' => \App\Models\Category::where('is_active', true)
                ->orderBy('sort_order')
                ->orderBy('name')
                ->select('id', 'name', 'slug', 'image')
                ->get(),
        ];
    }
}
