<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        event(new Registered($user));

        $oldSessionId = $request->session()->getId();

        Auth::login($user);

        // Merge recently viewed products
        $userId = $user->id;
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

        $request->session()->regenerate();

        return redirect()->intended(route('dashboard', absolute: false));
    }
}
