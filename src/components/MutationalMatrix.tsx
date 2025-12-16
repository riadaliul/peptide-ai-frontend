import React, { useEffect, useState } from 'react';
import Plot from 'react-plotly.js';
import axios from 'axios';
import { Loader2, Brain, ChevronDown, ChevronUp } from 'lucide-react';
import { interpretBFIMatrix } from '../lib/bfiRuleEngine';
import type { InterpretationResult } from '../types/bfiRuleEngine';
import { BFIInterpretationPanel } from './BFIInterpretationPanel';
import bfiConfig from '../config/bfiRuleEngine.json';
import { api } from '../config/api';

interface MutationalMatrixProps {
    sequence: string;
}

export const MutationalMatrix: React.FC<MutationalMatrixProps> = ({ sequence }) => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [showInterpretation, setShowInterpretation] = useState(false);
    const [interpretation, setInterpretation] = useState<InterpretationResult | null>(null);

    useEffect(() => {
        if (!sequence) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                const res = await axios.post(api.scan, { sequence });
                setData(res.data.scan_results);

                // Generate interpretation using new rule engine
                if (res.data.scan_results && res.data.scan_results.heatmap) {
                    const heatmapData = transformHeatmapData(
                        res.data.scan_results.heatmap,
                        res.data.scan_results.amino_acids
                    );
                    const interp = interpretBFIMatrix(heatmapData, sequence, bfiConfig as any);
                    setInterpretation(interp);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [sequence]);

    // Transform backend heatmap format to [AA_index][position_index]
    const transformHeatmapData = (heatmap: any[], aminoAcids: string[]) => {
        const numAAs = aminoAcids.length;
        const numPositions = heatmap.length;
        const transformed: number[][] = [];

        for (let aaIdx = 0; aaIdx < numAAs; aaIdx++) {
            const row: number[] = [];
            for (let posIdx = 0; posIdx < numPositions; posIdx++) {
                row.push(heatmap[posIdx].deltas[aaIdx]);
            }
            transformed.push(row);
        }

        return transformed;
    };

    if (loading) return <div className="h-[400px] flex items-center justify-center text-white/40"><Loader2 className="w-8 h-8 animate-spin" /></div>;
    if (!data || !data.heatmap) return null;

    // Prepare data for heatmap
    // X-axis: Position (1, 2, 3...)
    // Y-axis: Amino Acid (A, C, D...)
    // Z-axis: Delta BFI

    const positions = data.heatmap.map((d: any) => d.position);
    const aminoAcids = data.amino_acids.slice().reverse(); // Reverse for correct Y-axis orientation

    // Construct Z values (2D array)
    // Plotly heatmap expects z[y][x] where y is the row (amino acid) and x is the column (position)
    // Our data.heatmap is a list of columns (positions).
    // We need to transpose this.

    const zValues = aminoAcids.map((aa: string, aaIndex: number) => {
        // For each amino acid (row), get the value at each position (column)
        // The backend returns 'deltas' array in the order of 'amino_acids'
        // So we need to find the index of 'aa' in the original 'amino_acids' list
        const originalIndex = data.amino_acids.indexOf(aa);
        return data.heatmap.map((posData: any) => posData.deltas[originalIndex]);
    });

    return (
        <div className="h-full w-full flex flex-col">
            <div className="mb-6">
                <h3 className="text-blue-900 font-bold text-lg flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-science-green animate-pulse" />
                    Mutational Energy Landscape (ΔBFI)
                </h3>
                <p className="text-sm text-slate-400 mt-1">
                    Heatmap showing the change in BioFunctional Index for every single-point mutation.
                    <span className="text-science-green ml-2">Red = Improved</span>,
                    <span className="text-science-blue ml-2">Blue = Degraded</span>.
                </p>
            </div>

            {/* Heatmap */}
            <div className="flex-grow w-full min-h-[500px] rounded-xl overflow-hidden border border-white/5 bg-slate-900/50 backdrop-blur-sm shadow-inner">
                <Plot
                    data={[
                        {
                            x: positions.map((p: number) => `Pos ${p}`),
                            y: aminoAcids,
                            z: zValues,
                            type: 'heatmap',
                            colorscale: [
                                [0, '#3b82f6'],   // Blue (Low/Bad)
                                [0.5, '#0f172a'], // Dark (Neutral)
                                [1, '#22c55e']    // Green (High/Good)
                            ],
                            zmid: 0,
                            showscale: true,
                            colorbar: {
                                title: 'ΔBFI',
                                titleside: 'right',
                                tickfont: { color: '#94a3b8', family: 'Inter, sans-serif' },
                                titlefont: { color: '#e2e8f0', family: 'Inter, sans-serif' },
                                thickness: 15,
                                len: 0.9
                            },
                            xgap: 1,
                            ygap: 1
                        }
                    ]}
                    layout={{
                        paper_bgcolor: 'rgba(0,0,0,0)',
                        plot_bgcolor: 'rgba(0,0,0,0)',
                        xaxis: {
                            tickfont: { color: '#94a3b8', family: 'Inter, sans-serif' },
                            side: 'top',
                            gridcolor: 'rgba(255,255,255,0.05)'
                        },
                        yaxis: {
                            tickfont: { color: '#94a3b8', family: 'Inter, sans-serif' },
                            gridcolor: 'rgba(255,255,255,0.05)'
                        },
                        margin: { t: 60, b: 40, l: 60, r: 60 },
                        autosize: true,
                        font: { family: 'Inter, sans-serif' }
                    }}
                    useResizeHandler={true}
                    style={{ width: '100%', height: '100%' }}
                    config={{ displayModeBar: false, responsive: true }}
                />
            </div>

            {/* Extra Large spacing before interpretation section - PREVENTS OVERLAP */}
            <div className="mt-24 border-t border-slate-200 pt-12">
                {/* Interpretation Toggle */}
                {interpretation && (
                    <div>
                        <button
                            onClick={() => setShowInterpretation(!showInterpretation)}
                            className="relative z-10 w-full flex items-center justify-between p-6 bg-white hover:bg-slate-50 transition-all duration-300 rounded-2xl border-2 border-slate-200 hover:border-indigo-400 hover:shadow-lg shadow-sm"
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-indigo-100 rounded-xl">
                                    <Brain className="w-6 h-6 text-indigo-600" />
                                </div>
                                <div className="text-left">
                                    <h4 className="font-semibold text-lg text-slate-900">AI-Powered Mutational Interpretation</h4>
                                    <p className="text-sm text-slate-600 mt-1">
                                        {interpretation.sensitive_positions.length} sensitive • {interpretation.designable_positions.length} designable positions
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-sm font-medium text-slate-500">
                                    {showInterpretation ? 'Hide' : 'Show'} Details
                                </span>
                                {showInterpretation ?
                                    <ChevronUp className="w-6 h-6 text-slate-600" /> :
                                    <ChevronDown className="w-6 h-6 text-slate-600" />
                                }
                            </div>
                        </button>

                        {/* Interpretation Panel */}
                        {showInterpretation && (
                            <div className="mt-6">
                                <BFIInterpretationPanel interpretation={interpretation} />
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
