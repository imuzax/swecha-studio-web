<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WorkshopBooking extends Model
{
    protected $guarded = [];

    public function workshopDate()
    {
        return $this->belongsTo(WorkshopDate::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
