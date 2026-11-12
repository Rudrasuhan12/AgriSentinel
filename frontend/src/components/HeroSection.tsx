import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Compass, 
  Layers, 
  ScanLine, 
  ChevronRight, 
  Box,
  Activity
} from 'lucide-react';

interface HeroSectionProps {
  onExploreClick?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onExploreClick }) => {
  const [coordinates, setCoordinates] = useState({ lat: 20.2961, lng: 85.8245, alt: 42.5 });

  // Subtle coordinate jitter effect simulating live GPS telemetry
  useEffect(() => {
    const interval = setInterval(() => {
      setCoordinates(prev => ({
        lat: Number((prev.lat + (Math.random() - 0.5) * 0.0002).toFixed(5)),
        lng: Number((prev.lng + (Math.random() - 0.5) * 0.0002).toFixed(5)),
        alt: Number((42.5 + (Math.random() - 0.5) * 0.4).toFixed(1)),
      }));
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="hero" className="relative min-h-screen pt-28 pb-20 flex items-center justify-center overflow-hidden bg-charcoal-950">
      {/* Background Geospatial Grid & Atmospheric Glow */}
      <div className="absolute inset-0 bg-geo-grid opacity-25 pointer-events-none" />
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[550px] bg-gradient-radial from-forest-700/25 via-forest-900/10 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-lime-dim blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Editorial Headline & Messaging */}
          <motion.div 
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7 flex flex-col items-start text-left"
          >
            {/* Eyebrow Pill */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-forest-900/80 border border-lime-dim/60 mb-6 backdrop-blur-md shadow-sm"
            >
              <span className="w-2 h-2 rounded-full bg-lime-accent animate-ping" />
              <span className="w-2 h-2 rounded-full bg-lime-accent -ml-4" />
              <span className="text-[11px] font-mono uppercase tracking-widest text-lime-accent font-semibold">
                PRECISION AGRICULTURE · UAV INTELLIGENCE
              </span>
            </motion.div>

            {/* Main Editorial Headline */}
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.7 }}
              className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl tracking-tight text-sand-50 leading-[1.08] mb-6"
            >
              From Aerial Intelligence to{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-accent via-emerald-400 to-lime-accent">
                Harvest Insights.
              </span>
            </motion.h1>

            {/* Supporting Paragraph */}
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.7 }}
              className="text-base sm:text-lg text-sand-300/90 max-w-2xl font-normal leading-relaxed mb-8"
            >
              An intelligent agricultural assessment platform combining UAV imagery, geospatial mapping, and 3D photogrammetry to understand harvested fields and estimate paddy yield.
            </motion.p>

            {/* Action Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.7 }}
              className="flex flex-wrap items-center gap-4 w-full sm:w-auto"
            >
              <button
                onClick={onExploreClick}
                className="w-full sm:w-auto px-6 py-3.5 rounded-lg bg-lime-accent hover:bg-lime-glow text-charcoal-950 font-semibold font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-subtle-glow hover:shadow-lg transition-all"
              >
                <span>Explore the Platform</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              <a
                href="#technology"
                className="w-full sm:w-auto px-6 py-3.5 rounded-lg bg-forest-900/80 hover:bg-forest-850 text-sand-100 font-medium font-mono text-xs uppercase tracking-wider border border-forest-700/80 hover:border-lime-dim flex items-center justify-center gap-2 transition-all backdrop-blur-sm"
              >
                <Layers className="w-4 h-4 text-olive-300" />
                <span>Discover Our Technology</span>
              </a>
            </motion.div>

            {/* Micro Metadata Strip */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="mt-10 pt-6 border-t border-forest-800/60 grid grid-cols-3 gap-4 w-full max-w-lg"
            >
              <div>
                <div className="text-[10px] font-mono text-olive-400 uppercase tracking-wider">Modality</div>
                <div className="text-xs font-mono font-medium text-sand-200 mt-0.5">UAV Nadir & Oblique</div>
              </div>
              <div>
                <div className="text-[10px] font-mono text-olive-400 uppercase tracking-wider">Calibration</div>
                <div className="text-xs font-mono font-medium text-sand-200 mt-0.5">Empirical Bulk Density</div>
              </div>
              <div>
                <div className="text-[10px] font-mono text-olive-400 uppercase tracking-wider">Target Grain</div>
                <div className="text-xs font-mono font-medium text-lime-accent mt-0.5">Paddy (Oryza sativa)</div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Column: Interactive Geospatial Field Visualization */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.25, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 relative"
          >
            {/* Visual Glassmorphic Frame */}
            <div className="relative rounded-2xl overflow-hidden border border-forest-700/80 bg-forest-950/70 shadow-elevated group">
              
              {/* Synthetic Drone Aerial Canvas / Satellite Imagery Layer */}
              <div className="relative w-full aspect-[4/3] bg-charcoal-900 overflow-hidden">
                {/* Aerial Paddy Field Photographic Representation with SVG Overlay */}
                <img 
                  src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1200&auto=format&fit=crop" 
                  alt="Aerial drone perspective of agricultural paddy field plots" 
                  className="w-full h-full object-cover object-center filter saturate-[0.85] contrast-[1.1] opacity-75 group-hover:scale-105 transition-transform duration-1000 ease-out"
                />

                {/* Dark Vignette and Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950 via-charcoal-950/40 to-transparent" />
                <div className="absolute inset-0 bg-forest-950/30 mix-blend-multiply" />

                {/* Animated Photogrammetry Scanline */}
                <div className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-lime-accent to-transparent animate-scanline pointer-events-none" />

                {/* SVG Geospatial Polygon & Grid Overlays */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 400 300">
                  {/* Grid Lines */}
                  <line x1="100" y1="0" x2="100" y2="300" stroke="rgba(255,255,255,0.06)" strokeDasharray="3,3" />
                  <line x1="200" y1="0" x2="200" y2="300" stroke="rgba(255,255,255,0.06)" strokeDasharray="3,3" />
                  <line x1="300" y1="0" x2="300" y2="300" stroke="rgba(255,255,255,0.06)" strokeDasharray="3,3" />
                  <line x1="0" y1="100" x2="400" y2="100" stroke="rgba(255,255,255,0.06)" strokeDasharray="3,3" />
                  <line x1="0" y1="200" x2="400" y2="200" stroke="rgba(255,255,255,0.06)" strokeDasharray="3,3" />

                  {/* Parcel Polygon A with Animated Stroke */}
                  <polygon
                    points="60,60 190,45 220,160 80,180"
                    fill="rgba(184, 238, 59, 0.12)"
                    stroke="#b8ee3b"
                    strokeWidth="1.5"
                    strokeDasharray="4,2"
                  />
                  
                  {/* Corner vertex nodes */}
                  <circle cx="60" cy="60" r="3" fill="#b8ee3b" />
                  <circle cx="190" cy="45" r="3" fill="#b8ee3b" />
                  <circle cx="220" cy="160" r="3" fill="#b8ee3b" />
                  <circle cx="80" cy="180" r="3" fill="#b8ee3b" />

                  {/* 3D Heap Reconstructed Bounding Geometry */}
                  <ellipse cx="290" cy="210" rx="42" ry="26" fill="rgba(52, 211, 153, 0.2)" stroke="#34d399" strokeWidth="1.5" />
                  <ellipse cx="290" cy="204" rx="22" ry="14" fill="none" stroke="#34d399" strokeWidth="1" strokeDasharray="2,2" />
                  <circle cx="290" cy="198" r="3" fill="#34d399" />
                </svg>

                {/* Floating Geospatial Telemetry Badge 1: Parcel Demarcation */}
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                  className="absolute top-4 left-4 glass-panel px-3 py-1.5 rounded-md border border-lime-dim/80 text-[10px] font-mono shadow-lg"
                >
                  <div className="flex items-center gap-1.5 text-lime-accent">
                    <span className="w-1.5 h-1.5 rounded-full bg-lime-accent animate-ping" />
                    <span>PARCEL OD-742 [ACTIVE]</span>
                  </div>
                  <div className="text-sand-300 text-[9px] mt-0.5">Area: 1.48 Hectares · 98.4% Confidence</div>
                </motion.div>

                {/* Floating Telemetry Badge 2: Heap Volume & Dense Point Cloud */}
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.75, duration: 0.5 }}
                  className="absolute bottom-4 right-4 glass-panel px-3 py-2 rounded-md border border-emerald-500/40 text-[10px] font-mono shadow-lg"
                >
                  <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                    <Box className="w-3.5 h-3.5" />
                    <span>HEAP 01 · VOLUMETRIC MESH</span>
                  </div>
                  <div className="text-sand-200 text-[10px] font-bold mt-1">
                    Vol: <span className="text-lime-accent">14.82 m³</span> | Density: <span className="text-sand-100">580 kg/m³</span>
                  </div>
                  <div className="text-olive-400 text-[9px]">Est. Mass: ~8,595 kg</div>
                </motion.div>

                {/* Live Flight HUD Bar */}
                <div className="absolute top-4 right-4 glass-panel-subtle px-2.5 py-1 rounded text-[9px] font-mono text-sand-300 flex items-center gap-2">
                  <Activity className="w-3 h-3 text-lime-accent animate-pulse" />
                  <span>UAV ALT: {coordinates.alt}m</span>
                </div>
              </div>

              {/* Bottom Telemetry Status Strip */}
              <div className="bg-charcoal-900/90 border-t border-forest-800 p-3.5 flex items-center justify-between font-mono text-[11px] text-sand-300">
                <div className="flex items-center gap-2">
                  <Compass className="w-3.5 h-3.5 text-olive-400" />
                  <span className="text-sand-400">LAT:</span>
                  <span className="text-sand-100 font-semibold">{coordinates.lat}° N</span>
                  <span className="text-sand-400 ml-1">LNG:</span>
                  <span className="text-sand-100 font-semibold">{coordinates.lng}° E</span>
                </div>
                <div className="flex items-center gap-1.5 text-lime-accent text-[10px] bg-forest-900/90 px-2 py-0.5 rounded border border-forest-700">
                  <ScanLine className="w-3 h-3" />
                  <span>SfM PIPELINE READY</span>
                </div>
              </div>

            </div>

            {/* Subtle decorative accent corner */}
            <div className="absolute -bottom-4 -left-4 w-24 h-24 border-b-2 border-l-2 border-forest-700/60 rounded-bl-xl pointer-events-none" />
            <div className="absolute -top-4 -right-4 w-24 h-24 border-t-2 border-r-2 border-lime-accent/20 rounded-tr-xl pointer-events-none" />
          </motion.div>

        </div>
      </div>
    </section>
  );
};
