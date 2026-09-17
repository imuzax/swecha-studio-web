<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('customization_options', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customization_id')->constrained()->cascadeOnDelete();
            $table->string('name'); // e.g., 'Colour', 'Gold Foil'
            $table->decimal('price_adjustment', 10, 2)->default(0); // e.g., 5.00, 10.00
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('customization_options');
    }
};
