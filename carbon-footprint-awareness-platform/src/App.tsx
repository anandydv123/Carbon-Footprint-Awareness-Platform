import React, { useState, useEffect, useMemo } from "react";
import { auth, db } from "./firebase";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  doc, 
  deleteDoc, 
  setDoc 
} from "firebase/firestore";

import { ActivityLog, DayFootprint, EmissionFactors } from "./types";
import { DEFAULT_EMISSION_FACTORS, calculateCo2, KNOWN_BADGES, INITIAL_CHALLENGES } from "./utils/calculator";

import Auth from "./components/Auth";
import Dashboard from "./components/Dashboard";
import ActivityLogger from "./components/ActivityLogger";
import AICoach from "./components/AICoach";
import Challenges from "./components/Challenges";
import AdminSettings from "./components/AdminSettings";
import PDFReport from "./components/PDFReport";

import { 
  Leaf, 
  LayoutDashboard, 
  Calendar, 
  Sparkles, 
  Award, 
  Settings, 
  FileText, 
  LogOut, 
  Menu, 
  X,
  Plus
} from "lucide-react";

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [guestMode, setGuestMode] = useState(false);

  // Application stats states
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [emissionFactors, setEmissionFactors] = useState<EmissionFactors>(DEFAULT_EMISSION_FACTORS);
  const [completedChallenges, setCompletedChallenges] = useState<string[]>([]);
  const [claimedPoints, setClaimedPoints] = useState(0);

  // Active navigation tab
  const [activeTab, setActiveTab] = useState("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [logModalOpen, setLogModalOpen] = useState(false);

  // Listen to Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthLoading(false);
      if (user) {
        setGuestMode(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // LOAD USER SPECIFIC CONTENT FROM FIRESTORE OR FALLBACK TO LOCALSTORAGE
  useEffect(() => {
    if (authLoading) return;

    let unsubscribeActivities = () => {};
    let unsubscribeSettings = () => {};
    let unsubscribeChallenges = () => {};

    // Local Storage Fallback Helpers
    const loadLocalData = () => {
      const localAct = localStorage.getItem("eco_activities");
      if (localAct) setActivities(JSON.parse(localAct));
      else setActivities([]);

      const localFactors = localStorage.getItem("eco_factors");
      if (localFactors) setEmissionFactors(JSON.parse(localFactors));
      else setEmissionFactors(DEFAULT_EMISSION_FACTORS);

      const localChallenges = localStorage.getItem("eco_challenges");
      const localPoints = localStorage.getItem("eco_points");
      
      if (localChallenges) setCompletedChallenges(JSON.parse(localChallenges));
      else setCompletedChallenges([]);
      
      if (localPoints) setClaimedPoints(Number(localPoints));
      else setClaimedPoints(0);
    };

    if (currentUser) {
      // 1. Listen to user's daily activity logs
      try {
        const actQuery = query(
          collection(db, "activities"), 
          where("userId", "==", currentUser.uid)
        );
        unsubscribeActivities = onSnapshot(actQuery, (snapshot) => {
          const loaded: ActivityLog[] = [];
          snapshot.forEach((doc) => {
            loaded.push({ id: doc.id, ...doc.data() } as ActivityLog);
          });
          setActivities(loaded);
          localStorage.setItem("eco_activities", JSON.stringify(loaded));
        }, (err) => {
          console.warn("Firestore activities listener failed, falling back to localStorage", err);
          loadLocalData();
        });

        // 2. Listen to custom emission factors settings
        const settingsDocRef = doc(db, "settings", currentUser.uid);
        unsubscribeSettings = onSnapshot(settingsDocRef, (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data() as EmissionFactors;
            setEmissionFactors(data);
            localStorage.setItem("eco_factors", JSON.stringify(data));
          } else {
            setEmissionFactors(DEFAULT_EMISSION_FACTORS);
          }
        }, (err) => {
          console.warn("Firestore settings listener failed", err);
        });

        // 3. Listen to completed challenges levels
        const challengeDocRef = doc(db, "challenges", currentUser.uid);
        unsubscribeChallenges = onSnapshot(challengeDocRef, (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data();
            setCompletedChallenges(data.completed || []);
            setClaimedPoints(data.points || 0);
            localStorage.setItem("eco_challenges", JSON.stringify(data.completed || []));
            localStorage.setItem("eco_points", String(data.points || 0));
          } else {
            setCompletedChallenges([]);
            setClaimedPoints(0);
          }
        }, (err) => {
          console.warn("Firestore challenges listener failed", err);
        });

      } catch (err) {
        console.error("Firebase data load setup failed, using offline fallback", err);
        loadLocalData();
      }
    } else {
      // Load offline guest metadata
      loadLocalData();
    }

    return () => {
      unsubscribeActivities();
      unsubscribeSettings();
      unsubscribeChallenges();
    };
  }, [currentUser, authLoading]);

  // AUTOMATE CALCULATION ENGINE & ECO SCORE FOR RECENT LOGS
  const dayFootprints = useMemo<DayFootprint[]>(() => {
    return activities.map((act) => calculateCo2(act, emissionFactors));
  }, [activities, emissionFactors]);

  // AUTOMATED GAMIFIED BADGE CHECKER
  const unlockedBadges = useMemo<string[]>(() => {
    const badges: string[] = [];
    if (activities.length === 0) return badges;

    // Badges definitions checking from calculator.ts / KNOWN_BADGES
    // Badge 1: First steps
    badges.push("first_log");

    // Badge 2: Low carbon hero (total Co2 < 3.5 kg)
    const hasLowCarbonDay = dayFootprints.some((f) => f.totalCO2 <= 3.5);
    if (hasLowCarbonDay) badges.push("low_carbon_hero");

    // Badge 3: Green Commuter (bike or walk, or EV/transit distance > 3)
    const hasGreenCommute = activities.some(
      (a) => (a.transportType === "bicycle_walking" || a.transportType === "ev" || a.transportType === "public_transit") && a.transportDistance >= 3
    );
    if (hasGreenCommute) badges.push("green_commuter");

    // Badge 4: Plant Powered
    const hasDietHero = activities.some((a) => a.foodType === "vegan" || a.foodType === "vegetarian");
    if (hasDietHero) badges.push("plant_powered");

    // Badge 5: Zero Waste Warrior (recycled or compost logged)
    const hasZeroWaste = activities.some((a) => a.wasteType === "recycled" || a.wasteType === "composting");
    if (hasZeroWaste) badges.push("zero_waste_warrior");

    // Badge 6: Challenge MVP
    if (completedChallenges.length > 0) badges.push("point_millionaire");

    // Badge 7: Streak/Eco Guardian (Overall score average > 85)
    let scoreSum = 0;
    dayFootprints.forEach(f => scoreSum += f.ecoScore);
    const averageScore = scoreSum / dayFootprints.length;
    if (averageScore >= 85) badges.push("green_streak");

    return badges;
  }, [dayFootprints, activities, completedChallenges]);

  // TAB CONTENT SELECTOR RENDERER
  const renderTabContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <Dashboard
            activities={activities}
            dayFootprints={dayFootprints}
            recentFootprints={dayFootprints.slice(-7)}
            unlockedBadges={unlockedBadges}
            activeChallengesCount={INITIAL_CHALLENGES.length - completedChallenges.length}
            completedChallengesCount={completedChallenges.length}
            claimedPoints={claimedPoints}
            onNavigate={(tab) => {
              setActiveTab(tab);
              setMobileMenuOpen(false);
            }}
            onOpenLogModal={() => setLogModalOpen(true)}
            emissionFactors={emissionFactors}
          />
        );
      case "activities-logs":
        return (
          <ActivityLogger
            activities={activities}
            dayFootprints={dayFootprints}
            onAddLog={handleAddLog}
            onUpdateLog={handleUpdateLog}
            onDeleteLog={handleDeleteLog}
            emissionFactors={emissionFactors}
            isModalOpen={logModalOpen}
            onCloseModal={() => setLogModalOpen(false)}
          />
        );
      case "calculations-coach":
        return <AICoach activities={activities} dayFootprints={dayFootprints} />;
      case "challenges":
        return (
          <Challenges
            completedChallenges={completedChallenges}
            claimedPoints={claimedPoints}
            onCompleteChallenge={handleCompleteChallenge}
            unlockedBadgesCount={unlockedBadges.length}
          />
        );
      case "pdf-report":
        return (
          <PDFReport
            activities={activities}
            dayFootprints={dayFootprints}
            emissionFactors={emissionFactors}
            userDisplayName={currentUser?.displayName || "Eco Guest"}
          />
        );
      case "settings-admin":
        return (
          <AdminSettings
            emissionFactors={emissionFactors}
            onSaveFactors={handleSaveFactors}
            onResetFactors={handleResetFactors}
          />
        );
      default:
        return null;
    }
  };

  // CRUD OPERATIONS: CREATE
  const handleAddLog = async (activity: Omit<ActivityLog, "id" | "userId">) => {
    const userId = currentUser ? currentUser.uid : "local_guest";
    const payload = { ...activity, userId };

    if (currentUser) {
      try {
        await addDoc(collection(db, "activities"), payload);
      } catch (err) {
        console.error("Firebase add document failed, running local fallback", err);
        const newAct: ActivityLog = { id: Math.random().toString(), ...payload };
        const updated = [...activities, newAct];
        setActivities(updated);
        localStorage.setItem("eco_activities", JSON.stringify(updated));
      }
    } else {
      const newAct: ActivityLog = { id: Math.random().toString(), ...payload };
      const updated = [...activities, newAct];
      setActivities(updated);
      localStorage.setItem("eco_activities", JSON.stringify(updated));
    }
  };

  // CRUD OPERATIONS: UPDATE
  const handleUpdateLog = async (id: string, activity: Partial<ActivityLog>) => {
    if (currentUser && !id.startsWith("0.")) {
      // Non-local random ID
      try {
        await updateDoc(doc(db, "activities", id), activity);
      } catch (err) {
        console.error("Firebase update failed, using local backup", err);
        const updated = activities.map((act) => act.id === id ? { ...act, ...activity } : act);
        setActivities(updated);
        localStorage.setItem("eco_activities", JSON.stringify(updated));
      }
    } else {
      const updated = activities.map((act) => act.id === id ? { ...act, ...activity } : act);
      setActivities(updated);
      localStorage.setItem("eco_activities", JSON.stringify(updated));
    }
  };

  // CRUD OPERATIONS: DELETE
  const handleDeleteLog = async (id: string) => {
    if (currentUser && !id.startsWith("0.")) {
      try {
        await deleteDoc(doc(db, "activities", id));
      } catch (err) {
        console.error("Firebase delete template failed, falling back locally", err);
        const updated = activities.filter((act) => act.id !== id);
        setActivities(updated);
        localStorage.setItem("eco_activities", JSON.stringify(updated));
      }
    } else {
      const updated = activities.filter((act) => act.id !== id);
      setActivities(updated);
      localStorage.setItem("eco_activities", JSON.stringify(updated));
    }
  };

  // ECO CHALLENGES CLAIM HANDLER
  const handleCompleteChallenge = async (id: string, points: number) => {
    const updatedChallenges = [...completedChallenges, id];
    const updatedPoints = claimedPoints + points;

    setCompletedChallenges(updatedChallenges);
    setClaimedPoints(updatedPoints);

    localStorage.setItem("eco_challenges", JSON.stringify(updatedChallenges));
    localStorage.setItem("eco_points", String(updatedPoints));

    if (currentUser) {
      try {
        await setDoc(doc(db, "challenges", currentUser.uid), {
          completed: updatedChallenges,
          points: updatedPoints
        });
      } catch (err) {
        console.error("Firebase save challenges error", err);
      }
    }
  };

  // ADMIN FACTOR SAVE HANDLER
  const handleSaveFactors = async (newFactors: EmissionFactors) => {
    setEmissionFactors(newFactors);
    localStorage.setItem("eco_factors", JSON.stringify(newFactors));

    if (currentUser) {
      try {
        await setDoc(doc(db, "settings", currentUser.uid), newFactors);
      } catch (err) {
        console.error("Firebase save setting factors failed", err);
      }
    }
  };

  const handleResetFactors = () => {
    setEmissionFactors(DEFAULT_EMISSION_FACTORS);
    localStorage.removeItem("eco_factors");
    if (currentUser) {
      deleteDoc(doc(db, "settings", currentUser.uid)).catch(console.error);
    }
  };

  const handleSignOut = () => {
    signOut(auth).then(() => {
      setGuestMode(false);
      setCurrentUser(null);
    });
  };

  // Show beautiful workspace spinner during auth checking phase
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <div className="p-4 bg-emerald-50 text-emerald-800 rounded-full mb-3">
          <Leaf className="w-8 h-8 animate-spin" />
        </div>
        <p className="text-sm font-bold text-slate-700">Connecting to Eco Platform...</p>
      </div>
    );
  }

  // Redirect to Authentication standard screen if not authorised
  if (!currentUser && !guestMode) {
    return <Auth onAuthSuccess={(user) => setCurrentUser(user)} onContinueAsGuest={() => setGuestMode(true)} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row font-sans text-slate-800 antialiased overflow-x-hidden">
      
      {/* MOBILE HEADER RESPONSIVE CONTAINER */}
      <header className="lg:hidden bg-emerald-900 text-white p-4 flex justify-between items-center z-40 shrink-0 print:hidden">
        <div className="flex items-center gap-2">
          <Leaf className="w-5 h-5 text-emerald-300 animate-pulse" />
          <span className="font-extrabold tracking-tight text-sm font-sans">EcoFootprint</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setLogModalOpen(true)}
            className="p-1 px-3 bg-emerald-800 text-white hover:bg-emerald-700 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Log</span>
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-emerald-100 hover:text-white rounded-xl transition cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* DUAL MODE SIDEBAR NAVIGATION UTILITIES */}
      <aside className={`fixed inset-y-0 left-0 bg-emerald-950 text-slate-100 w-64 p-6 z-30 transform ${
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      } lg:relative lg:translate-x-0 transition-transform duration-300 ease-in-out flex flex-col justify-between shrink-0 border-r border-emerald-900/60 shadow-xl shadow-emerald-950/20 print:hidden`}>
        <div className="space-y-8">
          {/* Logo Brand */}
          <div className="flex items-center gap-2.5 pb-2 border-b border-emerald-900/40">
            <span className="p-2 bg-emerald-900/50 text-emerald-400 rounded-2xl border border-emerald-800/40">
              <Leaf className="w-5 h-5" />
            </span>
            <div>
              <span className="block text-base font-black tracking-tight font-sans text-white leading-none">
                EcoFootprint
              </span>
              <span className="block text-[9px] font-bold text-emerald-400/80 uppercase tracking-wider mt-1">
                AI Sustainability Link
              </span>
            </div>
          </div>

          {/* User Citation Card */}
          <div className="bg-emerald-900/30 border border-emerald-900/40 p-4 rounded-2xl space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[9px] text-emerald-400 uppercase tracking-wider font-bold">
                Logged Active Profile
              </span>
              <span className={`w-1.5 h-1.5 rounded-full ${currentUser ? "bg-emerald-400" : "bg-amber-400"}`} />
            </div>
            <div>
              <span className="block text-xs font-extrabold text-white line-clamp-1">
                {currentUser?.displayName || "Guest Explorer"}
              </span>
              <span className="block text-[10px] text-emerald-250/70 line-clamp-1 mt-0.5">
                {currentUser?.email || "purely local mode fallback"}
              </span>
            </div>
          </div>

          {/* Sidebar Menu elements */}
          <nav className="space-y-1.5">
            <button
              onClick={() => { setActiveTab("dashboard"); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "dashboard" ? "bg-emerald-800 text-white shadow-md shadow-emerald-990/10" : "text-emerald-100 hover:bg-emerald-900/40 hover:text-white"
              }`}
            >
              <LayoutDashboard className="w-4 h-4 shrink-0 font-bold" />
              <span>Dashboard Summary</span>
            </button>

            <button
              onClick={() => { setActiveTab("activities-logs"); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "activities-logs" ? "bg-emerald-800 text-white shadow-md" : "text-emerald-100 hover:bg-emerald-900/40 hover:text-white"
              }`}
            >
              <Calendar className="w-4 h-4 shrink-0" />
              <span>Daily Activity Logs</span>
            </button>

            <button
              onClick={() => { setActiveTab("calculations-coach"); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "calculations-coach" ? "bg-emerald-800 text-white shadow-md" : "text-emerald-100 hover:bg-emerald-900/40 hover:text-white"
              }`}
            >
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>AI Coach Assistant</span>
            </button>

            <button
              onClick={() => { setActiveTab("challenges"); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "challenges" ? "bg-emerald-800 text-white shadow-md" : "text-emerald-100 hover:bg-emerald-900/40 hover:text-white"
              }`}
            >
              <Award className="w-4 h-4 shrink-0" />
              <span>Daily Eco Challenges</span>
            </button>

            <button
              onClick={() => { setActiveTab("pdf-report"); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "pdf-report" ? "bg-emerald-800 text-white shadow-md" : "text-emerald-100 hover:bg-emerald-900/40 hover:text-white"
              }`}
            >
              <FileText className="w-4 h-4 shrink-0" />
              <span>Sustainability Report</span>
            </button>

            <button
              onClick={() => { setActiveTab("settings-admin"); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "settings-admin" ? "bg-emerald-800 text-white shadow-md" : "text-emerald-100 hover:bg-emerald-900/40 hover:text-white"
              }`}
            >
              <Settings className="w-4 h-4 shrink-0" />
              <span>Admin Panel</span>
            </button>
          </nav>
        </div>

        {/* Sidebar Log Out action */}
        <div className="pt-6 border-t border-emerald-900/40">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-emerald-300 hover:text-white hover:bg-emerald-900/40 rounded-xl text-xs font-bold transition cursor-pointer"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Sign Out Session</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTAINER PANEL */}
      <main className="flex-1 p-4 sm:p-8 lg:p-10 max-w-6xl mx-auto overflow-y-auto space-y-6 print:p-0 print:border-none print:shadow-none min-h-screen">
        {renderTabContent()}
      </main>
    </div>
  );
}
