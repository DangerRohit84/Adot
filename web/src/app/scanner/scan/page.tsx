"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

export default function ScannerScanPage() {
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<{ type: "success" | "duplicate" | "wrong_section" | "error"; message: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchSessions(); }, []);

  const fetchSessions = async () => {
    try {
      const { data } = await api.get("/attendance");
      setSessions(data.data || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleScan = async (qrData: string) => {
    if (!selectedSession) return;
    try {
      const { data } = await api.post("/attendance/scan", {
        session_id: selectedSession,
        barcode_data: qrData,
      });
      const student = data.data?.student;
      setScanResult({ type: "success", message: `${student?.name || "Student"} (${student?.roll_number || "?"}) marked present` });
    } catch (e: any) {
      const msg = e.response?.data?.message || "Scan failed";
      const code = e.response?.data?.error;
      let type: "success" | "duplicate" | "wrong_section" | "error" = "error";
      if (code === "ALREADY_MARKED") type = "duplicate";
      else if (code === "WRONG_SECTION") type = "wrong_section";
      setScanResult({ type, message: msg });
    }
    setTimeout(() => setScanResult(null), 4000);
  };

  const activeSessions = sessions.filter((s: { status: string }) => s.status === "active");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 text-left">QR Scanner</h1>
        <p className="text-slate-500 mt-1 text-left">Select a session and scan student QR codes</p>
      </div>

      {/* Session Selection */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-4 text-left">Select Session</h2>
        {loading ? (
          <p className="text-sm text-slate-500">Loading sessions...</p>
        ) : activeSessions.length === 0 ? (
          <div className="text-center py-8">
            <span className="text-3xl">📱</span>
            <p className="text-slate-500 mt-2 font-medium">No active sessions</p>
            <p className="text-sm text-slate-400">Ask a teacher to start a session first</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {activeSessions.map((s: any, i: number) => (
              <button key={i} onClick={() => setSelectedSession(s.id)}
                className={`p-4 rounded-xl border-2 text-left transition-all cursor-pointer ${selectedSession === s.id ? "border-emerald-500 bg-emerald-50" : "border-slate-200 hover:border-slate-300"}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`w-2 h-2 rounded-full ${selectedSession === s.id ? "bg-emerald-500" : "bg-slate-300"}`} />
                  <span className="font-semibold text-slate-900 text-sm">{s.subject_name || "Session"}</span>
                </div>
                <p className="text-xs text-slate-500">{s.section_name || "—"}</p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Scanner Area */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-4 text-left">Scanner</h2>
        {selectedSession ? (
          <div className="text-center py-12">
            <div className="w-64 h-64 mx-auto bg-slate-100 rounded-2xl flex items-center justify-center border-2 border-dashed border-slate-300 mb-4">
              <div className="text-center">
                <span className="text-5xl">📷</span>
                <p className="text-slate-500 mt-3 font-medium">Camera preview</p>
                <p className="text-xs text-slate-400 mt-1">Point at QR code to scan</p>
              </div>
            </div>
            <p className="text-sm text-slate-500">Session selected. Ready to scan.</p>
            <button onClick={() => handleScan("TEST-QR-" + Date.now())}
              className="mt-4 px-6 py-3 btn-primary text-white rounded-xl font-semibold cursor-pointer">
              Test Scan (Demo)
            </button>
          </div>
        ) : (
          <div className="text-center py-12">
            <span className="text-4xl">👆</span>
            <p className="text-slate-500 mt-3 font-medium">Select a session first</p>
          </div>
        )}
      </div>

      {/* Scan Result Toast */}
      {scanResult && (
        <div className={`fixed bottom-6 right-6 px-6 py-4 rounded-2xl shadow-2xl text-white font-semibold animate-fade-in-up z-50 ${
          scanResult.type === "success" ? "bg-emerald-500" : scanResult.type === "duplicate" ? "bg-amber-500" : scanResult.type === "wrong_section" ? "bg-red-500" : "bg-red-600"
        }`}>
          {scanResult.type === "wrong_section" && "⚠️ "}
          {scanResult.type === "duplicate" && "⏰ "}
          {scanResult.message}
        </div>
      )}
    </div>
  );
}
