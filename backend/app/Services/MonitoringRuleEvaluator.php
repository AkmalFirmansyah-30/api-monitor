<?php

namespace App\Services;

use App\Models\MonitoringRule;
use App\Models\MonitoredApi;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class MonitoringRuleEvaluator
{
    /**
     * Evaluate configured monitoring rules against an HTTP response.
     *
     * @param  \App\Models\MonitoredApi  $api
     * @param  \Illuminate\Http\Response  $response
     * @param  float  $responseTimeMs  Measured response time in milliseconds
     * @return array{
     *     'status': string,
     *     'assertionsPassed': bool,
     *     'failures': array<string>,
     *     'statusCode': int|float|null,
     *     'responseTimeMs': float,
     * }
     */
    public function evaluate(MonitoredApi $api, $response, float $responseTimeMs): array
    {
        $rule = $api->monitoringRule;

        $status = 'UP';
        $statusCode = $response->status();
        $failures = [];

        // If no custom rules configured, preserve existing behavior
        if (!$rule) {
            return $this->defaultEvaluation($responseTimeMs, $statusCode);
        }

        // 1. HTTP Status Code Check
        if ($rule->expected_status_codes) {
            $statusCodes = is_array($rule->expected_status_codes)
                ? $rule->expected_status_codes
                : [$rule->expected_status_codes];

            if (!in_array($statusCode, $statusCodes, true)) {
                $status = 'DOWN';
                $failures[] = "Expected HTTP status " . implode(', ', $statusCodes) . " but received {$statusCode}";
            }
        }

        // 2. Body Keyword Check
        if ($rule->body_keyword) {
            $body = (string) $response->body();

            // Safe string comparison - no regex or code execution
            if (str_contains($body, $rule->body_keyword) === false) {
                $status = 'DOWN';
                $failures[] = "Body keyword '{$rule->body_keyword}' not found in response";
            }
        }

        // 3. JSON Assertion
        if ($rule->json_path) {
            // Try to parse JSON safely
            $jsonData = json_decode($response->body(), true);

            if ($jsonData === false) {
                $status = 'DOWN';
                $failures[] = 'Response body is not valid JSON';
            } elseif ($jsonData !== null) {
                $value = $this->getJsonPathValue($jsonData, $rule->json_path);

                if ($value === null && json_last_error() !== JSON_ERROR_NONE) {
                    $status = 'DOWN';
                    $failures[] = 'Invalid JSON path: ' . json_last_error_msg();
                } elseif ($value !== $rule->json_expected_value) {
                    $expected = is_scalar($rule->json_expected_value)
                        ? var_export($rule->json_expected_value, true)
                        : json_encode($rule->json_expected_value);
                    $status = 'DOWN';
                    $failures[] = "JSON path '{$rule->json_path}' value {$value} does not match expected {$expected}";
                }
            }
        }

        // 4. Response Time Thresholds
        if ($rule->failure_response_time_ms !== null && $responseTimeMs >= $rule->failure_response_time_ms) {
            $status = 'DOWN';
            $failures[] = "Response time {$responseTimeMs}ms exceeds failure threshold {$rule->failure_response_time_ms}ms";
        }

        if ($rule->warning_response_time_ms !== null && $responseTimeMs >= $rule->warning_response_time_ms && $status !== 'DOWN') {
            $status = 'DEGRADED';
            $failures[] = "Response time {$responseTimeMs}ms exceeds warning threshold {$rule->warning_response_time_ms}ms";
        }

        // Default: UP if no assertions failed
        if ($status === 'UP' && empty($failures)) {
            $status = 'UP';
        }

        // Precedence: DOWN > DEGRADED > UP
        // If multiple conditions triggered, use the most severe status

        return [
            'status' => $status,
            'assertionsPassed' => $status === 'UP',
            'failures' => $failures,
            'statusCode' => $statusCode,
            'responseTimeMs' => $responseTimeMs,
        ];
    }

    /**
     * Get a value from a nested array using a JSON path string.
     *
     * @param  mixed  $data  The JSON-decoded data array
     * @param  string  $path  The JSON path (e.g., '$.status', 'data.items[0].name')
     * @return mixed The value at the given path, or null if not found
     */
    protected function getJsonPathValue($data, string $path)
    {
        // Normalize path: remove leading $ if present and convert / to ->
        $path = ltrim($path, '$');
        $segments = explode('/', $path);

        $value = $data;
        foreach ($segments as $segment) {
            // Handle array indices like [0]
            if (preg_match('/^\[([0-9]+)\]$/', $segment, $matches)) {
                $index = (int) $matches[1];
                if (isset($value[$index])) {
                    $value = $value[$index];
                } else {
                    return null;
                }
            } elseif (isset($value[$segment])) {
                $value = $value[$segment];
            } else {
                return null;
            }
        }

        return $value;
    }

    /**
     * Default evaluation when no custom rules are configured.
     * Preserves existing monitoring behavior.
     */
    protected function defaultEvaluation(float $responseTimeMs, int $statusCode): array
    {
        $status = 'UP';

        // Existing project behavior: DEGRADED if response time >= 1000ms
        if ($responseTimeMs >= 1000) {
            $status = 'DEGRADED';
        }

        return [
            'status' => $status,
            'assertionsPassed' => true,
            'failures' => [],
            'statusCode' => $statusCode,
            'responseTimeMs' => $responseTimeMs,
        ];
    }
}