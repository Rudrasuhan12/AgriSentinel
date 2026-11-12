import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  UserCheck, 
  Map, 
  Camera, 
  Boxes, 
  Scale, 
  FileCheck2, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2
} from 'lucide-react';

export const WorkflowSection: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      num: '01',
      title: 'Farmer & Field Registration',
      icon: UserCheck,
      category: 'Identity & Cadastral Ingestion',
      description: 'Record landholder identity, survey numbers, target crop variety (paddy), sowing timelines, and expected harvest dates to establish spatial record linkage.',
      deliverable: 'Farmer Profile & Field Record Entity',
      telemetry: 'PostGIS Record Linkage'
    },
    {
      num: '02',
      title: 'Satellite Field Mapping',
      icon: Map,
      category: 'Geospatial Boundary Delineation',
      description: 'Overlay high-resolution satellite imagery to demarcate plot boundary vertices, compute perimeter coordinates, and calculate net cultivated parcel area.',
      deliverable: 'Georeferenced Polygon (GeoJSON)',
      telemetry: 'WGS 84 Polygon Geometry'
    },
    {
      num: '03',
      title: 'UAV Image Acquisition',
      icon: Camera,
      category: 'Aerial Survey Acquisition',
      description: 'Deploy UAVs on programmed grid flight plans with 80% overlap to collect high-resolution nadir orthophoto frames and orbital oblique angles of harvested heaps.',
      deliverable: 'Geotagged Aerial RGB Dataset',
      telemetry: 'EXIF Positional Metadata'
    },
    {
      num: '04',
      title: '3D Heap Reconstruction',
      icon: Boxes,
      category: 'Photogrammetry & 3D Meshing',
      description: 'Ingest multi-view images into the photogrammetric pipeline to execute SfM, extract keypoint tie points, filter dense point clouds, and mesh the 3D surface geometry.',
      deliverable: '3D Triangular Mesh & Net Volume (m³)',
      telemetry: 'RANSAC Plane & Voxel Integration'
    },
    {
      num: '05',
      title: 'Paddy Mass Estimation',
      icon: Scale,
      category: 'Agronomic Bulk-Density Modeling',
      description: 'Multiply net heap volume by laboratory-calibrated grain bulk density (kg/m³), incorporating grain moisture normalization factors to compute total harvested grain weight.',
      deliverable: 'Estimated Paddy Mass (kg / Quintals)',
      telemetry: 'Calibrated Bulk Density Factor'
    },
    {
      num: '06',
      title: 'Yield Report Generation',
      icon: FileCheck2,
      category: 'Evidence-Based Reporting',
      description: 'Normalize total harvested mass against the demarcated field area to calculate metric tons per hectare (t/ha), generating a cryptographically verifiable assessment certificate.',
      deliverable: 'Auditable Field Yield Assessment Report',
      telemetry: 'Automated Diagnostic Dossier'
    }
  ];

  return (
    <section id="workflow" className="py-24 bg-charcoal-950 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/3 right-0 w-96 h-96 bg-lime-dim blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded bg-forest-900 border border-forest-700/80 text-[11px] font-mono uppercase tracking-widest text-lime-accent mb-4"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>END-TO-END EXECUTION WORKFLOW</span>
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-sand-50 tracking-tight"
          >
            How AgriSentinel <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-accent to-emerald-400">
              Assesses Every Harvest.
            </span>
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-sand-300 mt-4 text-base"
          >
            From plot registration to verifiable yield calculation, a systematic six-stage protocol guarantees analytical traceability.
          </motion.p>
        </div>

        {/* Workflow Progression Stepper Cards with Animated Viewport Stagger */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            const isHovered = activeStep === idx;
            return (
              <motion.div
                key={s.num}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ delay: idx * 0.08, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                onMouseEnter={() => setActiveStep(idx)}
                className={`p-6 rounded-2xl border transition-all duration-300 relative group flex flex-col justify-between ${
                  isHovered
                    ? 'bg-forest-900/80 border-lime-accent/80 shadow-subtle-glow -translate-y-1'
                    : 'bg-forest-950/60 border-forest-800/80 hover:border-forest-700 hover:bg-forest-900/40'
                }`}
              >
                {/* Step Top Header */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold px-2 py-1 rounded bg-charcoal-900 border border-forest-700 text-lime-accent">
                        STEP {s.num}
                      </span>
                      <span className="w-1.5 h-1.5 rounded-full bg-lime-accent/70" />
                    </div>
                    
                    <div className="w-10 h-10 rounded-lg bg-charcoal-900 border border-forest-700 flex items-center justify-center group-hover:border-lime-dim group-hover:bg-forest-900 transition-colors shadow-sm">
                      <Icon className="w-5 h-5 text-lime-accent group-hover:scale-110 transition-transform" />
                    </div>
                  </div>

                  <span className="text-[10px] font-mono uppercase tracking-wider text-olive-400 block mb-1">
                    {s.category}
                  </span>

                  <h3 className="font-display font-bold text-lg text-sand-50 mb-3 group-hover:text-lime-accent transition-colors">
                    {s.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-sand-300 leading-relaxed mb-6">
                    {s.description}
                  </p>
                </div>

                {/* Step Deliverable Footer */}
                <div className="pt-4 border-t border-forest-800/80 flex flex-col gap-1 text-[11px] font-mono">
                  <div className="text-olive-400 text-[10px] uppercase">Artifact Deliverable</div>
                  <div className="text-sand-100 font-semibold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-lime-accent animate-pulse" />
                    <span>{s.deliverable}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Traceability Callout */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 p-6 rounded-xl bg-forest-950 border border-forest-800 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-forest-900 border border-lime-dim flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-lime-accent" />
            </div>
            <div>
              <div className="font-display font-semibold text-sand-50 text-sm">Chain of Custody & Verification</div>
              <div className="text-xs text-sand-400">All intermediate imagery, 3D meshes, and density parameters are preserved for spatial audits.</div>
            </div>
          </div>
          <a
            href="#methodology"
            className="shrink-0 px-4 py-2 rounded-lg bg-forest-900 hover:bg-forest-850 text-sand-100 text-xs font-mono uppercase tracking-wider border border-forest-700 hover:border-lime-dim flex items-center gap-2 transition-all duration-200"
          >
            <span>Review Methodology</span>
            <ArrowRight className="w-3.5 h-3.5 text-lime-accent" />
          </a>
        </motion.div>

      </div>
    </section>
  );
};
