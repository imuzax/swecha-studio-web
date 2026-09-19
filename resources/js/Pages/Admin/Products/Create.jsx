import AdminLayout from '@/Layouts/Admin/AdminLayout';
import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function Create({ categories }) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        category_id: '',
        sku: '',
        short_description: '',
        full_description: '',
        price: '',
        sale_price: '',
        stock_quantity: '0',
        is_made_to_order: false,
        is_active: true,
        is_featured: false,
        seo_title: '',
        seo_description: '',
        images: []
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.products.store'), {
            onError: () => window.scrollTo({ top: 0, behavior: 'smooth' })
        });
    };

    return (
        <AdminLayout>
            <Head title="Create Product" />
            <div className="p-8 max-w-5xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">Create Product</h1>
                
                <form onSubmit={submit} encType="multipart/form-data">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Column */}
                        <div className="lg:col-span-2 space-y-6">
                            
                            {/* Basic Information */}
                            <div className="bg-white rounded-lg shadow p-6">
                                <h2 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b">Basic Information</h2>
                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2">Product Name</label>
                                    <input
                                        type="text"
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-black"
                                        value={data.name}
                                        onChange={e => setData('name', e.target.value)}
                                    />
                                    {errors.name && <p className="text-red-500 text-xs italic mt-1">{errors.name}</p>}
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2">Short Description</label>
                                    <textarea
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-black"
                                        value={data.short_description}
                                        onChange={e => setData('short_description', e.target.value)}
                                        rows="2"
                                    ></textarea>
                                    {errors.short_description && <p className="text-red-500 text-xs italic mt-1">{errors.short_description}</p>}
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2">Full Description</label>
                                    <textarea
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-black"
                                        value={data.full_description}
                                        onChange={e => setData('full_description', e.target.value)}
                                        rows="5"
                                    ></textarea>
                                    {errors.full_description && <p className="text-red-500 text-xs italic mt-1">{errors.full_description}</p>}
                                </div>
                            </div>

                            {/* Info Box */}
                            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg shadow-sm">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm text-blue-700">
                                            <strong>Note:</strong> You can add <strong>Variants</strong> (like sizes/colors) and <strong>Customizations</strong> after saving this product for the first time.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Images */}
                            <div className="bg-white rounded-lg shadow p-6">
                                <h2 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b">Images</h2>
                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2">Product Images (Up to 10)</label>
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight"
                                        onChange={e => setData('images', Array.from(e.target.files))}
                                    />
                                    <p className="text-xs text-gray-500 mt-1">First image will be the primary image. Only JPG, PNG, WEBP, GIF allowed.</p>
                                    {errors.images && <p className="text-red-500 text-xs italic mt-1">{errors.images}</p>}
                                    {Object.keys(errors).filter(key => key.startsWith('images.')).map(key => (
                                        <p key={key} className="text-red-500 text-xs italic mt-1">{errors[key]}</p>
                                    ))}
                                </div>
                            </div>

                            {/* SEO */}
                            <div className="bg-white rounded-lg shadow p-6">
                                <h2 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b">Search Engine Optimization</h2>
                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2">SEO Title</label>
                                    <input
                                        type="text"
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-black"
                                        value={data.seo_title}
                                        onChange={e => setData('seo_title', e.target.value)}
                                        placeholder="Optional"
                                    />
                                    {errors.seo_title && <p className="text-red-500 text-xs italic mt-1">{errors.seo_title}</p>}
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2">SEO Description</label>
                                    <textarea
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-black"
                                        value={data.seo_description}
                                        onChange={e => setData('seo_description', e.target.value)}
                                        rows="2"
                                        placeholder="Optional"
                                    ></textarea>
                                    {errors.seo_description && <p className="text-red-500 text-xs italic mt-1">{errors.seo_description}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Sidebar Column */}
                        <div className="space-y-6 lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)] lg:overflow-y-auto pb-6 pr-2">
                            
                            {/* Actions */}
                            <div className="bg-white rounded-lg shadow p-6 border-t-4 border-black">
                                <button
                                    type="submit"
                                    className="w-full bg-black hover:bg-gray-800 text-white font-bold py-3 px-4 rounded focus:outline-none focus:shadow-outline transition flex items-center justify-center gap-2"
                                    disabled={processing}
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                                    Save Product
                                </button>
                            </div>
                            {/* Organization */}
                            <div className="bg-white rounded-lg shadow p-6">
                                <h2 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b">Organization</h2>
                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2">Category</label>
                                    <select 
                                        className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-black"
                                        value={data.category_id}
                                        onChange={e => setData('category_id', e.target.value)}
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                    {errors.category_id && <p className="text-red-500 text-xs italic mt-1">{errors.category_id}</p>}
                                </div>
                            </div>

                            {/* Pricing & Inventory */}
                            <div className="bg-white rounded-lg shadow p-6">
                                <h2 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b">Pricing & Inventory</h2>
                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2">Price (₹)</label>
                                    <input
                                        type="number"
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-black"
                                        value={data.price}
                                        onChange={e => setData('price', e.target.value)}
                                    />
                                    {errors.price && <p className="text-red-500 text-xs italic mt-1">{errors.price}</p>}
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2">Sale Price (₹)</label>
                                    <input
                                        type="number"
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-black"
                                        value={data.sale_price}
                                        onChange={e => setData('sale_price', e.target.value)}
                                        placeholder="Optional"
                                    />
                                    {errors.sale_price && <p className="text-red-500 text-xs italic mt-1">{errors.sale_price}</p>}
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2">SKU</label>
                                    <input
                                        type="text"
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-black"
                                        value={data.sku}
                                        onChange={e => setData('sku', e.target.value)}
                                        placeholder="Optional"
                                    />
                                    {errors.sku && <p className="text-red-500 text-xs italic mt-1">{errors.sku}</p>}
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2">Stock Quantity</label>
                                    <input
                                        type="number"
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-black"
                                        value={data.stock_quantity}
                                        onChange={e => setData('stock_quantity', e.target.value)}
                                    />
                                    {errors.stock_quantity && <p className="text-red-500 text-xs italic mt-1">{errors.stock_quantity}</p>}
                                </div>
                            </div>

                            {/* Status */}
                            <div className="bg-white rounded-lg shadow p-6">
                                <h2 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b">Status</h2>
                                <div className="space-y-3">
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            className="form-checkbox text-black"
                                            checked={data.is_active}
                                            onChange={e => setData('is_active', e.target.checked)}
                                        />
                                        <span className="ml-2 text-gray-700 text-sm font-bold">Active (Visible in store)</span>
                                    </label>
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            className="form-checkbox text-black"
                                            checked={data.is_featured}
                                            onChange={e => setData('is_featured', e.target.checked)}
                                        />
                                        <span className="ml-2 text-gray-700 text-sm font-bold">Featured Product</span>
                                    </label>
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            className="form-checkbox text-black"
                                            checked={data.is_made_to_order}
                                            onChange={e => setData('is_made_to_order', e.target.checked)}
                                        />
                                        <span className="ml-2 text-gray-700 text-sm font-bold">Made to Order</span>
                                    </label>
                                </div>
                            </div>

                        </div>
                    </div>

                </form>
            </div>
        </AdminLayout>
    );
}
