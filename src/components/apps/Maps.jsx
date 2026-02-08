import React, { useState } from 'react';
import { Map, Navigation, Layers, Compass, Plus, Minus, Search, MapPin } from 'lucide-react';

const Maps = () => {
    const [zoom, setZoom] = useState(1);

    return (
        <div style={{ display: 'flex', height: '100%', flexDirection: 'column', background: '#e8eaed', fontFamily: 'Segoe UI, sans-serif' }}>
            {/* Search Bar */}
            <div style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 10, display: 'flex', gap: '10px' }}>
                <div style={{ position: 'relative', width: '300px' }}>
                    <Search size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
                    <input
                        type="text"
                        placeholder="Search Google Maps"
                        style={{ width: '100%', padding: '12px 16px 12px 42px', borderRadius: '8px', border: 'none', boxShadow: '0 2px 6px rgba(0,0,0,0.2)', fontSize: '0.95rem', outline: 'none' }}
                    />
                    <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', paddingLeft: '12px', borderLeft: '1px solid #ddd', cursor: 'pointer', color: '#0078D4' }}>
                        <Navigation size={20} />
                    </div>
                </div>
            </div>

            {/* Map Area (Mock) */}
            <div style={{ flex: 1, position: 'relative', overflow: 'hidden', cursor: 'grab' }}>
                <div
                    style={{
                        width: '100%', height: '100%',
                        backgroundImage: 'url("https://upload.wikimedia.org/wikipedia/commons/e/ec/World_map_blank_without_borders.svg")',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        transform: `scale(${zoom})`,
                        transition: 'transform 0.2s',
                        opacity: 0.6
                    }}
                />

                {/* Pins */}
                <div style={{ position: 'absolute', top: '40%', left: '30%', transform: `scale(${zoom})`, transformOrigin: 'top left' }}>
                    <MapPin size={32} color="#EA4335" fill="#EA4335" />
                </div>
                <div style={{ position: 'absolute', top: '35%', left: '70%', transform: `scale(${zoom})`, transformOrigin: 'top left' }}>
                    <MapPin size={32} color="#EA4335" fill="#EA4335" />
                </div>

                {/* Controls */}
                <div style={{ position: 'absolute', bottom: '30px', right: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <button style={{ width: '40px', height: '40px', background: 'white', border: 'none', borderRadius: '4px', boxShadow: '0 1px 4px rgba(0,0,0,0.2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Compass size={20} color="#666" /></button>
                    <button onClick={() => setZoom(z => Math.min(z + 0.5, 5))} style={{ width: '40px', height: '40px', background: 'white', border: 'none', borderRadius: '4px 4px 0 0', boxShadow: '0 1px 4px rgba(0,0,0,0.2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Plus size={20} color="#666" /></button>
                    <button onClick={() => setZoom(z => Math.max(z - 0.5, 1))} style={{ width: '40px', height: '40px', background: 'white', border: 'none', borderRadius: '0 0 4px 4px', boxShadow: '0 1px 4px rgba(0,0,0,0.2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Minus size={20} color="#666" /></button>
                </div>

                <div style={{ position: 'absolute', bottom: '30px', left: '20px', background: 'white', padding: '8px', borderRadius: '4px', boxShadow: '0 1px 4px rgba(0,0,0,0.2)', cursor: 'pointer' }}>
                    <Layers size={20} color="#666" />
                </div>
            </div>
        </div>
    );
};

export default Maps;
