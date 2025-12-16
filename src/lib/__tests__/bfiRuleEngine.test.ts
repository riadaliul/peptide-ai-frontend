import { describe, it, expect } from 'vitest';
import {
    computePositionStats,
    classifyPosition,
    analyzeChemistryGroups,
    shouldApplyChargedOverride,
    markExcellentTargets,
    computeGlobalPreferences,
    rankMutations,
    interpretBFIMatrix
} from '../bfiRuleEngine';
import type { BFIConfig } from '../../types/bfiRuleEngine';

// Mock configuration for testing
const mockConfig: BFIConfig = {
    aa_list: ['A', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'V', 'W', 'Y'],
    thresholds: {
        improve: 0.3,
        degrade: -0.3,
        neutral_abs: 0.1,
        high_sensitive_degrade: 14,
        mod_sensitive_degrade: 10,
        high_design_improve: 14,
        mod_design_improve: 10,
        group_beneficial_min: 0.5,
        group_harmful_max: -0.5,
        group_margin: 0.3,
        top_opt_site_delta: 1.0,
        top_opt_site_max_num: 5,
        top_k_mutations: 10
    },
    aa_groups: {
        hydrophobic: ['A', 'V', 'L', 'I', 'M', 'F', 'W'],
        aromatic: ['F', 'Y', 'W'],
        positive: ['K', 'R', 'H'],
        negative: ['D', 'E'],
        polar: ['S', 'T', 'N', 'Q'],
        special: ['C', 'G', 'P']
    },
    position_class_rules: [
        {
            id: 'highly_sensitive',
            label: 'Highly sensitive / intolerant',
            conditions: { num_degrade_gte: 14 }
        },
        {
            id: 'moderately_sensitive',
            label: 'Moderately sensitive',
            conditions: { num_degrade_gte: 10, num_degrade_lte: 13 }
        },
        {
            id: 'highly_designable',
            label: 'Highly designable / promising',
            conditions: { num_improve_gte: 14 }
        },
        {
            id: 'moderately_designable',
            label: 'Moderately designable',
            conditions: { num_improve_gte: 10, num_improve_lte: 13 }
        }
    ],
    beneficial_explanations: {
        hydrophobic: 'Hydrophobic residues are beneficial here.',
        aromatic: 'Aromatic residues improve function.',
        positive: 'Positively charged residues enhance activity.',
        negative: 'Negatively charged residues are preferred.',
        polar: 'Polar residues stabilize this position.',
        special: 'Special residues (C/G/P) are advantageous.'
    },
    harmful_explanations: {
        hydrophobic: 'Hydrophobic residues are detrimental.',
        aromatic: 'Aromatic residues disrupt function.',
        positive: 'Positively charged residues are harmful.',
        negative: 'Negatively charged residues destabilize.',
        polar: 'Polar residues are poorly tolerated.',
        special: 'Special residues (C/G/P) are problematic.'
    },
    templates: {
        position_header: 'Position {{pos1}} ({{wt}}): {{class_label}}.',
        position_basic_stats: 'Best: {{best_AA}} (+{{best_score}}), Worst: {{worst_AA}} ({{worst_score}}). Improve: {{num_improve}}, Degrade: {{num_degrade}}, Neutral: {{num_neutral}}.',
        conserved_charged_override: 'This position has a charged WT residue and is highly sensitive, suggesting a critical electrostatic role.',
        excellent_target: 'Flagged as an excellent optimization target.',
        global_summary_header: 'Global Analysis:',
        global_structural_core: 'Conserved core: {{core_positions}}.',
        global_sensitive: 'Sensitive: {{sensitive_positions}}.',
        global_designable: 'Designable: {{designable_positions}}.',
        global_group_preferences: 'Group preferences - Hydrophobic: {{hydrophobic_mean}}, Aromatic: {{aromatic_mean}}, Positive: {{positive_mean}}, Negative: {{negative_mean}}, Polar: {{polar_mean}}, Special: {{special_mean}}.',
        top_beneficial_header: 'Top Beneficial Mutations:',
        top_harmful_header: 'Top Harmful Mutations:',
        mutation_line: '{{fromAA}}{{position}}{{toAA}}: {{deltaBFI}}'
    }
};

describe('ΔBFI Rule Engine - Step 1: Position Stats', () => {
    it('should compute correct position stats', () => {
        // Create a simple heatmap: 20 AAs x 1 position
        const heatmap = Array.from({ length: 20 }, (_, i) => [
            i < 5 ? 0.5 : i < 10 ? -0.5 : 0.05 // 5 improve, 5 degrade, 10 neutral
        ]);

        const stats = computePositionStats(heatmap, 0, 'A', mockConfig);

        expect(stats.posIndex).toBe(0);
        expect(stats.pos1).toBe(1);
        expect(stats.wtAA).toBe('A');
        expect(stats.num_improve).toBe(5);
        expect(stats.num_degrade).toBe(5);
        expect(stats.num_neutral).toBe(10);
        expect(stats.best_score).toBe(0.5);
        expect(stats.worst_score).toBe(-0.5);
    });

    it('should identify best and worst amino acids correctly', () => {
        const heatmap = Array.from({ length: 20 }, (_, i) => [i * 0.1 - 1.0]);

        const stats = computePositionStats(heatmap, 0, 'A', mockConfig);

        expect(stats.best_AA).toBe('Y'); // Last AA (19 * 0.1 - 1.0 = 0.9)
        expect(stats.worst_AA).toBe('A'); // First AA (0 * 0.1 - 1.0 = -1.0)
    });
});

