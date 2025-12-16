// Helical Wheel Calculation Utilities
// Based on Schiffer–Edmundson wheel methodology with 100° per residue

export interface ResidueData {
    aa: string;
    index: number;
    angle: number;
    x: number;
    y: number;
    hydrophobicity: number;
    charge: number;
    class: 'positive' | 'negative' | 'polar' | 'aromatic' | 'hydrophobic' | 'special';
    color: string;
}

export interface HydrophobicMoment {
    magnitude: number;
    angle: number;
    x: number;
    y: number;
}

// Eisenberg consensus hydrophobicity scale
export const HYDROPHOBICITY_SCALE: Record<string, number> = {
    'A': 0.62, 'R': -2.53, 'N': -0.78, 'D': -0.90, 'C': 0.29,
    'Q': -0.85, 'E': -0.74, 'G': 0.48, 'H': -0.40, 'I': 1.38,
    'L': 1.06, 'K': -1.50, 'M': 0.64, 'F': 1.19, 'P': 0.12,
    'S': -0.18, 'T': -0.05, 'W': 0.81, 'Y': 0.26, 'V': 1.08
};

// Charge at pH 7.4
export const CHARGE_AT_PH7_4: Record<string, number> = {
    'K': 1, 'R': 1, 'H': 0.5, // Positive
    'D': -1, 'E': -1, // Negative
    // All others: 0
};

// Biochemical classification
export const BIOCHEMICAL_CLASS: Record<string, 'positive' | 'negative' | 'polar' | 'aromatic' | 'hydrophobic' | 'special'> = {
    'K': 'positive', 'R': 'positive', 'H': 'positive',
    'D': 'negative', 'E': 'negative',
    'S': 'polar', 'T': 'polar', 'N': 'polar', 'Q': 'polar',
    'F': 'aromatic', 'Y': 'aromatic', 'W': 'aromatic',
    'A': 'hydrophobic', 'V': 'hydrophobic', 'L': 'hydrophobic', 'I': 'hydrophobic', 'M': 'hydrophobic',
    'C': 'special', 'G': 'special', 'P': 'special'
};

// Color mapping for biochemical classes (consistent with design system)
export const CLASS_COLORS: Record<string, string> = {
    'positive': '#3b82f6',   // blue
    'negative': '#ef4444',   // red
    'polar': '#06b6d4',      // cyan
    'aromatic': '#f59e0b',   // gold
    'hydrophobic': '#10b981', // green
    'special': '#94a3b8'     // grey
};

/**
 * Calculate residue positions on helical wheel
 * @param sequence - Peptide sequence (1-letter codes)
 * @param radius - Wheel radius in pixels
 * @param rotationOffset - Manual rotation offset in degrees (0-360)
 * @returns Array of residue data with calculated positions
 */
export function calculateResiduePositions(
    sequence: string,
    radius: number,
    rotationOffset: number = 0
): ResidueData[] {
    const angleStep = 100 * (Math.PI / 180); // 100 degrees in radians
    const offsetRadians = rotationOffset * (Math.PI / 180);

    return sequence.split('').map((aa, i) => {
        const angle = offsetRadians + i * angleStep - (Math.PI / 2); // Start from top
        const x = radius * Math.cos(angle);
        const y = radius * Math.sin(angle);

        const hydrophobicity = HYDROPHOBICITY_SCALE[aa] || 0;
        const charge = CHARGE_AT_PH7_4[aa] || 0;
        const classification = BIOCHEMICAL_CLASS[aa] || 'special';
        const color = CLASS_COLORS[classification];

        return {
            aa,
            index: i,
            angle,
            x,
            y,
            hydrophobicity,
            charge,
            class: classification,
            color
        };
    });
}

/**
 * Calculate hydrophobic moment vector (μH)
 * @param residues - Array of residue data with positions and hydrophobicity
 * @returns Hydrophobic moment magnitude and direction
 */
