import AdminLayout from '@/Layouts/Admin/AdminLayout';
import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';

export default function CustomerShow({ customer, orders }) {
    return (
        <AdminLayout>
            <Head title={`Customer: ${customer.name}`} />

            <div className="mb-6">
                <Link 
                    href={route('admin.customers.index')} 
                    className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-[#C1633D] transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                    Back to Customers
                </Link>
            </div>

            <div className="flex justify-between items-start mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-[#FAF6ED] text-[#C1633D] text-2xl font-bold flex items-center justify-center border border-[#E8E4DC]">
                        {customer.name.charAt(0)}
                    </div>
                    <div>
                        <motion.h1 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-3xl font-serif text-gray-800 mb-1"
                        >
                            {customer.name}
                        </motion.h1>
                        <motion.p 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-gray-500 font-medium"
                        >
                            {customer.email} {customer.phone !== 'N/A' && `• ${customer.phone}`} • Joined {customer.joined_at}
                        </motion.p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Orders */}
                <div className="lg:col-span-2 space-y-8">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white rounded-2xl border border-[#E8E4DC] overflow-hidden shadow-sm"
                    >
                        <div className="p-6 border-b border-[#E8E4DC]">
                            <h3 className="text-lg font-serif text-gray-800">Order History</h3>
                        </div>
                        <div className="overflow-x-auto">
                            {orders.data.length > 0 ? (
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-[#FDFBF7] text-gray-500 text-[10px] font-bold uppercase tracking-widest border-b border-[#E8E4DC]">
                                            <th className="px-6 py-4">Order</th>
                                            <th className="px-6 py-4">Date</th>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#E8E4DC]">
                                        {orders.data.map((order) => (
                                            <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <Link href={route('admin.orders.show', order.id)} className="text-sm font-bold text-[#C1633D] hover:underline">
                                                        #{order.order_number}
                                                    </Link>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600">
                                                    {order.date}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col gap-1">
                                                        <span className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 text-gray-700 text-[10px] font-bold uppercase tracking-widest w-fit">
                                                            {order.order_status}
                                                        </span>
                                                        <span className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest w-fit ${
                                                            order.payment_status === 'paid' ? 'bg-green-100 text-green-700' :
                                                            order.payment_status === 'failed' ? 'bg-red-100 text-red-700' :
                                                            'bg-amber-100 text-amber-700'
                                                        }`}>
                                                            {order.payment_status}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-sm font-bold text-gray-800">₹{order.total}</p>
                                                    {Number(order.amount_paid) > 0 && (
                                                        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold mt-1">
                                                            Paid: ₹{order.amount_paid}
                                                        </p>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="p-8 text-center text-gray-500">
                                    No orders found for this customer.
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>

                {/* Right Column: Addresses */}
                <div className="space-y-8">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white rounded-2xl border border-[#E8E4DC] overflow-hidden shadow-sm p-6"
                    >
                        <h3 className="text-lg font-serif text-gray-800 mb-6">Saved Addresses</h3>
                        
                        {customer.addresses.length > 0 ? (
                            <div className="space-y-4">
                                {customer.addresses.map((address) => (
                                    <div key={address.id} className="p-4 rounded-xl border border-[#E8E4DC] bg-[#FDFBF7]">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-xs font-bold uppercase tracking-widest text-gray-500">
                                                {address.address_type}
                                                {address.is_default ? ' (Default)' : ''}
                                            </span>
                                        </div>
                                        <p className="text-sm font-bold text-gray-800">{address.name}</p>
                                        <p className="text-sm text-gray-600 mt-1">{address.phone}</p>
                                        <p className="text-sm text-gray-600 mt-1 line-clamp-3">
                                            {address.address_line_1}
                                            {address.address_line_2 && `, ${address.address_line_2}`}
                                            <br />
                                            {address.city}, {address.state} {address.pincode}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center text-gray-500 py-4">
                                No saved addresses.
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>
        </AdminLayout>
    );
}
