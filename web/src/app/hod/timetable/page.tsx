"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { TimetableEntry, Section } from "@/lib/types";

const DAYS = ["mon", "tue", "wed", "thu", "fri", "sat"];
const DAY_LABELS: Record<string, string> = { mon: "Monday", tue: "Tuesday", wed: "Wednesday", thu: "Thursday", fri: "Friday", sat: "Saturday" };
const PERIODS = [
  { num: 1, time: "8:30 - 9:15" },
  { num: 2, time: "9:15 - 10:00" },
  { num: 3, time: "10:15 - 11:00" },
  { num: 4, time: "11:00 - 11:45" },
  { num: 5, time: "12:45 - 1:30" },
  { num: 6, time: "1:30 - 2:15" },
  { num: 7, time: "2:30 - 3:15" },
  { num: 8, time: "3:15 - 4:00" },
];

const COLORS = [
  "from-blue-400 to-blue-500",
  "from-purple-400 to-purple-500",
  "from-emerald-400 to-emerald-500",
  "from-orange-400 to-orange-500",
  "from-pink-400 to-pink-500",
  "from-cyan-400 to-cyan-500",
  "from-amber-400 to-amber-500",
  "from-rose-400 to-rose-500",
];

const BG_COLORS = [
  "bg-blue-50 border-blue-200",
  "bg-purple-50 border-purple-200",
  "bg-emerald-50 border-emerald-200",
  "bg-orange-50 border-orange-200",
  "bg-pink-50 border-pink-200",
  "bg-cyan-50 border-cyan-200",
  "bg-amber-50 border-amber-200",
  "bg-rose-50 border-rose-200",
];

const TEXT_COLORS = [
  "text-blue-700",
  "text-purple-700",
  "text-emerald-700",
  "text-orange-700",
  "text-pink-700",
  "text-cyan-700",
  "text-amber-700",
  "text-rose-700",
];

const YEAR_LABELS: Record<number, string> = { 1: "1st Year", 2: "2nd Year", 3: "3rd Year", 4: "4th Year" };

