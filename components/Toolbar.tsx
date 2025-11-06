import React, { useRef } from 'react';
import { BoldIcon, ItalicIcon, LinkIcon, ListIcon, CodeIcon, QuoteIcon, ImageIcon } from './icons';
import { addImage } from '../services/imageService';

interface ToolbarProps {
    textareaRef: React.RefObject<HTMLTextAreaElement>;
    setMarkdown: (value: string) => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ textareaRef, setMarkdown }) => {
    const imageInputRef = useRef<HTMLInputElement>(null);

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

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert('Please select a valid image file.');
            return;
        }

        try {
            const imageId = await addImage(file);
            const textarea = textareaRef.current;
            if (!textarea) return;

            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const selectedText = textarea.value.substring(start, end);
            const altText = selectedText || file.name;
            const imageMarkdown = `![${altText}](${imageId})`;
            
            const updatedValue = textarea.value.substring(0, start) + imageMarkdown + textarea.value.substring(end);
            setMarkdown(updatedValue);
            
            textarea.focus();
            setTimeout(() => {
                textarea.setSelectionRange(start + imageMarkdown.length, start + imageMarkdown.length);
            }, 0);

        } catch (error) {
            console.error('Failed to upload image:', error);
            alert('An error occurred while uploading the image.');
        } finally {
             // Reset file input to allow selecting the same file again
            if (event.target) {
                event.target.value = '';
            }
        }
    };

    const buttons = [
        { type: 'format', format: 'bold', icon: <BoldIcon className="w-5 h-5"/>, title: 'Bold' },
        { type: 'format', format: 'italic', icon: <ItalicIcon className="w-5 h-5"/>, title: 'Italic' },
        { type: 'format', format: 'quote', icon: <QuoteIcon className="w-5 h-5"/>, title: 'Blockquote' },
        { type: 'format', format: 'link', icon: <LinkIcon className="w-5 h-5"/>, title: 'Link' },
        { type: 'format', format: 'list', icon: <ListIcon className="w-5 h-5"/>, title: 'Unordered List' },
        { type: 'format', format: 'code', icon: <CodeIcon className="w-5 h-5"/>, title: 'Code' },
        { type: 'action', action: 'image', icon: <ImageIcon className="w-5 h-5"/>, title: 'Upload Image' },
    ] as const;


    return (
        <div className="flex items-center p-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 space-x-1">
            {buttons.map(btn => (
                <button
                    key={btn.title}
                    onClick={() => {
                        if (btn.type === 'format') {
                            applyFormat(btn.format);
                        } else if (btn.action === 'image') {
                            imageInputRef.current?.click();
                        }
                    }}
                    className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
                    title={btn.title}
                >
                    {btn.icon}
                </button>
            ))}
             <input
                type="file"
                ref={imageInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
                aria-hidden="true"
            />
        </div>
    );
};

export default Toolbar;