import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Activity, Droplet, HelpCircle } from 'lucide-react';
import { AutocompleteSequenceInput } from './input/AutocompleteSequenceInput';

interface HeroSectionProps {
    sequence: string;
    setSequence: (seq: string) => void;
    onAnalyze: () => void;
    metrics: {
        bfi: number;
        aggRisk: number;
        charge: number;
        pi: number;
    } | null;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ sequence, setSequence, onAnalyze, metrics }) => {
    const [hoveredBadge, setHoveredBadge] = useState<string | null>(null);

    return (
        <section className="relative w-full min-h-[75vh] overflow-hidden">
            {/* Biomimetic Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#EDEAFF] via-[#F5F3FF] to-[#FFEAF2]">
                {/* Decorative organic shapes */}
                <div className="absolute top-20 left-10 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-20 right-10 w-80 h-80 bg-pink-300/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-200/10 rounded-full blur-3xl" />

                {/* Subtle helix pattern */}
                <svg className="absolute inset-0 w-full h-full opacity-5" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="helix" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                            <path d="M 0 50 Q 25 25, 50 50 T 100 50" stroke="#6366f1" strokeWidth="0.5" fill="none" />
                            <path d="M 0 50 Q 25 75, 50 50 T 100 50" stroke="#ec4899" strokeWidth="0.5" fill="none" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#helix)" />
                </svg>
            </div>

            {/* Hero Content */}
            <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-12 sm:py-16 md:py-20 lg:py-28">
                {/* Title Block */}
                <motion.div
                    className="text-center mb-12"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                >
                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold text-blue-950 tracking-tight leading-tight mb-6"
                        style={{ fontFamily: 'Inter, SF Pro Display, system-ui', letterSpacing: '-0.5px' }}>
                        Peptide Intelligence Inspired by Biomimicry
                    </h1>
                    <p className="text-lg sm:text-xl md:text-2xl text-blue-900/70 max-w-3xl mx-auto leading-relaxed font-normal"
                        style={{ fontFamily: 'Inter, SF Pro, system-ui' }}>
                        Discover how sequences shape structure, function, and adaptive material behavior—through an AI-driven analysis engine built for peptide design and biomimetic innovation.
                    </p>
                </motion.div>

                {/* Input Block */}
                <motion.div
                    className="max-w-4xl mx-auto mb-12"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                >
                    <div className="relative group">
                        {/* Glow effect */}
                        <div className="absolute -inset-2 bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 rounded-3xl blur-xl opacity-30 transition-opacity duration-500 group-hover:opacity-50" />

                        {/* AutocompleteSequenceInput */}
                        <div className="relative">
                            <AutocompleteSequenceInput
                                sequence={sequence}
                                setSequence={setSequence}
                                onAnalyze={onAnalyze}
                            />
                        </div>
                    </div>
                </motion.div>

                {/* Metrics Badges */}
                <AnimatePresence>
                    {metrics && (
                        <motion.div
                            className="max-w-5xl mx-auto"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ delay: 0.3 }}
                        >
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                                <BadgeCard
                                    icon={<Zap className="w-5 h-5" />}
                                    label="BioFunctional Index"
                                    value={metrics.bfi.toFixed(2)}
                                    description="Composite score combining multiple functional descriptors"
                                    delay={0.4}
                                    onHover={setHoveredBadge}
                                    id="bfi"
                                    hoveredId={hoveredBadge}
                                />
                                <BadgeCard
                                    icon={<Activity className="w-5 h-5" />}
                                    label="Aggregation Risk"
                                    value={metrics.aggRisk > 0.5 ? "High" : "Low"}
                                    description="Likelihood of peptide self-assembly or precipitation"
                                    delay={0.5}
                                    onHover={setHoveredBadge}
                                    id="agg"
                                    hoveredId={hoveredBadge}
                                    variant={metrics.aggRisk > 0.5 ? "warning" : "success"}
                                />
                                <BadgeCard
                                    icon={<Zap className="w-5 h-5" />}
                                    label="Net Charge"
                                    value={metrics.charge > 0 ? `+${metrics.charge}` : metrics.charge}
                                    description="Overall electrostatic charge at pH 7"
                                    delay={0.6}
                                    onHover={setHoveredBadge}
                                    id="charge"
                                    hoveredId={hoveredBadge}
                                />
                                <BadgeCard
                                    icon={<Droplet className="w-5 h-5" />}
                                    label="Isoelectric Point"
                                    value={metrics.pi.toFixed(1)}
                                    description="pH at which peptide has zero net charge"
                                    delay={0.7}
                                    onHover={setHoveredBadge}
                                    id="pi"
                                    hoveredId={hoveredBadge}
                                />
                            </div>

                            {/* Micro tagline */}
                            <motion.p
                                className="text-center text-sm text-blue-900/60 font-medium"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.9 }}
                            >
                                Powered by biomimetic principles, physicochemical modeling, and next-generation peptide intelligence.
                            </motion.p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </section>
    );
};

// Badge Card Component
interface BadgeCardProps {
    icon: React.ReactNode;
    label: string;
    value: string | number;
    description: string;
    delay: number;
    onHover: (id: string | null) => void;
    id: string;
    hoveredId: string | null;
    variant?: 'default' | 'success' | 'warning';
}

const BadgeCard: React.FC<BadgeCardProps> = ({ icon, label, value, description, delay, onHover, id, hoveredId, variant = 'default' }) => {
    const isHovered = hoveredId === id;

    const variantStyles = {
        default: 'from-indigo-50 to-purple-50 border-indigo-200',
        success: 'from-emerald-50 to-green-50 border-emerald-200',
        warning: 'from-amber-50 to-orange-50 border-amber-200',
    };

    const iconColors = {
        default: 'text-indigo-600',
        success: 'text-emerald-600',
        warning: 'text-amber-600',
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, type: 'spring', stiffness: 200, damping: 20 }}
            onMouseEnter={() => onHover(id)}
            onMouseLeave={() => onHover(null)}
            className="relative group"
        >
            <motion.div
                className={`
                    relative bg-gradient-to-br ${variantStyles[variant]} 
                    border-2 backdrop-blur-sm rounded-2xl p-5 
                    shadow-lg transition-all duration-300 cursor-pointer
                    ${isHovered ? 'shadow-2xl scale-105' : 'hover:shadow-xl'}
                `}
            >
                {/* Icon & Label */}
                <div className="flex items-center gap-2 mb-3">
                    <div className={iconColors[variant]}>{icon}</div>
                    <span className="text-sm font-medium text-blue-900">{label}</span>
                    <HelpCircle className="w-3 h-3 text-blue-900/40 ml-auto" />
                </div>

                {/* Value */}
                <div className="text-2xl font-bold text-blue-950">{value}</div>

                {/* Tooltip */}
                <AnimatePresence>
                    {isHovered && (
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 5, scale: 0.95 }}
                            className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 z-50"
                        >
                            <div className="bg-blue-950 text-white text-xs rounded-xl p-3 shadow-2xl border border-white/10">
                                <div className="font-semibold mb-1">{label}</div>
                                <div className="text-blue-200">{description}</div>
                                {/* Arrow */}
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-blue-950" />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </motion.div>
    );
};
