<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class SystemController extends Controller
{
    public function exportOrders()
    {
        $orders = Order::with('user')->latest()->get();
        $csvFileName = 'swecha_orders_report_' . date('Y-m-d_H-i') . '.csv';

        $headers = [
            "Content-type"        => "text/csv",
            "Content-Disposition" => "attachment; filename=$csvFileName",
            "Pragma"              => "no-cache",
            "Cache-Control"       => "must-revalidate, post-check=0, pre-check=0",
            "Expires"             => "0"
        ];

        $columns = ['Order ID', 'Order Number', 'Customer Name', 'Customer Email', 'Status', 'Payment Status', 'Total Amount', 'Created At'];

        $callback = function() use($orders, $columns) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $columns);

            foreach ($orders as $order) {
                $row = [
                    $order->id,
                    $order->order_number,
                    $order->user ? $order->user->name : 'Guest',
                    $order->user ? $order->user->email : 'N/A',
                    $order->order_status,
                    $order->payment_status,
                    $order->total,
                    $order->created_at->format('Y-m-d H:i:s')
                ];
                fputcsv($file, $row);
            }
            fclose($file);
        };

        return Response::stream($callback, 200, $headers);
    }

    public function downloadBackup()
    {
        try {
            $dbName = config('database.connections.mysql.database', env('DB_DATABASE'));
            $dbUser = config('database.connections.mysql.username', env('DB_USERNAME'));
            $dbPass = config('database.connections.mysql.password', env('DB_PASSWORD'));
            $dbHost = config('database.connections.mysql.host', env('DB_HOST', '127.0.0.1'));

            $fileName = 'swecha_backup_' . date('Y-m-d_H-i-s') . '.sql';
            $filePath = storage_path('app/' . $fileName);

            $command = sprintf(
                'mysqldump --user="%s" --password="%s" --host="%s" "%s" > "%s"',
                $dbUser,
                $dbPass,
                $dbHost,
                $dbName,
                $filePath
            );

            exec($command);

            if (file_exists($filePath)) {
                return response()->download($filePath)->deleteFileAfterSend(true);
            }

            return back()->with('error', 'Backup failed: File not created.');
        } catch (\Exception $e) {
            Log::error('Backup Error: ' . $e->getMessage());
            return back()->with('error', 'Backup failed. Please check logs.');
        }
    }
}
