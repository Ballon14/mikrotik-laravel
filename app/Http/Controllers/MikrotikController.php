<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class MikrotikController extends Controller
{
    private function camelCaseKeys($array)
    {
        if (!is_array($array)) {
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
            'data' => $this->camelCaseKeys($data)
        ]);
    }

    private function error($message)
    {
        return response()->json([
            'success' => false,
            'error' => $message
        ], 500);
    }

    public function health()
    {
        return response()->json(['status' => 'ok']);
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

        if (!$iface) {
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
            'data' => $history
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
}
