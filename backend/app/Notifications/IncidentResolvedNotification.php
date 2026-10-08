<?php

namespace App\Notifications;

use App\Models\Incident;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\DatabaseMessage;

class IncidentResolvedNotification extends Notification
{
    public function __construct(
        public Incident $incident
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toDatabase(object $notifiable): array
    {
        $api = $this->incident->monitoredApi;

        return [
            'type' => 'incident_resolved',
            'incidentId' => $this->incident->id,
            'apiId' => $api->id,
            'apiName' => $api->name,
            'title' => 'API Recovered',
            'message' => "{$api->name} is back online.",
        ];
    }
}