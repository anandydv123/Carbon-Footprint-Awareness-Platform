import React, { useState } from "react";
import { auth, db } from "../firebase";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile,
  signInAnonymously 
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { Leaf, Lock, Mail, User, AlertCircle, ArrowRight } from "lucide-react";

interface AuthProps {
  onAuthSuccess: (user: any) => void;
  onContinueAsGuest: () => void;
}

export default function Auth({ onAuthSuccess, onContinueAsGuest }: AuthProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [operationNotAllowed, setOperationNotAllowed] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setOperationNotAllowed(false);
    setLoading(true);

    try {
      if (isLogin) {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        onAuthSuccess(userCredential.user);
      } else {
        if (!name.trim()) {
          throw new Error("Please enter your name.");
        }
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, {
          displayName: name
        });
        
        // Save initial user profile
        await setDoc(doc(db, "users", userCredential.user.uid), {
          uid: userCredential.user.uid,
          name: name,
          email: email,
          createdAt: new Date().toISOString()
        });

        onAuthSuccess(userCredential.user);
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      let errMsg = err.message;
      if (err.code === "auth/operation-not-allowed" || err.message?.includes("operation-not-allowed")) {
        setOperationNotAllowed(true);
        errMsg = "Email/Password Authentication is not enabled in your Firebase console. See below on how to enable it, or click 'Bypass with Guest Mode' to use local store.";
      } else if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password") {
        errMsg = "Invalid email or password.";
      } else if (err.code === "auth/email-already-in-use") {
        errMsg = "This email is already registered.";
      } else if (err.code === "auth/weak-password") {
        errMsg = "Password should be at least 6 characters.";
      } else if (err.code === "auth/invalid-email") {
        errMsg = "Please enter a valid email address.";
      }
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setError("");
    setOperationNotAllowed(false);
    setLoading(true);
    try {
      // Allow browser guest mode as standard anonymous auth or client-side storage fallback!
      // To guarantee no workspace restriction failures, we can standard-authenticate anonymously or just allow local offline state.
      // Let's authenticate anonymously - this counts as a real login!
      const userCredential = await signInAnonymously(auth);
      await updateProfile(userCredential.user, {
        displayName: "Eco Guest"
      });
      onAuthSuccess(userCredential.user);
    } catch (err: any) {
      console.warn("Firebase anonymous authentication failed, continuing as purely local guest.", err);
      onContinueAsGuest();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="auth_container" className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div id="auth_card" className="w-full max-w-md bg-white rounded-2xl border border-slate-100 shadow-xl overflow-hidden shadow-emerald-950/5">
        <div className="bg-emerald-800 p-8 text-white relative">
          <div className="absolute right-6 top-6 bg-emerald-700/50 p-2 rounded-full text-emerald-100">
            <Leaf className="w-6 h-6 animate-pulse" />
          </div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold uppercase tracking-widest bg-emerald-700 text-emerald-100 px-2 py-0.5 rounded-full">
              Sustain
            </span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight font-sans">
            EcoFootprint
          </h2>
          <p className="text-emerald-100/80 text-sm mt-1">
            Track, calculate, and neutralize your carbon footprint with AI.
          </p>
        </div>

        <div className="p-8">
          {error && !operationNotAllowed && (
            <div id="auth_error" className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {operationNotAllowed && (
            <div id="auth_op_not_allowed_guide" className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-xl text-slate-800 text-xs space-y-2.5">
              <div className="flex gap-2 text-amber-800 font-bold items-center text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Auth Provider Disabled</span>
              </div>
              <p className="text-slate-600 leading-relaxed font-medium">
                The <strong>Email/Password</strong> authentication method is currently disabled in your Firebase configuration. You can enable it by following these quick steps:
              </p>
              <ol className="list-decimal pl-4 text-slate-600 space-y-1 leading-relaxed">
                <li>Go to the <a href="https://console.firebase.google.com" target="_blank" rel="noopener noreferrer" className="text-emerald-800 hover:underline font-bold">Firebase Console</a> and select your project.</li>
                <li>Go to <strong>Build</strong> &gt; <strong>Authentication</strong> &gt; <strong>Sign-in method</strong>.</li>
                <li>Click <strong>Add new provider</strong> (or edit), choose <strong>Email/Password</strong>, select <strong>Enable</strong>, and click <strong>Save</strong>.</li>
              </ol>
              <div className="pt-2 border-t border-amber-200/50 flex flex-col gap-1.5">
                <p className="text-slate-500 font-medium font-sans">
                  Don't want to configure keys now? Explore fully with a local profile instead:
                </p>
                <button
                  type="button"
                  onClick={onContinueAsGuest}
                  className="w-full py-2 bg-emerald-800 hover:bg-emerald-900 active:bg-emerald-950 text-white text-xs font-bold rounded-lg transition-colors text-center cursor-pointer shadow-md shadow-emerald-950/10"
                >
                  Bypass & Continue as Guest
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition text-sm text-slate-800"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition text-sm text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition text-sm text-slate-800"
                />
              </div>
            </div>

            <button
              id="auth_submit_btn"
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-900 active:bg-emerald-950 text-white rounded-xl font-medium shadow-md shadow-emerald-950/10 transition flex items-center justify-center gap-2 text-sm cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              ) : isLogin ? (
                "Sign In"
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <div className="relative my-6 text-center">
            <span className="absolute inset-y-1/2 left-0 right-0 border-t border-slate-100 -z-10" />
            <span className="bg-white px-3 text-xs text-slate-400 uppercase tracking-widest font-medium">
              Or
            </span>
          </div>

          <button
            id="guest_login_btn"
            onClick={handleGuestLogin}
            disabled={loading}
            className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 active:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl font-medium transition flex items-center justify-center gap-2 text-sm cursor-pointer disabled:opacity-50"
          >
            <span>Continue as Guest</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <p className="text-center text-xs text-slate-500 mt-6">
            {isLogin ? "Don't have an account yet?" : "Already have an account?"}{" "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-emerald-700 hover:underline font-bold focus:outline-none ml-1 cursor-pointer"
            >
              {isLogin ? "Join now" : "Log in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
