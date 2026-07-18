<?php

namespace App\Services;

/**
 * RouterOS API class for PHP
 */
class RouterosAPI
{
    public $debug = false;
    public $connected = false;
    public $port = 8728;
    public $timeout = 3;
    public $attempts = 5;
    public $delay = 3;
    public $error_no;
    public $error_str;

    private $socket;

    public function __construct()
    {
    }

    public function connect($ip, $login, $password)
    {
        for ($ATTEMPT = 1; $ATTEMPT <= $this->attempts; $ATTEMPT++) {
            $this->connected = false;
            $this->error_no = 0;
            $this->error_str = "";
            
            $this->socket = @fsockopen($ip, $this->port, $this->error_no, $this->error_str, $this->timeout);
            
            if ($this->socket) {
                stream_set_timeout($this->socket, $this->timeout);
                $this->write('/login', false);
                $this->write('=name=' . $login, false);
                $this->write('=password=' . $password);
                $RESPONSE = $this->read(false);
                
                if (isset($RESPONSE[0]) && $RESPONSE[0] === '!done') {
                    // Check if it's the old MD5 challenge method
                    $MATCHES = [];
                    if (isset($RESPONSE[1]) && preg_match('/^=ret=(.*)$/', $RESPONSE[1], $MATCHES)) {
                        $this->write('/login', false);
                        $this->write('=name=' . $login, false);
                        $this->write('=response=00' . md5(chr(0) . $password . pack('H*', $MATCHES[1])));
                        $RESPONSE = $this->read(false);
                        if (isset($RESPONSE[0]) && $RESPONSE[0] === '!done') {
                            $this->connected = true;
                            break;
                        }
                    } else {
                        // Modern login successful
                        $this->connected = true;
                        break;
                    }
                }
                fclose($this->socket);
            }
            sleep($this->delay);
        }
        
        return $this->connected;
    }

    public function disconnect()
    {
        if ($this->connected) {
            fclose($this->socket);
            $this->connected = false;
        }
    }

    public function comm($com, $arr = [])
    {
        if (!$this->connected) {
            return false;
        }
        
        $this->write($com, !empty($arr) ? false : true);
        
        if (!empty($arr)) {
            $count = count($arr);
            $i = 0;
            foreach ($arr as $k => $v) {
                $i++;
                $this->write(
                    ($k[0] == '?' ? '' : '=') . $k . '=' . $v,
                    ($i == $count) ? true : false
                );
            }
        }
        
        return $this->read();
    }

    private function write($command, $end = true)
    {
        if ($this->debug) {
            echo "Write: $command\n";
        }
        $length = strlen($command);
        
        if ($length < 0x80) {
            fwrite($this->socket, chr($length));
        } elseif ($length < 0x4000) {
            $length |= 0x8000;
            fwrite($this->socket, chr(($length >> 8) & 0xFF) . chr($length & 0xFF));
        } elseif ($length < 0x200000) {
            $length |= 0xC00000;
            fwrite($this->socket, chr(($length >> 16) & 0xFF) . chr(($length >> 8) & 0xFF) . chr($length & 0xFF));
        } elseif ($length < 0x10000000) {
            $length |= 0xE0000000;
            fwrite($this->socket, chr(($length >> 24) & 0xFF) . chr(($length >> 16) & 0xFF) . chr(($length >> 8) & 0xFF) . chr($length & 0xFF));
        } elseif ($length >= 0x10000000) {
            fwrite($this->socket, chr(0xF0) . chr(($length >> 24) & 0xFF) . chr(($length >> 16) & 0xFF) . chr(($length >> 8) & 0xFF) . chr($length & 0xFF));
        }
        
        fwrite($this->socket, $command);
        if ($end) {
            fwrite($this->socket, chr(0));
        }
    }

    private function readWord()
    {
        $byteStr = fread($this->socket, 1);
        if ($byteStr === false || strlen($byteStr) === 0) return '';
        $byte = ord($byteStr);
        
        $length = 0;
        if ($byte & 0x80) {
            if (($byte & 0xC0) == 0x80) {
                $length = (($byte & 0x3F) << 8) | ord(fread($this->socket, 1));
            } elseif (($byte & 0xE0) == 0xC0) {
                $length = (($byte & 0x1F) << 16) | (ord(fread($this->socket, 1)) << 8) | ord(fread($this->socket, 1));
            } elseif (($byte & 0xF0) == 0xE0) {
                $length = (($byte & 0x0F) << 24) | (ord(fread($this->socket, 1)) << 16) | (ord(fread($this->socket, 1)) << 8) | ord(fread($this->socket, 1));
            } elseif (($byte & 0xF8) == 0xF0) {
                $length = (ord(fread($this->socket, 1)) << 24) | (ord(fread($this->socket, 1)) << 16) | (ord(fread($this->socket, 1)) << 8) | ord(fread($this->socket, 1));
            }
        } else {
            $length = $byte;
        }

        if ($length > 0) {
            $ret = "";
            $ro = 0;
            while ($ro < $length) {
                $chunk = fread($this->socket, $length - $ro);
                if ($chunk === false || strlen($chunk) === 0) break;
                $ret .= $chunk;
                $ro += strlen($chunk);
            }
            if ($this->debug) {
                echo "Read: $ret\n";
            }
            return $ret;
        }
        return '';
    }

    private function read($parse = true)
    {
        $RESPONSE = [];
        $receivedDone = false;
        
        while (true) {
            $word = $this->readWord();
            
            if ($word === '') {
                if ($receivedDone) {
                    break;
                }
            } else {
                $RESPONSE[] = $word;
                if ($word === '!done' || $word === '!fatal') {
                    $receivedDone = true;
                }
            }
        }
        
        if ($parse) {
            return $this->parseResponse($RESPONSE);
        }
        
        return $RESPONSE;
    }

    private function parseResponse($response)
    {
        $result = [];
        $i = 0;
        foreach ($response as $r) {
            if ($r === '!re') {
                $i++;
            } elseif (preg_match('/^=([^=]+)=(.*)$/s', $r, $matches)) {
                $result[$i][$matches[1]] = $matches[2];
            }
        }
        return array_values($result);
    }
}
