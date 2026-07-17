"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", subject_ids: [] as string[] });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const dId = user.department_id;
      const [teacherRes, subjectRes] = await Promise.all([
        api.get(`/users?role=teacher&department_id=${dId}`),
        api.get(`/subjects?department_id=${dId}`),
      ]);
      setSubjects(subjectRes.data.data || []);

      const teachersList = teacherRes.data.data || [];
      const teachersWithSubjects = await Promise.all(
        teachersList.map(async (t: any) => {
          try {
            const { data } = await api.get(`/users/${t.id}/subjects`);
            return { ...t, subjects: data.data || [] };
          } catch { return { ...t, subjects: [] }; }
        })
      );
      setTeachers(teachersWithSubjects);
    } catch (error) { console.error(error); }
    setLoading(false);
  };

  const openCreate = () => {
    setEditingId(null);
    setForm({ name: "", email: "", phone: "", password: "", subject_ids: [] });
    setShowForm(true);
  };

  const openEdit = (teacher: any) => {
    setEditingId(teacher.id);
    setForm({
      name: teacher.name,
      email: teacher.email,
      phone: teacher.phone || "",
      password: "",
      subject_ids: teacher.subjects?.map((s: any) => s.id) || [],
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (editingId) {
        const payload: any = { name: form.name, email: form.email, phone: form.phone, subject_ids: form.subject_ids };
        if (form.password) payload.password = form.password;
        await api.put(`/users/${editingId}`, payload);
      } else {
        await api.post("/users", { ...form, role: "teacher", department_id: user.department_id });
      }
      setShowForm(false);
      setEditingId(null);
      fetchData();
    } catch (error: any) { alert(error.response?.data?.message || "Failed"); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this teacher?")) return;
    try { await api.delete(`/users/${id}`); fetchData(); } catch (e: any) { alert(e.response?.data?.message || "Failed"); }
  };

  const toggleSubject = (id: string) => {
    setForm(f => ({
      ...f,
      subject_ids: f.subject_ids.includes(id) ? f.subject_ids.filter(s => s !== id) : [...f.subject_ids, id]
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Teachers</h1>
          <p className="text-gray-500 mt-1">{teachers.length} teachers</p>
        </div>
        <div className="flex gap-2">
          <a href="/hod/teachers/upload" className="px-4 py-2.5 bg-emerald-500 text-white rounded-xl font-medium text-sm hover:bg-emerald-600">Bulk Upload</a>
          <button onClick={openCreate} className="px-4 py-2.5 bg-indigo-500 text-white rounded-xl font-medium text-sm hover:bg-indigo-600">+ Add Teacher</button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 border border-gray-100 space-y-4 animate-fade-in">
          <h3 className="font-bold text-gray-900">{editingId ? "Edit Teacher" : "Add Teacher"}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Name</label>
              <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm" required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
              <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm" required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Phone</label>
              <input type="text" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">{editingId ? "New Password (leave blank to keep)" : "Password"}</label>
              <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm" {...(!editingId ? { required: true } : {})} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Subjects</label>
            <div className="flex flex-wrap gap-2">
              {subjects.map(s => (
                <button key={s.id} type="button" onClick={() => toggleSubject(s.id)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${form.subject_ids.includes(s.id) ? "bg-indigo-500 text-white border-indigo-500" : "bg-white text-gray-700 border-gray-200 hover:border-indigo-300"}`}>
                  {s.name} ({s.code})
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" className="px-6 py-2.5 bg-indigo-500 text-white rounded-xl font-medium text-sm hover:bg-indigo-600">{editingId ? "Update" : "Create"}</button>
            <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }} className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium text-sm hover:bg-gray-200">Cancel</button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3">{Array(3).fill(0).map((_, i) => <div key={i} className="h-14 bg-gray-50 rounded-xl animate-pulse" />)}</div>
        ) : teachers.length === 0 ? (
          <div className="text-center py-16"><p className="text-gray-500 font-medium">No teachers yet</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-gray-100">
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Teacher</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Email</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Phone</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Subjects</th>
                <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-50">
                {teachers.map(t => (
                  <tr key={t.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4"><div className="flex items-center gap-3"><div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">{t.name.charAt(0)}</div><div className="font-semibold text-gray-900">{t.name}</div></div></td>
                    <td className="px-6 py-4 text-sm text-gray-600">{t.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{t.phone || "-"}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {t.subjects?.map((s: any) => (
                          <span key={s.id} className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded text-xs font-medium">{s.name}</span>
                        ))}
                        {(!t.subjects || t.subjects.length === 0) && <span className="text-xs text-gray-400">None</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => openEdit(t)} className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium hover:bg-blue-100">Edit</button>
                        <button onClick={() => handleDelete(t.id)} className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
