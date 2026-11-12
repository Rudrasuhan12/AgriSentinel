import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
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
  // Coordinates and dynamic telemetry
  const [coordinates, setCoordinates] = useState({ lat: '20.2961', lng: '85.8245', alt: 42.5 });

  // Mouse Parallax Motion Values
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 120 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  const cardRotateX = useTransform(smoothMouseY, [-300, 300], [5, -5]);
  const cardRotateY = useTransform(smoothMouseX, [-300, 300], [-5, 5]);
  const floatingPanelX = useTransform(smoothMouseX, [-300, 300], [-8, 8]);
  const floatingPanelY = useTransform(smoothMouseY, [-300, 300], [-8, 8]);

  // Subtle coordinate jitter simulating live RTK telemetry
  useEffect(() => {
    const interval = setInterval(() => {
      setCoordinates({
        lat: (20.2961 + (Math.random() - 0.5) * 0.0003).toFixed(4),
        lng: (85.8245 + (Math.random() - 0.5) * 0.0003).toFixed(4),
        alt: Number((42.5 + (Math.random() - 0.5) * 0.6).toFixed(1)),
      });
    }, 2400);
    return () => clearInterval(interval);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  // Headline words for staggered cinematic text reveal
  const headlineWords = [
    { text: 'From', highlight: false },
    { text: 'Aerial', highlight: false },
    { text: 'Intelligence', highlight: false },
    { text: 'to', highlight: false },
    { text: 'Harvest', highlight: true },
    { text: 'Insights.', highlight: true },
  ];

  return (
    <section 
      id="hero" 
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative min-h-screen pt-28 pb-20 flex items-center justify-center overflow-hidden bg-charcoal-950 perspective-1000"
    >
      {/* Background Geospatial Grid & Atmospheric Glow */}
      <div className="absolute inset-0 bg-geo-grid opacity-20 pointer-events-none" />
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[550px] bg-gradient-radial from-forest-700/25 via-forest-900/10 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-lime-dim blur-[120px] pointer-events-none" />

      {/* Slow Moving Satellite Beam Sweep in Background */}
      <motion.div 
        animate={{ 
          opacity: [0.15, 0.35, 0.15],
          x: ['-20%', '120%']
        }}
        transition={{ 
          duration: 12, 
          repeat: Infinity, 
          ease: "linear" 
        }}
        className="absolute top-0 bottom-0 w-48 bg-gradient-to-r from-transparent via-lime-accent/10 to-transparent skew-x-12 pointer-events-none"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Editorial Headline & Messaging */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            
            {/* Eyebrow Pill with Live Telemetry Pulse */}
            <motion.div 
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-forest-900/80 border border-lime-dim/60 mb-6 backdrop-blur-md shadow-sm"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-lime-accent opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-lime-accent" />
              </span>
              <span className="text-[11px] font-mono uppercase tracking-widest text-lime-accent font-semibold">
                PRECISION AGRICULTURE · UAV INTELLIGENCE
              </span>
            </motion.div>

            {/* Cinematic Word-by-Word Headline Reveal */}
            <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl tracking-tight text-sand-50 leading-[1.08] mb-6 flex flex-wrap gap-x-3 gap-y-1">
              {headlineWords.map((word, i) => (
                <span key={word.text} className="inline-block overflow-hidden py-0.5">
                  <motion.span
                    initial={{ y: '100%', opacity: 0 }}
                    animate={{ y: '0%', opacity: 1 }}
                    transition={{
                      delay: 0.15 + i * 0.08,
                      duration: 0.7,
                      ease: [0.16, 1, 0.3, 1]
                    }}
                    className={`inline-block ${
                      word.highlight
                        ? 'text-transparent bg-clip-text bg-gradient-to-r from-lime-accent via-emerald-400 to-lime-accent'
                        : 'text-sand-50'
                    }`}
                  >
                    {word.text}
                  </motion.span>
                </span>
              ))}
            </h1>

            {/* Supporting Paragraph with Staggered Entrance */}
            <motion.p 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65, duration: 0.7 }}
              className="text-base sm:text-lg text-sand-300/90 max-w-2xl font-normal leading-relaxed mb-8"
            >
              An intelligent agricultural assessment platform combining UAV imagery, geospatial mapping, and 3D photogrammetry to understand harvested fields and estimate paddy yield.
            </motion.p>

            {/* Action Buttons with Micro-Interactions */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="flex flex-wrap items-center gap-4 w-full sm:w-auto"
            >
              <button
                onClick={onExploreClick}
                className="relative group overflow-hidden w-full sm:w-auto px-6 py-3.5 rounded-lg bg-lime-accent hover:bg-lime-glow text-charcoal-950 font-semibold font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-subtle-glow hover:shadow-lg transition-all duration-300 active:scale-98"
              >
                <span>Explore the Platform</span>
                <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              </button>

              <a
                href="#technology"
                className="w-full sm:w-auto px-6 py-3.5 rounded-lg bg-forest-900/80 hover:bg-forest-850 text-sand-100 font-medium font-mono text-xs uppercase tracking-wider border border-forest-700/80 hover:border-lime-dim flex items-center justify-center gap-2 transition-all duration-300 backdrop-blur-sm group"
              >
                <Layers className="w-4 h-4 text-olive-300 group-hover:text-lime-accent transition-colors" />
                <span>Discover Our Technology</span>
              </a>
            </motion.div>

            {/* Micro Telemetry Bar with Animated Numbers */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.95, duration: 0.8 }}
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
          </div>

          {/* Right Column: Interactive Geospatial Field Visualization with Parallax & Vector Drawing */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.35, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            style={{
              rotateX: cardRotateX,
              rotateY: cardRotateY,
              transformStyle: 'preserve-3d',
            }}
            className="lg:col-span-5 relative"
          >
            {/* Visual Frame */}
            <div className="relative rounded-2xl overflow-hidden border border-forest-700/80 bg-forest-950/70 shadow-elevated group transition-all duration-500">
              
              {/* Drone Aerial Canvas with Cinematic Slow Zoom */}
              <div className="relative w-full aspect-[4/3] bg-charcoal-900 overflow-hidden">
                <motion.img 
                  src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1200&auto=format&fit=crop" 
                  alt="Aerial drone perspective of agricultural paddy field plots" 
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
                  className="w-full h-full object-cover object-center filter saturate-[0.85] contrast-[1.1] opacity-75"
                />

                {/* Vignettes */}
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950 via-charcoal-950/40 to-transparent" />
                <div className="absolute inset-0 bg-forest-950/30 mix-blend-multiply" />

                {/* Animated Photogrammetry Laser Scanline */}
                <div className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-lime-accent to-transparent animate-scanline pointer-events-none" />

                {/* SVG Geospatial Polygon with Sequential Path Drawing & Pulsing Nodes */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 400 300">
                  {/* Geospatial Grid Crosshairs */}
                  <line x1="100" y1="0" x2="100" y2="300" stroke="rgba(255,255,255,0.06)" strokeDasharray="3,3" />
                  <line x1="200" y1="0" x2="200" y2="300" stroke="rgba(255,255,255,0.06)" strokeDasharray="3,3" />
                  <line x1="300" y1="0" x2="300" y2="300" stroke="rgba(255,255,255,0.06)" strokeDasharray="3,3" />
                  <line x1="0" y1="100" x2="400" y2="100" stroke="rgba(255,255,255,0.06)" strokeDasharray="3,3" />
                  <line x1="0" y1="200" x2="400" y2="200" stroke="rgba(255,255,255,0.06)" strokeDasharray="3,3" />

                  {/* Parcel Polygon with Self-Drawing Motion Path */}
                  <motion.path
                    d="M 60 60 L 190 45 L 220 160 L 80 180 Z"
                    fill="rgba(184, 238, 59, 0.14)"
                    stroke="#b8ee3b"
                    strokeWidth="1.8"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 2.2, ease: "easeInOut" }}
                  />

                  {/* Corner Vertex Nodes with Sequential Glowing Ripples */}
                  {[
                    { cx: 60, cy: 60, delay: 0.2 },
                    { cx: 190, cy: 45, delay: 0.7 },
                    { cx: 220, cy: 160, delay: 1.2 },
                    { cx: 80, cy: 180, delay: 1.7 },
                  ].map((pt, i) => (
                    <g key={i}>
                      {/* Inner solid node */}
                      <circle cx={pt.cx} cy={pt.cy} r="3.5" fill="#b8ee3b" />
                      {/* Pulsing outer aura */}
                      <motion.circle
                        cx={pt.cx}
                        cy={pt.cy}
                        r="3.5"
                        stroke="#b8ee3b"
                        strokeWidth="1.2"
                        fill="none"
                        animate={{ r: [3.5, 9, 3.5], opacity: [0.9, 0, 0.9] }}
                        transition={{ duration: 2.4, delay: pt.delay, repeat: Infinity, ease: "easeOut" }}
                      />
                    </g>
                  ))}

                  {/* 3D Heap Reconstructed Bounding Geometry with Animated Concentric Rings */}
                  <g>
                    <ellipse cx="290" cy="210" rx="42" ry="26" fill="rgba(52, 211, 153, 0.22)" stroke="#34d399" strokeWidth="1.5" />
                    <motion.ellipse 
                      cx="290" 
                      cy="204" 
                      rx="22" 
                      ry="14" 
                      fill="none" 
                      stroke="#34d399" 
                      strokeWidth="1.2" 
                      strokeDasharray="3,2" 
                      animate={{ strokeDashoffset: [0, 20] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    />
                    <circle cx="290" cy="198" r="3.5" fill="#34d399" />
                  </g>
                </svg>

                {/* Floating Geospatial Telemetry Panel 1 with Mouse Parallax Offset */}
                <motion.div 
                  style={{ x: floatingPanelX, y: floatingPanelY }}
                  animate={{ y: [-3, 3, -3] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute top-4 left-4 glass-panel px-3 py-1.5 rounded-md border border-lime-dim/80 text-[10px] font-mono shadow-xl backdrop-blur-md"
                >
                  <div className="flex items-center gap-1.5 text-lime-accent">
                    <span className="w-1.5 h-1.5 rounded-full bg-lime-accent animate-ping" />
                    <span>PARCEL OD-742 [ACTIVE]</span>
                  </div>
                  <div className="text-sand-300 text-[9px] mt-0.5">Area: 1.48 Hectares · 98.4% Confidence</div>
                </motion.div>

                {/* Floating Telemetry Panel 2 */}
                <motion.div 
                  style={{ x: floatingPanelX, y: floatingPanelY }}
                  animate={{ y: [3, -3, 3] }}
                  transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute bottom-4 right-4 glass-panel px-3 py-2 rounded-md border border-emerald-500/40 text-[10px] font-mono shadow-xl backdrop-blur-md"
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

                {/* Live Flight Altitude HUD */}
                <div className="absolute top-4 right-4 glass-panel-subtle px-2.5 py-1 rounded text-[9px] font-mono text-sand-300 flex items-center gap-2">
                  <Activity className="w-3 h-3 text-lime-accent animate-pulse" />
                  <span>UAV ALT: <strong className="text-sand-100">{coordinates.alt}m</strong></span>
                </div>
              </div>

              {/* Bottom Telemetry Status Strip with Live Coordinate Interpolation */}
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
                  <span>SfM PIPELINE ACTIVE</span>
                </div>
              </div>

            </div>

            {/* Corner Decorative Accents */}
            <div className="absolute -bottom-4 -left-4 w-24 h-24 border-b-2 border-l-2 border-forest-700/60 rounded-bl-xl pointer-events-none" />
            <div className="absolute -top-4 -right-4 w-24 h-24 border-t-2 border-r-2 border-lime-accent/20 rounded-tr-xl pointer-events-none" />
          </motion.div>

        </div>
      </div>
    </section>
  );
};
