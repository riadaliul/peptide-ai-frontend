import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/base';
import { BarChart3, PieChart } from 'lucide-react';
import { CardSkeleton } from '../ui/LoadingSkeleton';
import { EmptyState } from '../ui/EmptyState';

interface ResidueDistributionCardProps {
    sequence: string;
    isLoading?: boolean;
}

export const ResidueDistributionCard: React.FC<ResidueDistributionCardProps> = ({ sequence, isLoading = false }) => {
    // Loading state
    if (isLoading) {
        return <CardSkeleton />;
    }

    // Empty state
    if (!sequence) {
        return (
            <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-md">
                <CardContent>
                    <EmptyState
                        icon={PieChart}
                        title="No Distribution Data"
                        description="Enter a peptide sequence to visualize amino acid composition and residue distribution."
                        variant="compact"
                    />
                </CardContent>
            </Card>
        );
    }

    // Calculate distributions
    const hydrophobic = 'AVIL MFWP'.replace(/\s/g, '');
    const polar = 'STNQCY';
    const charged = 'DEKRH';
    const aromatic = 'FWY';

    const total = sequence.length;
    const counts = {
        hydrophobic: sequence.split('').filter(aa => hydrophobic.includes(aa)).length,
        polar: sequence.split('').filter(aa => polar.includes(aa)).length,
        charged: sequence.split('').filter(aa => charged.includes(aa)).length,
        aromatic: sequence.split('').filter(aa => aromatic.includes(aa)).length,
    };

    const percentages = {
        hydrophobic: ((counts.hydrophobic / total) * 100),
        polar: ((counts.polar / total) * 100),
        charged: ((counts.charged / total) * 100),
        aromatic: ((counts.aromatic / total) * 100),
    };

    const categories = [
        { label: 'Hydrophobic', value: percentages.hydrophobic, color: 'bg-amber-500', textColor: 'text-amber-700' },
        { label: 'Polar', value: percentages.polar, color: 'bg-blue-500', textColor: 'text-blue-700' },
        { label: 'Charged', value: percentages.charged, color: 'bg-purple-500', textColor: 'text-purple-700' },
        { label: 'Aromatic', value: percentages.aromatic, color: 'bg-teal-500', textColor: 'text-teal-700' },
    ];

    return (
        <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-md hover:shadow-lg transition-all duration-300">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-indigo-600" />
                    Residue Distribution
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {categories.map((cat) => (
                    <div key={cat.label} className="group">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-slate-700">{cat.label}</span>
                            <span className={`text-sm font-bold ${cat.textColor}`}>
                                {cat.value.toFixed(1)}%
                            </span>
                        </div>
                        <div className="relative h-3 bg-slate-100 rounded-full overflow-hidden">
                            <div
                                className={`h-full ${cat.color} rounded-full transition-all duration-500 group-hover:opacity-80`}
                                style={{ width: `${cat.value}%` }}
                            />
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
};
