import AdminLayout from '@/Layouts/Admin/AdminLayout';
import { Head, useForm, usePage, router } from '@inertiajs/react';
import { useState } from 'react';
import VariantManager from './Partials/VariantManager';
import CustomizationManager from './Partials/CustomizationManager';

export default function Edit({ product, categories, all_customizations }) {
    const { flash } = usePage().props;
    const { data, setData, post, processing, errors } = useForm({
        name: product.name,
        category_id: product.category_id,
        sku: product.sku || '',
        short_description: product.short_description || '',
        full_description: product.full_description || '',
        price: product.price,
        sale_price: product.sale_price || '',
        stock_quantity: product.stock_quantity,
        is_made_to_order: product.is_made_to_order,
        is_active: product.is_active,
        is_featured: product.is_featured,
        seo_title: product.seo_title || '',
        seo_description: product.seo_description || '',
        images: [],
        _method: 'put',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.products.update', product.id), {
            onError: () => window.scrollTo({ top: 0, behavior: 'smooth' })
        });
    };

    return (
        <AdminLayout>
            <Head title={`Edit ${product.name}`} />
            <div className="p-8 max-w-5xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">Edit Product: {product.name}</h1>
                </div>

                {flash?.success && (
                    <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6" role="alert">
                        <p>{flash.success}</p>
                    </div>
                )}
                
                <form onSubmit={submit}>
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

                            {/* Images Section */}
                            <div className="bg-white rounded-lg shadow p-6">
                                <h2 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b">Images</h2>
                                <div className="mb-6">
                                    <label className="block text-gray-700 text-sm font-bold mb-2">Upload New Images</label>
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight"
                                        onChange={e => {
                                            const files = Array.from(e.target.files);
                                            const oversized = files.filter(f => f.size > 2 * 1024 * 1024);
                                            if (oversized.length > 0) {
                                                alert("Error: One or more images exceed the 2MB size limit. Please upload images less than 2MB.");
                                                e.target.value = null;
                                                setData('images', []);
                                                return;
                                            }
                                            setData('images', files);
                                        }}
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Only JPG, PNG, WEBP, GIF allowed. Max size: 2MB.</p>
                                    {errors.images && <p className="text-red-500 text-xs italic mt-1">{errors.images}</p>}
                                    {Object.keys(errors).filter(key => key.startsWith('images.')).map(key => (
                                        <p key={key} className="text-red-500 text-xs italic mt-1">{errors[key]}</p>
                                    ))}
                                </div>
                                
                                <label className="block text-gray-700 text-sm font-bold mb-2">Existing Images</label>
                                <div className="flex gap-4 overflow-x-auto py-2">
                                    {product.images.map(img => (
                                        <div key={img.id} className="relative w-24 h-24 border rounded shadow-sm overflow-hidden flex-shrink-0 group">
                                            <img src={img.path.startsWith('http') ? img.path : `/storage/${img.path}`} className="object-cover w-full h-full" alt="Product" />
                                            {img.is_primary && (
                                                <div className="absolute top-0 left-0 bg-black text-white text-[10px] px-1 font-bold">Primary</div>
                                            )}
                                            <button 
                                                type="button" 
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    if (confirm('Are you sure you want to delete this image?')) {
                                                        router.delete(route('admin.products.images.destroy', { product: product.id, image: img.id }), { preserveScroll: true });
                                                    }
                                                }}
                                                className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow hover:bg-red-700"
                                            >
                                                &times;
                                            </button>
                                        </div>
                                    ))}
                                    {product.images.length === 0 && <span className="text-gray-500 text-sm">No images uploaded.</span>}
                                </div>
                            </div>

                            {/* Variants Section */}
                            <VariantManager product={product} />

                            {/* Customizations Section */}
                            <CustomizationManager product={product} allCustomizations={all_customizations} />

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
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                    Update Product
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
