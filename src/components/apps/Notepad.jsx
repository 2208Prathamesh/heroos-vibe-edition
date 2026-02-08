import React, { useState } from 'react';
import { Save, Copy, File, Download, Share2 } from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import { useFileSystem } from '../../context/FileSystemContext';
import SaveAsModal from '../common/SaveAsModal';

const Notepad = () => {
    const { addFile } = useFileSystem();
    const [content, setContent] = useState('');
    const [showSaveModal, setShowSaveModal] = useState(false);

    // Status metrics
    const lineCount = content.split('\n').length;
    const charCount = content.length;

    const handleSave = (fileName) => {
        const finalName = fileName.endsWith('.txt') ? fileName : `${fileName}.txt`;
        const success = addFile({
            name: finalName,
            type: 'text/plain',
            size: content.length,
            category: 'Documents',
            content: content
        });

        if (success) {
            setShowSaveModal(false);
        } else {
            setShowSaveModal(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(content);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg-color)', fontFamily: 'Segoe UI, sans-serif' }}>
            {/* Toolbar */}
            <div style={{
                padding: '10px 16px',
                background: 'var(--glass-bg)',
                borderBottom: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
            }}>
                <button
                    onClick={() => setContent('')}
                    title="New"
                    className="notepad-btn"
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '6px 10px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', color: 'var(--text-color)', transition: 'background 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--hover-bg)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                    <File size={18} /> New
                </button>
                <div style={{ width: '1px', height: '20px', background: 'var(--border-color)', margin: '0 4px' }} />
                <button
                    onClick={() => setShowSaveModal(true)}
                    title="Save As..."
                    className="notepad-btn"
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '6px 10px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', color: 'var(--text-color)', transition: 'background 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--hover-bg)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                    <Save size={18} /> Save
                </button>
                <div style={{ width: '1px', height: '20px', background: 'var(--border-color)', margin: '0 4px' }} />
                <button
                    onClick={handleCopy}
                    title="Copy All"
                    className="notepad-btn"
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '6px 10px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', color: 'var(--text-color)', transition: 'background 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--hover-bg)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                    <Copy size={18} /> Copy
                </button>
            </div>

            {/* Editor Area */}
            <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                style={{
                    flex: 1,
                    padding: '24px',
                    border: 'none',
                    resize: 'none',
                    fontSize: '16px',
                    fontFamily: 'Consolas, monospace',
                    outline: 'none',
                    background: 'var(--bg-color)',
                    lineHeight: '1.6',
                    color: 'var(--text-color)'
                }}
                placeholder="Start typing..."
                spellCheck={false}
            />

            {/* Status Bar */}
            <div style={{
                padding: '6px 16px',
                background: 'var(--glass-bg)',
                borderTop: '1px solid var(--border-color)',
                fontSize: '12px',
                color: 'var(--text-secondary)',
                display: 'flex',
                justifyContent: 'space-between',
                userSelect: 'none'
            }}>
                <div style={{ display: 'flex', gap: '16px' }}>
                    <span>Ln {lineCount}, Col {content.length - content.lastIndexOf('\n')}</span>
                    <span>{charCount} characters</span>
                </div>
                <span>UTF-8</span>
            </div>

            {/* Save Dialog */}
            {showSaveModal && (
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 100 }}>
                    <SaveAsModal
                        initialName="Untitled.txt"
                        onSave={handleSave}
                        onClose={() => setShowSaveModal(false)}
                    />
                </div>
            )}
        </div>
    );
};

export default Notepad;
