import React from 'react';
import { motion } from 'framer-motion';
import { 
  Box,
  Scale
} from 'lucide-react';
import { Interactive3DHeapViewer } from './Interactive3DHeapViewer';

export const PlatformPreviewSection: React.FC = () => {
  return (
    <section 
      id="heap-reconstruction" 
      className="py-24 bg-[#F8FAFC] border-b border-gray-200 relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] font-mono font-semibold uppercase tracking-wider text-[#008C45] mb-3"
          >
            <Box className="w-3.5 h-3.5" />
            <span>PHOTOGRAMMETRIC AI ENGINE</span>
          </motion.div>

          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-display font-extrabold text-3xl sm:text-4xl text-[#0f2e1e] tracking-tight"
          >
            3D Grain Heap Reconstruction & Volumetric Estimation
          </motion.h2>

          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-3 text-sm sm:text-base text-gray-600 font-normal leading-relaxed"
          >
            High-density point-cloud and surface-mesh reconstruction from UAV oblique imagery, calibrated against laboratory bulk-density standards to determine harvest yield without manual weighbridges.
          </motion.p>
        </div>

        {/* 3D Showcase Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Interactive 3D Canvas Box */}
          <div className="lg:col-span-8">
            <div className="rounded-2xl border border-gray-200 bg-white p-2.5 shadow-md overflow-hidden relative">
              
              {/* Header Strip inside Viewer Card */}
              <div className="px-4 py-2.5 border-b border-gray-100 flex items-center justify-between bg-[#F8FAFC] rounded-t-xl text-xs font-mono">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-bold text-gray-800">MESH RECONSTRUCTION: SWARNA PADDY</span>
                </div>
                <span className="text-[10px] text-gray-500 font-medium">Drag to Rotate • Scroll to Zoom</span>
              </div>

              {/* Three.js Interactive Component */}
              <div className="relative rounded-b-xl overflow-hidden bg-slate-950">
                <Interactive3DHeapViewer height="480px" showControls={true} />
              </div>
            </div>
          </div>

          {/* Right Column: Physical Calibration & Volumetric Readout */}
          <div className="lg:col-span-4 space-y-4">
            
            <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-xs space-y-4">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-gray-500 block">
                VOLUMETRIC HARVEST TELEMETRY
              </span>

              {/* Metric 1: Point Cloud Density */}
              <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                <span className="text-xs text-gray-600">Reconstructed Points:</span>
                <strong className="text-xs font-mono font-bold text-gray-900">16,000 Vertices</strong>
              </div>

              {/* Metric 2: Vertical RMSE */}
              <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                <span className="text-xs text-gray-600">Vertical Accuracy (RMSE):</span>
                <strong className="text-xs font-mono font-bold text-[#008C45]">±1.4 cm</strong>
              </div>

              {/* Metric 3: Bulk Density Calibration */}
              <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                <span className="text-xs text-gray-600">Bulk Density Calibration:</span>
                <strong className="text-xs font-mono font-bold text-gray-900">578.0 kg/m³</strong>
              </div>

              {/* Metric 4: Volume Integration */}
              <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                <span className="text-xs text-gray-600">Mesh Integrated Volume:</span>
                <strong className="text-xs font-mono font-bold text-[#008C45]">0.021 m³</strong>
              </div>

              {/* Metric 5: Estimated Mass */}
              <div className="flex justify-between items-center pt-1">
                <span className="text-xs font-semibold text-gray-800">Calibrated Grain Mass:</span>
                <strong className="text-sm font-mono font-extrabold text-[#008C45]">0.12 Quintals</strong>
              </div>
            </div>

            {/* Methodology Explainer Card */}
            <div className="p-5 rounded-2xl bg-[#E6F4EA]/60 border border-[#B7E1CD] text-xs space-y-2 text-[#0f2e1e]">
              <div className="flex items-center gap-1.5 font-bold font-mono text-[11px] text-[#008C45]">
                <Scale className="w-4 h-4" />
                <span>PHYSICAL MASS DERIVATION</span>
              </div>
              <p className="text-[11px] leading-relaxed text-gray-700">
                Volume is integrated via the triangulated irregular network (TIN). Mass is computed with calibrated bulk density:
              </p>
              <div className="p-2 rounded bg-white/80 border border-emerald-200/80 font-mono text-[11px] text-center font-bold text-[#008C45]">
                Mass = Volume × ρ_bulk × (1 - Settling)
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
