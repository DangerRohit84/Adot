"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

export default function TeacherDashboard() {
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

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl p-8 lg:p-10 text-white"
        style={{ background: "linear-gradient(135deg, #059669 0%, #10b981 50%, #34d399 100%)" }}>
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -right-24 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10">
          <h1 className="text-3xl font-extrabold mb-2 text-left">Welcome, Teacher</h1>
          <p className="text-white/70 text-left">View your timetable and attendance records</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {[
          { label: "Today's Sessions", value: sessions.length, color: "from-emerald-500 to-emerald-600" },
          { label: "Total Students", value: "—", color: "from-blue-500 to-blue-600" },
          { label: "Attendance Rate", value: "—", color: "from-violet-500 to-violet-600" },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 border border-slate-100 card-hover">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-slate-500">{s.label}</span>
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${s.color} flex items-center justify-center`}>
                <span className="text-white text-sm">★</span>
              </div>
            </div>
            <div className="text-2xl font-extrabold text-slate-900">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Recent Sessions */}
      <div className="bg-white rounded-2xl border border-slate-100">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 text-left">Recent Attendance Sessions</h2>
        </div>
        <div className="p-6">
          {loading ? (
            <p className="text-sm text-slate-500">Loading...</p>
          ) : sessions.length === 0 ? (
            <div className="text-center py-12">
              <span className="text-4xl">📋</span>
              <p className="text-slate-500 mt-3 font-medium">No sessions yet</p>
              <p className="text-sm text-slate-400 mt-1">Sessions will appear here once started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.map((s: { id: string; subject?: string; status: string; created_at: string }, i: number) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl hover:bg-slate-50 transition-colors border border-slate-100">
                  <div>
                    <p className="font-semibold text-slate-900 text-left">{s.subject || "Session"}</p>
                    <p className="text-xs text-slate-500 text-left">{new Date(s.created_at).toLocaleString()}</p>
                  </div>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${s.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                    {s.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
