<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Router extends Model
{
    protected $fillable = [
        'name',
        'host',
        'port',
        'username',
        'password',
        'api_port',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'password' => 'encrypted',
            'port' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    public function pppoeAccounts()
    {
        return $this->hasMany(PppoeAccount::class);
    }
}
