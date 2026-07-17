"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

export default function CollegeDashboard() {
  const [stats, setStats] = useState({ departments: 0, sections: 0, students: 0, teachers: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchStats(); }, []);

  const fetchStats = async () => {
    try {
      const [d, s, st, t] = await Promise.all([
        api.get("/departments"), api.get("/sections"),
        api.get("/students"), api.get("/users?role=teacher"),
      ]);
      setStats({
        departments: d.data.data?.length || 0,
        sections: s.data.data?.length || 0,
        students: st.data.data?.length || 0,
        teachers: t.data.data?.length || 0,
      });
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const cards = [
    { label: "Departments", value: stats.departments, color: "from-blue-500 to-blue-600", bg: "bg-blue-50", ring: "ring-blue-100" },
    { label: "Sections", value: stats.sections, color: "from-violet-500 to-violet-600", bg: "bg-violet-50", ring: "ring-violet-100" },
    { label: "Students", value: stats.students, color: "from-emerald-500 to-emerald-600", bg: "bg-emerald-50", ring: "ring-emerald-100" },
    { label: "Teachers", value: stats.teachers, color: "from-amber-500 to-orange-500", bg: "bg-amber-50", ring: "ring-amber-100" },
  ];

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl p-8 lg:p-10 text-white animate-fade-in-up"
        style={{ background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 40%, #a855f7 70%, #d946ef 100%)" }}>
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -right-24 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-16 -left-16 w-60 h-60 bg-white/5 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/15 backdrop-blur-sm rounded-full border border-white/20 mb-6">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-xs font-medium text-white/80">System Active</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-extrabold mb-3 tracking-tight text-left">College Dashboard</h1>
          <p className="text-white/70 text-lg text-left">Manage departments, teachers, students, and timetables</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {cards.map((c, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 border border-slate-100 card-hover animate-fade-in-up"
            style={{ animationDelay: `${i * 80}ms` }}>
            <div className="flex items-center justify-between mb-5">
              <div className={`w-12 h-12 ${c.bg} ring-4 ${c.ring} rounded-2xl flex items-center justify-center`}>
                <span className="text-xl font-extrabold text-slate-700">{c.value}</span>
              </div>
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${c.color} flex items-center justify-center`}>
                <span className="text-white text-sm">★</span>
              </div>
            </div>
            <div className="text-left">
              <div className="text-3xl font-extrabold text-slate-900 tracking-tight">{c.value}</div>
              <div className="text-sm text-slate-500 mt-1 font-medium">{c.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100">
        <h2 className="text-lg font-bold text-slate-900 mb-5 text-left">Quick Actions</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: "Departments", href: "/hod/departments", color: "from-blue-500 to-blue-600" },
            { label: "Sections", href: "/hod/sections", color: "from-violet-500 to-violet-600" },
            { label: "Teachers", href: "/hod/teachers", color: "from-emerald-500 to-emerald-600" },
            { label: "Students", href: "/hod/students", color: "from-amber-500 to-orange-500" },
          ].map((a, i) => (
            <a key={i} href={a.href}
              className={`group relative overflow-hidden bg-gradient-to-br ${a.color} text-white rounded-2xl p-4 font-semibold text-sm flex items-center gap-3 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 cursor-pointer`}>
              <span className="text-left">{a.label}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
