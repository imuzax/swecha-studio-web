<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SettingsController extends Controller
{
    public function index()
    {
        $settings = Setting::pluck('value', 'key')->toArray();

        // Provide defaults if not set
        $defaultSettings = [
            'site_name' => 'Swecha Studio',
            'support_email' => 'support@swechastudio.com',
            'support_phone' => '+91 0000000000',
            'address' => 'Surat, Gujarat, India',
            'whatsapp_number' => '+910000000000',
            'instagram_link' => 'https://instagram.com/swechastudio',
            'facebook_link' => 'https://facebook.com/swechastudio',
            'twitter_link' => 'https://twitter.com/swechastudio',
            'delivery_charge' => '50',
            'currency_symbol' => '₹',
        ];

        $settings = array_merge($defaultSettings, $settings);

        return Inertia::render('Admin/Settings/Index', [
            'settings' => $settings
        ]);
    }

    public function update(Request $request)
    {
        $allowedTextSettings = [
            'site_name', 'support_email', 'support_phone', 'address', 
            'whatsapp_number', 'instagram_link', 'facebook_link', 
            'twitter_link', 'delivery_charge', 'currency_symbol'
        ];
        $mediaFields = ['site_logo', 'site_favicon', 'hero_media', 'about_media', 'instagram_media_1', 'instagram_media_2', 'instagram_media_3', 'instagram_media_4'];
        
        $data = $request->only($allowedTextSettings);

        // Handle regular text settings
        foreach ($data as $key => $value) {
            Setting::updateOrCreate(
                ['key' => $key],
                ['value' => $value]
            );
        }

        // Handle File Uploads
        $request->validate([
            'site_logo' => 'nullable|file|mimes:jpeg,png,jpg,webp,gif,bmp,avif,heic|max:10240',
            'site_favicon' => 'nullable|file|mimes:jpeg,png,ico,webp,gif|max:2048',
            'hero_media' => 'nullable|file|mimes:jpeg,png,jpg,webp,gif,bmp,avif,heic,mp4,webm|max:51200',
            'about_media' => 'nullable|file|mimes:jpeg,png,jpg,webp,gif,bmp,avif,heic,mp4,webm|max:51200',
            'instagram_media_1' => 'nullable|file|mimes:jpeg,png,jpg,webp,gif,bmp,avif,heic,mp4,webm|max:51200',
            'instagram_media_2' => 'nullable|file|mimes:jpeg,png,jpg,webp,gif,bmp,avif,heic,mp4,webm|max:51200',
            'instagram_media_3' => 'nullable|file|mimes:jpeg,png,jpg,webp,gif,bmp,avif,heic,mp4,webm|max:51200',
            'instagram_media_4' => 'nullable|file|mimes:jpeg,png,jpg,webp,gif,bmp,avif,heic,mp4,webm|max:51200',
        ]);

        foreach ($mediaFields as $field) {
            if ($request->hasFile($field)) {
                $oldSetting = Setting::where('key', $field)->first();
                if ($oldSetting && $oldSetting->value) {
                    \Illuminate\Support\Facades\Storage::disk('public')->delete($oldSetting->value);
                }
                $path = $request->file($field)->store('settings', 'public');
                Setting::updateOrCreate(
                    ['key' => $field],
                    ['value' => $path]
                );
            }
        }

        return redirect()->back()->with('success', 'Site settings updated successfully.');
    }
}
