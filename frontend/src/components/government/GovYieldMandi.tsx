import React, { useState } from 'react';
import { 
  Scale, 
  Warehouse, 
  CheckCircle2, 
  ArrowRight, 
  Sliders, 
  Building, 
  Info, 
  Layers
} from 'lucide-react';

export interface MandiItem {
  id: string;
  name: string;
  district: string;
  target_tons: number;
  procured_tons: number;
  farmers_count: number;
  storage_cap_tons: number;
  msp_rate_per_qtl: number;
}

interface GovYieldMandiProps {
  mandis: MandiItem[];
  selectedDistrict: string;
}

export const GovYieldMandi: React.FC<GovYieldMandiProps> = ({
  mandis,
  selectedDistrict
}) => {
  // Moisture adjustment interactive simulator
  const [calcVolume, setCalcVolume] = useState<number>(38.5);
  const [calcDensity, setCalcDensity] = useState<number>(578.0);
  const [calcMoisture, setCalcMoisture] = useState<number>(15.2);
  const refMoisture = 14.0; // Standard government storage benchmark

  // Calculation formula:
  // Base Mass = (V * rho) / 100 quintals
  // Moisture Factor = (100 - M_actual) / (100 - M_ref)
  // Adjusted Mass = Base Mass * Moisture Factor
  const baseMassQtl = (calcVolume * calcDensity) / 100;
  const moistureFactor = (100 - calcMoisture) / (100 - refMoisture);
  const correctedMassQtl = baseMassQtl * moistureFactor;
  const moistureDeduction = baseMassQtl - correctedMassQtl;

  const filteredMandis = mandis.filter(m => 
    selectedDistrict === 'ALL' || m.district.toLowerCase() === selectedDistrict.toLowerCase()
  );

  const totalTarget = filteredMandis.reduce((acc, m) => acc + m.target_tons, 0);
  const totalProcured = filteredMandis.reduce((acc, m) => acc + m.procured_tons, 0);
  const totalFarmers = filteredMandis.reduce((acc, m) => acc + m.farmers_count, 0);
  const avgProgress = totalTarget > 0 ? (totalProcured / totalTarget) * 100 : 0;
  // MSP rate ₹2,320/Quintal = ₹23,200/Ton
  const totalDbtPayoutCrores = (totalProcured * 23200) / 10000000;

  return (
    <div className="space-y-6">
      
      {/* Module Overview Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-200">
                <Scale className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Yield Verification & Mandi Procurement Quotas
                </h3>
                <p className="text-xs text-slate-500">
                  Government of Odisha Paddy Procurement Monitoring System • Kharif 2026-27
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              MSP Rate: ₹2,320 / Quintal (Grade A)
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200">
              <Building className="w-4 h-4 text-blue-600" />
              {filteredMandis.length} Regulated Mandis Active
            </span>
          </div>
        </div>

        {/* Aggregate Stats Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-100">
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/80">
            <span className="text-xs text-slate-500 block">Total Target Quota</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl font-bold font-mono text-slate-900">{totalTarget.toLocaleString()}</span>
              <span className="text-xs text-slate-600 font-medium">MT</span>
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/80">
            <span className="text-xs text-slate-500 block">Total Procured to Date</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl font-bold font-mono text-emerald-700">{totalProcured.toLocaleString()}</span>
              <span className="text-xs text-emerald-800 font-medium">MT ({avgProgress.toFixed(1)}%)</span>
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/80">
            <span className="text-xs text-slate-500 block">Participating Farmers</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl font-bold font-mono text-slate-900">{totalFarmers.toLocaleString()}</span>
              <span className="text-xs text-slate-600 font-medium">Registered</span>
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/80">
            <span className="text-xs text-slate-500 block">Direct Benefit Transfer (DBT)</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl font-bold font-mono text-indigo-700">₹{totalDbtPayoutCrores.toFixed(2)}</span>
              <span className="text-xs text-indigo-800 font-medium">Crores Disbursed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Grid: Mandi Cards + Interactive Moisture Correction Engine */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Mandi Quota Cards (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Warehouse className="w-4 h-4 text-emerald-600" />
              Regulated Market Committee (RMC) Yard Allocations
            </h4>
            <span className="text-xs text-slate-500">
              Showing {filteredMandis.length} centres
            </span>
          </div>

          <div className="space-y-3">
            {filteredMandis.map((mandi) => {
              const pct = (mandi.procured_tons / mandi.target_tons) * 100;
              const pendingTons = mandi.target_tons - mandi.procured_tons;
              const storageUsage = (mandi.procured_tons / mandi.storage_cap_tons) * 100;

              return (
                <div 
                  key={mandi.id} 
                  className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:border-slate-300 transition-all space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h5 className="font-bold text-sm text-slate-900">{mandi.name}</h5>
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                          {mandi.district}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        MSP: ₹{mandi.msp_rate_per_qtl} / qtl • {mandi.farmers_count} Verified Farmers Linked
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-xs text-slate-500 block">Fulfilled</span>
                      <span className="text-base font-bold font-mono text-emerald-700">
                        {pct.toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  {/* Procurement Progress Bar */}
                  <div>
                    <div className="flex justify-between text-xs text-slate-600 mb-1">
                      <span>Procured: <strong>{mandi.procured_tons.toLocaleString()} MT</strong></span>
                      <span>Target: <strong>{mandi.target_tons.toLocaleString()} MT</strong> ({pendingTons > 0 ? `${pendingTons.toLocaleString()} MT remaining` : 'Target Met'})</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          pct >= 90 ? 'bg-emerald-600' :
                          pct >= 70 ? 'bg-teal-600' :
                          pct >= 40 ? 'bg-amber-500' : 'bg-blue-600'
                        }`}
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Silo Storage Capacity & Token Action */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Layers className="w-3.5 h-3.5 text-slate-400" />
                      <span>Yard Capacity: <strong>{storageUsage.toFixed(0)}%</strong> ({mandi.storage_cap_tons.toLocaleString()} MT max)</span>
                    </div>

                    <button 
                      type="button"
                      className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline flex items-center gap-1"
                    >
                      <span>Allocation Ledger</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Moisture Correction Engine & Mathematical Auditor (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
            
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <div className="p-1.5 bg-emerald-100 text-emerald-800 rounded-md">
                <Sliders className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Moisture-Correction Engine</h4>
                <p className="text-[11px] text-slate-500">Odisha Civil Supplies Dept. Calibration Formula</p>
              </div>
            </div>

            {/* Formula Presentation Box */}
            <div className="bg-slate-900 text-slate-200 p-3.5 rounded-lg border border-slate-800 font-mono text-xs space-y-1 shadow-inner">
              <div className="text-emerald-400 font-semibold text-[11px]">GOVERNMENT CALIBRATION FORMULA</div>
              <div className="text-white text-sm py-1">
                M<sub>corr</sub> = [ (V × ρ<sub>bulk</sub>) / 100 ] × [ (100 - M<sub>act</sub>) / (100 - M<sub>ref</sub>) ]
              </div>
              <div className="text-[10px] text-slate-400">
                Where ρ<sub>bulk</sub> = 578.0 kg/m³ (Paddy grain), M<sub>ref</sub> = 14.0% Standard moisture threshold.
              </div>
            </div>

            {/* Interactive Inputs */}
            <div className="space-y-3 pt-1">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-700">Photogrammetry Volume (V)</span>
                  <span className="font-mono text-emerald-700 font-bold">{calcVolume.toFixed(1)} m³</span>
                </div>
                <input 
                  type="range" 
                  min="5" 
                  max="120" 
                  step="0.5" 
                  value={calcVolume}
                  onChange={(e) => setCalcVolume(parseFloat(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-700">Lab Moisture Reading (M<sub>act</sub>)</span>
                  <span className={`font-mono font-bold ${calcMoisture > 17 ? 'text-rose-600' : calcMoisture > 14 ? 'text-amber-600' : 'text-emerald-700'}`}>
                    {calcMoisture.toFixed(1)}% {calcMoisture > 17 ? '(High Moisture)' : ''}
                  </span>
                </div>
                <input 
                  type="range" 
                  min="10" 
                  max="22" 
                  step="0.1" 
                  value={calcMoisture}
                  onChange={(e) => setCalcMoisture(parseFloat(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
                <span className="text-[10px] text-slate-500 block mt-0.5">Permissible procurement range: 12.0% - 17.0%</span>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-700">Bulk Density Benchmark (ρ<sub>bulk</sub>)</span>
                  <span className="font-mono text-slate-800 font-bold">{calcDensity.toFixed(1)} kg/m³</span>
                </div>
                <input 
                  type="range" 
                  min="520" 
                  max="620" 
                  step="1" 
                  value={calcDensity}
                  onChange={(e) => setCalcDensity(parseFloat(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
              </div>
            </div>

            {/* Calculated Results Card */}
            <div className="bg-emerald-50/80 border border-emerald-200 rounded-lg p-3.5 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-700">Raw Uncorrected Mass:</span>
                <span className="font-mono font-semibold text-slate-900">{baseMassQtl.toFixed(2)} Quintals</span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-700">Moisture Correction Factor:</span>
                <span className="font-mono font-semibold text-emerald-800">{moistureFactor.toFixed(4)}x</span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-700">Net Moisture Penalty / Bonus:</span>
                <span className={`font-mono font-semibold ${moistureDeduction > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                  {moistureDeduction > 0 ? `-${moistureDeduction.toFixed(2)} Qtl` : `+${Math.abs(moistureDeduction).toFixed(2)} Qtl`}
                </span>
              </div>

              <div className="pt-2 border-t border-emerald-200/80 flex justify-between items-center">
                <span className="text-xs font-bold text-slate-900 uppercase">Certified Mandi Mass:</span>
                <div className="text-right">
                  <span className="text-xl font-bold font-mono text-[#08331E]">{correctedMassQtl.toFixed(2)}</span>
                  <span className="text-xs text-slate-600 font-semibold ml-1">Quintals</span>
                </div>
              </div>
            </div>

            {/* Compliance Guidelines */}
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs text-slate-600 flex items-start gap-2">
              <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
              <div>
                <strong>Odisha Food Supplies Notice:</strong> Any grain heap demonstrating moisture above 17.0% requires drying before weighbridge gatepass issuance. Re-survey sorties are mandatory if heap geometry is disturbed during drying.
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
