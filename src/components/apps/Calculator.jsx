import React, { useState, useEffect } from 'react';
import { Delete, RotateCcw, Calculator as CalcIcon } from 'lucide-react';

const Calculator = () => {
    const [current, setCurrent] = useState('0');
    const [previous, setPrevious] = useState('');
    const [operation, setOperation] = useState(null);
    const [overwrite, setOverwrite] = useState(false);
    const [history, setHistory] = useState([]);

    const formatNumber = (num) => {
        if (!num) return '';
        // Use Intl safely
        try {
            const [integer, decimal] = num.split('.');
            if (decimal === undefined) {
                return parseFloat(integer).toLocaleString('en-US');
            }
            return parseFloat(integer).toLocaleString('en-US') + '.' + decimal;
        } catch (e) {
            return num;
        }
    };

    const appendNumber = (number) => {
        if (number === '.' && current.includes('.')) return;

        if (overwrite) {
            setCurrent(number);
            setOverwrite(false);
        } else {
            setCurrent(current === '0' && number !== '.' ? number : current + number);
        }
    };

    const chooseOperation = (op) => {
        if (current === '') return;

        if (previous !== '') {
            calculate();
        }

        setOperation(op);
        setPrevious(current);
        setOverwrite(true);
    };

    const calculate = () => {
        let computation;
        const prev = parseFloat(previous);
        const curr = parseFloat(current);

        if (isNaN(prev) || isNaN(curr)) return;

        switch (operation) {
            case '+': computation = prev + curr; break;
            case '-': computation = prev - curr; break;
            case '×': computation = prev * curr; break;
            case '÷': computation = curr === 0 ? 'Error' : prev / curr; break;
            default: return;
        }

        if (computation === 'Error') {
            setCurrent('Error');
            setPrevious('');
            setOperation(null);
            setOverwrite(true);
            return;
        }

        // Avoid floating point errors
        computation = Math.round(computation * 1000000000) / 1000000000;

        setHistory(prevHist => [`${previous} ${operation} ${current} = ${computation}`, ...prevHist].slice(0, 10));
        setCurrent(String(computation));
        setOperation(null);
        setPrevious('');
        setOverwrite(true);
    };

    const clear = () => {
        setCurrent('0');
        setPrevious('');
        setOperation(null);
        setOverwrite(false);
    };

    const deleteNumber = () => {
        if (overwrite) {
            setCurrent('0');
            setOverwrite(false);
            return;
        }

        if (current.length === 1) setCurrent('0');
        else setCurrent(current.slice(0, -1));
    };

    const percentage = () => {
        const curr = parseFloat(current);
        if (isNaN(curr)) return;
        setCurrent(String(curr / 100));
        setOverwrite(true);
    };

    const negate = () => {
        const curr = parseFloat(current);
        if (isNaN(curr)) return;
        setCurrent(String(curr * -1));
    };

    const inverse = () => {
        const curr = parseFloat(current);
        if (isNaN(curr) || curr === 0) return;
        setCurrent(String(1 / curr));
        setOverwrite(true);
    };

    const square = () => {
        const curr = parseFloat(current);
        if (isNaN(curr)) return;
        setCurrent(String(curr * curr));
        setOverwrite(true);
    };

    const sqrt = () => {
        const curr = parseFloat(current);
        if (isNaN(curr) || curr < 0) return;
        setCurrent(String(Math.sqrt(curr)));
        setOverwrite(true);
    };

    // Keyboard support
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key >= '0' && e.key <= '9') appendNumber(e.key);
            if (e.key === '.') appendNumber('.');
            if (e.key === '=' || e.key === 'Enter') { e.preventDefault(); calculate(); }
            if (e.key === 'Backspace') deleteNumber();
            if (e.key === 'Escape') clear();
            if (e.key === '+' || e.key === '-') chooseOperation(e.key);
            if (e.key === '*') chooseOperation('×');
            if (e.key === '/') { e.preventDefault(); chooseOperation('÷'); }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [current, previous, operation, overwrite]);

    return (
        <div style={{ height: '100%', display: 'flex', background: 'var(--bg-color)', fontFamily: '"Segoe UI", sans-serif', overflow: 'hidden' }}>
            {/* Main Calculator Area */}
            <div style={{ flex: 1, padding: '2px', display: 'flex', flexDirection: 'column' }}>
                {/* Display */}
                <div style={{ height: '140px', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'flex-end' }}>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: '4px', minHeight: '1.5rem' }}>
                        {previous} {operation}
                    </div>
                    <div style={{ color: 'var(--text-color)', fontSize: '3.5rem', fontWeight: 'lighter', lineHeight: 1 }}>
                        {formatNumber(current)}
                    </div>
                </div>

                {/* Keypad */}
                <div className="calculator-grid" style={{
                    flex: 1,
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gridTemplateRows: 'repeat(6, 1fr)',
                    gap: '2px',
                    padding: '2px'
                }}>
                    <CalcButton label="%" onClick={() => percentage()} secondary />
                    <CalcButton label="CE" onClick={() => clear()} secondary />
                    <CalcButton label="C" onClick={() => clear()} secondary />
                    <CalcButton label={<Delete size={20} />} onClick={() => deleteNumber()} secondary />

                    <CalcButton label="1/x" onClick={() => inverse()} secondary />
                    <CalcButton label="x²" onClick={() => square()} secondary />
                    <CalcButton label="√x" onClick={() => sqrt()} secondary />
                    <CalcButton label="÷" onClick={() => chooseOperation('÷')} secondary />

                    <CalcButton label="7" onClick={() => appendNumber('7')} />
                    <CalcButton label="8" onClick={() => appendNumber('8')} />
                    <CalcButton label="9" onClick={() => appendNumber('9')} />
                    <CalcButton label="×" onClick={() => chooseOperation('×')} secondary />

                    <CalcButton label="4" onClick={() => appendNumber('4')} />
                    <CalcButton label="5" onClick={() => appendNumber('5')} />
                    <CalcButton label="6" onClick={() => appendNumber('6')} />
                    <CalcButton label="-" onClick={() => chooseOperation('-')} secondary />

                    <CalcButton label="1" onClick={() => appendNumber('1')} />
                    <CalcButton label="2" onClick={() => appendNumber('2')} />
                    <CalcButton label="3" onClick={() => appendNumber('3')} />
                    <CalcButton label="+" onClick={() => chooseOperation('+')} secondary />

                    <CalcButton label="+/-" onClick={() => negate()} />
                    <CalcButton label="0" onClick={() => appendNumber('0')} />
                    <CalcButton label="." onClick={() => appendNumber('.')} />
                    <CalcButton label="=" onClick={() => calculate()} primary />
                </div>
            </div>

            {/* History Sidebar */}
            <div style={{ width: '240px', background: 'var(--glass-bg)', borderLeft: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', fontWeight: '600', color: 'var(--text-color)', fontSize: '0.9rem' }}>
                    History
                </div>
                <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
                    {history.length === 0 ? (
                        <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                            There's no history yet
                        </div>
                    ) : (
                        history.map((item, idx) => (
                            <div key={idx} style={{ padding: '10px', marginBottom: '8px', borderRadius: '4px', background: 'var(--hover-bg)', fontSize: '0.9rem' }}>
                                <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', textAlign: 'right' }}>{item.split('=')[0]} =</div>
                                <div style={{ color: 'var(--text-color)', fontWeight: 'bold', textAlign: 'right', fontSize: '1.1rem' }}>{item.split('=')[1]}</div>
                            </div>
                        ))
                    )}
                </div>
                {history.length > 0 && (
                    <div style={{ padding: '10px' }}>
                        <button
                            onClick={() => setHistory([])}
                            style={{ width: '100%', padding: '8px', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', borderRadius: '4px', cursor: 'pointer' }}
                        >
                            Clear History
                        </button>
                    </div>
                )}
            </div>

            <style jsx>{`
                .calc-btn:hover {
                    filter: brightness(1.2);
                }
                .calc-btn:active {
                    filter: brightness(0.9);
                    transform: scale(0.98);
                }
            `}</style>
        </div>
    );
};

const CalcButton = ({ label, onClick, secondary, primary }) => {
    return (
        <button
            onClick={onClick}
            className="calc-btn"
            style={{
                background: primary ? 'var(--accent-color)' : secondary ? 'var(--glass-bg)' : 'var(--window-bg)',
                border: '1px solid var(--border-color)',
                color: primary ? 'white' : 'var(--text-color)',
                fontSize: secondary ? '1.2rem' : '1.4rem',
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'all 0.1s active',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                boxShadow: '0 2px 4px var(--shadow-color)',
                fontWeight: primary || secondary ? '600' : '400',
                outline: 'none'
            }}
        >
            {label}
        </button>
    );
};

export default Calculator;
