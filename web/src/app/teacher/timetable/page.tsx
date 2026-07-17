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

  const now = new Date();
  const currentDay = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][now.getDay()];
  const dayMap: Record<string, string> = { Monday: "mon", Tuesday: "tue", Wednesday: "wed", Thursday: "thu", Friday: "fri", Saturday: "sat" };
  const currentDayShort = dayMap[currentDay] || "";
  const currentTime = now.toTimeString().slice(0, 5);

  const colors = ["bg-blue-50 border-blue-200 text-blue-800", "bg-violet-50 border-violet-200 text-violet-800", "bg-emerald-50 border-emerald-200 text-emerald-800", "bg-amber-50 border-amber-200 text-amber-800", "bg-rose-50 border-rose-200 text-rose-800"];

  const currentSlot: any = timetable.find((t: any) =>
    t.day_of_week === currentDayShort &&
    t.start_time?.slice(0,5) <= currentTime &&
    t.end_time?.slice(0,5) >= currentTime
  );

  const nextSlot: any = timetable.find((t: any) =>
    t.day_of_week === currentDayShort &&
    t.start_time?.slice(0,5) > currentTime
  );

  const activeSlot: any = currentSlot || nextSlot;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 text-left">My Timetable</h1>
        <p className="text-slate-500 mt-1 text-left">Your weekly class schedule</p>
      </div>

      {/* Current/Next Class Card */}
      {!loading && activeSlot && (
        <div className={`rounded-2xl p-6 text-white ${currentSlot
          ? 'bg-gradient-to-br from-emerald-500 to-emerald-600'
          : 'bg-gradient-to-br from-blue-500 to-blue-600'}`}>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-white/80 text-sm font-medium">
              {currentSlot ? '🟢 Current Class' : '🔵 Next Class'}
            </span>
          </div>
          <h2 className="text-xl font-extrabold">{activeSlot.subject_name}</h2>
          <div className="mt-2 flex flex-wrap gap-3 text-sm text-white/90">
            <span>👥 Section: {activeSlot.section_name}</span>
            {activeSlot.room_number && <span>📍 Room: {activeSlot.room_number}</span>}
            <span>🕐 {activeSlot.start_time?.slice(0,5)} - {activeSlot.end_time?.slice(0,5)}</span>
            <span>📚 Period {activeSlot.start_period}{activeSlot.end_period !== activeSlot.start_period ? ` - ${activeSlot.end_period}` : ''}</span>
          </div>
        </div>
      )}

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
                      const slot = getSlot(day, period) as { subject_name?: string; subject_code?: string; section_name?: string; room_number?: string } | undefined;
                      const colorIdx = slot ? (days.indexOf(day) % colors.length) : -1;
                      const isCurrent = dayMap[day] === currentDayShort && slot &&
                        currentDayShort &&
                        currentTime >= (slot as any).start_time?.slice(0,5) &&
                        currentTime <= (slot as any).end_time?.slice(0,5);
                      return (
                        <td key={day} className="px-2 py-2">
                          {slot ? (
                            <div className={`p-2 rounded-lg border text-center ${isCurrent ? 'ring-2 ring-emerald-400 shadow-md ' : ''}${colors[colorIdx]}`}>
                              <div className="font-semibold text-xs">{slot.subject_name}</div>
                              <div className="text-xs opacity-75">{slot.section_name}</div>
                              {slot.room_number && (
                                <div className="text-[10px] opacity-60 mt-0.5 flex items-center justify-center gap-0.5">
                                  <span>📍</span><span>{slot.room_number}</span>
                                </div>
                              )}
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
