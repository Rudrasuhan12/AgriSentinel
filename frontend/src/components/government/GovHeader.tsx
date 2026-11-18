import React, { useState, useRef, useEffect } from 'react';
import { 
  Building2, 
  ShieldCheck, 
  LogOut, 
  Globe, 
  Bell, 
  Menu,
  CheckCheck,
  AlertTriangle,
  CheckCircle2,
  Info,
  Clock,
  FileCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export type GovDashboardTab = 'overview' | 'gis' | 'analytics' | 'audits' | 'verification' | 'reports';
export type GovTabType = GovDashboardTab;

export interface GovHeaderProps {
  activeTab: GovDashboardTab;
  setActiveTab?: (tab: GovDashboardTab) => void;
  onSelectTab?: (tab: GovDashboardTab) => void;
  selectedDistrict?: string;
  user?: any;
  onLogout?: () => void;
  onToggleSidebar?: () => void;
}

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'warning' | 'success' | 'info' | 'alert';
  read: boolean;
  tag: string;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'Weighbridge Variance Warning',
    message: 'Mission UAV-SORTIE-CUT-409 registered 16.4% moisture at Choudwar Yard. Physical tare variance: -4.8%. Recalibration advised.',
    time: '12m ago',
    type: 'warning',
    read: false,
    tag: 'Choudwar RMC'
  },
  {
    id: 'notif-2',
    title: 'Mandi MSP Gatepass Dispatched',
    message: 'Digital token generated for Farmer Ramesh Chandra Sahoo (Plot 640/2536). Certified mass: 54.4 Quintals released for DBT.',
    time: '45m ago',
    type: 'success',
    read: false,
    tag: 'Baranga'
  },
  {
    id: 'notif-3',
    title: 'PostGIS Cadastral Layer Synchronized',
    message: '11 agricultural parcel polygons in Mundali and Bidyadharpur revenue mouzas georeferenced with EPSG:4326 boundaries.',
    time: '2h ago',
    type: 'info',
    read: false,
    tag: 'PostGIS 3.4'
  },
  {
    id: 'notif-4',
    title: 'SLA Inspection Queue Reminder',
    message: '42 photogrammetry flight sorties currently in verification queue awaiting DAO sign-off under Kharif 2026-27 procurement SLA.',
    time: '5h ago',
    type: 'alert',
    read: true,
    tag: 'Cuttack Sadar'
  }
];

