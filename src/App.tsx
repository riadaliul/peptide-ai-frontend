import React, { useState } from 'react';
import { HeroSection } from './components/HeroSection';
import { TopNavigation } from './components/layout/TopNavigation';
import { MainLayout } from './components/MainLayout';
import { Card, CardHeader, CardTitle, CardContent, Badge } from './components/ui/base';
import { HelicalWheel } from './components/charts/HelicalWheel';
import { HydrophobicityPlot } from './components/charts/HydrophobicityPlot';
import { DisorderPlot } from './components/charts/DisorderPlot';
import { ResidueDistribution } from './components/charts/ResidueDistribution';
import { StructureViewer } from './components/StructureViewer';
import { AnimatePresence, motion } from 'framer-motion';
import { MutationalMatrix } from './components/MutationalMatrix';
import { SequenceSummaryCard } from './components/cards/SequenceSummaryCard';
import { ResidueDistributionCard } from './components/cards/ResidueDistributionCard';
import { DisorderLLPSCard } from './components/cards/DisorderLLPSCard';
import { KeyDescriptorsGrid } from './components/cards/KeyDescriptorsGrid';
import { SecondaryStructureCard } from './components/cards/SecondaryStructureCard';
import { ChartSkeleton, CardSkeleton } from './components/ui/LoadingSkeleton';
import { EmptyState } from './components/ui/EmptyState';
import axios from 'axios';
import { api } from './config/api';

