import React from 'react';
import { motion } from 'framer-motion';
import { PackageSearch, Sparkles, TrendingUp } from 'lucide-react';

interface EmptyStateProps {
    icon?: React.ComponentType<{ className?: string }>;
    title?: string;
    description?: string;
    action?: {
        label: string;
        onClick: () => void;
    };
    variant?: 'default' | 'compact';
}

export const EmptyState: React.FC<EmptyStateProps> = ({
    icon: Icon = PackageSearch,
    title = 'No Data Available',
    description = 'Analyze a peptide sequence to see results here.',
    action,
    variant = 'default',
}) => {
    if (variant === 'compact') {
        return (
            <div className="flex flex-col items-center justify-center py-8 text-center">
                <Icon className="w-12 h-12 text-slate-300 mb-3" />
                <p className="text-sm text-slate-500">{description}</p>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-12 px-6 text-center"
        >
            {/* Icon with gradient background */}
            <div className="relative mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full blur-2xl" />
                <div className="relative bg-gradient-to-br from-slate-100 to-slate-200 p-6 rounded-2xl">
                    <Icon className="w-12 h-12 text-slate-400" />
                </div>
            </div>

            {/* Content */}
            <h3 className="text-lg font-semibold text-slate-700 mb-2">{title}</h3>
            <p className="text-sm text-slate-500 max-w-sm mb-6">{description}</p>

            {/* Action Button */}
            {action && (
                <button
                    onClick={action.onClick}
                    className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg hover:scale-105 transition-all"
                >
                    {action.label}
                </button>
            )}

            {/* Decorative elements */}
            <div className="absolute top-8 right-8 opacity-10">
                <Sparkles className="w-8 h-8 text-indigo-500" />
            </div>
            <div className="absolute bottom-8 left-8 opacity-10">
                <TrendingUp className="w-8 h-8 text-purple-500" />
            </div>
        </motion.div>
    );
};
