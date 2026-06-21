import React from "react";
import { EcoChallenge, UserChallengeStatus } from "../types";
import { INITIAL_CHALLENGES } from "../utils/calculator";
import { 
  Trophy, 
  Award, 
  CheckCircle2, 
  AlertCircle, 
  Flame, 
  ShieldCheck, 
  ArrowRight,
  Apple, 
  Bike, 
  Zap, 
  Droplet, 
  Trash2 
} from "lucide-react";

interface ChallengesProps {
  completedChallenges: string[];
  claimedPoints: number;
  onCompleteChallenge: (id: string, points: number) => Promise<void>;
  unlockedBadgesCount: number;
}

export default function Challenges({
  completedChallenges,
  claimedPoints,
  onCompleteChallenge,
  unlockedBadgesCount
}: ChallengesProps) {

  const challenges: EcoChallenge[] = INITIAL_CHALLENGES as EcoChallenge[];

  return (
    <div className="space-y-6">
      {/* Challenges Hero */}
      <div id="challenges_hero_banner" className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-lg shadow-amber-500/10">
        <div className="absolute right-0 bottom-0 top-0 opacity-10 pointer-events-none translate-x-12 translate-y-4">
          <Trophy className="w-80 h-80 rotate-12" />
        </div>
        <div className="relative max-w-xl space-y-3">
          <span className="bg-amber-600/70 text-amber-50 text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-widest">
            Gamification Engine
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight font-sans">
            Level up your eco-living.
          </h2>
          <p className="text-amber-50/80 text-xs sm:text-sm leading-relaxed">
            Participate in daily challenges to earn Eco Points. These habits reinforce circular sustainability, lower high-impact carbons, and protect biological resources.
          </p>
          <div className="flex gap-4 pt-2">
            <div className="bg-white/10 px-4 py-2 rounded-xl backdrop-blur-xs border border-white/10">
              <span className="text-[10px] opacity-75 uppercase block font-bold">Total claimed points</span>
              <span className="text-xl font-mono font-black">{claimedPoints} pts</span>
            </div>
            <div className="bg-white/10 px-4 py-2 rounded-xl backdrop-blur-xs border border-white/10">
              <span className="text-[10px] opacity-75 uppercase block font-bold">Badges unlocked</span>
              <span className="text-xl font-mono font-black">{unlockedBadgesCount} / 7</span>
            </div>
          </div>
        </div>
      </div>

      {/* Active challenges collection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-slate-800 tracking-tight text-base">
              Available Daily Challenges
            </h3>
            <span className="text-xs text-slate-400 font-semibold font-mono">
              Reset daily at 12:00 AM
            </span>
          </div>

          <div className="space-y-4">
            {challenges.map((c) => {
              const isCompleted = completedChallenges.includes(c.id);

              return (
                <div 
                  key={c.id}
                  className={`p-5 rounded-2xl border transition-all duration-300 relative overflow-hidden flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${
                    isCompleted 
                      ? "bg-slate-50/30 border-slate-200/50 opacity-80" 
                      : "bg-white border-slate-100 hover:border-amber-200/80 shadow-sm shadow-slate-100/30"
                  }`}
                >
                  <div className="flex gap-4 items-start">
                    {/* Category specific colored icon container */}
                    <div className={`p-3 rounded-xl border shrink-0 ${
                      isCompleted 
                        ? "bg-slate-100 text-slate-400 border-slate-200" 
                        : "bg-amber-50 text-amber-600 border-amber-100"
                    }`}>
                      {renderChallengeIcon(c.icon)}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-800 text-sm leading-snug">
                          {c.title}
                        </span>
                        <span className={`text-[10px] uppercase font-bold py-0.5 px-1.5 rounded-md ${
                          isCompleted ? "bg-slate-100 text-slate-400" : "bg-amber-50 text-amber-700"
                        }`}>
                          +{c.points} Pts
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed max-w-md">
                        {c.description}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 w-full sm:w-auto text-right">
                    {isCompleted ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
                        <span>Completed</span>
                      </span>
                    ) : (
                      <button
                        id={`complete-challenge-${c.id}`}
                        onClick={() => onCompleteChallenge(c.id, c.points)}
                        className="w-full sm:w-auto px-4 py-2 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer shadow-md shadow-amber-500/10"
                      >
                        <span>Check Off</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Motivational guidelines sidebar info */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-xs space-y-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-2xl w-fit">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-850 tracking-tight text-base leading-tight">
              Habit formation sciences
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Completing daily challenges activates neural triggers that pair sustainability choices with immediate progress indicators. Over time, these actions scale to organic subconscious habit loops.
            </p>
            
            <div className="border-t border-slate-100 pt-4 space-y-3.5">
              <div className="flex items-start gap-2 text-xs text-slate-600 leading-snug">
                <span className="p-1 bg-amber-50 text-amber-700 rounded-lg mt-0.5 font-bold">1</span>
                <span>Each completed challenge directly reduces carbon output based on emission factors.</span>
              </div>
              <div className="flex items-start gap-2 text-xs text-slate-600 leading-snug">
                <span className="p-1 bg-amber-50 text-amber-700 rounded-lg mt-0.5 font-bold">2</span>
                <span>Collectively logs and completed challenges unlock high tier custom achievement medals.</span>
              </div>
              <div className="flex items-start gap-2 text-xs text-slate-600 leading-snug">
                <span className="p-1 bg-amber-50 text-amber-700 rounded-lg mt-0.5 font-bold">3</span>
                <span>Dwell in carbon-neutral spaces by setting and completing individual goals.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function renderChallengeIcon(iconName: string) {
  const cn = "w-4 h-4";
  switch(iconName) {
    case "Apple":
      return <Apple className={cn} />;
    case "Bike":
      return <Bike className={cn} />;
    case "Zap":
      return <Zap className={cn} />;
    case "Droplet":
      return <Droplet className={cn} />;
    case "Trash2":
      return <Trash2 className={cn} />;
    default:
      return <CheckCircle2 className={cn} />;
  }
}
