import AdminLayout from '@/Layouts/Admin/AdminLayout';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { useState } from 'react';

export default function Index({ products, categories, filters }) {
    const { flash } = usePage().props;
    const [search, setSearch] = useState(filters?.search || '');
    const [categoryId, setCategoryId] = useState(filters?.category_id || '');
    const [isActive, setIsActive] = useState(filters?.is_active || '');

    const handleFilter = (e) => {
        e.preventDefault();
        router.get(route('admin.products.index'), {
            search,
            category_id: categoryId,
            is_active: isActive
        }, { preserveState: true });
    };

    return (
        <AdminLayout>
            <Head title="Products" />
            <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">Products</h1>
                    <Link href={route('admin.products.create')} className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition">
                        Add New Product
                    </Link>
                </div>

                {flash?.success && (
                    <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6" role="alert">
                        <p>{flash.success}</p>
                    </div>
                )}
                {flash?.error && (
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
                        <p>{flash.error}</p>
                    </div>
                )}

                <div className="mb-6 bg-white p-4 rounded-lg shadow">
                    <form onSubmit={handleFilter} className="flex flex-wrap gap-4 items-end">
                        <div className="flex-1 min-w-[200px]">
                            <label className="block text-xs text-gray-500 mb-1">Search (Name, Slug, SKU)</label>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search products..."
                                className="border border-gray-300 rounded px-4 py-2 w-full"
                            />
                        </div>
                        <div className="w-48">
                            <label className="block text-xs text-gray-500 mb-1">Category</label>
                            <select
                                value={categoryId}
                                onChange={(e) => setCategoryId(e.target.value)}
                                className="border border-gray-300 rounded px-4 py-2 w-full"
                            >
                                <option value="">All Categories</option>
                                {categories.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="w-32">
                            <label className="block text-xs text-gray-500 mb-1">Status</label>
                            <select
                                value={isActive}
                                onChange={(e) => setIsActive(e.target.value)}
                                className="border border-gray-300 rounded px-4 py-2 w-full"
                            >
                                <option value="">All</option>
                                <option value="1">Active</option>
                                <option value="0">Inactive</option>
                            </select>
                        </div>
                        <button type="submit" className="bg-gray-200 text-gray-800 px-6 py-2 rounded hover:bg-gray-300 transition">
                            Filter
                        </button>
                    </form>
                </div>

                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {products.data.map((product) => (
                                <tr key={product.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {product.images && product.images.length > 0 ? (
                                            <img src={product.images[0].path.startsWith('http') ? product.images[0].path : `/storage/${product.images[0].path}`} alt={product.name} className="h-10 w-10 object-cover rounded border border-gray-200" />
                                        ) : (
                                            <div className="h-10 w-10 bg-gray-100 rounded border border-gray-200 flex items-center justify-center text-xs text-gray-400">No Img</div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                        <div className="text-xs text-gray-500 flex gap-2 mt-1">
                                            {product.sku && <span>SKU: {product.sku}</span>}
                                            <span className={`px-2 inline-flex text-[10px] leading-4 font-semibold rounded-full ${product.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                {product.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                            <span className="bg-gray-100 text-gray-600 px-2 rounded-full text-[10px] leading-4">{product.category?.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {product.sale_price ? (
                                            <div>
                                                <span className="line-through text-gray-400 mr-2">₹{product.price}</span>
                                                <span className="font-bold text-gray-900">₹{product.sale_price}</span>
                                            </div>
                                        ) : (
                                            <span className="font-bold text-gray-900">₹{product.price}</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <span className={product.stock_quantity <= 5 ? 'text-red-500 font-bold' : ''}>
                                            {product.stock_quantity}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <Link href={route('admin.products.edit', product.id)} className="text-indigo-600 hover:text-indigo-900 mr-4">Edit</Link>
                                        <button onClick={() => {
                                            if (confirm('Are you sure you want to delete this product?')) {
                                                router.delete(route('admin.products.destroy', product.id));
                                            }
                                        }} className="text-red-600 hover:text-red-900">Delete</button>
                                    </td>
                                </tr>
                            ))}
                            {products.data.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">No products found matching criteria.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {products.links && products.links.length > 3 && (
                    <div className="mt-6 flex justify-center">
                        <div className="flex gap-1">
                            {products.links.map((link, i) => (
                                <Link
                                    key={i}
                                    href={link.url || '#'}
                                    className={`px-4 py-2 border rounded ${link.active ? 'bg-black text-white' : 'bg-white text-gray-700 hover:bg-gray-50'} ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
