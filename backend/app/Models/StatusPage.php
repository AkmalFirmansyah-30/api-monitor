<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Laravel\Sanctum\HasApiTokens;

class StatusPage extends Model
{
    use HasApiTokens;

    protected $fillable = [
        'user_id',
        'name',
        'slug',
        'description',
        'is_public',
    ];

    protected $casts = [
        'is_public' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function statusPageApis(): BelongsToMany
    {
        return $this->belongsToMany(MonitoredApi::class)
            ->using(StatusPageApi::class)
            ->withPivot('sort_order');
    }

    public function scopePublic($query)
    {
        return $query->where('is_public', true);
    }
}