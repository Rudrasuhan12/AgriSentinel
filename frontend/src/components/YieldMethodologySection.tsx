import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Calculator, 
  Scale, 
  Droplets, 
  Info, 
  Sliders, 
  ArrowRight
} from 'lucide-react';

export const YieldMethodologySection: React.FC = () => {
  // Interactive Simulation State
  const [heapVolume, setHeapVolume] = useState<number>(18.5); // m³
  const [bulkDensity, setBulkDensity] = useState<number>(575); // kg/m³
  const [harvestedArea, setHarvestedArea] = useState<number>(1.8); // Hectares
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);

  // Derived Calculations
  const calculatedMassKg = heapVolume * bulkDensity;
  const calculatedMassTons = calculatedMassKg / 1000;
  const calculatedYieldTonsPerHa = calculatedMassTons / harvestedArea;

  const calculationFlow = [
    {
      id: 'vol',
      step: '01',
      title: 'Heap Volume',
      symbol: 'V_heap',
      value: `${heapVolume.toFixed(1)} m³`,
      source: '3D Photogrammetric Mesh',
      color: 'text-sand-100',
    },
    {
      id: 'rho',
      step: '02',
      title: 'Bulk Density',
      symbol: 'ρ_calibrated',
      value: `${bulkDensity} kg/m³`,
      source: 'Empirical Laboratory Testing',
      color: 'text-olive-300',
    },
    {
      id: 'mass',
      step: '03',
      title: 'Estimated Mass',
      symbol: 'M_total',
      value: `${calculatedMassKg.toLocaleString(undefined, { maximumFractionDigits: 0 })} kg`,
      source: 'Volume × Bulk Density',
      color: 'text-lime-accent',
    },
    {
      id: 'area',
      step: '04',
      title: 'Harvested Area',
      symbol: 'A_field',
      value: `${harvestedArea.toFixed(1)} ha`,
      source: 'Satellite Polygon Demarcation',
      color: 'text-sand-100',
    },
    {
      id: 'yield',
      step: '05',
      title: 'Estimated Yield',
      symbol: 'Yield_net',
      value: `${calculatedYieldTonsPerHa.toFixed(2)} t/ha`,
      source: 'Total Mass ÷ Harvested Area',
      color: 'text-lime-accent font-bold',
    },
  ];

  return (
    <section id="methodology" className="py-24 bg-charcoal-900/80 relative overflow-hidden border-t border-forest-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded bg-forest-900 border border-forest-700/80 text-[11px] font-mono uppercase tracking-widest text-lime-accent mb-4"
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>MATHEMATICAL INTELLIGENCE & SEQUENTIAL FORMULATION</span>
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-sand-50 tracking-tight"
          >
            The Physics & Mathematics of <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-accent to-emerald-400">
              Paddy Yield Estimation.
            </span>
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-sand-300 mt-4 text-base"
          >
            Translating volumetric surface geometry into grain weight requires empirical calibration against moisture content, compaction dynamics, and grain morphology.
          </motion.p>
        </div>

        {/* Sequential 5-Stage Mathematical Pipeline Ribbon */}
        <div className="mb-14 overflow-x-auto pb-4 scrollbar-none">
          <div className="flex items-center justify-between min-w-[760px] gap-2 p-3 rounded-2xl bg-forest-950/80 border border-forest-800 shadow-xl">
            {calculationFlow.map((stage, idx) => {
              const isSelected = activeStepIndex === idx;
              return (
                <React.Fragment key={stage.id}>
                  <button
                    onClick={() => setActiveStepIndex(idx)}
                    className={`flex-1 p-3 rounded-xl border text-left transition-all duration-300 relative ${
                      isSelected
                        ? 'bg-forest-900/90 border-lime-accent/80 shadow-subtle-glow scale-[1.02]'
                        : 'bg-charcoal-900/60 border-forest-800/80 hover:bg-forest-900/40'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                      <span className="text-olive-400">STAGE {stage.step}</span>
                      <span className="text-sand-400 font-semibold">{stage.symbol}</span>
                    </div>
                    <div className="font-display font-bold text-sm text-sand-50">
                      {stage.title}
                    </div>
                    <div className={`font-mono text-sm mt-1 font-semibold ${stage.color}`}>
                      {stage.value}
                    </div>
                    <div className="text-[9px] font-mono text-sand-400 mt-1 truncate">
                      {stage.source}
                    </div>
                  </button>

                  {idx < calculationFlow.length - 1 && (
                    <ArrowRight className="w-4 h-4 text-forest-600 shrink-0 mx-1" />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Two Core Mathematical Formulation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-14">
          
          {/* Formula 1: Mass Derivation */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -3 }}
            transition={{ duration: 0.4 }}
            className="p-8 rounded-2xl bg-forest-950 border border-forest-700/80 shadow-elevated relative overflow-hidden group"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-mono uppercase tracking-widest text-lime-accent font-semibold px-2.5 py-1 rounded bg-forest-900 border border-forest-700">
                EQUATION 01 · MASS DERIVATION
              </span>
              <Scale className="w-5 h-5 text-lime-accent group-hover:scale-110 transition-transform" />
            </div>

            <div className="my-6 p-5 rounded-xl bg-charcoal-900/90 border border-forest-800 text-center relative overflow-hidden">
              <motion.div 
                animate={{ opacity: [0.05, 0.15, 0.05] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute inset-0 bg-lime-accent pointer-events-none" 
              />
              <div className="font-mono text-xl sm:text-2xl font-bold text-sand-50 tracking-wide">
                M<span className="text-lime-accent">estimated</span> = V<span className="text-olive-300">heap</span> × ρ<span className="text-lime-accent">bulk</span>
              </div>
              <div className="text-xs text-olive-400 font-mono mt-2">
                Mass (kg) = Net Reconstructed Volume (m³) × Calibrated Bulk Density (kg/m³)
              </div>
            </div>

            <p className="text-xs sm:text-sm text-sand-300 leading-relaxed">
              Where <span className="font-mono text-sand-100">V_heap</span> represents the watertight volume computed by integrating triangular mesh faces above the RANSAC-isolated ground datum, and <span className="font-mono text-sand-100">ρ_bulk</span> is the calibrated mass per unit volume.
            </p>
          </motion.div>

          {/* Formula 2: Yield Normalization */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -3 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="p-8 rounded-2xl bg-forest-950 border border-forest-700/80 shadow-elevated relative overflow-hidden group"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-mono uppercase tracking-widest text-lime-accent font-semibold px-2.5 py-1 rounded bg-forest-900 border border-forest-700">
                EQUATION 02 · AREA-NORMALIZED YIELD
              </span>
              <Calculator className="w-5 h-5 text-lime-accent group-hover:scale-110 transition-transform" />
            </div>

            <div className="my-6 p-5 rounded-xl bg-charcoal-900/90 border border-forest-800 text-center relative overflow-hidden">
              <motion.div 
                animate={{ opacity: [0.05, 0.15, 0.05] }}
                transition={{ duration: 3, delay: 1.5, repeat: Infinity }}
                className="absolute inset-0 bg-emerald-400 pointer-events-none" 
              />
              <div className="font-mono text-xl sm:text-2xl font-bold text-sand-50 tracking-wide">
                Yield<span className="text-lime-accent">field</span> = M<span className="text-sand-200">total</span> ÷ A<span className="text-olive-300">harvested</span>
              </div>
              <div className="text-xs text-olive-400 font-mono mt-2">
                Yield (tons/ha) = Total Estimated Mass (tons) ÷ Demarcated Plot Area (ha)
              </div>
            </div>

            <p className="text-xs sm:text-sm text-sand-300 leading-relaxed">
              Area <span className="font-mono text-sand-100">A_harvested</span> is derived from the georeferenced polygon registered during the initial satellite demarcation phase, accounting for inner exclusion zones or uncultivated patches.
            </p>
          </motion.div>

        </div>

        {/* Interactive Illustrative Simulator with Live Animated Counters */}
        <div className="rounded-2xl border border-forest-700/90 bg-forest-950 p-6 sm:p-10 shadow-2xl">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-forest-800">
            <div>
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-lime-accent" />
                <h3 className="font-display font-bold text-lg sm:text-xl text-sand-50">
                  Interactive Calculation Simulator
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-sand-400 mt-1">
                Adjust variables in real-time to observe the mathematical propagation into total harvested tonnage and normalized productivity.
              </p>
            </div>

            <div className="px-3 py-1.5 rounded-md bg-forest-900 border border-forest-700 text-[11px] font-mono text-olive-300 flex items-center gap-2">
              <Info className="w-3.5 h-3.5 text-lime-accent" />
              <span>ILLUSTRATIVE DEMONSTRATION · NOT VALIDATED PRODUCTION DATA</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-8">
            
            {/* Input Slider Controls */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              
              {/* Slider 1: Heap Volume */}
              <div className="p-4 rounded-xl bg-charcoal-900/60 border border-forest-800 hover:border-forest-700 transition-colors">
                <div className="flex justify-between text-xs font-mono mb-2">
                  <span className="text-sand-300 font-semibold">1. Heap Volume (V):</span>
                  <span className="text-lime-accent font-bold px-2 py-0.5 rounded bg-forest-900 border border-forest-700">
                    {heapVolume.toFixed(1)} m³
                  </span>
                </div>
                <input 
                  type="range" 
                  min="5" 
                  max="50" 
                  step="0.5" 
                  value={heapVolume}
                  onChange={(e) => setHeapVolume(parseFloat(e.target.value))}
                  className="w-full accent-lime-accent cursor-pointer bg-forest-950 h-2 rounded-lg"
                />
                <div className="flex justify-between text-[10px] font-mono text-olive-400 mt-1.5">
                  <span>5.0 m³</span>
                  <span>Photogrammetric watertight mesh</span>
                  <span>50.0 m³</span>
                </div>
              </div>

              {/* Slider 2: Bulk Density */}
              <div className="p-4 rounded-xl bg-charcoal-900/60 border border-forest-800 hover:border-forest-700 transition-colors">
                <div className="flex justify-between text-xs font-mono mb-2">
                  <span className="text-sand-300 font-semibold">2. Calibrated Bulk Density (ρ):</span>
                  <span className="text-lime-accent font-bold px-2 py-0.5 rounded bg-forest-900 border border-forest-700">
                    {bulkDensity} kg/m³
                  </span>
                </div>
                <input 
                  type="range" 
                  min="450" 
                  max="680" 
                  step="5" 
                  value={bulkDensity}
                  onChange={(e) => setBulkDensity(parseInt(e.target.value))}
                  className="w-full accent-lime-accent cursor-pointer bg-forest-950 h-2 rounded-lg"
                />
                <div className="flex justify-between text-[10px] font-mono text-olive-400 mt-1.5">
                  <span>450 kg/m³ (High Moisture)</span>
                  <span>Empirical grain calibration</span>
                  <span>680 kg/m³ (Compacted / Dry)</span>
                </div>
              </div>

              {/* Slider 3: Harvested Area */}
              <div className="p-4 rounded-xl bg-charcoal-900/60 border border-forest-800 hover:border-forest-700 transition-colors">
                <div className="flex justify-between text-xs font-mono mb-2">
                  <span className="text-sand-300 font-semibold">3. Harvested Parcel Area (A):</span>
                  <span className="text-lime-accent font-bold px-2 py-0.5 rounded bg-forest-900 border border-forest-700">
                    {harvestedArea.toFixed(1)} ha
                  </span>
                </div>
                <input 
                  type="range" 
                  min="0.5" 
                  max="10.0" 
                  step="0.1" 
                  value={harvestedArea}
                  onChange={(e) => setHarvestedArea(parseFloat(e.target.value))}
                  className="w-full accent-lime-accent cursor-pointer bg-forest-950 h-2 rounded-lg"
                />
                <div className="flex justify-between text-[10px] font-mono text-olive-400 mt-1.5">
                  <span>0.5 ha</span>
                  <span>Satellite georeferenced boundary</span>
                  <span>10.0 ha</span>
                </div>
              </div>

            </div>

            {/* Simulated Live Output Panel with Dynamic Glow */}
            <div className="lg:col-span-5 bg-charcoal-900/95 rounded-xl border border-forest-700/80 p-6 flex flex-col gap-5 shadow-elevated relative overflow-hidden">
              
              {/* Subtle ambient corner glow */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-lime-dim blur-2xl pointer-events-none" />

              <div className="text-xs font-mono uppercase text-olive-300 pb-2 border-b border-forest-800 flex items-center justify-between">
                <span>Calculated Agronomic Output</span>
                <span className="text-[10px] text-lime-accent font-semibold">LIVE RECOMPUTE</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-forest-950 border border-forest-800">
                  <div className="text-[10px] font-mono uppercase text-olive-400">Total Heap Mass</div>
                  <div className="font-mono text-2xl font-bold text-sand-50 mt-1">
                    {calculatedMassKg.toLocaleString(undefined, { maximumFractionDigits: 0 })} <span className="text-xs text-lime-accent font-normal">kg</span>
                  </div>
                  <div className="text-[10px] font-mono text-sand-400 mt-0.5">
                    ({calculatedMassTons.toFixed(2)} Metric Tons)
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-forest-950 border border-lime-dim shadow-subtle-glow relative overflow-hidden">
                  <div className="text-[10px] font-mono uppercase text-lime-accent font-semibold">Normalized Yield</div>
                  <div className="font-mono text-2xl font-bold text-lime-accent mt-1">
                    {calculatedYieldTonsPerHa.toFixed(2)} <span className="text-xs text-sand-100 font-normal">t/ha</span>
                  </div>
                  <div className="text-[10px] font-mono text-sand-400 mt-0.5">
                    Metric Tons per Hectare
                  </div>
                </div>
              </div>

              {/* Physical Variability Note */}
              <div className="p-3.5 rounded-lg bg-forest-900/40 border border-forest-800 text-[11px] text-sand-300 leading-relaxed flex items-start gap-2.5">
                <Droplets className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-sand-100">Moisture Dependency:</strong> Paddy bulk density shifts markedly between freshly threshed grain (~22% moisture) and sun-dried grain (~14% moisture). Field trials incorporate digital moisture probe calibrations.
                </span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
