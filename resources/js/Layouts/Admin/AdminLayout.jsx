import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { useEffect } from 'react';

export default function AdminLayout({ children }) {
    // Global file size validation
    useEffect(() => {
        const handleFileChange = (e) => {
            if (e.target && e.target.type === 'file' && e.target.files && e.target.files.length > 0) {
                const maxSize = 10 * 1024 * 1024; // 10MB
                for (let i = 0; i < e.target.files.length; i++) {
                    if (e.target.files[i].size > maxSize) {
                        alert(`❌ Upload Failed!\n\nThe file "${e.target.files[i].name}" is larger than 10MB.\nPlease upload a file smaller than 10MB to continue.`);
                        e.target.value = ''; // Clear the input
                        return;
                    }
                }
            }
        };
        
        document.addEventListener('change', handleFileChange);
        return () => document.removeEventListener('change', handleFileChange);
    }, []);
    const navItems = [
        {
            name: 'Dashboard',
            href: route('admin.dashboard'),
            active: route().current('admin.dashboard'),
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
                </svg>
            )
        },
        {
            name: 'Categories',
            href: route('admin.categories.index'),
            active: route().current('admin.categories.*'),
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                </svg>
            )
        },
        {
            name: 'Workshops',
            href: route('admin.workshops.index'),
            active: route().current('admin.workshops.*'),
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
            )
        },
        {
            name: 'Products',
            href: route('admin.products.index'),
            active: route().current('admin.products.*'),
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                </svg>
            )
        },
        {
            name: 'Orders',
            href: route('admin.orders.index'),
            active: route().current('admin.orders.*'),
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                </svg>
            )
        },
        {
            name: 'Customers',
            href: route('admin.customers.index'),
            active: route().current('admin.customers.*'),
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                </svg>
            )
        },
        {
            name: 'Site Settings',
            href: route('admin.settings.index'),
            active: route().current('admin.settings.*'),
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
            )
        }
    ];

    const systemItems = [
        {
            name: 'Download Sales Report',
            href: route('admin.reports.orders'),
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
            )
        },
        {
            name: 'Download Backup',
            href: route('admin.backups.download'),
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                </svg>
            )
        }
    ];

    return (
        <div className="min-h-screen bg-[#FDFBF7] text-gray-800 font-sans selection:bg-[#C1633D]/20 flex flex-col md:flex-row">
            
            {/* Sidebar (Clean & Elegant) */}
            <aside className="w-full md:w-64 bg-white border-r border-[#E8E4DC] z-10 flex flex-col h-screen sticky top-0 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
                <div className="p-8 border-b border-[#E8E4DC] flex justify-center items-center">
                    <Link href={route('admin.dashboard')} className="block">
                        <img src="/images/main_logo.png" alt="Swecha Studio" className="h-10 w-auto object-contain drop-shadow-sm transition-transform hover:scale-105" />
                    </Link>
                </div>
                
                <nav className="flex-1 mt-6 px-4 space-y-1 overflow-y-auto">
                    <p className="px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Management</p>
                    
                    {navItems.map((item) => (
                        <Link 
                            key={item.name} 
                            href={item.href} 
                            className={`group flex items-center gap-3 py-3 px-4 rounded-xl transition-all duration-300 relative ${
                                item.active 
                                    ? 'bg-[#FAF6ED] text-[#C1633D] font-semibold' 
                                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
                            }`}
                        >
                            {item.active && (
                                <motion.div 
                                    layoutId="active-nav"
                                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-[#C1633D] rounded-r-full"
                                />
                            )}
                            <span className={`${item.active ? 'text-[#C1633D]' : 'text-gray-400 group-hover:text-gray-600'} transition-colors duration-300`}>
                                {item.icon}
                            </span>
                            <span className="text-sm tracking-wide">{item.name}</span>
                        </Link>
                    ))}
                </nav>

                <div className="mt-8 px-6">
                    <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">System Tools</h3>
                    <div className="space-y-1">
                        {systemItems.map((item) => (
                            <a
                                key={item.name}
                                href={item.href}
                                className="flex items-center gap-3 py-2 px-3 rounded-xl transition-all duration-300 group font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                            >
                                <span className="text-gray-400 group-hover:text-gray-600 transition-colors duration-300">
                                    {item.icon}
                                </span>
                                <span className="text-sm tracking-wide">{item.name}</span>
                            </a>
                        ))}
                    </div>
                </div>

                <div className="p-4 border-t border-[#E8E4DC] mt-auto">
                    <Link 
                        href={route('logout')} 
                        method="post" 
                        as="button" 
                        className="w-full flex items-center gap-3 py-3 px-4 rounded-xl text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all duration-300 group"
                    >
                        <svg className="w-5 h-5 text-gray-400 group-hover:text-red-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                        </svg>
                        <span className="font-medium text-sm">Sign Out</span>
                    </Link>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 h-screen overflow-y-auto relative z-0 flex flex-col">
                
                {/* Top Header */}
                <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-[#E8E4DC] px-8 py-4 flex justify-between items-center shadow-sm">
                    <div className="flex items-center gap-4">
                        <h1 className="text-gray-800 font-semibold text-xl tracking-tight">Admin Portal</h1>
                    </div>
                    <div className="flex items-center gap-5">
                        <div className="flex items-center gap-3">
                            <div className="text-right hidden md:block">
                                <p className="text-sm font-semibold text-gray-800">Swecha Team</p>
                                <p className="text-xs text-gray-500">Administrator</p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-[#FAF6ED] border border-[#E8E4DC] flex items-center justify-center text-[#C1633D] font-bold shadow-inner">
                                S
                            </div>
                        </div>
                    </div>
                </header>

                <div className="p-8 max-w-7xl mx-auto w-full">
                    {children}
                </div>
            </main>
        </div>
    );
}
