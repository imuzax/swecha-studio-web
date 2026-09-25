import AdminLayout from '@/Layouts/Admin/AdminLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import PrimaryButton from '@/Components/PrimaryButton';

export default function Form({ workshop }) {
    const isEdit = !!workshop.id;

    const { data, setData, post, put, processing, errors } = useForm({
        title: workshop.title || '',
        description: workshop.description || '',
        price: workshop.price || '',
        is_active: workshop.is_active === undefined ? true : workshop.is_active,
        dates: (workshop.dates || []).map(d => ({
            ...d,
            start_time: d.start_time ? d.start_time.substring(0, 5) : '',
            end_time: d.end_time ? d.end_time.substring(0, 5) : ''
        })),
        images: []
    });

    const submit = (e) => {
        e.preventDefault();
        if (isEdit) {
            data._method = 'put';
            post(route('admin.workshops.update', workshop.id), {
                forceFormData: true,
            });
        } else {
            post(route('admin.workshops.store'), {
                forceFormData: true,
            });
        }
    };

    const addDate = () => {
        setData('dates', [...data.dates, { date: '', start_time: '', end_time: '', total_seats: 10, taken_seats: 0 }]);
    };

    const removeDate = (index) => {
        const newDates = [...data.dates];
        newDates.splice(index, 1);
        setData('dates', newDates);
    };

    const updateDate = (index, field, value) => {
        const newDates = [...data.dates];
        newDates[index][field] = value;
        setData('dates', newDates);
    };

    return (
        <AdminLayout>
            <Head title={isEdit ? 'Edit Workshop' : 'Create Workshop'} />

            <div className="flex justify-between items-center mb-8">
                <div>
                    <motion.h1 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-3xl font-serif text-gray-800 mb-2"
                    >
                        {isEdit ? 'Edit Workshop' : 'Create Workshop'}
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-gray-500 font-medium"
                    >
                        {isEdit ? 'Update workshop details and dates.' : 'Add a new workshop event.'}
                    </motion.p>
                </div>
                <Link href={route('admin.workshops.index')} className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                    Back to Workshops
                </Link>
            </div>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl border border-[#E8E4DC] shadow-sm overflow-hidden"
            >
                <form onSubmit={submit} className="p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Title</label>
                            <input 
                                type="text" 
                                value={data.title}
                                onChange={e => setData('title', e.target.value)}
                                className="w-full border-[#E8E4DC] rounded-xl focus:ring-[#C1633D] focus:border-[#C1633D]"
                                required
                            />
                            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
                        </div>
                        
                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Price (Optional)</label>
                            <input 
                                type="number" 
                                step="0.01"
                                value={data.price}
                                onChange={e => setData('price', e.target.value)}
                                className="w-full border-[#E8E4DC] rounded-xl focus:ring-[#C1633D] focus:border-[#C1633D]"
                            />
                            {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Description</label>
                        <textarea 
                            rows="4"
                            value={data.description}
                            onChange={e => setData('description', e.target.value)}
                            className="w-full border-[#E8E4DC] rounded-xl focus:ring-[#C1633D] focus:border-[#C1633D]"
                        ></textarea>
                        {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
                    </div>

                    <div>
                        <label className="flex items-center space-x-3">
                            <input 
                                type="checkbox" 
                                checked={data.is_active}
                                onChange={e => setData('is_active', e.target.checked)}
                                className="border-[#E8E4DC] rounded text-[#C1633D] focus:ring-[#C1633D]"
                            />
                            <span className="text-sm font-medium text-gray-700">Active</span>
                        </label>
                    </div>

                    {/* Image Upload */}
                    <div className="pt-6 border-t border-[#E8E4DC]">
                        <h2 className="text-lg font-serif text-gray-800 mb-4">Workshop Images</h2>
                        
                        {/* Existing Images */}
                        {isEdit && workshop.images && workshop.images.length > 0 && (
                            <div className="mb-6">
                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Current Images</label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                    {workshop.images.map((img) => (
                                        <div key={img.id} className="relative group rounded-xl overflow-hidden border border-[#E8E4DC] aspect-square">
                                            <img src={`/storage/${img.image_path}`} alt="Workshop" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <Link 
                                                    href={route('admin.workshops.images.destroy', [workshop.id, img.id])} 
                                                    method="delete"
                                                    as="button"
                                                    className="w-8 h-8 bg-white text-red-500 rounded-full flex items-center justify-center hover:bg-red-50 transition-colors"
                                                    preserveScroll
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Upload New Images</label>
                            <input 
                                type="file" 
                                multiple
                                accept="image/*,video/mp4,video/webm"
                                onChange={e => setData('images', Array.from(e.target.files))}
                                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#FAF6ED] file:text-[#C1633D] hover:file:bg-[#F3EBE0]"
                            />
                            <p className="text-xs text-gray-400 mt-2">You can select multiple files. Max 10 images total.</p>
                            {errors.images && <p className="text-red-500 text-xs mt-1">{errors.images}</p>}
                            {Object.keys(errors).filter(k => k.startsWith('images.')).map(k => (
                                <p key={k} className="text-red-500 text-xs mt-1">{errors[k]}</p>
                            ))}
                        </div>
                    </div>

                    <div className="pt-6 border-t border-[#E8E4DC]">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-serif text-gray-800">Workshop Dates</h2>
                            <button type="button" onClick={addDate} className="text-xs font-bold text-[#C1633D] uppercase tracking-widest hover:text-[#A85331]">
                                + Add Date
                            </button>
                        </div>
                        
                        {data.dates.map((dateObj, index) => (
                            <div key={index} className="bg-gray-50 p-4 rounded-xl mb-4 border border-[#E8E4DC] relative">
                                <button type="button" onClick={() => removeDate(index)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Date</label>
                                        <input 
                                            type="date" 
                                            value={dateObj.date}
                                            onChange={e => updateDate(index, 'date', e.target.value)}
                                            className="w-full border-[#E8E4DC] rounded-xl focus:ring-[#C1633D] focus:border-[#C1633D]"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Start Time</label>
                                        <input 
                                            type="time" 
                                            value={dateObj.start_time || ''}
                                            onChange={e => updateDate(index, 'start_time', e.target.value)}
                                            className="w-full border-[#E8E4DC] rounded-xl focus:ring-[#C1633D] focus:border-[#C1633D]"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">End Time</label>
                                        <input 
                                            type="time" 
                                            value={dateObj.end_time || ''}
                                            onChange={e => updateDate(index, 'end_time', e.target.value)}
                                            className="w-full border-[#E8E4DC] rounded-xl focus:ring-[#C1633D] focus:border-[#C1633D]"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Total Seats</label>
                                        <input 
                                            type="number" 
                                            value={dateObj.total_seats}
                                            onChange={e => updateDate(index, 'total_seats', e.target.value)}
                                            className="w-full border-[#E8E4DC] rounded-xl focus:ring-[#C1633D] focus:border-[#C1633D]"
                                            required
                                            min="0"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Taken Seats</label>
                                        <input 
                                            type="number" 
                                            value={dateObj.taken_seats}
                                            onChange={e => updateDate(index, 'taken_seats', e.target.value)}
                                            className="w-full border-[#E8E4DC] rounded-xl focus:ring-[#C1633D] focus:border-[#C1633D]"
                                            required
                                            min="0"
                                        />
                                    </div>
                                </div>
                                {isEdit && dateObj.id && (
                                    <div className="mt-4 flex justify-end">
                                        <Link 
                                            href={route('admin.workshops.bookings.index', [workshop.id, dateObj.id])}
                                            className="text-xs font-bold bg-[#FAF6ED] text-[#C1633D] hover:bg-[#F3EBE0] px-4 py-2 rounded-lg transition-colors inline-flex items-center gap-2"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                                            Manage Bookings & Seats
                                        </Link>
                                    </div>
                                )}
                            </div>
                        ))}
                        {data.dates.length === 0 && (
                            <p className="text-sm text-gray-500 italic">No dates added yet.</p>
                        )}
                    </div>

                    <div className="pt-6 border-t border-[#E8E4DC] flex justify-end">
                        <PrimaryButton type="submit" disabled={processing}>
                            {processing ? 'Saving...' : 'Save Workshop'}
                        </PrimaryButton>
                    </div>
                </form>
            </motion.div>
        </AdminLayout>
    );
}
