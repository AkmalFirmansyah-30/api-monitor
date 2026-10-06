<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('monitored_apis', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->string('name');
            $table->text('url');
            $table->string('method', 10)->default('GET');

            $table->unsignedInteger('timeout')->default(10);
            $table->unsignedInteger('interval')->default(5);

            $table->string('status', 20)->default('UP');

            $table->unsignedInteger('response_time')->nullable();

            $table->decimal('uptime', 5, 2)->default(100.00);

            $table->timestamp('last_checked_at')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('monitored_apis');
    }
};