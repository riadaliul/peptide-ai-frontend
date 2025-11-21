import React, { useEffect, useRef } from 'react';
import * as NGL from 'ngl';

interface StructureViewerProps {
    pdbData?: string; // If we had a PDB file
    sequence?: string; // To generate a simple helix model
}

export const StructureViewer: React.FC<StructureViewerProps> = ({ sequence }) => {
    const stageRef = useRef<NGL.Stage | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        // Initialize Stage
        const stage = new NGL.Stage(containerRef.current, { backgroundColor: "black" });
        stageRef.current = stage;

        // Handle Resize
        const handleResize = () => stage.handleResize();
        window.addEventListener("resize", handleResize);

        // Load Structure
        // In a real app, we would fetch the PDB file for the specific sequence from a backend 
        // (e.g., using AlphaFold or homology modeling).
        // For now, we load a placeholder (1CRN) to demonstrate the viewer capabilities.
        stage.loadFile("rcsb://1CRN").then((o: any) => {
            if (o) {
                o.addRepresentation("cartoon", { color: "sstruc" });
                o.addRepresentation("licorice", { sele: "sidechainAttached" });
                o.autoView();
            }
        });

        return () => {
            window.removeEventListener("resize", handleResize);
            // stage.dispose(); 
        };
    }, [sequence]); // Re-run when sequence changes

    return (
        <div className="relative w-full h-full min-h-[400px] bg-slate-950 rounded-xl overflow-hidden border border-slate-800 shadow-inner">
            <div ref={containerRef} className="w-full h-full" />

            {/* Overlay UI */}
            <div className="absolute top-4 left-4 pointer-events-none">
                <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                    <div className="w-2 h-2 rounded-full bg-science-green animate-pulse" />
                    <span className="text-xs font-mono text-science-green">Live Render</span>
                </div>
            </div>

            <div className="absolute bottom-4 right-4 bg-black/80 backdrop-blur-md px-4 py-3 rounded-xl border border-white/10 max-w-xs">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-white">Structure Preview</span>
                    <span className="text-[10px] text-slate-400 font-mono">1CRN (Demo)</span>
                </div>
                <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-400">
                        <span>Confidence (pLDDT)</span>
                        <span className="text-science-blue">89.4</span>
                    </div>
                    <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full w-[89%] bg-science-blue" />
                    </div>
                </div>
                {sequence && (
                    <div className="mt-3 pt-3 border-t border-white/10 text-[10px] text-slate-500 leading-relaxed">
                        * Visualization uses a placeholder structure. Real-time folding requires AlphaFold/ESMFold backend integration.
                    </div>
                )}
            </div>
        </div>
    );
};
