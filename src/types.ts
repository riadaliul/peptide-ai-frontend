export interface Descriptors {
    physicochemical: {
        molecular_weight: number;
        isoelectric_point: number;
        charge_ph7_4: number;
        instability_index: number;
        aromaticity: number;
        gravy: number;
        boman_index: number;
        aliphatic_index: number;
        extinction_coefficient_reduced: number;
        extinction_coefficient_oxidized: number;
        hydrophobic_moment: number;
        aggregation_score: number;
        biofunctional_index: number;
        fcr: number;
        ncpr: number;
        kappa: number;
        disorder_propensity: number;
    };
    rdkit: {
        logp: number;
        tpsa: number;
        h_bond_donors: number;
        h_bond_acceptors: number;
        heavy_atom_count: number;
        fraction_csp3: number;
        rotatable_bonds: number;
    };
    atomic: Record<string, number>;
    composition: Record<string, number>;
    secondary_structure: {
        helix: number;
        turn: number;
        sheet: number;
    };
}

export interface AnalysisResult {
    sequence: string;
    descriptors: Descriptors;
}
