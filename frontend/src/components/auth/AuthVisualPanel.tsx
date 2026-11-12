import React from 'react';
import { motion } from 'framer-motion';
import { 
  Scan, 
  Layers, 
  Plane, 
  Sparkles, 
  Box,
  Wheat
} from 'lucide-react';

export const AuthVisualPanel: React.FC = () => {
  return (
    <div className="relative w-full h-full min-h-[640px] lg:min-h-screen overflow-hidden flex flex-col justify-between p-8 sm:p-12 lg:p-16 bg-gradient-to-br from-emerald-950 via-teal-950 to-charcoal-950 text-sand-50 select-none">
      
      {/* Background Animated Gradient Spheres & Radiant Ambient Lighting */}
      <motion.div 
        animate={{ 
          scale: [1, 1.15, 1],
          opacity: [0.25, 0.45, 0.25],
          x: [0, 20, 0]
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-gradient-to-br from-emerald-500/30 via-teal-400/20 to-transparent blur-3xl pointer-events-none" 
      />
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.4, 0.2],
          y: [0, -30, 0]
        }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/2 -right-32 w-[450px] h-[450px] rounded-full bg-gradient-to-tr from-lime-400/20 via-yellow-300/15 to-transparent blur-3xl pointer-events-none" 
      />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 rounded-full bg-cyan-500/15 blur-3xl pointer-events-none" />

      {/* Subtle Satellite Grid Texture */}
      <div className="absolute inset-0 bg-geo-grid opacity-25 pointer-events-none" />

      {/* Top Header: Brand Lockup with Glow */}
      <div className="relative z-10 flex items-center justify-between">
        <a href="/" className="flex items-center gap-3 group focus:outline-none">
          <div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-600 via-teal-700 to-forest-900 border border-lime-accent/50 flex items-center justify-center overflow-hidden shadow-subtle-glow group-hover:scale-105 transition-all">
            <Scan className="w-5 h-5 text-lime-accent" />
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-display font-extrabold text-xl tracking-tight text-white drop-shadow">
                Agri<span className="text-lime-accent">Sentinel</span>
              </span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-900/80 border border-emerald-500/50 text-emerald-300 font-semibold tracking-wider">
                AGRI-AI
              </span>
            </div>
            <span className="text-[10px] text-teal-200/80 font-mono tracking-wider">
              UAV & Geospatial Intelligence Platform
            </span>
          </div>
        </a>

        {/* Back to Home Pill */}
        <a 
          href="/" 
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-950/60 hover:bg-teal-900/80 border border-teal-700/60 text-xs font-mono text-teal-200 hover:text-white transition-all shadow-sm backdrop-blur-md"
        >
          <span>← Back to Platform</span>
        </a>
      </div>

      {/* Middle Interactive Landscape Canvas with Floating UAV and Field Polygon */}
      <div className="relative z-10 my-8 py-4 flex-1 flex flex-col justify-center">
        
        {/* Visual Agricultural Field Card */}
        <div className="relative mx-auto w-full max-w-lg aspect-[16/11] rounded-2xl overflow-hidden border border-teal-500/30 bg-forest-950/80 shadow-2xl backdrop-blur-xl group">
          
          {/* High quality agricultural landscape imagery with warm glowing overlay */}
          <img 
            src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1000&auto=format&fit=crop" 
            alt="Emerald agricultural paddy fields from aerial perspective" 
            className="w-full h-full object-cover filter saturate-[1.2] contrast-[1.05] brightness-90 group-hover:scale-105 transition-transform duration-1000"
          />

          {/* Color Gradients & Sunbeam Highlights */}
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950 via-teal-950/40 to-transparent" />
          <div className="absolute -top-10 -right-10 w-44 h-44 bg-yellow-400/20 rounded-full blur-2xl pointer-events-none" />

          {/* SVG Cadastral Boundary with Animated Stroke & Vertices */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 400 270">
            {/* Grid coordinate guidelines */}
            <line x1="80" y1="0" x2="80" y2="270" stroke="rgba(255,255,255,0.08)" strokeDasharray="3,3" />
            <line x1="200" y1="0" x2="200" y2="270" stroke="rgba(255,255,255,0.08)" strokeDasharray="3,3" />
            <line x1="320" y1="0" x2="320" y2="270" stroke="rgba(255,255,255,0.08)" strokeDasharray="3,3" />

            {/* Self-drawing polygon */}
            <motion.polygon
              points="70,60 250,45 310,190 90,210"
              fill="rgba(52, 211, 153, 0.22)"
              stroke="#34d399"
              strokeWidth="2"
              strokeDasharray="5,2"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 4, ease: "easeInOut" }}
            />

            {/* Vertex Nodes with Glowing Yellow/Lime Rings */}
            {[
              { cx: 70, cy: 60 },
              { cx: 250, cy: 45 },
              { cx: 310, cy: 190 },
              { cx: 90, cy: 210 },
            ].map((node, i) => (
              <g key={i}>
                <circle cx={node.cx} cy={node.cy} r="4" fill="#a3e635" />
                <circle
                  cx={node.cx}
                  cy={node.cy}
                  r="4"
                  stroke="#fbbf24"
                  strokeWidth="1.5"
                  fill="none"
                >
                  <animate
                    attributeName="r"
                    values="4; 11; 4"
                    dur="2.2s"
                    begin={`${i * 0.4}s`}
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    values="0.9; 0; 0.9"
                    dur="2.2s"
                    begin={`${i * 0.4}s`}
                    repeatCount="indefinite"
                  />
                </circle>
              </g>
            ))}

            {/* Heap Contour Geometry */}
            <ellipse cx="190" cy="130" rx="36" ry="22" fill="rgba(251, 191, 36, 0.3)" stroke="#f59e0b" strokeWidth="1.5" />
            <circle cx="190" cy="125" r="3" fill="#f59e0b" />
          </svg>

          {/* Floating Animated UAV Drone Illustration */}
          <motion.div 
            animate={{ 
              y: [-6, 6, -6],
              x: [-4, 4, -4],
              rotate: [-2, 2, -2]
            }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-6 right-6 p-2 rounded-xl bg-charcoal-900/90 border border-lime-accent/60 shadow-xl backdrop-blur-md flex items-center gap-2"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-900/80 border border-lime-dim flex items-center justify-center">
              <Plane className="w-4 h-4 text-lime-accent -rotate-45" />
            </div>
            <div className="text-[10px] font-mono leading-tight">
              <div className="text-lime-accent font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-lime-accent animate-ping" />
                <span>UAV SCANNING</span>
              </div>
              <div className="text-sand-300">Alt: 35m · Overlap 80%</div>
            </div>
          </motion.div>

          {/* Floating Analytics Chip 1 */}
          <motion.div 
            animate={{ y: [4, -4, 4] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-5 left-5 p-2.5 rounded-xl bg-charcoal-900/95 border border-emerald-500/50 shadow-2xl backdrop-blur-md text-[11px] font-mono"
          >
            <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <Box className="w-3.5 h-3.5" />
              <span>HEAP VOLUMETRIC MESH</span>
            </div>
            <div className="text-white font-bold text-xs mt-0.5">
              14.82 m³ <span className="text-[10px] text-amber-300 font-normal">| ~8.60 Metric Tons</span>
            </div>
          </motion.div>

          {/* Floating Analytics Chip 2 */}
          <div className="absolute top-5 left-5 px-3 py-1 rounded-md bg-teal-950/80 border border-teal-500/40 text-[10px] font-mono text-cyan-200">
            PARCEL OD-742 · 1.48 HA
          </div>
        </div>

        {/* Editorial Headline & Description */}
        <div className="mt-8 text-left max-w-xl">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-900/60 border border-emerald-500/40 text-[10px] font-mono uppercase tracking-widest text-lime-accent mb-3"
          >
            <Sparkles className="w-3 h-3 text-yellow-400" />
            <span>UNIFIED AGRICULTURAL INTELLIGENCE</span>
          </motion.div>

          <motion.h2 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="font-display font-extrabold text-2xl sm:text-3xl lg:text-4xl text-white tracking-tight leading-tight"
          >
            Intelligence That Grows With{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-accent via-emerald-300 to-yellow-300">
              Every Field.
            </span>
          </motion.h2>

          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-xs sm:text-sm text-sand-200/90 font-normal leading-relaxed mt-2"
          >
            Connect agricultural field intelligence, UAV assessments and yield insights through one unified platform.
          </motion.p>
        </div>

        {/* Three Feature Highlights with Color Badges */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 max-w-xl"
        >
          <div className="p-3 rounded-xl bg-forest-950/60 border border-teal-800/80 flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-teal-900/80 border border-teal-500/50 flex items-center justify-center shrink-0">
              <Layers className="w-3.5 h-3.5 text-teal-300" />
            </div>
            <div>
              <div className="text-xs font-semibold text-white">Geospatial Field</div>
              <div className="text-[10px] text-teal-200/70">Satellite registration</div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-forest-950/60 border border-emerald-800/80 flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-900/80 border border-emerald-500/50 flex items-center justify-center shrink-0">
              <Plane className="w-3.5 h-3.5 text-emerald-300" />
            </div>
            <div>
              <div className="text-xs font-semibold text-white">UAV Assessment</div>
              <div className="text-[10px] text-emerald-200/70">Photogrammetric heap</div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-forest-950/60 border border-yellow-800/80 flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-amber-900/80 border border-amber-500/50 flex items-center justify-center shrink-0">
              <Wheat className="w-3.5 h-3.5 text-amber-300" />
            </div>
            <div>
              <div className="text-xs font-semibold text-white">Yield Analytics</div>
              <div className="text-[10px] text-amber-200/70">Calibrated grain mass</div>
            </div>
          </div>
        </motion.div>

      </div>

      {/* Bottom Footer Note */}
      <div className="relative z-10 pt-4 border-t border-teal-900/60 flex items-center justify-between text-[11px] font-mono text-teal-300/80">
        <span>Digital Agriculture Framework</span>
        <span>© 2026 AgriSentinel</span>
      </div>

    </div>
  );
};
