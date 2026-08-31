import { useState } from "react";
import { Utensils, Eye, EyeOff, AlertCircle } from "lucide-react";
import { api } from "../services/api";

interface Props {
  onLogin: (user?: any) => void;
}

export default function Login({ onLogin }: Props) {
  const [tab, setTab] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("nadib@messmate.com");
  const [password, setPassword] = useState("messmate123");
  const [showPass, setShowPass] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignIn = async () => {
    setError("");
    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.login({
        identifier: email.trim(),
        password: password.trim(),
      });

      if (res && res.accessToken) {
        localStorage.setItem("messmate_jwt_token", res.accessToken);
        if (res.refreshToken) {
          localStorage.setItem("messmate_refresh_token", res.refreshToken);
        }
        onLogin(res.user);
      } else {
        // Fallback for dev / seed matching
        onLogin();
      }
    } catch (err: any) {
      console.error("Login error:", err);
      if (err.message && err.message.includes("Invalid")) {
        setError("Invalid email or password! Please check your credentials.");
      } else {
        // If backend is unreachable or demo mode, fallback to seed check
        if (password === "messmate123" || password === "admin12345") {
          onLogin();
        } else {
          setError(err.message || "Login failed. Please check your credentials.");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    setError("");
    if (!email.trim() || !password.trim() || !name.trim()) {
      setError("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.register({
        email: email.trim(),
        password: password.trim(),
        firstName: name.trim(),
        phoneNumber: phone.trim(),
      });

      if (res && res.accessToken) {
        localStorage.setItem("messmate_jwt_token", res.accessToken);
        onLogin(res.user);
      } else {
        setTab("login");
        setError("");
        alert("Registration successful! Please sign in with your password.");
      }
    } catch (err: any) {
      setError(err.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-indigo-600 rounded-2xl mb-4 shadow-lg shadow-indigo-500/30">
            <Utensils size={24} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>MessMate</h1>
          <p className="text-slate-400 text-sm mt-1">Multi-House Mess Management SaaS</p>
        </div>

        {/* Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl">
          {/* Tabs */}
          <div className="flex gap-1 bg-black/20 p-1 rounded-xl mb-6">
            {(["login", "register"] as const).map(t => (
              <button
                key={t}
                onClick={() => { setTab(t); setError(""); }}
                className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-all capitalize
                  ${tab === t ? "bg-white text-slate-900" : "text-slate-400 hover:text-white"}`}
              >
                {t === "login" ? "Sign In" : "Create Account"}
              </button>
            ))}
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-xl flex items-center gap-2 text-red-300 text-xs">
              <AlertCircle size={16} className="shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {tab === "login" ? (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Email or Phone</label>
                <input
                  type="text"
                  placeholder="nadib@messmate.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm rounded-lg bg-white/10 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm rounded-lg bg-white/10 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(s => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                  >
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 text-slate-400 cursor-pointer">
                  <input type="checkbox" className="rounded border-white/20 bg-white/10" defaultChecked />
                  Remember me
                </label>
                <button type="button" className="text-indigo-400 hover:text-indigo-300 transition-colors">Forgot password?</button>
              </div>

              <button
                type="button"
                onClick={handleSignIn}
                disabled={loading}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-lg text-sm transition-all shadow-lg shadow-indigo-600/30"
              >
                {loading ? "Authenticating..." : "Sign In"}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Full Name</label>
                <input
                  type="text"
                  placeholder="Nadib Rana"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm rounded-lg bg-white/10 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Email</label>
                <input
                  type="email"
                  placeholder="nadib@messmate.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm rounded-lg bg-white/10 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Phone</label>
                <input
                  type="tel"
                  placeholder="01711-000001"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm rounded-lg bg-white/10 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm rounded-lg bg-white/10 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <button
                type="button"
                onClick={handleRegister}
                disabled={loading}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-lg text-sm transition-all"
              >
                {loading ? "Registering..." : "Create Account"}
              </button>
            </div>
          )}

          <div className="mt-4 pt-4 border-t border-white/10 text-center">
            <p className="text-xs text-slate-400">Default Password: <code className="bg-white/10 px-1.5 py-0.5 rounded text-indigo-300">messmate123</code></p>
          </div>
        </div>

        <p className="text-center text-slate-600 text-xs mt-4">
          Multi-House Mess Management SaaS · Bangladesh
        </p>
      </div>
    </div>
  );
}
