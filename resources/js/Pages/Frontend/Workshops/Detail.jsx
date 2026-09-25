import CustomerLayout from '@/Layouts/Frontend/CustomerLayout';
import { Head, Link } from '@inertiajs/react';
import { trackEvent } from '@/utils/analytics';
import { useEffect, useState } from 'react';

export default function Detail({ workshop, whatsappNumber }) {
    useEffect(() => {
        trackEvent('workshop_view', { 
            workshop_id: workshop.id,
            workshop_title: workshop.title
        });
    }, [workshop]);

    const [selectedDate, setSelectedDate] = useState(workshop.dates.length > 0 ? workshop.dates[0] : null);

    const handleWhatsAppClick = () => {
        trackEvent('whatsapp_workshop_click', {
            workshop_id: workshop.id,
            workshop_title: workshop.title,
            date_id: selectedDate ? selectedDate.id : null
        });
        
        let message = `Hello Swecha Studio! I am interested in joining the workshop: *${workshop.title}*.`;
        if (selectedDate) {
            const dateStr = new Date(selectedDate.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
            message += `\nI would like to inquire about the session on *${dateStr}*.`;
        }
        
        window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank');
    };

    return (
        <CustomerLayout>
            <Head title={`${workshop.title} - Swecha Studio`} />
            
            <div className="bg-brand-100/70 border-b border-brand-200/60 py-3.5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <nav className="flex items-center gap-2 text-xs text-stone-500 uppercase tracking-wider overflow-x-auto whitespace-nowrap scrollbar-none">
                        <Link href={route('home')} className="hover:text-brand-500 transition-colors">Home</Link>
                        <span>/</span>
                        <Link href={route('workshops.index')} className="hover:text-brand-500 transition-colors">Workshops</Link>
                        <span>/</span>
                        <span className="text-brand-900 font-semibold truncate max-w-[240px]">{workshop.title}</span>
                    </nav>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
                    
                    {/* Left Column: Image & Details */}
                    <div className="lg:col-span-7 space-y-10">
                        <div className="w-full aspect-[4/3] bg-stone-100 rounded-3xl overflow-hidden shadow-soft border border-brand-200/80">
                            {workshop.images && workshop.images.length > 0 ? (
                                <img 
                                    src={`/storage/${workshop.images[0].image_path}`} 
                                    alt={workshop.title} 
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-stone-300 font-serif italic text-2xl">
                                    Swecha Studio
                                </div>
                            )}
                        </div>
                        
                        {workshop.images && workshop.images.length > 1 && (
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                                {workshop.images.slice(1).map((img, index) => (
                                    <div key={index} className="aspect-square rounded-2xl overflow-hidden shadow-sm border border-brand-200/50">
                                        <img src={`/storage/${img.image_path}`} alt={`${workshop.title} image ${index + 1}`} className="w-full h-full object-cover" />
                                    </div>
                                ))}
                            </div>
                        )}
                        
                        <div>
                            <h2 className="font-serif text-2xl text-brand-900 mb-4">About the Workshop</h2>
                            <div className="text-stone-600 leading-relaxed whitespace-pre-wrap">
                                {workshop.description || "No description provided."}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Booking panel */}
                    <div className="lg:col-span-5">
                        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-brand-200/80 shadow-soft lg:sticky lg:top-24">
                            <span className="text-brand-500 text-xs font-semibold tracking-widest uppercase block mb-2">
                                Workshop Enrollment
                            </span>
                            <h1 className="font-serif text-3xl sm:text-4xl text-brand-900 font-normal mb-6">
                                {workshop.title}
                            </h1>
                            
                            <div className="text-3xl font-bold text-brand-900 mb-8 border-b border-brand-100 pb-6">
                                {workshop.price ? `₹${Number(workshop.price).toLocaleString('en-IN')}` : 'Free'}
                            </div>
                            
                            <div className="mb-8">
                                <h3 className="text-sm font-semibold text-brand-900 mb-4">Available Dates</h3>
                                {workshop.dates.length > 0 ? (
                                    <div className="space-y-3">
                                        {workshop.dates.map(date => {
                                            const dateObj = new Date(date.date);
                                            const available = date.total_seats - date.taken_seats;
                                            const isFull = available <= 0;
                                            const isSelected = selectedDate && selectedDate.id === date.id;
                                            
                                            return (
                                                <button
                                                    key={date.id}
                                                    type="button"
                                                    disabled={isFull}
                                                    onClick={() => !isFull && setSelectedDate(date)}
                                                    className={`w-full text-left p-4 rounded-xl border-2 transition-all flex justify-between items-center ${
                                                        isFull ? 'bg-stone-50 border-stone-100 opacity-50 cursor-not-allowed' :
                                                        isSelected ? 'border-brand-900 bg-brand-50 shadow-sm' : 'border-stone-200 hover:border-brand-300 bg-white'
                                                    }`}
                                                >
                                                    <div>
                                                        <div className={`font-semibold text-sm ${isSelected ? 'text-brand-900' : 'text-stone-800'}`}>
                                                            {dateObj.toLocaleDateString('en-IN', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
                                                        </div>
                                                        <div className="text-xs text-stone-500 mt-1">
                                                            {date.start_time ? date.start_time.substring(0, 5) : 'TBD'} {date.end_time ? `- ${date.end_time.substring(0, 5)}` : ''}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        {isFull ? (
                                                            <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-1 rounded">FULL</span>
                                                        ) : (
                                                            <span className={`text-xs font-bold px-2 py-1 rounded ${isSelected ? 'bg-brand-900 text-white' : 'bg-emerald-50 text-emerald-700'}`}>
                                                                {available} left
                                                            </span>
                                                        )}
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="p-4 bg-stone-50 rounded-xl text-sm text-stone-500 italic">
                                        There are currently no dates scheduled for this workshop. Check back later!
                                    </div>
                                )}
                            </div>
                            
                            <div className="space-y-4 pt-2">
                                <p className="text-xs text-center text-stone-500 mb-2">To reserve your spot, please contact us via WhatsApp. We manually confirm bookings to ensure an intimate experience.</p>
                                
                                <button 
                                    onClick={handleWhatsAppClick}
                                    disabled={workshop.dates.length > 0 && !selectedDate}
                                    className={`w-full py-4 px-6 flex items-center justify-center gap-2 text-white font-bold uppercase tracking-widest text-sm rounded-full transition-all ${
                                        (workshop.dates.length > 0 && !selectedDate) ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#25D366] hover:bg-[#128C7E] shadow-md hover:shadow-lg hover:-translate-y-0.5'
                                    }`}
                                >
                                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
                                    Chat Now to Book
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </CustomerLayout>
    );
}
