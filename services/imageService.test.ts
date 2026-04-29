import { describe, it, expect, beforeEach, vi } from 'vitest';
import { resolveMarkdownImages } from './imageService';

const IMAGE_STORAGE_KEY = 'markdown-images';

const mockImageStore: Record<string, string> = {
    'image-ref://test-image-1': 'data:image/png;base64,mockbase64image1',
    'image-ref://test-image-2': 'data:image/png;base64,mockbase64image2',
};

vi.stubGlobal('localStorage', {
    getItem: vi.fn((key: string) => {
        if (key === IMAGE_STORAGE_KEY) {
            return JSON.stringify(mockImageStore);
        }
        return null;
    }),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
});

describe('imageService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('resolveMarkdownImages', () => {
        it('should resolve image references to data URLs', () => {
            const markdown = '![Alt text](image-ref://test-image-1)';
            const resolved = resolveMarkdownImages(markdown);
            expect(resolved).toBe(
                '![Alt text](data:image/png;base64,mockbase64image1)',
            );
        });

        it('should resolve multiple image references', () => {
            const markdown =
                '![Image 1](image-ref://test-image-1) and ![Image 2](image-ref://test-image-2)';
            const resolved = resolveMarkdownImages(markdown);
            expect(resolved).toContain(
                'data:image/png;base64,mockbase64image1',
            );
            expect(resolved).toContain(
                'data:image/png;base64,mockbase64image2',
            );
        });

        it('should return original markdown if no image references', () => {
            const markdown = 'This is plain text with no images.';
            const resolved = resolveMarkdownImages(markdown);
            expect(resolved).toBe(markdown);
        });

        it('should leave unresolved references unchanged', () => {
            const markdown = '![Unknown image](image-ref://non-existent)';
            const resolved = resolveMarkdownImages(markdown);
            expect(resolved).toBe(markdown);
        });

        it('should handle markdown with text before and after images', () => {
            const markdown =
                'Before image ![Alt text](image-ref://test-image-1) After image';
            const resolved = resolveMarkdownImages(markdown);
            expect(resolved).toBe(
                'Before image ![Alt text](data:image/png;base64,mockbase64image1) After image',
            );
        });

        it('should handle empty string', () => {
            const markdown = '';
            const resolved = resolveMarkdownImages(markdown);
            expect(resolved).toBe('');
        });

        it('should handle images with special characters in alt text', () => {
            const markdown =
                '![Image with (parentheses)](image-ref://test-image-1)';
            const resolved = resolveMarkdownImages(markdown);
            expect(resolved).toBe(
                '![Image with (parentheses)](data:image/png;base64,mockbase64image1)',
            );
        });
    });
});
