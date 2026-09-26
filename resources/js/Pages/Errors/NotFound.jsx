import CustomerLayout from '@/Layouts/Frontend/CustomerLayout';
import { Head, Link } from '@inertiajs/react';

export default function NotFound() {
    return (
        <>
            <Head title="404 - Page Not Found" />
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
                <h1 className="text-8xl md:text-9xl font-bold text-gray-200 mb-4 tracking-tighter">404</h1>
                <h2 className="text-2xl md:text-3xl font-bold uppercase tracking-widest mb-6">Page Not Found</h2>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
                </p>
                <Link 
                    href={route('home')} 
                    className="bg-black hover:bg-gray-800 text-white font-bold py-4 px-8 uppercase tracking-widest transition-colors duration-200"
                >
                    Return Home
                </Link>
            </div>
        </>
    );
}

NotFound.layout = page => <CustomerLayout>{page}</CustomerLayout>;
