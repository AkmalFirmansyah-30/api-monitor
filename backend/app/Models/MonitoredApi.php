<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MonitoredApi extends Model
{
    protected $fillable = [
        'user_id',
        'name',
        'url',
        'method',
        'timeout',
        'interval',
        'status',
        'response_time',
        'uptime',
        'last_checked_at',
    ];

    protected function casts(): array
    {
        return [
            'last_checked_at' => 'datetime',
            'uptime' => 'decimal:2',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function headers(): HasMany
    {
        return $this->hasMany(ApiHeader::class);
    }

    public function checks(): HasMany
    {
        return $this->hasMany(ApiCheck::class);
    }

    public function incidents(): HasMany
    {
        return $this->hasMany(Incident::class);
    }
}