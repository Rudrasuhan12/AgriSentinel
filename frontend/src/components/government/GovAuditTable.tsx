import React, { useState } from 'react';
import { 
  Scan, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Search, 
  Box, 
  Download, 
  Check, 
  RefreshCw
} from 'lucide-react';

export interface AuditMission {
  id: string;
  mission_id: string;
  district: string;
  tahasil: string;
  village: string;
  farmer_name: string;
  farmer_id: string;
  plot_number: string;
  khata_number: string;
  flight_date: string;
  crop_variety: string;
  sensor: string;
  gsd_cm_px: number;
  heap_volume_m3: number;
  bulk_density_kg_m3: number;
  estimated_mass_qtl: number;
  ground_measured_mass_qtl: number | null;
  variance_percent: number | null;
  moisture_percent: number;
  rmse_vertical_cm: number;
  point_cloud_count: number;
  validation_status: 'APPROVED' | 'UNDER_REVIEW' | 'RECALIBRATION_REQUESTED' | 'REJECTED';
  inspecting_officer: string;
  verified_at: string | null;
  mandi_clearance_issued: boolean;
}

interface GovAuditTableProps {
  missions: AuditMission[];
  onReviewMesh: (mission: AuditMission) => void;
  onExecuteAction: (missionId: string, action: 'APPROVE' | 'RECALIBRATE' | 'REJECT', remarks?: string, groundMass?: number, moisture?: number) => Promise<void>;
  isLoading?: boolean;
}

