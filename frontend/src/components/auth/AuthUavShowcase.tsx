import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Compass,
  ShieldCheck,
  CheckCircle2,
  Plane
} from 'lucide-react';

export const AuthUavShowcase: React.FC = () => {
  // Live dynamic telemetry simulation
  const [alt, setAlt] = useState(35.2);

  useEffect(() => {
    const interval = setInterval(() => {
      setAlt(Number((35.0 + Math.random() * 0.6).toFixed(1)));
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col justify-center max-w-lg lg:max-w-xl w-full">
      
      {/* Aerial UAV Imagery Card with Live Animated Geospatial HUD */}
      <div className="relative w-full rounded-2xl overflow-hidden border border-gray-200/90 shadow-lg hover:shadow-xl transition-all duration-300 aspect-[16/9.5] max-h-[195px] sm:max-h-[215px] lg:max-h-[230px] bg-slate-900 group cursor-default">
        
        {/* Drone Aerial Imagery with Slow Cinematic Zoom */}
        <motion.img 
          src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1200&auto=format&fit=crop" 
          alt="Agricultural field surveyed by UAV" 
          animate={{ scale: [1, 1.04, 1] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
          className="w-full h-full object-cover object-center filter saturate-[0.95] contrast-[1.05] group-hover:scale-105 transition-transform duration-700"
        />
        
        {/* Atmospheric Vignette Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/40 pointer-events-none" />

        {/* Animated Photogrammetry Laser Scanline Sweeping Up & Down */}
        <motion.div 
          animate={{ 
            top: ['0%', '98%', '0%'],
            opacity: [0.6, 0.95, 0.6]
          }}
          transition={{ 
            duration: 4.2, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
          className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#00E676] to-transparent shadow-[0_0_12px_#00E676] pointer-events-none z-10"
        />

        {/* Top-Left Telemetry Tag with Authentic Parcel Identifier */}
        <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-md bg-black/80 backdrop-blur-md border border-white/15 text-white font-mono text-[9px] sm:text-[10px] tracking-wider uppercase z-20 shadow-sm space-y-0.5">
          <div className="flex items-center gap-1.5">
            <span className="text-gray-400">PARCEL:</span>
            <span className="text-emerald-400 font-bold">OD-CUT-640-2536</span>
          </div>
          <div className="text-[8px] text-gray-300">Bidyadharpur, Cuttack Sadar</div>
        </div>

        {/* Top-Right UAV Flight Telemetry Box with Live Pulsing Indicator */}
        <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md border border-emerald-400/40 text-white font-mono text-[9px] sm:text-[10px] flex items-center gap-2 z-20 shadow-sm">
          <div className="w-5 h-5 rounded bg-[#008C45] flex items-center justify-center text-white relative">
            <Compass className="w-3 h-3 text-emerald-200" />
            <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
            </span>
          </div>
          <div className="leading-tight text-right">
            <div className="text-emerald-400 font-bold uppercase text-[8px] sm:text-[9px] flex items-center gap-1.5 justify-end">
              <span>UAV SCANNING</span>
            </div>
            <div className="text-slate-200 text-[8px] sm:text-[9px]">
              Alt: {alt}m • RTK FIXED
            </div>
          </div>
        </div>

        {/* Interactive SVG Geospatial Overlay with Live Animations */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-15" viewBox="0 0 400 250">
          
          {/* Animated Geodesic Survey Polygon */}
          <motion.polygon
            points="65,65 315,55 350,195 85,205"
            fill="rgba(0, 140, 69, 0.18)"
            stroke="#00E676"
            strokeWidth="1.8"
            strokeDasharray="6,3"
            animate={{ 
              strokeDashoffset: [0, -36],
              fillOpacity: [0.14, 0.26, 0.14]
            }}
            transition={{ 
              strokeDashoffset: { duration: 3, repeat: Infinity, ease: "linear" },
              fillOpacity: { duration: 3, repeat: Infinity, ease: "easeInOut" }
            }}
          />

          {/* 4 Corner Vertices with Pulsing Radar Ping Ripples */}
          {[
            { cx: 65, cy: 65, label: 'V1' },
            { cx: 315, cy: 55, label: 'V2' },
            { cx: 350, cy: 195, label: 'V3' },
            { cx: 85, cy: 205, label: 'V4' },
          ].map((vertex, i) => (
            <g key={i}>
              {/* Expanding Radar Ripple Ring */}
              <circle
                cx={vertex.cx}
                cy={vertex.cy}
                r="4.5"
                fill="none"
                stroke="#00E676"
                strokeWidth="1.5"
              >
                <animate
                  attributeName="r"
                  values="4.5; 14; 4.5"
                  dur="2.4s"
                  begin={`${i * 0.4}s`}
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  values="0.9; 0; 0.9"
                  dur="2.4s"
                  begin={`${i * 0.4}s`}
                  repeatCount="indefinite"
                />
              </circle>
              {/* Solid Vertex Center Dot */}
              <circle 
                cx={vertex.cx} 
                cy={vertex.cy} 
                r="4" 
                fill="#FFFFFF" 
                stroke="#008C45" 
                strokeWidth="1.8" 
              />
            </g>
          ))}

          {/* Central Targeting Reticle with Expanding Pulse */}
          <g transform="translate(205, 135)">
            <motion.circle
              cx="0"
              cy="0"
              r="24"
              stroke="#00E676"
              strokeWidth="1.2"
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
            <circle cx="0" cy="0" r="3" fill="#FFFFFF" stroke="#008C45" strokeWidth="1.5" />
          </g>

        </svg>

        {/* Bottom Status Readout Strip */}
        <div className="absolute bottom-2.5 inset-x-2.5 px-2.5 py-1.5 rounded-lg bg-black/85 backdrop-blur-md border border-white/15 text-white font-mono text-[9px] sm:text-[10px] flex items-center justify-between z-20 shadow-sm">
          <div className="flex items-center gap-1.5 text-emerald-300">
            <Plane className="w-3.5 h-3.5" />
            <span>GRID SCAN: 1.84 ACRES</span>
          </div>
          <div className="text-gray-300 font-semibold">
            GSD: 1.18 cm/px • EPSG:4326
          </div>
        </div>

      </div>

      {/* Institutional Eyebrow Badge */}
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/90 text-[#008C45] text-[10px] font-mono font-bold uppercase tracking-wider mt-3.5 mb-2 w-fit shadow-2xs">
        <span className="w-2 h-2 rounded-full bg-[#008C45] animate-ping" />
        <span>DIGITAL PUBLIC INFRASTRUCTURE FOR AGRICULTURE</span>
      </div>

      {/* Editorial Headline with Institutional DPI Inspiration */}
      <h1 className="text-2xl sm:text-[28px] font-display font-extrabold text-[#0f2e1e] leading-tight tracking-tight">
        Precision Agriculture Through <br className="hidden sm:inline" />
        <span className="bg-gradient-to-r from-[#008C45] via-[#00A86B] to-[#047857] bg-clip-text text-transparent">
          UAV & Geospatial Intelligence
        </span>
      </h1>

      {/* Platform Supporting Description */}
      <p className="text-xs sm:text-[13px] text-[#475569] leading-relaxed mt-1.5 max-w-lg font-normal">
        A foundational Digital Public Infrastructure linking Bhulekh cadastral land records, autonomous UAV aerial photogrammetry, AI-powered multispectral crop analytics, and 3D volumetric grain yield estimation.
      </p>

      {/* Three Core Capability Highlights Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-4 pt-3 border-t border-gray-200 text-xs text-[#334155] font-medium">
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#008C45] shrink-0" />
          <span className="text-[11px]">Cadastral PostGIS</span>
        </div>
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#008C45] shrink-0" />
          <span className="text-[11px]">Autonomous UAV</span>
        </div>
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#008C45] shrink-0" />
          <span className="text-[11px]">3D Yield Tonnage</span>
        </div>
      </div>

      {/* Institutional Compliance Indicators */}
      <div className="mt-3 text-[10px] font-mono text-gray-500 flex items-center gap-2">
        <ShieldCheck className="w-3.5 h-3.5 text-[#008C45]" />
        <span>DILRMP • LGD Odisha • OGC WFS • 256-Bit SSL</span>
      </div>

    </div>
  );
};
