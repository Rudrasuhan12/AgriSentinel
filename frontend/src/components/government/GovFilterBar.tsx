import React, { useState, useEffect } from 'react';
import { 
  Filter, 
  RotateCcw, 
  MapPin, 
  Calendar, 
  Sprout, 
  Check, 
  Layers
} from 'lucide-react';

export interface AdministrativeFilters {
  state: string;
  district: string;
  tahasil: string;
  village: string;
  season: string;
  cropVariety: string;
  mouza?: string;
  year?: string;
}

export type GovFilters = AdministrativeFilters;

export interface GovFilterBarProps {
  filters: AdministrativeFilters;
  onApplyFilters: (newFilters?: any) => void;
  onResetFilters: () => void;
  onFilterChange?: (newFilters: any) => void;
  isFiltering?: boolean;
}

// Complete 30 Odisha LGD Districts
export const ODISHA_DISTRICTS = [
  "All Districts",
  "Angul",
  "Balangir",
  "Balasore",
  "Bargarh",
  "Bhadrak",
  "Boudh",
  "Cuttack",
  "Deogarh",
  "Dhenkanal",
  "Gajapati",
  "Ganjam",
  "Jagatsinghpur",
  "Jajpur",
  "Jharsuguda",
  "Kalahandi",
  "Kandhamal",
  "Kendrapara",
  "Kendujhar",
  "Khordha",
  "Koraput",
  "Malkangiri",
  "Mayurbhanj",
  "Nabarangpur",
  "Nayagarh",
  "Nuapada",
  "Puri",
  "Rayagada",
  "Sambalpur",
  "Subarnapur",
  "Sundargarh"
];

// Tahasils mapping for major monitored districts
export const DISTRICT_TAHASILS_MAP: Record<string, string[]> = {
  "Cuttack": ["All Tahasils", "Cuttack Sadar", "Baranga", "Athagarh", "Salepur", "Choudwar", "Niali", "Banki"],
  "Bargarh": ["All Tahasils", "Bargarh", "Attabira", "Barpali", "Bhatli", "Padampur", "Bheden"],
  "Khordha": ["All Tahasils", "Bhubaneswar", "Jatni", "Balianta", "Begunia", "Banapur", "Khordha"],
  "Sambalpur": ["All Tahasils", "Sambalpur", "Dhankauda", "Maneswar", "Rairakhol", "Kuchinda"],
  "Puri": ["All Tahasils", "Puri", "Pipili", "Nimapada", "Delanga", "Gop", "Kakatpur"],
  "Balasore": ["All Tahasils", "Balasore", "Remuna", "Basta", "Jaleswar", "Soro", "Bahanaga"],
  "Ganjam": ["All Tahasils", "Chhatrapur", "Bhanjanagar", "Aska", "Hinjilicut", "Purushottampur"]
};

// Village / Mouza mapping for key tahasils
export const TAHASIL_VILLAGES_MAP: Record<string, string[]> = {
  "Cuttack Sadar": ["All Mouzas", "Bidyadharpur", "Choudwar", "Jagatpur", "Telengapentha"],
  "Baranga": ["All Mouzas", "Mundali", "Naraj", "Madhupatna", "Ramdaspur", "Trisulia"],
  "Bhubaneswar": ["All Mouzas", "Patia", "Chandaka", "Jatni", "Mendhasal"],
  "Attabira": ["All Mouzas", "Barpali", "Godbhaga", "Kadobahal"],
  "Dhankauda": ["All Mouzas", "Maneswar", "Kainsir", "Chaunrpur"],
  "Pipili": ["All Mouzas", "Dandamukundapur", "Teisipur", "Khandia"]
};

export const CROP_VARIETIES = [
  "All Varieties",
  "Paddy (Swarna MTU-7029)",
  "Paddy (Pooja CR-1009)",
  "Paddy (Lalat)",
  "Sambha Mahsuri (BPT 5204)",
  "Paddy (Hasanta)"
];

export const SEASONS = [
  "Kharif 2026",
  "Rabi 2025-26",
  "Kharif 2025"
];

