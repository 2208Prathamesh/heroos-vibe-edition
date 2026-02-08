import React, { useState } from 'react';
import { Mail as MailIcon, Inbox, Send, Archive, Trash2, Star, RefreshCw, MoreVertical, Paperclip, ChevronLeft } from 'lucide-react';

const EMAILS = [
    { id: 1, sender: 'HeroOS Team', subject: 'Welcome to HeroOS!', preview: 'Thanks for trying out the new update...', date: '10:30 AM', read: false },
    { id: 2, sender: 'GitHub', subject: '[GitHub] security alert', preview: 'A security vulnerability was found...', date: 'Yesterday', read: true },
    { id: 3, sender: 'Newsletter', subject: 'Weekly Tech Digest', preview: 'Top stories: AI takes over coding...', date: 'Yesterday', read: true },
    { id: 4, sender: 'Mom', subject: 'Dinner tonight?', preview: 'Are you coming over for dinner?', date: 'Last Week', read: true },
    { id: 5, sender: 'Amazon', subject: 'Your order has shipped', preview: 'Track your package...', date: 'Last Week', read: true },
];

const Mail = () => {
    const [selectedEmail, setSelectedEmail] = useState(null);
    const [filter, setFilter] = useState('inbox'); // inbox, sent, trash

    return (
        <div style={{ display: 'flex', height: '100%', background: 'white', color: '#333', fontFamily: 'Segoe UI, sans-serif' }}>
            {/* Sidebar */}
            <div style={{ width: '200px', background: '#f0f0f0', display: 'flex', flexDirection: 'column', padding: '16px' }}>
                <button
                    onClick={() => { setSelectedEmail(null); setFilter('new'); }}
                    style={{ padding: '12px', background: '#0078D4', color: 'white', border: 'none', borderRadius: '4px', fontWeight: '600', marginBottom: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}
                >
                    <Send size={16} /> New Mail
                </button>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {[
                        { id: 'inbox', icon: Inbox, label: 'Inbox', count: 1 },
                        { id: 'sent', icon: Send, label: 'Sent' },
                        { id: 'archive', icon: Archive, label: 'Archive' },
                        { id: 'trash', icon: Trash2, label: 'Trash' },
                    ].map(item => (
                        <div
                            key={item.id}
                            onClick={() => { setFilter(item.id); setSelectedEmail(null); }}
                            style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                padding: '10px 12px', borderRadius: '4px', cursor: 'pointer',
                                background: filter === item.id ? '#e0e0e0' : 'transparent',
                                fontWeight: filter === item.id ? '600' : 'normal'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <item.icon size={16} /> {item.label}
                            </div>
                            {item.count && <span style={{ fontSize: '0.8rem', color: '#0078D4', fontWeight: 'bold' }}>{item.count}</span>}
                        </div>
                    ))}
                </div>
            </div>

            {/* Email List */}
            <div style={{ width: '300px', borderRight: '1px solid #e0e0e0', display: 'flex', flexDirection: 'column', background: 'white' }}>
                <div style={{ padding: '16px', borderBottom: '1px solid #e0e0e0', fontWeight: '600', fontSize: '1.1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                    <RefreshCw size={16} color="#666" style={{ cursor: 'pointer' }} />
                </div>
                <div style={{ overflowY: 'auto', flex: 1 }}>
                    {EMAILS.map(email => (
                        <div
                            key={email.id}
                            onClick={() => setSelectedEmail(email)}
                            style={{
                                padding: '16px', borderBottom: '1px solid #f0f0f0', cursor: 'pointer',
                                background: selectedEmail?.id === email.id ? '#eef6fc' : (email.read ? 'white' : '#fff'),
                                borderLeft: !email.read ? '4px solid #0078D4' : '4px solid transparent'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                <span style={{ fontWeight: !email.read ? 'bold' : 'normal', fontSize: '0.95rem' }}>{email.sender}</span>
                                <span style={{ fontSize: '0.8rem', color: '#888' }}>{email.date}</span>
                            </div>
                            <div style={{ fontWeight: !email.read ? 'bold' : 'normal', fontSize: '0.9rem', marginBottom: '4px', color: '#333' }}>{email.subject}</div>
                            <div style={{ fontSize: '0.85rem', color: '#666', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{email.preview}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Reading Pane */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'white' }}>
                {selectedEmail ? (
                    <>
                        <div style={{ padding: '20px', borderBottom: '1px solid #e0e0e0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <h2 style={{ margin: '0 0 10px 0', fontSize: '1.4rem' }}>{selectedEmail.subject}</h2>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#0078D4', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                                        {selectedEmail.sender[0]}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: '600' }}>{selectedEmail.sender}</div>
                                        <div style={{ fontSize: '0.85rem', color: '#666' }}>to me</div>
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '10px', color: '#666' }}>
                                <Star size={20} style={{ cursor: 'pointer' }} />
                                <Reply size={20} style={{ cursor: 'pointer' }} />
                                <Trash2 size={20} style={{ cursor: 'pointer' }} />
                                <MoreVertical size={20} style={{ cursor: 'pointer' }} />
                            </div>
                        </div>
                        <div style={{ padding: '40px', fontSize: '1rem', lineHeight: '1.6', color: '#333', flex: 1, overflowY: 'auto' }}>
                            <p>Hi,</p>
                            <p>{selectedEmail.preview}</p>
                            <p>This is a simulated email content for demonstration purposes. In a real application, you would be able to read the full message here.</p>
                            <br />
                            <p>Best regards,<br />{selectedEmail.sender}</p>
                        </div>
                    </>
                ) : (
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '20px', color: '#aaa' }}>
                        <MailIcon size={64} style={{ opacity: 0.2 }} />
                        <div>Select an email to read</div>
                    </div>
                )}
            </div>
            {/* Fix for Reply not imported */}
            <style>{`
                /* Hide Reply if error */
            `}</style>
        </div>
    );
};

// Mock Reply icon since I forgot import
const Reply = ({ size, style }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
        <polyline points="9 17 4 12 9 7"></polyline>
        <path d="M20 18v-2a4 4 0 0 0-4-4H4"></path>
    </svg>
);

export default Mail;
