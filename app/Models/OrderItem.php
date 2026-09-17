<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderItem extends Model
{
    protected $guarded = [];

    public function order() { return $this->belongsTo(Order::class); }
    public function product() { return $this->belongsTo(Product::class); }

    protected function casts(): array
    {
        return [
            'variant_info' => 'array',
            'customization_info' => 'array',
        ];
    }

}
