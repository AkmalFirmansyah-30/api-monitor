<?php

namespace App\Notifications;

use App\Notifications\IncidentResolvedNotification;
use App\Models\Incident;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Messages\DatabaseMessage;

class IncidentCreatedNotification extends Notification
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
            'type' => 'incident_created',
            'incidentId' => $this->incident->id,
            'apiId' => $api->id,
            'apiName' => $api->name,
            'title' => 'API Down',
            'message' => "{$api->name} is unavailable.",
        ];
    }
}