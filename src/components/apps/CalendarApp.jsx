import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Clock, MapPin, X, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const EventModal = ({ date, onClose, onSave }) => {
    const [title, setTitle] = useState('');
    const [time, setTime] = useState('10:00');
    const [type, setType] = useState('work'); // work, personal, important

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({
            id: Date.now().toString(),
            title,
            time,
            type,
            date: date.toISOString().split('T')[0]
        });
    };

    return (
        <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
        }}>
            <div style={{ width: '300px', background: 'var(--window-bg)', borderRadius: '8px', padding: '20px', boxShadow: '0 10px 25px var(--shadow-color)', border: '1px solid var(--border-color)', color: 'var(--text-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <h3 style={{ margin: 0 }}>New Event</h3>
                    <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-color)' }}><X size={20} /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '12px' }}>
                        <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '4px', color: 'var(--text-secondary)' }}>Title</label>
                        <input
                            autoFocus
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-color)' }}
                        />
                    </div>
                    <div style={{ marginBottom: '12px' }}>
                        <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '4px', color: 'var(--text-secondary)' }}>Time</label>
                        <input
                            type="time"
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-color)' }}
                        />
                    </div>
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '4px', color: 'var(--text-secondary)' }}>Type</label>
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-color)' }}
                        >
                            <option value="work">Work</option>
                            <option value="personal">Personal</option>
                            <option value="important">Important</option>
                        </select>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                        <button type="button" onClick={onClose} style={{ padding: '8px 16px', background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '4px', cursor: 'pointer', color: 'var(--text-color)' }}>Cancel</button>
                        <button type="submit" style={{ padding: '8px 16px', background: 'var(--accent-color)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Save</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const CalendarApp = () => {
    const { user } = useAuth();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [events, setEvents] = useState([]);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        if (user) {
            const saved = localStorage.getItem(`heroos_calendar_${user.username}`);
            if (saved) {
                try {
                    setEvents(JSON.parse(saved));
                } catch (e) { console.error("Failed to load events", e); }
            }
        }
    }, [user]);

    const saveEvents = (newEvents) => {
        setEvents(newEvents);
        if (user) {
            localStorage.setItem(`heroos_calendar_${user.username}`, JSON.stringify(newEvents));
        }
    };

    const handleAddEvent = (event) => {
        saveEvents([...events, event]);
        setShowModal(false);
    };

    const handleDeleteEvent = (id, e) => {
        e.stopPropagation();
        if (window.confirm('Delete this event?')) {
            saveEvents(events.filter(ev => ev.id !== id));
        }
    };

    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) {
        days.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), i));
    }

    const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

    const isToday = (date) => {
        const today = new Date();
        return date && date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear();
    };

    const isSelected = (date) => {
        return date &&
            date.getDate() === selectedDate.getDate() &&
            date.getMonth() === selectedDate.getMonth() &&
            date.getFullYear() === selectedDate.getFullYear();
    };

    const getEventsForDate = (date) => {
        if (!date) return [];
        const dateStr = date.toISOString().split('T')[0];
        return events.filter(e => e.date === dateStr);
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'important': return '#d13438';
            case 'personal': return '#00bcf2';
            default: return '#0078D4'; // work
        }
    };

    return (
        <div style={{ display: 'flex', height: '100%', background: 'var(--bg-color)', color: 'var(--text-color)', fontFamily: 'Segoe UI, sans-serif', position: 'relative' }}>
            {/* Sidebar with Upcoming Events */}
            <div style={{ width: '280px', borderRight: '1px solid var(--border-color)', padding: '20px', display: 'flex', flexDirection: 'column', background: 'var(--glass-bg)' }}>
                <button
                    onClick={() => setShowModal(true)}
                    style={{
                        background: 'var(--accent-color)', color: 'white', border: 'none', borderRadius: '4px',
                        padding: '12px', fontSize: '1rem', fontWeight: '500',
                        boxShadow: '0 4px 10px var(--shadow-color)', marginBottom: '24px', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                        transition: 'transform 0.1s'
                    }}
                >
                    <Plus size={20} /> New Event
                </button>

                <div style={{ flex: 1, overflowY: 'auto' }}>
                    <div style={{ fontWeight: '600', marginBottom: '16px', color: 'var(--text-secondary)', fontSize: '0.85rem', letterSpacing: '0.5px' }}>UPCOMING EVENTS</div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {events
                            .filter(e => new Date(e.date) >= new Date().setHours(0, 0, 0, 0))
                            .sort((a, b) => new Date(a.date) - new Date(b.date))
                            .slice(0, 5)
                            .map(ev => (
                                <div key={ev.id} style={{ padding: '12px', background: 'var(--window-bg)', borderRadius: '6px', borderLeft: `4px solid ${getTypeColor(ev.type)}`, boxShadow: '0 2px 5px var(--shadow-color)', border: '1px solid var(--border-color)' }}>
                                    <div style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--text-color)', marginBottom: '4px' }}>{ev.title}</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                        <CalendarIcon size={12} /> {new Date(ev.date).toLocaleDateString()}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                                        <Clock size={12} /> {ev.time}
                                    </div>
                                </div>
                            ))}
                    </div>

                    {events.length === 0 && (
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textAlign: 'center', padding: '20px' }}>No events scheduled</div>
                    )}
                </div>
            </div>

            {/* Main Calendar Area */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                {/* Header */}
                <div style={{ padding: '20px 30px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--glass-bg)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: '300', color: 'var(--text-color)' }}>{monthName}</h2>
                        <div style={{ display: 'flex', gap: '4px' }}>
                            <button onClick={handlePrevMonth} style={{ background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '6px', cursor: 'pointer', display: 'flex', color: 'var(--text-color)' }}><ChevronLeft size={20} /></button>
                            <button onClick={handleNextMonth} style={{ background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '6px', cursor: 'pointer', display: 'flex', color: 'var(--text-color)' }}><ChevronRight size={20} /></button>
                        </div>
                    </div>
                    <button onClick={() => setCurrentDate(new Date())} style={{ padding: '6px 12px', border: '1px solid var(--border-color)', background: 'transparent', borderRadius: '4px', cursor: 'pointer', color: 'var(--text-color)' }}>Today</button>
                </div>

                {/* Calendar Grid */}
                <div style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
                    {/* Days Header */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: '10px' }}>
                        {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
                            <div key={day} style={{ textAlign: 'center', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)' }}>{day}</div>
                        ))}
                    </div>

                    {/* Dates */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gridAutoRows: 'minmax(100px, 1fr)', gap: '1px', background: 'var(--border-color)', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                        {days.map((date, index) => {
                            if (!date) return <div key={index} style={{ background: 'var(--bg-color)' }} />;

                            const dayEvents = getEventsForDate(date);
                            const active = isSelected(date);
                            const today = isToday(date);

                            return (
                                <div
                                    key={index}
                                    onClick={() => { setSelectedDate(date); setShowModal(true); }}
                                    style={{
                                        background: active ? 'var(--hover-bg)' : 'var(--window-bg)',
                                        padding: '8px',
                                        cursor: 'pointer',
                                        transition: 'background 0.2s',
                                        position: 'relative',
                                        overflow: 'hidden'
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'var(--hover-bg)'}
                                    onMouseLeave={e => e.currentTarget.style.background = active ? 'var(--hover-bg)' : 'var(--window-bg)'}
                                >
                                    <div style={{
                                        width: '24px', height: '24px', borderRadius: '50%',
                                        background: today ? 'var(--accent-color)' : 'transparent',
                                        color: today ? 'white' : 'var(--text-color)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '0.9rem', fontWeight: today ? '600' : '400',
                                        marginBottom: '4px'
                                    }}>
                                        {date.getDate()}
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                        {dayEvents.map(ev => (
                                            <div key={ev.id}
                                                title={`${ev.time} - ${ev.title}`}
                                                style={{
                                                    fontSize: '0.75rem',
                                                    background: getTypeColor(ev.type) + '20',
                                                    color: getTypeColor(ev.type),
                                                    padding: '2px 4px',
                                                    borderRadius: '2px',
                                                    whiteSpace: 'nowrap',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                                                }}
                                            >
                                                <span>{ev.title}</span>
                                                <button
                                                    onClick={(e) => handleDeleteEvent(ev.id, e)}
                                                    style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'inherit', padding: 0, opacity: 0.6 }}
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Modal */}
            {showModal && <EventModal date={selectedDate} onClose={() => setShowModal(false)} onSave={handleAddEvent} />}
        </div>
    );
};

export default CalendarApp;
