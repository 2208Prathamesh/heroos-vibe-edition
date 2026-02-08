import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Taskbar from './Taskbar';
import Window from './Window';
import Calculator from '../apps/Calculator';
import Terminal from '../apps/Terminal';
import Settings from '../apps/Settings';
import Notepad from '../apps/Notepad';
import Paint from '../apps/Paint';
import Word from '../apps/Word';
import Excel from '../apps/Excel';
import PowerPoint from '../apps/PowerPoint';
import Browser from '../apps/Browser';
import FileManager from '../apps/FileManager';
import RecycleBin from '../apps/RecycleBin';
import Support from '../apps/Support';
import CalendarApp from '../apps/CalendarApp';
import Messages from '../apps/Messages';
import Clock from '../apps/Clock';
import Camera from '../apps/Camera';
import MediaPlayer from '../apps/MediaPlayer';
import Photos from '../apps/Photos';
import Store from '../apps/Store';
import Mail from '../apps/Mail';
import Maps from '../apps/Maps';
import { RefreshCw, Image as ImageIcon, Settings as SettingsIcon, FolderPlus, Monitor } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ConfirmDialog from '../common/ConfirmDialog';

// Registry of App Components
const AppRegistry = {
    'calculator': { component: Calculator, title: 'Calculator', width: 320, height: 480 },
    'terminal': { component: Terminal, title: 'Terminal', width: 600, height: 400 },
    'settings': { component: Settings, title: 'Settings', width: 800, height: 600 },
    'notepad': { component: Notepad, title: 'Notepad', width: 600, height: 400 },
    'paint': { component: Paint, title: 'Paint', width: 800, height: 600 },
    'word': { component: Word, title: 'Word', width: 900, height: 650 },
    'excel': { component: Excel, title: 'Excel', width: 1000, height: 700 },
    'powerpoint': { component: PowerPoint, title: 'PowerPoint', width: 1000, height: 700 },
    'file-explorer': { component: FileManager, title: 'File Explorer', width: 900, height: 600 },
    'browser': { component: Browser, title: 'Browser', width: 1000, height: 700 },
    'calendar': { component: CalendarApp, title: 'Calendar', width: 900, height: 650 },
    'recycle-bin': { component: RecycleBin, title: 'Recycle Bin', width: 800, height: 500 },
    'messages': { component: Messages, title: 'Messages', width: 850, height: 600 },
    'heroos-support': { component: Support, title: 'HeroOS Support', width: 800, height: 600 },

    // New Apps
    'clock': { component: Clock, title: 'Clock', width: 350, height: 500 },
    'camera': { component: Camera, title: 'Camera', width: 800, height: 600 },
    'music': { component: () => <MediaPlayer initialTab="music" />, title: 'Music', width: 900, height: 600 },
    'videos': { component: () => <MediaPlayer initialTab="video" />, title: 'Videos', width: 900, height: 600 },
    'photos': { component: Photos, title: 'Photos', width: 900, height: 700 },
    'store': { component: Store, title: 'Store', width: 1000, height: 700 },
    'mail': { component: Mail, title: 'Mail', width: 900, height: 600 },

    // Aliases
    'documents': { component: () => <FileManager initialPath="documents" />, title: 'Documents', width: 900, height: 600 },
    'downloads': { component: () => <FileManager initialPath="downloads" />, title: 'Downloads', width: 900, height: 600 },
    'code-editor': { component: Terminal, title: 'Code Editor', width: 800, height: 600 },
    'maps': { component: Maps, title: 'Maps', width: 900, height: 600 },
    'notes': { component: Notepad, title: 'Notes', width: 600, height: 400 },
    'accessibility': { component: Settings, title: 'Accessibility', width: 800, height: 600 },
};

// Premium Wallpapers
const WALLPAPERS = [
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2064&auto=format&fit=crop", // Abstract Waves
    "https://images.unsplash.com/photo-1477346611705-65d1883cee1e?q=80&w=2070&auto=format&fit=crop", // Dark Mountains
    "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop", // Earth from Space
    "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2070&auto=format&fit=crop", // Neon City
    "https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?q=80&w=2072&auto=format&fit=crop"  // Deep Sunset
];

