<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Product;
use Illuminate\Support\Facades\DB;

class BackfillSalesCount extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:backfill-sales-count';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Idempotently recalculate and backfill products.sales_count based on valid order items.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting sales count backfill...');

        // Set all to 0 first to make it idempotent
        Product::query()->update(['sales_count' => 0]);

        $sales = DB::table('order_items')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->where('orders.is_stock_deducted', true)
            ->select('order_items.product_id', DB::raw('SUM(order_items.quantity) as total_sales'))
            ->groupBy('order_items.product_id')
            ->get();

        $updatedCount = 0;
        foreach ($sales as $sale) {
            Product::where('id', $sale->product_id)->update(['sales_count' => $sale->total_sales]);
            $updatedCount++;
        }

        $this->info("Successfully updated sales count for {$updatedCount} products.");
    }
}
