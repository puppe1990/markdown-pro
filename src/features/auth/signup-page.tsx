import { useNavigate } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { signUp, useSession } from '@/src/features/auth/auth-client';
import { getAuthErrorMessage } from '@/src/features/auth/auth-errors';
import { AuthShell } from '@/components/AuthShell';
import { EyeIcon, EyeOffIcon } from '@/components/icons';
import { btnPrimary, inputClass } from '@/src/lib/ui-classes';

type FieldErrors = {
    name?: string;
    email?: string;
    password?: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateSignupFields(
    name: string,
    email: string,
    password: string,
): FieldErrors | null {
    const errors: FieldErrors = {};
    if (!name.trim()) {
        errors.name = 'Please enter your name.';
    }
    if (!email.trim()) {
        errors.email = 'Please enter your email address.';
    } else if (!EMAIL_RE.test(email)) {
        errors.email =
            "This email address doesn't look right. Check the format.";
    }
    if (!password) {
        errors.password = 'Please enter a password.';
    } else if (password.length < 8) {
        errors.password = 'Password must be at least 8 characters long.';
    }
    return Object.keys(errors).length > 0 ? errors : null;
}

export function SignupPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { data: session } = useSession();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setFieldErrors({});

        const validationErrors = validateSignupFields(name, email, password);
        if (validationErrors) {
            setFieldErrors(validationErrors);
            return;
        }

        setLoading(true);
        try {
            const result = await signUp.email({ email, password, name });
            if (result.error) {
                setError(getAuthErrorMessage(result.error));
                setLoading(false);
                return;
            }
        } catch {
            setError(
                "We couldn't reach the server. Please check your internet connection and try again.",
            );
            setLoading(false);
        }
    };

    useEffect(() => {
        if (session) {
            navigate({ to: '/dashboard' });
        }
    }, [session, navigate]);

    return (
        <AuthShell title="Create your workspace">
            {error && (
                <div className="mb-5 p-3.5 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 rounded-lg text-sm border border-red-200/60 dark:border-red-900/40">
                    {error}
                </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label className="block text-sm font-medium text-ink-muted mb-1.5">
                        Name
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className={inputClass(!!fieldErrors.name)}
                    />
                    {fieldErrors.name && (
                        <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">
                            {fieldErrors.name}
                        </p>
                    )}
                </div>
                <div>
                    <label className="block text-sm font-medium text-ink-muted mb-1.5">
                        Email
                    </label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={inputClass(!!fieldErrors.email)}
                    />
                    {fieldErrors.email && (
                        <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">
                            {fieldErrors.email}
                        </p>
                    )}
                </div>
                <div>
                    <label className="block text-sm font-medium text-ink-muted mb-1.5">
                        Password
                    </label>
                    <div className="relative">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={`${inputClass(!!fieldErrors.password)} pr-11`}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword((v) => !v)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink-muted transition-colors"
                            tabIndex={-1}
                            aria-label={
                                showPassword ? 'Hide password' : 'Show password'
                            }
                        >
                            {showPassword ? (
                                <EyeOffIcon className="w-5 h-5" />
                            ) : (
                                <EyeIcon className="w-5 h-5" />
                            )}
                        </button>
                    </div>
                    {fieldErrors.password && (
                        <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">
                            {fieldErrors.password}
                        </p>
                    )}
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className={`${btnPrimary} w-full`}
                >
                    {loading ? 'Creating account...' : 'Create Account'}
                </button>
            </form>
            <p className="mt-6 text-sm text-center text-ink-muted">
                Already have an account?{' '}
                <a
                    href="/login"
                    className="text-accent font-medium hover:underline"
                >
                    Sign in
                </a>
            </p>
        </AuthShell>
    );
}
