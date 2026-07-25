<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PppoeAccount extends Model
{
    protected $fillable = [
        'customer_id',
        'router_id',
        'username',
        'password',
        'profile',
        'ip_address',
        'service',
        'disabled',
        'last_sync_at',
    ];

    protected function casts(): array
    {
        return [
            'disabled' => 'boolean',
            'last_sync_at' => 'datetime',
        ];
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function router()
    {
        return $this->belongsTo(Router::class);
    }
}
