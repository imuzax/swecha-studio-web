<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Customization extends Model
{
    protected $guarded = [];

    public function options()
    {
        return $this->hasMany(CustomizationOption::class);
    }

    public function products()
    {
        return $this->belongsToMany(Product::class);
    }
}
