import React, { useState, useEffect } from 'react';
import { Monitor, Volume2, User, Info, Lock, Moon, Shield, FileText, Check, ChevronRight, Sun, Battery, Mail, Send } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/api';
import ConfirmDialog from '../common/ConfirmDialog';

const WALLPAPERS = [
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2064&auto=format&fit=crop", // Abstract Waves
    "https://images.unsplash.com/photo-1477346611705-65d1883cee1e?q=80&w=2070&auto=format&fit=crop", // Dark Mountains
    "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop", // Earth from Space
    "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2070&auto=format&fit=crop", // Neon City
    "https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?q=80&w=2072&auto=format&fit=crop"  // Deep Sunset
];

const Settings = () => {
    const { user, users, updateSettings, changePassword, adminAddUser, adminRemoveUser, adminResetPassword, adminUpdateUserRole } = useAuth();
    const [activeTab, setActiveTab] = useState('personalization');

    // Local state for forms
    const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });
    const [passwordMsg, setPasswordMsg] = useState('');

    const [newUserForm, setNewUserForm] = useState({ username: '', password: '', role: 'user', name: '', email: '' });
    const [adminMsg, setAdminMsg] = useState('');

    // SMTP Configuration
    const [smtpForm, setSmtpForm] = useState({ host: '', port: '587', secure: false, user: '', password: '' });
    const [smtpConfigured, setSmtpConfigured] = useState(false);
    const [smtpMsg, setSmtpMsg] = useState('');
    const [testEmail, setTestEmail] = useState('');

    // Broadcast & Newsletter
    const [broadcastForm, setBroadcastForm] = useState({ subject: '', message: '' });
    const [broadcastMsg, setBroadcastMsg] = useState('');
    const [newsletterForm, setNewsletterForm] = useState({ title: '', content: '', imageUrl: '' });
    const [newsletterMsg, setNewsletterMsg] = useState('');

    // Confirmation Dialog
    const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: '', message: '', onConfirm: null, type: 'warning' });

    // Setting handlers
    const handleBrightness = (val) => updateSettings({ brightness: val });
    const handleVolume = (val) => {
        updateSettings({ volume: val });
        // Apply volume to all audio/video elements
        document.querySelectorAll('audio, video').forEach(el => {
            el.volume = val / 100;
        });
    };
    const handleTheme = (val) => updateSettings({ theme: val });
    const handleWallpaper = (url) => updateSettings({ wallpaper: url });

    const handlePasswordChange = async () => {
        if (passwordForm.new !== passwordForm.confirm) {
            setPasswordMsg('Passwords do not match');
            return;
        }
        const res = await changePassword(passwordForm.current, passwordForm.new);
        setPasswordMsg(res.message);
        if (res.success) setPasswordForm({ current: '', new: '', confirm: '' });
    };

    const handleAddUser = async () => {
        if (!newUserForm.username || !newUserForm.password) {
            setAdminMsg('Username and password required');
            return;
        }
        const res = await adminAddUser(newUserForm);
        setAdminMsg(res.message);
        if (res.success) setNewUserForm({ username: '', password: '', role: 'user', name: '', email: '' });
    };

    // Confirmation wrappers for critical actions
    const confirmRemoveUser = (userId, username) => {
        setConfirmDialog({
            isOpen: true,
            title: 'Delete User Account',
            message: `Are you sure you want to permanently delete the user "${username}"? This action cannot be undone. All user files and data will be permanently deleted.`,
            type: 'danger',
            onConfirm: () => adminRemoveUser(userId)
        });
    };

    const confirmResetPassword = (userId, username) => {
        setConfirmDialog({
            isOpen: true,
            title: 'Reset User Password',
            message: `Are you sure you want to reset the password for "${username}"? The user will receive an email with their new temporary password.`,
            type: 'warning',
            onConfirm: () => adminResetPassword(userId, '1234')
        });
    };

    const confirmSendBroadcast = () => {
        if (!broadcastForm.subject || !broadcastForm.message) {
            setBroadcastMsg('Subject and message are required');
            return;
        }
        setConfirmDialog({
            isOpen: true,
            title: 'Send Broadcast Message',
            message: `Send this broadcast to all users with email addresses? Subject: "${broadcastForm.subject}"`,
            type: 'info',
            onConfirm: handleSendBroadcast
        });
    };

    const confirmSendNewsletter = () => {
        if (!newsletterForm.title || !newsletterForm.content) {
            setNewsletterMsg('Title and content are required');
            return;
        }
        setConfirmDialog({
            isOpen: true,
            title: 'Send Newsletter',
            message: `Send this newsletter to all users with email addresses? Title: "${newsletterForm.title}"`,
            type: 'info',
            onConfirm: handleSendNewsletter
        });
    };

    // Load SMTP config on mount
    useEffect(() => {
        const loadSMTPConfig = async () => {
            if (user?.role === 'admin') {
                try {
                    const config = await apiService.getSMTPConfig();
                    if (config.configured) {
                        setSmtpConfigured(true);
                        setSmtpForm({
                            host: config.host,
                            port: config.port,
                            secure: config.secure,
                            user: config.user,
                            password: '' // Don't show password
                        });
                    }
                } catch (err) {
                    console.error('Failed to load SMTP config:', err);
                }
            }
        };
        loadSMTPConfig();
    }, [user?.role]);

    const handleSaveSMTP = async () => {
        if (!smtpForm.host || !smtpForm.port || !smtpForm.user || !smtpForm.password) {
            setSmtpMsg('All fields are required');
            return;
        }
        try {
            await apiService.saveSMTPConfig(smtpForm);
            setSmtpMsg('✅ SMTP configured successfully!');
            setSmtpConfigured(true);
            setTimeout(() => setSmtpMsg(''), 3000);
        } catch (err) {
            setSmtpMsg('❌ Failed to save SMTP configuration');
        }
    };

    const handleTestSMTP = async () => {
        if (!testEmail) {
            setSmtpMsg('Please enter a test email address');
            return;
        }
        try {
            await apiService.testSMTP(testEmail);
            setSmtpMsg('✅ Test email sent successfully! Check your inbox.');
            setTimeout(() => setSmtpMsg(''), 5000);
        } catch (err) {
            setSmtpMsg('❌ Failed to send test email. Check your configuration.');
        }
    };

    const handleSendBroadcast = async () => {
        if (!broadcastForm.subject || !broadcastForm.message) {
            setBroadcastMsg('Subject and message are required');
            return;
        }
        try {
            const result = await apiService.sendBroadcast(broadcastForm.subject, broadcastForm.message);
            setBroadcastMsg(`✅ ${result.message}`);
            setBroadcastForm({ subject: '', message: '' });
            setTimeout(() => setBroadcastMsg(''), 5000);
        } catch (err) {
            setBroadcastMsg('❌ Failed to send broadcast');
        }
    };

    const handleSendNewsletter = async () => {
        if (!newsletterForm.title || !newsletterForm.content) {
            setNewsletterMsg('Title and content are required');
            return;
        }
        try {
            const result = await apiService.sendNewsletter(newsletterForm.title, newsletterForm.content, newsletterForm.imageUrl);
            setNewsletterMsg(`✅ ${result.message}`);
            setNewsletterForm({ title: '', content: '', imageUrl: '' });
            setTimeout(() => setNewsletterMsg(''), 5000);
        } catch (err) {
            setNewsletterMsg('❌ Failed to send newsletter');
        }
    };

    const userSettings = user?.settings || {};

    const tabs = [
        { id: 'personalization', label: 'Personalization', icon: Moon },
        { id: 'system', label: 'System', icon: Monitor },
        { id: 'accounts', label: 'Accounts', icon: User },
        { id: 'privacy', label: 'Privacy & Security', icon: Lock },
        { id: 'tos', label: 'Terms of Service', icon: FileText },
        { id: 'about', label: 'About', icon: Info },
        ...(user?.role === 'admin' ? [{ id: 'admin', label: 'Admin Panel', icon: Shield }] : [])
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'personalization':
                return (
                    <div style={{ display: 'grid', gap: '30px', animation: 'fadeIn 0.3s' }}>
                        <div>
                            <h2 style={{ marginBottom: '20px', color: 'var(--text-color)' }}>Background</h2>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px' }}>
                                {WALLPAPERS.map((wp, idx) => (
                                    <div
                                        key={idx}
                                        onClick={() => handleWallpaper(wp)}
                                        style={{
                                            aspectRatio: '16/9',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            backgroundImage: `url(${wp})`,
                                            backgroundSize: 'cover',
                                            border: userSettings.wallpaper === wp ? '3px solid var(--accent-color)' : '3px solid transparent',
                                            position: 'relative',
                                            boxShadow: '0 4px 12px var(--shadow-color)',
                                            transition: 'transform 0.2s'
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                                        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                                    >
                                        {userSettings.wallpaper === wp && (
                                            <div style={{ position: 'absolute', top: '5px', right: '5px', background: 'var(--accent-color)', borderRadius: '50%', padding: '2px' }}>
                                                <Check size={12} color="white" />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h2 style={{ marginBottom: '20px', color: 'var(--text-color)' }}>Theme</h2>
                            <div style={{ display: 'flex', gap: '20px' }}>
                                <div onClick={() => handleTheme('dark')} style={{
                                    flex: 1, padding: '20px',
                                    background: '#1e1e2e',
                                    color: 'white',
                                    borderRadius: '12px',
                                    border: userSettings.theme === 'dark' ? '2px solid var(--accent-color)' : '2px solid transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px'
                                }}>
                                    <Moon size={20} />
                                    <div>
                                        <div style={{ fontWeight: 'bold' }}>Dark Mode</div>
                                        <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>Easy on the eyes</div>
                                    </div>
                                </div>
                                <div onClick={() => handleTheme('light')} style={{
                                    flex: 1, padding: '20px',
                                    background: '#f5f5f5',
                                    color: 'black',
                                    borderRadius: '12px',
                                    border: userSettings.theme === 'light' ? '2px solid var(--accent-color)' : '2px solid transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px'
                                }}>
                                    <Sun size={20} />
                                    <div>
                                        <div style={{ fontWeight: 'bold' }}>Light Mode</div>
                                        <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>Classic look</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'system':
                return (
                    <div style={{ display: 'grid', gap: '24px', animation: 'fadeIn 0.3s' }}>
                        <div style={{ background: 'var(--glass-bg)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                            <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-color)' }}><Monitor size={20} /> Display</h3>
                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', color: 'var(--text-color)' }}>
                                    <span>Brightness</span>
                                    <span>{userSettings.brightness || 100}%</span>
                                </label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-color)' }}>
                                    <Sun size={18} />
                                    <input
                                        type="range" min="0" max="100"
                                        value={userSettings.brightness || 100}
                                        onChange={(e) => handleBrightness(e.target.value)}
                                        style={{ width: '100%', accentColor: 'var(--accent-color)' }}
                                    />
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '10px', color: 'var(--text-color)' }}>Resolution</label>
                                <select style={{ width: '100%', padding: '12px', background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-color)' }}>
                                    <option>3840 x 2160 (4K)</option>
                                    <option>2560 x 1440 (2K)</option>
                                    <option>1920 x 1080 (FHD)</option>
                                </select>
                            </div>
                        </div>

                        <div style={{ background: 'var(--glass-bg)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                            <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-color)' }}><Volume2 size={20} /> Sound</h3>
                            <div>
                                <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', color: 'var(--text-color)' }}>
                                    <span>Master Volume</span>
                                    <span>{userSettings.volume || 50}%</span>
                                </label>
                                <input
                                    type="range" min="0" max="100"
                                    value={userSettings.volume || 50}
                                    onChange={(e) => handleVolume(e.target.value)}
                                    style={{ width: '100%', accentColor: 'var(--accent-color)' }}
                                />
                            </div>
                        </div>
                    </div>
                );

            case 'accounts':
                return (
                    <div style={{ display: 'grid', gap: '24px', animation: 'fadeIn 0.3s' }}>
                        <div style={{ background: 'var(--glass-bg)', padding: '30px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '24px', border: '1px solid var(--border-color)' }}>
                            <div style={{ position: 'relative' }}>
                                <img src={user?.avatar} alt="Avatar" style={{ width: '100px', height: '100px', borderRadius: '50%', border: '4px solid var(--border-color)' }} />
                                <div style={{ position: 'absolute', bottom: '0', right: '0', background: 'var(--accent-color)', padding: '6px', borderRadius: '50%', border: '2px solid var(--bg-color)' }}>
                                    <User size={14} color="white" />
                                </div>
                            </div>
                            <div>
                                <h2 style={{ fontSize: '2rem', marginBottom: '4px', color: 'var(--text-color)' }}>{user?.name || user?.username}</h2>
                                <div style={{ opacity: 0.7, fontSize: '1.1rem', color: 'var(--text-secondary)' }}>{user?.email || 'No email set'}</div>
                                <div style={{ marginTop: '12px', display: 'flex', gap: '10px' }}>
                                    <span style={{ padding: '4px 12px', background: 'var(--input-bg)', borderRadius: '20px', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-color)' }}>{user?.role}</span>
                                    <span style={{ padding: '4px 12px', background: '#00cc66', borderRadius: '20px', fontSize: '0.85rem', color: 'black', fontWeight: 'bold' }}>Active</span>
                                </div>
                            </div>
                        </div>

                        <div style={{ background: 'var(--glass-bg)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                            <h3 style={{ marginBottom: '20px', color: 'var(--text-color)' }}>Profile Information</h3>
                            <div style={{ display: 'grid', gap: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Full Name</label>
                                    <input
                                        type="text"
                                        value={user?.name || ''}
                                        onChange={(e) => updateProfile({ name: e.target.value })}
                                        placeholder="Enter your full name"
                                        style={{ width: '100%', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-color)', fontSize: '1rem' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Email Address</label>
                                    <input
                                        type="email"
                                        value={user?.email || ''}
                                        onChange={(e) => updateProfile({ email: e.target.value })}
                                        placeholder="your.email@example.com"
                                        style={{ width: '100%', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-color)', fontSize: '1rem' }}
                                    />
                                </div>
                            </div>
                        </div>

                        <div style={{ background: 'var(--glass-bg)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                            <h3 style={{ marginBottom: '20px', color: 'var(--text-color)' }}>Security Settings</h3>
                            <div style={{ display: 'grid', gap: '16px' }}>
                                <input type="password" placeholder="Current Password" value={passwordForm.current} onChange={e => setPasswordForm({ ...passwordForm, current: e.target.value })} style={{ padding: '14px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-color)', fontSize: '1rem' }} />
                                <input type="password" placeholder="New Password" value={passwordForm.new} onChange={e => setPasswordForm({ ...passwordForm, new: e.target.value })} style={{ padding: '14px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-color)', fontSize: '1rem' }} />
                                <input type="password" placeholder="Confirm Password" value={passwordForm.confirm} onChange={e => setPasswordForm({ ...passwordForm, confirm: e.target.value })} style={{ padding: '14px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-color)', fontSize: '1rem' }} />
                                <button onClick={handlePasswordChange} style={{ padding: '14px', borderRadius: '8px', border: 'none', background: 'var(--accent-color)', color: 'white', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem', marginTop: '10px' }}>Update Password</button>
                                {passwordMsg && <div style={{ padding: '10px', borderRadius: '6px', background: passwordMsg.includes('success') ? 'rgba(0,255,0,0.1)' : 'rgba(255,0,0,0.1)', color: passwordMsg.includes('success') ? '#4cc9f0' : '#ff6b6b' }}>{passwordMsg}</div>}
                            </div>
                        </div>
                    </div>
                );

            case 'privacy':
                return (
                    <div style={{ display: 'grid', gap: '24px', animation: 'fadeIn 0.3s' }}>
                        <div style={{ background: 'var(--glass-bg)', padding: '30px', borderRadius: '12px', border: '1px solid var(--border-color)', color: 'var(--text-color)' }}>
                            <h2 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}><Lock size={24} color="var(--accent-color)" /> Privacy Policy</h2>
                            <div style={{ height: '400px', overflowY: 'auto', paddingRight: '10px', opacity: 0.9, lineHeight: '1.6' }}>
                                <p style={{ marginBottom: '16px' }}><strong>Last Updated: February 2026</strong></p>
                                <p style={{ marginBottom: '16px' }}>At HeroOS, we believe that privacy is a fundamental human right. This Privacy Policy describes how HeroOS collects, uses, and discloses your personal information when you use our operating system and comprehensive application suite.</p>

                                <h3 style={{ marginTop: '24px', marginBottom: '12px' }}>1. Information We Collect</h3>
                                <p style={{ marginBottom: '16px' }}>We collect information you provide directly to us, such as when you create an account, update your profile, or use our services. This may include your name, email address, password, and settings preferences.</p>

                                <h3 style={{ marginTop: '24px', marginBottom: '12px' }}>2. How We Use Your Information</h3>
                                <ul style={{ marginLeft: '20px', marginBottom: '16px' }}>
                                    <li>To provide, maintain, and improve our services.</li>
                                    <li>To personalize your experience, such as remembering your wallpaper and theme settings.</li>
                                    <li>To communicate with you about updates, security alerts, and support messages.</li>
                                </ul>

                                <h3 style={{ marginTop: '24px', marginBottom: '12px' }}>3. Data Storage & Security</h3>
                                <p style={{ marginBottom: '16px' }}>HeroOS uses local simulated storage for your files and settings. In a real-world deployment, we would utilize industry-standard encryption protocols to protect your data both in transit and at rest.</p>

                                <h3 style={{ marginTop: '24px', marginBottom: '12px' }}>4. Your Rights</h3>
                                <p style={{ marginBottom: '16px' }}>You have the right to access, correct, or delete your personal information at any time through the Accounts settings panel.</p>
                            </div>
                        </div>
                    </div>
                );

            case 'tos':
                return (
                    <div style={{ display: 'grid', gap: '24px', animation: 'fadeIn 0.3s' }}>
                        <div style={{ background: 'var(--glass-bg)', padding: '30px', borderRadius: '12px', border: '1px solid var(--border-color)', color: 'var(--text-color)' }}>
                            <h2 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}><FileText size={24} color="var(--accent-color)" /> Terms of Service</h2>
                            <div style={{ height: '400px', overflowY: 'auto', paddingRight: '10px', opacity: 0.9, lineHeight: '1.6' }}>
                                <p style={{ marginBottom: '16px' }}>Welcome to HeroOS. By accessing or using our operating system, you agree to be bound by these Terms of Service.</p>

                                <h3 style={{ marginTop: '24px', marginBottom: '12px' }}>1. License</h3>
                                <p style={{ marginBottom: '16px' }}>Subject to your compliance with these Terms, HeroOS grants you a limited, non-exclusive, non-transferable, non-sublicensable license to use the software for your personal, non-commercial use.</p>

                                <h3 style={{ marginTop: '24px', marginBottom: '12px' }}>2. Restrictions</h3>
                                <p style={{ marginBottom: '16px' }}>You may not reverse engineer, decompile, or disassemble the software, except and only to the extent that such activity is expressly permitted by applicable law.</p>

                                <h3 style={{ marginTop: '24px', marginBottom: '12px' }}>3. User Content</h3>
                                <p style={{ marginBottom: '16px' }}>You retain all rights to the files and content you create or store using HeroOS. We claim no ownership over your data.</p>

                                <h3 style={{ marginTop: '24px', marginBottom: '12px' }}>4. Disclaimer of Warranty</h3>
                                <p style={{ marginBottom: '16px' }}>THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.</p>
                            </div>
                        </div>
                    </div>
                );

            case 'about':
                return (
                    <div style={{ animation: 'fadeIn 0.3s', color: 'var(--text-color)' }}>
                        {/* Hero Section */}
                        <div style={{ textAlign: 'center', paddingTop: '20px', marginBottom: '40px' }}>
                            <div style={{ position: 'relative', display: 'inline-block', marginBottom: '30px' }}>
                                <div style={{
                                    width: '140px',
                                    height: '140px',
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    borderRadius: '35px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '4rem',
                                    fontWeight: '900',
                                    boxShadow: '0 25px 60px rgba(102, 126, 234, 0.4)',
                                    color: 'white',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}>
                                    <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.3), transparent)' }}></div>
                                    <span style={{ position: 'relative', zIndex: 1 }}>H</span>
                                </div>
                                <div style={{ position: 'absolute', bottom: '-10px', right: '-10px', background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white', padding: '8px 18px', borderRadius: '25px', fontWeight: 'bold', fontSize: '0.85rem', boxShadow: '0 6px 15px rgba(245, 87, 108, 0.4)', letterSpacing: '1px' }}>VIBE</div>
                            </div>

                            <h1 style={{ fontSize: '3.5rem', margin: '0 0 10px 0', letterSpacing: '-2px', fontWeight: '800', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>HeroOS</h1>
                            <p style={{ fontSize: '1.3rem', opacity: 0.7, marginBottom: '10px', fontWeight: '300' }}>The Future of Web Operating Systems</p>
                            <p style={{ fontSize: '0.95rem', opacity: 0.5, fontStyle: 'italic' }}>Powered by Heropixel Network</p>
                        </div>

                        {/* System Info Cards */}
                        <div style={{ display: 'grid', gap: '16px', maxWidth: '700px', margin: '0 auto 40px auto' }}>
                            <div style={{ background: 'var(--glass-bg)', padding: '24px', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--border-color)', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                                <span style={{ opacity: 0.6, fontSize: '0.95rem' }}>Version</span>
                                <span style={{ fontFamily: 'monospace', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', padding: '6px 14px', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.9rem' }}>0.1.0 (Beta)</span>
                            </div>
                            <div style={{ background: 'var(--glass-bg)', padding: '24px', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--border-color)', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                                <span style={{ opacity: 0.6, fontSize: '0.95rem' }}>Build Number</span>
                                <span style={{ fontFamily: 'monospace', fontSize: '0.95rem' }}>260208.2200</span>
                            </div>
                            <div style={{ background: 'var(--glass-bg)', padding: '24px', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--border-color)', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                                <span style={{ opacity: 0.6, fontSize: '0.95rem' }}>Engine</span>
                                <span style={{ fontSize: '0.95rem' }}>React 18 + Vite + Node.js</span>
                            </div>
                            <div style={{ background: 'var(--glass-bg)', padding: '24px', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--border-color)', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                                <span style={{ opacity: 0.6, fontSize: '0.95rem' }}>Architecture</span>
                                <span style={{ fontSize: '0.95rem' }}>Full-Stack Web OS</span>
                            </div>
                        </div>

                        {/* Founder & Team Section */}
                        <div style={{ background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)', padding: '40px', borderRadius: '20px', marginBottom: '40px', border: '1px solid rgba(102, 126, 234, 0.2)' }}>
                            <h2 style={{ fontSize: '1.8rem', marginBottom: '25px', textAlign: 'center', fontWeight: '700' }}>🚀 Created By</h2>
                            <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
                                <div style={{ background: 'var(--glass-bg)', padding: '30px', borderRadius: '16px', border: '1px solid var(--border-color)', marginBottom: '20px' }}>
                                    <div style={{ fontSize: '3rem', marginBottom: '15px' }}>👨‍💻</div>
                                    <h3 style={{ fontSize: '1.5rem', marginBottom: '8px', fontWeight: '700' }}>Prathamesh Barbole</h3>
                                    <p style={{ opacity: 0.7, marginBottom: '15px', fontSize: '1.05rem' }}>Founder & Lead Developer</p>
                                    <div style={{ display: 'inline-block', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', padding: '8px 20px', borderRadius: '20px', fontSize: '0.9rem', fontWeight: 'bold' }}>
                                        Heropixel Network
                                    </div>
                                </div>
                                <p style={{ opacity: 0.6, fontSize: '0.95rem', lineHeight: '1.7' }}>
                                    HeroOS is a revolutionary web-based operating system that brings desktop-class functionality to your browser. Built with modern web technologies and designed for the future of computing.
                                </p>
                            </div>
                        </div>

                        {/* Features Grid */}
                        <div style={{ marginBottom: '40px' }}>
                            <h2 style={{ fontSize: '1.8rem', marginBottom: '25px', textAlign: 'center', fontWeight: '700' }}>✨ Key Features</h2>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                                {[
                                    { icon: '🎨', title: 'Modern UI/UX', desc: 'Beautiful glassmorphism design' },
                                    { icon: '📁', title: 'File Management', desc: 'Complete file system with storage' },
                                    { icon: '📧', title: 'Email System', desc: 'SMTP integration & notifications' },
                                    { icon: '👥', title: 'User Management', desc: 'Multi-user support with roles' },
                                    { icon: '🔒', title: 'Secure', desc: 'JWT authentication & encryption' },
                                    { icon: '⚡', title: 'Fast & Responsive', desc: 'Optimized performance' }
                                ].map((feature, idx) => (
                                    <div key={idx} style={{ background: 'var(--glass-bg)', padding: '25px', borderRadius: '16px', border: '1px solid var(--border-color)', textAlign: 'center', transition: 'transform 0.2s', cursor: 'default' }}>
                                        <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>{feature.icon}</div>
                                        <h4 style={{ fontSize: '1.1rem', marginBottom: '8px', fontWeight: '600' }}>{feature.title}</h4>
                                        <p style={{ opacity: 0.6, fontSize: '0.9rem' }}>{feature.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Tech Stack */}
                        <div style={{ background: 'var(--glass-bg)', padding: '30px', borderRadius: '16px', border: '1px solid var(--border-color)', marginBottom: '40px' }}>
                            <h3 style={{ fontSize: '1.5rem', marginBottom: '20px', textAlign: 'center', fontWeight: '700' }}>🛠️ Technology Stack</h3>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center' }}>
                                {['React', 'Node.js', 'Express', 'Sequelize', 'SQLite', 'JWT', 'Nodemailer', 'Vite', 'Framer Motion', 'Lucide Icons'].map((tech, idx) => (
                                    <span key={idx} style={{ background: 'rgba(102, 126, 234, 0.15)', color: '#667eea', padding: '8px 16px', borderRadius: '20px', fontSize: '0.9rem', fontWeight: '600', border: '1px solid rgba(102, 126, 234, 0.3)' }}>
                                        {tech}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <button style={{ padding: '14px 32px', borderRadius: '12px', border: '2px solid var(--border-color)', background: 'transparent', color: 'var(--text-color)', cursor: 'pointer', fontWeight: '600', fontSize: '1rem', transition: 'all 0.2s' }}>
                                📋 License Info
                            </button>
                            <button style={{ padding: '14px 32px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', fontWeight: '700', cursor: 'pointer', fontSize: '1rem', boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)', transition: 'all 0.2s' }}>
                                🔄 Check for Updates
                            </button>
                        </div>

                        {/* Copyright */}
                        <div style={{ textAlign: 'center', marginTop: '50px', paddingTop: '30px', borderTop: '1px solid var(--border-color)', opacity: 0.5, fontSize: '0.9rem' }}>
                            <p>© 2026 HeroOS - Heropixel Network. All rights reserved.</p>
                            <p style={{ marginTop: '8px' }}>Made with ❤️ by Prathamesh Barbole</p>
                        </div>
                    </div>
                );


            case 'admin':
                return (
                    <div style={{ display: 'grid', gap: '24px', animation: 'fadeIn 0.3s' }}>
                        <div style={{ background: 'linear-gradient(135deg, rgba(255, 107, 107, 0.1) 0%, rgba(255, 107, 107, 0.05) 100%)', padding: '24px', borderRadius: '12px', border: '1px solid rgba(255, 107, 107, 0.2)' }}>
                            <h2 style={{ marginBottom: '20px', color: '#ff6b6b', display: 'flex', alignItems: 'center', gap: '10px' }}><Shield size={24} /> Admin Controls</h2>
                            <p style={{ opacity: 0.8, marginBottom: '24px', color: 'var(--text-color)' }}>Manage users and system policies. Unauthorized access is prohibited.</p>

                            {/* Add User */}
                            <div style={{ marginBottom: '30px', color: 'var(--text-color)' }}>
                                <h3 style={{ marginBottom: '16px' }}>Add New User</h3>
                                <div style={{ display: 'grid', gap: '12px', gridTemplateColumns: '1fr 1fr' }}>
                                    <input type="text" placeholder="Username" value={newUserForm.username} onChange={e => setNewUserForm({ ...newUserForm, username: e.target.value })} style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-color)' }} />
                                    <input type="password" placeholder="Password" value={newUserForm.password} onChange={e => setNewUserForm({ ...newUserForm, password: e.target.value })} style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-color)' }} />
                                    <input type="text" placeholder="Full Name" value={newUserForm.name} onChange={e => setNewUserForm({ ...newUserForm, name: e.target.value })} style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-color)' }} />
                                    <input type="email" placeholder="Email Address" value={newUserForm.email} onChange={e => setNewUserForm({ ...newUserForm, email: e.target.value })} style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-color)' }} />
                                    <select value={newUserForm.role} onChange={e => setNewUserForm({ ...newUserForm, role: e.target.value })} style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-color)' }}>
                                        <option value="user">User</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                                <button onClick={handleAddUser} style={{ marginTop: '16px', padding: '10px 24px', borderRadius: '6px', border: 'none', background: '#00cc66', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}>Create User Account</button>
                                {adminMsg && <div style={{ marginTop: '10px', fontSize: '0.9rem' }}>{adminMsg}</div>}
                            </div>

                            {/* User List */}
                            <div style={{ color: 'var(--text-color)' }}>
                                <h3 style={{ marginBottom: '16px' }}>Existing Users</h3>
                                <div style={{ display: 'grid', gap: '10px' }}>
                                    {users.map(u => (
                                        <div key={u.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'var(--glass-bg)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                                <img src={u.avatar} width="40" height="40" style={{ borderRadius: '50%' }} />
                                                <div>
                                                    <div style={{ fontWeight: 'bold', fontSize: '1rem' }}>{u.username}</div>
                                                    <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>{u.role.toUpperCase()} • {u.email}</div>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', gap: '10px' }}>
                                                <button onClick={() => confirmResetPassword(u.id, u.username)} style={{ padding: '6px 12px', borderRadius: '4px', border: 'none', background: '#ffae00', color: 'white', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}>Reset Pwd</button>
                                                {u.id !== user.id && <button onClick={() => confirmRemoveUser(u.id, u.username)} style={{ padding: '6px 12px', borderRadius: '4px', border: 'none', background: '#ff6b6b', color: 'white', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}>Remove</button>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* SMTP Configuration */}
                            <div style={{ marginTop: '30px', color: 'var(--text-color)' }}>
                                <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <Mail size={20} /> Email Notifications (SMTP)
                                </h3>
                                <p style={{ fontSize: '0.9rem', opacity: 0.7, marginBottom: '16px' }}>
                                    Configure SMTP to send automated emails for user account operations (create, edit, delete, password reset).
                                </p>

                                <div style={{ background: 'var(--glass-bg)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                                    {smtpConfigured && (
                                        <div style={{ marginBottom: '16px', padding: '10px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981', borderRadius: '6px', color: '#10b981', fontSize: '0.9rem' }}>
                                            ✓ SMTP is configured and active
                                        </div>
                                    )}

                                    <div style={{ display: 'grid', gap: '12px', gridTemplateColumns: '1fr 1fr' }}>
                                        <input
                                            type="text"
                                            placeholder="SMTP Host (e.g., smtp.gmail.com)"
                                            value={smtpForm.host}
                                            onChange={e => setSmtpForm({ ...smtpForm, host: e.target.value })}
                                            style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-color)' }}
                                        />
                                        <input
                                            type="number"
                                            placeholder="Port (587, 465, 25)"
                                            value={smtpForm.port}
                                            onChange={e => setSmtpForm({ ...smtpForm, port: e.target.value })}
                                            style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-color)' }}
                                        />
                                        <input
                                            type="text"
                                            placeholder="SMTP Username/Email"
                                            value={smtpForm.user}
                                            onChange={e => setSmtpForm({ ...smtpForm, user: e.target.value })}
                                            style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-color)' }}
                                        />
                                        <input
                                            type="password"
                                            placeholder="SMTP Password/App Password"
                                            value={smtpForm.password}
                                            onChange={e => setSmtpForm({ ...smtpForm, password: e.target.value })}
                                            style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-color)' }}
                                        />
                                    </div>

                                    <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                            <input
                                                type="checkbox"
                                                checked={smtpForm.secure}
                                                onChange={e => setSmtpForm({ ...smtpForm, secure: e.target.checked })}
                                                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                            />
                                            <span style={{ fontSize: '0.9rem' }}>Use SSL/TLS (Port 465)</span>
                                        </label>
                                    </div>

                                    <button
                                        onClick={handleSaveSMTP}
                                        style={{ marginTop: '16px', padding: '10px 24px', borderRadius: '6px', border: 'none', background: '#3b82f6', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}
                                    >
                                        Save SMTP Configuration
                                    </button>

                                    {smtpMsg && <div style={{ marginTop: '12px', fontSize: '0.9rem', color: smtpMsg.includes('✅') ? '#10b981' : '#ef4444' }}>{smtpMsg}</div>}

                                    {smtpConfigured && (
                                        <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--border-color)' }}>
                                            <h4 style={{ marginBottom: '12px', fontSize: '0.95rem' }}>Test Email Configuration</h4>
                                            <div style={{ display: 'flex', gap: '12px' }}>
                                                <input
                                                    type="email"
                                                    placeholder="Enter test email address"
                                                    value={testEmail}
                                                    onChange={e => setTestEmail(e.target.value)}
                                                    style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-color)' }}
                                                />
                                                <button
                                                    onClick={handleTestSMTP}
                                                    style={{ padding: '10px 20px', borderRadius: '6px', border: 'none', background: '#10b981', color: 'white', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}
                                                >
                                                    <Send size={16} /> Send Test
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Broadcast Message */}
                            <div style={{ marginTop: '30px', color: 'var(--text-color)' }}>
                                <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <Send size={20} /> Broadcast Message
                                </h3>
                                <p style={{ fontSize: '0.9rem', opacity: 0.7, marginBottom: '16px' }}>
                                    Send an important announcement to all users with email addresses.
                                </p>

                                <div style={{ background: 'var(--glass-bg)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                                    <input
                                        type="text"
                                        placeholder="Subject"
                                        value={broadcastForm.subject}
                                        onChange={e => setBroadcastForm({ ...broadcastForm, subject: e.target.value })}
                                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-color)', marginBottom: '12px' }}
                                    />
                                    <textarea
                                        placeholder="Message content..."
                                        value={broadcastForm.message}
                                        onChange={e => setBroadcastForm({ ...broadcastForm, message: e.target.value })}
                                        rows="5"
                                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-color)', fontFamily: 'inherit', resize: 'vertical' }}
                                    />
                                    <button
                                        onClick={confirmSendBroadcast}
                                        style={{ marginTop: '12px', padding: '10px 24px', borderRadius: '6px', border: 'none', background: '#8b5cf6', color: 'white', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}
                                    >
                                        <Send size={16} /> Send Broadcast
                                    </button>
                                    {broadcastMsg && <div style={{ marginTop: '12px', fontSize: '0.9rem', color: broadcastMsg.includes('✅') ? '#10b981' : '#ef4444' }}>{broadcastMsg}</div>}
                                </div>
                            </div>

                            {/* Newsletter */}
                            <div style={{ marginTop: '30px', color: 'var(--text-color)' }}>
                                <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <FileText size={20} /> Newsletter
                                </h3>
                                <p style={{ fontSize: '0.9rem', opacity: 0.7, marginBottom: '16px' }}>
                                    Send a beautifully formatted newsletter to all users.
                                </p>

                                <div style={{ background: 'var(--glass-bg)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                                    <input
                                        type="text"
                                        placeholder="Newsletter Title"
                                        value={newsletterForm.title}
                                        onChange={e => setNewsletterForm({ ...newsletterForm, title: e.target.value })}
                                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-color)', marginBottom: '12px' }}
                                    />
                                    <input
                                        type="url"
                                        placeholder="Hero Image URL (optional)"
                                        value={newsletterForm.imageUrl}
                                        onChange={e => setNewsletterForm({ ...newsletterForm, imageUrl: e.target.value })}
                                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-color)', marginBottom: '12px' }}
                                    />
                                    <textarea
                                        placeholder="Newsletter content (supports paragraphs with double line breaks)..."
                                        value={newsletterForm.content}
                                        onChange={e => setNewsletterForm({ ...newsletterForm, content: e.target.value })}
                                        rows="8"
                                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-color)', fontFamily: 'inherit', resize: 'vertical' }}
                                    />
                                    <button
                                        onClick={confirmSendNewsletter}
                                        style={{ marginTop: '12px', padding: '10px 24px', borderRadius: '6px', border: 'none', background: '#0f172a', color: 'white', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}
                                    >
                                        <FileText size={16} /> Send Newsletter
                                    </button>
                                    {newsletterMsg && <div style={{ marginTop: '12px', fontSize: '0.9rem', color: newsletterMsg.includes('✅') ? '#10b981' : '#ef4444' }}>{newsletterMsg}</div>}
                                </div>
                            </div>
                        </div>
                    </div>
                );

            default:
                return <div>Select a setting to view details.</div>;
        }
    };

    if (!user) return <div style={{ color: 'white', padding: '20px' }}>Please log in to access Settings.</div>;

    return (
        <div style={{ display: 'flex', height: '100%', color: 'var(--text-color)', background: 'var(--bg-color)', fontFamily: '"Segoe UI", sans-serif', transition: 'background 0.3s, color 0.3s' }}>
            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                ::-webkit-scrollbar { width: 8px; }
                ::-webkit-scrollbar-track { background: transparent; }
                ::-webkit-scrollbar-thumb { background: var(--border-color); borderRadius: 4px; }
                ::-webkit-scrollbar-thumb:hover { background: var(--hover-bg); }
            `}</style>

            {/* Sidebar */}
            <div style={{
                width: '280px',
                background: 'var(--glass-bg)',
                borderRight: '1px solid var(--border-color)',
                padding: '24px 16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
            }}>
                <div style={{ padding: '0 16px 20px', borderBottom: '1px solid var(--border-color)', marginBottom: '10px' }}>
                    <h2 style={{ fontSize: '1.2rem', margin: 0, color: 'var(--text-color)' }}>Settings</h2>
                </div>

                {tabs.map((tab) => (
                    <div
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            padding: '12px 16px',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '16px',
                            cursor: 'pointer',
                            background: activeTab === tab.id ? 'var(--hover-bg)' : 'transparent',
                            color: activeTab === tab.id ? 'var(--text-color)' : 'var(--text-secondary)',
                            transition: 'all 0.2s',
                            fontSize: '0.95rem',
                            fontWeight: activeTab === tab.id ? '500' : 'normal',
                            position: 'relative'
                        }}
                    >
                        <tab.icon size={20} strokeWidth={1.5} />
                        <span>{tab.label}</span>
                        {activeTab === tab.id && <ChevronRight size={16} style={{ marginLeft: 'auto', opacity: 0.5 }} />}
                    </div>
                ))}
            </div>

            {/* Content Content - Fixed width/padding issues */}
            <div style={{ flex: 1, padding: '40px 60px', overflowY: 'auto', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
                <h1 style={{ marginBottom: '30px', fontSize: '2rem', fontWeight: '600', color: 'var(--text-color)' }}>{tabs.find(t => t.id === activeTab)?.label}</h1>
                {renderContent()}
            </div>

            {/* Confirmation Dialog */}
            <ConfirmDialog
                isOpen={confirmDialog.isOpen}
                onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
                onConfirm={confirmDialog.onConfirm}
                title={confirmDialog.title}
                message={confirmDialog.message}
                type={confirmDialog.type}
            />
        </div>
    );
};

export default Settings;
