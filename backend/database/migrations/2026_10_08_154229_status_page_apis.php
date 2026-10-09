<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('status_page_apis', function (Blueprint $table) {
            $table->id();
            $table->foreignId('status_page_id')->constrained()->onDelete('cascade');
            $table->foreignId('monitored_api_id')->constrained()->onDelete('cascade');
            $table->integer('sort_order')->default(0);
            $table->timestamps();
            $table->unique(['status_page_id', 'monitored_api_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('status_page_apis');
    }
};