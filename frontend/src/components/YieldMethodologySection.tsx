import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calculator, Scale, Droplets, Info, Sliders } from 'lucide-react';

export const YieldMethodologySection: React.FC = () => {
  // Interactive Simulation State (Clearly labeled as illustrative)
  const [heapVolume, setHeapVolume] = useState<number>(18.5); // m³
  const [bulkDensity, setBulkDensity] = useState<number>(575); // kg/m³
  const [harvestedArea, setHarvestedArea] = useState<number>(1.8); // Hectares

  // Derived Calculations
  const calculatedMassKg = heapVolume * bulkDensity;
  const calculatedMassTons = calculatedMassKg / 1000;
  const calculatedYieldTonsPerHa = calculatedMassTons / harvestedArea;

  return (
    <section id="methodology" className="py-24 bg-charcoal-900/80 relative overflow-hidden border-t border-forest-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-forest-900 border border-forest-700/80 text-[11px] font-mono uppercase tracking-widest text-lime-accent mb-4">
            <Calculator className="w-3.5 h-3.5" />
            <span>MATHEMATICAL INTELLIGENCE</span>
          </div>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-sand-50 tracking-tight">
            The Physics & Mathematics of <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-accent to-emerald-400">
              Paddy Yield Estimation.
            </span>
          </h2>
          <p className="text-sand-300 mt-4 text-base">
            Translating volumetric surface geometry into grain weight requires empirical calibration against moisture content, compaction dynamics, and grain morphology.
          </p>
        </div>

        {/* Two Core Mathematical Formulation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-14">
          
          {/* Formula 1: Mass Derivation */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-8 rounded-2xl bg-forest-950 border border-forest-700/80 shadow-elevated relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-mono uppercase tracking-widest text-lime-accent font-semibold px-2.5 py-1 rounded bg-forest-900 border border-forest-700">
                EQUATION 01 · MASS DERIVATION
              </span>
              <Scale className="w-5 h-5 text-lime-accent" />
            </div>

            <div className="my-6 p-4 rounded-xl bg-charcoal-900/90 border border-forest-800 text-center">
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
            transition={{ delay: 0.1 }}
            className="p-8 rounded-2xl bg-forest-950 border border-forest-700/80 shadow-elevated relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-mono uppercase tracking-widest text-lime-accent font-semibold px-2.5 py-1 rounded bg-forest-900 border border-forest-700">
                EQUATION 02 · AREA-NORMALIZED YIELD
              </span>
              <Calculator className="w-5 h-5 text-lime-accent" />
            </div>

            <div className="my-6 p-4 rounded-xl bg-charcoal-900/90 border border-forest-800 text-center">
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

        {/* Interactive Illustrative Simulator & Variables Breakdown */}
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
                Explore how variations in volume, bulk density, and plot area impact estimated crop yield.
              </p>
            </div>

            <div className="px-3 py-1.5 rounded-md bg-forest-900 border border-forest-700 text-[11px] font-mono text-olive-300 flex items-center gap-2">
              <Info className="w-3.5 h-3.5 text-lime-accent" />
              <span>ILLUSTRATIVE DEMONSTRATION · NOT VALIDATED PRODUCTION DATA</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-8">
            
            {/* Input Controls */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              
              {/* Slider 1: Heap Volume */}
              <div>
                <div className="flex justify-between text-xs font-mono mb-2">
                  <span className="text-sand-300">Heap Volume (V):</span>
                  <span className="text-lime-accent font-bold">{heapVolume.toFixed(1)} m³</span>
                </div>
                <input 
                  type="range" 
                  min="5" 
                  max="50" 
                  step="0.5" 
                  value={heapVolume}
                  onChange={(e) => setHeapVolume(parseFloat(e.target.value))}
                  className="w-full accent-lime-accent cursor-pointer bg-forest-900 h-2 rounded-lg"
                />
                <div className="flex justify-between text-[10px] font-mono text-olive-400 mt-1">
                  <span>5.0 m³</span>
                  <span>Photogrammetric triangular mesh integration</span>
                  <span>50.0 m³</span>
                </div>
              </div>

              {/* Slider 2: Bulk Density */}
              <div>
                <div className="flex justify-between text-xs font-mono mb-2">
                  <span className="text-sand-300">Calibrated Bulk Density (ρ):</span>
                  <span className="text-lime-accent font-bold">{bulkDensity} kg/m³</span>
                </div>
                <input 
                  type="range" 
                  min="450" 
                  max="680" 
                  step="5" 
                  value={bulkDensity}
                  onChange={(e) => setBulkDensity(parseInt(e.target.value))}
                  className="w-full accent-lime-accent cursor-pointer bg-forest-900 h-2 rounded-lg"
                />
                <div className="flex justify-between text-[10px] font-mono text-olive-400 mt-1">
                  <span>450 kg/m³ (High Moisture)</span>
                  <span>Lab empirical calibration</span>
                  <span>680 kg/m³ (Dry/Compacted)</span>
                </div>
              </div>

              {/* Slider 3: Harvested Area */}
              <div>
                <div className="flex justify-between text-xs font-mono mb-2">
                  <span className="text-sand-300">Harvested Plot Area (A):</span>
                  <span className="text-lime-accent font-bold">{harvestedArea.toFixed(1)} ha</span>
                </div>
                <input 
                  type="range" 
                  min="0.5" 
                  max="10.0" 
                  step="0.1" 
                  value={harvestedArea}
                  onChange={(e) => setHarvestedArea(parseFloat(e.target.value))}
                  className="w-full accent-lime-accent cursor-pointer bg-forest-900 h-2 rounded-lg"
                />
                <div className="flex justify-between text-[10px] font-mono text-olive-400 mt-1">
                  <span>0.5 ha</span>
                  <span>Satellite polygon georeferenced boundary</span>
                  <span>10.0 ha</span>
                </div>
              </div>

            </div>

            {/* Simulated Analytical Output Panel */}
            <div className="lg:col-span-5 bg-charcoal-900/90 rounded-xl border border-forest-700/80 p-6 flex flex-col gap-5">
              <div className="text-xs font-mono uppercase text-olive-300 pb-2 border-b border-forest-800">
                Calculated Agronomic Output
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-forest-950/80 border border-forest-800">
                  <div className="text-[10px] font-mono uppercase text-olive-400">Total Heap Mass</div>
                  <div className="font-mono text-xl font-bold text-sand-50 mt-1">
                    {calculatedMassKg.toLocaleString(undefined, { maximumFractionDigits: 0 })} <span className="text-xs text-lime-accent">kg</span>
                  </div>
                  <div className="text-[10px] font-mono text-sand-400 mt-0.5">
                    ({calculatedMassTons.toFixed(2)} Metric Tons)
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-forest-950/80 border border-forest-800">
                  <div className="text-[10px] font-mono uppercase text-olive-400">Normalized Yield</div>
                  <div className="font-mono text-xl font-bold text-lime-accent mt-1">
                    {calculatedYieldTonsPerHa.toFixed(2)} <span className="text-xs text-sand-200">t/ha</span>
                  </div>
                  <div className="text-[10px] font-mono text-sand-400 mt-0.5">
                    Metric Tons per Hectare
                  </div>
                </div>
              </div>

              {/* Physical Variability Note */}
              <div className="p-3.5 rounded-lg bg-forest-900/40 border border-forest-800 text-[11px] text-sand-300 leading-relaxed flex items-start gap-2">
                <Droplets className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-sand-100">Moisture Dependency:</strong> Paddy bulk density shifts markedly between freshly threshed grain (~22% moisture) and sun-dried grain (~14% moisture). Field trials require moisture sensor integration.
                </span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
