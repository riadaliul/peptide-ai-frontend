import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/base';
import { Zap, Activity, Droplet, AlertCircle, Target } from 'lucide-react';
import { MetricsSkeleton } from '../ui/LoadingSkeleton';
import { EmptyState } from '../ui/EmptyState';

interface KeyDescriptorsGridProps {
    data: any;
    isLoading?: boolean;
}

export const KeyDescriptorsGrid: React.FC<KeyDescriptorsGridProps> = ({ data, isLoading = false }) => {
    // Loading state
    if (isLoading) {
        return <MetricsSkeleton />;
    }

    // Empty state
    if (!data) {
        return (
            <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-md">
                <CardContent>
                    <EmptyState
                        icon={Target}
                        title="No Descriptors Available"
                        description="Analyze a peptide sequence to view key biophysical and functional descriptors."
                        variant="compact"
                    />
                </CardContent>
            </Card>
        );
    }

    const bfi = data.descriptors.physicochemical.boman_index;
    const aggRisk = data.descriptors.ml_predictions.aggregation_probability;
    const charge = data.descriptors.physicochemical.charge_ph7_4;
    const pi = data.descriptors.physicochemical.isoelectric_point;

    const descriptors = [
        {
            icon: Zap,
            label: 'BioFunctional Index',
            value: bfi.toFixed(2),
            description: 'Composite score combining multiple functional descriptors',
            color: 'from-amber-500 to-orange-500',
            iconColor: 'text-amber-600',
        },
        {
            icon: Activity,
            label: 'Aggregation Risk',
            value: aggRisk > 0.5 ? 'High' : 'Low',
            description: 'Likelihood of peptide self-assembly or precipitation',
            color: aggRisk > 0.5 ? 'from-red-500 to-orange-500' : 'from-emerald-500 to-green-500',
            iconColor: aggRisk > 0.5 ? 'text-red-600' : 'text-emerald-600',
        },
        {
            icon: Zap,
            label: 'Net Charge',
            value: charge > 0 ? `+${charge.toFixed(1)}` : charge.toFixed(1),
            description: 'Overall electrostatic charge at pH 7.4',
            color: 'from-purple-500 to-indigo-500',
            iconColor: 'text-purple-600',
        },
        {
            icon: Droplet,
            label: 'Isoelectric Point',
            value: pi.toFixed(1),
            description: 'pH at which peptide has zero net charge',
            color: 'from-cyan-500 to-blue-500',
            iconColor: 'text-cyan-600',
        },
    ];

    return (
        <div className="grid grid-cols-2 gap-4">
            {descriptors.map((desc, index) => {
                const Icon = desc.icon;
                return (
                    <Card
                        key={desc.label}
                        className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer group"
                    >
                        <CardContent className="p-5">
                            <div className="flex items-start justify-between mb-3">
                                <div className={`p-2 rounded-lg bg-gradient-to-br ${desc.color} bg-opacity-10`}>
                                    <Icon className={`w-5 h-5 ${desc.iconColor}`} />
                                </div>
                                <AlertCircle className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                            </div>
                            <div className="text-sm font-medium text-slate-600 mb-2">{desc.label}</div>
                            <div className="text-2xl font-bold text-blue-900 mb-2">{desc.value}</div>

                            {/* Tooltip on hover */}
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-xs text-slate-500 mt-2">
                                {desc.description}
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
};
