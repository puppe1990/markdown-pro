import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginPage } from './login';
import { useNavigate } from '@tanstack/react-router';
import { signIn, useSession } from '@/src/features/auth/auth-client';

type MockSignInResult = { error: { code?: string } | null };

vi.mock('@tanstack/react-router', async (importOriginal) => {
    const actual =
        await importOriginal<typeof import('@tanstack/react-router')>();
    return {
        ...actual,
        useNavigate: vi.fn(),
    };
});

vi.mock('@/src/features/auth/auth-client', async (importOriginal) => {
    const actual =
        await importOriginal<
            typeof import('@/src/features/auth/auth-client')
        >();
    return {
        ...actual,
        signIn: {
            email: vi.fn(),
        },
        useSession: vi.fn(),
    };
});

describe('LoginPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders the sign in form', () => {
        vi.mocked(useNavigate).mockReturnValue(vi.fn());
        vi.mocked(useSession).mockReturnValue({
            data: null,
            isPending: false,
            isRefetching: false,
            error: null,
            refetch: () => {},
        } as unknown as ReturnType<typeof useSession>);

        const { container } = render(<LoginPage />);
        expect(screen.getByText('Markdown Pro')).toBeInTheDocument();
        expect(container.querySelector('input[type="email"]')).toBeTruthy();
        expect(container.querySelector('input[type="password"]')).toBeTruthy();
        expect(
            screen.getByRole('button', { name: /sign in/i }),
        ).toBeInTheDocument();
    });

    it('shows field validation errors and keeps fields when submitting empty', async () => {
        const navigate = vi.fn();
        vi.mocked(useNavigate).mockReturnValue(navigate);
        vi.mocked(useSession).mockReturnValue({
            data: null,
            isPending: false,
            isRefetching: false,
            error: null,
            refetch: () => {},
        } as unknown as ReturnType<typeof useSession>);

        const { container } = render(<LoginPage />);
        const submit = screen.getByRole('button', { name: /sign in/i });
        await userEvent.click(submit);

        expect(
            screen.getByText(/please enter your email address/i),
        ).toBeInTheDocument();
        expect(
            screen.getByText(/please enter your password/i),
        ).toBeInTheDocument();
        expect(navigate).not.toHaveBeenCalled();
        // fields still present (empty)
        expect(container.querySelector('input[type="email"]')).toBeTruthy();
    });

    it('shows auth error banner on signin failure and does not navigate', async () => {
        const navigate = vi.fn();
        vi.mocked(useNavigate).mockReturnValue(navigate);
        vi.mocked(useSession).mockReturnValue({
            data: null,
            isPending: false,
            isRefetching: false,
            error: null,
            refetch: () => {},
        } as unknown as ReturnType<typeof useSession>);
        const signInEmail = vi.mocked(signIn.email);
        signInEmail.mockResolvedValue({
            error: { code: 'INVALID_EMAIL_OR_PASSWORD' },
        } as MockSignInResult);

        const { container } = render(<LoginPage />);
        const emailInput = container.querySelector(
            'input[type="email"]',
        )! as HTMLInputElement;
        const passwordInput = container.querySelector(
            'input[type="password"]',
        )! as HTMLInputElement;
        await userEvent.type(emailInput, 'user@example.com');
        await userEvent.type(passwordInput, 'wrongpass');

        await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

        await waitFor(() => {
            expect(
                screen.getByText(
                    /email or password you entered doesn't match/i,
                ),
            ).toBeInTheDocument();
        });
        expect(navigate).not.toHaveBeenCalled();
        // fields retain their values after error (no auto clear)
        expect(emailInput.value).toBe('user@example.com');
        expect(passwordInput.value).toBe('wrongpass');
    });

    it('redirects to dashboard if already has session on mount', async () => {
        const navigate = vi.fn();
        vi.mocked(useNavigate).mockReturnValue(navigate);
        vi.mocked(useSession).mockReturnValue({
            data: { user: { email: 'already@logged.in' } },
            isPending: false,
            isRefetching: false,
            error: null,
            refetch: () => {},
        } as unknown as ReturnType<typeof useSession>);

        render(<LoginPage />);

        await waitFor(() => {
            expect(navigate).toHaveBeenCalledWith({ to: '/dashboard' });
        });
    });

    it('does not navigate immediately on sign-in success when session is still null (post-logout first login regression)', async () => {
        const navigate = vi.fn();
        vi.mocked(useNavigate).mockReturnValue(navigate);

        let sessionValue: {
            user?: { id?: string; email?: string };
            session?: { id?: string };
        } | null = null;
        vi.mocked(useSession).mockImplementation(
            () =>
                ({
                    data: sessionValue,
                    isPending: false,
                    isRefetching: false,
                    error: null,
                    refetch: () => {},
                }) as unknown as ReturnType<typeof useSession>,
        );

        const signInEmail = vi.mocked(signIn.email);
        signInEmail.mockResolvedValue({ error: null } as MockSignInResult);

        const { container, rerender } = render(<LoginPage />);

        const emailInput = container.querySelector(
            'input[type="email"]',
        )! as HTMLInputElement;
        const passwordInput = container.querySelector(
            'input[type="password"]',
        )! as HTMLInputElement;
        await userEvent.type(emailInput, 'user@example.com');
        await userEvent.type(passwordInput, 'password123');

        const submitBtn = screen.getByRole('button', { name: /sign in/i });
        await userEvent.click(submitBtn);

        await waitFor(() => {
            expect(signInEmail).toHaveBeenCalledWith({
                email: 'user@example.com',
                password: 'password123',
            });
        });

        // Critical for the bug: with stale null session (common right after logout),
        // we must NOT navigate yet. Immediate nav would cause dashboard guard to
        // bounce back to /login (remount -> fields disappear, no error shown).
        expect(navigate).not.toHaveBeenCalled();

        // Simulate the async session update that better-auth performs after
        // sign-in success (via $sessionSignal timeout + /get-session).
        sessionValue = {
            user: { id: 'u1', email: 'user@example.com' },
            session: { id: 'sess-1' },
        };
        rerender(<LoginPage />);

        await waitFor(() => {
            expect(navigate).toHaveBeenCalledWith({ to: '/dashboard' });
        });
    });
});
