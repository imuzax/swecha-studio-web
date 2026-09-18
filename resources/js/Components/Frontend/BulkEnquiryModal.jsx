import React from 'react';
import { useForm, router } from '@inertiajs/react';
import axios from 'axios';

export default function BulkEnquiryModal({ isOpen, onClose, defaultProduct = null }) {
    const { data, setData, reset } = useForm({
        name: '',
        phone: '',
        email: '',
        requested_quantity: '',
        message: '',
        reference_info: defaultProduct ? defaultProduct.name : ''
    });

    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [errors, setErrors] = React.useState({});

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrors({});

        try {
            const response = await axios.post(route('bulk-enquiries.store'), data);
            if (response.data.success) {
                reset();
                onClose();
                window.open(response.data.whatsapp_url, '_blank');
            }
        } catch (error) {
            if (error.response && error.response.status === 422) {
                setErrors(error.response.data.errors);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm transition-opacity">
            <div className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-lg shadow-2xl relative animate-fade-in-up">
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-stone-100 text-stone-500 hover:bg-stone-200 hover:text-stone-700 transition-colors"
                >
                    &times;
                </button>
                
                <div className="mb-6">
                    <span className="inline-block px-3 py-1 bg-brand-100 text-brand-800 text-[10px] font-bold uppercase tracking-widest rounded-full mb-3">
                        Studio Customizations
                    </span>
                    <h2 className="font-serif text-2xl text-brand-900 mb-1">Request a Custom Creation</h2>
                    <p className="text-sm text-stone-500">
                        Fill out the details below. We'll redirect you to WhatsApp with all your requirements formatted for a quick chat with our artisans.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-stone-700 mb-1">Your Name *</label>
                            <input 
                                type="text" 
                                required 
                                value={data.name}
                                onChange={e => setData('name', e.target.value)}
                                className="w-full bg-stone-50 border border-stone-200 rounded-lg py-2.5 px-3 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors"
                                placeholder="Jane Doe"
                            />
                            {errors.name && <span className="text-xs text-red-500">{errors.name[0]}</span>}
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-stone-700 mb-1">Phone Number *</label>
                            <input 
                                type="tel" 
                                required 
                                value={data.phone}
                                onChange={e => setData('phone', e.target.value)}
                                className="w-full bg-stone-50 border border-stone-200 rounded-lg py-2.5 px-3 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors"
                                placeholder="+91 9876543210"
                            />
                            {errors.phone && <span className="text-xs text-red-500">{errors.phone[0]}</span>}
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">Email Address</label>
                        <input 
                            type="email" 
                            value={data.email}
                            onChange={e => setData('email', e.target.value)}
                            className="w-full bg-stone-50 border border-stone-200 rounded-lg py-2.5 px-3 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors"
                            placeholder="jane@example.com"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-stone-700 mb-1">Product Reference</label>
                            <input 
                                type="text" 
                                value={data.reference_info}
                                onChange={e => setData('reference_info', e.target.value)}
                                className="w-full bg-stone-50 border border-stone-200 rounded-lg py-2.5 px-3 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors"
                                placeholder="E.g., Wavy Tray in Blue"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-stone-700 mb-1">Expected Quantity</label>
                            <input 
                                type="number" 
                                min="1"
                                value={data.requested_quantity}
                                onChange={e => setData('requested_quantity', e.target.value)}
                                className="w-full bg-stone-50 border border-stone-200 rounded-lg py-2.5 px-3 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors"
                                placeholder="10"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">Details & Requirements</label>
                        <textarea 
                            rows="3"
                            value={data.message}
                            onChange={e => setData('message', e.target.value)}
                            className="w-full bg-stone-50 border border-stone-200 rounded-lg py-2.5 px-3 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors"
                            placeholder="Describe colors, modifications, or timeline..."
                        ></textarea>
                    </div>

                    <div className="pt-2 flex justify-end gap-3">
                        <button 
                            type="button" 
                            onClick={onClose}
                            className="px-5 py-2.5 text-sm font-semibold text-stone-600 hover:text-stone-900 transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            disabled={isSubmitting}
                            className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold rounded-full shadow-sm transition-colors flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Preparing...
                                </span>
                            ) : (
                                <>
                                    <span>Continue to WhatsApp</span>
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                                    </svg>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
