"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

export default function TeacherDashboard() {
  const [sessions, setSessions] = useState([]);
  const [todayTimetable, setTodayTimetable] = useState([]);
  const [loading, setLoading] = useState(true);

  const now = new Date();
  const dayMap: Record<string, string> = { Monday: "mon", Tuesday: "tue", Wednesday: "wed", Thursday: "thu", Friday: "fri", Saturday: "sat" };
  const currentDayFull = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][now.getDay()];
  const currentDayShort = dayMap[currentDayFull] || "";
  const currentTime = now.toTimeString().slice(0, 5);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [sessionsRes, timetableRes] = await Promise.all([
        api.get("/attendance/sessions"),
        api.get("/timetable")
      ]);
      setSessions(sessionsRes.data.data || []);
      const allTimetable = timetableRes.data.data || [];
      setTodayTimetable(allTimetable.filter((t: any) => t.day_of_week === currentDayShort));
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const currentClass: any = todayTimetable.find((t: any) =>
    t.start_time?.slice(0,5) <= currentTime && t.end_time?.slice(0,5) >= currentTime
  );
  const nextClass: any = todayTimetable.find((t: any) => t.start_time?.slice(0,5) > currentTime);

  const activeClass: any = currentClass || nextClass;

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
          <p className="text-white/70 text-left">{currentDayFull} &middot; View your timetable and attendance records</p>
        </div>
      </div>

      {/* Current / Next Class */}
      {!loading && activeClass && (
        <div className={`rounded-2xl p-6 text-white ${
          currentClass ? 'bg-gradient-to-br from-emerald-500 to-emerald-600' : 'bg-gradient-to-br from-blue-500 to-blue-600'
        }`}>
          <span className="text-white/80 text-sm font-medium">{currentClass ? '🟢 Now Teaching' : '🔵 Upcoming Class'}</span>
          <h2 className="text-xl font-extrabold mt-1">{activeClass.subject_name}</h2>
          <div className="mt-2 flex flex-wrap gap-3 text-sm text-white/90">
            <span>👥 Section: {activeClass.section_name}</span>
            {activeClass.room_number && <span>📍 Room: {activeClass.room_number}</span>}
            <span>🕐 {activeClass.start_time?.slice(0,5)} - {activeClass.end_time?.slice(0,5)}</span>
          </div>
        </div>
      )}

      {/* Today's Schedule */}
      {!loading && todayTimetable.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900 text-left">Today&apos;s Schedule</h2>
          </div>
          <div className="p-6">
            <div className="space-y-2">
              {todayTimetable.map((t: any, i: number) => {
                const isCurrent = currentClass && t.id === currentClass.id;
                const isPast = t.end_time?.slice(0,5) < currentTime;
                return (
                  <div key={i} className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${
                    isCurrent ? 'bg-emerald-50 border-emerald-200' : isPast ? 'bg-slate-50 border-slate-100 opacity-60' : 'border-slate-100 hover:bg-slate-50'
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold ${
                        isCurrent ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                      }`}>{t.start_period}</div>
                      <div>
                        <p className="font-semibold text-slate-900 text-left text-sm">{t.subject_name}</p>
                        <p className="text-xs text-slate-500 text-left">{t.section_name} &middot; Period {t.start_period}-{t.end_period}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-slate-700">{t.start_time?.slice(0,5)} - {t.end_time?.slice(0,5)}</p>
                      {t.room_number && <p className="text-xs text-slate-500">📍 {t.room_number}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {[
          { label: "Today's Sessions", value: sessions.length, color: "from-emerald-500 to-emerald-600" },
          { label: "Classes Today", value: todayTimetable.length, color: "from-blue-500 to-blue-600" },
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
              {sessions.map((s: { id: string; subject?: string; status: string; created_at: string; room_number?: string }, i: number) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl hover:bg-slate-50 transition-colors border border-slate-100">
                  <div>
                    <p className="font-semibold text-slate-900 text-left">{s.subject || "Session"}</p>
                    <p className="text-xs text-slate-500 text-left">{new Date(s.created_at).toLocaleString()}{s.room_number ? ` · 📍 ${s.room_number}` : ''}</p>
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
