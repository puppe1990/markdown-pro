import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import { useSession } from '@/src/features/auth/auth-client';

export const Route = createFileRoute('/')({
    component: IndexPage,
});

function IndexPage() {
    const navigate = useNavigate();
    const { data: session, isPending } = useSession();

    useEffect(() => {
        if (isPending) return;
        navigate({ to: session ? '/dashboard' : '/login' });
    }, [session, isPending, navigate]);

    return null;
}
