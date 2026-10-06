<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ApiHeader extends Model
{
    protected $fillable = [
        'monitored_api_id',
        'name',
        'value',
    ];

    public function monitoredApi(): BelongsTo
    {
        return $this->belongsTo(MonitoredApi::class);
    }
}