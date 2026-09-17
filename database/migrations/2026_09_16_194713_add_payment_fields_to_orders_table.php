<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->decimal('advance_required', 10, 2)->after('total')->default(0);
            $table->decimal('amount_paid', 10, 2)->after('advance_required')->default(0);
            $table->decimal('balance_due', 10, 2)->after('amount_paid')->default(0);
            $table->string('transaction_id')->after('balance_due')->nullable();
            $table->text('payment_gateway_response')->after('transaction_id')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['advance_required', 'amount_paid', 'balance_due', 'transaction_id', 'payment_gateway_response']);
        });
    }
};
