<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StatusPageApi extends Model
{
    protected $fillable = [
        'status_page_id',
        'monitored_api_id',
        'sort_order',
    ];

    public function statusPage(): BelongsTo
    {
        return $this->belongsTo(StatusPage::class);
    }

    public function monitoredApi(): BelongsTo
    {
        return $this->belongsTo(MonitoredApi::class);
    }
}