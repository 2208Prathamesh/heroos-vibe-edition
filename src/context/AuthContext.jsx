import React, { createContext, useState, useContext, useEffect } from 'react';
import { apiService } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Initialize: Check if token exists
    useEffect(() => {
        const initAuth = async () => {
            try {
                const token = apiService.getToken();
                if (token) {
                    // Token exists, but we need to validate it
                    // For now, we'll just mark as not loading
                    // The user data will be set on login
                }
            } catch (err) {
                console.error("Auth Init Error:", err);
            } finally {
                setLoading(false);
            }
        };
        initAuth();
    }, []);

    // Load users if admin
    useEffect(() => {
        const loadUsers = async () => {
            if (user?.role === 'admin') {
                try {
                    const allUsers = await apiService.getAllUsers();
                    setUsers(allUsers);
                } catch (err) {
                    console.error("Failed to load users:", err);
                }
            }
        };
        loadUsers();
    }, [user?.role]);

    // --- Auth Actions ---

    const login = async (username, password) => {
        try {
            setLoading(true);
            const userData = await apiService.login(username, password);
            setUser(userData);
            setLoading(false);
            return true;
        } catch (err) {
            console.error("Login Error:", err);
            setLoading(false);
            return false;
        }
    };

    const logout = () => {
        setUser(null);
        apiService.logout();
    };

    // --- User Profile Updates ---

    const updateProfile = async (updates) => {
        if (!user) return;
        try {
            const result = await apiService.updateUser(user.id, updates);
            if (result.success) {
                setUser(prev => ({ ...prev, ...result.user }));
                if (user.role === 'admin') {
                    setUsers(prev => prev.map(u => u.id === user.id ? result.user : u));
                }
            }
        } catch (err) {
            console.error("Profile Update Error:", err);
        }
    };

    const updateSettings = async (newSettings) => {
        if (!user) return;
        const mergedSettings = { ...user.settings, ...newSettings };
        await updateProfile({ settings: mergedSettings });
    };

    const changePassword = async (currentPassword, newPassword) => {
        if (!user) return { success: false, message: 'Not logged in' };

        try {
            await updateProfile({ password: newPassword });
            return { success: true, message: 'Password updated successfully' };
        } catch (err) {
            return { success: false, message: 'Update failed' };
        }
    };

    // --- Admin Functions ---

    const register = async (userData) => {
        try {
            const user = await apiService.register(userData);
            setUser(user);
            return { success: true, message: 'Account created successfully!' };
        } catch (err) {
            return { success: false, message: err.message || 'Registration failed' };
        }
    };

    const adminAddUser = async (userData) => {
        if (user?.role !== 'admin') return { success: false, message: 'Unauthorized' };

        try {
            const result = await apiService.createUser(userData);
            if (result.success) {
                const allUsers = await apiService.getAllUsers();
                setUsers(allUsers);
                return { success: true, message: 'User created successfully' };
            }
            return { success: false, message: 'Failed to create user' };
        } catch (err) {
            return { success: false, message: err.message || 'Database error' };
        }
    };

    const adminRemoveUser = async (targetUserId) => {
        if (user?.role !== 'admin') return { success: false, message: 'Unauthorized' };
        if (targetUserId === user.id) return { success: false, message: 'Cannot delete yourself' };

        try {
            const result = await apiService.deleteUser(targetUserId);
            if (result.success) {
                setUsers(prev => prev.filter(u => u.id !== targetUserId));
                return { success: true, message: 'User removed' };
            }
            return { success: false, message: 'Delete failed' };
        } catch (err) {
            return { success: false, message: err.message || 'Delete failed' };
        }
    };

    const adminResetPassword = async (targetUserId, newPassword) => {
        if (user?.role !== 'admin') return { success: false, message: 'Unauthorized' };

        try {
            const result = await apiService.updateUser(targetUserId, { password: newPassword });
            if (result.success) {
                return { success: true, message: 'Password reset' };
            }
            return { success: false, message: 'Reset failed' };
        } catch (err) {
            return { success: false, message: err.message || 'Reset failed' };
        }
    };

    const adminUpdateUserRole = async (targetUserId, newRole) => {
        if (user?.role !== 'admin') return { success: false, message: 'Unauthorized' };
        if (targetUserId === user.id) return { success: false, message: 'Cannot change your own role' };

        try {
            const result = await apiService.updateUser(targetUserId, { role: newRole });
            if (result.success) {
                setUsers(prev => prev.map(u => u.id === targetUserId ? { ...u, role: newRole } : u));
                return { success: true, message: `Role updated to ${newRole}` };
            }
            return { success: false, message: 'Role update failed' };
        } catch (err) {
            return { success: false, message: err.message || 'Role update failed' };
        }
    };

    if (loading) {
        return (
            <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#111', color: 'white', flexDirection: 'column', gap: '20px' }}>
                <div style={{ width: '40px', height: '40px', border: '3px solid #333', borderTop: '3px solid #0078D4', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                <div style={{ fontFamily: 'Segoe UI', letterSpacing: '1px' }}>Starting HeroOS...</div>
                <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return (
        <AuthContext.Provider value={{
            user,
            users,
            login,
            logout,
            updateProfile,
            updateSettings,
            changePassword,
            register,
            adminAddUser,
            adminRemoveUser,
            adminResetPassword,
            adminUpdateUserRole
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