function App() {
    const [sequence, setSequence] = useState('');
    const [activeTab, setActiveTab] = useState('overview');
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const [explanation, setExplanation] = useState('');

    const handleAnalyze = async () => {
        console.log('=== handleAnalyze CALLED ===');
        console.log('sequence:', sequence);
        console.log('sequence empty?', !sequence);

        if (!sequence) {
            console.log('EARLY RETURN: No sequence');
            return;
        }

        console.log('Setting loading to true...');
        setLoading(true);

        try {
            console.log('About to make API calls to:', api.analyze, api.explain);
            console.log('API config:', api);

            const analyzePromise = axios.post(api.analyze, { sequence });
            const explainPromise = axios.post(api.explain, { sequence });

            console.log('Promises created, awaiting...');
            const [analyzeRes, explainRes] = await Promise.all([analyzePromise, explainPromise]);

            console.log('=== API CALLS COMPLETED ===');
            console.log('Analyze Response:', analyzeRes.data);
            console.log('Explain Response:', explainRes.data);

            console.log('Setting data state...');
            setData(analyzeRes.data);
            console.log('Setting explanation state...');
            setExplanation(explainRes.data.explanation);
            console.log('States set successfully!');
        } catch (error) {
            console.error("=== ANALYSIS FAILED ===");
            console.error("Error type:", typeof error);
            console.error("Error:", error);
            console.error("Error message:", error instanceof Error ? error.message : 'Unknown error');
            console.error("Full error object:", JSON.stringify(error, null, 2));
        } finally {
            console.log('Setting loading to false...');
            setLoading(false);
            console.log('=== handleAnalyze COMPLETE ===');
        }
    };

    const handlePrint = () => {
        window.print();
    };

    // Placeholder content for panels
    const LeftPanel = () => (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Sequence Intelligence</CardTitle>
                </CardHeader>
                <CardContent>
                    {data ? (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                                <span className="text-slate-400">Length</span>
                                <span className="font-mono font-bold text-xl">{data.sequence.length} AA</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                                <span className="text-slate-400">Mol. Weight</span>
                                <span className="font-mono font-bold text-xl">{data.descriptors.physicochemical.molecular_weight} Da</span>
                            </div>

                            <div className="pt-4">
                                <h4 className="text-sm font-semibold text-slate-300 mb-2">Amino Acid Composition</h4>
                                <div className="grid grid-cols-5 gap-1">
                                    {Object.entries(data.descriptors.sequence_patterns.aac).slice(0, 10).map(([aa, pct]: any) => (
                                        <div key={aa} className="text-center p-1 bg-slate-800 rounded">
                                            <div className="text-xs font-bold text-white">{aa}</div>
                                            <div className="text-[10px] text-slate-400">{pct.toFixed(0)}%</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <p className="text-muted-foreground">Enter a sequence to analyze.</p>
                    )}
                </CardContent>
            </Card>

            {explanation && (
                <Card className="border-science-purple/50 bg-science-purple/5">
                    <CardHeader><CardTitle className="text-science-purple">AI Interpretation</CardTitle></CardHeader>
                    <CardContent>
                        <p className="text-sm leading-relaxed text-slate-200">
                            {explanation}
                        </p>
                    </CardContent>
                </Card>
            )}

            {data && (
                <Card>
                    <CardHeader><CardTitle>ML Predictions</CardTitle></CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span>Antimicrobial (AMP)</span>
                            <Badge variant={data.descriptors.ml_predictions.amp_class ? "success" : "secondary"}>
                                {data.descriptors.ml_predictions.amp_probability.toFixed(2)}
                            </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                            <span>Toxicity (Hemolytic)</span>
                            <Badge variant={data.descriptors.ml_predictions.toxicity_class ? "destructive" : "success"}>
                                {data.descriptors.ml_predictions.toxicity_probability.toFixed(2)}
                            </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                            <span>Solubility</span>
                            <Badge variant={data.descriptors.ml_predictions.solubility_class ? "success" : "warning"}>
                                {data.descriptors.ml_predictions.solubility_probability.toFixed(2)}
                            </Badge>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );

    const CenterPanel = () => (
        <div className="space-y-6">
            {/* Structure & Helical Wheel Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="h-[450px] overflow-hidden">
                    <CardHeader><CardTitle>3D Structure Model</CardTitle></CardHeader>
                    <CardContent className="p-0 h-full">
                        <StructureViewer sequence={sequence} />
                    </CardContent>
                </Card>
                <Card className="h-[450px]">
                    <CardHeader><CardTitle>Helical Wheel</CardTitle></CardHeader>
                    <CardContent className="flex items-center justify-center h-full pb-12">
                        <HelicalWheel sequence={sequence} />
                    </CardContent>
                </Card>
            </div>

            {/* Plots Row */}
            <Card>
                <CardHeader><CardTitle>Physicochemical Profiles</CardTitle></CardHeader>
                <CardContent>
                    <div className="space-y-8">
                        <div>
                            <h4 className="text-sm font-medium text-slate-400 mb-4">Hydrophobicity (Kyte-Doolittle)</h4>
                            <HydrophobicityPlot sequence={sequence} isLoading={loading} />
                        </div>
                        {data && data.descriptors.disorder && (
                            <div>
                                <h4 className="text-sm font-medium text-slate-400 mb-4">Disorder Propensity</h4>
                                <DisorderPlot sequence={sequence} profile={data.descriptors.disorder.disorder_profile} isLoading={loading} />
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );

    const RightPanel = () => {
        console.log('RightPanel rendering, data:', data);
        return (
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Physicochemical</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {data ? (
                            <div className="grid grid-cols-1 gap-4">
                                <div className="p-3 bg-secondary/50 rounded-lg flex justify-between items-center">
                                    <div className="text-sm text-muted-foreground">Instability Index</div>
                                    <div className={`text-lg font-bold ${data.descriptors.physicochemical.instability_index > 40 ? 'text-red-400' : 'text-green-400'}`}>
                                        {data.descriptors.physicochemical.instability_index}
                                    </div>
                                </div>
                                <div className="p-3 bg-secondary/50 rounded-lg flex justify-between items-center">
                                    <div className="text-sm text-muted-foreground">GRAVY</div>
                                    <div className="text-lg font-bold">{data.descriptors.physicochemical.gravy}</div>
                                </div>
                                <div className="p-3 bg-secondary/50 rounded-lg flex justify-between items-center">
                                    <div className="text-sm text-muted-foreground">Aromaticity</div>
                                    <div className="text-lg font-bold">{data.descriptors.physicochemical.aromaticity}</div>
                                </div>
                                <div className="p-3 bg-secondary/50 rounded-lg flex justify-between items-center">
                                    <div className="text-sm text-muted-foreground">Aliphatic Index</div>
                                    <div className="text-lg font-bold">{data.descriptors.physicochemical.aliphatic_index}</div>
                                </div>
                            </div>
                        ) : <p className="text-muted-foreground">No data</p>}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle>Secondary Structure</CardTitle></CardHeader>
                    <CardContent>
                        {data ? (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm"><span>Helix</span><span>{data.descriptors.secondary_structure.helix_percent}%</span></div>
                                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-science-purple" style={{ width: `${data.descriptors.secondary_structure.helix_percent}% ` }} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm"><span>Sheet</span><span>{data.descriptors.secondary_structure.sheet_percent}%</span></div>
                                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-science-amber" style={{ width: `${data.descriptors.secondary_structure.sheet_percent}% ` }} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm"><span>Coil</span><span>{data.descriptors.secondary_structure.coil_percent}%</span></div>
                                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-slate-500" style={{ width: `${data.descriptors.secondary_structure.coil_percent}% ` }} />
                                    </div>
                                </div>
                            </div>
                        ) : <p className="text-muted-foreground">No data</p>}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle>Cheminformatics (RDKit)</CardTitle></CardHeader>
                    <CardContent>
                        {data ? (
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div className="p-2 bg-slate-800 rounded">
                                    <div className="text-slate-400 text-xs">LogP</div>
                                    <div className="font-mono">{data.descriptors.cheminformatics.logp}</div>
                                </div>
                                <div className="p-2 bg-slate-800 rounded">
                                    <div className="text-slate-400 text-xs">TPSA</div>
                                    <div className="font-mono">{data.descriptors.cheminformatics.tpsa}</div>
                                </div>
                                <div className="p-2 bg-slate-800 rounded">
                                    <div className="text-slate-400 text-xs">H-Bond Donors</div>
                                    <div className="font-mono">{data.descriptors.cheminformatics.hbd}</div>
                                </div>
                                <div className="p-2 bg-slate-800 rounded">
                                    <div className="text-slate-400 text-xs">H-Bond Acceptors</div>
                                    <div className="font-mono">{data.descriptors.cheminformatics.hba}</div>
                                </div>
                            </div>
                        ) : <p className="text-muted-foreground">No data</p>}
                    </CardContent>
                </Card>
            </div>
        );
    };

    // Calculate metrics for Hero Section
    const heroMetrics = data ? {
        bfi: data.descriptors.physicochemical.boman_index, // Using Boman as proxy for BFI for now
        aggRisk: data.descriptors.ml_predictions.aggregation_probability,
        charge: data.descriptors.physicochemical.charge_ph7_4,
        pi: data.descriptors.physicochemical.isoelectric_point
    } : null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            {/* Hero Section */}
            <HeroSection
                sequence={sequence}
                setSequence={setSequence}
                onAnalyze={handleAnalyze}
                metrics={heroMetrics}
            />

            {/* Top Navigation - Fixed */}
            <TopNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

            {/* Main Dashboard Container - with padding for fixed nav */}
            <main className="max-w-[1440px] mx-auto px-8 py-12 pt-24">
                <AnimatePresence mode="wait">
                    {activeTab === 'overview' && (
                        <motion.div
                            key="overview"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        >
                            {/* Column 1: Sequence Intelligence */}
                            <div className="space-y-6">
                                <h2 className="text-lg font-semibold text-blue-900 mb-4">Sequence Intelligence</h2>
                                <SequenceSummaryCard sequence={sequence} data={data} isLoading={loading} />

                                {/* Residue Composition Chart */}
                                <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-md">
                                    <CardHeader><CardTitle>Residue Composition</CardTitle></CardHeader>
                                    <CardContent>
                                        <ResidueDistribution sequence={sequence} isLoading={loading} />
                                    </CardContent>
                                </Card>

                                <DisorderLLPSCard data={data} isLoading={loading} />
                            </div>

                            {/* Column 2: Structural & Function Insights */}
                            <div className="space-y-6">
                                <h2 className="text-lg font-semibold text-blue-900 mb-4">Structure & Function</h2>
                                {data && (
                                    <>
                                        <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-md">
                                            <CardHeader><CardTitle>Helical Wheel</CardTitle></CardHeader>
                                            <CardContent>
                                                <HelicalWheel sequence={sequence} />
                                            </CardContent>
                                        </Card>
                                        <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-md">
                                            <CardHeader><CardTitle>Hydrophobicity Profile</CardTitle></CardHeader>
                                            <CardContent>
                                                <HydrophobicityPlot sequence={sequence} isLoading={loading} />
                                            </CardContent>
                                        </Card>

                                        <SecondaryStructureCard data={data.descriptors.secondary_structure} isLoading={loading} />
                                    </>
                                )}
                                {!data && !loading && (
                                    <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-md">
                                        <CardContent className="p-0">
                                            <EmptyState
                                                title="No Data Yet"
                                                description="Analyze a peptide sequence to view structure insights, helical wheel projections, and hydrophobicity profiles."
                                            />
                                        </CardContent>
                                    </Card>
                                )}

                            </div>

                            {/* Column 3: Design & ML */}
                            <div className="space-y-6">
                                <h2 className="text-lg font-semibold text-blue-900 mb-4">Design & ML Predictions</h2>
                                <KeyDescriptorsGrid data={data} isLoading={loading} />
                                {data && explanation && (
                                    <Card className="bg-white/80 backdrop-blur-sm border-indigo-200 shadow-md">
                                        <CardHeader>
                                            <CardTitle className="text-indigo-900">AI Interpretation</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm leading-relaxed text-slate-700">
                                                {explanation}
                                            </p>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'structure' && (
                        <motion.div
                            key="structure"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[70vh]"
                        >
                            <Card className="h-full overflow-hidden border-science-blue/30 shadow-2xl shadow-science-blue/10">
                                <CardHeader className="bg-slate-900/50 border-b border-white/5">
                                    <CardTitle className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-science-blue animate-pulse" />
                                        3D Molecular Structure
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-0 h-full relative">
                                    <StructureViewer sequence={sequence} />
                                </CardContent>
                            </Card>
                            <Card className="h-full border-science-amber/30 shadow-2xl shadow-science-amber/10">
                                <CardHeader className="bg-slate-900/50 border-b border-white/5">
                                    <CardTitle>Helical Wheel Projection</CardTitle>
                                </CardHeader>
                                <CardContent className="flex items-center justify-center h-full pb-20">
                                    <HelicalWheel sequence={sequence} />
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}

                    {activeTab === 'physicochemical' && (
                        <motion.div
                            key="physicochemical"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
                        >
                            <Card>
                                <CardHeader><CardTitle>Hydrophobicity Profile (Kyte-Doolittle)</CardTitle></CardHeader>
                                <CardContent>
                                    <HydrophobicityPlot sequence={sequence} isLoading={loading} />
                                </CardContent>
                            </Card>
                            {data && data.descriptors.disorder && (
                                <Card>
                                    <CardHeader><CardTitle>Disorder Propensity</CardTitle></CardHeader>
                                    <CardContent>
                                        <DisorderPlot sequence={sequence} profile={data.descriptors.disorder.disorder_profile} isLoading={loading} />
                                    </CardContent>
                                </Card>
                            )}
                            <div className="lg:col-span-2">
                                <RightPanel />
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'design' && (
                        <motion.div
                            key="design"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="max-w-5xl mx-auto"
                        >
                            <Card className="border-science-green/30 shadow-2xl shadow-science-green/10 bg-slate-950/50 backdrop-blur-xl">
                                <CardHeader>
                                    <CardTitle className="text-2xl text-science-green">Mutational Scanning Engine</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <MutationalMatrix sequence={sequence} />
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}

                    {activeTab === 'ml' && (
                        <motion.div
                            key="ml"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="max-w-4xl mx-auto space-y-8"
                        >
                            {explanation && (
                                <Card className="border-science-purple/50 bg-science-purple/10">
                                    <CardHeader><CardTitle className="text-science-purple text-2xl">AI Interpretation</CardTitle></CardHeader>
                                    <CardContent>
                                        <p className="text-lg leading-relaxed text-slate-200">
                                            {explanation}
                                        </p>
                                    </CardContent>
                                </Card>
                            )}
                            {data && (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <Card className="bg-slate-900/50 border-white/10">
                                        <CardHeader><CardTitle className="text-center">Antimicrobial</CardTitle></CardHeader>
                                        <CardContent className="flex flex-col items-center justify-center pt-6">
                                            <div className={`text-4xl font-bold mb-2 ${data.descriptors.ml_predictions.amp_class ? 'text-science-green' : 'text-slate-500'}`}>
                                                {(data.descriptors.ml_predictions.amp_probability * 100).toFixed(0)}%
                                            </div>
                                            <Badge variant={data.descriptors.ml_predictions.amp_class ? "success" : "secondary"}>
                                                {data.descriptors.ml_predictions.amp_class ? "High Probability" : "Low Probability"}
                                            </Badge>
                                        </CardContent>
                                    </Card>
                                    <Card className="bg-slate-900/50 border-white/10">
                                        <CardHeader><CardTitle className="text-center">Toxicity</CardTitle></CardHeader>
                                        <CardContent className="flex flex-col items-center justify-center pt-6">
                                            <div className={`text-4xl font-bold mb-2 ${data.descriptors.ml_predictions.toxicity_class ? 'text-red-500' : 'text-science-green'}`}>
                                                {(data.descriptors.ml_predictions.toxicity_probability * 100).toFixed(0)}%
                                            </div>
                                            <Badge variant={data.descriptors.ml_predictions.toxicity_class ? "destructive" : "success"}>
                                                {data.descriptors.ml_predictions.toxicity_class ? "Toxic" : "Safe"}
                                            </Badge>
                                        </CardContent>
                                    </Card>
                                    <Card className="bg-slate-900/50 border-white/10">
                                        <CardHeader><CardTitle className="text-center">Solubility</CardTitle></CardHeader>
                                        <CardContent className="flex flex-col items-center justify-center pt-6">
                                            <div className={`text-4xl font-bold mb-2 ${data.descriptors.ml_predictions.solubility_class ? 'text-science-blue' : 'text-science-amber'}`}>
                                                {(data.descriptors.ml_predictions.solubility_probability * 100).toFixed(0)}%
                                            </div>
                                            <Badge variant={data.descriptors.ml_predictions.solubility_class ? "success" : "warning"}>
                                                {data.descriptors.ml_predictions.solubility_class ? "Soluble" : "Insoluble"}
                                            </Badge>
                                        </CardContent>
                                    </Card>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div >
    );
}

export default App;
