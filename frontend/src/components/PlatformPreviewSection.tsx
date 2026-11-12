import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Map, 
  UserPlus, 
  Plane, 
  Box, 
  BarChart3, 
  Cpu, 
  Info,
  CheckCircle2,
  FileSpreadsheet,
  Boxes
} from 'lucide-react';
import { Interactive3DHeapViewer } from './Interactive3DHeapViewer';

export const PlatformPreviewSection: React.FC = () => {
  // Default to 3D Heap Reconstruction as requested so it's immediately visible below Hero
  const [activeTab, setActiveTab] = useState<'heap' | 'map' | 'register' | 'uav' | 'dashboard'>('heap');
  const [animatedArea, setAnimatedArea] = useState<number>(0);

  // Animated counter for field area when map tab is selected
  useEffect(() => {
    if (activeTab === 'map') {
      let current = 0;
      const target = 1.48;
      const step = 0.04;
      const timer = setInterval(() => {
        current += step;
        if (current >= target) {
          setAnimatedArea(target);
          clearInterval(timer);
        } else {
          setAnimatedArea(Number(current.toFixed(2)));
        }
      }, 35);
      return () => clearInterval(timer);
    }
  }, [activeTab]);

  const tabs = [
    { id: 'heap', label: '3D Heap Reconstruction', icon: Box },
    { id: 'map', label: 'Field GIS Map', icon: Map },
    { id: 'register', label: 'Parcel Registration', icon: UserPlus },
    { id: 'uav', label: 'UAV Mission Hub', icon: Plane },
    { id: 'dashboard', label: 'Yield Analytics', icon: BarChart3 },
  ];

  return (
    <section 
      id="heap-reconstruction" 
      className="py-24 sm:py-28 bg-charcoal-950 relative overflow-hidden border-b border-forest-800/80"
    >
      {/* Background radial glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[900px] h-[450px] bg-forest-900/35 blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header - Exact Required Content & Eyebrow */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded bg-forest-900 border border-lime-dim/60 text-[11px] font-mono uppercase tracking-widest text-lime-accent mb-4 shadow-sm"
          >
            <Boxes className="w-3.5 h-3.5 text-lime-accent" />
            <span>INTERACTIVE SPATIAL INTELLIGENCE</span>
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-sand-50 tracking-tight"
          >
            See Harvest Volume in{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-accent to-emerald-400">
              Three Dimensions.
            </span>
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-sand-300 mt-4 text-base sm:text-lg leading-relaxed"
          >
            Explore how multi-view UAV imagery can be transformed into 3D paddy heap geometry for volumetric assessment.
          </motion.p>
        </div>

        {/* Tab Selector Bar */}
        <div className="flex items-center justify-start sm:justify-center overflow-x-auto pb-4 mb-8 gap-2 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-mono text-xs uppercase tracking-wider transition-all shrink-0 border duration-200 ${
                  isSelected
                    ? 'bg-forest-900 border-lime-accent/70 text-lime-accent shadow-subtle-glow font-semibold scale-[1.02]'
                    : 'bg-forest-950/60 border-forest-800 text-sand-300/80 hover:bg-forest-900/40 hover:text-sand-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Mock Interface Canvas */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-2xl border border-forest-700/80 bg-charcoal-900 shadow-elevated overflow-hidden"
        >
          
          {/* Mock Window Top Bar */}
          <div className="bg-charcoal-950 border-b border-forest-800/80 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500/80" />
              <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <span className="w-3 h-3 rounded-full bg-green-500/80" />
              <span className="ml-3 font-mono text-xs text-sand-400 hidden sm:inline">
                AgriSentinel Studio · v0.1.0-alpha [Concept Preview]
              </span>
            </div>

            <div className="flex items-center gap-2 text-[10px] font-mono px-2.5 py-1 rounded bg-forest-900/80 border border-forest-700 text-olive-300">
              <Info className="w-3 h-3 text-lime-accent" />
              <span>CONCEPT MOCKUP · PENDING IMPLEMENTATION</span>
            </div>
          </div>

          {/* Interactive Tab View Contents */}
          <div className="p-4 sm:p-6 lg:p-8 min-h-[520px] bg-charcoal-900/80">
            <AnimatePresence mode="wait">
              
              {/* TAB 1 (PRIMARY): HEAP 3D RECONSTRUCTION with Three.js Interactive Component */}
              {activeTab === 'heap' && (
                <motion.div
                  key="heap"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <Interactive3DHeapViewer height="520px" showControls={true} />
                </motion.div>
              )}

              {/* TAB 2: FIELD GIS MAP with SVG polygon drawing & scanning line */}
              {activeTab === 'map' && (
                <motion.div
                  key="map"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-1 lg:grid-cols-12 gap-6"
                >
                  <div className="lg:col-span-8 relative aspect-[16/10] rounded-xl overflow-hidden border border-forest-800 bg-charcoal-950 group">
                    <img 
                      src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1000&auto=format&fit=crop" 
                      alt="Field satellite basemap mock" 
                      className="w-full h-full object-cover opacity-60 filter contrast-125"
                    />
                    <div className="absolute inset-0 bg-geo-grid opacity-30" />
                    
                    {/* Animated Satellite Scanning Line */}
                    <motion.div 
                      animate={{ top: ['0%', '100%', '0%'] }}
                      transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                      className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-lime-accent to-transparent shadow-subtle-glow pointer-events-none"
                    />

                    {/* SVG Vector Polygon Overlay with Sequential Drawing & Nodes */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 500 320">
                      {/* Polygon perimeter self-drawing */}
                      <motion.path
                        d="M 70 60 L 280 40 L 320 240 L 100 260 Z"
                        fill="rgba(184, 238, 59, 0.16)"
                        stroke="#b8ee3b"
                        strokeWidth="2"
                        strokeDasharray="6,3"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 2.2, ease: "easeInOut" }}
                      />
                      
                      {/* Vertex circles with pulsing auras */}
                      {[
                        { cx: 70, cy: 60, delay: 0.1 },
                        { cx: 280, cy: 40, delay: 0.6 },
                        { cx: 320, cy: 240, delay: 1.1 },
                        { cx: 100, cy: 260, delay: 1.6 }
                      ].map((v, i) => (
                        <g key={i}>
                          <circle cx={v.cx} cy={v.cy} r="4" fill="#b8ee3b" />
                          <circle
                            cx={v.cx}
                            cy={v.cy}
                            r="4"
                            stroke="#b8ee3b"
                            strokeWidth="1.2"
                            fill="none"
                          >
                            <animate
                              attributeName="r"
                              values="4; 11; 4"
                              dur="2.2s"
                              begin={`${v.delay}s`}
                              repeatCount="indefinite"
                            />
                            <animate
                              attributeName="opacity"
                              values="0.9; 0; 0.9"
                              dur="2.2s"
                              begin={`${v.delay}s`}
                              repeatCount="indefinite"
                            />
                          </circle>
                        </g>
                      ))}

                      {/* Heap markers */}
                      <circle cx="180" cy="140" r="14" fill="rgba(52, 211, 153, 0.35)" stroke="#34d399" strokeWidth="1.5" />
                      <circle cx="240" cy="180" r="11" fill="rgba(52, 211, 153, 0.35)" stroke="#34d399" strokeWidth="1.5" />
                    </svg>

                    {/* On-map HUD */}
                    <div className="absolute top-4 left-4 glass-panel px-3 py-2 rounded-lg font-mono text-[11px] backdrop-blur-md">
                      <div className="text-lime-accent font-semibold flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-lime-accent animate-ping" />
                        <span>ACTIVE POLYGON: #OD-742</span>
                      </div>
                      <div className="text-sand-300 text-[10px] mt-0.5">Lat: 20.2961°N | Lng: 85.8245°E</div>
                    </div>

                    <div className="absolute bottom-4 right-4 glass-panel-subtle px-3 py-1.5 rounded font-mono text-[10px] text-sand-300">
                      EPSG:4326 · WGS84 Orthorectified
                    </div>
                  </div>

                  {/* Right Metrics Panel */}
                  <div className="lg:col-span-4 flex flex-col gap-4">
                    <div className="p-4 rounded-xl bg-forest-950 border border-forest-800">
                      <div className="text-xs font-mono text-olive-400 uppercase">Parcel Metrics</div>
                      <div className="text-lg font-display font-bold text-sand-50 mt-1">Gopabandhu Plot A</div>
                      <div className="text-xs font-mono text-sand-300 mt-2 space-y-1.5">
                        <div className="flex justify-between items-center py-1 border-b border-forest-800">
                          <span>Demarcated Area:</span>
                          <span className="text-lime-accent font-bold">{animatedArea.toFixed(2)} Hectares</span>
                        </div>
                        <div className="flex justify-between items-center py-1 border-b border-forest-800">
                          <span>Boundary Vertices:</span>
                          <strong className="text-sand-100">4 Coordinates</strong>
                        </div>
                        <div className="flex justify-between items-center py-1">
                          <span>Perimeter:</span>
                          <strong className="text-sand-100">512 Meters</strong>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-forest-950 border border-forest-800">
                      <div className="text-xs font-mono text-olive-400 uppercase">Associated Grain Heaps</div>
                      <div className="mt-2 space-y-2 font-mono text-xs">
                        <div className="p-2.5 rounded bg-charcoal-900 border border-forest-800 flex justify-between items-center">
                          <span>Heap Alpha (Paddy)</span>
                          <span className="text-lime-accent font-bold">14.8 m³</span>
                        </div>
                        <div className="p-2.5 rounded bg-charcoal-900 border border-forest-800 flex justify-between items-center">
                          <span>Heap Beta (Paddy)</span>
                          <span className="text-lime-accent font-bold">8.3 m³</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB 3: PARCEL REGISTRATION */}
              {activeTab === 'register' && (
                <motion.div
                  key="register"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                  <div className="p-6 rounded-xl bg-forest-950 border border-forest-800 flex flex-col gap-4">
                    <div className="text-sm font-mono text-lime-accent uppercase font-semibold">
                      New Plot Registration Form (Concept)
                    </div>
                    
                    <div className="space-y-3 font-mono text-xs">
                      <div>
                        <label className="text-olive-400 text-[10px] block mb-1">FARMER NAME</label>
                        <div className="p-2.5 rounded bg-charcoal-900 border border-forest-700 text-sand-200">
                          Ramesh Chandra Sahoo
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-olive-400 text-[10px] block mb-1">DISTRICT / TALUK</label>
                          <div className="p-2.5 rounded bg-charcoal-900 border border-forest-700 text-sand-200">
                            Puri / Pipili
                          </div>
                        </div>
                        <div>
                          <label className="text-olive-400 text-[10px] block mb-1">KHATA / SURVEY NO.</label>
                          <div className="p-2.5 rounded bg-charcoal-900 border border-forest-700 text-sand-200">
                            Plot #142/882
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-olive-400 text-[10px] block mb-1">CROP VARIETY</label>
                          <div className="p-2.5 rounded bg-charcoal-900 border border-forest-700 text-sand-200">
                            Swarna (MTU 7029)
                          </div>
                        </div>
                        <div>
                          <label className="text-olive-400 text-[10px] block mb-1">HARVEST TIMELINE</label>
                          <div className="p-2.5 rounded bg-charcoal-900 border border-forest-700 text-sand-200">
                            November 2026
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 rounded-xl bg-forest-950 border border-forest-800 flex flex-col justify-between">
                    <div>
                      <div className="text-sm font-mono text-olive-400 uppercase mb-3">Spatial Polygon Validation</div>
                      <p className="text-xs text-sand-300 leading-relaxed mb-4">
                        Upon polygon completion on the satellite viewport, coordinates are validated for topological self-intersection and projected to the local UTM zone for geodesic area computation.
                      </p>
                      <div className="p-3 rounded bg-charcoal-900 border border-forest-800 font-mono text-xs space-y-1.5">
                        <div className="text-emerald-400 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Topology Check: PASSED (Clean Polygon)</span>
                        </div>
                        <div className="text-emerald-400 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Coordinate Projection: EPSG:32645 (UTM 45N)</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-forest-800 flex items-center justify-between text-xs font-mono text-olive-400">
                      <span>Status: Record Drafted</span>
                      <span className="text-lime-accent">Sync to PostGIS</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB 4: UAV MISSION HUB */}
              {activeTab === 'uav' && (
                <motion.div
                  key="uav"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-1 lg:grid-cols-3 gap-6"
                >
                  <div className="p-5 rounded-xl bg-forest-950 border border-forest-800 flex flex-col gap-3">
                    <span className="text-xs font-mono text-olive-400 uppercase">Mission Parameters</span>
                    <div className="space-y-2 font-mono text-xs">
                      <div className="flex justify-between pb-1.5 border-b border-forest-800">
                        <span className="text-sand-400">Flight Altitude:</span>
                        <span className="text-sand-100 font-semibold">35 m AGL</span>
                      </div>
                      <div className="flex justify-between pb-1.5 border-b border-forest-800">
                        <span className="text-sand-400">GSD:</span>
                        <span className="text-lime-accent font-semibold">0.78 cm/px</span>
                      </div>
                      <div className="flex justify-between pb-1.5 border-b border-forest-800">
                        <span className="text-sand-400">Overlap (Front/Side):</span>
                        <span className="text-sand-100 font-semibold">80% / 75%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sand-400">Camera Pitch:</span>
                        <span className="text-sand-100 font-semibold">Nadir (-90°) + Oblique (-45°)</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 rounded-xl bg-forest-950 border border-forest-800 flex flex-col gap-3">
                    <span className="text-xs font-mono text-olive-400 uppercase">Image Ingestion Queue</span>
                    <div className="space-y-2 font-mono text-xs">
                      <div className="p-2 rounded bg-charcoal-900 border border-forest-800 flex justify-between items-center">
                        <span>DJI_0421.JPG to 0495.JPG</span>
                        <span className="text-emerald-400 text-[10px]">74 FRAMES</span>
                      </div>
                      <div className="p-2 rounded bg-charcoal-900 border border-forest-800 flex justify-between items-center">
                        <span>EXIF Geotagging</span>
                        <span className="text-lime-accent text-[10px]">100% RTK FIXED</span>
                      </div>
                      <div className="p-2 rounded bg-charcoal-900 border border-forest-800 flex justify-between items-center">
                        <span>Lighting Uniformity</span>
                        <span className="text-sand-200 text-[10px]">DIFFUSE / OVERCAST</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 rounded-xl bg-forest-950 border border-forest-800 flex flex-col justify-between">
                    <div>
                      <span className="text-xs font-mono text-olive-400 uppercase">Photogrammetry Execution</span>
                      <div className="mt-3 text-xs font-mono text-sand-300 leading-relaxed">
                        Images are transferred into OpenSfM worker containers for feature extraction, sparse bundle adjustment, and dense multi-view stereo meshing.
                      </div>
                    </div>
                    <div className="p-2.5 rounded bg-lime-dim/20 border border-lime-dim text-[11px] font-mono text-lime-accent flex items-center gap-2">
                      <Cpu className="w-3.5 h-3.5" />
                      <span>Pipeline Ready for Execution</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB 5: YIELD ANALYTICS DASHBOARD */}
              {activeTab === 'dashboard' && (
                <motion.div
                  key="dashboard"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-1 md:grid-cols-3 gap-6"
                >
                  <div className="p-5 rounded-xl bg-forest-950 border border-forest-800 flex flex-col gap-2">
                    <span className="text-[10px] font-mono uppercase text-olive-400">Total Harvested Mass</span>
                    <div className="text-2xl font-display font-bold text-sand-50">
                      8,595 <span className="text-sm font-mono text-lime-accent">kg</span>
                    </div>
                    <div className="text-xs font-mono text-sand-400">
                      ~ 85.95 Quintals (8.60 Metric Tons)
                    </div>
                    <div className="mt-3 pt-3 border-t border-forest-800 text-[10px] font-mono text-olive-300">
                      ρ_calibrated: 580 kg/m³ @ 14% moisture
                    </div>
                  </div>

                  <div className="p-5 rounded-xl bg-forest-950 border border-forest-800 flex flex-col gap-2">
                    <span className="text-[10px] font-mono uppercase text-olive-400">Net Field Productivity</span>
                    <div className="text-2xl font-display font-bold text-lime-accent">
                      5.81 <span className="text-sm font-mono text-sand-100">t/ha</span>
                    </div>
                    <div className="text-xs font-mono text-sand-400">
                      Normalized across 1.48 demarcated ha
                    </div>
                    <div className="mt-3 pt-3 border-t border-forest-800 text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Within expected agro-climatic bracket</span>
                    </div>
                  </div>

                  <div className="p-5 rounded-xl bg-forest-950 border border-forest-800 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-olive-400">Verification Certificate</span>
                      <div className="text-xs text-sand-300 mt-1 font-mono leading-relaxed">
                        Export complete harvest dossier containing UAV flight log, mesh point cloud checksum, and density logs.
                      </div>
                    </div>
                    <button className="w-full mt-4 py-2 rounded bg-forest-900 hover:bg-forest-850 text-sand-100 text-xs font-mono uppercase tracking-wider border border-forest-700 flex items-center justify-center gap-1.5 transition-colors">
                      <FileSpreadsheet className="w-3.5 h-3.5 text-lime-accent" />
                      <span>Download Audit PDF</span>
                    </button>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>

        </motion.div>

      </div>
    </section>
  );
};
