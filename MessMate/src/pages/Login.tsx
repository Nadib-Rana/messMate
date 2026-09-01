import { useState } from "react";
import { Utensils } from "lucide-react";
import { api } from "../services/api";
import { AuthForm } from "./components/AuthForm";

interface Props {
  onLogin: (user?: any) => void;
}

export default function Login({ onLogin }: Props) {
  const [tab, setTab] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
      const res = await api.login({ identifier: email.trim(), password: password.trim() });
      if (res && res.accessToken) {
        localStorage.setItem("messmate_jwt_token", res.accessToken);
        if (res.refreshToken) localStorage.setItem("messmate_refresh_token", res.refreshToken);
        onLogin(res.user);
      } else {
        setError("Login failed. No response from server.");
      }
    } catch (err: any) {
      setError(err.message || "Invalid email or password.");
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
      const res = await api.register({ email: email.trim(), password: password.trim(), firstName: name.trim(), phoneNumber: phone.trim() });
      if (res && res.accessToken) {
        localStorage.setItem("messmate_jwt_token", res.accessToken);
        onLogin(res.user);
      } else {
        setTab("login");
        alert("Registration successful! Please sign in.");
      }
    } catch (err: any) {
      setError(err.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4">
      <div className="relative w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-indigo-600 rounded-2xl mb-4 shadow-lg shadow-indigo-500/30">
            <Utensils size={24} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-display)" }}>MessMate</h1>
          <p className="text-slate-400 text-sm mt-1">Multi-House Mess Management SaaS</p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl">
          <div className="flex bg-white/5 rounded-xl p-1 mb-6 border border-white/5">
            <button
              onClick={() => { setTab("login"); setError(""); }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${tab === "login" ? "bg-indigo-600 text-white shadow" : "text-slate-400 hover:text-white"}`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setTab("register"); setError(""); }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${tab === "register" ? "bg-indigo-600 text-white shadow" : "text-slate-400 hover:text-white"}`}
            >
              Register
            </button>
          </div>

          <AuthForm
            tab={tab}
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            showPass={showPass}
            setShowPass={setShowPass}
            name={name}
            setName={setName}
            phone={phone}
            setPhone={setPhone}
            loading={loading}
            error={error}
            onSignIn={handleSignIn}
            onRegister={handleRegister}
          />
        </div>
      </div>
    </div>
  );
}
