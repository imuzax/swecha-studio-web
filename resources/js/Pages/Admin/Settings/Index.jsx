import AdminLayout from '@/Layouts/Admin/AdminLayout';
import { Head, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';

export default function SettingsIndex({ settings }) {
    const { data, setData, post, processing, recentlySuccessful, errors } = useForm({
        site_name: settings.site_name || '',
        support_email: settings.support_email || '',
        support_phone: settings.support_phone || '',
        address: settings.address || '',
        whatsapp_number: settings.whatsapp_number || '',
        instagram_link: settings.instagram_link || '',
        facebook_link: settings.facebook_link || '',
        twitter_link: settings.twitter_link || '',
        delivery_charge: settings.delivery_charge || '',
        currency_symbol: settings.currency_symbol || '',
        site_logo: null,
        site_favicon: null,
        hero_media: null,
        about_media: null,
        instagram_media_1: null,
        instagram_media_2: null,
        instagram_media_3: null,
        instagram_media_4: null,
    });

    const isVideo = (path) => {
        if (!path) return false;
        const ext = path.split('.').pop().toLowerCase();
        return ['mp4', 'webm', 'ogg'].includes(ext);
    };

    const renderMediaPreview = (path, label) => {
        if (!path) return null;
        return (
            <div className="mb-2 relative w-full h-32 bg-gray-50 rounded overflow-hidden p-1 border border-gray-200 flex items-center justify-center">
                {isVideo(path) ? (
                    <video src={`/storage/${path}`} className="h-full w-full object-cover rounded" autoPlay muted loop playsInline />
                ) : (
                    <img src={`/storage/${path}`} alt={label} className="h-full w-full object-cover rounded" />
                )}
            </div>
        );
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.settings.update'), {
            preserveScroll: true,
            forceFormData: true,
        });
    };

    return (
        <AdminLayout>
            <Head title="Site Settings" />

            <div className="flex justify-between items-center mb-8">
                <div>
                    <motion.h1 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-3xl font-serif text-gray-800 mb-2"
                    >
                        Site Settings
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-gray-500 font-medium"
                    >
                        Manage your storefront's global configuration.
                    </motion.p>
                </div>
            </div>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl border border-[#E8E4DC] overflow-hidden shadow-sm"
            >
                <div className="p-6 md:p-8">
                    {recentlySuccessful && (
                        <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 text-sm font-bold flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            Settings saved successfully!
                        </div>
                    )}

                    {Object.keys(errors || {}).length > 0 && (
                        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm font-bold">
                            <div className="flex items-center gap-2 mb-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                <span>Please fix the following errors:</span>
                            </div>
                            <ul className="list-disc pl-5 font-medium">
                                {Object.values(errors || {}).map((error, index) => (
                                    <li key={index}>{error}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-8" encType="multipart/form-data">
                        
                        {/* Site Identity */}
                        <div>
                            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-800 border-b border-[#E8E4DC] pb-2 mb-4">Site Identity</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Site Logo</label>
                                    {settings.site_logo && (
                                        <div className="mb-2">
                                            <img src={`/storage/${settings.site_logo}`} alt="Site Logo" className="h-12 object-contain bg-gray-50 rounded p-1" />
                                        </div>
                                    )}
                                    <input 
                                        type="file" 
                                        accept="image/*"
                                        onChange={e => setData('site_logo', e.target.files[0])}
                                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#FAF6ED] file:text-[#C1633D] hover:file:bg-[#F3EBE0]"
                                    />
                                    {/* <p className="text-xs text-red-500 mt-1">{errors.site_logo}</p> */}
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Favicon</label>
                                    {settings.site_favicon && (
                                        <div className="mb-2">
                                            <img src={`/storage/${settings.site_favicon}`} alt="Favicon" className="h-8 w-8 object-contain bg-gray-50 rounded p-1" />
                                        </div>
                                    )}
                                    <input 
                                        type="file" 
                                        accept=".ico,.png,.jpg,.jpeg,.svg,.webp"
                                        onChange={e => setData('site_favicon', e.target.files[0])}
                                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#FAF6ED] file:text-[#C1633D] hover:file:bg-[#F3EBE0]"
                                    />
                                </div>
                            </div>
                        </div>
                        
                        {/* General Info */}
                        <div>
                            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-800 border-b border-[#E8E4DC] pb-2 mb-4">General Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Site Name</label>
                                    <input 
                                        type="text" 
                                        value={data.site_name}
                                        onChange={e => setData('site_name', e.target.value)}
                                        className="w-full rounded-xl border-[#E8E4DC] shadow-sm focus:border-[#C1633D] focus:ring focus:ring-[#C1633D] focus:ring-opacity-20 text-sm"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Physical Address</label>
                                    <textarea 
                                        value={data.address}
                                        onChange={e => setData('address', e.target.value)}
                                        rows="3"
                                        className="w-full rounded-xl border-[#E8E4DC] shadow-sm focus:border-[#C1633D] focus:ring focus:ring-[#C1633D] focus:ring-opacity-20 text-sm"
                                    ></textarea>
                                </div>
                            </div>
                        </div>

                        {/* Contact & Socials */}
                        <div>
                            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-800 border-b border-[#E8E4DC] pb-2 mb-4">Contact & Social Links</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Support Email</label>
                                    <input 
                                        type="email" 
                                        value={data.support_email}
                                        onChange={e => setData('support_email', e.target.value)}
                                        className="w-full rounded-xl border-[#E8E4DC] shadow-sm focus:border-[#C1633D] focus:ring focus:ring-[#C1633D] focus:ring-opacity-20 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Support Phone Number</label>
                                    <input 
                                        type="text" 
                                        value={data.support_phone}
                                        onChange={e => setData('support_phone', e.target.value)}
                                        className="w-full rounded-xl border-[#E8E4DC] shadow-sm focus:border-[#C1633D] focus:ring focus:ring-[#C1633D] focus:ring-opacity-20 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">WhatsApp Number</label>
                                    <input 
                                        type="text" 
                                        value={data.whatsapp_number}
                                        onChange={e => setData('whatsapp_number', e.target.value)}
                                        className="w-full rounded-xl border-[#E8E4DC] shadow-sm focus:border-[#C1633D] focus:ring focus:ring-[#C1633D] focus:ring-opacity-20 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Instagram Link</label>
                                    <input 
                                        type="url" 
                                        value={data.instagram_link}
                                        onChange={e => setData('instagram_link', e.target.value)}
                                        className="w-full rounded-xl border-[#E8E4DC] shadow-sm focus:border-[#C1633D] focus:ring focus:ring-[#C1633D] focus:ring-opacity-20 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Facebook Link</label>
                                    <input 
                                        type="url" 
                                        value={data.facebook_link}
                                        onChange={e => setData('facebook_link', e.target.value)}
                                        className="w-full rounded-xl border-[#E8E4DC] shadow-sm focus:border-[#C1633D] focus:ring focus:ring-[#C1633D] focus:ring-opacity-20 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Twitter/X Link</label>
                                    <input 
                                        type="url" 
                                        value={data.twitter_link}
                                        onChange={e => setData('twitter_link', e.target.value)}
                                        className="w-full rounded-xl border-[#E8E4DC] shadow-sm focus:border-[#C1633D] focus:ring focus:ring-[#C1633D] focus:ring-opacity-20 text-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* E-Commerce Config */}
                        <div>
                            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-800 border-b border-[#E8E4DC] pb-2 mb-4">E-Commerce Configurations</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Base Delivery Charge</label>
                                    <input 
                                        type="number" 
                                        value={data.delivery_charge}
                                        onChange={e => setData('delivery_charge', e.target.value)}
                                        className="w-full rounded-xl border-[#E8E4DC] shadow-sm focus:border-[#C1633D] focus:ring focus:ring-[#C1633D] focus:ring-opacity-20 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Currency Symbol</label>
                                    <input 
                                        type="text" 
                                        value={data.currency_symbol}
                                        onChange={e => setData('currency_symbol', e.target.value)}
                                        className="w-full rounded-xl border-[#E8E4DC] shadow-sm focus:border-[#C1633D] focus:ring focus:ring-[#C1633D] focus:ring-opacity-20 text-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Home Page Media */}
                        <div>
                            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-800 border-b border-[#E8E4DC] pb-2 mb-4">Home Page Media (Images / Videos)</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Hero Media */}
                                <div className="md:col-span-2">
                                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Main Hero Media (Top Section)</label>
                                    <div className="max-w-md">
                                        {renderMediaPreview(settings.hero_media, "Hero Media")}
                                        <input 
                                            type="file" 
                                            accept="image/*,video/mp4,video/webm"
                                            onChange={e => setData('hero_media', e.target.files[0])}
                                            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#FAF6ED] file:text-[#C1633D] hover:file:bg-[#F3EBE0]"
                                        />
                                    </div>
                                </div>

                                {/* About Media */}
                                <div className="md:col-span-2">
                                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">"Our Craft Standard" Media</label>
                                    <div className="max-w-md">
                                        {renderMediaPreview(settings.about_media, "About Media")}
                                        <input 
                                            type="file" 
                                            accept="image/*,video/mp4,video/webm"
                                            onChange={e => setData('about_media', e.target.files[0])}
                                            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#FAF6ED] file:text-[#C1633D] hover:file:bg-[#F3EBE0]"
                                        />
                                    </div>
                                </div>
                                
                                {/* Instagram Grid */}
                                <div className="md:col-span-2 pt-4">
                                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">Instagram Lookbook Grid (Bottom Section)</label>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {[1, 2, 3, 4].map(num => {
                                            const fieldKey = `instagram_media_${num}`;
                                            return (
                                                <div key={num}>
                                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Slot {num}</label>
                                                    {renderMediaPreview(settings[fieldKey], `Instagram ${num}`)}
                                                    <input 
                                                        type="file" 
                                                        accept="image/*,video/mp4,video/webm"
                                                        onChange={e => setData(fieldKey, e.target.files[0])}
                                                        className="w-full text-xs text-gray-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:bg-[#FAF6ED] file:text-[#C1633D] hover:file:bg-[#F3EBE0]"
                                                    />
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-[#E8E4DC] flex justify-end">
                            <button 
                                type="submit" 
                                disabled={processing}
                                className="px-8 py-3 rounded-xl bg-[#C1633D] text-white text-xs font-bold uppercase tracking-widest hover:bg-[#A85331] transition-all duration-300 disabled:opacity-50 shadow-md hover:shadow-lg"
                            >
                                {processing ? 'Saving...' : 'Save Settings'}
                            </button>
                        </div>
                    </form>
                </div>
            </motion.div>
        </AdminLayout>
    );
}
