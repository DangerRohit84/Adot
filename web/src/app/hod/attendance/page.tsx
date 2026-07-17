"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { AttendanceSession, Section } from "@/lib/types";

export default function AttendancePage() {
  const [sessions, setSessions] = useState<AttendanceSession[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterSection, setFilterSection] = useState("");
  const [filterDate, setFilterDate] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const dId = user.department_id;
      const [sessionRes, sectionRes] = await Promise.all([
        api.get(`/attendance?department_id=${dId}`),
        api.get(`/sections?department_id=${dId}`),
      ]);
      setSessions(sessionRes.data.data || []);
      setSections(sectionRes.data.data || []);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Attendance Records</h1>
        <p className="text-gray-500 mt-1">View and manage attendance sessions</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 flex flex-col sm:flex-row gap-3">
        <select
          value={filterSection}
          onChange={(e) => setFilterSection(e.target.value)}
          className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm input-focus"
        >
          <option value="">All Sections</option>
          {sections.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
        <input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm input-focus"
        />
      </div>

      {/* Sessions Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(6).fill(0).map((_, i) => (
            <div key={i} className="h-40 bg-white rounded-2xl border border-gray-100 animate-pulse" />
          ))}
        </div>
      ) : sessions.length === 0 ? (
        <div className="bg-white rounded-2xl p-16 border border-gray-100 text-center">
          <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-gray-500 font-medium">No attendance sessions yet</p>
          <p className="text-gray-400 text-sm mt-1">Sessions will appear here when scanners mark attendance</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sessions.map((session, i) => (
            <div
              key={session.id}
              className="bg-white rounded-2xl p-5 border border-gray-100 card-hover animate-fade-in"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`badge ${session.is_active ? "badge-success" : "badge-info"}`}>
                  {session.is_active ? "Active" : "Completed"}
                </div>
                <span className="text-xs text-gray-400">{new Date(session.started_at).toLocaleDateString()}</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-1">{session.subject_name || "Session"}</h3>
              <p className="text-sm text-gray-500 mb-3">{session.section_name}</p>
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>By: {session.scanner_name}</span>
                <a
                  href={`/hod/attendance/${session.id}`}
                  className="text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  View Details
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
