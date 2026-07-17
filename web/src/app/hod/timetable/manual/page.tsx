"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Section } from "@/lib/types";

const DAYS = ["mon", "tue", "wed", "thu", "fri", "sat"];
const DAY_LABELS: Record<string, string> = { mon: "Mon", tue: "Tue", wed: "Wed", thu: "Thu", fri: "Fri", sat: "Sat" };

interface Period {
  num: number;
  start: string;
  end: string;
}

const DEFAULT_PERIODS: Period[] = [
  { num: 1, start: "8:30", end: "9:15" },
  { num: 2, start: "9:15", end: "10:00" },
  { num: 3, start: "10:15", end: "11:00" },
  { num: 4, start: "11:00", end: "11:45" },
  { num: 5, start: "12:45", end: "1:30" },
  { num: 6, start: "1:30", end: "2:15" },
  { num: 7, start: "2:30", end: "3:15" },
  { num: 8, start: "3:15", end: "4:00" },
];

const COLORS = ["bg-blue-50 border-blue-200 text-blue-700", "bg-purple-50 border-purple-200 text-purple-700", "bg-emerald-50 border-emerald-200 text-emerald-700", "bg-orange-50 border-orange-200 text-orange-700", "bg-pink-50 border-pink-200 text-pink-700", "bg-cyan-50 border-cyan-200 text-cyan-700"];

function loadPeriods(): Period[] {
  if (typeof window === "undefined") return DEFAULT_PERIODS;
  try {
    const saved = localStorage.getItem("timetable_periods");
    return saved ? JSON.parse(saved) : DEFAULT_PERIODS;
  } catch { return DEFAULT_PERIODS; }
}

function savePeriods(periods: Period[]) {
  localStorage.setItem("timetable_periods", JSON.stringify(periods));
}

