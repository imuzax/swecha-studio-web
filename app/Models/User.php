<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

#[Fillable(['name', 'email', 'password', 'google_id', 'avatar'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;
    protected $guarded = [];

    protected static function booted()
    {
        static::deleting(function ($user) {
            if ($user->is_admin) {
                throw new \Exception('Admin users cannot be deleted.');
            }
        });
    }
    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function addresses() { return $this->hasMany(Address::class); }
    public function orders() { return $this->hasMany(Order::class); }
    public function complaints() { return $this->hasMany(Complaint::class); }
    public function wishlists() { return $this->hasMany(Wishlist::class); }
    public function recentlyViewedProducts() { return $this->hasMany(RecentlyViewedProduct::class); }
    public function bulkEnquiries() { return $this->hasMany(BulkEnquiry::class); }

}
