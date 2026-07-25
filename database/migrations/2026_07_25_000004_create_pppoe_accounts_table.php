<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pppoe_accounts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')->constrained('customers')->onDelete('cascade');
            $table->foreignId('router_id')->nullable()->constrained('routers')->onDelete('set null');
            $table->string('username')->unique();
            $table->string('password');
            $table->string('profile')->nullable();
            $table->string('ip_address')->nullable();
            $table->string('service')->default('pppoe');
            $table->boolean('disabled')->default(false);
            $table->timestamp('last_sync_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pppoe_accounts');
    }
};
