import AdminLayout from '@/Layouts/Admin/AdminLayout';
import { Head, Link, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import PrimaryButton from '@/Components/PrimaryButton';
import ConfirmModal from '@/Components/ConfirmModal';
import { useState } from 'react';

export default function Index({ workshops }) {
    const [workshopToDelete, setWorkshopToDelete] = useState(null);
    const deleteWorkshop = () => {
        if (workshopToDelete) {
            router.delete(route('admin.workshops.destroy', workshopToDelete), {
                onFinish: () => setWorkshopToDelete(null)
            });
        }
    };

    return (
        <AdminLayout>
            <Head title="Workshops" />

            <div className="flex justify-between items-center mb-8">
                <div>
                    <motion.h1 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-3xl font-serif text-gray-800 mb-2"
                    >
                        Workshops
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-gray-500 font-medium"
                    >
                        Manage your workshop events and dates.
                    </motion.p>
                </div>
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <Link href={route('admin.workshops.create')}>
                        <PrimaryButton>Create Workshop</PrimaryButton>
                    </Link>
                </motion.div>
            </div>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-2xl border border-[#E8E4DC] shadow-sm overflow-hidden"
            >
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white text-gray-400 text-[10px] font-bold uppercase tracking-widest border-b border-[#E8E4DC]">
                                <th className="px-6 py-4">Title</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Price</th>
                                <th className="px-6 py-4">Dates</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E8E4DC]">
                            {workshops.map((workshop) => (
                                <tr key={workshop.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 text-sm font-bold text-gray-800">
                                        {workshop.title}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest ${workshop.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                            {workshop.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {workshop.price ? `₹${workshop.price}` : '-'}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {workshop.dates.length} date(s)
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-4">
                                        <Link href={route('admin.workshops.bookings.index', workshop.id)} className="text-sm font-medium text-[#C1633D] hover:text-[#A85331] transition-colors">
                                            Bookings
                                        </Link>
                                        <Link href={route('admin.workshops.edit', workshop.id)} className="text-sm font-medium text-brand-600 hover:text-brand-900 transition-colors">
                                            Edit
                                        </Link>
                                        <button 
                                            onClick={() => setWorkshopToDelete(workshop.id)}
                                            className="text-sm font-medium text-red-600 hover:text-red-900 transition-colors"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {workshops.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                        No workshops found. Create one to get started.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </motion.div>

            <ConfirmModal
                isOpen={!!workshopToDelete}
                title="Delete Workshop"
                message="Are you sure you want to delete this workshop? This will also remove associated dates and cannot be undone."
                onConfirm={deleteWorkshop}
                onCancel={() => setWorkshopToDelete(null)}
                confirmText="Delete Workshop"
                confirmStyle="danger"
            />
        </AdminLayout>
    );
}
