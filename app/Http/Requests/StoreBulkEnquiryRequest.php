<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreBulkEnquiryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'required|string|max:20',
            'product_id' => 'nullable|exists:products,id',
            'reference_info' => 'nullable|string|max:255',
            'requested_quantity' => 'required|integer|min:1',
            'customization_requirements' => 'nullable|string',
            'message' => 'nullable|string'
        ];
    }
}
