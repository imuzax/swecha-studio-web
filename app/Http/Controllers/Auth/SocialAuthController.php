<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Laravel\Socialite\Facades\Socialite;
use Inertia\Inertia;
use Illuminate\Support\Str;

class SocialAuthController extends Controller
{
    public function redirect()
    {
        return Socialite::driver('google')->redirect();
    }

    public function callback(Request $request)
    {
        try {
            $googleUser = Socialite::driver('google')->user();
        } catch (\Exception $e) {
            return redirect()->route('login')->with('error', 'Google authentication failed or was cancelled.');
        }

        if (!$googleUser->getEmail()) {
            return redirect()->route('login')->with('error', 'We need an email address to authenticate you.');
        }

        // Case A: Exact google_id match
        $userByGoogleId = User::where('google_id', $googleUser->getId())->first();
        if ($userByGoogleId) {
            Auth::login($userByGoogleId);
            $request->session()->regenerate();
            return redirect()->intended(route('dashboard', absolute: false));
        }

        // Check if email exists
        $userByEmail = User::where('email', $googleUser->getEmail())->first();

        if ($userByEmail) {
            // Case C & D: Email exists, but google_id is NULL or different
            // Do NOT automatically link. Require password.
            session(['oauth_pending_link' => [
                'email' => $googleUser->getEmail(),
                'google_id' => $googleUser->getId(),
                'avatar' => $googleUser->getAvatar(),
            ]]);
            return redirect()->route('oauth.link.show');
        }

        // Case B: New user
        $newUser = User::create([
            'name' => $googleUser->getName() ?? 'Google User',
            'email' => $googleUser->getEmail(),
            'google_id' => $googleUser->getId(),
            'avatar' => $googleUser->getAvatar(),
            'password' => Hash::make(Str::random(32)), // Secure random password
            'email_verified_at' => now(),
            // is_admin will default to false securely
        ]);

        Auth::login($newUser);
        $request->session()->regenerate();

        return redirect()->intended(route('dashboard', absolute: false));
    }

    public function showLinkAccount()
    {
        if (!session()->has('oauth_pending_link')) {
            return redirect()->route('login');
        }
        
        $email = session('oauth_pending_link')['email'];

        return Inertia::render('Auth/LinkAccount', [
            'email' => $email
        ]);
    }

    public function linkAccount(Request $request)
    {
        $request->validate([
            'password' => 'required',
        ]);

        if (!session()->has('oauth_pending_link')) {
            return redirect()->route('login');
        }

        $pending = session('oauth_pending_link');
        $user = User::where('email', $pending['email'])->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return back()->withErrors(['password' => 'Incorrect password.']);
        }

        $user->update([
            'google_id' => $pending['google_id'],
            'avatar' => $user->avatar ?? $pending['avatar'],
        ]);

        session()->forget('oauth_pending_link');

        Auth::login($user);
        $request->session()->regenerate();

        return redirect()->intended(route('dashboard', absolute: false));
    }
}
