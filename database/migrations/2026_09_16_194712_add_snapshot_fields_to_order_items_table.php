<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('order_items', function (Blueprint $table) {
            $table->string('product_name')->after('product_id')->nullable();
            $table->json('variant_info')->after('product_name')->nullable();
            $table->json('customization_info')->after('variant_info')->nullable();
            $table->decimal('line_total', 10, 2)->after('price_at_purchase')->default(0);
        });
    }

    public function down(): void
    {
        Schema::table('order_items', function (Blueprint $table) {
            $table->dropColumn(['product_name', 'variant_info', 'customization_info', 'line_total']);
        });
    }
};
