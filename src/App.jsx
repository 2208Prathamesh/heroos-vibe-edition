import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import BootLoader from './components/os/BootLoader';
import LoginScreen from './components/os/LoginScreen';
import Desktop from './components/os/Desktop';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FileSystemProvider } from './context/FileSystemContext';
import ConfirmDialog from './components/common/ConfirmDialog';

const PowerButton = ({ onPowerOn }) => {
    const [isHolding, setIsHolding] = useState(false);
    const [holdProgress, setHoldProgress] = useState(0);

    useEffect(() => {
        let interval;
        if (isHolding) {
            const startTime = Date.now();
            const holdDuration = 2000; // 2 seconds

            interval = setInterval(() => {
                const elapsed = Date.now() - startTime;
                const progress = (elapsed / holdDuration) * 100;

                if (progress >= 100) {
                    setHoldProgress(100);
                    clearInterval(interval);
                    setTimeout(() => {
                        onPowerOn();
                    }, 100);
                } else {
                    setHoldProgress(progress);
                }
            }, 16); // ~60fps
        } else {
            setHoldProgress(0);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isHolding, onPowerOn]);

    const circumference = 2 * Math.PI * 48; // radius = 48
    const strokeDashoffset = circumference - (holdProgress / 100) * circumference;

    return (
        <div style={{
            width: '100%',
            height: '100vh',
            background: 'linear-gradient(135deg, #000000 0%, #0a0a0f 50%, #000000 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Subtle animated background */}
            <motion.div
                animate={{
                    opacity: [0.03, 0.06, 0.03],
                    scale: [1, 1.1, 1]
                }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '600px',
                    height: '600px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(100, 100, 120, 0.08) 0%, transparent 70%)',
                    filter: 'blur(100px)'
                }}
            />

            <div style={{ position: 'relative', zIndex: 1 }}>
                {/* Circular Progress */}
                <svg
                    width="110"
                    height="110"
                    style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%) rotate(-90deg)',
                        pointerEvents: 'none'
                    }}
                >
                    {/* Background Circle */}
                    <circle
                        cx="55"
                        cy="55"
                        r="48"
                        stroke="rgba(255,255,255,0.08)"
                        strokeWidth="2.5"
                        fill="none"
                    />
                    {/* Progress Circle */}
                    <motion.circle
                        cx="55"
                        cy="55"
                        r="48"
                        stroke="rgba(255,255,255,0.9)"
                        strokeWidth="2.5"
                        fill="none"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        style={{
                            transition: 'stroke-dashoffset 0.016s linear',
                            filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.4))'
                        }}
                    />
                </svg>

                {/* Power Button */}
                <motion.button
                    onMouseDown={() => setIsHolding(true)}
                    onMouseUp={() => setIsHolding(false)}
                    onMouseLeave={() => setIsHolding(false)}
                    onTouchStart={() => setIsHolding(true)}
                    onTouchEnd={() => setIsHolding(false)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    animate={{
                        boxShadow: isHolding
                            ? '0 0 40px rgba(255,255,255,0.2), inset 0 1px 0 rgba(255,255,255,0.2)'
                            : '0 0 20px rgba(255,255,255,0.1), inset 0 1px 0 rgba(255,255,255,0.1)'
                    }}
                    style={{
                        width: '90px',
                        height: '90px',
                        borderRadius: '50%',
                        border: '2px solid rgba(255,255,255,0.25)',
                        background: isHolding
                            ? 'rgba(255,255,255,0.1)'
                            : 'rgba(255,255,255,0.04)',
                        backdropFilter: 'blur(20px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        position: 'relative',
                        zIndex: 1
                    }}
                >
                    <motion.svg
                        width="44"
                        height="44"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="rgba(255,255,255,0.85)"
                        strokeWidth="1.8"
                        animate={{
                            opacity: isHolding ? 1 : 0.85
                        }}
                    >
                        <path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path>
                        <line x1="12" y1="2" x2="12" y2="12"></line>
                    </motion.svg>
                </motion.button>

                {/* Hold Instruction */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    style={{
                        position: 'absolute',
                        top: '130px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        color: 'rgba(255,255,255,0.45)',
                        fontSize: '0.95rem',
                        fontWeight: '300',
                        whiteSpace: 'nowrap',
                        letterSpacing: '1px',
                        textAlign: 'center'
                    }}
                >
                    {isHolding ? (
                        <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            style={{ color: 'rgba(255,255,255,0.7)' }}
                        >
                            Starting...
                        </motion.span>
                    ) : (
                        'Hold to power on'
                    )}
                </motion.div>

                {/* Progress Percentage */}
                {isHolding && holdProgress > 0 && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            color: 'rgba(255,255,255,0.6)',
                            fontSize: '1.2rem',
                            fontWeight: '300',
                            pointerEvents: 'none'
                        }}
                    >
                        {Math.round(holdProgress)}%
                    </motion.div>
                )}
            </div>
        </div>
    );
};

