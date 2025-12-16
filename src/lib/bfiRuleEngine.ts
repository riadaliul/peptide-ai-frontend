// ΔBFI Rule-Based Interpretation Engine
// Deterministic, JSON-driven, production-ready

import type {
    BFIConfig,
    PositionStats,
    PositionClass,
    ChemistryAnalysis,
    PositionInterpretation,
    InterpretationResult,
    Mutation,
    GlobalAAPreference,
    GlobalGroupPreference,
    AAGroupKey
} from '../types/bfiRuleEngine';

// ============================================================================
// Step 1: Per-Position Stats
// ============================================================================

export function computePositionStats(
    heatmap: number[][],
    posIndex: number,
    wtAA: string,
    config: BFIConfig
): PositionStats {
    // Extract column for this position
    const column = heatmap.map(row => row[posIndex]);

    const { improve, degrade, neutral_abs } = config.thresholds;

    // Count improvements, degradations, neutral
    const num_improve = column.filter(v => v > improve).length;
    const num_degrade = column.filter(v => v < degrade).length;
    const num_neutral = column.filter(v => Math.abs(v) < neutral_abs).length;

    // Find best and worst
    let best_AA = config.aa_list[0];
    let best_score = column[0];
    let worst_AA = config.aa_list[0];
    let worst_score = column[0];

    column.forEach((score, aaIndex) => {
        if (score > best_score) {
            best_score = score;
            best_AA = config.aa_list[aaIndex];
        }
        if (score < worst_score) {
            worst_score = score;
            worst_AA = config.aa_list[aaIndex];
        }
    });

    return {
        posIndex,
        pos1: posIndex + 1,
        wtAA,
        column,
        num_improve,
        num_degrade,
        num_neutral,
        best_AA,
        best_score,
        worst_AA,
        worst_score,
        max_score: best_score
    };
}

// ============================================================================
// Step 2: Position Classification
// ============================================================================

export function classifyPosition(
    stats: PositionStats,
    config: BFIConfig
): PositionClass {
    const { num_improve, num_degrade } = stats;

    // Apply rules in order, first match wins
    for (const rule of config.position_class_rules) {
        const cond = rule.conditions;
        let matches = true;

        if (cond.num_degrade_gte !== undefined && num_degrade < cond.num_degrade_gte) {
            matches = false;
        }
        if (cond.num_degrade_lte !== undefined && num_degrade > cond.num_degrade_lte) {
            matches = false;
        }
        if (cond.num_improve_gte !== undefined && num_improve < cond.num_improve_gte) {
            matches = false;
        }
        if (cond.num_improve_lte !== undefined && num_improve > cond.num_improve_lte) {
            matches = false;
        }

        if (matches) {
            return {
                classId: rule.id,
                classLabel: rule.label
            };
        }
    }

    // Fallback (should never reach here if rules are complete)
    return {
        classId: 'neutral',
        classLabel: 'Neutral / tolerant'
    };
}

// ============================================================================
// Step 3: Chemistry Group Analysis
// ============================================================================

export function analyzeChemistryGroups(
    column: number[],
    aaList: string[],
    config: BFIConfig
): ChemistryAnalysis {
    const { aa_groups, thresholds } = config;
    const { group_beneficial_min, group_harmful_max, group_margin } = thresholds;

    const group_means: Record<string, number> = {};

    // Compute mean for each group
    Object.entries(aa_groups).forEach(([groupName, aaMembers]) => {
        const values = aaMembers
            .map(aa => {
                const idx = aaList.indexOf(aa);
                return idx >= 0 ? column[idx] : NaN;
            })
            .filter(v => !isNaN(v));

        if (values.length > 0) {
            group_means[groupName] = values.reduce((a, b) => a + b, 0) / values.length;
        } else {
            group_means[groupName] = 0;
        }
    });

    // Find dominant beneficial group
    let dominant_beneficial_group: string | null = null;
    const groupNames = Object.keys(aa_groups) as AAGroupKey[];
    const maxMean = Math.max(...Object.values(group_means));
    const maxGroup = groupNames.find(g => group_means[g] === maxMean);

    if (maxGroup && maxMean > group_beneficial_min) {
        // Check margin: maxMean must be at least group_margin higher than all others
        const otherMeans = groupNames.filter(g => g !== maxGroup).map(g => group_means[g]);
        if (otherMeans.every(m => maxMean - m >= group_margin)) {
            dominant_beneficial_group = maxGroup;
        }
    }

    // Find dominant harmful group
    let dominant_harmful_group: string | null = null;
    const minMean = Math.min(...Object.values(group_means));
    const minGroup = groupNames.find(g => group_means[g] === minMean);

    if (minGroup && minMean < group_harmful_max) {
        const otherMeans = groupNames.filter(g => g !== minGroup).map(g => group_means[g]);
        if (otherMeans.every(m => m - minMean >= group_margin)) {
            dominant_harmful_group = minGroup;
        }
    }

    // Resolve conflict: same group can't be both beneficial and harmful
    if (dominant_beneficial_group === dominant_harmful_group && dominant_beneficial_group !== null) {
        const absBeneficial = Math.abs(group_means[dominant_beneficial_group]);
        const absHarmful = Math.abs(group_means[dominant_harmful_group]);

        if (absBeneficial > absHarmful) {
            dominant_harmful_group = null;
        } else {
            dominant_beneficial_group = null;
        }
    }

    return {
        group_means,
        dominant_beneficial_group,
        dominant_harmful_group
    };
}

