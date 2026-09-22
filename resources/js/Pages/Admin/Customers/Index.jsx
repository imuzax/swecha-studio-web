import AdminLayout from '@/Layouts/Admin/AdminLayout';
import { Head, Link, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { useState, useCallback } from 'react';
import debounce from 'lodash/debounce';

export default function CustomerIndex({ customers, filters }) {
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');

    const debouncedSearch = useCallback(
        debounce((value) => {
            router.get(
                route('admin.customers.index'),
                { search: value },
                { preserveState: true, preserveScroll: true, replace: true }
            );
        }, 500),
        []
    );

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        debouncedSearch(e.target.value);
    };

    return (
        <AdminLayout>
            <Head title="Manage Customers" />

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <motion.h1 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-3xl font-serif text-gray-800 mb-2"
                    >
                        Customers
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-gray-500 font-medium"
                    >
                        View all registered users and their activity.
                    </motion.p>
                </div>
                
                <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search name, email, phone..."
                            value={searchTerm}
                            onChange={handleSearch}
                            className="w-full md:w-64 pl-10 pr-4 py-2 rounded-xl border-[#E8E4DC] focus:border-[#C1633D] focus:ring focus:ring-[#C1633D] focus:ring-opacity-20 text-sm shadow-sm"
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl border border-[#E8E4DC] overflow-hidden shadow-sm"
            >
                <div className="overflow-x-auto">
                    {customers.data.length > 0 ? (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white text-gray-400 text-[10px] font-bold uppercase tracking-widest border-b border-[#E8E4DC]">
                                    <th className="px-6 py-4">Customer</th>
                                    <th className="px-6 py-4">Contact Info</th>
                                    <th className="px-6 py-4">Total Orders</th>
                                    <th className="px-6 py-4">Joined At</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#E8E4DC]">
                                {customers.data.map((customer) => (
                                    <tr key={customer.id} className="hover:bg-[#FDFBF7] transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-[#FAF6ED] text-[#C1633D] font-bold flex items-center justify-center border border-[#E8E4DC]">
                                                    {customer.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-800">{customer.name}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-medium text-gray-700">{customer.email}</p>
                                            <p className="text-xs font-medium text-gray-500 mt-0.5">{customer.phone}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center justify-center min-w-[2rem] px-2 py-1 rounded-md bg-[#4B705D]/10 text-[#4B705D] text-xs font-bold border border-[#4B705D]/20">
                                                {customer.orders_count}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-500">
                                            {customer.joined_at}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link 
                                                href={route('admin.customers.show', customer.id)} 
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#C1633D] bg-[#FAF6ED] rounded-lg hover:bg-[#F3EBE0] transition-colors border border-[#C1633D]/20"
                                            >
                                                <span>View</span>
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="py-20 text-center">
                            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                            <h4 className="text-lg font-semibold text-gray-600">No customers found</h4>
                            <p className="text-gray-400 mt-2">No users matched your search or have registered yet.</p>
                        </div>
                    )}
                </div>
            </motion.div>
        </AdminLayout>
    );
}
