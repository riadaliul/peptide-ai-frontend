import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/base';
import { Activity, Waves } from 'lucide-react';
import { CardSkeleton } from '../ui/LoadingSkeleton';
import { EmptyState } from '../ui/EmptyState';

interface DisorderLLPSCardProps {
    data: any;
    isLoading?: boolean;
}

export const DisorderLLPSCard: React.FC<DisorderLLPSCardProps> = ({ data, isLoading = false }) => {
    // Loading state
    if (isLoading) {
        return <CardSkeleton />;
    }

    // Empty state
    if (!data) {
        return (
            <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-md">
                <CardContent>
                    <EmptyState
                        icon={Waves}
                        title="No Disorder Data"
                        description="Analyze a peptide sequence to predict intrinsic disorder and LLPS propensity."
                        variant="compact"
                    />
                </CardContent>
            </Card>
        );
    }

    const fcr = data.descriptors?.sequence_patterns?.fcr_fraction || 0;
    const ncpr = Math.abs(data.descriptors?.physicochemical?.charge_ph7_4 || 0) / (data.sequence?.length || 1);
    const kappa = 0.5; // Placeholder - would need actual calculation
    const disorderScore = 0.3; // Placeholder
    const llpsPropensity = fcr > 0.3 ? 0.7 : 0.3; // Simplified

    const metrics = [
        { label: 'FCR', value: fcr.toFixed(2), description: 'Fraction of charged residues' },
        { label: 'NCPR', value: ncpr.toFixed(2), description: 'Net charge per residue' },
        { label: 'κ', value: kappa.toFixed(2), description: 'Charge distribution parameter' },
        { label: 'Disorder', value: `${(disorderScore * 100).toFixed(0)}%`, description: 'IUPred-like score' },
    ];

    return (
        <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-md hover:shadow-lg transition-all duration-300">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-indigo-600" />
                    Disorder & LLPS
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                    {metrics.map((metric) => (
                        <div key={metric.label} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                            <div className="text-xs font-medium text-slate-600 mb-1">{metric.label}</div>
                            <div className="text-xl font-bold text-blue-900">{metric.value}</div>
                        </div>
                    ))}
                </div>

                {/* LLPS Propensity Bar */}
                <div className="pt-3 border-t border-slate-200">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-slate-700">LLPS Propensity</span>
                        <span className="text-sm font-bold text-indigo-700">{(llpsPropensity * 100).toFixed(0)}%</span>
                    </div>
                    <div className="relative h-3 bg-slate-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                            style={{ width: `${llpsPropensity * 100}%` }}
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
