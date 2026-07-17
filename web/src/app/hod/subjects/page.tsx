"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Subject, Department } from "@/lib/types";

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", code: "", department_id: "" });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const dId = user.department_id;
      const subRes = await api.get(`/subjects?department_id=${dId}`);
      setSubjects(subRes.data.data || []);
      setDepartments([{ id: dId, name: user.department_name || "My Department" } as Department]);
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      await api.post("/subjects", { ...form, department_id: user.department_id }); setShowForm(false); setForm({ name: "", code: "", department_id: "" }); fetchData();
    } catch (error: any) { alert(error.response?.data?.message || "Failed"); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Subjects</h1><p className="text-gray-500 mt-1">{subjects.length} subjects</p></div>
        <button onClick={() => setShowForm(!showForm)} className="px-4 py-2.5 bg-indigo-500 text-white rounded-xl font-medium text-sm hover:bg-indigo-600 transition-colors flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>Add Subject
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-2xl p-6 border border-gray-100 space-y-4 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div><label className="block text-sm font-semibold text-gray-700 mb-1">Name</label><input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm input-focus" placeholder="e.g., Artificial Intelligence" required /></div>
            <div><label className="block text-sm font-semibold text-gray-700 mb-1">Code</label><input type="text" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm input-focus" placeholder="e.g., CS401" required /></div>
            <div><label className="block text-sm font-semibold text-gray-700 mb-1">Department</label><select value={form.department_id} onChange={(e) => setForm({ ...form, department_id: e.target.value })} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm input-focus" required><option value="">Select</option>{departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}</select></div>
          </div>
          <div className="flex gap-3">
            <button type="submit" className="px-6 py-2.5 bg-indigo-500 text-white rounded-xl font-medium text-sm hover:bg-indigo-600">Create</button>
            <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium text-sm hover:bg-gray-200">Cancel</button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? Array(3).fill(0).map((_, i) => <div key={i} className="h-32 bg-white rounded-2xl border border-gray-100 animate-pulse" />) :
          subjects.map((sub, i) => (
            <div key={sub.id} className="bg-white rounded-2xl p-6 border border-gray-100 card-hover animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-xl flex items-center justify-center text-white font-bold text-xs mb-4">{sub.code}</div>
              <h3 className="font-bold text-gray-900">{sub.name}</h3>
              <p className="text-sm text-gray-500 mt-1">{sub.department_name}</p>
              <p className="text-xs text-gray-400 mt-1">Code: {sub.code}</p>
            </div>
          ))}
      </div>
    </div>
  );
}
