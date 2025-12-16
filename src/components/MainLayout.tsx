import React from 'react';
import { motion } from 'framer-motion';

interface MainLayoutProps {
    leftPanel: React.ReactNode;
    centerPanel: React.ReactNode;
    rightPanel: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ leftPanel, centerPanel, rightPanel }) => {
    return (
        <main className="max-w-[1600px] mx-auto px-6 py-8 pb-32">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column: Sequence Intelligence (3 cols) */}
                <motion.div
                    className="lg:col-span-3 space-y-6"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    {leftPanel}
                </motion.div>

                {/* Middle Column: Plots & Structure (6 cols) */}
                <motion.div
                    className="lg:col-span-6 space-y-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    {centerPanel}
                </motion.div>

                {/* Right Column: Descriptors (3 cols) */}
                <motion.div
                    className="lg:col-span-3 space-y-6"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    {rightPanel}
                </motion.div>
            </div>
        </main>
    );
};