const Desktop = ({ onSignOut, onRestart, onPowerOff }) => {
    const { user, updateSettings } = useAuth();
    const [windows, setWindows] = useState([]);
    const [activeWindowId, setActiveWindowId] = useState(null);
    const [contextMenu, setContextMenu] = useState(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: '', message: '', onConfirm: null, type: 'warning' });

    // Confirmation wrapper for sign out
    const confirmSignOut = () => {
        setConfirmDialog({
            isOpen: true,
            title: 'Sign Out',
            message: 'Are you sure you want to sign out? Any unsaved work will be lost.',
            type: 'warning',
            onConfirm: onSignOut
        });
    };

    // Use user's saved wallpaper or default
    const curWallpaper = user?.settings?.wallpaper || WALLPAPERS[0];

    // --- Window Management ---
    const openApp = (appId) => {
        const existingWindow = windows.find(w => w.appId === appId);
        if (existingWindow) {
            // Bring to front logic (un-minimize + focus)
            const maxZ = Math.max(...windows.map(w => w.zIndex), 0);
            setWindows(prevWindows => prevWindows.map(w =>
                w.id === existingWindow.id
                    ? { ...w, minimized: false, zIndex: maxZ + 1 }
                    : w
            ));
            setActiveWindowId(existingWindow.id);
            return;

        }

        const appConfig = AppRegistry[appId] || {
            component: () => <div style={{ padding: 20, color: 'white' }}>App not found: {appId}</div>,
            title: 'Unknown App',
            width: 400,
            height: 300
        };

        const newWindow = {
            id: Date.now(),
            appId,
            ...appConfig,
            zIndex: windows.length + 1,
            minimized: false
        };

        setWindows([...windows, newWindow]);
        setActiveWindowId(newWindow.id);
    };

    const closeWindow = (id) => {
        setWindows(windows.filter(w => w.id !== id));
        if (activeWindowId === id && windows.length > 1) {
            setActiveWindowId(windows[windows.length - 2].id);
        } else if (windows.length === 1) {
            setActiveWindowId(null);
        }
    };

    const minimizeWindow = (id) => {
        setWindows(windows.map(w => w.id === id ? { ...w, minimized: true } : w));
        setActiveWindowId(null);
    };

    const focusWindow = (id) => {
        setActiveWindowId(id);
        const maxZ = Math.max(...windows.map(w => w.zIndex), 0);
        setWindows(windows.map(w => w.id === id ? { ...w, zIndex: maxZ + 1 } : w));
    };

    // --- Context Menu Handlers ---
    const handleContextMenu = (e) => {
        e.preventDefault();
        setContextMenu({ x: e.clientX, y: e.clientY });
    };

    const handleRefresh = () => {
        setContextMenu(null);
        setIsRefreshing(true);
        setTimeout(() => setIsRefreshing(false), 500);
    };

    const handleChangeWallpaper = () => {
        setContextMenu(null);
        // Find current index
        const currentIdx = WALLPAPERS.indexOf(curWallpaper);
        const nextIdx = (currentIdx + 1) % WALLPAPERS.length;
        // Save to user settings
        updateSettings({ wallpaper: WALLPAPERS[nextIdx] });
    };

    const handlePersonalize = () => {
        setContextMenu(null);
        openApp('settings');
    };

    const handleNewFolder = () => {
        setContextMenu(null);
        alert("New Folder created (Simulation)");
    };

    const windowComponents = windows.filter(w => !w.minimized).map(win => (
        <div key={win.id} style={{ pointerEvents: 'auto' }}>
            <Window
                app={win}
                isActive={activeWindowId === win.id}
                zIndex={win.zIndex}
                onClose={() => closeWindow(win.id)}
                onMinimize={() => minimizeWindow(win.id)}
                onFocus={() => focusWindow(win.id)}
            >
                <win.component />
            </Window>
        </div>
    ));

    return (
        <div
            style={{
                width: '100%',
                height: '100vh',
                position: 'relative',
                overflow: 'hidden',
                userSelect: 'none'
            }}
            onContextMenu={handleContextMenu}
            onClick={() => setContextMenu(null)}
        >
            {/* Background Layer with Persisted Wallpaper */}
            <AnimatePresence mode='wait'>
                <motion.div
                    key={curWallpaper}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1 }}
                    style={{
                        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                        backgroundImage: `url("${curWallpaper}")`,
                        backgroundSize: 'cover', backgroundPosition: 'center', zIndex: 0
                    }}
                />
            </AnimatePresence>

            {/* Overlay */}
            <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                background: 'linear-gradient(135deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.2) 100%)',
                zIndex: 1,
                pointerEvents: 'none'
            }} />

            {/* Refresh White Overlay Effect */}
            <AnimatePresence>
                {isRefreshing && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.3 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        style={{
                            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                            background: 'white', zIndex: 2000, pointerEvents: 'none'
                        }}
                    />
                )}
            </AnimatePresence>

            {/* Top Right Branding */}
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1, duration: 1 }}
                style={{
                    position: 'absolute',
                    top: '40px',
                    right: '50px',
                    zIndex: 5,
                    textAlign: 'right',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    pointerEvents: 'none',
                    opacity: 0.9,
                    filter: 'drop-shadow(0 4px 20px rgba(0,0,0,0.5))'
                }}
            >
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '20px'
                }}>
                    <h1 style={{
                        margin: 0,
                        fontSize: '4.5rem',
                        fontWeight: '100',
                        color: 'white',
                        letterSpacing: '4px',
                        fontFamily: '"Segoe UI", sans-serif',
                        background: 'linear-gradient(180deg, #ffffff 0%, #e0e0e0 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        lineHeight: 1
                    }}>
                        HeroOS
                    </h1>
                    {/* Logo */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gridTemplateRows: '1fr 1fr',
                        gap: '3px',
                        width: '56px',
                        height: '56px',
                        opacity: 1
                    }}>
                        <div style={{ background: 'white', borderRadius: '2px', boxShadow: '0 0 10px rgba(255,255,255,0.4)' }} />
                        <div style={{ background: 'rgba(255,255,255,0.85)', borderRadius: '2px' }} />
                        <div style={{ background: 'rgba(255,255,255,0.7)', borderRadius: '2px' }} />
                        <div style={{ background: 'rgba(255,255,255,0.9)', borderRadius: '2px', boxShadow: '0 0 10px rgba(255,255,255,0.4)' }} />
                    </div>
                </div>
                <div style={{
                    fontSize: '1.2rem',
                    color: 'rgba(255,255,255,0.8)',
                    letterSpacing: '8px',
                    marginTop: '8px',
                    textTransform: 'uppercase',
                    fontWeight: '300',
                    marginRight: '6px'
                }}>
                    Vibe Edition
                </div>
            </motion.div>

            {/* Windows Layer */}
            <div style={{ position: 'relative', zIndex: 10, width: '100%', height: '100%', pointerEvents: 'none' }}>
                <AnimatePresence>
                    {windowComponents}
                </AnimatePresence>
            </div>

            {/* Taskbar */}
            <div style={{ position: 'relative', zIndex: 9999 }}>
                <Taskbar
                    onLaunchApp={openApp}
                    activeWindows={windows}
                    onSignOut={confirmSignOut}
                    onRestart={onRestart}
                    onPowerOff={onPowerOff}
                />
            </div>

            {/* Functional Context Menu */}
            <AnimatePresence>
                {contextMenu && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.1 }}
                        style={{
                            position: 'fixed', left: contextMenu.x, top: contextMenu.y,
                            background: 'var(--glass-bg)',
                            padding: '6px',
                            borderRadius: '10px',
                            zIndex: 20000,
                            border: '1px solid var(--border-color)',
                            color: 'var(--text-color)',
                            backdropFilter: 'blur(30px)',
                            boxShadow: '0 10px 40px var(--shadow-color)',
                            minWidth: '220px'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <ContextMenuItem icon={RefreshCw} label="Refresh" onClick={handleRefresh} />
                        <div style={{ height: '1px', background: 'var(--border-color)', margin: '4px 6px' }} />
                        <ContextMenuItem icon={FolderPlus} label="New Folder" onClick={handleNewFolder} />
                        <div style={{ height: '1px', background: 'var(--border-color)', margin: '4px 6px' }} />
                        <ContextMenuItem icon={SettingsIcon} label="Display Settings" onClick={() => { setContextMenu(null); openApp('settings'); }} />
                        <ContextMenuItem icon={ImageIcon} label="Next Wallpaper" onClick={handleChangeWallpaper} />
                        <ContextMenuItem icon={Monitor} label="Personalize" onClick={handlePersonalize} />
                    </motion.div>
                )}
            </AnimatePresence>

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

// Helper for Context Menu Items (Same as before)
const ContextMenuItem = ({ icon: Icon, label, onClick }) => {
    const [hover, setHover] = useState(false);

    return (
        <div
            onClick={onClick}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            style={{
                padding: '8px 12px',
                cursor: 'pointer',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                borderRadius: '6px',
                background: hover ? 'var(--hover-bg)' : 'transparent',
                transition: 'background 0.2s',
                color: hover ? 'var(--text-color)' : 'var(--text-secondary)'
            }}
        >
            <Icon size={16} strokeWidth={1.5} />
            <span>{label}</span>
        </div>
    );
};

export default Desktop;
