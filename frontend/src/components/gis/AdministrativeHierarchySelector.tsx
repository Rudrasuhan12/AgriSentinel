import React, { useState, useEffect } from 'react';
import { MapPin, Search, RefreshCw } from 'lucide-react';
import { api } from '../../api/client';

export interface DistrictItem {
  id: string;
  state_code: string;
  district_name: string;
  district_code: string;
  lgd_code: string;
  headquarters: string;
}

export interface TahasilItem {
  id: string;
  district_name: string;
  tahasil_name: string;
  tahasil_code: string;
  lgd_code?: string;
}

export interface VillageItem {
  id: string;
  district_name: string;
  tahasil_name: string;
  village_name: string;
  mouza_code?: string;
  revenue_circle?: string;
  ri_circle?: string;
}

interface AdministrativeHierarchySelectorProps {
  selectedDistrict: string;
  selectedTahasil: string;
  selectedVillage: string;
  onDistrictChange: (district: string) => void;
  onTahasilChange: (tahasil: string) => void;
  onVillageChange: (village: string) => void;
  disabled?: boolean;
}

export const AdministrativeHierarchySelector: React.FC<AdministrativeHierarchySelectorProps> = ({
  selectedDistrict,
  selectedTahasil,
  selectedVillage,
  onDistrictChange,
  onTahasilChange,
  onVillageChange,
  disabled = false,
}) => {
  const [districts, setDistricts] = useState<DistrictItem[]>([]);
  const [tahasils, setTahasils] = useState<TahasilItem[]>([]);
  const [villages, setVillages] = useState<VillageItem[]>([]);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingTahasils, setLoadingTahasils] = useState(false);
  const [loadingVillages, setLoadingVillages] = useState(false);
  const [villageSearch, setVillageSearch] = useState('');

  // 1. Fetch All 30 Odisha Districts
  useEffect(() => {
    const fetchDistricts = async () => {
      try {
        setLoadingDistricts(true);
        const data = await api.get<DistrictItem[]>('/api/administrative/districts');
        setDistricts(data);
        if (data.length > 0 && !selectedDistrict) {
          const defaultDist = data.find((d) => d.district_name === 'Cuttack') || data[0];
          onDistrictChange(defaultDist.district_name);
        }
      } catch (err) {
        console.error('[GIS] Failed to load official districts:', err);
      } finally {
        setLoadingDistricts(false);
      }
    };
    fetchDistricts();
  }, []);

  // 2. Fetch Tahasils when selectedDistrict changes
  useEffect(() => {
    if (!selectedDistrict) return;

    const fetchTahasils = async () => {
      try {
        setLoadingTahasils(true);
        const data = await api.get<TahasilItem[]>(`/api/administrative/tahasils?district=${encodeURIComponent(selectedDistrict)}`);
        setTahasils(data);
        if (data.length > 0) {
          const match = data.find((t) => t.tahasil_name.toLowerCase() === selectedTahasil.toLowerCase());
          if (!match) {
            onTahasilChange(data[0].tahasil_name);
          }
        } else {
          onTahasilChange('');
        }
      } catch (err) {
        console.error('[GIS] Failed to load tahasils:', err);
      } finally {
        setLoadingTahasils(false);
      }
    };
    fetchTahasils();
  }, [selectedDistrict]);

  // 3. Fetch Villages when selectedTahasil changes
  useEffect(() => {
    if (!selectedTahasil) {
      setVillages([]);
      return;
    }

    const fetchVillages = async () => {
      try {
        setLoadingVillages(true);
        const url = `/api/administrative/villages?tahasil=${encodeURIComponent(selectedTahasil)}&district=${encodeURIComponent(selectedDistrict)}&limit=100${
          villageSearch ? `&search=${encodeURIComponent(villageSearch)}` : ''
        }`;
        const data = await api.get<VillageItem[]>(url);
        setVillages(data);
        if (data.length > 0) {
          const match = data.find((v) => v.village_name.toLowerCase() === selectedVillage.toLowerCase());
          if (!match && !villageSearch) {
            onVillageChange(data[0].village_name);
          }
        } else if (!villageSearch) {
          onVillageChange('');
        }
      } catch (err) {
        console.error('[GIS] Failed to load villages:', err);
      } finally {
        setLoadingVillages(false);
      }
    };
    fetchVillages();
  }, [selectedTahasil, selectedDistrict, villageSearch]);

  const handleDistrictSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDist = e.target.value;
    onDistrictChange(newDist);
  };

  const handleTahasilSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newTahasil = e.target.value;
    onTahasilChange(newTahasil);
  };

  const handleVillageSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onVillageChange(e.target.value);
  };

  return (
    <div className="space-y-3 p-3.5 rounded-xl bg-[#F7F9F8] border border-[#E2E9E4]">
      <div className="flex items-center justify-between pb-2 border-b border-[#E2E9E4]">
        <span className="text-[11px] font-mono uppercase font-bold text-[#172B22] flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-[#008C45]" />
          Administrative Master Hierarchy
        </span>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100/70 text-[#008C45] font-semibold">
          State: Odisha (OD)
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {/* District Selection */}
        <div>
          <label className="block text-[10px] font-mono uppercase font-semibold text-[#64746A] mb-1">
            DISTRICT ({districts.length})
          </label>
          <div className="relative">
            <select
              value={selectedDistrict}
              onChange={handleDistrictSelect}
              disabled={disabled || loadingDistricts}
              className="w-full px-2.5 py-1.5 rounded-lg border border-[#CBD5E1] bg-white text-[#172B22] text-xs font-medium focus:outline-none focus:border-[#008C45] focus:ring-2 focus:ring-[#008C45]/15 cursor-pointer disabled:opacity-50 shadow-2xs"
            >
              {districts.map((d) => (
                <option key={d.id} value={d.district_name}>
                  {d.district_name} [LGD: {d.lgd_code}]
                </option>
              ))}
            </select>
            {loadingDistricts && (
              <RefreshCw className="w-3 h-3 text-[#008C45] animate-spin absolute right-2.5 top-2.5 pointer-events-none" />
            )}
          </div>
        </div>

        {/* Tahasil Selection */}
        <div>
          <label className="block text-[10px] font-mono uppercase font-semibold text-[#64746A] mb-1">
            TAHASIL / SUB-DISTRICT ({tahasils.length})
          </label>
          <div className="relative">
            <select
              value={selectedTahasil}
              onChange={handleTahasilSelect}
              disabled={disabled || loadingTahasils || tahasils.length === 0}
              className="w-full px-2.5 py-1.5 rounded-lg border border-[#CBD5E1] bg-white text-[#172B22] text-xs font-medium focus:outline-none focus:border-[#008C45] focus:ring-2 focus:ring-[#008C45]/15 cursor-pointer disabled:opacity-50 shadow-2xs"
            >
              {tahasils.map((t) => (
                <option key={t.id} value={t.tahasil_name}>
                  {t.tahasil_name}
                </option>
              ))}
            </select>
            {loadingTahasils && (
              <RefreshCw className="w-3 h-3 text-[#008C45] animate-spin absolute right-2.5 top-2.5 pointer-events-none" />
            )}
          </div>
        </div>

        {/* Village Selection */}
        <div>
          <label className="block text-[10px] font-mono uppercase font-semibold text-[#64746A] mb-1">
            REVENUE MOUZA / VILLAGE ({villages.length})
          </label>
          <div className="relative">
            <select
              value={selectedVillage}
              onChange={handleVillageSelect}
              disabled={disabled || loadingVillages || villages.length === 0}
              className="w-full px-2.5 py-1.5 rounded-lg border border-[#CBD5E1] bg-white text-[#172B22] text-xs font-medium focus:outline-none focus:border-[#008C45] focus:ring-2 focus:ring-[#008C45]/15 cursor-pointer disabled:opacity-50 shadow-2xs"
            >
              {villages.map((v) => (
                <option key={v.id} value={v.village_name}>
                  {v.village_name} {v.mouza_code ? `(${v.mouza_code})` : ''}
                </option>
              ))}
            </select>
            {loadingVillages && (
              <RefreshCw className="w-3 h-3 text-[#008C45] animate-spin absolute right-2.5 top-2.5 pointer-events-none" />
            )}
          </div>
        </div>
      </div>

      {/* Quick Village Search Filter for large lists */}
      {tahasils.length > 0 && (
        <div className="pt-1 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-3 h-3 text-slate-400 absolute left-2.5 top-2" />
            <input
              type="text"
              value={villageSearch}
              onChange={(e) => setVillageSearch(e.target.value)}
              placeholder="Search mouza / village name..."
              className="w-full pl-7 pr-3 py-1 rounded-md border border-[#E2E9E4] bg-white text-[11px] text-[#172B22] placeholder:text-slate-400 focus:outline-none focus:border-[#008C45]"
            />
          </div>
          {villageSearch && (
            <button
              type="button"
              onClick={() => setVillageSearch('')}
              className="px-2 py-1 text-[10px] font-mono rounded bg-slate-200 text-slate-700 hover:bg-slate-300"
            >
              Clear
            </button>
          )}
        </div>
      )}
    </div>
  );
};