export function calculateHydrophobicMoment(residues: ResidueData[]): HydrophobicMoment {
    let sumX = 0;
    let sumY = 0;

    residues.forEach((res) => {
        sumX += res.hydrophobicity * Math.cos(res.angle);
        sumY += res.hydrophobicity * Math.sin(res.angle);
    });

    const magnitude = Math.sqrt(sumX * sumX + sumY * sumY) / residues.length;
    const angle = Math.atan2(sumY, sumX);

    // Calculate vector endpoint for drawing
    const arrowLength = magnitude * 60; // Scale for visualization
    const x = arrowLength * Math.cos(angle);
    const y = arrowLength * Math.sin(angle);

    return { magnitude, angle, x, y };
}

/**
 * Generate interpretation text based on μH and sequence composition
 * @param sequence - Peptide sequence
 * @param muH - Hydrophobic moment data
 * @param residues - Residue data array
 * @returns Formatted interpretation string
 */
export function generateInterpretation(
    sequence: string,
    muH: HydrophobicMoment,
    residues: ResidueData[]
): string {
    const lines: string[] = [];

    // μH classification with improved thresholds
    let amphipathicity = '';
    let faceDescription = '';

    if (muH.magnitude < 0.25) {
        amphipathicity = 'essentially non-amphipathic';
        faceDescription = 'No distinct hydrophobic face — residues distributed relatively uniformly.';
    } else if (muH.magnitude < 0.4) {
        amphipathicity = 'weakly amphipathic';
        faceDescription = 'Weak hydrophobic bias detected — amphipathicity is borderline.';
    } else if (muH.magnitude < 0.6) {
        amphipathicity = 'moderately amphipathic';
        const faceDegrees = ((muH.angle * 180 / Math.PI + 360) % 360).toFixed(0);
        faceDescription = `Defined hydrophobic face (intrinsic direction: **${faceDegrees}°**) with moderate segregation.`;
    } else {
        amphipathicity = 'strongly amphipathic';
        const faceDegrees = ((muH.angle * 180 / Math.PI + 360) % 360).toFixed(0);
        faceDescription = `Well-defined hydrophobic face (intrinsic direction: **${faceDegrees}°**) — typical of antimicrobial peptides.`;
    }

    lines.push(`**μH = ${muH.magnitude.toFixed(2)}** → ${amphipathicity} α-helix.`);
    lines.push(`\n${faceDescription}`);

    // Charge analysis
    const positiveCount = residues.filter(r => r.class === 'positive').length;
    const negativeCount = residues.filter(r => r.class === 'negative').length;
    const netCharge = positiveCount - negativeCount;

    if (Math.abs(netCharge) > 2) {
        const chargeType = netCharge > 0 ? 'cationic' : 'anionic';
        lines.push(`\n**${chargeType.charAt(0).toUpperCase() + chargeType.slice(1)} peptide** (net charge ${netCharge > 0 ? '+' : ''}${netCharge}) → potential for electrostatic interactions.`);
    }

    // Helix stability
    const helixBreakers = residues.filter(r => r.aa === 'G' || r.aa === 'P').length;
    if (helixBreakers === 0) {
        lines.push(`\nNo helix-breaking residues (G, P) → helix likely **stable** in suitable environment.`);
    } else {
        lines.push(`\n${helixBreakers} helix-disrupting residue${helixBreakers > 1 ? 's' : ''} → may affect structural stability.`);
    }

    return lines.join('');
}

/**
 * Get charge for display tooltip
 */
export function getChargeLabel(charge: number): string {
    if (charge > 0) return `+${charge}`;
    if (charge < 0) return `${charge}`;
    return '0';
}

/**
 * Get class label for tooltip
 */
export function getClassLabel(classification: string): string {
    const labels: Record<string, string> = {
        'positive': 'Positive (basic)',
        'negative': 'Negative (acidic)',
        'polar': 'Polar (uncharged)',
        'aromatic': 'Aromatic',
        'hydrophobic': 'Hydrophobic',
        'special': 'Special (G/C/P)'
    };
    return labels[classification] || classification;
}
