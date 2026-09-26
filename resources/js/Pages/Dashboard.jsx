import React from 'react';
import CustomerLayout from '@/Layouts/Frontend/CustomerLayout';
import CustomerPortalLayout from '@/Layouts/Frontend/CustomerPortalLayout';
import { Head, Link } from '@inertiajs/react';

export default function Dashboard({ recentOrders = [] }) {
    return (
        <CustomerPortalLayout>
            <Head title="Dashboard | Swecha Studio" />

            <div className="space-y-8">
                {/* Welcome Banner */}
                <div className="bg-brand-900 rounded-2xl p-8 text-white relative overflow-hidden">
                    <div className="relative z-10">
                        <h2 className="font-serif text-2xl sm:text-3xl mb-2">Welcome back to your studio</h2>
                        <p className="text-brand-200">Manage your artisanal concrete decor orders and profile.</p>
                    </div>
                    {/* Decorative element */}
                    <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-brand-800 rounded-full opacity-50 blur-3xl"></div>
                </div>

                {/* Recent Orders Section */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-stone-900">Recent Orders</h3>
                        {recentOrders.length > 0 && (
                            <Link href={route('account.orders')} className="text-sm font-medium text-brand-600 hover:text-brand-800">
                                View All Orders &rarr;
                            </Link>
                        )}
                    </div>

                    {recentOrders.length > 0 ? (
                        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
                            <ul className="divide-y divide-stone-100">
                                {recentOrders.map((order) => (
                                    <li key={order.id}>
                                        <Link href={route('account.order.details', order.order_number)} className="block hover:bg-stone-50 transition-colors p-4 sm:p-6">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                <div>
                                                    <p className="text-sm font-medium text-stone-900 mb-1">Order #{order.order_number}</p>
                                                    <p className="text-xs text-stone-500">
                                                        Placed on {new Date(order.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                                                    </p>
                                                </div>
                                                <div className="flex items-center justify-between sm:justify-end gap-6">
                                                    <p className="text-sm font-semibold text-stone-900">₹{Number(order.total).toLocaleString('en-IN')}</p>
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                                                        ${order.order_status === 'pending' ? 'bg-amber-100 text-amber-800' : 
                                                          order.order_status === 'processing' ? 'bg-blue-100 text-blue-800' :
                                                          order.order_status === 'shipped' ? 'bg-emerald-100 text-emerald-800' :
                                                          order.order_status === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                                                          'bg-stone-100 text-stone-800'}`}>
                                                        {order.order_status}
                                                    </span>
                                                </div>
                                            </div>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ) : (
                        <div className="bg-stone-50 rounded-2xl border border-dashed border-stone-300 p-12 text-center">
                            <svg className="mx-auto h-12 w-12 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                            <h3 className="mt-2 text-sm font-semibold text-stone-900">No orders yet</h3>
                            <p className="mt-1 text-sm text-stone-500">Discover our handcrafted concrete pieces.</p>
                            <div className="mt-6">
                                <Link
                                    href={route('shop')}
                                    className="inline-flex items-center rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
                                >
                                    Start Shopping
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </CustomerPortalLayout>
    );
}

Dashboard.layout = page => <CustomerLayout>{page}</CustomerLayout>;
