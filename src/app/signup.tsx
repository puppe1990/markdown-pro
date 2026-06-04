import { createFileRoute } from '@tanstack/react-router';
import { SignupPage } from '@/src/features/auth/signup-page';

export const Route = createFileRoute('/signup')({
    component: SignupPage,
});
