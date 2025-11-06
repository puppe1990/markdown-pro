
import React from 'react';
import { Version } from '../types';
import { XIcon } from './icons';

interface VersionHistoryPanelProps {
    isOpen: boolean;
    onClose: () => void;
    versions: Version[];
    onRevert: (version: Version) => void;
}

const VersionHistoryPanel: React.FC<VersionHistoryPanelProps> = ({ isOpen, onClose, versions, onRevert }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>

            {/* Panel */}
            <div className="absolute right-0 top-0 h-full w-full max-w-sm bg-white dark:bg-gray-800 shadow-xl flex flex-col">
                <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Version History</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                        <XIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    </button>
                </div>
                <div className="flex-grow overflow-y-auto">
                    {versions.length > 0 ? (
                        <ul>
                            {versions.map((version, index) => (
                                <li key={version.timestamp} className="border-b dark:border-gray-700 p-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            {new Date(version.timestamp).toLocaleString()}
                                        </span>
                                        <button 
                                            onClick={() => onRevert(version)}
                                            className="px-3 py-1 text-xs font-semibold text-white bg-blue-500 rounded-full hover:bg-blue-600 transition"
                                        >
                                            Revert
                                        </button>
                                    </div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                                        {version.content.replace(/#+\s*/, '')}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                            No versions saved yet.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VersionHistoryPanel;
