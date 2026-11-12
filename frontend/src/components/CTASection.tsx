import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, ShieldCheck, Compass, Sparkles } from 'lucide-react';

interface CTASectionProps {
  onExploreClick?: () => void;
}

export const CTASection: React.FC<CTASectionProps> = ({ onExploreClick }) => {
  return (
    <section className="py-24 bg-charcoal-950 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-geo-grid opacity-20 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-radial from-forest-700/30 via-lime-dim/10 to-transparent blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="rounded-3xl border border-forest-700/80 bg-forest-950/80 p-8 sm:p-14 lg:p-16 shadow-elevated relative overflow-hidden"
        >
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest-900 border border-lime-dim/60 text-[11px] font-mono uppercase tracking-widest text-lime-accent mb-6 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>ACCELERATING AGRICULTURAL AUDITING</span>
          </div>

          {/* Heading */}
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-sand-50 tracking-tight leading-[1.15] mb-6 max-w-3xl mx-auto">
            Bringing Field Intelligence Closer to{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-accent via-emerald-400 to-lime-accent">
              Every Harvest.
            </span>
          </h2>

          {/* Supporting Text */}
          <p className="text-sand-300 text-sm sm:text-base max-w-2xl mx-auto font-normal leading-relaxed mb-10">
            Explore a new approach to agricultural field assessment through aerial imagery, geospatial intelligence, and photogrammetric analysis.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onExploreClick}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-lime-accent hover:bg-lime-glow text-charcoal-950 font-semibold font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-subtle-glow hover:shadow-lg transition-all"
            >
              <span>Explore AgriSentinel</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>

            <a
              href="#technology"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-forest-900 hover:bg-forest-850 text-sand-100 font-medium font-mono text-xs uppercase tracking-wider border border-forest-700 hover:border-lime-dim flex items-center justify-center gap-2 transition-all"
            >
              <Compass className="w-4 h-4 text-olive-300" />
              <span>System Specifications</span>
            </a>
          </div>

          {/* Project Footnote */}
          <div className="mt-10 pt-6 border-t border-forest-800/80 flex flex-wrap items-center justify-center gap-6 text-[11px] font-mono text-olive-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-lime-accent" />
              <span>Evidence-Based Yield Validation</span>
            </span>
            <span>·</span>
            <span>B.Tech Robotics & AI Capstone</span>
            <span>·</span>
            <span>Open Source Architecture</span>
          </div>
        </motion.div>

      </div>
    </section>
  );
};
