<?php

namespace App\Services;

class MikrotikService
{
    private $api;

    public function __construct()
    {
        $this->api = new RouterosAPI();
        // Optional: configure timeout or attempts if needed
        $this->api->timeout = 3;
    }

    private function connect()
    {
        $host = env('MIKROTIK_HOST', '10.10.10.1');
        $user = env('MIKROTIK_USER', 'iqbal');
        $password = env('MIKROTIK_PASSWORD', 'iqbal123');

        if (!$this->api->connect($host, $user, $password)) {
            throw new \Exception("Could not connect to MikroTik RouterOS");
        }
    }

    public function query($command, $params = [])
    {
        $this->connect();
        $result = $this->api->comm($command, $params);
        $this->api->disconnect();
        return $result;
    }

    public function getSystemResource()
    {
        $result = $this->query('/system/resource/print');
        return $result[0] ?? null;
    }

    public function getSystemIdentity()
    {
        $result = $this->query('/system/identity/print');
        return $result[0] ?? null;
    }

    public function getInterfaces()
    {
        return $this->query('/interface/print');
    }

    public function getInterface($name)
    {
        $result = $this->query('/interface/print', ['?name' => $name]);
        return $result[0] ?? null;
    }

    public function getDhcpLeases()
    {
        return $this->query('/ip/dhcp-server/lease/print');
    }

    public function getRoutes()
    {
        return $this->query('/ip/route/print');
    }

    public function getDns()
    {
        $result = $this->query('/ip/dns/print');
        return $result[0] ?? null;
    }

    public function getFirewallFilter()
    {
        return $this->query('/ip/firewall/filter/print');
    }

    public function getFirewallNat()
    {
        return $this->query('/ip/firewall/nat/print');
    }

    public function getLogs()
    {
        // Limit to last 50
        $logs = $this->query('/log/print');
        if (is_array($logs)) {
            return array_slice($logs, -50);
        }
        return [];
    }

    public function getWireless()
    {
        return $this->query('/interface/wireless/registration-table/print');
    }

    public function getArp()
    {
        return $this->query('/ip/arp/print');
    }

    public function getHotspotActive()
    {
        return $this->query('/ip/hotspot/active/print');
    }
}
