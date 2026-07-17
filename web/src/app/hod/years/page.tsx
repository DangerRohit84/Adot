"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Section } from "@/lib/types";

const YEAR_LABELS: Record<number, string> = { 1: "1st Year", 2: "2nd Year", 3: "3rd Year", 4: "4th Year" };
const YEAR_COLORS: Record<number, string> = {
  1: "from-emerald-400 to-emerald-600",
  2: "from-blue-400 to-blue-600",
  3: "from-purple-400 to-purple-600",
  4: "from-amber-400 to-orange-500",
};
const YEAR_BG: Record<number, string> = {
  1: "bg-emerald-50 border-emerald-200",
  2: "bg-blue-50 border-blue-200",
  3: "bg-purple-50 border-purple-200",
  4: "bg-amber-50 border-amber-200",
};

export default function YearsPage() {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [promoting, setPromoting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => { fetchSections(); }, []);

  const fetchSections = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const { data } = await api.get(`/sections?department_id=${user.department_id}`);
      setSections(data.data || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const getSectionsByYear = (year: number) => sections.filter(s => s.year === year);
  const activeYears = [...new Set(sections.map(s => s.year))].sort();
  const maxYear = Math.max(...activeYears, 0);

  const handlePromote = async (fromYear: number) => {
    if (fromYear >= 4) {
      setError("Cannot promote beyond 4th year. These students will graduate.");
      return;
    }
    if (!confirm(`Promote all Year ${fromYear} students to Year ${fromYear + 1}?\n\nThis will:\n- Create new sections for Year ${fromYear + 1}\n- Move all students to new sections\n- Archive Year ${fromYear} sections`)) return;

    setPromoting(true);
    setError("");
    setSuccess("");
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const { data } = await api.post("/sections/promote", {
        department_id: user.department_id,
        from_year: fromYear,
        to_year: fromYear + 1,
      });
      setSuccess(data.message);
      fetchSections();
    } catch (e: any) {
      setError(e.response?.data?.message || "Failed to promote students");
    }
    setPromoting(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Year Management</h1>
        <p className="text-gray-500 mt-1">Manage academic years and promote students</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{error}</div>
      )}
      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm">{success}</div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {Array(4).fill(0).map((_, i) => <div key={i} className="h-48 bg-white rounded-2xl border border-gray-100 animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[1, 2, 3, 4].map(year => {
            const yearSections = getSectionsByYear(year);
            const hasStudents = yearSections.length > 0;
            const canPromote = year < 4 && hasStudents;

            return (
              <div key={year} className={`bg-white rounded-2xl border border-gray-100 overflow-hidden ${!hasStudents ? "opacity-60" : ""}`}>
                <div className={`bg-gradient-to-r ${YEAR_COLORS[year]} p-5 text-white`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold">{YEAR_LABELS[year]}</h2>
                      <p className="text-white/70 text-sm mt-1">{yearSections.length} section{yearSections.length !== 1 ? "s" : ""}</p>
                    </div>
                    <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                      <span className="text-2xl font-extrabold">{year}</span>
                    </div>
                  </div>
                </div>
                <div className="p-5">
                  {yearSections.length > 0 ? (
                    <div className="space-y-2 mb-4">
                      {yearSections.map(s => (
                        <div key={s.id} className={`flex items-center justify-between px-3 py-2 rounded-xl border ${YEAR_BG[year]}`}>
                          <span className="font-medium text-gray-800 text-sm">{s.name}</span>
                          <span className="text-xs text-gray-500">Sem {s.semester}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400 text-sm mb-4">No sections</p>
                  )}

                  {canPromote && (
                    <button
                      onClick={() => handlePromote(year)}
                      disabled={promoting}
                      className={`w-full py-2.5 rounded-xl font-medium text-sm text-white bg-gradient-to-r ${YEAR_COLORS[year]} hover:opacity-90 transition-opacity disabled:opacity-50`}
                    >
                      {promoting ? "Promoting..." : `Promote to Year ${year + 1}`}
                    </button>
                  )}
                  {year === 4 && hasStudents && (
                    <div className="text-center py-2 bg-amber-50 rounded-xl border border-amber-200">
                      <span className="text-amber-700 text-sm font-medium">🎓 Graduating Year — Archive when complete</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="bg-white rounded-2xl p-6 border border-gray-100">
        <h2 className="text-lg font-bold text-gray-900 mb-3">How Year Promotion Works</h2>
        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex gap-3">
            <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
            <p>When an academic year completes, click <strong>"Promote to Year X"</strong> on the current year card.</p>
          </div>
          <div className="flex gap-3">
            <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
            <p>The system creates matching sections for the next year (e.g., CS1_Y2, CS2_Y2) if they don't exist.</p>
          </div>
          <div className="flex gap-3">
            <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
            <p>All active students in current year sections are moved to the corresponding next-year sections.</p>
          </div>
          <div className="flex gap-3">
            <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold flex-shrink-0">4</span>
            <p>Current year sections are archived (marked inactive) — timetable and attendance history is preserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
