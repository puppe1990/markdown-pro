
import React from 'react';
import { BoldIcon, ItalicIcon, LinkIcon, ListIcon, CodeIcon, QuoteIcon } from './icons';

interface ToolbarProps {
    textareaRef: React.RefObject<HTMLTextAreaElement>;
    setMarkdown: (value: string) => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ textareaRef, setMarkdown }) => {
    const applyFormat = (format: 'bold' | 'italic' | 'link' | 'list' | 'code' | 'quote') => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = textarea.value.substring(start, end);
        let newText = '';

        switch (format) {
            case 'bold':
                newText = `**${selectedText}**`;
                break;
            case 'italic':
                newText = `*${selectedText}*`;
                break;
            case 'code':
                newText = `\`${selectedText}\``;
                break;
            case 'link':
                newText = `[${selectedText}](url)`;
                break;
            case 'quote':
                newText = `> ${selectedText}`;
                break;
            case 'list':
                newText = `- ${selectedText}`;
                break;
        }

        const updatedValue = textarea.value.substring(0, start) + newText + textarea.value.substring(end);
        setMarkdown(updatedValue);

        textarea.focus();
        // Adjust cursor position after insertion
        setTimeout(() => {
            if (format === 'link') {
                textarea.setSelectionRange(start + newText.length - 4, start + newText.length - 1);
            } else {
                textarea.setSelectionRange(start + newText.length, start + newText.length);
            }
        }, 0);
    };

    const buttons = [
        { format: 'bold', icon: <BoldIcon className="w-5 h-5"/>, title: 'Bold' },
        { format: 'italic', icon: <ItalicIcon className="w-5 h-5"/>, title: 'Italic' },
        { format: 'quote', icon: <QuoteIcon className="w-5 h-5"/>, title: 'Blockquote' },
        { format: 'link', icon: <LinkIcon className="w-5 h-5"/>, title: 'Link' },
        { format: 'list', icon: <ListIcon className="w-5 h-5"/>, title: 'Unordered List' },
        { format: 'code', icon: <CodeIcon className="w-5 h-5"/>, title: 'Code' },
    ] as const;

    return (
        <div className="flex items-center p-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 space-x-1">
            {buttons.map(btn => (
                <button
                    key={btn.format}
                    onClick={() => applyFormat(btn.format)}
                    className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
                    title={btn.title}
                >
                    {btn.icon}
                </button>
            ))}
        </div>
    );
};

export default Toolbar;
