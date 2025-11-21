import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Check, Sparkles } from 'lucide-react';

interface SequenceEditorProps {
    onAnalyze: (sequence: string) => void;
    isLoading: boolean;
}

const AMINO_ACIDS: Record<string, string> = {
    A: 'hydrophobic', V: 'hydrophobic', I: 'hydrophobic', L: 'hydrophobic', M: 'hydrophobic', F: 'hydrophobic', Y: 'hydrophobic', W: 'hydrophobic',
    R: 'positive', K: 'positive', H: 'positive',
    D: 'negative', E: 'negative',
    S: 'polar', T: 'polar', N: 'polar', Q: 'polar',
    C: 'special', G: 'special', P: 'special'
};

const COLOR_MAP: Record<string, string> = {
    hydrophobic: 'text-yellow-400',
    positive: 'text-blue-400',
    negative: 'text-red-400',
    polar: 'text-green-400',
    special: 'text-purple-400',
    invalid: 'text-gray-500 line-through decoration-red-500'
};

export const SequenceEditor: React.FC<SequenceEditorProps> = ({ onAnalyze, isLoading }) => {
    const [sequence, setSequence] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const val = e.target.value.toUpperCase();
        // Allow newlines and spaces but strip them for analysis
        setSequence(val);

        const cleanSeq = val.replace(/[\s\n]/g, '');
        if (cleanSeq.length > 0 && !/^[ACDEFGHIKLMNPQRSTVWY]+$/.test(cleanSeq)) {
            setError('Invalid characters detected');
        } else {
            setError(null);
        }
    };

    const handleAnalyze = () => {
        const cleanSeq = sequence.replace(/[\s\n]/g, '');
        if (cleanSeq && !error) {
            onAnalyze(cleanSeq);
        }
    };

    const renderHighlighted = () => {
        return sequence.split('').map((char, i) => {
            if (/[\s\n]/.test(char)) return <span key={i}>{char}</span>;
            const type = AMINO_ACIDS[char] || 'invalid';
            return (
                <span key={i} className={`${COLOR_MAP[type]} font-mono font-bold`}>
                    {char}
                </span>
            );
        });
    };

    return (
        <div className="w-full h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" /> Sequence Editor
                </h2>
                <div className="text-xs text-white/40 font-mono">
                    Length: {sequence.replace(/[\s\n]/g, '').length}
                </div>
            </div>

            <div className="relative flex-grow bg-dark/50 rounded-xl border border-white/10 overflow-hidden group focus-within:border-primary/50 transition-colors">
                {/* Highlight Layer */}
                <div className="absolute inset-0 p-4 font-mono text-lg pointer-events-none whitespace-pre-wrap break-all z-10">
                    {renderHighlighted()}
                </div>

                {/* Input Layer */}
                <textarea
                    value={sequence}
                    onChange={handleChange}
                    placeholder="Paste peptide sequence here..."
                    className="absolute inset-0 w-full h-full p-4 bg-transparent text-transparent caret-white font-mono text-lg resize-none focus:outline-none z-20"
                    spellCheck={false}
                />
            </div>

            <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-red-400 flex items-center gap-2 h-6">
                    {error && <><AlertCircle className="w-4 h-4" /> {error}</>}
                </div>
                <button
                    onClick={handleAnalyze}
                    disabled={isLoading || !sequence || !!error}
                    className="btn-primary py-2 px-6 text-sm flex items-center gap-2"
                >
                    {isLoading ? 'Analyzing...' : <><Check className="w-4 h-4" /> Analyze</>}
                </button>
            </div>

            {/* Legend */}
            <div className="mt-6 grid grid-cols-3 gap-2 text-xs text-white/40">
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-yellow-400"></div> Hydrophobic</div>
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-400"></div> Positive</div>
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-400"></div> Negative</div>
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-400"></div> Polar</div>
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-purple-400"></div> Special</div>
            </div>
        </div>
    );
};
