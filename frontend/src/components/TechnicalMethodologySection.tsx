import React from 'react';
import { motion } from 'framer-motion';
import { 
  Cpu,
  Plane,
  CheckCircle2,
  Radio
} from 'lucide-react';

export const TechnicalMethodologySection: React.FC = () => {
  const specs = [
    {
      category: 'UAV Flight Platform & GNSS',
      specs: [
        { label: 'RTK Positioning Precision', value: 'Horizontal ±1.0 cm • Vertical ±1.5 cm' },
        { label: 'Survey Flight Altitude', value: '30m – 45m Above Ground Level (AGL)' },
        { label: 'Ground Sampling Distance (GSD)', value: '1.2 cm per pixel at 35m AGL' },
        { label: 'Photogrammetric Overlap', value: '80% Forward Overlap • 75% Lateral Overlap' },
      ]
    },
    {
      category: 'Multispectral Sensor Array',
      specs: [
        { label: 'RGB Imaging Payload', value: '20.0 Megapixel Global Shutter Sensor' },
        { label: 'Multispectral Bands', value: 'Blue (450nm), Green (560nm), Red (650nm)' },
        { label: 'Vegetation Health Bands', value: 'RedEdge (730nm), Near-Infrared NIR (840nm)' },
        { label: 'Radiometric Calibration', value: 'Downwelling Light Sensor (DLS) & Calibrated Reflectance' },
      ]
    }
  ];

  const equations = [
    {
      title: '1. Geodesic Cadastral Polygon Area',
      latex: 'A = R² / 2 · ∑ (λ_{i+1} - λ_i) · (2 + sin φ_i + sin φ_{i+1})',
      description: 'Computes authentic ellipsoidal surface area on WGS84 ellipsoid without planar projection distortion.',
      badge: 'POSTGIS GEOGRAPHY'
    },
    {
      title: '2. 3D Mesh Volume Divergence Integration',
      latex: 'V = 1/6 · ∑ [ v_{i,1} · (v_{i,2} × v_{i,3}) ]',
      description: 'Integrates closed triangulated surface mesh facets into precise cubic meter displacement.',
      badge: 'SURFACE PHOTOGRAMMETRY'
    },
    {
      title: '3. Bulk-Density Calibrated Harvest Mass',
      latex: 'Mass (Quintals) = (V × ρ_bulk × (1 - σ_settling)) / 100',
      description: 'Translates geometric volume into metric mass using empirical paddy density benchmarks (ρ = 578 kg/m³).',
      badge: 'AGRONOMIC CALIBRATION'
    }
  ];

  return (
    <section id="methodology" className="py-24 bg-[#F8FAFC] border-b border-gray-200 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] font-mono font-semibold uppercase tracking-wider text-[#008C45] mb-3"
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>RIGOROUS TECHNICAL ARCHITECTURE</span>
          </motion.div>

          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-display font-extrabold text-3xl sm:text-4xl text-[#0f2e1e] tracking-tight"
          >
            Technical Methodology & Mathematical Formulation
          </motion.h2>

          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-3 text-sm sm:text-base text-gray-600 font-normal leading-relaxed"
          >
            Open, verifiable mathematical and photogrammetric principles governing AgriSentinel’s geospatial processing pipelines.
          </motion.p>
        </div>

        {/* Top Split: Sensor Specs & Hardware Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {specs.map((group, idx) => (
            <div 
              key={group.category}
              className="p-6 rounded-2xl bg-white border border-gray-200 shadow-2xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-2 pb-3 mb-4 border-b border-gray-100">
                  {idx === 0 ? <Plane className="w-4 h-4 text-[#008C45]" /> : <Radio className="w-4 h-4 text-[#0284C7]" />}
                  <h3 className="font-display font-bold text-sm text-gray-900 uppercase tracking-wide">
                    {group.category}
                  </h3>
                </div>

                <div className="space-y-3">
                  {group.specs.map((item) => (
                    <div key={item.label} className="flex justify-between items-start text-xs gap-4">
                      <span className="text-gray-500 font-medium">{item.label}:</span>
                      <strong className="text-gray-900 font-mono text-right">{item.value}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Grid: 3 Core Mathematical Formulations */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {equations.map((eq, idx) => (
            <motion.div
              key={eq.title}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="p-6 rounded-2xl bg-white border border-gray-200 shadow-2xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100">
                  <span className="text-[10px] font-mono font-bold text-gray-400">EQUATION 0{idx + 1}</span>
                  <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-50 text-[#008C45] border border-emerald-200">
                    {eq.badge}
                  </span>
                </div>

                <h4 className="font-display font-bold text-sm text-gray-900 mb-3">
                  {eq.title}
                </h4>

                <div className="p-3 rounded-xl bg-gray-50 border border-gray-200/80 font-mono text-xs text-[#0f2e1e] font-bold text-center overflow-x-auto my-3">
                  {eq.latex}
                </div>

                <p className="text-xs text-gray-600 leading-relaxed font-normal">
                  {eq.description}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-gray-100 flex items-center gap-1.5 text-[11px] font-mono text-gray-400">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#008C45]" />
                <span>Deterministic Calculation Verified</span>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};
