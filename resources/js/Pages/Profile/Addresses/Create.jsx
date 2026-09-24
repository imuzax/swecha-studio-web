import CustomerPortalLayout from '@/Layouts/Frontend/CustomerPortalLayout';
import CustomerLayout from '@/Layouts/Frontend/CustomerLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Create({ auth }) {
    const { data, setData, post, processing, errors } = useForm({
        type: 'shipping',
        name: '',
        phone: '',
        address_line_1: '',
        address_line_2: '',
        city: '',
        state: '',
        pincode: '',
        is_default: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('addresses.store'));
    };

    return (
        <CustomerPortalLayout>
            <div className="flex items-center justify-between mb-6">
                <h2 className="font-semibold text-2xl text-gray-900">Add New Address</h2>
                <Link href={route('addresses.index')} className="text-sm text-brand-600 hover:underline">
                    &larr; Back to Addresses
                </Link>
            </div>
            <Head title="Add Address" />

            <div className="py-12">
                <div className="max-w-2xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <form onSubmit={submit} className="space-y-6">
                            
                            <div>
                                <InputLabel htmlFor="type" value="Address Type" />
                                <select
                                    id="type"
                                    className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm mt-1 block w-full"
                                    value={data.type}
                                    onChange={(e) => setData('type', e.target.value)}
                                >
                                    <option value="shipping">Shipping</option>
                                    <option value="billing">Billing</option>
                                </select>
                                <InputError message={errors.type} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="name" value="Full Name" />
                                <TextInput
                                    id="name"
                                    type="text"
                                    className="mt-1 block w-full"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    required
                                />
                                <InputError message={errors.name} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="phone" value="Phone Number" />
                                <TextInput
                                    id="phone"
                                    type="text"
                                    className="mt-1 block w-full"
                                    value={data.phone}
                                    onChange={(e) => setData('phone', e.target.value)}
                                    required
                                />
                                <InputError message={errors.phone} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="address_line_1" value="Address Line 1" />
                                <TextInput
                                    id="address_line_1"
                                    type="text"
                                    className="mt-1 block w-full"
                                    value={data.address_line_1}
                                    onChange={(e) => setData('address_line_1', e.target.value)}
                                    required
                                />
                                <InputError message={errors.address_line_1} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="address_line_2" value="Address Line 2 (Optional)" />
                                <TextInput
                                    id="address_line_2"
                                    type="text"
                                    className="mt-1 block w-full"
                                    value={data.address_line_2}
                                    onChange={(e) => setData('address_line_2', e.target.value)}
                                />
                                <InputError message={errors.address_line_2} className="mt-2" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <InputLabel htmlFor="city" value="City" />
                                    <TextInput
                                        id="city"
                                        type="text"
                                        className="mt-1 block w-full"
                                        value={data.city}
                                        onChange={(e) => setData('city', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.city} className="mt-2" />
                                </div>
                                <div>
                                    <InputLabel htmlFor="state" value="State" />
                                    <TextInput
                                        id="state"
                                        type="text"
                                        className="mt-1 block w-full"
                                        value={data.state}
                                        onChange={(e) => setData('state', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.state} className="mt-2" />
                                </div>
                            </div>

                            <div>
                                <InputLabel htmlFor="pincode" value="Pincode / Postal Code" />
                                <TextInput
                                    id="pincode"
                                    type="text"
                                    className="mt-1 block w-full"
                                    value={data.pincode}
                                    onChange={(e) => setData('pincode', e.target.value)}
                                    required
                                />
                                <InputError message={errors.pincode} className="mt-2" />
                            </div>

                            <div className="flex items-center">
                                <input
                                    id="is_default"
                                    type="checkbox"
                                    className="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500"
                                    checked={data.is_default}
                                    onChange={(e) => setData('is_default', e.target.checked)}
                                />
                                <span className="ml-2 text-sm text-gray-600">Set as default address</span>
                            </div>

                            <div className="flex items-center justify-end mt-4 gap-4">
                                <Link href={route('addresses.index')} className="text-gray-600 hover:text-gray-900">
                                    Cancel
                                </Link>
                                <PrimaryButton disabled={processing}>
                                    Save Address
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </CustomerPortalLayout>
    );
}

Create.layout = page => <CustomerLayout>{page}</CustomerLayout>;
