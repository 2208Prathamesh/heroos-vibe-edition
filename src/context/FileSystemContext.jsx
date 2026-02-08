import React, { createContext, useState, useContext, useEffect, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { apiService } from '../services/api';

const FileSystemContext = createContext();

export const useFileSystem = () => useContext(FileSystemContext);

const MAX_STORAGE = 1024 * 1024 * 1024; // 1GB
const MAX_BIN_STORAGE = 500 * 1024 * 1024; // 500MB

export const FileSystemProvider = ({ children }) => {
    const { user } = useAuth();
    const [allFiles, setAllFiles] = useState([]);
    const [binFiles, setBinFiles] = useState([]);
    const [uploads, setUploads] = useState([]);
    const [loading, setLoading] = useState(false);

    const storageRoot = user ? `/storage/${user.username}` : '';

    // Load files when user changes
    useEffect(() => {
        const loadFiles = async () => {
            if (user && user.role !== 'guest') {
                setLoading(true);
                try {
                    const files = await apiService.getFiles();
                    setAllFiles(files);

                    const bin = await apiService.getBinFiles();
                    setBinFiles(bin);
                } catch (err) {
                    console.error("Failed to load files:", err);
                    setAllFiles([]);
                    setBinFiles([]);
                } finally {
                    setLoading(false);
                }
            } else {
                setAllFiles([]);
                setBinFiles([]);
            }
        };
        loadFiles();
    }, [user]);

    const storageUsed = allFiles.reduce((acc, f) => acc + (f.size || 0), 0);
    const binUsed = binFiles.reduce((acc, f) => acc + (f.size || 0), 0);

    // --- File Operations ---

    const uploadFile = async (file) => {
        if (!user || user.role === 'guest') {
            alert("Guest users cannot upload files. Please sign up for an account.");
            return;
        }

        const uploadId = crypto.randomUUID();
        setUploads(prev => [...prev, { id: uploadId, name: file.name, progress: 0 }]);

        try {
            // Simulate upload progress
            const progressInterval = setInterval(() => {
                setUploads(prev => prev.map(u =>
                    u.id === uploadId ? { ...u, progress: Math.min(u.progress + 10, 90) } : u
                ));
            }, 100);

            const result = await apiService.uploadFile(file);

            clearInterval(progressInterval);
            setUploads(prev => prev.map(u =>
                u.id === uploadId ? { ...u, progress: 100 } : u
            ));

            setTimeout(() => {
                setUploads(prev => prev.filter(u => u.id !== uploadId));
            }, 1000);

            setAllFiles(prev => [result, ...prev]);
        } catch (err) {
            console.error("Upload failed:", err);
            alert("Upload failed: " + err.message);
            setUploads(prev => prev.filter(u => u.id !== uploadId));
        }
    };

    const addFile = async (fileData) => {
        if (!user || user.role === 'guest') {
            alert("Guest users cannot save files. Please sign up.");
            return false;
        }

        try {
            // For now, files created in apps will need to be converted to actual File objects
            // This is a placeholder for app-generated content
            const blob = new Blob([fileData.content || ''], { type: fileData.type });
            const file = new File([blob], fileData.name, { type: fileData.type });
            await uploadFile(file);
            return true;
        } catch (err) {
            console.error("Add file failed:", err);
            return false;
        }
    };

    const deleteFile = async (id) => {
        try {
            await apiService.deleteFile(id);
            const file = allFiles.find(f => f.id === id);
            if (file) {
                setAllFiles(prev => prev.filter(f => f.id !== id));
                setBinFiles(prev => [{ ...file, isDeleted: true, deletedAt: new Date() }, ...prev]);
            }
        } catch (err) {
            console.error("Delete failed:", err);
            alert("Delete failed: " + err.message);
        }
    };

    const restoreFile = async (id) => {
        try {
            await apiService.restoreFile(id);
            const file = binFiles.find(f => f.id === id);
            if (file) {
                setBinFiles(prev => prev.filter(f => f.id !== id));
                setAllFiles(prev => [{ ...file, isDeleted: false, deletedAt: null }, ...prev]);
            }
        } catch (err) {
            console.error("Restore failed:", err);
        }
    };

    const permanentDelete = async (id) => {
        try {
            await apiService.permanentDelete(id);
            setBinFiles(prev => prev.filter(f => f.id !== id));
        } catch (err) {
            console.error("Permanent delete failed:", err);
        }
    };

    const emptyBin = async () => {
        try {
            await apiService.emptyBin();
            setBinFiles([]);
        } catch (err) {
            console.error("Empty bin failed:", err);
        }
    };

    const renameFile = async (id, newName) => {
        // For now, renaming is not implemented in backend
        // Would need a PUT /api/files/:id endpoint
        setAllFiles(prev => prev.map(f =>
            f.id === id ? { ...f, name: newName } : f
        ));
    };

    return (
        <FileSystemContext.Provider value={{
            files: allFiles,
            binFiles,
            storageUsed,
            maxStorage: MAX_STORAGE,
            binUsed,
            maxBinStorage: MAX_BIN_STORAGE,
            uploads,
            loading,
            userStoragePath: storageRoot,
            uploadFile,
            addFile,
            deleteFile,
            restoreFile,
            permanentDelete,
            emptyBin,
            renameFile
        }}>
            {children}
        </FileSystemContext.Provider>
    );
};
