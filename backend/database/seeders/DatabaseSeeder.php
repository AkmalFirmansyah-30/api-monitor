<?php

namespace Database\Seeders;

use App\Models\MonitoredApi;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::firstOrCreate(
            [
                'email' => 'akmal@example.com',
            ],
            [
                'name' => 'Akmal Firmansyah',
                'password' => Hash::make('password'),
            ]
        );

        MonitoredApi::updateOrCreate(
            [
                'user_id' => $user->id,
                'url' => 'https://api.example.com/health',
            ],
            [
                'name' => 'Production API',
                'method' => 'GET',
                'timeout' => 10,
                'interval' => 5,
                'status' => 'UP',
                'response_time' => 124,
                'uptime' => 99.99,
                'last_checked_at' => now()->subMinutes(2),
            ]
        );

        MonitoredApi::updateOrCreate(
            [
                'user_id' => $user->id,
                'url' => 'https://api.example.com/users',
            ],
            [
                'name' => 'User API',
                'method' => 'GET',
                'timeout' => 10,
                'interval' => 5,
                'status' => 'UP',
                'response_time' => 87,
                'uptime' => 99.95,
                'last_checked_at' => now()->subMinutes(5),
            ]
        );

        MonitoredApi::updateOrCreate(
            [
                'user_id' => $user->id,
                'url' => 'https://api.example.com/payment',
            ],
            [
                'name' => 'Payment API',
                'method' => 'GET',
                'timeout' => 10,
                'interval' => 5,
                'status' => 'DOWN',
                'response_time' => null,
                'uptime' => 98.12,
                'last_checked_at' => now()->subMinutes(12),
            ]
        );

        MonitoredApi::updateOrCreate(
            [
                'user_id' => $user->id,
                'url' => 'https://api.example.com/analytics',
            ],
            [
                'name' => 'Analytics API',
                'method' => 'GET',
                'timeout' => 10,
                'interval' => 5,
                'status' => 'DEGRADED',
                'response_time' => 843,
                'uptime' => 99.41,
                'last_checked_at' => now()->subMinutes(8),
            ]
        );
    }
}