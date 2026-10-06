<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('incidents', function (Blueprint $table) {
            $table->id();

            $table->foreignId('monitored_api_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->string('title');
            $table->string('status', 20)->default('OPEN');

            $table->timestamp('started_at');
            $table->timestamp('resolved_at')->nullable();

            $table->text('description')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('incidents');
    }
};