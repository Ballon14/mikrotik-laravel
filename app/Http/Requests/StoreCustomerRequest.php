<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCustomerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'nik' => 'nullable|string|max:20',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string',
            'pppoe_username' => 'required|string|max:100|unique:customers,pppoe_username',
            'pppoe_password' => 'required|string|max:100',
            'package_id' => 'required|exists:packages,id',
            'status' => 'required|in:active,inactive,isolated',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Nama pelanggan wajib diisi.',
            'pppoe_username.required' => 'Username PPPoE wajib diisi.',
            'pppoe_username.unique' => 'Username PPPoE sudah digunakan.',
            'pppoe_password.required' => 'Password PPPoE wajib diisi.',
            'package_id.required' => 'Paket wajib dipilih.',
            'package_id.exists' => 'Paket tidak ditemukan.',
            'status.required' => 'Status wajib dipilih.',
        ];
    }
}
