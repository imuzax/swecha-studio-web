<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Workshop extends Model
{
    protected $fillable = [
        'title',
        'slug',
        'description',
        'image_path',
        'price',
        'is_active',
    ];

    public function dates()
    {
        return $this->hasMany(WorkshopDate::class)->orderBy('date');
    }

    public function images()
    {
        return $this->hasMany(WorkshopImage::class)->orderBy('sort_order');
    }
}
