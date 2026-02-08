import React from 'react';
import { AlertTriangle, Info, X } from 'lucide-react';

const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, type = 'warning', confirmText = 'Confirm', cancelText = 'Cancel' }) => {
    if (!isOpen) return null;

    const colors = {
        warning: { bg: '#f59e0b', light: '#fffbeb', border: '#fbbf24', icon: AlertTriangle },
        danger: { bg: '#ef4444', light: '#fef2f2', border: '#f87171', icon: AlertTriangle },
        info: { bg: '#3b82f6', light: '#eff6ff', border: '#60a5fa', icon: Info }
    };

    const color = colors[type] || colors.warning;
    const Icon = color.icon;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            animation: 'fadeIn 0.2s ease-out'
        }}>
            <div style={{
                background: 'var(--window-bg)',
                borderRadius: '16px',
                padding: '0',
                maxWidth: '450px',
                width: '90%',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)',
                border: '1px solid var(--border-color)',
                animation: 'slideUp 0.3s ease-out',
                overflow: 'hidden'
            }}>
                {/* Header */}
                <div style={{
                    background: `linear-gradient(135deg, ${color.bg} 0%, ${color.bg}dd 100%)`,
                    padding: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    color: 'white'
                }}>
                    <Icon size={28} />
                    <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600', flex: 1 }}>{title}</h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'rgba(255, 255, 255, 0.2)',
                            border: 'none',
                            borderRadius: '6px',
                            width: '32px',
                            height: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            color: 'white'
                        }}
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Content */}
                <div style={{ padding: '24px' }}>
                    <div style={{
                        background: color.light,
                        border: `2px solid ${color.border}`,
                        borderRadius: '8px',
                        padding: '16px',
                        marginBottom: '24px',
                        color: 'var(--text-color)',
                        lineHeight: '1.6'
                    }}>
                        {message}
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                        <button
                            onClick={onClose}
                            style={{
                                padding: '10px 24px',
                                borderRadius: '8px',
                                border: '1px solid var(--border-color)',
                                background: 'var(--glass-bg)',
                                color: 'var(--text-color)',
                                cursor: 'pointer',
                                fontWeight: '600',
                                fontSize: '14px'
                            }}
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={() => {
                                onConfirm();
                                onClose();
                            }}
                            style={{
                                padding: '10px 24px',
                                borderRadius: '8px',
                                border: 'none',
                                background: color.bg,
                                color: 'white',
                                cursor: 'pointer',
                                fontWeight: '600',
                                fontSize: '14px'
                            }}
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideUp {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
            `}</style>
        </div>
    );
};

export default ConfirmDialog;
