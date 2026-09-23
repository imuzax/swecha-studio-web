<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Customization;
use Illuminate\Http\Request;

class CustomizationController extends Controller
{
    public function index()
    {
        $customizations = Customization::with('options')->get();
        return response()->json($customizations);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|string|max:50',
            'description' => 'nullable|string',
            'is_active' => 'boolean'
        ]);

        $customization = Customization::create($data);

        return redirect()->back()->with('success', 'Customization created.');
    }

    public function update(Request $request, Customization $customization)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|string|max:50',
            'description' => 'nullable|string',
            'is_active' => 'boolean'
        ]);

        $customization->update($data);

        return redirect()->back()->with('success', 'Customization updated.');
    }
}