// ============================================================================
// Step 4: Conserved Charged Override
// ============================================================================

export function shouldApplyChargedOverride(
    wtAA: string,
    classId: string,
    config: BFIConfig
): boolean {
    if (classId !== 'highly_sensitive') {
        return false;
    }

    const { positive, negative } = config.aa_groups;
    return positive.includes(wtAA) || negative.includes(wtAA);
}

// ============================================================================
// Step 5: Excellent Target Flags
// ============================================================================

export function markExcellentTargets(
    allPositionStats: PositionStats[],
    allClasses: PositionClass[],
    config: BFIConfig
): Set<number> {
    const { top_opt_site_delta, top_opt_site_max_num } = config.thresholds;

    // Filter to highly_designable positions
    const candidates = allPositionStats
        .map((stats, idx) => ({ stats, classId: allClasses[idx].classId }))
        .filter(({ classId }) => classId === 'highly_designable')
        .filter(({ stats }) => stats.max_score >= top_opt_site_delta);

    // Sort by max_score descending
    candidates.sort((a, b) => b.stats.max_score - a.stats.max_score);

    // Take first N
    const topN = candidates.slice(0, top_opt_site_max_num);

    return new Set(topN.map(({ stats }) => stats.posIndex));
}

// ============================================================================
// Step 6: Global Residue Preferences
// ============================================================================

export function computeGlobalPreferences(
    heatmap: number[][],
    config: BFIConfig
): { aa_prefs: GlobalAAPreference[]; group_prefs: GlobalGroupPreference[] } {
    const { improve, degrade } = config.thresholds;
    const aaList = config.aa_list;

    // Per-AA preferences
    const aa_prefs: GlobalAAPreference[] = aaList.map((aa, aaIndex) => {
        const row = heatmap[aaIndex];
        const mean = row.reduce((a, b) => a + b, 0) / row.length;
        const improve_count = row.filter(v => v > improve).length;
        const degrade_count = row.filter(v => v < degrade).length;

        return { aa, mean, improve_count, degrade_count };
    });

    // Per-group preferences (average of member AAs)
    const group_prefs: GlobalGroupPreference[] = Object.entries(config.aa_groups).map(([groupName, members]) => {
        const memberPrefs = members.map(aa => {
            const pref = aa_prefs.find(p => p.aa === aa);
            return pref ? pref.mean : 0;
        });
        const mean = memberPrefs.reduce((a, b) => a + b, 0) / memberPrefs.length;

        return { group: groupName, mean };
    });

    return { aa_prefs, group_prefs };
}

// ============================================================================
// Step 7: Ranked Mutations
// ============================================================================

export function rankMutations(
    heatmap: number[][],
    wtSeq: string,
    aaList: string[],
    topK: number
): { topBeneficial: Mutation[]; topHarmful: Mutation[] } {
    const allMutations: Mutation[] = [];

    // Flatten all mutations (skip self-mutations)
    heatmap.forEach((row, aaIndex) => {
        row.forEach((deltaBFI, posIndex) => {
            const fromAA = wtSeq[posIndex];
            const toAA = aaList[aaIndex];

            if (fromAA !== toAA) {
                allMutations.push({
                    fromAA,
                    toAA,
                    position: posIndex + 1,
                    deltaBFI
                });
            }
        });
    });

    // Sort descending for top beneficial
    const sortedBeneficial = [...allMutations].sort((a, b) => b.deltaBFI - a.deltaBFI);
    const topBeneficial = sortedBeneficial.slice(0, topK);

    // Sort ascending for top harmful
    const sortedHarmful = [...allMutations].sort((a, b) => a.deltaBFI - b.deltaBFI);
    const topHarmful = sortedHarmful.slice(0, topK);

    return { topBeneficial, topHarmful };
}

// ============================================================================
// Step 8: Text Generation
// ============================================================================

