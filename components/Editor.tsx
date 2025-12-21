
import React, { useRef } from 'react';
import Toolbar from './Toolbar';

interface EditorProps {
    value: string;
    onChange: (value: string) => void;
}

const Editor: React.FC<EditorProps> = ({ value, onChange }) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    return (
        <div className="flex flex-col h-full bg-gradient-to-br from-gray-50 via-white to-gray-50/50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950/50">
            <Toolbar textareaRef={textareaRef} setMarkdown={onChange} />
            <div className="flex-grow relative">
                <textarea
                    ref={textareaRef}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="absolute inset-0 p-6 md:p-8 w-full h-full resize-none focus:outline-none bg-transparent text-gray-800 dark:text-gray-200 font-mono text-[15px] leading-7 placeholder:text-gray-400 dark:placeholder:text-gray-500 selection:bg-blue-200 dark:selection:bg-blue-900/50"
                    placeholder="Start writing your markdown here..."
                    spellCheck="false"
                />
            </div>
        </div>
    );
};

export default Editor;
