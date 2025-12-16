import React from 'react';
import { motion } from 'framer-motion';

interface SkeletonProps {
    width?: string | number;
    height?: string | number;
    className?: string;
    variant?: 'rectangular' | 'circular' | 'text';
    animate?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({
    width = '100%',
    height = '1rem',
    className = '',
    variant = 'rectangular',
    animate = true,
}) => {
    const baseClasses = 'bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700';

    const variantClasses = {
        rectangular: 'rounded-md',
        circular: 'rounded-full',
        text: 'rounded',
    };

    const style = {
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
    };

    if (animate) {
        return (
            <motion.div
                className={`${baseClasses} ${variantClasses[variant]} ${className}`}
                style={{
                    ...style,
                    backgroundSize: '200% 100%',
                }}
                animate={{
                    backgroundPosition: ['200% 0', '-200% 0'],
                }}
                transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: 'linear',
                }}
            />
        );
    }

    return (
        <div
            className={`${baseClasses} ${variantClasses[variant]} ${className} animate-pulse`}
            style={style}
        />
    );
};

// Chart Skeleton
export const ChartSkeleton: React.FC<{ height?: number }> = ({ height = 300 }) => {
    return (
        <div className="w-full" style={{ height: `${height}px` }}>
            <div className="space-y-3 p-4">
                {/* Y-axis labels */}
                <div className="flex gap-4">
                    <div className="flex flex-col justify-between w-12 h-full">
                        <Skeleton width={40} height={12} />
                        <Skeleton width={40} height={12} />
                        <Skeleton width={40} height={12} />
                        <Skeleton width={40} height={12} />
                        <Skeleton width={40} height={12} />
                    </div>

                    {/* Chart area */}
                    <div className="flex-1 relative">
                        <Skeleton width="100%" height={height - 60} className="opacity-30" />

                        {/* Simulated bars/lines */}
                        <div className="absolute inset-0 flex items-end gap-1 px-2 pb-2">
                            {Array.from({ length: 20 }).map((_, i) => (
                                <Skeleton
                                    key={i}
                                    width="100%"
                                    height={Math.random() * 60 + 40 + '%'}
                                    className="opacity-50"
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* X-axis */}
                <div className="flex justify-between px-16">
                    <Skeleton width={60} height={12} />
                    <Skeleton width={60} height={12} />
                    <Skeleton width={60} height={12} />
                </div>
            </div>
        </div>
    );
};

// Card Skeleton
export const CardSkeleton: React.FC = () => {
    return (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200 p-6 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <Skeleton width={120} height={20} />
                <Skeleton width={60} height={16} variant="circular" />
            </div>

            {/* Content */}
            <div className="space-y-3">
                <div className="flex justify-between">
                    <Skeleton width="40%" height={16} />
                    <Skeleton width="20%" height={16} />
                </div>
                <div className="flex justify-between">
                    <Skeleton width="35%" height={16} />
                    <Skeleton width="25%" height={16} />
                </div>
                <div className="flex justify-between">
                    <Skeleton width="45%" height={16} />
                    <Skeleton width="15%" height={16} />
                </div>
            </div>
        </div>
    );
};

// Grid Skeleton
export const GridSkeleton: React.FC<{ cols?: number; rows?: number }> = ({
    cols = 3,
    rows = 2
}) => {
    return (
        <div className={`grid grid-cols-1 md:grid-cols-${cols} gap-6`}>
            {Array.from({ length: cols * rows }).map((_, i) => (
                <CardSkeleton key={i} />
            ))}
        </div>
    );
};

// Metrics Skeleton (for KeyDescriptorsGrid)
export const MetricsSkeleton: React.FC = () => {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4 space-y-2">
                    <Skeleton width="60%" height={14} />
                    <Skeleton width="40%" height={24} />
                    <Skeleton width="80%" height={12} className="mt-2" />
                </div>
            ))}
        </div>
    );
};

// Text Skeleton (for paragraphs)
export const TextSkeleton: React.FC<{ lines?: number }> = ({ lines = 3 }) => {
    return (
        <div className="space-y-2">
            {Array.from({ length: lines }).map((_, i) => (
                <Skeleton
                    key={i}
                    width={i === lines - 1 ? '75%' : '100%'}
                    height={16}
                    variant="text"
                />
            ))}
        </div>
    );
};
