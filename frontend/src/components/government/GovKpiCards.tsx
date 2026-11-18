import React from 'react';
import { 
  Users, 
  Map, 
  Layers, 
  Plane, 
  Clock, 
  CheckCircle2, 
  Scale, 
  TrendingUp,
  AlertCircle
} from 'lucide-react';

export interface KpiData {
  total_registered_farmers: {
    value: number;
    unit: string;
    description: string;
    comparison: string;
    trend?: number[];
  };
  total_registered_parcels: {
    value: number;
    unit: string;
    description: string;
    comparison: string;
    trend?: number[];
  };
  total_mapped_area_acres: {
    value: number;
    unit: string;
    description: string;
    comparison: string;
    trend?: number[];
  };
  completed_uav_surveys: {
    value: number;
    unit: string;
    description: string;
    comparison: string;
    trend?: number[];
  };
  pending_uav_inspections: {
    value: number;
    unit: string;
    description: string;
    comparison: string;
    trend?: number[];
  };
  verified_harvest_mass_qtl: {
    value: number;
    unit: string;
    description: string;
    comparison: string;
    trend?: number[];
  };
  pending_yield_verifications: {
    value: number;
    unit: string;
    description: string;
    comparison: string;
    trend?: number[];
  };
  mandi_procurement_progress: {
    value: number;
    unit: string;
    description: string;
    comparison: string;
    target_qtl?: number;
    procured_qtl?: number;
    pending_qtl?: number;
  };
}

export type GovKpiData = any;

export interface GovKpiCardsProps {
  kpis?: KpiData;
  data?: any;
  isLoading?: boolean;
}

