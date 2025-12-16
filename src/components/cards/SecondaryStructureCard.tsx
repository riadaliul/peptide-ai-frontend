import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/base';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Dna } from 'lucide-react';
import { CardSkeleton } from '../ui/LoadingSkeleton';
import { EmptyState } from '../ui/EmptyState';

interface SecondaryStructureCardProps {
    data: {
        helix_percent: number;
        sheet_percent: number;
        coil_percent: number;
    } | null;
    isLoading?: boolean;
}

export const SecondaryStructureCard: React.FC<SecondaryStructureCardProps> = ({ data, isLoading = false }) => {
    // Loading state
    if (isLoading) {
        return <CardSkeleton />;
    }

    // Empty state
    if (!data) {
        return (
            <Card className="h-full">
                <CardHeader>
                    <CardTitle>Secondary Structure</CardTitle>
                </CardHeader>
                <CardContent>
                    <EmptyState
                        icon={Dna}
                        title="No Structure Data"
                        description="Analyze a peptide sequence to predict secondary structure composition."
                        variant="compact"
                    />
                </CardContent>
            </Card>
        );
    }

    const chartData = [
        { name: 'Helix', value: data.helix_percent, color: '#8b5cf6' }, // Violet
        { name: 'Sheet', value: data.sheet_percent, color: '#f59e0b' }, // Amber
        { name: 'Coil', value: data.coil_percent, color: '#64748b' },  // Slate
    ];

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>Secondary Structure Prediction</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[220px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                                stroke="none"
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                                itemStyle={{ color: '#f8fafc' }}
                                formatter={(value: number) => [`${value}%`, '']}
                            />
                            <Legend
                                verticalAlign="bottom"
                                height={36}
                                iconType="circle"
                                formatter={(value, entry: any) => <span className="text-slate-600 font-medium ml-1">{value}</span>}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Detailed breakdown below chart */}
                <div className="grid grid-cols-3 gap-2 mt-2 text-center">
                    <div className="p-2 bg-violet-50 rounded-lg border border-violet-100">
                        <div className="text-xs text-violet-600 font-semibold uppercase">Helix</div>
                        <div className="text-lg font-bold text-violet-700">{data.helix_percent}%</div>
                    </div>
                    <div className="p-2 bg-amber-50 rounded-lg border border-amber-100">
                        <div className="text-xs text-amber-600 font-semibold uppercase">Sheet</div>
                        <div className="text-lg font-bold text-amber-700">{data.sheet_percent}%</div>
                    </div>
                    <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="text-xs text-slate-500 font-semibold uppercase">Coil</div>
                        <div className="text-lg font-bold text-slate-700">{data.coil_percent}%</div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
