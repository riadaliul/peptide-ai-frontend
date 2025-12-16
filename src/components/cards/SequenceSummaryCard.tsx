import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/base';
import { motion } from 'framer-motion';
import { Info, Sparkles } from 'lucide-react';
import { CardSkeleton } from '../ui/LoadingSkeleton';
import { EmptyState } from '../ui/EmptyState';

interface SequenceSummaryCardProps {
    sequence: string;
    data: any;
    isLoading?: boolean;
}

// Residue color mapping
const RESIDUE_COLORS: Record<string, { color: string; type: string }> = {
    'A': { color: '#f59e0b', type: 'H' }, 'V': { color: '#f59e0b', type: 'H' },
    'I': { color: '#f59e0b', type: 'H' }, 'L': { color: '#f59e0b', type: 'H' },
    'M': { color: '#f59e0b', type: 'H' }, 'F': { color: '#f59e0b', type: 'H' },
    'W': { color: '#f59e0b', type: 'H' }, 'P': { color: '#f59e0b', type: 'H' },
    'S': { color: '#3b82f6', type: 'P' }, 'T': { color: '#3b82f6', type: 'P' },
    'N': { color: '#3b82f6', type: 'P' }, 'Q': { color: '#3b82f6', type: 'P' },
    'C': { color: '#3b82f6', type: 'P' }, 'Y': { color: '#14b8a6', type: 'A' },
    'D': { color: '#ef4444', type: '-' }, 'E': { color: '#ef4444', type: '-' },
    'K': { color: '#a855f7', type: '+' }, 'R': { color: '#a855f7', type: '+' },
    'H': { color: '#a855f7', type: '+' },
    'G': { color: '#94a3b8', type: 'G' },
};

export const SequenceSummaryCard: React.FC<SequenceSummaryCardProps> = ({ sequence, data, isLoading = false }) => {
    // Loading state
    if (isLoading) {
        return <CardSkeleton />;
    }

    // Empty state
    if (!data) {
        return (
            <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-md hover:shadow-lg transition-shadow">
                <CardContent>
                    <EmptyState
                        icon={Sparkles}
                        title="No Sequence Data"
                        description="Enter a peptide sequence to view detailed summary and composition analysis."
                        variant="compact"
                    />
                </CardContent>
            </Card>
        );
    }

    // Calculate composition ratios
    const counts = { H: 0, P: 0, '+': 0, '-': 0, A: 0, G: 0 };
    sequence.split('').forEach(aa => {
        const type = RESIDUE_COLORS[aa]?.type || 'G';
        counts[type as keyof typeof counts]++;
    });

    const total = sequence.length;
    const percentages = {
        hydrophobic: ((counts.H / total) * 100).toFixed(1),
        polar: ((counts.P / total) * 100).toFixed(1),
        positive: ((counts['+'] / total) * 100).toFixed(1),
        negative: ((counts['-'] / total) * 100).toFixed(1),
        aromatic: ((counts.A / total) * 100).toFixed(1),
    };

    // Detect GXXXG motifs
    const gxxxgPattern = /G...G/g;
    const motifs = sequence.match(gxxxgPattern) || [];

    return (
        <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-md hover:shadow-lg transition-all duration-300">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Info className="w-5 h-5 text-indigo-600" />
                    Sequence Summary
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Length */}
                <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                    <span className="text-sm font-medium text-slate-600">Length</span>
                    <span className="text-2xl font-bold text-blue-900">{sequence.length} AA</span>
                </div>

                {/* Composition Ratios */}
                <div>
                    <h4 className="text-sm font-semibold text-slate-700 mb-3">Composition Ratios</h4>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-amber-500" />
                            <span className="text-xs text-slate-600">Hydrophobic</span>
                            <span className="ml-auto text-sm font-bold text-slate-900">{percentages.hydrophobic}%</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-blue-500" />
                            <span className="text-xs text-slate-600">Polar</span>
                            <span className="ml-auto text-sm font-bold text-slate-900">{percentages.polar}%</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-purple-500" />
                            <span className="text-xs text-slate-600">Positive</span>
                            <span className="ml-auto text-sm font-bold text-slate-900">{percentages.positive}%</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500" />
                            <span className="text-xs text-slate-600">Negative</span>
                            <span className="ml-auto text-sm font-bold text-slate-900">{percentages.negative}%</span>
                        </div>
                    </div>
                </div>

                {/* Color-coded sequence */}
                <div>
                    <h4 className="text-sm font-semibold text-slate-700 mb-3">Sequence</h4>
                    <div className="flex flex-wrap gap-1 p-3 bg-slate-50 rounded-lg border border-slate-200 font-mono text-sm">
                        {sequence.split('').map((aa, i) => (
                            <span
                                key={i}
                                style={{ color: RESIDUE_COLORS[aa]?.color || '#94a3b8' }}
                                className="font-bold"
                                title={`${aa}${i + 1}`}
                            >
                                {aa}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Motif finder */}
                <div className="pt-3 border-t border-slate-200">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-600">GXXXG Motifs</span>
                        <span className="text-sm font-bold text-slate-900">
                            {motifs.length > 0 ? `${motifs.length} found` : 'None detected'}
                        </span>
                    </div>
                    {motifs.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                            {motifs.map((motif, i) => (
                                <span key={i} className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs font-mono rounded">
                                    {motif}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};
