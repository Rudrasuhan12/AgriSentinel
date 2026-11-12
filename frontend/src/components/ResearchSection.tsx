import React from 'react';
import { motion } from 'framer-motion';
import { FlaskConical, AlertCircle } from 'lucide-react';

export const ResearchSection: React.FC = () => {
  const researchQuestions = [
    {
      title: 'Low-Cost Commercial UAV Sensing',
      focus: 'Democratizing Aerial Surveying',
      text: 'Evaluating whether sub-$1,000 consumer UAVs with standard 1/2-inch RGB CMOS sensors can achieve the ground sampling distance (< 1 cm/px) required for volumetric grain mesh reconstruction without survey-grade LiDAR.'
    },
    {
      title: 'Photogrammetric Fidelity on Loose Grains',
      focus: 'Structure-from-Motion Challenges',
      text: 'Investigating how repetitive visual textures, self-shadowing, and grain surface reflectance affect keypoint matching and dense point cloud noise on loose unthreshed or threshed paddy piles.'
    },
    {
      title: 'Empirical Bulk-Density Dynamics',
      focus: 'Agronomic Calibration Model',
      text: 'Characterizing how non-uniform grain moisture gradients, settling compactions under gravity, and varietal kernel dimensions influence volumetric-to-mass conversion accuracy.'
    },
    {
      title: 'Geospatial Cadastral Traceability',
      focus: 'Field-to-Yield Auditing',
      text: 'Building a unified digital pipeline that binds satellite parcel demarcations to post-harvest heap metrics to replace subjective crop cutting sampling methods.'
    }
  ];

  return (
    <section id="research" className="py-24 bg-charcoal-900/60 relative overflow-hidden border-t border-forest-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-forest-900 border border-forest-700 text-[11px] font-mono uppercase tracking-widest text-lime-accent mb-4">
            <FlaskConical className="w-3.5 h-3.5" />
            <span>ACADEMIC RESEARCH & INQUIRY</span>
          </div>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-sand-50 tracking-tight">
            Scientific Inquiry & <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-accent to-emerald-400">
              Robotics Innovation.
            </span>
          </h2>
          <p className="text-sand-300 mt-4 text-base">
            AgriSentinel originated as an applied capstone inquiry in Robotics & Artificial Intelligence, systematically addressing the core experimental questions of aerial agricultural estimation.
          </p>
        </div>

        {/* Research Questions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {researchQuestions.map((item, idx) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              className="p-6 rounded-2xl bg-forest-950/70 border border-forest-800/90 hover:border-lime-dim/60 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-lime-accent font-semibold px-2 py-0.5 rounded bg-forest-900 border border-forest-700">
                    RESEARCH FOCUS 0{idx + 1}
                  </span>
                  <span className="text-xs font-mono text-olive-400">{item.focus}</span>
                </div>
                <h3 className="font-display font-bold text-lg text-sand-100 group-hover:text-lime-accent transition-colors mb-2">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-sand-300 leading-relaxed">
                  {item.text}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-forest-800/80 flex items-center justify-between text-[11px] font-mono text-olive-400">
                <span>Methodology: Experimental Trials</span>
                <span className="text-sand-300">Phase 3 Target</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Explicit Research Disclaimer Box */}
        <div className="p-6 rounded-2xl bg-forest-950 border border-lime-dim/40 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-forest-900 border border-lime-dim flex items-center justify-center shrink-0">
            <AlertCircle className="w-5 h-5 text-lime-accent" />
          </div>
          <div>
            <div className="font-display font-bold text-sand-100 text-sm">
              Notice of Scientific Scope & Experimental Status
            </div>
            <p className="text-xs text-sand-300 mt-1 leading-relaxed">
              Photogrammetric reconstruction fidelity on loose, uncompacted paddy heaps remains an active experimental research domain. AgriSentinel is actively modeling edge occlusion, ground-plane slope compensation, and grain settling parameters in planned laboratory and field trials.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
};
