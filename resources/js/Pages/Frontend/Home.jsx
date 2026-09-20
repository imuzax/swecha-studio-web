import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import CustomerLayout from '@/Layouts/Frontend/CustomerLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import ProductCard from '@/Components/Frontend/ProductCard';
import BulkEnquiryModal from '@/Components/Frontend/BulkEnquiryModal';

export default function Home({ trendingProducts = [], popularProducts = [], mostViewedProducts = [], newArrivals = [], categories = [], totalProductCount = 128 }) {
    const { site_settings } = usePage().props;
    const whatsappNumber = site_settings?.whatsapp_number?.replace(/[^0-9]/g, '') || '';
    
    const isVideo = (path) => {
        if (!path) return false;
        const ext = path.split('.').pop().toLowerCase();
        return ['mp4', 'webm', 'ogg'].includes(ext);
    };

    const renderMedia = (path, fallbackClass = "") => {
        if (!path) return null;
        if (isVideo(path)) {
            return <video src={`/storage/${path}`} className="w-full h-full object-cover" autoPlay muted loop playsInline />;
        }
        return <img src={`/storage/${path}`} alt="Studio Showcase" className="w-full h-full object-cover" />;
    };

    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);

    const [isGridExpanded, setIsGridExpanded] = useState(false);
    const gridContainerRef = useRef(null);
    const [maxHeight, setMaxHeight] = useState('none');
    const [visibleCount, setVisibleCount] = useState(10);
    const [isPreloading, setIsPreloading] = useState(true);
    const [preloadProgress, setPreloadProgress] = useState(0);

    useEffect(() => {
        // Prevent scrolling while preloading
        document.body.style.overflow = 'hidden';

        const interval = setInterval(() => {
            setPreloadProgress(p => {
                if (p >= 90) return 90; // Wait for timer to finish it
                return p + Math.floor(Math.random() * 15) + 5;
            });
        }, 100);

        const timer = setTimeout(() => {
            setPreloadProgress(100);
            clearInterval(interval);
            setTimeout(() => {
                setIsPreloading(false);
                document.body.style.overflow = 'auto';
            }, 400);
        }, 1200);

        return () => {
            clearInterval(interval);
            clearTimeout(timer);
            document.body.style.overflow = 'auto';
        };
    }, []);
    
    const updateGridCutoff = () => {
        if (isGridExpanded || !gridContainerRef.current) return;

        const cards = gridContainerRef.current.querySelectorAll('.product-card-item');
        if (cards.length === 0) return;

        const firstCardTop = cards[0].offsetTop;
        let itemsPerRow = 0;
        for (let i = 0; i < cards.length; i++) {
            if (Math.abs(cards[i].offsetTop - firstCardTop) < 8) {
                itemsPerRow++;
            } else {
                break;
            }
        }
        if (itemsPerRow === 0) itemsPerRow = 4;
        
        // 2 full rows (sections) visible, 3rd row starts at index itemsPerRow * 2
        const row3StartIndex = itemsPerRow * 2;
        if (cards[row3StartIndex]) {
            const row3Card = cards[row3StartIndex];
            // Cut off at row 3's top plus 45% of its height so it is partially visible
            const cutoff = Math.round(row3Card.offsetTop + (row3Card.offsetHeight * 0.45));
            setMaxHeight(`${cutoff}px`);
            setVisibleCount(row3StartIndex + Math.ceil(itemsPerRow / 2));
        } else {
            setMaxHeight('none');
        }
    };

    useEffect(() => {
        if (isGridExpanded) {
            return;
        }

        updateGridCutoff();

        let resizeTimeout;
        const handleResize = () => {
            if (!isGridExpanded) {
                clearTimeout(resizeTimeout);
                resizeTimeout = setTimeout(updateGridCutoff, 100);
            }
        };

        window.addEventListener('resize', handleResize, { passive: true });
        const timer1 = setTimeout(updateGridCutoff, 200);
        const timer2 = setTimeout(updateGridCutoff, 600);

        return () => {
            window.removeEventListener('resize', handleResize);
            clearTimeout(resizeTimeout);
            clearTimeout(timer1);
            clearTimeout(timer2);
        };
    }, [isGridExpanded, trendingProducts]);

    const handleLoadMoreClick = () => {
        if (!isGridExpanded) {
            if (gridContainerRef.current) {
                const fullHeight = gridContainerRef.current.scrollHeight;
                setMaxHeight(`${fullHeight}px`);
            }
            setIsGridExpanded(true);
            setTimeout(() => {
                setMaxHeight('none');
            }, 950);
        } else {
            router.get(route('shop'));
        }
    };

    const preloaderContent = (
        <div className={`fixed inset-0 z-[99999] flex items-center justify-center bg-brand-50 transition-all duration-700 ease-in-out ${isPreloading ? 'opacity-100 pointer-events-auto' : 'opacity-0 scale-105 pointer-events-none'}`}>
            <div className="flex flex-col items-center">
                <img src="/images/main_logo.png" alt="SWECHA Studio" className={`h-14 sm:h-20 w-auto object-contain mb-8 transition-transform duration-1000 ease-out ${isPreloading ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'}`} />
                <div className="w-48 h-[2px] bg-brand-200/50 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-700 rounded-full transition-all duration-[100ms] ease-linear" style={{ width: `${preloadProgress}%` }}></div>
                </div>
            </div>
        </div>
    );

    return (
        <>
            {/* Preloader */}
            {typeof window !== 'undefined' ? createPortal(preloaderContent, document.body) : null}

            <Head>
                <title>Home | Swecha Studio - Artisanal Concrete</title>
                <meta head-key="description" name="description" content="Discover handcrafted artisanal concrete products by Swecha Studio. Shop trending, popular, and made-to-order masterpieces." />
                <meta head-key="og:title" property="og:title" content="Home | Swecha Studio - Artisanal Concrete" />
                <meta head-key="og:description" property="og:description" content="Discover handcrafted artisanal concrete products by Swecha Studio. Shop trending, popular, and made-to-order masterpieces." />
                <meta head-key="og:type" property="og:type" content="website" />
                <link rel="canonical" href={route('home')} />
            </Head>
            
            {/* 1. EDITORIAL HERO SECTION */}
            <section className="relative bg-brand-100 overflow-hidden border-b border-brand-200/80">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-28">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                        
                        {/* Left Copy Column (7 cols) */}
                        <div className="lg:col-span-7 space-y-6 text-center lg:text-left z-10">
                            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-200/70 border border-brand-300/60 text-brand-800 text-xs font-semibold tracking-wider uppercase">
                                <span className="text-amber-500">✦</span> Artisanal Concrete & Home Accents
                            </div>

                            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-brand-900 font-normal leading-[1.15] tracking-tight">
                                Every piece is <br />
                                <span className="italic font-medium text-brand-500">poured and finished</span> individually by hand.
                            </h1>

                            <p className="text-stone-600 text-base sm:text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
                                We sculpt sculptural wavy trays, fluted conical jars, and architectural vessels using a proprietary high-strength concrete blend for lasting beauty and mindful living.
                            </p>

                            {/* CTA Actions */}
                            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                                <Link href={route('shop')} 
                                   className="w-full sm:w-auto px-8 py-3.5 bg-brand-800 hover:bg-brand-900 text-white font-medium text-sm rounded-full btn-press shadow-card hover:shadow-float text-center">
                                    Explore Collection &rarr;
                                </Link>
                                <button 
                                    onClick={() => setIsBulkModalOpen(true)}
                                    className="w-full sm:w-auto px-8 py-3.5 bg-white hover:bg-stone-50 text-brand-800 border border-brand-300 font-medium text-sm rounded-full btn-press text-center"
                                >
                                    Custom Color Request
                                </button>
                            </div>

                            {/* Mini Badges */}
                            <div className="pt-6 border-t border-brand-200/60 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-stone-500">
                                <span className="flex items-center gap-1.5">
                                    <svg className="w-4 h-4 text-emerald-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                                    Furniture-Safe Felt Pads
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <svg className="w-4 h-4 text-emerald-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                                    Water-Resistant Satin Finish
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <svg className="w-4 h-4 text-emerald-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                                    Cash on Delivery Available
                                </span>
                            </div>
                        </div>

                        {/* Right Visual Composition (5 cols) */}
                        <div className="lg:col-span-5 relative">
                            <div className="relative mx-auto max-w-md lg:max-w-none">
                                {/* Main Hero Image Frame */}
                                <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-brand-200 flex items-center justify-center">
                                    {site_settings?.hero_media ? (
                                        renderMedia(site_settings.hero_media)
                                    ) : (
                                        <svg className="w-24 h-24 text-brand-400 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 2. FOUR TRUST PILLARS */}
            <section className="reveal-item py-12 bg-white border-b border-brand-200/60">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        <div className="flex flex-col items-center text-center space-y-2">
                            <div className="w-12 h-12 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 mb-1">
                                <svg className="w-6 h-6 stroke-[1.75]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"/>
                                </svg>
                            </div>
                            <h4 className="font-serif text-sm font-semibold text-brand-900">Handcrafted Pour</h4>
                            <p className="text-xs text-stone-500">Every piece is poured and finished individually by hand in small artisan batches.</p>
                        </div>
                        <div className="flex flex-col items-center text-center space-y-2">
                            <div className="w-12 h-12 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 mb-1">
                                <svg className="w-6 h-6 stroke-[1.75]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
                                </svg>
                            </div>
                            <h4 className="font-serif text-sm font-semibold text-brand-900">Premium Materials</h4>
                            <p className="text-xs text-stone-500">We use a proprietary high-strength concrete blend engineered for silky touch and longevity.</p>
                        </div>
                        <div className="flex flex-col items-center text-center space-y-2">
                            <div className="w-12 h-12 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 mb-1">
                                <svg className="w-6 h-6 stroke-[1.75]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                                </svg>
                            </div>
                            <h4 className="font-serif text-sm font-semibold text-brand-900">Furniture Protection</h4>
                            <p className="text-xs text-stone-500">Sealed against moisture and fitted with soft cork or felt pads underneath.</p>
                        </div>
                        <div className="flex flex-col items-center text-center space-y-2">
                            <div className="w-12 h-12 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 mb-1">
                                <svg className="w-6 h-6 stroke-[1.75]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                                </svg>
                            </div>
                            <h4 className="font-serif text-sm font-semibold text-brand-900">Custom Colors</h4>
                            <p className="text-xs text-stone-500">Direct WhatsApp consultation for custom pigment shades, marble swirls & gifting.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. VISUAL CATEGORIES SHOWCASE */}
            <section className="reveal-item py-16 sm:py-20 bg-brand-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-2xl mx-auto mb-12">
                        <span className="text-brand-500 text-xs font-semibold tracking-widest uppercase block mb-1">Artisan Categories</span>
                        <h2 className="font-serif text-3xl sm:text-4xl text-brand-900 font-normal">Explore by Form & Function</h2>
                        <div className="w-12 h-0.5 bg-brand-500 mx-auto mt-3"></div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
                        {categories.map(cat => (
                            <Link key={cat.id} href={route('shop', {category: cat.slug})} className="group relative aspect-[3/4] rounded-2xl overflow-hidden shadow-soft hover-lift bg-stone-200">
                                {cat.image ? (
                                    <img src={`/storage/${cat.image}`} 
                                         alt={cat.name} 
                                         loading="lazy"
                                         className="w-full h-full object-cover object-center image-smooth group-hover:scale-110" />
                                ) : (
                                    <div className="w-full h-full bg-stone-200 flex items-center justify-center">
                                        <svg className="w-12 h-12 text-stone-400 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-brand-900/80 via-brand-900/20 to-transparent"></div>
                                <div className="absolute inset-x-0 bottom-0 p-4 text-center">
                                    <h3 className="font-serif text-white text-base sm:text-lg font-medium tracking-wide group-hover:text-amber-300 transition-colors duration-200">
                                        {cat.name}
                                    </h3>
                                    <span className="inline-block text-[11px] text-brand-200 font-sans mt-0.5 tracking-wider uppercase">
                                        {cat.products_count || 0} Pieces
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* 4. NEW ARRIVALS */}
            {newArrivals.length > 0 && (
            <section className="reveal-item py-16 sm:py-20 bg-white border-t border-brand-200/60 relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
                        <div>
                            <span className="text-brand-500 text-xs font-semibold tracking-widest uppercase block mb-1">Just Poured</span>
                            <h2 className="font-serif text-3xl sm:text-4xl text-brand-900 font-normal">New Arrivals</h2>
                            <p className="text-xs sm:text-sm text-stone-500 mt-1 font-normal">The latest additions to our handcrafted concrete collection.</p>
                        </div>
                        <Link href={route('shop')} className="mt-4 md:mt-0 text-sm font-semibold text-brand-600 hover:text-brand-800 transition-colors flex items-center gap-1.5 btn-press">
                            View Full Catalog <span>&rarr;</span>
                        </Link>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                        {newArrivals.map((product) => (
                            <div key={product.id} className="product-card-item">
                                <ProductCard product={product} />
                            </div>
                        ))}
                    </div>
                </div>
            </section>
            )}

            {/* TRENDING SECTION */}
            {trendingProducts.length > 0 && (
            <section className="reveal-item py-16 sm:py-20 bg-brand-50 border-t border-brand-200/60 relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
                        <div>
                            <span className="text-brand-500 text-xs font-semibold tracking-widest uppercase block mb-1">Hot Right Now</span>
                            <h2 className="font-serif text-3xl sm:text-4xl text-brand-900 font-normal">Trending This Week</h2>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                        {trendingProducts.map((product) => (
                            <div key={product.id} className="product-card-item">
                                <ProductCard product={product} />
                            </div>
                        ))}
                    </div>
                </div>
            </section>
            )}

            {/* POPULAR / MOST ORDERED SECTION */}
            {popularProducts.length > 0 && (
            <section className="reveal-item py-16 sm:py-20 bg-white border-t border-brand-200/60 relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
                        <div>
                            <span className="text-brand-500 text-xs font-semibold tracking-widest uppercase block mb-1">Collector Favorites</span>
                            <h2 className="font-serif text-3xl sm:text-4xl text-brand-900 font-normal">Most Popular Pieces</h2>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                        {popularProducts.map((product) => (
                            <div key={product.id} className="product-card-item">
                                <ProductCard product={product} />
                            </div>
                        ))}
                    </div>
                </div>
            </section>
            )}

            {/* MOST VIEWED SECTION */}
            {mostViewedProducts.length > 0 && (
            <section className="reveal-item py-16 sm:py-20 bg-brand-50 border-t border-brand-200/60 relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
                        <div>
                            <span className="text-brand-500 text-xs font-semibold tracking-widest uppercase block mb-1">Highly Admired</span>
                            <h2 className="font-serif text-3xl sm:text-4xl text-brand-900 font-normal">Most Viewed</h2>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                        {mostViewedProducts.map((product) => (
                            <div key={product.id} className="product-card-item">
                                <ProductCard product={product} />
                            </div>
                        ))}
                    </div>
                </div>
            </section>
            )}

            {/* 5. ARTISAN CRAFT PHILOSOPHY */}
            <section id="craft-philosophy" className="reveal-item py-20 bg-brand-100 overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white rounded-3xl overflow-hidden shadow-card border border-brand-200/80">
                        <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
                            <div className="lg:col-span-5 h-72 sm:h-96 lg:h-full relative min-h-[380px]">
                                <div className="w-full h-full bg-brand-200 flex items-center justify-center relative overflow-hidden">
                                    {site_settings?.about_media ? (
                                        renderMedia(site_settings.about_media, "w-full h-full object-cover")
                                    ) : (
                                        <svg className="w-20 h-20 text-brand-400 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    )}
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                                <div className="absolute bottom-6 left-6 text-white text-xs tracking-wider uppercase font-semibold">
                                    ✦ SWECHA Studio Atelier & Workshop
                                </div>
                            </div>
                            <div className="lg:col-span-7 p-8 sm:p-12 lg:p-16 space-y-6">
                                <span className="text-brand-500 text-xs font-semibold tracking-widest uppercase block">Our Craft Standard</span>
                                <h3 className="font-serif text-3xl sm:text-4xl text-brand-900 leading-tight">
                                    "Every piece is poured and finished individually by hand."
                                </h3>
                                <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
                                    At SWECHA Studio, we redefine concrete from an industrial construction material into a warm, tactile art form. Using a proprietary high-strength concrete blend combined with fine mineral pigments, we achieve feather-smooth finishes, crisp fluted geometry, and organic waves that ground any interior.
                                </p>
                                <div className="pt-2 flex items-center gap-6">
                                    <div>
                                        <span className="block font-serif text-2xl font-bold text-brand-900">100%</span>
                                        <span className="text-xs text-stone-500">Hand-Poured</span>
                                    </div>
                                    <div className="w-px h-10 bg-stone-200"></div>
                                    <div>
                                        <span className="block font-serif text-2xl font-bold text-brand-900">High-Strength</span>
                                        <span className="text-xs text-stone-500">Proprietary Blend</span>
                                    </div>
                                    <div className="w-px h-10 bg-stone-200"></div>
                                    <div>
                                        <span className="block font-serif text-2xl font-bold text-brand-900">Protected</span>
                                        <span className="text-xs text-stone-500">Sealed & Felt-Padded</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 7. INSTAGRAM LOOKBOOK */}
            <section className="reveal-item py-12 bg-brand-50 border-t border-brand-200/60">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <span className="text-brand-500 text-xs font-semibold tracking-widest uppercase block mb-1">Follow Our Studio</span>
                    <h3 className="font-serif text-2xl sm:text-3xl text-brand-900 mb-8">@swechastudio on Instagram</h3>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map(num => {
                            const mediaPath = site_settings?.[`instagram_media_${num}`];
                            return (
                                <div key={num} className="aspect-square rounded-2xl overflow-hidden group relative hover-lift bg-stone-200 flex items-center justify-center">
                                    {mediaPath ? (
                                        renderMedia(mediaPath)
                                    ) : (
                                        <svg className="w-12 h-12 text-stone-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>
            
            <BulkEnquiryModal 
                isOpen={isBulkModalOpen} 
                onClose={() => setIsBulkModalOpen(false)} 
            />
        </>
    );
}

Home.layout = page => <CustomerLayout>{page}</CustomerLayout>;
