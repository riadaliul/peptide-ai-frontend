// ΔBFI Interpretation Engine
// Publication-quality mutational landscape analysis

// Thresholds for mutation classification
export const IMPROVE_THRESHOLD = 0.20;      // ΔBFI > +0.20 considered beneficial
export const DEGRADE_THRESHOLD = -0.20;     // ΔBFI < -0.20 considered harmful
export const TOLERANCE_THRESHOLD = 0.10;    // |ΔBFI| < 0.10 considered neutral/tolerated

// Standard amino acid list (must match backend)
export const AA_LIST = ['A', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'V', 'W', 'Y'];

// Amino acid classifications
export const AA_CLASSES: Record<string, string> = {
    'A': 'hydrophobic', 'V': 'hydrophobic', 'L': 'hydrophobic', 'I': 'hydrophobic', 'M': 'hydrophobic',
    'F': 'aromatic', 'W': 'aromatic', 'Y': 'aromatic',
    'K': 'positive', 'R': 'positive', 'H': 'positive',
    'D': 'negative', 'E': 'negative',
    'S': 'polar', 'T': 'polar', 'N': 'polar', 'Q': 'polar', 'C': 'polar',
    'G': 'special', 'P': 'special'
};

// Types
export interface RankedMutation {
    position: number;
    fromAA: string;
    toAA: string;
    deltaBFI: number;
}

export interface PositionAnalysis {
    position: number;
    currentAA: string;
    numImprove: number;
    numDegrade: number;
    numNeutral: number;
    bestMutation: { aa: string; score: number };
    worstMutation: { aa: string; score: number };
    positionType: 'Highly sensitive' | 'Moderately sensitive' | 'Highly designable' | 'Moderately designable' | 'Neutral/tolerant';
    explanation: string;
}

export interface ResiduePreference {
    aa: string;
    aaClass: string;
    meanScore: number;
    improveCount: number;
    degradeCount: number;
    classification: 'Global positive modifier' | 'Global negative modifier' | 'Context-dependent';
}

export interface BFIInterpretation {
    positions: PositionAnalysis[];
    sensitivePositions: number[];
    designablePositions: number[];
    neutralPositions: number[];
    globalResiduePreferences: ResiduePreference[];
    topMutations: RankedMutation[];
    worstMutations: RankedMutation[];
    overallInsights: string[];
}

/**
 * Analyze a single position in the heatmap
 */
export function analyzePosition(
    heatmap: number[][],  // [AA_index][position_index]
    position: number,
    currentAA: string,
    aaList: string[] = AA_LIST
): PositionAnalysis {
    const posIndex = position - 1; // Convert to 0-indexed
    const values = heatmap.map(row => row[posIndex]);

    // Count mutations by category
    const numImprove = values.filter(v => v > IMPROVE_THRESHOLD).length;
    const numDegrade = values.filter(v => v < DEGRADE_THRESHOLD).length;
    const numNeutral = values.filter(v => Math.abs(v) < TOLERANCE_THRESHOLD).length;

    // Find best and worst mutations
    const maxIndex = values.indexOf(Math.max(...values));
    const minIndex = values.indexOf(Math.min(...values));

    const bestMutation = { aa: aaList[maxIndex], score: values[maxIndex] };
    const worstMutation = { aa: aaList[minIndex], score: values[minIndex] };

    // Classify position type
    let positionType: PositionAnalysis['positionType'];
    if (numDegrade >= 14) {
        positionType = 'Highly sensitive';
    } else if (numDegrade >= 10) {
        positionType = 'Moderately sensitive';
    } else if (numImprove >= 8) {
        positionType = 'Highly designable';
    } else if (numImprove >= 5) {
        positionType = 'Moderately designable';
    } else {
        positionType = 'Neutral/tolerant';
    }

    // Generate explanation
    const explanation = generatePositionExplanation(
        values,
        aaList,
        positionType,
        bestMutation,
        worstMutation
    );

    return {
        position,
        currentAA,
        numImprove,
        numDegrade,
        numNeutral,
        bestMutation,
        worstMutation,
        positionType,
        explanation
    };
}

/**
 * Generate explanation for a position based on patterns
 */
