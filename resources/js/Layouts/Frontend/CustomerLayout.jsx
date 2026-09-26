import React, { useState, useEffect, useRef } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import FastCart from '@/Components/Frontend/FastCart';
import { trackEvent } from '@/utils/analytics';

export default function CustomerLayout({ children }) {
    const { auth, cart_count, flash, site_settings, active_categories = [] } = usePage().props;
    const whatsappNumber = site_settings?.whatsapp_number || '';
    
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isChatbotOpen, setIsChatbotOpen] = useState(false);
    const [showGreeting, setShowGreeting] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [chatMessages, setChatMessages] = useState([
        { sender: 'bot', text: 'Welcome to SWECHA Studio!' },
        { sender: 'bot', text: 'I can help you explore our handcrafted concrete pieces, give custom pigment suggestions, or answer questions about care & shipping.' }
    ]);
    const [chatInput, setChatInput] = useState('');
    const chatEndRef = useRef(null);

    // Initial Effects: Observer
    useEffect(() => {
        // Track page view
        trackEvent('page_view', { path: window.location.pathname });

        // Scroll Logic with RAF and passive listener
        let ticking = false;
        const handleScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    const scrolled = window.scrollY > 20;
                    setIsScrolled(prev => prev !== scrolled ? scrolled : prev);
                    ticking = false;
                });
                ticking = true;
            }
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        
        // Greeting logic removed temporarily as requested

        // Intersection Observer for scroll reveal animations
        const revealElements = document.querySelectorAll('.reveal-item');
        let observer = null;
        if ('IntersectionObserver' in window && revealElements.length > 0) {
            observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-revealed');
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.01, rootMargin: '0px 0px 120px 0px' });

            revealElements.forEach(el => observer.observe(el));
        } else {
            revealElements.forEach(el => el.classList.add('is-revealed'));
        }

        return () => {
            window.removeEventListener('scroll', handleScroll);
            if (observer) observer.disconnect();
        };
    }, []);
    
    // Body overflow logic for Mobile Menu
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isMobileMenuOpen]);

    // Chatbot auto scroll
    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [chatMessages, isChatbotOpen]);

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('shop'), { q: searchQuery });
    };

    const handleChatSubmit = (e) => {
        e.preventDefault();
        if (!chatInput.trim()) return;
        
        const newMsg = chatInput.trim();
        setChatInput('');
        setChatMessages(prev => [...prev, { sender: 'user', text: newMsg }]);
        
        setTimeout(() => {
            setChatMessages(prev => [...prev, { 
                sender: 'bot', 
                text: "Thank you for your message! Our AI Studio Assistant is ready. For instant custom orders, specific color pigments, or real-time human assistance, you can also chat with us directly via our WhatsApp Concierge." 
            }]);
        }, 600);
    };

    const sendQuickPrompt = (promptText) => {
        setChatMessages(prev => [...prev, { sender: 'user', text: promptText }]);
        setTimeout(() => {
            setChatMessages(prev => [...prev, { 
                sender: 'bot', 
                text: "Our studio artisans hand-pour each piece using high-strength concrete. For custom color options, delivery times, or bulk orders, our WhatsApp Concierge is always active for instant answers!" 
            }]);
        }, 600);
    };

    return (
        <div className="bg-brand-50 text-brand-800 font-sans antialiased selection:bg-brand-500 selection:text-white flex flex-col min-h-screen">
            
            {/* 1. Top Announcement Marquee / Banner */}
            <aside className="bg-brand-900 text-brand-100 text-xs py-2 px-4 border-b border-brand-800/80">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="hidden md:flex items-center gap-2 text-[11px] text-brand-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        <span>Atelier Open &middot; Hand-Poured Studio Crafts</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 mx-auto md:mx-0 font-medium tracking-wider uppercase text-[11px]">
                        <span className="text-amber-400">✦</span>
                        <span>Free Delivery on orders above ₹999 &middot; High-Strength Proprietary Concrete</span>
                        <span className="text-amber-400">✦</span>
                    </div>
                    <div className="hidden md:flex items-center gap-4 text-[11px] text-brand-300">
                        <a href={`https://wa.me/${whatsappNumber}?text=Hi Swecha Studio, I need help with an order.`} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-1">
                            <span>Help & Concierge</span>
                        </a>
                    </div>
                </div>
            </aside>

            {/* 2. Sticky Glassmorphic Header / Navbar */}
            <header className={`sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-brand-200/70 shadow-xs transition-all duration-300 ${isScrolled ? 'py-0' : 'py-1'}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20">
                        
                        {/* Left: Mobile Menu Trigger + Brand Logo */}
                        <div className="flex items-center gap-3 sm:gap-4">
                            <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden w-10 h-10 rounded-full flex items-center justify-center text-brand-900 hover:text-brand-500 hover:bg-brand-100 transition-colors btn-press focus:outline-none" aria-label="Open navigation menu">
                                <svg className="w-6 h-6 stroke-[1.75]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"/>
                                </svg>
                            </button>

                            <Link href={route('home')} className="flex items-center gap-3 shrink-0 focus:outline-none">
                                <img 
                                    src="/images/main_logo.png" 
                                    alt="SWECHA Studio" 
                                    className="h-9 sm:h-11 w-auto object-contain" 
                                />
                                <div className="hidden xl:block border-l border-brand-200/90 pl-3 py-0.5">
                                    <span className="block font-sans text-[9px] tracking-[0.3em] text-stone-500 uppercase font-semibold">
                                        Architectural Craft
                                    </span>
                                </div>
                            </Link>
                        </div>

                        {/* Center: Desktop Nav */}
                        <nav className="hidden lg:flex items-center gap-6 xl:gap-8 text-sm font-medium tracking-wide">
                            <Link href={route('home')} className={`relative py-1 transition-colors duration-200 hover:text-brand-600 ${route().current('home') ? 'text-brand-600 font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-brand-500 after:rounded-full' : 'text-stone-700'}`}>
                                Home
                            </Link>

                            <Link href={route('shop')} className={`relative py-1 transition-colors duration-200 hover:text-brand-600 ${route().current('shop') && !route().params?.category ? 'text-brand-600 font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-brand-500 after:rounded-full' : 'text-stone-700'}`}>
                                Shop All
                            </Link>

                            <Link href={route('workshops.index')} className={`relative py-1 transition-colors duration-200 hover:text-brand-600 ${route().current('workshops.*') ? 'text-brand-600 font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-brand-500 after:rounded-full' : 'text-stone-700'}`}>
                                Workshops
                            </Link>
                            
                            {/* Collections Dropdown */}
                            <div className="relative group">
                                <button type="button" className={`relative py-1 transition-colors duration-200 hover:text-brand-600 flex items-center gap-1.5 focus:outline-none ${route().params?.category ? 'text-brand-600 font-semibold' : 'text-stone-700'}`}>
                                    <span>Collections</span>
                                    <svg className="w-3.5 h-3.5 text-stone-400 group-hover:text-brand-600 group-hover:rotate-180 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
                                    </svg>
                                </button>
                                
                                <div className="absolute left-1/2 -translate-x-1/2 top-full pt-2 w-72 hidden group-hover:block transition-all duration-200 z-50">
                                    <div className="bg-white rounded-2xl shadow-card border border-brand-200/80 p-3 space-y-1">
                                        {active_categories.map((category) => (
                                            <Link key={category.id} href={route('shop', {category: category.slug})} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-brand-50 transition-colors group/item">
                                                <div>
                                                    <strong className="block text-xs font-semibold text-brand-900 group-hover/item:text-brand-600">{category.name}</strong>
                                                </div>
                                            </Link>
                                        ))}
                                        <div className="pt-2 border-t border-brand-100 px-1">
                                            <Link href={route('shop')} className="block text-center py-2 text-xs font-semibold text-brand-600 hover:text-brand-800 bg-brand-50 rounded-lg hover:bg-brand-100 transition-colors">
                                                View All Pieces &rarr;
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <Link href={`${route('home')}#featured-section`} 
                               className="relative py-1 transition-colors duration-200 hover:text-brand-600 text-stone-700">
                                Best Sellers
                            </Link>

                            <a href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hi Swecha Studio, I would like to inquire about custom concrete colors and bespoke pieces.')}`} 
                               target="_blank" rel="noopener noreferrer"
                               className="relative py-1 transition-colors duration-200 hover:text-brand-600 text-stone-700 flex items-center gap-1.5">
                                <span className="text-amber-500">✦</span> Bespoke Orders
                            </a>

                            <Link href={`${route('home')}#craft-philosophy`} 
                               className="relative py-1 transition-colors duration-200 hover:text-brand-600 text-stone-700">
                                Our Craft
                            </Link>
                        </nav>

                        {/* Right: Action Icons */}
                        <div className="flex items-center gap-1.5 sm:gap-2">
                            <button onClick={() => setIsSearchOpen(!isSearchOpen)} className="w-10 h-10 rounded-full flex items-center justify-center text-stone-700 hover:text-brand-500 hover:bg-brand-100 transition-colors btn-press focus:outline-none">
                                <svg className="w-5 h-5 stroke-[1.75]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                                </svg>
                            </button>

                            <div className="relative group">
                                {auth?.user ? (
                                    <Link href={auth.user.is_admin ? route('admin.dashboard') : route('dashboard')} className="w-10 h-10 rounded-full flex items-center justify-center text-stone-700 hover:text-brand-500 hover:bg-brand-100 transition-colors btn-press focus:outline-none" title="Go to Dashboard">
                                        <svg className="w-5 h-5 stroke-[1.75]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                                        </svg>
                                    </Link>
                                ) : (
                                    <Link href={route('login')} className="w-10 h-10 rounded-full flex items-center justify-center text-stone-700 hover:text-brand-500 hover:bg-brand-100 transition-colors btn-press">
                                        <svg className="w-5 h-5 stroke-[1.75]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                                        </svg>
                                    </Link>
                                )}
                            </div>

                            <button onClick={() => window.dispatchEvent(new Event('open-fast-cart'))} className="relative w-10 h-10 rounded-full flex items-center justify-center text-stone-700 hover:text-brand-500 hover:bg-brand-100 transition-colors btn-press">
                                <svg className="w-5 h-5 stroke-[1.75]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
                                </svg>
                                {(cart_count > 0) && (
                                    <span className="absolute -top-0.5 -right-0.5 bg-brand-500 text-white text-[10px] font-bold rounded-full h-5 min-w-[20px] px-1 flex items-center justify-center shadow-sm transition-transform duration-300">
                                        {cart_count}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Horizontal Desktop Category Ribbon */}
                <div className="hidden lg:block bg-stone-50/90 border-t border-brand-200/60 py-2.5">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center gap-7 text-xs font-medium text-stone-600 tracking-wide">
                        <Link href={route('shop')} className={`hover:text-brand-600 transition-colors ${!route().params?.category && route().current('shop') ? 'text-brand-600 font-semibold' : ''}`}>
                            All Decor
                        </Link>
                        {active_categories.slice(0, 4).map(category => (
                            <React.Fragment key={category.id}>
                                <span className="text-stone-300">&middot;</span>
                                <Link href={route('shop', {category: category.slug})} className={`hover:text-brand-600 transition-colors ${route().params?.category === category.slug ? 'text-brand-600 font-semibold' : ''}`}>
                                    {category.name}
                                </Link>
                            </React.Fragment>
                        ))}
                        <span className="text-stone-300">&middot;</span>
                        <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:text-brand-700 font-semibold flex items-center gap-1">
                            <span className="text-amber-500">✦</span> Bespoke Consultation
                        </a>
                    </div>
                </div>

                {/* Smooth Expanding Quick Search Bar */}
                <div className="overflow-hidden transition-all duration-300 ease-out border-t border-brand-200/60 bg-brand-50/95" style={{ maxHeight: isSearchOpen ? '140px' : '0px', opacity: isSearchOpen ? 1 : 0 }}>
                    <div className="max-w-3xl mx-auto px-4 py-3.5">
                        <form onSubmit={handleSearch} className="relative flex items-center">
                            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search concrete trays, ribbed jars, planters..." className="w-full bg-white border border-brand-200 rounded-full py-2.5 pl-12 pr-28 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 text-brand-900 placeholder:text-stone-400 shadow-soft" />
                            <svg className="w-4 h-4 text-stone-400 absolute left-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                            </svg>
                            <button type="submit" className="absolute right-1.5 px-4 py-1.5 bg-brand-800 hover:bg-brand-900 text-white text-xs font-semibold rounded-full transition-colors btn-press">
                                Search
                            </button>
                        </form>
                    </div>
                </div>
            </header>

            {/* 3. Global Notification Banners */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 w-full">
                {flash?.success && (
                    <div className="flex items-center justify-between p-4 mb-4 bg-emerald-50 border-l-4 border-emerald-500 text-emerald-800 rounded-r-xl shadow-soft text-sm spring-transition">
                        <div className="flex items-center gap-3">
                            <svg className="w-5 h-5 text-emerald-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                            </svg>
                            <span>{flash.success}</span>
                        </div>
                    </div>
                )}
                {flash?.error && (
                    <div className="flex items-center justify-between p-4 mb-4 bg-red-50 border-l-4 border-red-500 text-red-800 rounded-r-xl shadow-soft text-sm spring-transition">
                        <div className="flex items-center gap-3">
                            <svg className="w-5 h-5 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                            </svg>
                            <span>{flash.error}</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Main Page Content */}
            <main className="flex-grow page-transition">
                {children}
            </main>

            {/* 5. Floating Concierge Cluster */}
            <aside className="fixed bottom-20 sm:bottom-8 right-4 sm:right-6 z-40 flex flex-col items-end gap-3">

                {/* Chatbot Button */}
                <button type="button" onClick={() => {setIsChatbotOpen(!isChatbotOpen); setShowGreeting(false);}} className="group w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center bg-brand-900 hover:bg-brand-800 text-amber-400 shadow-lg hover:shadow-xl hover:scale-105 border border-brand-700/80 transition-all duration-200 btn-press focus:outline-none">
                    <svg className="w-6 h-6 sm:w-7 sm:h-7 text-amber-400 group-hover:scale-110 transition-transform duration-200" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M7 19l-3.5 1.5 1-3.5A8.5 8.5 0 1120.5 12c0 4.694-3.806 8.5-8.5 8.5a8.47 8.47 0 01-5-1.6z"/>
                        <path fill="currentColor" stroke="none" d="M12 7.5c.25 1.6 1.4 2.75 3 3-1.6.25-2.75 1.4-3 3-.25-1.6-1.4-2.75-3-3 1.6-.25 2.75-1.4 3-3z"/>
                    </svg>
                </button>

                {/* WhatsApp Button */}
                <a href={`https://wa.me/${whatsappNumber}?text=Hello Swecha Studio! I would like to inquire about your handcrafted concrete decor pieces.`} target="_blank" rel="noopener noreferrer" onClick={() => trackEvent('whatsapp_click', { location: 'floating_concierge' })} className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 btn-press focus:outline-none">
                    <svg className="w-6 h-6 sm:w-7 sm:h-7 fill-current flex-shrink-0" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
                </a>
            </aside>

            {/* Chatbot Window */}
            <div className={`fixed bottom-[104px] sm:bottom-28 right-4 sm:right-6 z-50 w-[calc(100%-2rem)] sm:w-96 max-w-sm bg-white rounded-3xl shadow-2xl border border-brand-200/80 overflow-hidden transform transition-all duration-300 ease-out flex flex-col ${isChatbotOpen ? 'scale-100 opacity-100 pointer-events-auto' : 'scale-95 opacity-0 pointer-events-none'}`} style={{ maxHeight: '520px', height: '500px' }}>
                <div className="bg-brand-900 px-4 py-3 border-b border-brand-800 flex items-center justify-between flex-shrink-0">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-brand-800 text-amber-400 border border-brand-700/50 flex items-center justify-center shadow-sm">
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M7 19l-3.5 1.5 1-3.5A8.5 8.5 0 1120.5 12c0 4.694-3.806 8.5-8.5 8.5a8.47 8.47 0 01-5-1.6z"/><path fill="currentColor" stroke="none" d="M12 7.5c.25 1.6 1.4 2.75 3 3-1.6.25-2.75 1.4-3 3-.25-1.6-1.4-2.75-3-3 1.6-.25 2.75-1.4 3-3z"/></svg>
                        </div>
                        <div>
                            <h3 className="font-serif text-sm font-semibold text-white leading-none">SWECHA Studio Concierge</h3>
                            <p className="text-[10px] text-emerald-400 flex items-center gap-1 font-medium mt-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> AI Assistant &middot; Ready to help
                            </p>
                        </div>
                    </div>
                    <button type="button" onClick={() => setIsChatbotOpen(false)} className="text-stone-400 hover:text-white p-1 text-xl leading-none focus:outline-none">&times;</button>
                </div>
                <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs bg-brand-50/60 scrollbar-none">
                    {chatMessages.map((msg, idx) => (
                        msg.sender === 'bot' ? (
                            <div key={idx} className="flex items-start gap-2.5">
                                <div className="w-7 h-7 rounded-full bg-brand-800 text-amber-400 flex items-center justify-center flex-shrink-0 text-xs font-serif font-bold">S</div>
                                <div className="bg-white p-3.5 rounded-2xl rounded-tl-none border border-brand-200/70 text-stone-700 shadow-soft max-w-[85%] space-y-1.5">
                                    <p className="leading-relaxed">{msg.text}</p>
                                </div>
                            </div>
                        ) : (
                            <div key={idx} className="flex justify-end">
                                <div className="bg-brand-800 text-white p-3 rounded-2xl rounded-tr-none text-xs max-w-[85%] shadow-sm">{msg.text}</div>
                            </div>
                        )
                    ))}
                    {chatMessages.length === 2 && (
                        <div className="pt-2">
                            <p className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold mb-2">Suggested Inquiries</p>
                            <div className="flex flex-wrap gap-1.5">
                                <button type="button" onClick={() => sendQuickPrompt('Tell me about custom colors')} className="text-[11px] bg-white hover:bg-brand-100 text-brand-800 border border-brand-200 px-3 py-1.5 rounded-full transition-colors">✦ Custom Colors</button>
                                <button type="button" onClick={() => sendQuickPrompt('What is the shipping time?')} className="text-[11px] bg-white hover:bg-brand-100 text-brand-800 border border-brand-200 px-3 py-1.5 rounded-full transition-colors">✦ Shipping & Delivery</button>
                            </div>
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>
                <div className="p-3 bg-white border-t border-brand-100">
                    <form onSubmit={handleChatSubmit} className="flex items-center gap-2">
                        <input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="Ask about pieces, materials..." className="flex-1 bg-brand-50 border border-brand-200 rounded-full px-4 py-2.5 text-xs text-brand-900 focus:outline-none focus:ring-2 focus:ring-brand-500 placeholder:text-stone-400" />
                        <button type="submit" className="w-9 h-9 rounded-full bg-brand-800 hover:bg-brand-900 text-white flex items-center justify-center flex-shrink-0 transition-colors btn-press">
                            <svg className="w-4 h-4 transform rotate-90" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"/></svg>
                        </button>
                    </form>
                    <p className="text-[9px] text-center text-stone-400 mt-1.5">AI Concierge &middot; Ready for API Integration</p>
                </div>
            </div>

            {/* Mobile Bottom Navigation (Hidden on desktop) */}
            <nav className="lg:hidden fixed bottom-0 w-full bg-white/95 backdrop-blur-md border-t border-brand-200/80 flex justify-around items-center h-14 sm:h-16 z-30 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
                <Link href={route('home')} className={`flex flex-col items-center gap-1 transition ${route().current('home') ? 'text-brand-500 font-semibold' : 'text-stone-500 hover:text-brand-500'}`}>
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 stroke-[1.75]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                    <span className="text-[9px] sm:text-[10px] uppercase font-semibold">Home</span>
                </Link>
                <Link href={route('shop')} className={`flex flex-col items-center gap-1 transition ${route().current('shop') ? 'text-brand-500 font-semibold' : 'text-stone-500 hover:text-brand-500'}`}>
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 stroke-[1.75]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg>
                    <span className="text-[9px] sm:text-[10px] uppercase font-semibold">Catalog</span>
                </Link>
                <button onClick={() => window.dispatchEvent(new Event('open-fast-cart'))} className={`flex flex-col items-center gap-1 relative transition ${route().current('cart.*') ? 'text-brand-500 font-semibold' : 'text-stone-500 hover:text-brand-500'}`}>
                    {(cart_count > 0) && (
                        <span className="absolute -top-1 right-1 bg-brand-500 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">{cart_count}</span>
                    )}
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 stroke-[1.75]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                    <span className="text-[9px] sm:text-[10px] uppercase font-semibold">Bag</span>
                </button>
                <Link href={auth?.user ? route('profile.edit') : route('login')} className={`flex flex-col items-center gap-1 transition ${route().current('login') || route().current('profile.*') ? 'text-brand-500 font-semibold' : 'text-stone-500 hover:text-brand-500'}`}>
                    <div className="relative">
                        <svg className="w-5 h-5 sm:w-6 sm:h-6 stroke-[1.75]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                        </svg>
                    </div>
                    <span className="text-[9px] sm:text-[10px] uppercase font-semibold">{auth?.user ? 'Profile' : 'Login'}</span>
                </Link>
            </nav>

            {/* Mobile Drawer Navigation (Side Menu) */}
            <div className={`fixed inset-0 z-50 pointer-events-none transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0'}`}>
                <div className={`fixed inset-0 bg-brand-900/60 backdrop-blur-sm transition-opacity duration-300`} onClick={() => setIsMobileMenuOpen(false)}></div>
                <div className={`fixed inset-y-0 left-0 max-w-xs w-full bg-white shadow-2xl p-6 flex flex-col justify-between z-10 transform transition-transform duration-350 ease-out overflow-y-auto ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    <div>
                        <div className="flex items-center justify-between pb-5 border-b border-brand-100">
                            <Link href={route('home')} onClick={() => setIsMobileMenuOpen(false)}>
                                <img 
                                    src="/images/main_logo.png" 
                                    alt="SWECHA Studio" 
                                    className="h-8 w-auto object-contain" 
                                />
                            </Link>
                            <button onClick={() => setIsMobileMenuOpen(false)} className="text-stone-400 hover:text-stone-700 p-1 btn-press focus:outline-none">
                                <svg className="w-6 h-6 stroke-[1.75]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                                </svg>
                            </button>
                        </div>
                        <div className="mt-6 space-y-5 text-xs font-medium">
                            <Link href={route('home')} onClick={() => setIsMobileMenuOpen(false)} className="block py-1.5 text-stone-700">Home</Link>
                            <Link href={route('shop')} onClick={() => setIsMobileMenuOpen(false)} className="block py-1.5 text-stone-700">Shop All Catalog</Link>
                            <Link href={route('workshops.index')} onClick={() => setIsMobileMenuOpen(false)} className="block py-1.5 text-stone-700">Workshops</Link>
                            <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 py-2 px-2.5 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 transition-colors font-semibold mt-4">
                                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                <span>Direct WhatsApp Consultation</span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            <FastCart />

            {/* Footer */}
            <footer className="mt-24 bg-brand-900 text-brand-200 border-t border-brand-800 pb-16 md:pb-0">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
                        <div className="lg:col-span-2 space-y-4">
                            <Link href={route('home')} className="inline-block">
                                <img 
                                    src="/images/main_logo.png" 
                                    alt="SWECHA Studio" 
                                    className="h-10 w-auto object-contain brightness-0 invert opacity-90 hover:opacity-100 transition-opacity" 
                                />
                            </Link>
                            <p className="text-sm text-brand-300/90 leading-relaxed max-w-sm">
                                Sculptural home decor and mindful craft. Every piece is poured and finished individually by hand using a proprietary high-strength concrete blend, sealed for durability, and backed with protective furniture pads.
                            </p>
                        </div>
                        <div>
                            <h3 className="text-white font-display text-sm tracking-wider uppercase mb-4 font-semibold">Collections</h3>
                            <ul className="space-y-2.5 text-xs text-brand-300">
                                <li><Link href={route('shop')} className="hover:text-white transition-colors duration-200">All Home Decor</Link></li>
                                <li><Link href={route('workshops.index')} className="hover:text-white transition-colors duration-200">Workshops</Link></li>
                                {active_categories.slice(0, 4).map(category => (
                                    <li key={category.id}><Link href={route('shop', {category: category.slug})} className="hover:text-white transition-colors duration-200">{category.name}</Link></li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-white font-display text-sm tracking-wider uppercase mb-4 font-semibold">The Studio Circle</h3>
                            <p className="text-xs text-brand-300/80 mb-3 leading-relaxed">
                                Join our newsletter for early access to limited small-batch studio drops and custom color releases.
                            </p>
                            <form onSubmit={e => e.preventDefault()} className="space-y-2">
                                <input type="email" required placeholder="Enter your email" className="w-full bg-brand-800/80 border border-brand-700 text-white rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-brand-500 placeholder:text-stone-400" />
                                <button type="submit" className="w-full mt-2 bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold py-2 rounded-xl transition-colors btn-press">Subscribe</button>
                            </form>
                        </div>
                    </div>
                    <div className="mt-12 pt-8 border-t border-brand-800 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-brand-400">
                        <p>&copy; {new Date().getFullYear()} SWECHA Studio. Handcrafted Concrete Home Decor. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
