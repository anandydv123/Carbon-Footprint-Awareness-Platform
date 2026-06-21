import React from "react";
import { ActivityLog, DayFootprint, EmissionFactors } from "../types";
import { Printer, Download, Leaf, Award, FileText, CheckCircle2, ChevronDown, Check } from "lucide-react";

interface PDFReportProps {
  activities: ActivityLog[];
  dayFootprints: DayFootprint[];
  emissionFactors: EmissionFactors;
  userDisplayName?: string;
}

export default function PDFReport({
  activities,
  dayFootprints,
  emissionFactors,
  userDisplayName = "Green Citizen"
}: PDFReportProps) {

  // Sum total emissions and obtain category averages
  const reportStats = React.useMemo(() => {
    if (dayFootprints.length === 0) {
      return {
        totalCO2: 0,
        averageEcoScore: 0,
        transport: 0,
        electricity: 0,
        food: 0,
        water: 0,
        waste: 0,
        count: 0
      };
    }

    const count = dayFootprints.length;
    let transportSum = 0;
    let electricitySum = 0;
    let foodSum = 0;
    let waterSum = 0;
    let wasteSum = 0;
    let totalScore = 0;

    dayFootprints.forEach(f => {
      transportSum += f.transportCO2;
      electricitySum += f.electricityCO2;
      foodSum += f.foodCO2;
      waterSum += f.waterCO2;
      wasteSum += f.wasteCO2;
      totalScore += f.ecoScore;
    });

    const breakdownSum = transportSum + electricitySum + foodSum + waterSum + wasteSum;

    return {
      totalCO2: parseFloat((transportSum + electricitySum + foodSum + waterSum + wasteSum).toFixed(1)),
      averageEcoScore: Math.round(totalScore / count),
      transport: breakdownSum > 0 ? parseFloat((transportSum / breakdownSum * 100).toFixed(0)) : 0,
      electricity: breakdownSum > 0 ? parseFloat((electricitySum / breakdownSum * 100).toFixed(0)) : 0,
      food: breakdownSum > 0 ? parseFloat((foodSum / breakdownSum * 100).toFixed(0)) : 0,
      water: breakdownSum > 0 ? parseFloat((waterSum / breakdownSum * 100).toFixed(0)) : 0,
      waste: breakdownSum > 0 ? parseFloat((wasteSum / breakdownSum * 100).toFixed(0)) : 0,
      rawTransport: parseFloat(transportSum.toFixed(1)),
      rawElectricity: parseFloat(electricitySum.toFixed(1)),
      rawFood: parseFloat(foodSum.toFixed(1)),
      rawWater: parseFloat(waterSum.toFixed(2)),
      rawWaste: parseFloat(wasteSum.toFixed(1)),
      count
    };
  }, [dayFootprints]);

  const handlePrint = () => {
    window.print();
  };

  const currentDateString = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  return (
    <div className="space-y-6">
      {/* Interactive print control header */}
      <div className="bg-white border border-slate-100 p-5 rounded-3xl shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <FileText className="w-6 h-6 text-emerald-800" />
            <span>Sustainability Report Card</span>
          </h2>
          <p className="text-xs text-slate-500">
            Export a high-definition certified vector PDF report of your custom stats via browser print.
          </p>
        </div>
        <button
          id="trigger_window_print_btn"
          onClick={handlePrint}
          className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 active:bg-emerald-950 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-md shadow-emerald-500/10 font-sans"
        >
          <Printer className="w-4 h-4" />
          <span>Print or Export PDF</span>
        </button>
      </div>

      {/* PRINT-OPTIMIZED CERTIFICATE CONTAINER */}
      <div 
        id="sustainability_report_print_area"
        className="bg-white border border-slate-200/80 rounded-3xl p-8 sm:p-12 relative overflow-hidden shadow-sm shadow-slate-100/40 print:border-none print:p-0 print:shadow-none"
      >
        {/* Aesthetic frame borders for print certificates */}
        <div className="absolute inset-4 border-2 border-slate-100/60 rounded-2xl pointer-events-none print:hidden" />
        
        <div className="relative space-y-8 max-w-3xl mx-auto">
          {/* Executive Header */}
          <div className="flex justify-between items-start border-b border-slate-100 pb-6">
            <div className="space-y-1">
              <span className="text-[10px] text-emerald-800 font-extrabold uppercase tracking-widest bg-emerald-50 px-2.5 py-1 rounded-md">
                Certified Carbon Audit
              </span>
              <h1 className="text-3xl font-black text-slate-900 font-sans tracking-tight pt-2">
                Carbon Platform Report
              </h1>
              <p className="text-xs text-slate-400">
                Generated dynamically on {currentDateString}
              </p>
            </div>
            <div className="text-right space-y-1">
              <div className="flex items-center gap-1.5 justify-end">
                <Leaf className="w-5 h-5 text-emerald-700" />
                <span className="font-extrabold text-slate-800 tracking-tight">EcoFootprint</span>
              </div>
              <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                ID: {Math.random().toString(36).substring(2, 10).toUpperCase()}
              </span>
            </div>
          </div>

          {/* User Citation */}
          <div className="space-y-2">
            <p className="text-xs text-slate-400 uppercase font-black tracking-widest">
              REPORT CITATION
            </p>
            <h2 className="text-xl font-bold text-slate-800">
              Presented to: <span className="text-emerald-900 underline font-black">{userDisplayName}</span>
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              This dynamic document validates and audits the carbon footprint tracked across <span className="font-semibold text-slate-700">{reportStats.count} daily periods</span>. Calculations have been computed dynamically using verified emission multipliers configured in the Carbon Calculative Engine.
            </p>
          </div>

          {/* Metrics summary breakdown inside report */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4">
            <div className="bg-slate-50/60 border border-slate-100 p-5 rounded-2xl">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Tracked Emission Load
              </span>
              <span className="text-3xl font-black text-slate-800 tracking-tight font-mono inline-block mt-1">
                {reportStats.totalCO2} <span className="text-xs font-normal text-slate-400">kg CO₂e</span>
              </span>
            </div>

            <div className="bg-slate-50/60 border border-slate-100 p-5 rounded-2xl">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Calculated Daily Average
              </span>
              <span className="text-3xl font-black text-slate-800 tracking-tight font-mono inline-block mt-1">
                {reportStats.count > 0 ? parseFloat((reportStats.totalCO2 / reportStats.count).toFixed(1)) : 0} <span className="text-xs font-normal text-slate-400">kg/day</span>
              </span>
            </div>

            <div className="bg-slate-50/60 border border-slate-100 p-5 rounded-2xl">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Calculative Eco Rating
              </span>
              <span className="text-3xl font-black text-emerald-800 tracking-tight font-sans inline-block mt-1">
                {reportStats.averageEcoScore || "—"}/100
              </span>
            </div>
          </div>

          {/* Category Contributions report table */}
          <div className="space-y-4 pt-4">
            <p className="text-xs text-slate-400 uppercase font-black tracking-widest">
              EMISSION BREAKDOWN DETAIL
            </p>

            <div className="border border-slate-150 rounded-2xl overflow-hidden text-xs">
              <div className="grid grid-cols-3 font-bold bg-slate-50 text-slate-700 border-b border-slate-150 p-3.5">
                <span>Category</span>
                <span className="text-center">Relative Load (kg CO₂)</span>
                <span className="text-right">Ratio Percentage</span>
              </div>
              <div className="divide-y divide-slate-100">
                <div className="grid grid-cols-3 p-3 text-slate-600">
                  <span>Transport & Commute</span>
                  <span className="text-center font-mono">{reportStats.rawTransport} kg</span>
                  <span className="text-right font-mono font-bold text-slate-700">{reportStats.transport}%</span>
                </div>
                <div className="grid grid-cols-3 p-3 text-slate-600">
                  <span>Electricity & Grid utilities</span>
                  <span className="text-center font-mono">{reportStats.rawElectricity} kg</span>
                  <span className="text-right font-mono font-bold text-slate-700">{reportStats.electricity}%</span>
                </div>
                <div className="grid grid-cols-3 p-3 text-slate-600">
                  <span>Food Portions</span>
                  <span className="text-center font-mono">{reportStats.rawFood} kg</span>
                  <span className="text-right font-mono font-bold text-slate-700">{reportStats.food}%</span>
                </div>
                <div className="grid grid-cols-3 p-3 text-slate-600">
                  <span>Water Utilities</span>
                  <span className="text-center font-mono">{reportStats.rawWater} kg</span>
                  <span className="text-right font-mono font-bold text-slate-700">{reportStats.water}%</span>
                </div>
                <div className="grid grid-cols-3 p-3 text-slate-600">
                  <span>Garbage Disposal / Waste</span>
                  <span className="text-center font-mono">{reportStats.rawWaste} kg</span>
                  <span className="text-right font-mono font-bold text-slate-700">{reportStats.waste}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Executive Seal footer */}
          <div className="flex justify-between items-center border-t border-slate-100 pt-8 mt-8">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest">
                VERIFICATION SIGNATURE
              </span>
              <div className="h-10 flex items-center">
                <span className="font-serif italic text-emerald-800 text-lg font-bold tracking-wider select-none pr-3">
                  EcoFootprint Audit Seal
                </span>
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              </div>
            </div>
            <div className="text-right">
              <span className="text-[9px] text-slate-400 block font-bold uppercase tracking-wider">
                Carbon Multipliers Version
              </span>
              <span className="text-xs font-mono font-bold text-slate-600">
                v1.2.5 (Configurable)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
