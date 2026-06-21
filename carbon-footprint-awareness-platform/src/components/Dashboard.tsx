import React, { useMemo } from "react";
import { ActivityLog, DayFootprint, EmissionFactors, Badge } from "../types";
import { KNOWN_BADGES } from "../utils/calculator";
import { 
  TrendingUp, 
  Leaf, 
  ArrowRight, 
  Calendar, 
  HelpCircle, 
  Plus, 
  FileText,
  Percent,
  CheckCircle2,
  Lock,
  Award,
  ChevronRight,
  Shield,
  Zap,
  Droplet,
  Shuffle,
  Trash2,
  Bike
} from "lucide-react";

interface DashboardProps {
  activities: ActivityLog[];
  dayFootprints: DayFootprint[];
  recentFootprints: DayFootprint[];
  unlockedBadges: string[];
  activeChallengesCount: number;
  completedChallengesCount: number;
  claimedPoints: number;
  onNavigate: (tab: string) => void;
  onOpenLogModal: () => void;
  emissionFactors: EmissionFactors;
}

export default function Dashboard({
  activities,
  dayFootprints,
  recentFootprints,
  unlockedBadges,
  activeChallengesCount,
  completedChallengesCount,
  claimedPoints,
  onNavigate,
  onOpenLogModal,
  emissionFactors
}: DashboardProps) {

  // Sum total emissions and obtain category averages
  const stats = useMemo(() => {
    if (dayFootprints.length === 0) {
      return {
        totalCO2: 0,
        averageEcoScore: 0,
        transport: 0,
        electricity: 0,
        food: 0,
        water: 0,
        waste: 0,
        maxCO2: 10
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

    const totalCO2 = parseFloat((transportSum + electricitySum + foodSum + waterCO2Sum(waterSum) + wasteSum).toFixed(2));
    
    function waterCO2Sum(w: number) {
      return w; // already calculated
    }

    const breakdownSum = transportSum + electricitySum + foodSum + waterSum + wasteSum;

    return {
      totalCO2,
      averageEcoScore: Math.round(totalScore / count),
      transport: breakdownSum > 0 ? parseFloat((transportSum / breakdownSum * 100).toFixed(0)) : 0,
      electricity: breakdownSum > 0 ? parseFloat((electricitySum / breakdownSum * 100).toFixed(0)) : 0,
      food: breakdownSum > 0 ? parseFloat((foodSum / breakdownSum * 100).toFixed(0)) : 0,
      water: breakdownSum > 0 ? parseFloat((waterSum / breakdownSum * 100).toFixed(0)) : 0,
      waste: breakdownSum > 0 ? parseFloat((wasteSum / breakdownSum * 100).toFixed(0)) : 0,
      rawTransport: parseFloat(transportSum.toFixed(1)),
      rawElectricity: parseFloat(electricitySum.toFixed(1)),
      rawFood: parseFloat(foodSum.toFixed(1)),
      rawWater: parseFloat(waterSum.toFixed(3)),
      rawWaste: parseFloat(wasteSum.toFixed(1)),
      maxCO2: Math.max(...dayFootprints.map(f => f.totalCO2), 10)
    };
  }, [dayFootprints]);

  // Carbon comparison benchmark
  // Typical American: ~44.0 kg/day. Typical European: ~20.0 kg/day. Global Target: ~3.5 kg/day
  const sustainableComparison = useMemo(() => {
    if (dayFootprints.length === 0) return { percentBetter: 0, benchmark: "Neutral" };
    const userDailyAvg = stats.totalCO2 / dayFootprints.length;
    
    // Benchmark against average carbon usage (approx 15 kg/day)
    const benchmarkAvg = 15.0; 
    const diff = benchmarkAvg - userDailyAvg;
    const percentBetter = Math.round((diff / benchmarkAvg) * 100);

    let benchmark = "Eco Pioneer";
    if (userDailyAvg <= 3.5) {
      benchmark = "Carbon Neutral Super Hero";
    } else if (userDailyAvg <= 8.0) {
      benchmark = "Low Carbon Champion";
    } else if (userDailyAvg <= 15.0) {
      benchmark = "Moderate Green Citizen";
    } else {
      benchmark = "Carbon Heavy Footprint";
    }

    return {
      percentBetter,
      benchmark,
      userDailyAvg: parseFloat(userDailyAvg.toFixed(1))
    };
  }, [dayFootprints, stats]);

  // Generate gorgeous responsive SVG bar/line chart of last 7 footprints
  const chartData = useMemo(() => {
    // Sort recentFootprints by date (ascending)
    const last7 = [...dayFootprints]
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-7);

    if (last7.length === 0) {
      // Dummy data for nice visualization
      return [];
    }

    const maxVal = Math.max(...last7.map(f => f.totalCO2), 5);
    
    return last7.map((f, idx) => {
      // Calculate height ratio of 100 for SVG
      const heightPercentage = Math.max(8, (f.totalCO2 / maxVal) * 80); 
      // Formatted date (e.g. "Jun 21")
      const dateParts = f.date.split("-");
      const shortDate = dateParts.length === 3 ? `${dateParts[1]}/${dateParts[2]}` : f.date;

      return {
        date: shortDate,
        totalCO2: f.totalCO2,
        ecoScore: f.ecoScore,
        height: heightPercentage,
        raw: f
      };
    });
  }, [dayFootprints]);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div id="welcome_banner" className="bg-emerald-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-lg shadow-emerald-950/10">
        <div className="absolute right-0 bottom-0 top-0 opacity-10 pointer-events-none translate-x-12 translate-y-4">
          <Leaf className="w-80 h-80 rotate-12" />
        </div>
        <div id="welcome_message" className="relative max-w-xl space-y-4">
          <span className="bg-emerald-800 text-emerald-200 text-xs px-3 py-1 rounded-full font-semibold uppercase tracking-widest">
            CO2 Tracking Platform
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight font-sans">
            Eco-living begins with tracking.
          </h1>
          <p className="text-emerald-100/80 text-sm sm:text-base leading-relaxed">
            Your daily decisions directly impact the biosphere. Log your lifestyle attributes and discover how easy it is to shrink your environmental shadow.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <button
              id="dashboard_log_action_btn"
              onClick={onOpenLogModal}
              className="px-5 py-2.5 bg-white hover:bg-emerald-50 text-emerald-900 rounded-xl font-semibold shadow-md shadow-emerald-950/20 active:translate-y-px transition flex items-center gap-2 text-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Log Daily Activity</span>
            </button>
            <button
              id="pdf_report_nav_btn"
              onClick={() => onNavigate("pdf-report")}
              className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl border border-emerald-700/50 font-semibold transition flex items-center gap-2 text-sm cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>Export PDF Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Metric Cards Grid */}
      <div id="stats_metrics_grid" className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Dynamic Circular Daily Eco Score Card */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col items-center justify-between text-center relative overflow-hidden">
          <div className="w-full flex justify-between items-center mb-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Average Eco Score
            </span>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] uppercase tracking-wider px-2 py-0.5 font-bold rounded-md">
              {sustainableComparison.benchmark}
            </span>
          </div>

          <div className="relative w-40 h-40 flex items-center justify-center my-2">
            {/* SVG Ring progress */}
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="80"
                cy="80"
                r="68"
                className="stroke-slate-50 fill-none"
                strokeWidth="12"
              />
              <circle
                cx="80"
                cy="80"
                r="68"
                className={`fill-none shadow-sm transition-all duration-1000 ${
                  stats.averageEcoScore >= 80 
                    ? "stroke-emerald-600" 
                    : stats.averageEcoScore >= 50 
                    ? "stroke-amber-500" 
                    : "stroke-red-500"
                }`}
                strokeWidth="12"
                strokeDasharray={427}
                strokeDashoffset={427 - (427 * (stats.averageEcoScore || 100)) / 100}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute text-center">
              <span className="text-4xl font-extrabold text-slate-800 tracking-tight font-sans">
                {stats.averageEcoScore || "—"}
              </span>
              <span className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                out of 100
              </span>
            </div>
          </div>

          <div className="w-full pt-4 mt-2 border-t border-slate-100">
            <p className="text-xs text-slate-500 text-left">
              {stats.averageEcoScore >= 80 
                ? "🌱 Wonderful job! You consume resource reserves sustainably below average boundaries." 
                : stats.averageEcoScore >= 50 
                ? "⚡ Decent score, but scaling back grid heating and high beef logs will boost your score!" 
                : "⚠️ High emissions. Talk to the Al Sustainability Coach to optimize your green habits."}
            </p>
          </div>
        </div>

        {/* Total Carbon tracked */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Total CO₂ Tracked
              </span>
              <span className="p-1.5 bg-slate-50 rounded-lg text-slate-400">
                <TrendingUp className="w-4 h-4" />
              </span>
            </div>
            
            <div className="mt-2 space-y-1">
              <span className="text-5xl font-extrabold text-slate-800 tracking-tight font-sans">
                {stats.totalCO2} <span className="text-lg font-medium text-slate-400">kg</span>
              </span>
              <p className="text-xs text-slate-500 font-medium">
                Accumulated from <span className="font-semibold text-emerald-800">{activities.length} activity days</span>.
              </p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                Daily Average
              </span>
              <span className="block text-lg font-bold text-slate-700">
                {sustainableComparison.userDailyAvg || 0} kg <span className="text-xs text-slate-400">CO₂/day</span>
              </span>
            </div>
            {sustainableComparison.percentBetter > 0 ? (
              <div className="text-right">
                <span className="inline-flex items-center gap-0.5 bg-emerald-50 text-emerald-700 text-xs px-2 py-0.5 rounded-full font-bold">
                  {sustainableComparison.percentBetter}% Less
                </span>
                <span className="block text-[9px] text-slate-400">than average citizen</span>
              </div>
            ) : dayFootprints.length > 0 ? (
              <div className="text-right">
                <span className="inline-flex items-center gap-0.5 bg-red-50 text-red-700 text-xs px-2 py-0.5 rounded-full font-bold font-sans">
                  +{Math.abs(sustainableComparison.percentBetter)}% More
                </span>
                <span className="block text-[9px] text-slate-400">than average citizen</span>
              </div>
            ) : null}
          </div>
        </div>

        {/* Gamified Achievements Summary */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              ECO Challenges & Gamification
            </span>
            <span className="p-1.5 bg-emerald-50 text-emerald-800 rounded-lg">
              <Award className="w-4 h-4" />
            </span>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50/55 p-3 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                  Eco Points
                </span>
                <span className="block text-2xl font-black text-emerald-800 font-mono mt-1">
                  {claimedPoints}
                </span>
              </div>
              <div className="bg-slate-50/55 p-3 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                  Badges Earned
                </span>
                <span className="block text-2xl font-black text-orange-600 font-mono mt-1">
                  {unlockedBadges.length} <span className="text-xs font-normal text-slate-400">/ {KNOWN_BADGES.length}</span>
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-slate-600">
                <span>Daily Challenge Completed</span>
                <span className="text-slate-500 font-mono">{completedChallengesCount} completed</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div 
                  className="bg-emerald-600 h-2 rounded-full transition-all duration-500" 
                  style={{ width: `${activeChallengesCount + completedChallengesCount > 0 ? (completedChallengesCount / (activeChallengesCount + completedChallengesCount)) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate("challenges")}
            className="mt-4 w-full py-2 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-900 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 hover:border-emerald-200 transition flex items-center justify-center gap-1 cursor-pointer"
          >
            <span>View Active Challenges</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Interactive Activity Trend & Category Distribution */}
      <div id="analytics_section" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Dynamic Custom Chart */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-bold text-slate-800 tracking-tight text-base">
                Footprint History Trend
              </h3>
              <p className="text-xs text-slate-400">
                Tracking emissions total in kg CO₂ for up to 7 recorded sessions
              </p>
            </div>
            <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>Session Log</span>
            </span>
          </div>

          {chartData.length === 0 ? (
            <div className="h-60 flex flex-col items-center justify-center bg-slate-50/50 border border-dashed border-slate-200 rounded-xl p-8 text-center">
              <div id="no-emissions-icon" className="mb-3 p-3 bg-white rounded-2xl border border-slate-100 shadow-sm text-slate-400">
                <TrendingUp className="w-6 h-6" />
              </div>
              <p className="font-bold text-slate-600 text-sm">No activity trend available</p>
              <p className="text-xs text-slate-400 max-w-xs mt-1">
                Your footprints will appear in this interactive chart as soon as you add daily activity logs.
              </p>
              <button
                onClick={onOpenLogModal}
                className="mt-4 px-4 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold transition cursor-pointer"
              >
                Create Log
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Graphic Chart Interface */}
              <div className="relative h-56 flex items-end justify-between px-4 pt-4 pb-2 border-b border-slate-100">
                {/* Visual coordinate lines */}
                <div className="absolute left-0 right-0 top-1/4 border-t border-slate-100/80 pointer-events-none" />
                <div className="absolute left-0 right-0 top-2/4 border-t border-slate-100/80 pointer-events-none" />
                <div className="absolute left-0 right-0 top-3/4 border-t border-slate-100/80 pointer-events-none" />

                {chartData.map((item, index) => (
                  <div key={index} className="flex flex-col items-center group relative z-10 w-full">
                    {/* Tooltip on hover */}
                    <div className="absolute bottom-full mb-2 bg-slate-850 text-white text-[10px] py-1 px-2.5 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none translate-y-1 transition duration-200 font-semibold shadow-md whitespace-nowrap z-50">
                      <div>Date: {item.raw.date}</div>
                      <div>Total: {item.totalCO2} kg CO₂</div>
                      <div>Score: {item.ecoScore} Eco Score</div>
                    </div>

                    {/* Interactive Bar */}
                    <div 
                      style={{ height: `${item.height}%` }}
                      className={`w-10 sm:w-12 rounded-t-lg transition-all duration-700 ease-out hover:opacity-90 relative ${
                        item.ecoScore >= 80 
                          ? "bg-gradient-to-t from-emerald-500 to-emerald-400 shadow-sm shadow-emerald-500/20" 
                          : item.ecoScore >= 50 
                          ? "bg-gradient-to-t from-amber-500 to-amber-400 shadow-sm shadow-amber-500/20" 
                          : "bg-gradient-to-t from-red-500 to-red-400 shadow-sm shadow-red-500/20"
                      }`}
                    >
                      {/* Metric numeric banner atop */}
                      <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-slate-600 font-mono">
                        {item.totalCO2}
                      </span>
                    </div>

                    {/* Date subtitle */}
                    <span className="text-[10px] font-bold text-slate-450 mt-2">
                      {item.date}
                    </span>
                  </div>
                ))}
              </div>

              {/* Chart Legend */}
              <div className="flex gap-4 text-xs font-semibold justify-end pt-2 text-slate-500">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-emerald-500 rounded" />
                  <span>Eco Optimized Score (&ge;80)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-amber-500 rounded" />
                  <span>Moderate (&ge;50)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-red-500 rounded" />
                  <span>Heavy CO₂ (&lt;50)</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Category Breakdown list */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-800 tracking-tight text-base">
              Emission Breakdowns
            </h3>
            <p className="text-xs text-slate-400 mb-5">
              Source ratio breakdown of your total greenhouse emissions
            </p>

            {dayFootprints.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-center p-3 text-slate-400 text-xs">
                No breakdown info. Please update logs to visualize source breakdowns.
              </div>
            ) : (
              <div className="space-y-4">
                {/* Category 1: Transport */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-blue-500" />
                      Transport
                    </span>
                    <span className="font-mono text-slate-500">{stats.rawTransport} kg ({stats.transport}%)</span>
                  </div>
                  <div className="w-full bg-slate-50 rounded-full h-1.5">
                    <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${stats.transport}%` }} />
                  </div>
                </div>

                {/* Category 2: Electricity */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      Energy (Electricity)
                    </span>
                    <span className="font-mono text-slate-500">{stats.rawElectricity} kg ({stats.electricity}%)</span>
                  </div>
                  <div className="w-full bg-slate-50 rounded-full h-1.5">
                    <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: `${stats.electricity}%` }} />
                  </div>
                </div>

                {/* Category 3: Food */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      Food (Diet pattern)
                    </span>
                    <span className="font-mono text-slate-500">{stats.rawFood} kg ({stats.food}%)</span>
                  </div>
                  <div className="w-full bg-slate-50 rounded-full h-1.5">
                    <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${stats.food}%` }} />
                  </div>
                </div>

                {/* Category 4: Water */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-cyan-400" />
                      Water Utility
                    </span>
                    <span className="font-mono text-slate-500">{stats.rawWater} kg ({stats.water}%)</span>
                  </div>
                  <div className="w-full bg-slate-50 rounded-full h-1.5">
                    <div className="bg-cyan-400 h-1.5 rounded-full" style={{ width: `${stats.water}%` }} />
                  </div>
                </div>

                {/* Category 5: Waste */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-purple-500" />
                      Waste Disposal
                    </span>
                    <span className="font-mono text-slate-500">{stats.rawWaste} kg ({stats.waste}%)</span>
                  </div>
                  <div className="w-full bg-slate-50 rounded-full h-1.5">
                    <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: `${stats.waste}%` }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => onNavigate("calculations-coach")}
              className="text-xs font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 cursor-pointer"
            >
              <span>Consult AI Coach Sustainability Tips</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Gamified Achievement Badge Showcase */}
      <div id="badges_milestones" className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="font-bold text-slate-800 tracking-tight text-base">
              Milestones & Achievements
            </h3>
            <p className="text-xs text-slate-400">
              Complete actions, complete challenges, and optimize carbon efficiency to unlock green badges
            </p>
          </div>
          <span className="bg-orange-50 text-orange-700 border border-orange-100 text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1">
            <Award className="w-3.5 h-3.5" />
            <span>{unlockedBadges.length} unlocked</span>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
          {KNOWN_BADGES.map((badge) => {
            const isUnlocked = unlockedBadges.includes(badge.id);

            return (
              <div 
                key={badge.id}
                className={`p-4 rounded-xl border flex flex-col items-center justify-center text-center transition-all duration-300 relative group ${
                  isUnlocked 
                    ? "bg-gradient-to-b from-orange-50/10 to-orange-50/70 border-orange-200/60 shadow-sm shadow-orange-300/5 text-slate-800" 
                    : "bg-slate-50/30 border-slate-200/50 text-slate-450 grayscale"
                }`}
              >
                {/* Lock icon overlay for locked status */}
                {!isUnlocked && (
                  <span className="absolute top-2 right-2 text-slate-350 bg-white p-0.5 rounded-full border border-slate-100 shadow-sm">
                    <Lock className="w-2.5 h-2.5" />
                  </span>
                )}

                {/* Dynamic Icon */}
                <div className={`p-2.5 rounded-xl mb-2.5 transition ${
                  isUnlocked ? "bg-orange-100 text-orange-600 border border-orange-200/30" : "bg-slate-100 text-slate-400"
                }`}>
                  {renderBadgeIcon(badge.icon, isUnlocked)}
                </div>

                <span className="text-[11px] font-bold text-slate-800 block line-clamp-1">
                  {badge.title}
                </span>

                {/* Micro tooltip on mobile / hover */}
                <div className="absolute top-full mt-1 bg-slate-900 text-white text-[9px] px-2 py-1.5 rounded-md opacity-0 group-hover:opacity-100 transition duration-200 pointer-events-none z-50 shadow-md w-32 border border-slate-800 font-medium">
                  {badge.description}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Visual icon resolver for achievements
function renderBadgeIcon(iconName: string, active: boolean) {
  const cn = "w-5 h-5";
  switch(iconName) {
    case "Footprints":
      return <Plus className={cn} />;
    case "Leaf":
      return <Leaf className={cn} />;
    case "Bike":
      return <Bike className={cn} />;
    case "Apple":
      return <Percent className={cn} />;
    case "Trash2":
      return <Trash2 className={cn} />;
    case "Award":
      return <Award className={cn} />;
    case "ShieldCheck":
      return <Shield className={cn} />;
    default:
      return <Award className={cn} />;
  }
}
