import React, { useState, useRef, useEffect } from 'react';
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, Save, Download, FileText, ChevronDown, List, Type, Undo, Redo } from 'lucide-react';
import { useFileSystem } from '../../context/FileSystemContext';
import SaveAsModal from '../common/SaveAsModal';

const ToolbarButton = ({ icon: Icon, active, onClick, title }) => (
    <button
        onClick={onClick}
        title={title}
        style={{
            background: active ? '#cce8ff' : 'transparent',
            border: '1px solid',
            borderColor: active ? '#99d1ff' : 'transparent',
            cursor: 'pointer',
            padding: '4px',
            borderRadius: '2px',
            color: active ? '#0078d4' : '#444',
            display: 'flex', alignItems: 'center', justifyItems: 'center',
            minWidth: '24px', minHeight: '24px'
        }}
    >
        <Icon size={16} />
    </button>
);

const Word = () => {
    const { addFile } = useFileSystem();
    const [content, setContent] = useState(''); // Stores HTML
    const [fileName, setFileName] = useState('Document1');
    const [showSaveModal, setShowSaveModal] = useState(false);

    const editorRef = useRef(null);

    // Editor state tracking
    const [isBold, setIsBold] = useState(false);
    const [isItalic, setIsItalic] = useState(false);
    const [isUnderline, setIsUnderline] = useState(false);
    const [align, setAlign] = useState('left');

    const checkState = () => {
        setIsBold(document.queryCommandState('bold'));
        setIsItalic(document.queryCommandState('italic'));
        setIsUnderline(document.queryCommandState('underline'));
        if (document.queryCommandState('justifyCenter')) setAlign('center');
        else if (document.queryCommandState('justifyRight')) setAlign('right');
        else setAlign('left');
    };

    const execCmd = (cmd, val = null) => {
        document.execCommand(cmd, false, val);
        editorRef.current.focus();
        checkState();
    };

    const handleSave = (name) => {
        const finalName = name.endsWith('.docx') ? name : `${name}.docx`;
        setFileName(finalName.replace('.docx', '')); // Update internal name

        // Save HTML content wrapped in a basic structure
        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head><style>body { font-family: Calibri, sans-serif; font-size: 11pt; }</style></head>
            <body>${editorRef.current.innerHTML}</body>
            </html>
        `;

        const success = addFile({
            name: finalName,
            type: 'application/msword', // MIME type for doc
            size: htmlContent.length,
            category: 'Documents',
            content: htmlContent
        });

        if (success) setShowSaveModal(false);
        else setShowSaveModal(false); // Close anyway
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#f3f2f1', fontFamily: 'Segoe UI, sans-serif' }}>
            {/* Title Bar - Integrated with Window typically, but adding extra branding here */}
            {/* Ribbon Tabs */}
            <div style={{ background: '#2b579a', color: 'white', display: 'flex', alignItems: 'center', padding: '0 12px', height: '40px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginRight: '24px' }}>
                    <FileText size={20} />
                    <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>AutoSave On</span>
                </div>
                <div style={{ display: 'flex', gap: '4px', height: '100%' }}>
                    <div style={{ padding: '0 12px', display: 'flex', alignItems: 'center', background: '#f3f2f1', color: '#2b579a', borderRadius: '4px 4px 0 0', marginTop: '8px', fontSize: '0.85rem', cursor: 'pointer' }}>Home</div>
                    <div style={{ padding: '0 12px', display: 'flex', alignItems: 'center', color: 'white', marginTop: '8px', fontSize: '0.85rem', cursor: 'pointer', opacity: 0.9 }}>Insert</div>
                    <div style={{ padding: '0 12px', display: 'flex', alignItems: 'center', color: 'white', marginTop: '8px', fontSize: '0.85rem', cursor: 'pointer', opacity: 0.9 }}>Layout</div>
                    <div style={{ padding: '0 12px', display: 'flex', alignItems: 'center', color: 'white', marginTop: '8px', fontSize: '0.85rem', cursor: 'pointer', opacity: 0.9 }}>References</div>
                </div>
                <div style={{ marginLeft: 'auto', fontSize: '0.85rem', opacity: 0.8 }}>{fileName}</div>
            </div>

            {/* Ribbon Toolbar */}
            <div style={{ background: '#fff', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '16px', borderBottom: '1px solid #e0e0e0', height: '100px' }}>
                {/* Clipboard */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                    <ToolbarButton icon={Save} onClick={() => setShowSaveModal(true)} title="Save" />
                    <span style={{ fontSize: '0.75rem', color: '#666' }}>Save</span>
                </div>
                <div style={{ width: '1px', height: '60px', background: '#e0e0e0' }} />

                {/* Font Group */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', gap: '4px' }}>
                        <select onChange={(e) => execCmd('fontName', e.target.value)} style={{ width: '120px', padding: '2px', fontSize: '0.8rem', border: '1px solid #ccc' }}>
                            <option value="Calibri">Calibri</option>
                            <option value="Arial">Arial</option>
                            <option value="Times New Roman">Times New Roman</option>
                        </select>
                        <select onChange={(e) => execCmd('fontSize', e.target.value)} style={{ width: '50px', padding: '2px', fontSize: '0.8rem', border: '1px solid #ccc' }}>
                            <option value="3">11</option>
                            <option value="4">14</option>
                            <option value="5">18</option>
                            <option value="6">24</option>
                            <option value="7">36</option>
                        </select>
                    </div>
                    <div style={{ display: 'flex', gap: '2px' }}>
                        <ToolbarButton icon={Bold} active={isBold} onClick={() => execCmd('bold')} title="Bold" />
                        <ToolbarButton icon={Italic} active={isItalic} onClick={() => execCmd('italic')} title="Italic" />
                        <ToolbarButton icon={Underline} active={isUnderline} onClick={() => execCmd('underline')} title="Underline" />
                    </div>
                </div>
                <div style={{ width: '1px', height: '60px', background: '#e0e0e0' }} />

                {/* Paragraph Group */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', gap: '2px' }}>
                        <ToolbarButton icon={List} onClick={() => execCmd('insertUnorderedList')} title="Bullets" />
                    </div>
                    <div style={{ display: 'flex', gap: '2px' }}>
                        <ToolbarButton icon={AlignLeft} active={align === 'left'} onClick={() => execCmd('justifyLeft')} title="Align Left" />
                        <ToolbarButton icon={AlignCenter} active={align === 'center'} onClick={() => execCmd('justifyCenter')} title="Align Center" />
                        <ToolbarButton icon={AlignRight} active={align === 'right'} onClick={() => execCmd('justifyRight')} title="Align Right" />
                    </div>
                </div>
            </div>

            {/* Document Area */}
            <div style={{ flex: 1, overflow: 'auto', background: '#f3f2f1', display: 'flex', justifyContent: 'center', padding: '30px' }} onClick={() => editorRef.current?.focus()}>
                <div
                    style={{
                        width: '816px', // A4 width approx (96dpi)
                        minHeight: '1056px', // A4 height
                        background: 'white',
                        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                        padding: '10%', // Margins
                        cursor: 'text',
                        outline: 'none'
                    }}
                >
                    <div
                        ref={editorRef}
                        contentEditable
                        onKeyUp={checkState}
                        onMouseUp={checkState}
                        style={{
                            width: '100%',
                            height: '100%',
                            outline: 'none',
                            fontFamily: 'Calibri, sans-serif',
                            fontSize: '11pt',
                            lineHeight: '1.5',
                            color: '#000'
                        }}
                        dangerouslySetInnerHTML={{ __html: '<p>Start writing your document here...</p>' }}
                    />
                </div>
            </div>

            {/* Status Bar */}
            <div style={{ background: '#2b579a', color: 'white', padding: '2px 12px', fontSize: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '16px' }}>
                    <span>Page 1 of 1</span>
                    <span>English (US)</span>
                </div>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <span>100%</span>
                </div>
            </div>

            {/* Save Modal */}
            {showSaveModal && (
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 100 }}>
                    <SaveAsModal
                        initialName={`${fileName}.docx`}
                        onSave={handleSave}
                        onClose={() => setShowSaveModal(false)}
                    />
                </div>
            )}
        </div>
    );
};

export default Word;
