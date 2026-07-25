<?php

namespace App\Console\Commands;

use App\Services\RouterosAPI;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;

class MikrotikMonitor extends Command
{
    protected $signature = 'mikrotik:monitor';

    protected $description = 'Background daemon to continuously fetch data from MikroTik and store it in Cache';

    private $api;

    private const CACHE_TTL = 180; // seconds — longer TTL prevents blank UI on transient errors

    private $lastSlowCycleSuccess = true;

    public function handle()
    {
        $this->info('Starting MikroTik Monitor Daemon...');

        $host = config('mikrotik.host');
        $user = config('mikrotik.user');
        $password = config('mikrotik.password');

        $this->api = new RouterosAPI;
        $this->api->timeout = 5;

        while (true) {
            try {
                if (! $this->api->connect($host, $user, $password)) {
                    $this->error('Failed to connect. Retrying in 5 seconds...');
                    sleep(5);

                    continue;
                }

                $this->info('Connected to MikroTik at '.now()->format('Y-m-d H:i:s'));

                $counter = 0;
                while (true) {
                    // Fast cycle data (every 2 seconds)
                    $this->fetchData('/system/resource/print', 'mikrotik_data_resource');
                    $this->fetchData('/interface/print', 'mikrotik_data_interfaces');

                    // Update historical traffic data
                    $this->updateTrafficHistory();

                    // Slow cycle data (every 10 seconds)
                    if ($counter % 5 == 0) {
                        $this->runSlowCycle();
                    }

                    $counter++;
                    sleep(2);
                }
            } catch (\Exception $e) {
                $this->error('Connection dropped: '.$e->getMessage());
                Cache::put('mikrotik_daemon_error', $e->getMessage(), 60);
                @$this->api->disconnect();
                sleep(5);
            }
        }
    }

    private function runSlowCycle()
    {
        $commands = [
            '/system/identity/print' => 'mikrotik_data_identity',
            '/ip/dhcp-server/lease/print' => 'mikrotik_data_dhcp',
            '/ip/route/print' => 'mikrotik_data_routes',
            '/ip/firewall/filter/print' => 'mikrotik_data_fw_filter',
            '/ip/firewall/nat/print' => 'mikrotik_data_fw_nat',
            '/ip/arp/print' => 'mikrotik_data_arp',
            '/interface/wireless/registration-table/print' => 'mikrotik_data_wireless',
            '/ip/address/print' => 'mikrotik_data_ip_addresses',
            '/ip/dns/print' => 'mikrotik_data_dns',
        ];

        $allOk = true;

        foreach ($commands as $cmd => $key) {
            $ok = $this->fetchData($cmd, $key);
            if (! $ok) {
                $allOk = false;
            }
        }

        // Logs & hotspot — wrapped individually so one failure doesn't skip the other
        try {
            $logs = $this->api->comm('/log/print');
            if (is_array($logs)) {
                Cache::put('mikrotik_data_logs', array_slice($logs, -50), self::CACHE_TTL);
            }
        } catch (\Exception $e) {
            $this->error("Failed to fetch logs: {$e->getMessage()}");
            $allOk = false;
        }

        try {
            $hotspot = $this->api->comm('/ip/hotspot/active/print');
            if (is_array($hotspot)) {
                Cache::put('mikrotik_data_hotspot_active', $hotspot, self::CACHE_TTL);
            }
        } catch (\Exception $e) {
            $this->error("Failed to fetch hotspot: {$e->getMessage()}");
            $allOk = false;
        }

        // Isolated IPs — derived from firewall filter cache
        $this->updateIsolatedIps();

        Cache::put('mikrotik_daemon_last_run', now()->toIso8601String(), 60);

        if ($allOk) {
            $this->lastSlowCycleSuccess = true;
            Cache::forget('mikrotik_daemon_error');
        } else {
            $this->lastSlowCycleSuccess = false;
        }
    }

    /**
     * Fetch data from RouterOS API and store in cache.
     * On failure, keeps the previous cache entry (does not overwrite with empty).
     * Returns true on success, false on failure.
     */
    private function fetchData($command, $cacheKey): bool
    {
        try {
            $result = $this->api->comm($command);

            if ($result === false) {
                $this->error("API returned false for: {$command} — keeping stale cache");

                return false;
            }

            if (! is_array($result)) {
                $this->error("API returned non-array for: {$command} — keeping stale cache");

                return false;
            }

            // Check if response contains !trap (RouterOS error)
            if (isset($result[0]) && is_string($result[0]) && str_starts_with($result[0], '!trap')) {
                $msg = $result[1] ?? 'unknown trap';
                $this->error("API trap for {$command}: {$msg} — keeping stale cache");

                return false;
            }

            Cache::put($cacheKey, $result, self::CACHE_TTL);

            return true;

        } catch (\Exception $e) {
            $this->error("Exception fetching {$command}: {$e->getMessage()} — keeping stale cache");

            return false;
        }
    }

    private function updateTrafficHistory()
    {
        $interfaces = Cache::get('mikrotik_data_interfaces', []);
        $now = (int) round(microtime(true) * 1000);

        foreach ($interfaces as $iface) {
            $name = $iface['name'] ?? null;
            if (! $name) {
                continue;
            }

            $rxBytes = (float) ($iface['rx-byte'] ?? 0);
            $txBytes = (float) ($iface['tx-byte'] ?? 0);

            $prevKey = "mikrotik_traffic_prev_{$name}";
            $histKey = "mikrotik_traffic_hist_{$name}";

            $prev = Cache::get($prevKey);
            $history = Cache::get($histKey, []);

            if ($prev) {
                $dt = ($now - $prev['ts']) / 1000;
                if ($dt > 0) {
                    $rxRate = max(0, ($rxBytes - $prev['rx']) / $dt);
                    $txRate = max(0, ($txBytes - $prev['tx']) / $dt);

                    $history[] = [
                        'ts' => $now,
                        'rxRate' => round($rxRate),
                        'txRate' => round($txRate),
                    ];

                    if (count($history) > 60) {
                        $history = array_slice($history, -60);
                    }
                }
            }

            Cache::put($prevKey, ['rx' => $rxBytes, 'tx' => $txBytes, 'ts' => $now], 120);
            Cache::put($histKey, $history, 120);
        }
    }

    private function updateIsolatedIps()
    {
        $rules = Cache::get('mikrotik_data_fw_filter', []);
        $isolated = [];

        if (is_array($rules)) {
            foreach ($rules as $rule) {
                $comment = $rule['comment'] ?? '';
                if (str_starts_with($comment, 'ISOLASI_IP::')) {
                    $ip = substr($comment, strlen('ISOLASI_IP::'));
                    if (! in_array($ip, $isolated)) {
                        $isolated[] = $ip;
                    }
                }
            }
        }

        Cache::put('mikrotik_data_isolated_ips', $isolated, self::CACHE_TTL);
    }
}
