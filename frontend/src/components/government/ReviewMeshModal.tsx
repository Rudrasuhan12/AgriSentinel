import React from 'react';
import { 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  RefreshCw, 
  Box, 
  Layers, 
  Activity, 
  MapPin, 
  ShieldCheck,
  FileCheck,
  Calendar
} from 'lucide-react';
import { Interactive3DHeapViewer } from '../Interactive3DHeapViewer';
import { AuditMission } from './GovAuditTable';

interface ReviewMeshModalProps {
  isOpen: boolean;
  onClose: () => void;
  mission: AuditMission | null;
  onApprove: (missionId: string) => void;
  onRecalibrate: (missionId: string) => void;
  onReject: (missionId: string) => void;
}

export const ReviewMeshModal: React.FC<ReviewMeshModalProps> = ({
  isOpen,
  onClose,
  mission,
  onApprove,
  onRecalibrate,
  onReject
}) => {
  if (!isOpen || !mission) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-5xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Institutional Header */}
        <div className="px-6 py-4 bg-[#08331E] text-white flex items-center justify-between border-b border-[#0A4026]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 rounded-lg border border-emerald-400/30 text-emerald-300">
              <Box className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg text-white tracking-wide">
                  Photogrammetric 3D Heap Model Review
                </h3>
                <span className="px-2 py-0.5 rounded text-xs font-mono font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-500/30">
                  {mission.mission_id}
                </span>
                <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                  mission.validation_status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
                  mission.validation_status === 'UNDER_REVIEW' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                  mission.validation_status === 'RECALIBRATION_REQUESTED' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40' :
                  'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                }`}>
                  {mission.validation_status.replace(/_/g, ' ')}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5 flex items-center gap-2">
                <span>Farmer: <strong>{mission.farmer_name}</strong> ({mission.farmer_id})</span>
                <span>•</span>
                <span>Plot: <strong>{mission.plot_number}</strong> (Khata {mission.khata_number})</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-emerald-400" />
                  {mission.village}, {mission.tahasil}, {mission.district}
                </span>
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50">
          
          {/* Main 3D Viewer & Telemetry Split */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* 3D Canvas Box */}
            <div className="lg:col-span-8 bg-slate-950 rounded-xl overflow-hidden border border-slate-800 relative shadow-inner">
              <div className="absolute top-3 left-3 z-10 flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700/60 text-xs text-slate-200">
                <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span className="font-mono">Structure-from-Motion (SfM) Mesh</span>
                <span className="text-slate-500">|</span>
                <span className="text-emerald-400 font-semibold">{mission.point_cloud_count.toLocaleString()} pts</span>
              </div>

              <div className="w-full">
                <Interactive3DHeapViewer height="420px" showControls={true} />
              </div>

              <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs text-slate-300">
                <div className="flex items-center gap-4">
                  <span>Sensor: <strong className="text-white">{mission.sensor}</strong></span>
                  <span>GSD: <strong className="text-emerald-400">{mission.gsd_cm_px} cm/px</strong></span>
                  <span>Vertical RMSE: <strong className="text-emerald-400">±{mission.rmse_vertical_cm} cm</strong></span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Flight: {mission.flight_date}</span>
                </div>
              </div>
            </div>

            {/* Right Telemetry & Volumetric Summary */}
            <div className="lg:col-span-4 space-y-4 flex flex-col justify-between">
              
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-emerald-600" />
                  Volumetric Assessment
                </h4>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                    <span className="text-[11px] text-slate-500 block">Digital Heap Volume</span>
                    <span className="text-lg font-bold font-mono text-slate-900">{mission.heap_volume_m3.toFixed(2)}</span>
                    <span className="text-xs text-slate-500 ml-1">m³</span>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                    <span className="text-[11px] text-slate-500 block">ICAR Bulk Density</span>
                    <span className="text-lg font-bold font-mono text-slate-900">{mission.bulk_density_kg_m3.toFixed(1)}</span>
                    <span className="text-xs text-slate-500 ml-1">kg/m³</span>
                  </div>

                  <div className="bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
                    <span className="text-[11px] text-emerald-700 block font-medium">UAV Estimated Mass</span>
                    <span className="text-lg font-bold font-mono text-emerald-800">{mission.estimated_mass_qtl.toFixed(2)}</span>
                    <span className="text-xs text-emerald-700 ml-1 font-medium">Quintals</span>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                    <span className="text-[11px] text-slate-500 block">Moisture Factor</span>
                    <span className="text-lg font-bold font-mono text-slate-900">{mission.moisture_percent.toFixed(1)}%</span>
                    <span className="text-[10px] text-slate-500 block">Ref: 14.0%</span>
                  </div>
                </div>
              </div>

              {/* Ground Weighbridge Comparison Card */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <FileCheck className="w-4 h-4 text-emerald-600" />
                    Ground Audit Benchmark
                  </span>
                  {mission.ground_measured_mass_qtl ? (
                    <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                      Calibrated
                    </span>
                  ) : (
                    <span className="text-[11px] font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                      Pending Scale
                    </span>
                  )}
                </h4>

                {mission.ground_measured_mass_qtl ? (
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center py-1 border-b border-slate-100">
                      <span className="text-slate-600">Physical Weighbridge:</span>
                      <span className="font-mono font-bold text-slate-900">{mission.ground_measured_mass_qtl.toFixed(2)} Quintals</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-slate-100">
                      <span className="text-slate-600">Model Variance:</span>
                      <span className={`font-mono font-bold ${
                        (mission.variance_percent ?? 0) <= 2.5 ? 'text-emerald-700' :
                        (mission.variance_percent ?? 0) <= 5.0 ? 'text-amber-700' : 'text-rose-700'
                      }`}>
                        {(mission.variance_percent ?? 0) > 0 ? '+' : ''}{(mission.variance_percent ?? 0).toFixed(2)}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="text-slate-600">Mandi Gatepass Status:</span>
                      <span className={`font-semibold ${mission.mandi_clearance_issued ? 'text-emerald-700' : 'text-amber-700'}`}>
                        {mission.mandi_clearance_issued ? 'Dispatched' : 'Awaiting Approval'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">
                    Physical test weighbridge weighing has not been submitted. Approval will generate a conditional clearance quota.
                  </p>
                )}
              </div>

              {/* Inspecting Officer Footnote */}
              <div className="bg-slate-100 rounded-lg p-3 text-[11px] text-slate-600 border border-slate-200">
                <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Assigned Audit Officer</span>
                </div>
                <p className="mt-0.5">{mission.inspecting_officer}</p>
                {mission.verified_at && (
                  <p className="text-slate-500 text-[10px] mt-0.5">Verified on: {mission.verified_at}</p>
                )}
              </div>

            </div>
          </div>

          {/* Institutional Compliance Notice */}
          <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-lg flex items-start gap-2.5 text-xs text-amber-900">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong>Government Certification Requirement:</strong> Per Odisha Mandi Procurement Rules, volumetric estimates with &gt; 5.0% discrepancy against verified tare weights must undergo physical recalibration before MSP Direct Benefit Transfer (DBT) clearance.
            </div>
          </div>

        </div>

        {/* Modal Action Bar */}
        <div className="px-6 py-4 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <button 
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-100 transition-colors"
          >
            Close Viewer
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onReject(mission.id);
                onClose();
              }}
              className="px-3.5 py-2 bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <XCircle className="w-4 h-4" />
              Reject Audit
            </button>

            <button
              type="button"
              onClick={() => {
                onRecalibrate(mission.id);
                onClose();
              }}
              className="px-3.5 py-2 bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Request Recalibration
            </button>

            <button
              type="button"
              onClick={() => {
                onApprove(mission.id);
                onClose();
              }}
              className="px-4 py-2 bg-[#008C45] hover:bg-[#007439] text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              Approve Yield for Mandi MSP
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
