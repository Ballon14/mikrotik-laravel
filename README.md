# 📡 MikroTik Dashboard Monitor (Laravel)

A modern, high-performance web dashboard for monitoring your MikroTik RouterOS devices. Built with **Laravel**, this dashboard uses a background daemon architecture to provide real-time metrics without spamming router logs or consuming excessive router CPU.

## ✨ Features

- **📊 Real-time System Overview:** Monitor CPU Load, RAM Usage, Storage, and Uptime.
- **📈 Traffic Monitoring:** Live RX/TX traffic charts (Kibps, Mibps, Gibps) rendered via HTML5 Canvas.
- **🔌 Interfaces:** Status, MAC addresses, and total traffic for all network interfaces.
- **📋 Network Data:** View DHCP Leases, ARP Table, Routing Table, and Firewall Rules (Filter & NAT).
- **📶 Services:** Monitor active Hotspot users and view real-time system logs.

## 🏗️ Architecture Highlight: Background Polling

To prevent the classic issue of API login spam (where PHP's stateless nature causes constant login/logout loops on the MikroTik router), this application implements an **Enterprise-grade Background Daemon**. 

- You run `php artisan mikrotik:monitor` in the background.
- It establishes a **single persistent connection** to the router.
- It continuously fetches data and stores it in Laravel's memory `Cache`.
- The Web Dashboard reads directly from `Cache` instantly, resulting in sub-millisecond response times and a clean Winbox log!

---

## 🚀 Installation & Setup

### 1. Requirements
- PHP 8.1+
- Composer
- Node.js & NPM
- A MikroTik Router with the API service enabled (Port `8728`). To enable it on your router:
  ```routeros
  /ip service set api disabled=no
  ```

### 2. Clone and Install Dependencies
```bash
# Install PHP dependencies
composer install

# Install Frontend dependencies
npm install

# Build frontend assets (Vite)
npm run build
```

### 3. Environment Configuration
Copy the `.env.example` file to `.env` and generate an application key:
```bash
cp .env.example .env
php artisan key:generate
```

Add your MikroTik credentials to the bottom of the `.env` file:
```env
MIKROTIK_HOST=192.168.88.1
MIKROTIK_USER=admin
MIKROTIK_PASSWORD=yourpassword
```
*(Note: Do not include `http://` or port numbers in the host, just the IP address).*

### 4. Run the Application

You need to run **two** separate processes for the dashboard to function perfectly. Open two terminal windows:

**Terminal 1 (The Polling Daemon):**
```bash
php artisan mikrotik:monitor
```
*Leave this running. This process connects to the router and caches the data.*

**Terminal 2 (The Web Server):**
```bash
php artisan serve
```

### 5. Access the Dashboard
Open your web browser and navigate to:
**http://localhost:8000**

---

## 🛠️ Technology Stack
- **Backend:** Laravel (PHP)
- **Frontend:** Blade Templates, Vanilla JavaScript, Vanilla CSS
- **Bundler:** Vite
- **Router API:** Plaintext API Login (Compatible with RouterOS v6.43+)

## 📝 License
This project is open-sourced software licensed under the MIT license.
