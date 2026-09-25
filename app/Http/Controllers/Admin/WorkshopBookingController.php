<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Workshop;
use App\Models\WorkshopDate;
use App\Models\WorkshopBooking;
use Illuminate\Http\Request;
use Inertia\Inertia;

class WorkshopBookingController extends Controller
{
    public function index(Workshop $workshop)
    {
        $workshop->load(['dates' => function($q) {
            $q->orderBy('date', 'desc');
        }, 'dates.bookings']);
        
        return Inertia::render('Admin/Workshops/Bookings', [
            'workshop' => $workshop
        ]);
    }

    public function store(Request $request, Workshop $workshop, WorkshopDate $date)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'tickets_count' => 'required|integer|min:1',
            'payment_method' => 'required|string',
            'payment_status' => 'required|string',
            'notes' => 'nullable|string',
        ]);

        $date->bookings()->create($validated);
        $date->increment('taken_seats', $validated['tickets_count']);

        return back()->with('success', 'Booking added successfully.');
    }

    public function destroy(Workshop $workshop, WorkshopDate $date, WorkshopBooking $booking)
    {
        if ($booking->workshop_date_id === $date->id) {
            $date->decrement('taken_seats', $booking->tickets_count);
            $booking->delete();
        }
        return back()->with('success', 'Booking removed successfully.');
    }
}
