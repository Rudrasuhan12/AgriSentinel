import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Scan, 
  Cpu, 
  Layers, 
  ArrowRight, 
  Boxes,
  Activity
} from 'lucide-react';

interface LaunchPlatformModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LaunchPlatformModal: React.FC<LaunchPlatformModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-charcoal-950/80 backdrop-blur-md transition-opacity"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-2xl bg-charcoal-900 border border-forest-700 rounded-2xl shadow-2xl overflow-hidden z-10"
        >
          {/* Header */}
          <div className="bg-charcoal-950 px-6 py-4 border-b border-forest-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-md bg-forest-900 border border-lime-dim flex items-center justify-center">
                <Scan className="w-4 h-4 text-lime-accent" />
              </div>
              <div>
                <h3 className="font-display font-bold text-sand-50 text-base">
                  AgriSentinel Platform Access
                </h3>
                <p className="font-mono text-[11px] text-olive-400">
                  Phase 0 Architecture Deployment
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-forest-900/60 border border-forest-800 text-sand-300 hover:text-sand-100 hover:border-lime-dim transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 sm:p-8 space-y-6">
            
            {/* Status notice */}
            <div className="p-4 rounded-xl bg-forest-950 border border-forest-800 flex items-start gap-3">
              <Activity className="w-5 h-5 text-lime-accent shrink-0 mt-0.5" />
              <div className="text-xs text-sand-300 leading-relaxed font-mono">
                <strong className="text-lime-accent">System Notice:</strong> The internal GIS dashboard and photogrammetry backend service are actively scheduled for implementation in Phase 1 & 2. You are currently viewing the public architectural portal.
              </div>
            </div>

            {/* Subsystem status pills */}
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-olive-400 mb-3">
                Subsystem Deployment Matrix
              </div>
              <div className="space-y-2.5 font-mono text-xs">
                <div className="p-3 rounded-lg bg-charcoal-950 border border-forest-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-olive-400" />
                    <span className="text-sand-200">Public Frontend Portal</span>
                  </div>
                  <span className="text-emerald-400 font-semibold px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800 text-[10px]">
                    ONLINE / OPERATIONAL
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-charcoal-950 border border-forest-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-olive-400" />
                    <span className="text-sand-200">FastAPI REST Backend</span>
                  </div>
                  <span className="text-lime-accent px-2 py-0.5 rounded bg-forest-900 border border-forest-700 text-[10px]">
                    PHASE 1 IN PROGRESS
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-charcoal-950 border border-forest-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Boxes className="w-4 h-4 text-olive-400" />
                    <span className="text-sand-200">3D Photogrammetry Worker</span>
                  </div>
                  <span className="text-sand-400 px-2 py-0.5 rounded bg-charcoal-900 border border-charcoal-800 text-[10px]">
                    PHASE 3 PLANNED
                  </span>
                </div>
              </div>
            </div>

            {/* Quick jump buttons */}
            <div className="pt-2 border-t border-forest-800 flex flex-col sm:flex-row items-center gap-3">
              <a
                href="#platform-preview"
                onClick={onClose}
                className="w-full sm:w-auto flex-1 py-2.5 px-4 rounded-lg bg-lime-accent hover:bg-lime-glow text-charcoal-950 font-mono text-xs uppercase font-bold tracking-wider flex items-center justify-center gap-2 transition-all shadow-subtle-glow"
              >
                <span>View Platform Studio Concept</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <a
                href="#methodology"
                onClick={onClose}
                className="w-full sm:w-auto py-2.5 px-4 rounded-lg bg-forest-900 hover:bg-forest-850 text-sand-100 font-mono text-xs uppercase tracking-wider border border-forest-700 flex items-center justify-center gap-2 transition-all"
              >
                <span>Yield Simulator</span>
              </a>
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