describe('ΔBFI Rule Engine - Step 2: Classification', () => {
    it('should classify as highly_sensitive when num_degrade >= 14', () => {
        const stats = {
            posIndex: 0,
            pos1: 1,
            wtAA: 'A',
            column: [],
            num_improve: 0,
            num_degrade: 15,
            num_neutral: 5,
            best_AA: 'K',
            best_score: 0.2,
            worst_AA: 'P',
            worst_score: -0.8,
            max_score: 0.2
        };

        const classification = classifyPosition(stats, mockConfig);
        expect(classification.classId).toBe('highly_sensitive');
    });

    it('should classify as moderately_sensitive when 10 <= num_degrade <= 13', () => {
        const stats = {
            posIndex: 0,
            pos1: 1,
            wtAA: 'A',
            column: [],
            num_improve: 0,
            num_degrade: 12,
            num_neutral: 8,
            best_AA: 'K',
            best_score: 0.2,
            worst_AA: 'P',
            worst_score: -0.8,
            max_score: 0.2
        };

        const classification = classifyPosition(stats, mockConfig);
        expect(classification.classId).toBe('moderately_sensitive');
    });

    it('should classify as highly_designable when num_improve >= 14', () => {
        const stats = {
            posIndex: 0,
            pos1: 1,
            wtAA: 'A',
            column: [],
            num_improve: 16,
            num_degrade: 0,
            num_neutral: 4,
            best_AA: 'K',
            best_score: 1.5,
            worst_AA: 'A',
            worst_score: -0.1,
            max_score: 1.5
        };

        const classification = classifyPosition(stats, mockConfig);
        expect(classification.classId).toBe('highly_designable');
    });
});

describe('ΔBFI Rule Engine - Step 3: Chemistry Analysis', () => {
    it('should compute group means correctly', () => {
        // Create a column where hydrophobic AAs have high scores
        const column = mockConfig.aa_list.map(aa =>
            mockConfig.aa_groups.hydrophobic.includes(aa) ? 1.0 : -0.5
        );

        const chemistry = analyzeChemistryGroups(column, mockConfig.aa_list, mockConfig);

        expect(chemistry.group_means['hydrophobic']).toBeGreaterThan(0.9);
        expect(chemistry.dominant_beneficial_group).toBe('hydrophobic');
    });

    it('should identify dominant harmful group', () => {
        const column = mockConfig.aa_list.map(aa =>
            mockConfig.aa_groups.positive.includes(aa) ? -1.0 : 0.5
        );

        const chemistry = analyzeChemistryGroups(column, mockConfig.aa_list, mockConfig);

        expect(chemistry.group_means['positive']).toBeLessThan(-0.9);
        expect(chemistry.dominant_harmful_group).toBe('positive');
    });

    it('should not flag a group if margin requirement is not met', () => {
        // All groups have similar mean scores
        const column = mockConfig.aa_list.map(() => 0.6);

        const chemistry = analyzeChemistryGroups(column, mockConfig.aa_list, mockConfig);

        // No dominant group should be flagged due to insufficient margin
        expect(chemistry.dominant_beneficial_group).toBeNull();
    });
});

describe('ΔBFI Rule Engine - Step 4: Charged Override', () => {
    it('should apply charged override for highly_sensitive positions with charged WT', () => {
        expect(shouldApplyChargedOverride('K', 'highly_sensitive', mockConfig)).toBe(true);
        expect(shouldApplyChargedOverride('R', 'highly_sensitive', mockConfig)).toBe(true);
        expect(shouldApplyChargedOverride('D', 'highly_sensitive', mockConfig)).toBe(true);
        expect(shouldApplyChargedOverride('E', 'highly_sensitive', mockConfig)).toBe(true);
    });

    it('should not apply charged override for non-sensitive positions', () => {
        expect(shouldApplyChargedOverride('K', 'highly_designable', mockConfig)).toBe(false);
    });

    it('should not apply charged override for non-charged residues', () => {
        expect(shouldApplyChargedOverride('A', 'highly_sensitive', mockConfig)).toBe(false);
    });
});

