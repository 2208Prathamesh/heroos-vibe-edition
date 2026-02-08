import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Shuffle, Repeat } from 'lucide-react';
import { useFileSystem } from '../../context/FileSystemContext';

const MediaPlayer = ({ initialTab = 'music' }) => {
    const { files } = useFileSystem();
    const [activeTab, setActiveTab] = useState(initialTab); // music, video
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTrack, setCurrentTrack] = useState(null);
    const audioRef = useRef(null);
    const videoRef = useRef(null);
    const [volume, setVolume] = useState(0.8);
    const [progress, setProgress] = useState(0);

    // Get media files
    const musicFiles = files.filter(f => f.type.includes('audio') || f.category === 'Music');
    const videoFiles = files.filter(f => f.type.includes('video') || f.category === 'Videos');

    // Add mock if empty
    const mockMusic = [
        { id: 'm1', name: 'Ambient Chill', artist: 'Unknown', duration: '3:45', content: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
        { id: 'm2', name: 'Techno Beat', artist: 'DJ Hero', duration: '4:20', content: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' }
    ];

    // Combine real + mock for demo
    const allMusic = musicFiles.length > 0 ? musicFiles : mockMusic;

    const playTrack = (track) => {
        if (currentTrack?.id === track.id) {
            setIsPlaying(!isPlaying);
            if (activeTab === 'music' && audioRef.current) {
                isPlaying ? audioRef.current.pause() : audioRef.current.play();
            }
            // Video logic handled separately
        } else {
            setCurrentTrack(track);
            setIsPlaying(true);
            setProgress(0);
        }
    };

    useEffect(() => {
        if (activeTab === 'music' && currentTrack && audioRef.current) {
            if (isPlaying) {
                audioRef.current.play().catch(e => console.error("Play error", e));
            } else {
                audioRef.current.pause();
            }
        }
    }, [currentTrack, isPlaying, activeTab]);

    const handleTimeUpdate = (e) => {
        const { currentTime, duration } = e.target;
        setProgress((currentTime / duration) * 100);
    };

    return (
        <div style={{ display: 'flex', height: '100%', background: '#121212', color: 'white', fontFamily: 'Segoe UI, sans-serif' }}>
            {/* Sidebar */}
            <div style={{ width: '200px', background: '#000', padding: '20px' }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '30px', color: '#1DB954' }}>Media Player</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <button onClick={() => setActiveTab('music')} style={{ textAlign: 'left', padding: '10px', background: activeTab === 'music' ? '#333' : 'transparent', border: 'none', color: activeTab === 'music' ? 'white' : '#aaa', cursor: 'pointer', borderRadius: '4px' }}>Music Library</button>
                    <button onClick={() => setActiveTab('video')} style={{ textAlign: 'left', padding: '10px', background: activeTab === 'video' ? '#333' : 'transparent', border: 'none', color: activeTab === 'video' ? 'white' : '#aaa', cursor: 'pointer', borderRadius: '4px' }}>Videos</button>
                </div>
            </div>

            {/* Content */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                {activeTab === 'music' ? (
                    <div style={{ flex: 1, padding: '30px', overflowY: 'auto' }}>
                        <h2 style={{ fontSize: '2rem', marginBottom: '20px' }}>Your Library</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
                            {allMusic.map(track => (
                                <div key={track.id} onClick={() => playTrack(track)} style={{ background: '#181818', padding: '16px', borderRadius: '8px', cursor: 'pointer', transition: 'background 0.2s', '&:hover': { background: '#282828' } }}>
                                    <div style={{ width: '100%', aspectRatio: '1', background: '#333', marginBottom: '16px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Volume2 size={40} color="#555" />
                                    </div>
                                    <div style={{ fontWeight: '600', marginBottom: '4px' }}>{track.name}</div>
                                    <div style={{ fontSize: '0.85rem', color: '#aaa' }}>{track.artist || 'Unknown Artist'}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000' }}>
                        <div style={{ color: '#aaa' }}>No videos found. Check FileManager to upload.</div>
                    </div>
                )}

                {/* Player Bar */}
                {activeTab === 'music' && currentTrack && (
                    <div style={{ height: '90px', background: '#181818', borderTop: '1px solid #282828', display: 'flex', alignItems: 'center', padding: '0 20px', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', width: '30%' }}>
                            <div style={{ width: '56px', height: '56px', background: '#333', borderRadius: '4px' }} />
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <div style={{ fontSize: '0.9rem', fontWeight: '600' }}>{currentTrack.name}</div>
                                <div style={{ fontSize: '0.75rem', color: '#aaa' }}>{currentTrack.artist || 'Unknown'}</div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '40%' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '8px' }}>
                                <Shuffle size={16} color="#aaa" />
                                <SkipBack size={20} color="#aaa" />
                                <button onClick={() => setIsPlaying(!isPlaying)} style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                    {isPlaying ? <Pause size={16} color="black" /> : <Play size={16} color="black" style={{ marginLeft: '2px' }} />}
                                </button>
                                <SkipForward size={20} color="#aaa" />
                                <Repeat size={16} color="#aaa" />
                            </div>
                            <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: '#aaa' }}>
                                <span>0:00</span>
                                <div style={{ flex: 1, height: '4px', background: '#555', borderRadius: '2px', overflow: 'hidden' }}>
                                    <div style={{ width: `${progress}%`, height: '100%', background: 'white' }} />
                                </div>
                                <span>{currentTrack.duration || '3:45'}</span>
                            </div>
                        </div>

                        <div style={{ width: '30%', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '10px' }}>
                            <Volume2 size={20} color="#aaa" />
                            <div style={{ width: '100px', height: '4px', background: '#555', borderRadius: '2px' }}>
                                <div style={{ width: `${volume * 100}%`, height: '100%', background: 'white' }} />
                            </div>
                        </div>

                        <audio
                            ref={audioRef}
                            src={currentTrack.content}
                            onTimeUpdate={handleTimeUpdate}
                            onEnded={() => setIsPlaying(false)}
                            onLoadedMetadata={(e) => {
                                // optional duration set
                            }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default MediaPlayer;
