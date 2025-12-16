import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, ReferenceArea } from 'recharts';
import { ChartSkeleton } from '../ui/LoadingSkeleton';
import { EmptyState } from '../ui/EmptyState';
import { Activity } from 'lucide-react';

interface DisorderPlotProps {
    sequence: string;
    profile?: number[];
    isLoading?: boolean;
}

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 shadow-lg">
                <p className="text-white font-semibold text-sm mb-1">
                    Position {data.pos}: <span className="text-violet-400 font-mono">{data.aa}</span>
                </p>
                <p className="text-slate-300 text-xs">
                    Disorder Score: <span className={`font-bold ${data.value > 0.5 ? 'text-amber-400' : 'text-blue-400'}`}>
                        {data.value.toFixed(3)}
                    </span>
                </p>
                <p className="text-slate-400 text-[10px] mt-1">
                    {data.value > 0.5 ? 'Disordered Region' : 'Ordered Region'}
                </p>
            </div>
        );
    }
    return null;
};

export const DisorderPlot: React.FC<DisorderPlotProps> = ({ sequence, profile, isLoading = false }) => {
    // Loading state
    if (isLoading) {
        return <ChartSkeleton height={300} />;
    }

    // Empty state
    if (!sequence || !profile) {
        return (
            <div className="h-[300px]">
                <EmptyState
                    icon={Activity}
                    title="No Disorder Data"
                    description="Analyze a peptide sequence to view intrinsic disorder predictions."
                    variant="compact"
                />
            </div>
        );
    }

    const data = profile.map((val, i) => ({
        pos: i + 1,
        aa: sequence[i],
        value: val
    }));

    // Detect LCR/disordered regions (consecutive stretches above 0.5)
    const disorderedRegions: { start: number; end: number }[] = [];
    let inRegion = false;
    let regionStart = 0;

    data.forEach((point, i) => {
        if (point.value > 0.5 && !inRegion) {
            inRegion = true;
            regionStart = point.pos;
        } else if (point.value <= 0.5 && inRegion) {
            disorderedRegions.push({ start: regionStart, end: data[i - 1].pos });
            inRegion = false;
        }
    });

    // Close last region if it extends to the end
    if (inRegion) {
        disorderedRegions.push({ start: regionStart, end: data[data.length - 1].pos });
    }

    return (
        <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <defs>
                        <linearGradient id="disorderGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.05} />
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
                        label={{ value: 'Disorder Propensity', angle: -90, position: 'insideLeft', fill: '#64748b' }}
                        domain={[0, 1]}
                    />
                    <Tooltip content={<CustomTooltip />} />

                    {/* Highlight disordered regions */}
                    {disorderedRegions.map((region, idx) => (
                        <ReferenceArea
                            key={idx}
                            x1={region.start}
                            x2={region.end}
                            fill="#fbbf24"
                            fillOpacity={0.15}
                            stroke="#fbbf24"
                            strokeOpacity={0.5}
                        />
                    ))}

                    <ReferenceLine
                        y={0.5}
                        stroke="#f59e0b"
                        strokeDasharray="5 5"
                        strokeWidth={2}
                        label={{ value: 'Disorder Threshold (0.5)', fill: '#f59e0b', fontSize: 11, position: 'right' }}
                    />
                    <Area
                        type="monotone"
                        dataKey="value"
                        stroke="#8b5cf6"
                        strokeWidth={2.5}
                        fill="url(#disorderGradient)"
                        dot={false}
                        activeDot={{ r: 6, fill: '#8b5cf6', strokeWidth: 2, stroke: '#fff' }}
                    />
                </AreaChart>
            </ResponsiveContainer>
            <div className="text-center text-xs text-slate-500 mt-2 flex items-center justify-center gap-4">
                <span>Intrinsic Disorder Prediction</span>
                {disorderedRegions.length > 0 && (
                    <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                        <span>{disorderedRegions.length} Disordered Region{disorderedRegions.length > 1 ? 's' : ''}</span>
                    </span>
                )}
            </div>
        </div>
    );
};
