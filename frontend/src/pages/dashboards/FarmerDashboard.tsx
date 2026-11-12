import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Sprout, 
  MapPin, 
  Scan, 
  Layers, 
  FileText, 
  LogOut, 
  Plus, 
  TrendingUp, 
  Calendar,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const FarmerDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'fields' | 'harvests' | 'reports'>('overview');

  const farmerProfile = user?.farmer_profile;

  return (
    <div className="min-h-screen bg-charcoal-950 text-sand-100 flex flex-col">
      {/* Top Bar */}
      <header className="bg-charcoal-900 border-b border-forest-800/80 sticky top-0 z-30 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-forest-900 border border-lime-dim flex items-center justify-center text-lime-accent group-hover:scale-105 transition-transform">
              <Scan className="w-4 h-4" />
            </div>
            <div>
              <span className="font-display font-bold text-sm tracking-tight text-sand-50">
                Agri<span className="text-lime-accent">Sentinel</span>
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/30 text-emerald-300">
                FARMER PORTAL
              </span>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-xs font-semibold text-sand-50">{user?.full_name || user?.display_name}</span>
            <span className="text-[10px] font-mono text-olive-400">
              {farmerProfile ? `${farmerProfile.village}, ${farmerProfile.district}` : user?.email}
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

      {/* Navigation Tabs */}
      <div className="bg-charcoal-900/50 border-b border-forest-900 px-4 sm:px-8 flex gap-2 overflow-x-auto">
        {[
          { id: 'overview', label: 'Field Overview', icon: Layers },
          { id: 'fields', label: 'Registered Parcels', icon: MapPin },
          { id: 'harvests', label: 'Heap Reconstructions', icon: Scan },
          { id: 'reports', label: 'Yield Certificates', icon: FileText },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 py-3 px-3.5 text-xs font-mono uppercase tracking-wider border-b-2 transition-colors whitespace-nowrap ${
                active 
                  ? 'border-lime-accent text-lime-accent font-semibold' 
                  : 'border-transparent text-sand-400 hover:text-sand-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8 space-y-6">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-forest-900/80 via-forest-900/50 to-charcoal-900 border border-forest-800 rounded-2xl p-6 relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-xl sm:text-2xl font-display font-bold text-sand-50 mb-1">
              Namaste, {user?.full_name || user?.display_name}
            </h1>
            <p className="text-xs sm:text-sm text-sand-300 max-w-2xl">
              Welcome to your AgriSentinel monitoring center. Track your paddy crop growth, manage your land parcels, and access verified 3D photogrammetric yield estimates.
            </p>
          </div>
          <div className="absolute right-4 bottom-2 text-forest-800/40 pointer-events-none">
            <Sprout className="w-36 h-36" />
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-charcoal-900/80 border border-forest-800/70 rounded-xl p-4">
            <div className="flex items-center justify-between text-olive-400 mb-2">
              <span className="text-[11px] font-mono uppercase tracking-wider">Registered Area</span>
              <MapPin className="w-4 h-4 text-lime-accent" />
            </div>
            <div className="text-2xl font-bold font-mono text-sand-50">
              {farmerProfile?.total_land_holding_acres ? `${farmerProfile.total_land_holding_acres} Ac` : '4.50 Ac'}
            </div>
            <span className="text-[10px] text-lime-400 flex items-center gap-1 mt-1">
              <CheckCircle2 className="w-3 h-3" /> PostGIS Georeferenced
            </span>
          </div>

          <div className="bg-charcoal-900/80 border border-forest-800/70 rounded-xl p-4">
            <div className="flex items-center justify-between text-olive-400 mb-2">
              <span className="text-[11px] font-mono uppercase tracking-wider">Active Variety</span>
              <Sprout className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-sand-50">
              {farmerProfile?.crop_variety || 'Swarna (MTU)'}
            </div>
            <span className="text-[10px] text-sand-400 mt-1 block">
              Late Kharif Season 2026
            </span>
          </div>

          <div className="bg-charcoal-900/80 border border-forest-800/70 rounded-xl p-4">
            <div className="flex items-center justify-between text-olive-400 mb-2">
              <span className="text-[11px] font-mono uppercase tracking-wider">Estimated Volume</span>
              <TrendingUp className="w-4 h-4 text-teal-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-sand-50">
              128.4 m³
            </div>
            <span className="text-[10px] text-teal-400 mt-1 block">
              ~74.2 Quintals paddy mass
            </span>
          </div>

          <div className="bg-charcoal-900/80 border border-forest-800/70 rounded-xl p-4">
            <div className="flex items-center justify-between text-olive-400 mb-2">
              <span className="text-[11px] font-mono uppercase tracking-wider">Next UAV Survey</span>
              <Calendar className="w-4 h-4 text-yellow-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-sand-50">
              18 Nov 2026
            </div>
            <span className="text-[10px] text-yellow-400 mt-1 block">
              Post-harvest volumetric scan
            </span>
          </div>
        </div>

        {/* Active Fields Section */}
        <div className="bg-charcoal-900/80 border border-forest-800/70 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider font-mono text-sand-50">
                Registered Cadastral Parcels
              </h2>
              <p className="text-xs text-sand-400">
                Cadastral survey boundary maps tied to Odisha Bhulekh land records.
              </p>
            </div>
            <button className="px-3 py-1.5 rounded-lg bg-forest-800 hover:bg-forest-700 text-lime-accent text-xs font-mono flex items-center gap-1.5 transition-colors">
              <Plus className="w-3.5 h-3.5" />
              <span>Add Parcel</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-charcoal-950 border border-forest-800/80 hover:border-lime-dim transition-colors">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-bold text-sand-100 font-mono">PARCEL #OD-BHK-104</span>
                  <div className="text-[11px] text-olive-400 mt-0.5">Khata: 204/12 • Plot: 890</div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 border border-emerald-500/40 text-emerald-300">
                  Verified
                </span>
              </div>
              <div className="mt-3 pt-3 border-t border-forest-900 flex justify-between text-xs text-sand-300 font-mono">
                <span>Area: 2.80 Acres</span>
                <span className="text-lime-accent">NDVI Health: 0.74 (Healthy)</span>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-charcoal-950 border border-forest-800/80 hover:border-lime-dim transition-colors">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-bold text-sand-100 font-mono">PARCEL #OD-BHK-105</span>
                  <div className="text-[11px] text-olive-400 mt-0.5">Khata: 204/12 • Plot: 891</div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 border border-emerald-500/40 text-emerald-300">
                  Verified
                </span>
              </div>
              <div className="mt-3 pt-3 border-t border-forest-900 flex justify-between text-xs text-sand-300 font-mono">
                <span>Area: 1.70 Acres</span>
                <span className="text-amber-400">Harvest In Progress</span>
              </div>
            </div>
          </div>
        </div>

        {/* Photogrammetry Notice */}
        <div className="p-4 rounded-xl bg-forest-950/60 border border-lime-dim/40 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-lime-accent shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed text-sand-300">
            <span className="font-semibold text-sand-100">UAV Photogrammetry Protocol:</span> Once threshing is completed in the threshing yard (Khala), inform your village agriculture field assistant to trigger the autonomous UAV volumetric scan before grain bagging.
          </div>
        </div>
      </main>
    </div>
  );
};
