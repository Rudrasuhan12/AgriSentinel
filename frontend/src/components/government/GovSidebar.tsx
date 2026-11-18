import React, { useState } from 'react';
import { 
  Building2, 
  ShieldCheck, 
  LogOut, 
  TrendingUp, 
  Map, 
  BarChart3, 
  Scan, 
  Scale, 
  FileText, 
  Filter, 
  RotateCcw, 
  ChevronDown, 
  ChevronRight, 
  MapPin, 
  X
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { GovTabType } from './GovHeader';
import { GovFilters, ODISHA_DISTRICTS } from './GovFilterBar';

interface GovSidebarProps {
  activeTab: GovTabType;
  onSelectTab: (tab: GovTabType) => void;
  filters: GovFilters;
  onFilterChange: React.Dispatch<React.SetStateAction<GovFilters>>;
  onApplyFilters: () => void;
  onResetFilters: () => void;
  user: any;
  onLogout: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export const GovSidebar: React.FC<GovSidebarProps> = ({
  activeTab,
  onSelectTab,
  filters,
  onFilterChange,
  onApplyFilters,
  onResetFilters,
  user,
  onLogout,
  isOpen,
  onClose
}) => {
  const [filterSectionOpen, setFilterSectionOpen] = useState<boolean>(true);

  const officialName = user?.full_name || user?.display_name || 'Dr. Subhashree Dash';
  const designation = 'District Agricultural Officer (DAO)';
  const employeeId = 'OD-AGRI-4091';

  const navItems = [
    { 
      id: 'overview' as GovTabType, 
      label: 'Executive Overview', 
      icon: TrendingUp,
      badge: 'Live'
    },
    { 
      id: 'gis' as GovTabType, 
      label: 'Cadastral GIS Demarcation', 
      icon: Map,
      badge: 'PostGIS'
    },
    { 
      id: 'analytics' as GovTabType, 
      label: 'Agricultural Analytics', 
      icon: BarChart3
    },
    { 
      id: 'audits' as GovTabType, 
      label: 'UAV Photogrammetry Audits', 
      icon: Scan,
      badge: '3D Mesh'
    },
    { 
      id: 'verification' as GovTabType, 
      label: 'Yield & Mandi Procurement', 
      icon: Scale
    },
    { 
      id: 'reports' as GovTabType, 
      label: 'Official Reports & Exports', 
      icon: FileText,
      badge: 'CSV'
    },
  ];

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    onFilterChange(prev => ({ ...prev, district: val }));
  };

  const handleSeasonChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    onFilterChange(prev => ({ ...prev, season: val }));
  };

  const handleVarietyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    onFilterChange(prev => ({ ...prev, cropVariety: val }));
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Main Sidebar Panel - Fixed 260px Width & Viewport-Locked Height */}
      <aside className={`
        fixed top-0 bottom-0 left-0 z-50 w-[260px] bg-white text-[#173B2D] flex flex-col border-r border-[#E2E8F0] shadow-sm select-none transition-transform duration-300 ease-in-out
        lg:sticky lg:top-0 lg:h-screen lg:shrink-0 lg:z-30 lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        
        {/* 1. Fixed Top: Sidebar Brand Header (#F8FAFC) */}
        <div className="p-3.5 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F8FAFC] shrink-0">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#168653] to-[#087443] flex items-center justify-center text-white shadow-sm shadow-[#168653]/20 group-hover:scale-105 transition-transform shrink-0">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-display font-extrabold text-sm tracking-tight text-[#173B2D] truncate">
                  Agri<span className="text-[#168653]">Sentinel</span>
                </span>
                <span className="text-[8.5px] font-mono px-1 py-0.2 rounded bg-[#E5F5EC] text-[#087443] border border-[#DCE5E0] font-bold shrink-0">
                  DPI
                </span>
              </div>
              <p className="text-[9.5px] text-[#64748B] font-mono tracking-tight leading-none mt-0.5 truncate">
                DA&FE • GOVT. OF ODISHA
              </p>
            </div>
          </Link>

          {/* Close button for mobile */}
          <button 
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-[#64748B] hover:text-[#173B2D] hover:bg-[#F0F7F3] lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 2. Fixed Top: Official Profile Card (#F0F7F3) */}
        <div className="p-2.5 mx-2.5 mt-2.5 rounded-xl bg-[#F0F7F3] border border-[#DCE5E0] shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#E5F5EC] border border-[#DCE5E0] flex items-center justify-center text-[#087443] text-[11px] font-bold shrink-0">
              {officialName.split(' ').map((n: string) => n[0]).slice(0, 2).join('')}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-[#173B2D] truncate">{officialName}</div>
              <div className="text-[9.5px] text-[#168653] font-mono flex items-center gap-1 truncate">
                <ShieldCheck className="w-3 h-3 text-[#168653] shrink-0" />
                <span className="truncate">{designation}</span>
              </div>
              <div className="text-[9px] text-[#64748B] font-mono">
                ID: {employeeId}
              </div>
            </div>
          </div>
        </div>

        {/* 3. Independently Scrollable Navigation & Administrative Scope */}
        <div className="flex-1 overflow-y-auto min-h-0 px-2 py-3 space-y-4 scrollbar-thin scrollbar-thumb-slate-200">
          
          <div>
            <div className="px-2 pb-1.5 text-[9.5px] font-mono font-bold tracking-wider text-[#168653] uppercase">
              DECISION MODULES
            </div>
            
            <nav className="space-y-0.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      onSelectTab(item.id);
                      if (window.innerWidth < 1024) onClose();
                    }}
                    className={`
                      w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-[11.5px] font-mono transition-all text-left group cursor-pointer
                      ${isActive 
                        ? 'bg-[#E5F5EC] text-[#087443] font-bold border-l-3.5 border-[#078448] shadow-2xs' 
                        : 'text-[#173B2D] hover:bg-[#F0F7F3] hover:text-[#087443]'}
                    `}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-[#087443]' : 'text-[#168653] group-hover:text-[#087443]'}`} />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge && (
                      <span className={`text-[8.5px] font-mono px-1 py-0.2 rounded font-semibold shrink-0 ml-1.5 ${
                        isActive 
                          ? 'bg-white text-[#087443] border border-[#DCE5E0]' 
                          : 'bg-[#F0F7F3] text-[#64748B] border border-[#E2E8F0]'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* 4. Administrative Hierarchy Filters Section */}
          <div className="pt-2 border-t border-[#E2E8F0]">
            <button
              type="button"
              onClick={() => setFilterSectionOpen(!filterSectionOpen)}
              className="w-full flex items-center justify-between px-2 pb-1.5 text-[9.5px] font-mono font-bold tracking-wider text-[#168653] uppercase hover:text-[#087443] transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-1.5">
                <Filter className="w-3 h-3 text-[#168653]" />
                <span>ADMINISTRATIVE SCOPE</span>
              </div>
              {filterSectionOpen ? <ChevronDown className="w-3 h-3 text-[#64748B]" /> : <ChevronRight className="w-3 h-3 text-[#64748B]" />}
            </button>

            {filterSectionOpen && (
              <div className="space-y-2 p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs font-mono">
                
                {/* State (Fixed) */}
                <div>
                  <label className="text-[9.5px] text-[#64748B] block mb-0.5">State</label>
                  <div className="px-2 py-1 rounded-md bg-white text-[#173B2D] border border-[#DCE5E0] font-semibold text-[11px] flex items-center gap-1.5">
                    <MapPin className="w-3 h-3 text-[#168653]" />
                    <span>Odisha</span>
                  </div>
                </div>

                {/* District Dropdown */}
                <div>
                  <label className="text-[9.5px] text-[#64748B] block mb-0.5">District Scope</label>
                  <select
                    value={filters.district}
                    onChange={handleDistrictChange}
                    className="w-full px-2 py-1 rounded-md bg-white text-[#173B2D] border border-[#DCE5E0] focus:outline-none focus:border-[#168653] text-[11px] font-mono cursor-pointer"
                  >
                    <option value="ALL">All 30 Districts</option>
                    {ODISHA_DISTRICTS.filter(d => d !== "All Districts").map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                {/* Season Dropdown */}
                <div>
                  <label className="text-[9.5px] text-[#64748B] block mb-0.5">Crop Season</label>
                  <select
                    value={filters.season}
                    onChange={handleSeasonChange}
                    className="w-full px-2 py-1 rounded-md bg-white text-[#173B2D] border border-[#DCE5E0] focus:outline-none focus:border-[#168653] text-[11px] font-mono cursor-pointer"
                  >
                    <option value="Kharif 2026-27">Kharif 2026-27</option>
                    <option value="Rabi 2025-26">Rabi 2025-26</option>
                    <option value="Summer 2026">Summer 2026</option>
                  </select>
                </div>

                {/* Crop Variety Filter */}
                <div>
                  <label className="text-[9.5px] text-[#64748B] block mb-0.5">Crop Variety</label>
                  <select
                    value={filters.cropVariety}
                    onChange={handleVarietyChange}
                    className="w-full px-2 py-1 rounded-md bg-white text-[#173B2D] border border-[#DCE5E0] focus:outline-none focus:border-[#168653] text-[11px] font-mono cursor-pointer"
                  >
                    <option value="ALL">All Varieties</option>
                    <option value="Swarna">Swarna (MTU-7029)</option>
                    <option value="Pooja">Pooja (CR 1009)</option>
                    <option value="Sambha">Sambha Mahsuri</option>
                    <option value="Lalat">Lalat</option>
                  </select>
                </div>

                {/* Action Buttons */}
                <div className="pt-1 flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={onApplyFilters}
                    className="flex-1 py-1.5 px-2 bg-[#087443] hover:bg-[#07643a] text-white font-bold rounded-md text-[11px] transition-colors shadow-2xs text-center cursor-pointer"
                  >
                    Apply Scope
                  </button>
                  <button
                    type="button"
                    onClick={onResetFilters}
                    className="p-1.5 bg-white hover:bg-[#F0F7F3] text-[#64748B] hover:text-[#173B2D] rounded-md border border-[#DCE5E0] transition-colors cursor-pointer"
                    title="Reset to All Districts"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </button>
                </div>

              </div>
            )}
          </div>

        </div>

        {/* 5. Fixed Bottom: System Status & Sign Out (ALWAYS VISIBLE WITHOUT SCROLLING) */}
        <div className="p-2.5 bg-[#F8FAFC] border-t border-[#E2E8F0] space-y-1.5 shrink-0 mt-auto">
          <div className="flex items-center justify-between text-[9.5px] font-mono text-[#64748B] px-1">
            <span className="flex items-center gap-1 text-[#168653] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#168653] animate-pulse" />
              <span>PostGIS 3.4 Connected</span>
            </span>
            <span className="text-[#64748B]">NIC-CERT</span>
          </div>

          <button
            type="button"
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg bg-white hover:bg-rose-50 text-rose-700 hover:text-rose-800 border border-rose-200 text-[11px] font-mono font-semibold transition-colors cursor-pointer shadow-2xs"
          >
            <LogOut className="w-3 h-3" />
            <span>Sign Out Official</span>
          </button>
        </div>

      </aside>
    </>
  );
};
