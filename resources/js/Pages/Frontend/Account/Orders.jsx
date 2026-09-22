import CustomerPortalLayout from '@/Layouts/Frontend/CustomerPortalLayout';
import CustomerLayout from '@/Layouts/Frontend/CustomerLayout';
import { Head, Link } from '@inertiajs/react';

export default function Orders({ orders }) {
    return (
        <CustomerPortalLayout>
            <div className="flex items-center justify-between mb-6">
                <h2 className="font-semibold text-2xl text-gray-900">My Orders</h2>
            </div>
            <Head title="My Orders - Swecha Studio" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            {orders.length === 0 ? (
                                <p className="text-gray-500 py-8 text-center">You haven't placed any orders yet.</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full text-left text-sm whitespace-nowrap">
                                        <thead className="uppercase tracking-wider border-b-2 border-black">
                                            <tr>
                                                <th scope="col" className="px-6 py-4">Order Ref</th>
                                                <th scope="col" className="px-6 py-4">Date</th>
                                                <th scope="col" className="px-6 py-4">Total</th>
                                                <th scope="col" className="px-6 py-4">Status</th>
                                                <th scope="col" className="px-6 py-4">Payment</th>
                                                <th scope="col" className="px-6 py-4 text-right">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {orders.map(order => (
                                                <tr key={order.id} className="border-b hover:bg-gray-50 transition">
                                                    <td className="px-6 py-4 font-bold">{order.order_number}</td>
                                                    <td className="px-6 py-4 text-gray-600">{new Date(order.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                                                    <td className="px-6 py-4 font-sans font-medium">₹{Number(order.total).toLocaleString('en-IN')}</td>
                                                    <td className="px-6 py-4 uppercase font-medium">{order.order_status}</td>
                                                    <td className="px-6 py-4 uppercase font-medium">
                                                        <span className={order.payment_status === 'paid' ? 'text-emerald-600' : 'text-gray-600'}>
                                                            {order.payment_status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <Link href={route('account.order.details', order.order_number)} className="uppercase tracking-widest text-xs font-bold text-black border-b border-black hover:text-gray-500 hover:border-gray-500 transition pb-1">
                                                            View
                                                        </Link>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </CustomerPortalLayout>
    );
}

Orders.layout = page => <CustomerLayout>{page}</CustomerLayout>;
