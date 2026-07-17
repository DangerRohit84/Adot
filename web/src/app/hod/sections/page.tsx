"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Section, Department } from "@/lib/types";

export default function SectionsPage() {
  const [sections, setSections] = useState<Section[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", department_id: "", year: 1, semester: 1 });
  const [deptId, setDeptId] = useState("");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    setDeptId(user.department_id || "");
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const dId = user.department_id;
      const secRes = await api.get(`/sections?department_id=${dId}`);
      setSections(secRes.data.data || []);
      setDepartments([{ id: dId, name: user.department_name || "My Department" } as Department]);
      setForm((f) => ({ ...f, department_id: dId }));
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/sections", form); setShowForm(false); setForm({ name: "", department_id: "", year: 1, semester: 1 }); fetchData();
    } catch (error: any) { alert(error.response?.data?.message || "Failed"); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Sections</h1><p className="text-gray-500 mt-1">{sections.length} sections</p></div>
        <button onClick={() => setShowForm(!showForm)} className="px-4 py-2.5 bg-indigo-500 text-white rounded-xl font-medium text-sm hover:bg-indigo-600 transition-colors flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>Add Section
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-2xl p-6 border border-gray-100 space-y-4 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div><label className="block text-sm font-semibold text-gray-700 mb-1">Name</label><input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm input-focus" placeholder="e.g., CS2" required /></div>
            <div><label className="block text-sm font-semibold text-gray-700 mb-1">Department</label><select value={form.department_id} onChange={(e) => setForm({ ...form, department_id: e.target.value })} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm input-focus" required><option value="">Select</option>{departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}</select></div>
            <div><label className="block text-sm font-semibold text-gray-700 mb-1">Year</label><select value={form.year} onChange={(e) => setForm({ ...form, year: parseInt(e.target.value) })} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm input-focus"><option value={1}>1st Year</option><option value={2}>2nd Year</option><option value={3}>3rd Year</option><option value={4}>4th Year</option></select></div>
            <div><label className="block text-sm font-semibold text-gray-700 mb-1">Semester</label><select value={form.semester} onChange={(e) => setForm({ ...form, semester: parseInt(e.target.value) })} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm input-focus">{[1,2,3,4,5,6,7,8].map((s) => <option key={s} value={s}>{s}</option>)}</select></div>
          </div>
          <div className="flex gap-3">
            <button type="submit" className="px-6 py-2.5 bg-indigo-500 text-white rounded-xl font-medium text-sm hover:bg-indigo-600">Create</button>
            <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium text-sm hover:bg-gray-200">Cancel</button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? Array(3).fill(0).map((_, i) => <div key={i} className="h-32 bg-white rounded-2xl border border-gray-100 animate-pulse" />) :
          sections.map((sec, i) => (
            <div key={sec.id} className="bg-white rounded-2xl p-6 border border-gray-100 card-hover animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold text-lg mb-4">{sec.name}</div>
              <h3 className="font-bold text-gray-900">{sec.name}</h3>
              <p className="text-sm text-gray-500 mt-1">{sec.department_name}</p>
              <p className="text-sm text-gray-500">Year {sec.year} - Semester {sec.semester}</p>
              {sec.student_count !== undefined && <p className="text-sm text-indigo-600 mt-2 font-medium">{sec.student_count} students</p>}
            </div>
          ))}
      </div>
    </div>
  );
}
