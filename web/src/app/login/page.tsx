"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", { email, password });
      if (data.success) {
        localStorage.setItem("token", data.data.token);
        localStorage.setItem("user", JSON.stringify(data.data.user));
        const role = data.data.user.role;
        const routes: Record<string, string> = {
          super_admin: "/admin", college_admin: "/college",
          hod: "/hod", teacher: "/teacher", scanner: "/scanner",
        };
        router.push(routes[role] || "/login");
      }
    } catch (err: unknown) {
      const msg = err instanceof Object && "response" in err
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
        : "Login failed";
      setError(msg || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: "📱", title: "QR Scan", desc: "Instant check-in" },
    { icon: "📊", title: "Live Data", desc: "Real-time reports" },
    { icon: "⏰", title: "Timetable", desc: "Auto-mapping" },
    { icon: "🔒", title: "Secure", desc: "Role-based auth" },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Hero */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-float" />
          <div className="absolute top-1/3 -right-20 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />
          <div className="absolute -bottom-32 left-1/3 w-80 h-80 bg-white/5 rounded-full blur-3xl animate-float" style={{ animationDelay: "4s" }} />
        </div>

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        {/* Content */}
        <div className="relative z-10 w-full flex flex-col">
          {/* Logo */}
          <div className={`px-16 pt-16 ${mounted ? "animate-slide-in-left" : "opacity-0"}`}>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/15 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20">
                <span className="text-2xl">✓</span>
              </div>
              <span className="text-2xl font-bold tracking-tight text-white">AttendEase</span>
            </div>
          </div>

          {/* Main text */}
          <div className="flex-1 flex flex-col justify-center px-16 py-12">
            <div className={`max-w-lg ${mounted ? "animate-fade-in-up" : "opacity-0"}`} style={{ animationDelay: "200ms" }}>
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/15 mb-8">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-white/80">Smart Attendance Platform</span>
              </div>

              {/* Heading */}
              <h1 className="text-6xl font-extrabold leading-[1.08] mb-6 tracking-tight text-white">
                College
                <br />
                Attendance
                <br />
                <span className="bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
                  Reimagined
                </span>
              </h1>

              {/* Description */}
              <p className="text-lg text-white/60 leading-relaxed max-w-md">
                QR code scanning, real-time tracking, timetable mapping, and instant reports — all in one powerful platform.
              </p>
            </div>

            {/* Feature cards */}
            <div className={`mt-10 grid grid-cols-2 gap-4 max-w-lg ${mounted ? "animate-fade-in-up" : "opacity-0"}`} style={{ animationDelay: "400ms" }}>
              {features.map((f, i) => (
                <div key={i} className="glass-card rounded-2xl p-4 group hover:bg-white/15 transition-all duration-300 cursor-default">
                  <div className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-300">{f.icon}</div>
                  <div className="font-semibold text-sm text-white">{f.title}</div>
                  <div className="text-xs text-white/50 mt-0.5">{f.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="px-16 pb-12">
            <div className="flex items-center gap-4 text-white/30 text-sm">
              <div className="h-px flex-1 bg-white/10" />
              <span>Trusted by colleges across the country</span>
              <div className="h-px flex-1 bg-white/10" />
            </div>
          </div>
        </div>

        {/* Floating shapes */}
        <div className="absolute top-16 right-16 w-16 h-16 border border-white/20 rounded-2xl rotate-12 animate-float" style={{ animationDelay: "1s" }} />
        <div className="absolute bottom-40 right-24 w-10 h-10 border border-white/15 rounded-full animate-float" style={{ animationDelay: "3s" }} />
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-[45%] flex items-center justify-center p-8 bg-white relative">
        {/* Subtle dot pattern */}
        <div className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, #6366f1 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />

        <div className={`w-full max-w-[380px] relative z-10 ${mounted ? "animate-fade-in-scale" : "opacity-0"}`} style={{ animationDelay: "300ms" }}>
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10 justify-center">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <span className="text-2xl text-white">✓</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">AttendEase</span>
          </div>

          {/* Welcome text */}
          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2">Welcome back</h2>
            <p className="text-gray-500 text-lg">Sign in to your account</p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 animate-fade-in-up">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-red-600 font-bold">✕</span>
              </div>
              <span className="text-sm text-red-700 font-medium">{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 block text-left">Email address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="text-gray-400">@</span>
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3.5 rounded-2xl text-gray-900 placeholder-gray-400 input-elegant text-[15px]"
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 block text-left">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="text-gray-400">🔑</span>
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3.5 rounded-2xl text-gray-900 placeholder-gray-400 input-elegant text-[15px]"
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                >
                  <span>{showPassword ? "🙈" : "👁️"}</span>
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 btn-primary text-white font-bold rounded-2xl text-[15px] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2.5 shadow-lg shadow-indigo-200 cursor-pointer"
              >
                {loading ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in
                    <span>→</span>
                  </>
                )}
              </button>
            </div>
          </form>

          <p className="mt-8 text-center lg:text-left text-sm text-gray-400">
            Contact your HOD for account credentials
          </p>
        </div>
      </div>
    </div>
  );
}
