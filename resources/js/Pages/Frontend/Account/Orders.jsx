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
                                <div className="py-20 text-center bg-brand-50/50 rounded-3xl border border-brand-200/60 max-w-2xl mx-auto my-8">
                                    <div className="w-16 h-16 mx-auto bg-white rounded-full flex items-center justify-center shadow-soft mb-6">
                                        <svg className="w-8 h-8 text-brand-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                        </svg>
                                    </div>
                                    <h3 className="font-serif text-2xl text-brand-900 mb-2">No orders yet</h3>
                                    <p className="text-stone-500 mb-8 max-w-md mx-auto text-sm">
                                        You haven't placed any orders with us. Start exploring our collection of artisanal concrete.
                                    </p>
                                    <Link 
                                        href={route('shop')}
                                        className="inline-block bg-brand-800 hover:bg-brand-900 text-white font-semibold px-8 py-3.5 rounded-full text-sm transition-colors shadow-soft"
                                    >
                                        Explore Collection
                                    </Link>
                                </div>
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
                                            {orders.map(order => {
                                                const firstItem = order.items && order.items.length > 0 ? order.items[0] : null;
                                                const itemCount = order.items ? order.items.reduce((sum, item) => sum + item.quantity, 0) : 0;
                                                const imagePath = firstItem && firstItem.product && firstItem.product.images && firstItem.product.images.length > 0 
                                                    ? firstItem.product.images[0].path 
                                                    : null;
                                                
                                                return (
                                                    <tr key={order.id} className="border-b hover:bg-gray-50 transition">
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 bg-gray-200 rounded overflow-hidden flex-shrink-0 flex items-center justify-center">
                                                                    {imagePath ? (
                                                                        <img src={`/storage/${imagePath}`} className="w-full h-full object-cover" />
                                                                    ) : (
                                                                        <span className="text-gray-400 text-xs">No img</span>
                                                                    )}
                                                                </div>
                                                                <div>
                                                                    <div className="font-bold">{order.order_number}</div>
                                                                    <div className="text-xs text-gray-500">{itemCount} item{itemCount !== 1 ? 's' : ''}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-gray-600">{new Date(order.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                                                        <td className="px-6 py-4 font-sans font-medium">₹{Number(order.total).toLocaleString('en-IN')}</td>
                                                        <td className="px-6 py-4 uppercase font-medium">
                                                            <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">{order.order_status}</span>
                                                        </td>
                                                        <td className="px-6 py-4 uppercase font-medium">
                                                            <span className={`px-2 py-1 text-xs rounded-full ${order.payment_status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-800'}`}>
                                                                {order.payment_status}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <Link href={route('account.order.details', order.order_number)} className="uppercase tracking-widest text-xs font-bold text-black border-b border-black hover:text-gray-500 hover:border-gray-500 transition pb-1">
                                                                View
                                                            </Link>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
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
