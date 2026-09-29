import AdminLayout from '@/Layouts/Admin/AdminLayout';
import { Head, useForm, Link, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import PrimaryButton from '@/Components/PrimaryButton';
import ConfirmModal from '@/Components/ConfirmModal';
import { useState } from 'react';

export default function Bookings({ workshop }) {
    const [selectedDateId, setSelectedDateId] = useState(workshop.dates.length > 0 ? workshop.dates[0].id : null);
    const [isAdding, setIsAdding] = useState(false);
    const [bookingToRemove, setBookingToRemove] = useState(null);

    const workshopDate = workshop.dates.find(d => d.id === selectedDateId);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        phone: '',
        email: '',
        tickets_count: 1,
        payment_method: 'whatsapp',
        payment_status: 'paid',
        notes: ''
    });

    const submit = (e) => {
        e.preventDefault();
        if (!workshopDate) return;
        post(route('admin.workshops.bookings.store', [workshop.id, workshopDate.id]), {
            onSuccess: () => {
                setIsAdding(false);
                reset();
            }
        });
    };

    const confirmRemoveBooking = (bookingId) => {
        setBookingToRemove(bookingId);
    };

    const removeBooking = () => {
        if (!workshopDate || !bookingToRemove) return;
        router.delete(route('admin.workshops.bookings.destroy', [workshop.id, workshopDate.id, bookingToRemove]), {
            onFinish: () => setBookingToRemove(null)
        });
    };

    return (
        <AdminLayout>
            <Head title={`Manage Bookings - ${workshop.title}`} />

            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
                <div>
                    <motion.h1 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-3xl font-serif text-gray-800 mb-2"
                    >
                        Workshop Bookings
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-gray-500 font-medium"
                    >
                        {workshop.title}
                    </motion.p>
                </div>
                
                <div className="flex items-center space-x-4">
                    {workshop.dates.length > 0 && (
                        <select 
                            value={selectedDateId || ''}
                            onChange={(e) => {
                                setSelectedDateId(Number(e.target.value));
                                setIsAdding(false);
                            }}
                            className="border-[#E8E4DC] rounded-xl focus:ring-[#C1633D] focus:border-[#C1633D] text-sm font-bold text-gray-700"
                        >
                            {workshop.dates.map(d => (
                                <option key={d.id} value={d.id}>
                                    {new Date(d.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </option>
                            ))}
                        </select>
                    )}
                    
                    <Link href={route('admin.workshops.index')} className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                        Back to Workshops
                    </Link>
                    {!isAdding && workshopDate && (
                        <PrimaryButton onClick={() => setIsAdding(true)}>Add Booking</PrimaryButton>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {workshopDate ? (
                    <>
                        <div className={isAdding ? "lg:col-span-8" : "lg:col-span-12"}>
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="bg-white rounded-2xl border border-[#E8E4DC] shadow-sm overflow-hidden"
                            >
                                <div className="p-6 border-b border-[#E8E4DC] flex justify-between items-center bg-gray-50">
                                    <div>
                                        <h3 className="font-bold text-gray-800">Seat Occupancy</h3>
                                        <p className="text-xs text-gray-500 mt-1">
                                            <span className="font-bold text-[#C1633D]">{workshopDate.taken_seats}</span> / {workshopDate.total_seats} seats booked
                                        </p>
                                    </div>
                                    <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-[#C1633D]" 
                                            style={{ width: `${Math.min(100, (workshopDate.taken_seats / workshopDate.total_seats) * 100)}%` }}
                                        ></div>
                                    </div>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-white text-gray-400 text-[10px] font-bold uppercase tracking-widest border-b border-[#E8E4DC]">
                                                <th className="px-6 py-4">Attendee</th>
                                                <th className="px-6 py-4">Contact</th>
                                                <th className="px-6 py-4 text-center">Tickets</th>
                                                <th className="px-6 py-4">Payment</th>
                                                <th className="px-6 py-4 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#E8E4DC]">
                                    {workshopDate.bookings.map((booking) => (
                                        <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-bold text-gray-800">{booking.name}</div>
                                                {booking.notes && <div className="text-xs text-gray-500 mt-1 italic">{booking.notes}</div>}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-600">{booking.phone || '-'}</div>
                                                <div className="text-xs text-gray-500">{booking.email || '-'}</div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-brand-100 text-brand-700 text-xs font-bold">
                                                    {booking.tickets_count}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest ${booking.payment_status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                    {booking.payment_method} - {booking.payment_status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button 
                                                    onClick={() => confirmRemoveBooking(booking.id)}
                                                    className="text-sm font-medium text-red-600 hover:text-red-900 transition-colors"
                                                >
                                                    Remove
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {workshopDate.bookings.length === 0 && (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                                No bookings yet.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                </div>

                {isAdding && (
                    <div className="lg:col-span-4">
                        <motion.div 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-white rounded-2xl border border-[#E8E4DC] shadow-sm overflow-hidden sticky top-8"
                        >
                            <div className="p-6 border-b border-[#E8E4DC] flex justify-between items-center">
                                <h2 className="text-lg font-serif text-gray-800">Add Booking</h2>
                                <button onClick={() => setIsAdding(false)} className="text-gray-400 hover:text-gray-600">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                            <form onSubmit={submit} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Name</label>
                                    <input 
                                        type="text" 
                                        value={data.name}
                                        onChange={e => setData('name', e.target.value)}
                                        className="w-full border-[#E8E4DC] rounded-xl focus:ring-[#C1633D] focus:border-[#C1633D] text-sm"
                                        required
                                    />
                                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Phone</label>
                                        <input 
                                            type="text" 
                                            value={data.phone}
                                            onChange={e => setData('phone', e.target.value)}
                                            className="w-full border-[#E8E4DC] rounded-xl focus:ring-[#C1633D] focus:border-[#C1633D] text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Tickets</label>
                                        <input 
                                            type="number" 
                                            value={data.tickets_count}
                                            onChange={e => setData('tickets_count', e.target.value)}
                                            className="w-full border-[#E8E4DC] rounded-xl focus:ring-[#C1633D] focus:border-[#C1633D] text-sm"
                                            required
                                            min="1"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Email (Optional)</label>
                                    <input 
                                        type="email" 
                                        value={data.email}
                                        onChange={e => setData('email', e.target.value)}
                                        className="w-full border-[#E8E4DC] rounded-xl focus:ring-[#C1633D] focus:border-[#C1633D] text-sm"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Payment Method</label>
                                    <select 
                                        value={data.payment_method}
                                        onChange={e => setData('payment_method', e.target.value)}
                                        className="w-full border-[#E8E4DC] rounded-xl focus:ring-[#C1633D] focus:border-[#C1633D] text-sm"
                                    >
                                        <option value="whatsapp">WhatsApp / Direct</option>

                                        <option value="cash">Cash</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Payment Status</label>
                                    <select 
                                        value={data.payment_status}
                                        onChange={e => setData('payment_status', e.target.value)}
                                        className="w-full border-[#E8E4DC] rounded-xl focus:ring-[#C1633D] focus:border-[#C1633D] text-sm"
                                    >
                                        <option value="paid">Paid / Confirmed</option>
                                        <option value="pending">Pending</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Notes</label>
                                    <textarea 
                                        rows="2"
                                        value={data.notes}
                                        onChange={e => setData('notes', e.target.value)}
                                        className="w-full border-[#E8E4DC] rounded-xl focus:ring-[#C1633D] focus:border-[#C1633D] text-sm"
                                    ></textarea>
                                </div>

                                <div className="pt-4 border-t border-[#E8E4DC]">
                                    <PrimaryButton type="submit" disabled={processing} className="w-full justify-center">
                                        {processing ? 'Saving...' : 'Add Booking'}
                                    </PrimaryButton>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
                    </>
                ) : (
                    <div className="lg:col-span-12 bg-white rounded-2xl border border-[#E8E4DC] p-12 text-center shadow-sm">
                        <p className="text-gray-500 font-medium">This workshop currently has no dates. Please add a date in the Workshop Edit page first.</p>
                        <Link href={route('admin.workshops.edit', workshop.id)} className="mt-4 inline-block text-[#C1633D] font-bold uppercase tracking-widest text-xs hover:text-[#A85331]">
                            Go to Edit Workshop
                        </Link>
                    </div>
                )}
            </div>

            <ConfirmModal
                isOpen={!!bookingToRemove}
                title="Remove Booking"
                message="Are you sure you want to remove this booking? This will free up the seats."
                onConfirm={removeBooking}
                onCancel={() => setBookingToRemove(null)}
                confirmText="Remove Booking"
                confirmStyle="danger"
            />
        </AdminLayout>
    );
}
