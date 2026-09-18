import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { usePage, Link } from '@inertiajs/react';

export default function FastCart() {
    const { cart, cart_subtotal, cart_count } = usePage().props;
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const handleOpen = () => setOpen(true);
        window.addEventListener('open-fast-cart', handleOpen);
        return () => window.removeEventListener('open-fast-cart', handleOpen);
    }, []);

    return (
        <Transition.Root show={open} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={setOpen}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-in-out duration-500"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in-out duration-500"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm transition-opacity" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-hidden">
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
                            <Transition.Child
                                as={Fragment}
                                enter="transform transition ease-in-out duration-500 sm:duration-700"
                                enterFrom="translate-x-full"
                                enterTo="translate-x-0"
                                leave="transform transition ease-in-out duration-500 sm:duration-700"
                                leaveFrom="translate-x-0"
                                leaveTo="translate-x-full"
                            >
                                <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                                    <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-xl">
                                        <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
                                            <div className="flex items-start justify-between">
                                                <Dialog.Title className="text-xl font-serif text-brand-900">Your Bag</Dialog.Title>
                                                <div className="ml-3 flex h-7 items-center">
                                                    <button
                                                        type="button"
                                                        className="relative -m-2 p-2 text-stone-400 hover:text-stone-500 transition-colors"
                                                        onClick={() => setOpen(false)}
                                                    >
                                                        <span className="absolute -inset-0.5" />
                                                        <span className="sr-only">Close panel</span>
                                                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="mt-8">
                                                <div className="flow-root">
                                                    <ul role="list" className="-my-6 divide-y divide-stone-200">
                                                        {cart && cart.length > 0 ? cart.map((product, idx) => (
                                                            <li key={idx} className="flex py-6">
                                                                <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-stone-200 bg-stone-50">
                                                                    {product.image ? (
                                                                        <img
                                                                            src={product.image.startsWith('http') ? product.image : `/storage/${product.image}`}
                                                                            alt={product.name}
                                                                            className="h-full w-full object-cover object-center"
                                                                        />
                                                                    ) : (
                                                                        <div className="h-full w-full flex items-center justify-center text-stone-300">
                                                                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                                            </svg>
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                <div className="ml-4 flex flex-1 flex-col">
                                                                    <div>
                                                                        <div className="flex justify-between text-base font-medium text-brand-900">
                                                                            <h3>
                                                                                <Link href={route('product.detail', product.slug)} className="hover:underline">{product.name}</Link>
                                                                            </h3>
                                                                            <p className="ml-4 font-sans">₹{Number(product.price * product.quantity).toLocaleString('en-IN')}</p>
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex flex-1 items-end justify-between text-sm">
                                                                        <p className="text-stone-500">Qty {product.quantity}</p>
                                                                    </div>
                                                                </div>
                                                            </li>
                                                        )) : (
                                                            <li className="py-10 text-center text-stone-500">
                                                                Your bag is empty.
                                                            </li>
                                                        )}
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="border-t border-stone-200 px-4 py-6 sm:px-6 bg-stone-50/50">
                                            <div className="flex justify-between text-base font-bold text-brand-900">
                                                <p>Subtotal</p>
                                                <p className="font-sans">₹{Number(cart_subtotal || 0).toLocaleString('en-IN')}</p>
                                            </div>
                                            <p className="mt-0.5 text-sm text-stone-500">Shipping and taxes calculated at checkout.</p>
                                            <div className="mt-6 flex flex-col gap-3">
                                                <Link
                                                    href={route('cart.index')}
                                                    className="flex items-center justify-center rounded-full border border-transparent bg-brand-800 px-6 py-3.5 text-base font-medium text-white shadow-sm hover:bg-brand-900 transition-colors"
                                                    onClick={() => setOpen(false)}
                                                >
                                                    Checkout
                                                </Link>
                                                <button
                                                    type="button"
                                                    className="flex items-center justify-center rounded-full border border-brand-300 bg-white px-6 py-3.5 text-base font-medium text-brand-900 shadow-sm hover:bg-stone-50 transition-colors"
                                                    onClick={() => setOpen(false)}
                                                >
                                                    Continue Shopping
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </div>
            </Dialog>
        </Transition.Root>
    );
}
