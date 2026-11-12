import React from 'react';
import { motion } from 'framer-motion';
import { Plane, Map, Boxes, Calculator } from 'lucide-react';

export const MetricsStrip: React.FC = () => {
  const pillars = [
    {
      title: 'UAV-Based Assessment',
      subtitle: 'Nadir & oblique aerial survey workflows',
      modality: 'Aerial Sensing',
      icon: Plane,
    },
    {
      title: 'Geospatial Field Mapping',
      subtitle: 'Satellite basemap registration & boundary demarcation',
      modality: 'GIS & Polygons',
      icon: Map,
    },
    {
      title: '3D Photogrammetry',
      subtitle: 'SfM & dense point cloud heap reconstruction',
      modality: 'Volumetric Meshing',
      icon: Boxes,
    },
    {
      title: 'Data-Driven Yield Estimation',
      subtitle: 'Bulk-density calibrated mass & spatial yield output',
      modality: 'Agronomic Analytics',
      icon: Calculator,
    },
  ];

  return (
    <section className="relative z-20 bg-charcoal-900/90 border-y border-forest-800/80 py-8 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {pillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <motion.div
                key={pillar.title}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
                className="flex items-start gap-4 p-3 rounded-lg hover:bg-forest-900/30 transition-colors border border-transparent hover:border-forest-700/50 group"
              >
                <div className="w-10 h-10 rounded-md bg-forest-950 border border-forest-700/80 flex items-center justify-center shrink-0 group-hover:border-lime-dim transition-colors shadow-sm">
                  <Icon className="w-5 h-5 text-lime-accent group-hover:scale-110 transition-transform" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-olive-400 font-medium">
                    {pillar.modality}
                  </span>
                  <h3 className="font-display font-semibold text-sand-50 text-sm mt-0.5 group-hover:text-lime-accent transition-colors">
                    {pillar.title}
                  </h3>
                  <p className="text-xs text-sand-400 mt-1 leading-snug">
                    {pillar.subtitle}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

