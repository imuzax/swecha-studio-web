import AdminLayout from '@/Layouts/Admin/AdminLayout';
import { Head, Link, useForm, usePage, router } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

export default function OrderShow({ order }) {
    const { flash } = usePage().props;

    const { data, setData, put, processing } = useForm({
        order_status: order.status || 'pending',
        payment_status: order.payment_status || 'pending',
        amount_paid: order.amount_paid ?? 0,
        courier_name: order.courier_name || '',
        tracking_number: order.tracking_number || '',
        tracking_url: order.tracking_url || '',
    });

    const [isShipModalOpen, setIsShipModalOpen] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    const generateWhatsAppUrl = () => {
        if (!order.customer || !order.customer.phone) return '#';
        const phone = order.customer.phone.replace(/\D/g, '');
        const message = encodeURIComponent(`Hi ${order.customer.name},\n\nThis is regarding your order #${order.order_number}.\n\nOrder Total: ₹${order.total}\nAmount Paid: ₹${order.amount_paid}\nBalance Due: ₹${order.balance_due}\n\nThank you!`);
        return `https://wa.me/${phone}?text=${message}`;
    };

    // Fast 1-click status updater
    const quickUpdateStatus = (newStatus) => {
        if (newStatus === 'cancelled' && !confirm('Are you sure you want to cancel / reject this order?')) {
            return;
        }

        setActionLoading(true);
        router.put(route('admin.orders.update', order.id), {
            order_status: newStatus,
            payment_status: data.payment_status,
        }, {
            preserveScroll: true,
            onFinish: () => setActionLoading(false),
            onSuccess: () => {
                setData('order_status', newStatus);
            }
        });
    };

    // Quick payment full-paid action
    const markFullPaid = () => {
        setActionLoading(true);
        router.put(route('admin.orders.update', order.id), {
            payment_status: 'paid',
            amount_paid: order.total,
        }, {
            preserveScroll: true,
            onFinish: () => setActionLoading(false),
            onSuccess: () => {
                setData('payment_status', 'paid');
                setData('amount_paid', order.total);
            }
        });
    };

    // Comprehensive form submit
    const submitFullForm = (e) => {
        e.preventDefault();
        put(route('admin.orders.update', order.id), {
            preserveScroll: true,
            onSuccess: () => {
                setIsShipModalOpen(false);
            }
        });
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending': return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
            case 'processing': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
            case 'shipped': return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
            case 'delivered': return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
            case 'cancelled': return 'bg-red-500/10 text-red-600 border-red-500/20';
            default: return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
        }
    };

    const getPaymentStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'paid': return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
            case 'pending': return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
            case 'failed': return 'bg-red-500/10 text-red-600 border-red-500/20';
            case 'refunded': return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
            default: return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
        }
    };

    const pipelineSteps = ['pending', 'processing', 'shipped', 'delivered'];
    const currentStepIndex = pipelineSteps.indexOf(order.status?.toLowerCase());

    return (
        <AdminLayout>
            <Head title={`Order #${order.order_number}`} />

            {/* Flash Feedback */}
            <AnimatePresence>
                {flash?.success && (
                    <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium flex items-center justify-between shadow-sm"
                    >
                        <div className="flex items-center gap-3">
                            <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            <span>{flash.success}</span>
                        </div>
                    </motion.div>
                )}
                {flash?.error && (
                    <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium flex items-center gap-3 shadow-sm"
                    >
                        <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <span>{flash.error}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header with Quick Actions */}
            <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E8E4DC] shadow-sm">
                <div className="flex items-center gap-4">
                    <Link 
                        href={route('admin.orders.index')} 
                        className="w-10 h-10 rounded-xl bg-[#FAF6ED] border border-[#E8E4DC] flex items-center justify-center text-gray-500 hover:text-[#C1633D] hover:bg-[#F3EDE2] transition-colors shadow-sm"
                        title="Back to Orders"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                    </Link>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-serif text-gray-800">Order #{order.order_number}</h1>
                            <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider border ${getStatusColor(order.status)}`}>
                                {order.status}
                            </span>
                            <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider border ${getPaymentStatusColor(order.payment_status)}`}>
                                {order.payment_status}
                            </span>
                        </div>
                        <p className="text-xs text-gray-500 font-medium mt-1">Placed on {order.created_at}</p>
                    </div>
                </div>

                {/* Quick Action Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                    {order.customer?.phone && order.customer.phone !== 'N/A' && (
                        <a 
                            href={generateWhatsAppUrl()} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-3.5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-sm hover:bg-emerald-700 transition-colors"
                        >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 0C5.385 0 0 5.385 0 12.031c0 2.115.548 4.17 1.593 5.986L.044 23.518l5.656-1.482c1.745.952 3.711 1.455 5.748 1.455h.004c6.645 0 12.031-5.385 12.031-12.031C24.062 5.385 18.676 0 12.031 0zm7.126 17.387c-.302.852-1.748 1.637-2.456 1.706-.66.064-1.472.228-4.707-1.11-4.136-1.71-6.845-5.918-7.05-6.19-.205-.272-1.688-2.247-1.688-4.288 0-2.042 1.055-3.044 1.433-3.456.377-.411.821-.513 1.096-.513.274 0 .548 0 .788.012.253.013.593-.095.927.709.343.821 1.164 2.84 1.266 3.045.103.205.171.445.034.72-.137.274-.206.445-.411.684-.206.24-.43.535-.617.737-.205.223-.424.467-.183.878.241.411 1.073 1.77 2.308 2.871 1.595 1.42 2.923 1.862 3.334 2.067.411.205.65.171.89-.092.24-.263 1.028-1.2 1.302-1.611.274-.411.548-.342.924-.205.376.137 2.395 1.13 2.806 1.335.411.205.685.308.788.479.103.171.103.993-.205 1.845z"></path></svg>
                            WhatsApp
                        </a>
                    )}

                    {order.status === 'pending' && (
                        <button
                            onClick={() => quickUpdateStatus('processing')}
                            disabled={actionLoading}
                            className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50"
                        >
                            ✓ Accept & Process
                        </button>
                    )}

                    {order.status !== 'shipped' && order.status !== 'delivered' && order.status !== 'cancelled' && (
                        <button
                            onClick={() => setIsShipModalOpen(true)}
                            disabled={actionLoading}
                            className="px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-purple-700 transition-colors shadow-sm disabled:opacity-50"
                        >
                            📦 Mark Shipped
                        </button>
                    )}

                    {order.status === 'shipped' && (
                        <button
                            onClick={() => quickUpdateStatus('delivered')}
                            disabled={actionLoading}
                            className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50"
                        >
                            ✓ Mark Delivered
                        </button>
                    )}

                    {order.status !== 'cancelled' && (
                        <button
                            onClick={() => quickUpdateStatus('cancelled')}
                            disabled={actionLoading}
                            className="px-3.5 py-2 bg-red-50 text-red-600 border border-red-200 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-red-100 transition-colors disabled:opacity-50"
                        >
                            ✕ Reject / Cancel
                        </button>
                    )}
                </div>
            </div>

            {/* Lifecycle Pipeline Progress */}
            {order.status !== 'cancelled' && (
                <div className="bg-white p-5 rounded-2xl border border-[#E8E4DC] shadow-sm mb-6">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4">Order Progression</p>
                    <div className="grid grid-cols-4 gap-2 relative">
                        {pipelineSteps.map((step, idx) => {
                            const isCompleted = currentStepIndex >= idx;
                            const isCurrent = order.status?.toLowerCase() === step;
                            return (
                                <button
                                    key={step}
                                    type="button"
                                    onClick={() => quickUpdateStatus(step)}
                                    disabled={actionLoading}
                                    className={`p-3 rounded-xl border text-center transition-all ${
                                        isCurrent 
                                            ? 'bg-[#FAF6ED] border-[#C1633D] text-[#C1633D] ring-2 ring-[#C1633D]/20 font-bold' 
                                            : isCompleted 
                                                ? 'bg-emerald-50/50 border-emerald-200 text-emerald-700 font-semibold' 
                                                : 'bg-gray-50 border-gray-200 text-gray-400 hover:border-gray-300'
                                    }`}
                                >
                                    <div className="flex items-center justify-center gap-1.5 mb-1">
                                        <span className={`w-2 h-2 rounded-full ${
                                            isCurrent ? 'bg-[#C1633D]' : isCompleted ? 'bg-emerald-500' : 'bg-gray-300'
                                        }`} />
                                        <span className="text-[11px] uppercase tracking-wider">{step}</span>
                                    </div>
                                    <span className="text-[10px] text-gray-400 block font-normal">
                                        {isCurrent ? 'Current' : isCompleted ? 'Completed' : 'Click to Set'}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Items & Fulfillment */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Order Items */}
                    <div className="bg-white rounded-2xl border border-[#E8E4DC] overflow-hidden shadow-sm">
                        <div className="px-6 py-4 border-b border-[#E8E4DC] bg-[#FAF6ED]/30 flex justify-between items-center">
                            <h2 className="text-sm font-bold uppercase tracking-widest text-gray-600">Order Items ({order.items.length})</h2>
                            <span className="text-xs font-semibold text-gray-500">Method: {order.payment_method || 'Online'}</span>
                        </div>
                        <div className="p-6">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="text-[10px] font-bold uppercase tracking-widest text-gray-400 border-b border-[#E8E4DC]">
                                        <th className="pb-3">Product</th>
                                        <th className="pb-3 text-center">Qty</th>
                                        <th className="pb-3 text-right">Price</th>
                                        <th className="pb-3 text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#E8E4DC]">
                                    {order.items.map((item) => (
                                        <tr key={item.id}>
                                            <td className="py-4 text-sm font-semibold text-gray-800">
                                                {item.product_name}
                                                {item.variant_info && (
                                                    <div className="text-xs text-gray-500 font-medium mt-1">
                                                        <span className="font-bold text-gray-400">VARIANT:</span> {item.variant_info.value} 
                                                        {Number(item.variant_info.price_adjustment) > 0 && ` (+₹${item.variant_info.price_adjustment})`}
                                                    </div>
                                                )}
                                                {item.customization_info && item.customization_info.length > 0 && (
                                                    <div className="mt-1 space-y-0.5">
                                                        {item.customization_info.map((c, i) => (
                                                            <div key={i} className="text-xs text-gray-500 font-medium">
                                                                <span className="font-bold text-gray-400">{c.customization}:</span> {c.option}
                                                                {Number(c.price_adjustment) > 0 && ` (+₹${c.price_adjustment})`}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="py-4 text-sm font-medium text-gray-500 text-center align-top">{item.quantity}</td>
                                            <td className="py-4 text-sm font-medium text-gray-600 text-right align-top">₹{item.price}</td>
                                            <td className="py-4 text-sm font-bold text-gray-800 text-right align-top">₹{item.subtotal}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            
                            <div className="mt-6 pt-6 border-t border-[#E8E4DC] flex justify-end">
                                <div className="w-72 space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500 font-medium">Subtotal</span>
                                        <span className="text-gray-800 font-semibold">₹{order.subtotal}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500 font-medium">Shipping</span>
                                        <span className="text-gray-800 font-semibold">₹{order.shipping_cost}</span>
                                    </div>
                                    {order.discount > 0 && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-green-600 font-medium">Discount</span>
                                            <span className="text-green-600 font-semibold">-₹{order.discount}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-base pt-3 border-t border-[#E8E4DC]">
                                        <span className="text-gray-800 font-bold uppercase tracking-wider text-xs">Total Amount</span>
                                        <span className="text-[#C1633D] font-bold text-lg">₹{order.total}</span>
                                    </div>

                                    <div className="flex justify-between text-sm text-gray-600">
                                        <span>Amount Paid</span>
                                        <span className={order.amount_paid > 0 ? "text-emerald-600 font-bold" : ""}>₹{order.amount_paid}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-gray-800 font-bold bg-[#FAF6ED] p-2.5 rounded-xl border border-[#E8E4DC]">
                                        <span>Balance Due</span>
                                        <span className={order.balance_due > 0 ? "text-red-500" : "text-emerald-500"}>₹{order.balance_due}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Status & Fulfillment Management Form */}
                    <div className="bg-white rounded-2xl border border-[#E8E4DC] overflow-hidden shadow-sm">
                        <div className="px-6 py-4 border-b border-[#E8E4DC] bg-[#FAF6ED]/30 flex justify-between items-center">
                            <h2 className="text-sm font-bold uppercase tracking-widest text-gray-600">Update Status & Fulfillment Details</h2>
                            <span className="text-xs text-gray-400">Save changes below</span>
                        </div>
                        <div className="p-6">
                            <form onSubmit={submitFullForm} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Order Status</label>
                                        <select 
                                            value={data.order_status}
                                            onChange={e => setData('order_status', e.target.value)}
                                            className="w-full rounded-xl border-[#E8E4DC] bg-[#FAF6ED]/30 shadow-sm focus:border-[#C1633D] focus:ring focus:ring-[#C1633D] focus:ring-opacity-20 text-sm font-medium py-2.5"
                                        >
                                            <option value="pending">Pending (Waiting Review)</option>
                                            <option value="processing">Processing (Accepted / In Production)</option>
                                            <option value="shipped">Shipped (Dispatched)</option>
                                            <option value="delivered">Delivered (Completed)</option>
                                            <option value="cancelled">Cancelled / Rejected</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Payment Status</label>
                                        <select 
                                            value={data.payment_status}
                                            onChange={e => setData('payment_status', e.target.value)}
                                            className="w-full rounded-xl border-[#E8E4DC] bg-[#FAF6ED]/30 shadow-sm focus:border-[#C1633D] focus:ring focus:ring-[#C1633D] focus:ring-opacity-20 text-sm font-medium py-2.5"
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="paid">Paid in Full</option>
                                            <option value="failed">Failed</option>
                                            <option value="refunded">Refunded</option>
                                        </select>
                                    </div>

                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">Amount Paid (₹)</label>
                                            <button 
                                                type="button" 
                                                onClick={() => {
                                                    setData(d => ({ ...d, amount_paid: order.total, payment_status: 'paid' }));
                                                }}
                                                className="text-[11px] text-[#C1633D] font-bold hover:underline"
                                            >
                                                Set Full (₹{order.total})
                                            </button>
                                        </div>
                                        <input 
                                            type="number"
                                            min="0"
                                            max={order.total}
                                            step="0.01"
                                            value={data.amount_paid}
                                            onChange={e => setData('amount_paid', e.target.value)}
                                            className="w-full rounded-xl border-[#E8E4DC] bg-[#FAF6ED]/30 shadow-sm focus:border-[#C1633D] focus:ring focus:ring-[#C1633D] focus:ring-opacity-20 text-sm py-2.5"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Courier Partner</label>
                                        <input 
                                            type="text" 
                                            value={data.courier_name}
                                            onChange={e => setData('courier_name', e.target.value)}
                                            className="w-full rounded-xl border-[#E8E4DC] bg-[#FAF6ED]/30 shadow-sm focus:border-[#C1633D] focus:ring focus:ring-[#C1633D] focus:ring-opacity-20 text-sm py-2.5"
                                            placeholder="e.g. BlueDart, Delhivery, DTDC"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Tracking / AWB Number</label>
                                        <input 
                                            type="text" 
                                            value={data.tracking_number}
                                            onChange={e => setData('tracking_number', e.target.value)}
                                            className="w-full rounded-xl border-[#E8E4DC] bg-[#FAF6ED]/30 shadow-sm focus:border-[#C1633D] focus:ring focus:ring-[#C1633D] focus:ring-opacity-20 text-sm py-2.5"
                                            placeholder="e.g. BD987654321IN"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Tracking URL</label>
                                        <input 
                                            type="url" 
                                            value={data.tracking_url}
                                            onChange={e => setData('tracking_url', e.target.value)}
                                            className="w-full rounded-xl border-[#E8E4DC] bg-[#FAF6ED]/30 shadow-sm focus:border-[#C1633D] focus:ring focus:ring-[#C1633D] focus:ring-opacity-20 text-sm py-2.5"
                                            placeholder="https://track.courier.com/..."
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 pt-4 border-t border-[#E8E4DC]">
                                    <button 
                                        type="submit" 
                                        disabled={processing}
                                        className="px-6 py-2.5 rounded-xl bg-[#C1633D] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#A85331] transition-colors disabled:opacity-50 shadow-sm"
                                    >
                                        {processing ? 'Saving...' : 'Save All Changes'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Right Column: Customer & Addresses */}
                <div className="space-y-6">
                    {/* Customer Info */}
                    <div className="bg-white rounded-2xl border border-[#E8E4DC] overflow-hidden shadow-sm p-6">
                        <h2 className="text-sm font-bold uppercase tracking-widest text-gray-600 mb-4">Customer Details</h2>
                        {order.customer ? (
                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-[#FAF6ED] text-[#C1633D] font-bold text-lg flex items-center justify-center border border-[#E8E4DC]">
                                        {order.customer.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-800">{order.customer.name}</p>
                                        <p className="text-sm text-gray-500">{order.customer.email}</p>
                                    </div>
                                </div>
                                <div className="pt-4 border-t border-[#E8E4DC]">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Phone Number</p>
                                    <p className="text-sm font-medium text-gray-800">{order.customer.phone}</p>
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm font-medium text-gray-500">Guest Checkout</p>
                        )}
                    </div>

                    {/* Shipping Address */}
                    <div className="bg-white rounded-2xl border border-[#E8E4DC] overflow-hidden shadow-sm p-6">
                        <h2 className="text-sm font-bold uppercase tracking-widest text-gray-600 mb-4 flex items-center gap-2">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                            Shipping Address
                        </h2>
                        <div className="text-sm text-gray-600 leading-relaxed font-medium whitespace-pre-line bg-[#FAF6ED]/50 p-4 rounded-xl border border-[#E8E4DC]">
                            {order.shipping_address}
                        </div>
                    </div>

                    {/* Quick Payment Management Box */}
                    <div className="bg-white rounded-2xl border border-[#E8E4DC] overflow-hidden shadow-sm p-6">
                        <h2 className="text-sm font-bold uppercase tracking-widest text-gray-600 mb-4">Quick Payment Actions</h2>
                        <div className="space-y-3">
                            <button
                                type="button"
                                onClick={markFullPaid}
                                disabled={actionLoading || order.payment_status === 'paid'}
                                className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                                    order.payment_status === 'paid'
                                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 cursor-not-allowed'
                                        : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm'
                                }`}
                            >
                                {order.payment_status === 'paid' ? '✓ Paid in Full' : 'Mark as 100% Paid'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Ship Order Modal */}
            <AnimatePresence>
                {isShipModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-2xl max-w-lg w-full p-6 border border-[#E8E4DC] shadow-xl"
                        >
                            <h3 className="text-lg font-serif text-gray-800 mb-2">Mark Order as Shipped</h3>
                            <p className="text-xs text-gray-500 mb-4">Enter shipping and tracking details for customer notification.</p>

                            <form onSubmit={(e) => {
                                setData('order_status', 'shipped');
                                submitFullForm(e);
                            }} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Courier Partner</label>
                                    <input 
                                        type="text" 
                                        value={data.courier_name}
                                        onChange={e => setData('courier_name', e.target.value)}
                                        className="w-full rounded-xl border-[#E8E4DC] text-sm py-2"
                                        placeholder="e.g. BlueDart, Delhivery"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Tracking Number / AWB</label>
                                    <input 
                                        type="text" 
                                        value={data.tracking_number}
                                        onChange={e => setData('tracking_number', e.target.value)}
                                        className="w-full rounded-xl border-[#E8E4DC] text-sm py-2"
                                        placeholder="e.g. 123456789"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Tracking URL (Optional)</label>
                                    <input 
                                        type="url" 
                                        value={data.tracking_url}
                                        onChange={e => setData('tracking_url', e.target.value)}
                                        className="w-full rounded-xl border-[#E8E4DC] text-sm py-2"
                                        placeholder="https://track.courier.com/..."
                                    />
                                </div>

                                <div className="flex justify-end gap-3 pt-3">
                                    <button 
                                        type="button" 
                                        onClick={() => setIsShipModalOpen(false)}
                                        className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-200"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit" 
                                        disabled={processing}
                                        className="px-5 py-2 bg-purple-600 text-white rounded-xl text-xs font-bold hover:bg-purple-700"
                                    >
                                        Confirm & Ship
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </AdminLayout>
    );
}
