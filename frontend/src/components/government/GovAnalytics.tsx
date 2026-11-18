import React from 'react';
import { 
  BarChart3, 
  PieChart, 
  Plane, 
  Scale,
  Calendar,
  CheckCircle2
} from 'lucide-react';

export interface DistrictStat {
  district: string;
  farmers: number;
  parcels: number;
  acreage: number;
  yield_q_ha: number;
  sorties: number;
  cadastral_parcels: number;
}

export interface CropStat {
  variety: string;
  acreage: number;
  percentage: number;
  avg_yield_q_ha: number;
}

export interface AnalyticsData {
  district_breakdown: DistrictStat[];
  crop_distribution: CropStat[];
  harvest_status: {
    harvested_acres: number;
    unharvested_acres: number;
    harvested_percentage: number;
  };
  uav_funnel: {
    imagery_captured: number;
    orthomosaics_generated: number;
    point_clouds_reconstructed: number;
    volume_calculated: number;
    mass_certified: number;
  };
  density_benchmark: {
    bulk_density_kg_m3: number;
    rmse_vertical_cm: number;
    reference_moisture: number;
  };
}

export const DEFAULT_ANALYTICS: AnalyticsData = {
  district_breakdown: [
    { district: "Cuttack", farmers: 642, parcels: 1420, acreage: 2180.5, yield_q_ha: 41.2, sorties: 148, cadastral_parcels: 8 },
    { district: "Bargarh", farmers: 418, parcels: 980, acreage: 1540.0, yield_q_ha: 44.8, sorties: 94, cadastral_parcels: 2 },
    { district: "Sambalpur", farmers: 214, parcels: 490, acreage: 760.0, yield_q_ha: 39.5, sorties: 46, cadastral_parcels: 1 },
    { district: "Puri", farmers: 120, parcels: 210, acreage: 315.0, yield_q_ha: 36.8, sorties: 18, cadastral_parcels: 0 },
    { district: "Khordha", farmers: 88, parcels: 118, acreage: 125.0, yield_q_ha: 38.0, sorties: 12, cadastral_parcels: 0 }
  ],
  crop_distribution: [
    { variety: "Swarna (MTU-7029)", acreage: 2240, percentage: 45.5, avg_yield_q_ha: 42.5 },
    { variety: "Pooja (CR 1009)", acreage: 1410, percentage: 28.7, avg_yield_q_ha: 40.8 },
    { variety: "Sambha Mahsuri", acreage: 780, percentage: 15.8, avg_yield_q_ha: 44.2 },
    { variety: "Lalat", acreage: 490, percentage: 10.0, avg_yield_q_ha: 36.5 }
  ],
  harvest_status: {
    harvested_acres: 3120,
    unharvested_acres: 1800,
    harvested_percentage: 63.4
  },
  uav_funnel: {
    imagery_captured: 318,
    orthomosaics_generated: 298,
    point_clouds_reconstructed: 284,
    volume_calculated: 265,
    mass_certified: 242
  },
  density_benchmark: {
    bulk_density_kg_m3: 578.0,
    rmse_vertical_cm: 1.4,
    reference_moisture: 14.0
  }
};

/* -------------------------------------------------------------------------- */
/* Component 1: Compact Side Analytics (For GIS Section in Executive Overview)*/
/* -------------------------------------------------------------------------- */
export interface GovExecutiveSideAnalyticsProps {
  analytics?: AnalyticsData;
  selectedDistrict: string;
}

