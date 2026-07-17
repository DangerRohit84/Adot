"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { User, Department } from "@/lib/types";

export default function ScannersPage() {
  const [scanners, setScanners] = useState<User[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const dId = user.department_id;
      const scanRes = await api.get(`/users?role=scanner&department_id=${dId}`);
      setScanners(scanRes.data.data || []);
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      await api.post("/users", { ...form, role: "scanner", department_id: user.department_id }); setShowForm(false); setForm({ name: "", email: "", phone: "", password: "" }); fetchData();
    } catch (error: any) { alert(error.response?.data?.message || "Failed"); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Authorized Scanners</h1><p className="text-gray-500 mt-1">{scanners.length} scanner accounts</p></div>
        <div className="flex gap-2">
          <a href="/hod/scanners/upload" className="px-4 py-2.5 bg-emerald-500 text-white rounded-xl font-medium text-sm hover:bg-emerald-600 transition-colors flex items-center gap-2 cursor-pointer">
            Bulk Upload
          </a>
          <button onClick={() => setShowForm(!showForm)} className="px-4 py-2.5 bg-purple-500 text-white rounded-xl font-medium text-sm hover:bg-purple-600 transition-colors flex items-center gap-2 cursor-pointer">
            + Add Scanner
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-2xl p-6 border border-gray-100 space-y-4 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="block text-sm font-semibold text-gray-700 mb-1">Name</label><input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm input-focus" required /></div>
            <div><label className="block text-sm font-semibold text-gray-700 mb-1">Email</label><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm input-focus" required /></div>
            <div><label className="block text-sm font-semibold text-gray-700 mb-1">Phone</label><input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm input-focus" /></div>
            <div><label className="block text-sm font-semibold text-gray-700 mb-1">Password</label><input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm input-focus" required /></div>
          </div>
          <div className="flex gap-3">
            <button type="submit" className="px-6 py-2.5 bg-purple-500 text-white rounded-xl font-medium text-sm hover:bg-purple-600">Create</button>
            <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium text-sm hover:bg-gray-200">Cancel</button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? Array(3).fill(0).map((_, i) => <div key={i} className="h-32 bg-white rounded-2xl border border-gray-100 animate-pulse" />) :
          scanners.length === 0 ? (
            <div className="col-span-full text-center py-16 bg-white rounded-2xl border border-gray-100">
              <p className="text-gray-500 font-medium">No scanner accounts yet</p>
              <p className="text-gray-400 text-sm mt-1">Create scanner accounts for authorized persons</p>
            </div>
          ) : scanners.map((s, i) => (
            <div key={s.id} className="bg-white rounded-2xl p-6 border border-gray-100 card-hover animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg mb-4">{s.name.charAt(0)}</div>
              <h3 className="font-bold text-gray-900">{s.name}</h3>
              <p className="text-sm text-gray-500 mt-1">{s.email}</p>
              <p className="text-sm text-gray-500">{s.phone || "No phone"}</p>
              <span className={`badge mt-3 ${s.is_active ? "badge-success" : "badge-danger"}`}>{s.is_active ? "Active" : "Inactive"}</span>
            </div>
          ))}
      </div>
    </div>
  );
}
