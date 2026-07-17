"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

export default function AdminCollegesPage() {
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", code: "" });
  const [creating, setCreating] = useState(false);
  const [successMsg, setSuccessMsg] = useState<{ email: string; password: string } | null>(null);

  useEffect(() => { fetchColleges(); }, []);

  const fetchColleges = async () => {
    try {
      const { data } = await api.get("/colleges");
      setColleges(data.data || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setSuccessMsg(null);
    try {
      const { data } = await api.post("/colleges", form);
      if (data.admin) setSuccessMsg({ email: data.admin.email, password: data.admin.password });
      setForm({ name: "", code: "" });
      setShowForm(false);
      fetchColleges();
    } catch (e: any) { alert(e.response?.data?.message || "Failed"); }
    setCreating(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 text-left">Colleges</h1>
          <p className="text-slate-500 mt-1 text-left">{colleges.length} colleges</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="px-4 py-2.5 btn-primary text-white rounded-xl font-medium text-sm flex items-center gap-2 cursor-pointer">
          + Add College
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-2xl p-6 border border-slate-100 space-y-4 animate-fade-in-up">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1 text-left">College Name</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm input-elegant"
                placeholder="e.g. MIT College of Engineering" required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1 text-left">Code</label>
              <input type="text" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm input-elegant"
                placeholder="e.g. MIT" required />
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

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
          <p className="text-sm font-semibold text-emerald-800 mb-2 text-left">College admin account created:</p>
          <div className="flex items-center gap-6 text-sm text-emerald-700">
            <span>Email: <strong>{successMsg.email}</strong></span>
            <span>Password: <strong>{successMsg.password}</strong></span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? Array(3).fill(0).map((_, i) => <div key={i} className="h-32 bg-white rounded-2xl border border-slate-100 animate-pulse" />) :
          colleges.map((c: { id: string; name: string; code: string }, i: number) => (
            <div key={i} className="bg-white rounded-2xl p-6 border border-slate-100 card-hover">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-indigo-500 rounded-xl flex items-center justify-center text-white font-bold text-lg mb-4">
                {c.code?.slice(0, 2).toUpperCase()}
              </div>
              <h3 className="font-bold text-slate-900 text-lg text-left">{c.name}</h3>
              <p className="text-sm text-slate-500 mt-1 text-left">Code: {c.code}</p>
              <span className="inline-block mt-3 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full">Active</span>
            </div>
          ))}
      </div>
    </div>
  );
}