export const GovFilterBar: React.FC<GovFilterBarProps> = ({
  filters,
  onApplyFilters,
  onResetFilters,
  isFiltering = false
}) => {
  // Local form state
  const [localFilters, setLocalFilters] = useState<AdministrativeFilters>(filters);

  // Sync if prop changes externally
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  // Handle district change -> reset tahasil & village
  const handleDistrictChange = (dist: string) => {
    setLocalFilters(prev => ({
      ...prev,
      district: dist,
      tahasil: 'All Tahasils',
      village: 'All Mouzas'
    }));
  };

  // Handle tahasil change -> reset village
  const handleTahasilChange = (tah: string) => {
    setLocalFilters(prev => ({
      ...prev,
      tahasil: tah,
      village: 'All Mouzas'
    }));
  };

  const currentTahasils = DISTRICT_TAHASILS_MAP[localFilters.district] || ["All Tahasils"];
  const currentVillages = TAHASIL_VILLAGES_MAP[localFilters.tahasil] || ["All Mouzas"];

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    onApplyFilters(localFilters);
  };

  return (
    <div className="bg-white border border-gray-200/90 rounded-2xl p-4 sm:p-5 shadow-xs select-none">
      <form onSubmit={handleApply}>
        {/* Header Strip with Label and Active Scope Pill */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3.5 mb-3.5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#008C45]">
              <Filter className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-gray-900 block">
                ADMINISTRATIVE & AGRICULTURAL HIERARCHY FILTERS
              </span>
              <span className="text-[11px] text-gray-500 font-sans">
                Controls real-time PostGIS parcel layers, cadastral metrics, and procurement statistics.
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[#008C45] text-[10px] font-mono font-semibold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#008C45] animate-pulse" />
              <span>
                Scope: {filters.state} • {filters.district} {filters.tahasil !== 'All Tahasils' ? `> ${filters.tahasil}` : ''}
              </span>
            </span>
          </div>
        </div>

        {/* Filter Input Dropdowns Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3 text-xs">
          
          {/* 1. State (Fixed Odisha) */}
          <div>
            <label className="block text-[10px] font-mono uppercase font-bold text-gray-500 mb-1 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-gray-400" />
              <span>State</span>
            </label>
            <input
              type="text"
              value="Odisha"
              disabled
              className="w-full px-2.5 py-2 rounded-xl border border-gray-200 bg-gray-50 text-gray-600 font-mono font-semibold text-xs cursor-not-allowed"
            />
          </div>

          {/* 2. District Dropdown (30 Odisha LGD Districts) */}
          <div>
            <label className="block text-[10px] font-mono uppercase font-bold text-gray-700 mb-1 flex items-center gap-1">
              <Layers className="w-3 h-3 text-[#008C45]" />
              <span>District *</span>
            </label>
            <select
              value={localFilters.district}
              onChange={(e) => handleDistrictChange(e.target.value)}
              className="w-full px-2.5 py-2 rounded-xl border border-gray-300 bg-white text-gray-900 font-medium text-xs focus:outline-none focus:border-[#008C45] focus:ring-2 focus:ring-[#008C45]/15 transition-all cursor-pointer"
            >
              {ODISHA_DISTRICTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* 3. Sub-District / Tahasil (Dependent) */}
          <div>
            <label className="block text-[10px] font-mono uppercase font-bold text-gray-700 mb-1">
              Tahasil / Block
            </label>
            <select
              value={localFilters.tahasil}
              onChange={(e) => handleTahasilChange(e.target.value)}
              className="w-full px-2.5 py-2 rounded-xl border border-gray-300 bg-white text-gray-900 font-medium text-xs focus:outline-none focus:border-[#008C45] focus:ring-2 focus:ring-[#008C45]/15 transition-all cursor-pointer"
            >
              {currentTahasils.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* 4. Revenue Mouza / Village (Dependent) */}
          <div>
            <label className="block text-[10px] font-mono uppercase font-bold text-gray-700 mb-1">
              Revenue Mouza
            </label>
            <select
              value={localFilters.village}
              onChange={(e) => setLocalFilters({ ...localFilters, village: e.target.value })}
              className="w-full px-2.5 py-2 rounded-xl border border-gray-300 bg-white text-gray-900 font-medium text-xs focus:outline-none focus:border-[#008C45] focus:ring-2 focus:ring-[#008C45]/15 transition-all cursor-pointer"
            >
              {currentVillages.map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </div>

          {/* 5. Crop Season */}
          <div>
            <label className="block text-[10px] font-mono uppercase font-bold text-gray-700 mb-1 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-[#008C45]" />
              <span>Season *</span>
            </label>
            <select
              value={localFilters.season}
              onChange={(e) => setLocalFilters({ ...localFilters, season: e.target.value })}
              className="w-full px-2.5 py-2 rounded-xl border border-gray-300 bg-white text-gray-900 font-medium text-xs focus:outline-none focus:border-[#008C45] focus:ring-2 focus:ring-[#008C45]/15 transition-all cursor-pointer"
            >
              {SEASONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* 6. Crop Variety */}
          <div>
            <label className="block text-[10px] font-mono uppercase font-bold text-gray-700 mb-1 flex items-center gap-1">
              <Sprout className="w-3 h-3 text-[#008C45]" />
              <span>Crop Variety</span>
            </label>
            <select
              value={localFilters.cropVariety}
              onChange={(e) => setLocalFilters({ ...localFilters, cropVariety: e.target.value })}
              className="w-full px-2.5 py-2 rounded-xl border border-gray-300 bg-white text-gray-900 font-medium text-xs focus:outline-none focus:border-[#008C45] focus:ring-2 focus:ring-[#008C45]/15 transition-all cursor-pointer"
            >
              {CROP_VARIETIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

        </div>

        {/* Filter Action Buttons Strip */}
        <div className="mt-3.5 pt-3 border-t border-gray-100 flex items-center justify-between flex-wrap gap-2">
          <div className="text-[11px] font-mono text-gray-500">
            <span>Filtered Context: </span>
            <strong className="text-gray-900">{localFilters.district}</strong>
            {localFilters.tahasil !== 'All Tahasils' && <span> • {localFilters.tahasil}</span>}
            {localFilters.village !== 'All Mouzas' && <span> • {localFilters.village}</span>}
            <span> • {localFilters.season}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onResetFilters}
              className="px-3.5 py-1.5 rounded-xl border border-gray-300 hover:bg-gray-100 text-gray-700 text-xs font-mono font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3 text-gray-500" />
              <span>Reset Filters</span>
            </button>

            <button
              type="submit"
              disabled={isFiltering}
              className="px-4 py-1.5 rounded-xl bg-[#008C45] hover:bg-[#007338] text-white text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-xs transition-all active:scale-[0.99] cursor-pointer disabled:opacity-60"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{isFiltering ? 'Filtering...' : 'Apply Filters'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
