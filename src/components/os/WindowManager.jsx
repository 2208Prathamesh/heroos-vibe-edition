import React, { useState } from 'react';
import { motion, Reorder, useDragControls } from 'framer-motion';
import { X, Minus, Square, Maximize2 } from 'lucide-react';

const Window = ({ id, title, icon: Icon, children, onClose, onMinimize, zIndex, onFocus }) => {
    const [position, setPosition] = useState({ x: 100 + Math.random() * 200, y: 50 + Math.random() * 100 });
    const [size, setSize] = useState({ width: 800, height: 600 });
    const [isMaximized, setIsMaximized] = useState(false);
    const dragControls = useDragControls();

    const handleMaximize = () => {
        setIsMaximized(!isMaximized);
    };

    return (
        <motion.div
            drag
            dragControls={dragControls}
            dragListener={false}
            dragMomentum={false}
            style={{
                position: 'absolute',
                left: isMaximized ? 0 : position.x,
                top: isMaximized ? 0 : position.y,
                width: isMaximized ? '100%' : size.width,
                height: isMaximized ? 'calc(100% - 58px)' : size.height,
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                borderRadius: isMaximized ? '0' : '12px',
                overflow: 'hidden',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(0, 0, 0, 0.1)',
                zIndex: zIndex,
                display: 'flex',
                flexDirection: 'column'
            }}
            onMouseDown={onFocus}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
            {/* Title Bar */}
            <div
                onPointerDown={(e) => dragControls.start(e)}
                style={{
                    height: '40px',
                    background: 'rgba(240, 240, 245, 0.8)',
                    borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 15px',
                    cursor: 'move',
                    userSelect: 'none'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {Icon && <Icon size={16} color="#333" />}
                    <span style={{ fontSize: '0.85rem', color: '#333', fontWeight: '500' }}>{title}</span>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <motion.button
                        whileHover={{ background: 'rgba(0,0,0,0.1)' }}
                        whileTap={{ scale: 0.9 }}
                        onClick={onMinimize}
                        style={{
                            width: '32px',
                            height: '32px',
                            border: 'none',
                            background: 'transparent',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <Minus size={14} color="#333" />
                    </motion.button>
                    <motion.button
                        whileHover={{ background: 'rgba(0,0,0,0.1)' }}
                        whileTap={{ scale: 0.9 }}
                        onClick={handleMaximize}
                        style={{
                            width: '32px',
                            height: '32px',
                            border: 'none',
                            background: 'transparent',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        {isMaximized ? <Minimize2 size={14} color="#333" /> : <Square size={14} color="#333" />}
                    </motion.button>
                    <motion.button
                        whileHover={{ background: '#e81123' }}
                        whileTap={{ scale: 0.9 }}
                        onClick={onClose}
                        style={{
                            width: '32px',
                            height: '32px',
                            border: 'none',
                            background: 'transparent',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                        onMouseEnter={(e) => e.currentTarget.querySelector('svg').style.color = 'white'}
                        onMouseLeave={(e) => e.currentTarget.querySelector('svg').style.color = '#333'}
                    >
                        <X size={14} color="#333" />
                    </motion.button>
                </div>
            </div>

            {/* Content */}
            <div style={{ flex: 1, overflow: 'auto', background: 'white' }}>
                {children}
            </div>
        </motion.div>
    );
};

const WindowManager = () => {
    const [windows, setWindows] = useState([]);
    const [nextZIndex, setNextZIndex] = useState(1000);

    const openWindow = (windowConfig) => {
        const newWindow = {
            id: Date.now(),
            ...windowConfig,
            zIndex: nextZIndex
        };
        setWindows([...windows, newWindow]);
        setNextZIndex(nextZIndex + 1);
    };

    const closeWindow = (id) => {
        setWindows(windows.filter(w => w.id !== id));
    };

    const minimizeWindow = (id) => {
        // In a real implementation, this would minimize to taskbar
        closeWindow(id);
    };

    const focusWindow = (id) => {
        setWindows(windows.map(w =>
            w.id === id ? { ...w, zIndex: nextZIndex } : w
        ));
        setNextZIndex(nextZIndex + 1);
    };

    return (
        <>
            {windows.map(window => (
                <Window
                    key={window.id}
                    id={window.id}
                    title={window.title}
                    icon={window.icon}
                    zIndex={window.zIndex}
                    onClose={() => closeWindow(window.id)}
                    onMinimize={() => minimizeWindow(window.id)}
                    onFocus={() => focusWindow(window.id)}
                >
                    {window.content}
                </Window>
            ))}
        </>
    );
};

export default WindowManager;
