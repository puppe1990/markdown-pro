import React from 'react';
import { Version } from '../types';
import { XIcon, ClockIcon } from './icons';

interface VersionHistoryPanelProps {
    isOpen: boolean;
    onClose: () => void;
    versions: Version[];
    onRevert: (version: Version) => void;
}

const VersionHistoryPanel: React.FC<VersionHistoryPanelProps> = ({
    isOpen,
    onClose,
    versions,
    onRevert,
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={onClose}
            ></div>

            {/* Panel */}
            <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl shadow-2xl flex flex-col border-l border-gray-200/50 dark:border-gray-700/50 animate-in slide-in-from-right duration-300">
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200/60 dark:border-gray-700/60 bg-gradient-to-r from-gray-50/50 to-white dark:from-gray-800/50 dark:to-gray-900">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                        Version History
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 hover:scale-110 active:scale-95 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                    >
                        <XIcon className="w-5 h-5" />
                    </button>
                </div>
                <div className="flex-grow overflow-y-auto">
                    {versions.length > 0 ? (
                        <ul className="divide-y divide-gray-200/60 dark:divide-gray-700/60">
                            {versions.map((version) => (
                                <li
                                    key={version.timestamp}
                                    className="p-5 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors duration-150"
                                >
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                            {new Date(
                                                version.timestamp,
                                            ).toLocaleString()}
                                        </span>
                                        <button
                                            onClick={() => onRevert(version)}
                                            className="px-4 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 active:scale-95"
                                        >
                                            Revert
                                        </button>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
                                        {version.content.replace(/#+\s*/, '')}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="p-12 text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                                <ClockIcon className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                            </div>
                            <p className="text-gray-500 dark:text-gray-400 font-medium">
                                No versions saved yet.
                            </p>
                            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                                Your document history will appear here.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VersionHistoryPanel;
