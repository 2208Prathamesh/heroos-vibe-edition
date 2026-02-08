import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Square, Maximize2 } from 'lucide-react';

const TASKBAR_WIDTH = 80; // 72px + padding
const PADDING = 10;

const Window = ({ app, onClose, onMinimize, onFocus, isActive, zIndex, children }) => {
    const [isMaximized, setIsMaximized] = useState(false);
    const windowWidth = typeof window !== 'undefined' ? window.innerWidth : 1000;
    const windowHeight = typeof window !== 'undefined' ? window.innerHeight : 800;

    return (
        <motion.div
            drag={!isMaximized}
            dragConstraints={{
                left: TASKBAR_WIDTH,
                right: windowWidth - 100,
                top: PADDING,
                bottom: windowHeight - 100
            }}
            dragElastic={0.1}
            dragMomentum={false}
            initial={{ scale: 0.9, opacity: 0, y: 20, x: TASKBAR_WIDTH + 40 }}
            animate={{
                scale: 1,
                opacity: 1,
                y: isMaximized ? PADDING : (app.y || 40),
                x: isMaximized ? TASKBAR_WIDTH : (app.x ? Math.max(app.x, TASKBAR_WIDTH) : TASKBAR_WIDTH + 40),
                width: isMaximized ? `calc(100vw - ${TASKBAR_WIDTH + PADDING}px)` : (app.width || '800px'),
                height: isMaximized ? `calc(100vh - ${PADDING * 2}px)` : (app.height || '600px'),
                borderRadius: '12px'
            }}
            exit={{ scale: 0.9, opacity: 0, transition: { duration: 0.2 } }}
            style={{
                position: 'absolute',
                background: 'var(--window-bg)',
                backdropFilter: 'blur(20px)',
                border: '1px solid var(--border-color)',
                boxShadow: isActive ? '0 20px 50px var(--shadow-color)' : '0 10px 30px var(--shadow-color)',
                overflow: 'hidden',
                zIndex: zIndex,
                display: 'flex',
                flexDirection: 'column',
                color: 'var(--text-color)'
            }}
            onMouseDown={onFocus}
        >
            {/* Window Header */}
            <div
                className="window-header"
                onDoubleClick={() => setIsMaximized(!isMaximized)}
                style={{
                    height: '40px',
                    background: 'var(--hover-bg)',
                    borderBottom: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 16px',
                    cursor: isMaximized ? 'default' : 'grab',
                    userSelect: 'none'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {app.icon && <app.icon size={16} color="var(--text-color)" />}
                    <span style={{ color: 'var(--text-color)', fontSize: '0.85rem', fontWeight: '500' }}>{app.title}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                        onClick={(e) => { e.stopPropagation(); onMinimize(); }}
                        style={{ all: 'unset', padding: '6px', borderRadius: '4px', cursor: 'pointer', display: 'flex', color: 'var(--text-secondary)' }}
                    >
                        <Minus size={14} />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); setIsMaximized(!isMaximized); }}
                        style={{ all: 'unset', padding: '6px', borderRadius: '4px', cursor: 'pointer', display: 'flex', color: 'var(--text-secondary)' }}
                    >
                        {isMaximized ? <MinimizeIcon size={14} /> : <Square size={12} />}
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onClose(); }}
                        style={{ all: 'unset', padding: '6px', borderRadius: '4px', cursor: 'pointer', display: 'flex', color: '#ff5f57', background: 'rgba(255, 95, 87, 0.1)' }}
                    >
                        <X size={14} />
                    </button>
                </div>
            </div>

            {/* Window Content */}
            <div style={{ flex: 1, overflow: 'auto', position: 'relative' }}>
                {children}
            </div>
        </motion.div>
    );
};

const MinimizeIcon = ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
    </svg>
);

export default Window;
