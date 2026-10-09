<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\MonitoringRulesRequest;
use App\Models\MonitoredApi;
use App\Models\MonitoringRule;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MonitoringRuleController extends Controller
{
    /**
     * Display the monitoring rules for the given API.
     */
    public function index(MonitoredApi $api)
    {
        $this->authorize('view', $api);

        $rule = $api->monitoringRule;

        return response()->json([
            'data' => $rule ? $rule->only([
                'expected_status_codes',
                'body_keyword',
                'json_path',
                'json_expected_value',
                'warning_response_time_ms',
                'failure_response_time_ms',
            ]) : [],
        ]);
    }

    /**
     * Create or update monitoring rules for the given API.
     */
    public function update(MonitoringRulesRequest $request, MonitoredApi $api)
    {
        $this->authorize('update', $api);

        $validated = $request->validated();

        // Build the rule data, only including non-null values
        $ruleData = [];

        if (isset($validated['expected_status_codes'])) {
            $ruleData['expected_status_codes'] = $validated['expected_status_codes'];
        }

        if (isset($validated['body_keyword'])) {
            $ruleData['body_keyword'] = $validated['body_keyword'];
        }

        if (isset($validated['json_path'])) {
            $ruleData['json_path'] = $validated['json_path'];
        }

        if (isset($validated['json_expected_value'])) {
            $ruleData['json_expected_value'] = $validated['json_expected_value'];
        }

        if (isset($validated['warning_response_time_ms'])) {
            $ruleData['warning_response_time_ms'] = $validated['warning_response_time_ms'];
        }

        if (isset($validated['failure_response_time_ms'])) {
            $ruleData['failure_response_time_ms'] = $validated['failure_response_time_ms'];
        }

        // Validate threshold consistency
        if (
            isset($ruleData['warning_response_time_ms']) &&
            isset($ruleData['failure_response_time_ms']) &&
            $ruleData['warning_response_time_ms'] > $ruleData['failure_response_time_ms']
        ) {
            return response()->json([
                'message' => 'Failure threshold must be greater than or equal to warning threshold.',
            ], 422);
        }

        // Sync or create the rule for this API
        $rule = $api->monitoringRule()->updateOrCreate(
            [],
            $ruleData
        );

        return response()->json([
            'data' => $rule->only([
                'expected_status_codes',
                'body_keyword',
                'json_path',
                'json_expected_value',
                'warning_response_time_ms',
                'failure_response_time_ms',
            ]),
        ]);
    }
}