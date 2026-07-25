@extends('layouts.guest')

@section('content')
<div class="login-container">
    <div class="login-card">
        <div class="login-logo">
            <i data-lucide="radio" style="width:32px;height:32px;color:#22d3ee;"></i>
            <h1>MikroTik</h1>
            <span>Dashboard & Billing</span>
        </div>

        <div class="login-error" id="loginError"></div>

        <form id="loginForm" class="crud-form login-form-clean">
            <div class="form-group">
                <label for="email">Email</label>
                <input type="email" id="email" name="email" placeholder="admin@billing.com" required autofocus>
            </div>

            <div class="form-group">
                <label for="password">Password</label>
                <input type="password" id="password" name="password" placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;" required>
            </div>

            <div class="form-group checkbox-group">
                <label>
                    <input type="checkbox" id="remember" name="remember">
                    <span>Ingat Saya</span>
                </label>
            </div>

            <button type="submit" class="login-btn" id="loginBtn">Login</button>
        </form>
    </div>
</div>

<script>
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('loginForm');
    const errorDiv = document.getElementById('loginError');
    const btn = document.getElementById('loginBtn');

    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        btn.disabled = true;
        btn.textContent = 'Memverifikasi...';
        errorDiv.style.display = 'none';

        try {
            const res = await fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    email: form.email.value,
                    password: form.password.value,
                    remember: form.remember.checked
                })
            });

            const data = await res.json();

            if (res.ok && data.success) {
                window.location.href = '/';
            } else {
                errorDiv.textContent = data.message || 'Login gagal. Periksa kembali email dan password Anda.';
                errorDiv.style.display = 'block';
                btn.disabled = false;
                btn.textContent = 'Login';
            }
        } catch (err) {
            errorDiv.textContent = 'Terjadi kesalahan jaringan.';
            errorDiv.style.display = 'block';
            btn.disabled = false;
            btn.textContent = 'Login';
        }
    });
});
</script>
@endsection
