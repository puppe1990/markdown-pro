import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { signIn } from '@/src/features/auth/auth-client';
import { getAuthErrorMessage } from '@/src/features/auth/auth-errors';
import { EyeIcon, EyeOffIcon } from '@/components/icons';

export const Route = createFileRoute('/login')({
    component: LoginPage,
});

type FieldErrors = {
    email?: string;
    password?: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateLoginFields(
    email: string,
    password: string,
): FieldErrors | null {
    const errors: FieldErrors = {};
    if (!email.trim()) {
        errors.email = 'Please enter your email address.';
    } else if (!EMAIL_RE.test(email)) {
        errors.email =
            "This email address doesn't look right. Check the format.";
    }
    if (!password) {
        errors.password = 'Please enter your password.';
    }
    return Object.keys(errors).length > 0 ? errors : null;
}

const inputBase =
    'w-full px-4 py-2 rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none';

function inputClass(hasError: boolean) {
    return `${inputBase} ${hasError ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'}`;
}

function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setFieldErrors({});

        const validationErrors = validateLoginFields(email, password);
        if (validationErrors) {
            setFieldErrors(validationErrors);
            return;
        }

        const result = await signIn.email({ email, password });
        if (result.error) {
            setError(
                getAuthErrorMessage(result.error.code, result.error.message),
            );
            return;
        }
        navigate({ to: '/dashboard' });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-950 dark:via-indigo-950 dark:to-purple-950">
            <div className="w-full max-w-md p-8 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200/60 dark:border-gray-700/60">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 text-center">
                    Markdown Pro
                </h1>
                {error && (
                    <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 rounded-lg text-sm">
                        {error}
                    </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={inputClass(!!fieldErrors.email)}
                        />
                        {fieldErrors.email && (
                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                {fieldErrors.email}
                            </p>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Password
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={`${inputClass(!!fieldErrors.password)} pr-10`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((v) => !v)}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                tabIndex={-1}
                            >
                                {showPassword ? (
                                    <EyeOffIcon className="w-5 h-5" />
                                ) : (
                                    <EyeIcon className="w-5 h-5" />
                                )}
                            </button>
                        </div>
                        {fieldErrors.password && (
                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                {fieldErrors.password}
                            </p>
                        )}
                    </div>
                    <button
                        type="submit"
                        className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-all"
                    >
                        Sign In
                    </button>
                </form>
                <p className="mt-4 text-sm text-center text-gray-600 dark:text-gray-400">
                    Don&apos;t have an account?{' '}
                    <a
                        href="/signup"
                        className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                        Sign up
                    </a>
                </p>
            </div>
        </div>
    );
}
