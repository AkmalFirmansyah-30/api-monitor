<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('monitoring_rules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('monitored_api_id')
                ->constrained('monitored_apis')
                ->onDelete('cascade');
            $table->json('expected_status_codes')->nullable();
            $table->string('body_keyword')->nullable();
            $table->string('json_path')->nullable();
            $table->json('json_expected_value')->nullable();
            $table->integer('warning_response_time_ms')->nullable()->unsigned();
            $table->integer('failure_response_time_ms')->nullable()->unsigned();
            $table->timestamps();

            // Unique constraint: one rule per monitored API
            $table->unique(['monitored_api_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('monitoring_rules');
    }
};