import AdminLayout from '@/Layouts/Admin/AdminLayout';
import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';

export default function Dashboard({ stats, recent_orders, popular_products, monthly_sales, analytics_summary = {} }) {
    return (
        <AdminLayout>
            <Head title="Dashboard" />

            <div className="flex justify-between items-center mb-8">
                <div>
                    <motion.h1 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-3xl font-serif text-gray-800 mb-2"
                    >
                        Overview
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-gray-500 font-medium"
                    >
                        Here's what's happening with your store today.
                    </motion.p>
                </div>
            </div>

            {/* Top Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white p-6 rounded-2xl border border-[#E8E4DC] shadow-sm relative overflow-hidden group"
                >
                    <div className="relative z-10">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Order Value</p>
                        <h3 className="text-3xl font-serif text-gray-800 mb-2">₹{Number(stats.total_order_value).toLocaleString()}</h3>
                    </div>
                </motion.div>
                
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white p-6 rounded-2xl border border-[#E8E4DC] shadow-sm relative overflow-hidden group"
                >
                    <div className="relative z-10">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Amount Collected</p>
                        <h3 className="text-3xl font-serif text-[#4B705D] mb-2">₹{Number(stats.amount_collected).toLocaleString()}</h3>
                    </div>
                </motion.div>
                
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white p-6 rounded-2xl border border-[#E8E4DC] shadow-sm relative overflow-hidden group"
                >
                    <div className="relative z-10">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Orders</p>
                        <h3 className="text-3xl font-serif text-gray-800 mb-1">{stats.total_orders}</h3>
                        <p className="text-xs text-gray-500 font-sans font-medium">{stats.current_month_order_count} this month</p>
                    </div>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white p-6 rounded-2xl border border-[#E8E4DC] shadow-sm relative overflow-hidden group"
                >
                    <div className="relative z-10">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Catalog Size</p>
                        <h3 className="text-3xl font-serif text-gray-800 mb-2">{stats.total_products} <span className="text-sm text-gray-400 font-sans font-medium">products</span></h3>
                    </div>
                </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Orders Table */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="lg:col-span-2 bg-white rounded-2xl border border-[#E8E4DC] shadow-sm overflow-hidden"
                >
                    <div className="p-6 border-b border-[#E8E4DC] flex justify-between items-center bg-[#FDFBF7]">
                        <h2 className="text-lg font-serif text-gray-800">Recent Orders</h2>
                        <Link href={route('admin.orders.index')} className="text-xs font-bold text-[#C1633D] uppercase tracking-widest hover:text-[#A85331] transition-colors">
                            View All
                        </Link>
                    </div>
                    <div className="overflow-x-auto">
                        {recent_orders.length > 0 ? (
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-white text-gray-400 text-[10px] font-bold uppercase tracking-widest border-b border-[#E8E4DC]">
                                        <th className="px-6 py-4">Order ID</th>
                                        <th className="px-6 py-4">Customer</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#E8E4DC]">
                                    {recent_orders.map((order) => (
                                        <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <Link href={route('admin.orders.show', order.id)} className="text-sm font-bold text-[#C1633D] hover:underline">
                                                    #{order.order_number}
                                                </Link>
                                                <p className="text-[10px] text-gray-400 mt-1">{order.date}</p>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium text-gray-700">
                                                {order.customer}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 text-gray-700 text-[10px] font-bold uppercase tracking-widest">
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-bold text-gray-800">
                                                {order.total}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="py-12 text-center text-gray-500">
                                No orders have been placed yet.
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Popular Products & Monthly Sales */}
                <div className="space-y-8">
                    {/* Analytics Overview */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.35 }}
                        className="bg-white rounded-2xl border border-[#E8E4DC] shadow-sm overflow-hidden"
                    >
                        <div className="p-6 border-b border-[#E8E4DC] bg-[#FDFBF7]">
                            <h2 className="text-lg font-serif text-gray-800">Analytics Overview (Last 30 Days)</h2>
                        </div>
                        <div className="p-6">
                            {Object.keys(analytics_summary).length > 0 ? (
                                <div className="space-y-4">
                                    {Object.entries(analytics_summary).map(([event, count]) => (
                                        <div key={event} className="flex justify-between items-center">
                                            <span className="text-sm font-medium text-gray-700 uppercase tracking-wide">{event.replace(/_/g, ' ')}</span>
                                            <span className="text-sm font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded-full">{count}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center text-gray-500 py-4 text-sm">
                                    No analytics data tracked yet.
                                </div>
                            )}
                        </div>
                    </motion.div>
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-white rounded-2xl border border-[#E8E4DC] shadow-sm overflow-hidden"
                    >
                        <div className="p-6 border-b border-[#E8E4DC] bg-[#FDFBF7]">
                            <h2 className="text-lg font-serif text-gray-800">Popular Products</h2>
                        </div>
                        <div className="p-6">
                            {popular_products.length > 0 ? (
                                <div className="space-y-4">
                                    {popular_products.map((product) => (
                                        <div key={product.id} className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                                                {product.image ? (
                                                    <img src={`/storage/${product.image}`} alt={product.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-gray-800 truncate">{product.name}</p>
                                                <p className="text-xs text-gray-500 mt-0.5">{product.sales_count} items sold</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center text-gray-500 py-4 text-sm">
                                    Not enough sales data yet.
                                </div>
                            )}
                        </div>
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="bg-white rounded-2xl border border-[#E8E4DC] shadow-sm overflow-hidden"
                    >
                        <div className="p-6 border-b border-[#E8E4DC] bg-[#FDFBF7]">
                            <h2 className="text-lg font-serif text-gray-800">Monthly Sales Value</h2>
                        </div>
                        <div className="p-0">
                            {monthly_sales.length > 0 ? (
                                <div className="divide-y divide-[#E8E4DC]">
                                    {monthly_sales.map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-center p-4 px-6 hover:bg-gray-50">
                                            <span className="text-sm font-medium text-gray-600">{item.month_label}</span>
                                            <span className="text-sm font-bold text-gray-800">₹{Number(item.revenue).toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-6 text-center text-gray-500 text-sm">
                                    No sales data available.
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>
        </AdminLayout>
    );
}
