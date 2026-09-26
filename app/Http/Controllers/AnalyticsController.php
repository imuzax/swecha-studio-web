<?php

namespace App\Http\Controllers;

use App\Models\AnalyticsEvent;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AnalyticsController extends Controller
{
    public function track(Request $request)
    {
        $request->validate([
            'event_name' => 'required|string|in:page_view,whatsapp_click,product_view,add_to_cart,checkout_started,payment_failure,payment_initiated,workshop_view,whatsapp_workshop_click,payment_success,whatsapp_checkout',
            'url' => 'nullable|string|max:1000',
            'properties' => 'nullable|array',
        ]);

        $sessionId = session()->getId();
        if (!$sessionId) {
            session()->start();
            $sessionId = session()->getId();
        }

        AnalyticsEvent::create([
            'event_name' => $request->event_name,
            'user_id' => auth()->id(),
            'session_id' => $sessionId,
            'url' => $request->url ?? url()->previous(),
            'ip_address' => $request->ip(),
            'user_agent' => Str::limit($request->userAgent(), 1000),
            'properties' => $request->properties,
        ]);

        return response()->json(['status' => 'recorded']);
    }
}
