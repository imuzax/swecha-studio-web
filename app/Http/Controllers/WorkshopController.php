<?php

namespace App\Http\Controllers;

use App\Models\Workshop;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Setting;

class WorkshopController extends Controller
{
    public function index()
    {
        $workshops = Workshop::where('is_active', true)
            ->with(['dates' => function($q) {
                $q->where('date', '>=', now()->toDateString())->orderBy('date');
            }])
            ->latest()
            ->get();
            
        return Inertia::render('Frontend/Workshops/Index', [
            'workshops' => $workshops,
            'whatsappNumber' => Setting::where('key', 'whatsapp_number')->first()?->value ?? ''
        ]);
    }

    public function show($slug)
    {
        $workshop = Workshop::where('slug', $slug)
            ->where('is_active', true)
            ->with(['images', 'dates' => function($q) {
                $q->where('date', '>=', now()->toDateString())->orderBy('date');
            }])
            ->firstOrFail();
            
        return Inertia::render('Frontend/Workshops/Detail', [
            'workshop' => $workshop,
            'whatsappNumber' => Setting::where('key', 'whatsapp_number')->first()?->value ?? ''
        ]);
    }
}
