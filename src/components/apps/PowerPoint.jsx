import React, { useState } from 'react';
import { Plus, Save, Download, Play, Type, Image, Square, MonitorPlay, Presentation, Layout, ChevronLeft, ChevronRight, Hash } from 'lucide-react';
import { useFileSystem } from '../../context/FileSystemContext';
import SaveAsModal from '../common/SaveAsModal';

// Moved updated styles to top to prevent ReferenceError
const toolbarBtn = {
    background: 'transparent',
    border: 'none',
    color: 'white',
    padding: '6px',
    borderRadius: '4px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.9,
    transition: 'background 0.2s',
    minWidth: '28px'
};

const PowerPoint = () => {
    const { addFile } = useFileSystem();
    const [slides, setSlides] = useState([{ id: 1, title: 'Presentation Title', subtitle: 'Subtitle', content: '', layout: 'title' }]);
    const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [fileName, setFileName] = useState('Presentation1');
    const [viewMode, setViewMode] = useState('edit'); // edit | present

    const currentSlide = slides[currentSlideIndex];

    const addSlide = () => {
        const newSlide = { id: Date.now(), title: '', content: '', layout: 'content' };
        setSlides(prev => [...prev, newSlide]);
        setCurrentSlideIndex(prev => prev + 1);
    };

    const updateSlide = (key, value) => {
        setSlides(prev => prev.map((s, i) => i === currentSlideIndex ? { ...s, [key]: value } : s));
    };

    const handleSave = (name) => {
        const finalName = name.endsWith('.pptx') ? name : `${name}.pptx`;
        setFileName(finalName.replace('.pptx', ''));
        const content = JSON.stringify(slides);

        addFile({
            name: finalName,
            type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            size: content.length,
            category: 'Documents',
            content: content
        });

        setShowSaveModal(false);
    };

    if (viewMode === 'present') {
        return (
            <div
                style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'black', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                onClick={() => {
                    if (currentSlideIndex < slides.length - 1) setCurrentSlideIndex(prev => prev + 1);
                    else setViewMode('edit');
                }}
            >
                <div style={{ width: '80%', height: '80%', background: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '5%' }}>
                    <h1 style={{ fontSize: '4rem', marginBottom: '20px' }}>{currentSlide.title}</h1>
                    <p style={{ fontSize: '2rem', color: '#666' }}>{currentSlide.content || currentSlide.subtitle}</p>
                </div>
                <button
                    onClick={(e) => { e.stopPropagation(); setViewMode('edit'); }}
                    style={{ position: 'absolute', top: '20px', right: '20px', background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none', padding: '10px', borderRadius: '4px', cursor: 'pointer' }}
                >
                    Exit
                </button>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#f3f3f3', fontFamily: 'Segoe UI' }}>
            {/* Header */}
            <div style={{ background: '#d83b01', padding: '0 12px', height: '40px', display: 'flex', alignItems: 'center', color: 'white' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginRight: '24px' }}>
                    <Presentation size={20} />
                    <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>AutoSave On</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.2)', color: 'white', borderRadius: '4px', padding: '4px 20px', fontSize: '0.8rem', marginRight: '16px' }}>
                    Search
                </div>
                <div style={{ marginLeft: 'auto', fontSize: '0.85rem', opacity: 0.9 }}>{fileName}</div>
            </div>

            {/* Menu Bar */}
            <div style={{ background: '#d83b01', padding: '0 12px', height: '36px', display: 'flex', alignItems: 'flex-end', gap: '4px' }}>
                <div style={{ padding: '6px 12px', background: '#f3f2f1', color: '#d83b01', borderRadius: '4px 4px 0 0', fontSize: '0.85rem', fontWeight: '500', cursor: 'pointer' }}>Home</div>
                <div style={{ padding: '6px 12px', color: 'white', opacity: 0.9, fontSize: '0.85rem', cursor: 'pointer' }}>Insert</div>
                <div style={{ padding: '6px 12px', color: 'white', opacity: 0.9, fontSize: '0.85rem', cursor: 'pointer' }}>Design</div>
                <div style={{ padding: '6px 12px', color: 'white', opacity: 0.9, fontSize: '0.85rem', cursor: 'pointer' }}>Transitions</div>
                <div style={{ padding: '6px 12px', color: 'white', opacity: 0.9, fontSize: '0.85rem', cursor: 'pointer' }}>Animations</div>
                <div style={{ padding: '6px 12px', color: 'white', opacity: 0.9, fontSize: '0.85rem', cursor: 'pointer' }}>Slide Show</div>
            </div>

            {/* Toolbar Ribbon */}
            <div style={{ background: '#f3f2f1', padding: '8px 12px', borderBottom: '1px solid #e0e0e0', display: 'flex', alignItems: 'center', height: '100px', gap: '8px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                    <button onClick={addSlide} style={{ ...toolbarBtn, color: '#333', border: '1px solid #ccc', background: 'white' }} title="New Slide">
                        <Plus size={24} color="#d83b01" />
                    </button>
                    <span style={{ fontSize: '0.75rem', color: '#666' }}>New Slide</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                    <button onClick={() => setViewMode('present')} style={{ ...toolbarBtn, color: '#333', border: '1px solid #ccc', background: 'white' }} title="Start Presentation">
                        <Play size={24} color="#d83b01" />
                    </button>
                    <span style={{ fontSize: '0.75rem', color: '#666' }}>Start</span>
                </div>
                <div style={{ width: '1px', height: '60px', background: '#e0e0e0', margin: '0 8px' }} />

                {/* Shapes/Insert */}
                <div style={{ display: 'flex', gap: '8px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                        <button style={{ ...toolbarBtn, color: '#333' }}><Layout size={20} /></button>
                        <span style={{ fontSize: '0.7rem' }}>Layout</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                        <button style={{ ...toolbarBtn, color: '#333' }}><Type size={20} /></button>
                        <span style={{ fontSize: '0.7rem' }}>Text Box</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                        <button style={{ ...toolbarBtn, color: '#333' }}><Image size={20} /></button>
                        <span style={{ fontSize: '0.7rem' }}>Picture</span>
                    </div>
                </div>

                <div style={{ marginLeft: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                    <button onClick={() => setShowSaveModal(true)} style={{ ...toolbarBtn, color: '#333' }} title="Save"><Save size={20} color="#d83b01" /></button>
                    <span style={{ fontSize: '0.75rem', color: '#666' }}>Save</span>
                </div>
            </div>

            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                {/* Thumbnails */}
                <div style={{ width: '200px', background: '#e1e1e1', borderRight: '1px solid #ccc', overflowY: 'auto', display: 'flex', flexDirection: 'column', padding: '10px', gap: '10px' }}>
                    {slides.map((slide, index) => (
                        <div
                            key={slide.id}
                            onClick={() => setCurrentSlideIndex(index)}
                            style={{
                                background: 'white',
                                aspectRatio: '16/9',
                                border: currentSlideIndex === index ? '2px solid #d83b01' : '1px solid #ccc',
                                cursor: 'pointer',
                                padding: '4px',
                                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                position: 'relative'
                            }}
                        >
                            <div style={{ fontSize: '8px', fontWeight: 'bold' }}>{slide.title || 'Slide ' + (index + 1)}</div>
                            <div style={{ position: 'absolute', bottom: '2px', left: '2px', fontSize: '8px', color: '#999' }}>{index + 1}</div>
                        </div>
                    ))}
                </div>

                {/* Editor */}
                <div style={{ flex: 1, background: '#d0d0d0', padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'auto' }}>
                    <div style={{
                        width: '800px', height: '450px',
                        background: 'white',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        padding: '40px',
                        position: 'relative'
                    }}>
                        <input
                            type="text"
                            value={currentSlide.title}
                            onChange={e => updateSlide('title', e.target.value)}
                            placeholder={currentSlide.layout === 'title' ? "Click to add title" : "Click to add title"}
                            style={{
                                fontSize: currentSlide.layout === 'title' ? '48px' : '32px',
                                fontWeight: 'bold',
                                border: '1px dashed transparent',
                                textAlign: 'center',
                                width: '100%',
                                marginBottom: '20px',
                                background: 'transparent',
                                color: '#333'
                            }}
                            onFocus={e => e.target.style.borderColor = '#ccc'}
                            onBlur={e => e.target.style.borderColor = 'transparent'}
                        />

                        <textarea
                            value={currentSlide.content || currentSlide.subtitle || ''}
                            onChange={e => updateSlide(currentSlide.layout === 'title' ? 'subtitle' : 'content', e.target.value)}
                            placeholder={currentSlide.layout === 'title' ? "Click to add subtitle" : "Click to add text"}
                            style={{
                                fontSize: currentSlide.layout === 'title' ? '24px' : '18px',
                                border: '1px dashed transparent',
                                textAlign: 'center',
                                width: '100%',
                                height: '200px',
                                resize: 'none',
                                background: 'transparent',
                                color: '#666',
                                fontFamily: 'inherit'
                            }}
                            onFocus={e => e.target.style.borderColor = '#ccc'}
                            onBlur={e => e.target.style.borderColor = 'transparent'}
                        />
                    </div>
                </div>
            </div>

            {/* Status Bar */}
            <div style={{ background: '#d83b01', padding: '2px 12px', fontSize: '0.75rem', color: 'rgba(255,255,255,0.9)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '16px' }}>
                    <span>Slide {currentSlideIndex + 1} of {slides.length}</span>
                    <span>English (US)</span>
                </div>
                <div>Notes</div>
            </div>

            {/* Save Modal */}
            {showSaveModal && (
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 100 }}>
                    <SaveAsModal
                        initialName={`${fileName}.pptx`}
                        onSave={handleSave}
                        onClose={() => setShowSaveModal(false)}
                    />
                </div>
            )}
        </div>
    );
};

export default PowerPoint;
