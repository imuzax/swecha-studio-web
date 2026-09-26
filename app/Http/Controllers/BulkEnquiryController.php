<?php

namespace App\Http\Controllers;

use App\Models\BulkEnquiry;
use Illuminate\Http\Request;
use App\Models\Setting;
use Inertia\Inertia;

class BulkEnquiryController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'email' => 'nullable|email|max:255',
            'product_id' => 'nullable|exists:products,id,is_active,1',
            'reference_info' => 'nullable|string|max:255',
            'requested_quantity' => 'nullable|integer|min:1',
            'customization_requirements' => 'nullable|string|max:1000',
            'message' => 'nullable|string|max:2000',
        ]);

        $validated['user_id'] = auth()->id();
        $validated['status'] = 'pending';
        $validated['email'] = $validated['email'] ?? '';
        $validated['requested_quantity'] = $validated['requested_quantity'] ?? 1;

        $enquiry = BulkEnquiry::create($validated);

        // Fetch WhatsApp number
        $whatsappNumber = Setting::where('key', 'whatsapp_number')->first()->value ?? '';
        $whatsappNumber = preg_replace('/[^0-9]/', '', $whatsappNumber);

        // Format message
        $productText = $enquiry->product ? "Product: {$enquiry->product->name}" : ($enquiry->reference_info ? "Reference: {$enquiry->reference_info}" : "");
        
        $text = "Hi Swecha Studio,\n\nI have a bulk/custom enquiry.\n";
        $text .= "Name: {$enquiry->name}\n";
        if ($productText) $text .= "{$productText}\n";
        if ($enquiry->requested_quantity) $text .= "Quantity: {$enquiry->requested_quantity}\n";
        if ($enquiry->message) $text .= "Message: {$enquiry->message}\n";

        $whatsappUrl = "https://wa.me/{$whatsappNumber}?text=" . urlencode($text);

        return response()->json([
            'success' => true,
            'whatsapp_url' => $whatsappUrl
        ]);
    }
}
