import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
import { 
  Sprout, 
  MapPin, 
  Layers, 
  LogOut, 
  Plus, 
  TrendingUp, 
  Calendar,
  CheckCircle2,
  LayoutDashboard,
  Box,
  Award,
  Radio,
  Activity,
  Bell,
  User,
  HelpCircle,
  Menu,
  X,
  ChevronDown,
  Maximize2,
  Info,
  Compass,
  Check,
  PhoneCall,
  RefreshCw,
  AlertCircle,
  Globe,
  FileCheck
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { InteractiveGISParcelMap } from '../../components/gis/InteractiveGISParcelMap';
import { FieldRegistrationMapModal } from '../../components/gis/FieldRegistrationMapModal';

type SidebarTab = 
  | 'dashboard' 
  | 'parcels' 
  | 'reconstructions' 
  | 'certificates' 
  | 'surveys' 
  | 'analytics' 
  | 'notifications' 
  | 'profile' 
  | 'support';

interface ParcelItem {
  id: string;
  parcel_code: string;
  khata_number: string;
  plot_number: string;
  state: string;
  district: string;
  sub_district: string;
  village: string;
  primary_crop: string;
  area_acres: number;
  geojson_geometry?: any;
  cadastral_source: string;
  verification_status: string;
  created_at: string;
  latest_ndvi?: number;
  latest_observation_date?: string;
}

interface DashboardSummary {
  farmer_name: string;
  farmer_email: string;
  farmer_location: string;
  total_registered_area_acres: number;
  parcels_count: number;
  verified_parcels_count: number;
  active_crop_variety: string;
  estimated_volume_m3?: number;
  estimated_mass_quintals?: number;
  volume_analysis_comparison?: string;
  next_uav_survey_date?: string;
  next_uav_survey_purpose?: string;
  photogrammetry_protocol_step: number;
  parcels: ParcelItem[];
  has_parcels: boolean;
  has_surveys: boolean;
  has_reconstructions: boolean;
  has_certificates: boolean;
}

export const FarmerDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<SidebarTab>('dashboard');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [showAddParcelModal, setShowAddParcelModal] = useState(false);
  const [showProtocolModal, setShowProtocolModal] = useState(false);

  // Live Backend Data States
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [surveys, setSurveys] = useState<any[]>([]);
  const [reconstructions, setReconstructions] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [supportContacts, setSupportContacts] = useState<any[]>([]);
  const [satelliteData, setSatelliteData] = useState<any | null>(null);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.get<DashboardSummary>('/api/farmer/dashboard-summary');
      setSummary(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch farmer dashboard data from server.');
    } finally {
      setLoading(false);
    }
  };

  const fetchTabDetails = async (tab: SidebarTab) => {
    try {
      if (tab === 'notifications') {
        const data = await api.get('/api/farmer/notifications');
        setNotifications(data);
      } else if (tab === 'surveys') {
        const data = await api.get('/api/farmer/surveys');
        setSurveys(data);
      } else if (tab === 'reconstructions') {
        const data = await api.get('/api/farmer/reconstructions');
        setReconstructions(data);
      } else if (tab === 'certificates') {
        const data = await api.get('/api/farmer/certificates');
        setCertificates(data);
      } else if (tab === 'support') {
        const data = await api.get('/api/farmer/support-contacts');
        setSupportContacts(data);
      } else if (tab === 'analytics' && summary?.parcels && summary.parcels.length > 0) {
        const firstParcel = summary.parcels[0];
        const data = await api.get(`/api/farmer/parcels/${firstParcel.id}/satellite`);
        setSatelliteData(data);
      }
    } catch (err) {
      console.warn('[FARMER] Notice during tab details fetch:', err);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  useEffect(() => {
    fetchTabDetails(activeTab);
  }, [activeTab]);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'parcels', label: 'My Parcels', icon: Box, badge: summary ? summary.parcels_count.toString() : undefined },
    { id: 'reconstructions', label: 'Yield Estimates', icon: TrendingUp },
    { id: 'surveys', label: 'UAV Surveys', icon: Radio },
    { id: 'certificates', label: 'Reports & Certificates', icon: Award },
    { id: 'analytics', label: 'Field Analytics', icon: Activity },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'support', label: 'Help & Support', icon: HelpCircle },
  ];

  const farmerName = summary?.farmer_name || user?.display_name || 'Farmer';
  const farmerEmail = summary?.farmer_email || user?.email || 'farmer@agrisentinel.local';
  const farmerLocation = summary?.farmer_location || 'Odisha, India';

  return (
    <div className="min-h-screen bg-[#F7F9F8] text-[#172B22] flex flex-row font-sans antialiased relative selection:bg-[#008C45]/20">
      
      {/* 1. PERMANENT COLLAPSIBLE LEFT SIDEBAR (DESKTOP) */}
      <aside 
        className={`hidden lg:flex flex-col bg-white border-r border-[#E2E9E4] sticky top-0 h-screen transition-all duration-300 z-30 shrink-0 ${
          isCollapsed ? 'w-[76px]' : 'w-[250px]'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center px-4 border-b border-[#E2E9E4] justify-between">
          <Link to="/" className="flex items-center gap-2.5 overflow-hidden group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#008C45] to-[#006B36] flex items-center justify-center text-white shrink-0 shadow-xs group-hover:scale-105 transition-transform">
              <div className="w-5 h-5 border-2 border-white/90 rounded border-dashed flex items-center justify-center">
                <span className="font-mono text-[9px] font-bold">AS</span>
              </div>
            </div>
            {!isCollapsed && (
              <div className="flex flex-col leading-none">
                <span className="font-display font-extrabold text-base text-[#172B22] tracking-tight">
                  Agri<span className="text-[#008C45]">Sentinel</span>
                </span>
                <span className="text-[9px] font-mono font-bold tracking-widest text-[#008C45] uppercase mt-0.5">
                  FARMER PORTAL
                </span>
              </div>
            )}
          </Link>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 py-4 px-2.5 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as SidebarTab)}
                title={isCollapsed ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group relative cursor-pointer ${
                  isActive 
                    ? 'bg-[#ECFDF5] text-[#008C45] shadow-2xs font-bold border border-[#A7F3D0]/60' 
                    : 'text-[#475569] hover:bg-slate-50 hover:text-[#172B22]'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 transition-colors ${
                  isActive ? 'text-[#008C45]' : 'text-slate-400 group-hover:text-[#172B22]'
                }`} />

                {!isCollapsed && (
                  <span className="truncate flex-1 text-left">{item.label}</span>
                )}

                {!isCollapsed && item.badge && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-[#ECFDF5] text-[#008C45] border border-[#A7F3D0]">
                    {item.badge}
                  </span>
                )}

                {/* Tooltip in collapsed mode */}
                {isCollapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 rounded bg-[#172B22] text-white text-[11px] font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-md">
                    {item.label}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* GPS Cadastral Sync Widget */}
        {!isCollapsed && (
          <div className="px-4 py-2 border-t border-[#E2E9E4] bg-gradient-to-b from-white to-[#F7F9F8]">
            <div className="rounded-xl bg-[#ECFDF5]/60 border border-[#A7F3D0]/50 p-2.5 flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#008C45] flex items-center justify-center text-white shrink-0">
                <Compass className="w-3.5 h-3.5 animate-spin-slow" />
              </div>
              <div className="text-[10px] leading-tight">
                <span className="font-bold text-[#008C45] block">PostGIS Spatial Engine</span>
                <span className="text-slate-500 font-mono text-[9px]">SRID: 4326 (WGS84)</span>
              </div>
            </div>
          </div>
        )}

        {/* Sidebar Collapse Toggle */}
        <div className="p-3 border-t border-[#E2E9E4] flex items-center justify-between">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-full py-1.5 px-2 rounded-lg border border-[#E2E9E4] hover:bg-slate-50 text-[#64746A] hover:text-[#172B22] text-[11px] font-mono flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Menu className="w-3.5 h-3.5" />
            {!isCollapsed && <span>Collapse Sidebar</span>}
          </button>
        </div>
      </aside>

      {/* MOBILE DRAWER */}
      {isMobileDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity" 
            onClick={() => setIsMobileDrawerOpen(false)} 
          />
          <div className="relative w-72 max-w-[80vw] bg-white h-full flex flex-col p-4 shadow-2xl z-10">
            <div className="flex items-center justify-between pb-4 border-b border-[#E2E9E4]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#008C45] flex items-center justify-center text-white font-bold text-xs">
                  AS
                </div>
                <span className="font-display font-bold text-base text-[#172B22]">AgriSentinel</span>
              </div>
              <button 
                onClick={() => setIsMobileDrawerOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 py-4 space-y-1 overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id as SidebarTab);
                      setIsMobileDrawerOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive 
                        ? 'bg-[#ECFDF5] text-[#008C45] font-bold border border-[#A7F3D0]' 
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="pt-3 border-t border-[#E2E9E4]">
              <button
                onClick={logout}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-medium"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MAIN WRAPPER */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        
        {/* 2. TOP HEADER */}
        <header className="h-16 bg-white border-b border-[#E2E9E4] sticky top-0 z-20 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileDrawerOpen(true)}
              className="lg:hidden p-2 rounded-lg border border-[#E2E9E4] hover:bg-slate-50 text-slate-600"
            >
              <Menu className="w-4 h-4" />
            </button>

            <div>
              <h1 className="font-display font-bold text-base sm:text-lg text-[#172B22] capitalize flex items-center gap-2">
                <span>Farmer Portal</span>
                <span className="text-slate-300 font-normal">/</span>
                <span className="text-xs font-mono font-medium text-[#008C45] bg-[#ECFDF5] px-2 py-0.5 rounded-full border border-[#A7F3D0]/60">
                  {activeTab.toUpperCase()}
                </span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            
            <button
              onClick={fetchSummary}
              disabled={loading}
              className="p-2 rounded-xl border border-[#E2E9E4] hover:bg-slate-50 text-slate-600 transition-colors"
              title="Refresh Live Data"
            >
              <RefreshCw className={`w-4 h-4 text-[#008C45] ${loading ? 'animate-spin' : ''}`} />
            </button>

            <button 
              onClick={() => setActiveTab('notifications')}
              className="relative p-2 rounded-xl border border-[#E2E9E4] hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {summary && summary.parcels_count > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              )}
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="flex items-center gap-2.5 p-1 sm:pr-3 rounded-full sm:rounded-xl border border-[#E2E9E4] hover:border-[#008C45]/40 hover:bg-slate-50 transition-all cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] flex items-center justify-center text-[#008C45] font-bold text-xs">
                  <User className="w-4 h-4 text-[#008C45]" />
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-semibold text-[#172B22] leading-tight">
                    {farmerName}
                  </span>
                  <span className="text-[10px] font-mono text-[#008C45] flex items-center gap-1">
                    <Check className="w-2.5 h-2.5" />
                    Verified Farmer
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
              </button>

              {showProfileDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl border border-[#E2E9E4] shadow-lg py-2 z-50 text-xs">
                  <div className="px-4 py-2 border-b border-[#E2E9E4]">
                    <div className="font-semibold text-[#172B22]">{farmerName}</div>
                    <div className="text-[11px] font-mono text-slate-500 truncate">{farmerEmail}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{farmerLocation}</div>
                  </div>
                  <button
                    onClick={() => {
                      setActiveTab('profile');
                      setShowProfileDropdown(false);
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-slate-50 text-slate-700 flex items-center gap-2"
                  >
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>Farmer Profile & Bhulekh KYC</span>
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('support');
                      setShowProfileDropdown(false);
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-slate-50 text-slate-700 flex items-center gap-2"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                    <span>Official Krishi Support</span>
                  </button>
                  <div className="border-t border-[#E2E9E4] mt-1 pt-1">
                    <button
                      onClick={logout}
                      className="w-full px-4 py-2 text-left hover:bg-red-50 text-red-600 flex items-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </header>

        {/* 3. MAIN DASHBOARD CONTENT */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
          
          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* TAB 1: OVERVIEW DASHBOARD */}
          {activeTab === 'dashboard' && (
            <>
              {/* WELCOME HERO BANNER */}
              <div className="rounded-2xl border border-[#E2E9E4] bg-white overflow-hidden shadow-xs relative">
                <div className="grid grid-cols-1 md:grid-cols-12 items-center">
                  
                  {/* Left Content */}
                  <div className="p-6 sm:p-8 md:col-span-7 z-10">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">🍃</span>
                      <h2 className="font-display font-bold text-xl sm:text-2xl text-[#172B22] tracking-tight">
                        Namaste, <span className="text-[#008C45]">{farmerName}</span>
                      </h2>
                    </div>
                    <p className="text-xs sm:text-sm text-[#475569] leading-relaxed max-w-xl">
                      Welcome to your AgriSentinel monitoring center. Track your paddy crop growth, manage your land parcels, and access verified 3D photogrammetric yield estimates.
                    </p>
                    <div className="mt-4 flex flex-wrap items-center gap-2.5 text-[11px] font-mono text-[#008C45]">
                      <span className="px-2.5 py-1 rounded-md bg-[#ECFDF5] border border-[#A7F3D0]/80 flex items-center gap-1.5 font-semibold">
                        <CheckCircle2 className="w-3 h-3" />
                        Cadastral Parcels: {summary ? `${summary.parcels_count} Registered (${summary.total_registered_area_acres} Ac)` : 'Loading...'}
                      </span>
                      <span className="px-2.5 py-1 rounded-md bg-sky-50 text-sky-700 border border-sky-200 flex items-center gap-1.5 font-semibold">
                        <Globe className="w-3 h-3" />
                        Copernicus Sentinel-2: Active Overpass
                      </span>
                    </div>
                  </div>

                  {/* Right Aerial Field Visual with Drone Scanning */}
                  <div className="relative md:col-span-5 h-48 sm:h-56 md:h-full min-h-[190px] overflow-hidden bg-slate-900">
                    <img 
                      src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=900&auto=format&fit=crop" 
                      alt="Paddy fields surveyed by drone" 
                      className="w-full h-full object-cover object-center filter saturate-[1.1]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-white via-white/20 to-transparent md:block hidden pointer-events-none" />

                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="relative">
                        <div className="w-16 h-10 rounded-lg bg-black/80 backdrop-blur-md border border-lime-400/60 p-1 flex items-center justify-center text-lime-400 shadow-xl">
                          <Radio className="w-5 h-5 text-lime-400 animate-pulse" />
                        </div>
                        <svg className="w-32 h-20 -mt-1 mx-auto opacity-80" viewBox="0 0 100 60">
                          <polygon points="50,0 10,60 90,60" fill="url(#greenBeamGradient)" stroke="#38ef7d" strokeWidth="0.8" strokeDasharray="3,3" />
                          <line x1="50" y1="0" x2="30" y2="60" stroke="#38ef7d" strokeWidth="0.5" />
                          <line x1="50" y1="0" x2="70" y2="60" stroke="#38ef7d" strokeWidth="0.5" />
                          <defs>
                            <linearGradient id="greenBeamGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#38ef7d" stopOpacity="0.5" />
                              <stop offset="100%" stopColor="#38ef7d" stopOpacity="0.05" />
                            </linearGradient>
                          </defs>
                        </svg>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* 4. KEY SUMMARY METRIC CARDS (REAL API DATA) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* Card 1: Registered Area */}
                <div className="bg-emerald-50/40 border border-[#A7F3D0] rounded-2xl p-4 sm:p-5 shadow-xs relative overflow-hidden">
                  <div className="flex items-center justify-between text-xs font-mono font-bold uppercase text-[#008C45] mb-2 tracking-wider">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#008C45]" />
                      REGISTERED AREA
                    </span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold font-mono text-[#172B22]">
                    {summary ? `${summary.total_registered_area_acres.toFixed(2)} Ac` : '--'}
                  </div>
                  <div className="mt-2 flex items-center gap-1 text-[11px] font-mono font-semibold text-[#008C45]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#008C45]" />
                    <span>{summary && summary.verified_parcels_count > 0 ? `${summary.verified_parcels_count} Verified Parcels` : 'PostGIS Geo-referenced'}</span>
                  </div>
                  <div className="absolute right-3.5 bottom-3 text-[#008C45]/20 pointer-events-none">
                    <Box className="w-12 h-12" />
                  </div>
                </div>

                {/* Card 2: Active Variety */}
                <div className="bg-sky-50/40 border border-sky-200 rounded-2xl p-4 sm:p-5 shadow-xs relative overflow-hidden">
                  <div className="flex items-center justify-between text-xs font-mono font-bold uppercase text-sky-700 mb-2 tracking-wider">
                    <span className="flex items-center gap-1.5">
                      <Sprout className="w-3.5 h-3.5 text-sky-600" />
                      ACTIVE VARIETY
                    </span>
                  </div>
                  <div className="text-xl sm:text-2xl font-bold font-display text-[#172B22] truncate">
                    {summary?.active_crop_variety || 'Paddy (Swarna MTU)'}
                  </div>
                  <div className="mt-2 text-[11px] font-mono text-slate-600 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Kharif Season 2026</span>
                  </div>
                  <div className="absolute right-3.5 bottom-2.5 text-amber-500/25 pointer-events-none">
                    <Sprout className="w-12 h-12" />
                  </div>
                </div>

                {/* Card 3: Estimated Volume */}
                <div className="bg-purple-50/40 border border-purple-200 rounded-2xl p-4 sm:p-5 shadow-xs relative overflow-hidden">
                  <div className="flex items-center justify-between text-xs font-mono font-bold uppercase text-purple-700 mb-2 tracking-wider">
                    <span className="flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-purple-600" />
                      ESTIMATED VOLUME
                    </span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold font-mono text-[#172B22]">
                    {summary?.has_reconstructions && summary.estimated_volume_m3 ? (
                      `${summary.estimated_volume_m3} m³`
                    ) : (
                      <span className="text-lg text-slate-400 font-sans font-medium">Pending Survey</span>
                    )}
                  </div>
                  <div className="mt-2 flex items-center gap-1 text-[11px] font-mono font-semibold text-purple-700">
                    <TrendingUp className="w-3.5 h-3.5 text-purple-600" />
                    <span>
                      {summary?.has_reconstructions && summary.estimated_mass_quintals ? (
                        `~${summary.estimated_mass_quintals} Quintals mass`
                      ) : (
                        'Volumetric scan required'
                      )}
                    </span>
                  </div>
                  <div className="absolute right-3.5 bottom-3 text-purple-500/20 pointer-events-none">
                    <Activity className="w-12 h-12" />
                  </div>
                </div>

                {/* Card 4: Next UAV Survey */}
                <div className="bg-amber-50/40 border border-amber-200 rounded-2xl p-4 sm:p-5 shadow-xs relative overflow-hidden">
                  <div className="flex items-center justify-between text-xs font-mono font-bold uppercase text-amber-800 mb-2 tracking-wider">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-amber-600" />
                      NEXT UAV SURVEY
                    </span>
                  </div>
                  <div className="text-xl sm:text-2xl font-bold font-mono text-[#172B22]">
                    {summary?.next_uav_survey_date ? (
                      summary.next_uav_survey_date
                    ) : (
                      <span className="text-lg text-slate-400 font-sans font-medium">Not Scheduled</span>
                    )}
                  </div>
                  <div className="mt-2 flex items-center gap-1 text-[11px] font-mono text-amber-700">
                    <Radio className="w-3.5 h-3.5 text-amber-600" />
                    <span>{summary?.next_uav_survey_purpose || 'Post-harvest volume scan'}</span>
                  </div>
                  <div className="absolute right-3.5 bottom-3 text-amber-500/20 pointer-events-none">
                    <Radio className="w-12 h-12" />
                  </div>
                </div>

              </div>

              {/* 5. REGISTERED CADASTRAL PARCELS SECTION */}
              <div className="bg-white border border-[#E2E9E4] rounded-2xl p-5 sm:p-6 shadow-xs">
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-[#E2E9E4]">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-[#ECFDF5] text-[#008C45] flex items-center justify-center">
                        <Box className="w-3.5 h-3.5" />
                      </div>
                      <h3 className="font-display font-bold text-base sm:text-lg text-[#172B22]">
                        Registered Cadastral Parcels
                      </h3>
                    </div>
                    <p className="text-xs text-[#64746A] mt-0.5">
                      Cadastral survey boundary maps tied to Odisha Bhulekh land records.
                    </p>
                  </div>

                  <button
                    onClick={() => setShowAddParcelModal(true)}
                    className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#008C45] to-[#006B36] hover:from-[#007a3c] hover:to-[#005c2e] text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer self-start sm:self-auto"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Parcel</span>
                  </button>
                </div>

                {loading ? (
                  <div className="py-12 text-center text-xs font-mono text-slate-500">
                    <RefreshCw className="w-6 h-6 text-[#008C45] animate-spin mx-auto mb-2" />
                    Loading PostGIS parcel geometries...
                  </div>
                ) : !summary || summary.parcels.length === 0 ? (
                  <div className="py-12 text-center rounded-xl border border-dashed border-[#E2E9E4] bg-[#F7F9F8] p-6 space-y-2">
                    <Box className="w-10 h-10 text-slate-400 mx-auto" />
                    <p className="text-sm font-semibold text-[#172B22]">No registered parcels found.</p>
                    <p className="text-xs text-[#64746A] max-w-md mx-auto">
                      Click the "+ Add Parcel" button above to delineate your agricultural field on the satellite map.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                    
                    {/* Parcel Cards */}
                    <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {summary.parcels.map((p) => {
                        const isVerified = p.verification_status === 'VERIFIED';
                        return (
                          <div 
                            key={p.id}
                            className="rounded-xl border border-[#E2E9E4] p-4 bg-white hover:border-[#008C45]/50 transition-all shadow-2xs flex flex-col justify-between"
                          >
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-mono font-bold text-xs text-[#172B22] flex items-center gap-1">
                                  <MapPin className="w-3.5 h-3.5 text-[#008C45]" />
                                  PARCEL #{p.parcel_code}
                                </span>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold ${
                                  isVerified
                                    ? 'bg-[#ECFDF5] text-[#008C45] border border-[#A7F3D0]'
                                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                                }`}>
                                  {isVerified ? '✓ Verified' : 'Pending Verification'}
                                </span>
                              </div>
                              <div className="text-xs text-slate-500 font-mono mb-2">
                                Khata: {p.khata_number} • Plot: {p.plot_number} • {p.district}
                              </div>
                            </div>
                            <div className="pt-3 border-t border-[#E2E9E4] flex items-center justify-between text-xs font-mono">
                              <span className="font-semibold text-[#172B22]">Area: {p.area_acres} Acres</span>
                              <span className="px-2 py-0.5 rounded bg-emerald-50 text-[#008C45] border border-emerald-200 text-[10px] font-semibold">
                                {p.latest_ndvi ? `NDVI: ${p.latest_ndvi} (Healthy)` : 'NDVI: Sentinel-2 Ready'}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Satellite GIS Demarcation Tile (Interactive Leaflet Map) */}
                    <div className="lg:col-span-4 relative group">
                      <InteractiveGISParcelMap 
                        parcels={summary.parcels} 
                        height="160px" 
                        interactive={false} 
                      />
                      <button
                        onClick={() => setShowMapModal(true)}
                        className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/70 backdrop-blur-xs text-white hover:bg-[#008C45] transition-colors z-20 cursor-pointer shadow-sm"
                        title="Open interactive GIS map"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                  </div>
                )}

              </div>

              {/* 6. UAV PHOTOGRAMMETRY PROTOCOL STEPPER */}
              <div className="bg-white border border-[#E2E9E4] rounded-2xl p-5 sm:p-6 shadow-xs">
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-3 border-b border-[#E2E9E4]">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-[#ECFDF5] text-[#008C45] flex items-center justify-center">
                      <Radio className="w-4 h-4 text-[#008C45]" />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-base sm:text-lg text-[#172B22]">
                        UAV Photogrammetry Protocol
                      </h3>
                      <p className="text-xs text-[#64746A] mt-0.5">
                        Once threshing is completed in the threshing yard (Khalia), inform your village agriculture field assistant to trigger the autonomous UAV volumetric scan before grain bagging.
                      </p>
                    </div>
                  </div>

                  <button 
                    onClick={() => setShowProtocolModal(true)}
                    className="px-3 py-1.5 rounded-lg border border-[#E2E9E4] hover:bg-slate-50 text-xs font-semibold text-[#008C45] flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer"
                  >
                    <Info className="w-3.5 h-3.5" />
                    <span>Learn More</span>
                  </button>
                </div>

                {/* 5-Step Progress Track */}
                <div className="relative pt-2 pb-4 overflow-x-auto">
                  <div className="min-w-[650px] grid grid-cols-5 gap-2 relative">
                    
                    {/* Track Line */}
                    <div className="absolute top-4 left-[10%] right-[10%] h-[2px] bg-slate-200 z-0">
                      <div 
                        className="h-full bg-[#008C45] transition-all duration-500" 
                        style={{ width: `${((summary?.photogrammetry_protocol_step || 1) - 1) * 25}%` }}
                      />
                    </div>

                    {[
                      { step: 1, title: '1. Crop Monitoring', desc: 'Field growth tracking (NDVI, Canopy)' },
                      { step: 2, title: '2. Threshing Completed', desc: 'Report at village threshing yard' },
                      { step: 3, title: '3. UAV Survey', desc: 'Autonomous volumetric scan of harvest' },
                      { step: 4, title: '4. Volume Estimation', desc: '3D model & yield calculation' },
                      { step: 5, title: '5. Yield Certificate', desc: 'Verified digital certificate for benefits' },
                    ].map((s) => {
                      const currentStep = summary?.photogrammetry_protocol_step || 1;
                      const isCompleted = s.step < currentStep;
                      const isCurrent = s.step === currentStep;

                      return (
                        <div key={s.step} className="flex flex-col items-center text-center relative z-10">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-xs transition-colors ${
                            isCompleted
                              ? 'bg-[#008C45] text-white'
                              : isCurrent
                              ? 'bg-white border-2 border-[#008C45] text-[#008C45] relative'
                              : 'bg-slate-100 border border-slate-300 text-slate-400'
                          }`}>
                            {isCompleted ? (
                              <Check className="w-4 h-4" />
                            ) : isCurrent ? (
                              <>
                                <Radio className="w-4 h-4 text-[#008C45]" />
                                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                              </>
                            ) : (
                              <span className="font-mono text-xs">{s.step}</span>
                            )}
                          </div>
                          <span className={`font-bold text-xs mt-2 ${isCurrent ? 'text-[#008C45]' : isCompleted ? 'text-[#172B22]' : 'text-slate-500'}`}>
                            {s.title}
                          </span>
                          <span className="text-[10px] text-[#64746A] mt-0.5">{s.desc}</span>
                        </div>
                      );
                    })}

                  </div>
                </div>

              </div>
            </>
          )}

          {/* TAB 2: MY PARCELS */}
          {activeTab === 'parcels' && (
            <div className="bg-white border border-[#E2E9E4] rounded-2xl p-6 shadow-xs space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-[#E2E9E4]">
                <div>
                  <h2 className="font-display font-bold text-xl text-[#172B22]">My Registered Cadastral Parcels</h2>
                  <p className="text-xs text-[#64746A] mt-0.5">Odisha Bhulekh geo-referenced cadastral map layers and boundary records.</p>
                </div>
                <button
                  onClick={() => setShowAddParcelModal(true)}
                  className="px-3.5 py-2 rounded-xl bg-[#008C45] text-white text-xs font-semibold flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Register New Parcel</span>
                </button>
              </div>

              {!summary || summary.parcels.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-500 bg-[#F7F9F8] rounded-xl border border-dashed border-[#E2E9E4]">
                  No registered parcels found. Click "Register New Parcel" to add your field boundaries.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {summary.parcels.map((p) => (
                    <div key={p.id} className="p-4 rounded-xl border border-[#E2E9E4] bg-[#F7F9F8] space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-sm text-[#172B22]">Plot No. {p.plot_number} (Parcel #{p.parcel_code})</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-100 text-[#008C45] font-bold">
                          {p.verification_status}
                        </span>
                      </div>
                      <div className="text-xs text-slate-600 space-y-1 font-mono">
                        <div>Khata Number: <strong>{p.khata_number}</strong></div>
                        <div>District: <strong>{p.district}</strong> • Tahasil: <strong>{p.sub_district}</strong></div>
                        <div>Recorded Area: <strong>{p.area_acres} Acres</strong></div>
                        <div>Crop: <strong>{p.primary_crop}</strong></div>
                        <div>Cadastral Source: <strong>{p.cadastral_source}</strong></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: YIELD ESTIMATES */}
          {activeTab === 'reconstructions' && (
            <div className="bg-white border border-[#E2E9E4] rounded-2xl p-6 shadow-xs space-y-6">
              <div className="pb-4 border-b border-[#E2E9E4]">
                <h2 className="font-display font-bold text-xl text-[#172B22]">3D Photogrammetric Heap Reconstructions</h2>
                <p className="text-xs text-[#64746A] mt-0.5">UAV high-density mesh volume estimation and quintal mass calculation.</p>
              </div>

              {reconstructions.length === 0 ? (
                <div className="py-14 text-center rounded-xl border border-dashed border-[#E2E9E4] bg-[#F7F9F8] p-6 space-y-2">
                  <Box className="w-10 h-10 text-slate-400 mx-auto" />
                  <p className="text-sm font-semibold text-[#172B22]">
                    3D reconstruction will be available after a completed UAV volumetric survey.
                  </p>
                  <p className="text-xs text-[#64746A] max-w-md mx-auto">
                    Once threshing is finished at the village yard, your field assistant triggers the survey to compute volumetric mass.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {reconstructions.map((r) => (
                    <div key={r.id} className="p-4 rounded-xl bg-[#F7F9F8] border border-[#E2E9E4] space-y-2">
                      <span className="font-mono text-xs font-bold text-[#172B22]">Parcel: {r.parcel_code}</span>
                      <div className="text-2xl font-bold font-mono text-[#008C45]">{r.volume_cubic_meters} m³</div>
                      <div className="text-xs text-slate-600 font-mono">Mass: <strong>{r.estimated_mass_quintals} Quintals</strong></div>
                      <div className="text-[10px] text-slate-400">Point Count: {r.point_cloud_count.toLocaleString()} pts</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: YIELD CERTIFICATES */}
          {activeTab === 'certificates' && (
            <div className="bg-white border border-[#E2E9E4] rounded-2xl p-6 shadow-xs space-y-6">
              <div className="pb-4 border-b border-[#E2E9E4]">
                <h2 className="font-display font-bold text-xl text-[#172B22]">Verified Yield Certificates</h2>
                <p className="text-xs text-[#64746A] mt-0.5">Official harvest certificates issued by authorized agricultural directorates.</p>
              </div>

              {certificates.length === 0 ? (
                <div className="py-14 text-center rounded-xl border border-dashed border-[#E2E9E4] bg-[#F7F9F8] p-6 space-y-2">
                  <Award className="w-10 h-10 text-slate-400 mx-auto" />
                  <p className="text-sm font-semibold text-[#172B22]">No verified yield certificates available.</p>
                  <p className="text-xs text-[#64746A] max-w-md mx-auto">
                    Certificates are formally issued by the District Agricultural Officer following volumetric analysis and official audit.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {certificates.map((c) => (
                    <div key={c.id} className="border border-[#E2E9E4] rounded-xl p-5 bg-[#F7F9F8] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="font-mono font-bold text-sm text-[#172B22]">{c.certificate_number}</div>
                        <div className="text-xs text-slate-600 mt-0.5">Verified Yield: <strong>{c.verified_yield_quintals} Quintals</strong> ({c.crop_variety})</div>
                        <div className="text-[11px] text-slate-400 mt-0.5 font-mono">Auth: {c.issuing_authority} • Issued: {new Date(c.issue_date).toLocaleDateString()}</div>
                      </div>
                      <button 
                        onClick={() => alert(`Certificate verified: ${c.certificate_number} (Hash: ${c.verification_hash.slice(0, 16)}...)`)}
                        className="px-3.5 py-2 rounded-xl bg-[#008C45] text-white text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto"
                      >
                        <FileCheck className="w-3.5 h-3.5" />
                        <span>Verify & Download</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: UAV SURVEYS */}
          {activeTab === 'surveys' && (
            <div className="bg-white border border-[#E2E9E4] rounded-2xl p-6 shadow-xs space-y-6">
              <div className="pb-4 border-b border-[#E2E9E4]">
                <h2 className="font-display font-bold text-xl text-[#172B22]">Autonomous UAV Flight Surveys</h2>
                <p className="text-xs text-[#64746A] mt-0.5">Telemetry, scheduled flight runs, and photogrammetry overlap metadata.</p>
              </div>

              {surveys.length === 0 ? (
                <div className="py-14 text-center rounded-xl border border-dashed border-[#E2E9E4] bg-[#F7F9F8] p-6 space-y-2">
                  <Radio className="w-10 h-10 text-slate-400 mx-auto" />
                  <p className="text-sm font-semibold text-[#172B22]">No completed or scheduled UAV surveys.</p>
                  <p className="text-xs text-[#64746A] max-w-md mx-auto">
                    Survey missions are initiated by your assigned village agricultural assistant during harvest.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {surveys.map((s) => (
                    <div key={s.id} className="p-4 rounded-xl border border-[#E2E9E4] bg-[#F7F9F8] space-y-2 text-xs font-mono">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#172B22]">{s.survey_code}</span>
                        <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold">{s.flight_status}</span>
                      </div>
                      <div>Parcel: <strong>{s.parcel_code}</strong></div>
                      <div>Scheduled: <strong>{new Date(s.scheduled_datetime).toLocaleString()}</strong></div>
                      <div>Altitude: <strong>{s.altitude_meters}m AGL</strong> • GSD: <strong>{s.ground_sampling_distance_cm} cm/px</strong></div>
                      <div>Overlap: <strong>{s.front_overlap_percent}% Front / {s.side_overlap_percent}% Side</strong></div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 6: FIELD ANALYTICS */}
          {activeTab === 'analytics' && (
            <div className="bg-white border border-[#E2E9E4] rounded-2xl p-6 shadow-xs space-y-6">
              <div className="pb-4 border-b border-[#E2E9E4]">
                <h2 className="font-display font-bold text-xl text-[#172B22]">Copernicus Sentinel-2 Satellite Analytics</h2>
                <p className="text-xs text-[#64746A] mt-0.5">Real multispectral Level-2A surface reflectance vegetation analysis.</p>
              </div>

              {!satelliteData ? (
                <div className="py-12 text-center text-xs text-slate-500 bg-[#F7F9F8] rounded-xl border border-dashed border-[#E2E9E4]">
                  Loading Copernicus Data Space satellite observations...
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl border border-[#A7F3D0] bg-[#ECFDF5]/60 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-xs text-[#008C45] block">Copernicus STAC Query: {satelliteData.parcel_code}</span>
                      <span className="text-xs text-[#172B22] mt-0.5 block">
                        BBox: [{satelliteData.bbox.join(', ')}]
                      </span>
                    </div>
                    <span className="text-xs font-mono text-slate-500">Provider: Sentinel-2 L2A</span>
                  </div>

                  {satelliteData.copernicus_stac_result?.scenes && satelliteData.copernicus_stac_result.scenes.length > 0 ? (
                    <div className="space-y-2">
                      <h4 className="font-bold text-xs uppercase font-mono text-[#172B22]">Recent Cloud-Free Acquisitions</h4>
                      {satelliteData.copernicus_stac_result.scenes.map((sc: any, idx: number) => (
                        <div key={idx} className="p-3 rounded-lg border border-[#E2E9E4] bg-white flex justify-between items-center text-xs font-mono">
                          <div>
                            <strong>{sc.id}</strong>
                            <div className="text-[11px] text-slate-500">Date: {sc.datetime} • Cloud Cover: {sc.cloud_cover.toFixed(1)}%</div>
                          </div>
                          <span className="text-[#008C45] font-bold">L2A Ready</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl border border-dashed border-amber-200 bg-amber-50/50 text-xs text-amber-800">
                      No cloud-free Sentinel-2 acquisition found for the current observation window (&lt;30% cloud threshold). Theoretical benchmark for Paddy flowering stage: 0.65 - 0.82 NDVI.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 7: NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div className="bg-white border border-[#E2E9E4] rounded-2xl p-6 shadow-xs space-y-4">
              <div className="pb-3 border-b border-[#E2E9E4]">
                <h2 className="font-display font-bold text-xl text-[#172B22]">Notification Center</h2>
                <p className="text-xs text-[#64746A]">Agricultural field alerts, survey readiness notifications, and cadastral reports.</p>
              </div>

              {notifications.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-500 bg-[#F7F9F8] rounded-xl border border-dashed border-[#E2E9E4]">
                  No new notifications.
                </div>
              ) : (
                <div className="space-y-3">
                  {notifications.map((n) => (
                    <div key={n.id} className="p-4 rounded-xl border border-[#E2E9E4] bg-[#F7F9F8] flex items-start gap-3">
                      <Bell className="w-4 h-4 text-[#008C45] shrink-0 mt-0.5" />
                      <div>
                        <h5 className="font-semibold text-xs text-[#172B22]">{n.title}</h5>
                        <p className="text-xs text-slate-600 mt-0.5">{n.message}</p>
                        <span className="text-[10px] font-mono text-slate-400 mt-1 block">
                          {new Date(n.created_at).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 8: MY PROFILE */}
          {activeTab === 'profile' && (
            <div className="bg-white border border-[#E2E9E4] rounded-2xl p-6 shadow-xs space-y-6">
              <div className="pb-4 border-b border-[#E2E9E4]">
                <h2 className="font-display font-bold text-xl text-[#172B22]">Farmer Profile & KYC Information</h2>
                <p className="text-xs text-[#64746A]">Authenticated details registered under AgriSentinel Farmer Registry.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                <div className="p-3.5 rounded-xl bg-[#F7F9F8] border border-[#E2E9E4]">
                  <span className="text-slate-400 block text-[10px] uppercase">Full Name</span>
                  <span className="font-bold text-sm text-[#172B22]">{farmerName}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-[#F7F9F8] border border-[#E2E9E4]">
                  <span className="text-slate-400 block text-[10px] uppercase">Mobile Number</span>
                  <span className="font-bold text-sm text-[#172B22]">{user?.mobile_number || 'Not available'}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-[#F7F9F8] border border-[#E2E9E4]">
                  <span className="text-slate-400 block text-[10px] uppercase">State & District</span>
                  <span className="font-bold text-sm text-[#172B22]">{farmerLocation}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-[#F7F9F8] border border-[#E2E9E4]">
                  <span className="text-slate-400 block text-[10px] uppercase">Registered Email</span>
                  <span className="font-bold text-sm text-[#172B22]">{farmerEmail}</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 9: HELP & SUPPORT */}
          {activeTab === 'support' && (
            <div className="bg-white border border-[#E2E9E4] rounded-2xl p-6 shadow-xs space-y-6">
              <div className="pb-4 border-b border-[#E2E9E4]">
                <h2 className="font-display font-bold text-xl text-[#172B22]">Official Agricultural Support Directory</h2>
                <p className="text-xs text-[#64746A]">Verified government contacts for your district and block.</p>
              </div>

              {supportContacts.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-500 bg-[#F7F9F8] rounded-xl border border-dashed border-[#E2E9E4]">
                  Support contact information is currently being updated for your jurisdiction.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {supportContacts.map((c) => (
                    <div key={c.id} className="p-4 rounded-xl border border-[#E2E9E4] bg-[#F7F9F8] space-y-2">
                      <div className="flex items-center gap-2 text-[#008C45] font-semibold text-xs">
                        <PhoneCall className="w-4 h-4" />
                        <span>{c.role_type}</span>
                      </div>
                      <div className="text-sm font-bold text-[#172B22]">{c.officer_name}</div>
                      <div className="text-xs text-slate-500 font-mono">{c.office_address}</div>
                      <div className="text-xs text-[#008C45] font-mono font-bold">{c.phone_number}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </main>
      </div>

      {/* MODAL: SATELLITE GIS FULLSCREEN INTERACTIVE MAP */}
      {showMapModal && summary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-[#E2E9E4] flex items-center justify-between">
              <div>
                <h3 className="font-display font-bold text-base text-[#172B22]">
                  Registered Cadastral Parcels GIS Demarcation (PostGIS SRID: 4326)
                </h3>
                <span className="text-[11px] font-mono text-[#008C45]">
                  {summary.parcels_count} Parcels Registered • Total: {summary.total_registered_area_acres} Acres
                </span>
              </div>
              <button 
                onClick={() => setShowMapModal(false)}
                className="p-1.5 rounded-lg border border-[#E2E9E4] hover:bg-slate-50 text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="relative flex-1 min-h-[420px] bg-slate-900">
              <InteractiveGISParcelMap 
                parcels={summary.parcels} 
                height="420px" 
                interactive={true} 
              />
            </div>

            <div className="p-3 bg-[#F7F9F8] border-t border-[#E2E9E4] flex items-center justify-between text-xs text-[#64746A]">
              <span>Base: Esri World Imagery Orthomosaic • PostGIS Geometry Layer Active</span>
              <button
                onClick={() => setShowMapModal(false)}
                className="px-4 py-1.5 rounded-lg bg-[#008C45] text-white text-xs font-semibold cursor-pointer"
              >
                Close Viewer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD NEW PARCEL ON SATELLITE GIS */}
      <FieldRegistrationMapModal
        isOpen={showAddParcelModal}
        onClose={() => setShowAddParcelModal(false)}
        onSuccess={() => {
          fetchSummary();
        }}
        defaultDistrict="Cuttack"
      />

      {/* MODAL: PROTOCOL LEARN MORE */}
      {showProtocolModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl flex flex-col">
            <div className="p-4 border-b border-[#E2E9E4] flex items-center justify-between">
              <h3 className="font-display font-bold text-base text-[#172B22]">
                UAV Photogrammetry Protocol Guidelines
              </h3>
              <button 
                onClick={() => setShowProtocolModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-3 text-xs text-[#475569] leading-relaxed">
              <p>
                <strong>What is the Photogrammetry Protocol?</strong><br />
                AgriSentinel uses Structure-from-Motion (SFM) photogrammetry to compute 3D digital surface models of harvested grain heaps right at your village threshing yard (Khalia).
              </p>
              <p>
                <strong>Farmer Workflow Steps:</strong>
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  <li><strong>Step 1:</strong> Satellite crop monitoring tracks NDVI vegetation health and canopy maturity.</li>
                  <li><strong>Step 2:</strong> Report threshing completion at your village yard before grain bagging starts.</li>
                  <li><strong>Step 3:</strong> Assigned village field assistant deploys autonomous UAV survey at 35m altitude.</li>
                  <li><strong>Step 4:</strong> Photogrammetry engine reconstructs dense point cloud and calculates cubic meter volume.</li>
                  <li><strong>Step 5:</strong> Official verified yield certificate issued with digital verification hash.</li>
                </ul>
              </p>
            </div>
            <div className="p-3 bg-[#F7F9F8] border-t border-[#E2E9E4] flex justify-end">
              <button
                onClick={() => setShowProtocolModal(false)}
                className="px-4 py-1.5 rounded-lg bg-[#008C45] text-white text-xs font-semibold cursor-pointer"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default FarmerDashboard;