export const GovKpiCards: React.FC<GovKpiCardsProps> = ({ kpis: propKpis, data, isLoading = false }) => {
  const kpis: KpiData = propKpis || {
    total_registered_farmers: {
      value: data?.registered_farmers ?? 1482,
      unit: 'Farmers',
      description: 'Active Aadhaar/DBT Authenticated Producers',
      comparison: '+12.4% vs Kharif 2025',
      trend: [15, 35, 60, 85, 100]
    },
    total_registered_parcels: {
      value: data?.registered_parcels ?? 3218,
      unit: 'Parcels',
      description: 'Cadastral Boundaries Georeferenced',
      comparison: '100% PostGIS Matched',
      trend: [25, 45, 70, 90, 100]
    },
    total_mapped_area_acres: {
      value: data?.mapped_area_acres ?? 4920.5,
      unit: 'Acres',
      description: 'Agricultural Coverage Area',
      comparison: 'Odisha Cadastral Survey',
      trend: [20, 40, 65, 80, 100]
    },
    completed_uav_surveys: {
      value: data?.completed_uav_surveys ?? 318,
      unit: 'Sorties',
      description: 'Flight Sorties Orthomosaiced',
      comparison: 'Sub-centimeter GSD',
      trend: [10, 30, 55, 75, 100]
    },
    pending_uav_inspections: {
      value: data?.pending_uav_inspections ?? 42,
      unit: 'Missions',
      description: 'Awaiting DAO Field Validation',
      comparison: 'Within 48hr SLA',
      trend: [40, 35, 30, 20, 10]
    },
    verified_harvest_mass_qtl: {
      value: data?.verified_harvest_mass_qtl ?? 84120.0,
      unit: 'Quintals',
      description: 'Moisture-Corrected Mandi Grain Mass',
      comparison: `Confidence ±${data?.confidence_interval_pct ?? 3.8}%`,
      trend: [15, 30, 50, 80, 100]
    },
    pending_yield_verifications: {
      value: data?.pending_yield_verifications ?? 14,
      unit: 'Heaps',
      description: 'Reconstruction Audits in Queue',
      comparison: 'Tare reconciliation pending',
      trend: [20, 18, 15, 10, 5]
    },
    mandi_procurement_progress: {
      value: data?.mandi_procurement_progress_pct ?? 62.76,
      unit: '% Target',
      description: `${(data?.mandi_procured_to_date_mt ?? 78450).toLocaleString()} MT Procured / ${(data?.mandi_procurement_target_mt ?? 125000).toLocaleString()} MT Target`,
      comparison: 'MSP Rate: ₹2,320/Qtl',
      target_qtl: data?.mandi_procurement_target_mt,
      procured_qtl: data?.mandi_procured_to_date_mt,
      pending_qtl: (data?.mandi_procurement_target_mt ?? 125000) - (data?.mandi_procured_to_date_mt ?? 78450)
    }
  };
  const cards = [
    {
      id: 'farmers',
      title: 'Total Registered Farmers',
      value: kpis.total_registered_farmers.value.toLocaleString(),
      unit: kpis.total_registered_farmers.unit,
      description: kpis.total_registered_farmers.description,
      comparison: kpis.total_registered_farmers.comparison,
      trend: kpis.total_registered_farmers.trend || [20, 45, 60, 80, 100],
      icon: Users,
      accentColor: 'text-[#008C45]',
      badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    },
    {
      id: 'parcels',
      title: 'Total Registered Parcels',
      value: kpis.total_registered_parcels.value.toLocaleString(),
      unit: kpis.total_registered_parcels.unit,
      description: kpis.total_registered_parcels.description,
      comparison: kpis.total_registered_parcels.comparison,
      trend: kpis.total_registered_parcels.trend || [30, 50, 70, 85, 100],
      icon: Map,
      accentColor: 'text-blue-600',
      badgeBg: 'bg-blue-50 text-blue-800 border-blue-200',
    },
    {
      id: 'acreage',
      title: 'Mapped Agricultural Area',
      value: kpis.total_mapped_area_acres.value.toLocaleString(),
      unit: kpis.total_mapped_area_acres.unit,
      description: kpis.total_mapped_area_acres.description,
      comparison: kpis.total_mapped_area_acres.comparison,
      trend: kpis.total_mapped_area_acres.trend || [40, 55, 65, 80, 100],
      icon: Layers,
      accentColor: 'text-teal-600',
      badgeBg: 'bg-teal-50 text-teal-800 border-teal-200',
    },
    {
      id: 'surveys',
      title: 'Completed UAV Surveys',
      value: kpis.completed_uav_surveys.value.toLocaleString(),
      unit: kpis.completed_uav_surveys.unit,
      description: kpis.completed_uav_surveys.description,
      comparison: kpis.completed_uav_surveys.comparison,
      trend: kpis.completed_uav_surveys.trend || [25, 45, 70, 90, 100],
      icon: Plane,
      accentColor: 'text-indigo-600',
      badgeBg: 'bg-indigo-50 text-indigo-800 border-indigo-200',
    },
    {
      id: 'pending_inspections',
      title: 'Pending UAV Inspections',
      value: kpis.pending_uav_inspections.value.toLocaleString(),
      unit: kpis.pending_uav_inspections.unit,
      description: kpis.pending_uav_inspections.description,
      comparison: kpis.pending_uav_inspections.comparison,
      trend: kpis.pending_uav_inspections.trend || [100, 80, 70, 60, 50],
      icon: Clock,
      accentColor: 'text-amber-600',
      badgeBg: 'bg-amber-50 text-amber-800 border-amber-200',
    },
    {
      id: 'verified_mass',
      title: 'Verified Harvest Mass',
      value: kpis.verified_harvest_mass_qtl.value.toLocaleString(),
      unit: kpis.verified_harvest_mass_qtl.unit,
      description: kpis.verified_harvest_mass_qtl.description,
      comparison: kpis.verified_harvest_mass_qtl.comparison,
      trend: kpis.verified_harvest_mass_qtl.trend || [20, 40, 65, 85, 100],
      icon: CheckCircle2,
      accentColor: 'text-[#008C45]',
      badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    },
    {
      id: 'pending_yield',
      title: 'Pending Yield Verifications',
      value: kpis.pending_yield_verifications.value.toLocaleString(),
      unit: kpis.pending_yield_verifications.unit,
      description: kpis.pending_yield_verifications.description,
      comparison: kpis.pending_yield_verifications.comparison,
      trend: kpis.pending_yield_verifications.trend || [80, 60, 50, 40, 30],
      icon: AlertCircle,
      accentColor: 'text-orange-600',
      badgeBg: 'bg-orange-50 text-orange-800 border-orange-200',
    },
    {
      id: 'procurement',
      title: 'Mandi Procurement Progress',
      value: `${kpis.mandi_procurement_progress.value}%`,
      unit: 'Target',
      description: kpis.mandi_procurement_progress.description,
      comparison: kpis.mandi_procurement_progress.comparison,
      icon: Scale,
      accentColor: 'text-purple-600',
      badgeBg: 'bg-purple-50 text-purple-800 border-purple-200',
      progressBar: kpis.mandi_procurement_progress.value,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 select-none">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            className={`bg-white border border-gray-200/90 rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between ${
              isLoading ? 'opacity-60' : 'opacity-100'
            }`}
          >
            {/* Top row: Label & Icon */}
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-gray-500 line-clamp-1">
                  {card.title}
                </span>
                <div className="w-7 h-7 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                  <Icon className={`w-3.5 h-3.5 ${card.accentColor}`} />
                </div>
              </div>

              {/* Main Metric Value & Unit */}
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-2xl sm:text-3xl font-display font-extrabold text-[#0f2e1e] tracking-tight">
                  {card.value}
                </span>
                <span className="text-xs font-mono font-semibold text-gray-500">
                  {card.unit}
                </span>
              </div>

              {/* Contextual description */}
              <p className="text-[11px] text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                {card.description}
              </p>
            </div>

            {/* Bottom Row: Comparison Pill & Mini Sparkline or Progress */}
            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold border ${card.badgeBg}`}>
                <TrendingUp className="w-2.5 h-2.5" />
                <span>{card.comparison}</span>
              </span>

              {/* Mini Sparkline Bar Chart or Progress Bar */}
              {card.progressBar !== undefined ? (
                <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
                  <div 
                    className="h-full bg-[#008C45] rounded-full transition-all duration-500" 
                    style={{ width: `${Math.min(card.progressBar, 100)}%` }}
                  />
                </div>
              ) : (
                <div className="flex items-end gap-0.5 h-4">
                  {(card.trend || [30, 45, 60, 75, 90]).map((h, i) => (
                    <div
                      key={i}
                      className="w-1 bg-emerald-300 rounded-xs"
                      style={{ height: `${Math.max(20, Math.min(100, (h / 120) * 100))}%` }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
