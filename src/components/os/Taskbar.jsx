import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, Folder, Chrome, Terminal, Code,
    Wifi, Volume2, Battery, Power, User, ChevronLeft, ChevronRight,
    Calendar, Image, Music, Video, FileText,
    Calculator, Mail, Map, StickyNote, ShoppingBag,
    Camera, Clock, Accessibility, Download, MessageSquare, Settings, HelpCircle,
    Trash2, Image as ImageIcon, LogOut, RotateCcw, Monitor, Disc
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import appsData from '../../data/apps.json';

// HeroOS Logo Component
const HeroLogo = ({ size = 24 }) => {
    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gridTemplateRows: '1fr 1fr',
            gap: '2px',
            width: size,
            height: size
        }}>
            <div style={{ background: 'var(--text-color)', opacity: 0.95, borderRadius: '2px', boxShadow: '0 0 5px var(--shadow-color)' }} />
            <div style={{ background: 'var(--text-color)', opacity: 0.75, borderRadius: '2px' }} />
            <div style={{ background: 'var(--text-color)', opacity: 0.65, borderRadius: '2px' }} />
            <div style={{ background: 'var(--text-color)', opacity: 0.85, borderRadius: '2px' }} />
        </div>
    );
};

// Icon mapping
const iconMap = {
    'Search': Search,
    'Folder': Folder,
    'Chrome': Chrome,
    'MessageSquare': MessageSquare,
    'Settings': Settings,
    'Calendar': Calendar,
    'Image': Image,
    'Music': Music,
    'Video': Video,
    'FileText': FileText,
    'Calculator': Calculator,
    'Terminal': Terminal,
    'Code': Code,
    'Download': Download,
    'Mail': Mail,
    'Map': Map,
    'StickyNote': StickyNote,
    'ShoppingBag': ShoppingBag,
    'Camera': Camera,
    'Clock': Clock,
    'Accessibility': Accessibility,
    'User': User,
    'HelpCircle': HelpCircle,
    'Trash2': Trash2,
    'ImageIcon': ImageIcon
};

const TaskbarItem = ({ icon: Icon, label, onClick, active, color }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '48px',
                height: '48px',
                cursor: 'pointer',
                position: 'relative',
                borderRadius: '12px',
                background: active ? 'var(--hover-bg)' : (isHovered ? 'var(--hover-bg)' : 'transparent'),
                transition: 'all 0.2s',
                marginBottom: '8px'
            }}
        >
            <div style={{ position: 'relative', zIndex: 2 }}>
                <Icon size={26} color="var(--text-color)" strokeWidth={1.5} />
            </div>

            {/* Active Indicator - Ubuntu style (left side) */}
            {active && (
                <motion.div
                    layoutId="active-indicator"
                    style={{
                        position: 'absolute',
                        left: '-4px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: '4px',
                        height: '24px',
                        borderRadius: '0 4px 4px 0',
                        background: color || 'var(--accent-color)'
                    }}
                />
            )}

            {/* Tooltip */}
            <AnimatePresence>
                {isHovered && (
                    <motion.div
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        transition={{ duration: 0.15 }}
                        style={{
                            position: 'absolute',
                            left: '60px',
                            background: 'var(--taskbar-bg)',
                            border: '1px solid var(--border-color)',
                            color: 'var(--text-color)',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            fontSize: '0.85rem',
                            whiteSpace: 'nowrap',
                            pointerEvents: 'none',
                            zIndex: 10000,
                            boxShadow: '0 4px 12px var(--shadow-color)'
                        }}
                    >
                        {label}
                        {/* Tiny arrow pointing left */}
                        <div style={{
                            position: 'absolute',
                            left: '-4px',
                            top: '50%',
                            transform: 'translateY(-50%) rotate(45deg)',
                            width: '8px',
                            height: '8px',
                            background: 'inherit',
                            borderLeft: '1px solid var(--border-color)',
                            borderBottom: '1px solid var(--border-color)',
                            zIndex: -1
                        }} />
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

// Calendar Panel Component
const CalendarPanel = ({ onClose }) => {
    const [time, setTime] = useState(new Date());
    useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t); }, []);

    // Calendar Logic
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();

    const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const dayName = time.toLocaleDateString('en-US', { weekday: 'long' });
    const timeString = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
    const dateString = time.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);

    return (
        <motion.div
            initial={{ opacity: 0, x: -20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -20, scale: 0.95 }}
            style={{
                position: 'absolute',
                bottom: '20px',
                left: '80px',
                width: '320px',
                background: 'var(--glass-bg)',
                backdropFilter: 'blur(40px)',
                borderRadius: '16px',
                border: '1px solid var(--border-color)',
                boxShadow: '0 20px 50px var(--shadow-color)',
                padding: '24px',
                zIndex: 10001,
                color: 'var(--text-color)'
            }}
        >
            <div style={{ textAlign: 'center', marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '2.8rem', fontWeight: '200', color: 'var(--text-color)', lineHeight: '1', marginBottom: '8px', fontVariantNumeric: 'tabular-nums' }}>{timeString}</div>
                <div style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>{dayName}, {dateString}</div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))} style={{ background: 'transparent', border: 'none', color: 'var(--text-color)', cursor: 'pointer', padding: '6px', borderRadius: '50%', ':hover': { background: 'var(--hover-bg)' } }}><ChevronLeft size={20} /></button>
                <div style={{ color: 'var(--text-color)', fontSize: '1rem', fontWeight: '600' }}>{monthName}</div>
                <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))} style={{ background: 'transparent', border: 'none', color: 'var(--text-color)', cursor: 'pointer', padding: '6px', borderRadius: '50%', ':hover': { background: 'var(--hover-bg)' } }}><ChevronRight size={20} /></button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '8px' }}>
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                    <div key={day} style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: '600', padding: '6px 0' }}>{day}</div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
                {days.map((day, idx) => {
                    const isToday = day === time.getDate() && currentMonth.getMonth() === time.getMonth() && currentMonth.getFullYear() === time.getFullYear();
                    return (
                        <div
                            key={idx}
                            style={{
                                textAlign: 'center',
                                padding: '8px 0',
                                borderRadius: '8px',
                                color: day ? 'var(--text-color)' : 'transparent',
                                fontSize: '0.9rem',
                                cursor: day ? 'pointer' : 'default',
                                background: isToday ? '#E95420' : 'transparent',
                                fontWeight: isToday ? '600' : '400',
                                transition: 'background 0.2s'
                            }}
                        >
                            {day || ''}
                        </div>
                    );
                })}
            </div>
        </motion.div>
    );
};

