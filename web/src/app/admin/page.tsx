"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

export default function AdminDashboard() {
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
      if (data.admin) {
        setSuccessMsg({ email: data.admin.email, password: data.admin.password });
      }
      setForm({ name: "", code: "" });
      setShowForm(false);
      fetchColleges();
    } catch (e) { console.error(e); }
    setCreating(false);
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {[
          { label: "Colleges", value: colleges.length, color: "from-indigo-500 to-indigo-600" },
          { label: "System Status", value: "Active", color: "from-emerald-500 to-emerald-600" },
          { label: "Super Admin", value: "Online", color: "from-violet-500 to-violet-600" },
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

      {/* Colleges Section */}
      <div className="bg-white rounded-2xl border border-slate-100">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Colleges</h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 btn-primary text-white text-sm font-semibold rounded-xl cursor-pointer"
          >
            {showForm ? "Cancel" : "+ Add College"}
          </button>
        </div>

        {/* Create Form */}
        {showForm && (
          <div className="p-6 border-b border-slate-100 bg-slate-50">
            <form onSubmit={handleCreate} className="flex gap-4 items-end">
              <div className="flex-1 space-y-1">
                <label className="text-sm font-semibold text-slate-700">College Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm input-elegant"
                  placeholder="e.g. MIT College of Engineering"
                  required
                />
              </div>
              <div className="w-40 space-y-1">
                <label className="text-sm font-semibold text-slate-700">Code</label>
                <input
                  type="text"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm input-elegant"
                  placeholder="e.g. MIT"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={creating}
                className="px-6 py-2.5 bg-emerald-500 text-white text-sm font-semibold rounded-xl hover:bg-emerald-600 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {creating ? "Creating..." : "Create"}
              </button>
            </form>
          </div>
        )}

        {/* Success Message */}
        {successMsg && (
          <div className="mx-6 mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
            <p className="text-sm font-semibold text-emerald-800 mb-2">College admin account created:</p>
            <div className="flex items-center gap-6 text-sm text-emerald-700">
              <span>Email: <strong>{successMsg.email}</strong></span>
              <span>Password: <strong>{successMsg.password}</strong></span>
            </div>
            <button onClick={() => setSuccessMsg(null)} className="mt-2 text-xs text-emerald-600 hover:underline cursor-pointer">Dismiss</button>
          </div>
        )}

        {/* Colleges List */}
        <div className="p-6">
          {loading ? (
            <p className="text-sm text-slate-500">Loading...</p>
          ) : colleges.length === 0 ? (
            <div className="text-center py-12">
              <span className="text-4xl">🏫</span>
              <p className="text-slate-500 mt-3 font-medium">No colleges yet</p>
              <p className="text-sm text-slate-400 mt-1">Create your first college to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {colleges.map((c: { id: string; name: string; code: string }, i: number) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl hover:bg-slate-50 transition-colors border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                      <span className="text-indigo-600 font-bold text-sm">{c.code?.slice(0, 2).toUpperCase()}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 text-left">{c.name}</p>
                      <p className="text-xs text-slate-500 text-left">{c.code}</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full">Active</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
