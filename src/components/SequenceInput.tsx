import React, { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';

interface SequenceInputProps {
    onAnalyze: (sequence: string) => void;
    isLoading: boolean;
}

export const SequenceInput: React.FC<SequenceInputProps> = ({ onAnalyze, isLoading }) => {
    const [sequence, setSequence] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (sequence.trim()) {
            onAnalyze(sequence.trim());
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto mb-12">
            <form onSubmit={handleSubmit} className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative flex items-center">
                    <input
                        type="text"
                        value={sequence}
                        onChange={(e) => setSequence(e.target.value.toUpperCase())}
                        placeholder="Enter peptide sequence (e.g., ACDEFGH)"
                        className="input-field pr-32 text-lg tracking-wider font-mono"
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !sequence.trim()}
                        className="absolute right-2 top-2 bottom-2 btn-primary py-1 px-6 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                <Search className="w-5 h-5" />
                                <span>Analyze</span>
                            </>
                        )}
                    </button>
                </div>
            </form>
            <p className="mt-4 text-center text-white/40 text-sm">
                Try: <button onClick={() => setSequence("ACDEFGHIKLMNPQRSTVWY")} className="text-primary hover:text-secondary transition-colors">ACDEFGHIKLMNPQRSTVWY</button>
            </p>
        </div>
    );
};
