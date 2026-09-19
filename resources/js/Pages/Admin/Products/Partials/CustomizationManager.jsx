import { useForm, router } from '@inertiajs/react';

export default function CustomizationManager({ product, allCustomizations }) {
    const { data, setData, post, processing } = useForm({
        customization_id: ''
    });

    const handleAttach = (e) => {
        e.preventDefault();
        post(route('admin.products.customizations.attach', product.id), {
            preserveScroll: true,
            onSuccess: () => setData('customization_id', '')
        });
    };

    const handleDetach = (customization) => {
        if (confirm(`Are you sure you want to remove the customization "${customization.name}" from this product?`)) {
            router.delete(route('admin.products.customizations.detach', { product: product.id, customization: customization.id }), {
                preserveScroll: true
            });
        }
    };

    // Filter out already attached customizations
    const availableCustomizations = allCustomizations.filter(
        (ac) => !product.customizations.some((pc) => pc.id === ac.id)
    );

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b">Customizations</h2>
            
            <div className="mb-6">
                <form onSubmit={handleAttach} className="flex gap-4">
                    <select
                        className="border rounded flex-1 py-2 px-3 text-sm focus:ring-black"
                        value={data.customization_id}
                        onChange={(e) => setData('customization_id', e.target.value)}
                        required
                    >
                        <option value="">-- Select Customization to Attach --</option>
                        {availableCustomizations.map(c => (
                            <option key={c.id} value={c.id}>{c.name} ({c.type})</option>
                        ))}
                    </select>
                    <button 
                        type="submit" 
                        disabled={processing || !data.customization_id}
                        className="bg-black text-white px-4 py-2 text-sm rounded hover:bg-gray-800 disabled:opacity-50"
                    >
                        Attach
                    </button>
                </form>
            </div>

            <div className="space-y-4">
                {product.customizations && product.customizations.length > 0 ? (
                    product.customizations.map((c) => (
                        <div key={c.id} className="border rounded p-4 bg-gray-50">
                            <div className="flex justify-between items-center mb-2 pb-2 border-b">
                                <div>
                                    <h3 className="font-bold text-gray-800">{c.name}</h3>
                                    <p className="text-xs text-gray-500">Type: {c.type}</p>
                                </div>
                                <button
                                    onClick={() => handleDetach(c)}
                                    className="text-red-600 hover:text-red-900 text-sm font-semibold"
                                >
                                    Remove
                                </button>
                            </div>
                            <div>
                                {c.options && c.options.length > 0 ? (
                                    <ul className="text-sm text-gray-700 list-disc list-inside">
                                        {c.options.map(opt => (
                                            <li key={opt.id}>
                                                {opt.name} 
                                                {opt.price_adjustment > 0 ? <span className="text-green-600 ml-1">(+₹{opt.price_adjustment})</span> : ''}
                                                {opt.price_adjustment < 0 ? <span className="text-red-600 ml-1">(-₹{Math.abs(opt.price_adjustment)})</span> : ''}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <span className="text-sm text-gray-500 italic">No options defined for this customization.</span>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-sm text-gray-500 italic py-4">
                        No customizations attached to this product yet.
                    </div>
                )}
            </div>
        </div>
    );
}
