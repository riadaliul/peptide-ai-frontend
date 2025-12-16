import React from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, Box, FlaskConical, ScanSearch, PenTool } from 'lucide-react';

interface NavigationProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
}

const TABS = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'structure', label: 'Structure', icon: Box },
    { id: 'physico', label: 'Physicochemical', icon: FlaskConical },
    { id: 'design', label: 'Design & Scan', icon: ScanSearch },
];

export const Navigation: React.FC<NavigationProps> = ({ activeTab, setActiveTab }) => {
    return (
        <div className="flex items-center gap-2 p-1 bg-white/5 rounded-xl border border-white/10 backdrop-blur-md">
            {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${isActive ? 'text-white' : 'text-white/60 hover:text-white/80'
                            }`}
                    >
                        {isActive && (
                            <motion.div
                                layoutId="activeTab"
                                className="absolute inset-0 bg-primary/20 border border-primary/30 rounded-lg"
                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                            />
                        )}
                        <Icon className="w-4 h-4 relative z-10" />
                        <span className="relative z-10">{tab.label}</span>
                    </button>
                );
            })}
        </div>
    );
};
