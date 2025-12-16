// TypeScript types for ΔBFI Rule Engine
// These types ensure type-safety when loading and using the JSON config

// ============================================================================
// Configuration Types (matches bfiRuleEngine.json structure)
// ============================================================================

export interface BFIThresholds {
    improve: number;
    degrade: number;
    neutral_abs: number;
    high_sensitive_degrade: number;
    mod_sensitive_degrade: number;
    high_design_improve: number;
    mod_design_improve: number;
    group_beneficial_min: number;
    group_harmful_max: number;
    group_margin: number;
    top_opt_site_delta: number;
    top_opt_site_max_num: number;
    top_k_mutations: number;
}

export interface AAGroups {
    hydrophobic: string[];
    aromatic: string[];
    positive: string[];
    negative: string[];
    polar: string[];
    special: string[];
}

export interface PositionClassRule {
    id: string;
    label: string;
    conditions: {
        num_degrade_gte?: number;
        num_degrade_lte?: number;
        num_improve_gte?: number;
        num_improve_lte?: number;
    };
}

export interface Templates {
    position_header: string;
    position_basic_stats: string;
    conserved_charged_override: string;
    excellent_target: string;
    global_summary_header: string;
    global_structural_core: string;
    global_sensitive: string;
    global_designable: string;
    global_group_preferences: string;
    top_beneficial_header: string;
    top_harmful_header: string;
    mutation_line: string;
}

export interface BFIConfig {
    aa_list: string[];
    thresholds: BFIThresholds;
    aa_groups: AAGroups;
    position_class_rules: PositionClassRule[];
    beneficial_explanations: Record<string, string>;
    harmful_explanations: Record<string, string>;
    templates: Templates;
}

// ============================================================================
// Computed Stats Types (intermediate calculations)
// ============================================================================

export interface PositionStats {
    posIndex: number;          // 0-based position index
    pos1: number;              // 1-based position for display
    wtAA: string;              // Wild-type amino acid at this position
    column: number[];          // ΔBFI values for all 20 AAs at this position

    // Basic stats
    num_improve: number;
    num_degrade: number;
    num_neutral: number;

    // Best/worst
    best_AA: string;
    best_score: number;
    worst_AA: string;
    worst_score: number;
    max_score: number;         // Same as best_score, for clarity
}

export interface PositionClass {
    classId: string;           // e.g. "highly_sensitive"
    classLabel: string;        // e.g. "Highly sensitive / intolerant"
}

export interface ChemistryAnalysis {
    group_means: Record<string, number>;           // mean ΔBFI per AA group
    dominant_beneficial_group: string | null;      // group with highest mean (if qualified)
    dominant_harmful_group: string | null;         // group with lowest mean (if qualified)
}

export interface GlobalAAPreference {
    aa: string;
    mean: number;
    improve_count: number;
    degrade_count: number;
}

export interface GlobalGroupPreference {
    group: string;
    mean: number;
}

export interface Mutation {
    fromAA: string;
    toAA: string;
    position: number;          // 1-based
    deltaBFI: number;
}

// ============================================================================
// Final Result Types (output of interpretation engine)
// ============================================================================

export interface PositionInterpretation {
    posIndex: number;          // 0-based
    pos1: number;              // 1-based
    wtAA: string;

    // Classification
    classId: string;
    classLabel: string;

    // Stats
    num_improve: number;
    num_degrade: number;
    num_neutral: number;
    best_AA: string;
    best_score: number;
    worst_AA: string;
    worst_score: number;

    // Flags
    is_conserved_charged: boolean;
    is_excellent_target: boolean;

    // Generated text
    header: string;            // From position_header template
    basic_stats: string;       // From position_basic_stats template
    chemistry_text: string[];  // 0-2 sentences from beneficial/harmful explanations
    full_text: string;         // Complete assembled text
}

export interface InterpretationResult {
    // Per-position results
    positions: PositionInterpretation[];

    // Position lists
    conserved_positions: number[];     // 1-based positions (highly_sensitive)
    sensitive_positions: number[];     // 1-based (highly or moderately sensitive)
    designable_positions: number[];    // 1-based (highly or moderately designable)
    excellent_target_positions: number[]; // 1-based (flagged as excellent targets)

    // Global preferences
    aa_preferences: GlobalAAPreference[];
    group_preferences: GlobalGroupPreference[];

    // Ranked mutations
    topBeneficialMutations: Mutation[];
    topHarmfulMutations: Mutation[];

    // Summary stats
    total_positions: number;
    structurally_conserved_count: number;

    // Generated global text
    global_summary: string;
}

// ============================================================================
// Utility Types
// ============================================================================

export type AAGroupKey = keyof AAGroups;

export interface TemplateVariables {
    [key: string]: string | number;
}
