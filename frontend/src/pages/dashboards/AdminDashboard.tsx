import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
import { 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  LogOut, 
  Database, 
  RefreshCw,
  Building2,
  Mail,
  Phone,
  Server,
  Search,
  Check,
  MapPin,
  IdCard,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  Calendar
} from 'lucide-react';
import { Link } from 'react-router-dom';

export interface OfficialRequest {
  id: string;
  user_id: string;
  official_name?: string;
  official_email: string;
  mobile_number?: string;
  department: string;
  organization: string;
  designation: string;
  employee_id?: string;
  requested_state: string;
  requested_district: string;
  reason: string;
  invitation_code?: string;
  approval_status: 'PENDING' | 'APPROVED' | 'REJECTED';
  created_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
  rejection_reason?: string;
}

export const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [requests, setRequests] = useState<OfficialRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  // Search & Filter state for Decision History
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'APPROVED' | 'REJECTED'>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.get<OfficialRequest[]>('/api/admin/official-requests');
      setRequests(data);
      setLastRefreshed(new Date());
    } catch (err: any) {
      setError(err.message || 'Failed to fetch official access requests from database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      setActionLoading(id);
      await api.post(`/api/admin/official-requests/${id}/approve`);
      setSuccessMessage('Official access request approved and permissions activated.');
      setTimeout(() => setSuccessMessage(null), 4000);
      await fetchRequests();
    } catch (err: any) {
      alert(err.message || 'Approval failed. Please verify administrative privileges.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: string) => {
    const reason = prompt('Please provide the official rejection reason:');
    if (!reason) return;

    try {
      setActionLoading(id);
      await api.post(`/api/admin/official-requests/${id}/reject`, { reason });
      setSuccessMessage('Official access request rejected and logged in decision history.');
      setTimeout(() => setSuccessMessage(null), 4000);
      await fetchRequests();
    } catch (err: any) {
      alert(err.message || 'Rejection failed.');
    } finally {
      setActionLoading(null);
    }
  };

  const pendingRequests = useMemo(() => {
    return requests.filter(r => r.approval_status === 'PENDING');
  }, [requests]);

  const pastRequests = useMemo(() => {
    return requests.filter(r => r.approval_status !== 'PENDING');
  }, [requests]);

  const filteredHistory = useMemo(() => {
    return pastRequests.filter(item => {
      const matchesStatus = statusFilter === 'ALL' || item.approval_status === statusFilter;
      const q = searchTerm.toLowerCase().trim();
      if (!q) return matchesStatus;

      const matchesSearch = 
        (item.official_name && item.official_name.toLowerCase().includes(q)) ||
        (item.official_email && item.official_email.toLowerCase().includes(q)) ||
        (item.department && item.department.toLowerCase().includes(q)) ||
        (item.organization && item.organization.toLowerCase().includes(q)) ||
        (item.designation && item.designation.toLowerCase().includes(q)) ||
        (item.requested_district && item.requested_district.toLowerCase().includes(q)) ||
        (item.employee_id && item.employee_id.toLowerCase().includes(q));

      return matchesStatus && matchesSearch;
    });
  }, [pastRequests, searchTerm, statusFilter]);

  // Pagination for Decision History
  const totalPages = Math.max(1, Math.ceil(filteredHistory.length / itemsPerPage));
  const paginatedHistory = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredHistory.slice(start, start + itemsPerPage);
  }, [filteredHistory, currentPage, itemsPerPage]);

  return (
    <div className="min-h-screen bg-[#F7F9F8] text-[#172B22] flex flex-col font-sans antialiased">
      
      {/* 2. Top Sticky Enterprise Navigation Bar */}
      <header className="bg-white border-b border-[#E2E9E4] sticky top-0 z-30 px-4 sm:px-6 lg:px-8 py-3 transition-colors shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Brand Logo & Administrative Identity */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#008C45] to-[#006B36] flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-4 h-4 text-white" />
              </div>
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-base tracking-tight text-[#172B22]">
                  Agri<span className="text-[#008C45]">Sentinel</span>
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-[#ECFDF5] border border-[#A7F3D0] text-[#008C45]">
                  SYSTEM ADMINISTRATOR
                </span>
              </div>
            </Link>
          </div>

          {/* User Details & Sign Out */}
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="hidden md:flex flex-col text-right">
              <span className="text-xs font-semibold text-[#172B22]">
                {user?.display_name || user?.full_name || 'System Administrator'}
              </span>
              <span className="text-[11px] font-mono text-[#64746A]">
                Root Administrator • <span className="text-[#008C45]">{user?.email || 'admin@agrisentinel.local'}</span>
              </span>
            </div>

            <button
              onClick={logout}
              className="flex items-center gap-1.5 text-xs font-medium text-[#64746A] hover:text-[#DC4545] px-3 py-1.5 rounded-lg border border-[#E2E9E4] hover:border-red-200 bg-white hover:bg-red-50/50 transition-all cursor-pointer shadow-2xs"
              title="Sign out of administration console"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="font-mono text-xs">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Administrative Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        
        {/* 3. Main Dashboard Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-[#172B22] tracking-tight">
              System Administration & Security Console
            </h1>
            <p className="text-xs sm:text-sm text-[#64746A] mt-1 max-w-2xl leading-relaxed">
              Review government official clearance requests, manage role-based permissions, and supervise database integrity.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 self-start sm:self-auto">
            <div className="text-right hidden sm:block">
              <span className="text-[11px] font-mono text-[#64746A] block">
                Last refreshed: {lastRefreshed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>
            <button
              onClick={fetchRequests}
              disabled={loading}
              className="px-3.5 py-2 rounded-xl bg-white border border-[#E2E9E4] hover:border-[#008C45]/40 hover:bg-[#F7F9F8] text-[#172B22] text-xs font-semibold flex items-center gap-2 transition-all shadow-xs disabled:opacity-60 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#008C45] ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Records</span>
            </button>
          </div>
        </div>

        {/* Action Notifications */}
        {successMessage && (
          <div className="p-3.5 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] text-[#16A36A] text-xs font-medium flex items-center gap-2.5 shadow-xs animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 text-[#16A36A] shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-[#DC4545] text-xs font-medium flex items-center gap-2.5 shadow-xs">
            <XCircle className="w-4 h-4 text-[#DC4545] shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 4. KPI Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Pending Approvals */}
          <div className="bg-white border border-[#E2E9E4] rounded-xl p-5 shadow-xs hover:border-[#E6A323]/40 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#64746A]">
                Pending Approvals
              </span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200/60 flex items-center justify-center text-[#E6A323]">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-bold font-mono text-[#172B22]">
              {pendingRequests.length}
            </div>
            <span className="text-xs text-[#64746A] mt-1.5 block">
              Government access requests
            </span>
          </div>

          {/* Card 2: Total Reviewed */}
          <div className="bg-white border border-[#E2E9E4] rounded-xl p-5 shadow-xs hover:border-[#16A36A]/40 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#64746A]">
                Total Reviewed
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200/60 flex items-center justify-center text-[#16A36A]">
                <UserCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-bold font-mono text-[#172B22]">
              {pastRequests.length}
            </div>
            <span className="text-xs text-[#16A36A] font-medium mt-1.5 block">
              Audited records
            </span>
          </div>

          {/* Card 3: PostGIS Engine */}
          <div className="bg-white border border-[#E2E9E4] rounded-xl p-5 shadow-xs hover:border-[#008C45]/40 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#64746A]">
                PostGIS Engine
              </span>
              <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200/60 flex items-center justify-center text-[#008C45]">
                <Database className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl font-bold font-mono text-[#172B22] flex items-center gap-1.5">
              <span>PostGIS 3.5</span>
              <span className="text-[11px] font-sans font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-[#16A36A] border border-emerald-200/80">
                Healthy
              </span>
            </div>
            <span className="text-xs font-mono text-[#64746A] mt-1.5 block">
              Container: agrisentinel_db:5436
            </span>
          </div>

          {/* Card 4: FastAPI Auth Backend */}
          <div className="bg-white border border-[#E2E9E4] rounded-xl p-5 shadow-xs hover:border-[#008C45]/40 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#64746A]">
                FastAPI Auth Backend
              </span>
              <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200/60 flex items-center justify-center text-[#008C45]">
                <Server className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl font-bold font-mono text-[#172B22] flex items-center gap-1.5">
              <span>Online (v0.1.0)</span>
              <span className="w-2 h-2 rounded-full bg-[#16A36A] animate-pulse" />
            </div>
            <span className="text-xs font-mono text-[#64746A] mt-1.5 block">
              JWT + bcrypt + Role RBAC
            </span>
          </div>

        </div>

        {/* 5. Pending Official Access Requests Section */}
        <div className="bg-white border border-[#E2E9E4] rounded-xl p-5 sm:p-6 shadow-xs">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-[#E2E9E4]">
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-base sm:text-lg font-display font-bold text-[#172B22]">
                  Pending Official Access Requests
                </h2>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold ${
                  pendingRequests.length > 0 
                    ? 'bg-amber-50 text-[#E6A323] border border-amber-200' 
                    : 'bg-emerald-50 text-[#16A36A] border border-emerald-200'
                }`}>
                  {pendingRequests.length} pending
                </span>
              </div>
              <p className="text-xs text-[#64746A] mt-1">
                Government officials require manual administrator review before access is unlocked.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs font-mono text-[#64746A]">
              <div className="w-7 h-7 border-2 border-slate-200 border-t-[#008C45] rounded-full animate-spin mx-auto mb-2.5" />
              Loading pending verification queue...
            </div>
          ) : pendingRequests.length === 0 ? (
            <div className="py-8 text-center rounded-xl border border-dashed border-[#E2E9E4] bg-[#F7F9F8]/60">
              <CheckCircle2 className="w-8 h-8 text-[#16A36A] mx-auto mb-2 opacity-90" />
              <p className="text-sm font-semibold text-[#172B22]">No pending official access requests.</p>
              <p className="text-xs text-[#64746A] mt-0.5">All registrations have been reviewed.</p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {pendingRequests.map((req) => (
                <div 
                  key={req.id}
                  className="p-4 sm:p-5 rounded-xl border border-[#E2E9E4] hover:border-[#008C45]/50 bg-white flex flex-col lg:flex-row lg:items-center justify-between gap-5 transition-all shadow-2xs"
                >
                  <div className="space-y-2">
                    {/* Header info: Name, Designation & Department */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-sm sm:text-base text-[#172B22]">
                        {req.official_name || 'Government Official'}
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-mono font-semibold bg-amber-50 border border-amber-200 text-[#E6A323]">
                        {req.designation || 'Official'}
                      </span>
                      <span className="text-xs text-[#64746A] font-medium">
                        • {req.organization || 'Government of Odisha'}
                      </span>
                    </div>

                    {/* Department, District, and Employee ID */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#64746A]">
                      <span className="flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-[#008C45]" />
                        <strong className="text-[#172B22] font-medium">{req.department || 'Not available'}</strong>
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        District: <strong className="text-[#172B22] font-medium">{req.requested_district || 'Not available'}</strong>, {req.requested_state || 'Odisha'}
                      </span>
                      <span className="flex items-center gap-1">
                        <IdCard className="w-3.5 h-3.5 text-slate-400" />
                        Employee ID: <strong className="font-mono text-[#172B22]">{req.employee_id || 'Not available'}</strong>
                      </span>
                    </div>

                    {/* Email, Phone & Submission timestamp */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#64746A]">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-mono">{req.official_email || 'Not available'}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-mono">{req.mobile_number || 'Not available'}</span>
                      </span>
                      <span className="flex items-center gap-1 font-mono text-[11px] text-[#64746A]">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        Submitted: {new Date(req.created_at).toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' })}
                      </span>
                    </div>

                    {/* Stated Purpose */}
                    {req.reason && (
                      <div className="mt-1 text-xs text-[#64746A] bg-[#F7F9F8] p-2.5 rounded-lg border border-[#E2E9E4] max-w-3xl">
                        <strong className="text-[#172B22]">Stated Purpose:</strong> {req.reason}
                      </div>
                    )}
                  </div>

                  {/* Approve / Reject Actions */}
                  <div className="flex items-center gap-2.5 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-[#E2E9E4]">
                    <button
                      onClick={() => handleReject(req.id)}
                      disabled={actionLoading === req.id}
                      className="px-3.5 py-2 rounded-xl border border-red-200 bg-white hover:bg-red-50 text-[#DC4545] text-xs font-medium flex items-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer shadow-2xs"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                    <button
                      onClick={() => handleApprove(req.id)}
                      disabled={actionLoading === req.id}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#008C45] to-[#006B36] hover:from-[#007a3c] hover:to-[#005c2e] text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Approve Official</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 6. Decision History / Audit Log (Enterprise Design matching reference) */}
        <div className="bg-white border border-[#E2E9E4] rounded-xl p-5 sm:p-6 shadow-xs space-y-4">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-[#E2E9E4]">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-display font-bold text-[#172B22]">
                  Decision History & Access Audit Log
                </h2>
                <span className="px-2 py-0.5 rounded-full text-xs font-mono font-medium bg-slate-100 text-[#64746A] border border-slate-200">
                  {pastRequests.length} records
                </span>
              </div>
              <p className="text-xs text-[#64746A] mt-0.5">
                Immutable audit trail of official clearances, designations, and account status decisions.
              </p>
            </div>

            {/* Search and Status Filters */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Search input */}
              <div className="relative min-w-[220px]">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search by department, official, district..."
                  className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-[#E2E9E4] bg-white text-xs text-[#172B22] placeholder:text-slate-400 focus:outline-none focus:border-[#008C45] focus:ring-1 focus:ring-[#008C45]/20 transition-all"
                />
              </div>

              {/* Status filter tabs */}
              <div className="flex p-0.5 bg-slate-100 rounded-lg border border-[#E2E9E4]">
                {(['ALL', 'APPROVED', 'REJECTED'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => {
                      setStatusFilter(status);
                      setCurrentPage(1);
                    }}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-semibold transition-all cursor-pointer ${
                      statusFilter === status
                        ? 'bg-white text-[#008C45] shadow-xs'
                        : 'text-[#64746A] hover:text-[#172B22]'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Table Container */}
          {pastRequests.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#64746A]">
              No decision records found in database.
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#64746A]">
              No records match your search filter.
            </div>
          ) : (
            <div className="overflow-x-auto border border-[#E2E9E4] rounded-xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F7F9F8] border-b border-[#E2E9E4] text-[11px] font-mono uppercase tracking-wider text-[#64746A]">
                    <th className="py-3 px-4 font-semibold">Official / User</th>
                    <th className="py-3 px-4 font-semibold">Department & Organization</th>
                    <th className="py-3 px-4 font-semibold">District & Jurisdiction</th>
                    <th className="py-3 px-4 font-semibold">Employee ID</th>
                    <th className="py-3 px-4 font-semibold">Reviewed By</th>
                    <th className="py-3 px-4 font-semibold">Review Date</th>
                    <th className="py-3 px-4 font-semibold text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E9E4] text-xs">
                  {paginatedHistory.map((req) => {
                    const isApproved = req.approval_status === 'APPROVED';
                    const isRejected = req.approval_status === 'REJECTED';
                    const displayDate = req.reviewed_at 
                      ? new Date(req.reviewed_at).toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                      : new Date(req.created_at).toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

                    return (
                      <tr key={req.id} className="hover:bg-[#F7F9F8]/60 transition-colors">
                        
                        {/* Official / User */}
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-[#172B22]">
                            {req.official_name || 'Government Official'}
                          </div>
                          <div className="text-[11px] font-mono text-[#64746A] mt-0.5">
                            {req.official_email || 'Not available'}
                          </div>
                          <div className="inline-block mt-1 px-1.5 py-0.2 rounded text-[10px] font-mono bg-slate-100 text-[#64746A] border border-slate-200">
                            {req.designation || 'Not available'}
                          </div>
                        </td>

                        {/* Department & Organization */}
                        <td className="py-3.5 px-4">
                          <div className="font-medium text-[#172B22]">
                            {req.department || 'Not available'}
                          </div>
                          <div className="text-[11px] text-[#64746A] mt-0.5">
                            {req.organization || 'Not available'}
                          </div>
                        </td>

                        {/* District & Jurisdiction */}
                        <td className="py-3.5 px-4 font-mono text-[#172B22]">
                          <span>{req.requested_district || 'Not available'}</span>
                          <span className="text-[#64746A] text-[11px] block">{req.requested_state || 'Odisha'}</span>
                        </td>

                        {/* Employee ID */}
                        <td className="py-3.5 px-4 font-mono text-xs">
                          {req.employee_id ? (
                            <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[#172B22]">
                              {req.employee_id}
                            </span>
                          ) : (
                            <span className="text-[#64746A] italic">Not available</span>
                          )}
                        </td>

                        {/* Reviewed By */}
                        <td className="py-3.5 px-4 text-[#64746A]">
                          {req.reviewed_by ? (
                            <span className="font-mono text-[11px] text-[#172B22]">
                              Root Admin
                            </span>
                          ) : (
                            <span className="text-[11px] text-[#64746A]">System Verified</span>
                          )}
                        </td>

                        {/* Review Date */}
                        <td className="py-3.5 px-4 font-mono text-[11px] text-[#64746A] whitespace-nowrap">
                          {displayDate}
                        </td>

                        {/* Status Badge */}
                        <td className="py-3.5 px-4 text-right">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-mono font-bold tracking-wide uppercase ${
                            isApproved
                              ? 'bg-[#ECFDF5] text-[#16A36A] border border-[#A7F3D0]'
                              : isRejected
                              ? 'bg-red-50 text-[#DC4545] border border-red-200'
                              : 'bg-amber-50 text-[#E6A323] border border-amber-200'
                          }`}>
                            {isApproved && <CheckCircle2 className="w-3 h-3 text-[#16A36A]" />}
                            {isRejected && <XCircle className="w-3 h-3 text-[#DC4545]" />}
                            <span>{req.approval_status}</span>
                          </span>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="p-3 bg-[#F7F9F8] border-t border-[#E2E9E4] flex items-center justify-between text-xs text-[#64746A]">
                  <div>
                    Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredHistory.length)} of {filteredHistory.length} records
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-1.5 rounded-lg border border-[#E2E9E4] bg-white hover:bg-slate-50 disabled:opacity-40 cursor-pointer shadow-2xs"
                      title="Previous page"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="px-2 font-mono text-xs font-semibold text-[#172B22]">
                      {currentPage} / {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="p-1.5 rounded-lg border border-[#E2E9E4] bg-white hover:bg-slate-50 disabled:opacity-40 cursor-pointer shadow-2xs"
                      title="Next page"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

      </main>

    </div>
  );
};

export default AdminDashboard;