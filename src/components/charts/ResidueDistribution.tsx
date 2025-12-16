import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';
import { ChartSkeleton } from '../ui/LoadingSkeleton';
import { EmptyState } from '../ui/EmptyState';
import { BarChart3 } from 'lucide-react';

interface ResidueDistributionProps {
    sequence: string;
    isLoading?: boolean;
}

// Residue type classification
const RESIDUE_TYPES: Record<string, { type: string; color: string }> = {
    // Hydrophobic
    A: { type: 'Hydrophobic', color: '#F59E0B' },
    V: { type: 'Hydrophobic', color: '#F59E0B' },
    I: { type: 'Hydrophobic', color: '#F59E0B' },
    L: { type: 'Hydrophobic', color: '#F59E0B' },
    M: { type: 'Hydrophobic', color: '#F59E0B' },
    F: { type: 'Hydrophobic', color: '#F59E0B' },
    W: { type: 'Hydrophobic', color: '#F59E0B' },
    P: { type: 'Hydrophobic', color: '#F59E0B' },

    // Polar
    S: { type: 'Polar', color: '#3B82F6' },
    T: { type: 'Polar', color: '#3B82F6' },
    N: { type: 'Polar', color: '#3B82F6' },
    Q: { type: 'Polar', color: '#3B82F6' },
    C: { type: 'Polar', color: '#3B82F6' },
    Y: { type: 'Polar', color: '#3B82F6' },

    // Acidic
    D: { type: 'Acidic', color: '#EF4444' },
    E: { type: 'Acidic', color: '#EF4444' },

    // Basic
    K: { type: 'Basic', color: '#A855F7' },
    R: { type: 'Basic', color: '#A855F7' },
    H: { type: 'Basic', color: '#A855F7' },

    // Special
    G: { type: 'Special', color: '#94A3B8' },
};

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="bg-white border-2 border-slate-200 rounded-xl px-4 py-3 shadow-xl">
                <p className="font-bold text-lg text-slate-900 mb-1">
                    {data.aa} <span className="text-slate-500 text-sm">({data.name})</span>
                </p>
                <div className="space-y-1">
                    <p className="text-sm text-slate-700">
                        Count: <span className="font-semibold text-indigo-600">{data.count}</span>
                    </p>
                    <p className="text-sm text-slate-700">
                        Percentage: <span className="font-semibold text-indigo-600">{data.percentage.toFixed(1)}%</span>
                    </p>
                    <div className="mt-2 pt-2 border-t border-slate-200">
                        <span
                            className="inline-block px-2 py-0.5 rounded text-xs font-medium text-white"
                            style={{ backgroundColor: data.color }}
                        >
                            {data.type}
                        </span>
                    </div>
                </div>
            </div>
        );
    }
    return null;
};

export const ResidueDistribution: React.FC<ResidueDistributionProps> = React.memo(({ sequence, isLoading = false }) => {
    // Loading state
    if (isLoading) {
        return <ChartSkeleton height={400} />;
    }

    const data = useMemo(() => {
        if (!sequence) return [];

        // Count amino acids
        const counts: Record<string, number> = {};
        sequence.split('').forEach(aa => {
            counts[aa] = (counts[aa] || 0) + 1;
        });

        const total = sequence.length;

        // Convert to array and add metadata
        return Object.entries(counts)
            .map(([aa, count]) => ({
                aa,
                count,
                percentage: (count / total) * 100,
                name: getAminoAcidName(aa),
                type: RESIDUE_TYPES[aa]?.type || 'Unknown',
                color: RESIDUE_TYPES[aa]?.color || '#94A3B8',
            }))
            .sort((a, b) => b.count - a.count); // Sort by count descending
    }, [sequence]);

    // Empty state
    if (!sequence || data.length === 0) {
        return (
            <div className="h-[400px]">
                <EmptyState
                    icon={BarChart3}
                    title="No Composition Data"
                    description="Enter a peptide sequence to view amino acid composition distribution."
                    variant="compact"
                />
            </div>
        );
    }

    // Calculate type distribution for legend
    const typeDistribution = data.reduce((acc, item) => {
        acc[item.type] = (acc[item.type] || 0) + item.count;
        return acc;
    }, {} as Record<string, number>);

    return (
        <div className="w-full space-y-4">
            <ResponsiveContainer width="100%" height={400}>
                <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 60 }} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" opacity={0.5} />
                    <XAxis
                        dataKey="aa"
                        angle={-45}
                        textAnchor="end"
                        height={70}
                        stroke="#64748B"
                        tick={{ fill: '#64748B', fontSize: 12, fontWeight: 600 }}
                    />
                    <YAxis
                        stroke="#64748B"
                        label={{ value: 'Count', angle: -90, position: 'insideLeft', fill: '#64748B' }}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99, 102, 241, 0.1)' }} />
                    <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>

            {/* Type Summary */}
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
                {Object.entries(typeDistribution).map(([type, count]) => {
                    const color = data.find(d => d.type === type)?.color || '#94A3B8';
                    const percentage = ((count / sequence.length) * 100).toFixed(1);
                    return (
                        <div key={type} className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg">
                            <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: color }}
                            />
                            <span className="font-medium text-slate-700">{type}</span>
                            <span className="text-slate-500">
                                {count} ({percentage}%)
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
});

// Helper function to get full amino acid name
function getAminoAcidName(code: string): string {
    const names: Record<string, string> = {
        A: 'Alanine', R: 'Arginine', N: 'Asparagine', D: 'Aspartic acid',
        C: 'Cysteine', Q: 'Glutamine', E: 'Glutamic acid', G: 'Glycine',
        H: 'Histidine', I: 'Isoleucine', L: 'Leucine', K: 'Lysine',
        M: 'Methionine', F: 'Phenylalanine', P: 'Proline', S: 'Serine',
        T: 'Threonine', W: 'Tryptophan', Y: 'Tyrosine', V: 'Valine',
    };
    return names[code] || code;
}
