import CustomerPortalLayout from '@/Layouts/Frontend/CustomerPortalLayout';
import CustomerLayout from '@/Layouts/Frontend/CustomerLayout';
import { Head, Link } from '@inertiajs/react';

export default function OrderDetails({ order }) {
    return (
        <CustomerPortalLayout>
            <div className="flex items-center justify-between mb-6">
                <h2 className="font-semibold text-2xl text-gray-900">Order #{order.order_number}</h2>
                <Link href={route('account.orders')} className="text-sm text-brand-600 hover:underline">
                    &larr; Back to Orders
                </Link>
            </div>
            <Head title={`Order ${order.order_number} - Swecha Studio`} />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    
                        <div className="mb-6 flex justify-between items-end">
                            <div>
                                <Link href={route('account.orders')} className="text-gray-500 hover:text-black uppercase tracking-widest text-xs font-bold mb-4 inline-block">&larr; Back to Orders</Link>
                                <h1 className="text-3xl font-bold uppercase tracking-widest">Order Details</h1>
                                <p className="text-gray-600 mt-2">Placed on {new Date(order.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                        </div>

                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-8">
                        <div className="p-6">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">Order Status</p>
                                    <p className="font-medium uppercase">{order.order_status}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">Payment Method</p>
                                    <p className="font-medium uppercase">{order.payment_method}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">Payment Status</p>
                                    <p className="font-medium uppercase">{order.payment_status}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">Total</p>
                                    <p className="font-sans font-bold text-lg">₹{Number(order.total).toLocaleString('en-IN')}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {(order.courier_name || order.tracking_number) && (
                        <div className="bg-emerald-50 border border-emerald-200 overflow-hidden shadow-sm sm:rounded-lg mb-8">
                            <div className="p-6">
                                <h2 className="text-lg font-bold text-emerald-800 uppercase tracking-widest border-b border-emerald-200 pb-4 mb-6 flex items-center gap-2">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"></path></svg>
                                    Tracking Information
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-emerald-900">
                                    {order.courier_name && (
                                        <div>
                                            <p className="text-xs font-bold uppercase tracking-widest text-emerald-700 mb-1">Courier Partner</p>
                                            <p className="font-medium text-lg">{order.courier_name}</p>
                                        </div>
                                    )}
                                    {order.tracking_number && (
                                        <div>
                                            <p className="text-xs font-bold uppercase tracking-widest text-emerald-700 mb-1">Tracking Number (AWB)</p>
                                            <p className="font-medium text-lg">{order.tracking_number}</p>
                                        </div>
                                    )}
                                    {order.tracking_url && (
                                        <div>
                                            <p className="text-xs font-bold uppercase tracking-widest text-emerald-700 mb-1">Track Online</p>
                                            <a href={order.tracking_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-bold text-emerald-700 hover:text-emerald-900 underline mt-1">
                                                Click to Track Package
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-8">
                        <div className="p-6">
                            <h2 className="text-lg font-bold uppercase tracking-widest border-b pb-4 mb-6">Items</h2>
                            <div className="space-y-6">
                                {order.items.map(item => (
                                    <div key={item.id} className="flex justify-between items-start">
                                        <div>
                                            <p className="font-bold">{item.quantity}x {item.product_name}</p>
                                            <div className="text-sm text-gray-600 mt-1">
                                                {item.variant_info && item.variant_info.value && (
                                                    <p>Variant: <span className="font-medium text-black">{item.variant_info.value}</span></p>
                                                )}
                                                {item.customization_info && item.customization_info.length > 0 && (
                                                    <p>Customizations: <span className="font-medium text-black">{item.customization_info.map(c => c.option).join(', ')}</span></p>
                                                )}
                                            </div>
                                        </div>
                                        <p className="font-sans font-medium text-lg">₹{Number(item.line_total).toLocaleString('en-IN')}</p>
                                    </div>
                                ))}
                            </div>
                            
                            <div className="border-t mt-6 pt-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2 text-sm text-gray-600">
                                    <h3 className="font-bold text-black uppercase tracking-widest mb-4">Financial Summary</h3>
                                    <div className="flex justify-between">
                                        <span>Subtotal</span>
                                        <span className="font-sans font-medium text-black">₹{Number(order.subtotal).toLocaleString('en-IN')}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Shipping</span>
                                        <span className="font-sans font-medium text-emerald-700">₹{Number(order.shipping_cost).toLocaleString('en-IN')}</span>
                                    </div>
                                    <div className="flex justify-between pt-2 border-t font-bold text-black text-base">
                                        <span>Total</span>
                                        <span className="font-sans">₹{Number(order.total).toLocaleString('en-IN')}</span>
                                    </div>
                                </div>

                                <div className="space-y-2 text-sm text-gray-600 bg-gray-50 p-4 rounded">
                                    <h3 className="font-bold text-black uppercase tracking-widest mb-4">Payment Balance</h3>

                                    <div className="flex justify-between">
                                        <span>Amount Paid</span>
                                        <span className="font-sans font-medium text-emerald-700">₹{Number(order.amount_paid).toLocaleString('en-IN')}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <h2 className="text-lg font-bold uppercase tracking-widest border-b pb-4 mb-6">Shipping Information</h2>
                            <div className="text-gray-600 whitespace-pre-wrap">
                                {order.shipping_address}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </CustomerPortalLayout>
    );
}

OrderDetails.layout = page => <CustomerLayout>{page}</CustomerLayout>;