describe('ΔBFI Rule Engine - Step 5: Excellent Targets', () => {
    it('should mark top highly_designable positions exceeding threshold', () => {
        const allStats = Array.from({ length: 10 }, (_, i) => ({
            posIndex: i,
            pos1: i + 1,
            wtAA: 'A',
            column: [],
            num_improve: 15,
            num_degrade: 0,
            num_neutral: 5,
            best_AA: 'K',
            best_score: 2.0 - i * 0.1, // Decreasing scores
            worst_AA: 'P',
            worst_score: -0.1,
            max_score: 2.0 - i * 0.1
        }));

        const allClasses = allStats.map(() => ({ classId: 'highly_designable', classLabel: 'Highly designable' }));

        const excellentTargets = markExcellentTargets(allStats, allClasses, mockConfig);

        // Should mark the top 5 (based on top_opt_site_max_num)
        expect(excellentTargets.size).toBe(5);
        expect(excellentTargets.has(0)).toBe(true);
        expect(excellentTargets.has(4)).toBe(true);
        expect(excellentTargets.has(5)).toBe(false);
    });

    it('should only consider positions meeting delta threshold', () => {
        const allStats = [
            {
                posIndex: 0,
                pos1: 1,
                wtAA: 'A',
                column: [],
                num_improve: 15,
                num_degrade: 0,
                num_neutral: 5,
                best_AA: 'K',
                best_score: 0.5, // Below threshold (1.0)
                worst_AA: 'P',
                worst_score: -0.1,
                max_score: 0.5
            }
        ];

        const allClasses = [{ classId: 'highly_designable', classLabel: 'Highly designable' }];

        const excellentTargets = markExcellentTargets(allStats, allClasses, mockConfig);

        expect(excellentTargets.size).toBe(0);
    });
});

describe('ΔBFI Rule Engine - Step 6: Global Preferences', () => {
    it('should compute per-AA and per-group preferences', () => {
        // Create a simple heatmap: 20 AAs x 3 positions
        const heatmap = Array.from({ length: 20 }, (_, aaIdx) =>
            Array.from({ length: 3 }, () => aaIdx * 0.1 - 1.0)
        );

        const { aa_prefs, group_prefs } = computeGlobalPreferences(heatmap, mockConfig);

        expect(aa_prefs).toHaveLength(20);
        expect(aa_prefs[0].aa).toBe('A');
        expect(aa_prefs[0].mean).toBeCloseTo(-1.0, 2);

        expect(group_prefs.length).toBeGreaterThan(0);
        const hydrophobicGroup = group_prefs.find(g => g.group === 'hydrophobic');
        expect(hydrophobicGroup).toBeDefined();
    });
});

describe('ΔBFI Rule Engine - Step 7: Mutation Ranking', () => {
    it('should rank top beneficial and harmful mutations', () => {
        const heatmap = [
            [1.5, 0.5, -1.0],   // AA A
            [0.2, -0.8, 0.1]    // AA C
        ];
        const wtSeq = 'ACG';
        const aaList = ['A', 'C'];

        const { topBeneficial, topHarmful } = rankMutations(heatmap, wtSeq, aaList, 3);

        expect(topBeneficial[0].deltaBFI).toBe(1.5);
        expect(topBeneficial[0].position).toBe(1);
        expect(topBeneficial[0].toAA).toBe('A');

        expect(topHarmful[0].deltaBFI).toBe(-1.0);
        expect(topHarmful[0].position).toBe(3);
    });

    it('should exclude self-mutations', () => {
        const heatmap = [[1.5]];
        const wtSeq = 'A';
        const aaList = ['A'];

        const { topBeneficial, topHarmful } = rankMutations(heatmap, wtSeq, aaList, 10);

        expect(topBeneficial).toHaveLength(0);
        expect(topHarmful).toHaveLength(0);
    });
});

describe('ΔBFI Rule Engine - Integration', () => {
    it('should produce deterministic results for the same input', () => {
        const heatmap = Array.from({ length: 20 }, (_, aaIdx) =>
            Array.from({ length: 5 }, (_, posIdx) => (aaIdx - posIdx) * 0.2)
        );
        const wtSeq = 'AVILG';

        const result1 = interpretBFIMatrix(heatmap, wtSeq, mockConfig);
        const result2 = interpretBFIMatrix(heatmap, wtSeq, mockConfig);

        expect(result1).toEqual(result2);
    });

    it('should generate complete interpretation result', () => {
        const heatmap = Array.from({ length: 20 }, () => Array.from({ length: 3 }, () => Math.random() * 2 - 1));
        const wtSeq = 'AVK';

        const result = interpretBFIMatrix(heatmap, wtSeq, mockConfig);

        expect(result.positions).toHaveLength(3);
        expect(result.total_positions).toBe(3);
        expect(result.aa_preferences).toHaveLength(20);
        expect(result.group_preferences.length).toBeGreaterThan(0);
        expect(result.topBeneficialMutations.length).toBeGreaterThan(0);
        expect(result.global_summary).toBeTruthy();

        // Verify position interpretation structure
        const firstPos = result.positions[0];
        expect(firstPos).toHaveProperty('pos1');
        expect(firstPos).toHaveProperty('wtAA');
        expect(firstPos).toHaveProperty('classId');
        expect(firstPos).toHaveProperty('classLabel');
        expect(firstPos).toHaveProperty('full_text');
    });
});
