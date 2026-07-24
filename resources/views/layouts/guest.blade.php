<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Login - MikroTik Billing & Dashboard</title>
    @vite(['resources/css/app.css', 'resources/js/app.js'])
    <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>📡</text></svg>">
    <style>
        body {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            background: var(--bg-primary);
        }
        .login-container {
            width: 100%;
            max-width: 400px;
            padding: 20px;
        }
        .login-card {
            background: var(--bg-secondary);
            border: 1px solid var(--border-color);
            border-radius: 16px;
            padding: 40px 30px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4), 0 0 40px rgba(56, 189, 248, 0.05);
            animation: slideUp 0.4s ease;
        }
        .login-logo {
            text-align: center;
            margin-bottom: 30px;
        }
        .login-logo-icon {
            font-size: 48px;
            margin-bottom: 10px;
            display: inline-block;
        }
        .login-logo h1 {
            font-size: 24px;
            font-weight: 700;
            color: var(--text-primary);
            margin: 0;
            letter-spacing: -0.5px;
        }
        .login-logo span {
            color: var(--accent-cyan);
            font-size: 14px;
            font-weight: 500;
        }
        .login-error {
            display: none;
            background: rgba(248, 113, 113, 0.1);
            border: 1px solid rgba(248, 113, 113, 0.2);
            color: var(--accent-red);
            padding: 12px 16px;
            border-radius: 8px;
            font-size: 13px;
            margin-bottom: 20px;
            text-align: center;
        }
        .login-btn {
            width: 100%;
            padding: 12px;
            margin-top: 10px;
            background: linear-gradient(135deg, rgba(34, 211, 238, 0.2), rgba(56, 189, 248, 0.2));
            border: 1px solid rgba(34, 211, 238, 0.3);
            border-radius: 8px;
            color: var(--accent-cyan);
            font-size: 14px;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.2s ease;
        }
        .login-btn:hover {
            background: linear-gradient(135deg, rgba(34, 211, 238, 0.3), rgba(56, 189, 248, 0.3));
            box-shadow: 0 4px 16px rgba(34, 211, 238, 0.15);
        }
        .login-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
    </style>
</head>
<body>
    @yield('content')
</body>
</html>
