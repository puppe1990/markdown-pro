
import React, { useRef } from 'react';
import Toolbar from './Toolbar';

interface EditorProps {
    value: string;
    onChange: (value: string) => void;
}

const Editor: React.FC<EditorProps> = ({ value, onChange }) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    return (
        <div className="flex flex-col h-full bg-white dark:bg-gray-900">
            <Toolbar textareaRef={textareaRef} setMarkdown={onChange} />
            <textarea
                ref={textareaRef}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="flex-grow p-4 md:p-6 w-full h-full resize-none focus:outline-none bg-transparent text-gray-800 dark:text-gray-200 font-mono text-sm leading-relaxed"
                placeholder="Start writing your markdown here..."
                spellCheck="false"
            />
        </div>
    );
};

export default Editor;
