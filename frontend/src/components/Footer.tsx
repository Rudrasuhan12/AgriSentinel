import React from 'react';
import { Scan } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-charcoal-950 border-t border-forest-800/80 pt-16 pb-12 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Main Footer Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-forest-800/80">
          
          {/* Brand & Purpose Column */}
          <div className="lg:col-span-5 flex flex-col items-start">
            <a href="#hero" className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-lg bg-forest-900 border border-lime-dim flex items-center justify-center">
                <Scan className="w-5 h-5 text-lime-accent" />
              </div>
              <span className="font-display font-bold text-xl tracking-tight text-sand-50">
                Agri<span className="text-lime-accent">Sentinel</span>
              </span>
            </a>

            <p className="text-xs sm:text-sm text-sand-400 font-normal leading-relaxed max-w-sm mb-6">
              UAV-Based Intelligent Agricultural Field Assessment and Paddy Yield Estimation System. An applied robotics & geospatial intelligence initiative for transparent harvest verification.
            </p>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-forest-900/60 border border-forest-700/80 text-[11px] font-mono text-olive-300">
              <span className="w-2 h-2 rounded-full bg-lime-accent animate-pulse" />
              <span>STATUS: RESEARCH & DEVELOPMENT (ACTIVE)</span>
            </div>
          </div>

          {/* Quick Navigation Links */}
          <div className="lg:col-span-2">
            <h4 className="text-xs font-mono uppercase tracking-widest text-sand-100 font-semibold mb-4">
              Platform
            </h4>
            <ul className="space-y-2.5 font-mono text-xs">
              <li>
                <a href="#hero" className="text-sand-400 hover:text-lime-accent transition-colors">
                  Overview
                </a>
              </li>
              <li>
                <a href="#about" className="text-sand-400 hover:text-lime-accent transition-colors">
                  The Problem
                </a>
              </li>
              <li>
                <a href="#workflow" className="text-sand-400 hover:text-lime-accent transition-colors">
                  Assessment Flow
                </a>
              </li>
              <li>
                <a href="#heap-reconstruction" className="text-sand-400 hover:text-lime-accent transition-colors">
                  3D Heap Studio
                </a>
              </li>
            </ul>
          </div>

          {/* Technology & Research Links */}
          <div className="lg:col-span-2">
            <h4 className="text-xs font-mono uppercase tracking-widest text-sand-100 font-semibold mb-4">
              Technology
            </h4>
            <ul className="space-y-2.5 font-mono text-xs">
              <li>
                <a href="#technology" className="text-sand-400 hover:text-lime-accent transition-colors">
                  Geospatial GIS
                </a>
              </li>
              <li>
                <a href="#technology" className="text-sand-400 hover:text-lime-accent transition-colors">
                  UAV Survey Paths
                </a>
              </li>
              <li>
                <a href="#technology" className="text-sand-400 hover:text-lime-accent transition-colors">
                  3D Photogrammetry
                </a>
              </li>
              <li>
                <a href="#methodology" className="text-sand-400 hover:text-lime-accent transition-colors">
                  Yield Physics Formula
                </a>
              </li>
              <li>
                <a href="#research" className="text-sand-400 hover:text-lime-accent transition-colors">
                  Academic Focus
                </a>
              </li>
            </ul>
          </div>

          {/* Project Contact & Academic Inquiries */}
          <div className="lg:col-span-3">
            <h4 className="text-xs font-mono uppercase tracking-widest text-sand-100 font-semibold mb-4">
              Academic Project Inquiry
            </h4>
            <p className="text-xs text-sand-400 leading-relaxed mb-4">
              Developed as a B.Tech Robotics & Artificial Intelligence final-year capstone project. Repository and documentation maintained via Git.
            </p>
            <div className="text-[11px] font-mono text-olive-400 flex flex-col gap-1.5">
              <div>Domain: Robotics, Photogrammetry & Agritech</div>
              <div>Affiliation: Final Year B.Tech Project</div>
              <div>Repository: Private Git Remote (GitHub)</div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-sand-400">
          <div>
            © 2026 AgriSentinel Contributors. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <span>License: MIT</span>
            <span>·</span>
            <span>Version: 0.1.0-alpha</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
