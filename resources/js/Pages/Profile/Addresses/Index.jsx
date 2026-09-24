import React from 'react';
import CustomerPortalLayout from '@/Layouts/Frontend/CustomerPortalLayout';
import CustomerLayout from '@/Layouts/Frontend/CustomerLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';
import Modal from '@/Components/Modal';
import { useState } from 'react';

export default function Index({ addresses, auth }) {
    const [confirmingAddressDeletion, setConfirmingAddressDeletion] = useState(false);
    const [addressToDelete, setAddressToDelete] = useState(null);

    const { delete: destroy, processing } = useForm();

    const confirmAddressDeletion = (addressId) => {
        setAddressToDelete(addressId);
        setConfirmingAddressDeletion(true);
    };

    const deleteAddress = (e) => {
        e.preventDefault();
        destroy(route('addresses.destroy', addressToDelete), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
        });
    };

    const closeModal = () => {
        setConfirmingAddressDeletion(false);
        setAddressToDelete(null);
    };

    const { put } = useForm();

    const setDefault = (addressId) => {
        put(route('addresses.setDefault', addressId));
    };

    return (
        <CustomerPortalLayout>
            <div className="flex items-center justify-between mb-6">
                <h2 className="font-semibold text-2xl text-gray-900">My Addresses</h2>
            </div>
            <Head title="My Addresses" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-medium text-gray-900">Saved Addresses</h3>
                            <Link href={route('addresses.create')} className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700">
                                Add New Address
                            </Link>
                        </div>

                        {addresses.length === 0 ? (
                            <p className="text-gray-500">You haven't saved any addresses yet.</p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {addresses.map((address) => (
                                    <div key={address.id} className={`border rounded-lg p-4 ${address.is_default ? 'border-gray-800 bg-gray-50' : 'border-gray-200'}`}>
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <span className="inline-block px-2 py-1 text-xs font-semibold rounded bg-gray-200 text-gray-800 mr-2 uppercase tracking-wide">
                                                    {address.type}
                                                </span>
                                                {address.is_default && (
                                                    <span className="inline-block px-2 py-1 text-xs font-semibold rounded bg-green-100 text-green-800 uppercase tracking-wide">
                                                        Default
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        
                                        <div className="mt-4">
                                            <p className="font-medium text-gray-900">{address.name}</p>
                                            <p className="text-gray-600 text-sm mt-1">{address.phone}</p>
                                            <p className="text-gray-600 text-sm mt-2">{address.address_line_1}</p>
                                            {address.address_line_2 && <p className="text-gray-600 text-sm">{address.address_line_2}</p>}
                                            <p className="text-gray-600 text-sm">{address.city}, {address.state} {address.pincode}</p>
                                        </div>

                                        <div className="mt-6 flex space-x-4 border-t pt-4">
                                            <Link href={route('addresses.edit', address.id)} className="text-indigo-600 hover:text-indigo-900 text-sm font-medium">
                                                Edit
                                            </Link>
                                            <button onClick={() => deleteAddress(address.id)} className="text-red-600 hover:text-red-900 text-sm font-medium">
                                                Delete
                                            </button>
                                            {!address.is_default && (
                                                <button onClick={() => setDefault(address.id)} className="text-gray-600 hover:text-gray-900 text-sm font-medium">
                                                    Set as Default
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </CustomerPortalLayout>
    );
}

Index.layout = page => <CustomerLayout>{page}</CustomerLayout>;
