<?php

namespace App\Services;

use App\Models\AuditLog;
use App\Models\PppoeAccount;

class PppoeSyncService
{
    public function sync(PppoeAccount $account): bool
    {
        $router = $account->router;

        if (! $router || ! $router->is_active) {
            throw new \RuntimeException('Router tidak aktif atau tidak ditemukan');
        }

        $api = new RouterosAPI;
        $api->timeout = 5;

        try {
            if (! $api->connect($router->host, $router->username, $router->password)) {
                throw new \RuntimeException("Gagal konek ke router {$router->name}");
            }

            $existing = $api->comm('/ppp/secret/print', [
                '?name' => $account->username,
            ]);

            $params = [
                'name' => $account->username,
                'password' => $account->password,
                'service' => $account->service ?: 'pppoe',
            ];

            if ($account->profile) {
                $params['profile'] = $account->profile;
            }
            if ($account->ip_address) {
                $params['remote-address'] = $account->ip_address;
            }
            if ($account->disabled) {
                $params['disabled'] = 'yes';
            }

            if (! empty($existing) && isset($existing[0]['.id'])) {
                $params['.id'] = $existing[0]['.id'];
                $result = $api->comm('/ppp/secret/set', $params);
            } else {
                $result = $api->comm('/ppp/secret/add', $params);
            }

            $api->disconnect();

            $account->last_sync_at = now();
            $account->save();

            AuditLog::create([
                'action' => $existing ? 'pppoe_updated' : 'pppoe_created',
                'entity_type' => 'pppoe_account',
                'entity_id' => $account->id,
                'description' => "PPPoE {$account->username} telah disinkronkan ke router {$router->name}",
                'new_values' => $account->toArray(),
            ]);

            return true;

        } catch (\Exception $e) {
            if ($api->connected) {
                $api->disconnect();
            }

            AuditLog::create([
                'action' => 'pppoe_sync_failed',
                'entity_type' => 'pppoe_account',
                'entity_id' => $account->id,
                'description' => "Gagal sinkron {$account->username}: {$e->getMessage()}",
            ]);

            throw $e;
        }
    }

    public function disableOnRouter(PppoeAccount $account): bool
    {
        $router = $account->router;

        if (! $router || ! $router->is_active) {
            return false;
        }

        $api = new RouterosAPI;
        $api->timeout = 5;

        try {
            if (! $api->connect($router->host, $router->username, $router->password)) {
                return false;
            }

            $existing = $api->comm('/ppp/secret/print', [
                '?name' => $account->username,
            ]);

            if (! empty($existing) && isset($existing[0]['.id'])) {
                $api->comm('/ppp/secret/disable', ['.id' => $existing[0]['.id']]);
            }

            $api->disconnect();

            $account->disabled = true;
            $account->last_sync_at = now();
            $account->save();

            AuditLog::create([
                'action' => 'pppoe_disabled',
                'entity_type' => 'pppoe_account',
                'entity_id' => $account->id,
                'description' => "PPPoE {$account->username} dinonaktifkan di router",
                'new_values' => ['disabled' => true],
            ]);

            return true;

        } catch (\Exception $e) {
            if ($api->connected) {
                $api->disconnect();
            }

            return false;
        }
    }

    public function enableOnRouter(PppoeAccount $account): bool
    {
        $router = $account->router;

        if (! $router || ! $router->is_active) {
            return false;
        }

        $api = new RouterosAPI;
        $api->timeout = 5;

        try {
            if (! $api->connect($router->host, $router->username, $router->password)) {
                return false;
            }

            $existing = $api->comm('/ppp/secret/print', [
                '?name' => $account->username,
            ]);

            if (! empty($existing) && isset($existing[0]['.id'])) {
                $api->comm('/ppp/secret/enable', ['.id' => $existing[0]['.id']]);
            }

            $api->disconnect();

            $account->disabled = false;
            $account->last_sync_at = now();
            $account->save();

            AuditLog::create([
                'action' => 'pppoe_enabled',
                'entity_type' => 'pppoe_account',
                'entity_id' => $account->id,
                'description' => "PPPoE {$account->username} diaktifkan kembali di router",
                'new_values' => ['disabled' => false],
            ]);

            return true;

        } catch (\Exception $e) {
            if ($api->connected) {
                $api->disconnect();
            }

            return false;
        }
    }

    public function removeFromRouter(PppoeAccount $account): bool
    {
        $router = $account->router;

        if (! $router) {
            return false;
        }

        $api = new RouterosAPI;
        $api->timeout = 5;

        try {
            if (! $api->connect($router->host, $router->username, $router->password)) {
                return false;
            }

            $existing = $api->comm('/ppp/secret/print', [
                '?name' => $account->username,
            ]);

            if (! empty($existing) && isset($existing[0]['.id'])) {
                $api->comm('/ppp/secret/remove', ['.id' => $existing[0]['.id']]);
            }

            $api->disconnect();

            AuditLog::create([
                'action' => 'pppoe_removed',
                'entity_type' => 'pppoe_account',
                'entity_id' => $account->id,
                'description' => "PPPoE {$account->username} dihapus dari router",
                'old_values' => $account->toArray(),
            ]);

            return true;

        } catch (\Exception $e) {
            if ($api->connected) {
                $api->disconnect();
            }

            return false;
        }
    }
}
