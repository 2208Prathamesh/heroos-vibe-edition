import React, { useState, useEffect } from 'react';
import { Clock as ClockIcon, Timer, StopCircle, RefreshCw, Play, Pause, RotateCcw } from 'lucide-react';

const Clock = () => {
    const [view, setView] = useState('world'); // world, stopwatch, timer
    const [time, setTime] = useState(new Date());

    // Stopwatch
    const [stopwatchTime, setStopwatchTime] = useState(0);
    const [stopwatchRunning, setStopwatchRunning] = useState(false);

    // Timer
    const [timerInput, setTimerInput] = useState(5 * 60); // seconds
    const [timerTime, setTimerTime] = useState(5 * 60);
    const [timerRunning, setTimerRunning] = useState(false);

    // Main Clock Tick
    useEffect(() => {
        const interval = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(interval);
    }, []);

    // Stopwatch logic
    useEffect(() => {
        let interval;
        if (stopwatchRunning) {
            interval = setInterval(() => setStopwatchTime(prev => prev + 10), 10);
        }
        return () => clearInterval(interval);
    }, [stopwatchRunning]);

    // Timer logic
    useEffect(() => {
        let interval;
        if (timerRunning && timerTime > 0) {
            interval = setInterval(() => setTimerTime(prev => prev - 1), 1000);
        } else if (timerTime === 0) {
            setTimerRunning(false);
            // Alarm logic here (visual)
        }
        return () => clearInterval(interval);
    }, [timerRunning, timerTime]);

    const formatTime = (ms) => {
        const mins = Math.floor(ms / 60000);
        const secs = Math.floor((ms % 60000) / 1000);
        const msPart = Math.floor((ms % 1000) / 10);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${msPart.toString().padStart(2, '0')}`;
    };

    const formatTimer = (secs) => {
        const h = Math.floor(secs / 3600);
        const m = Math.floor((secs % 3600) / 60);
        const s = secs % 60;
        return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div style={{ display: 'flex', height: '100%', background: 'var(--bg-color)', color: 'var(--text-color)', fontFamily: 'Segoe UI, sans-serif' }}>
            {/* Sidebar */}
            <div style={{ width: '60px', background: 'var(--glass-bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '20px', gap: '20px', borderRight: '1px solid var(--border-color)' }}>
                <button onClick={() => setView('world')} style={{ background: 'transparent', border: 'none', color: view === 'world' ? 'var(--accent-color)' : 'var(--text-secondary)', cursor: 'pointer' }}><ClockIcon size={24} /></button>
                <button onClick={() => setView('stopwatch')} style={{ background: 'transparent', border: 'none', color: view === 'stopwatch' ? 'var(--accent-color)' : 'var(--text-secondary)', cursor: 'pointer' }}><StopCircle size={24} /></button>
                <button onClick={() => setView('timer')} style={{ background: 'transparent', border: 'none', color: view === 'timer' ? 'var(--accent-color)' : 'var(--text-secondary)', cursor: 'pointer' }}><Timer size={24} /></button>
            </div>

            {/* Content */}
            <div style={{ flex: 1, padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                {view === 'world' && (
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>LOCAL TIME</div>
                        <div style={{ fontSize: '5rem', fontWeight: '200', lineHeight: 1, color: 'var(--text-color)' }}>
                            {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                        </div>
                        <div style={{ fontSize: '2rem', marginTop: '10px', color: 'var(--accent-color)' }}>
                            {time.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                        </div>
                    </div>
                )}

                {view === 'stopwatch' && (
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '5rem', fontWeight: '200', fontFamily: 'monospace', color: 'var(--text-color)' }}>
                            {formatTime(stopwatchTime)}
                        </div>
                        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginTop: '40px' }}>
                            <button
                                onClick={() => setStopwatchRunning(!stopwatchRunning)}
                                style={{
                                    width: '60px', height: '60px', borderRadius: '30px', border: 'none',
                                    background: stopwatchRunning ? '#e81123' : '#00cc6a',
                                    color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    boxShadow: '0 4px 10px var(--shadow-color)'
                                }}
                            >
                                {stopwatchRunning ? <Pause size={28} /> : <Play size={28} style={{ marginLeft: '4px' }} />}
                            </button>
                            <button
                                onClick={() => { setStopwatchRunning(false); setStopwatchTime(0); }}
                                style={{
                                    width: '60px', height: '60px', borderRadius: '30px', border: '1px solid var(--border-color)',
                                    background: 'var(--glass-bg)',
                                    color: 'var(--text-color)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}
                            >
                                <RotateCcw size={24} />
                            </button>
                        </div>
                    </div>
                )}

                {view === 'timer' && (
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                            {timerRunning ? 'Timer Running' : 'Timer Set'}
                        </div>
                        <div style={{ fontSize: '6rem', fontWeight: '200', fontFamily: 'monospace', color: timerTime === 0 ? '#e81123' : 'var(--text-color)' }}>
                            {formatTimer(timerTime)}
                        </div>

                        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginTop: '40px' }}>
                            {!timerRunning && (
                                <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', position: 'absolute', bottom: '20px' }}>
                                    {[1, 5, 10, 30, 60].map(m => (
                                        <button key={m} onClick={() => { setTimerInput(m * 60); setTimerTime(m * 60); }} style={{ padding: '8px 16px', borderRadius: '20px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-color)', cursor: 'pointer' }}>
                                            {m}m
                                        </button>
                                    ))}
                                </div>
                            )}

                            <button
                                onClick={() => setTimerRunning(!timerRunning)}
                                style={{
                                    width: '60px', height: '60px', borderRadius: '30px', border: 'none',
                                    background: timerRunning ? '#e81123' : 'var(--accent-color)',
                                    color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    opacity: timerTime === 0 ? 0.5 : 1,
                                    boxShadow: '0 4px 10px var(--shadow-color)'
                                }}
                                disabled={timerTime === 0}
                            >
                                {timerRunning ? <Pause size={28} /> : <Play size={28} style={{ marginLeft: '4px' }} />}
                            </button>
                            <button
                                onClick={() => { setTimerRunning(false); setTimerTime(timerInput); }}
                                style={{
                                    width: '60px', height: '60px', borderRadius: '30px', border: '1px solid var(--border-color)',
                                    background: 'var(--glass-bg)',
                                    color: 'var(--text-color)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}
                            >
                                <RotateCcw size={24} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Clock;
