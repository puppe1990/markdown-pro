import React, { useEffect, useState } from 'react';
import { resolveMarkdownImages } from '../services/imageService';

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
        <div className="h-full overflow-y-auto bg-gradient-to-br from-gray-50 via-white to-gray-50/50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950/50">
            <div
                id="preview-content"
                className="prose prose-slate dark:prose-invert max-w-none p-6 md:p-8 prose-headings:font-bold prose-headings:text-gray-900 dark:prose-headings:text-gray-100 prose-h1:text-4xl prose-h2:text-3xl prose-h3:text-2xl prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:leading-8 prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline prose-code:text-pink-600 dark:prose-code:text-pink-400 prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-pre:bg-gray-900 dark:prose-pre:bg-gray-950 prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:bg-blue-50 dark:prose-blockquote:bg-blue-950/20 prose-blockquote:pl-4 prose-blockquote:py-2 prose-blockquote:rounded-r prose-strong:text-gray-900 dark:prose-strong:text-gray-100"
                dangerouslySetInnerHTML={{ __html: renderedHtml }}
            />
        </div>
    );
};

export default Preview;
