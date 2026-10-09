<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MonitoringRule extends Model
{
    protected $fillable = [
        'monitored_api_id',
        'expected_status_codes',
        'body_keyword',
        'json_path',
        'json_expected_value',
        'warning_response_time_ms',
        'failure_response_time_ms',
    ];

    protected function casts(): array
    {
        return [
            'expected_status_codes' => 'json',
            'json_expected_value' => 'json',
            'warning_response_time_ms' => 'integer',
            'failure_response_time_ms' => 'integer',
        ];
    }

    public function monitoredApi(): BelongsTo
    {
        return $this->belongsTo(MonitoredApi::class);
    }
}