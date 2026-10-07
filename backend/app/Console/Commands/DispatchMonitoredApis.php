<?php

namespace App\Console\Commands;

use App\Models\MonitoredApi;
use App\Jobs\CheckMonitoredApi;
use Illuminate\Console\Command;

class DispatchMonitoredApis extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'api-monitor:dispatch';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Find due monitored APIs and dispatch queue jobs for checking';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle(): int
    {
        $this->info('=== API Monitor Dispatch Start ===');

        // Find monitored APIs that are due for checking
        $apis = MonitoredApi::due()
            ->get();

        $this->info("Total due APIs: " . $apis->count());

        $dispatchedCount = 0;
        $skippedCount = 0;

        foreach ($apis as $api) {
            // Dispatch a CheckMonitoredApi job for each due API
            CheckMonitoredApi::dispatch($api->id);

            $dispatchedCount++;
            $this->info("Dispatched check job for API #{$api->id} ({$api->name})");
        }

        // Report on APIs that were not due
        $allApis = MonitoredApi::all();
        $dueApiIds = $apis->pluck('id')->toArray();
        $notDueCount = 0;

        foreach ($allApis as $api) {
            if (!in_array($api->id, $dueApiIds)) {
                $notDueCount++;
            }
        }

        $this->info("=== API Monitor Dispatch Complete ===");
        $this->info("Dispatched: {$dispatchedCount} jobs");
        $this->info("Skipped (not due): {$notDueCount} APIs");

        return Command::SUCCESS;
    }
}