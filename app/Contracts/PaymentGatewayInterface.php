<?php

namespace App\Contracts;

interface PaymentGatewayInterface
{
    /**
     * Create a new payment order/transaction on the gateway.
     */
    public function createOrder(array $data): array;

    /**
     * Verify the payment signature or transaction status.
     */
    public function verifyPayment(array $data): bool;
}
