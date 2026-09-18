import React from 'react';
import { Link, usePage } from '@inertiajs/react';

export default function CustomerPortalLayout({ children }) {
    const { auth } = usePage().props;
    const user = auth.user;
    const currentRoute = route().current();

    if (!user) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
                <main className="flex-1">
                    {children}
                </main>
            </div>
        );
    }

    const navigation = [
        { name: 'Dashboard', href: route('dashboard'), active: currentRoute === 'dashboard' },
        { name: 'My Orders', href: route('account.orders'), active: currentRoute === 'account.orders' || currentRoute === 'account.order.details' },
        { name: 'Addresses', href: route('addresses.index'), active: currentRoute && currentRoute.startsWith('addresses.') },
        { name: 'Wishlist', href: route('wishlist.index'), active: currentRoute === 'wishlist.index' },
        { name: 'Recently Viewed', href: route('recently_viewed.index'), active: currentRoute === 'recently_viewed.index' },
        { name: 'Account Settings', href: route('profile.edit'), active: currentRoute === 'profile.edit' },
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
            <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
                
                {/* Sidebar Navigation */}
                <aside className="w-full md:w-64 shrink-0">
                    <div className="bg-white rounded-2xl shadow-sm border border-brand-100 p-6 md:sticky md:top-24">
                        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-stone-100">
                            <div className="w-12 h-12 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-serif text-xl font-bold uppercase">
                                {user.name.charAt(0)}
                            </div>
                            <div>
                                <h3 className="font-semibold text-stone-900">{user.name}</h3>
                                <p className="text-xs text-stone-500 truncate max-w-[150px]">{user.email}</p>
                            </div>
                        </div>

                        <nav className="space-y-1">
                            {navigation.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                                        item.active 
                                        ? 'bg-brand-50 text-brand-700 font-medium' 
                                        : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                                    }`}
                                >
                                    {item.name}
                                </Link>
                            ))}
                            
                            <Link
                                href={route('logout')}
                                method="post"
                                as="button"
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-colors mt-4 text-left"
                            >
                                Log out
                            </Link>
                        </nav>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1">
                    {children}
                </main>
                
            </div>
        </div>
    );
}
