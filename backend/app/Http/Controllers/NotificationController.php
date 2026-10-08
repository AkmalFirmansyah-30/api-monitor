<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Notification;
use App\Notifications\IncidentCreatedNotification;
use App\Notifications\IncidentResolvedNotification;
use App\Models\Notification as NotificationModel;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $query = NotificationModel::where('notifiable_type', $user->class)
            ->where('notifiable_id', $user->id);

        $perPage = $request->query('perPage', 20);
        $page = $request->query('page', 1);

        $notifications = $query->latest('created_at')
            ->paginate($perPage)
            ->withQueryString();

        $unreadCount = $query->whereNull('read_at')->count();

        return response()->json([
            'data' => $notifications->items(),
            'meta' => [
                'currentPage' => $notifications->currentPage(),
                'lastPage' => $notifications->lastPage(),
                'perPage' => $notifications->perPage(),
                'total' => $notifications->total(),
            ],
            'unreadCount' => $unreadCount,
        ]);
    }

    public function markAsRead(Request $request, $notificationId)
    {
        $notification = NotificationModel::where('id', $notificationId)
            ->where('notifiable_id', $request->user()->id)
            ->first();

        if (!$notification) {
            return response()->json([
                'message' => 'Notification not found or access denied.',
            ], 404);
        }

        $notification->markAsRead();

        return response()->json(['success' => true]);
    }

    public function markAllAsRead(Request $request)
    {
        $request->user()->notifications()
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json(['success' => true]);
    }
}