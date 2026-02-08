import React, { useState } from 'react';
import { Save, Download, Plus, Trash2, FileSpreadsheet, AlignLeft, AlignCenter, AlignRight, Bold, Italic, ChevronDown } from 'lucide-react';
import { useFileSystem } from '../../context/FileSystemContext';
import SaveAsModal from '../common/SaveAsModal';

const toolbarBtn = {
    background: 'transparent',
    border: 'none',
    color: 'white',
    padding: '6px',
    borderRadius: '4px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    placeItems: 'center', // Fix for center alignment
    opacity: 0.9,
    transition: 'background 0.2s',
    minWidth: '28px',
    minHeight: '28px',
    justifyContent: 'center'
};

const formatBtn = {
    background: 'transparent',
    border: 'none',
    color: '#444',
    padding: '4px', // Smaller padding
    borderRadius: '2px', // Square-ish
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '24px',
    minHeight: '24px'
};

const sepStyle = { width: '1px', height: '20px', background: '#e0e0e0', margin: '0 8px' };

const Excel = () => {
    const { addFile } = useFileSystem();
    const rows = 100;
    const cols = 26;
    const [cells, setCells] = useState({});
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [fileName, setFileName] = useState('Book1');

    const handleSave = (name) => {
        const finalName = name.endsWith('.xlsx') ? name : `${name}.xlsx`;
        setFileName(finalName.replace('.xlsx', ''));
        const content = JSON.stringify(cells);

        addFile({
            name: finalName,
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            size: content.length,
            category: 'Documents',
            content: content
        });

        setShowSaveModal(false);
    };

    const handleCellChange = (row, col, value) => {
        setCells(prev => ({ ...prev, [`${row}-${col}`]: value }));
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#fff', fontFamily: 'Segoe UI' }}>
            {/* Header */}
            <div style={{ background: '#217346', padding: '0 12px', height: '40px', display: 'flex', alignItems: 'center', color: 'white' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginRight: '24px' }}>
                    <FileSpreadsheet size={20} />
                    <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>AutoSave On</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', background: '#e1e1e1', color: '#333', borderRadius: '4px', padding: '4px 20px', fontSize: '0.8rem', marginRight: '16px' }}>
                    <SearchBox />
                </div>
                <div style={{ marginLeft: 'auto', fontSize: '0.85rem', opacity: 0.9 }}>{fileName}</div>
            </div>

            {/* Menu Bar */}
            <div style={{ background: '#217346', padding: '0 12px', height: '36px', display: 'flex', alignItems: 'flex-end', gap: '4px' }}>
                <div style={{ padding: '6px 12px', background: '#f3f2f1', color: '#217346', borderRadius: '4px 4px 0 0', fontSize: '0.85rem', fontWeight: '500', cursor: 'pointer' }}>Home</div>
                <div style={{ padding: '6px 12px', color: 'white', opacity: 0.9, fontSize: '0.85rem', cursor: 'pointer' }}>Insert</div>
                <div style={{ padding: '6px 12px', color: 'white', opacity: 0.9, fontSize: '0.85rem', cursor: 'pointer' }}>Page Layout</div>
                <div style={{ padding: '6px 12px', color: 'white', opacity: 0.9, fontSize: '0.85rem', cursor: 'pointer' }}>Formulas</div>
                <div style={{ padding: '6px 12px', color: 'white', opacity: 0.9, fontSize: '0.85rem', cursor: 'pointer' }}>Data</div>
            </div>

            {/* Toolbar */}
            <div style={{ background: '#f3f2f1', padding: '8px 12px', borderBottom: '1px solid #e0e0e0', display: 'flex', alignItems: 'center', height: '100px', gap: '8px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                    <button onClick={() => setShowSaveModal(true)} style={{ ...formatBtn, width: '40px', height: '40px' }} title="Save">
                        <Save size={24} color="#217346" />
                    </button>
                    <span style={{ fontSize: '0.75rem', color: '#666' }}>Save</span>
                </div>
                <div style={sepStyle} />

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', gap: '4px' }}>
                        <select style={{ fontSize: '0.8rem', padding: '2px', width: '100px' }}><option>Calibri</option></select>
                        <select style={{ fontSize: '0.8rem', padding: '2px', width: '50px' }}><option>11</option></select>
                    </div>
                    <div style={{ display: 'flex', gap: '2px' }}>
                        <button style={formatBtn}><Bold size={16} /></button>
                        <button style={formatBtn}><Italic size={16} /></button>
                        <button style={formatBtn} style={{ ...formatBtn, borderBottom: '2px solid #217346' }}><span style={{ fontWeight: 'bold' }}>U</span></button>
                    </div>
                </div>
                <div style={sepStyle} />

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', gap: '2px', alignItems: 'center', height: '100%' }}>
                        <button style={formatBtn}><AlignLeft size={16} /></button>
                        <button style={formatBtn}><AlignCenter size={16} /></button>
                        <button style={formatBtn}><AlignRight size={16} /></button>
                    </div>
                </div>
            </div>

            {/* Formula Bar */}
            <div style={{ display: 'flex', alignItems: 'center', padding: '4px 8px', background: 'white', borderBottom: '1px solid #e0e0e0', fontSize: '0.85rem' }}>
                <div style={{ width: '40px', color: '#666', borderRight: '1px solid #ddd', paddingRight: '8px', textAlign: 'center' }}>A1</div>
                <div style={{ padding: '0 8px', color: '#999', cursor: 'pointer' }}>fx</div>
                <input type="text" style={{ flex: 1, border: 'none', outline: 'none', padding: '2px' }} />
            </div>

            {/* Grid */}
            <div style={{ flex: 1, overflow: 'auto', position: 'relative', background: 'white' }}>
                <table style={{ borderCollapse: 'collapse', tableLayout: 'fixed' }}>
                    <thead>
                        <tr>
                            <th style={{ width: '40px', background: '#f8f9fa', borderRight: '1px solid #d4d4d4', borderBottom: '1px solid #d4d4d4', position: 'sticky', top: 0, left: 0, zIndex: 20 }}></th>
                            {Array.from({ length: cols }, (_, i) => (
                                <th key={i} style={{ width: '80px', background: '#f8f9fa', borderRight: '1px solid #d4d4d4', borderBottom: '1px solid #d4d4d4', fontWeight: 'normal', color: '#333', position: 'sticky', top: 0, zIndex: 10, fontSize: '0.85rem' }}>
                                    {String.fromCharCode(65 + i)}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {Array.from({ length: rows }, (_, r) => (
                            <tr key={r} style={{ height: '22px' }}>
                                <td style={{ background: '#f8f9fa', borderRight: '1px solid #d4d4d4', borderBottom: '1px solid #d4d4d4', textAlign: 'center', fontSize: '0.8rem', color: '#666', position: 'sticky', left: 0, zIndex: 10 }}>{r + 1}</td>
                                {Array.from({ length: cols }, (_, c) => (
                                    <td key={c} style={{ borderRight: '1px solid #e0e0e0', borderBottom: '1px solid #e0e0e0', padding: 0 }}>
                                        <input
                                            type="text"
                                            value={cells[`${r}-${c}`] || ''}
                                            onChange={e => handleCellChange(r, c, e.target.value)}
                                            style={{ width: '100%', height: '100%', border: 'none', outline: 'none', padding: '0 4px', fontSize: '0.85rem', background: 'transparent' }}
                                        />
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Sheets Bar */}
            <div style={{ background: '#f8f9fa', borderTop: '1px solid #e0e0e0', padding: '0', display: 'flex', alignItems: 'center', height: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <button style={{ border: 'none', background: 'transparent', padding: '0 8px', color: '#666' }}><ChevronDown size={12} /></button>
                </div>
                <div style={{ display: 'flex', gap: '2px' }}>
                    <div style={{ background: 'white', padding: '6px 16px', borderRight: '1px solid #e0e0e0', fontSize: '0.8rem', fontWeight: '500', color: '#217346', cursor: 'pointer', borderBottom: '2px solid #217346' }}>Sheet1</div>
                    <button style={{ border: 'none', background: 'transparent', width: '30px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Plus size={14} color="#666" /></button>
                </div>
            </div>

            {/* Save Modal */}
            {showSaveModal && (
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 100 }}>
                    <SaveAsModal
                        initialName={`${fileName}.xlsx`}
                        onSave={handleSave}
                        onClose={() => setShowSaveModal(false)}
                    />
                </div>
            )}
        </div>
    );
};

const SearchBox = () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', opacity: 0.6 }}>
        <span style={{ fontSize: '0.8rem' }}>Search</span>
    </div>
);

export default Excel;
