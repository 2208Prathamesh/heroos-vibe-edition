import React, { useState, useRef, useEffect } from 'react';
import {
    Folder, File, Image, Music, Video, ArrowLeft, ArrowUp,
    Home, Search, Clock, Cloud, HardDrive, Monitor, Download,
    ChevronRight, MoreHorizontal, LayoutGrid, List, Trash2,
    Star, PieChart, Edit2, Check, X as XIcon, Lock, ShieldAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFileSystem } from '../../context/FileSystemContext';
import { useAuth } from '../../context/AuthContext';

const FileManager = ({ initialPath = 'home' }) => {
    const { user } = useAuth();
    const { files, storageUsed, maxStorage, deleteFile, addFile, uploads, uploadFile, renameFile, userStoragePath } = useFileSystem();
    const [currentPath, setCurrentPath] = useState(initialPath);
    const [viewMode, setViewMode] = useState('grid');
    const [selectedItem, setSelectedItem] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [previewFile, setPreviewFile] = useState(null);
    const [deleteId, setDeleteId] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // Rename state
    const [renamingId, setRenamingId] = useState(null);
    const [newNameValue, setNewNameValue] = useState('');

    const fileInputRef = useRef(null);

    // --- GUEST ACCESS BLOCK ---
    if (!user || user.username === 'guest' || user.role === 'guest') {
        return (
            <div style={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--bg-color)',
                color: 'var(--text-color)',
                textAlign: 'center',
                gap: '20px'
            }}>
                <div style={{
                    width: '80px', height: '80px',
                    borderRadius: '50%',
                    background: 'rgba(231, 72, 86, 0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '1px solid #E74856'
                }}>
                    <ShieldAlert size={40} color="#E74856" />
                </div>
                <div>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Access Denied</h2>
                    <p style={{ color: 'var(--text-secondary)', maxWidth: '300px', margin: '0 auto' }}>
                        Guest users do not have permission to access the local file system or secure storage.
                    </p>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '20px', padding: '10px 20px', background: 'var(--glass-bg)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    Please login with a standard account to manage files.
                </div>
            </div>
        );
    }

    const handleUploadClick = () => fileInputRef.current?.click();

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        uploadFile(file);
    };

    // Storage
    const usagePercent = Math.min(100, (storageUsed / maxStorage) * 100).toFixed(1);
    const usedMB = (storageUsed / (1024 * 1024)).toFixed(2);
    const totalGB = (maxStorage / (1024 * 1024 * 1024)).toFixed(0);

    // Categories
    const categories = {
        'Images': { icon: Image, color: '#E74856', files: files.filter(f => f.category === 'Images' || f.type.includes('image')) },
        'Videos': { icon: Video, color: '#8E44AD', files: files.filter(f => f.category === 'Videos' || f.type.includes('video')) },
        'Documents': { icon: File, color: '#0078D4', files: files.filter(f => f.category === 'Documents' || f.type.includes('document') || f.type.includes('pdf')) },
        'Music': { icon: Music, color: '#FF8C00', files: files.filter(f => f.category === 'Music' || f.type.includes('audio')) },
    };

    const getFilesForView = () => {
        if (searchQuery) return files.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()));
        if (currentPath === 'home') return [];
        if (['documents', 'downloads', 'desktop', 'pictures', 'music', 'videos'].includes(currentPath)) {
            if (currentPath === 'documents') return categories['Documents'].files;
            if (currentPath === 'pictures') return categories['Images'].files;
            if (currentPath === 'videos') return categories['Videos'].files;
            if (currentPath === 'music') return categories['Music'].files;
            return files; // Fallback or implement specific logic for downloads/desktop
        }
        return [];
    };

    const currentFiles = getFilesForView();

    const handleDownload = (file) => {
        const data = file.content || '';
        let blob;
        if (file.content && file.content.startsWith('data:')) {
            // It's likely base64 data URL, download directly via anchor
            const a = document.createElement('a');
            a.href = file.content;
            a.download = file.name;
            a.click();
            return;
        } else {
            blob = new Blob([data], { type: file.type || 'text/plain' });
        }
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = file.name;
        link.click();
    };

    const handleDeleteClick = (id) => {
        setDeleteId(id);
        setShowDeleteConfirm(true);
    };

    const confirmDelete = () => {
        if (deleteId) {
            deleteFile(deleteId);
            setSelectedItem(null);
            setDeleteId(null);
            setShowDeleteConfirm(false);
        }
    };

    const startRename = (file) => {
        setRenamingId(file.id);
        setNewNameValue(file.name);
    };

    const submitRename = () => {
        if (renamingId && newNameValue.trim()) {
            renameFile(renamingId, newNameValue.trim());
            setRenamingId(null);
        }
    };

    const getIcon = (type, category, size = 40) => {
        if (category === 'Images' || type.includes('image')) return <Image size={size} color="#E74856" />;
        if (category === 'Videos' || type.includes('video')) return <Video size={size} color="#8E44AD" />;
        if (category === 'Music' || type.includes('audio')) return <Music size={size} color="#FF8C00" />;
        return <File size={size} color="#0078D4" />;
    };

    return (
        <div style={{ display: 'flex', height: '100%', background: 'var(--bg-color)', color: 'var(--text-color)', fontFamily: 'Segoe UI, sans-serif' }}>
            {/* Sidebar */}
            <div style={{ width: '240px', background: 'var(--glass-bg)', display: 'flex', flexDirection: 'column', borderRight: '1px solid var(--border-color)', overflowY: 'auto' }}>
                <div style={{ padding: '24px 24px 12px 24px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-color)', fontWeight: 'bold', fontSize: '1.1rem' }}>
                    <Cloud size={24} /> HeroOS Storage
                </div>

                {/* Upload Status */}
                {uploads.length > 0 && (
                    <div style={{ margin: '0 16px 16px 16px', background: 'var(--hover-bg)', padding: '10px', borderRadius: '8px' }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--accent-color)', marginBottom: '8px' }}>
                            Uploading {uploads.length} item(s)...
                        </div>
                        {uploads.map(u => (
                            <div key={u.id} style={{ marginBottom: '6px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '2px' }}>
                                    <span style={{ maxWidth: '70%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.name}</span>
                                    <span>{Math.round(u.progress)}%</span>
                                </div>
                                <div style={{ height: '4px', background: 'var(--border-color)', borderRadius: '2px', overflow: 'hidden' }}>
                                    <div style={{ width: `${u.progress}%`, height: '100%', background: 'var(--accent-color)', transition: 'width 0.2s' }} />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {[
                        { id: 'home', label: 'Home', icon: Home },
                        { id: 'documents', label: 'Documents', icon: File },
                        { id: 'downloads', label: 'Downloads', icon: Download },
                        { id: 'pictures', label: 'Pictures', icon: Image },
                        { id: 'music', label: 'Music', icon: Music },
                        { id: 'videos', label: 'Videos', icon: Video },
                    ].map(item => (
                        <div
                            key={item.id}
                            onClick={() => { setCurrentPath(item.id); setSelectedItem(null); setRenamingId(null); }}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 16px',
                                borderRadius: '8px', cursor: 'pointer',
                                background: currentPath === item.id ? 'var(--hover-bg)' : 'transparent',
                                color: currentPath === item.id ? 'var(--accent-color)' : 'var(--text-color)',
                                fontWeight: currentPath === item.id ? '600' : '400',
                                transition: 'background 0.1s'
                            }}
                        >
                            <item.icon size={18} />
                            <span>{item.label}</span>
                        </div>
                    ))}
                </div>

                <div style={{ marginTop: 'auto', padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
                        <span>Storage</span>
                        <span>{usagePercent}% used</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: 'var(--input-bg)', borderRadius: '4px', overflow: 'hidden', display: 'flex' }}>
                        <div style={{ width: `${(categories['Documents'].files.reduce((acc, f) => acc + f.size, 0) / maxStorage) * 100}%`, background: '#0078D4' }} />
                        <div style={{ width: `${(categories['Images'].files.reduce((acc, f) => acc + f.size, 0) / maxStorage) * 100}%`, background: '#E74856' }} />
                        <div style={{ width: `${(categories['Videos'].files.reduce((acc, f) => acc + f.size, 0) / maxStorage) * 100}%`, background: '#8E44AD' }} />
                        <div style={{ width: `${(categories['Music'].files.reduce((acc, f) => acc + f.size, 0) / maxStorage) * 100}%`, background: '#FF8C00' }} />
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '6px', display: 'flex', justifyContent: 'space-between' }}>
                        <span>{usedMB} MB used</span>
                        <span>{totalGB} GB total</span>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg-color)' }}>
                <div style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--glass-bg)', borderBottom: '1px solid var(--border-color)' }}>
                    {/* Header with Path Display */}
                    <div>
                        <h2 style={{ fontSize: '1.2rem', margin: 0, fontWeight: '600', textTransform: 'capitalize', color: 'var(--text-color)' }}>
                            {currentPath === 'home' ? 'Home' : currentPath}
                        </h2>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontFamily: 'monospace', marginTop: '2px' }}>
                            {userStoragePath}
                            {currentPath !== 'home' ? `/${currentPath}` : ''}
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ display: 'flex', background: 'var(--input-bg)', borderRadius: '6px', padding: '2px' }}>
                            <button onClick={() => setViewMode('grid')} style={{ padding: '6px', borderRadius: '4px', border: 'none', background: viewMode === 'grid' ? 'var(--bg-color)' : 'transparent', color: viewMode === 'grid' ? 'var(--accent-color)' : 'var(--text-secondary)', boxShadow: viewMode === 'grid' ? '0 1px 3px var(--shadow-color)' : 'none', cursor: 'pointer' }}><LayoutGrid size={16} /></button>
                            <button onClick={() => setViewMode('list')} style={{ padding: '6px', borderRadius: '4px', border: 'none', background: viewMode === 'list' ? 'var(--bg-color)' : 'transparent', color: viewMode === 'list' ? 'var(--accent-color)' : 'var(--text-secondary)', boxShadow: viewMode === 'list' ? '0 1px 3px var(--shadow-color)' : 'none', cursor: 'pointer' }}><List size={16} /></button>
                        </div>

                        <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} />
                        <button onClick={handleUploadClick} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'var(--accent-color)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}>
                            <Download size={16} style={{ transform: 'rotate(180deg)' }} /> Upload
                        </button>

                        <div style={{ position: 'relative' }}>
                            <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                            <input
                                type="text"
                                placeholder="Search"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{ padding: '8px 12px 8px 34px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--input-bg)', width: '200px', outline: 'none', color: 'var(--text-color)' }}
                            />
                        </div>
                    </div>
                </div>

                <div style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
                    {currentPath === 'home' && !searchQuery ? (
                        <>
                            <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '16px', color: 'var(--text-color)' }}>Categories</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
                                {Object.entries(categories).map(([name, cat]) => (
                                    <div key={name} style={{ background: 'var(--glass-bg)', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px var(--shadow-color)', border: '1px solid var(--border-color)', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: `${cat.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <cat.icon size={20} color={cat.color} />
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: '600', color: 'var(--text-color)' }}>{name}</div>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{cat.files.length} files</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '16px', color: 'var(--text-color)' }}>Recent Files</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '16px' }}>
                                {files.slice(0, 8).map(file => (
                                    <FileCard
                                        key={file.id} file={file}
                                        selected={selectedItem === file.id}
                                        onClick={() => setSelectedItem(file.id)}
                                        onDoubleClick={() => setPreviewFile(file)}
                                        getIcon={getIcon}
                                        onDelete={() => handleDeleteClick(file.id)}
                                        onDownload={() => handleDownload(file)}
                                        onView={() => setPreviewFile(file)}
                                        onRename={startRename}
                                        renaming={renamingId === file.id}
                                        newName={newNameValue}
                                        setNewName={setNewNameValue}
                                        submitRename={submitRename}
                                    />
                                ))}
                            </div>
                        </>
                    ) : (
                        viewMode === 'grid' ? (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '16px' }}>
                                {currentFiles.map(file => (
                                    <FileCard
                                        key={file.id} file={file}
                                        selected={selectedItem === file.id}
                                        onClick={() => setSelectedItem(file.id)}
                                        onDoubleClick={() => setPreviewFile(file)}
                                        getIcon={getIcon}
                                        onDelete={() => handleDeleteClick(file.id)}
                                        onDownload={() => handleDownload(file)}
                                        onView={() => setPreviewFile(file)}
                                        onRename={startRename}
                                        renaming={renamingId === file.id}
                                        newName={newNameValue}
                                        setNewName={setNewNameValue}
                                        submitRename={submitRename}
                                    />
                                ))}
                                {currentFiles.length === 0 && <div style={{ padding: '20px', color: 'var(--text-secondary)' }}>No files found.</div>}
                            </div>
                        ) : (
                            <div style={{ background: 'var(--glass-bg)', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 8px var(--shadow-color)' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '40px 2fr 1fr 1fr 100px', padding: '12px 16px', background: 'var(--hover-bg)', borderBottom: '1px solid var(--border-color)', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
                                    <div></div>
                                    <div>Name</div>
                                    <div>Size</div>
                                    <div>Type</div>
                                    <div>Actions</div>
                                </div>
                                {currentFiles.map(file => (
                                    <div
                                        key={file.id}
                                        onClick={() => setSelectedItem(file.id)}
                                        onDoubleClick={() => setPreviewFile(file)}
                                        style={{
                                            display: 'grid', gridTemplateColumns: '40px 2fr 1fr 1fr 100px',
                                            padding: '10px 16px', borderBottom: '1px solid var(--border-color)',
                                            alignItems: 'center', fontSize: '0.9rem', color: 'var(--text-color)',
                                            background: selectedItem === file.id ? 'var(--hover-bg)' : 'transparent',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <div>{getIcon(file.type, file.category, 24)}</div>
                                        <div>
                                            {renamingId === file.id ? (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <input
                                                        autoFocus
                                                        type="text"
                                                        value={newNameValue}
                                                        onChange={e => setNewNameValue(e.target.value)}
                                                        onKeyDown={e => e.key === 'Enter' && submitRename()}
                                                        onClick={e => e.stopPropagation()}
                                                        style={{ padding: '4px', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '0.85rem', background: 'var(--input-bg)', color: 'var(--text-color)' }}
                                                    />
                                                    <button onClick={(e) => { e.stopPropagation(); submitRename(); }} style={{ padding: '4px', background: 'var(--accent-color)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}><Check size={12} /></button>
                                                </div>
                                            ) : (
                                                file.name
                                            )}
                                        </div>
                                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{(file.size / 1024).toFixed(1)} KB</div>
                                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'capitalize' }}>{file.type.split('/')[1] || 'Unknown'}</div>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button onClick={(e) => { e.stopPropagation(); startRename(file); }} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-secondary)' }} title="Rename"><Edit2 size={14} /></button>
                                            <button onClick={(e) => { e.stopPropagation(); handleDownload(file); }} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-secondary)' }} title="Download"><Download size={14} /></button>
                                            <button onClick={(e) => { e.stopPropagation(); handleDeleteClick(file.id); }} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#E74856' }} title="Delete"><Trash2 size={14} /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )
                    )}
                </div>

                {/* Confirm Delete */}
                <AnimatePresence>
                    {showDeleteConfirm && (
                        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 101 }}>
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                style={{ background: 'var(--window-bg)', padding: '24px', borderRadius: '8px', width: '300px', boxShadow: '0 4px 20px var(--shadow-color)', border: '1px solid var(--border-color)', color: 'var(--text-color)' }}
                            >
                                <h3 style={{ marginTop: 0 }}>Move to Trash?</h3>
                                <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>This item will be moved to the Recycle Bin.</p>
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                                    <button onClick={() => setShowDeleteConfirm(false)} style={{ padding: '8px 16px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-color)', cursor: 'pointer' }}>Cancel</button>
                                    <button onClick={confirmDelete} style={{ padding: '8px 16px', borderRadius: '4px', border: 'none', background: '#E74856', color: 'white', cursor: 'pointer' }}>Delete</button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* Preview */}
                <AnimatePresence>
                    {previewFile && (
                        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.95, opacity: 0 }}
                                style={{ background: 'var(--window-bg)', borderRadius: '8px', overflow: 'hidden', width: '80%', height: '80%', display: 'flex', flexDirection: 'column', border: '1px solid var(--border-color)' }}
                            >
                                <div style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <h3 style={{ margin: 0, color: 'var(--text-color)' }}>{previewFile.name}</h3>
                                    <button onClick={() => setPreviewFile(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-color)' }}><XIcon size={24} /></button>
                                </div>
                                <div style={{ flex: 1, background: 'var(--bg-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                                    {previewFile.type.includes('image') ? <img src={previewFile.content || ''} alt="preview" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', boxShadow: '0 4px 12px var(--shadow-color)' }} /> :
                                        previewFile.type.includes('video') ? <video src={previewFile.content} controls style={{ maxWidth: '100%', maxHeight: '100%' }} /> :
                                            <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                                                <File size={64} style={{ marginBottom: '16px', opacity: 0.5 }} />
                                                <p>Preview not available</p>
                                            </div>}
                                </div>
                                <div style={{ padding: '16px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end' }}>
                                    <button onClick={() => handleDownload(previewFile)} style={{ padding: '8px 16px', background: 'var(--accent-color)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Download size={16} /> Download
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

const FileCard = ({ file, selected, onClick, onDoubleClick, getIcon, onDelete, onDownload, onView, onRename, renaming, newName, setNewName, submitRename }) => (
    <motion.div
        onClick={onClick}
        onDoubleClick={onDoubleClick}
        whileHover={{ y: -2 }}
        style={{
            background: selected && !renaming ? 'var(--hover-bg)' : 'var(--glass-bg)',
            borderRadius: '12px',
            padding: '16px',
            cursor: 'pointer',
            border: selected ? '1px solid var(--accent-color)' : '1px solid var(--border-color)',
            boxShadow: '0 2px 8px var(--shadow-color)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
            position: 'relative', overflow: 'hidden'
        }}
    >
        {getIcon(file.type, file.category)}
        <div style={{ textAlign: 'center', width: '100%' }}>
            {renaming ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <input
                        autoFocus
                        type="text"
                        value={newName}
                        onChange={e => setNewName(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && submitRename()}
                        onClick={e => e.stopPropagation()}
                        style={{ width: '100%', padding: '4px', borderRadius: '4px', border: '1px solid var(--accent-color)', fontSize: '0.9rem', outline: 'none', background: 'var(--input-bg)', color: 'var(--text-color)' }}
                    />
                    <button onClick={(e) => { e.stopPropagation(); submitRename(); }} style={{ padding: '4px', background: 'var(--accent-color)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}><Check size={14} /></button>
                </div>
            ) : (
                <>
                    <div style={{ fontSize: '0.9rem', fontWeight: '500', color: 'var(--text-color)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{file.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{(file.size / 1024).toFixed(0)} KB</div>
                </>
            )}
        </div>

        {selected && !renaming && (
            <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                <button onClick={(e) => { e.stopPropagation(); onRename(file); }} className="action-btn" title="Rename"><Edit2 size={13} /></button>
                <button onClick={(e) => { e.stopPropagation(); onView(); }} className="action-btn" title="View"><Monitor size={13} /></button>
                <button onClick={(e) => { e.stopPropagation(); onDownload(); }} className="action-btn" title="Download"><Download size={13} /></button>
                <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="action-btn-danger" title="Delete"><Trash2 size={13} /></button>
                <style>{`
                    .action-btn { background: var(--hover-bg); border: none; border-radius: 4px; padding: 5px; cursor: pointer; color: var(--text-color); display: flex; align-items: center; justify-content: center; transition: background 0.1s; }
                    .action-btn:hover { background: var(--border-color); }
                    .action-btn-danger { background: rgba(255,0,0,0.1); border: none; border-radius: 4px; padding: 5px; cursor: pointer; color: #E74856; display: flex; align-items: center; justify-content: center; transition: background 0.1s; }
                    .action-btn-danger:hover { background: rgba(255,0,0,0.2); }
                `}</style>
            </div>
        )}
    </motion.div>
);

export default FileManager;