function fillTemplate(template: string, vars: Record<string, any>): string {
    let result = template;
    Object.entries(vars).forEach(([key, value]) => {
        const placeholder = `{{${key}}}`;
        result = result.replace(new RegExp(placeholder.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g'), String(value));
    });
    return result;
}

export function generatePositionText(
    stats: PositionStats,
    classification: PositionClass,
    chemistry: ChemistryAnalysis,
    isChargedOverride: boolean,
    isExcellentTarget: boolean,
    config: BFIConfig
): PositionInterpretation {
    const { templates, beneficial_explanations, harmful_explanations } = config;

    // Header
    const header = fillTemplate(templates.position_header, {
        pos1: stats.pos1,
        wt: stats.wtAA,
        class_label: classification.classLabel
    });

    // Basic stats
    const basic_stats = fillTemplate(templates.position_basic_stats, {
        best_AA: stats.best_AA,
        best_score: stats.best_score.toFixed(2),
        worst_AA: stats.worst_AA,
        worst_score: stats.worst_score.toFixed(2),
        num_improve: stats.num_improve,
        num_degrade: stats.num_degrade,
        num_neutral: stats.num_neutral
    });

    // Chemistry sentences
    const chemistry_text: string[] = [];

    if (isChargedOverride) {
        chemistry_text.push(templates.conserved_charged_override);
    } else {
        if (chemistry.dominant_beneficial_group) {
            chemistry_text.push(beneficial_explanations[chemistry.dominant_beneficial_group]);
        }
        if (chemistry.dominant_harmful_group) {
            chemistry_text.push(harmful_explanations[chemistry.dominant_harmful_group]);
        }
    }

    // Excellent target flag
    if (isExcellentTarget) {
        chemistry_text.push(templates.excellent_target);
    }

    // Assemble full text
    const full_text = [header, basic_stats, ...chemistry_text].join(' ');

    return {
        posIndex: stats.posIndex,
        pos1: stats.pos1,
        wtAA: stats.wtAA,
        classId: classification.classId,
        classLabel: classification.classLabel,
        num_improve: stats.num_improve,
        num_degrade: stats.num_degrade,
        num_neutral: stats.num_neutral,
        best_AA: stats.best_AA,
        best_score: stats.best_score,
        worst_AA: stats.worst_AA,
        worst_score: stats.worst_score,
        is_conserved_charged: isChargedOverride,
        is_excellent_target: isExcellentTarget,
        header,
        basic_stats,
        chemistry_text,
        full_text
    };
}

// ============================================================================
// Main Integration Function
// ============================================================================

export function interpretBFIMatrix(
    heatmap: number[][],  // [20][L] - rows are AAs, columns are positions
    wtSeq: string,
    config: BFIConfig
): InterpretationResult {
    const L = wtSeq.length;
    const aaList = config.aa_list;

    // Step 1: Compute stats for all positions
    const allStats = Array.from({ length: L }, (_, i) =>
        computePositionStats(heatmap, i, wtSeq[i], config)
    );

    // Step 2: Classify all positions
    const allClasses = allStats.map(stats => classifyPosition(stats, config));

    // Step 3: Analyze chemistry for all positions
    const allChemistry = allStats.map(stats =>
        analyzeChemistryGroups(stats.column, aaList, config)
    );

    // Step 4: Determine charged overrides
    const chargedOverrides = allStats.map((stats, i) =>
        shouldApplyChargedOverride(stats.wtAA, allClasses[i].classId, config)
    );

    // Step 5: Mark excellent targets
    const excellentTargets = markExcellentTargets(allStats, allClasses, config);

    // Step 6: Global preferences
    const { aa_prefs, group_prefs } = computeGlobalPreferences(heatmap, config);

    // Step 7: Ranked mutations
    const { topBeneficial, topHarmful } = rankMutations(
        heatmap,
        wtSeq,
        aaList,
        config.thresholds.top_k_mutations
    );

    // Step 8: Generate text for each position
    const positions = allStats.map((stats, i) =>
        generatePositionText(
            stats,
            allClasses[i],
            allChemistry[i],
            chargedOverrides[i],
            excellentTargets.has(i),
            config
        )
    );

    // Compile position lists
    const conserved_positions = positions
        .filter(p => p.classId === 'highly_sensitive')
        .map(p => p.pos1);

    const sensitive_positions = positions
        .filter(p => p.classId === 'highly_sensitive' || p.classId === 'moderately_sensitive')
        .map(p => p.pos1);

    const designable_positions = positions
        .filter(p => p.classId === 'highly_designable' || p.classId === 'moderately_designable')
        .map(p => p.pos1);

    const excellent_target_positions = positions
        .filter(p => p.is_excellent_target)
        .map(p => p.pos1);

    // Generate global summary
    const globalSummaryParts: string[] = [
        config.templates.global_summary_header,
        fillTemplate(config.templates.global_structural_core, {
            core_positions: conserved_positions.join(', ') || 'None'
        }),
        fillTemplate(config.templates.global_sensitive, {
            sensitive_positions: sensitive_positions.join(', ') || 'None'
        }),
        fillTemplate(config.templates.global_designable, {
            designable_positions: designable_positions.join(', ') || 'None'
        })
    ];

    const group_means_obj = group_prefs.reduce((acc, gp) => {
        acc[`${gp.group}_mean`] = gp.mean.toFixed(2);
        return acc;
    }, {} as Record<string, string>);

    globalSummaryParts.push(fillTemplate(config.templates.global_group_preferences, group_means_obj));

    const global_summary = globalSummaryParts.join(' ');

    return {
        positions,
        conserved_positions,
        sensitive_positions,
        designable_positions,
        excellent_target_positions,
        aa_preferences: aa_prefs,
        group_preferences: group_prefs,
        topBeneficialMutations: topBeneficial,
        topHarmfulMutations: topHarmful,
        total_positions: L,
        structurally_conserved_count: conserved_positions.length,
        global_summary
    };
}
