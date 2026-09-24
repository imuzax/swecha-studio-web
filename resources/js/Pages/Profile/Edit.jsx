import CustomerLayout from '@/Layouts/Frontend/CustomerLayout';
import CustomerPortalLayout from '@/Layouts/Frontend/CustomerPortalLayout';
import { Head } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function Edit({ mustVerifyEmail, status }) {
    return (
        <CustomerPortalLayout>
            <Head title="Profile Settings | Swecha Studio" />

            <div className="space-y-8">
                <div>
                    <h2 className="text-xl font-semibold text-stone-900 mb-1">Account Settings</h2>
                    <p className="text-sm text-stone-500">Update your account's profile information and email address.</p>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    {/* Left Column */}
                    <div className="space-y-8">
                        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-brand-100">
                            <UpdateProfileInformationForm
                                mustVerifyEmail={mustVerifyEmail}
                                status={status}
                                className="max-w-xl"
                            />
                        </div>

                        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-brand-100">
                            <DeleteUserForm className="max-w-xl" />
                        </div>
                    </div>

                    {/* Right Column */}
                    <div>
                        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-brand-100">
                            <UpdatePasswordForm className="max-w-xl" />
                        </div>
                    </div>
                </div>
            </div>
        </CustomerPortalLayout>
    );
}

Edit.layout = page => <CustomerLayout>{page}</CustomerLayout>;
