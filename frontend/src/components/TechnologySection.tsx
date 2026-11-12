import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Satellite, 
  PlaneTakeoff, 
  Box, 
  LineChart, 
  Check, 
  Cpu, 
  Workflow
} from 'lucide-react';

export const TechnologySection: React.FC = () => {
  const [activeModule, setActiveModule] = useState(0);

  const modules = [
    {
      id: 'mod-1',
      number: '01',
      title: 'Geospatial Field Intelligence',
      badge: 'GIS & Satellite Ingestion',
      icon: Satellite,
      tagline: 'High-resolution field registration and cadastral boundary demarcation',
      description: 'Ingests high-resolution satellite imagery to enable polygon-based field demarcation, boundary coordinate validation, and net cultivable area measurement.',
      capabilities: [
        'Interactive GeoJSON polygon demarcation',
        'Cadastral boundary georeferencing',
        'Spatial parcel area computation in hectares / acres',
        'Basemap integration with satellite tiles'
      ],
      technicalSpecs: [
        { label: 'Coordinate System', value: 'WGS 84 (EPSG:4326 / UTM)' },
        { label: 'Spatial Format', value: 'GeoJSON / PostGIS Polygon' },
        { label: 'Map Baseline', value: 'High-res multispectral tiles' }
      ]
    },
    {
      id: 'mod-2',
      number: '02',
      title: 'UAV Image Acquisition',
      badge: 'Aerial Surveying',
      icon: PlaneTakeoff,
      tagline: 'Multi-altitude mission planning for nadir and oblique aerial capture',
      description: 'Orchestrates UAV flight missions to capture high-overlap aerial RGB photographs of harvested fields and 360-degree orbital sweeps of piled paddy heaps.',
      capabilities: [
        'Automated 75-80% forward & lateral overlap paths',
        'Orbital multi-view camera angles for steep heap contours',
        'EXIF geotag extraction (latitude, longitude, ellipsoidal altitude)',
        'Ground Sampling Distance (GSD) sub-centimeter optimization'
      ],
      technicalSpecs: [
        { label: 'Flight Pattern', value: 'Double Grid & Orbital Sweep' },
        { label: 'Target GSD', value: '< 0.8 cm / pixel' },
        { label: 'Image Overlap', value: '80% Frontal / 70% Side' }
      ]
    },
    {
      id: 'mod-3',
      number: '03',
      title: '3D Photogrammetry',
      badge: 'SfM & Surface Meshing',
      icon: Box,
      tagline: 'Dense 3D point cloud generation and digital surface modeling',
      description: 'Executes Structure-from-Motion (SfM) feature matching and Multi-View Stereo (MVS) algorithms to reconstruct accurate 3D dense point clouds and triangular meshes.',
      capabilities: [
        'Scale-Invariant Feature Transform (SIFT) keypoint matching',
        'Dense point cloud depth-map fusion',
        'Ground-plane segmentation using RANSAC algorithms',
        'Watertight triangular mesh volume integration (m³)'
      ],
      technicalSpecs: [
        { label: 'Reconstruction Engine', value: 'SfM / MVS Pipeline' },
        { label: 'Mesh Resolution', value: '> 150k facets per heap' },
        { label: 'Segmentation', value: 'RANSAC Plane Isolation' }
      ]
    },
    {
      id: 'mod-4',
      number: '04',
      title: 'Intelligent Yield Estimation',
      badge: 'Agronomic Analytics',
      icon: LineChart,
      tagline: 'Physical bulk-density calibration converted to net agricultural yield',
      description: 'Fuses reconstructed heap volume with empirical laboratory bulk-density calibrations and harvested parcel area to calculate total paddy mass (kg) and productivity (t/ha).',
      capabilities: [
        'Empirical grain bulk density calibration curves',
        'Grain moisture correction index (14% baseline standard)',
        'Area-normalized yield calculation (Metric Tons / Hectare)',
        'Confidence interval & variance boundary reporting'
      ],
      technicalSpecs: [
        { label: 'Primary Formula', value: 'M = V_net × ρ_calibrated' },
        { label: 'Normalization', value: 'Yield = M_total / Area_harvested' },
        { label: 'Moisture Factor', value: 'Standardized to 14.0% dry base' }
      ]
    }
  ];

  return (
    <section id="technology" className="py-24 bg-charcoal-900/60 relative overflow-hidden border-t border-forest-800/80">
      {/* Background Subtle Moving Dot Grid */}
      <div className="absolute inset-0 bg-geo-dots opacity-20 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded bg-forest-900/70 border border-forest-700/80 text-[11px] font-mono uppercase tracking-widest text-lime-accent mb-4"
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>FOUR-TIER ARCHITECTURAL ENGINE</span>
          </motion.div>

          <motion.h2 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-sand-50 tracking-tight"
          >
            Technology Powered by <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-accent to-emerald-400">
              Rigorous Geospatial Science.
            </span>
          </motion.h2>

          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-sand-300 mt-4 text-base"
          >
            Each subsystem operates as an integrated analytical module, translating raw aerial imagery into verifiable agronomic intelligence.
          </motion.p>
        </div>

        {/* Interactive Module Navigation Pills with Micro Lift and Illuminated Borders */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-12">
          {modules.map((mod, index) => {
            const Icon = mod.icon;
            const isSelected = activeModule === index;
            return (
              <motion.button
                key={mod.id}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08, duration: 0.4 }}
                whileHover={{ y: -2 }}
                onClick={() => setActiveModule(index)}
                className={`text-left p-4 rounded-xl border transition-all duration-300 relative ${
                  isSelected
                    ? 'bg-forest-900/90 border-lime-accent/80 shadow-subtle-glow text-sand-50'
                    : 'bg-forest-950/40 border-forest-800 text-sand-300/80 hover:bg-forest-900/40 hover:border-forest-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-mono font-bold ${isSelected ? 'text-lime-accent' : 'text-olive-400'}`}>
                    MODULE {mod.number}
                  </span>
                  <Icon className={`w-4 h-4 transition-transform ${isSelected ? 'text-lime-accent scale-110' : 'text-olive-400'}`} />
                </div>
                <div className="font-display font-semibold text-sm leading-tight">
                  {mod.title}
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Selected Module Detail Canvas */}
        <AnimatePresence mode="wait">
          {(() => {
            const mod = modules[activeModule];
            const Icon = mod.icon;
            return (
              <motion.div
                key={mod.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="rounded-2xl border border-forest-700/80 bg-forest-950/80 p-6 sm:p-8 lg:p-10 shadow-elevated"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                  
                  {/* Left Column: Description & Capabilities */}
                  <div className="lg:col-span-7 flex flex-col items-start">
                    <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-forest-900 border border-lime-dim/60 text-[11px] font-mono text-lime-accent mb-4">
                      <span>MODULE {mod.number}</span>
                      <span>·</span>
                      <span>{mod.badge}</span>
                    </div>

                    <h3 className="font-display font-bold text-2xl sm:text-3xl text-sand-50 mb-2">
                      {mod.title}
                    </h3>

                    <p className="text-lime-accent/90 text-sm font-mono mb-4">
                      {mod.tagline}
                    </p>

                    <p className="text-sand-300 text-sm sm:text-base leading-relaxed mb-6">
                      {mod.description}
                    </p>

                    <div className="w-full pt-4 border-t border-forest-800">
                      <h4 className="text-xs font-mono uppercase tracking-wider text-olive-300 mb-3">
                        Functional Capabilities
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {mod.capabilities.map((cap) => (
                          <div key={cap} className="flex items-start gap-2 text-xs text-sand-200">
                            <span className="w-4 h-4 rounded-full bg-forest-900 border border-forest-700 flex items-center justify-center shrink-0 mt-0.5">
                              <Check className="w-2.5 h-2.5 text-lime-accent" />
                            </span>
                            <span>{cap}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Architectural Specification Panel */}
                  <div className="lg:col-span-5 bg-charcoal-900/90 rounded-xl border border-forest-800 p-6 flex flex-col gap-6 shadow-xl">
                    <div className="flex items-center justify-between pb-4 border-b border-forest-800">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-forest-900 border border-lime-dim flex items-center justify-center">
                          <Icon className="w-5 h-5 text-lime-accent" />
                        </div>
                        <div>
                          <div className="text-xs font-mono uppercase text-olive-400">Technical Spec</div>
                          <div className="font-display font-semibold text-sm text-sand-50">Analytical Parameters</div>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-lime-dim/20 text-lime-accent border border-lime-dim">
                        ACTIVE DESIGN
                      </span>
                    </div>

                    {/* Spec Items */}
                    <div className="flex flex-col gap-3.5">
                      {mod.technicalSpecs.map((spec) => (
                        <div key={spec.label} className="flex flex-col p-2.5 rounded bg-forest-950/70 border border-forest-800/80 hover:border-forest-700 transition-colors">
                          <span className="text-[10px] font-mono uppercase text-olive-400">{spec.label}</span>
                          <span className="text-xs font-mono font-medium text-sand-100 mt-0.5">{spec.value}</span>
                        </div>
                      ))}
                    </div>

                    {/* Engineering Callout */}
                    <div className="p-3 rounded-lg bg-forest-900/50 border border-forest-800 text-[11px] text-sand-300 font-mono">
                      <div className="text-lime-accent font-semibold flex items-center gap-1.5 mb-1">
                        <Workflow className="w-3.5 h-3.5" />
                        <span>Integration Pipeline</span>
                      </div>
                      Feeds directly into the automated yield calculation matrix for verifiable field certification.
                    </div>
                  </div>

                </div>
              </motion.div>
            );
          })()}
        </AnimatePresence>

      </div>
    </section>
  );
};
