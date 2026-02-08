import React, { useState } from 'react';
import { Trash2, RefreshCcw, File, Image, Music, Video, FileText, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFileSystem } from '../../context/FileSystemContext';

const RecycleBin = () => {
    const { binFiles, restoreFile, emptyBin, permanentlyDelete, binUsed, maxBinStorage } = useFileSystem();
    const [selected, setSelected] = useState(null);
    const [showConfirm, setShowConfirm] = useState(false);

    const binUsagePercent = Math.min(100, (binUsed / maxBinStorage) * 100).toFixed(1);
    const binUsedMB = (binUsed / (1024 * 1024)).toFixed(2);
    const binTotalMB = (maxBinStorage / (1024 * 1024)).toFixed(0);

    const getIcon = (type) => {
        if (!type) return <File size={24} color="var(--text-secondary)" />;
        if (type.includes('image')) return <Image size={24} color="#E74856" />;
        if (type.includes('video')) return <Video size={24} color="#E74856" />;
        if (type.includes('audio')) return <Music size={24} color="#FF8C00" />;
        return <File size={24} color="var(--text-secondary)" />;
    };

    const handleRestore = () => {
        if (selected) {
            restoreFile(selected);
            setSelected(null);
        }
    };

    const handlePermanentDelete = () => {
        if (selected) {
            permanentlyDelete(selected);
            setSelected(null);
        }
    };

    const handleEmptyBin = () => {
        emptyBin();
        setShowConfirm(false);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg-color)', color: 'var(--text-color)', fontFamily: 'Segoe UI, sans-serif' }}>
            {/* Toolbar */}
            <div style={{ padding: '10px 16px', background: 'var(--glass-bg)', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '12px', alignItems: 'center' }}>
                <button
                    onClick={() => binFiles.length > 0 && setShowConfirm(true)}
                    disabled={binFiles.length === 0}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        padding: '6px 12px', background: 'transparent', border: '1px solid transparent',
                        borderRadius: '4px', cursor: binFiles.length > 0 ? 'pointer' : 'default',
                        color: binFiles.length > 0 ? '#d13438' : 'var(--text-secondary)'
                    }}
                >
                    <Trash2 size={16} />
                    <span>Empty Bin</span>
                </button>
                <div style={{ width: '1px', height: '20px', background: 'var(--border-color)' }} />
                <button
                    onClick={handleRestore}
                    disabled={!selected}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        padding: '6px 12px', background: 'transparent', border: '1px solid transparent',
                        borderRadius: '4px', cursor: selected ? 'pointer' : 'default',
                        color: selected ? 'var(--text-color)' : 'var(--text-secondary)'
                    }}
                >
                    <RefreshCcw size={16} />
                    <span>Restore selected</span>
                </button>
                <button
                    onClick={handlePermanentDelete}
                    disabled={!selected}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        padding: '6px 12px', background: 'transparent', border: '1px solid transparent',
                        borderRadius: '4px', cursor: selected ? 'pointer' : 'default',
                        color: selected ? '#d13438' : 'var(--text-secondary)'
                    }}
                >
                    <Trash2 size={16} />
                    <span>Delete Permanently</span>
                </button>
                <div style={{ marginLeft: 'auto', fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>Storage: {binUsedMB} MB / {binTotalMB} MB</span>
                    <div style={{ width: '60px', height: '6px', background: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${binUsagePercent}%`, height: '100%', background: binUsagePercent > 90 ? '#d13438' : 'var(--text-secondary)' }}></div>
                    </div>
                </div>
            </div>

            {/* List Header */}
            <div style={{ display: 'grid', gridTemplateColumns: '40px 2fr 1fr 1fr', padding: '10px 16px', borderBottom: '1px solid var(--border-color)', fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '500' }}>
                <div></div>
                <div>Name</div>
                <div>Date Deleted</div>
                <div>Original Location</div>
            </div>

            {/* Items List */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
                {binFiles.length > 0 ? (
                    binFiles.map(item => (
                        <div
                            key={item.id}
                            onClick={() => setSelected(item.id)}
                            style={{
                                display: 'grid', gridTemplateColumns: '40px 2fr 1fr 1fr',
                                padding: '10px 16px', borderBottom: '1px solid var(--border-color)',
                                alignItems: 'center', cursor: 'pointer',
                                background: selected === item.id ? 'var(--hover-bg)' : 'transparent',
                                fontSize: '0.9rem',
                                color: 'var(--text-color)'
                            }}
                        >
                            <div>{getIcon(item.type)}</div>
                            <div>{item.name}</div>
                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{item.deletedDate ? new Date(item.deletedDate).toLocaleDateString() : 'Unknown'}</div>
                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{item.category || 'Unknown'}</div>
                        </div>
                    ))
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)' }}>
                        <Trash2 size={48} style={{ marginBottom: '16px', opacity: 0.2 }} />
                        <div>Recycle Bin is empty</div>
                    </div>
                )}
            </div>

            {/* Confirmation Dialog */}
            <AnimatePresence>
                {showConfirm && (
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            style={{ background: 'var(--window-bg)', padding: '24px', borderRadius: '8px', width: '300px', boxShadow: '0 10px 25px var(--shadow-color)', border: '1px solid var(--border-color)' }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', color: '#d13438' }}>
                                <AlertTriangle size={24} />
                                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Delete All Permanently?</h3>
                            </div>
                            <p style={{ margin: '0 0 24px 0', fontSize: '0.9rem', color: 'var(--text-color)' }}>
                                Are you sure you want to empty the Recycle Bin? This will permanently delete {binFiles.length} items. This action cannot be undone.
                            </p>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                                <button onClick={() => setShowConfirm(false)} style={{ padding: '8px 16px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-color)', cursor: 'pointer' }}>Cancel</button>
                                <button onClick={handleEmptyBin} style={{ padding: '8px 16px', borderRadius: '4px', border: 'none', background: '#d13438', color: 'white', cursor: 'pointer' }}>Empty Bin</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default RecycleBin;
