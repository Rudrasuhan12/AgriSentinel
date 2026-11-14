import React from 'react';
import { 
  Scan
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#071F13] text-[#D1FAE5] border-t border-[#065F46] pt-16 pb-12 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Row: Mission Header & Identity */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-12 border-b border-[#0D3823] items-start">
          
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#008C45] to-[#005c2e] flex items-center justify-center text-white shadow-sm">
                <Scan className="w-5 h-5" />
              </div>
              <div>
                <span className="font-display font-bold text-xl text-white tracking-tight">
                  Agri<span className="text-[#34D399]">Sentinel</span>
                </span>
                <span className="block text-[11px] font-mono text-emerald-300">
                  UAV & Geospatial Intelligence Platform
                </span>
              </div>
            </div>

            <p className="text-xs text-emerald-200/80 leading-relaxed max-w-sm font-normal">
              A foundational Digital Public Infrastructure linking cadastral land registries, autonomous UAV photogrammetry, and 3D volumetric grain assessment for verifiable agricultural governance.
            </p>

            <div className="flex items-center gap-2 pt-2 text-[10px] font-mono text-emerald-300">
              <span className="px-2 py-0.5 rounded bg-[#064E3B] border border-[#065F46]">DILRMP COMPLIANT</span>
              <span className="px-2 py-0.5 rounded bg-[#064E3B] border border-[#065F46]">OGC WFS READY</span>
              <span className="px-2 py-0.5 rounded bg-[#064E3B] border border-[#065F46]">EPSG:4326</span>
            </div>
          </div>

          <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-6 text-xs">
            
            {/* Column 1: Platform Portals */}
            <div className="space-y-3">
              <span className="font-mono text-[11px] font-bold text-white uppercase tracking-wider block">
                STAKEHOLDER PORTALS
              </span>
              <ul className="space-y-2 text-emerald-200/80">
                <li>
                  <Link to="/login" state={{ defaultRole: 'FARMER' }} className="hover:text-white transition-colors">
                    Farmer Producer Portal
                  </Link>
                </li>
                <li>
                  <Link to="/login" state={{ defaultRole: 'OFFICIAL' }} className="hover:text-white transition-colors">
                    Official Inspection Portal
                  </Link>
                </li>
                <li>
                  <Link to="/login" state={{ defaultRole: 'ADMIN' }} className="hover:text-white transition-colors">
                    Operations & Admin Console
                  </Link>
                </li>
                <li>
                  <Link to="/signup" className="hover:text-white transition-colors">
                    Register New Account
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 2: Geospatial & Technical */}
            <div className="space-y-3">
              <span className="font-mono text-[11px] font-bold text-white uppercase tracking-wider block">
                GEOSPATIAL STACK
              </span>
              <ul className="space-y-2 text-emerald-200/80">
                <li><a href="#core-pillars" className="hover:text-white transition-colors">Cadastral Registry</a></li>
                <li><a href="#heap-reconstruction" className="hover:text-white transition-colors">3D Heap Photogrammetry</a></li>
                <li><a href="#gis-showcase" className="hover:text-white transition-colors">Satellite GIS Demarcation</a></li>
                <li><a href="#methodology" className="hover:text-white transition-colors">Bulk Density Formulation</a></li>
                <li><a href="#platform-stats" className="hover:text-white transition-colors">LGD Administrative Master</a></li>
              </ul>
            </div>

            {/* Column 3: Institutional Governance */}
            <div className="space-y-3">
              <span className="font-mono text-[11px] font-bold text-white uppercase tracking-wider block">
                INSTITUTIONAL
              </span>
              <ul className="space-y-2 text-emerald-200/80">
                <li><span className="text-emerald-300">State: Odisha (OD)</span></li>
                <li><span className="text-emerald-300">Coverage: 30 LGD Districts</span></li>
                <li><span className="text-emerald-300">Spatial Engine: PostGIS</span></li>
                <li><span className="text-emerald-300">System Version: v0.1.0</span></li>
                <li><span className="text-emerald-300">Status: Operational</span></li>
              </ul>
            </div>

          </div>

        </div>

        {/* Bottom Strip: Copyright & Disclaimers */}
        <div className="mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-emerald-300/70 gap-4">
          <div>
            © {new Date().getFullYear()} AgriSentinel Platform. Digital Public Infrastructure for Agriculture. All rights reserved.
          </div>

          <div className="flex items-center gap-4 text-xs font-sans text-emerald-200/80">
            <span className="hover:text-white transition-colors">Terms of Service</span>
            <span>•</span>
            <span className="hover:text-white transition-colors">Privacy Policy</span>
            <span>•</span>
            <span className="hover:text-white transition-colors">Security & Audit</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