export const GovAuditTable: React.FC<GovAuditTableProps> = ({
  missions,
  onReviewMesh,
  onExecuteAction,
  isLoading = false
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [actionModal, setActionModal] = useState<{
    mission: AuditMission;
    actionType: 'APPROVE' | 'RECALIBRATE' | 'REJECT';
  } | null>(null);

  const [actionRemarks, setActionRemarks] = useState('');
  const [groundMassInput, setGroundMassInput] = useState<number | ''>('');
  const [moistureInput, setMoistureInput] = useState<number>(14.0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter missions
  const filteredMissions = missions.filter(m => {
    const matchesStatus = statusFilter === 'ALL' || m.validation_status === statusFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery = !q || (
      m.mission_id.toLowerCase().includes(q) ||
      m.farmer_name.toLowerCase().includes(q) ||
      m.plot_number.toLowerCase().includes(q) ||
      m.district.toLowerCase().includes(q) ||
      m.village.toLowerCase().includes(q)
    );
    return matchesStatus && matchesQuery;
  });

  const handleOpenActionModal = (mission: AuditMission, actionType: 'APPROVE' | 'RECALIBRATE' | 'REJECT') => {
    setActionModal({ mission, actionType });
    setActionRemarks('');
    setGroundMassInput(mission.ground_measured_mass_qtl || mission.estimated_mass_qtl);
    setMoistureInput(mission.moisture_percent || 14.0);
  };

  const handleConfirmAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actionModal) return;

    setIsSubmitting(true);
    try {
      await onExecuteAction(
        actionModal.mission.id,
        actionModal.actionType,
        actionRemarks,
        typeof groundMassInput === 'number' ? groundMassInput : undefined,
        moistureInput
      );
      setActionModal(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const downloadAuditCsv = (mission: AuditMission) => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Mission ID,District,Tahasil,Village,Farmer Name,Farmer ID,Plot,Khata,Crop,Flight Date,Volume m3,Bulk Density,Est Mass Qtl,Ground Mass Qtl,Variance %,Moisture %,Status,Inspecting Officer\n" +
      `"${mission.mission_id}","${mission.district}","${mission.tahasil}","${mission.village}","${mission.farmer_name}","${mission.farmer_id}","${mission.plot_number}","${mission.khata_number}","${mission.crop_variety}","${mission.flight_date}",${mission.heap_volume_m3},${mission.bulk_density_kg_m3},${mission.estimated_mass_qtl},${mission.ground_measured_mass_qtl || 'N/A'},${mission.variance_percent || 'N/A'},${mission.moisture_percent},"${mission.validation_status}","${mission.inspecting_officer}"`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `AUDIT_${mission.mission_id}_CERTIFICATE.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white border border-gray-200/90 rounded-2xl p-5 shadow-xs select-none">
      
      {/* 1. Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 mb-4 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2">
            <Scan className="w-4 h-4 text-[#008C45]" />
            <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-gray-900">
              UAV PHOTOGRAMMETRY HEAP AUDITS & WEIGHBRIDGE VALIDATION
            </h2>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Volumetric 3D point-cloud reconstruction records awaiting departmental inspection and Mandi procurement clearance.
          </p>
        </div>

        {/* Filter by Status & Search */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Mission, Plot, Farmer..."
              className="pl-8 pr-3 py-1.5 rounded-xl border border-gray-300 bg-white text-xs text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-[#008C45] w-48 sm:w-56"
            />
          </div>

          {/* Status filter pills */}
          <div className="flex items-center gap-1 bg-gray-100 p-0.5 rounded-xl text-xs font-mono">
            {[
              { id: 'ALL', label: 'All' },
              { id: 'APPROVED', label: 'Approved' },
              { id: 'UNDER_REVIEW', label: 'Review' },
              { id: 'RECALIBRATION_REQUESTED', label: 'Recalibrate' },
              { id: 'REJECTED', label: 'Rejected' },
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={`px-2.5 py-1 rounded-lg transition-all font-semibold ${
                  statusFilter === tab.id ? 'bg-white text-gray-900 shadow-2xs font-bold' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Audit Records Table */}
      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-200">
        <table className="w-full text-left text-xs font-mono min-w-[920px]">
          <thead>
            <tr className="border-b border-gray-200 text-gray-500 text-[10px] uppercase">
              <th className="pb-3 font-bold w-[15%] min-w-[130px]">Mission / Plot</th>
              <th className="pb-3 font-bold w-[15%] min-w-[130px]">Farmer Name</th>
              <th className="pb-3 font-bold w-[16%] min-w-[140px]">Location</th>
              <th className="pb-3 font-bold text-right w-[10%] min-w-[100px]">Heap Volume</th>
              <th className="pb-3 font-bold text-right w-[10%] min-w-[100px]">UAV Mass</th>
              <th className="pb-3 font-bold text-right w-[10%] min-w-[110px]">Ground Mass</th>
              <th className="pb-3 font-bold text-center w-[8%] min-w-[85px]">Variance</th>
              <th className="pb-3 font-bold text-center w-[10%] min-w-[110px]">Status</th>
              <th className="pb-3 font-bold text-center w-[8%] min-w-[110px]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-xs text-gray-500">
                  <RefreshCw className="w-4 h-4 animate-spin inline-block mr-2 text-emerald-600" />
                  Loading audit mission records...
                </td>
              </tr>
            ) : filteredMissions.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-xs text-gray-400">
                  No photogrammetric missions found matching the current filters.
                </td>
              </tr>
            ) : (
              filteredMissions.map((m) => {
              const isApproved = m.validation_status === 'APPROVED';
              const isUnderReview = m.validation_status === 'UNDER_REVIEW';
              const isRecalibration = m.validation_status === 'RECALIBRATION_REQUESTED';
              const isRejected = m.validation_status === 'REJECTED';

              return (
                <tr key={m.id} className="hover:bg-gray-50/70 transition-colors">
                  
                  {/* Mission ID & Plot */}
                  <td className="py-3">
                    <span className="font-bold text-gray-900 block text-xs">{m.mission_id}</span>
                    <span className="text-[10px] text-gray-500 font-mono">
                      Plot {m.plot_number} • Khata {m.khata_number}
                    </span>
                  </td>

                  {/* Farmer Name */}
                  <td className="py-3 font-sans">
                    <span className="font-bold text-gray-900 block">{m.farmer_name}</span>
                    <span className="text-[10px] font-mono text-emerald-700">{m.farmer_id}</span>
                  </td>

                  {/* Location */}
                  <td className="py-3 text-[11px] text-gray-700 font-sans">
                    <div>{m.village}, {m.tahasil}</div>
                    <div className="text-[10px] font-mono text-gray-500">{m.district} • {m.flight_date}</div>
                  </td>

                  {/* Heap Volume */}
                  <td className="py-3 text-right font-bold text-teal-700">
                    {m.heap_volume_m3.toFixed(1)} m³
                    <span className="text-[9px] text-gray-400 block font-normal">±{m.rmse_vertical_cm}cm RMSE</span>
                  </td>

                  {/* UAV Mass */}
                  <td className="py-3 text-right font-bold text-gray-900">
                    {m.estimated_mass_qtl.toFixed(1)} Qtl
                    <span className="text-[9px] text-gray-400 block font-normal">@{m.bulk_density_kg_m3}kg/m³</span>
                  </td>

                  {/* Ground Mass */}
                  <td className="py-3 text-right font-semibold text-gray-700">
                    {m.ground_measured_mass_qtl ? `${m.ground_measured_mass_qtl.toFixed(1)} Qtl` : 'Pending Weigh'}
                    <span className="text-[9px] text-gray-400 block font-normal">Moist: {m.moisture_percent}%</span>
                  </td>

                  {/* Variance */}
                  <td className="py-3 text-center">
                    {m.variance_percent !== null ? (
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        Math.abs(m.variance_percent) <= 3.0 
                          ? 'bg-emerald-50 text-emerald-800' 
                          : 'bg-amber-50 text-amber-800'
                      }`}>
                        {m.variance_percent > 0 ? `+${m.variance_percent}%` : `${m.variance_percent}%`}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-[10px]">—</span>
                    )}
                  </td>

                  {/* Status Badge */}
                  <td className="py-3 text-center">
                    {isApproved && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-[#008C45] border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" /> Approved
                      </span>
                    )}
                    {isUnderReview && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                        <Clock className="w-3 h-3" /> Under Review
                      </span>
                    )}
                    {isRecalibration && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                        <RefreshCw className="w-3 h-3" /> Recalibrate
                      </span>
                    )}
                    {isRejected && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-800 border border-red-200">
                        <XCircle className="w-3 h-3" /> Rejected
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      
                      {/* Review 3D Mesh */}
                      <button
                        type="button"
                        onClick={() => onReviewMesh(m)}
                        title="Review 3D Mesh & Volumetric Reconstruction"
                        className="p-1.5 rounded-lg border border-gray-200 hover:bg-emerald-50 hover:border-emerald-300 text-gray-600 hover:text-[#008C45] transition-colors cursor-pointer"
                      >
                        <Box className="w-3.5 h-3.5" />
                      </button>

                      {/* Approve Action */}
                      {!isApproved && (
                        <button
                          type="button"
                          onClick={() => handleOpenActionModal(m, 'APPROVE')}
                          title="Authorize Yield & Issue Mandi Procurement Token"
                          className="p-1.5 rounded-lg border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-[#008C45] transition-colors cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Recalibrate Action */}
                      {!isApproved && (
                        <button
                          type="button"
                          onClick={() => handleOpenActionModal(m, 'RECALIBRATE')}
                          title="Recalibrate with Physical Weighbridge / Moisture Sample"
                          className="p-1.5 rounded-lg border border-gray-200 hover:bg-blue-50 hover:border-blue-300 text-gray-600 hover:text-blue-700 transition-colors cursor-pointer"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Download CSV Audit Certificate */}
                      <button
                        type="button"
                        onClick={() => downloadAuditCsv(m)}
                        title="Download Signed Inspection Certificate (CSV)"
                        className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>

                    </div>
                  </td>

                </tr>
              );
            }))}
          </tbody>
        </table>
      </div>

      {/* 3. Official Action Dialog Modal */}
      {actionModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-150">
            
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <div>
                <span className="text-[10px] font-mono text-gray-500 uppercase block">Government Action</span>
                <h3 className="font-display font-bold text-lg text-gray-900">
                  {actionModal.actionType === 'APPROVE' && 'Approve & Issue Mandi Procurement Token'}
                  {actionModal.actionType === 'RECALIBRATE' && 'Recalibrate Yield with Ground Measurement'}
                  {actionModal.actionType === 'REJECT' && 'Reject Photogrammetric Audit Record'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActionModal(null)}
                className="text-gray-400 hover:text-gray-700 p-1 rounded-md"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmAction} className="space-y-3.5 text-xs">
              
              {/* Mission Summary Pill */}
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 font-mono text-[11px] space-y-1">
                <div>Mission: <strong className="text-gray-900">{actionModal.mission.mission_id}</strong></div>
                <div>Farmer: <strong className="text-gray-900">{actionModal.mission.farmer_name}</strong> ({actionModal.mission.farmer_id})</div>
                <div>Plot / Khata: <strong className="text-gray-900">{actionModal.mission.plot_number}</strong> • Khata {actionModal.mission.khata_number}</div>
                <div>UAV Photogrammetric Mass: <strong className="text-[#008C45]">{actionModal.mission.estimated_mass_qtl} Quintals</strong></div>
              </div>

              {/* Physical Weighbridge & Moisture inputs for Recalibrate or Approve */}
              {(actionModal.actionType === 'RECALIBRATE' || actionModal.actionType === 'APPROVE') && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-mono uppercase font-bold text-gray-700 mb-1">
                      Physical Scale Mass (Qtl)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={groundMassInput}
                      onChange={(e) => setGroundMassInput(parseFloat(e.target.value) || '')}
                      placeholder="e.g. 81.4"
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 font-mono text-xs focus:outline-none focus:border-[#008C45]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase font-bold text-gray-700 mb-1">
                      Measured Moisture (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={moistureInput}
                      onChange={(e) => setMoistureInput(parseFloat(e.target.value) || 14.0)}
                      placeholder="14.0"
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 font-mono text-xs focus:outline-none focus:border-[#008C45]"
                    />
                  </div>
                </div>
              )}

              {/* Official Remarks */}
              <div>
                <label className="block text-[10px] font-mono uppercase font-bold text-gray-700 mb-1">
                  Official Audit Remarks *
                </label>
                <textarea
                  rows={2}
                  required
                  value={actionRemarks}
                  onChange={(e) => setActionRemarks(e.target.value)}
                  placeholder="Enter observation on heap density, moisture readings, or weighbridge calibration..."
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:outline-none focus:border-[#008C45]"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setActionModal(null)}
                  className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 font-mono text-xs font-semibold"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-5 py-2 rounded-xl text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-xs transition-all ${
                    actionModal.actionType === 'APPROVE' 
                      ? 'bg-[#008C45] hover:bg-[#007338]' 
                      : actionModal.actionType === 'RECALIBRATE'
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {isSubmitting ? 'Recording...' : `Confirm ${actionModal.actionType}`}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
