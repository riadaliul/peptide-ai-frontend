import React, { useState } from 'react';
import type { InterpretationResult } from '../types/bfiRuleEngine';
import { ChevronDown, ChevronUp, Award, AlertTriangle, Target, TrendingUp, TrendingDown, Info, Lightbulb } from 'lucide-react';
import { CardSkeleton } from './ui/LoadingSkeleton';
import { EmptyState } from './ui/EmptyState';

interface BFIInterpretationPanelProps {
    interpretation: InterpretationResult | null;
    isLoading?: boolean;
}

export const BFIInterpretationPanel: React.FC<BFIInterpretationPanelProps> = ({ interpretation, isLoading = false }) => {
    // Loading state
    if (isLoading) {
        return (
            <div className="space-y-4">
                <CardSkeleton />
                <CardSkeleton />
                <CardSkeleton />
            </div>
        );
    }

    // Empty state
    if (!interpretation) {
        return (
            <EmptyState
                icon={Lightbulb}
                title="No BFI Analysis Available"
                description="Analyze a peptide sequence to view detailed BioFunctional Index interpretation and mutation recommendations."
                variant="compact"
            />
        );
    }

    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
        summary: false,
        recommendations: true,
        globalPreferences: false,
        positionDetails: false,
        insights: false
    });

    const toggleSection = (section: string) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const SectionHeader = ({ title, section, icon: Icon }: { title: string; section: string; icon: any }) => (
        <button
            onClick={() => toggleSection(section)}
            className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors rounded-lg border border-slate-200"
        >
            <div className="flex items-center gap-3">
                <Icon className="w-5 h-5 text-slate-600" />
                <h3 className="text-base font-semibold text-slate-800">{title}</h3>
            </div>
            {expandedSections[section] ?
                <ChevronUp className="w-5 h-5 text-slate-500" /> :
                <ChevronDown className="w-5 h-5 text-slate-500" />
            }
        </button>
    );

    const getPositionClassColor = (classId: string) => {
        switch (classId) {
            case 'highly_sensitive':
                return 'bg-red-100 text-red-700 border-red-300';
            case 'moderately_sensitive':
                return 'bg-orange-100 text-orange-700 border-orange-300';
            case 'highly_designable':
                return 'bg-green-100 text-green-700 border-green-300';
            case 'moderately_designable':
                return 'bg-blue-100 text-blue-700 border-blue-300';
            default:
                return 'bg-slate-100 text-slate-700 border-slate-300';
        }
    };

    return (
        <div className="space-y-4 mt-4">
            {/* Summary Section */}
            <div>
                <SectionHeader title="Summary" section="summary" icon={Info} />
                {expandedSections.summary && (
                    <div className="mt-2 p-4 bg-white rounded-lg border border-slate-200 grid grid-cols-3 gap-4">
                        <div className="text-center p-3 bg-red-50 rounded-lg border border-red-100">
                            <div className="text-2xl font-bold text-red-700">{interpretation.sensitive_positions.length}</div>
                            <div className="text-xs text-red-600 mt-1">Sensitive Positions</div>
                            <div className="text-[10px] text-slate-500 mt-1">
                                {interpretation.sensitive_positions.slice(0, 5).join(', ')}
                                {interpretation.sensitive_positions.length > 5 && '...'}
                            </div>
                        </div>
                        <div className="text-center p-3 bg-green-50 rounded-lg border border-green-100">
                            <div className="text-2xl font-bold text-green-700">{interpretation.designable_positions.length}</div>
                            <div className="text-xs text-green-600 mt-1">Designable Positions</div>
                            <div className="text-[10px] text-slate-500 mt-1">
                                {interpretation.designable_positions.slice(0, 5).join(', ')}
                                {interpretation.designable_positions.length > 5 && '...'}
                            </div>
                        </div>
                        <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-100">
                            <div className="text-2xl font-bold text-blue-700">
                                {interpretation.topBeneficialMutations.length > 0 ? `+${interpretation.topBeneficialMutations[0].deltaBFI.toFixed(2)}` : 'N/A'}
                            </div>
                            <div className="text-xs text-blue-600 mt-1">Top ΔBFI</div>
                            {interpretation.topBeneficialMutations.length > 0 && (
                                <div className="text-[10px] text-slate-500 mt-1">
                                    {interpretation.topBeneficialMutations[0].fromAA}{interpretation.topBeneficialMutations[0].position}{interpretation.topBeneficialMutations[0].toAA}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Top Recommendations */}
            <div>
                <SectionHeader title="Top Recommendations" section="recommendations" icon={Award} />
                {expandedSections.recommendations && (
                    <div className="mt-3 p-5 bg-white rounded-lg border border-slate-200">
                        <div className="grid grid-cols-2 gap-3">
                            {interpretation.topBeneficialMutations.slice(0, 10).map((mut, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200 hover:border-green-300 transition-colors"
                                >
                                    <div className="flex items-center gap-2">
                                        <div className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                                            {idx + 1}
                                        </div>
                                        <span className="font-mono text-sm font-semibold text-slate-800">
                                            {mut.fromAA}{mut.position} → {mut.toAA}
                                        </span>
                                    </div>
                                    <span className="font-bold text-sm text-green-700">+{mut.deltaBFI.toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Global Residue Preferences */}
            <div>
                <SectionHeader title="Global Residue Preferences" section="globalPreferences" icon={Target} />
                {expandedSections.globalPreferences && (
                    <div className="mt-2 p-4 bg-white rounded-lg border border-slate-200">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {interpretation.aa_preferences
                                .sort((a, b) => b.mean - a.mean)
                                .map(pref => (
                                    <div
                                        key={pref.aa}
                                        className={`p-2 rounded border ${pref.mean > 0.2 ? 'bg-green-50 border-green-200' :
                                            pref.mean < -0.2 ? 'bg-red-50 border-red-200' :
                                                'bg-slate-50 border-slate-200'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="font-mono font-bold text-lg">{pref.aa}</span>
                                            <span className={`text-sm font-semibold ${pref.mean > 0 ? 'text-green-600' : pref.mean < 0 ? 'text-red-600' : 'text-slate-600'}`}>
                                                {pref.mean > 0 ? '+' : ''}{pref.mean.toFixed(2)}
                                            </span>
                                        </div>
                                        <div className="text-[10px] text-slate-500 mt-1">
                                            ↑{pref.improve_count} ↓{pref.degrade_count}
                                        </div>
                                    </div>
                                ))}
                        </div>

                        {/* Chemistry Group Summary */}
                        <div className="mt-4 pt-4 border-t border-slate-200 space-y-2 text-sm">
                            {interpretation.group_preferences.map(gp => (
                                <div key={gp.group}>
                                    <span className="font-semibold text-slate-700 capitalize">{gp.group}:</span>
                                    <span className={`ml-2 font-semibold ${gp.mean > 0 ? 'text-green-600' : gp.mean < 0 ? 'text-red-600' : 'text-slate-600'}`}>
                                        {gp.mean > 0 ? '+' : ''}{gp.mean.toFixed(2)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Position-by-Position Details */}
            <div>
                <SectionHeader title="Position-by-Position Analysis" section="positionDetails" icon={Target} />
                {expandedSections.positionDetails && (
                    <div className="mt-2 p-4 bg-white rounded-lg border border-slate-200 max-h-[400px] overflow-y-auto">
                        <div className="space-y-2">
                            {interpretation.positions.map(pos => (
                                <div key={pos.posIndex} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono font-bold text-slate-700">Pos {pos.pos1} ({pos.wtAA})</span>
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getPositionClassColor(pos.classId)}`}>
                                                {pos.classLabel}
                                            </span>
                                            {pos.is_excellent_target && (
                                                <span className="px-2 py-0.5 rounded-full text-xs font-medium border bg-yellow-100 text-yellow-700 border-yellow-300">
                                                    ⭐ Top Target
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-xs text-slate-600 space-y-1">
                                        <div>Best: <span className="font-mono font-semibold text-green-700">{pos.best_AA} (+{pos.best_score.toFixed(2)})</span></div>
                                        <div>Worst: <span className="font-mono font-semibold text-red-700">{pos.worst_AA} ({pos.worst_score.toFixed(2)})</span></div>
                                        <div>Improve: {pos.num_improve} | Degrade: {pos.num_degrade} | Neutral: {pos.num_neutral}</div>
                                        {pos.chemistry_text.length > 0 && (
                                            <div className="text-[11px] text-slate-500 italic mt-2 space-y-1">
                                                {pos.chemistry_text.map((text, idx) => (
                                                    <div key={idx}>• {text}</div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Overall Insights */}
            <div>
                <SectionHeader title="Overall Design Insights" section="insights" icon={Info} />
                {expandedSections.insights && (
                    <div className="mt-2 p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
                        <div className="space-y-3 text-sm text-slate-700">
                            <div>
                                <span className="font-semibold text-indigo-700">Conserved Core:</span>
                                <span className="ml-2">{interpretation.conserved_positions.join(', ') || 'None'}</span>
                            </div>
                            <div>
                                <span className="font-semibold text-indigo-700">Excellent Targets:</span>
                                <span className="ml-2">{interpretation.excellent_target_positions.join(', ') || 'None'}</span>
                            </div>
                            <div className="pt-2 border-t border-indigo-200 text-xs italic">
                                {interpretation.global_summary}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
