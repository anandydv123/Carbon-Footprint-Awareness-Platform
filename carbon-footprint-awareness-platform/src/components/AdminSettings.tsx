import React, { useState } from "react";
import { EmissionFactors } from "../types";
import { Settings, RefreshCw, Check, Save } from "lucide-react";

interface AdminSettingsProps {
  emissionFactors: EmissionFactors;
  onSaveFactors: (newFactors: EmissionFactors) => Promise<void>;
  onResetFactors: () => void;
}

export default function AdminSettings({
  emissionFactors,
  onSaveFactors,
  onResetFactors
}: AdminSettingsProps) {
  // Local states to handle input forms
  const [gasolineCar, setGasolineCar] = useState(emissionFactors.gasoline_car);
  const [dieselCar, setDieselCar] = useState(emissionFactors.diesel_car);
  const [ev, setEv] = useState(emissionFactors.ev);
  const [publicTransit, setPublicTransit] = useState(emissionFactors.public_transit);

  const [coalGrid, setCoalGrid] = useState(emissionFactors.coal_grid);
  const [averageGrid, setAverageGrid] = useState(emissionFactors.average_grid);
  const [greenSolar, setGreenSolar] = useState(emissionFactors.green_solar);

  const [highMeat, setHighMeat] = useState(emissionFactors.high_meat);
  const [mixedDiet, setMixedDiet] = useState(emissionFactors.mixed_diet);
  const [vegetarian, setVegetarian] = useState(emissionFactors.vegetarian);
  const [vegan, setVegan] = useState(emissionFactors.vegan);

  const [waterFactor, setWaterFactor] = useState(emissionFactors.water_factor);

  const [landfill, setLandfill] = useState(emissionFactors.landfill);
  const [recycled, setRecycled] = useState(emissionFactors.recycled);
  const [composting, setComposting] = useState(emissionFactors.composting);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);

    try {
      const payload: EmissionFactors = {
        gasoline_car: Number(gasolineCar),
        diesel_car: Number(dieselCar),
        ev: Number(ev),
        public_transit: Number(publicTransit),
        bicycle_walking: 0.0, // walk/cycle is always zero
        coal_grid: Number(coalGrid),
        average_grid: Number(averageGrid),
        green_solar: Number(greenSolar),
        high_meat: Number(highMeat),
        mixed_diet: Number(mixedDiet),
        vegetarian: Number(vegetarian),
        vegan: Number(vegan),
        water_factor: Number(waterFactor),
        landfill: Number(landfill),
        recycled: Number(recycled),
        composting: Number(composting)
      };

      await onSaveFactors(payload);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    onResetFactors();
    // Repopulate from freshly reset factor props (if done synchronously)
    window.location.reload(); // Quick reset sync
  };

  return (
    <div className="space-y-6">
      {/* Settings Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
          Admin Config Panel
        </h2>
        <p className="text-sm text-slate-500">
          Modify global carbon emission coefficients (kg CO₂ equivalents) used by the calculation engine.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Transport Factors */}
          <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-xs space-y-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">
              1. Commute Vehicles (kg CO₂ / km)
            </span>
            <div className="space-y-3.5">
              <div className="grid grid-cols-2 items-center gap-3">
                <label className="text-xs font-semibold text-slate-700">Gasoline Car</label>
                <input 
                  type="number" step="any" required value={gasolineCar}
                  onChange={(e) => setGasolineCar(parseFloat(e.target.value) || 0)}
                  className="p-1 px-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-xs font-mono font-bold text-slate-700"
                />
              </div>
              <div className="grid grid-cols-2 items-center gap-3">
                <label className="text-xs font-semibold text-slate-700">Diesel Car</label>
                <input 
                  type="number" step="any" required value={dieselCar}
                  onChange={(e) => setDieselCar(parseFloat(e.target.value) || 0)}
                  className="p-1 px-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-xs font-mono font-bold text-slate-700"
                />
              </div>
              <div className="grid grid-cols-2 items-center gap-3">
                <label className="text-xs font-semibold text-slate-700">Electric Vehicle</label>
                <input 
                  type="number" step="any" required value={ev}
                  onChange={(e) => setEv(parseFloat(e.target.value) || 0)}
                  className="p-1 px-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-xs font-mono font-bold text-slate-700"
                />
              </div>
              <div className="grid grid-cols-2 items-center gap-3">
                <label className="text-xs font-semibold text-slate-700">Public Transit (Bus/Train)</label>
                <input 
                  type="number" step="any" required value={publicTransit}
                  onChange={(e) => setPublicTransit(parseFloat(e.target.value) || 0)}
                  className="p-1 px-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-xs font-mono font-bold text-slate-700"
                />
              </div>
            </div>
          </div>

          {/* Electricity Generation Factors */}
          <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-xs space-y-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">
              2. Power Grid Mix (kg CO₂ / kWh)
            </span>
            <div className="space-y-3.5">
              <div className="grid grid-cols-2 items-center gap-3">
                <label className="text-xs font-semibold text-slate-700">Coal Grid Mix</label>
                <input 
                  type="number" step="any" required value={coalGrid}
                  onChange={(e) => setCoalGrid(parseFloat(e.target.value) || 0)}
                  className="p-1 px-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-xs font-mono font-bold text-slate-700"
                />
              </div>
              <div className="grid grid-cols-2 items-center gap-3">
                <label className="text-xs font-semibold text-slate-700">Municipal Average</label>
                <input 
                  type="number" step="any" required value={averageGrid}
                  onChange={(e) => setAverageGrid(parseFloat(e.target.value) || 0)}
                  className="p-1 px-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-xs font-mono font-bold text-slate-700"
                />
              </div>
              <div className="grid grid-cols-2 items-center gap-3">
                <label className="text-xs font-semibold text-slate-700">Renewable Solar Grid</label>
                <input 
                  type="number" step="any" required value={greenSolar}
                  onChange={(e) => setGreenSolar(parseFloat(e.target.value) || 0)}
                  className="p-1 px-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-xs font-mono font-bold text-slate-700"
                />
              </div>
            </div>
          </div>

          {/* Dietary Protein Preferences */}
          <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-xs space-y-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">
              3. Dietary Styles (kg CO₂ / Meal)
            </span>
            <div className="space-y-3.5">
              <div className="grid grid-cols-2 items-center gap-3">
                <label className="text-xs font-semibold text-slate-700">High Meat (Beef Heavy)</label>
                <input 
                  type="number" step="any" required value={highMeat}
                  onChange={(e) => setHighMeat(parseFloat(e.target.value) || 0)}
                  className="p-1 px-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-xs font-mono font-bold text-slate-700"
                />
              </div>
              <div className="grid grid-cols-2 items-center gap-3">
                <label className="text-xs font-semibold text-slate-700">Mixed Standard Diet</label>
                <input 
                  type="number" step="any" required value={mixedDiet}
                  onChange={(e) => setMixedDiet(parseFloat(e.target.value) || 0)}
                  className="p-1 px-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-xs font-mono font-bold text-slate-700"
                />
              </div>
              <div className="grid grid-cols-2 items-center gap-3">
                <label className="text-xs font-semibold text-slate-700">Vegetarian</label>
                <input 
                  type="number" step="any" required value={vegetarian}
                  onChange={(e) => setVegetarian(parseFloat(e.target.value) || 0)}
                  className="p-1 px-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-xs font-mono font-bold text-slate-700"
                />
              </div>
              <div className="grid grid-cols-2 items-center gap-3">
                <label className="text-xs font-semibold text-slate-700">Vegan Planteous</label>
                <input 
                  type="number" step="any" required value={vegan}
                  onChange={(e) => setVegan(parseFloat(e.target.value) || 0)}
                  className="p-1 px-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-xs font-mono font-bold text-slate-700"
                />
              </div>
            </div>
          </div>

          {/* Waste Disposal Schemes */}
          <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-xs space-y-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">
              4. Water & Waste Treatment (kg CO₂)
            </span>
            <div className="space-y-3.5">
              <div className="grid grid-cols-2 items-center gap-3">
                <label className="text-xs font-semibold text-slate-700">Water Utility (per Liter)</label>
                <input 
                  type="number" step="any" required value={waterFactor}
                  onChange={(e) => setWaterFactor(parseFloat(e.target.value) || 0)}
                  className="p-1 px-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-xs font-mono font-bold text-slate-700"
                />
              </div>
              <div className="grid grid-cols-2 items-center gap-3">
                <label className="text-xs font-semibold text-slate-700">Trash Landfill Dump (per kg)</label>
                <input 
                  type="number" step="any" required value={landfill}
                  onChange={(e) => setLandfill(parseFloat(e.target.value) || 0)}
                  className="p-1 px-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-xs font-mono font-bold text-slate-700"
                />
              </div>
              <div className="grid grid-cols-2 items-center gap-3">
                <label className="text-xs font-semibold text-slate-700">Recycled Waste (per kg)</label>
                <input 
                  type="number" step="any" required value={recycled}
                  onChange={(e) => setRecycled(parseFloat(e.target.value) || 0)}
                  className="p-1 px-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-xs font-mono font-bold text-slate-700"
                />
              </div>
              <div className="grid grid-cols-2 items-center gap-3">
                <label className="text-xs font-semibold text-slate-700">Composting (per kg)</label>
                <input 
                  type="number" step="any" required value={composting}
                  onChange={(e) => setComposting(parseFloat(e.target.value) || 0)}
                  className="p-1 px-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-xs font-mono font-bold text-slate-700"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action triggers */}
        <div className="flex gap-3 justify-end items-center">
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition flex items-center gap-1 cursor-pointer border border-slate-200"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
          
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2 bg-emerald-800 hover:bg-emerald-950 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-500/10 disabled:opacity-50 font-sans"
          >
            {saving ? (
              <span className="inline-block animate-spin h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full" />
            ) : saved ? (
              <Check className="w-3.5 h-3.5" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            <span>{saved ? "Factors Saved!" : "Save Coefficients"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
