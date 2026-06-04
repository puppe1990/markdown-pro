interface AuthError {
    code?: string;
    message?: string;
    status?: number;
    statusText?: string;
    name?: string;
}

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

const httpStatusMessages: Record<number, string> = {
    400: 'Something in your request looks off. Please check and try again.',
    401: 'Your session may have expired. Please sign in again.',
    403: "You don't have permission to do this.",
    404: "We couldn't find what you were looking for.",
    408: 'The request took too long. Please check your connection and try again.',
    429: 'Too many attempts. Please wait a moment and try again.',
    500: "Something went wrong on our end. We're looking into it. Please try again shortly.",
    502: 'Our server is having trouble. Please try again in a few moments.',
    503: 'The service is temporarily unavailable. Please try again shortly.',
};

function isNetworkError(err: AuthError): boolean {
    return (
        err.name === 'TypeError' ||
        err.message?.toLowerCase().includes('fetch') ||
        err.message?.toLowerCase().includes('network') ||
        err.message?.toLowerCase().includes('offline') ||
        err.status === 0
    );
}

export function getAuthErrorMessage(error: AuthError | undefined): string {
    if (!error) {
        return 'Something went wrong. Please try again.';
    }

    if (isNetworkError(error)) {
        return "We couldn't reach the server. Please check your internet connection and try again.";
    }

    if (error.code && authErrorMessages[error.code]) {
        return authErrorMessages[error.code];
    }

    if (error.status && httpStatusMessages[error.status]) {
        return httpStatusMessages[error.status];
    }

    if (
        error.message &&
        error.message !== 'HTTPError' &&
        !error.message.startsWith('FetchError')
    ) {
        return error.message;
    }

    return 'Something went wrong. Please try again.';
}
