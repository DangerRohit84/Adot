"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

export default function TeacherAttendancePage() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const { data } = await api.get("/attendance/sessions");
      setSessions(data.data || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 text-left">Attendance Sessions</h1>
        <p className="text-slate-500 mt-1 text-left">View all attendance sessions</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100">
        <div className="p-6">
          {loading ? (
            <p className="text-sm text-slate-500">Loading...</p>
          ) : sessions.length === 0 ? (
            <div className="text-center py-12">
              <span className="text-4xl">📋</span>
              <p className="text-slate-500 mt-3 font-medium">No sessions yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">Subject</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">Section</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">Date</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">Present</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((s: { id: string; subject?: string; section?: string; status: string; created_at: string; present_count?: number }, i: number) => (
                    <tr key={i} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium text-slate-900 text-left">{s.subject || "—"}</td>
                      <td className="px-4 py-3 text-sm text-slate-600 text-left">{s.section || "—"}</td>
                      <td className="px-4 py-3 text-left">
                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${s.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                          {s.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-500 text-left">{new Date(s.created_at).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-sm text-slate-900 font-medium text-left">{s.present_count ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
