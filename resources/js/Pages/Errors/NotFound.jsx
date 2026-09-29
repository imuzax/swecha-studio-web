import CustomerLayout from '@/Layouts/Frontend/CustomerLayout';
import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';

export default function NotFound() {
    return (
        <>
            <Head title="404 - Page Not Found" />
            <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 bg-brand-50 relative overflow-hidden">
                {/* Decorative background elements */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-200/30 rounded-full blur-3xl -z-10"></div>
                
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="relative z-10"
                >
                    <h1 className="text-[120px] md:text-[180px] font-bold text-brand-900 leading-none font-serif tracking-tighter drop-shadow-sm">
                        404
                    </h1>
                    <div className="h-1 w-24 bg-brand-600 mx-auto my-6"></div>
                    <h2 className="text-2xl md:text-4xl font-serif text-brand-800 mb-4">
                        Oops! Beauty got lost.
                    </h2>
                    <p className="text-brand-600 mb-10 max-w-lg mx-auto text-lg">
                        The concrete masterpiece you are looking for seems to have vanished or moved to a new home. 
                    </p>
                    
                    <Link 
                        href={route('home')} 
                        className="inline-flex items-center justify-center px-8 py-4 bg-brand-900 text-white font-medium uppercase tracking-widest hover:bg-brand-800 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl"
                    >
                        Back to Studio
                        <svg className="ml-3 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </Link>
                </motion.div>
            </div>
        </>
    );
}

NotFound.layout = page => <CustomerLayout>{page}</CustomerLayout>;
