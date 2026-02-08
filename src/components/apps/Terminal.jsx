import React, { useState, useRef, useEffect } from 'react';
import { useFileSystem } from '../../context/FileSystemContext';

const FolderMap = {
    'Documents': 'Documents',
    'Downloads': 'Downloads',
    'Pictures': 'Images',
    'Music': 'Music',
    'Videos': 'Videos'
};

const ReverseFolderMap = {
    'Documents': 'Documents',
    'Downloads': 'Downloads',
    'Images': 'Pictures',
    'Music': 'Music',
    'Videos': 'Videos'
};

const Terminal = () => {
    const { allFiles, addFile, deleteFile } = useFileSystem();
    const [history, setHistory] = useState([
        { type: 'info', content: 'Welcome to HeroOS Terminal v2.0' },
        { type: 'info', content: 'Type "help" for a list of available commands.' }
    ]);
    const [input, setInput] = useState('');
    const [currentPath, setCurrentPath] = useState('~');
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [history]);

    const addToHistory = (content, type = 'text') => {
        setHistory(prev => [...prev, { type, content }]);
    };

    const handleCommand = async (e) => {
        if (e.key === 'Enter') {
            const cmdLine = input.trim();
            if (!cmdLine) {
                addToHistory(`${currentPath}$ `, 'prompt');
                return;
            }

            addToHistory(`${currentPath}$ ${cmdLine}`, 'prompt');
            const parts = cmdLine.split(' ');
            const cmd = parts[0].toLowerCase();
            const args = parts.slice(1);

            await execute(cmd, args);
            setInput('');
        }
    };

    const execute = async (cmd, args) => {
        switch (cmd) {
            case 'help':
                addToHistory('Available commands:', 'info');
                addToHistory('  ls              List directory contents', 'text');
                addToHistory('  cd <dir>        Change directory', 'text');
                addToHistory('  cat <file>      Display file content', 'text');
                addToHistory('  touch <file>    Create a new empty file', 'text');
                addToHistory('  rm <file>       Remove a file', 'text');
                addToHistory('  mkdir <dir>     Create a directory (simulated)', 'text');
                addToHistory('  clear           Clear terminal output', 'text');
                addToHistory('  date            Display current date and time', 'text');
                addToHistory('  whoami          Display current user', 'text');
                addToHistory('  echo <msg>      Print message to screen', 'text');
                break;

            case 'clear':
                setHistory([]);
                break;

            case 'echo':
                addToHistory(args.join(' '));
                break;

            case 'whoami':
                addToHistory('user');
                break;

            case 'date':
                addToHistory(new Date().toString());
                break;

            case 'ls':
                if (currentPath === '~' || currentPath === '/home/user') {
                    // List standard directories
                    const dirs = Object.keys(FolderMap).join('  ');
                    addToHistory(dirs, 'dir');
                } else {
                    // List files in current category
                    const category = getCategoryFromPath(currentPath);
                    if (category) {
                        const files = allFiles.filter(f => f.category === category && !f.isDeleted);
                        if (files.length === 0) {
                            addToHistory('(empty)', 'text');
                        } else {
                            const fileNames = files.map(f => f.name).join('  ');
                            addToHistory(fileNames, 'file');
                        }
                    } else {
                        addToHistory(`ls: cannot open directory '${currentPath}': No such file or directory`, 'error');
                    }
                }
                break;

            case 'cd':
                const target = args[0];
                if (!target || target === '~') {
                    setCurrentPath('~');
                } else if (target === '..') {
                    if (currentPath !== '~' && currentPath !== '/home/user') {
                        setCurrentPath('~');
                    }
                } else {
                    // Check if target is valid directory
                    if (FolderMap[target]) {
                        setCurrentPath(`~/${target}`);
                    } else {
                        addToHistory(`cd: ${target}: No such file or directory`, 'error');
                    }
                }
                break;

            case 'cat':
                const fileName = args[0];
                if (!fileName) {
                    addToHistory('usage: cat <file>', 'error');
                    return;
                }
                const category = getCategoryFromPath(currentPath);
                if (!category) {
                    addToHistory('cat: Navigate to a directory first (e.g., cd Documents)', 'error');
                    return;
                }
                const fileToRead = allFiles.find(f => f.name === fileName && f.category === category && !f.isDeleted);
                if (fileToRead) {
                    // If content is data URL, show metadata, else show text
                    if (fileToRead.content && fileToRead.content.startsWith('data:')) {
                        addToHistory(`[Binary File: ${fileToRead.type}]`, 'info');
                    } else {
                        addToHistory(fileToRead.content || '', 'text');
                    }
                } else {
                    addToHistory(`cat: ${fileName}: No such file`, 'error');
                }
                break;

            case 'touch':
                const newFileName = args[0];
                if (!newFileName) {
                    addToHistory('usage: touch <file>', 'error');
                    return;
                }
                const cat = getCategoryFromPath(currentPath);
                if (!cat) {
                    addToHistory('touch: Navigate to a directory first', 'error');
                    return;
                }
                addToHistory(`Creating file ${newFileName}...`, 'info');
                await addFile({
                    name: newFileName,
                    content: '',
                    category: cat,
                    type: 'text/plain',
                    size: 0
                });
                break;

            case 'rm':
                const fileToRemove = args[0];
                if (!fileToRemove) {
                    addToHistory('usage: rm <file>', 'error');
                    return;
                }
                const catRm = getCategoryFromPath(currentPath);
                if (!catRm) {
                    addToHistory('rm: Navigate to a directory first', 'error');
                    return;
                }
                const fileObj = allFiles.find(f => f.name === fileToRemove && f.category === catRm && !f.isDeleted);
                if (fileObj) {
                    await deleteFile(fileObj.id);
                    addToHistory(`Removed '${fileToRemove}'`, 'info');
                } else {
                    addToHistory(`rm: cannot remove '${fileToRemove}': No such file`, 'error');
                }
                break;

            case 'mkdir':
                addToHistory(`mkdir: cannot create directory '${args[0]}': Read-only file system (simulated)`, 'error');
                break;

            case 'pwd':
                addToHistory(currentPath === '~' ? '/home/user' : currentPath.replace('~', '/home/user'));
                break;

            default:
                addToHistory(`Command not found: ${cmd}`, 'error');
        }
    };

    const getCategoryFromPath = (path) => {
        if (path.startsWith('~/')) {
            const folder = path.substring(2);
            return FolderMap[folder] || null;
        }
        return null; // Root or invalid
    };

    return (
        <div
            style={{
                background: 'var(--bg-color)',
                color: 'var(--text-color)',
                height: '100%',
                fontFamily: 'Consolas, "Courier New", monospace',
                fontSize: '14px',
                padding: '12px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'text'
            }}
            onClick={() => inputRef.current?.focus()}
        >
            <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'thin', scrollbarColor: 'var(--border-color) var(--bg-color)' }}>
                {history.map((line, i) => (
                    <div key={i} style={{
                        marginBottom: '2px',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-all',
                        color: line.type === 'error' ? '#ff6b6b' :
                            line.type === 'info' ? 'var(--accent-color)' :
                                line.type === 'dir' ? '#569cd6' :
                                    line.type === 'file' ? '#ce9178' :
                                        line.type === 'prompt' ? 'var(--text-color)' : 'var(--text-color)'
                    }}>
                        {line.content}
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            <div style={{ display: 'flex', marginTop: '6px', alignItems: 'center' }}>
                <span style={{ color: 'var(--accent-color)', fontWeight: 'bold' }}>user@heroos</span>
                <span style={{ color: 'var(--text-color)' }}>:</span>
                <span style={{ color: '#569cd6', fontWeight: 'bold' }}>{currentPath}</span>
                <span style={{ color: 'var(--text-color)', marginRight: '8px' }}>$</span>
                <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleCommand}
                    autoFocus
                    spellCheck="false"
                    autoComplete="off"
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-color)',
                        flex: 1,
                        outline: 'none',
                        fontFamily: 'inherit',
                        fontSize: 'inherit',
                        padding: 0
                    }}
                />
            </div>
        </div>
    );
};

export default Terminal;
