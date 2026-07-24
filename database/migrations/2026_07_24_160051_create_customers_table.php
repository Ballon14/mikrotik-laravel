<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('customers', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('phone')->nullable();
            $table->text('address')->nullable();
            $table->string('pppoe_username')->unique();
            $table->string('pppoe_password');
            $table->foreignId('package_id')->constrained('packages')->onDelete('cascade');
            $table->enum('status', ['active', 'inactive', 'isolated'])->default('active');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('customers');
    }
};
