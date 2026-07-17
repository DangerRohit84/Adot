"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

export default function CollegeHodsPage() {
  const [hods, setHods] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "college@123", department_id: "" });
  const [creating, setCreating] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [hodsRes, deptRes] = await Promise.all([
        api.get("/users?role=hod"),
        api.get("/departments"),
      ]);
      setHods(hodsRes.data.data || []);
      setDepartments(deptRes.data.data || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await api.post("/users", { ...form, role: "hod" });
      setForm({ name: "", email: "", password: "college@123", department_id: "" });
      setShowForm(false);
      fetchData();
    } catch (e: any) { alert(e.response?.data?.message || "Failed"); }
    setCreating(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 text-left">HODs</h1>
          <p className="text-slate-500 mt-1 text-left">{hods.length} heads of department</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="px-4 py-2.5 btn-primary text-white rounded-xl font-medium text-sm flex items-center gap-2 cursor-pointer">
          + Add HOD
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-2xl p-6 border border-slate-100 space-y-4 animate-fade-in-up">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1 text-left">Name</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm input-elegant" required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1 text-left">Email</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm input-elegant" required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1 text-left">Password</label>
              <input type="text" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm input-elegant" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1 text-left">Department</label>
              <select value={form.department_id} onChange={(e) => setForm({ ...form, department_id: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm input-elegant" required>
                <option value="">Select</option>
                {departments.map((d: { id: string; name: string }) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={creating} className="px-6 py-2.5 bg-emerald-500 text-white rounded-xl font-medium text-sm hover:bg-emerald-600 disabled:opacity-50 cursor-pointer">
              {creating ? "Creating..." : "Create"}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-medium text-sm hover:bg-slate-200 cursor-pointer">Cancel</button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? Array(3).fill(0).map((_, i) => <div key={i} className="h-32 bg-white rounded-2xl border border-slate-100 animate-pulse" />) :
          hods.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <span className="text-4xl">👥</span>
              <p className="text-slate-500 mt-3 font-medium">No HODs yet</p>
            </div>
          ) : hods.map((h: { id: string; name: string; email: string; department_name?: string }, i: number) => (
            <div key={i} className="bg-white rounded-2xl p-6 border border-slate-100 card-hover">
              <div className="w-12 h-12 bg-gradient-to-br from-violet-400 to-violet-500 rounded-xl flex items-center justify-center text-white font-bold text-lg mb-4">
                {h.name?.charAt(0)}
              </div>
              <h3 className="font-bold text-slate-900 text-lg text-left">{h.name}</h3>
              <p className="text-sm text-slate-500 mt-1 text-left">{h.email}</p>
              {h.department_name && <p className="text-sm text-slate-500 text-left">{h.department_name}</p>}
            </div>
          ))}
      </div>
    </div>
  );
}
