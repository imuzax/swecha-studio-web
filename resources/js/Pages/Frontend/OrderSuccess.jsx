import CustomerLayout from '@/Layouts/Frontend/CustomerLayout';
import { Head, Link } from '@inertiajs/react';

export default function OrderSuccess({ order, whatsappNumber }) {
    // Format the WhatsApp message
    const waNumber = whatsappNumber || '919588617714';
    
    let productDetails = '';
    if (order.items && order.items.length > 0) {
        order.items.forEach(item => {
            productDetails += `- ${item.quantity}x ${item.product_name}`;
            if (item.variant_info && item.variant_info.value) {
                productDetails += ` (${item.variant_info.value})`;
            }
            if (item.customization_info && item.customization_info.length > 0) {
                const opts = item.customization_info.map(c => c.option).join(', ');
                productDetails += ` [${opts}]`;
            }
            productDetails += ` - ₹${Number(item.line_total).toLocaleString('en-IN')}\n`;
        });
    }

    const message = encodeURIComponent(`Hello Swecha Studio, I have placed a new order!\n\nOrder No: ${order.order_number}\n\nProducts:\n${productDetails}\nTotal Amount: ₹${Number(order.total).toLocaleString('en-IN')}\n\nPlease let me know how to proceed with the payment to confirm my order.`);
    const waLink = `https://wa.me/${waNumber}?text=${message}`;

    return (
        <>
            <Head title={`Order ${order.order_number} - Swecha Studio`} />
            
            <div className="max-w-4xl mx-auto px-4 py-12 md:py-20 text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                </div>
                
                <h1 className="text-4xl font-bold uppercase tracking-widest mb-4">Order Received!</h1>
                <p className="text-gray-600 mb-2">Thank you for your purchase. Your order reference is <span className="font-bold text-black">{order.order_number}</span>.</p>
                <p className="text-gray-600 mb-8">We have recorded your order and it is currently pending payment.</p>

                <div className="bg-gray-50 border p-6 md:p-8 max-w-2xl mx-auto mb-8 text-left">
                    <h2 className="text-xl font-bold uppercase tracking-wider mb-6 border-b pb-4">Order Summary</h2>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 text-sm">
                        <div>
                            <p className="text-gray-500 mb-1 uppercase tracking-wider text-xs font-bold">Total</p>
                            <p className="font-sans font-bold">₹{Number(order.total).toLocaleString('en-IN')}</p>
                        </div>
                        <div>
                            <p className="text-gray-500 mb-1 uppercase tracking-wider text-xs font-bold">Amount Paid</p>
                            <p className="font-sans font-medium">₹{Number(order.amount_paid).toLocaleString('en-IN')}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-8 text-sm">
                        <div>
                            <p className="text-gray-500 mb-1 uppercase tracking-wider text-xs font-bold">Order Status</p>
                            <p className="font-medium uppercase">{order.order_status}</p>
                        </div>
                        <div>
                            <p className="text-gray-500 mb-1 uppercase tracking-wider text-xs font-bold">Payment Status</p>
                            <p className="font-medium uppercase">{order.payment_status}</p>
                        </div>
                    </div>

                    {order.items && order.items.length > 0 && (
                        <div className="border-t pt-6">
                            <h3 className="text-sm font-bold uppercase tracking-wider mb-4">Items Ordered</h3>
                            <div className="space-y-4">
                                {order.items.map(item => (
                                    <div key={item.id} className="flex justify-between items-start">
                                        <div>
                                            <p className="font-medium">{item.quantity}x {item.product_name}</p>
                                            <div className="text-xs text-gray-500 mt-1">
                                                {item.variant_info && item.variant_info.value && (
                                                    <span className="mr-2">Variant: {item.variant_info.value}</span>
                                                )}
                                                {item.customization_info && item.customization_info.length > 0 && (
                                                    <span>Customizations: {item.customization_info.map(c => c.option).join(', ')}</span>
                                                )}
                                            </div>
                                        </div>
                                        <p className="font-sans font-medium">₹{Number(item.line_total).toLocaleString('en-IN')}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="bg-emerald-50 border border-emerald-200 p-8 max-w-xl mx-auto mb-10 text-left">
                    <h2 className="text-xl font-bold uppercase tracking-wider mb-4 text-emerald-900">Confirm Your Order</h2>
                    <p className="text-sm text-emerald-800 mb-6">Since you selected manual payment, your order will be confirmed after payment is received. Please click the button below to message us directly on WhatsApp to complete your transaction via UPI or Bank Transfer.</p>
                    
                    <a href={waLink} target="_blank" rel="noopener noreferrer" className="inline-flex w-full bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold py-4 px-6 rounded transition uppercase tracking-wider items-center justify-center shadow-lg">
                        <svg className="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                        Send WhatsApp Message
                    </a>
                </div>

                <div className="flex justify-center gap-6">
                    <Link href={route('shop')} className="uppercase tracking-widest text-sm font-bold hover:text-gray-500 transition border-b border-black pb-1">
                        Return to Shop
                    </Link>
                    <Link href={route('account.orders')} className="uppercase tracking-widest text-sm font-bold hover:text-gray-500 transition border-b border-black pb-1">
                        View My Orders
                    </Link>
                </div>
            </div>
        </>
    );
}

OrderSuccess.layout = page => <CustomerLayout>{page}</CustomerLayout>;
