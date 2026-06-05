import React, { useEffect, useState } from 'react';
import { resolveMarkdownImages } from '../services/imageService';
import { previewPane, prosePreview } from '@/src/lib/ui-classes';

// TypeScript declarations for libraries loaded from CDN
declare global {
    interface Window {
        marked: {
            parse: (markdown: string) => string;
        };
        DOMPurify: {
            sanitize: (html: string) => string;
        };
    }
}

interface PreviewProps {
    markdown: string;
}

const Preview: React.FC<PreviewProps> = ({ markdown }) => {
    const [renderedHtml, setRenderedHtml] = useState('');

    useEffect(() => {
        if (window.marked && window.DOMPurify) {
            const resolvedMarkdown = resolveMarkdownImages(markdown);
            const rawHtml = window.marked.parse(resolvedMarkdown);
            const sanitizedHtml = window.DOMPurify.sanitize(rawHtml);
            setRenderedHtml(sanitizedHtml);
        }
    }, [markdown]);

    return (
        <div className={previewPane}>
            <div
                id="preview-content"
                className={prosePreview}
                dangerouslySetInnerHTML={{ __html: renderedHtml }}
            />
        </div>
    );
};

export default Preview;
