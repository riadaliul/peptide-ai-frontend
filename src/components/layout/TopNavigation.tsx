import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Home,
    Dna,
    Beaker,
    Edit3,
    Brain,
    Atom,
    Menu,
    X,
    Sparkles
} from 'lucide-react';

interface NavItem {
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'structure', label: 'Structure & Folding', icon: Dna },
    { id: 'physicochemical', label: 'Physicochemical', icon: Beaker },
    { id: 'design', label: 'Design & Mutations', icon: Edit3 },
    { id: 'ml', label: 'ML Predictions', icon: Brain },
];

interface TopNavigationProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
}

export const TopNavigation: React.FC<TopNavigationProps> = ({
    activeTab,
    setActiveTab,
}) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200 shadow-sm">
            <div className="max-w-[1440px] mx-auto px-6 py-3">
                <div className="flex items-center justify-between gap-4">
                    {/* Logo */}
                    <div className="flex items-center gap-3">
                        <motion.div
                            className="flex items-center gap-2 cursor-pointer group"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-500 rounded-lg blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
                                <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-cyan-600 p-2 rounded-lg">
                                    <Sparkles className="w-5 h-5 text-white" />
                                </div>
                            </div>
                            <div>
                                <h1 className="text-lg font-bold text-gray-900">
                                    Peptide<span className="text-gradient-primary">AI</span>
                                </h1>
                                <p className="text-[10px] text-gray-500 -mt-1">Biomimetic Intelligence</p>
                            </div>
                        </motion.div>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center gap-2">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = activeTab === item.id;

                            return (
                                <motion.button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id)}
                                    className={`
                    relative px-4 py-2.5 rounded-xl font-medium text-sm
                    transition-all duration-300 flex items-center gap-2
                    ${isActive
                                            ? 'text-indigo-600'
                                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                        }
                  `}
                                    whileHover={{ y: -2 }}
                                    whileTap={{ y: 0 }}
                                >
                                    {/* Active indicator */}
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeTab"
                                            className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-purple-50 to-cyan-50 rounded-xl border border-indigo-200"
                                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                        />
                                    )}

                                    {/* Content */}
                                    <div className="relative flex items-center gap-2">
                                        <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : ''}`} />
                                        <span>{item.label}</span>
                                    </div>

                                    {/* Bottom accent line for active tab */}
                                    {isActive && (
                                        <motion.div
                                            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-0.5 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full"
                                            layoutId="activeAccent"
                                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                        />
                                    )}
                                </motion.button>
                            );
                        })}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="lg:hidden p-3 rounded-lg hover:bg-gray-100 transition-colors"
                        aria-label="Toggle menu"
                    >
                        {isMobileMenuOpen ? (
                            <X className="w-6 h-6 text-gray-700" />
                        ) : (
                            <Menu className="w-6 h-6 text-gray-700" />
                        )}
                    </button>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="lg:hidden mt-4 pb-4 space-y-2"
                    >
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = activeTab === item.id;

                            return (
                                <button
                                    key={item.id}
                                    onClick={() => {
                                        setActiveTab(item.id);
                                        setIsMobileMenuOpen(false);
                                    }}
                                    className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left
                    transition-all duration-200
                    ${isActive
                                            ? 'bg-gradient-to-br from-indigo-50 to-purple-50 text-indigo-700 border border-indigo-200'
                                            : 'text-gray-700 hover:bg-gray-50'
                                        }
                  `}
                                >
                                    <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-600' : 'text-gray-500'}`} />
                                    <span className="font-medium">{item.label}</span>
                                    {isActive && (
                                        <div className="ml-auto w-2 h-2 rounded-full bg-indigo-600" />
                                    )}
                                </button>
                            );
                        })}
                    </motion.div>
                )}
            </div>
        </nav>
    );
};