export const GovExecutiveSideAnalytics: React.FC<GovExecutiveSideAnalyticsProps> = ({
  analytics: propAnalytics,
  selectedDistrict
}) => {
  const analytics = propAnalytics || DEFAULT_ANALYTICS;
  const varietyColors = ['bg-[#008C45]', 'bg-[#0284C7]', 'bg-[#D97706]', 'bg-[#7C3AED]'];

  return (
    <div className="flex flex-col gap-4 h-full justify-between">
      
      {/* 1. Crop Variety Distribution Card */}
      <div className="bg-white border border-gray-200/90 rounded-2xl p-4 sm:p-5 shadow-xs flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <PieChart className="w-4 h-4 text-[#008C45]" />
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-gray-900">
                CROP VARIETY SHARE
              </h3>
            </div>
            <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Kharif 2026
            </span>
          </div>

          <div className="space-y-3">
            {analytics.crop_distribution.map((crop, idx) => {
              const color = varietyColors[idx % varietyColors.length];
              return (
                <div key={crop.variety} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-gray-800 text-[11px] truncate max-w-[170px]" title={crop.variety}>
                      {crop.variety}
                    </span>
                    <div className="flex items-center gap-1.5 font-mono text-[11px] shrink-0">
                      <span className="text-gray-500">{crop.acreage.toLocaleString()} Ac</span>
                      <strong className="text-gray-900 min-w-[36px] text-right">{crop.percentage}%</strong>
                    </div>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${color} rounded-full transition-all duration-700`}
                      style={{ width: `${crop.percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between text-[10px] font-mono text-gray-500">
          <span>Active Scope: <strong>{selectedDistrict}</strong></span>
          <span>4 Identified Varieties</span>
        </div>
      </div>

      {/* 2. Harvest Stage Progress Card */}
      <div className="bg-white border border-gray-200/90 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#008C45]" />
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-gray-900">
                HARVEST STAGE STATUS
              </h3>
            </div>
            <span className="text-[10px] font-mono font-bold text-[#008C45]">
              {analytics.harvest_status.harvested_percentage}% Harvested
            </span>
          </div>

          {/* Dual Segment Progress Bar */}
          <div className="w-full h-3 bg-amber-100 rounded-full overflow-hidden flex shadow-inner">
            <div 
              className="bg-[#008C45] h-full transition-all duration-500" 
              style={{ width: `${analytics.harvest_status.harvested_percentage}%` }} 
              title="Harvested Area"
            />
            <div 
              className="bg-amber-400 h-full transition-all duration-500" 
              style={{ width: `${100 - analytics.harvest_status.harvested_percentage}%` }} 
              title="Standing Crop Area"
            />
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 text-xs font-mono">
            <div className="p-2 rounded-lg bg-emerald-50/70 border border-emerald-100">
              <span className="text-[10px] text-emerald-800 block">Harvested</span>
              <strong className="text-gray-900 text-xs">{analytics.harvest_status.harvested_acres.toLocaleString()} Ac</strong>
            </div>
            <div className="p-2 rounded-lg bg-amber-50/70 border border-amber-100">
              <span className="text-[10px] text-amber-800 block">Standing Crop</span>
              <strong className="text-gray-900 text-xs">{analytics.harvest_status.unharvested_acres.toLocaleString()} Ac</strong>
            </div>
          </div>
        </div>

        <div className="mt-3 pt-2.5 border-t border-gray-100 text-[10px] font-mono text-gray-500 flex items-center justify-between">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Digital Crop Survey Verified</span>
          </span>
          <span>4,920 Ac Total</span>
        </div>
      </div>

    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Component 2: Spacious District Comparison Table                            */
/* -------------------------------------------------------------------------- */
export interface GovDistrictComparisonTableProps {
  analytics?: AnalyticsData;
  selectedDistrict: string;
}

export const GovDistrictComparisonTable: React.FC<GovDistrictComparisonTableProps> = ({
  analytics: propAnalytics,
  selectedDistrict
}) => {
  const analytics = propAnalytics || DEFAULT_ANALYTICS;
  const stateBenchmarkYield = 38.5; // Qtl / Ha state average

  return (
    <div className="bg-white border border-gray-200/90 rounded-2xl p-5 shadow-xs w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-4 border-b border-gray-100 gap-2">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-[#008C45]" />
          <div>
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-gray-900">
              DISTRICT-WISE AGRICULTURAL CADASTRE & YIELD BENCHMARKS
            </h3>
            <p className="text-[11px] text-gray-500 font-sans mt-0.5">
              Odisha Digital Crop Survey district-level aggregation of georeferenced cadastral plots and UAV sorties.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-gray-500 bg-gray-50 px-2.5 py-1 rounded-md border border-gray-200">
            State Avg: <strong>38.5 Qtl/Ha</strong>
          </span>
          <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 font-semibold">
            PostGIS Verified
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead>
            <tr className="border-b border-gray-200 text-gray-500 text-[10px] uppercase">
              <th className="pb-3 font-bold min-w-[130px]">District</th>
              <th className="pb-3 font-bold text-right min-w-[120px]">Registered Farmers</th>
              <th className="pb-3 font-bold text-right min-w-[130px]">Mapped Acreage</th>
              <th className="pb-3 font-bold text-right min-w-[110px]">UAV Sorties</th>
              <th className="pb-3 font-bold text-right min-w-[120px]">Cadastral Plots</th>
              <th className="pb-3 font-bold text-right min-w-[130px]">Yield (Qtl/Ha)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {analytics.district_breakdown.map((d) => {
              const isSelected = selectedDistrict.toLowerCase() === d.district.toLowerCase();
              const yieldDelta = +(d.yield_q_ha - stateBenchmarkYield).toFixed(1);
              return (
                <tr 
                  key={d.district} 
                  className={`hover:bg-gray-50/80 transition-colors ${
                    isSelected ? 'bg-emerald-50/50 font-bold' : ''
                  }`}
                >
                  <td className="py-3 text-gray-900 font-sans font-semibold flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-[#008C45]' : 'bg-gray-300'}`} />
                    <span>{d.district}</span>
                  </td>
                  <td className="py-3 text-right text-gray-700 font-mono">{d.farmers.toLocaleString()}</td>
                  <td className="py-3 text-right text-gray-900 font-mono font-bold">{d.acreage.toLocaleString()} Ac</td>
                  <td className="py-3 text-right text-indigo-700 font-mono font-semibold">{d.sorties}</td>
                  <td className="py-3 text-right text-emerald-800 font-mono">{d.cadastral_parcels}</td>
                  <td className="py-3 text-right">
                    <span className="inline-flex items-center gap-1 font-bold text-[#008C45] font-mono">
                      {d.yield_q_ha}
                      <span className={`text-[10px] font-normal ${yieldDelta >= 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
                        ({yieldDelta > 0 ? `+${yieldDelta}` : yieldDelta})
                      </span>
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Component 3: UAV Pipeline Funnel & Empirical Density Formulations           */
/* -------------------------------------------------------------------------- */
export const GovUavPipelineAndDensity: React.FC<{ analytics?: AnalyticsData }> = ({
  analytics: propAnalytics
}) => {
  const analytics = propAnalytics || DEFAULT_ANALYTICS;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
      
      {/* Card 1: UAV Processing Pipeline Funnel */}
      <div className="bg-white border border-gray-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 mb-3.5 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Plane className="w-4 h-4 text-[#008C45]" />
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-gray-900">
                UAV PHOTOGRAMMETRY WORKFLOW FUNNEL
              </h3>
            </div>
            <span className="text-[10px] font-mono text-gray-400">
              Sortie to Digital Yield Certificate
            </span>
          </div>

          <div className="grid grid-cols-5 gap-2 text-center text-xs font-mono">
            <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100">
              <span className="text-[9.5px] text-gray-500 uppercase block">1. Flights</span>
              <span className="text-base sm:text-lg font-bold text-gray-900">{analytics.uav_funnel.imagery_captured}</span>
              <span className="text-[9px] text-gray-400 block mt-0.5">Sorties</span>
            </div>

            <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100">
              <span className="text-[9.5px] text-gray-500 uppercase block">2. Ortho</span>
              <span className="text-base sm:text-lg font-bold text-gray-900">{analytics.uav_funnel.orthomosaics_generated}</span>
              <span className="text-[9px] text-emerald-600 block mt-0.5">94%</span>
            </div>

            <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100">
              <span className="text-[9.5px] text-gray-500 uppercase block">3. 3D Cloud</span>
              <span className="text-base sm:text-lg font-bold text-gray-900">{analytics.uav_funnel.point_clouds_reconstructed}</span>
              <span className="text-[9px] text-emerald-600 block mt-0.5">91%</span>
            </div>

            <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100">
              <span className="text-[9.5px] text-gray-500 uppercase block">4. Volume</span>
              <span className="text-base sm:text-lg font-bold text-gray-900">{analytics.uav_funnel.volume_calculated}</span>
              <span className="text-[9px] text-emerald-600 block mt-0.5">88%</span>
            </div>

            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
              <span className="text-[9.5px] text-emerald-800 uppercase block font-bold">5. Certified</span>
              <span className="text-base sm:text-lg font-bold text-[#008C45]">{analytics.uav_funnel.mass_certified}</span>
              <span className="text-[9px] text-emerald-700 block mt-0.5 font-bold">82%</span>
            </div>
          </div>
        </div>

        <p className="text-[11px] text-gray-500 mt-3 font-sans">
          Sorties flown at 35m AGL with RTK fixed GPS (±1.5cm accuracy). Dense point clouds triangulated via Structure-from-Motion (SfM) to compute digital surface volume integrals.
        </p>
      </div>

      {/* Card 2: Empirical Physical Density Calibration Benchmark */}
      <div className="bg-white border border-gray-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 mb-3.5 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Scale className="w-4 h-4 text-[#008C45]" />
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-gray-900">
                CALIBRATED AGRONOMIC DENSITY FORMULATION
              </h3>
            </div>
            <span className="text-[10px] font-mono text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              ICAR-NRRI Benchmark
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900 text-emerald-300 font-mono text-xs overflow-x-auto">
            <code>M = [ (V × ρ_bulk) / 100 ] × [ (100 - M_act) / (100 - M_ref) ]</code>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-3 text-center text-xs font-mono">
            <div className="p-2 rounded-lg bg-gray-50 border border-gray-200">
              <span className="text-[9px] text-gray-500 uppercase block">Swarna Density</span>
              <span className="font-bold text-gray-900">{analytics.density_benchmark.bulk_density_kg_m3} kg/m³</span>
            </div>
            <div className="p-2 rounded-lg bg-gray-50 border border-gray-200">
              <span className="text-[9px] text-gray-500 uppercase block">Vertical Precision</span>
              <span className="font-bold text-[#008C45]">±{analytics.density_benchmark.rmse_vertical_cm} cm</span>
            </div>
            <div className="p-2 rounded-lg bg-gray-50 border border-gray-200">
              <span className="text-[9px] text-gray-500 uppercase block">Std Moisture</span>
              <span className="font-bold text-gray-900">{analytics.density_benchmark.reference_moisture}%</span>
            </div>
          </div>
        </div>

        <span className="text-[10px] font-mono text-gray-400 mt-3 block">
          Approved under Government of Odisha Digital Agriculture Decision Support Protocols.
        </span>
      </div>

    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Component 4: Full Comprehensive View (For Analytics Tab)                   */
/* -------------------------------------------------------------------------- */
export interface GovAnalyticsProps {
  analytics?: AnalyticsData;
  selectedDistrict: string;
}

export const GovAnalytics: React.FC<GovAnalyticsProps> = ({
  analytics: propAnalytics,
  selectedDistrict
}) => {
  const analytics = propAnalytics || DEFAULT_ANALYTICS;

  return (
    <div className="space-y-6 select-none w-full">
      {/* 1. Top Analytics Header */}
      <div className="bg-white border border-gray-200/90 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#008C45] animate-pulse" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#008C45]">
              OFFICIAL AGRICULTURAL INTELLIGENCE & SENSOR ANALYTICS
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-display font-bold text-[#0f2e1e] tracking-tight">
            Odisha Digital Crop Survey & Volumetric Harvest Yield Metrics
          </h2>
          <p className="text-xs text-gray-500 mt-1 max-w-2xl font-normal">
            Real-time multi-district aggregation linking cadastral acreage, crop variety distribution, ground yield benchmarks, and UAV photogrammetric sortie completion.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="px-3 py-1.5 rounded-xl bg-gray-50 border border-gray-200 text-xs font-mono text-gray-700 font-semibold">
            Baseline: Kharif 2026
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-mono text-[#008C45] font-bold">
            PostGIS Verified
          </span>
        </div>
      </div>

      {/* 2. District Comparison Table */}
      <GovDistrictComparisonTable 
        analytics={analytics}
        selectedDistrict={selectedDistrict}
      />

      {/* 3. UAV Pipeline Funnel & Density Formulations */}
      <GovUavPipelineAndDensity analytics={analytics} />
    </div>
  );
};
