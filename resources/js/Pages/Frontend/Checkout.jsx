import CustomerLayout from '@/Layouts/Frontend/CustomerLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { trackEvent } from '@/utils/analytics';

export default function Checkout({ cart, total, addresses = [] }) {
    const defaultAddress = addresses.find(a => a.is_default) || addresses[0];
    const [useNewAddress, setUseNewAddress] = useState(addresses.length === 0);

    const { data, setData, post, processing, errors } = useForm({
        address_id: addresses.length > 0 ? (defaultAddress?.id || addresses[0].id) : '',
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        address_line_1: '',
        address_line_2: '',
        city: '',
        state: '',
        postal_code: '',
        country: 'India',
        payment_method: 'razorpay',
        razorpay_payment_id: '',
        razorpay_order_id: '',
        razorpay_signature: ''
    });

    useEffect(() => {
        if (useNewAddress) {
            setData('address_id', '');
        } else if (addresses.length > 0) {
            setData('address_id', defaultAddress?.id || addresses[0].id);
        }
    }, [useNewAddress]);

    useEffect(() => {
        trackEvent('checkout_started', {
            total: total,
            items: cart.length
        });
        
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);
        return () => {
            document.body.removeChild(script);
        };
    }, []);

    const submit = async (e) => {
        e.preventDefault();
        
        if (data.payment_method === 'razorpay') {
            try {
                // 1. Create order on server
                const response = await axios.post(route('checkout.razorpay.create'));
                const orderData = response.data;
                
                // 2. Open Razorpay Checkout
                const options = {
                    key: orderData.key,
                    amount: orderData.amount,
                    currency: orderData.currency,
                    name: 'Swecha Studio',
                    description: 'Order Payment',
                    image: '/images/main_logo.png',
                    order_id: orderData.id,
                    handler: function (response) {
                        // 3. On success, submit our form
                        data.razorpay_payment_id = response.razorpay_payment_id;
                        data.razorpay_order_id = response.razorpay_order_id;
                        data.razorpay_signature = response.razorpay_signature;
                        post(route('checkout.process'));
                    },
                    prefill: {
                        name: data.first_name ? `${data.first_name} ${data.last_name}` : '',
                        email: data.email,
                        contact: data.phone
                    },
                    theme: {
                        color: '#000000'
                    }
                };
                
                const rzp1 = new window.Razorpay(options);
                rzp1.on('payment.failed', function (response) {
                    trackEvent('payment_failure', {
                        error_code: response.error.code,
                        error_reason: response.error.reason,
                        error_step: response.error.step,
                        error_source: response.error.source
                    });
                    alert('Payment Failed: ' + response.error.description);
                });
                
                trackEvent('payment_initiated', {
                    order_id: orderData.id,
                    amount: orderData.amount,
                    currency: orderData.currency
                });
                
                rzp1.open();
                
            } catch (error) {
                console.error(error);
                alert('Failed to initialize payment. Please try again or use WhatsApp checkout.');
            }
        } else {
            post(route('checkout.process'));
        }
    };

    return (
        <>
            <Head title="Checkout - Swecha Studio" />
            
            <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 md:py-12 flex flex-col md:flex-row gap-12">
                
                {/* Checkout Form */}
                <div className="w-full md:w-2/3">
                    <h1 className="text-3xl font-bold uppercase tracking-widest mb-8">Checkout</h1>
                    
                    <form onSubmit={submit}>
                        <h2 className="text-xl font-bold uppercase tracking-wider mb-4 border-b pb-2">Shipping Address</h2>
                        
                        {addresses.length > 0 && (
                            <div className="mb-8 space-y-4">
                                {addresses.map(address => (
                                    <label key={address.id} className={`flex items-start p-4 border cursor-pointer ${!useNewAddress && data.address_id === address.id ? 'border-black ring-1 ring-black bg-gray-50' : 'border-gray-200'}`}>
                                        <input 
                                            type="radio" 
                                            name="address" 
                                            checked={!useNewAddress && data.address_id === address.id}
                                            onChange={() => {
                                                setUseNewAddress(false);
                                                setData('address_id', address.id);
                                            }}
                                            className="mt-1 text-black focus:ring-black mr-4 h-4 w-4" 
                                        />
                                        <div>
                                            <p className="font-bold">{address.name || `${address.first_name || ''} ${address.last_name || ''}`.trim()}</p>
                                            <p className="text-sm text-gray-600">{address.address_line_1}{address.address_line_2 ? `, ${address.address_line_2}` : ''}</p>
                                            <p className="text-sm text-gray-600">{address.city}, {address.state} {address.pincode || address.postal_code || ''}</p>
                                            <p className="text-sm text-gray-600">{address.country || 'India'}</p>
                                            <p className="text-sm text-gray-600 mt-1">Phone: {address.phone}</p>
                                        </div>
                                    </label>
                                ))}

                                <label className={`flex items-center p-4 border cursor-pointer ${useNewAddress ? 'border-black ring-1 ring-black bg-gray-50' : 'border-gray-200'}`}>
                                    <input 
                                        type="radio" 
                                        name="address" 
                                        checked={useNewAddress}
                                        onChange={() => setUseNewAddress(true)}
                                        className="text-black focus:ring-black mr-4 h-4 w-4" 
                                    />
                                    <span className="font-bold">Use a new address</span>
                                </label>
                            </div>
                        )}

                        {useNewAddress && (
                            <div className="mb-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                                        <input type="text" value={data.first_name} onChange={e => setData('first_name', e.target.value)} className="w-full border-gray-300 rounded focus:ring-black focus:border-black" />
                                        {errors.first_name && <p className="text-red-500 text-xs mt-1">{errors.first_name}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                                        <input type="text" value={data.last_name} onChange={e => setData('last_name', e.target.value)} className="w-full border-gray-300 rounded focus:ring-black focus:border-black" />
                                        {errors.last_name && <p className="text-red-500 text-xs mt-1">{errors.last_name}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                                        <input type="email" value={data.email} onChange={e => setData('email', e.target.value)} className="w-full border-gray-300 rounded focus:ring-black focus:border-black" />
                                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone (WhatsApp) *</label>
                                        <input type="text" value={data.phone} onChange={e => setData('phone', e.target.value)} className="w-full border-gray-300 rounded focus:ring-black focus:border-black" />
                                        {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 1 *</label>
                                        <input type="text" value={data.address_line_1} onChange={e => setData('address_line_1', e.target.value)} className="w-full border-gray-300 rounded focus:ring-black focus:border-black" />
                                        {errors.address_line_1 && <p className="text-red-500 text-xs mt-1">{errors.address_line_1}</p>}
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 2 (Apartment, suite, etc.)</label>
                                        <input type="text" value={data.address_line_2} onChange={e => setData('address_line_2', e.target.value)} className="w-full border-gray-300 rounded focus:ring-black focus:border-black" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                                        <input type="text" value={data.city} onChange={e => setData('city', e.target.value)} className="w-full border-gray-300 rounded focus:ring-black focus:border-black" />
                                        {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">State / Province *</label>
                                        <input type="text" value={data.state} onChange={e => setData('state', e.target.value)} className="w-full border-gray-300 rounded focus:ring-black focus:border-black" />
                                        {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code *</label>
                                        <input type="text" value={data.postal_code} onChange={e => setData('postal_code', e.target.value)} className="w-full border-gray-300 rounded focus:ring-black focus:border-black" />
                                        {errors.postal_code && <p className="text-red-500 text-xs mt-1">{errors.postal_code}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Country *</label>
                                        <input type="text" value={data.country} onChange={e => setData('country', e.target.value)} className="w-full border-gray-300 rounded focus:ring-black focus:border-black bg-gray-100" readOnly />
                                    </div>
                                </div>
                            </div>
                        )}

                        <h2 className="text-xl font-bold uppercase tracking-wider mb-4 border-b pb-2">Payment</h2>
                        <div className="mb-8 space-y-4">
                            <label className={`flex items-center p-4 border rounded cursor-pointer transition ${data.payment_method === 'razorpay' ? 'bg-gray-50 border-black ring-1 ring-black' : 'border-gray-200'}`}>
                                <input 
                                    type="radio" 
                                    name="payment_method"
                                    checked={data.payment_method === 'razorpay'} 
                                    onChange={() => setData('payment_method', 'razorpay')}
                                    className="text-black focus:ring-black mr-4 h-5 w-5" 
                                />
                                <div>
                                    <p className="font-bold">Online Payment (Razorpay)</p>
                                    <p className="text-sm text-gray-500">Pay securely via UPI, Credit/Debit Card, or Netbanking.</p>
                                </div>
                            </label>
                            
                            <label className={`flex items-center p-4 border rounded cursor-pointer transition ${data.payment_method === 'whatsapp' ? 'bg-gray-50 border-black ring-1 ring-black' : 'border-gray-200'}`}>
                                <input 
                                    type="radio" 
                                    name="payment_method"
                                    checked={data.payment_method === 'whatsapp'} 
                                    onChange={() => setData('payment_method', 'whatsapp')}
                                    className="text-black focus:ring-black mr-4 h-5 w-5" 
                                />
                                <div>
                                    <p className="font-bold">Order via WhatsApp</p>
                                    <p className="text-sm text-gray-500">Confirm your order on WhatsApp and pay manually.</p>
                                </div>
                            </label>
                        </div>

                        <button 
                            type="submit" 
                            disabled={processing}
                            className={`w-full py-4 uppercase tracking-widest font-bold text-white transition ${processing ? 'bg-gray-400' : 'bg-black hover:bg-gray-800'}`}
                        >
                            {processing ? 'Processing...' : (data.payment_method === 'razorpay' ? 'Pay Now' : 'Place Order on WhatsApp')}
                        </button>
                    </form>
                </div>

                {/* Order Summary Sidebar */}
                <div className="w-full md:w-1/3">
                    <div className="bg-gray-50 p-6 sticky top-24 border">
                        <h2 className="text-lg font-bold uppercase tracking-wider mb-6 border-b pb-4">Order Summary</h2>
                        <div className="space-y-4 mb-6">
                            {cart.map(item => (
                                <div key={item.id} className="flex justify-between">
                                    <div className="flex">
                                        <div className="relative">
                                            <div className="w-12 h-16 bg-gray-200 overflow-hidden rounded">
                                                {item.image && <img src={item.image.startsWith('http') ? item.image : `/storage/${item.image}`} className="w-full h-full object-cover" loading="lazy" decoding="async" />}
                                            </div>
                                            <span className="absolute -top-2 -right-2 bg-gray-500 text-white w-5 h-5 flex items-center justify-center rounded-full text-xs">{item.quantity}</span>
                                        </div>
                                        <div className="ml-4 flex flex-col justify-center">
                                            <p className="text-sm font-medium uppercase truncate w-32">{item.name}</p>
                                        </div>
                                    </div>
                                    <p className="text-sm font-sans font-medium text-brand-900 mt-2">₹{Number(item.price * item.quantity).toLocaleString('en-IN')}</p>
                                </div>
                            ))}
                        </div>
                        
                        <div className="border-t pt-4 space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span className="font-sans font-medium text-brand-900">₹{Number(total).toLocaleString('en-IN')}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Shipping</span>
                                <span className="font-sans font-medium text-emerald-700">Free</span>
                            </div>
                        </div>
                        
                        <div className="border-t mt-4 pt-4 flex justify-between font-bold text-lg">
                            <span>Total</span>
                            <span className="font-sans font-bold text-brand-900">₹{Number(total).toLocaleString('en-IN')}</span>
                        </div>
                    </div>
                </div>

            </div>
        </>
    );
}

Checkout.layout = page => <CustomerLayout>{page}</CustomerLayout>;
