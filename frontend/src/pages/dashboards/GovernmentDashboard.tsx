import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Building2, 
  MapPin, 
  Scan, 
  FileCheck, 
  TrendingUp, 
  LogOut, 
  Users, 
  Search, 
  Filter,
  CheckCircle2,
  Clock,
  ShieldCheck
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const GovernmentDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'farmers' | 'assessments' | 'reports'>('overview');

  return (
    <div className="min-h-screen bg-charcoal-950 text-sand-100 flex flex-col">
      {/* Top Header */}
      <header className="bg-charcoal-900 border-b border-forest-800/80 sticky top-0 z-30 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-teal-950 border border-teal-500/40 flex items-center justify-center text-teal-400 group-hover:scale-105 transition-transform">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <span className="font-display font-bold text-sm tracking-tight text-sand-50">
                Agri<span className="text-teal-400">Sentinel</span>
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-mono px-1.5 py-0.5 rounded bg-teal-950/80 border border-teal-500/30 text-teal-300">
                GOVERNMENT & OFFICIALS
              </span>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-xs font-semibold text-sand-50">{user?.full_name || user?.display_name}</span>
            <span className="text-[10px] font-mono text-teal-400 flex items-center gap-1 justify-end">
              <ShieldCheck className="w-3 h-3 text-teal-400" />
              Verified Official
            </span>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-1.5 text-xs font-mono text-sand-300 hover:text-rose-400 px-3 py-1.5 rounded-lg border border-forest-800 hover:border-rose-900/50 bg-forest-950/60 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Navigation Sub-bar */}
      <div className="bg-charcoal-900/50 border-b border-forest-900 px-4 sm:px-8 flex gap-2 overflow-x-auto">
        {[
          { id: 'overview', label: 'Regional Overview', icon: TrendingUp },
          { id: 'farmers', label: 'Farmer Registry', icon: Users },
          { id: 'assessments', label: 'UAV Photogrammetry Audits', icon: Scan },
          { id: 'reports', label: 'Mandi Procurement Quotas', icon: FileCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 py-3 px-3.5 text-xs font-mono uppercase tracking-wider border-b-2 transition-colors whitespace-nowrap ${
                active 
                  ? 'border-teal-400 text-teal-400 font-semibold' 
                  : 'border-transparent text-sand-400 hover:text-sand-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8 space-y-6">
        {/* District Headline */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-charcoal-900/80 border border-forest-800 p-6 rounded-2xl">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-teal-400 uppercase tracking-widest mb-1">
              <MapPin className="w-3.5 h-3.5" />
              Odisha State • Bargarh District Command
            </div>
            <h1 className="text-xl sm:text-2xl font-display font-bold text-sand-50">
              Paddy Yield Assessment & Verification Portal
            </h1>
            <p className="text-xs text-sand-300 mt-1">
              Supervising Block-level UAV flight sorties, 3D point-cloud volumetric validation, and DBT procurement clearance.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="px-3 py-1.5 rounded-lg bg-teal-950 border border-teal-500/40 text-teal-300 text-xs font-mono">
              Live Season: Kharif 2026
            </span>
          </div>
        </div>

        {/* Aggregate Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-charcoal-900/80 border border-forest-800/70 rounded-xl p-4">
            <div className="text-[11px] font-mono text-olive-400 uppercase tracking-wider mb-1">Registered Farmers</div>
            <div className="text-2xl font-bold font-mono text-sand-50">1,482</div>
            <span className="text-[10px] text-teal-400 mt-1 block">+12% vs previous Kharif</span>
          </div>

          <div className="bg-charcoal-900/80 border border-forest-800/70 rounded-xl p-4">
            <div className="text-[11px] font-mono text-olive-400 uppercase tracking-wider mb-1">Mapped Acreage</div>
            <div className="text-2xl font-bold font-mono text-sand-50">4,920 Ac</div>
            <span className="text-[10px] text-lime-400 mt-1 block">PostGIS Georeferenced</span>
          </div>

          <div className="bg-charcoal-900/80 border border-forest-800/70 rounded-xl p-4">
            <div className="text-[11px] font-mono text-olive-400 uppercase tracking-wider mb-1">Photogrammetry Sorties</div>
            <div className="text-2xl font-bold font-mono text-sand-50">318 Sorties</div>
            <span className="text-[10px] text-yellow-400 mt-1 block">42 pending inspection</span>
          </div>

          <div className="bg-charcoal-900/80 border border-forest-800/70 rounded-xl p-4">
            <div className="text-[11px] font-mono text-olive-400 uppercase tracking-wider mb-1">Est. Harvest Mass</div>
            <div className="text-2xl font-bold font-mono text-sand-50">84,120 Qtl</div>
            <span className="text-[10px] text-teal-400 mt-1 block">Confidence: ±3.8%</span>
          </div>
        </div>

        {/* Recent Assessment Table */}
        <div className="bg-charcoal-900/80 border border-forest-800/70 rounded-xl p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider font-mono text-sand-50">
                Recent Heap Photogrammetry Audits
              </h2>
              <p className="text-xs text-sand-400">
                Audited volumetric 3D reconstruction records ready for Mandi procurement tokens.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-sand-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter farmer / plot..."
                  className="bg-charcoal-950 border border-forest-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-sand-200 placeholder:text-sand-500 focus:outline-none focus:border-teal-400"
                />
              </div>
              <button className="px-3 py-1.5 rounded-lg bg-forest-900 border border-forest-800 text-sand-300 hover:text-sand-100 text-xs font-mono flex items-center gap-1.5">
                <Filter className="w-3 h-3" /> Filter
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-forest-800 text-olive-400">
                  <th className="pb-3 font-normal">Farmer Name</th>
                  <th className="pb-3 font-normal">Plot / Khata</th>
                  <th className="pb-3 font-normal">Variety</th>
                  <th className="pb-3 font-normal">Heap Volume</th>
                  <th className="pb-3 font-normal">Est. Mass</th>
                  <th className="pb-3 font-normal">Audit Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-forest-900/60">
                <tr className="hover:bg-forest-950/40">
                  <td className="py-3 text-sand-100 font-sans font-medium">Birendra Sahu</td>
                  <td className="py-3 text-sand-300">Khata 112 • Plot 418</td>
                  <td className="py-3 text-sand-300">Swarna MTU-7029</td>
                  <td className="py-3 text-teal-400 font-bold">142.3 m³</td>
                  <td className="py-3 text-sand-100">82.1 Quintals</td>
                  <td className="py-3">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-emerald-950 border border-emerald-500/40 text-emerald-300">
                      <CheckCircle2 className="w-2.5 h-2.5" /> Approved
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-forest-950/40">
                  <td className="py-3 text-sand-100 font-sans font-medium">Santosh Meher</td>
                  <td className="py-3 text-sand-300">Khata 87 • Plot 204</td>
                  <td className="py-3 text-sand-300">Pooja (CR 1009)</td>
                  <td className="py-3 text-teal-400 font-bold">96.8 m³</td>
                  <td className="py-3 text-sand-100">55.9 Quintals</td>
                  <td className="py-3">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-yellow-950 border border-yellow-500/40 text-yellow-300">
                      <Clock className="w-2.5 h-2.5" /> Calibration Review
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-forest-950/40">
                  <td className="py-3 text-sand-100 font-sans font-medium">Niranjan Padhan</td>
                  <td className="py-3 text-sand-300">Khata 194 • Plot 762</td>
                  <td className="py-3 text-sand-300">Sambha Mahsuri</td>
                  <td className="py-3 text-teal-400 font-bold">188.0 m³</td>
                  <td className="py-3 text-sand-100">109.5 Quintals</td>
                  <td className="py-3">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-emerald-950 border border-emerald-500/40 text-emerald-300">
                      <CheckCircle2 className="w-2.5 h-2.5" /> Approved
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};
