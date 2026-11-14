import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Compass, 
  ArrowRight, 
  Box, 
  ShieldCheck,
  Plane,
  CheckCircle2,
  Battery,
  Radio,
  Play,
  Pause,
  Crosshair,
  Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface HeroSectionProps {
  onExploreClick?: () => void;
}

type LayerMode = 'rgb' | 'ndvi' | 'cadastral' | 'lidar';

interface WaypointNode {
  id: string;
  name: string;
  x: number; // percentage in viewport
  y: number; // percentage in viewport
  lat: string;
  lng: string;
  distToNext: string;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onExploreClick }) => {
  // Selected layer mode
  const [activeLayer, setActiveLayer] = useState<LayerMode>('rgb');
  const [isSimulating, setIsSimulating] = useState<boolean>(true);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  // Live simulated telemetry jitter around Bidyadharpur, Cuttack Sadar parcel
  const [telemetry, setTelemetry] = useState({
    lat: '20.4536',
    lng: '85.9325',
    altitude: '35.2',
    speed: '8.4',
    heading: 142,
    battery: 94,
    satellites: 18,
    progress: 74,
    waypoint: 14,
    gsd: '1.18'
  });

  // Authentic parcel boundary corners for Bidyadharpur Plot 640/2536
  const parcelCorners: WaypointNode[] = [
    { id: 'v1', name: 'V1 (NW)', x: 22, y: 26, lat: '20.4538° N', lng: '85.9321° E', distToNext: '148.2m' },
    { id: 'v2', name: 'V2 (NE)', x: 82, y: 20, lat: '20.4541° N', lng: '85.9332° E', distToNext: '92.4m' },
    { id: 'v3', name: 'V3 (SE)', x: 88, y: 78, lat: '20.4529° N', lng: '85.9335° E', distToNext: '131.0m' },
    { id: 'v4', name: 'V4 (SW)', x: 18, y: 84, lat: '20.4526° N', lng: '85.9323° E', distToNext: '95.6m' }
  ];

  // Dynamic telemetry clock
  useEffect(() => {
    if (!isSimulating) return;

    const timer = setInterval(() => {
      setTelemetry(prev => {
        const nextAlt = +(35.2 + (Math.random() - 0.5) * 0.4).toFixed(1);
        const nextSpd = +(8.4 + (Math.random() - 0.5) * 0.3).toFixed(1);
        const nextHdg = (prev.heading + Math.floor((Math.random() - 0.5) * 6) + 360) % 360;
        const nextProg = prev.progress >= 99 ? 12 : prev.progress + 1;
        const nextWp = 1 + Math.floor((nextProg / 100) * 18);
        return {
          lat: (20.4536 + (Math.random() - 0.5) * 0.0003).toFixed(4),
          lng: (85.9325 + (Math.random() - 0.5) * 0.0003).toFixed(4),
          altitude: nextAlt.toString(),
          speed: nextSpd.toString(),
          heading: nextHdg,
          battery: prev.battery > 91 ? prev.battery : 94,
          satellites: 18 + (Math.random() > 0.8 ? 1 : 0),
          progress: nextProg,
          waypoint: nextWp,
          gsd: (1.18 + (Math.random() - 0.5) * 0.04).toFixed(2)
        };
      });
    }, 1800);

    return () => clearInterval(timer);
  }, [isSimulating]);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleExplore = () => {
    if (onExploreClick) {
      onExploreClick();
    } else {
      scrollToSection('core-pillars');
    }
  };

  return (
    <section 
      id="hero" 
      className="relative pt-36 pb-20 lg:pt-40 lg:pb-28 overflow-hidden bg-gradient-to-b from-[#F0FDF4]/70 via-[#F8FAFC] to-[#FFFFFF] border-b border-gray-200"
    >
      {/* Background Subtle Geospatial Grid */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage: `radial-gradient(#CBD5E1 1px, transparent 1px)`,
          backgroundSize: '24px 24px'
        }}
      />

      {/* Subtle Atmospheric Gradient Accents */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[850px] h-[360px] bg-gradient-to-r from-emerald-100/50 via-teal-50/30 to-emerald-100/40 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Editorial Headline & Messaging */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            
            {/* National Mission Eyebrow Badge */}
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-[11px] font-mono font-semibold uppercase tracking-wider text-[#008C45] mb-5 shadow-2xs"
            >
              <span className="w-2 h-2 rounded-full bg-[#008C45] animate-ping" />
              <span>DIGITAL PUBLIC INFRASTRUCTURE FOR AGRICULTURE</span>
            </motion.div>

            {/* Primary Headline Required Word-for-Word */}
            <motion.h1 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl lg:text-[52px] text-[#0f2e1e] tracking-tight leading-[1.12]"
            >
              Precision Agriculture Through{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#008C45] via-[#00A86B] to-[#047857]">
                UAV & Geospatial Intelligence
              </span>
            </motion.h1>

            {/* Supporting Description */}
            <motion.p 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-5 text-sm sm:text-base text-[#475569] max-w-2xl font-normal leading-relaxed"
            >
              A foundational Digital Public Infrastructure linking Bhulekh cadastral land records, autonomous UAV aerial photogrammetry, AI-powered multispectral crop analytics, and 3D volumetric grain yield estimation across agricultural revenue mouzas.
            </motion.p>

            {/* Core Capability Highlights Strip */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-6 flex flex-wrap items-center gap-y-2 gap-x-4 text-xs font-medium text-[#334155]"
            >
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#008C45]" />
                <span>Cadastral PostGIS Mapping</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#008C45]" />
                <span>Autonomous UAV Demarcation</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#008C45]" />
                <span>3D Volumetric Tonnage Calculation</span>
              </div>
            </motion.div>

            {/* Three Prominent Action CTA Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-8 flex flex-wrap items-center gap-3 w-full sm:w-auto"
            >
              {/* CTA 1: Explore Platform */}
              <button
                type="button"
                onClick={handleExplore}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#008C45] hover:bg-[#007338] text-white font-semibold text-xs tracking-wide uppercase flex items-center justify-center gap-2 shadow-sm hover:shadow-md transition-all cursor-pointer"
              >
                <span>Explore Platform</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* CTA 2: Launch Official Portal */}
              <Link
                to="/login"
                state={{ defaultRole: 'OFFICIAL' }}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white hover:bg-gray-50 text-[#0f2e1e] font-semibold text-xs tracking-wide uppercase border border-gray-300 hover:border-[#008C45] flex items-center justify-center gap-2 shadow-2xs transition-all"
              >
                <ShieldCheck className="w-4 h-4 text-[#008C45]" />
                <span>Launch Official Portal</span>
              </Link>

              {/* CTA 3: Explore 3D Reconstruction */}
              <button
                type="button"
                onClick={() => scrollToSection('heap-reconstruction')}
                className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#008C45] font-semibold text-xs tracking-wide uppercase border border-emerald-200 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Box className="w-4 h-4" />
                <span>Explore 3D Reconstruction</span>
              </button>
            </motion.div>

            {/* Institutional Compliance Indicators */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.5 }}
              className="mt-8 pt-6 border-t border-gray-200/80 flex items-center flex-wrap gap-4 text-[11px] font-mono text-gray-500"
            >
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-gray-700">Standards:</span>
                <span>DILRMP • LGD Odisha • OGC WFS • EPSG:4326</span>
              </div>
            </motion.div>
          </div>

          {/* Right Column: High-Precision UAV Telemetry & GIS Visual Card (Dynamic & Animated) */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="lg:col-span-5 relative"
          >
            {/* Main Interactive Showcase Card */}
            <div className="relative rounded-2xl border border-gray-200/90 bg-white p-4 sm:p-5 shadow-2xl shadow-slate-300/60 overflow-hidden">
              
              {/* Card Header with Live Telemetry Pulse & RTK Indicator */}
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-gray-800">
                    UAV TELEMETRY STREAM
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#E6F4EA] text-[#008C45] border border-[#B7E1CD] flex items-center gap-1">
                    <Radio className="w-3 h-3 text-[#008C45] animate-pulse" />
                    <span>RTK FIXED (±1.2cm)</span>
                  </span>

                  {/* Play/Pause Live Simulation */}
                  <button
                    type="button"
                    onClick={() => setIsSimulating(!isSimulating)}
                    title={isSimulating ? "Pause UAV Simulation" : "Resume UAV Simulation"}
                    className="p-1 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors"
                  >
                    {isSimulating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-[#008C45]" />}
                  </button>
                </div>
              </div>

              {/* Dynamic Interactive Layer Mode Switcher */}
              <div className="mt-3 flex items-center gap-1.5 p-1 bg-gray-100/90 rounded-xl border border-gray-200/60 text-[11px] font-mono overflow-x-auto scrollbar-none">
                <button
                  type="button"
                  onClick={() => setActiveLayer('rgb')}
                  className={`flex-1 min-w-[70px] py-1.5 px-2 rounded-lg text-center font-semibold transition-all ${
                    activeLayer === 'rgb' 
                      ? 'bg-white text-gray-900 shadow-xs border border-gray-200/80' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                  }`}
                >
                  🛰️ RGB
                </button>

                <button
                  type="button"
                  onClick={() => setActiveLayer('ndvi')}
                  className={`flex-1 min-w-[70px] py-1.5 px-2 rounded-lg text-center font-semibold transition-all ${
                    activeLayer === 'ndvi' 
                      ? 'bg-emerald-600 text-white shadow-xs font-bold' 
                      : 'text-gray-600 hover:text-emerald-700 hover:bg-white/50'
                  }`}
                >
                  🌿 NDVI
                </button>

                <button
                  type="button"
                  onClick={() => setActiveLayer('cadastral')}
                  className={`flex-1 min-w-[70px] py-1.5 px-2 rounded-lg text-center font-semibold transition-all ${
                    activeLayer === 'cadastral' 
                      ? 'bg-[#0f2e1e] text-emerald-300 shadow-xs font-bold' 
                      : 'text-gray-600 hover:text-[#0f2e1e] hover:bg-white/50'
                  }`}
                >
                  📐 Cadastral
                </button>

                <button
                  type="button"
                  onClick={() => setActiveLayer('lidar')}
                  className={`flex-1 min-w-[70px] py-1.5 px-2 rounded-lg text-center font-semibold transition-all ${
                    activeLayer === 'lidar' 
                      ? 'bg-cyan-700 text-white shadow-xs font-bold' 
                      : 'text-gray-600 hover:text-cyan-700 hover:bg-white/50'
                  }`}
                >
                  ⚡ LiDAR
                </button>
              </div>

              {/* Viewport: Live Satellite & UAV Simulation Screen */}
              <div className="relative mt-3 rounded-xl overflow-hidden border border-gray-300/80 h-72 sm:h-80 bg-slate-950 select-none">
                
                {/* Layer 1: Base High-Res Aerial Orthomosaic */}
                <img 
                  src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80" 
                  alt="Agricultural Field Satellite Survey" 
                  className={`w-full h-full object-cover transition-all duration-700 ${
                    activeLayer === 'ndvi' ? 'filter saturate-200 contrast-125 brightness-75' :
                    activeLayer === 'lidar' ? 'filter grayscale contrast-150 brightness-50' :
                    activeLayer === 'cadastral' ? 'filter brightness-90 contrast-110' :
                    'filter brightness-100'
                  }`}
                />

                {/* Layer 2: NDVI Multispectral Crop Health Heatmap Overlay */}
                {activeLayer === 'ndvi' && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.85 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="absolute inset-0 pointer-events-none mix-blend-color-dodge"
                    style={{
                      background: 'radial-gradient(ellipse at 50% 55%, rgba(0, 230, 118, 0.75) 0%, rgba(255, 214, 0, 0.6) 45%, rgba(255, 61, 0, 0.45) 80%, transparent 100%)'
                    }}
                  />
                )}

                {/* Layer 3: LiDAR 3D Topographic Contour & Point Grid Overlay */}
                {activeLayer === 'lidar' && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.9 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      backgroundImage: `
                        linear-gradient(rgba(0, 240, 255, 0.25) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(0, 240, 255, 0.25) 1px, transparent 1px)
                      `,
                      backgroundSize: '20px 20px'
                    }}
                  >
                    {/* Isometric Contour Rings */}
                    <svg className="w-full h-full opacity-60" viewBox="0 0 100 100" preserveAspectRatio="none">
                      <path d="M 20,40 Q 50,25 80,45 T 75,75 Q 45,85 22,65 Z" fill="none" stroke="#00E5FF" strokeWidth="0.8" strokeDasharray="3 3" />
                      <path d="M 30,45 Q 52,35 72,48 T 68,68 Q 48,76 32,60 Z" fill="none" stroke="#00E5FF" strokeWidth="0.8" strokeDasharray="2 2" />
                      <path d="M 40,50 Q 52,42 62,52 T 58,62 Q 50,66 42,58 Z" fill="rgba(0, 229, 255, 0.15)" stroke="#00E5FF" strokeWidth="1" />
                    </svg>
                  </motion.div>
                )}

                {/* Vector Overlay: Cadastral Boundaries, Survey Grid & Drone Path */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="cadastralGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#00E676" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#008C45" stopOpacity="0.15" />
                    </linearGradient>
                    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="1.5" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                  </defs>

                  {/* Lawnmower Survey Scan Flight Lines */}
                  <path 
                    d="M 24,30 L 80,24 M 82,38 L 26,44 M 27,58 L 84,52 M 86,66 L 25,72 M 22,82 L 86,76" 
                    fill="none" 
                    stroke="rgba(255, 255, 255, 0.35)" 
                    strokeWidth="0.7" 
                    strokeDasharray="2 2" 
                  />

                  {/* Odisha Cadastral Boundary Polygon with Marching Ants */}
                  <polygon 
                    points="22,26 82,20 88,78 18,84" 
                    fill="url(#cadastralGrad)" 
                    stroke="#00E676" 
                    strokeWidth={activeLayer === 'cadastral' ? "2.2" : "1.8"} 
                    strokeDasharray="5 3"
                    className="animate-[dash_20s_linear_infinite]"
                    filter="url(#glow)"
                  />

                  {/* Centroid Crosshair Reticle (Plot 640/2536 Centroid) */}
                  <circle cx="53" cy="52" r="3.8" fill="#FFFFFF" stroke="#008C45" strokeWidth="1.5" />
                  <circle cx="53" cy="52" r="1.4" fill="#008C45" />
                  <line x1="47" y1="52" x2="59" y2="52" stroke="#008C45" strokeWidth="0.8" />
                  <line x1="53" y1="46" x2="53" y2="58" stroke="#008C45" strokeWidth="0.8" />

                  {/* Vertex Markers & Coordinate Anchors */}
                  {parcelCorners.map((corner) => (
                    <g key={corner.id} className="cursor-pointer pointer-events-auto" onClick={() => setSelectedNode(corner.id)}>
                      {/* Pulse Ring */}
                      <circle cx={corner.x} cy={corner.y} r="5" fill="none" stroke="#00E676" strokeWidth="1" className="animate-ping origin-center opacity-70" />
                      {/* Vertex Point */}
                      <circle cx={corner.x} cy={corner.y} r="3" fill="#FFFFFF" stroke="#007338" strokeWidth="1.6" />
                      {/* Label */}
                      <text 
                        x={corner.x + (corner.x > 50 ? -8 : 5)} 
                        y={corner.y + (corner.y > 50 ? 9 : -5)} 
                        fill="#FFFFFF" 
                        fontSize="3.8" 
                        fontFamily="monospace" 
                        fontWeight="bold"
                        filter="drop-shadow(0px 1px 2px rgba(0,0,0,0.9))"
                      >
                        {corner.name}
                      </text>
                    </g>
                  ))}
                </svg>

                {/* Animated Sweeping Laser Scanner Bar */}
                <motion.div 
                  animate={{ y: ['-5%', '105%'] }}
                  transition={{ 
                    duration: 3.8, 
                    repeat: Infinity, 
                    ease: 'linear' 
                  }}
                  className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#00E676] to-transparent shadow-[0_0_15px_#00E676] pointer-events-none"
                />

                {/* Dynamic Animated Quadcopter Drone with Flight Pattern */}
                {isSimulating && (
                  <motion.div
                    className="absolute z-20 pointer-events-none -ml-6 -mt-6"
                    animate={{
                      left: ['24%', '52%', '80%', '82%', '52%', '26%', '24%', '54%', '84%', '86%', '52%', '22%', '24%'],
                      top: ['28%', '25%', '23%', '38%', '42%', '45%', '59%', '56%', '53%', '68%', '72%', '76%', '28%'],
                      rotate: [85, 90, 135, 180, 265, 270, 160, 85, 90, 175, 265, 350, 85]
                    }}
                    transition={{
                      duration: 22,
                      repeat: Infinity,
                      ease: 'easeInOut'
                    }}
                  >
                    {/* Drone Downward Scanning Sensor Cone */}
                    <div className="absolute -inset-4 rounded-full bg-emerald-400/20 animate-ping pointer-events-none" />
                    <div className="absolute -inset-2 rounded-full border border-emerald-400/40 pointer-events-none" />

                    {/* Detailed Quadcopter Top-Down SVG */}
                    <svg className="w-12 h-12 drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)]" viewBox="0 0 100 100">
                      {/* Carbon Arms */}
                      <line x1="20" y1="20" x2="80" y2="80" stroke="#1E293B" strokeWidth="6" strokeLinecap="round" />
                      <line x1="80" y1="20" x2="20" y2="80" stroke="#1E293B" strokeWidth="6" strokeLinecap="round" />
                      
                      {/* Motor Nacelles */}
                      <circle cx="20" cy="20" r="8" fill="#334155" stroke="#00E676" strokeWidth="1.5" />
                      <circle cx="80" cy="20" r="8" fill="#334155" stroke="#00E676" strokeWidth="1.5" />
                      <circle cx="80" cy="80" r="8" fill="#334155" stroke="#00E676" strokeWidth="1.5" />
                      <circle cx="20" cy="80" r="8" fill="#334155" stroke="#00E676" strokeWidth="1.5" />

                      {/* Spinning Rotor Blades (4 Rotors) */}
                      <g className="animate-[spin_0.3s_linear_infinite] origin-[20px_20px]">
                        <ellipse cx="20" cy="20" rx="14" ry="3" fill="#94A3B8" opacity="0.8" />
                      </g>
                      <g className="animate-[spin_0.3s_linear_infinite] origin-[80px_20px]">
                        <ellipse cx="80" cy="20" rx="14" ry="3" fill="#94A3B8" opacity="0.8" />
                      </g>
                      <g className="animate-[spin_0.3s_linear_infinite] origin-[80px_80px]">
                        <ellipse cx="80" cy="80" rx="14" ry="3" fill="#94A3B8" opacity="0.8" />
                      </g>
                      <g className="animate-[spin_0.3s_linear_infinite] origin-[20px_80px]">
                        <ellipse cx="20" cy="80" rx="14" ry="3" fill="#94A3B8" opacity="0.8" />
                      </g>

                      {/* Main Fuselage Body */}
                      <rect x="36" y="34" width="28" height="32" rx="7" fill="#0F172A" stroke="#E2E8F0" strokeWidth="2" />
                      
                      {/* Center Gimbal Camera Lens */}
                      <circle cx="50" cy="48" r="7" fill="#00E676" opacity="0.9" />
                      <circle cx="50" cy="48" r="3.5" fill="#0F172A" />

                      {/* Navigation LED Strobes: Starboard (Green) / Port (Red) */}
                      <circle cx="80" cy="20" r="2.5" fill="#00E676" className="animate-ping" />
                      <circle cx="20" cy="20" r="2.5" fill="#EF4444" className="animate-ping" />
                    </svg>
                  </motion.div>
                )}

                {/* Overlaid Telemetry Badges: Top-Left Parcel Info */}
                <div className="absolute top-2.5 left-2.5 bg-black/80 backdrop-blur-md px-2.5 py-1.5 rounded-lg text-white font-mono text-[10px] border border-white/15 space-y-0.5 shadow-md">
                  <div className="flex items-center gap-1.5">
                    <span className="text-gray-400">PARCEL:</span>
                    <span className="text-emerald-400 font-bold">OD-CUT-640-2536</span>
                  </div>
                  <div className="text-gray-300">
                    MOUZA: <span className="text-white">Bidyadharpur, Cuttack Sadar</span>
                  </div>
                  <div className="text-[9px] text-gray-400">
                    KHATA: <span className="text-emerald-300">299/611</span> • PLOT: <span className="text-emerald-300">640/2536</span>
                  </div>
                </div>

                {/* Overlaid Telemetry Badges: Top-Right Dynamic Flight Data */}
                <div className="absolute top-2.5 right-2.5 bg-black/80 backdrop-blur-md px-2.5 py-1.5 rounded-lg text-white font-mono text-[10px] border border-white/15 text-right space-y-0.5 shadow-md">
                  <div className="flex items-center justify-end gap-1.5">
                    <span className="text-gray-400">ALT:</span>
                    <span className="text-emerald-400 font-bold">{telemetry.altitude}m AGL</span>
                  </div>
                  <div className="flex items-center justify-end gap-1.5">
                    <span className="text-gray-400">SPD:</span>
                    <span className="text-white font-bold">{telemetry.speed} m/s</span>
                  </div>
                  <div className="flex items-center justify-end gap-1 text-[9px] text-amber-300">
                    <Compass 
                      className="w-3 h-3 text-amber-400 transition-transform duration-500" 
                      style={{ transform: `rotate(${telemetry.heading}deg)` }} 
                    />
                    <span>HDG: {telemetry.heading}° SE</span>
                  </div>
                </div>

                {/* Selected Node Tooltip (when clicking V1..V4) */}
                <AnimatePresence>
                  {selectedNode && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/90 backdrop-blur-lg border border-emerald-400/60 p-3 rounded-xl text-white font-mono text-[11px] shadow-2xl z-30 min-w-[200px]"
                    >
                      <div className="flex items-center justify-between border-b border-white/20 pb-1 mb-1.5">
                        <span className="text-emerald-400 font-bold">VERTEX {selectedNode.toUpperCase()} CORNER</span>
                        <button onClick={() => setSelectedNode(null)} className="text-gray-400 hover:text-white text-xs">✕</button>
                      </div>
                      {(() => {
                        const corner = parcelCorners.find(c => c.id === selectedNode);
                        if (!corner) return null;
                        return (
                          <div className="space-y-1 text-[10px]">
                            <div>LAT: <span className="text-emerald-300">{corner.lat}</span></div>
                            <div>LNG: <span className="text-emerald-300">{corner.lng}</span></div>
                            <div>SEGMENT LENGTH: <span className="text-white">{corner.distToNext}</span></div>
                            <div className="text-[9px] text-gray-400">PostGIS Boundary Coordinate Verified</div>
                          </div>
                        );
                      })()}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Layer Mode Specific Legend Badges */}
                {activeLayer === 'ndvi' && (
                  <div className="absolute bottom-12 left-3 bg-black/85 backdrop-blur-md px-2.5 py-1 rounded text-white font-mono text-[9px] border border-white/15 flex items-center gap-2">
                    <span className="text-emerald-400">NDVI: 0.78</span>
                    <div className="w-16 h-2 rounded bg-gradient-to-r from-red-500 via-yellow-400 to-emerald-500" />
                    <span className="text-gray-300">High Vigor</span>
                  </div>
                )}

                {activeLayer === 'lidar' && (
                  <div className="absolute bottom-12 left-3 bg-black/85 backdrop-blur-md px-2.5 py-1 rounded text-cyan-300 font-mono text-[9px] border border-cyan-400/30 flex items-center gap-2">
                    <Sparkles className="w-3 h-3 text-cyan-400 animate-spin" />
                    <span>LiDAR: 48 pts/m² • DEM 42.6m MSL</span>
                  </div>
                )}

                {/* Bottom Status & Mission Progress Bar */}
                <div className="absolute bottom-2.5 inset-x-2.5 bg-black/85 backdrop-blur-md px-3 py-2 rounded-lg text-white font-mono text-[10px] border border-white/15">
                  <div className="flex items-center justify-between mb-1">
                    <span className="flex items-center gap-1.5 text-emerald-300 font-semibold">
                      <Plane className="w-3.5 h-3.5" />
                      <span>MISSION: AUTONOMOUS GRID SCAN</span>
                    </span>
                    <span className="text-gray-300">GSD: {telemetry.gsd} cm/px</span>
                  </div>

                  {/* Survey Mission Progress Bar */}
                  <div className="flex items-center gap-2 text-[9px] text-gray-300">
                    <span>WP {telemetry.waypoint}/18</span>
                    <div className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-emerald-500 to-[#00E676] rounded-full transition-all duration-500"
                        style={{ width: `${telemetry.progress}%` }}
                      />
                    </div>
                    <span className="text-emerald-400 font-bold">{telemetry.progress}%</span>
                    <span className="text-gray-400">|</span>
                    <span className="flex items-center gap-1 text-emerald-400">
                      <Battery className="w-3 h-3 text-emerald-400" />
                      <span>{telemetry.battery}%</span>
                    </span>
                  </div>
                </div>

              </div>

              {/* Real-time Dynamic Coordinate & Sensor Readout Strip */}
              <div className="mt-3.5 grid grid-cols-3 gap-2 text-center">
                <div className="p-2 sm:p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                  <span className="text-[10px] font-mono uppercase text-gray-500 block">LATITUDE</span>
                  <span className="text-xs sm:text-sm font-mono font-bold text-gray-900 tracking-tight">
                    {telemetry.lat}° N
                  </span>
                </div>
                <div className="p-2 sm:p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                  <span className="text-[10px] font-mono uppercase text-gray-500 block">LONGITUDE</span>
                  <span className="text-xs sm:text-sm font-mono font-bold text-gray-900 tracking-tight">
                    {telemetry.lng}° E
                  </span>
                </div>
                <div className="p-2 sm:p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                  <span className="text-[10px] font-mono uppercase text-gray-500 block">CRS PROJECTION</span>
                  <span className="text-xs sm:text-sm font-mono font-bold text-[#008C45]">
                    EPSG:4326
                  </span>
                </div>
              </div>

              {/* Sub-strip: Area & Real-Time Cadastral Verification */}
              <div className="mt-2.5 px-3 py-2 rounded-xl bg-emerald-50/70 border border-emerald-100 flex items-center justify-between text-[11px] font-mono text-[#0f2e1e]">
                <div className="flex items-center gap-1.5">
                  <Crosshair className="w-3.5 h-3.5 text-[#008C45]" />
                  <span>Cadastral Area: <strong>1.84 Acres (0.744 Ha)</strong></span>
                </div>
                <span className="text-[#008C45] font-semibold text-[10px] hidden sm:inline">
                  ODISHA BHULEKH SYNCED
                </span>
              </div>

            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};
