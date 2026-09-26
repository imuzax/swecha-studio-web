import React from 'react';
import CustomerLayout from '@/Layouts/Frontend/CustomerLayout';
import { Head, Link } from '@inertiajs/react';
import ProductCard from '@/Components/Frontend/ProductCard';

export default function Wishlist({ wishlistedProducts }) {
    return (
        <>
            <Head title="My Wishlist - Swecha Studio" />
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
                <div className="mb-10 border-b border-brand-200/80 pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div>
                        <span className="text-brand-500 text-xs font-semibold tracking-widest uppercase block mb-1">
                            ✦ Your Curated Collection
                        </span>
                        <h1 className="font-serif text-3xl sm:text-4xl text-brand-900 font-normal">
                            My Wishlist
                        </h1>
                    </div>
                </div>

                {wishlistedProducts && wishlistedProducts.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
                        {wishlistedProducts.map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="py-20 text-center bg-brand-50/50 rounded-3xl border border-brand-200/60 max-w-3xl mx-auto">
                        <div className="w-16 h-16 mx-auto bg-white rounded-full flex items-center justify-center shadow-soft mb-6">
                            <span className="text-brand-300 text-2xl">✦</span>
                        </div>
                        <h3 className="font-serif text-2xl text-brand-900 mb-2">Your wishlist is empty</h3>
                        <p className="text-stone-500 mb-8 max-w-md mx-auto text-sm">
                            Save your favorite concrete pieces here while you decide. They'll be waiting for you.
                        </p>
                        <Link 
                            href={route('shop')}
                            className="inline-block bg-brand-800 hover:bg-brand-900 text-white font-semibold px-8 py-3.5 rounded-full text-sm transition-colors shadow-soft"
                        >
                            Explore Collection
                        </Link>
                    </div>
                )}
            </div>
        </>
    );
}

Wishlist.layout = page => <CustomerLayout>{page}</CustomerLayout>;
