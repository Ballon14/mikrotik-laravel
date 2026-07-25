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
                        $this->fetchData('/system/identity/print', 'mikrotik_data_identity');
                        $this->fetchData('/ip/dhcp-server/lease/print', 'mikrotik_data_dhcp');
                        $this->fetchData('/ip/route/print', 'mikrotik_data_routes');
                        $this->fetchData('/ip/firewall/filter/print', 'mikrotik_data_fw_filter');
                        $this->fetchData('/ip/firewall/nat/print', 'mikrotik_data_fw_nat');
                        $this->fetchData('/ip/arp/print', 'mikrotik_data_arp');
                        $this->fetchData('/interface/wireless/registration-table/print', 'mikrotik_data_wireless');
                        $this->fetchData('/ip/address/print', 'mikrotik_data_ip_addresses');
                        $this->fetchData('/ip/dns/print', 'mikrotik_data_dns');

                        // Fetch isolated IPs from firewall filter rules
                        $this->updateIsolatedIps();

                        $logs = $this->api->comm('/log/print');
                        if (is_array($logs)) {
                            Cache::put('mikrotik_data_logs', array_slice($logs, -50), 30);
                        }

                        // Fetch hotspot active users
                        $hotspot = $this->api->comm('/ip/hotspot/active/print');
                        if (is_array($hotspot)) {
                            Cache::put('mikrotik_data_hotspot_active', $hotspot, 30);
                        }
                    }

                    $counter++;
                    sleep(2);
                }
            } catch (\Exception $e) {
                $this->error('Connection dropped: '.$e->getMessage());
                // Force disconnect and try again
                @$this->api->disconnect();
                sleep(5);
            }
        }
    }

    private function fetchData($command, $cacheKey)
    {
        $result = $this->api->comm($command);
        if (is_array($result)) {
            Cache::put($cacheKey, $result, 30);
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

        Cache::put('mikrotik_data_isolated_ips', $isolated, 30);
    }
}
