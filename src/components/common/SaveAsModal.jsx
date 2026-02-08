import React, { useState } from 'react';
import { X, Save } from 'lucide-react';

const SaveAsModal = ({ initialName, onClose, onSave }) => {
    const [fileName, setFileName] = useState(initialName || 'Untitled');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(fileName);
    };

    return (
        <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000
        }}>
            <form onSubmit={handleSubmit} style={{
                background: 'var(--window-bg)', padding: '24px', borderRadius: '12px',
                width: '320px', boxShadow: '0 8px 32px var(--shadow-color)',
                display: 'flex', flexDirection: 'column', gap: '16px',
                border: '1px solid var(--border-color)',
                animation: 'popIn 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            }}>
                <style>{`@keyframes popIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }`}</style>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                    <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '600', color: 'var(--text-color)' }}>Save As</h3>
                    <button type="button" onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}><X size={20} /></button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: '500' }}>File Name</label>
                    <input
                        type="text"
                        value={fileName}
                        onChange={(e) => setFileName(e.target.value)}
                        autoFocus
                        placeholder="Enter file name..."
                        style={{
                            padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', width: '100%',
                            fontSize: '0.95rem', outline: 'none', transition: 'border-color 0.2s',
                            background: 'var(--input-bg)', color: 'var(--text-color)'
                        }}
                        onFocus={(e) => e.target.style.borderColor = 'var(--accent-color)'}
                        onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                    />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                    <button type="button" onClick={onClose} style={{ padding: '8px 16px', background: 'var(--hover-bg)', border: '1px solid var(--border-color)', borderRadius: '6px', cursor: 'pointer', fontWeight: '500', color: 'var(--text-color)' }}>Cancel</button>
                    <button type="submit" style={{ padding: '8px 20px', background: 'var(--accent-color)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '500', boxShadow: '0 2px 4px var(--shadow-color)' }}>
                        <Save size={16} /> Save
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SaveAsModal;