export const GovHeader: React.FC<GovHeaderProps> = ({
  activeTab,
  user: propUser,
  onLogout: propLogout,
  onToggleSidebar
}) => {
  const { user: authUser, logout: authLogout } = useAuth();
  const currentUser = propUser || authUser;
  const handleLogout = propLogout || authLogout;

  // Notifications State
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [notificationsOpen, setNotificationsOpen] = useState<boolean>(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close notifications on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleToggleRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: !n.read } : n));
  };

  // Derive human-readable official name cleanly (avoiding duplicate designation in name)
  let officialName = 'Dr. Subhashree Dash';
  if (currentUser?.full_name) {
    officialName = currentUser.full_name;
  } else if (currentUser?.display_name && !currentUser.display_name.startsWith('District Agricultural Officer')) {
    officialName = currentUser.display_name;
  }
  const designation = 'District Agricultural Officer (DAO)';
  const department = "Department of Agriculture & Farmers' Empowerment, Govt. of Odisha";

  const tabTitles: Record<GovDashboardTab, string> = {
    overview: 'Executive Overview',
    gis: 'Cadastral GIS Demarcation',
    analytics: 'Agricultural Analytics',
    audits: 'UAV Photogrammetry Audits',
    verification: 'Yield Verification & Mandi Procurement',
    reports: 'Official Reports & Statutory Ledgers'
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-xs select-none">
      
      {/* 1. Institutional Top Utility Strip (AgriStack / GIGW 3.0 Standard) */}
      <div className="bg-[#08331E] text-[#D1FAE5] text-[11px] font-mono border-b border-[#065F46] py-1.5 px-4 sm:px-6">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 font-bold tracking-wider text-[#34D399]">
              <Building2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>DIGITAL AGRICULTURE MISSION</span>
            </span>
            <span className="hidden md:inline text-[#059669]">|</span>
            <span className="hidden md:inline text-emerald-100 font-sans text-[11px]">
              {department}
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            {/* System Security & PostGIS Status */}
            <div className="flex items-center gap-1.5 bg-[#064E3B] px-2.5 py-0.5 rounded text-[10px] text-emerald-200 border border-emerald-600/30">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
              <span>PostGIS 3.4 • EPSG:4326 Online</span>
            </div>

            {/* Language Selection */}
            <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-emerald-200 font-sans">
              <Globe className="w-3 h-3 text-emerald-400" />
              <span className="font-semibold text-white">English</span>
              <span className="text-emerald-400">/</span>
              <span className="text-emerald-300 hover:text-white cursor-pointer transition-colors">ଓଡ଼ିଆ</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Departmental Header Bar */}
      <div className="px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        
        {/* Left: Mobile Toggle & Active Section Title */}
        <div className="flex items-center gap-3">
          {onToggleSidebar && (
            <button
              type="button"
              onClick={onToggleSidebar}
              className="p-2 rounded-xl text-gray-700 hover:bg-gray-100 lg:hidden cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              <Menu className="w-5 h-5 text-gray-800" />
            </button>
          )}

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white p-1 border border-gray-200 shadow-xs hidden sm:flex items-center justify-center shrink-0">
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" 
                alt="Emblem of India" 
                className="h-7 w-auto object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-bold text-gray-900 tracking-tight">
                  {tabTitles[activeTab]}
                </h1>
                <span className="hidden sm:inline-block text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
                  Official Desk
                </span>
              </div>
              <p className="text-[11px] text-gray-500 font-sans truncate">
                Odisha State Agricultural Monitoring & Decision Support Portal
              </p>
            </div>
          </div>
        </div>

        {/* Right: Quick Official Actions, Notifications & Identity */}
        <div className="flex items-center gap-3 relative">
          
          {/* Notification Bell Dropdown Anchor */}
          <div ref={notifRef} className="relative">
            <button 
              type="button"
              onClick={() => setNotificationsOpen(prev => !prev)}
              className={`p-2 rounded-xl border transition-all cursor-pointer relative ${
                notificationsOpen 
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800 ring-2 ring-emerald-500/20' 
                  : 'border-gray-200 hover:bg-gray-50 text-gray-600'
              }`}
              title="Departmental Notifications & Alerts"
              aria-expanded={notificationsOpen}
            >
              <Bell className="w-4 h-4 text-gray-700" />
              {unreadCount > 0 && (
                <span className="w-2.5 h-2.5 rounded-full bg-[#008C45] absolute top-1 right-1 ring-2 ring-white animate-pulse" />
              )}
            </button>

            {/* Notification Popover Card */}
            {notificationsOpen && (
              <div className="absolute right-0 sm:right-auto sm:left-auto mt-2 w-[340px] sm:w-[380px] bg-white rounded-2xl shadow-xl border border-gray-200 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-xs font-sans">
                
                {/* Popover Header */}
                <div className="px-4 py-3 bg-[#F8FAFC] border-b border-gray-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900">Departmental Notifications</span>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#E5F5EC] text-[#087443] border border-[#DCE5E0]">
                        {unreadCount} New
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={handleMarkAllRead}
                      className="text-[11px] font-mono text-[#008C45] hover:text-[#07643a] font-semibold flex items-center gap-1 cursor-pointer hover:underline"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      <span>Mark all read</span>
                    </button>
                  )}
                </div>

                {/* Notifications List */}
                <div className="max-h-[380px] overflow-y-auto divide-y divide-gray-100 scrollbar-thin scrollbar-thumb-gray-200">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-gray-400">
                      No notifications at this time.
                    </div>
                  ) : (
                    notifications.map((item) => {
                      const isUnread = !item.read;

                      return (
                        <div
                          key={item.id}
                          onClick={() => handleToggleRead(item.id)}
                          className={`p-3.5 transition-colors cursor-pointer flex gap-3 items-start ${
                            isUnread ? 'bg-[#F0FDF4]/70 hover:bg-[#F0FDF4]' : 'bg-white hover:bg-gray-50/80'
                          }`}
                        >
                          {/* Alert Icon */}
                          <div className="mt-0.5 shrink-0">
                            {item.type === 'warning' && (
                              <div className="p-1.5 rounded-lg bg-amber-50 text-amber-700 border border-amber-200">
                                <AlertTriangle className="w-3.5 h-3.5" />
                              </div>
                            )}
                            {item.type === 'success' && (
                              <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              </div>
                            )}
                            {item.type === 'info' && (
                              <div className="p-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
                                <Info className="w-3.5 h-3.5" />
                              </div>
                            )}
                            {item.type === 'alert' && (
                              <div className="p-1.5 rounded-lg bg-purple-50 text-purple-700 border border-purple-200">
                                <FileCheck className="w-3.5 h-3.5" />
                              </div>
                            )}
                          </div>

                          {/* Message Body */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1 mb-0.5">
                              <span className={`text-xs font-semibold truncate ${isUnread ? 'text-gray-900 font-bold' : 'text-gray-700'}`}>
                                {item.title}
                              </span>
                              <span className="text-[10px] font-mono text-gray-400 shrink-0">
                                {item.time}
                              </span>
                            </div>

                            <p className="text-[11px] text-gray-600 leading-relaxed">
                              {item.message}
                            </p>

                            <div className="mt-1.5 flex items-center justify-between">
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-semibold bg-gray-100 text-gray-600 border border-gray-200">
                                {item.tag}
                              </span>
                              {isUnread && (
                                <span className="w-1.5 h-1.5 rounded-full bg-[#008C45]" />
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Popover Footer */}
                <div className="p-2.5 bg-[#F8FAFC] border-t border-gray-200 flex items-center justify-between text-[11px] font-mono text-gray-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-emerald-600" />
                    <span>Real-time Dispatches</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setNotificationsOpen(false)}
                    className="text-gray-500 hover:text-gray-800 font-semibold p-1 rounded hover:bg-gray-200/50"
                  >
                    Close
                  </button>
                </div>

              </div>
            )}
          </div>

          {/* Officer Identity Tag */}
          <div className="hidden md:flex flex-col text-right">
            <span className="text-xs font-bold text-gray-900 leading-tight flex items-center gap-1 justify-end">
              <span>{officialName}</span>
              <ShieldCheck className="w-3.5 h-3.5 text-[#008C45]" />
            </span>
            <span className="text-[10px] font-mono text-gray-500">
              {designation}
            </span>
          </div>

          {/* Quick Sign Out */}
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs font-mono font-semibold text-gray-700 hover:text-red-700 px-3 py-1.5 rounded-xl border border-gray-200 hover:border-red-200 hover:bg-red-50/50 transition-all cursor-pointer"
            title="Sign out of government portal"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>

      </div>
    </header>
  );
};
