import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Lock, ArrowRight, Power, RefreshCw, Eye, EyeOff, UserPlus, HelpCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/api';
import { X, Send, AlertCircle, CheckCircle } from 'lucide-react';

const LoginScreen = ({ onLoginSuccess, onPowerOff, onRestart }) => {
    const { login, register } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [showPassword, setShowPassword] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);

    const [signUpForm, setSignUpForm] = useState({ username: '', password: '', name: '', email: '', confirmPassword: '' });

    // Support Modal State
    const [showSupportModal, setShowSupportModal] = useState(false);
    const [supportForm, setSupportForm] = useState({ name: '', email: '', subject: '', message: '' });
    const [supportStatus, setSupportStatus] = useState('idle'); // idle, submitting, success, error

    const handleSupportSubmit = async (e) => {
        e.preventDefault();
        setSupportStatus('submitting');
        try {
            const res = await apiService.sendSupport({
                ...supportForm,
                type: 'Login Issue'
            });
            if (res.success) {
                setSupportStatus('success');
                setTimeout(() => {
                    setShowSupportModal(false);
                    setSupportStatus('idle');
                    setSupportForm({ name: '', email: '', subject: '', message: '' });
                }, 3000);
            } else {
                setSupportStatus('error');
            }
        } catch (err) {
            setSupportStatus('error');
        }
    };

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!username || !password) return;
        setIsLoading(true);
        setError('');
        setTimeout(async () => {
            const success = await login(username, password);
            if (success) {
                onLoginSuccess();
            } else {
                setError('Incorrect username or password');
                setIsLoading(false);
                setPassword('');
            }
        }, 600);
    };

    const handleGuestLogin = async () => {
        setIsLoading(true);
        const success = await login('guest', 'guest');
        if (!success) {
            await register({ username: 'guest', password: 'guest', role: 'user', name: 'Guest User' });
            await login('guest', 'guest');
        }
        onLoginSuccess();
    };

    const handleSignUp = async (e) => {
        e.preventDefault();
        if (!signUpForm.username || !signUpForm.password) {
            setError('Username and password required');
            return;
        }
        if (signUpForm.password !== signUpForm.confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        setIsLoading(true);
        const res = await register({ ...signUpForm, role: 'user' });
        if (res.success) {
            setError('');
            setIsSignUp(false);
            setSignUpForm({ username: '', password: '', name: '', confirmPassword: '' });
            setIsLoading(false);
        } else {
            setError(res.message);
            setIsLoading(false);
        }
    };

    const timeString = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    const dayString = currentTime.toLocaleDateString('en-US', { weekday: 'long' });
    const dateString = currentTime.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'url("https://images.unsplash.com/photo-1477346611705-65d1883cee1e?q=80&w=2070&auto=format&fit=crop") no-repeat center center/cover',
            display: 'flex',
            zIndex: 9999,
            fontFamily: '"Ubuntu", "Segoe UI", sans-serif',
            color: 'white',
            overflow: 'hidden'
        }}>
            {/* Particles Background Effect */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'radial-gradient(circle at 20% 50%, rgba(233, 84, 32, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(0, 120, 212, 0.15) 0%, transparent 50%)', zIndex: 0 }} />

            {/* Dark Overlay */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.65)', backdropFilter: 'blur(12px)', zIndex: 0 }} />

            {/* Left Side - Login Card (32% width) */}
            <motion.div
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.8, ease: [0.6, 0.05, 0.01, 0.9] }}
                style={{
                    width: '32%',
                    height: '100vh',
                    background: 'linear-gradient(135deg, rgba(15, 15, 25, 0.95) 0%, rgba(25, 25, 40, 0.92) 100%)',
                    backdropFilter: 'blur(60px) saturate(180%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '60px 50px',
                    position: 'relative',
                    zIndex: 1,
                    borderRight: '1px solid rgba(255,255,255,0.08)',
                    boxShadow: '30px 0 60px rgba(0,0,0,0.5)'
                }}
            >
                {/* Animated gradient orb */}
                <motion.div
                    animate={{
                        background: [
                            'radial-gradient(circle at 30% 30%, rgba(233, 84, 32, 0.15), transparent 60%)',
                            'radial-gradient(circle at 70% 70%, rgba(0, 120, 212, 0.15), transparent 60%)',
                            'radial-gradient(circle at 30% 30%, rgba(233, 84, 32, 0.15), transparent 60%)'
                        ]
                    }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, pointerEvents: 'none' }}
                />

                <AnimatePresence mode="wait">
                    {isSignUp ? (
                        /* Sign Up Form */
                        <motion.div
                            key="signup"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.4 }}
                            style={{ width: '100%', position: 'relative', zIndex: 1 }}
                        >
                            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                                <h2 style={{ fontSize: '2.8rem', marginBottom: '12px', fontWeight: '200', letterSpacing: '1px' }}>Create Account</h2>
                                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.95rem', fontWeight: '300' }}>Join the HeroOS experience</p>
                            </div>

                            <form onSubmit={handleSignUp} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                                <input type="text" placeholder="Username" value={signUpForm.username} onChange={e => setSignUpForm({ ...signUpForm, username: e.target.value })} style={modernInput} />
                                <input type="text" placeholder="Full Name" value={signUpForm.name} onChange={e => setSignUpForm({ ...signUpForm, name: e.target.value })} style={modernInput} />
                                <input type="email" placeholder="Email Address" value={signUpForm.email} onChange={e => setSignUpForm({ ...signUpForm, email: e.target.value })} style={modernInput} />
                                <input type="password" placeholder="Password" value={signUpForm.password} onChange={e => setSignUpForm({ ...signUpForm, password: e.target.value })} style={modernInput} />
                                <input type="password" placeholder="Confirm Password" value={signUpForm.confirmPassword} onChange={e => setSignUpForm({ ...signUpForm, confirmPassword: e.target.value })} style={modernInput} />

                                {error && <div style={{ color: '#ff6b6b', fontSize: '0.88rem', textAlign: 'center', padding: '8px', background: 'rgba(255,107,107,0.1)', borderRadius: '8px' }}>{error}</div>}

                                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={isLoading} style={premiumButton}>
                                    {isLoading ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} style={{ width: '20px', height: '20px', border: '2px solid white', borderTop: '2px solid transparent', borderRadius: '50%' }} /> : <><UserPlus size={20} strokeWidth={2.5} /> Create Account</>}
                                </motion.button>

                                <div style={{ textAlign: 'center', marginTop: '16px' }}>
                                    <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.92rem' }}>Already have an account? </span>
                                    <span onClick={() => { setIsSignUp(false); setError(''); }} style={{ color: '#E95420', cursor: 'pointer', fontWeight: '600', fontSize: '0.92rem' }}>Sign In</span>
                                </div>
                            </form>
                        </motion.div>
                    ) : (
                        /* Login Form */
                        <motion.div
                            key="login"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.4 }}
                            style={{ width: '100%', position: 'relative', zIndex: 1 }}
                        >
                            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                                <h2 style={{ fontSize: '2.8rem', marginBottom: '12px', fontWeight: '200', letterSpacing: '1px' }}>Welcome</h2>
                                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.95rem', fontWeight: '300' }}>Sign in to HeroOS</p>
                            </div>

                            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                                <div style={{ position: 'relative' }}>
                                    <User size={18} style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)', zIndex: 1 }} />
                                    <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} autoFocus style={{ ...modernInput, paddingLeft: '50px' }} />
                                </div>

                                <div style={{ position: 'relative' }}>
                                    <Lock size={18} style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)', zIndex: 1 }} />
                                    <input type={showPassword ? 'text' : 'password'} placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} style={{ ...modernInput, paddingLeft: '50px', paddingRight: '50px' }} />
                                    <div onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '18px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', zIndex: 1, transition: 'color 0.2s' }}>
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </div>
                                </div>

                                {error && <div style={{ color: '#ff6b6b', fontSize: '0.88rem', textAlign: 'center', padding: '8px', background: 'rgba(255,107,107,0.1)', borderRadius: '8px' }}>{error}</div>}

                                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={isLoading} style={premiumButton}>
                                    {isLoading ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} style={{ width: '20px', height: '20px', border: '2px solid white', borderTop: '2px solid transparent', borderRadius: '50%' }} /> : <><ArrowRight size={20} strokeWidth={2.5} /> Sign In</>}
                                </motion.button>
                            </form>

                            <div style={{ margin: '28px 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.15), transparent)' }} />
                                <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.78rem', fontWeight: '500', letterSpacing: '1px' }}>OR</span>
                                <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.15), transparent)' }} />
                            </div>

                            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleGuestLogin} style={guestButton}>
                                <User size={18} strokeWidth={2.5} /> Continue as Guest
                            </motion.button>

                            <div style={{ textAlign: 'center', marginTop: '28px' }}>
                                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.92rem' }}>Don't have an account? </span>
                                <span onClick={() => { setIsSignUp(true); setError(''); }} style={{ color: '#E95420', cursor: 'pointer', fontWeight: '600', fontSize: '0.92rem' }}>Sign Up</span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Right Side - Branding & Information */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 1, paddingRight: '100px' }}>
                {/* Floating particles animation */}
                <motion.div
                    animate={{
                        background: [
                            'radial-gradient(circle at 80% 20%, rgba(233, 84, 32, 0.08) 0%, transparent 50%)',
                            'radial-gradient(circle at 85% 25%, rgba(0, 120, 212, 0.08) 0%, transparent 50%)',
                            'radial-gradient(circle at 80% 20%, rgba(233, 84, 32, 0.08) 0%, transparent 50%)'
                        ]
                    }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                    style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none' }}
                />

                {/* Top Section - Minimal Premium Branding */}
                <motion.div
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
                    style={{ paddingTop: '80px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '24px' }}
                >
                    {/* Minimal Grid Logo - Animates on Hover */}
                    <motion.div
                        whileHover={{ rotate: 90, gap: '6px' }}
                        transition={{ duration: 0.4, type: "spring", stiffness: 200 }}
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(2, 1fr)',
                            gap: '4px',
                            width: '42px',
                            height: '42px',
                            cursor: 'pointer'
                        }}
                    >
                        <motion.div whileHover={{ background: '#E95420' }} style={{ background: 'white', borderRadius: '3px', opacity: 1 }} />
                        <motion.div whileHover={{ background: '#0078D4' }} style={{ background: 'white', borderRadius: '3px', opacity: 0.7 }} />
                        <motion.div whileHover={{ background: '#0078D4' }} style={{ background: 'white', borderRadius: '3px', opacity: 0.7 }} />
                        <motion.div whileHover={{ background: '#E95420' }} style={{ background: 'white', borderRadius: '3px', opacity: 0.4 }} />
                    </motion.div>

                    <div style={{ textAlign: 'right' }}>
                        <motion.h1
                            whileHover={{ scale: 1.02 }}
                            transition={{ duration: 0.2 }}
                            style={{
                                margin: 0,
                                fontSize: '2.5rem',
                                fontWeight: '200',
                                letterSpacing: '4px',
                                color: 'white',
                                lineHeight: 1,
                                cursor: 'default',
                                textShadow: '0 0 20px rgba(255,255,255,0.1)'
                            }}
                        >
                            HeroOS
                        </motion.h1>
                        <motion.div
                            whileHover={{ letterSpacing: '5px', color: 'rgba(255,255,255,0.8)' }}
                            style={{
                                fontSize: '0.7rem',
                                color: 'rgba(255,255,255,0.45)',
                                letterSpacing: '3px',
                                marginTop: '5px',
                                textTransform: 'uppercase',
                                fontWeight: '500',
                                transition: 'all 0.3s ease',
                                cursor: 'default'
                            }}
                        >
                            Vibe Edition
                        </motion.div>
                    </div>
                </motion.div>

                {/* Bottom Section - Time & Buttons */}
                <motion.div
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.8, ease: [0.6, 0.05, 0.01, 0.9] }}
                    style={{ marginTop: 'auto', paddingBottom: '80px', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '35px' }}
                >
                    {/* Time & Date */}
                    <div style={{ textAlign: 'right' }}>
                        <motion.div
                            animate={{
                                opacity: [0.92, 1, 0.92],
                                textShadow: ['0 0 30px rgba(255,255,255,0.1)', '0 0 50px rgba(255,255,255,0.2)', '0 0 30px rgba(255,255,255,0.1)']
                            }}
                            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                            style={{
                                fontSize: '4.5rem',
                                fontWeight: '100',
                                lineHeight: 1,
                                letterSpacing: '2px',
                                marginBottom: '8px',
                                fontFamily: '"Segoe UI Light", sans-serif'
                            }}
                        >
                            {timeString}
                        </motion.div>
                        <motion.div
                            style={{
                                fontSize: '1rem',
                                opacity: 0.6,
                                fontWeight: '300',
                                letterSpacing: '1px'
                            }}
                        >
                            {dayString}, {dateString}
                        </motion.div>
                    </div>

                    {/* Compact Action Buttons */}
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <motion.button
                            whileHover={{ scale: 1.05, background: 'rgba(255,255,255,0.15)' }}
                            whileTap={{ scale: 0.95 }}
                            onClick={onPowerOff}
                            style={compactButton}
                        >
                            <div style={compactIconCircle}>
                                <Power size={16} strokeWidth={2.5} />
                            </div>
                            <span style={compactLabel}>Power</span>
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.05, background: 'rgba(255,255,255,0.15)' }}
                            whileTap={{ scale: 0.95 }}
                            onClick={onRestart}
                            style={compactButton}
                        >
                            <div style={compactIconCircle}>
                                <RefreshCw size={16} strokeWidth={2.5} />
                            </div>
                            <span style={compactLabel}>Restart</span>
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.05, background: 'rgba(255,255,255,0.15)' }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowSupportModal(true)}
                            style={compactButton}
                        >
                            <div style={compactIconCircle}>
                                <HelpCircle size={16} strokeWidth={2.5} />
                            </div>
                            <span style={compactLabel}>Help</span>
                        </motion.button>
                    </div>
                </motion.div>
            </div>

            {/* Support Modal */}
            <AnimatePresence>
                {showSupportModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            style={{
                                width: '500px',
                                background: 'rgba(20, 25, 40, 0.95)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '24px',
                                padding: '40px',
                                position: 'relative',
                                boxShadow: '0 25px 80px rgba(0,0,0,0.6)'
                            }}
                        >
                            <button
                                onClick={() => setShowSupportModal(false)}
                                style={{ position: 'absolute', top: '24px', right: '24px', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', cursor: 'pointer', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}
                                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                            >
                                <X size={18} />
                            </button>

                            <h2 style={{ margin: '0 0 10px 0', fontSize: '2rem', fontWeight: '200', color: 'white', letterSpacing: '1px' }}>Contact Support</h2>
                            <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '30px' }}>Having trouble logging in? We're here to help.</p>

                            {supportStatus === 'success' ? (
                                <div style={{ textAlign: 'center', padding: '40px 0', color: '#10b981' }}>
                                    <CheckCircle size={64} style={{ marginBottom: '20px' }} />
                                    <h3 style={{ margin: '0 0 10px 0', color: 'white' }}>Request Sent!</h3>
                                    <p style={{ color: 'rgba(255,255,255,0.6)' }}>We've received your message and will update you via email.</p>
                                </div>
                            ) : (
                                <form onSubmit={handleSupportSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                        <input
                                            type="text"
                                            placeholder="Your Name"
                                            required
                                            value={supportForm.name}
                                            onChange={e => setSupportForm({ ...supportForm, name: e.target.value })}
                                            style={modernInput}
                                        />
                                        <input
                                            type="email"
                                            placeholder="Your Email"
                                            required
                                            value={supportForm.email}
                                            onChange={e => setSupportForm({ ...supportForm, email: e.target.value })}
                                            style={modernInput}
                                        />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Subject"
                                        required
                                        value={supportForm.subject}
                                        onChange={e => setSupportForm({ ...supportForm, subject: e.target.value })}
                                        style={modernInput}
                                    />
                                    <textarea
                                        placeholder="Describe your issue..."
                                        required
                                        rows={5}
                                        value={supportForm.message}
                                        onChange={e => setSupportForm({ ...supportForm, message: e.target.value })}
                                        style={{ ...modernInput, resize: 'none' }}
                                    />

                                    {supportStatus === 'error' && (
                                        <div style={{ color: '#ff6b6b', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,107,107,0.1)', padding: '10px', borderRadius: '8px' }}>
                                            <AlertCircle size={16} /> Failed to send. Please try again.
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={supportStatus === 'submitting'}
                                        style={premiumButton}
                                    >
                                        {supportStatus === 'submitting' ? 'Sending...' : <><Send size={18} /> Send Request</>}
                                    </button>
                                </form>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const modernInput = {
    width: '100%',
    padding: '16px 20px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '14px',
    color: 'white',
    fontSize: '1rem',
    outline: 'none',
    transition: 'all 0.3s ease',
    fontWeight: '400'
};

const premiumButton = {
    width: '100%',
    padding: '18px',
    background: 'linear-gradient(135deg, #E95420 0%, #C73A11 100%)',
    border: 'none',
    borderRadius: '14px',
    color: 'white',
    fontWeight: '600',
    fontSize: '1.05rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    transition: 'all 0.3s',
    boxShadow: '0 10px 30px rgba(233, 84, 32, 0.3)',
    marginTop: '8px'
};

const guestButton = {
    width: '100%',
    padding: '18px',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: '14px',
    color: 'white',
    fontWeight: '500',
    fontSize: '1.05rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    transition: 'all 0.3s'
};

const compactButton = {
    background: 'rgba(255,255,255,0.08)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '12px',
    padding: '10px 16px',
    cursor: 'pointer',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    height: '46px'
};

const compactIconCircle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'rgba(255,255,255,0.9)'
};

const compactLabel = {
    fontSize: '0.85rem',
    fontWeight: '500',
    opacity: 0.9,
    letterSpacing: '0.5px'
};

export default LoginScreen;
