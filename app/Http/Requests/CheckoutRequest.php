<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CheckoutRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check(); // Phase 2.3 requirement: authenticated customer only
    }

    public function rules(): array
    {
        return [
            'address_id' => 'nullable|exists:addresses,id',
            'first_name' => 'required_without:address_id|string|max:255|nullable',
            'last_name' => 'required_without:address_id|string|max:255|nullable',
            'email' => 'required_without:address_id|email|max:255|nullable',
            'phone' => 'required_without:address_id|string|max:20|nullable',
            'address_line_1' => 'required_without:address_id|string|max:255|nullable',
            'address_line_2' => 'nullable|string|max:255',
            'city' => 'required_without:address_id|string|max:255|nullable',
            'state' => 'required_without:address_id|string|max:255|nullable',
            'postal_code' => 'required_without:address_id|string|max:20|nullable',
            'country' => 'required_without:address_id|string|max:255|nullable',
            'payment_method' => 'required|string|in:whatsapp,razorpay',
            'razorpay_payment_id' => 'required_if:payment_method,razorpay|string|nullable',
            'razorpay_order_id' => 'required_if:payment_method,razorpay|string|nullable',
            'razorpay_signature' => 'required_if:payment_method,razorpay|string|nullable',
        ];
    }
}
