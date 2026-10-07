<?php

namespace App\Policies;

use App\Models\MonitoredApi;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class MonitoredApiPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->enabled ?? true;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, MonitoredApi $monitoredApi): bool
    {
        return $monitoredApi->user_id === $user->id;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, MonitoredApi $monitoredApi): bool
    {
        return $monitoredApi->user_id === $user->id;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, MonitoredApi $monitoredApi): bool
    {
        return $monitoredApi->user_id === $user->id;
    }

    /**
     * Determine whether the user can check the API.
     */
    public function check(User $user, MonitoredApi $monitoredApi): bool
    {
        return $monitoredApi->user_id === $user->id;
    }

    /**
     * Determine whether the user can view checks.
     */
    public function viewChecks(User $user, MonitoredApi $monitoredApi): bool
    {
        return $monitoredApi->user_id === $user->id;
    }
}