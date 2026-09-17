<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use HasFactory, SoftDeletes;
    protected $guarded = [];

    public function category() { return $this->belongsTo(Category::class); }
    public function images() { return $this->hasMany(ProductImage::class)->orderBy('sort_order'); }
    public function variants() { return $this->hasMany(ProductVariant::class); }
    public function customizations() { return $this->belongsToMany(Customization::class); }
    public function wishlistedBy() { return $this->hasMany(Wishlist::class); }
    public function activities() { return $this->hasMany(ProductActivity::class); }

    public function calculatePrice($variantId = null, array $customizationOptionIds = [])
    {
        $basePrice = $this->sale_price ?: $this->price;
        $total = $basePrice;

        if ($variantId) {
            $variant = $this->variants->firstWhere('id', $variantId);
            if ($variant && $variant->is_active) {
                $total += $variant->price_adjustment;
            } else {
                throw new \Exception("Invalid or inactive variant.");
            }
        }

        if (!empty($customizationOptionIds)) {
            $options = $this->customizations->flatMap->options->whereIn('id', $customizationOptionIds);
            
            if ($options->count() !== count($customizationOptionIds)) {
                throw new \Exception("Invalid customization options.");
            }
            
            foreach ($options as $option) {
                $total += $option->price_adjustment;
            }
        }

        return $total;
    }
}