export default function TimetablePage() {
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<string>("mon");
  const [filterYear, setFilterYear] = useState<string>("");
  const [filterSection, setFilterSection] = useState<string>("");

  useEffect(() => {
    fetchSections();
    fetchTimetable();
  }, [filterYear, filterSection]);

  const fetchSections = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const { data } = await api.get(`/sections?department_id=${user.department_id}`);
      setSections(data.data || []);
    } catch (e) { console.error(e); }
  };

  const fetchTimetable = async () => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      let url = `/timetable?department_id=${user.department_id}`;
      if (filterSection) {
        url = `/timetable?section_id=${filterSection}`;
      }
      const { data } = await api.get(url);
      let filtered = data.data || [];
      if (filterYear) {
        const sectionIds = sections.filter(s => s.year === Number(filterYear)).map(s => s.id);
        filtered = filtered.filter((e: TimetableEntry) => sectionIds.includes(e.section_id));
      }
      setEntries(filtered);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const getEntry = (day: string, period: number, sectionId?: string) => {
    return entries.find((e) => {
      if (e.day_of_week !== day || e.start_period > period || e.end_period < period) return false;
      if (sectionId && e.section_id !== sectionId) return false;
      return true;
    });
  };

  const getSubjectColor = (subjectName: string) => {
    const hash = subjectName.split("").reduce((a, b) => ((a << 5) - a + b.charCodeAt(0)) | 0, 0);
    return Math.abs(hash) % COLORS.length;
  };

  const uniqueYears = [...new Set(sections.map(s => s.year))].sort();
  const filteredSections = filterYear
    ? sections.filter(s => s.year === Number(filterYear))
    : sections;

  const renderGrid = (sectionFilter?: string, sectionLabel?: string) => (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      {sectionLabel && (
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
          <span className="text-sm font-bold text-gray-700">{sectionLabel}</span>
        </div>
      )}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50/50">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase w-20">Period</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase w-24">Time</th>
              {DAYS.map((day) => (
                <th key={day} className={`px-4 py-3 text-center text-xs font-semibold uppercase ${selectedDay === day ? "text-indigo-600 bg-indigo-50" : "text-gray-500"}`}>
                  {DAY_LABELS[day].slice(0, 3)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {PERIODS.map((period) => (
              <tr key={period.num} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-3 py-3">
                  <div className="font-bold text-gray-900 text-sm">P{period.num}</div>
                </td>
                <td className="px-3 py-3">
                  <div className="text-xs text-gray-500 font-mono">{period.time}</div>
                </td>
                {DAYS.map((day) => {
                  const entry = getEntry(day, period.num, sectionFilter);
                  const colorIdx = entry ? getSubjectColor(entry.subject_name) : -1;
                  const isStart = entry && entry.start_period === period.num;

                  if (entry && !isStart && entry.start_period < period.num) {
                    return <td key={day} className="px-1 py-1" />;
                  }

                  return (
                    <td key={day} className="px-1 py-1">
                      {entry ? (
                        <div className={`rounded-lg p-2 border-2 ${BG_COLORS[colorIdx]} min-h-[50px]`}>
                          <div className={`font-bold text-xs ${TEXT_COLORS[colorIdx]}`}>
                            {entry.subject_name}
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            {entry.teacher_name?.split(" ").slice(0, 2).join(" ")}
                          </div>
                        </div>
                      ) : (
                        <div className="rounded-lg p-2 bg-gray-50 border border-gray-100 min-h-[50px] flex items-center justify-center">
                          <span className="text-gray-300 text-xs">-</span>
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile */}
      <div className="md:hidden p-4 space-y-3">
        {PERIODS.map((period) => {
          const entry = getEntry(selectedDay, period.num, sectionFilter);
          const colorIdx = entry ? getSubjectColor(entry.subject_name) : -1;
          return (
            <div key={period.num} className="flex gap-3">
              <div className="w-14 flex-shrink-0">
                <div className="font-bold text-gray-900 text-sm">P{period.num}</div>
                <div className="text-xs text-gray-400 font-mono">{period.time.split(" - ")[0]}</div>
              </div>
              {entry && entry.start_period === period.num ? (
                <div className={`flex-1 rounded-xl p-3 border-2 ${BG_COLORS[colorIdx]}`}>
                  <div className={`font-bold text-sm ${TEXT_COLORS[colorIdx]}`}>{entry.subject_name}</div>
                  <div className="text-xs text-gray-500 mt-1">{entry.teacher_name}</div>
                </div>
              ) : !entry ? (
                <div className="flex-1 rounded-xl p-3 bg-gray-50 border border-gray-100 flex items-center justify-center">
                  <span className="text-gray-300 text-xs">No class</span>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Timetable</h1>
          <p className="text-gray-500 mt-1">View schedules by year and section</p>
        </div>
        <a href="/hod/timetable/upload"
          className="px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium text-sm hover:bg-gray-50 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          Upload CSV
        </a>
        <a href="/hod/timetable/manual"
          className="px-4 py-2.5 bg-indigo-500 text-white rounded-xl font-medium text-sm hover:bg-indigo-600 flex items-center gap-2">
          + Add Manually
        </a>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 flex flex-col sm:flex-row gap-3">
        <select value={filterYear} onChange={(e) => { setFilterYear(e.target.value); setFilterSection(""); }}
          className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm input-focus flex-1">
          <option value="">All Years</option>
          {uniqueYears.map(y => <option key={y} value={y}>{YEAR_LABELS[y] || `Year ${y}`}</option>)}
        </select>
        <select value={filterSection} onChange={(e) => setFilterSection(e.target.value)}
          className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm input-focus flex-1">
          <option value="">All Sections</option>
          {filteredSections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>

      {/* Day Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {DAYS.map((day) => (
          <button key={day} onClick={() => setSelectedDay(day)}
            className={`px-5 py-2.5 rounded-xl font-medium text-sm whitespace-nowrap transition-all ${
              selectedDay === day
                ? "bg-indigo-500 text-white shadow-lg shadow-indigo-200"
                : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
            }`}>
            {DAY_LABELS[day]}
          </button>
        ))}
      </div>

      {/* Timetable */}
      {loading ? (
        <div className="bg-white rounded-2xl p-8 border border-gray-100">
          <div className="space-y-3">
            {Array(8).fill(0).map((_, i) => <div key={i} className="h-16 bg-gray-50 rounded-xl animate-pulse" />)}
          </div>
        </div>
      ) : filterSection ? (
        renderGrid(filterSection, filteredSections.find(s => s.id === filterSection)?.name)
      ) : filterYear ? (
        <div className="space-y-6">
          {filteredSections.map(s => (
            <div key={s.id}>
              {renderGrid(s.id, `${s.name} — ${YEAR_LABELS[s.year] || `Year ${s.year}`}`)}
            </div>
          ))}
          {filteredSections.length === 0 && (
            <div className="bg-white rounded-2xl p-12 border border-gray-100 text-center">
              <p className="text-gray-400">No sections found for this year</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {uniqueYears.map(year => {
            const yearSections = sections.filter(s => s.year === year);
            return (
              <div key={year}>
                <h2 className="text-lg font-bold text-gray-800 mb-3">{YEAR_LABELS[year] || `Year ${year}`}</h2>
                {yearSections.map(s => (
                  <div key={s.id} className="mb-4">
                    {renderGrid(s.id, s.name)}
                  </div>
                ))}
              </div>
            );
          })}
          {sections.length === 0 && (
            <div className="bg-white rounded-2xl p-12 border border-gray-100 text-center">
              <p className="text-gray-400">No sections found. Create sections first.</p>
            </div>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Subjects</h3>
        <div className="flex flex-wrap gap-2">
          {[...new Set(entries.map((e) => e.subject_name))].slice(0, 10).map((subject) => {
            const colorIdx = getSubjectColor(subject);
            return (
              <div key={subject} className={`px-3 py-1.5 rounded-lg border ${BG_COLORS[colorIdx]} text-xs font-medium ${TEXT_COLORS[colorIdx]}`}>
                {subject}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
