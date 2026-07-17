"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

export default function TeacherTimetablePage() {
  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(true);

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const periods = Array.from({ length: 8 }, (_, i) => i + 1);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const { data } = await api.get("/timetable");
      setTimetable(data.data || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const getSlot = (day: string, period: number) => {
    return timetable.find((t: { day: string; start_period: number; end_period: number }) =>
      t.day === day && t.start_period <= period && t.end_period >= period
    );
  };

  const colors = ["bg-blue-50 border-blue-200 text-blue-800", "bg-violet-50 border-violet-200 text-violet-800", "bg-emerald-50 border-emerald-200 text-emerald-800", "bg-amber-50 border-amber-200 text-amber-800", "bg-rose-50 border-rose-200 text-rose-800"];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 text-left">My Timetable</h1>
        <p className="text-slate-500 mt-1 text-left">Your weekly class schedule</p>
      </div>

      {loading ? (
        <div className="h-96 bg-white rounded-2xl border border-slate-100 animate-pulse" />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600 min-w-[80px]">Period</th>
                  {days.map((day) => (
                    <th key={day} className="px-4 py-3 text-center text-sm font-semibold text-slate-600 min-w-[140px]">{day.slice(0, 3)}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {periods.map((period) => (
                  <tr key={period} className="border-t border-slate-100">
                    <td className="px-4 py-3 text-sm font-medium text-slate-500 text-center">{period}</td>
                    {days.map((day) => {
                      const slot = getSlot(day, period) as { subject_name?: string; subject_code?: string; section_name?: string } | undefined;
                      const colorIdx = slot ? (days.indexOf(day) % colors.length) : -1;
                      return (
                        <td key={day} className="px-2 py-2">
                          {slot ? (
                            <div className={`p-2 rounded-lg border text-center ${colors[colorIdx]}`}>
                              <div className="font-semibold text-xs">{slot.subject_name}</div>
                              <div className="text-xs opacity-75">{slot.section_name}</div>
                            </div>
                          ) : (
                            <div className="p-2 rounded-lg border border-dashed border-slate-200 text-center text-slate-300 text-xs">—</div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
