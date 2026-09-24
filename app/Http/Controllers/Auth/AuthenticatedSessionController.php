<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        $oldSessionId = $request->session()->getId();
        $request->session()->regenerate();
        
        $userId = $request->user()->id;
        
        // Merge recently viewed products
        $recentProducts = \App\Models\RecentlyViewedProduct::where('session_id', $oldSessionId)->get();
        foreach ($recentProducts as $rp) {
            $existing = \App\Models\RecentlyViewedProduct::where('user_id', $userId)
                ->where('product_id', $rp->product_id)
                ->first();
                
            if ($existing) {
                if ($rp->viewed_at > $existing->viewed_at) {
                    $existing->update(['viewed_at' => $rp->viewed_at]);
                }
                $rp->delete();
            } else {
                $rp->update([
                    'user_id' => $userId,
                    'session_id' => null
                ]);
            }
        }
        
        // Merge product activities
        \App\Models\ProductActivity::where('session_id', $oldSessionId)->update([
            'user_id' => $userId,
            'session_id' => null
        ]);

        return redirect()->intended(route('dashboard', absolute: false));
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect('/');
    }
}
