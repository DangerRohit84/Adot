"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Department } from "@/lib/types";

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", code: "" });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const { data } = await api.get("/departments");
      setDepartments(data.data || []);
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/departments", form);
      setShowForm(false); setForm({ name: "", code: "" }); fetchData();
    } catch (error: any) { alert(error.response?.data?.message || "Failed"); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Departments</h1><p className="text-gray-500 mt-1">{departments.length} departments</p></div>
        <button onClick={() => setShowForm(!showForm)} className="px-4 py-2.5 bg-indigo-500 text-white rounded-xl font-medium text-sm hover:bg-indigo-600 transition-colors flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>Add Department
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-2xl p-6 border border-gray-100 space-y-4 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="block text-sm font-semibold text-gray-700 mb-1">Name</label><input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm input-focus" placeholder="e.g., Computer Science" required /></div>
            <div><label className="block text-sm font-semibold text-gray-700 mb-1">Code</label><input type="text" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm input-focus" placeholder="e.g., CS" required /></div>
          </div>
          <div className="flex gap-3">
            <button type="submit" className="px-6 py-2.5 bg-indigo-500 text-white rounded-xl font-medium text-sm hover:bg-indigo-600">Create</button>
            <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium text-sm hover:bg-gray-200">Cancel</button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? Array(3).fill(0).map((_, i) => <div key={i} className="h-32 bg-white rounded-2xl border border-gray-100 animate-pulse" />) :
          departments.map((dept, i) => (
            <div key={dept.id} className="bg-white rounded-2xl p-6 border border-gray-100 card-hover animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-500 rounded-xl flex items-center justify-center text-white font-bold text-lg mb-4">{dept.code}</div>
              <h3 className="font-bold text-gray-900 text-lg">{dept.name}</h3>
              <p className="text-sm text-gray-500 mt-1">Code: {dept.code}</p>
              {dept.hod_name && <p className="text-sm text-gray-500 mt-1">HOD: {dept.hod_name}</p>}
            </div>
          ))}
      </div>
    </div>
  );
}
