const authErrorMessages: Record<string, string> = {
    INVALID_EMAIL:
        "This email address doesn't look right. Check the format and try again.",
    INVALID_EMAIL_OR_PASSWORD:
        "The email or password you entered doesn't match our records. Please try again.",
    INVALID_PASSWORD:
        "That password doesn't match our records. Please try again.",
    PASSWORD_TOO_SHORT: 'Password must be at least 8 characters long.',
    PASSWORD_TOO_LONG: 'Password is too long. Please use a shorter one.',
    USER_ALREADY_EXISTS:
        'An account with this email already exists. Sign in using the link below.',
    USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL:
        'An account with this email already exists. Sign in using the link below.',
    FAILED_TO_CREATE_USER:
        "We couldn't create your account right now. Please try again in a moment.",
    FAILED_TO_CREATE_SESSION:
        "We couldn't sign you in right now. Please try again.",
    USER_NOT_FOUND:
        'No account found with this email. Sign up using the link below.',
    EMAIL_NOT_VERIFIED:
        "Your email hasn't been verified yet. Check your inbox for the verification link.",
};

export function getAuthErrorMessage(
    code: string | undefined,
    fallbackMessage: string | undefined,
): string {
    if (code && authErrorMessages[code]) {
        return authErrorMessages[code];
    }
    return fallbackMessage ?? 'Something went wrong. Please try again.';
}
