import CustomerLayout from '@/Layouts/Frontend/CustomerLayout';
import { Head, Link } from '@inertiajs/react';
import { trackEvent } from '@/utils/analytics';
import { useEffect } from 'react';

export default function Index({ workshops, whatsappNumber }) {
    useEffect(() => {
        trackEvent('page_view', { path: '/workshops' });
    }, []);

    return (
        <CustomerLayout>
            <Head title="Workshops - Swecha Studio" />

            <div className="bg-stone-50 py-16 md:py-24 border-b border-brand-200/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <span className="text-brand-500 text-sm font-semibold tracking-widest uppercase block mb-3">
                        ✦ Join Our Process ✦
                    </span>
                    <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-brand-900 font-normal mb-6">
                        Concrete Art Workshops
                    </h1>
                    <p className="text-stone-600 max-w-2xl mx-auto text-lg leading-relaxed">
                        Learn the art of crafting premium concrete decor. Join our intimate workshops and create your own artisanal pieces guided by our experts.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
                {workshops.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
                        {workshops.map((workshop) => (
                            <div key={workshop.id} className="group bg-white rounded-3xl overflow-hidden shadow-soft border border-brand-200/50 transition-all duration-300 hover:shadow-md hover:-translate-y-1 flex flex-col">
                                <Link href={route('workshops.show', workshop.slug)} className="block relative aspect-[4/3] bg-stone-100 overflow-hidden">
                                    {workshop.images && workshop.images.length > 0 ? (
                                        <img 
                                            src={`/storage/${workshop.images[0].image_path}`} 
                                            alt={workshop.title} 
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-stone-300 font-serif italic text-xl">
                                            Swecha Studio
                                        </div>
                                    )}
                                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-brand-900 shadow-sm">
                                        {workshop.price ? `₹${Number(workshop.price).toLocaleString('en-IN')}` : 'Free'}
                                    </div>
                                </Link>
                                
                                <div className="p-6 flex flex-col flex-1">
                                    <h2 className="font-serif text-2xl text-brand-900 mb-2">
                                        <Link href={route('workshops.show', workshop.slug)} className="hover:text-brand-600 transition-colors">
                                            {workshop.title}
                                        </Link>
                                    </h2>
                                    <p className="text-sm text-stone-600 line-clamp-2 mb-6 flex-1">
                                        {workshop.description}
                                    </p>
                                    
                                    <div className="pt-6 border-t border-brand-100 mt-auto">
                                        <h3 className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-3">Upcoming Dates</h3>
                                        {workshop.dates.length > 0 ? (
                                            <div className="space-y-2 mb-6">
                                                {workshop.dates.slice(0, 2).map(date => {
                                                    const dateObj = new Date(date.date);
                                                    const available = date.total_seats - date.taken_seats;
                                                    return (
                                                        <div key={date.id} className="flex justify-between items-center text-sm">
                                                            <span className="font-medium text-stone-700">
                                                                {dateObj.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                            </span>
                                                            {available > 0 ? (
                                                                <span className="text-emerald-600 text-xs font-semibold">{available} spots left</span>
                                                            ) : (
                                                                <span className="text-red-500 text-xs font-semibold">Full</span>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                                {workshop.dates.length > 2 && (
                                                    <p className="text-xs text-stone-500 italic">+{workshop.dates.length - 2} more dates</p>
                                                )}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-stone-500 italic mb-6">No upcoming dates scheduled.</p>
                                        )}
                                        
                                        <Link 
                                            href={route('workshops.show', workshop.slug)}
                                            className="block w-full py-3 text-center bg-brand-900 hover:bg-brand-800 text-white text-xs font-bold uppercase tracking-widest rounded-full transition-colors"
                                        >
                                            View Details
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-3xl border border-brand-200/50">
                        <svg className="w-16 h-16 mx-auto text-stone-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <h3 className="text-xl font-serif text-brand-900 mb-2">No Workshops Scheduled</h3>
                        <p className="text-stone-500">We don't have any upcoming workshops at the moment. Please check back later.</p>
                    </div>
                )}
            </div>
        </CustomerLayout>
    );
}
