
import React, { useEffect, useState } from 'react';

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
            const rawHtml = window.marked.parse(markdown);
            const sanitizedHtml = window.DOMPurify.sanitize(rawHtml);
            setRenderedHtml(sanitizedHtml);
        }
    }, [markdown]);

    return (
        <div className="h-full overflow-y-auto bg-gray-50 dark:bg-gray-800">
            <div
                id="preview-content"
                className="prose dark:prose-invert max-w-none p-4 md:p-6"
                dangerouslySetInnerHTML={{ __html: renderedHtml }}
            />
        </div>
    );
};

export default Preview;
