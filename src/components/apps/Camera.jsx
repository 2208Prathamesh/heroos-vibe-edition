import React, { useState, useRef, useEffect } from 'react';
import { Camera as CameraIcon, Video, RefreshCw, Circle, Image as ImageIcon } from 'lucide-react';
import { useFileSystem } from '../../context/FileSystemContext';

const Camera = () => {
    const { addFile } = useFileSystem();
    const videoRef = useRef(null);
    const [stream, setStream] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const [mode, setMode] = useState('photo'); // photo, video
    const [capturedImage, setCapturedImage] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        startCamera();
        return () => stopCamera();
    }, []);

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
            setError(null);
        } catch (err) {
            console.error("Camera access denied:", err);
            setError("Camera access denied or not available. Please checking settings.");
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    };

    const takePhoto = () => {
        if (!videoRef.current) return;
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.scale(-1, 1); // Flip horizontal like a mirror
        ctx.drawImage(videoRef.current, -canvas.width, 0, canvas.width, canvas.height);

        const dataUrl = canvas.toDataURL('image/jpeg');
        setCapturedImage(dataUrl);

        // Auto save to Pictures
        addFile({
            name: `IMG_${Date.now()}.jpg`,
            type: 'image/jpeg',
            size: Math.round((dataUrl.length - 22) * 0.75),
            category: 'Images',
            content: dataUrl
        });

        // Flash effect could be added here
        setTimeout(() => setCapturedImage(null), 2000);
    };

    const toggleRecording = () => {
        // Mock recording basic
        setIsRecording(!isRecording);
    };

    return (
        <div style={{ background: '#000', height: '100%', display: 'flex', flexDirection: 'column', color: 'white' }}>
            {/* Viewfinder */}
            <div style={{ flex: 1, position: 'relative', overflow: 'hidden', background: '#111' }}>
                {error ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column', gap: '20px', color: '#888' }}>
                        <CameraIcon size={48} />
                        <div>{error}</div>
                        <button onClick={startCamera} style={{ padding: '10px 20px', background: '#333', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Retry</button>
                    </div>
                ) : (
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }}
                    />
                )}

                {/* Captured Preview Overlay */}
                {capturedImage && (
                    <div style={{ position: 'absolute', inset: 0, background: 'black', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'flash 0.5s ease-out' }}>
                        <img src={capturedImage} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                        <style>{`@keyframes flash { 0% { opacity: 1; background: white; } 100% { opacity: 0; background: transparent; } }`}</style>
                    </div>
                )}
            </div>

            {/* Controls */}
            <div style={{ height: '100px', background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '40px', paddingBottom: '20px' }}>
                <div style={{ display: 'flex', gap: '20px', color: '#aaa', fontSize: '0.9rem' }}>
                    <button onClick={() => setMode('video')} style={{ background: 'transparent', border: 'none', color: mode === 'video' ? '#e81123' : '#aaa', fontWeight: mode === 'video' ? 'bold' : 'normal', cursor: 'pointer' }}>VIDEO</button>
                    <button onClick={() => setMode('photo')} style={{ background: 'transparent', border: 'none', color: mode === 'photo' ? 'white' : '#aaa', fontWeight: mode === 'photo' ? 'bold' : 'normal', cursor: 'pointer' }}>PHOTO</button>
                </div>

                <button
                    onClick={mode === 'photo' ? takePhoto : toggleRecording}
                    style={{
                        width: '64px', height: '64px', borderRadius: '50%',
                        background: mode === 'photo' ? 'white' : (isRecording ? '#e81123' : 'white'),
                        border: '4px solid rgba(255,255,255,0.3)',
                        cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'transform 0.1s'
                    }}
                >
                    {mode === 'video' && isRecording && <div style={{ width: '24px', height: '24px', background: 'white', borderRadius: '4px' }} />}
                    {mode === 'photo' && <div style={{ width: '56px', height: '56px', borderRadius: '50%', border: '2px solid black' }} />}
                </button>

                <button onClick={() => {
                    // Switch camera (mock)
                    stopCamera();
                    setTimeout(startCamera, 500);
                }}
                    style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', padding: '10px' }}>
                    <RefreshCw size={24} />
                </button>
            </div>
        </div>
    );
};

export default Camera;