export default function ManualTimetablePage() {
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedSection, setSelectedSection] = useState("");
  const [entries, setEntries] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [allTeachers, setAllTeachers] = useState<any[]>([]);
  const [subjectTeachers, setSubjectTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ day: "", period: 0, subject_id: "", teacher_id: "", room: "" });
  const [saving, setSaving] = useState(false);
  const [periods, setPeriods] = useState<Period[]>([]);
  const [editPeriods, setEditPeriods] = useState(false);

  useEffect(() => { setPeriods(loadPeriods()); }, []);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    Promise.all([
      api.get(`/sections?department_id=${user.department_id}`),
      api.get(`/subjects?department_id=${user.department_id}`),
    ]).then(([s, sub]) => {
      setSections(s.data.data || []);
      setSubjects(sub.data.data || []);
      setLoading(false);
    });
  }, []);

  useEffect(() => { if (selectedSection) fetchTimetable(); }, [selectedSection]);

  const fetchTimetable = async () => {
    try {
      const { data } = await api.get(`/timetable?section_id=${selectedSection}`);
      setEntries(data.data || []);
    } catch (e) { console.error(e); }
  };

  const getEntry = (day: string, period: number) => entries.find(e => e.day_of_week === day && e.start_period <= period && e.end_period >= period);

  const fetchTeachersForSubject = async (subjectId: string) => {
    try {
      const { data } = await api.get(`/subjects/${subjectId}/teachers`);
      setSubjectTeachers(data.data || []);
    } catch { setSubjectTeachers([]); }
  };

  const openModal = (day: string, period: number) => {
    if (getEntry(day, period)) return;
    setForm({ day, period, subject_id: "", teacher_id: "", room: "" });
    setSubjectTeachers([]);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.subject_id || !form.teacher_id) { alert("Select subject and teacher"); return; }
    const p = periods.find(x => x.num === form.period);
    setSaving(true);
    try {
      await api.post("/timetable", {
        section_id: selectedSection,
        subject_id: form.subject_id,
        teacher_id: form.teacher_id,
        day_of_week: form.day,
        start_period: form.period,
        end_period: form.period,
        start_time: p?.start || "",
        end_time: p?.end || "",
        room_number: form.room,
      });
      setShowModal(false);
      fetchTimetable();
    } catch (e: any) { alert(e.response?.data?.message || "Failed"); }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this entry?")) return;
    try { await api.delete(`/timetable/${id}`); fetchTimetable(); } catch (e: any) { alert(e.response?.data?.message || "Failed"); }
  };

  const addPeriod = () => {
    const next = periods.length + 1;
    const last = periods[periods.length - 1];
    const newPeriod = { num: next, start: last?.end || "8:00", end: last ? `${parseInt(last.end.split(":")[0]) + 1}:${last.end.split(":")[1]}` : "9:00" };
    const updated = [...periods, newPeriod];
    setPeriods(updated);
    savePeriods(updated);
  };

  const removePeriod = (num: number) => {
    if (periods.length <= 1) return;
    const updated = periods.filter(p => p.num !== num).map((p, i) => ({ ...p, num: i + 1 }));
    setPeriods(updated);
    savePeriods(updated);
  };

  const updatePeriodTime = (num: number, field: "start" | "end", value: string) => {
    const updated = periods.map(p => p.num === num ? { ...p, [field]: value } : p);
    setPeriods(updated);
    savePeriods(updated);
  };

  const getColor = (name: string) => COLORS[name.split("").reduce((a, b) => ((a << 5) - a + b.charCodeAt(0)) | 0, 0) % COLORS.length];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manual Timetable</h1>
          <p className="text-gray-500 mt-1">Click on a cell to add a class</p>
        </div>
        <div className="flex gap-2">
          <a href="/hod/timetable/upload" className="px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium text-sm hover:bg-gray-50">Upload CSV</a>
        </div>
      </div>

      {/* Section + Period Settings */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <select value={selectedSection} onChange={e => setSelectedSection(e.target.value)}
          className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm flex-1">
          <option value="">Select Section</option>
          {sections.map(s => <option key={s.id} value={s.id}>{s.name} (Year {s.year})</option>)}
        </select>
        <button onClick={() => setEditPeriods(!editPeriods)}
          className="px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium text-sm hover:bg-gray-50 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          Periods & Times
        </button>
      </div>

      {/* Period Settings Panel */}
      {editPeriods && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">Periods & Times</h3>
            <button onClick={addPeriod} className="px-3 py-1.5 bg-indigo-500 text-white rounded-lg text-sm font-medium hover:bg-indigo-600">+ Add Period</button>
          </div>
          <div className="space-y-2">
            {periods.map(p => (
              <div key={p.num} className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-2">
                <span className="font-bold text-gray-900 text-sm w-12">P{p.num}</span>
                <input type="time" value={p.start} onChange={e => updatePeriodTime(p.num, "start", e.target.value)}
                  className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm" />
                <span className="text-gray-400">—</span>
                <input type="time" value={p.end} onChange={e => updatePeriodTime(p.num, "end", e.target.value)}
                  className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm" />
                {periods.length > 1 && (
                  <button onClick={() => removePeriod(p.num)} className="ml-auto text-red-400 hover:text-red-600 text-sm">Remove</button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Timetable Grid */}
      {loading ? (
        <div className="h-96 bg-white rounded-2xl border border-gray-100 animate-pulse" />
      ) : !selectedSection ? (
        <div className="bg-white rounded-2xl p-16 border border-gray-100 text-center">
          <span className="text-4xl">👆</span>
          <p className="text-gray-500 mt-3 font-medium">Select a section to start</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase w-28">Period</th>
                  {DAYS.map(d => <th key={d} className="px-3 py-3 text-center text-xs font-semibold text-gray-500 uppercase">{DAY_LABELS[d]}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {periods.map(p => (
                  <tr key={p.num} className="hover:bg-gray-50/50">
                    <td className="px-3 py-2 border-r border-gray-100">
                      <div className="font-bold text-gray-900 text-sm">P{p.num}</div>
                      <div className="text-xs text-gray-400 font-mono">{p.start}</div>
                    </td>
                    {DAYS.map(d => {
                      const entry = getEntry(d, p.num);
                      const isStart = entry && entry.start_period === p.num;
                      if (entry && !isStart) return <td key={d} className="px-1 py-1" />;
                      return (
                        <td key={d} className="px-1 py-1">
                          {entry ? (
                            <div className={`rounded-lg p-2 border-2 ${getColor(entry.subject_name)} min-h-[56px] relative group cursor-pointer`}
                              onClick={() => handleDelete(entry.id)}>
                              <div className="font-bold text-xs">{entry.subject_name}</div>
                              <div className="text-xs opacity-70 mt-0.5">{entry.teacher_name}</div>
                              <div className="text-xs opacity-50 mt-0.5">{entry.room_number || ""}</div>
                              <div className="absolute inset-0 bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                <span className="text-red-600 text-xs font-bold">Click to delete</span>
                              </div>
                            </div>
                          ) : (
                            <button onClick={() => openModal(d, p.num)}
                              className="rounded-lg p-2 border-2 border-dashed border-gray-200 min-h-[56px] w-full hover:border-indigo-300 hover:bg-indigo-50 transition-all flex items-center justify-center">
                              <span className="text-gray-300 text-lg">+</span>
                            </button>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-gray-900 mb-1">Add Class</h2>
            <p className="text-sm text-gray-500 mb-5">{DAY_LABELS[form.day]} • Period {form.period}</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Subject</label>
                <select value={form.subject_id} onChange={e => {
                    const subjectId = e.target.value;
                    setForm({ ...form, subject_id: subjectId, teacher_id: "" });
                    if (subjectId) fetchTeachersForSubject(subjectId);
                    else setSubjectTeachers([]);
                  }}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm">
                  <option value="">Select subject</option>
                  {subjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Teacher</label>
                <select value={form.teacher_id} onChange={e => setForm({ ...form, teacher_id: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm" disabled={!form.subject_id}>
                  <option value="">Select teacher</option>
                  {subjectTeachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Room</label>
                <input type="text" value={form.room} onChange={e => setForm({ ...form, room: e.target.value })}
                  placeholder="e.g., A101" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-gray-200 text-gray-700 rounded-xl font-medium text-sm hover:bg-gray-50">Cancel</button>
              <button onClick={handleSave} disabled={saving || !form.subject_id || !form.teacher_id}
                className="flex-1 py-2.5 bg-indigo-500 text-white rounded-xl font-medium text-sm hover:bg-indigo-600 disabled:opacity-50">
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
