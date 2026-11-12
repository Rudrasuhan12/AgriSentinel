import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
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
  Clock,
  Download,
  PhoneCall
} from 'lucide-react';
import { Link } from 'react-router-dom';

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

export const FarmerDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<SidebarTab>('dashboard');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [showAddParcelModal, setShowAddParcelModal] = useState(false);
  const [showProtocolModal, setShowProtocolModal] = useState(false);

  // Form state for adding new parcel
  const [newPlotNumber, setNewPlotNumber] = useState('');
  const [newKhataNumber, setNewKhataNumber] = useState('');
  const [newAreaAcres, setNewAreaAcres] = useState('');
  const [selectedCrop, setSelectedCrop] = useState('Paddy (Swarna MTU)');

  // Dynamic user data resolution
  const farmerProfile = user?.farmer_profile;
  const farmerName = farmerProfile?.full_name || user?.display_name || 'Ramesh Chandra Sahoo';
  const farmerEmail = user?.email || 'farmer@agrisentinel.local';
  const farmerLocation = farmerProfile?.district ? `${farmerProfile.village || 'Mundali'}, ${farmerProfile.district}` : 'Cuttack, Odisha';

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'parcels', label: 'My Parcels', icon: Box },
    { id: 'reconstructions', label: 'Yield Estimates', icon: TrendingUp },
    { id: 'surveys', label: 'UAV Surveys', icon: Radio },
    { id: 'certificates', label: 'Reports & Certificates', icon: Award },
    { id: 'analytics', label: 'Field Analytics', icon: Activity },
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: '2' },
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'support', label: 'Help & Support', icon: HelpCircle },
  ];

  return (
    <div className="min-h-screen bg-[#F7F9F8] text-[#172B22] flex flex-row font-sans antialiased relative selection:bg-[#008C45]/20">
      
      {/* 1. PERMANENT COLLAPSIBLE LEFT SIDEBAR (DESKTOP) */}
      <aside 
        className={`hidden lg:flex flex-col bg-white border-r border-[#E2E9E4] sticky top-0 h-screen transition-all duration-300 z-30 shrink-0 ${
          isCollapsed ? 'w-[76px]' : 'w-[250px]'
        }`}
      >
        {/* Sidebar Header & Brand Logo */}
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

        {/* Navigation Items List */}
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
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-amber-50 text-amber-600 border border-amber-200">
                    {item.badge}
                  </span>
                )}

                {/* Floating tooltip when in collapsed mode */}
                {isCollapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 rounded bg-[#172B22] text-white text-[11px] font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-md">
                    {item.label}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Subtle Decorative Landscape Graphic at Bottom of Sidebar */}
        {!isCollapsed && (
          <div className="px-4 py-2 border-t border-[#E2E9E4] bg-gradient-to-b from-white to-[#F7F9F8]">
            <div className="rounded-xl bg-[#ECFDF5]/60 border border-[#A7F3D0]/50 p-2.5 flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#008C45] flex items-center justify-center text-white shrink-0">
                <Compass className="w-3.5 h-3.5 animate-spin-slow" />
              </div>
              <div className="text-[10px] leading-tight">
                <span className="font-bold text-[#008C45] block">GPS Cadastral Sync</span>
                <span className="text-slate-500 font-mono text-[9px]">Bhulekh Live: Connected</span>
              </div>
            </div>
          </div>
        )}

        {/* Sidebar Footer with Collapse Toggle */}
        <div className="p-3 border-t border-[#E2E9E4] flex items-center justify-between">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-full py-1.5 px-2 rounded-lg border border-[#E2E9E4] hover:bg-slate-50 text-[#64746A] hover:text-[#172B22] text-[11px] font-mono flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <Menu className="w-3.5 h-3.5" />
            {!isCollapsed && <span>Collapse Sidebar</span>}
          </button>
        </div>
      </aside>

      {/* MOBILE DRAWER (RESPONSIVE) */}
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

      {/* MAIN CONTENT WRAPPER */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        
        {/* 2. TOP HEADER */}
        <header className="h-16 bg-white border-b border-[#E2E9E4] sticky top-0 z-20 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          
          {/* Left Title & Mobile Toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileDrawerOpen(true)}
              className="lg:hidden p-2 rounded-lg border border-[#E2E9E4] hover:bg-slate-50 text-slate-600"
            >
              <Menu className="w-4 h-4" />
            </button>

            <div>
              <h1 className="font-display font-bold text-base sm:text-lg text-[#172B22] capitalize flex items-center gap-2">
                <span>Farmer Dashboard</span>
                <span className="text-slate-300 font-normal">/</span>
                <span className="text-xs font-mono font-medium text-[#008C45] bg-[#ECFDF5] px-2 py-0.5 rounded-full border border-[#A7F3D0]/60">
                  Odisha Kharif 2026
                </span>
              </h1>
            </div>
          </div>

          {/* Right Controls: Notifications & Profile Pill */}
          <div className="flex items-center gap-3 sm:gap-4">
            
            {/* Notification Bell with Ping Dot */}
            <button 
              onClick={() => setActiveTab('notifications')}
              className="relative p-2 rounded-xl border border-[#E2E9E4] hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
              title="Notifications & Flight Alerts"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            </button>

            {/* Profile Avatar & Details Dropdown */}
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

              {/* Profile Dropdown Menu */}
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
                    <span>Krishi Helpline & Field Assistant</span>
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

        {/* 3. MAIN DASHBOARD CONTENT AREA */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
          
          {/* TAB 1: OVERVIEW DASHBOARD */}
          {activeTab === 'dashboard' && (
            <>
              {/* WELCOME HERO BANNER (MATCHES REFERENCE PHOTO) */}
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
                        Cadastral Parcel Status: Synced
                      </span>
                      <span className="px-2.5 py-1 rounded-md bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1.5 font-semibold">
                        <Clock className="w-3 h-3" />
                        Photogrammetry Window: Open
                      </span>
                    </div>
                  </div>

                  {/* Right Realistic Aerial Field Visual with Drone Scanning */}
                  <div className="relative md:col-span-5 h-48 sm:h-56 md:h-full min-h-[190px] overflow-hidden bg-slate-900">
                    <img 
                      src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=900&auto=format&fit=crop" 
                      alt="Paddy fields surveyed by drone" 
                      className="w-full h-full object-cover object-center filter saturate-[1.1]"
                    />
                    {/* Gradient Fade Overlay on Left */}
                    <div className="absolute inset-0 bg-gradient-to-r from-white via-white/20 to-transparent md:block hidden pointer-events-none" />

                    {/* Agricultural Drone & Wireframe Projection Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="relative">
                        {/* Hovering Drone Icon Illustration */}
                        <div className="w-16 h-10 rounded-lg bg-black/80 backdrop-blur-md border border-lime-400/60 p-1 flex items-center justify-center text-lime-400 shadow-xl animate-bounce-slow">
                          <Radio className="w-5 h-5 text-lime-400 animate-pulse" />
                        </div>
                        {/* Holographic Wireframe Pyramid Beam */}
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

              {/* 4. KEY SUMMARY METRIC CARDS (MATCHES REFERENCE) */}
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
                    {farmerProfile?.approximate_land_area ? `${farmerProfile.approximate_land_area} Ac` : '4.50 Ac'}
                  </div>
                  <div className="mt-2 flex items-center gap-1 text-[11px] font-mono font-semibold text-[#008C45]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#008C45]" />
                    <span>PostGIS Geo-referenced</span>
                  </div>
                  {/* Decorative Cadastral Polygon Icon */}
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
                    {farmerProfile?.primary_crop || 'Swarna (MTU)'}
                  </div>
                  <div className="mt-2 text-[11px] font-mono text-slate-600 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Last sown: 5 Nov 2026</span>
                  </div>
                  {/* Wheat sheaf graphic */}
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
                    128.4 m³
                  </div>
                  <div className="mt-2 flex items-center gap-1 text-[11px] font-mono font-semibold text-purple-700">
                    <TrendingUp className="w-3.5 h-3.5 text-purple-600" />
                    <span>+7.2% vs. last analysis</span>
                  </div>
                  {/* Volumetric bars graphic */}
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
                    18 Nov 2026
                  </div>
                  <div className="mt-2 flex items-center gap-1 text-[11px] font-mono text-amber-700">
                    <Radio className="w-3.5 h-3.5 text-amber-600" />
                    <span>Post-harvest volume scan</span>
                  </div>
                  {/* Drone silhouette graphic */}
                  <div className="absolute right-3.5 bottom-3 text-amber-500/20 pointer-events-none">
                    <Radio className="w-12 h-12" />
                  </div>
                </div>

              </div>

              {/* 5. REGISTERED CADASTRAL PARCELS SECTION (WITH SATELLITE DEMARCATION) */}
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

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                  
                  {/* Parcel 1 Card */}
                  <div className="lg:col-span-4 rounded-xl border border-[#E2E9E4] p-4 bg-white hover:border-[#008C45]/50 transition-all shadow-2xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono font-bold text-xs text-[#172B22] flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-[#008C45]" />
                          PARCEL #OD-BHK-104
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-[#ECFDF5] text-[#008C45] border border-[#A7F3D0]">
                          ✓ Verified
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 font-mono mb-3">
                        Khata: 204/12 • Plot: 890 • Cuttack
                      </div>
                    </div>
                    <div className="pt-3 border-t border-[#E2E9E4] flex items-center justify-between text-xs font-mono">
                      <span className="font-semibold text-[#172B22]">Area: 2.80 Acres</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-50 text-[#008C45] border border-emerald-200 text-[10px] font-semibold">
                        NDVI Health: 0.74 (Healthy)
                      </span>
                    </div>
                  </div>

                  {/* Parcel 2 Card */}
                  <div className="lg:col-span-4 rounded-xl border border-[#E2E9E4] p-4 bg-white hover:border-[#008C45]/50 transition-all shadow-2xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono font-bold text-xs text-[#172B22] flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-[#008C45]" />
                          PARCEL #OD-BHK-105
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-[#ECFDF5] text-[#008C45] border border-[#A7F3D0]">
                          ✓ Verified
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 font-mono mb-3">
                        Khata: 204/12 • Plot: 891 • Cuttack
                      </div>
                    </div>
                    <div className="pt-3 border-t border-[#E2E9E4] flex items-center justify-between text-xs font-mono">
                      <span className="font-semibold text-[#172B22]">Area: 1.70 Acres</span>
                      <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-semibold flex items-center gap-1">
                        <span>🌾 Harvest In Progress</span>
                      </span>
                    </div>
                  </div>

                  {/* Parcel 3: Satellite GIS Demarcation Tile */}
                  <div 
                    onClick={() => setShowMapModal(true)}
                    className="lg:col-span-4 rounded-xl border border-[#E2E9E4] overflow-hidden relative group cursor-pointer aspect-video lg:aspect-auto min-h-[140px] shadow-2xs"
                    title="Click to view full GIS satellite map"
                  >
                    <img 
                      src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=600&auto=format&fit=crop" 
                      alt="Cadastral boundaries satellite view" 
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/25 group-hover:bg-black/15 transition-colors" />
                    
                    {/* SVG Polygons 104 and 105 */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 200 120">
                      <polygon 
                        points="35,25 90,20 85,95 25,90" 
                        fill="rgba(56, 239, 125, 0.25)" 
                        stroke="#38ef7d" 
                        strokeWidth="2" 
                      />
                      <text x="50" y="60" fill="white" fontSize="12" fontWeight="bold" fontFamily="monospace">104</text>
                      
                      <polygon 
                        points="98,22 165,30 155,100 92,95" 
                        fill="rgba(56, 239, 125, 0.25)" 
                        stroke="#38ef7d" 
                        strokeWidth="2" 
                      />
                      <text x="120" y="65" fill="white" fontSize="12" fontWeight="bold" fontFamily="monospace">105</text>
                    </svg>

                    {/* Expand overlay button */}
                    <div className="absolute top-2 right-2 w-7 h-7 rounded-lg bg-black/70 backdrop-blur-xs text-white flex items-center justify-center group-hover:bg-[#008C45] transition-colors">
                      <Maximize2 className="w-3.5 h-3.5" />
                    </div>

                    <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur-xs text-white font-mono text-[9px]">
                      Odisha Bhulekh Demarcation
                    </div>
                  </div>

                </div>

              </div>

              {/* 6. UAV PHOTOGRAMMETRY PROTOCOL STEPPER (MATCHES REFERENCE) */}
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

                {/* 5-Step Horizontal Timeline Track */}
                <div className="relative pt-2 pb-4 overflow-x-auto">
                  <div className="min-w-[650px] grid grid-cols-5 gap-2 relative">
                    
                    {/* Connecting Track Line */}
                    <div className="absolute top-4 left-[10%] right-[10%] h-[2px] bg-slate-200 z-0">
                      <div className="h-full bg-[#008C45] w-[50%]" />
                    </div>

                    {/* Step 1: Crop Monitoring */}
                    <div className="flex flex-col items-center text-center relative z-10">
                      <div className="w-8 h-8 rounded-full bg-[#008C45] text-white flex items-center justify-center shadow-xs">
                        <Check className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-xs text-[#172B22] mt-2">1. Crop Monitoring</span>
                      <span className="text-[10px] text-[#64746A] mt-0.5">Field growth tracking (NDVI, Canopy)</span>
                    </div>

                    {/* Step 2: Threshing Completed */}
                    <div className="flex flex-col items-center text-center relative z-10">
                      <div className="w-8 h-8 rounded-full bg-[#008C45] text-white flex items-center justify-center shadow-xs">
                        <Check className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-xs text-[#172B22] mt-2">2. Threshing Completed</span>
                      <span className="text-[10px] text-[#64746A] mt-0.5">Report at village threshing yard (Khalia)</span>
                    </div>

                    {/* Step 3: UAV Survey (ACTIVE) */}
                    <div className="flex flex-col items-center text-center relative z-10">
                      <div className="w-8 h-8 rounded-full bg-white border-2 border-[#008C45] text-[#008C45] flex items-center justify-center shadow-xs relative">
                        <Radio className="w-4 h-4 text-[#008C45]" />
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                      </div>
                      <span className="font-bold text-xs text-[#008C45] mt-2">3. UAV Survey</span>
                      <span className="text-[10px] text-[#008C45] font-semibold mt-0.5">Autonomous volumetric scan of harvest</span>
                    </div>

                    {/* Step 4: Volume Estimation */}
                    <div className="flex flex-col items-center text-center relative z-10">
                      <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-300 text-slate-400 flex items-center justify-center">
                        <Activity className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-xs text-slate-500 mt-2">4. Volume Estimation</span>
                      <span className="text-[10px] text-slate-400 mt-0.5">3D model & yield calculation</span>
                    </div>

                    {/* Step 5: Yield Certificate */}
                    <div className="flex flex-col items-center text-center relative z-10">
                      <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-300 text-slate-400 flex items-center justify-center">
                        <Award className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-xs text-slate-500 mt-2">5. Yield Certificate</span>
                      <span className="text-[10px] text-slate-400 mt-0.5">Verified digital certificate for benefits</span>
                    </div>

                  </div>
                </div>

              </div>
            </>
          )}

          {/* TAB 2: REGISTERED PARCELS DETAILED VIEW */}
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-[#E2E9E4] bg-[#F7F9F8] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-sm text-[#172B22]">Plot No. 890 (Parcel #OD-BHK-104)</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-100 text-[#008C45] font-bold">Verified</span>
                  </div>
                  <div className="text-xs text-slate-600 space-y-1 font-mono">
                    <div>Khata Number: <strong>204/12</strong></div>
                    <div>District: <strong>Cuttack</strong> • Tahasil: <strong>Baranga</strong></div>
                    <div>Recorded Area: <strong>2.80 Acres (1.13 Ha)</strong></div>
                    <div>Crop: <strong>Paddy (Swarna MTU-7029)</strong></div>
                    <div>Soil Classification: <strong>Alluvial Loam</strong></div>
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-xs">
                    <span className="text-[#008C45] font-semibold">Latest NDVI: 0.74 (Vigorous)</span>
                    <button 
                      onClick={() => setShowMapModal(true)} 
                      className="text-xs text-slate-600 hover:text-[#008C45] underline font-medium"
                    >
                      View Satellite Overlay
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-[#E2E9E4] bg-[#F7F9F8] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-sm text-[#172B22]">Plot No. 891 (Parcel #OD-BHK-105)</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-100 text-[#008C45] font-bold">Verified</span>
                  </div>
                  <div className="text-xs text-slate-600 space-y-1 font-mono">
                    <div>Khata Number: <strong>204/12</strong></div>
                    <div>District: <strong>Cuttack</strong> • Tahasil: <strong>Baranga</strong></div>
                    <div>Recorded Area: <strong>1.70 Acres (0.69 Ha)</strong></div>
                    <div>Crop: <strong>Paddy (Pooja / CR-1018)</strong></div>
                    <div>Soil Classification: <strong>Clayey Loam</strong></div>
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-xs">
                    <span className="text-amber-600 font-semibold">Stage: Ready for Harvest</span>
                    <button 
                      onClick={() => setShowMapModal(true)} 
                      className="text-xs text-slate-600 hover:text-[#008C45] underline font-medium"
                    >
                      View Satellite Overlay
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: HEAP RECONSTRUCTIONS (3D PHOTOGRAMMETRIC YIELD) */}
          {activeTab === 'reconstructions' && (
            <div className="bg-white border border-[#E2E9E4] rounded-2xl p-6 shadow-xs space-y-6">
              <div className="pb-4 border-b border-[#E2E9E4]">
                <h2 className="font-display font-bold text-xl text-[#172B22]">3D Photogrammetric Heap Reconstructions</h2>
                <p className="text-xs text-[#64746A] mt-0.5">UAV high-density mesh volume estimation and quintal mass calculation.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-[#F7F9F8] border border-[#E2E9E4]">
                  <span className="text-xs text-[#64746A] uppercase font-mono font-semibold block mb-1">Total Heap Volume</span>
                  <div className="text-2xl font-bold font-mono text-[#172B22]">128.42 m³</div>
                  <span className="text-[11px] text-[#008C45] mt-1 block">Accurate to ±1.4% error margin</span>
                </div>
                <div className="p-4 rounded-xl bg-[#F7F9F8] border border-[#E2E9E4]">
                  <span className="text-xs text-[#64746A] uppercase font-mono font-semibold block mb-1">Volumetric Mass</span>
                  <div className="text-2xl font-bold font-mono text-[#172B22]">74.2 Quintals</div>
                  <span className="text-[11px] text-slate-500 mt-1 block">Based on 578 kg/m³ bulk density</span>
                </div>
                <div className="p-4 rounded-xl bg-[#F7F9F8] border border-[#E2E9E4]">
                  <span className="text-xs text-[#64746A] uppercase font-mono font-semibold block mb-1">Mesh Point Count</span>
                  <div className="text-2xl font-bold font-mono text-[#172B22]">2,419,820 pts</div>
                  <span className="text-[11px] text-purple-600 mt-1 block">SFM Photogrammetric Reconstruction</span>
                </div>
              </div>

              <div className="p-6 rounded-xl border border-dashed border-[#E2E9E4] text-center bg-[#F7F9F8]/60 space-y-2">
                <Box className="w-10 h-10 text-[#008C45] mx-auto opacity-75" />
                <h4 className="font-semibold text-sm text-[#172B22]">3D Point Cloud Preview</h4>
                <p className="text-xs text-[#64746A] max-w-md mx-auto">
                  Interactive WebGL 3D point cloud mesh view is computed after each drone survey run. Next flight scheduled for 18 Nov 2026.
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: YIELD CERTIFICATES */}
          {activeTab === 'certificates' && (
            <div className="bg-white border border-[#E2E9E4] rounded-2xl p-6 shadow-xs space-y-6">
              <div className="pb-4 border-b border-[#E2E9E4]">
                <h2 className="font-display font-bold text-xl text-[#172B22]">Verified Yield Certificates</h2>
                <p className="text-xs text-[#64746A] mt-0.5">Government-approved digital harvest certificates for MSP procurement and crop insurance benefits.</p>
              </div>

              <div className="border border-[#E2E9E4] rounded-xl p-5 bg-[#F7F9F8] flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-[#172B22]">CERTIFICATE #AGRI-OD-2026-8812</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-100 text-[#008C45] font-bold">VERIFIED</span>
                  </div>
                  <p className="text-xs text-slate-600">Season: Kharif 2026 • Issued to: <strong>{farmerName}</strong></p>
                  <p className="text-xs text-slate-500 font-mono">Assessed Yield: <strong>74.2 Quintals</strong> • Verified by: DAO Cuttack</p>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => alert(`Downloading Certificate #AGRI-OD-2026-8812 for ${farmerName}`)}
                    className="px-3.5 py-2 rounded-xl bg-[#008C45] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer hover:bg-[#006B36] transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PDF</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: UAV SURVEYS */}
          {activeTab === 'surveys' && (
            <div className="bg-white border border-[#E2E9E4] rounded-2xl p-6 shadow-xs space-y-6">
              <div className="pb-4 border-b border-[#E2E9E4]">
                <h2 className="font-display font-bold text-xl text-[#172B22]">Autonomous UAV Flight Surveys</h2>
                <p className="text-xs text-[#64746A] mt-0.5">Flight logs, flight telemetry, GSD resolution, and aerial scanning runs.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl border border-[#E2E9E4] bg-[#F7F9F8]">
                  <span className="text-xs font-mono text-slate-500 uppercase font-semibold">Survey Altitude</span>
                  <div className="text-xl font-bold font-mono text-[#172B22] mt-1">35.0 Meters AGL</div>
                  <span className="text-[10px] text-slate-500">Fixed GSD: 1.12 cm/px</span>
                </div>
                <div className="p-4 rounded-xl border border-[#E2E9E4] bg-[#F7F9F8]">
                  <span className="text-xs font-mono text-slate-500 uppercase font-semibold">Photogrammetry Overlap</span>
                  <div className="text-xl font-bold font-mono text-[#172B22] mt-1">80% Front / 75% Side</div>
                  <span className="text-[10px] text-[#008C45]">Optimal for SFM 3D meshing</span>
                </div>
                <div className="p-4 rounded-xl border border-[#E2E9E4] bg-[#F7F9F8]">
                  <span className="text-xs font-mono text-slate-500 uppercase font-semibold">Next Scheduled Run</span>
                  <div className="text-xl font-bold font-mono text-amber-700 mt-1">18 Nov 2026, 09:30 AM</div>
                  <span className="text-[10px] text-slate-500">Mundali Threshing Yard</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: FIELD ANALYTICS */}
          {activeTab === 'analytics' && (
            <div className="bg-white border border-[#E2E9E4] rounded-2xl p-6 shadow-xs space-y-6">
              <div className="pb-4 border-b border-[#E2E9E4]">
                <h2 className="font-display font-bold text-xl text-[#172B22]">Multispectral Crop Analytics</h2>
                <p className="text-xs text-[#64746A] mt-0.5">NDVI vegetative health, soil moisture trends, and harvest maturity indices.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-[#E2E9E4] bg-[#F7F9F8] space-y-2">
                  <h4 className="font-bold text-xs uppercase font-mono text-[#008C45]">Mean NDVI Vegetation Index</h4>
                  <div className="text-2xl font-bold font-mono text-[#172B22]">0.74 (Vigorous Canopy)</div>
                  <p className="text-xs text-slate-600">Peak vegetative health recorded across plot 890 during flowering stage.</p>
                </div>
                <div className="p-4 rounded-xl border border-[#E2E9E4] bg-[#F7F9F8] space-y-2">
                  <h4 className="font-bold text-xs uppercase font-mono text-sky-700">Canopy Chlorophyll Absorbance</h4>
                  <div className="text-2xl font-bold font-mono text-[#172B22]">88.2% Normalized</div>
                  <p className="text-xs text-slate-600">Paddy maturity index reached optimal threshold for harvest initiation.</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div className="bg-white border border-[#E2E9E4] rounded-2xl p-6 shadow-xs space-y-4">
              <div className="pb-3 border-b border-[#E2E9E4]">
                <h2 className="font-display font-bold text-xl text-[#172B22]">Notification Center</h2>
                <p className="text-xs text-[#64746A]">Agricultural field alerts, weather forecasts, and survey schedules.</p>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/50 flex items-start gap-3">
                  <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-semibold text-xs text-[#172B22]">UAV Volumetric Scan Scheduled</h5>
                    <p className="text-xs text-slate-600 mt-0.5">Your village field assistant will conduct the post-harvest volumetric scan at Mundali yard on 18 Nov 2026.</p>
                    <span className="text-[10px] font-mono text-slate-400 mt-1 block">2 hours ago</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/50 flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-[#008C45] shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-semibold text-xs text-[#172B22]">Odisha Bhulekh Cadastral Verification Complete</h5>
                    <p className="text-xs text-slate-600 mt-0.5">Parcels #OD-BHK-104 and #OD-BHK-105 are successfully validated against state land records.</p>
                    <span className="text-[10px] font-mono text-slate-400 mt-1 block">1 day ago</span>
                  </div>
                </div>
              </div>
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
                  <span className="font-bold text-sm text-[#172B22]">{user?.mobile_number || '9000000002'}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-[#F7F9F8] border border-[#E2E9E4]">
                  <span className="text-slate-400 block text-[10px] uppercase">State & District</span>
                  <span className="font-bold text-sm text-[#172B22]">{farmerLocation}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-[#F7F9F8] border border-[#E2E9E4]">
                  <span className="text-slate-400 block text-[10px] uppercase">Primary Crop</span>
                  <span className="font-bold text-sm text-[#172B22]">{farmerProfile?.primary_crop || 'Paddy (Swarna MTU)'}</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 9: HELP & SUPPORT */}
          {activeTab === 'support' && (
            <div className="bg-white border border-[#E2E9E4] rounded-2xl p-6 shadow-xs space-y-6">
              <div className="pb-4 border-b border-[#E2E9E4]">
                <h2 className="font-display font-bold text-xl text-[#172B22]">Help & Krishi Vigyan Support</h2>
                <p className="text-xs text-[#64746A]">Direct connection to village agriculture field assistants and state agronomists.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-[#E2E9E4] bg-[#F7F9F8] space-y-2">
                  <div className="flex items-center gap-2 text-[#008C45] font-semibold text-xs">
                    <PhoneCall className="w-4 h-4" />
                    <span>Village Field Assistant (VAW)</span>
                  </div>
                  <div className="text-sm font-bold text-[#172B22]">Pradeep Kumar Mohanty</div>
                  <div className="text-xs text-slate-500 font-mono">Assigned to: Baranga Block, Cuttack</div>
                  <div className="text-xs text-[#008C45] font-mono font-bold">+91 94370 12345</div>
                </div>

                <div className="p-4 rounded-xl border border-[#E2E9E4] bg-[#F7F9F8] space-y-2">
                  <div className="flex items-center gap-2 text-sky-700 font-semibold text-xs">
                    <HelpCircle className="w-4 h-4" />
                    <span>Toll-Free Krishi Helpline</span>
                  </div>
                  <div className="text-sm font-bold text-[#172B22]">Department of Agriculture Helpline</div>
                  <div className="text-xs text-slate-500 font-mono">Available 06:00 AM – 10:00 PM Daily</div>
                  <div className="text-xs text-sky-700 font-mono font-bold">1800-180-1551 (Toll-Free)</div>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* MODAL: SATELLITE GIS FULLSCREEN MAP */}
      {showMapModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-[#E2E9E4] flex items-center justify-between">
              <div>
                <h3 className="font-display font-bold text-base text-[#172B22]">
                  Odisha Bhulekh Cadastral GIS Demarcation (Parcels #104 & #105)
                </h3>
                <span className="text-[11px] font-mono text-[#008C45]">
                  Lat: 20.4625° N, Long: 85.8828° E • Baranga, Cuttack
                </span>
              </div>
              <button 
                onClick={() => setShowMapModal(false)}
                className="p-1.5 rounded-lg border border-[#E2E9E4] hover:bg-slate-50 text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="relative flex-1 min-h-[350px] bg-slate-900 overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1200&auto=format&fit=crop" 
                alt="High-resolution satellite parcel view" 
                className="w-full h-full object-cover"
              />
              <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 600 350">
                <polygon 
                  points="120,60 280,50 260,280 80,260" 
                  fill="rgba(56, 239, 125, 0.3)" 
                  stroke="#38ef7d" 
                  strokeWidth="3" 
                />
                <text x="160" y="170" fill="white" fontSize="18" fontWeight="bold" fontFamily="monospace">Parcel #104 (2.80 Ac)</text>
                
                <polygon 
                  points="300,55 500,75 480,290 275,280" 
                  fill="rgba(56, 239, 125, 0.3)" 
                  stroke="#38ef7d" 
                  strokeWidth="3" 
                />
                <text x="360" y="180" fill="white" fontSize="18" fontWeight="bold" fontFamily="monospace">Parcel #105 (1.70 Ac)</text>
              </svg>
            </div>
            <div className="p-3 bg-[#F7F9F8] border-t border-[#E2E9E4] flex items-center justify-between text-xs text-[#64746A]">
              <span>Base Imagery: High-Resolution Orthomosaic • PostGIS Spatial Projection: EPSG:4326</span>
              <button
                onClick={() => setShowMapModal(false)}
                className="px-4 py-1.5 rounded-lg bg-[#008C45] text-white text-xs font-semibold"
              >
                Close Viewer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD NEW PARCEL */}
      {showAddParcelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-2xl overflow-hidden shadow-2xl flex flex-col">
            <div className="p-4 border-b border-[#E2E9E4] flex items-center justify-between">
              <h3 className="font-display font-bold text-base text-[#172B22]">
                Register Agricultural Parcel
              </h3>
              <button 
                onClick={() => setShowAddParcelModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form 
              onSubmit={(e) => {
                e.preventDefault();
                alert(`Parcel successfully queued for Bhulekh land validation: Plot ${newPlotNumber}, Khata ${newKhataNumber}`);
                setShowAddParcelModal(false);
              }}
              className="p-5 space-y-4 text-xs"
            >
              <div>
                <label className="block text-[10px] font-mono uppercase font-bold text-[#475569] mb-1">
                  BHULEKH KHATA NUMBER
                </label>
                <input
                  type="text"
                  required
                  value={newKhataNumber}
                  onChange={(e) => setNewKhataNumber(e.target.value)}
                  placeholder="e.g., 204/15"
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-[#008C45]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase font-bold text-[#475569] mb-1">
                  PLOT NUMBER (DAG NO.)
                </label>
                <input
                  type="text"
                  required
                  value={newPlotNumber}
                  onChange={(e) => setNewPlotNumber(e.target.value)}
                  placeholder="e.g., 892"
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-[#008C45]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase font-bold text-[#475569] mb-1">
                  APPROXIMATE AREA (ACRES)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={newAreaAcres}
                  onChange={(e) => setNewAreaAcres(e.target.value)}
                  placeholder="e.g., 1.50"
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-[#008C45]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase font-bold text-[#475569] mb-1">
                  CROP VARIETY
                </label>
                <select
                  value={selectedCrop}
                  onChange={(e) => setSelectedCrop(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-[#008C45]"
                >
                  <option value="Paddy (Swarna MTU)">Paddy (Swarna MTU)</option>
                  <option value="Paddy (Pooja CR-1018)">Paddy (Pooja CR-1018)</option>
                  <option value="Paddy (Sambha Mahsuri)">Paddy (Sambha Mahsuri)</option>
                  <option value="Pulses (Moong/Biri)">Pulses (Moong/Biri)</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddParcelModal(false)}
                  className="px-4 py-2 rounded-xl border border-[#E2E9E4] text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#008C45] text-white font-semibold hover:bg-[#006B36]"
                >
                  Submit for Verification
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
                AgriSentinel uses Structure-from-Motion (SFM) photogrammetry to create high-density 3D digital point cloud models of harvested grain heaps right at your village threshing yard (Khalia).
              </p>
              <p>
                <strong>Guidelines for Farmers:</strong>
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  <li>Form the harvested paddy heap on flat ground away from tall tree canopies.</li>
                  <li>Ensure the drone survey is triggered before grain bagging starts.</li>
                  <li>Your field assistant will verify ground markers and launch the autonomous flight.</li>
                  <li>The 3D model estimates volume in cubic meters and quintal mass within ±1.4% accuracy.</li>
                </ul>
              </p>
            </div>
            <div className="p-3 bg-[#F7F9F8] border-t border-[#E2E9E4] flex justify-end">
              <button
                onClick={() => setShowProtocolModal(false)}
                className="px-4 py-1.5 rounded-lg bg-[#008C45] text-white text-xs font-semibold"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default FarmerDashboard;