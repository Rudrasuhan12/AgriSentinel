import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Compass, 
  Layers, 
  Sprout 
} from 'lucide-react';

export const AuthUavShowcase: React.FC = () => {
  // Live dynamic telemetry simulation
  const [alt, setAlt] = useState(35.2);
  const [metricDelta, setMetricDelta] = useState(-1.4);

  useEffect(() => {
    const interval = setInterval(() => {
      setAlt(Number((35.0 + Math.random() * 0.6).toFixed(1)));
      setMetricDelta(Number((-1.4 + (Math.random() - 0.5) * 0.2).toFixed(1)));
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col justify-center max-w-lg lg:max-w-xl w-full">
      
      {/* Aerial UAV Imagery Card with Live Animated Geospatial HUD */}
      <div className="relative w-full rounded-2xl overflow-hidden border border-gray-200/90 shadow-lg aspect-[16/10] max-h-[190px] sm:max-h-[220px] lg:max-h-[240px] bg-slate-900 group">
        
        {/* Drone Aerial Imagery with Slow Cinematic Zoom */}
        <motion.img 
          src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1200&auto=format&fit=crop" 
          alt="Agricultural field surveyed by UAV" 
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
          className="w-full h-full object-cover object-center filter saturate-[0.95] contrast-[1.05]"
        />
        
        {/* Atmospheric Vignette Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/35 pointer-events-none" />

        {/* Animated Photogrammetry Laser Scanline Sweeping Up & Down */}
        <motion.div 
          animate={{ 
            top: ['0%', '98%', '0%'],
            opacity: [0.6, 0.95, 0.6]
          }}
          transition={{ 
            duration: 4.5, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
          className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#38ef7d] to-transparent shadow-[0_0_12px_#38ef7d] pointer-events-none z-10"
        />

        {/* Top-Left Telemetry Tag */}
        <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-md bg-black/75 backdrop-blur-md border border-white/15 text-white font-mono text-[9px] sm:text-[10px] tracking-wider uppercase z-20 shadow-sm">
          PIXEL: 06-747 • T-4K IR
        </div>

        {/* Top-Right UAV Flight Telemetry Box with Live Pulsing Indicator */}
        <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md border border-lime-400/35 text-white font-mono text-[9px] sm:text-[10px] flex items-center gap-2 z-20 shadow-sm">
          <div className="w-5 h-5 rounded bg-[#008C45] flex items-center justify-center text-white relative">
            <Compass className="w-3 h-3 text-lime-200" />
            <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-lime-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-lime-400" />
            </span>
          </div>
          <div className="leading-tight">
            <div className="text-lime-400 font-bold uppercase text-[8px] sm:text-[9px] flex items-center gap-1.5">
              <span>UAV SCANNING</span>
            </div>
            <div className="text-slate-200 text-[8px] sm:text-[9px]">
              Alt: {alt}m • Overlap: 80%
            </div>
          </div>
        </div>

        {/* Interactive SVG Geospatial Overlay with Live Animations */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-15" viewBox="0 0 400 250">
          
          {/* Animated Geodesic Survey Polygon */}
          <motion.polygon
            points="65,65 315,55 350,195 85,205"
            fill="rgba(0, 140, 69, 0.15)"
            stroke="#38ef7d"
            strokeWidth="2"
            strokeDasharray="6,3"
            animate={{ 
              strokeDashoffset: [0, -36],
              fillOpacity: [0.12, 0.22, 0.12]
            }}
            transition={{ 
              strokeDashoffset: { duration: 3, repeat: Infinity, ease: "linear" },
              fillOpacity: { duration: 3, repeat: Infinity, ease: "easeInOut" }
            }}
          />

          {/* 4 Corner Vertices with Pulsing Radar Ping Ripples */}
          {[
            { cx: 65, cy: 65 },
            { cx: 315, cy: 55 },
            { cx: 350, cy: 195 },
            { cx: 85, cy: 205 },
          ].map((vertex, i) => (
            <g key={i}>
              {/* Expanding Radar Ripple Ring */}
              <motion.circle
                cx={vertex.cx}
                cy={vertex.cy}
                r="4.5"
                fill="none"
                stroke="#facc15"
                strokeWidth="1.5"
                animate={{
                  r: [4.5, 14, 4.5],
                  opacity: [0.9, 0, 0.9],
                  strokeWidth: [2, 0.5, 2]
                }}
                transition={{
                  duration: 2.4,
                  repeat: Infinity,
                  ease: "easeOut",
                  delay: i * 0.4
                }}
              />
              {/* Solid Vertex Center Dot */}
              <circle 
                cx={vertex.cx} 
                cy={vertex.cy} 
                r="4.5" 
                fill="#facc15" 
                stroke="#ffffff" 
                strokeWidth="1.5" 
              />
            </g>
          ))}

          {/* Central Targeting Reticle with Expanding Pulse & Rotating Radar Beam */}
          <g transform="translate(205, 135)">
            <motion.circle
              cx="0"
              cy="0"
              r="28"
              stroke="#f59e0b"
              strokeWidth="1.5"
              fill="none"
              animate={{
                scale: [0.9, 1.15, 0.9],
                opacity: [0.45, 0.85, 0.45]
              }}
              transition={{
                duration: 2.8,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <motion.circle
              cx="0"
              cy="0"
              r="16"
              stroke="#f59e0b"
              strokeWidth="1"
              strokeDasharray="3,3"
              fill="none"
              animate={{
                rotate: [0, 360]
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "linear"
              }}
            />
            <circle cx="0" cy="0" r="3.5" fill="#f59e0b" />
          </g>

        </svg>

        {/* Bottom-Left Metric Badge */}
        <div className="absolute bottom-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md border border-emerald-500/35 text-emerald-400 font-mono text-[9px] sm:text-[10px] flex items-center gap-2 z-20 shadow-sm">
          <Layers className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
          <div>
            <div className="text-[8px] sm:text-[9px] text-slate-300 uppercase tracking-wider font-semibold">
              NDVI / VOLUME / MESH
            </div>
            <div className="text-lime-300 font-bold">
              14.82 ha | {metricDelta > 0 ? `+${metricDelta}` : metricDelta}% Metric Tons
            </div>
          </div>
        </div>

      </div>

      {/* Eyebrow Badge */}
      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#ecfdf5] border border-[#a7f3d0] text-[#008C45] text-[10px] font-mono font-bold uppercase tracking-wider mt-3 mb-1.5 w-fit">
        <Sprout className="w-3 h-3 text-[#008C45]" />
        <span>UNIFIED AGRICULTURAL INTELLIGENCE</span>
      </div>

      {/* Editorial Heading */}
      <h1 className="text-2xl sm:text-[26px] lg:text-[28px] font-display font-extrabold text-[#0f172a] leading-tight tracking-tight">
        Intelligence That Grows With <br className="hidden sm:inline" />
        <span className="text-[#008C45]">Every Field.</span>
      </h1>

      {/* Platform Description */}
      <p className="text-xs sm:text-[13px] text-[#475569] leading-relaxed mt-1 max-w-lg">
        Connect agricultural field intelligence, UAV assessments and yield insights through one unified platform.
      </p>

      {/* Horizontal Feature Highlights Strip */}
      <div className="flex items-center flex-wrap gap-y-1.5 mt-3 pt-2.5 border-t border-gray-100 text-xs text-[#334155] font-medium">
        <div className="flex items-center gap-1.5 pr-3.5 border-r border-gray-200">
          <Compass className="w-3.5 h-3.5 text-[#008C45]" />
          <span>UAV Analytics</span>
        </div>
        <div className="flex items-center gap-1.5 px-3.5 border-r border-gray-200">
          <Layers className="w-3.5 h-3.5 text-[#008C45]" />
          <span>Geospatial Insights</span>
        </div>
        <div className="flex items-center gap-1.5 pl-3.5">
          <Sprout className="w-3.5 h-3.5 text-[#008C45]" />
          <span>Yield Intelligence</span>
        </div>
      </div>

    </div>
  );
};
