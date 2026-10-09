<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class MonitoringRulesRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'expected_status_codes' => ['sometimes', 'array', 'nullable'],
            'expected_status_codes.*' => ['integer', 'between:100,599'],
            'body_keyword' => ['sometimes', 'string', 'max:255', 'nullable'],
            'json_path' => ['sometimes', 'string', 'nullable'],
            'json_expected_value' => ['sometimes', 'json', 'nullable'],
            'warning_response_time_ms' => ['sometimes', 'integer', 'min:1', 'nullable'],
            'failure_response_time_ms' => ['sometimes', 'integer', 'min:1', 'nullable'],
        ];
    }

    /**
     * Get custom attributes for validators.
     */
    public function attributes(): array
    {
        return [
            'expected_status_codes' => 'expected HTTP status codes',
            'expected_status_codes.*' => 'status code',
            'body_keyword' => 'body keyword',
            'json_path' => 'JSON path',
            'json_expected_value' => 'JSON expected value',
            'warning_response_time_ms' => 'warning response time (ms)',
            'failure_response_time_ms' => 'failure response time (ms)',
        ];
    }

    /**
     * Get the validation messages that apply to the request.
     */
    public function messages(): array
    {
        return [
            'expected_status_codes.*.between' => 'Status code must be between 100 and 599',
            'expected_status_codes.*.integer' => 'Status code must be an integer',
            'failure_response_time_ms.min' => 'Failure threshold must be at least 1 minute',
            'warning_response_time_ms.min' => 'Warning threshold must be at least 1 minute',
        ];
    }
}