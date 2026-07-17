"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { Section } from "@/lib/types";

export default function UploadTimetablePage() {
  const router = useRouter();
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedSection, setSelectedSection] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string[][]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    api.get(`/sections?department_id=${user.department_id}`).then(({ data }) => setSections(data.data || []));
  }, []);

  const handleFile = useCallback((f: File) => {
    if (!f.name.endsWith(".csv")) { alert("Please upload a CSV file"); return; }
    setFile(f);
    setResult(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const rows = text.split("\n").slice(0, 16).map((r) => r.split(",").map((c) => c.trim()));
      setPreview(rows);
    };
    reader.readAsText(f);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragActive(false);
    if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
  }, [handleFile]);

  const handleUpload = async () => {
    if (!file || !selectedSection) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("section_id", selectedSection);
      const { data } = await api.post("/timetable/bulk", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(data.data);
    } catch (error: any) {
      setResult({ error: error.response?.data?.message || "Upload failed" });
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    const csv = `day,year,start_period,end_period,subject_code,subject_name,teacher_email,room,start_time,end_time
mon,1,1,2,CS401,AI,prof.kumar@college.com,A101,08:30,10:00
mon,1,3,3,CS402,OS,prof.singh@college.com,A102,10:15,11:00
tue,1,1,2,CS403,DBMS,prof.reddy@college.com,A101,08:30,10:00
wed,1,1,2,CS404,Maths,prof.sharma@college.com,A103,08:30,10:00`;
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "timetable_template.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <button onClick={() => router.back()} className="text-sm text-gray-500 hover:text-gray-700 mb-3 flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Upload Timetable</h1>
            <p className="text-gray-500 mt-1">Upload timetable for one section at a time</p>
          </div>
          <button onClick={downloadTemplate}
            className="px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium text-sm hover:bg-gray-50 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            Template
          </button>
        </div>
      </div>

      {/* Section Selector */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <label className="block text-sm font-semibold text-gray-700 mb-2">Select Section</label>
        <select value={selectedSection} onChange={(e) => { setSelectedSection(e.target.value); setFile(null); setResult(null); setPreview([]); }}
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm input-focus">
          <option value="">Choose a section...</option>
          {sections.map(s => <option key={s.id} value={s.id}>{s.name} (Year {s.year})</option>)}
        </select>
      </div>

      {/* Format */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
        <h3 className="font-semibold text-blue-900 mb-2">CSV Format</h3>
        <div className="bg-white rounded-xl p-3 font-mono text-xs text-gray-600 overflow-x-auto">
          <div className="text-blue-600 font-bold mb-1">day,year,start_period,end_period,subject_code,subject_name,teacher_email,room,start_time,end_time</div>
          <div>mon,1,1,2,CS401,AI,prof.kumar@college.com,A101,08:30,10:00</div>
          <div>mon,1,3,3,CS402,OS,prof.singh@college.com,A102,10:15,11:00</div>
          <div>tue,1,1,2,CS403,DBMS,prof.reddy@college.com,A101,08:30,10:00</div>
        </div>
        <p className="text-xs text-blue-600 mt-2">Section is selected above. Just add the class rows for that section.</p>
      </div>

      {/* Upload */}
      {selectedSection ? (
        <>
          <div
            className={`bg-white rounded-2xl border-2 border-dashed p-12 text-center transition-all ${dragActive ? "border-indigo-400 bg-indigo-50" : file ? "border-emerald-300 bg-emerald-50" : "border-gray-200 hover:border-gray-300"}`}
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
          >
            <input type="file" accept=".csv" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} className="hidden" id="file-upload" />
            <label htmlFor="file-upload" className="cursor-pointer">
              <svg className={`w-12 h-12 mx-auto mb-4 ${file ? "text-emerald-500" : "text-gray-300"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              {file ? <p className="font-semibold text-emerald-700">{file.name}</p> : <div><p className="font-semibold text-gray-700">Drop CSV here</p><p className="text-sm text-gray-400 mt-1">or click to browse</p></div>}
            </label>
          </div>

          {preview.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-100"><h3 className="font-semibold text-gray-900">Preview ({preview.length - 1} classes)</h3></div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="bg-gray-50">{preview[0]?.map((col, i) => (<th key={i} className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase">{col}</th>))}</tr></thead>
                  <tbody className="divide-y divide-gray-50">{preview.slice(1).map((row, i) => (<tr key={i} className="hover:bg-gray-50">{row.map((cell, j) => (<td key={j} className="px-3 py-2 text-gray-700">{cell}</td>))}</tr>))}</tbody>
                </table>
              </div>
            </div>
          )}

          {result && (
            <div className={`rounded-2xl p-5 ${result.error ? "bg-red-50 border border-red-200" : "bg-emerald-50 border border-emerald-200"}`}>
              {result.error ? <p className="text-red-700 font-medium">{result.error}</p> : (
                <div>
                  <p className="font-semibold text-emerald-900">Done! {result.created} entries added</p>
                  {result.errors?.length > 0 && (
                    <div className="mt-2 text-sm text-red-600">
                      {result.errors.map((e: any, i: number) => <p key={i}>Row {e.row}: {e.error}</p>)}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {file && !result && (
            <button onClick={handleUpload} disabled={loading} className="w-full py-3.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? <><svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Uploading...</> : "Upload Timetable"}
            </button>
          )}
        </>
      ) : (
        <div className="bg-gray-50 rounded-2xl p-12 text-center border border-gray-100">
          <span className="text-4xl">👆</span>
          <p className="text-gray-500 mt-3 font-medium">Select a section first</p>
        </div>
      )}
    </div>
  );
}
