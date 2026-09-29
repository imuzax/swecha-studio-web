<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Workshop;
use App\Models\WorkshopDate;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;

class WorkshopController extends Controller
{
    public function index()
    {
        $workshops = Workshop::with('dates')->latest()->get();
        return Inertia::render('Admin/Workshops/Index', ['workshops' => $workshops]);
    }

    public function create()
    {
        return Inertia::render('Admin/Workshops/Form', ['workshop' => new Workshop()]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'nullable|numeric|min:0',
            'is_active' => 'boolean',
            'dates' => 'nullable|array',
            'dates.*.date' => 'required|date',
            'dates.*.start_time' => 'nullable',
            'dates.*.end_time' => 'nullable',
            'dates.*.total_seats' => 'required|integer|min:0',
            'dates.*.taken_seats' => 'required|integer|min:0',
            'images' => 'nullable|array|max:10',
            'images.*' => 'file|mimes:jpeg,png,jpg,webp,gif,svg,bmp,avif,heic|max:51200',
        ]);

        $validated['slug'] = Str::slug($validated['title']) . '-' . uniqid();

        $workshop = Workshop::create(\Illuminate\Support\Arr::except($validated, ['dates', 'images']));

        if (!empty($validated['dates'])) {
            foreach ($validated['dates'] as $dateData) {
                $workshop->dates()->create($dateData);
            }
        }

        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $index => $image) {
                $path = $image->store('workshops', 'public');
                $workshop->images()->create([
                    'image_path' => $path,
                    'sort_order' => $index
                ]);
            }
        }

        return redirect()->route('admin.workshops.index')->with('success', 'Workshop created successfully.');
    }

    public function edit(Workshop $workshop)
    {
        $workshop->load(['dates', 'images']);
        return Inertia::render('Admin/Workshops/Form', ['workshop' => $workshop]);
    }

    public function update(Request $request, Workshop $workshop)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'nullable|numeric|min:0',
            'is_active' => 'boolean',
            'dates' => 'nullable|array',
            'dates.*.id' => 'nullable|integer',
            'dates.*.date' => 'required|date',
            'dates.*.start_time' => 'nullable',
            'dates.*.end_time' => 'nullable',
            'dates.*.total_seats' => 'required|integer|min:0',
            'dates.*.taken_seats' => 'required|integer|min:0',
            'images' => 'nullable|array|max:10',
            'images.*' => 'file|mimes:jpeg,png,jpg,webp,gif,svg,bmp,avif,heic|max:51200',
        ]);

        $workshop->update([
            'title' => $validated['title'],
            'description' => $validated['description'],
            'price' => $validated['price'],
            'is_active' => $validated['is_active'] ?? false,
        ]);

        // Sync dates
        $existingDateIds = [];
        if (!empty($validated['dates'])) {
            foreach ($validated['dates'] as $dateData) {
                if (isset($dateData['id'])) {
                    $existingDate = $workshop->dates()->find($dateData['id']);
                    if ($existingDate) {
                        if ($dateData['total_seats'] < $existingDate->taken_seats) {
                            return back()->withErrors(['dates' => 'Total seats cannot be less than already taken seats.']);
                        }
                        $existingDate->update([
                            'date' => $dateData['date'],
                            'start_time' => $dateData['start_time'] ?? null,
                            'end_time' => $dateData['end_time'] ?? null,
                            'total_seats' => $dateData['total_seats'],
                        ]);
                        $existingDateIds[] = $existingDate->id;
                    }
                } else {
                    $newDate = $workshop->dates()->create([
                        'date' => $dateData['date'],
                        'start_time' => $dateData['start_time'] ?? null,
                        'end_time' => $dateData['end_time'] ?? null,
                        'total_seats' => $dateData['total_seats'],
                        'taken_seats' => 0, // Always 0 for new
                    ]);
                    $existingDateIds[] = $newDate->id;
                }
            }
        }
        
        $datesToDelete = $workshop->dates()->whereNotIn('id', $existingDateIds)->get();
        foreach ($datesToDelete as $dateToDelete) {
            if ($dateToDelete->taken_seats > 0 || $dateToDelete->bookings()->count() > 0) {
                return back()->withErrors(['dates' => 'Cannot delete a date that has existing bookings.']);
            }
            $dateToDelete->delete();
        }

        if ($request->hasFile('images')) {
            $existingCount = $workshop->images()->count();
            foreach ($request->file('images') as $index => $image) {
                $path = $image->store('workshops', 'public');
                $workshop->images()->create([
                    'image_path' => $path,
                    'sort_order' => $existingCount + $index
                ]);
            }
        }

        return redirect()->route('admin.workshops.index')->with('success', 'Workshop updated successfully.');
    }

    public function destroy(Workshop $workshop)
    {
        $workshop->delete();
        return redirect()->route('admin.workshops.index')->with('success', 'Workshop deleted successfully.');
    }

    public function removeImage(Workshop $workshop, \App\Models\WorkshopImage $image)
    {
        if ($image->workshop_id !== $workshop->id) {
            abort(403);
        }

        if (\Illuminate\Support\Facades\Storage::disk('public')->exists($image->image_path)) {
            \Illuminate\Support\Facades\Storage::disk('public')->delete($image->image_path);
        }
        
        $image->delete();

        return redirect()->back()->with('success', 'Image removed successfully.');
    }
}