// Start Menu Component
const StartMenu = ({ onClose, onLaunchApp, onSignOut, onRestart, onPowerOff }) => {
    const { user, logout } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const [showPowerMenu, setShowPowerMenu] = useState(false);

    // Enhanced filtering logic
    const pinnedApps = appsData.pinnedApps
        .map(app => ({ ...app, icon: iconMap[app.icon] }))
        .filter(app => app.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const allApps = appsData.allApps // Assuming allApps contains more apps than just pinned
        .map(app => ({ ...app, icon: iconMap[app.icon] }))
        .filter(app => app.name.toLowerCase().includes(searchQuery.toLowerCase()))
        .sort((a, b) => a.name.localeCompare(b.name));

    const handleLaunch = (id) => {
        if (onLaunchApp) onLaunchApp(id);
        onClose();
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: -20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
            style={{
                position: 'absolute',
                bottom: '10px',
                left: '80px',
                width: '700px',
                height: '750px',
                background: 'var(--glass-bg)',
                backdropFilter: 'blur(60px) saturate(180%)',
                borderRadius: '18px',
                border: '1px solid var(--border-color)',
                boxShadow: '0 30px 80px var(--shadow-color)',
                display: 'flex',
                flexDirection: 'column',
                zIndex: 10001,
                overflow: 'hidden',
                color: 'var(--text-color)'
            }}
        >
            {/* Search Header */}
            <div style={{ padding: '24px' }}>
                <div style={{ position: 'relative' }}>
                    <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                    <input
                        type="text"
                        placeholder="Search for apps, settings, and documents"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        autoFocus
                        style={{
                            width: '100%',
                            padding: '14px 20px 14px 50px',
                            borderRadius: '14px',
                            border: '1px solid var(--border-color)',
                            background: 'var(--input-bg)',
                            color: 'var(--text-color)',
                            fontSize: '1rem',
                            outline: 'none',
                            transition: 'all 0.2s',
                            boxShadow: 'inset 0 2px 4px var(--shadow-color)'
                        }}
                    />
                </div>
            </div>

            {/* Main Content Area */}
            <div style={{ flex: 1, padding: '0 24px 10px 24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '30px' }}>

                {/* Pinned Section */}
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', padding: '0 4px' }}>
                        <h3 style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--text-color)' }}>Pinned</h3>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '16px', rowGap: '24px' }}>
                        {pinnedApps.map((app) => (
                            <motion.div
                                key={app.id}
                                onClick={() => handleLaunch(app.id)}
                                whileHover={{ scale: 1.05, y: -2, background: 'var(--hover-bg)' }}
                                whileTap={{ scale: 0.95 }}
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '10px',
                                    cursor: 'pointer',
                                    padding: '10px',
                                    borderRadius: '12px'
                                }}
                            >
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    background: app.color || '#333',
                                    borderRadius: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 4px 12px var(--shadow-color)'
                                }}>
                                    <app.icon size={26} color="white" strokeWidth={1.5} />
                                </div>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-color)', fontWeight: '500', textAlign: 'center', width: '100%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{app.name}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* All Apps Section (Replaces Recommended) */}
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', padding: '0 4px' }}>
                        <h3 style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--text-color)' }}>All Apps</h3>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {allApps.map((app) => (
                            <motion.div
                                key={app.id}
                                onClick={() => handleLaunch(app.id)}
                                whileHover={{ background: 'var(--hover-bg)', x: 4 }}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '14px',
                                    padding: '8px 12px',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <div style={{ width: '32px', height: '32px', background: app.color || '#333', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <app.icon size={18} color="white" />
                                </div>
                                <span style={{ color: 'var(--text-color)', fontSize: '0.9rem', fontWeight: '500' }}>{app.name}</span>
                            </motion.div>
                        ))}
                        {allApps.length === 0 && (
                            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No apps found</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Footer / User Profile */}
            <div style={{
                padding: '16px 24px',
                background: 'var(--hover-bg)',
                borderTop: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backdropFilter: 'blur(20px)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '6px 10px', borderRadius: '8px', transition: 'background 0.2s', ':hover': { background: 'var(--hover-bg)' } }}>
                    <div style={{ width: '38px', height: '38px', borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--border-color)' }}>
                        <img src={user?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100&auto=format&fit=crop"} alt="User" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <div style={{ color: 'var(--text-color)', fontWeight: '600', fontSize: '0.9rem' }}>{user?.username || 'Guest User'}</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>Administrator</div>
                    </div>
                </div>

                <div style={{ position: 'relative' }}>
                    <motion.button
                        whileHover={{ background: 'var(--hover-bg)' }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowPowerMenu(!showPowerMenu)}
                        style={{ background: 'transparent', border: 'none', padding: '10px', borderRadius: '8px', color: 'var(--text-color)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                        <Power size={20} />
                    </motion.button>

                    {/* Power Menu Popover */}
                    <AnimatePresence>
                        {showPowerMenu && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                style={{
                                    position: 'absolute',
                                    bottom: '50px',
                                    right: '0',
                                    width: '200px',
                                    background: 'var(--taskbar-bg)',
                                    borderRadius: '10px',
                                    border: '1px solid var(--border-color)',
                                    boxShadow: '0 4px 30px var(--shadow-color)',
                                    padding: '6px',
                                    zIndex: 10002,
                                    color: 'var(--text-color)'
                                }}
                            >
                                <div
                                    onClick={() => {
                                        onSignOut && onSignOut(); // Needs to be handled by parent
                                        logout(); // Also logout from context
                                        setShowPowerMenu(false);
                                    }}
                                    style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '6px', color: 'var(--text-color)', fontSize: '0.9rem', cursor: 'pointer', transition: 'background 0.2s' }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'var(--hover-bg)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                >
                                    <LogOut size={16} /> Sign out
                                </div>
                                <div
                                    onClick={() => {
                                        if (onRestart) onRestart();
                                        setShowPowerMenu(false);
                                    }}
                                    style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '6px', color: 'var(--text-color)', fontSize: '0.9rem', cursor: 'pointer', transition: 'background 0.2s' }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'var(--hover-bg)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                >
                                    <RotateCcw size={16} /> Restart
                                </div>
                                <div
                                    onClick={() => {
                                        if (onPowerOff) onPowerOff();
                                        setShowPowerMenu(false);
                                    }}
                                    style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '6px', color: 'var(--text-color)', fontSize: '0.9rem', cursor: 'pointer', transition: 'background 0.2s' }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'var(--hover-bg)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                >
                                    <Power size={16} /> Shut down
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </motion.div>
    );
};

const Taskbar = ({ onLaunchApp, activeWindows = [], onSignOut, onRestart, onPowerOff }) => {
    const { user } = useAuth();
    const [startMenuOpen, setStartMenuOpen] = useState(false);
    const [calendarOpen, setCalendarOpen] = useState(false);
    const [time, setTime] = useState(new Date());

    useEffect(() => { const timer = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(timer); }, []);

    // Fixed Apps: File Manager, Settings, Bin, Support
    const fixedAppIds = ['file-explorer', 'settings', 'recycle-bin', 'heroos-support'];

    // Determine which apps to show
    const getTaskbarApps = () => {
        const findApp = (id) => appsData.allApps.find(a => a.id === id) ||
            appsData.pinnedApps.find(a => a.id === id); // Fallback to pinned

        // 1. Get Fixed Apps
        const fixedApps = fixedAppIds.map(id => {
            const app = findApp(id);
            return app ? { ...app, icon: iconMap[app.icon] || Folder } : null;
        }).filter(Boolean);

        // 2. Get Active/Dynamic Apps (excluding fixed ones)
        // We want the most recently active ones, up to 3.
        // activeWindows gives us the order.
        const dynamicAppIds = activeWindows
            .map(w => w.appId)
            .filter(id => !fixedAppIds.includes(id));

        // Remove duplicates, keep latest
        const uniqueDynamicIds = [...new Set(dynamicAppIds)];

        // Take the last 3 (most recent)
        const activeDynamicIds = uniqueDynamicIds.slice(-3);

        const dynamicApps = activeDynamicIds.map(id => {
            const app = findApp(id);
            return app ? { ...app, icon: iconMap[app.icon] || Folder } : null;
        }).filter(Boolean);

        return [...fixedApps, ...dynamicApps];
    };

    const taskbarApps = getTaskbarApps();

    const hours = time.getHours().toString().padStart(2, '0');
    const minutes = time.getMinutes().toString().padStart(2, '0');
    const day = time.getDate();
    const month = time.toLocaleDateString('en-US', { month: 'short' });

    const isAppActive = (appId) => activeWindows.some(w => w.appId === appId && !w.minimized);

    return (
        <>
            <AnimatePresence>
                {(startMenuOpen || calendarOpen) && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => { setStartMenuOpen(false); setCalendarOpen(false); }}
                        style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10000 }}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {startMenuOpen && <StartMenu onClose={() => setStartMenuOpen(false)} onLaunchApp={onLaunchApp} onSignOut={onSignOut} onRestart={onRestart} onPowerOff={onPowerOff} />}
            </AnimatePresence>

            <AnimatePresence>
                {calendarOpen && <CalendarPanel onClose={() => setCalendarOpen(false)} />}
            </AnimatePresence>

            <motion.div
                initial={{ x: -80 }}
                animate={{ x: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                style={{
                    position: 'fixed', top: 0, left: 0, bottom: 0, width: '72px',
                    background: 'var(--taskbar-bg)', backdropFilter: 'blur(30px)',
                    borderRight: '1px solid var(--border-color)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '12px 0',
                    zIndex: 9999, boxShadow: '4px 0 20px var(--shadow-color)'
                }}
            >
                <div style={{ marginBottom: '16px' }}>
                    <motion.button
                        whileHover={{ scale: 1.1, rotate: 180 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => { setStartMenuOpen(!startMenuOpen); setCalendarOpen(false); }}
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '8px', borderRadius: '12px', transition: 'background 0.2s' }}
                    >
                        <HeroLogo size={32} />
                    </motion.button>
                </div>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', overflowY: 'auto', scrollbarWidth: 'none' }}>
                    {taskbarApps.map((app) => (
                        <TaskbarItem
                            key={app.id}
                            icon={app.icon}
                            label={app.name}
                            active={isAppActive(app.id)}
                            color={app.color}
                            onClick={() => onLaunchApp && onLaunchApp(app.id)}
                        />
                    ))}
                    <div style={{ width: '40px', height: '1px', background: 'var(--border-color)', margin: '8px 0' }} />
                </div>

                <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', paddingBottom: '12px' }}>
                    <div style={{ display: 'flex', gap: '4px', opacity: 0.7 }}>
                        <Wifi size={14} color="var(--text-color)" />
                        <Battery size={14} color="var(--text-color)" />
                    </div>
                    <motion.div
                        whileHover={{ scale: 1.05, background: 'var(--hover-bg)' }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => { setCalendarOpen(!calendarOpen); setStartMenuOpen(false); }}
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', padding: '8px 4px', borderRadius: '8px', width: '56px', transition: 'background 0.2s' }}
                    >
                        <div style={{ color: 'var(--text-color)', fontSize: '1rem', fontWeight: '600', lineHeight: '1' }}>{hours}:{minutes}</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: '500', marginTop: '4px', textTransform: 'uppercase' }}>{day} {month}</div>
                    </motion.div>
                </div>
            </motion.div>
        </>
    );
};

export default Taskbar;
