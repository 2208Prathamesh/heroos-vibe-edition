import React, { useState } from 'react';
import { HelpCircle, Mail, MessageSquare, Phone, Send, CheckCircle, ChevronDown, ChevronUp, AlertCircle, FileText, Settings, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/api';

const FAQS = [
    { question: 'How do I install new apps?', answer: 'Go to the HeroOS Store from the Start Menu to browse and download new applications.' },
    { question: 'Can I change the wallpaper?', answer: 'Yes! Right-click on the desktop and select "Change Wallpaper" or go to Settings > Personalization.' },
    { question: 'Is my data secure?', answer: 'HeroOS uses advanced encryption to keep your data safe. All files are stored locally or in your configured cloud storage.' },
    { question: 'How do I update the system?', answer: 'System updates are managed by the administrator. Check the About section in Settings for version info.' },
    { question: 'I forgot my password, what do I do?', answer: 'Contact your system administrator to reset your password. You will receive an email with a new temporary password.' },
];

const HoverItem = ({ icon: Icon, label, active, onClick }) => {
    const [hover, setHover] = useState(false);
    return (
        <div
            onClick={onClick}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            style={{
                padding: '12px 16px',
                background: active ? 'var(--accent-color)' : hover ? 'rgba(255,255,255,0.05)' : 'transparent',
                color: active ? 'white' : hover ? 'var(--text-color)' : 'var(--text-secondary)',
                borderRadius: '8px',
                fontWeight: active ? '600' : 'normal',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex', alignItems: 'center', gap: '12px',
                marginBottom: '4px'
            }}
        >
            <Icon size={18} />
            {label}
        </div>
    );
};

const Support = () => {
    const { user } = useAuth();
    const [openFaq, setOpenFaq] = useState(null);
    const [activeTab, setActiveTab] = useState('contact');
    const [formStatus, setFormStatus] = useState('idle'); // idle, submitting, success, error
    const [formData, setFormData] = useState({
        subject: '',
        type: 'Technical Issue',
        message: ''
    });

    const handleFaqToggle = (index) => {
        setOpenFaq(openFaq === index ? null : index);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormStatus('submitting');

        try {
            const data = {
                name: user?.name || user?.username || 'HeroOS User',
                email: user?.email,
                subject: formData.subject,
                type: formData.type,
                message: formData.message
            };

            const response = await apiService.sendSupport(data);

            if (response.success) {
                setFormStatus('success');
                setFormData({ subject: '', type: 'Technical Issue', message: '' });
                setTimeout(() => setFormStatus('idle'), 5000);
            } else {
                setFormStatus('error');
            }
        } catch (error) {
            console.error('Support error:', error);
            setFormStatus('error');
        }
    };

    return (
        <div style={{ display: 'flex', height: '100%', background: 'var(--bg-color)', color: 'var(--text-color)', fontFamily: 'Segoe UI, sans-serif' }}>
            {/* Sidebar */}
            <div style={{ width: '260px', background: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(10px)', borderRight: '1px solid var(--border-color)', padding: '24px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px', paddingLeft: '8px' }}>
                    <div style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', padding: '8px', borderRadius: '8px', color: 'white' }}>
                        <HelpCircle size={24} />
                    </div>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700' }}>Hero Support</h2>
                        <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>v0.1.0 (Beta)</div>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <HoverItem icon={Mail} label="Contact Support" active={activeTab === 'contact'} onClick={() => setActiveTab('contact')} />
                    <HoverItem icon={MessageSquare} label="FAQs" active={activeTab === 'faq'} onClick={() => setActiveTab('faq')} />
                    <HoverItem icon={FileText} label="Documentation" />
                    <HoverItem icon={Shield} label="Privacy & Terms" />
                </div>

                <div style={{ marginTop: 'auto', padding: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', fontSize: '0.85rem', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontWeight: '600', marginBottom: '8px', color: 'var(--text-color)' }}>Need urgent help?</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <Phone size={14} className="text-accent" />
                        <span>1-800-HERO-OS</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Mail size={14} className="text-accent" />
                        <span>support@heroos.com</span>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
                <AnimatePresence mode="wait">
                    {activeTab === 'contact' ? (
                        <motion.div
                            key="contact"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            <h1 style={{ fontSize: '2.2rem', fontWeight: '300', marginBottom: '10px', background: 'linear-gradient(90deg, #fff, rgba(255,255,255,0.7))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Get in touch</h1>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '40px', maxWidth: '600px', fontSize: '1.1rem', lineHeight: '1.6' }}>
                                Experiencing issues or have a feature request? Fill out the form below and our team will get back to you within 24 hours.
                            </p>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '40px' }}>
                                {/* Form Section */}
                                <div style={{ background: 'var(--glass-bg)', padding: '32px', borderRadius: '16px', border: '1px solid var(--border-color)', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}>
                                    {formStatus === 'success' ? (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 0', color: '#10b981', textAlign: 'center' }}
                                        >
                                            <div style={{ padding: '20px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '50%', marginBottom: '20px' }}>
                                                <CheckCircle size={48} />
                                            </div>
                                            <h3 style={{ margin: '0 0 10px 0', fontSize: '1.5rem', color: 'var(--text-color)' }}>Message Sent Successfully!</h3>
                                            <p style={{ margin: 0, color: 'var(--text-secondary)', maxWidth: '300px' }}>We have received your support request and will respond to <strong>{user?.email}</strong> shortly.</p>
                                        </motion.div>
                                    ) : (
                                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                                <div>
                                                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px', color: 'var(--text-secondary)' }}>Name</label>
                                                    <input type="text" value={user?.name || user?.username} disabled style={{ ...inputStyle, opacity: 0.7, cursor: 'not-allowed' }} />
                                                </div>
                                                <div>
                                                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px', color: 'var(--text-secondary)' }}>Email</label>
                                                    <input type="text" value={user?.email || 'No email configured'} disabled style={{ ...inputStyle, opacity: 0.7, cursor: 'not-allowed' }} />
                                                </div>
                                            </div>

                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px', color: 'var(--text-secondary)' }}>Issue Type</label>
                                                <select
                                                    value={formData.type}
                                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                                    style={inputStyle}
                                                >
                                                    <option>Technical Issue</option>
                                                    <option>Feature Request</option>
                                                    <option>Account Support</option>
                                                    <option>Billing Question</option>
                                                    <option>Other</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px', color: 'var(--text-secondary)' }}>Subject</label>
                                                <input
                                                    type="text"
                                                    required
                                                    placeholder="Brief summary of the issue"
                                                    value={formData.subject}
                                                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                                    style={inputStyle}
                                                />
                                            </div>

                                            <div>
                                                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', marginBottom: '8px', color: 'var(--text-secondary)' }}>Message</label>
                                                <textarea
                                                    required
                                                    rows={6}
                                                    placeholder="Please provide detailed information about your issue..."
                                                    value={formData.message}
                                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                                    style={{ ...inputStyle, resize: 'vertical' }}
                                                />
                                            </div>

                                            {formStatus === 'error' && (
                                                <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
                                                    <AlertCircle size={16} />
                                                    Failed to send message. Please try again later.
                                                </div>
                                            )}

                                            <button
                                                type="submit"
                                                disabled={formStatus === 'submitting'}
                                                style={{
                                                    padding: '16px', background: 'var(--accent-color)', color: 'white', border: 'none', borderRadius: '10px',
                                                    fontWeight: '600', fontSize: '1rem', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px',
                                                    opacity: formStatus === 'submitting' ? 0.7 : 1, transition: 'all 0.2s', boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
                                                }}
                                                onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                                                onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                                            >
                                                {formStatus === 'submitting' ? 'Sending...' : <><Send size={18} /> Send Support Request</>}
                                            </button>
                                        </form>
                                    )}
                                </div>

                                {/* Info Sidebar */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    <div style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                                        <h3 style={{ fontSize: '1.1rem', marginTop: 0, marginBottom: '16px', color: 'var(--text-color)' }}>Guidelines</h3>
                                        <ul style={{ margin: 0, paddingLeft: '20px', color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                            <li>Be specific about the error messages you see.</li>
                                            <li>Include steps to reproduce the issue.</li>
                                            <li>Mention your browser and OS version.</li>
                                            <li>Allowed attachment types: PNG, JPG, PDF.</li>
                                        </ul>
                                    </div>

                                    <div style={{ background: 'var(--glass-bg)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                                        <h3 style={{ fontSize: '1.1rem', marginTop: 0, marginBottom: '16px', color: 'var(--text-color)' }}>System Status</h3>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', fontSize: '0.9rem' }}>
                                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 10px #10b981' }}></div>
                                            <span style={{ color: 'var(--text-color)' }}>All Systems Operational</span>
                                        </div>
                                        <div style={{ padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                                                <span>API Latency</span>
                                                <span style={{ color: '#10b981' }}>24ms</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                                <span>Uptime</span>
                                                <span style={{ color: '#10b981' }}>99.9%</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="faq"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            <h1 style={{ fontSize: '2.2rem', fontWeight: '300', marginBottom: '10px', color: 'var(--text-color)' }}>Common Questions</h1>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '40px', fontSize: '1.1rem' }}>
                                Quick answers to help you navigate HeroOS efficiently.
                            </p>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '800px' }}>
                                {FAQS.map((faq, index) => (
                                    <div key={index} style={{ background: 'var(--glass-bg)', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-color)', boxShadow: '0 4px 10px rgba(0,0,0,0.03)' }}>
                                        <div
                                            onClick={() => handleFaqToggle(index)}
                                            style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', background: openFaq === index ? 'rgba(255,255,255,0.05)' : 'transparent', color: 'var(--text-color)', transition: 'all 0.2s' }}
                                        >
                                            <span style={{ fontWeight: '600', fontSize: '1.05rem' }}>{faq.question}</span>
                                            {openFaq === index ? <ChevronUp size={20} color="var(--accent-color)" /> : <ChevronDown size={20} color="var(--text-secondary)" />}
                                        </div>
                                        <AnimatePresence>
                                            {openFaq === index && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    style={{ overflow: 'hidden' }}
                                                >
                                                    <div style={{ padding: '0 24px 24px 24px', color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: '1.6' }}>
                                                        {faq.answer}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

const inputStyle = {
    width: '100%',
    padding: '14px',
    borderRadius: '8px',
    border: '1px solid var(--border-color)',
    fontSize: '0.95rem',
    background: 'var(--input-bg)',
    color: 'var(--text-color)',
    outline: 'none',
    transition: 'border 0.2s',
    fontFamily: 'inherit'
};

export default Support;
