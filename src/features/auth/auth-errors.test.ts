import { describe, it, expect } from 'vitest';
import { getAuthErrorMessage } from './auth-errors';

describe('getAuthErrorMessage', () => {
    it('returns generic fallback when error is undefined', () => {
        expect(getAuthErrorMessage(undefined)).toBe(
            'Something went wrong. Please try again.',
        );
    });

    it('returns network message when name is TypeError', () => {
        expect(getAuthErrorMessage({ name: 'TypeError' })).toBe(
            "We couldn't reach the server. Please check your internet connection and try again.",
        );
    });

    it('returns network message when message contains fetch', () => {
        expect(getAuthErrorMessage({ message: 'Failed to fetch' })).toBe(
            "We couldn't reach the server. Please check your internet connection and try again.",
        );
    });

    it('returns network message when message contains network', () => {
        expect(getAuthErrorMessage({ message: 'Network request failed' })).toBe(
            "We couldn't reach the server. Please check your internet connection and try again.",
        );
    });

    it('returns network message when message contains offline', () => {
        expect(getAuthErrorMessage({ message: 'You are offline' })).toBe(
            "We couldn't reach the server. Please check your internet connection and try again.",
        );
    });

    it('returns network message when status is 0', () => {
        expect(getAuthErrorMessage({ status: 0 })).toBe(
            "We couldn't reach the server. Please check your internet connection and try again.",
        );
    });

    it('returns mapped message for known auth code INVALID_EMAIL_OR_PASSWORD', () => {
        expect(getAuthErrorMessage({ code: 'INVALID_EMAIL_OR_PASSWORD' })).toBe(
            "The email or password you entered doesn't match our records. Please try again.",
        );
    });

    it('returns mapped message for known auth code EMAIL_NOT_VERIFIED', () => {
        expect(getAuthErrorMessage({ code: 'EMAIL_NOT_VERIFIED' })).toBe(
            "Your email hasn't been verified yet. Check your inbox for the verification link.",
        );
    });

    it('returns mapped message for known auth code USER_ALREADY_EXISTS', () => {
        expect(getAuthErrorMessage({ code: 'USER_ALREADY_EXISTS' })).toBe(
            'An account with this email already exists. Sign in using the link below.',
        );
    });

    it('falls through to HTTP status when auth code is unknown', () => {
        expect(getAuthErrorMessage({ code: 'UNKNOWN_CODE', status: 429 })).toBe(
            'Too many attempts. Please wait a moment and try again.',
        );
    });

    it('returns mapped message for HTTP 401', () => {
        expect(getAuthErrorMessage({ status: 401 })).toBe(
            'Your session may have expired. Please sign in again.',
        );
    });

    it('returns mapped message for HTTP 500', () => {
        expect(getAuthErrorMessage({ status: 500 })).toBe(
            "Something went wrong on our end. We're looking into it. Please try again shortly.",
        );
    });

    it('returns mapped message for HTTP 503', () => {
        expect(getAuthErrorMessage({ status: 503 })).toBe(
            'The service is temporarily unavailable. Please try again shortly.',
        );
    });

    it('falls through to custom message when status is unknown', () => {
        expect(
            getAuthErrorMessage({ status: 418, message: 'Custom error' }),
        ).toBe('Custom error');
    });

    it('returns custom message when it is not HTTPError or FetchError', () => {
        expect(getAuthErrorMessage({ message: 'Account is locked' })).toBe(
            'Account is locked',
        );
    });

    it('returns generic fallback when message is HTTPError', () => {
        expect(getAuthErrorMessage({ message: 'HTTPError' })).toBe(
            'Something went wrong. Please try again.',
        );
    });

    it('returns network message when message starts with FetchError', () => {
        expect(getAuthErrorMessage({ message: 'FetchError: timeout' })).toBe(
            "We couldn't reach the server. Please check your internet connection and try again.",
        );
    });

    it('returns generic fallback when message is empty string', () => {
        expect(getAuthErrorMessage({ message: '' })).toBe(
            'Something went wrong. Please try again.',
        );
    });

    it('prefers auth code over HTTP status when both are present', () => {
        expect(
            getAuthErrorMessage({
                code: 'INVALID_EMAIL_OR_PASSWORD',
                status: 401,
            }),
        ).toBe(
            "The email or password you entered doesn't match our records. Please try again.",
        );
    });

    it('prefers network detection over auth code', () => {
        expect(
            getAuthErrorMessage({
                name: 'TypeError',
                code: 'INVALID_EMAIL',
            }),
        ).toBe(
            "We couldn't reach the server. Please check your internet connection and try again.",
        );
    });
});
