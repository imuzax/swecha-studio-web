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
        Schema::table('product_activities', function (Blueprint $table) {
            $table->string('session_id')->nullable()->index()->after('user_id');
        });

        Schema::table('recently_viewed_products', function (Blueprint $table) {
            // Drop foreign keys so we can safely drop primary key and modify user_id
            $table->dropForeign(['user_id']);
            $table->dropForeign(['product_id']);
            
            // Drop composite primary key
            $table->dropPrimary(['user_id', 'product_id']);
        });

        Schema::table('recently_viewed_products', function (Blueprint $table) {
            // Add auto-incrementing id as primary key
            $table->id()->first();
            // Modify user_id to be nullable
            $table->unsignedBigInteger('user_id')->nullable()->change();
            // Add session_id
            $table->string('session_id')->nullable()->index()->after('user_id');
            // Add unique constraints to prevent duplicates per user or per session
            $table->unique(['user_id', 'product_id']);
            $table->unique(['session_id', 'product_id']);
            
            // Re-add foreign keys
            $table->foreign('user_id')->references('id')->on('users')->nullOnDelete();
            $table->foreign('product_id')->references('id')->on('products')->cascadeOnDelete();
        });

        Schema::table('products', function (Blueprint $table) {
            $table->integer('views_count')->default(0)->index()->after('sales_count');
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn('views_count');
        });

        Schema::table('recently_viewed_products', function (Blueprint $table) {
            $table->dropUnique(['session_id', 'product_id']);
            $table->dropUnique(['user_id', 'product_id']);
            $table->dropColumn('session_id');
            $table->dropColumn('id');
            
            // To restore, user_id can't easily be made non-nullable if nulls exist, 
            // but we'll try to reverse the structure as best we can.
            // (In a real down() we'd delete null user_id rows first)
            $table->primary(['user_id', 'product_id']);
        });

        Schema::table('product_activities', function (Blueprint $table) {
            $table->dropColumn('session_id');
        });
    }
};
