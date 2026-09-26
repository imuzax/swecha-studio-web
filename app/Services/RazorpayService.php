<?php

namespace App\Services;

use App\Contracts\PaymentGatewayInterface;
use Razorpay\Api\Api;
use Illuminate\Support\Facades\Log;

class RazorpayService implements PaymentGatewayInterface
{
    protected $key;
    protected $secret;
    protected $api;

    public function __construct()
    {
        $this->key = config('services.razorpay.key');
        $this->secret = config('services.razorpay.secret');
        if ($this->key && $this->secret) {
            $this->api = new Api($this->key, $this->secret);
        }
    }

    public function createOrder(array $data): array
    {
        if (!$this->api) {
            throw new \LogicException('Razorpay credentials are not configured.');
        }

        try {
            $orderData = [
                'receipt'         => $data['receipt'] ?? uniqid(),
                'amount'          => intval(round($data['amount'] * 100)), // amount in paise
                'currency'        => 'INR',
                'payment_capture' => 1 // auto capture
            ];

            $razorpayOrder = $this->api->order->create($orderData);

            return [
                'id' => $razorpayOrder['id'],
                'amount' => $orderData['amount'],
                'currency' => $orderData['currency']
            ];
        } catch (\Exception $e) {
            Log::error('Razorpay Order Creation Failed: ' . $e->getMessage());
            throw $e;
        }
    }

    public function verifyPayment(array $data): bool
    {
        if (!$this->api) {
            return false;
        }

        try {
            $attributes = [
                'razorpay_order_id' => $data['razorpay_order_id'],
                'razorpay_payment_id' => $data['razorpay_payment_id'],
                'razorpay_signature' => $data['razorpay_signature']
            ];

            $this->api->utility->verifyPaymentSignature($attributes);
            return true;
        } catch (\Exception $e) {
            Log::error('Razorpay Signature Verification Failed: ' . $e->getMessage());
            return false;
        }
    }
}
