<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bulk_enquiries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name');
            $table->string('email');
            $table->string('phone');
            $table->foreignId('product_id')->nullable()->constrained()->nullOnDelete();
            $table->string('reference_info')->nullable();
            $table->integer('requested_quantity');
            $table->text('customization_requirements')->nullable();
            $table->text('message')->nullable();
            $table->string('status')->default('pending'); // pending, reviewed, contacted, closed
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bulk_enquiries');
    }
};
