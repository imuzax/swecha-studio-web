import React from 'react';
import { Link, usePage, router } from '@inertiajs/react';

export default function ProductCard({ product }) {
    // Determine image URL
    let imageUrl = null;
    if (product.images && product.images.length > 0) {
        let path = product.images[0].path;
        imageUrl = path.startsWith('http') ? path : `/storage/${path}`;
    }

    const { auth } = usePage().props;

    return (
        <div className="group relative bg-white rounded-2xl p-3 shadow-sm hover:shadow-card transition-all duration-300 border border-brand-100 flex flex-col h-full hover-lift">
            <Link href={route('product.detail', product.slug)} className="block relative aspect-square rounded-xl overflow-hidden mb-4 bg-brand-50 watermark-container">
                {imageUrl ? (
                    <img 
                        src={imageUrl} 
                        alt={product.name} 
                        className="w-full h-full object-cover object-center image-smooth group-hover:scale-105 transition-transform duration-700 ease-out"
                        loading="lazy"
                        decoding="async"
                    />
                ) : (
                    <div className="w-full h-full bg-stone-100 flex items-center justify-center">
                        <svg className="w-12 h-12 text-stone-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                )}
                
                {product.stock_quantity <= 0 && (
                    <div className="absolute top-2 left-2 bg-stone-900/80 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-widest z-20">
                        Sold Out
                    </div>
                )}
                
                {product.is_featured && product.stock_quantity > 0 && (
                    <div className="absolute top-2 left-2 bg-brand-500/90 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-widest z-20 shadow-sm">
                        Best Seller
                    </div>
                )}
            </Link>

            <button 
                type="button" 
                onClick={(e) => {
                    e.preventDefault();
                    if (!auth.user) {
                        window.location.href = route('login');
                    } else {
                        router.post(route('wishlist.toggle', product.id), {}, { preserveScroll: true });
                    }
                }} 
                className={`absolute top-5 right-5 z-30 p-2 rounded-full backdrop-blur-sm shadow-sm transition-all focus:outline-none ${product.is_wishlisted ? 'bg-red-50 text-red-500 hover:bg-red-100' : 'bg-white/80 text-stone-400 hover:text-red-500 hover:bg-white'}`}
            >
                <svg className="w-4 h-4" fill={product.is_wishlisted ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={product.is_wishlisted ? "1.5" : "2"} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
            </button>

            <div className="flex flex-col flex-grow px-1">
                {product.category && (
                    <p className="text-[10px] sm:text-[11px] text-brand-500 font-medium tracking-wider uppercase mb-1 line-clamp-1">
                        {product.category.name}
                    </p>
                )}

                <div className="mb-1 flex items-start justify-between gap-2">
                    <Link href={route('product.detail', product.slug)} className="flex-1">
                        <h3 className="font-serif text-sm sm:text-base text-brand-900 font-medium leading-snug group-hover:text-brand-600 transition-colors line-clamp-1">
                            {product.name}
                        </h3>
                    </Link>
                </div>

                <div className="mt-auto pt-3 flex items-center justify-between border-t border-brand-50">
                    <div className="flex items-baseline gap-1.5">
                        <span className="font-sans font-bold text-brand-900 text-sm sm:text-base tracking-tight">
                            ₹{Number(product.sale_price || product.price).toLocaleString('en-IN')}
                        </span>
                        {product.sale_price && Number(product.sale_price) > 0 && Number(product.sale_price) < Number(product.price) && (
                            <span className="font-sans text-xs text-stone-400 line-through">
                                ₹{Number(product.price).toLocaleString('en-IN')}
                            </span>
                        )}
                    </div>
                    {product.stock_quantity > 0 && (
                        <Link 
                            href={route('product.detail', product.slug)}
                            className="w-7 h-7 rounded-full bg-brand-100/90 hover:bg-brand-500 text-brand-800 hover:text-white flex items-center justify-center transition-colors duration-200 btn-press shrink-0"
                            title="View piece"
                        >
                            <svg className="w-3.5 h-3.5 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
                            </svg>
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}
