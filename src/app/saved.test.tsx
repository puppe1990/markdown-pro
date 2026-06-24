import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const mockNavigate = vi.fn();

vi.mock('@tanstack/react-router', async (importOriginal) => {
    const actual =
        await importOriginal<typeof import('@tanstack/react-router')>();
    return {
        ...actual,
        useNavigate: () => mockNavigate,
        createFileRoute: actual.createFileRoute,
    };
});

vi.mock('@/src/features/auth/auth-client', () => ({
    useSession: vi.fn(),
}));

vi.mock('@/src/features/tabs/useTabs', () => ({
    useAllTabs: () => ({ data: [], isLoading: false }),
    useOpenTab: () => ({ mutate: vi.fn() }),
    useDeleteTab: () => ({ mutate: vi.fn() }),
}));

import { useSession } from '@/src/features/auth/auth-client';
import { Route } from './saved';

function renderSavedPage() {
    const qc = new QueryClient({
        defaultOptions: { queries: { retry: false } },
    });
    const SavedPage = Route.options.component;
    if (!SavedPage) {
        throw new Error('Saved route component is missing');
    }
    return render(
        <QueryClientProvider client={qc}>
            <SavedPage />
        </QueryClientProvider>,
    );
}

describe('SavedPage', () => {
    beforeEach(() => {
        mockNavigate.mockClear();
    });

    it('redirects to login when there is no session', async () => {
        vi.mocked(useSession).mockReturnValue({
            data: null,
            isPending: false,
        } as ReturnType<typeof useSession>);

        renderSavedPage();

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith({ to: '/login' });
        });
    });
});
