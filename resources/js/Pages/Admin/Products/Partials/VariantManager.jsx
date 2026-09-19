import { useForm, router } from '@inertiajs/react';
import { useState } from 'react';

export default function VariantManager({ product }) {
    const [editingVariant, setEditingVariant] = useState(null);
    const [isCreating, setIsCreating] = useState(false);

    const { data, setData, post, put, reset, errors, clearErrors } = useForm({
        type: '',
        value: '',
        sku: '',
        price_adjustment: 0,
        stock_quantity: 0,
        is_active: true
    });

    const handleCreateNew = () => {
        setIsCreating(true);
        setEditingVariant(null);
        clearErrors();
        reset();
    };

    const handleEdit = (variant) => {
        setIsCreating(false);
        setEditingVariant(variant);
        clearErrors();
        setData({
            type: variant.type,
            value: variant.value,
            sku: variant.sku || '',
            price_adjustment: variant.price_adjustment,
            stock_quantity: variant.stock_quantity,
            is_active: variant.is_active
        });
    };

    const handleCancel = () => {
        setIsCreating(false);
        setEditingVariant(null);
        reset();
        clearErrors();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isCreating) {
            post(route('admin.products.variants.store', product.id), {
                preserveScroll: true,
                onSuccess: () => {
                    setIsCreating(false);
                    reset();
                }
            });
        } else if (editingVariant) {
            put(route('admin.products.variants.update', { product: product.id, variant: editingVariant.id }), {
                preserveScroll: true,
                onSuccess: () => {
                    setEditingVariant(null);
                    reset();
                }
            });
        }
    };

    const handleDelete = (variant) => {
        if (confirm('Are you sure you want to delete this variant?')) {
            router.delete(route('admin.products.variants.destroy', { product: product.id, variant: variant.id }), {
                preserveScroll: true
            });
        }
    };

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4 pb-2 border-b">
                <h2 className="text-lg font-bold text-gray-800">Variants</h2>
                {!isCreating && !editingVariant && (
                    <button
                        type="button"
                        onClick={handleCreateNew}
                        className="bg-black text-white px-3 py-1 text-sm rounded hover:bg-gray-800 transition"
                    >
                        Add Variant
                    </button>
                )}
            </div>

            {(isCreating || editingVariant) && (
                <div className="bg-gray-50 p-4 rounded mb-6 border">
                    <h3 className="text-md font-bold mb-4">{isCreating ? 'Add New Variant' : 'Edit Variant'}</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Type (e.g. Size, Color)</label>
                                <input
                                    type="text"
                                    className="border rounded w-full py-2 px-3 text-sm focus:ring-black"
                                    value={data.type}
                                    onChange={e => setData('type', e.target.value)}
                                    placeholder="Size"
                                />
                                {errors.type && <p className="text-red-500 text-xs mt-1">{errors.type}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Value (e.g. XL, Red)</label>
                                <input
                                    type="text"
                                    className="border rounded w-full py-2 px-3 text-sm focus:ring-black"
                                    value={data.value}
                                    onChange={e => setData('value', e.target.value)}
                                    placeholder="XL"
                                />
                                {errors.value && <p className="text-red-500 text-xs mt-1">{errors.value}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">SKU</label>
                                <input
                                    type="text"
                                    className="border rounded w-full py-2 px-3 text-sm focus:ring-black"
                                    value={data.sku}
                                    onChange={e => setData('sku', e.target.value)}
                                    placeholder="Optional"
                                />
                                {errors.sku && <p className="text-red-500 text-xs mt-1">{errors.sku}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Price Adj. (₹)</label>
                                <input
                                    type="number"
                                    className="border rounded w-full py-2 px-3 text-sm focus:ring-black"
                                    value={data.price_adjustment}
                                    onChange={e => setData('price_adjustment', e.target.value)}
                                />
                                {errors.price_adjustment && <p className="text-red-500 text-xs mt-1">{errors.price_adjustment}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Stock</label>
                                <input
                                    type="number"
                                    className="border rounded w-full py-2 px-3 text-sm focus:ring-black"
                                    value={data.stock_quantity}
                                    onChange={e => setData('stock_quantity', e.target.value)}
                                />
                                {errors.stock_quantity && <p className="text-red-500 text-xs mt-1">{errors.stock_quantity}</p>}
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    className="form-checkbox text-black"
                                    checked={data.is_active}
                                    onChange={e => setData('is_active', e.target.checked)}
                                />
                                <span className="ml-2 text-gray-700 text-sm font-bold">Active</span>
                            </label>
                        </div>

                        <div className="flex gap-2">
                            <button type="submit" className="bg-black text-white px-4 py-2 text-sm rounded hover:bg-gray-800">
                                {isCreating ? 'Save' : 'Update'}
                            </button>
                            <button type="button" onClick={handleCancel} className="bg-gray-300 text-gray-800 px-4 py-2 text-sm rounded hover:bg-gray-400">
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead>
                        <tr>
                            <th className="px-4 py-2 text-left font-medium text-gray-500">Type</th>
                            <th className="px-4 py-2 text-left font-medium text-gray-500">Value</th>
                            <th className="px-4 py-2 text-left font-medium text-gray-500">SKU</th>
                            <th className="px-4 py-2 text-left font-medium text-gray-500">Price Adj.</th>
                            <th className="px-4 py-2 text-left font-medium text-gray-500">Stock</th>
                            <th className="px-4 py-2 text-left font-medium text-gray-500">Status</th>
                            <th className="px-4 py-2 text-right font-medium text-gray-500">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {product.variants && product.variants.length > 0 ? (
                            product.variants.map((v) => (
                                <tr key={v.id}>
                                    <td className="px-4 py-2 font-medium">{v.type}</td>
                                    <td className="px-4 py-2">{v.value}</td>
                                    <td className="px-4 py-2 text-gray-500">{v.sku || '-'}</td>
                                    <td className="px-4 py-2">
                                        <span className={v.price_adjustment > 0 ? 'text-green-600' : (v.price_adjustment < 0 ? 'text-red-600' : 'text-gray-500')}>
                                            {v.price_adjustment > 0 ? '+' : ''}{v.price_adjustment}
                                        </span>
                                    </td>
                                    <td className="px-4 py-2">
                                        <span className={v.stock_quantity <= 5 ? 'text-red-500 font-bold' : ''}>
                                            {v.stock_quantity}
                                        </span>
                                    </td>
                                    <td className="px-4 py-2">
                                        <span className={`px-2 inline-flex text-[10px] leading-4 font-semibold rounded-full ${v.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {v.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-2 text-right">
                                        <button onClick={() => handleEdit(v)} className="text-indigo-600 hover:text-indigo-900 mr-3">Edit</button>
                                        <button onClick={() => handleDelete(v)} className="text-red-600 hover:text-red-900">Delete</button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" className="px-4 py-4 text-center text-gray-500">
                                    No variants added yet.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
