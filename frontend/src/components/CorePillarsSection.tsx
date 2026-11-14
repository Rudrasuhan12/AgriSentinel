import React from 'react';
import { motion } from 'framer-motion';
import { 
  Layers,
  Plane,
  Box,
  CheckCircle2,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

export const CorePillarsSection: React.FC = () => {
  const pillars = [
    {
      id: 'pillar-1',
      number: '01',
      title: 'Cadastral Land & Geospatial Registry',
      tagline: 'Authoritative Land Boundary Synchronization',
      description:
        'Connects agricultural landholdings directly to official Bhulekh land-record hierarchies and Local Government Directory (LGD) codes. Automatically resolves verified boundary polygons, centroid markers, and geodesic areas in PostGIS (EPSG:4326).',
      badge: 'CADASTRAL GIS REGISTRY',
      icon: Layers,
      accentColor: '#008C45',
      features: [
        'Bhulekh Schedule I Form 39-A synchronization',
        'PostGIS spatial polygon storage (EPSG:4326)',
        'Centroid marker auto-placement & bounding box fit',
        'Surrounding cadastral plot visual context'
      ],
      linkText: 'Explore GIS Registry',
      linkHref: '#gis-showcase'
    },
    {
      id: 'pillar-2',
      number: '02',
      title: 'UAV-Based Agricultural Survey',
      tagline: 'Autonomous Aerial Sensing & Crop Demarcation',
      description:
        'Executes autonomous RTK-guided aerial survey missions to capture ultra-high-resolution multispectral imagery. Computes normalized difference vegetation indices (NDVI) and creates centimeter-accurate orthomosaics with no crop disturbance.',
      badge: 'AUTONOMOUS AERIAL SURVEY',
      icon: Plane,
      accentColor: '#0284C7',
      features: [
        'RTK-GNSS centimeter-accurate positioning (±1.5cm)',
        'Multispectral sensing (Blue, Green, Red, RedEdge, NIR)',
        'Sub-2cm Ground Sampling Distance (GSD)',
        'Automated flight corridor boundary demarcation'
      ],
      linkText: 'View UAV Technology',
      linkHref: '#methodology'
    },
    {
      id: 'pillar-3',
      number: '03',
      title: 'AI-Powered 3D Volumetric Yield Assessment',
      tagline: 'Photogrammetric Mesh & Bulk-Density Yield Estimation',
      description:
        'Reconstructs harvested grain heaps into dense 3D point-clouds and surface meshes via Structure-from-Motion (SfM). Applies empirical laboratory bulk-density calibrations (578 kg/m³) to estimate exact harvested metric tonnage.',
      badge: 'VOLUMETRIC RECONSTRUCTION',
      icon: Box,
      accentColor: '#7C3AED',
      features: [
        '16,000+ vertex 3D point-cloud reconstruction',
        'Vertical precision RMSE ±1.4cm',
        'Empirical bulk-density calibration (578 kg/m³)',
        'Tamper-evident digital yield certificates'
      ],
      linkText: 'Explore 3D Reconstruction',
      linkHref: '#heap-reconstruction'
    }
  ];

  return (
    <section id="core-pillars" className="py-24 bg-[#F8FAFC] border-b border-gray-200 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] font-mono font-semibold uppercase tracking-wider text-[#008C45] mb-3"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>FOUNDATIONAL ARCHITECTURE</span>
          </motion.div>

          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-display font-extrabold text-3xl sm:text-4xl text-[#0f2e1e] tracking-tight"
          >
            The Three Core Pillars of AgriSentinel
          </motion.h2>

          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-3 text-sm sm:text-base text-gray-600 font-normal leading-relaxed"
          >
            An integrated, sovereign technology stack modeled after modern Digital Public Infrastructure to unify land governance, aerial remote sensing, and harvest verification.
          </motion.p>
        </div>

        {/* 3 Core Pillar Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {pillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <motion.div
                key={pillar.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.15 }}
                className="rounded-2xl border border-gray-200/90 bg-white p-7 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Top Badge & Number */}
                  <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                    <span 
                      className="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold tracking-wider"
                      style={{ 
                        backgroundColor: `${pillar.accentColor}12`,
                        color: pillar.accentColor,
                        border: `1px solid ${pillar.accentColor}30`
                      }}
                    >
                      {pillar.badge}
                    </span>
                    <span className="font-mono text-xs font-bold text-gray-400">
                      PILLAR {pillar.number}
                    </span>
                  </div>

                  {/* Icon & Heading */}
                  <div className="mt-5 flex items-center gap-3">
                    <div 
                      className="w-11 h-11 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs"
                      style={{ backgroundColor: pillar.accentColor }}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-lg text-gray-900 group-hover:text-[#008C45] transition-colors leading-snug">
                        {pillar.title}
                      </h3>
                    </div>
                  </div>

                  <p className="mt-3 text-xs font-semibold text-gray-700">
                    {pillar.tagline}
                  </p>

                  <p className="mt-2 text-xs text-gray-600 leading-relaxed font-normal">
                    {pillar.description}
                  </p>

                  {/* Feature Checklist */}
                  <div className="mt-5 pt-4 border-t border-gray-100 space-y-2">
                    {pillar.features.map((feat) => (
                      <div key={feat} className="flex items-start gap-2 text-xs text-gray-700">
                        <CheckCircle2 
                          className="w-3.5 h-3.5 shrink-0 mt-0.5" 
                          style={{ color: pillar.accentColor }} 
                        />
                        <span className="leading-tight">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card Footer Link */}
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <a
                    href={pillar.linkHref}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold hover:underline"
                    style={{ color: pillar.accentColor }}
                  >
                    <span>{pillar.linkText}</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </a>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