function generatePositionExplanation(
    values: number[],
    aaList: string[],
    positionType: string,
    bestMutation: { aa: string; score: number },
    worstMutation: { aa: string; score: number }
): string {
    const explanations: string[] = [];

    // Detect patterns
    const hydrophobicScores = ['A', 'V', 'L', 'I', 'M', 'F', 'W'].map(aa => {
        const idx = aaList.indexOf(aa);
        return idx >= 0 ? values[idx] : 0;
    });
    const chargedScores = ['K', 'R', 'H', 'D', 'E'].map(aa => {
        const idx = aaList.indexOf(aa);
        return idx >= 0 ? values[idx] : 0;
    });
    const polarScores = ['S', 'T', 'N', 'Q'].map(aa => {
        const idx = aaList.indexOf(aa);
        return idx >= 0 ? values[idx] : 0;
    });

    const avgHydrophobic = hydrophobicScores.reduce((a, b) => a + b, 0) / hydrophobicScores.length;
    const avgCharged = chargedScores.reduce((a, b) => a + b, 0) / chargedScores.length;
    const avgPolar = polarScores.reduce((a, b) => a + b, 0) / polarScores.length;

    // Pattern detection
    if (avgHydrophobic > 0.3) {
        explanations.push("Hydrophobic enrichment improves function at this site.");
    } else if (avgHydrophobic < -0.3) {
        explanations.push("Hydrophobic residues are unfavorable; likely a surface-exposed position.");
    }

    if (avgCharged < -0.3) {
        explanations.push("Charge introduction is unfavorable; likely a structural core residue.");
    } else if (avgCharged > 0.3) {
        explanations.push("Charged residues enhance function; potential interaction site.");
    }

    if (avgPolar > 0.2) {
        explanations.push("Surface polarity at this site is beneficial.");
    }

    // Add position type context
    if (positionType.includes('sensitive')) {
        explanations.push("Critical for structural or functional integrity.");
    } else if (positionType.includes('designable')) {
        explanations.push("Excellent target for optimization.");
    }

    return explanations.join(' ') || 'Mixed preferences; context-dependent optimization.';
}

/**
 * Analyze global residue preferences across the entire heatmap
 */
export function analyzeGlobalResiduePreferences(
    heatmap: number[][],
    aaList: string[] = AA_LIST
): ResiduePreference[] {
    return aaList.map((aa, aaIndex) => {
        const rowValues = heatmap[aaIndex];
        const meanScore = rowValues.reduce((a, b) => a + b, 0) / rowValues.length;
        const improveCount = rowValues.filter(v => v > IMPROVE_THRESHOLD).length;
        const degradeCount = rowValues.filter(v => v < DEGRADE_THRESHOLD).length;

        let classification: ResiduePreference['classification'];
        if (improveCount >= 6) {
            classification = 'Global positive modifier';
        } else if (degradeCount >= 6) {
            classification = 'Global negative modifier';
        } else {
            classification = 'Context-dependent';
        }

        return {
            aa,
            aaClass: AA_CLASSES[aa] || 'unknown',
            meanScore,
            improveCount,
            degradeCount,
            classification
        };
    });
}

/**
 * Rank all mutations by ΔBFI score
 */
export function rankMutations(
    heatmap: number[][],
    sequence: string,
    aaList: string[] = AA_LIST,
    topN: number = 20
): { top: RankedMutation[]; worst: RankedMutation[] } {
    const allMutations: RankedMutation[] = [];

    heatmap.forEach((row, aaIndex) => {
        row.forEach((deltaBFI, posIndex) => {
            const position = posIndex + 1;
            const fromAA = sequence[posIndex];
            const toAA = aaList[aaIndex];

            // Skip self-mutations
            if (fromAA !== toAA) {
                allMutations.push({ position, fromAA, toAA, deltaBFI });
            }
        });
    });

    // Sort by ΔBFI (descending)
    allMutations.sort((a, b) => b.deltaBFI - a.deltaBFI);

    return {
        top: allMutations.slice(0, topN),
        worst: allMutations.slice(-topN).reverse()
    };
}

/**
 * Generate overall design insights from patterns
 */
