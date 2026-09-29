import CustomerLayout from '@/Layouts/Frontend/CustomerLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';

export default function Cart({ cart, total }) {
    const updateQuantity = (id, newQuantity) => {
        if (newQuantity < 1) return;
        router.put(route('cart.update', id), { quantity: newQuantity }, { preserveScroll: true });
    };

    const removeItem = (id) => {
        router.delete(route('cart.remove', id), { preserveScroll: true });
    };

    return (
        <>
            <Head title="Your Cart - Swecha Studio" />
            
            <div className="max-w-5xl mx-auto px-4 md:px-8 py-8 md:py-12">
                <h1 className="text-3xl md:text-4xl font-bold uppercase tracking-widest mb-8">Your Cart</h1>
                
                {cart.length === 0 ? (
                    <div className="py-20 text-center bg-brand-50/50 rounded-3xl border border-brand-200/60 max-w-3xl mx-auto my-12">
                        <div className="w-16 h-16 mx-auto bg-white rounded-full flex items-center justify-center shadow-soft mb-6">
                            <svg className="w-8 h-8 text-brand-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                        </div>
                        <h3 className="font-serif text-2xl text-brand-900 mb-2">Your cart is empty</h3>
                        <p className="text-stone-500 mb-8 max-w-md mx-auto text-sm">
                            Looks like you haven't added any concrete masterpieces to your cart yet.
                        </p>
                        <Link 
                            href={route('shop')} 
                            className="inline-block bg-brand-800 hover:bg-brand-900 text-white font-semibold px-8 py-3.5 rounded-full text-sm transition-colors shadow-soft"
                        >
                            Explore Collection
                        </Link>
                    </div>
                ) : (
                    <div className="flex flex-col md:flex-row gap-8">
                        {/* Cart Items */}
                        <div className="w-full md:w-2/3">
                            <div className="border-t">
                                {cart.map(item => {
                                    const itemKey = item.key || item.id;
                                    return (
                                        <div key={itemKey} className="flex py-6 border-b">
                                            <div className="h-24 w-20 md:h-32 md:w-24 flex-shrink-0 overflow-hidden bg-gray-100 mr-4 md:mr-6">
                                                {item.image ? (
                                                    <img src={item.image.startsWith('http') ? item.image : `/storage/${item.image}`} alt={item.name} className="h-full w-full object-cover object-center" loading="lazy" decoding="async" />
                                                ) : (
                                                    <div className="h-full w-full flex items-center justify-center text-xs text-gray-400">No Img</div>
                                                )}
                                            </div>

                                            <div className="flex flex-1 flex-col">
                                                <div>
                                                    <div className="flex justify-between text-base font-medium text-gray-900">
                                                        <h3 className="uppercase tracking-wide"><Link href={route('product.detail', item.slug)}>{item.name}</Link></h3>
                                                        <p className="ml-4 font-sans font-semibold text-brand-900">₹{Number(item.price).toLocaleString('en-IN')}</p>
                                                    </div>
                                                </div>
                                                <div className="flex flex-1 items-end justify-between text-sm">
                                                    <div className="flex items-center border">
                                                        <button onClick={() => updateQuantity(itemKey, item.quantity - 1)} className="px-3 py-1 hover:bg-gray-100">-</button>
                                                        <span className="px-3 py-1 border-l border-r">{item.quantity}</span>
                                                        <button onClick={() => updateQuantity(itemKey, item.quantity + 1)} className="px-3 py-1 hover:bg-gray-100">+</button>
                                                    </div>
                                                    <button onClick={() => removeItem(itemKey)} type="button" className="font-medium text-red-600 hover:text-red-500 uppercase tracking-widest text-xs">Remove</button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div className="w-full md:w-1/3 bg-gray-50 p-6 md:p-8 h-fit">
                            <h2 className="text-xl font-bold uppercase tracking-wider mb-6 border-b pb-4">Summary</h2>
                            
                            <div className="flex justify-between mb-4 text-gray-600">
                                <p>Subtotal</p>
                                <p className="font-sans font-medium text-brand-900">₹{Number(total).toLocaleString('en-IN')}</p>
                            </div>
                            <div className="flex justify-between mb-4 text-gray-600">
                                <p>Shipping</p>
                                <p>Calculated at checkout</p>
                            </div>
                            
                            <div className="flex justify-between text-lg font-bold border-t pt-4 mb-8">
                                <p>Estimated Total</p>
                                <p className="font-sans font-bold text-brand-900">₹{Number(total).toLocaleString('en-IN')}</p>
                            </div>
                            
                            <Link href={route('checkout.index')} className="w-full flex items-center justify-center rounded-md border border-transparent bg-black px-6 py-4 text-base font-medium text-white shadow-sm hover:bg-gray-800 uppercase tracking-widest transition">
                                Checkout
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

Cart.layout = page => <CustomerLayout>{page}</CustomerLayout>;
