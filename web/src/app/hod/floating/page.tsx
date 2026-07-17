"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

interface FloatingStudent {
  id: string;
  student_id: string;
  student_name: string;
  roll_number: string;
  source_section_id: string;
  source_section_name: string;
  target_section_id: string;
  target_section_name: string;
  reason: string;
  approved_by_name: string;
  created_at: string;
}

interface Student { id: string; name: string; roll_number: string; section_id: string; section_name: string; }
interface Section { id: string; name: string; }

export default function FloatingStudentsPage() {
  const [floats, setFloats] = useState<FloatingStudent[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ student_id: "", target_section_id: "", reason: "" });
  const [search, setSearch] = useState("");

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [floatsRes, studentsRes, sectionsRes] = await Promise.all([
        api.get("/floating-students"),
        api.get("/students"),
        api.get("/sections"),
      ]);
      setFloats(floatsRes.data.data || []);
      setStudents(studentsRes.data.data || []);
      setSections(sectionsRes.data.data || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleAdd = async () => {
    if (!form.student_id || !form.target_section_id) return;
    try {
      const student = students.find(s => s.id === form.student_id);
      await api.post("/floating-students", {
        student_id: form.student_id,
        target_section_id: form.target_section_id,
        source_section_id: student?.section_id,
        reason: form.reason,
      });
      setShowAdd(false);
      setForm({ student_id: "", target_section_id: "", reason: "" });
      fetchData();
    } catch (e: any) {
      alert(e.response?.data?.message || "Failed to add floating student");
    }
  };

  const handleRemove = async (id: string) => {
    if (!confirm("Remove this floating assignment?")) return;
    try {
      await api.delete(`/floating-students/${id}`);
      fetchData();
    } catch (e) { console.error(e); }
  };

  const filtered = floats.filter(f =>
    f.student_name.toLowerCase().includes(search.toLowerCase()) ||
    f.roll_number.toLowerCase().includes(search.toLowerCase()) ||
    f.target_section_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 text-left">Floating Students</h1>
          <p className="text-slate-500 mt-1 text-left">Allow students to attend other sections&apos; classes</p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)}
          className="px-4 py-2 bg-gradient-to-r from-violet-500 to-violet-600 text-white rounded-xl font-semibold text-sm hover:shadow-lg transition-all">
          + Add Floating
        </button>
      </div>

      {/* Add Form */}
      {showAdd && (
        <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
          <h3 className="font-bold text-slate-900 text-left">New Floating Assignment</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1 text-left">Student</label>
              <select value={form.student_id} onChange={e => setForm({ ...form, student_id: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-500 outline-none">
                <option value="">Select student...</option>
                {students.map(s => (
                  <option key={s.id} value={s.id}>{s.roll_number} - {s.name} ({s.section_name})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1 text-left">Target Section (attend this)</label>
              <select value={form.target_section_id} onChange={e => setForm({ ...form, target_section_id: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-500 outline-none">
                <option value="">Select section...</option>
                {sections.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1 text-left">Reason (optional)</label>
              <input type="text" value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })}
                placeholder="e.g., Lab swap, elective class..."
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-500 outline-none" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleAdd}
              className="px-4 py-2 bg-violet-500 text-white rounded-xl text-sm font-semibold hover:bg-violet-600">
              Save
            </button>
            <button onClick={() => setShowAdd(false)}
              className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-200">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4">
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, roll number, or section..."
          className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-500 outline-none" />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <span className="text-4xl">🔄</span>
            <p className="text-slate-500 mt-3 font-medium">No floating students</p>
            <p className="text-sm text-slate-400 mt-1">Add students who need to attend other sections&apos; classes</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Student</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">From Section</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">To Section</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Reason</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Approved By</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(f => (
                <tr key={f.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <p className="font-semibold text-slate-900 text-left text-sm">{f.student_name}</p>
                    <p className="text-xs text-slate-500 text-left">{f.roll_number}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700 text-left">
                    <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium">{f.source_section_name}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700 text-left">
                    <span className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-medium">{f.target_section_name}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 text-left">{f.reason || "—"}</td>
                  <td className="px-6 py-4 text-sm text-slate-500 text-left">{f.approved_by_name || "—"}</td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => handleRemove(f.id)}
                      className="px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
