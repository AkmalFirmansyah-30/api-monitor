<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\MonitoredApi;
use App\Services\ApiMonitoringService;

class CheckMonitoredApis extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'api-monitor:check';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Check all monitored APIs based on their interval';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('=== API Monitor Check Start ===');

        $apis = MonitoredApi::all();

        $this->info("Total monitored APIs: " . $apis->count());

        $dueCount = 0;
        $skippedCount = 0;
        $processedCount = 0;
        $errorCount = 0;

        foreach ($apis as $api) {
            // Check if API is due for checking
            if (!$this->isDue($api)) {
                $this->info("Skipping API #{$api->id} ({$api->name}) - not due yet");
                $skippedCount++;
                continue;
            }

            $dueCount++;

            $this->info("Checking API #{$api->id} ({$api->name}) - Interval: {$api->interval} min");

            try {
                // Gunakan ApiMonitoringService yang sudah ada
                $service = new ApiMonitoringService();
                $result = $service->check($api);

                $this->info("API #{$api->id} checked - Status: {$result['status']}, Response Time: {$result['responseTime']}ms");

                $processedCount++;

                if ($result['status'] !== 'UP') {
                    $this->info("API #{$api->id} status: {$result['status']}");
                    if ($result['errorMessage']) {
                        $this->error("Error: " . substr($result['errorMessage'], 0, 200));
                    }
                }
            } catch (\Exception $e) {
                $this->error("API #{$api->id} check failed with exception: " . $e->getMessage());
                $errorCount++;
                // Lanjut ke API berikutnya, tidak menghentikan seluruh loop
            }
        }

        $this->info("=== API Monitor Check Complete ===");
        $this->info("Due: {$dueCount} | Processed: {$processedCount} | Skipped (not due): {$skippedCount} | Errors: {$errorCount}");

        return Command::SUCCESS;
    }

    /**
     * Determine if an API is due for checking.
     *
     * @param  MonitoredApi  $api
     * @return bool
     */
    protected function isDue(MonitoredApi $api): bool
    {
        // Jika last_checked_at adalah null, API dianggap DUE (belum pernah dicek)
        if ($api->last_checked_at === null) {
            return true;
        }

        // Hitung waktu berikutnya pembelian
        $nextCheck = $api->last_checked_at->copy()->addMinutes($api->interval);

        // Jika sekarang >= waktu berikutnya, API DUE
        return now() >= $nextCheck;
    }
}