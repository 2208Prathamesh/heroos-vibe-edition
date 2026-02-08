import React, { useState } from 'react';
import { Search, Grid, Star, Download, TrendingUp, Music, Video, Zap } from 'lucide-react';

const APPS = [
    { id: 1, name: 'Spotify', category: 'Music', rating: 4.8, reviews: '2M', icon: 'https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg' },
    { id: 2, name: 'Netflix', category: 'Entertainment', rating: 4.5, reviews: '1.5M', icon: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg' },
    { id: 3, name: 'WhatsApp', category: 'Communication', rating: 4.6, reviews: '5M', icon: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg' },
    { id: 4, name: 'VS Code', category: 'Developer', rating: 4.9, reviews: '500K', icon: 'https://upload.wikimedia.org/wikipedia/commons/9/9a/Visual_Studio_Code_1.35_icon.svg' },
    { id: 5, name: 'Discord', category: 'Communication', rating: 4.7, reviews: '1M', icon: 'https://assets-global.website-files.com/6257adef93867e56f84d3092/636e0a6a49cf127bf92de1e2_icon_clyde_blurple_RGB.png' },
    { id: 6, name: 'Adobe Photoshop', category: 'Design', rating: 4.8, reviews: '800K', icon: 'https://upload.wikimedia.org/wikipedia/commons/a/af/Adobe_Photoshop_CC_icon.svg' },
];

const Store = () => {
    const [activeTab, setActiveTab] = useState('home');
    const [searchQuery, setSearchQuery] = useState('');

    const filteredApps = APPS.filter(app => app.name.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <div style={{ display: 'flex', height: '100%', background: '#f5f5f5', color: '#333', fontFamily: 'Segoe UI, sans-serif' }}>
            {/* Sidebar */}
            <div style={{ width: '220px', background: 'white', borderRight: '1px solid #e0e0e0', padding: '24px 0', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '0 24px 24px 24px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.2rem', fontWeight: 'bold' }}>
                    <div style={{ padding: '6px', background: 'linear-gradient(135deg, #00C6FF 0%, #0072FF 100%)', borderRadius: '8px', color: 'white' }}><Grid size={20} /></div>
                    Store
                </div>

                <div style={{ padding: '0 12px' }}>
                    {[
                        { id: 'home', icon: Grid, label: 'Home' },
                        { id: 'apps', icon: Zap, label: 'Apps' },
                        { id: 'games', icon: TrendingUp, label: 'Games' },
                        { id: 'movies', icon: Video, label: 'Movies & TV' },
                    ].map(tab => (
                        <div
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px',
                                borderRadius: '6px', cursor: 'pointer',
                                background: activeTab === tab.id ? '#eef6fc' : 'transparent',
                                color: activeTab === tab.id ? '#0078D4' : '#444',
                                fontWeight: activeTab === tab.id ? '600' : 'normal',
                                transition: 'background 0.2s'
                            }}
                        >
                            <tab.icon size={20} />
                            {tab.label}
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Content */}
            <div style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
                    <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold' }}>Home</h1>
                    <div style={{ position: 'relative' }}>
                        <Search size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
                        <input
                            type="text"
                            placeholder="Search apps, games, movies"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ padding: '12px 16px 12px 42px', borderRadius: '8px', border: '1px solid #ddd', width: '300px', fontSize: '0.95rem', outline: 'none', background: 'white' }}
                        />
                    </div>
                </div>

                {/* Featured Banner */}
                {!searchQuery && (
                    <div style={{ height: '300px', borderRadius: '16px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', marginBottom: '40px', display: 'flex', padding: '40px', color: 'white', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ zIndex: 1, maxWidth: '50%' }}>
                            <div style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '10px', opacity: 0.8 }}>Featured App</div>
                            <h2 style={{ fontSize: '3rem', margin: '0 0 16px 0', lineHeight: 1.1 }}>Discover<br />New Worlds</h2>
                            <p style={{ fontSize: '1.1rem', opacity: 0.9, marginBottom: '24px' }}>Explore the best apps and games curated just for you.</p>
                            <button style={{ padding: '12px 24px', background: 'white', color: '#764ba2', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem' }}>Get Started</button>
                        </div>
                        {/* Decorative Circles */}
                        <div style={{ position: 'absolute', right: '-50px', top: '-50px', width: '400px', height: '400px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
                        <div style={{ position: 'absolute', right: '150px', bottom: '-100px', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
                    </div>
                )}

                {/* App Grid */}
                <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '20px' }}>Top Free Apps</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
                    {filteredApps.map(app => (
                        <div key={app.id} style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #eee', display: 'flex', gap: '16px', cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}
                            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)'; }}
                            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.02)'; }}
                        >
                            <img src={app.icon} alt={app.name} style={{ width: '64px', height: '64px', borderRadius: '12px', objectFit: 'cover', background: '#f0f0f0' }} onError={(e) => e.target.src = 'https://via.placeholder.com/64'} />
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                <div style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '4px' }}>{app.name}</div>
                                <div style={{ color: '#888', fontSize: '0.85rem', marginBottom: '8px' }}>{app.category}</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', marginBottom: 'auto' }}>
                                    <Star size={14} fill="#FFB900" color="#FFB900" />
                                    <span>{app.rating}</span>
                                    <span style={{ color: '#ccc' }}>•</span>
                                    <span style={{ color: '#888' }}>{app.reviews}</span>
                                </div>
                                <button style={{ marginTop: '12px', padding: '6px 12px', background: '#f0f0f0', color: '#0078D4', border: 'none', borderRadius: '4px', fontWeight: '600', cursor: 'pointer', width: 'fit-content' }}>Get</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Store;
