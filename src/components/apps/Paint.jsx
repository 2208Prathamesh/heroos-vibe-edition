import React, { useState, useRef, useEffect } from 'react';
import {
    Pencil, Eraser, Square, Circle, Minus, PaintBucket,
    Type, Download, Trash2, Undo, Redo,
    ChevronDown, Palette, Search
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useFileSystem } from '../../context/FileSystemContext';
import SaveAsModal from '../common/SaveAsModal';

const COLORS = [
    '#000000', '#7f7f7f', '#880015', '#ed1c24', '#ff7f27',
    '#fff200', '#22b14c', '#00a2e8', '#3f48cc', '#a349a4',
    '#ffffff', '#c3c3c3', '#b97a57', '#ffaec9', '#ffc90e',
    '#efe4b0', '#b5e61d', '#99d9ea', '#7092be', '#c8bfe7'
];

const Paint = () => {
    const { addFile } = useFileSystem();
    const canvasRef = useRef(null);
    const [ctx, setCtx] = useState(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [showSaveModal, setShowSaveModal] = useState(false);

    // Tools State
    const [tool, setTool] = useState('pencil'); // pencil, eraser, line, rect, circle, list
    const [color, setColor] = useState('#000000');
    const [lineWidth, setLineWidth] = useState(3);
    const [startPos, setStartPos] = useState({ x: 0, y: 0 });
    const [snapshot, setSnapshot] = useState(null); // For shapes preview

    // Setup Canvas
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;

        const context = canvas.getContext('2d');
        context.lineCap = 'round';
        context.lineJoin = 'round';
        context.strokeStyle = color;
        context.lineWidth = lineWidth;
        setCtx(context);

        // White background
        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, canvas.width, canvas.height);
    }, []);

    // Update context properties
    useEffect(() => {
        if (ctx) {
            ctx.strokeStyle = color;
            ctx.lineWidth = lineWidth;
            ctx.fillStyle = color;
        }
    }, [color, lineWidth, ctx]);

    const getCoords = (e) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    };

    const startDraw = (e) => {
        if (!ctx) return;
        const { x, y } = getCoords(e);
        setIsDrawing(true);
        setStartPos({ x, y });
        setSnapshot(ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height));

        if (tool === 'pencil' || tool === 'eraser') {
            ctx.beginPath();
            ctx.moveTo(x, y);
        } else if (tool === 'fill') {
            floodFill(x, y, color);
            setIsDrawing(false);
        }
    };

    const draw = (e) => {
        if (!isDrawing || !ctx) return;
        const { x, y } = getCoords(e);

        if (tool === 'pencil' || tool === 'eraser') {
            ctx.globalCompositeOperation = tool === 'eraser' ? 'destination-out' : 'source-over';
            if (tool === 'eraser') {
                // Creating "white" eraser effect on white canvas by drawing white
                ctx.globalCompositeOperation = 'source-over';
                ctx.strokeStyle = '#ffffff';
            } else {
                ctx.strokeStyle = color;
            }
            ctx.lineTo(x, y);
            ctx.stroke();
        } else if (tool === 'line' || tool === 'rect' || tool === 'circle') {
            ctx.putImageData(snapshot, 0, 0); // Restore previous state to avoid trails
            drawShape(x, y);
        }
    };

    const endDraw = () => {
        if (!isDrawing) return;
        setIsDrawing(false);
        if (tool === 'pencil' || tool === 'eraser') {
            ctx.closePath();
        }
    };

    const drawShape = (currentX, currentY) => {
        ctx.beginPath();
        if (tool === 'line') {
            ctx.moveTo(startPos.x, startPos.y);
            ctx.lineTo(currentX, currentY);
        } else if (tool === 'rect') {
            ctx.rect(startPos.x, startPos.y, currentX - startPos.x, currentY - startPos.y);
        } else if (tool === 'circle') {
            const radius = Math.sqrt(Math.pow(currentX - startPos.x, 2) + Math.pow(currentY - startPos.y, 2));
            ctx.arc(startPos.x, startPos.y, radius, 0, 2 * Math.PI);
        }
        ctx.stroke();
    };

    const floodFill = (startX, startY, fillColor) => {
        // Simplified fill: just fill whole canvas for now to keep performance high in React
        ctx.fillStyle = fillColor;
        ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    };

    const clearCanvas = () => {
        if (!ctx) return;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    };

    const handleSave = (fileName) => {
        const finalName = fileName.endsWith('.png') ? fileName : `${fileName}.png`;
        const dataUrl = canvasRef.current.toDataURL();
        const sizeInBytes = Math.round((dataUrl.length - 22) * 0.75);

        addFile({
            name: finalName,
            type: 'image/png',
            size: sizeInBytes,
            category: 'Images',
            content: dataUrl
        });

        setShowSaveModal(false);
    };

    return (
        <div className="paint-app" style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg-color)', userSelect: 'none', color: 'var(--text-color)' }}>
            {/* Top Toolbar (Ribbon style) */}
            <div style={{
                height: '100px',
                background: 'var(--glass-bg)',
                borderBottom: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                padding: '0 20px',
                gap: '20px',
                boxShadow: '0 2px 5px var(--shadow-color)'
            }}>
                {/* Tools Group */}
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center', gap: '5px' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'center' }}>Tools</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px' }}>
                        {[
                            { id: 'pencil', icon: Pencil },
                            { id: 'fill', icon: PaintBucket },
                            { id: 'text', icon: Type },
                            { id: 'eraser', icon: Eraser },
                            { id: 'picker', icon: Palette },
                            { id: 'zoom', icon: Search },
                        ].map((t) => (
                            <button
                                key={t.id}
                                onClick={() => setTool(t.id)}
                                style={{
                                    padding: '6px',
                                    border: '1px solid transparent',
                                    background: tool === t.id ? 'var(--hover-bg)' : 'transparent',
                                    borderRadius: '2px',
                                    cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}
                            >
                                <t.icon size={16} color={tool === t.id ? 'var(--accent-color)' : 'var(--text-color)'} />
                            </button>
                        ))}
                    </div>
                </div>

                <div style={{ width: '1px', height: '60%', background: 'var(--border-color)' }}></div>

                {/* Shapes Group */}
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center', gap: '5px' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'center' }}>Shapes</div>
                    <div style={{ display: 'flex', gap: '4px' }}>
                        {[
                            { id: 'line', icon: Minus, label: 'Line' },
                            { id: 'rect', icon: Square, label: 'Rect' },
                            { id: 'circle', icon: Circle, label: 'Circle' },
                        ].map((t) => (
                            <button
                                key={t.id}
                                onClick={() => setTool(t.id)}
                                style={{
                                    padding: '6px',
                                    border: '1px solid transparent',
                                    background: tool === t.id ? 'var(--hover-bg)' : 'transparent',
                                    borderRadius: '2px',
                                    cursor: 'pointer',
                                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px'
                                }}
                            >
                                <t.icon size={20} color={tool === t.id ? 'var(--accent-color)' : 'var(--text-color)'} />
                            </button>
                        ))}
                    </div>
                </div>

                <div style={{ width: '1px', height: '60%', background: 'var(--border-color)' }}></div>

                {/* Size Group */}
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center', width: '80px', alignItems: 'center' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'center' }}>Size</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <ChevronDown size={14} color="var(--text-color)" />
                        <input
                            type="range"
                            min="1" max="20"
                            value={lineWidth}
                            onChange={(e) => setLineWidth(parseInt(e.target.value))}
                            style={{ width: '60px' }}
                        />
                    </div>
                    <div style={{ fontSize: '0.7rem' }}>{lineWidth}px</div>
                </div>

                <div style={{ width: '1px', height: '60%', background: 'var(--border-color)' }}></div>

                {/* Colors Group */}
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center', gap: '5px' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'center' }}>Colors</div>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <div style={{ width: '36px', height: '36px', background: color, border: '1px solid var(--border-color)' }}></div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: '4px' }}>
                            {COLORS.map(c => (
                                <div
                                    key={c}
                                    onClick={() => setColor(c)}
                                    style={{
                                        width: '18px', height: '18px', background: c,
                                        border: '1px solid #ccc', cursor: 'pointer',
                                        outline: color === c ? '2px solid var(--accent-color)' : 'none'
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                <div style={{ marginLeft: 'auto', display: 'flex', gap: '10px' }}>
                    <button onClick={clearCanvas} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'transparent', border: 'none', cursor: 'pointer', padding: '5px' }}>
                        <Trash2 size={20} color="#d13438" />
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-color)' }}>Clear</span>
                    </button>
                    <button onClick={() => setShowSaveModal(true)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'transparent', border: 'none', cursor: 'pointer', padding: '5px' }}>
                        <Download size={20} color="#107c10" />
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-color)' }}>Save</span>
                    </button>
                </div>
            </div>

            {/* Canvas Area */}
            <div style={{ flex: 1, overflow: 'auto', background: 'var(--input-bg)', padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ background: 'white', boxShadow: '0 0 10px var(--shadow-color)', overflow: 'hidden', width: '95%', height: '95%' }}>
                    <canvas
                        ref={canvasRef}
                        onMouseDown={startDraw}
                        onMouseUp={endDraw}
                        onMouseMove={draw}
                        onMouseLeave={endDraw}
                        style={{ cursor: tool === 'pencil' ? 'url(https://img.icons8.com/material-outlined/24/000000/pencil.png) 0 24, auto' : 'crosshair', display: 'block' }}
                    />
                </div>
            </div>

            {/* Status Bar */}
            <div style={{ height: '24px', background: 'var(--glass-bg)', borderTop: '1px solid var(--border-color)', padding: '0 10px', display: 'flex', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-secondary)', gap: '20px' }}>
                <div>{tool.toUpperCase()}</div>
                <div>{canvasRef.current ? `${canvasRef.current.width} x ${canvasRef.current.height}px` : ''}</div>
            </div>

            {/* Save Modal */}
            {showSaveModal && (
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 100 }}>
                    <SaveAsModal
                        initialName={`drawing_${Date.now()}.png`}
                        onSave={handleSave}
                        onClose={() => setShowSaveModal(false)}
                    />
                </div>
            )}
        </div>
    );
};

export default Paint;
