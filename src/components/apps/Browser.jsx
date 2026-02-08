import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, ArrowRight, RotateCw, Home, Star, Plus, X, Search, Lock, Globe, Monitor } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const StartPage = ({ onNavigate }) => {
    const [query, setQuery] = useState('');

    const handleSearch = (e) => {
        e.preventDefault();
        if (query.trim()) {
            onNavigate(`https://www.google.com/search?q=${encodeURIComponent(query)}&igu=1`);
        }
    };

    const shortcuts = [
        { name: 'Google', url: 'https://www.google.com/webhp?igu=1', icon: 'G', color: '#4285F4' },
        { name: 'Wikipedia', url: 'https://en.m.wikipedia.org', icon: 'W', color: 'var(--text-color)' },
        { name: 'Bing', url: 'https://www.bing.com', icon: 'b', color: '#008373' },
        { name: 'DuckDuckGo', url: 'https://duckduckgo.com', icon: 'D', color: '#DE5833' },
    ];

    return (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-color)', color: 'var(--text-color)' }}>
            <div style={{ marginBottom: '30px', fontWeight: 'bold', fontSize: '3rem', color: '#4285F4' }}>
                <span style={{ color: '#4285F4' }}>G</span>
                <span style={{ color: '#EA4335' }}>o</span>
                <span style={{ color: '#FBBC05' }}>o</span>
                <span style={{ color: '#4285F4' }}>g</span>
                <span style={{ color: '#34A853' }}>l</span>
                <span style={{ color: '#EA4335' }}>e</span>
            </div>

            <form onSubmit={handleSearch} style={{ width: '100%', maxWidth: '500px', position: 'relative', marginBottom: '40px' }}>
                <Search size={20} color="var(--text-secondary)" style={{ position: 'absolute', left: '16px', top: '14px' }} />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search Google or type a URL"
                    style={{
                        width: '100%', padding: '12px 20px 12px 48px',
                        borderRadius: '24px', border: '1px solid var(--border-color)',
                        fontSize: '1rem', outline: 'none',
                        boxShadow: '0 1px 6px var(--shadow-color)',
                        background: 'var(--input-bg)', color: 'var(--text-color)'
                    }}
                />
            </form>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
                {shortcuts.map((s) => (
                    <div
                        key={s.name}
                        onClick={() => onNavigate(s.url)}
                        style={{
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px',
                            cursor: 'pointer', padding: '10px', borderRadius: '8px'
                        }}
                    >
                        <div style={{
                            width: '48px', height: '48px', borderRadius: '50%',
                            background: 'var(--glass-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '1.2rem', fontWeight: 'bold', color: s.color,
                            border: '1px solid var(--border-color)'
                        }}>
                            {s.icon}
                        </div>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-color)' }}>{s.name}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const Browser = () => {
    const [tabs, setTabs] = useState([
        { id: 1, title: 'New Tab', url: 'heroos://newtab', active: true, favicon: null }
    ]);
    const [activeTabId, setActiveTabId] = useState(1);
    const [urlInput, setUrlInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const iframeRef = useRef(null);

    const activeTab = tabs.find(t => t.id === activeTabId);

    // Sync input with active tab url
    useEffect(() => {
        if (activeTab) {
            setUrlInput(activeTab.url === 'heroos://newtab' ? '' : activeTab.url);
        }
    }, [activeTabId, tabs]); // Careful with tabs dep

    const handleNavigate = (url) => {
        setIsLoading(true);
        let finalUrl = url;

        if (!url) return;

        if (url.includes('heroos://')) {
            // internal
        } else if (!url.startsWith('http')) {
            if (url.includes('.') && !url.includes(' ')) {
                finalUrl = `https://${url}`;
            } else {
                finalUrl = `https://www.google.com/search?q=${encodeURIComponent(url)}&igu=1`;
            }
        } else if (url.includes('google.com') && !url.includes('igu=1')) {
            finalUrl = url + (url.includes('?') ? '&' : '?') + 'igu=1';
        }

        updateTab(activeTabId, { url: finalUrl, title: finalUrl }); // Title will update on load?
        setIsLoading(false); // In reality, iframe load event handles this
    };

    const updateTab = (id, updates) => {
        setTabs(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    };

    const handleAddTab = () => {
        const newId = Date.now();
        const newTab = { id: newId, title: 'New Tab', url: 'heroos://newtab', active: true };
        setTabs(prev => prev.map(t => ({ ...t, active: false })).concat(newTab));
        setActiveTabId(newId);
    };

    const handleCloseTab = (e, id) => {
        e.stopPropagation();
        if (tabs.length === 1) {
            // Don't close last tab, just reset it
            updateTab(id, { url: 'heroos://newtab', title: 'New Tab' });
            return;
        }

        const newTabs = tabs.filter(t => t.id !== id);
        if (id === activeTabId) {
            const lastTab = newTabs[newTabs.length - 1];
            setActiveTabId(lastTab.id);
            setTabs(newTabs.map(t => t.id === lastTab.id ? { ...t, active: true } : { ...t, active: false }));
        } else {
            setTabs(newTabs);
        }
    };

    const handleTabClick = (id) => {
        setActiveTabId(id);
        setTabs(prev => prev.map(t => ({ ...t, active: t.id === id })));
    };

    const handleReload = () => {
        if (activeTab.url === 'heroos://newtab') return;
        setIsLoading(true);
        const currentUrl = activeTab.url;
        updateTab(activeTabId, { url: '' }); // Force unmount/remount
        setTimeout(() => {
            updateTab(activeTabId, { url: currentUrl });
        }, 50);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg-color)', fontFamily: 'Segoe UI, sans-serif' }}>
            {/* Chrome-like Tab Bar */}
            <div style={{ display: 'flex', alignItems: 'flex-end', background: 'var(--glass-bg)', padding: '8px 8px 0 8px', gap: '0', height: '40px', borderBottom: '1px solid var(--border-color)' }}>
                {tabs.map(tab => (
                    <div
                        key={tab.id}
                        onClick={() => handleTabClick(tab.id)}
                        style={{
                            padding: '0 12px',
                            borderRadius: '8px 8px 0 0',
                            maxWidth: '240px',
                            minWidth: '140px',
                            flex: 1,
                            height: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            cursor: 'pointer',
                            fontSize: '0.8rem',
                            color: tab.active ? 'var(--text-color)' : 'var(--text-secondary)',
                            background: tab.active ? 'var(--window-bg)' : 'transparent',
                            position: 'relative',
                            boxShadow: tab.active ? '0 0 4px var(--shadow-color)' : 'none',
                            transition: 'background 0.2s',
                            borderTop: tab.active ? '1px solid var(--border-color)' : 'none',
                            borderLeft: tab.active ? '1px solid var(--border-color)' : 'none',
                            borderRight: tab.active ? '1px solid var(--border-color)' : 'none',
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden', flex: 1 }}>
                            {tab.url.includes('google') ? <span style={{ color: '#4285F4' }}>G</span> : <Globe size={14} color="var(--text-secondary)" />}
                            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {tab.title || 'New Tab'}
                            </span>
                        </div>
                        <div
                            onClick={(e) => handleCloseTab(e, tab.id)}
                            style={{
                                width: '16px', height: '16px', borderRadius: '50%',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '10px', marginLeft: '6px',
                                background: 'transparent',
                                color: 'var(--text-secondary)'
                            }}
                            className="tab-close-btn"
                        >
                            <X size={10} />
                        </div>
                        {/* Separator for inactive tabs */}
                        {!tab.active && <div style={{ position: 'absolute', right: 0, height: '16px', width: '1px', background: 'var(--border-color)' }} />}
                    </div>
                ))}
                <button
                    onClick={handleAddTab}
                    style={{
                        background: 'transparent', border: 'none', cursor: 'pointer',
                        padding: '6px', marginLeft: '4px', color: 'var(--text-secondary)'
                    }}
                >
                    <Plus size={20} />
                </button>
            </div>

            {/* Address Bar */}
            <div style={{ background: 'var(--window-bg)', padding: '8px', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 1px 3px var(--shadow-color)', zIndex: 10, borderBottom: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', gap: '4px' }}>
                    <button onClick={() => { }} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: '50%' }}><ArrowLeft size={16} color="var(--text-secondary)" /></button>
                    <button onClick={() => { }} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: '50%' }}><ArrowRight size={16} color="var(--text-secondary)" /></button>
                    <button onClick={handleReload} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: '50%' }}>
                        {isLoading ? <X size={14} color="var(--text-secondary)" /> : <RotateCw size={14} color="var(--text-secondary)" />}
                    </button>
                    <button onClick={() => updateTab(activeTabId, { url: 'heroos://newtab', title: 'New Tab' })} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: '50%' }}><Home size={16} color="var(--text-secondary)" /></button>
                </div>

                <div style={{
                    flex: 1,
                    background: 'var(--input-bg)',
                    borderRadius: '20px',
                    padding: '6px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    border: '1px solid var(--border-color)',
                    cursor: 'text'
                }}>
                    <Lock size={12} color="var(--text-secondary)" />
                    <input
                        type="text"
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleNavigate(urlInput)}
                        onFocus={(e) => e.target.select()}
                        placeholder="Search Google or type a URL"
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--text-color)',
                            width: '100%',
                            fontSize: '0.9rem',
                            outline: 'none',
                            fontFamily: 'inherit'
                        }}
                    />
                    <Star size={16} color="var(--text-secondary)" style={{ cursor: 'pointer' }} />
                </div>
            </div>

            {/* Content */}
            <div style={{ flex: 1, position: 'relative', background: 'white' }}>
                {activeTab.url === 'heroos://newtab' ? (
                    <StartPage onNavigate={handleNavigate} />
                ) : (
                    activeTab.url && (
                        <>
                            {isLoading && (
                                <div style={{ height: '3px', width: '100%', background: 'var(--border-color)', overflow: 'hidden' }}>
                                    <div style={{ height: '100%', background: 'var(--accent-color)', width: '50%', animation: 'loading 1s infinite' }}></div>
                                    <style>{`@keyframes loading { 0% { transform: translateX(-100%); } 100% { transform: translateX(200%); } }`}</style>
                                </div>
                            )}
                            <iframe
                                ref={iframeRef}
                                src={activeTab.url}
                                onLoad={() => setIsLoading(false)}
                                title="Content"
                                style={{ width: '100%', height: '100%', border: 'none' }}
                                sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-presentation"
                            />
                        </>
                    )
                )}
            </div>
        </div>
    );
};

export default Browser;
