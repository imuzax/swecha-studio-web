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
        if ($date->workshop_id !== $workshop->id) {
            return back()->with('error', 'Invalid workshop date relationship.');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'tickets_count' => 'required|integer|min:1',
            'payment_method' => 'required|string',
            'payment_status' => 'required|string',
            'notes' => 'nullable|string',
        ]);

        try {
            \Illuminate\Support\Facades\DB::transaction(function () use ($date, $validated) {
                // Lock the date row
                $lockedDate = WorkshopDate::where('id', $date->id)->lockForUpdate()->firstOrFail();

                // Capacity check
                if (($lockedDate->taken_seats + $validated['tickets_count']) > $lockedDate->total_seats) {
                    throw new \Exception('Not enough available seats for this booking.');
                }

                $lockedDate->bookings()->create($validated);
                $lockedDate->increment('taken_seats', $validated['tickets_count']);
            });
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }

        return back()->with('success', 'Booking added successfully.');
    }

    public function destroy(Workshop $workshop, WorkshopDate $date, WorkshopBooking $booking)
    {
        if ($date->workshop_id !== $workshop->id || $booking->workshop_date_id !== $date->id) {
            return back()->with('error', 'Invalid booking relationship.');
        }

        try {
            \Illuminate\Support\Facades\DB::transaction(function () use ($date, $booking) {
                $lockedDate = WorkshopDate::where('id', $date->id)->lockForUpdate()->firstOrFail();
                
                if ($lockedDate->taken_seats >= $booking->tickets_count) {
                    $lockedDate->decrement('taken_seats', $booking->tickets_count);
                } else {
                    $lockedDate->update(['taken_seats' => 0]);
                }
                
                $booking->delete();
            });
        } catch (\Exception $e) {
            return back()->with('error', 'Failed to remove booking.');
        }

        return back()->with('success', 'Booking removed successfully.');
    }
}
