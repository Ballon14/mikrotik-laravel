<?php

namespace App\Http\Controllers;

use App\Services\MikrotikService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class MikrotikController extends Controller
{
    private function camelCaseKeys($array)
    {
        if (! is_array($array)) {
            return $array;
        }

        $result = [];
        foreach ($array as $key => $value) {
            $camelKey = lcfirst(str_replace(' ', '', ucwords(str_replace('-', ' ', $key))));
            $result[$camelKey] = is_array($value) ? $this->camelCaseKeys($value) : $value;
        }

        return $result;
    }

    private function response($data)
    {
        return response()->json([
            'success' => true,
            'data' => $this->camelCaseKeys($data),
        ]);
    }

    private function error($message, $code = 500)
    {
        return response()->json([
            'success' => false,
            'error' => $message,
        ], $code);
    }

    public function health()
    {
        $daemonLastRun = Cache::get('mikrotik_daemon_last_run', null);
        $daemonError = Cache::get('mikrotik_daemon_error', null);
        $resource = Cache::get('mikrotik_data_resource', []);

        return response()->json([
            'status' => 'ok',
            'daemon' => [
                'lastRun' => $daemonLastRun,
                'connected' => ! empty($resource),
                'error' => $daemonError,
            ],
            'cache' => [
                'resource' => ! empty($resource),
                'interfaces' => Cache::has('mikrotik_data_interfaces'),
                'dhcp' => Cache::has('mikrotik_data_dhcp'),
                'routes' => Cache::has('mikrotik_data_routes'),
                'firewallFilter' => Cache::has('mikrotik_data_fw_filter'),
                'firewallNat' => Cache::has('mikrotik_data_fw_nat'),
                'arp' => Cache::has('mikrotik_data_arp'),
                'logs' => Cache::has('mikrotik_data_logs'),
            ],
        ]);
    }

    public function daemonStatus()
    {
        $lastRun = Cache::get('mikrotik_daemon_last_run', null);
        $error = Cache::get('mikrotik_daemon_error', null);
        $resource = Cache::get('mikrotik_data_resource', []);

        return response()->json([
            'success' => true,
            'data' => [
                'running' => ! empty($resource),
                'lastRun' => $lastRun,
                'error' => $error,
                'healthy' => $lastRun !== null && empty($error) && ! empty($resource),
            ],
        ]);
    }

    public function router()
    {
        $data = Cache::get('mikrotik_data_resource', []);

        return $this->response($data[0] ?? null);
    }

    public function identity()
    {
        $data = Cache::get('mikrotik_data_identity', []);

        return $this->response($data[0] ?? null);
    }

    public function interfaces()
    {
        $data = Cache::get('mikrotik_data_interfaces', []);

        return $this->response($data);
    }

    public function interfaceDetail($name)
    {
        $interfaces = Cache::get('mikrotik_data_interfaces', []);
        $iface = null;
        foreach ($interfaces as $i) {
            if (($i['name'] ?? '') === $name) {
                $iface = $i;
                break;
            }
        }

        if (! $iface) {
            return response()->json(['success' => false, 'error' => 'Interface not found'], 404);
        }

        return $this->response($iface);
    }

    public function traffic($name)
    {
        $histKey = "mikrotik_traffic_hist_{$name}";
        $history = Cache::get($histKey, []);

        return response()->json([
            'success' => true,
            'data' => $history,
        ]);
    }

    public function dhcpLeases()
    {
        $data = Cache::get('mikrotik_data_dhcp', []);

        return $this->response($data);
    }

    public function routes()
    {
        $data = Cache::get('mikrotik_data_routes', []);

        return $this->response($data);
    }

    public function firewallFilter()
    {
        $data = Cache::get('mikrotik_data_fw_filter', []);

        return $this->response($data);
    }

    public function firewallNat()
    {
        $data = Cache::get('mikrotik_data_fw_nat', []);

        return $this->response($data);
    }

    public function arp()
    {
        $data = Cache::get('mikrotik_data_arp', []);

        return $this->response($data);
    }

    public function logs()
    {
        $data = Cache::get('mikrotik_data_logs', []);

        return $this->response($data);
    }

    public function hotspot()
    {
        $data = Cache::get('mikrotik_data_wireless', []);

        return $this->response($data);
    }

    // ─── IP Addresses (Read from Cache) ───

    public function ipAddresses()
    {
        $data = Cache::get('mikrotik_data_ip_addresses', []);

        return $this->response($data);
    }

    // ─── DHCP Lease CRUD ───

    public function storeDhcpLease(Request $request)
    {
        try {
            $mikrotik = new MikrotikService;
            $result = $mikrotik->addDhcpLease($request->all());

            return response()->json(['success' => true, 'data' => $result]);
        } catch (\Exception $e) {
            return $this->error($e->getMessage());
        }
    }

    public function updateDhcpLease(Request $request, $id)
    {
        try {
            $mikrotik = new MikrotikService;
            $result = $mikrotik->updateDhcpLease($id, $request->all());

            return response()->json(['success' => true, 'data' => $result]);
        } catch (\Exception $e) {
            return $this->error($e->getMessage());
        }
    }

    public function destroyDhcpLease($id)
    {
        try {
            $mikrotik = new MikrotikService;
            $result = $mikrotik->deleteDhcpLease($id);

            return response()->json(['success' => true, 'data' => $result]);
        } catch (\Exception $e) {
            return $this->error($e->getMessage());
        }
    }

    // ─── Firewall Filter CRUD ───

    public function storeFirewallFilter(Request $request)
    {
        try {
            $mikrotik = new MikrotikService;
            $result = $mikrotik->addFirewallFilter($request->all());

            return response()->json(['success' => true, 'data' => $result]);
        } catch (\Exception $e) {
            return $this->error($e->getMessage());
        }
    }

    public function updateFirewallFilter(Request $request, $id)
    {
        try {
            $mikrotik = new MikrotikService;
            $result = $mikrotik->updateFirewallFilter($id, $request->all());

            return response()->json(['success' => true, 'data' => $result]);
        } catch (\Exception $e) {
            return $this->error($e->getMessage());
        }
    }

    public function destroyFirewallFilter($id)
    {
        try {
            $mikrotik = new MikrotikService;
            $result = $mikrotik->deleteFirewallFilter($id);

            return response()->json(['success' => true, 'data' => $result]);
        } catch (\Exception $e) {
            return $this->error($e->getMessage());
        }
    }

    // ─── Firewall NAT CRUD ───

    public function storeFirewallNat(Request $request)
    {
        try {
            $mikrotik = new MikrotikService;
            $result = $mikrotik->addFirewallNat($request->all());

            return response()->json(['success' => true, 'data' => $result]);
        } catch (\Exception $e) {
            return $this->error($e->getMessage());
        }
    }

    public function updateFirewallNat(Request $request, $id)
    {
        try {
            $mikrotik = new MikrotikService;
            $result = $mikrotik->updateFirewallNat($id, $request->all());

            return response()->json(['success' => true, 'data' => $result]);
        } catch (\Exception $e) {
            return $this->error($e->getMessage());
        }
    }

    public function destroyFirewallNat($id)
    {
        try {
            $mikrotik = new MikrotikService;
            $result = $mikrotik->deleteFirewallNat($id);

            return response()->json(['success' => true, 'data' => $result]);
        } catch (\Exception $e) {
            return $this->error($e->getMessage());
        }
    }

    // ─── IP Address CRUD ───

    public function storeIpAddress(Request $request)
    {
        try {
            $mikrotik = new MikrotikService;
            $result = $mikrotik->addIpAddress($request->all());

            return response()->json(['success' => true, 'data' => $result]);
        } catch (\Exception $e) {
            return $this->error($e->getMessage());
        }
    }

    public function updateIpAddress(Request $request, $id)
    {
        try {
            $mikrotik = new MikrotikService;
            $result = $mikrotik->updateIpAddress($id, $request->all());

            return response()->json(['success' => true, 'data' => $result]);
        } catch (\Exception $e) {
            return $this->error($e->getMessage());
        }
    }

    public function destroyIpAddress($id)
    {
        try {
            $mikrotik = new MikrotikService;
            $result = $mikrotik->deleteIpAddress($id);

            return response()->json(['success' => true, 'data' => $result]);
        } catch (\Exception $e) {
            return $this->error($e->getMessage());
        }
    }

    // ─── IP Isolation ───

    public function isolateIp(Request $request)
    {
        try {
            $ip = $request->input('ip');
            if (empty($ip)) {
                return $this->error('IP address is required', 422);
            }

            $mikrotik = new MikrotikService;
            $mikrotik->isolateIp($ip);

            return response()->json(['success' => true, 'message' => "IP {$ip} telah diisolasi"]);
        } catch (\Exception $e) {
            return $this->error($e->getMessage());
        }
    }

    public function unisolateIp(Request $request)
    {
        try {
            $ip = $request->input('ip');
            if (empty($ip)) {
                return $this->error('IP address is required', 422);
            }

            $mikrotik = new MikrotikService;
            $mikrotik->unisolateIp($ip);

            return response()->json(['success' => true, 'message' => "IP {$ip} telah diunisolasi"]);
        } catch (\Exception $e) {
            return $this->error($e->getMessage());
        }
    }

    public function isolatedIps()
    {
        try {
            $data = Cache::get('mikrotik_data_isolated_ips', []);

            return response()->json(['success' => true, 'data' => $data]);
        } catch (\Exception $e) {
            return $this->error($e->getMessage());
        }
    }

    public function hotspotActive()
    {
        try {
            $data = Cache::get('mikrotik_data_hotspot_active', []);

            return $this->response($data);
        } catch (\Exception $e) {
            return $this->error($e->getMessage());
        }
    }

    public function dns()
    {
        try {
            $data = Cache::get('mikrotik_data_dns', []);

            return $this->response($data[0] ?? null);
        } catch (\Exception $e) {
            return $this->error($e->getMessage());
        }
    }
}
