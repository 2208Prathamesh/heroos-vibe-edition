import React, { useState } from 'react';
import { Search, Plus, Send, MoreVertical, Phone, Video, Image, Smile, Paperclip } from 'lucide-react';

const Messages = () => {
    const [conversations, setConversations] = useState([
        { id: 1, name: 'Team HeroOS', lastMessage: 'Meeting at 10 AM?', time: '10:30 AM', unread: 2, avatar: null, online: true },
        { id: 2, name: 'Alice Smith', lastMessage: 'Can you send me the file?', time: 'Yesterday', unread: 0, avatar: null, online: false },
        { id: 3, name: 'Support', lastMessage: 'Your ticket has been resolved.', time: 'Monday', unread: 0, avatar: null, online: true },
    ]);
    const [selectedId, setSelectedId] = useState(1);
    const [newMessage, setNewMessage] = useState('');
    const [chatHistory, setChatHistory] = useState({
        1: [
            { id: 1, sender: 'them', text: 'Hey team, just checking in.', time: '10:00 AM' },
            { id: 2, sender: 'me', text: 'All good here, working on the new features.', time: '10:05 AM' },
            { id: 3, sender: 'them', text: 'Great! Meeting at 10 AM?', time: '10:30 AM' },
        ],
        2: [
            { id: 1, sender: 'them', text: 'Can you send me the file?', time: 'Yesterday' }
        ],
        3: [
            { id: 1, sender: 'them', text: 'Your ticket has been resolved.', time: 'Monday' }
        ]
    });

    const activeChat = conversations.find(c => c.id === selectedId);
    const messages = chatHistory[selectedId] || [];

    const handleSend = (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const msg = {
            id: Date.now(),
            sender: 'me',
            text: newMessage,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setChatHistory(prev => ({
            ...prev,
            [selectedId]: [...(prev[selectedId] || []), msg]
        }));
        setNewMessage('');
    };

    return (
        <div style={{ display: 'flex', height: '100%', background: 'white', fontFamily: 'Segoe UI, sans-serif' }}>
            {/* Sidebar List */}
            <div style={{ width: '300px', borderRight: '1px solid #e0e0e0', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '16px', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <h2 style={{ fontSize: '1.2rem', margin: 0 }}>Messages</h2>
                    <button style={{ background: '#f0f0f0', border: 'none', borderRadius: '50%', padding: '8px', cursor: 'pointer' }}><Plus size={18} /></button>
                </div>

                <div style={{ padding: '12px' }}>
                    <div style={{ position: 'relative' }}>
                        <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
                        <input
                            type="text"
                            placeholder="Search"
                            style={{ width: '100%', padding: '10px 10px 10px 36px', borderRadius: '20px', border: '1px solid #e0e0e0', background: '#f9f9f9', outline: 'none' }}
                        />
                    </div>
                </div>

                <div style={{ flex: 1, overflowY: 'auto' }}>
                    {conversations.map(c => (
                        <div
                            key={c.id}
                            onClick={() => setSelectedId(c.id)}
                            style={{
                                padding: '12px 16px',
                                display: 'flex', alignItems: 'center', gap: '12px',
                                cursor: 'pointer',
                                background: selectedId === c.id ? '#eef6fc' : 'transparent',
                                borderLeft: selectedId === c.id ? '4px solid #0078D4' : '4px solid transparent'
                            }}
                        >
                            <div style={{ position: 'relative' }}>
                                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#ddd', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', color: '#666' }}>
                                    {c.name.charAt(0)}
                                </div>
                                {c.online && <div style={{ position: 'absolute', bottom: '2px', right: '2px', width: '12px', height: '12px', borderRadius: '50%', background: '#4CAF50', border: '2px solid white' }} />}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                    <span style={{ fontWeight: '600', fontSize: '0.95rem' }}>{c.name}</span>
                                    <span style={{ fontSize: '0.75rem', color: '#888' }}>{c.time}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ fontSize: '0.85rem', color: '#666', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.lastMessage}</span>
                                    {c.unread > 0 && (
                                        <div style={{ background: '#0078D4', color: 'white', fontSize: '0.7rem', padding: '2px 6px', borderRadius: '10px', minWidth: '18px', textAlign: 'center' }}>
                                            {c.unread}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Chat Area */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                {activeChat ? (
                    <>
                        <div style={{ padding: '16px 24px', borderBottom: '1px solid #e0e0e0', display: 'flex', alignItems: 'center', justifyItems: 'space-between', background: 'white' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#ddd', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', color: '#666' }}>
                                    {activeChat.name.charAt(0)}
                                </div>
                                <div>
                                    <div style={{ fontWeight: '600', fontSize: '1rem' }}>{activeChat.name}</div>
                                    <div style={{ fontSize: '0.8rem', color: activeChat.online ? '#4CAF50' : '#888' }}>
                                        {activeChat.online ? 'Active now' : 'Offline'}
                                    </div>
                                </div>
                            </div>
                            <div style={{ marginLeft: 'auto', display: 'flex', gap: '16px' }}>
                                <Phone size={20} color="#0078D4" style={{ cursor: 'pointer' }} />
                                <Video size={20} color="#0078D4" style={{ cursor: 'pointer' }} />
                                <MoreVertical size={20} color="#666" style={{ cursor: 'pointer' }} />
                            </div>
                        </div>

                        <div style={{ flex: 1, padding: '24px', background: '#f5f7fb', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {messages.map((msg, i) => (
                                <div
                                    key={msg.id}
                                    style={{
                                        alignSelf: msg.sender === 'me' ? 'flex-end' : 'flex-start',
                                        maxWidth: '70%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: msg.sender === 'me' ? 'flex-end' : 'flex-start'
                                    }}
                                >
                                    <div style={{
                                        background: msg.sender === 'me' ? '#0078D4' : 'white',
                                        color: msg.sender === 'me' ? 'white' : '#333',
                                        padding: '10px 16px',
                                        borderRadius: msg.sender === 'me' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                                        boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                                        fontSize: '0.95rem'
                                    }}>
                                        {msg.text}
                                    </div>
                                    <div style={{ fontSize: '0.7rem', color: '#999', marginTop: '4px', margin: '0 4px' }}>{msg.time}</div>
                                </div>
                            ))}
                        </div>

                        <div style={{ padding: '16px 24px', background: 'white', borderTop: '1px solid #e0e0e0' }}>
                            <form onSubmit={handleSend} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <button type="button" style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#999' }}><Plus size={20} /></button>
                                <button type="button" style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#999' }}><Image size={20} /></button>
                                <button type="button" style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#999' }}><Paperclip size={20} /></button>
                                <div style={{ flex: 1, position: 'relative' }}>
                                    <input
                                        type="text"
                                        placeholder="Type a message..."
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        style={{ width: '100%', padding: '12px 40px 12px 16px', borderRadius: '24px', border: '1px solid #e0e0e0', background: '#f9f9f9', outline: 'none' }}
                                    />
                                    <button type="button" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', cursor: 'pointer', color: '#999' }}><Smile size={20} /></button>
                                </div>
                                <button type="submit" style={{ background: '#0078D4', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}>
                                    <Send size={18} />
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
                        Select a conversation to start messaging
                    </div>
                )}
            </div>
        </div>
    );
};

export default Messages;
