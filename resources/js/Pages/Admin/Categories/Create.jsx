import AdminLayout from '@/Layouts/Admin/AdminLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Create() {
    const { flash } = usePage().props;
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        is_active: true,
        image: null,
        seo_title: '',
        seo_description: '',
    });

    const [imagePreview, setImagePreview] = useState(null);
    const [fileSizeError, setFileSizeError] = useState('');

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) {
            setData('image', null);
            setImagePreview(null);
            setFileSizeError('');
            return;
        }

        // Limit check: 20MB
        if (file.size > 20 * 1024 * 1024) {
            setFileSizeError(`File size (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds the 20MB limit. Please select a smaller image.`);
            setData('image', null);
            setImagePreview(null);
            return;
        }

        setFileSizeError('');
        setData('image', file);
        setImagePreview(URL.createObjectURL(file));
    };

    const submit = (e) => {
        e.preventDefault();
        if (fileSizeError) return;
        post(route('admin.categories.store'));
    };

    return (
        <AdminLayout>
            <Head title="Create Category" />

            <div className="max-w-3xl mx-auto">
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link 
                            href={route('admin.categories.index')} 
                            className="w-10 h-10 rounded-xl bg-white border border-[#E8E4DC] flex items-center justify-center text-gray-500 hover:text-[#C1633D] hover:bg-[#FAF6ED] transition-colors shadow-sm"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-serif text-gray-800">Create Category</h1>
                            <p className="text-xs text-gray-500 font-medium mt-0.5">Add a new product category to your studio store</p>
                        </div>
                    </div>
                </div>

                <AnimatePresence>
                    {flash?.error && (
                        <motion.div 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium flex items-center gap-3 shadow-sm"
                        >
                            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            <span>{flash.error}</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="bg-white rounded-2xl border border-[#E8E4DC] shadow-sm overflow-hidden">
                    <form onSubmit={submit} className="p-8 space-y-6">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Category Name *</label>
                            <input
                                type="text"
                                className="w-full rounded-xl border-[#E8E4DC] bg-[#FAF6ED]/30 shadow-sm focus:border-[#C1633D] focus:ring focus:ring-[#C1633D] focus:ring-opacity-20 text-sm py-2.5 px-4 font-medium"
                                value={data.name}
                                onChange={e => setData('name', e.target.value)}
                                placeholder="e.g. Minimalist Planters"
                                required
                            />
                            {errors.name && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.name}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Category Cover Image</label>
                            <div className="flex items-start gap-5">
                                {imagePreview && (
                                    <div className="w-24 h-24 rounded-xl border border-[#E8E4DC] overflow-hidden bg-[#FAF6ED] flex-shrink-0 relative group">
                                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                    </div>
                                )}
                                <div className="flex-1">
                                    <input
                                        type="file"
                                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:uppercase file:tracking-wider file:bg-[#FAF6ED] file:text-[#C1633D] hover:file:bg-[#F3EDE2] file:cursor-pointer border border-[#E8E4DC] rounded-xl p-2 bg-[#FAF6ED]/30"
                                        onChange={handleImageChange}
                                        accept="image/*"
                                    />
                                    <p className="text-[11px] text-gray-400 mt-1.5 font-medium">Supported formats: JPG, PNG, WEBP, SVG (Max size: 20MB)</p>
                                </div>
                            </div>
                            {fileSizeError && <p className="text-red-500 text-xs mt-2 font-medium">{fileSizeError}</p>}
                            {errors.image && <p className="text-red-500 text-xs mt-2 font-medium">{errors.image}</p>}
                        </div>

                        <div className="pt-4 border-t border-[#E8E4DC] space-y-4">
                            <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider">SEO & Metadata (Optional)</h3>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">SEO Title</label>
                                <input
                                    type="text"
                                    className="w-full rounded-xl border-[#E8E4DC] bg-[#FAF6ED]/30 shadow-sm focus:border-[#C1633D] focus:ring focus:ring-[#C1633D] focus:ring-opacity-20 text-sm py-2 px-3.5"
                                    value={data.seo_title}
                                    onChange={e => setData('seo_title', e.target.value)}
                                    placeholder="e.g. Handcrafted Minimalist Planters | Swecha Studio"
                                />
                                {errors.seo_title && <p className="text-red-500 text-xs mt-1 font-medium">{errors.seo_title}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">SEO Description</label>
                                <textarea
                                    className="w-full rounded-xl border-[#E8E4DC] bg-[#FAF6ED]/30 shadow-sm focus:border-[#C1633D] focus:ring focus:ring-[#C1633D] focus:ring-opacity-20 text-sm py-2 px-3.5 h-20"
                                    value={data.seo_description}
                                    onChange={e => setData('seo_description', e.target.value)}
                                    placeholder="Brief meta description for search engines..."
                                />
                                {errors.seo_description && <p className="text-red-500 text-xs mt-1 font-medium">{errors.seo_description}</p>}
                            </div>
                        </div>

                        <div className="pt-4 border-t border-[#E8E4DC]">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 rounded text-[#C1633D] border-[#E8E4DC] focus:ring-[#C1633D]"
                                    checked={data.is_active}
                                    onChange={e => setData('is_active', e.target.checked)}
                                />
                                <span className="text-sm text-gray-700 font-medium">Active (Visible in catalog & navigation)</span>
                            </label>
                        </div>

                        <div className="pt-4 border-t border-[#E8E4DC] flex items-center justify-end gap-3">
                            <Link
                                href={route('admin.categories.index')}
                                className="px-5 py-2.5 rounded-xl bg-gray-100 text-gray-600 text-xs font-bold uppercase tracking-wider hover:bg-gray-200 transition-colors"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                className="px-6 py-2.5 rounded-xl bg-[#C1633D] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#A85331] transition-colors disabled:opacity-50 shadow-sm"
                                disabled={processing || !!fileSizeError}
                            >
                                {processing ? 'Saving...' : 'Save Category'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
}
