<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('api_checks', function (Blueprint $table) {
            $table->id();

            $table->foreignId('monitored_api_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->string('status', 20);

            $table->unsignedSmallInteger('status_code')->nullable();

            $table->unsignedInteger('response_time')->nullable();

            $table->text('error_message')->nullable();

            $table->timestamp('checked_at');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('api_checks');
    }
};