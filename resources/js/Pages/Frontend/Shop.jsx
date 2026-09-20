import React, { useState, useEffect, useRef } from 'react';
import CustomerLayout from '@/Layouts/Frontend/CustomerLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import ProductCard from '@/Components/Frontend/ProductCard';

export default function Shop({ products, categories, filters, isSearch, searchQuery, totalAvailable, similarProducts }) {
    const { site_settings } = usePage().props;
    const whatsappNumber = site_settings?.whatsapp_number?.replace(/[^0-9]/g, '') || '';
    const f = Array.isArray(filters) ? {} : (filters || {});

    // Products & Pagination State
    const [items, setItems] = useState(products.data || []);
    const [page, setPage] = useState(products.current_page || 1);
    const [hasMore, setHasMore] = useState(products.next_page_url !== null);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [isFiltering, setIsFiltering] = useState(false);

    // Filter Form State
    const [q, setQ] = useState(f.q || '');
    const [min, setMin] = useState(f.min || '');
    const [max, setMax] = useState(f.max || '');
    const [madeToOrder, setMadeToOrder] = useState(Boolean(f.made_to_order && f.made_to_order !== '0' && f.made_to_order !== 'false'));
    const [sort, setSort] = useState(f.sort || 'popular');

    const sentinelRef = useRef(null);
    const debounceTimer = useRef(null);

    // Update items when products prop updates
    useEffect(() => {
        if (products.current_page === 1) {
            setItems(products.data || []);
        } else {
            setItems(prev => {
                const existingIds = new Set(prev.map(p => p.id));
                const newItems = (products.data || []).filter(p => !existingIds.has(p.id));
                return [...prev, ...newItems];
            });
        }
        setPage(products.current_page || 1);
        setHasMore(products.next_page_url !== null);
        setIsFiltering(false);
    }, [products]);

    // Central live filter trigger
    const fetchFilteredProducts = (overrides = {}) => {
        setIsFiltering(true);

        const targetCategory = overrides.hasOwnProperty('category') ? overrides.category : (f.category || null);
        const targetQ = overrides.hasOwnProperty('q') ? overrides.q : q;
        const targetMin = overrides.hasOwnProperty('min') ? overrides.min : min;
        const targetMax = overrides.hasOwnProperty('max') ? overrides.max : max;
        const targetSort = overrides.hasOwnProperty('sort') ? overrides.sort : sort;
        const targetMadeToOrder = overrides.hasOwnProperty('madeToOrder') ? overrides.madeToOrder : madeToOrder;

        const params = {};
        if (targetQ && targetQ.trim()) params.q = targetQ.trim();
        if (targetCategory) params.category = targetCategory;
        if (targetMin !== '' && targetMin !== null && !isNaN(targetMin)) params.min = targetMin;
        if (targetMax !== '' && targetMax !== null && !isNaN(targetMax)) params.max = targetMax;
        if (targetMadeToOrder) params.made_to_order = '1';
        if (targetSort && targetSort !== 'popular') params.sort = targetSort;

        router.get(route('shop'), params, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            only: ['products', 'filters', 'isSearch', 'searchQuery', 'similarProducts'],
            onFinish: () => {
                setIsFiltering(false);
            }
        });
    };

    // Live search (debounced 350ms)
    const handleSearchChange = (val) => {
        setQ(val);
        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(() => {
            fetchFilteredProducts({ q: val });
        }, 350);
    };

    const handleClearSearch = () => {
        setQ('');
        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        fetchFilteredProducts({ q: '' });
    };

    // Live min price (debounced 400ms)
    const handleMinChange = (val) => {
        setMin(val);
        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(() => {
            fetchFilteredProducts({ min: val });
        }, 400);
    };

    // Live max price (debounced 400ms)
    const handleMaxChange = (val) => {
        setMax(val);
        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(() => {
            fetchFilteredProducts({ max: val });
        }, 400);
    };

    const handleClearPrice = () => {
        setMin('');
        setMax('');
        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        fetchFilteredProducts({ min: '', max: '' });
    };

    const handlePresetPrice = (presetMin, presetMax) => {
        const isActive = String(min) === String(presetMin) && String(max) === String(presetMax);
        const newMin = isActive ? '' : presetMin;
        const newMax = isActive ? '' : presetMax;

        setMin(newMin);
        setMax(newMax);
        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        fetchFilteredProducts({ min: newMin, max: newMax });
    };

    const handleSortChange = (val) => {
        setSort(val);
        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        fetchFilteredProducts({ sort: val });
    };

    const handleMadeToOrderChange = (val) => {
        setMadeToOrder(val);
        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        fetchFilteredProducts({ madeToOrder: val });
    };

    const handleClearAll = () => {
        setQ('');
        setMin('');
        setMax('');
        setMadeToOrder(false);
        setSort('popular');
        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        router.get(route('shop'), {}, { preserveScroll: true, replace: true });
    };

    // Infinite scroll load more
    const loadMore = () => {
        if (isLoadingMore || !hasMore) return;
        setIsLoadingMore(true);

        const nextPage = page + 1;
        const params = {};
        if (q && q.trim()) params.q = q.trim();
        if (f.category) params.category = f.category;
        if (min !== '' && min !== null && !isNaN(min)) params.min = min;
        if (max !== '' && max !== null && !isNaN(max)) params.max = max;
        if (madeToOrder) params.made_to_order = '1';
        if (sort && sort !== 'popular') params.sort = sort;
        params.page = nextPage;

        router.get(route('shop'), params, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            only: ['products'],
            onSuccess: () => {
                setIsLoadingMore(false);
            },
            onError: () => {
                setIsLoadingMore(false);
            }
        });
    };

    // Intersection Observer for Infinite Scroll
    useEffect(() => {
        if (!hasMore || isLoadingMore) return;

        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                loadMore();
            }
        }, { rootMargin: '350px 0px', threshold: 0.05 });

        const currentSentinel = sentinelRef.current;
        if (currentSentinel) {
            observer.observe(currentSentinel);
        }

        return () => {
            if (currentSentinel) observer.unobserve(currentSentinel);
        };
    }, [hasMore, isLoadingMore, page, q, min, max, sort, madeToOrder, f.category]);

    const activeCategory = f.category ? categories.find(c => c.slug === f.category) : null;
    const getCategoryName = () => {
        return activeCategory ? activeCategory.name : 'All Collections';
    };

    const seoTitle = activeCategory?.seo_title 
        ? activeCategory.seo_title 
        : (isSearch ? `Search: ${searchQuery} | Handcrafted Concrete Decor` : 
            (activeCategory ? `${activeCategory.name} | Swecha Studio` : 'Shop Handcrafted Concrete Decor & Studio Crafts'));
            
    const seoDescription = activeCategory?.seo_description
        ? activeCategory.seo_description
        : 'Browse all handcrafted concrete products at Swecha Studio. Every piece is poured and finished individually by hand.';
        
    const canonicalUrl = activeCategory ? route('shop', { category: activeCategory.slug }) : route('shop');

    const hasActiveFilters = Boolean(f.q || f.category || f.min || f.max || f.made_to_order || (f.sort && f.sort !== 'popular') || q || min !== '' || max !== '');

    return (
        <>
            <Head>
                <title>{seoTitle}</title>
                <meta head-key="description" name="description" content={seoDescription} />
                <meta head-key="og:title" property="og:title" content={seoTitle} />
                <meta head-key="og:description" property="og:description" content={seoDescription} />
                <meta head-key="og:type" property="og:type" content="website" />
                <link rel="canonical" href={canonicalUrl} />
            </Head>

            {/* Header Banner */}
            <div className="bg-brand-100 border-b border-brand-200/80 py-10 sm:py-14">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    {/* Breadcrumb */}
                    <nav className="flex items-center justify-center gap-2 text-xs text-stone-500 uppercase tracking-widest mb-3">
                        <Link href={route('home')} className="hover:text-brand-500 transition-colors">Home</Link>
                        <span>/</span>
                        <Link href={route('shop')} className="hover:text-brand-500 transition-colors">Catalog</Link>
                        {f.category ? (
                            <>
                                <span>/</span>
                                <span className="text-brand-800 font-semibold">{getCategoryName()}</span>
                            </>
                        ) : isSearch ? (
                            <>
                                <span>/</span>
                                <span className="text-brand-800 font-semibold">Search: {searchQuery}</span>
                            </>
                        ) : null}
                    </nav>

                    <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-brand-900 font-normal">
                        {isSearch ? `Search Results for "${searchQuery}"` : 
                         (f.category ? getCategoryName() : 'Curated Concrete Decor')}
                    </h1>
                    <p className="mt-3 text-sm text-stone-600 max-w-xl mx-auto font-normal">
                        {isSearch 
                            ? 'Showing direct matches from our atelier, followed by similar and complementary handcrafted studio creations.'
                            : 'Every piece is poured and finished individually by hand using our proprietary high-strength concrete blend. Water-sealed and fitted with furniture-safe pads.'
                        }
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
                
                {/* Filter & Search Bar */}
                <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-soft border border-brand-200/80 mb-8">
                    <div className="space-y-4">
                        
                        {/* 1. Category Pills */}
                        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                            <button 
                                type="button"
                                onClick={() => fetchFilteredProducts({ category: null })}
                                className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-colors btn-press ${!f.category ? 'bg-brand-800 text-white shadow-sm' : 'bg-brand-50 text-stone-700 hover:bg-brand-100'}`}
                            >
                                All Decor ({totalAvailable})
                            </button>
                            {categories.map(c => (
                                <button 
                                    key={c.id} 
                                    type="button"
                                    onClick={() => fetchFilteredProducts({ category: c.slug })}
                                    className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-colors btn-press ${f.category === c.slug ? 'bg-brand-800 text-white shadow-sm' : 'bg-brand-50 text-stone-700 hover:bg-brand-100'}`}
                                >
                                    {c.name} ({c.products_count})
                                </button>
                            ))}
                        </div>

                        {/* 2. Main Filters Container (Sleek Inline Design) */}
                        <div className="pt-3 border-t border-brand-100 flex flex-wrap items-center gap-x-5 gap-y-4">
                            
                            {/* Search */}
                            <div className="relative flex-1 min-w-[200px] max-w-sm">
                                <input 
                                    type="text" 
                                    value={q} 
                                    onChange={e => handleSearchChange(e.target.value)} 
                                    placeholder="Search decor..." 
                                    className="w-full bg-stone-50/50 border border-brand-200/80 rounded-full py-2 pl-9 pr-8 text-[13px] focus:outline-none focus:ring-1 focus:ring-brand-500 text-stone-800 placeholder:text-stone-400 transition-colors" 
                                />
                                <svg className="w-4 h-4 text-stone-400 absolute left-3 top-2.5 select-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                                </svg>
                                {isFiltering ? (
                                    <div className="absolute right-3 top-2.5 w-3.5 h-3.5 rounded-full border-2 border-stone-300 border-t-brand-600 animate-spin"></div>
                                ) : q ? (
                                    <button 
                                        type="button" 
                                        onClick={handleClearSearch} 
                                        className="absolute right-3 top-2 text-stone-400 hover:text-stone-600 text-sm font-bold p-0.5" 
                                    >
                                        &times;
                                    </button>
                                ) : null}
                            </div>

                            {/* Sort */}
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-medium text-stone-400">Sort:</span>
                                <select 
                                    value={sort} 
                                    onChange={e => handleSortChange(e.target.value)}
                                    className="bg-transparent border-none py-1.5 pl-1 pr-6 text-stone-700 text-[13px] font-medium cursor-pointer focus:ring-0 appearance-none bg-no-repeat bg-right"
                                    style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%238a867d\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'/%3E%3C/svg%3E")', backgroundSize: '14px' }}
                                >
                                    <option value="popular">Featured</option>
                                    <option value="latest">Newest</option>
                                    <option value="price_asc">Price: Low to High</option>
                                    <option value="price_desc">Price: High to Low</option>
                                </select>
                            </div>

                            {/* Vertical Divider */}
                            <div className="hidden md:block w-px h-5 bg-brand-200"></div>

                            {/* Price Range (Inline) */}
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-medium text-stone-400">Price:</span>
                                <div className="flex items-center gap-1">
                                    <div className="relative">
                                        <span className="absolute left-2.5 top-1.5 text-stone-400 text-xs font-medium">₹</span>
                                        <input
                                            type="number"
                                            value={min}
                                            onChange={e => handleMinChange(e.target.value)}
                                            placeholder="Min"
                                            className="w-16 sm:w-20 bg-stone-50/50 border border-brand-200/80 rounded-full py-1.5 pl-6 pr-2 text-xs text-stone-800 placeholder:text-stone-400 focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none transition-colors"
                                        />
                                    </div>
                                    <span className="text-stone-300 text-xs">&mdash;</span>
                                    <div className="relative">
                                        <span className="absolute left-2.5 top-1.5 text-stone-400 text-xs font-medium">₹</span>
                                        <input
                                            type="number"
                                            value={max}
                                            onChange={e => handleMaxChange(e.target.value)}
                                            placeholder="Max"
                                            className="w-16 sm:w-20 bg-stone-50/50 border border-brand-200/80 rounded-full py-1.5 pl-6 pr-2 text-xs text-stone-800 placeholder:text-stone-400 focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none transition-colors"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Quick Presets (Subtle text buttons) */}
                            <div className="flex items-center gap-1 overflow-x-auto scrollbar-none flex-nowrap">
                                {[
                                    { label: '< ₹600', min: '', max: '600' },
                                    { label: '₹600-₹1.2k', min: '600', max: '1200' },
                                    { label: '₹1.2k-₹2k', min: '1200', max: '2000' },
                                    { label: '₹2k+', min: '2000', max: '' },
                                ].map((preset, idx) => {
                                    const isActive = String(min) === String(preset.min) && String(max) === String(preset.max);
                                    return (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => handlePresetPrice(preset.min, preset.max)}
                                            className={`whitespace-nowrap text-[11px] px-2 py-1 rounded-md transition-colors ${
                                                isActive ? 'bg-brand-100 text-brand-900 font-semibold' : 'text-stone-500 hover:bg-stone-50 hover:text-stone-800'
                                            }`}
                                        >
                                            {preset.label}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Vertical Divider */}
                            <div className="hidden lg:block w-px h-5 bg-brand-200"></div>

                            {/* Custom Poured Toggle */}
                            <label className="flex items-center gap-1.5 text-[13px] font-medium text-stone-600 cursor-pointer select-none group">
                                <div className="relative flex items-center justify-center">
                                    <input 
                                        type="checkbox" 
                                        checked={madeToOrder} 
                                        onChange={e => handleMadeToOrderChange(e.target.checked)} 
                                        className="peer appearance-none w-4 h-4 border border-stone-300 rounded focus:ring-1 focus:ring-brand-500 checked:bg-brand-800 checked:border-brand-800 transition-colors cursor-pointer" 
                                    />
                                    <svg className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12"></polyline>
                                    </svg>
                                </div>
                                <span className="group-hover:text-stone-800 transition-colors">Custom Poured</span>
                            </label>

                            {/* Clear All */}
                            {hasActiveFilters && (
                                <button 
                                    type="button" 
                                    onClick={handleClearAll} 
                                    className="text-[11px] font-semibold text-brand-600 hover:text-brand-800 underline ml-auto transition-colors"
                                >
                                    Clear All
                                </button>
                            )}
                        </div>

                    </div>
                </div>

                {/* SEARCH RESULTS VIEW */}
                {isSearch ? (
                    <>
                        <div className="mb-14">
                            <div className="flex items-center justify-between mb-6 pb-3 border-b border-brand-200/80">
                                <div>
                                    <span className="text-brand-500 text-xs font-semibold tracking-widest uppercase block mb-0.5">Primary Matches</span>
                                    <h2 className="font-serif text-2xl text-brand-900 font-normal">
                                        Direct Results for "{searchQuery}"
                                        <span className="text-sm font-sans text-stone-500 font-normal ml-2">({products.total} found)</span>
                                    </h2>
                                </div>
                            </div>

                            {items.length > 0 ? (
                                <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 transition-opacity duration-200 ${isFiltering ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                                    {items.map(product => <ProductCard key={product.id} product={product} />)}
                                </div>
                            ) : (
                                <div className="py-12 bg-white rounded-2xl border border-brand-200/80 text-center p-8 space-y-3">
                                    <div className="w-14 h-14 rounded-full bg-brand-100 mx-auto flex items-center justify-center text-brand-500">
                                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                                        </svg>
                                    </div>
                                    <h3 className="font-serif text-lg text-brand-900 font-medium">No exact match found for "{searchQuery}"</h3>
                                    <p className="text-xs text-stone-500 max-w-md mx-auto">
                                        Don't worry! We found similar and coordinated handcrafted studio creations that match this style below:
                                    </p>
                                </div>
                            )}
                        </div>

                        {similarProducts && similarProducts.length > 0 && (
                            <div className="mt-12 pt-8 border-t-2 border-dashed border-brand-200">
                                <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8">
                                    <div>
                                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 rounded-full text-amber-900 text-[11px] font-semibold tracking-wider uppercase mb-2">
                                            <span>✦</span> Similar & Related Studio Pieces
                                        </div>
                                        <h2 className="font-serif text-2xl sm:text-3xl text-brand-900 font-normal">
                                            You Might Also Love
                                        </h2>
                                        <p className="text-xs text-stone-500 mt-1">
                                            Coordinated concrete designs sharing similar aesthetic forms, textures, and mineral pigments.
                                        </p>
                                    </div>
                                    <span className="text-xs text-stone-400 mt-2 sm:mt-0 font-medium">
                                        {similarProducts.length} complementary pieces
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                                    {similarProducts.map(simProduct => <ProductCard key={`sim-${simProduct.id}`} product={simProduct} />)}
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    /* STANDARD CATALOG VIEW */
                    <>
                        <div className="flex items-center justify-between mb-6 text-xs text-stone-500 font-medium">
                            <p>
                                Showing <span className="font-bold text-brand-900">{items.length}</span> of <span className="font-bold text-brand-900">{products.total}</span> handcrafted pieces
                            </p>
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                <span className="hidden sm:inline">Infinite studio feed active</span>
                            </div>
                        </div>

                        <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 transition-opacity duration-200 ${isFiltering ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                            {items.map(product => <ProductCard key={product.id} product={product} />)}
                            
                            {items.length === 0 && (
                                <div className="col-span-full py-20 bg-white rounded-2xl border border-brand-200/80 text-center p-8 space-y-4">
                                    <div className="w-16 h-16 rounded-full bg-brand-100 mx-auto flex items-center justify-center text-brand-400">
                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                                        </svg>
                                    </div>
                                    <h3 className="font-serif text-xl text-brand-900 font-medium">No decor pieces match your criteria</h3>
                                    <p className="text-xs text-stone-500 max-w-sm mx-auto">
                                        Try adjusting your filters or price range, or explore our complete handcrafted collection.
                                    </p>
                                    <div className="pt-2">
                                        <button onClick={handleClearAll} className="inline-block px-6 py-2.5 bg-brand-800 text-white rounded-full text-xs font-semibold hover:bg-brand-900 transition-colors btn-press">
                                            View All Decor
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                )}

                {/* Round Circle Loading Effect for Infinite Scroll (at the bottom when loading next products) */}
                {isLoadingMore && (
                    <div className="py-12 flex flex-col items-center justify-center gap-3 animate-fade-in">
                        <div className="relative flex items-center justify-center">
                            {/* Smooth round circle spinner */}
                            <div className="w-10 h-10 rounded-full border-3 border-stone-200 border-t-brand-700 animate-spin"></div>
                            <div className="absolute w-2 h-2 rounded-full bg-brand-700"></div>
                        </div>
                        <p className="text-xs font-serif text-brand-900 tracking-wider animate-pulse">
                            Pouring more handcrafted studio creations...
                        </p>
                    </div>
                )}

                {/* Infinite Scroll Sentinel (observed for smooth auto-trigger) */}
                {hasMore && (
                    <div ref={sentinelRef} className="h-12 w-full" aria-hidden="true" />
                )}

                {/* End of Collection Reached Banner */}
                {!hasMore && items.length > 0 && (
                    <div className="py-8 px-6 bg-brand-100/60 rounded-3xl border border-brand-200/80 max-w-md mx-auto text-center mt-10 fade-in-up">
                        <div className="w-10 h-10 rounded-full bg-white shadow-soft mx-auto flex items-center justify-center text-brand-500 mb-2">
                            <span className="text-lg">✦</span>
                        </div>
                        <h4 className="font-serif text-base text-brand-900 font-medium">
                            You've reached the end of our curated collection
                        </h4>
                        <p className="text-xs text-stone-500 mt-1">
                            All {products.total} pieces are cast, cured, and finished in our studio. Looking for a custom shape or color?
                        </p>
                        <a 
                            href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hi Swecha Studio, I browsed the catalog and would like to ask about a custom concrete piece.')}`}
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="mt-4 inline-flex items-center gap-1.5 px-5 py-2 bg-white text-emerald-800 border border-emerald-300 rounded-full text-xs font-semibold hover:bg-emerald-50 transition-colors shadow-sm btn-press"
                        >
                            <span>Message Us on WhatsApp</span> &rarr;
                        </a>
                    </div>
                )}

            </div>
        </>
    );
}

Shop.layout = page => <CustomerLayout>{page}</CustomerLayout>;
