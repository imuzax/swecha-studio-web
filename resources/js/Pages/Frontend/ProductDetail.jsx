import React, { useState, useEffect, useRef } from 'react';
import CustomerLayout from '@/Layouts/Frontend/CustomerLayout';
import { Head, Link, useForm, router, usePage } from '@inertiajs/react';
import ProductCard from '@/Components/Frontend/ProductCard';
import { trackEvent } from '@/utils/analytics';

export default function ProductDetail({ product, similarProducts, isWishlisted }) {
    const { auth } = usePage().props;
    
    // Setup form
    const defaultVariant = product.variants && product.variants.length > 0 ? product.variants[0].id : null;
    
    const { data, setData, post, processing } = useForm({
        quantity: 1,
        buy_now: 0,
        variant_id: defaultVariant,
        customizations: []
    });

    const [activeIndex, setActiveIndex] = useState(0);
    const carouselRef = useRef(null);

    // Provide default images if none
    const defaultImages = [];
    
    const displayImages = product.images && product.images.length > 0 
        ? product.images.map(img => ({ url: img.path.startsWith('http') ? img.path : `/storage/${img.path}` })) 
        : defaultImages;

    const scrollToImage = (index) => {
        if (!carouselRef.current) return;
        const width = carouselRef.current.clientWidth;
        carouselRef.current.scrollTo({
            left: index * width,
            behavior: 'smooth'
        });
        setActiveIndex(index);
    };

    const scrollCarousel = (direction) => {
        if (!carouselRef.current) return;
        const totalImages = displayImages.length;
        if (totalImages === 0) return;
        
        let newIndex = activeIndex + direction;
        if (newIndex < 0) newIndex = totalImages - 1;
        if (newIndex >= totalImages) newIndex = 0;
        
        scrollToImage(newIndex);
    };

    useEffect(() => {
        trackEvent('product_view', {
            product_id: product.id,
            product_name: product.name,
            price: product.price
        });

        const carousel = carouselRef.current;
        if (!carousel) return;

        let isScrolling;
        const handleScroll = () => {
            window.clearTimeout(isScrolling);
            isScrolling = setTimeout(() => {
                const width = carousel.clientWidth || 1;
                const index = Math.round(carousel.scrollLeft / width);
                setActiveIndex(prev => (prev !== index ? index : prev));
            }, 66);
        };

        carousel.addEventListener('scroll', handleScroll, { passive: true });
        return () => carousel.removeEventListener('scroll', handleScroll);
    }, []);

    const addToCart = (e) => {
        e.preventDefault();
        
        setTimeout(() => {
            trackEvent('add_to_cart', {
                product_id: product.id,
                product_name: product.name,
                quantity: data.quantity
            });
        }, 500);

        post(route('cart.add', product.id), {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                window.dispatchEvent(new Event('open-fast-cart'));
            }
        });
    };

    const buyNow = (e) => {
        e.preventDefault();
        setData('buy_now', 1);
        setTimeout(() => {
            post(route('cart.add', product.id));
        }, 50);
    };

    const toggleWishlist = () => {
        if (!auth.user) {
            router.get(route('login'));
            return;
        }
        router.post(route('wishlist.toggle', product.id), {}, { preserveScroll: true });
    };

    const handleCustomizationChange = (optionId, checked) => {
        if (checked) {
            setData('customizations', [...data.customizations, optionId]);
        } else {
            setData('customizations', data.customizations.filter(id => id !== optionId));
        }
    };

    // Calculate dynamic price
    const basePrice = Number(product.sale_price || product.price);
    
    let variantPriceAdj = 0;
    if (data.variant_id && product.variants) {
        const variant = product.variants.find(v => v.id === data.variant_id);
        if (variant) {
            variantPriceAdj = Number(variant.price_adjustment);
        }
    }

    let customPriceAdj = 0;
    if (product.customizations && data.customizations.length > 0) {
        product.customizations.forEach(cust => {
            cust.options.forEach(opt => {
                if (data.customizations.includes(opt.id)) {
                    customPriceAdj += Number(opt.price_adjustment);
                }
            });
        });
    }

    const effectivePrice = basePrice + variantPriceAdj + customPriceAdj;
    
    const hasDiscount = product.price > basePrice;
    const baseDiscount = hasDiscount ? product.price - basePrice : 0;
    const originalTotalPrice = hasDiscount ? Number(product.price) + variantPriceAdj + customPriceAdj : effectivePrice;
    const totalDiscount = originalTotalPrice - effectivePrice;
    const totalDiscountPercent = hasDiscount ? Math.round((totalDiscount / originalTotalPrice) * 100) : 0;

    const seoTitle = product.seo_title || `${product.name} - Swecha Studio`;
    const seoDescription = product.seo_description || product.short_description || `Buy ${product.name} at Swecha Studio. Handcrafted artisanal concrete.`;
    const ogImage = product.images && product.images.length > 0 
        ? (product.images[0].path.startsWith('http') ? product.images[0].path : `/storage/${product.images[0].path}`) 
        : null;
    const canonicalUrl = route('product.detail', product.slug);

    return (
        <>
            <Head>
                <title>{seoTitle}</title>
                <meta head-key="description" name="description" content={seoDescription} />
                <meta head-key="og:title" property="og:title" content={seoTitle} />
                <meta head-key="og:description" property="og:description" content={seoDescription} />
                <meta head-key="og:type" property="og:type" content="product" />
                {ogImage && <meta head-key="og:image" property="og:image" content={ogImage.startsWith('http') ? ogImage : `${window.location.origin}${ogImage}`} />}
                <link rel="canonical" href={canonicalUrl} />
            </Head>
            
            {/* Breadcrumbs */}
            <div className="bg-brand-100/70 border-b border-brand-200/60 py-3.5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <nav className="flex items-center gap-2 text-xs text-stone-500 uppercase tracking-wider overflow-x-auto whitespace-nowrap scrollbar-none">
                        <Link href={route('home')} className="hover:text-brand-500 transition-colors">Home</Link>
                        <span>/</span>
                        <Link href={route('shop')} className="hover:text-brand-500 transition-colors">Catalog</Link>
                        {product.category && (
                            <>
                                <span>/</span>
                                <Link href={route('shop', { category: product.category.slug })} className="hover:text-brand-500 transition-colors">
                                    {product.category.name}
                                </Link>
                            </>
                        )}
                        <span>/</span>
                        <span className="text-brand-900 font-semibold truncate max-w-[240px]">{product.name}</span>
                    </nav>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
                    
                    {/* LEFT COLUMN: IMAGE GALLERY */}
                    <div className="lg:col-span-6 flex flex-col gap-5 lg:sticky lg:top-24">
                        <div className="relative w-full aspect-square bg-stone-100 rounded-3xl overflow-hidden shadow-soft border border-brand-200/80 group">
                            
                            <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center overflow-hidden">
                                <span className="text-4xl md:text-6xl font-serif text-white/40 -rotate-45 tracking-[0.3em] font-bold mix-blend-overlay select-none whitespace-nowrap drop-shadow-md">
                                    SWECHA STUDIO
                                </span>
                            </div>
                            
                            <div ref={carouselRef} className="flex w-full h-full overflow-x-auto snap-x snap-mandatory scrollbar-none scroll-smooth">
                                {displayImages.length > 0 ? (
                            displayImages.map((img, idx) => (
                                <div key={idx} className="w-full flex-shrink-0 snap-center relative aspect-square">
                                    <img 
                                        src={img.url} 
                                        alt={`${product.name} - View ${idx + 1}`} 
                                        className="w-full h-full object-cover object-center image-smooth"
                                        loading={idx === 0 ? "eager" : "lazy"}
                                        decoding="async"
                                    />
                                </div>
                            ))
                        ) : (
                            <div className="w-full flex-shrink-0 snap-center relative aspect-square bg-stone-100 flex items-center justify-center">
                                <svg className="w-24 h-24 text-stone-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                        )}
                            </div>

                            {/* Floating Badges */}
                            <div className="absolute top-4 left-4 flex flex-col gap-2 z-10 pointer-events-none">
                                {product.is_made_to_order == 1 && (
                                    <span className="px-3 py-1 bg-amber-900/90 text-amber-100 text-xs font-semibold tracking-wider uppercase rounded-full shadow-sm">
                                        ✦ Custom Poured to Order
                                    </span>
                                )}
                                {totalDiscountPercent > 0 && (
                                    <span className="px-3 py-1 bg-brand-500 text-white text-xs font-bold tracking-wider uppercase rounded-full shadow-sm">
                                        Save {totalDiscountPercent}% Off
                                    </span>
                                )}
                                {product.stock_quantity <= 0 && (
                                    <span className="px-3 py-1 bg-stone-800 text-white text-xs font-medium tracking-wider uppercase rounded-full shadow-sm">
                                        Sold Out
                                    </span>
                                )}
                            </div>

                            <button type="button" onClick={toggleWishlist} className={`absolute top-4 right-4 z-30 p-2.5 rounded-full backdrop-blur-sm shadow-soft transition-all focus:outline-none ${isWishlisted ? 'bg-red-50 text-red-500 hover:bg-red-100' : 'bg-white/80 text-stone-400 hover:text-red-500 hover:bg-white'}`}>
                                <svg className="w-5 h-5" fill={isWishlisted ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isWishlisted ? "1.5" : "2"} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                            </button>

                            <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[11px] font-medium text-stone-700 shadow-sm pointer-events-none flex items-center gap-1.5 md:hidden">
                                <span>Swipe to view</span>
                            </div>
                            
                            {displayImages.length > 1 && (
                                <>
                                    <button type="button" onClick={() => scrollCarousel(-1)} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white backdrop-blur-sm rounded-full shadow-md items-center justify-center text-brand-900 opacity-0 group-hover:opacity-100 transition-opacity hidden md:flex focus:outline-none">
                                        &larr;
                                    </button>
                                    <button type="button" onClick={() => scrollCarousel(1)} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white backdrop-blur-sm rounded-full shadow-md items-center justify-center text-brand-900 opacity-0 group-hover:opacity-100 transition-opacity hidden md:flex focus:outline-none">
                                        &rarr;
                                    </button>
                                </>
                            )}
                        </div>

                        {displayImages.length > 1 && (
                            <>
                                <div className="relative z-10 hidden md:flex items-center gap-3 overflow-x-auto py-1 scrollbar-none">
                                    {displayImages.map((img, index) => (
                                        <button key={index}
                                                type="button" 
                                                onClick={() => scrollToImage(index)}
                                                className={`flex-shrink-0 w-20 h-20 rounded-2xl overflow-hidden border-2 focus:outline-none transition-all duration-200 ${activeIndex === index ? 'border-brand-500 ring-2 ring-brand-500/30 shadow-sm' : 'border-brand-200/80 opacity-75 hover:opacity-100 hover:border-brand-400'}`}>
                                            <img src={img.url} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover pointer-events-none" loading="lazy" decoding="async" />
                                        </button>
                                    ))}
                                </div>
                                <div className="flex items-center justify-center gap-1.5 md:hidden mt-2">
                                    {displayImages.map((_, index) => (
                                        <button key={index}
                                                type="button" 
                                                onClick={() => scrollToImage(index)}
                                                className={`w-2 h-2 rounded-full transition-all duration-200 ${activeIndex === index ? 'bg-brand-900 w-4' : 'bg-brand-300'}`} />
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    {/* RIGHT COLUMN: DETAILS */}
                    <div className="lg:col-span-6 space-y-6">
                        <div>
                            {product.category && (
                                <Link href={route('shop', { category: product.category.slug })} className="inline-block text-xs font-semibold tracking-widest uppercase text-brand-500 hover:text-brand-700 transition-colors mb-2">
                                    {product.category.name}
                                </Link>
                            )}
                            <h1 className="font-serif text-3xl sm:text-4xl text-brand-900 font-normal leading-tight">
                                {product.name}
                            </h1>
                        </div>

                        <div className="p-4 sm:p-5 bg-white rounded-2xl border border-brand-200/80 shadow-soft space-y-2">
                            <div className="flex items-baseline gap-3">
                                <span className="font-sans text-3xl font-bold text-brand-900 tracking-tight">
                                    ₹{Number(effectivePrice).toLocaleString('en-IN')}
                                </span>
                                {hasDiscount && (
                                    <>
                                        <span className="font-sans text-lg text-stone-400 line-through">
                                            ₹{Number(originalTotalPrice).toLocaleString('en-IN')}
                                        </span>
                                        <span className="font-sans text-xs font-semibold text-emerald-800 bg-emerald-100/70 px-2.5 py-0.5 rounded-full">
                                            Save ₹{Number(totalDiscount).toLocaleString('en-IN')} ({totalDiscountPercent}% Off)
                                        </span>
                                    </>
                                )}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-stone-500 pt-1 border-t border-brand-100">
                                <svg className="w-4 h-4 text-emerald-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                                </svg>
                                <span>Inclusive of all GST.</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2.5 text-xs">
                            {product.is_made_to_order ? (
                                <>
                                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                                    <span className="text-amber-900 font-medium">Made to Order &middot; Hand-cast & cured</span>
                                </>
                            ) : product.stock_quantity > 0 ? (
                                <>
                                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                    <span className="text-emerald-900 font-medium">In Stock</span>
                                </>
                            ) : (
                                <>
                                    <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                                    <span className="text-red-700 font-medium">Sold Out</span>
                                </>
                            )}
                        </div>

                        <div className="text-xs sm:text-sm text-stone-600 leading-relaxed space-y-4 border-t border-brand-200/60 pt-4">
                            {product.short_description && (
                                <div className="font-medium text-brand-900 whitespace-pre-wrap">{product.short_description}</div>
                            )}
                            {product.full_description && (
                                <div className="prose prose-sm prose-stone max-w-none mt-2" dangerouslySetInnerHTML={{ __html: product.full_description }} />
                            )}
                        </div>
                        
                        {/* Variants Section */}
                        {product.variants && product.variants.length > 0 && (
                            <div className="pt-4 border-t border-brand-200/60">
                                <h3 className="text-sm font-semibold text-brand-900 mb-3">Select Variant:</h3>
                                <div className="flex flex-wrap gap-3">
                                    {product.variants.map((variant) => (
                                        <label key={variant.id} className={`cursor-pointer border rounded-lg px-4 py-2 transition-all ${data.variant_id === variant.id ? 'border-brand-900 bg-brand-50 text-brand-900' : 'border-stone-200 text-stone-600 hover:border-brand-300'}`}>
                                            <input 
                                                type="radio" 
                                                name="variant" 
                                                className="sr-only" 
                                                value={variant.id}
                                                checked={data.variant_id === variant.id}
                                                onChange={() => setData('variant_id', variant.id)}
                                            />
                                            <div className="flex flex-col text-sm">
                                                <span className="font-medium">{variant.value}</span>
                                                {Number(variant.price_adjustment) > 0 && (
                                                    <span className="text-xs text-brand-600">+₹{Number(variant.price_adjustment)}</span>
                                                )}
                                                {Number(variant.price_adjustment) < 0 && (
                                                    <span className="text-xs text-emerald-600">-₹{Math.abs(Number(variant.price_adjustment))}</span>
                                                )}
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Customizations Section */}
                        {product.customizations && product.customizations.length > 0 && (
                            <div className="pt-4 border-t border-brand-200/60 space-y-4">
                                {product.customizations.map((customization) => (
                                    <div key={customization.id}>
                                        <h3 className="text-sm font-semibold text-brand-900 mb-2">{customization.name}:</h3>
                                        <div className="flex flex-col gap-2">
                                            {customization.options.map((opt) => (
                                                <label key={opt.id} className="flex items-center gap-3 cursor-pointer group">
                                                    <div className="relative flex items-center">
                                                        <input 
                                                            type="checkbox" 
                                                            className="w-5 h-5 border-2 border-stone-300 rounded text-brand-600 focus:ring-brand-500 cursor-pointer"
                                                            checked={data.customizations.includes(opt.id)}
                                                            onChange={(e) => handleCustomizationChange(opt.id, e.target.checked)}
                                                        />
                                                    </div>
                                                    <span className="text-sm text-stone-700 group-hover:text-brand-900">
                                                        {opt.name} 
                                                        {Number(opt.price_adjustment) > 0 && (
                                                            <span className="text-brand-600 ml-1">(+₹{Number(opt.price_adjustment)})</span>
                                                        )}
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {product.stock_quantity > 0 && (
                            <form onSubmit={addToCart} className="space-y-3.5 pt-4">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center border border-brand-200 rounded-full bg-stone-50/80 p-1 shadow-sm">
                                        <button type="button" onClick={() => setData('quantity', Math.max(1, data.quantity - 1))}
                                                className="w-9 h-9 flex items-center justify-center rounded-full text-stone-500 hover:bg-white hover:text-brand-900 hover:shadow-sm transition-all focus:outline-none">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" /></svg>
                                        </button>
                                        <input type="text" value={data.quantity} readOnly 
                                                className="w-12 text-center text-sm font-semibold bg-transparent focus:outline-none text-brand-900 border-none ring-0 p-0 pointer-events-none select-none" />
                                        <button type="button" onClick={() => setData('quantity', Math.min(product.stock_quantity, data.quantity + 1))}
                                                className="w-9 h-9 flex items-center justify-center rounded-full text-stone-500 hover:bg-white hover:text-brand-900 hover:shadow-sm transition-all focus:outline-none">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                                        </button>
                                    </div>
                                    <button type="submit" disabled={processing}
                                            className="flex-1 py-3.5 px-6 bg-brand-800 hover:bg-brand-900 text-white text-xs font-semibold rounded-full transition-colors shadow-soft focus:outline-none">
                                        Add to Bag
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>

                {similarProducts && similarProducts.length > 0 && (
                    <div className="mt-20 pt-14 border-t border-brand-200/80">
                        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8">
                            <div>
                                <span className="text-brand-500 text-xs font-semibold tracking-widest uppercase block mb-1">
                                    ✦ Related Pieces
                                </span>
                                <h2 className="font-serif text-2xl sm:text-3xl text-brand-900 font-normal">
                                    You Might Also Like
                                </h2>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                            {similarProducts.map(rel => (
                                <ProductCard key={rel.id} product={rel} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

ProductDetail.layout = page => <CustomerLayout>{page}</CustomerLayout>;
