import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Windows-inspired 4-section logo component
const HeroLogo = ({ size = 60 }) => {
    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gridTemplateRows: '1fr 1fr',
            gap: '3px',
            width: size,
            height: size
        }}>
            <motion.div
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0 }}
                style={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: '2px',
                    boxShadow: '0 0 10px rgba(255,255,255,0.3)'
                }}
            />
            <motion.div
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.2 }}
                style={{
                    background: 'rgba(255, 255, 255, 0.75)',
                    borderRadius: '2px',
                    boxShadow: '0 0 8px rgba(255,255,255,0.2)'
                }}
            />
            <motion.div
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.4 }}
                style={{
                    background: 'rgba(255, 255, 255, 0.65)',
                    borderRadius: '2px',
                    boxShadow: '0 0 8px rgba(255,255,255,0.2)'
                }}
            />
            <motion.div
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
                style={{
                    background: 'rgba(255, 255, 255, 0.85)',
                    borderRadius: '2px',
                    boxShadow: '0 0 10px rgba(255,255,255,0.3)'
                }}
            />
        </div>
    );
};

const BootLoader = ({ onBootComplete }) => {
    const [bootStep, setBootStep] = useState('cli'); // cli (2s), loading (3s), welcome (1s), complete
    const [cliMessages, setCliMessages] = useState([]);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        // CLI Messages Phase - 2 seconds
        const messages = [
            '> Initializing HeroOS kernel...',
            '> Loading system drivers...',
            '> Mounting file systems...',
            '> Starting core services...',
            '> Preparing user environment...'
        ];

        let index = 0;
        const cliInterval = setInterval(() => {
            if (index < messages.length) {
                setCliMessages(prev => [...prev, messages[index]]);
                index++;
            } else {
                clearInterval(cliInterval);
                setTimeout(() => {
                    setBootStep('loading');
                }, 200);
            }
        }, 380); // ~2 seconds total (5 messages * 380ms)

        return () => clearInterval(cliInterval);
    }, []);

    useEffect(() => {
        if (bootStep === 'loading') {
            // Loading Phase - 3 seconds with random progress
            const startTime = Date.now();
            const duration = 3000; // 3 seconds

            const interval = setInterval(() => {
                const elapsed = Date.now() - startTime;
                const baseProgress = (elapsed / duration) * 100;

                // Add random variation but ensure it reaches 100%
                if (baseProgress >= 100) {
                    setProgress(100);
                    clearInterval(interval);
                    setTimeout(() => {
                        setBootStep('welcome');
                    }, 100);
                } else {
                    // Random progress with slight variations
                    const randomOffset = Math.random() * 5;
                    setProgress(Math.min(baseProgress + randomOffset, 99));
                }
            }, 100);

            return () => clearInterval(interval);
        }
    }, [bootStep]);

    useEffect(() => {
        if (bootStep === 'welcome') {
            // Welcome Phase - 1 second
            setTimeout(() => {
                setBootStep('complete');
                onBootComplete();
            }, 1000);
        }
    }, [bootStep, onBootComplete]);

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(135deg, #000000 0%, #0a0a0f 50%, #000000 100%)',
                    color: '#fff',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 9999,
                    fontFamily: 'monospace'
                }}
            >
                {/* CLI Screen - 2 seconds */}
                {bootStep === 'cli' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        style={{
                            width: '100%',
                            maxWidth: '750px',
                            padding: '40px',
                            fontSize: '1.05rem',
                            lineHeight: '1.9'
                        }}
                    >
                        {cliMessages.map((msg, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.2 }}
                                style={{
                                    color: '#0f0',
                                    marginBottom: '10px',
                                    textShadow: '0 0 8px rgba(0,255,0,0.5)'
                                }}
                            >
                                {msg}
                            </motion.div>
                        ))}
                        <motion.span
                            animate={{ opacity: [1, 0, 1] }}
                            transition={{ duration: 0.8, repeat: Infinity }}
                            style={{ color: '#0f0', textShadow: '0 0 8px rgba(0,255,0,0.5)' }}
                        >
                            _
                        </motion.span>
                    </motion.div>
                )}

                {/* Loading Screen - 3 seconds */}
                {bootStep === 'loading' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.4 }}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '40px'
                        }}
                    >
                        {/* Animated Logo */}
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: 'spring', stiffness: 120, damping: 15 }}
                        >
                            <HeroLogo size={75} />
                        </motion.div>

                        {/* OS Name */}
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            style={{ textAlign: 'center' }}
                        >
                            <h1 style={{
                                fontSize: '3rem',
                                fontWeight: '200',
                                margin: 0,
                                letterSpacing: '5px',
                                fontFamily: 'system-ui, -apple-system, sans-serif',
                                textShadow: '0 0 40px rgba(255,255,255,0.2)'
                            }}>
                                HeroOS
                            </h1>
                            <div style={{
                                fontSize: '0.9rem',
                                color: '#888',
                                marginTop: '10px',
                                letterSpacing: '2.5px',
                                fontFamily: 'system-ui, -apple-system, sans-serif',
                                fontWeight: '300'
                            }}>
                                VIBE EDITION
                            </div>
                        </motion.div>

                        {/* Progress Bar */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            style={{
                                width: '380px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '14px'
                            }}
                        >
                            <div style={{
                                width: '100%',
                                height: '2.5px',
                                background: 'rgba(255,255,255,0.08)',
                                borderRadius: '2px',
                                overflow: 'hidden',
                                position: 'relative',
                                boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.3)'
                            }}>
                                <motion.div
                                    style={{
                                        height: '100%',
                                        background: 'linear-gradient(90deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,1) 50%, rgba(255,255,255,0.9) 100%)',
                                        width: `${progress}%`,
                                        transition: 'width 0.1s linear',
                                        boxShadow: '0 0 10px rgba(255,255,255,0.5)'
                                    }}
                                />
                            </div>

                            <div style={{
                                fontSize: '0.85rem',
                                color: '#666',
                                fontFamily: 'system-ui, -apple-system, sans-serif',
                                fontWeight: '300',
                                letterSpacing: '0.5px'
                            }}>
                                Loading system... {Math.round(progress)}%
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {/* Professional Welcome Screen - 1 second */}
                {bootStep === 'welcome' && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.02 }}
                        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '35px',
                            textAlign: 'center'
                        }}
                    >
                        {/* Logo with Premium Glow */}
                        <motion.div
                            initial={{ scale: 0.85, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.1, type: 'spring', stiffness: 140, damping: 18 }}
                            style={{
                                filter: 'drop-shadow(0 0 30px rgba(255,255,255,0.15))'
                            }}
                        >
                            <HeroLogo size={100} />
                        </motion.div>

                        {/* OS Name and Edition */}
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.25, duration: 0.5 }}
                            style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}
                        >
                            <h1 style={{
                                fontSize: '4.5rem',
                                fontWeight: '100',
                                margin: 0,
                                letterSpacing: '8px',
                                fontFamily: 'system-ui, -apple-system, sans-serif',
                                textShadow: '0 0 50px rgba(255,255,255,0.25), 0 0 100px rgba(255,255,255,0.1)',
                                background: 'linear-gradient(180deg, #ffffff 0%, #e0e0e0 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text'
                            }}>
                                HeroOS
                            </h1>
                            <div style={{
                                fontSize: '1.05rem',
                                color: '#888',
                                letterSpacing: '3.5px',
                                fontFamily: 'system-ui, -apple-system, sans-serif',
                                fontWeight: '300'
                            }}>
                                VIBE EDITION
                            </div>
                        </motion.div>

                        {/* Professional Welcome Message */}
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.45, duration: 0.5 }}
                            style={{
                                fontSize: '1.4rem',
                                fontWeight: '200',
                                color: '#aaa',
                                letterSpacing: '1.5px',
                                fontFamily: 'system-ui, -apple-system, sans-serif',
                                maxWidth: '650px',
                                lineHeight: '1.7'
                            }}
                        >
                            Experience the future of computing
                        </motion.div>

                        {/* Elegant Loading Indicator */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6 }}
                            style={{
                                display: 'flex',
                                gap: '12px',
                                marginTop: '15px'
                            }}
                        >
                            {[0, 1, 2].map((i) => (
                                <motion.div
                                    key={i}
                                    animate={{
                                        scale: [1, 1.5, 1],
                                        opacity: [0.3, 1, 0.3]
                                    }}
                                    transition={{
                                        duration: 1.4,
                                        repeat: Infinity,
                                        delay: i * 0.25,
                                        ease: "easeInOut"
                                    }}
                                    style={{
                                        width: '8px',
                                        height: '8px',
                                        borderRadius: '50%',
                                        background: 'rgba(255,255,255,0.6)',
                                        boxShadow: '0 0 10px rgba(255,255,255,0.4)'
                                    }}
                                />
                            ))}
                        </motion.div>
                    </motion.div>
                )}
            </motion.div>
        </AnimatePresence>
    );
};

export default BootLoader;
