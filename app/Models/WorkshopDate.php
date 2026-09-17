<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WorkshopDate extends Model
{
    protected $fillable = [
        'workshop_id',
        'date',
        'start_time',
        'end_time',
        'total_seats',
        'taken_seats',
    ];

    protected $casts = [
        'date' => 'date',
    ];

    public function workshop()
    {
        return $this->belongsTo(Workshop::class);
    }

    public function bookings()
    {
        return $this->hasMany(WorkshopBooking::class);
    }
}
