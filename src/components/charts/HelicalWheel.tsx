import React, { useState, useMemo } from 'react';
import { Download, Info } from 'lucide-react';
import {
    calculateResiduePositions,
    calculateHydrophobicMoment,
    generateInterpretation,
    getChargeLabel,
    getClassLabel,
    ResidueData
} from '../../lib/helicalWheelUtils';

interface HelicalWheelProps {
    sequence: string;
}

export const HelicalWheel: React.FC<HelicalWheelProps> = ({ sequence }) => {
    const [rotation, setRotation] = useState(0);
    const [hoveredResidue, setHoveredResidue] = useState<ResidueData | null>(null);
    const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

    if (!sequence) {
        return <div className="text-center text-slate-500 p-8">No sequence available</div>;
    }

    const radius = 120;
    const center = 250;
    const svgSize = 500;

    // CRITICAL: Calculate intrinsic (non-rotated) residue positions and μH for interpretation
    // This ensures biological interpretation is independent of UI rotation
    const intrinsicResidues = useMemo(() =>
        calculateResiduePositions(sequence, radius, 0),
        [sequence, radius]
    );

    const intrinsicMuH = useMemo(() =>
        calculateHydrophobicMoment(intrinsicResidues),
        [intrinsicResidues]
    );

    // Generate interpretation based on INTRINSIC μH (rotation-independent)
    const interpretation = useMemo(() =>
        generateInterpretation(sequence, intrinsicMuH, intrinsicResidues),
        [sequence, intrinsicMuH, intrinsicResidues]
    );

    // Calculate ROTATED residue positions for visualization only
    const residues = useMemo(() =>
        calculateResiduePositions(sequence, radius, rotation),
        [sequence, radius, rotation]
    );

    // Calculate ROTATED μH for arrow visualization only
    const muH = useMemo(() =>
        calculateHydrophobicMoment(residues),
        [residues]
    );

    // Calculate amphipathic wedge path (±50° from μH direction)
    const wedgeSpread = 50 * (Math.PI / 180);
    const wedgeRadius = radius + 30;
    const wedgeAngle1 = muH.angle - wedgeSpread;
    const wedgeAngle2 = muH.angle + wedgeSpread;

    const wedgePath = `
        M ${center} ${center}
        L ${center + wedgeRadius * Math.cos(wedgeAngle1)} ${center + wedgeRadius * Math.sin(wedgeAngle1)}
        A ${wedgeRadius} ${wedgeRadius} 0 0 1 ${center + wedgeRadius * Math.cos(wedgeAngle2)} ${center + wedgeRadius * Math.sin(wedgeAngle2)}
        Z
    `;

    // Handle residue hover
    const handleResidueHover = (residue: ResidueData | null, event?: React.MouseEvent) => {
        setHoveredResidue(residue);
        if (residue && event) {
            const svg = event.currentTarget.closest('svg');
            if (svg) {
                const rect = svg.getBoundingClientRect();
                setTooltipPos({
                    x: event.clientX - rect.left,
                    y: event.clientY - rect.top
                });
            }
        }
    };

    // Export function
    const handleExport = () => {
        const svgElement = document.getElementById('helical-wheel-svg');
        if (!svgElement) return;

        const svgData = new XMLSerializer().serializeToString(svgElement);
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `helical_wheel_${sequence.substring(0, 10)}_muH${muH.magnitude.toFixed(2)}.svg`;
        link.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-6">
            {/* Controls */}
            <div className="flex items-center justify-between gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        Helical Rotation: {rotation}°
                    </label>
                    <input
                        type="range"
                        min="0"
                        max="360"
                        value={rotation}
                        onChange={(e) => setRotation(parseInt(e.target.value))}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                </div>
                <button
                    onClick={handleExport}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                >
                    <Download className="w-4 h-4" />
                    Export
                </button>
            </div>

            {/* SVG Helical Wheel */}
            <div className="relative flex justify-center">
                <svg
                    id="helical-wheel-svg"
                    width={svgSize}
                    height={svgSize}
                    viewBox={`0 0 ${svgSize} ${svgSize}`}
                    className="max-w-full h-auto"
                >
                    {/* Background gradient */}
                    <defs>
                        <radialGradient id="bg-gradient" cx="50%" cy="50%">
                            <stop offset="0%" stopColor="#ffffff" />
                            <stop offset="100%" stopColor="#f8fafc" />
                        </radialGradient>
                        <linearGradient id="arrow-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#14b8a6" />
                            <stop offset="100%" stopColor="#047857" />
                        </linearGradient>
                    </defs>

                    {/* Background */}
                    <rect width={svgSize} height={svgSize} fill="url(#bg-gradient)" />

                    {/* Outer circle */}
                    <circle
                        cx={center}
                        cy={center}
                        r={radius + 40}
                        fill="none"
                        stroke="#e2e8f0"
                        strokeWidth="2"
                    />

                    {/* Inner guideline circle */}
                    <circle
                        cx={center}
                        cy={center}
                        r={radius}
                        fill="none"
                        stroke="#cbd5e1"
                        strokeWidth="1"
                        strokeDasharray="4 4"
                        opacity="0.5"
                    />

                    {/* Amphipathic wedge - subtle shading */}
                    <path
                        d={wedgePath}
                        fill="#f59e0b"
                        opacity="0.12"
                    />

                    {/* Charge ring segments - thinner for elegance */}
                    {residues.map((res, i) => {
                        const segmentAngle = 100 * (Math.PI / 180);
                        const startAngle = res.angle - segmentAngle / 2;
                        const endAngle = res.angle + segmentAngle / 2;
                        const outerR = radius + 48;
                        const innerR = radius + 43;

                        const x1 = center + innerR * Math.cos(startAngle);
                        const y1 = center + innerR * Math.sin(startAngle);
                        const x2 = center + outerR * Math.cos(startAngle);
                        const y2 = center + outerR * Math.sin(startAngle);
                        const x3 = center + outerR * Math.cos(endAngle);
                        const y3 = center + outerR * Math.sin(endAngle);
                        const x4 = center + innerR * Math.cos(endAngle);
                        const y4 = center + innerR * Math.sin(endAngle);

                        const segmentColor = res.charge > 0 ? '#3b82f6' : res.charge < 0 ? '#ef4444' : '#cbd5e1';

                        return (
                            <path
                                key={`charge-${i}`}
                                d={`M ${x1} ${y1} L ${x2} ${y2} A ${outerR} ${outerR} 0 0 1 ${x3} ${y3} L ${x4} ${y4} A ${innerR} ${innerR} 0 0 0 ${x1} ${y1}`}
                                fill={segmentColor}
                                opacity="0.6"
                            />
                        );
                    })}

                    {/* Residue nodes */}
                    {residues.map((res) => {
                        const cx = center + res.x;
                        const cy = center + res.y;
                        const isHovered = hoveredResidue?.index === res.index;

                        return (
                            <g
                                key={res.index}
                                onMouseEnter={(e) => handleResidueHover(res, e)}
                                onMouseLeave={() => handleResidueHover(null)}
                                className="cursor-pointer transition-transform"
                                style={{ transform: isHovered ? 'scale(1.1)' : 'scale(1)', transformOrigin: `${cx}px ${cy}px` }}
                            >
                                {/* Residue circle */}
                                <circle
                                    cx={cx}
                                    cy={cy}
                                    r={isHovered ? 20 : 18}
                                    fill="white"
                                    stroke={res.color}
                                    strokeWidth={isHovered ? 4 : 3}
                                    filter={isHovered ? 'drop-shadow(0 4px 6px rgba(0,0,0,0.2))' : 'none'}
                                />

                                {/* AA letter */}
                                <text
                                    x={cx}
                                    y={cy + 1}
                                    textAnchor="middle"
                                    dominantBaseline="middle"
                                    fill={res.color}
                                    fontSize={isHovered ? "18" : "16"}
                                    fontWeight="bold"
                                    pointerEvents="none"
                                >
                                    {res.aa}
                                </text>

                                {/* Position number - better baseline alignment */}
                                <text
                                    x={cx}
                                    y={cy + (isHovered ? 30 : 28)}
                                    textAnchor="middle"
                                    fill="#64748b"
                                    fontSize="10"
                                    fontWeight="500"
                                    pointerEvents="none"
                                >
                                    {res.index + 1}
                                </text>
                            </g>
                        );
                    })}

                    {/* Hydrophobic moment arrow */}
                    <g>
                        <defs>
                            <marker
                                id="arrowhead"
                                markerWidth="10"
                                markerHeight="10"
                                refX="9"
                                refY="3"
                                orient="auto"
                            >
                                <polygon points="0 0, 10 3, 0 6" fill="#047857" />
                            </marker>
                        </defs>
                        <line
                            x1={center}
                            y1={center}
                            x2={center + muH.x}
                            y2={center + muH.y}
                            stroke="url(#arrow-gradient)"
                            strokeWidth="4"
                            markerEnd="url(#arrowhead)"
                        />

                        {/* μH label - offset to avoid overlap */}
                        <text
                            x={center + muH.x * 1.3 + 15}
                            y={center + muH.y * 1.3 - 10}
                            textAnchor="middle"
                            fill="#047857"
                            fontSize="13"
                            fontWeight="bold"
                            className="drop-shadow"
                        >
                            μH = {intrinsicMuH.magnitude.toFixed(2)}
                        </text>
                    </g>

                    {/* Tooltip */}
                    {hoveredResidue && (
                        <g>
                            <rect
                                x={tooltipPos.x + 10}
                                y={tooltipPos.y - 60}
                                width="180"
                                height="90"
                                fill="white"
                                stroke="#cbd5e1"
                                strokeWidth="2"
                                rx="8"
                                filter="drop-shadow(0 4px 6px rgba(0,0,0,0.1))"
                            />
                            <text x={tooltipPos.x + 20} y={tooltipPos.y - 40} fontSize="12" fontWeight="bold" fill="#1e293b">
                                Pos {hoveredResidue.index + 1} — {hoveredResidue.aa}
                            </text>
                            <text x={tooltipPos.x + 20} y={tooltipPos.y - 25} fontSize="11" fill="#475569">
                                Class: {getClassLabel(hoveredResidue.class)}
                            </text>
                            <text x={tooltipPos.x + 20} y={tooltipPos.y - 10} fontSize="11" fill="#475569">
                                Hydrophobicity: {hoveredResidue.hydrophobicity.toFixed(2)}
                            </text>
                            <text x={tooltipPos.x + 20} y={tooltipPos.y + 5} fontSize="11" fill="#475569">
                                Charge at pH 7.4: {getChargeLabel(hoveredResidue.charge)}
                            </text>
                        </g>
                    )}
                </svg>
            </div>

            {/* Interpretation Panel */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-5">
                <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <h4 className="text-sm font-semibold text-indigo-900 mb-2">Helical Wheel Interpretation</h4>
                        <div
                            className="text-sm text-slate-700 leading-relaxed space-y-1"
                            dangerouslySetInnerHTML={{ __html: interpretation.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}
                        />
                    </div>
                </div>
            </div>

            {/* Legend with colored dots */}
            <div className="grid grid-cols-3 gap-3 text-xs">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#3b82f6] border border-slate-300" />
                    <span className="text-slate-700 font-medium">Positive</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#ef4444] border border-slate-300" />
                    <span className="text-slate-700 font-medium">Negative</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#06b6d4] border border-slate-300" />
                    <span className="text-slate-700 font-medium">Polar</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#f59e0b] border border-slate-300" />
                    <span className="text-slate-700 font-medium">Aromatic</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#10b981] border border-slate-300" />
                    <span className="text-slate-700 font-medium">Hydrophobic</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#94a3b8] border border-slate-300" />
                    <span className="text-slate-700 font-medium">Special</span>
                </div>
            </div>
        </div>
    );
};
