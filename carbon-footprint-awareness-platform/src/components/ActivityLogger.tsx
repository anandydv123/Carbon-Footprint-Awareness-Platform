import React, { useState } from "react";
import { ActivityLog, EmissionFactors, DayFootprint } from "../types";
import { DEFAULT_EMISSION_FACTORS, calculateCo2 } from "../utils/calculator";
import { 
  Trash2, 
  Edit3, 
  PlusCircle, 
  Calendar, 
  ChevronRight, 
  ChevronLeft, 
  Save, 
  Check, 
  X,
  Truck, 
  Lightbulb, 
  Soup, 
  Droplet, 
  Trash,
  Bike
} from "lucide-react";

interface ActivityLoggerProps {
  activities: ActivityLog[];
  dayFootprints: DayFootprint[];
  onAddLog: (activity: Omit<ActivityLog, "id" | "userId">) => Promise<void>;
  onUpdateLog: (id: string, activity: Partial<ActivityLog>) => Promise<void>;
  onDeleteLog: (id: string) => Promise<void>;
  emissionFactors: EmissionFactors;
  isModalOpen: boolean;
  onCloseModal: () => void;
}

export default function ActivityLogger({
  activities,
  dayFootprints,
  onAddLog,
  onUpdateLog,
  onDeleteLog,
  emissionFactors,
  isModalOpen,
  onCloseModal
}: ActivityLoggerProps) {
  // Navigation stepper state inside log creation modal
  const [step, setStep] = useState(1);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [transportType, setTransportType] = useState<ActivityLog["transportType"]>("gasoline_car");
  const [transportDistance, setTransportDistance] = useState(10);
  const [electricitySource, setElectricitySource] = useState<ActivityLog["electricitySource"]>("average_grid");
  const [electricityUsage, setElectricityUsage] = useState(5);
  const [foodType, setFoodType] = useState<ActivityLog["foodType"]>("mixed_diet");
  const [foodMealsCount, setFoodMealsCount] = useState(3);
  const [waterUsage, setWaterUsage] = useState(150);
  const [wasteType, setWasteType] = useState<ActivityLog["wasteType"]>("recycled");
  const [wasteWeight, setWasteWeight] = useState(1.5);

  const [saving, setSaving] = useState(false);

  // Computed live preview CO2 values
  const livePreview = React.useMemo(() => {
    const mockActivity: ActivityLog = {
      id: "preview",
      userId: "preview",
      date,
      transportType,
      transportDistance: Number(transportDistance) || 0,
      electricitySource,
      electricityUsage: Number(electricityUsage) || 0,
      foodType,
      foodMealsCount: Number(foodMealsCount) || 0,
      waterUsage: Number(waterUsage) || 0,
      wasteType,
      wasteWeight: Number(wasteWeight) || 0
    };
    return calculateCo2(mockActivity, emissionFactors);
  }, [
    date, 
    transportType, 
    transportDistance, 
    electricitySource, 
    electricityUsage, 
    foodType, 
    foodMealsCount, 
    waterUsage, 
    wasteType, 
    wasteWeight, 
    emissionFactors
  ]);

  const resetForm = () => {
    setDate(new Date().toISOString().split("T")[0]);
    setTransportType("gasoline_car");
    setTransportDistance(10);
    setElectricitySource("average_grid");
    setElectricityUsage(5);
    setFoodType("mixed_diet");
    setFoodMealsCount(3);
    setWaterUsage(150);
    setWasteType("recycled");
    setWasteWeight(1.5);
    setStep(1);
    setEditingId(null);
  };

  const startEdit = (act: ActivityLog) => {
    setEditingId(act.id);
    setDate(act.date);
    setTransportType(act.transportType);
    setTransportDistance(act.transportDistance);
    setElectricitySource(act.electricitySource);
    setElectricityUsage(act.electricityUsage);
    setFoodType(act.foodType);
    setFoodMealsCount(act.foodMealsCount);
    setWaterUsage(act.waterUsage);
    setWasteType(act.wasteType);
    setWasteWeight(act.wasteWeight);
    setStep(1);
    // Force open modal
    // By convention, we execute onOpenLogModal
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        date,
        transportType,
        transportDistance: Number(transportDistance) || 0,
        electricitySource,
        electricityUsage: Number(electricityUsage) || 0,
        foodType,
        foodMealsCount: Number(foodMealsCount) || 0,
        waterUsage: Number(waterUsage) || 0,
        wasteType,
        wasteWeight: Number(wasteWeight) || 0
      };

      if (editingId) {
        await onUpdateLog(editingId, payload);
      } else {
        await onAddLog(payload);
      }
      resetForm();
      onCloseModal();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Add Action */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
            Daily Activity Logs
          </h2>
          <p className="text-sm text-slate-500">
            CRUD logs, compute immediate CO₂ values, and audit historical logs
          </p>
        </div>
        <button
          id="open_log_form_btn"
          onClick={() => {
            resetForm();
            // trigger custom prop parent callback or toggle modal state
            // since parent controls isModalOpen we can open it! No-op here if state is in parent.
          }}
          className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-semibold shadow-sm transition flex items-center gap-1.5 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Daily Logger</span>
        </button>
      </div>

      {/* CRUD Log Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-2xl border border-slate-100 shadow-2xl shadow-slate-950/20 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="bg-slate-50 border-b border-slate-100 p-5 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-slate-800 text-lg">
                  {editingId ? "Edit Activity Log" : "Log Daily Eco Activities"}
                </h3>
                <p className="text-xs text-slate-400">
                  Step {step} of 4 — {step === 1 ? "Commute Details" : step === 2 ? "Grid Power" : step === 3 ? "Diet Habits" : "Resource Footprints"}
                </p>
              </div>
              <button
                onClick={() => {
                  resetForm();
                  onCloseModal();
                }}
                className="p-1.5 text-slate-400 hover:bg-slate-150 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Stepper Wizard Progress bar */}
            <div className="w-full bg-slate-100 h-1">
              <div 
                className="bg-emerald-600 h-1 transition-all duration-300"
                style={{ width: `${(step / 4) * 100}%` }}
              />
            </div>

            {/* Modal Scrollable Contents */}
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* DATE SELECTION (Visible on Step 1) */}
              {step === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Target Log Date
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-450">
                        <Calendar className="w-4 h-4" />
                      </span>
                      <input 
                        type="date"
                        required
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-600 outline-none text-slate-800 text-sm font-medium"
                      />
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-4 space-y-4">
                    <div className="flex items-center gap-2 text-slate-700 font-bold text-sm">
                      <Truck className="w-4 h-4 text-blue-500" />
                      <span>Transport Commutes</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">
                          Vehicle or Transit Mode
                        </label>
                        <select
                          value={transportType}
                          onChange={(e) => setTransportType(e.target.value as any)}
                          className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm font-semibold text-slate-700"
                        >
                          <option value="gasoline_car">Gasoline Car (Standard)</option>
                          <option value="diesel_car">Diesel Car</option>
                          <option value="ev">Electric Vehicle (EV)</option>
                          <option value="public_transit">Bus or Suburban Train</option>
                          <option value="bicycle_walking">Bicycle / Walking (Zero CO₂)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">
                          Total Distanced Traveled (km)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="1500"
                          step="any"
                          value={transportDistance}
                          onChange={(e) => setTransportDistance(Math.max(0, parseFloat(e.target.value) || 0))}
                          className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm font-semibold text-slate-700 font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: ENERGY UTILITY */}
              {step === 2 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-slate-700 font-bold text-sm">
                    <Lightbulb className="w-4 h-4 text-amber-500 animate-pulse" />
                    <span>Grid Electricity usage</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">
                        Power Generation Grid Type
                      </label>
                      <select
                        value={electricitySource}
                        onChange={(e) => setElectricitySource(e.target.value as any)}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm font-semibold text-slate-700"
                      >
                        <option value="coal_grid">Coal/Fossil Grid (High Carbon)</option>
                        <option value="average_grid">Average Municipal Grid Mix</option>
                        <option value="green_solar">Solar / Turbine clean Grid (Low Carbon)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">
                        Daily consumption load (kWh)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="200"
                        step="any"
                        value={electricityUsage}
                        onChange={(e) => setElectricityUsage(Math.max(0, parseFloat(e.target.value) || 0))}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm font-semibold text-slate-700 font-mono"
                      />
                      <span className="block text-[10px] text-slate-400 mt-1">
                        Tip: Standard laptop load uses ~0.05 kWh/hour; AC units use ~1.5 kWh/hour.
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: DIET PATTERNS */}
              {step === 3 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-slate-700 font-bold text-sm">
                    <Soup className="w-4 h-4 text-emerald-500" />
                    <span>Diet Pattern and Food Meals</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">
                        Meal Dietary Category
                      </label>
                      <select
                        value={foodType}
                        onChange={(e) => setFoodType(e.target.value as any)}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm font-semibold text-slate-700"
                      >
                        <option value="high_meat">High Beef/Lamb (High emission)</option>
                        <option value="mixed_diet">Mixed Meat/Veg Daily Normal</option>
                        <option value="vegetarian">Vegetarian (No meat, eggs/dairy allowed)</option>
                        <option value="vegan">Vegan Lifestyle (Purely Plant Powered)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">
                        Number of log meals today
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        step="1"
                        value={foodMealsCount}
                        onChange={(e) => setFoodMealsCount(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm font-semibold text-slate-700 font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: RESOURCE WATER & WASTE */}
              {step === 4 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-slate-700 font-bold text-sm">
                    <Droplet className="w-4 h-4 text-cyan-500" />
                    <span>Water Utility & Garbage Waste details</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">
                        Water Consumed (Liters)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="5000"
                        step="any"
                        value={waterUsage}
                        onChange={(e) => setWaterUsage(Math.max(0, parseFloat(e.target.value) || 0))}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm font-semibold text-slate-700 font-mono"
                      />
                      <span className="block text-[10px] text-slate-400 mt-1">
                        Tip: Standard shower takes approx 60-80 Liters.
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">
                        Garbage weight disposed (kg)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="any"
                        value={wasteWeight}
                        onChange={(e) => setWasteWeight(Math.max(0, parseFloat(e.target.value) || 0))}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm font-semibold text-slate-700 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">
                        Garbage Waste sorting type
                      </label>
                      <select
                        value={wasteType}
                        onChange={(e) => setWasteType(e.target.value as any)}
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm font-semibold text-slate-700"
                      >
                        <option value="landfill">Landfill Dump (Untreated, high methane)</option>
                        <option value="recycled">Recycling Bin (Intermediate)</option>
                        <option value="composting">Composting Treatment (Very low carbon impact)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* LIVE ESTIMATION PREVIEW PANEL inside form */}
              <div id="live_calculated_carbon_card" className="border border-emerald-100 bg-emerald-50/50 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-2.5">
                  <span className="p-2 bg-emerald-100 rounded-xl text-emerald-800">
                    <Check className="w-5 h-5" />
                  </span>
                  <div>
                    <span className="text-[10px] text-emerald-800 uppercase font-bold tracking-wider">
                      Live CO₂ Calculation Estimate
                    </span>
                    <span className="block text-2xl font-black text-emerald-950 font-mono">
                      {livePreview.totalCO2} <span className="text-xs font-normal">kg CO₂</span>
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">
                    Target Eco Score
                  </span>
                  <span className={`text-base font-extrabold ${livePreview.ecoScore >= 80 ? "text-emerald-700" : livePreview.ecoScore >= 50 ? "text-amber-600" : "text-red-650"}`}>
                    {livePreview.ecoScore} / 100
                  </span>
                </div>
              </div>
            </form>

            {/* Modal Bottom Stepping Buttons */}
            <div className="bg-slate-50 border-t border-slate-100 p-5 flex justify-between items-center">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => setStep(s => s - 1)}
                  className="px-4 py-2 bg-white hover:bg-slate-100 hover:text-slate-900 border border-slate-200 text-slate-700 rounded-xl font-semibold text-xs transition flex items-center gap-1 cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>
              ) : (
                <div className="w-12" />
              )}

              <div className="flex gap-2">
                {step < 4 ? (
                  <button
                    type="button"
                    onClick={() => setStep(s => s + 1)}
                    className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl font-semibold text-xs transition flex items-center gap-1 cursor-pointer"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="px-5 py-2 bg-emerald-800 hover:bg-emerald-950 text-white rounded-xl font-semibold text-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {saving ? (
                      <span className="inline-block animate-spin h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full" />
                    ) : (
                      <Save className="w-3.5 h-3.5" />
                    )}
                    <span>Save Daily Log</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* HISTORICAL LOGS CRUD VIEW */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50">
          <h3 className="font-bold text-slate-800 tracking-tight text-base">
            Logs Ledger
          </h3>
          <p className="text-xs text-slate-400">
            Read, update, and delete logged entries. Your calculation is automatically computed using factors.
          </p>
        </div>

        {activities.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <span className="p-4 bg-slate-50 text-slate-450 border rounded-2xl shadow-xs mb-3">
              <Calendar className="w-6 h-6" />
            </span>
            <p className="text-sm font-bold text-slate-600">No logs on ledger yet</p>
            <p className="text-xs text-slate-400 max-w-xs mt-1">
              Start logging your travel commutes, energy usage, food portions, and recycled items to compute the carbon footprint.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse text-sm text-slate-700 min-w-[600px]">
              <thead>
                <tr className="bg-slate-50/60 uppercase tracking-widest text-[10px] font-bold text-slate-400 border-b border-slate-100">
                  <th className="p-4">Date</th>
                  <th className="p-4">Commute Mode</th>
                  <th className="p-4">Grid Power</th>
                  <th className="p-4">Diet Form</th>
                  <th className="p-4">Waste/Water</th>
                  <th className="p-4">Calculated CO₂</th>
                  <th className="p-4">Eco Score</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50/80">
                {activities
                  .sort((a, b) => b.date.localeCompare(a.date))
                  .map((act) => {
                    const fp = dayFootprints.find((f) => f.id === act.id) || calculateCo2(act, emissionFactors);

                    return (
                      <tr key={act.id} className="hover:bg-slate-50/50 transition">
                        <td className="p-4 font-semibold text-slate-700 whitespace-nowrap">
                          {act.date}
                        </td>
                        <td className="p-4 text-xs font-medium text-slate-500">
                          {act.transportDistance} km ({act.transportType.replace("_", " ")})
                        </td>
                        <td className="p-4 text-xs font-medium text-slate-500">
                          {act.electricityUsage} kWh ({act.electricitySource.replace("_", " ")})
                        </td>
                        <td className="p-4 text-xs font-medium text-slate-500">
                          {act.foodMealsCount} meals ({act.foodType.replace("_", " ")})
                        </td>
                        <td className="p-4 text-xs font-medium text-slate-500">
                          {act.waterUsage} L / {act.wasteWeight} kg
                        </td>
                        <td className="p-4 font-bold text-slate-800 font-mono">
                          {fp.totalCO2} <span className="text-[10px] font-normal text-slate-400">kg</span>
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-0.5 px-2.5 py-0.5 rounded-full text-xs font-bold leading-none ${
                            fp.ecoScore >= 80 
                              ? "bg-emerald-50 text-emerald-800" 
                              : fp.ecoScore >= 50 
                              ? "bg-amber-50 text-amber-800" 
                              : "bg-red-50 text-red-850"
                          }`}>
                            {fp.ecoScore}
                          </span>
                        </td>
                        <td className="p-4 text-right whitespace-nowrap">
                          <button
                            id={`edit-act-${act.id}`}
                            onClick={() => startEdit(act)}
                            className="p-1 text-slate-450 hover:text-emerald-700 bg-white hover:bg-slate-50 rounded-md border border-slate-200 shadow-xs mr-2 transition cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            id={`delete-act-${act.id}`}
                            onClick={() => onDeleteLog(act.id)}
                            className="p-1 text-slate-450 hover:text-red-650 bg-white hover:bg-red-50 rounded-md border border-slate-200 hover:border-red-200 shadow-xs transition cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
