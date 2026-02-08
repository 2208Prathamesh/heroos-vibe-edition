import React, { useState } from 'react';
import { Image as ImageIcon, ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut, Download, Trash2, Edit } from 'lucide-react';
import { useFileSystem } from '../../context/FileSystemContext';

const Photos = () => {
    const { files, deleteFile } = useFileSystem();
    const [selectedPhoto, setSelectedPhoto] = useState(null);
    const [zoom, setZoom] = useState(1);

    const photos = files.filter(f => f.type && f.type.includes('image'));

    // Add mock photos if empty
    const mockPhotos = [
        { id: 'p1', name: 'Mountain View', content: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80', date: 'Yesterday' },
        { id: 'p2', name: 'City Lights', content: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=800&q=80', date: 'Today' },
        { id: 'p3', name: 'Forest Path', content: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=800&q=80', date: 'Last Week' },
        { id: 'p4', name: 'Desert Dunes', content: 'https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?auto=format&fit=crop&w=800&q=80', date: 'Last Month' }
    ];

    const allPhotos = photos.length > 0 ? photos : mockPhotos;

    const openPhoto = (photo) => {
        setSelectedPhoto(photo);
        setZoom(1);
    };

    const nextPhoto = () => {
        if (!selectedPhoto) return;
        const currentId = selectedPhoto.id;
        const idx = allPhotos.findIndex(p => p.id === currentId);
        if (idx !== -1 && idx < allPhotos.length - 1) {
            setSelectedPhoto(allPhotos[idx + 1]);
        }
    };

    const prevPhoto = () => {
        if (!selectedPhoto) return;
        const currentId = selectedPhoto.id;
        const idx = allPhotos.findIndex(p => p.id === currentId);
        if (idx > 0) {
            setSelectedPhoto(allPhotos[idx - 1]);
        }
    };

    return (
        <div style={{ background: 'var(--bg-color)', height: '100%', color: 'var(--text-color)', display: 'flex', flexDirection: 'column', fontFamily: 'Segoe UI, sans-serif' }}>
            {selectedPhoto ? (
                <div style={{ flex: 1, position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-color)' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '20px', display: 'flex', justifyContent: 'space-between', zIndex: 10, background: 'linear-gradient(to bottom, var(--glass-bg), transparent)' }}>
                        <button onClick={() => setSelectedPhoto(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-color)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <ChevronLeft size={24} /> Back
                        </button>
                        <div style={{ display: 'flex', gap: '20px' }}>
                            <button onClick={() => setZoom(z => Math.max(0.5, z - 0.1))} style={{ background: 'transparent', border: 'none', color: 'var(--text-color)', cursor: 'pointer' }}><ZoomOut size={20} /></button>
                            <button onClick={() => setZoom(z => Math.min(3, z + 0.1))} style={{ background: 'transparent', border: 'none', color: 'var(--text-color)', cursor: 'pointer' }}><ZoomIn size={20} /></button>
                            <button style={{ background: 'transparent', border: 'none', color: 'var(--text-color)', cursor: 'pointer' }}><Edit size={20} /></button>
                            <button style={{ background: 'transparent', border: 'none', color: 'var(--text-color)', cursor: 'pointer' }}><Download size={20} /></button>
                            <button style={{ background: 'transparent', border: 'none', color: 'var(--text-color)', cursor: 'pointer' }}><Trash2 size={20} /></button>
                        </div>
                    </div>

                    <button onClick={prevPhoto} style={{ position: 'absolute', left: '20px', background: 'var(--glass-bg)', border: '1px solid var(--border-color)', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-color)', cursor: 'pointer', zIndex: 5 }}>
                        <ChevronLeft size={24} />
                    </button>

                    <div style={{ overflow: 'auto', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <img
                            src={selectedPhoto.content}
                            alt={selectedPhoto.name}
                            style={{
                                maxWidth: '100%', maxHeight: '100%', objectFit: 'contain',
                                transform: `scale(${zoom})`, transition: 'transform 0.2s',
                                boxShadow: '0 0 50px var(--shadow-color)'
                            }}
                        />
                    </div>

                    <button onClick={nextPhoto} style={{ position: 'absolute', right: '20px', background: 'var(--glass-bg)', border: '1px solid var(--border-color)', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-color)', cursor: 'pointer', zIndex: 5 }}>
                        <ChevronRight size={24} />
                    </button>

                    <div style={{ position: 'absolute', bottom: '20px', left: '0', right: '0', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        {selectedPhoto.name} • {selectedPhoto.date || 'Unknown Date'}
                    </div>
                </div>
            ) : (
                <div style={{ padding: '20px', height: '100%', overflowY: 'auto' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-color)' }}>
                        <ImageIcon color="var(--accent-color)" /> Photos
                    </div>

                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>Collection</div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '8px' }}>
                        {allPhotos.map(photo => (
                            <div
                                key={photo.id}
                                onClick={() => openPhoto(photo)}
                                style={{ aspectRatio: '1', position: 'relative', cursor: 'pointer', overflow: 'hidden', borderRadius: '4px', background: 'var(--glass-bg)' }}
                            >
                                <img
                                    src={photo.content}
                                    alt={photo.name}
                                    loading="lazy"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }}
                                    onMouseEnter={e => e.target.style.transform = 'scale(1.1)'}
                                    onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                                />
                            </div>
                        ))}
                    </div>
                    {allPhotos.length === 0 && <div style={{ color: 'var(--text-secondary)', marginTop: '40px', textAlign: 'center' }}>No photos found.</div>}
                </div>
            )}
        </div>
    );
};

export default Photos;
