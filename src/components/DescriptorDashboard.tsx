import React from 'react';
import { AnalysisResult } from '../types';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, PieChart, Pie, Legend } from 'recharts';
import { motion } from 'framer-motion';
import { Activity, Zap, Droplets, Scale, Atom, Layers, Flame, Shield } from 'lucide-react';

interface DescriptorDashboardProps {
    data: AnalysisResult;
}

export const DescriptorDashboard: React.FC<DescriptorDashboardProps> = ({ data }) => {
    const { descriptors } = data;

    const radarData = [
        { subject: 'Hydrophobicity', A: (descriptors.physicochemical.gravy + 2) * 20, fullMark: 100 },
        { subject: 'Instability', A: descriptors.physicochemical.instability_index, fullMark: 100 },
        { subject: 'Aromaticity', A: descriptors.physicochemical.aromaticity * 100, fullMark: 100 },
        { subject: 'Boman Idx', A: (descriptors.physicochemical.boman_index + 5) * 10, fullMark: 100 },
        { subject: 'Isoelectric', A: descriptors.physicochemical.isoelectric_point * 7, fullMark: 100 },
        { subject: 'Aliphatic', A: descriptors.physicochemical.aliphatic_index / 2, fullMark: 100 },
    ];

    const compositionData = Object.entries(descriptors.composition)
        .filter(([_, count]) => count > 0)
        .map(([aa, count]) => ({ name: aa, count }));

    const atomicData = Object.entries(descriptors.atomic)
        .map(([atom, count]) => ({ name: atom, value: count }));

    const COLORS = ['#6366f1', '#ec4899', '#8b5cf6', '#10b981', '#f59e0b'];

    const StatCard = ({ icon: Icon, label, value, unit = '', delay = 0 }: any) => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            className="glass-panel p-6 flex items-center gap-4 group"
        >
            <div className="p-4 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl text-white group-hover:scale-110 transition-transform duration-300">
                <Icon className="w-6 h-6" />
            </div>
            <div>
                <p className="card-label">{label}</p>
                <p className="card-value bg-clip-text text-transparent bg-gradient-to-r from-white to-white/80">
                    {value}<span className="text-sm text-white/40 ml-1 font-normal">{unit}</span>
                </p>
            </div>
        </motion.div>
    );

    return (
        <div className="space-y-8 w-full max-w-7xl mx-auto px-4">
            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard icon={Scale} label="Molecular Weight" value={descriptors.physicochemical.molecular_weight} unit="Da" delay={0.1} />
                <StatCard icon={Zap} label="Charge (pH 7.4)" value={descriptors.physicochemical.charge_ph7_4} delay={0.2} />
                <StatCard icon={Activity} label="Isoelectric Point" value={descriptors.physicochemical.isoelectric_point} delay={0.3} />
                <StatCard icon={Droplets} label="GRAVY (Hydrophobicity)" value={descriptors.physicochemical.gravy} delay={0.4} />
                <StatCard icon={Flame} label="Aliphatic Index" value={descriptors.physicochemical.aliphatic_index} delay={0.5} />
                <StatCard icon={Shield} label="Instability Index" value={descriptors.physicochemical.instability_index} delay={0.6} />
                <StatCard icon={Atom} label="Heavy Atoms" value={descriptors.rdkit.heavy_atom_count} delay={0.7} />
                <StatCard icon={Layers} label="TPSA" value={descriptors.rdkit.tpsa} unit="Å²" delay={0.8} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Radar Chart */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                    className="glass-panel p-8 lg:col-span-1 flex flex-col"
                >
                    <h3 className="text-xl font-bold mb-6 text-blue-900 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-secondary" /> Property Radar
                    </h3>
                    <div className="flex-grow min-h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }} />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                <Radar name="Peptide" dataKey="A" stroke="#ec4899" strokeWidth={3} fill="#ec4899" fillOpacity={0.4} />
                                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }} itemStyle={{ color: '#fff' }} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Composition Charts */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                    className="glass-panel p-8 lg:col-span-2 flex flex-col"
                >
                    <h3 className="text-xl font-bold mb-6 text-blue-900 flex items-center gap-2">
                        <Layers className="w-5 h-5 text-primary" /> Composition Analysis
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
                        <div className="h-[300px]">
                            <h4 className="text-sm text-white/50 mb-4 uppercase tracking-wider">Amino Acids</h4>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={compositionData}>
                                    <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" />
                                    <YAxis stroke="rgba(255,255,255,0.3)" />
                                    <Tooltip
                                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                        contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
                                    />
                                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                                        {compositionData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#6366f1' : '#ec4899'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="h-[300px]">
                            <h4 className="text-sm text-white/50 mb-4 uppercase tracking-wider">Atomic Makeup</h4>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={atomicData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {atomicData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }} itemStyle={{ color: '#fff' }} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Advanced RDKit Stats */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="glass-panel p-8"
            >
                <h3 className="text-xl font-bold mb-6 text-white flex items-center gap-2">
                    <Atom className="w-5 h-5 text-accent" /> Advanced Physicochemical Properties (RDKit)
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    <div>
                        <p className="card-label">LogP (Lipophilicity)</p>
                        <p className="text-3xl font-bold text-white">{descriptors.rdkit.logp}</p>
                    </div>
                    <div>
                        <p className="card-label">H-Bond Donors</p>
                        <p className="text-3xl font-bold text-white">{descriptors.rdkit.h_bond_donors}</p>
                    </div>
                    <div>
                        <p className="card-label">H-Bond Acceptors</p>
                        <p className="text-3xl font-bold text-white">{descriptors.rdkit.h_bond_acceptors}</p>
                    </div>
                    <div>
                        <p className="card-label">Fraction CSP3</p>
                        <p className="text-3xl font-bold text-white">{descriptors.rdkit.fraction_csp3}</p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};
