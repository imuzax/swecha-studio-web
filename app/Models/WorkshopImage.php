<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WorkshopImage extends Model
{
    protected $guarded = [];

    public function workshop()
    {
        return $this->belongsTo(Workshop::class);
    }
}
