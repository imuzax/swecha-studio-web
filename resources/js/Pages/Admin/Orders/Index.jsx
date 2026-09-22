import AdminLayout from '@/Layouts/Admin/AdminLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { motion } from 'framer-motion';

export default function OrderIndex({ orders, filters }) {
    const { data, setData } = useForm({
        search: filters?.search || '',
        status: filters?.status || '',
        payment: filters?.payment || '',
    });

    const handleFilter = () => {
        router.get(route('admin.orders.index'), data, { preserveState: true });
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

    const getStatusDot = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending': return 'bg-amber-500';
            case 'processing': return 'bg-blue-500';
            case 'shipped': return 'bg-purple-500';
            case 'delivered': return 'bg-emerald-500';
            case 'cancelled': return 'bg-red-500';
            default: return 'bg-gray-500';
        }
    };

    return (
        <AdminLayout>
            <Head title="Manage Orders" />

            <div className="flex justify-between items-center mb-8">
                <div>
                    <motion.h1 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-3xl font-serif text-gray-800 mb-2"
                    >
                        Orders
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-gray-500 font-medium"
                    >
                        Manage your customer orders and fulfillments.
                    </motion.p>
                </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-[#E8E4DC] mb-6 flex flex-wrap gap-4 items-center shadow-sm">
                <div className="flex-1 min-w-[250px]">
                    <label className="sr-only">Search</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            placeholder="Search order #, customer, email, phone..."
                            className="block w-full pl-10 pr-3 py-2 border border-[#E8E4DC] rounded-xl leading-5 bg-[#FAF6ED]/30 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-[#C1633D] focus:ring-1 focus:ring-[#C1633D] sm:text-sm transition duration-150 ease-in-out"
                            value={data.search}
                            onChange={e => setData('search', e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleFilter()}
                        />
                    </div>
                </div>
                <div>
                    <select
                        value={data.status}
                        onChange={e => setData('status', e.target.value)}
                        className="block w-full pl-3 pr-10 py-2 text-base border-[#E8E4DC] focus:outline-none focus:ring-[#C1633D] focus:border-[#C1633D] sm:text-sm rounded-xl bg-[#FAF6ED]/30"
                    >
                        <option value="">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>
                <div>
                    <select
                        value={data.payment}
                        onChange={e => setData('payment', e.target.value)}
                        className="block w-full pl-3 pr-10 py-2 text-base border-[#E8E4DC] focus:outline-none focus:ring-[#C1633D] focus:border-[#C1633D] sm:text-sm rounded-xl bg-[#FAF6ED]/30"
                    >
                        <option value="">All Payments</option>
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="failed">Failed</option>
                        <option value="refunded">Refunded</option>
                    </select>
                </div>
                <div>
                    <button 
                        onClick={handleFilter}
                        className="px-4 py-2 bg-[#C1633D] text-white text-sm font-bold rounded-xl hover:bg-[#A85331] transition-colors"
                    >
                        Filter
                    </button>
                    {(data.search || data.status || data.payment) && (
                        <button 
                            onClick={() => {
                                setData({ search: '', status: '', payment: '' });
                                router.get(route('admin.orders.index'));
                            }}
                            className="ml-2 px-4 py-2 bg-gray-100 text-gray-600 text-sm font-bold rounded-xl hover:bg-gray-200 transition-colors"
                        >
                            Clear
                        </button>
                    )}
                </div>
            </div>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl border border-[#E8E4DC] overflow-hidden shadow-sm"
            >
                <div className="overflow-x-auto">
                    {orders.data.length > 0 ? (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white text-gray-400 text-[10px] font-bold uppercase tracking-widest border-b border-[#E8E4DC]">
                                    <th className="px-6 py-4">Order Details</th>
                                    <th className="px-6 py-4">Customer</th>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Total</th>
                                    <th className="px-6 py-4 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#E8E4DC]">
                                {orders.data.map((order) => (
                                    <tr key={order.id} className="hover:bg-[#FDFBF7] transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-[#FAF6ED] flex items-center justify-center border border-[#E8E4DC]">
                                                    <svg className="w-5 h-5 text-[#C1633D]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-800">{order.order_number}</p>
                                                    <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Payment: <span className={order.payment_status === 'paid' ? 'text-emerald-500' : 'text-amber-500'}>{order.payment_status}</span></p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-medium text-gray-700">{order.customer}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-medium text-gray-500">{order.created_at}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(order.status)}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${getStatusDot(order.status)}`}></span>
                                                {order.status || 'pending'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="text-sm font-semibold text-gray-800">{order.total}</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <Link 
                                                href={route('admin.orders.show', order.id)} 
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FAF6ED] text-[#C1633D] hover:bg-[#C1633D] hover:text-white border border-[#E8E4DC] hover:border-[#C1633D] text-xs font-bold rounded-xl transition-all shadow-sm" 
                                                title="Manage Order"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                                                Manage
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="py-20 text-center">
                            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>
                            <h4 className="text-lg font-semibold text-gray-600">No orders found</h4>
                            <p className="text-gray-400 mt-2">Try adjusting your filters or search query.</p>
                        </div>
                    )}
                </div>
                
                {/* Pagination */}
                {orders.links && orders.links.length > 3 && (
                    <div className="px-6 py-4 border-t border-[#E8E4DC] flex items-center justify-between">
                        <div className="flex-1 flex justify-between sm:hidden">
                            <Link
                                href={orders.prev_page_url || '#'}
                                className={`relative inline-flex items-center px-4 py-2 border border-[#E8E4DC] text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 ${!orders.prev_page_url && 'opacity-50 cursor-not-allowed'}`}
                            >
                                Previous
                            </Link>
                            <Link
                                href={orders.next_page_url || '#'}
                                className={`ml-3 relative inline-flex items-center px-4 py-2 border border-[#E8E4DC] text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 ${!orders.next_page_url && 'opacity-50 cursor-not-allowed'}`}
                            >
                                Next
                            </Link>
                        </div>
                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-gray-700">
                                    Showing <span className="font-medium">{orders.from || 0}</span> to <span className="font-medium">{orders.to || 0}</span> of{' '}
                                    <span className="font-medium">{orders.total}</span> results
                                </p>
                            </div>
                            <div>
                                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                    {orders.links.map((link, i) => (
                                        <Link
                                            key={i}
                                            href={link.url || '#'}
                                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium
                                                ${link.active 
                                                    ? 'z-10 bg-[#FAF6ED] border-[#C1633D] text-[#C1633D]' 
                                                    : 'bg-white border-[#E8E4DC] text-gray-500 hover:bg-gray-50'
                                                }
                                                ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}
                                                ${i === 0 ? 'rounded-l-md' : ''}
                                                ${i === orders.links.length - 1 ? 'rounded-r-md' : ''}
                                            `}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </nav>
                            </div>
                        </div>
                    </div>
                )}
            </motion.div>
        </AdminLayout>
    );
}
