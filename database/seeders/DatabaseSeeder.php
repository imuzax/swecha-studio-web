<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Ensure Admin User
        $admin = User::firstOrCreate(
            ['email' => env('ADMIN_EMAIL', 'admin@swechastudio.com')],
            [
                'name' => 'Master Admin',
                'password' => bcrypt(env('ADMIN_PASSWORD', 'password')),
                'is_admin' => true,
            ]
        );

        if ($admin->id !== 1) {
            $admin->id = 1;
            $admin->save();
        }

        $this->command->info('Database cleaned and 1 Admin account created.');
    }
}
