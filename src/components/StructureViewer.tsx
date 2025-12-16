import React, { useEffect, useRef, useState } from 'react';
import * as NGL from 'ngl';
import { motion, AnimatePresence } from 'framer-motion';
import {
    RotateCw,
    ZoomIn,
    ZoomOut,
    Maximize2,
    Minimize2,
    Camera,
    Download,
    RefreshCw,
    Palette,
    Eye,
    Settings
} from 'lucide-react';

interface StructureViewerProps {
    pdbData?: string;
    sequence?: string;
}

type ColorScheme = 'sstruc' | 'hydrophobicity' | 'chainid' | 'element' | 'bfactor';
type Representation = 'cartoon' | 'ball+stick' | 'surface' | 'spacefill';

export const StructureViewer: React.FC<StructureViewerProps> = ({ sequence }) => {
    const stageRef = useRef<NGL.Stage | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const componentRef = useRef<any>(null);

    const [loading, setLoading] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [colorScheme, setColorScheme] = useState<ColorScheme>('sstruc');
    const [representation, setRepresentation] = useState<Representation>('cartoon');
    const structureLoadedRef = useRef(false);

    // Intersection Observer
    useEffect(() => {
        if (!containerRef.current) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !isVisible) {
                    setIsVisible(true);
                }
            },
            { threshold: 0.1 }
        );

        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);

    // Initialize NGL Stage
    useEffect(() => {
        if (!containerRef.current || !isVisible || structureLoadedRef.current) return;

        setLoading(true);

        const initTimeout = setTimeout(() => {
            try {
                const stage = new NGL.Stage(containerRef.current!, {
                    backgroundColor: "#0F172A"
                });
                stageRef.current = stage;

                const handleResize = () => stage.handleResize();
                window.addEventListener("resize", handleResize);

                // Load structure
                stage.loadFile("rcsb://1CRN").then((component: any) => {
                    if (component) {
                        componentRef.current = component;
                        component.addRepresentation(representation, { color: colorScheme });
                        component.autoView();
                        setLoading(false);
                        structureLoadedRef.current = true;
                    }
                }).catch((error) => {
                    console.error("Failed to load structure:", error);
                    setLoading(false);
                });

                return () => {
                    window.removeEventListener("resize", handleResize);
                    if (stage) stage.dispose();
                };
            } catch (error) {
                console.error("Failed to initialize NGL Stage:", error);
                setLoading(false);
            }
        }, 100);

        return () => clearTimeout(initTimeout);
    }, [isVisible]);

    // Control Functions
    const handleZoomIn = () => {
        if (stageRef.current) {
            stageRef.current.viewer.camera.zoom(0.8);
        }
    };

    const handleZoomOut = () => {
        if (stageRef.current) {
            stageRef.current.viewer.camera.zoom(1.2);
        }
    };

    const handleResetView = () => {
        if (componentRef.current) {
            componentRef.current.autoView();
        }
    };

    const handleRotate = () => {
        if (stageRef.current) {
            stageRef.current.animationControls.rotate([0, 1, 0], Math.PI / 2);
        }
    };

    const handleScreenshot = () => {
        if (stageRef.current) {
            stageRef.current.makeImage({
                factor: 2,
                antialias: true,
                trim: false,
                transparent: false
            }).then((blob) => {
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `structure-${Date.now()}.png`;
                link.click();
                URL.revokeObjectURL(url);
            });
        }
    };

    const handleChangeColorScheme = (scheme: ColorScheme) => {
        setColorScheme(scheme);
        if (componentRef.current) {
            componentRef.current.removeAllRepresentations();
            componentRef.current.addRepresentation(representation, { color: scheme });
        }
    };

    const handleChangeRepresentation = (repr: Representation) => {
        setRepresentation(repr);
        if (componentRef.current) {
            componentRef.current.removeAllRepresentations();
            componentRef.current.addRepresentation(repr, { color: colorScheme });
        }
    };

    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
    };

    return (
        <div className={`relative w-full bg-slate-950 rounded-xl overflow-hidden border border-slate-800 shadow-2xl ${isFullscreen ? 'fixed inset-4 z-[100] h-[calc(100vh-2rem)]' : 'h-full min-h-[400px]'
            }`}>
            <div ref={containerRef} className="w-full h-full" />

            {/* Loading Overlay */}
            {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-950/90 backdrop-blur-sm z-10">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                        <p className="text-sm text-indigo-400 font-medium">Loading 3D Structure...</p>
                    </div>
                </div>
            )}

            {/* Status Badge */}
            <div className="absolute top-4 left-4 pointer-events-none z-20">
                <div className="flex items-center gap-2 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                    <div className={`w-2 h-2 rounded-full ${loading ? 'bg-indigo-500' : 'bg-emerald-500'} animate-pulse`} />
                    <span className={`text-xs font-mono ${loading ? 'text-indigo-400' : 'text-emerald-400'}`}>
                        {loading ? 'Initializing...' : 'Live 3D'}
                    </span>
                </div>
            </div>

            {/* Control Panel */}
            <AnimatePresence>
                {showControls && !loading && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="absolute top-4 right-4 z-20"
                    >
                        <div className="bg-black/70 backdrop-blur-xl rounded-2xl border border-white/10 p-2 space-y-2">
                            {/* Main Controls */}
                            <div className="flex items-center gap-1">
                                <ControlButton icon={ZoomIn} onClick={handleZoomIn} tooltip="Zoom In" />
                                <ControlButton icon={ZoomOut} onClick={handleZoomOut} tooltip="Zoom Out" />
                                <ControlButton icon={RotateCw} onClick={handleRotate} tooltip="Rotate 90°" />
                                <ControlButton icon={RefreshCw} onClick={handleResetView} tooltip="Reset View" />
                                <div className="w-px h-8 bg-white/10 mx-1" />
                                <ControlButton icon={Camera} onClick={handleScreenshot} tooltip="Screenshot" />
                                <ControlButton
                                    icon={isFullscreen ? Minimize2 : Maximize2}
                                    onClick={toggleFullscreen}
                                    tooltip={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                                />
                            </div>

                            {/* Color Scheme Selector */}
                            <div className="border-t border-white/10 pt-2">
                                <div className="text-[10px] text-slate-400 mb-1 px-1 uppercase tracking-wide">Color Scheme</div>
                                <div className="grid grid-cols-2 gap-1">
                                    <ColorSchemeButton
                                        label="Structure"
                                        active={colorScheme === 'sstruc'}
                                        onClick={() => handleChangeColorScheme('sstruc')}
                                    />
                                    <ColorSchemeButton
                                        label="Element"
                                        active={colorScheme === 'element'}
                                        onClick={() => handleChangeColorScheme('element')}
                                    />
                                    <ColorSchemeButton
                                        label="Chain"
                                        active={colorScheme === 'chainid'}
                                        onClick={() => handleChangeColorScheme('chainid')}
                                    />
                                    <ColorSchemeButton
                                        label="B-Factor"
                                        active={colorScheme === 'bfactor'}
                                        onClick={() => handleChangeColorScheme('bfactor')}
                                    />
                                </div>
                            </div>

                            {/* Representation Selector */}
                            <div className="border-t border-white/10 pt-2">
                                <div className="text-[10px] text-slate-400 mb-1 px-1 uppercase tracking-wide">Representation</div>
                                <div className="grid grid-cols-2 gap-1">
                                    <RepresentationButton
                                        label="Cartoon"
                                        active={representation === 'cartoon'}
                                        onClick={() => handleChangeRepresentation('cartoon')}
                                    />
                                    <RepresentationButton
                                        label="Ball & Stick"
                                        active={representation === 'ball+stick'}
                                        onClick={() => handleChangeRepresentation('ball+stick')}
                                    />
                                    <RepresentationButton
                                        label="Surface"
                                        active={representation === 'surface'}
                                        onClick={() => handleChangeRepresentation('surface')}
                                    />
                                    <RepresentationButton
                                        label="Space Fill"
                                        active={representation === 'spacefill'}
                                        onClick={() => handleChangeRepresentation('spacefill')}
                                    />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Toggle Controls Button */}
            {!loading && (
                <button
                    onClick={() => setShowControls(!showControls)}
                    className="absolute top-4 right-4 z-30 bg-black/70 backdrop-blur-md p-2 rounded-full border border-white/10 text-white hover:bg-white/10 transition-colors"
                    style={{ display: showControls ? 'none' : 'block' }}
                >
                    <Settings className="w-5 h-5" />
                </button>
            )}

            {/* Info Panel */}
            <div className="absolute bottom-4 right-4 bg-black/80 backdrop-blur-md px-4 py-3 rounded-xl border border-white/10 max-w-xs z-10">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-white">Structure Preview</span>
                    <span className="text-[10px] text-slate-400 font-mono">1CRN (Demo)</span>
                </div>
                <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-400">
                        <span>Confidence (pLDDT)</span>
                        <span className="text-indigo-400">89.4</span>
                    </div>
                    <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full w-[89%] bg-gradient-to-r from-indigo-500 to-cyan-500" />
                    </div>
                </div>
                {sequence && (
                    <div className="mt-3 pt-3 border-t border-white/10 text-[10px] text-slate-500 leading-relaxed">
                        * Using placeholder structure (1CRN). Real-time folding requires AlphaFold integration.
                    </div>
                )}
            </div>
        </div>
    );
};

// Control Button Component
interface ControlButtonProps {
    icon: React.ComponentType<{ className?: string }>;
    onClick: () => void;
    tooltip: string;
}

const ControlButton: React.FC<ControlButtonProps> = ({ icon: Icon, onClick, tooltip }) => {
    return (
        <button
            onClick={onClick}
            title={tooltip}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-all hover:scale-110 active:scale-95"
        >
            <Icon className="w-4 h-4" />
        </button>
    );
};

// Color Scheme Button
interface ColorSchemeButtonProps {
    label: string;
    active: boolean;
    onClick: () => void;
}

const ColorSchemeButton: React.FC<ColorSchemeButtonProps> = ({ label, active, onClick }) => {
    return (
        <button
            onClick={onClick}
            className={`px-2 py-1 text-[10px] font-medium rounded-lg transition-all ${active
                    ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/50'
                    : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                }`}
        >
            {label}
        </button>
    );
};

// Representation Button
const RepresentationButton: React.FC<ColorSchemeButtonProps> = ({ label, active, onClick }) => {
    return (
        <button
            onClick={onClick}
            className={`px-2 py-1 text-[10px] font-medium rounded-lg transition-all ${active
                    ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/50'
                    : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                }`}
        >
            {label}
        </button>
    );
};
