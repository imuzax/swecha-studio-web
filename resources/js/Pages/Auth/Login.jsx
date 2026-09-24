import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import CustomerLayout from '@/Layouts/Frontend/CustomerLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <CustomerLayout>
            <Head title="Log in - Swecha Studio" />

            <div className="max-w-md mx-auto px-4 py-16 md:py-24">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold uppercase tracking-widest mb-2">Welcome Back</h1>
                    <p className="text-gray-500">Please enter your details to sign in.</p>
                </div>

                {status && (
                    <div className="mb-4 text-sm font-medium text-emerald-600 bg-emerald-50 p-4 rounded border border-emerald-100">
                        {status}
                    </div>
                )}

                <div className="bg-white p-8 border shadow-sm">
                    <form onSubmit={submit}>
                        <div>
                            <InputLabel htmlFor="email" value="Email Address" />

                            <TextInput
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                className="mt-1 block w-full rounded focus:ring-black focus:border-black"
                                autoComplete="username"
                                isFocused={true}
                                onChange={(e) => setData('email', e.target.value)}
                            />

                            <InputError message={errors.email} className="mt-2" />
                        </div>

                        <div className="mt-6">
                            <InputLabel htmlFor="password" value="Password" />

                            <TextInput
                                id="password"
                                type="password"
                                name="password"
                                value={data.password}
                                className="mt-1 block w-full rounded focus:ring-black focus:border-black"
                                autoComplete="current-password"
                                onChange={(e) => setData('password', e.target.value)}
                            />

                            <InputError message={errors.password} className="mt-2" />
                        </div>

                        <div className="mt-4 flex items-center justify-between">
                            <label className="flex items-center">
                                <Checkbox
                                    name="remember"
                                    checked={data.remember}
                                    onChange={(e) =>
                                        setData('remember', e.target.checked)
                                    }
                                    className="text-black focus:ring-black"
                                />
                                <span className="ms-2 text-sm text-gray-600">
                                    Remember me
                                </span>
                            </label>

                            {canResetPassword && (
                                <Link
                                    href={route('password.request')}
                                    className="text-sm text-gray-500 hover:text-black transition-colors"
                                >
                                    Forgot your password?
                                </Link>
                            )}
                        </div>

                        <div className="mt-8">
                            <button
                                type="submit"
                                disabled={processing}
                                className={`w-full py-3 uppercase tracking-widest font-bold text-white transition ${processing ? 'bg-gray-400' : 'bg-black hover:bg-gray-800'}`}
                            >
                                {processing ? 'Signing In...' : 'Sign In'}
                            </button>
                        </div>

                        <div className="mt-6 text-center text-sm">
                            <span className="text-gray-500">Don't have an account? </span>
                            <Link
                                href={route('register')}
                                className="font-bold text-black hover:underline"
                            >
                                Register
                            </Link>
                        </div>
                        
                        <div className="mt-8 border-t border-gray-200 pt-6">
                            <a
                                href={route('oauth.google')}
                                className="w-full flex items-center justify-center gap-2 bg-white text-gray-700 border border-gray-300 px-4 py-3 hover:bg-gray-50 transition uppercase tracking-widest text-xs font-bold"
                            >
                                <svg className="w-4 h-4" viewBox="0 0 24 24">
                                    <path
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                        fill="#4285F4"
                                    />
                                    <path
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                        fill="#34A853"
                                    />
                                    <path
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                        fill="#FBBC05"
                                    />
                                    <path
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                        fill="#EA4335"
                                    />
                                    <path d="M1 1h22v22H1z" fill="none" />
                                </svg>
                                Continue with Google
                            </a>
                        </div>
                    </form>
                </div>
            </div>
        </CustomerLayout>
    );
}
