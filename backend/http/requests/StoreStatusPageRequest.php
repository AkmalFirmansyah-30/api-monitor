<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreStatusPageRequest extends FormRequest
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
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'lowercase', 'regex:/^[a-z0-9]+(?:[._-]?[a-z0-9]+)*$', 'unique:status_pages'],
            'description' => ['nullable', 'string'],
            'isPublic' => ['boolean'],
            'apiIds' => ['array'],
        ];
    }

    /**
     * Get custom attributes for validators.
     */
    public function attributes(): array
    {
        return [
            'name' => 'name',
            'slug' => 'slug',
            'description' => 'description',
            'isPublic' => 'is public',
            'apiIds' => 'API IDs',
        ];
    }
}