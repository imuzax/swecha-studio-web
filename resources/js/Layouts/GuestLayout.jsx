import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';

export default function GuestLayout({ children, title, subtitle }) {
    return (
        <div className="min-h-screen flex">
            {/* Left Side - Brand Display (Hidden on mobile) */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-brand-900 overflow-hidden items-center justify-center">
                <div className="absolute inset-0">
                    {/* Abstract Shapes or Gradient for a modern look */}
                    <div className="absolute inset-0 bg-gradient-to-br from-brand-800 to-brand-950 opacity-90"></div>
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent"></div>
                </div>
                
                <div className="relative z-10 flex flex-col items-center justify-center text-white px-12 text-center">
                    <Link href="/">
                        <ApplicationLogo className="h-24 w-auto drop-shadow-xl brightness-0 invert" />
                    </Link>
                    <h2 className="mt-8 text-3xl font-light tracking-wide text-brand-50">
                        Crafting Elegance in Concrete
                    </h2>
                    <p className="mt-4 text-brand-200 font-medium max-w-md">
                        Handcrafted, sustainable concrete decor to elevate your space. Join our community for exclusive access and offers.
                    </p>
                </div>
            </div>

            {/* Right Side - Form Area */}
            <div className="w-full lg:w-1/2 flex flex-col bg-gray-50/50">
                <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-24 pt-12 pb-12">
                    {/* Mobile Logo */}
                    <div className="flex justify-center mb-8 lg:hidden">
                        <Link href="/">
                            <ApplicationLogo className="h-14 w-auto" />
                        </Link>
                    </div>

                    <div className="mx-auto w-full max-w-sm lg:max-w-md">
                        {title && (
                            <h2 className="mt-6 text-3xl font-semibold tracking-tight text-gray-900 text-center lg:text-left">
                                {title}
                            </h2>
                        )}
                        {subtitle && (
                            <p className="mt-2 text-sm text-gray-600 text-center lg:text-left">
                                {subtitle}
                            </p>
                        )}
                        
                        <div className="mt-8 bg-white py-8 px-4 shadow-xl shadow-brand-900/5 sm:rounded-xl sm:px-10 border border-gray-100">
                            {children}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