const OSContent = () => {
    const { user } = useAuth();
    const [powerState, setPowerState] = useState('checking'); // checking, off, booting, login, desktop, shutting-down
    const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: '', message: '', onConfirm: null, type: 'warning' });
    const [showLogin, setShowLogin] = useState(false);

    useEffect(() => {
        // Check initial power state
        const systemPowerState = localStorage.getItem('heroos_power_state');
        const hasBooted = localStorage.getItem('heroos_has_booted');
        const sessionActive = localStorage.getItem('heroos_session');

        if (systemPowerState === 'off') {
            // System is powered off
            setPowerState('off');
        } else if (hasBooted === 'true' && sessionActive && localStorage.getItem('heroos_user')) {
            // User has booted before and has active session - go straight to desktop
            setPowerState('desktop');
        } else if (hasBooted === 'true') {
            // User has booted before but no session - go to login
            setPowerState('login');
            setShowLogin(true);
        } else {
            // First time or restart - show boot sequence
            setPowerState('booting');
            localStorage.setItem('heroos_has_booted', 'true');
        }
    }, []);

    const handlePowerOn = () => {
        // Clear power state and start boot sequence
        localStorage.removeItem('heroos_power_state');
        localStorage.removeItem('heroos_has_booted');
        setPowerState('booting');
    };

    const handleRestart = () => {
        // Show restarting animation for 4 seconds
        setPowerState('restarting');
        setTimeout(() => {
            // Clear boot flag and restart
            localStorage.removeItem('heroos_has_booted');
            localStorage.removeItem('heroos_power_state');
            setPowerState('booting');
        }, 4000); // 4 seconds delay
    };

    const handlePowerOff = () => {
        // Show shutdown animation for 4 seconds
        setPowerState('shutting-down');
        setTimeout(() => {
            localStorage.removeItem('heroos_power_state');
            localStorage.setItem('heroos_has_booted', 'false'); // Set as not booted so power button shows next time
            setPowerState('off');
        }, 4000); // 4 seconds
    };

    // Confirmation wrappers for power actions
    const confirmRestart = () => {
        setConfirmDialog({
            isOpen: true,
            title: 'Restart System',
            message: 'Are you sure you want to restart HeroOS? All unsaved work will be lost.',
            type: 'warning',
            onConfirm: handleRestart
        });
    };

    const confirmPowerOff = () => {
        setConfirmDialog({
            isOpen: true,
            title: 'Shutdown System',
            message: 'Are you sure you want to shut down HeroOS? All unsaved work will be lost.',
            type: 'danger',
            onConfirm: handlePowerOff
        });
    };

    const handleBootComplete = () => {
        setPowerState('login');
        setShowLogin(true);
    };

    const handleLoginSuccess = () => {
        setShowLogin(false);
        setPowerState('desktop');
    };

    // Shutdown/Restart Animation (4 seconds)
    if (powerState === 'shutting-down' || powerState === 'restarting') {
        const isRestart = powerState === 'restarting';
        return (
            <motion.div
                key={isRestart ? "restarting" : "shutdown"}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                style={{
                    width: '100%',
                    height: '100vh',
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    zIndex: 9999,
                    background: 'linear-gradient(135deg, #000000 0%, #1a1a2e 50%, #000000 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    gap: '40px'
                }}
            >
                <div style={{ position: 'relative', width: '80px', height: '80px' }}>
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                        style={{
                            width: '100%',
                            height: '100%',
                            border: '3px solid rgba(255,255,255,0.1)',
                            borderTop: `3px solid ${isRestart ? '#0078D4' : '#E95420'}`, // Blue for restart, Orange for shutdown
                            borderRadius: '50%',
                            position: 'absolute',
                            top: 0,
                            left: 0
                        }}
                    />
                    <motion.div
                        animate={{ rotate: -360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        style={{
                            width: '70%',
                            height: '70%',
                            border: '3px solid rgba(255,255,255,0.05)',
                            borderBottom: '3px solid rgba(255,255,255,0.3)',
                            borderRadius: '50%',
                            position: 'absolute',
                            top: '15%',
                            left: '15%'
                        }}
                    />
                </div>

                <div style={{ textAlign: 'center' }}>
                    <motion.h2
                        animate={{ opacity: [0.7, 1, 0.7] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        style={{
                            color: 'white',
                            fontSize: '1.8rem',
                            fontWeight: '300',
                            letterSpacing: '2px',
                            margin: '0 0 10px 0'
                        }}
                    >
                        {isRestart ? 'Restarting' : 'Shutting Down'}
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 0.5, y: 0 }}
                        transition={{ delay: 0.5 }}
                        style={{
                            color: 'white',
                            fontSize: '0.9rem',
                            fontWeight: '300',
                            margin: 0
                        }}
                    >
                        HeroOS
                    </motion.p>
                </div>
            </motion.div>
        );
    }

    // Power Off Screen with Hold-to-Power-On
    if (powerState === 'off') {
        return <PowerButton onPowerOn={handlePowerOn} />;
    }

    // Boot Sequence
    if (powerState === 'checking' || powerState === 'booting') {
        return <BootLoader onBootComplete={handleBootComplete} />;
    }

    // Login Screen
    if (powerState === 'login' || !user || showLogin) {
        return (
            <LoginScreen
                onLoginSuccess={handleLoginSuccess}
                onPowerOff={confirmPowerOff}
                onRestart={confirmRestart}
            />
        );
    }

    const handleSignOut = () => {
        setPowerState('login');
        setShowLogin(true);
    };

    // Desktop
    return (
        <>
            <Desktop
                onSignOut={handleSignOut}
                onRestart={confirmRestart}
                onPowerOff={confirmPowerOff}
            />

            {/* Confirmation Dialog */}
            <ConfirmDialog
                isOpen={confirmDialog.isOpen}
                onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
                onConfirm={confirmDialog.onConfirm}
                title={confirmDialog.title}
                message={confirmDialog.message}
                type={confirmDialog.type}
            />
        </>
    );
};



function App() {
    return (
        <AuthProvider>
            <FileSystemProvider>
                <ThemeHandler />
                <OSContent />
            </FileSystemProvider>
        </AuthProvider>
    );
}

const ThemeHandler = () => {
    const { user } = useAuth();
    const theme = user?.settings?.theme || 'dark';

    const themes = {
        dark: {
            '--bg-color': '#121212',
            '--text-color': '#ffffff',
            '--text-secondary': 'rgba(255, 255, 255, 0.7)',
            '--border-color': 'rgba(255, 255, 255, 0.1)',
            '--glass-bg': 'rgba(30, 30, 40, 0.85)',
            '--glass-border': 'rgba(255, 255, 255, 0.1)',
            '--window-bg': 'rgba(30, 30, 40, 0.95)',
            '--taskbar-bg': 'rgba(25, 25, 30, 0.95)',
            '--accent-color': '#0078D4',
            '--hover-bg': 'rgba(255, 255, 255, 0.1)',
            '--input-bg': 'rgba(0, 0, 0, 0.3)',
            '--shadow-color': 'rgba(0, 0, 0, 0.5)'
        },
        light: {
            '--bg-color': '#f0f2f5',
            '--text-color': '#1a1a1a',
            '--text-secondary': 'rgba(0, 0, 0, 0.6)',
            '--border-color': 'rgba(0, 0, 0, 0.1)',
            '--glass-bg': 'rgba(255, 255, 255, 0.85)',
            '--glass-border': 'rgba(0, 0, 0, 0.1)',
            '--window-bg': 'rgba(255, 255, 255, 0.95)',
            '--taskbar-bg': 'rgba(240, 240, 245, 0.95)',
            '--accent-color': '#0078D4',
            '--hover-bg': 'rgba(0, 0, 0, 0.05)',
            '--input-bg': 'rgba(0, 0, 0, 0.05)',
            '--shadow-color': 'rgba(0, 0, 0, 0.15)'
        }
    };

    const currentTheme = themes[theme];

    return (
        <style>
            {`:root {
                ${Object.entries(currentTheme).map(([key, val]) => `${key}: ${val};`).join('\n')}
            }`}
        </style>
    );
};

export default App;
