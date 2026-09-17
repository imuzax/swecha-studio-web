<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CustomizationOption extends Model
{
    protected $guarded = [];

    public function customization()
    {
        return $this->belongsTo(Customization::class);
    }
}
