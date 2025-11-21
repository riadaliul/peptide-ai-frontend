import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, Box, FlaskConical, Dna, Brain, Atom } from 'lucide-react';
import { cn } from '../lib/utils';

interface NavigationDockProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
}

const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'structure', label: 'Structure & Folding', icon: Box },
    { id: 'physicochemical', label: 'Physicochemical', icon: FlaskConical },
    { id: 'design', label: 'Design & Mutations', icon: Dna },
    { id: 'ml', label: 'ML Predictions', icon: Brain },
    { id: 'advanced', label: 'Advanced Chemistry', icon: Atom },
];

export const NavigationDock: React.FC<NavigationDockProps> = ({ activeTab, setActiveTab }) => {
    return (
        <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200 shadow-sm">
            <div className="max-w-[1440px] mx-auto px-8">
                <nav className="flex items-center gap-2 py-4 overflow-x-auto">
                    {tabs.map((tab) => {
                        const isActive = activeTab === tab.id;
                        const Icon = tab.icon;

                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className="relative flex items-center gap-2 px-5 py-2.5 rounded-full whitespace-nowrap transition-all duration-300 group"
                            >
                                {/* Background */}
                                <div className={cn(
                                    "absolute inset-0 rounded-full transition-all duration-300",
                                    isActive
                                        ? "bg-gradient-to-r from-indigo-600 to-purple-600 shadow-md"
                                        : "bg-slate-100 group-hover:bg-slate-200"
                                )} />

                                {/* Icon */}
                                <Icon className={cn(
                                    "relative z-10 w-5 h-5 transition-colors duration-300",
                                    isActive ? "text-white" : "text-slate-600 group-hover:text-slate-900"
                                )} />

                                {/* Label */}
                                <span className={cn(
                                    "relative z-10 text-sm font-medium transition-colors duration-300",
                                    isActive ? "text-white" : "text-slate-700 group-hover:text-slate-900"
                                )}>
                                    {tab.label}
                                </span>

                                {/* Bottom glow for active tab */}
                                {isActive && (
                                    <motion.div
                                        layoutId="activeGlow"
                                        className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-16 h-1 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full blur-sm"
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                            </button>
                        );
                    })}
                </nav>
            </div>
        </div>
    );
};
