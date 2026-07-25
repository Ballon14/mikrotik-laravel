<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePppoeAccountRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'customer_id' => 'required|exists:customers,id',
            'router_id' => 'nullable|exists:routers,id',
            'username' => 'required|string|max:100|unique:pppoe_accounts,username',
            'password' => 'required|string|max:100',
            'profile' => 'nullable|string|max:100',
            'ip_address' => 'nullable|string|max:50',
            'service' => 'nullable|string|max:50',
            'disabled' => 'nullable|boolean',
        ];
    }
}
