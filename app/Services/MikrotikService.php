<?php

namespace App\Services;

class MikrotikService
{
    private $api;

    public function __construct()
    {
        $this->api = new RouterosAPI;
        // Optional: configure timeout or attempts if needed
        $this->api->timeout = 3;
    }

    private function connect()
    {
        $host = config('mikrotik.host');
        $user = config('mikrotik.user');
        $password = config('mikrotik.password');

        if (! $this->api->connect($host, $user, $password)) {
            throw new \Exception('Could not connect to MikroTik RouterOS');
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

    public function getPppProfiles()
    {
        return $this->query('/ppp/profile/print');
    }

    // ─── IP Addresses ───

    public function getIpAddresses()
    {
        return $this->query('/ip/address/print');
    }

    // ─── Write Operations (CRUD) ───

    public function execute($command, $params = [])
    {
        $this->connect();
        $result = $this->api->comm($command, $params);
        $this->api->disconnect();

        return $result;
    }

    // ─── DHCP Lease CRUD ───

    public function addDhcpLease($data)
    {
        $params = [];
        if (! empty($data['address'])) {
            $params['address'] = $data['address'];
        }
        if (! empty($data['mac-address'])) {
            $params['mac-address'] = $data['mac-address'];
        }
        if (! empty($data['server'])) {
            $params['server'] = $data['server'];
        }
        if (! empty($data['comment'])) {
            $params['comment'] = $data['comment'];
        }

        return $this->execute('/ip/dhcp-server/lease/add', $params);
    }

    public function updateDhcpLease($id, $data)
    {
        $params = ['.id' => $id];
        if (isset($data['address'])) {
            $params['address'] = $data['address'];
        }
        if (isset($data['mac-address'])) {
            $params['mac-address'] = $data['mac-address'];
        }
        if (isset($data['server'])) {
            $params['server'] = $data['server'];
        }
        if (isset($data['comment'])) {
            $params['comment'] = $data['comment'];
        }

        return $this->execute('/ip/dhcp-server/lease/set', $params);
    }

    public function deleteDhcpLease($id)
    {
        return $this->execute('/ip/dhcp-server/lease/remove', ['.id' => $id]);
    }

    // ─── Firewall Filter CRUD ───

    public function addFirewallFilter($data)
    {
        $params = [];
        if (! empty($data['chain'])) {
            $params['chain'] = $data['chain'];
        }
        if (! empty($data['action'])) {
            $params['action'] = $data['action'];
        }
        if (! empty($data['src-address'])) {
            $params['src-address'] = $data['src-address'];
        }
        if (! empty($data['dst-address'])) {
            $params['dst-address'] = $data['dst-address'];
        }
        if (! empty($data['protocol'])) {
            $params['protocol'] = $data['protocol'];
        }
        if (! empty($data['dst-port'])) {
            $params['dst-port'] = $data['dst-port'];
        }
        if (! empty($data['src-port'])) {
            $params['src-port'] = $data['src-port'];
        }
        if (! empty($data['in-interface'])) {
            $params['in-interface'] = $data['in-interface'];
        }
        if (! empty($data['out-interface'])) {
            $params['out-interface'] = $data['out-interface'];
        }
        if (! empty($data['comment'])) {
            $params['comment'] = $data['comment'];
        }
        if (isset($data['disabled'])) {
            $params['disabled'] = $data['disabled'];
        }

        return $this->execute('/ip/firewall/filter/add', $params);
    }

    public function updateFirewallFilter($id, $data)
    {
        $params = ['.id' => $id];
        if (isset($data['chain'])) {
            $params['chain'] = $data['chain'];
        }
        if (isset($data['action'])) {
            $params['action'] = $data['action'];
        }
        if (isset($data['src-address'])) {
            $params['src-address'] = $data['src-address'];
        }
        if (isset($data['dst-address'])) {
            $params['dst-address'] = $data['dst-address'];
        }
        if (isset($data['protocol'])) {
            $params['protocol'] = $data['protocol'];
        }
        if (isset($data['dst-port'])) {
            $params['dst-port'] = $data['dst-port'];
        }
        if (isset($data['src-port'])) {
            $params['src-port'] = $data['src-port'];
        }
        if (isset($data['in-interface'])) {
            $params['in-interface'] = $data['in-interface'];
        }
        if (isset($data['out-interface'])) {
            $params['out-interface'] = $data['out-interface'];
        }
        if (isset($data['comment'])) {
            $params['comment'] = $data['comment'];
        }
        if (isset($data['disabled'])) {
            $params['disabled'] = $data['disabled'];
        }

        return $this->execute('/ip/firewall/filter/set', $params);
    }

    public function deleteFirewallFilter($id)
    {
        return $this->execute('/ip/firewall/filter/remove', ['.id' => $id]);
    }

    // ─── Firewall NAT CRUD ───

    public function addFirewallNat($data)
    {
        $params = [];
        if (! empty($data['chain'])) {
            $params['chain'] = $data['chain'];
        }
        if (! empty($data['action'])) {
            $params['action'] = $data['action'];
        }
        if (! empty($data['src-address'])) {
            $params['src-address'] = $data['src-address'];
        }
        if (! empty($data['dst-address'])) {
            $params['dst-address'] = $data['dst-address'];
        }
        if (! empty($data['protocol'])) {
            $params['protocol'] = $data['protocol'];
        }
        if (! empty($data['dst-port'])) {
            $params['dst-port'] = $data['dst-port'];
        }
        if (! empty($data['to-addresses'])) {
            $params['to-addresses'] = $data['to-addresses'];
        }
        if (! empty($data['to-ports'])) {
            $params['to-ports'] = $data['to-ports'];
        }
        if (! empty($data['in-interface'])) {
            $params['in-interface'] = $data['in-interface'];
        }
        if (! empty($data['out-interface'])) {
            $params['out-interface'] = $data['out-interface'];
        }
        if (! empty($data['comment'])) {
            $params['comment'] = $data['comment'];
        }
        if (isset($data['disabled'])) {
            $params['disabled'] = $data['disabled'];
        }

        return $this->execute('/ip/firewall/nat/add', $params);
    }

    public function updateFirewallNat($id, $data)
    {
        $params = ['.id' => $id];
        if (isset($data['chain'])) {
            $params['chain'] = $data['chain'];
        }
        if (isset($data['action'])) {
            $params['action'] = $data['action'];
        }
        if (isset($data['src-address'])) {
            $params['src-address'] = $data['src-address'];
        }
        if (isset($data['dst-address'])) {
            $params['dst-address'] = $data['dst-address'];
        }
        if (isset($data['protocol'])) {
            $params['protocol'] = $data['protocol'];
        }
        if (isset($data['dst-port'])) {
            $params['dst-port'] = $data['dst-port'];
        }
        if (isset($data['to-addresses'])) {
            $params['to-addresses'] = $data['to-addresses'];
        }
        if (isset($data['to-ports'])) {
            $params['to-ports'] = $data['to-ports'];
        }
        if (isset($data['in-interface'])) {
            $params['in-interface'] = $data['in-interface'];
        }
        if (isset($data['out-interface'])) {
            $params['out-interface'] = $data['out-interface'];
        }
        if (isset($data['comment'])) {
            $params['comment'] = $data['comment'];
        }
        if (isset($data['disabled'])) {
            $params['disabled'] = $data['disabled'];
        }

        return $this->execute('/ip/firewall/nat/set', $params);
    }

    public function deleteFirewallNat($id)
    {
        return $this->execute('/ip/firewall/nat/remove', ['.id' => $id]);
    }

    // ─── IP Address CRUD ───

    public function addIpAddress($data)
    {
        $params = [];
        if (! empty($data['address'])) {
            $params['address'] = $data['address'];
        }
        if (! empty($data['interface'])) {
            $params['interface'] = $data['interface'];
        }
        if (! empty($data['network'])) {
            $params['network'] = $data['network'];
        }
        if (! empty($data['comment'])) {
            $params['comment'] = $data['comment'];
        }
        if (isset($data['disabled'])) {
            $params['disabled'] = $data['disabled'];
        }

        return $this->execute('/ip/address/add', $params);
    }

    public function updateIpAddress($id, $data)
    {
        $params = ['.id' => $id];
        if (isset($data['address'])) {
            $params['address'] = $data['address'];
        }
        if (isset($data['interface'])) {
            $params['interface'] = $data['interface'];
        }
        if (isset($data['network'])) {
            $params['network'] = $data['network'];
        }
        if (isset($data['comment'])) {
            $params['comment'] = $data['comment'];
        }
        if (isset($data['disabled'])) {
            $params['disabled'] = $data['disabled'];
        }

        return $this->execute('/ip/address/set', $params);
    }

    public function deleteIpAddress($id)
    {
        return $this->execute('/ip/address/remove', ['.id' => $id]);
    }

    // ─── IP Isolation ───

    const ISOLATE_COMMENT_PREFIX = 'ISOLASI_IP::';

    public function isolateIp($ip)
    {
        $comment = self::ISOLATE_COMMENT_PREFIX.$ip;

        // Rule 1: Block outgoing traffic (src)
        $this->execute('/ip/firewall/filter/add', [
            'chain' => 'forward',
            'src-address' => $ip,
            'action' => 'drop',
            'comment' => $comment,
        ]);

        // Rule 2: Block incoming traffic (dst)
        $this->execute('/ip/firewall/filter/add', [
            'chain' => 'forward',
            'dst-address' => $ip,
            'action' => 'drop',
            'comment' => $comment,
        ]);

        return true;
    }

    public function unisolateIp($ip)
    {
        $comment = self::ISOLATE_COMMENT_PREFIX.$ip;

        // Fetch ALL filter rules, then filter by comment in PHP
        // (RouterOS API ?comment filter is unreliable across versions)
        $rules = $this->query('/ip/firewall/filter/print');

        if (is_array($rules)) {
            foreach ($rules as $rule) {
                $ruleComment = $rule['comment'] ?? '';
                if ($ruleComment === $comment && isset($rule['.id'])) {
                    $this->execute('/ip/firewall/filter/remove', ['.id' => $rule['.id']]);
                }
            }
        }

        return true;
    }

    public function getIsolatedIps()
    {
        $rules = $this->query('/ip/firewall/filter/print');
        $isolated = [];

        if (is_array($rules)) {
            foreach ($rules as $rule) {
                $comment = $rule['comment'] ?? '';
                if (str_starts_with($comment, self::ISOLATE_COMMENT_PREFIX)) {
                    $ip = substr($comment, strlen(self::ISOLATE_COMMENT_PREFIX));
                    if (! in_array($ip, $isolated)) {
                        $isolated[] = $ip;
                    }
                }
            }
        }

        return $isolated;
    }
}
