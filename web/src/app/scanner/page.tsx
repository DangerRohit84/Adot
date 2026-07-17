"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

export default function ScannerDashboard() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchSessions(); }, []);

  const fetchSessions = async () => {
    try {
      const { data } = await api.get("/attendance/sessions");
      setSessions(data.data || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const activeSessions = sessions.filter((s: { status: string }) => s.status === "active");

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl p-8 lg:p-10 text-white"
        style={{ background: "linear-gradient(135deg, #7c3aed 0%, #8b5cf6 50%, #a78bfa 100%)" }}>
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -right-24 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10">
          <h1 className="text-3xl font-extrabold mb-2 text-left">Scanner Dashboard</h1>
          <p className="text-white/70 text-left">Select a session to start scanning QR codes</p>
        </div>
      </div>

      {/* Active Sessions */}
      <div className="bg-white rounded-2xl border border-slate-100">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 text-left">Active Sessions</h2>
          <p className="text-sm text-slate-500 text-left mt-1">Select a session to start scanning</p>
        </div>
        <div className="p-6">
          {loading ? (
            <p className="text-sm text-slate-500">Loading...</p>
          ) : activeSessions.length === 0 ? (
            <div className="text-center py-12">
              <span className="text-4xl">📱</span>
              <p className="text-slate-500 mt-3 font-medium">No active sessions</p>
              <p className="text-sm text-slate-400 mt-1">Ask a teacher to start a session first</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeSessions.map((s: { id: string; subject?: string; section?: string; created_at: string }, i: number) => (
                <div key={i} className="p-5 rounded-2xl border border-emerald-200 bg-emerald-50 hover:shadow-lg transition-all cursor-pointer">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-xs font-semibold text-emerald-700 uppercase">Active</span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-left">{s.subject || "Session"}</h3>
                  <p className="text-sm text-slate-600 text-left mt-1">{s.section || "—"}</p>
                  <p className="text-xs text-slate-400 mt-3 text-left">Started: {new Date(s.created_at).toLocaleTimeString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100">
        <h2 className="text-lg font-bold text-slate-900 mb-4 text-left">How to Scan</h2>
        <div className="space-y-3">
          {[
            { step: 1, text: "Ask teacher to start an attendance session" },
            { step: 2, text: "Select the active session from above" },
            { step: 3, text: "Point camera at student's QR code" },
            { step: 4, text: "Green flash = Present, Yellow = Duplicate" },
          ].map((item) => (
            <div key={item.step} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
              <div className="w-8 h-8 bg-violet-100 text-violet-700 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                {item.step}
              </div>
              <span className="text-sm text-slate-700 text-left">{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
