<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreMonitoredApiRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'url' => ['required', 'url', 'max:2048'],
            'method' => [
                'required',
                'string',
                'in:GET,POST,PUT,PATCH,DELETE',
            ],
            'timeout' => ['required', 'integer', 'min:1', 'max:120'],
            'interval' => ['required', 'integer', 'min:1', 'max:1440'],
        ];
    }
}