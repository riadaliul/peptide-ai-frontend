import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Area, AreaChart } from 'recharts';
import { ChartSkeleton } from '../ui/LoadingSkeleton';
import { EmptyState } from '../ui/EmptyState';
import { TrendingUp } from 'lucide-react';

interface HydrophobicityPlotProps {
    sequence: string;
    gravy?: number;
    isLoading?: boolean;
}

// Kyte-Doolittle Scale
const HYDROPATHY: Record<string, number> = {
    A: 1.8, R: -4.5, N: -3.5, D: -3.5, C: 2.5,
    Q: -3.5, E: -3.5, G: -0.4, H: -3.2, I: 4.5,
    L: 3.8, K: -3.9, M: 1.9, F: 2.8, P: -1.6,
    S: -0.8, T: -0.7, W: -0.9, Y: -1.3, V: 4.2
};

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 shadow-lg">
                <p className="text-white font-semibold text-sm mb-1">
                    Position {data.pos}: <span className="text-blue-400 font-mono">{data.aa}</span>
                </p>
                <p className="text-slate-300 text-xs">
                    Hydropathy: <span className={`font-bold ${data.smoothed > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {data.smoothed > 0 ? '+' : ''}{data.smoothed}
                    </span>
                </p>
                <p className="text-slate-400 text-[10px] mt-1">
                    {data.smoothed > 0 ? 'Hydrophobic' : 'Hydrophilic'}
                </p>
            </div>
        );
    }
    return null;
};

export const HydrophobicityPlot: React.FC<HydrophobicityPlotProps> = React.memo(({ sequence, isLoading = false }) => {
    // Loading state
    if (isLoading) {
        return <ChartSkeleton height={300} />;
    }

    // Empty state
    if (!sequence) {
        return (
            <div className="h-[300px]">
                <EmptyState
                    icon={TrendingUp}
                    title="No Sequence Data"
                    description="Enter a peptide sequence to visualize hydrophobicity profile."
                    variant="compact"
                />
            </div>
        );
    }

    const smoothedData = useMemo(() => {
        const data = sequence.split('').map((aa, i) => ({
            pos: i + 1,
            aa: aa,
            value: HYDROPATHY[aa] || 0
        }));

        // Calculate window average (Window size 3)
        const windowSize = 3;
        return data.map((d, i) => {
            let sum = 0;
            let count = 0;
            for (let j = Math.max(0, i - Math.floor(windowSize / 2)); j <= Math.min(data.length - 1, i + Math.floor(windowSize / 2)); j++) {
                sum += data[j].value;
                count++;
            }
            return { ...d, smoothed: parseFloat((sum / count).toFixed(2)) };
        });
    }, [sequence]);

    const windowSize = 3;

    return (
        <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={smoothedData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <defs>
                        <linearGradient id="hydrophobicGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
                        </linearGradient>
                        <linearGradient id="hydrophilicGradient" x1="0" y1="1" x2="0" y2="0">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.3} />
                    <XAxis
                        dataKey="pos"
                        stroke="#64748b"
                        label={{ value: 'Position', position: 'insideBottom', offset: -5, fill: '#64748b' }}
                    />
                    <YAxis
                        stroke="#64748b"
                        label={{ value: 'Hydropathy Index', angle: -90, position: 'insideLeft', fill: '#64748b' }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="5 5" strokeWidth={2} />
                    <Area
                        type="monotone"
                        dataKey="smoothed"
                        stroke="#3b82f6"
                        strokeWidth={2.5}
                        fill="url(#hydrophobicGradient)"
                        dot={false}
                        activeDot={{ r: 6, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }}
                    />
                </AreaChart>
            </ResponsiveContainer>
            <div className="text-center text-xs text-slate-500 mt-2 flex items-center justify-center gap-4">
                <span>Kyte-Doolittle Scale (Window: {windowSize})</span>
                <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    <span>Hydrophobic (+)</span>
                </span>
                <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    <span>Hydrophilic (−)</span>
                </span>
            </div>
        </div>
    );
});