function generateOverallInsights(
    positions: PositionAnalysis[],
    globalPreferences: ResiduePreference[],
    topMutations: RankedMutation[]
): string[] {
    const insights: string[] = [];

    // Count position types
    const highSensitive = positions.filter(p => p.positionType === 'Highly sensitive').length;
    const highDesignable = positions.filter(p => p.positionType === 'Highly designable').length;

    if (highSensitive > 0) {
        insights.push(`The peptide contains ${highSensitive} structurally conserved position(s) (${positions.filter(p => p.positionType === 'Highly sensitive').map(p => p.position).join(', ')}).`);
    }

    if (highDesignable > 0) {
        insights.push(`${highDesignable} position(s) show high designability with multiple beneficial mutations available.`);
    }

    // Analyze global preferences
    const positiveHydrophobic = globalPreferences.filter(
        r => ['A', 'V', 'L', 'I', 'M'].includes(r.aa) && r.classification === 'Global positive modifier'
    );
    if (positiveHydrophobic.length >= 3) {
        insights.push('Hydrophobic or aliphatic substitutions consistently increase function, suggesting a hydrophobic interaction face.');
    }

    const negativeCharged = globalPreferences.filter(
        r => ['D', 'E'].includes(r.aa) && r.classification === 'Global negative modifier'
    );
    if (negativeCharged.length >= 2) {
        insights.push('Acidic residues universally degrade BFI, indicating helicity or core dependence.');
    }

    const negativeProline = globalPreferences.find(r => r.aa === 'P' && r.classification === 'Global negative modifier');
    if (negativeProline) {
        insights.push('Proline substitutions are harmful, suggesting helix-dependent function.');
    }

    // Check for sequential design hotspots
    const designablePos = positions.filter(p => p.positionType.includes('designable')).map(p => p.position);
    const consecutiveRuns = findConsecutiveRuns(designablePos);
    if (consecutiveRuns.some(run => run.length >= 3)) {
        insights.push('Multiple adjoining positions show improvement potential — potential functional face identified.');
    }

    // Overall optimization potential
    const avgTopScore = topMutations.slice(0, 5).reduce((sum, m) => sum + m.deltaBFI, 0) / 5;
    if (avgTopScore > 0.5) {
        insights.push('Significant optimization potential detected; top mutations show substantial BFI improvement.');
    } else if (avgTopScore < 0.2) {
        insights.push('Sequence appears evolutionarily optimized; limited design space available.');
    }

    return insights;
}

/**
 * Helper: Find consecutive runs in an array of numbers
 */
function findConsecutiveRuns(nums: number[]): number[][] {
    if (nums.length === 0) return [];

    const sorted = [...nums].sort((a, b) => a - b);
    const runs: number[][] = [];
    let currentRun = [sorted[0]];

    for (let i = 1; i < sorted.length; i++) {
        if (sorted[i] === sorted[i - 1] + 1) {
            currentRun.push(sorted[i]);
        } else {
            runs.push(currentRun);
            currentRun = [sorted[i]];
        }
    }
    runs.push(currentRun);

    return runs;
}

/**
 * Master function: Generate complete interpretation
 */
export function generateInterpretation(
    heatmap: number[][],  // [AA_index][position_index]
    sequence: string,
    aaList: string[] = AA_LIST
): BFIInterpretation {
    // Position-level analysis
    const positions = sequence.split('').map((aa, i) =>
        analyzePosition(heatmap, i + 1, aa, aaList)
    );

    // Classify positions
    const sensitivePositions = positions
        .filter(p => p.positionType.includes('sensitive'))
        .map(p => p.position);

    const designablePositions = positions
        .filter(p => p.positionType.includes('designable'))
        .map(p => p.position);

    const neutralPositions = positions
        .filter(p => p.positionType === 'Neutral/tolerant')
        .map(p => p.position);

    // Global residue preferences
    const globalResiduePreferences = analyzeGlobalResiduePreferences(heatmap, aaList);

    // Rank mutations
    const { top, worst } = rankMutations(heatmap, sequence, aaList);

    // Generate insights
    const overallInsights = generateOverallInsights(positions, globalResiduePreferences, top);

    return {
        positions,
        sensitivePositions,
        designablePositions,
        neutralPositions,
        globalResiduePreferences,
        topMutations: top,
        worstMutations: worst,
        overallInsights
    };
}
