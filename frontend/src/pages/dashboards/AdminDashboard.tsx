import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
import { 
  Shield, 
  Users, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  LogOut, 
  Database, 
  RefreshCw,
  Building2,
  Mail,
  Phone,
  Server
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface OfficialRequest {
  id: string;
  user_id: string;
  department: string;
  designation: string;
  jurisdiction_district: string;
  official_id_number: string;
  approval_status: 'PENDING' | 'APPROVED' | 'REJECTED';
  created_at: string;
  user: {
    id: string;
    email: string;
    full_name: string;
    mobile_number: string;
    role: string;
    account_status: string;
  };
}

export const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [requests, setRequests] = useState<OfficialRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.get<OfficialRequest[]>('/api/admin/official-requests');
      setRequests(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch official access requests.');
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
      setSuccessMessage('Official access request approved successfully.');
      setTimeout(() => setSuccessMessage(null), 4000);
      await fetchRequests();
    } catch (err: any) {
      alert(err.message || 'Approval failed');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: string) => {
    const reason = prompt('Please provide reason for rejection:');
    if (!reason) return;

    try {
      setActionLoading(id);
      await api.post(`/api/admin/official-requests/${id}/reject`, { reason });
      setSuccessMessage('Official access request rejected.');
      setTimeout(() => setSuccessMessage(null), 4000);
      await fetchRequests();
    } catch (err: any) {
      alert(err.message || 'Rejection failed');
    } finally {
      setActionLoading(null);
    }
  };

  const pendingRequests = requests.filter(r => r.approval_status === 'PENDING');
  const pastRequests = requests.filter(r => r.approval_status !== 'PENDING');

  return (
    <div className="min-h-screen bg-charcoal-950 text-sand-100 flex flex-col">
      {/* Top Header */}
      <header className="bg-charcoal-900 border-b border-forest-800/80 sticky top-0 z-30 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-amber-950 border border-amber-500/40 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <span className="font-display font-bold text-sm tracking-tight text-sand-50">
                Agri<span className="text-amber-400">Sentinel</span>
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-950/80 border border-amber-500/30 text-amber-300">
                SYSTEM ADMINISTRATOR
              </span>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-xs font-semibold text-sand-50">{user?.full_name}</span>
            <span className="text-[10px] font-mono text-amber-400">
              Root Administrator ({user?.email})
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

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8 space-y-6">
        {/* Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-charcoal-900/80 border border-forest-800 p-6 rounded-2xl">
          <div>
            <h1 className="text-xl sm:text-2xl font-display font-bold text-sand-50">
              System Administration & Security Console
            </h1>
            <p className="text-xs text-sand-300 mt-1">
              Review government official clearance requests, manage role-based permissions, and supervise database integrity.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchRequests}
              disabled={loading}
              className="px-3.5 py-2 rounded-lg bg-forest-800 hover:bg-forest-700 text-lime-accent text-xs font-mono flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Notifications */}
        {successMessage && (
          <div className="p-3 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            {successMessage}
          </div>
        )}

        {error && (
          <div className="p-3 rounded-lg bg-rose-950/80 border border-rose-500/40 text-rose-300 text-xs font-mono flex items-center gap-2">
            <XCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        {/* System & DB Status Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-charcoal-900/80 border border-forest-800/70 rounded-xl p-4">
            <div className="text-[11px] font-mono text-olive-400 uppercase tracking-wider mb-1">
              Pending Approvals
            </div>
            <div className="text-2xl font-bold font-mono text-amber-400">
              {pendingRequests.length}
            </div>
            <span className="text-[10px] text-sand-400 mt-1 block">Government access requests</span>
          </div>

          <div className="bg-charcoal-900/80 border border-forest-800/70 rounded-xl p-4">
            <div className="text-[11px] font-mono text-olive-400 uppercase tracking-wider mb-1">
              Total Reviewed
            </div>
            <div className="text-2xl font-bold font-mono text-sand-50">
              {pastRequests.length}
            </div>
            <span className="text-[10px] text-emerald-400 mt-1 block">Audited records</span>
          </div>

          <div className="bg-charcoal-900/80 border border-forest-800/70 rounded-xl p-4">
            <div className="text-[11px] font-mono text-olive-400 uppercase tracking-wider mb-1">
              PostGIS Engine
            </div>
            <div className="text-lg font-bold font-mono text-sand-50 flex items-center gap-2">
              <Database className="w-4 h-4 text-lime-accent" />
              v3.5 (PostgreSQL 16)
            </div>
            <span className="text-[10px] text-lime-400 mt-1 block">Container: agrisentinel_db:5436</span>
          </div>

          <div className="bg-charcoal-900/80 border border-forest-800/70 rounded-xl p-4">
            <div className="text-[11px] font-mono text-olive-400 uppercase tracking-wider mb-1">
              FastAPI Auth Backend
            </div>
            <div className="text-lg font-bold font-mono text-sand-50 flex items-center gap-2">
              <Server className="w-4 h-4 text-teal-400" />
              v1.0.0 Online
            </div>
            <span className="text-[10px] text-teal-400 mt-1 block">JWT + bcrypt + Role RBAC</span>
          </div>
        </div>

        {/* Pending Requests Section */}
        <div className="bg-charcoal-900/80 border border-forest-800/70 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider font-mono text-sand-50 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                Pending Official Access Requests ({pendingRequests.length})
              </h2>
              <p className="text-xs text-sand-400 mt-0.5">
                Government officials require manual administrator review before access is unlocked.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs font-mono text-olive-400">
              <div className="w-8 h-8 border-2 border-forest-600 border-t-amber-400 rounded-full animate-spin mx-auto mb-2" />
              Loading requests...
            </div>
          ) : pendingRequests.length === 0 ? (
            <div className="py-10 text-center rounded-lg border border-dashed border-forest-800 bg-charcoal-950/50">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-80" />
              <p className="text-xs font-mono text-sand-300">No pending official access requests at this time.</p>
              <p className="text-[11px] text-olive-500 mt-1">All registrations have been reviewed.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingRequests.map((req) => (
                <div 
                  key={req.id}
                  className="p-4 rounded-xl bg-charcoal-950 border border-forest-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:border-amber-500/40 transition-colors"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-sand-50">{req.user?.full_name}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-950 border border-amber-500/40 text-amber-300">
                        {req.designation}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-sand-300 font-mono">
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-olive-400" />
                        {req.department}
                      </span>
                      <span>District: <strong className="text-sand-100">{req.jurisdiction_district}</strong></span>
                      <span>ID: <strong className="text-sand-100">{req.official_id_number}</strong></span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-olive-400 font-mono">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {req.user?.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {req.user?.mobile_number}
                      </span>
                      <span>Submitted: {new Date(req.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-forest-900">
                    <button
                      onClick={() => handleReject(req.id)}
                      disabled={actionLoading === req.id}
                      className="px-3 py-1.5 rounded-lg border border-rose-900/60 bg-rose-950/40 text-rose-300 hover:bg-rose-900/60 text-xs font-mono flex items-center gap-1.5 transition-colors disabled:opacity-50"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Reject
                    </button>
                    <button
                      onClick={() => handleApprove(req.id)}
                      disabled={actionLoading === req.id}
                      className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-sand-50 text-xs font-mono font-semibold flex items-center gap-1.5 transition-colors shadow-sm disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Approve Official
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Past Decisions History */}
        {pastRequests.length > 0 && (
          <div className="bg-charcoal-900/80 border border-forest-800/70 rounded-xl p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wider font-mono text-sand-50 mb-3">
              Decision History ({pastRequests.length})
            </h2>
            <div className="divide-y divide-forest-900/60">
              {pastRequests.map((req) => (
                <div key={req.id} className="py-3 flex items-center justify-between text-xs font-mono">
                  <div>
                    <span className="text-sand-100 font-sans font-medium">{req.user?.full_name}</span>
                    <span className="text-olive-400 ml-2">({req.department} - {req.jurisdiction_district})</span>
                  </div>
                  <div>
                    <span className={`px-2 py-0.5 rounded text-[10px] ${
                      req.approval_status === 'APPROVED'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                        : 'bg-rose-950 text-rose-300 border border-rose-500/40'
                    }`}>
                      {req.approval_status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
