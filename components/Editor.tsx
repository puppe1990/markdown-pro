import React, { useEffect, useRef, useState } from 'react';
import Toolbar from './Toolbar';
import { addImage } from '../services/imageService';

interface EditorProps {
    value: string;
    onChange: (value: string) => void;
}

const Editor: React.FC<EditorProps> = ({ value, onChange }) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [isDragOver, setIsDragOver] = useState(false);

    useEffect(() => {
        textareaRef.current?.focus();
    }, []);

    const insertImageFiles = async (files: File[]) => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const imageFiles = files.filter((file) =>
            file.type.startsWith('image/'),
        );
        if (imageFiles.length === 0) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = textarea.value.substring(start, end);

        try {
            const imageMarkdowns = await Promise.all(
                imageFiles.map(async (file, index) => {
                    const imageId = await addImage(file);
                    const altText =
                        imageFiles.length === 1 && selectedText
                            ? selectedText
                            : file.name;
                    return `![${altText || `image-${index + 1}`}](${imageId})`;
                }),
            );

            const imagesBlock = imageMarkdowns.join('\n');
            const updatedValue = `${textarea.value.substring(0, start)}${imagesBlock}${textarea.value.substring(end)}`;
            onChange(updatedValue);

            textarea.focus();
            setTimeout(() => {
                const nextCursor = start + imagesBlock.length;
                textarea.setSelectionRange(nextCursor, nextCursor);
            }, 0);
        } catch (error) {
            console.error('Failed to process dropped/pasted image:', error);
            alert('An error occurred while adding the image.');
        }
    };

    const handleDrop = async (event: React.DragEvent<HTMLTextAreaElement>) => {
        event.preventDefault();
        setIsDragOver(false);
        const files = Array.from(event.dataTransfer.files || []);
        await insertImageFiles(files);
    };

    const handlePaste = async (
        event: React.ClipboardEvent<HTMLTextAreaElement>,
    ) => {
        const files = Array.from(event.clipboardData.files || []).filter(
            (file) => file.type.startsWith('image/'),
        );
        if (files.length === 0) return;

        event.preventDefault();
        await insertImageFiles(files);
    };

    return (
        <div className="flex flex-col h-full bg-gradient-to-br from-gray-50 via-white to-gray-50/50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950/50">
            <Toolbar textareaRef={textareaRef} setMarkdown={onChange} />
            <div className="flex-grow relative">
                <textarea
                    ref={textareaRef}
                    autoFocus
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onDragOver={(event) => {
                        event.preventDefault();
                        event.dataTransfer.dropEffect = 'copy';
                    }}
                    onDragEnter={(event) => {
                        event.preventDefault();
                        setIsDragOver(true);
                    }}
                    onDragLeave={() => setIsDragOver(false)}
                    onDrop={handleDrop}
                    onPaste={handlePaste}
                    className={`absolute inset-0 p-6 md:p-8 w-full h-full resize-none focus:outline-none bg-transparent text-gray-800 dark:text-gray-200 font-mono text-[15px] leading-7 placeholder:text-gray-400 dark:placeholder:text-gray-500 selection:bg-blue-200 dark:selection:bg-blue-900/50 transition-colors ${
                        isDragOver ? 'bg-blue-50/70 dark:bg-blue-950/25' : ''
                    }`}
                    placeholder="Start writing your markdown here..."
                    spellCheck="false"
                />
            </div>
        </div>
    );
};

export default Editor;
