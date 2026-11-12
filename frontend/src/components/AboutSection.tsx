import React from 'react';
import { motion } from 'framer-motion';
import { Scale, ScanEye } from 'lucide-react';

export const AboutSection: React.FC = () => {
  const problemsAndSolutions = [
    {
      title: 'Spatial Demarcation Imperative',
      description: 'Field boundaries are frequently disputed or approximated through visual recall. Accurate polygon georeferencing is mandatory to benchmark spatial harvest boundaries against land records.',
      category: 'Geospatial Integrity',
    },
    {
      title: 'The Volume-to-Mass Disconnect',
      description: 'While drone photogrammetry can reconstruct 3D heap meshes with sub-centimeter point density, geometric volume alone does not indicate harvested tonnage.',
      category: 'Physical Calibration',
    },
    {
      title: 'Bulk Density Calibration Required',
      description: 'Paddy bulk density varies significantly with moisture content, husk thickness, grain variety, and settling factor. Empirical laboratory calibration is essential to bridge volume into reliable metric mass.',
      category: 'Agronomic Rigor',
    },
    {
      title: 'Traceable Verification Workflow',
      description: 'Traditional crop cutting experiments (CCEs) suffer from human sampling bias. Integrating registered plot polygons with heap photogrammetry yields an end-to-end auditable harvest trail.',
      category: 'Evidence-Based Reporting',
    },
  ];

  return (
    <section id="about" className="py-24 bg-charcoal-950 relative overflow-hidden">
      {/* Background radial gradient accent */}
      <div className="absolute top-1/2 -left-48 w-96 h-96 bg-forest-900/40 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Editorial Split Header */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-end mb-16 pb-8 border-b border-forest-800/80">
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-forest-900/60 border border-forest-700/80 text-[11px] font-mono uppercase tracking-widest text-lime-accent mb-4">
              <ScanEye className="w-3.5 h-3.5" />
              <span>THE AGRICULTURAL ASSESSMENT CHALLENGE</span>
            </div>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-sand-50 tracking-tight leading-[1.12]">
              Understanding Agriculture <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sand-100 via-lime-accent/90 to-emerald-400">
                Beyond the Surface.
              </span>
            </h2>
          </div>

          <div className="lg:col-span-5">
            <p className="text-sm sm:text-base text-sand-300 font-normal leading-relaxed">
              Modern harvest auditing demands verifiable spatial boundaries and rigorous physical modeling. AgriSentinel integrates drone photogrammetry with agronomic bulk-density modeling to replace subjective grain estimation with transparent measurement.
            </p>
          </div>
        </div>

        {/* Editorial Layout: Image Canvas & Technical Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Visual Showcase Card */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-5 relative"
          >
            <div className="rounded-xl overflow-hidden border border-forest-700 bg-forest-950 shadow-2xl relative group">
              <img 
                src="https://images.unsplash.com/photo-1592982537447-7440770cbfc9?q=80&w=900&auto=format&fit=crop" 
                alt="Agricultural field inspection with rice paddy crop"
                className="w-full aspect-[4/5] object-cover filter contrast-[1.05] brightness-90 group-hover:scale-102 transition-transform duration-700" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950 via-charcoal-950/30 to-transparent" />
              
              {/* Overlay Callout Box */}
              <div className="absolute bottom-6 left-6 right-6 p-5 glass-panel rounded-lg border border-lime-dim shadow-xl">
                <div className="flex items-center gap-2 text-lime-accent text-xs font-mono font-semibold uppercase mb-1">
                  <Scale className="w-4 h-4" />
                  <span>The Fundamental Equation</span>
                </div>
                <div className="font-mono text-sand-100 text-sm font-semibold tracking-wide py-1 border-y border-forest-700/60 my-2">
                  Mass = Volume (m³) × ρ_bulk (kg/m³)
                </div>
                <p className="text-[11px] text-sand-300 leading-normal">
                  Accurate yield estimation requires combining 3D point cloud surface integration with laboratory-calibrated grain bulk density.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Key Insights & Principles */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            {problemsAndSolutions.map((item, idx) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
                className="p-5 rounded-xl bg-forest-950/60 border border-forest-800/80 hover:border-lime-dim/50 hover:bg-forest-900/40 transition-all group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-lime-accent font-semibold px-2 py-0.5 rounded bg-forest-900 border border-forest-700">
                    {item.category}
                  </span>
                  <span className="text-xs font-mono text-olive-400">0{idx + 1}</span>
                </div>
                <h3 className="font-display font-bold text-lg text-sand-100 group-hover:text-lime-accent transition-colors">
                  {item.title}
                </h3>
                <p className="text-sm text-sand-300 mt-2 leading-relaxed">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
};
