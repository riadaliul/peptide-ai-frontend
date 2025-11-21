import React from 'react';
import Plot from 'react-plotly.js';
import { AnalysisResult } from '../types';

interface ScientificPlotsProps {
    data: AnalysisResult;
}

export const ScientificPlots: React.FC<ScientificPlotsProps> = ({ data }) => {
    const { descriptors, sequence } = data;

    // Helical Wheel Data Preparation (Simplified)
    // In a real app, backend would return coordinates. Here we calculate roughly.
    const residues = sequence.split('');
    const angle = 100 * (Math.PI / 180); // 100 degrees per residue for alpha helix
    const r = residues.map((_, i) => ({
        r: 1,
        theta: (i * angle * 180) / Math.PI, // Plotly uses degrees
        text: residues[i],
        color: getResidueColor(residues[i])
    }));

    // Hydrophobicity Profile (Kyte-Doolittle window)
    const hydrophobicity = calculateHydrophobicityProfile(sequence);

    return (
        <div className="space-y-8">
            <div className="glass-panel p-4">
                <h3 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">Helical Wheel Projection</h3>
                <div className="w-full h-[300px]">
                    <Plot
                        data={[
                            {
                                type: 'scatterpolar',
                                r: r.map(() => 1),
                                theta: r.map(d => d.theta),
                                text: r.map(d => d.text),
                                mode: 'text+markers',
                                marker: {
                                    color: r.map(d => d.color),
                                    size: 30,
                                    line: { color: 'white', width: 1 }
                                },
                                textfont: { color: 'white', size: 14, family: 'Inter' },
                                hoverinfo: 'text'
                            }
                        ]}
                        layout={{
                            paper_bgcolor: 'rgba(0,0,0,0)',
                            plot_bgcolor: 'rgba(0,0,0,0)',
                            polar: {
                                bgcolor: 'rgba(0,0,0,0)',
                                angularaxis: { showticklabels: false, showgrid: false, linecolor: 'rgba(255,255,255,0.1)' },
                                radialaxis: { visible: false, range: [0, 1.2] }
                            },
                            margin: { t: 20, b: 20, l: 20, r: 20 },
                            showlegend: false,
                            autosize: true
                        }}
                        useResizeHandler={true}
                        style={{ width: '100%', height: '100%' }}
                        config={{ displayModeBar: false }}
                    />
                </div>
            </div>

            <div className="glass-panel p-4">
                <h3 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">Hydrophobicity Profile</h3>
                <div className="w-full h-[200px]">
                    <Plot
                        data={[
                            {
                                x: hydrophobicity.map((_, i) => i + 1),
                                y: hydrophobicity,
                                type: 'scatter',
                                mode: 'lines',
                                line: { color: '#ec4899', width: 3, shape: 'spline' },
                                fill: 'tozeroy',
                                fillcolor: 'rgba(236, 72, 153, 0.1)'
                            }
                        ]}
                        layout={{
                            paper_bgcolor: 'rgba(0,0,0,0)',
                            plot_bgcolor: 'rgba(0,0,0,0)',
                            xaxis: { title: 'Residue', showgrid: false, color: 'rgba(255,255,255,0.5)' },
                            yaxis: { title: 'Hydropathy', showgrid: true, gridcolor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' },
                            margin: { t: 10, b: 40, l: 40, r: 10 },
                            autosize: true
                        }}
                        useResizeHandler={true}
                        style={{ width: '100%', height: '100%' }}
                        config={{ displayModeBar: false }}
                    />
                </div>
            </div>
        </div>
    );
};

function getResidueColor(aa: string) {
    const colors: Record<string, string> = {
        A: '#facc15', V: '#facc15', I: '#facc15', L: '#facc15', M: '#facc15', F: '#facc15', Y: '#facc15', W: '#facc15', // Hydrophobic
        R: '#60a5fa', K: '#60a5fa', H: '#60a5fa', // Positive
        D: '#f87171', E: '#f87171', // Negative
        S: '#4ade80', T: '#4ade80', N: '#4ade80', Q: '#4ade80', // Polar
        C: '#c084fc', G: '#c084fc', P: '#c084fc' // Special
    };
    return colors[aa] || '#9ca3af';
}

function calculateHydrophobicityProfile(sequence: string, windowSize = 3) {
    const scale: Record<string, number> = {
        A: 1.8, R: -4.5, N: -3.5, D: -3.5, C: 2.5, Q: -3.5, E: -3.5, G: -0.4, H: -3.2, I: 4.5,
        L: 3.8, K: -3.9, M: 1.9, F: 2.8, P: -1.6, S: -0.8, T: -0.7, W: -0.9, Y: -1.3, V: 4.2
    };
    const values = sequence.split('').map(aa => scale[aa] || 0);
    const profile = [];
    for (let i = 0; i < values.length; i++) {
        let sum = 0;
        let count = 0;
        for (let j = Math.max(0, i - Math.floor(windowSize / 2)); j <= Math.min(values.length - 1, i + Math.floor(windowSize / 2)); j++) {
            sum += values[j];
            count++;
        }
        profile.push(sum / count);
    }
    return profile;
}
