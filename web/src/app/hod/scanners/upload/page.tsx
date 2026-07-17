"use client";

import { useState, useRef } from "react";
import api from "@/lib/api";

export default function ScannersUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; created?: number; skipped?: number; errors?: string[] } | null>(null);
  const [defaultPassword, setDefaultPassword] = useState("college@123");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("role", "scanner");
    formData.append("default_password", defaultPassword);

    try {
      const { data } = await api.post("/users/bulk", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult({ success: true, ...data });
    } catch (err: any) {
      setResult({ success: false, message: err.response?.data?.message || "Upload failed" });
    }
    setUploading(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 text-left">Bulk Upload Scanners</h1>
        <p className="text-slate-500 mt-1 text-left">Import scanner accounts from CSV file</p>
      </div>

      {/* CSV Format Guide */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100">
        <h2 className="text-lg font-bold text-slate-900 mb-3 text-left">CSV Format</h2>
        <p className="text-sm text-slate-500 mb-3 text-left">Your CSV file should have these columns:</p>
        <div className="bg-slate-50 rounded-xl p-4 font-mono text-sm text-slate-700">
          <p className="text-left">name,email,phone</p>
          <p className="text-left text-slate-400">Scanner 1,scanner1@mit.edu,9876543220</p>
          <p className="text-left text-slate-400">Scanner 2,scanner2@mit.edu,9876543221</p>
        </div>
        <p className="text-xs text-slate-400 mt-2 text-left">Default password: <strong>{defaultPassword}</strong></p>
      </div>

      {/* Upload Form */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100">
        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1 text-left">Default Password</label>
            <input type="text" value={defaultPassword} onChange={(e) => setDefaultPassword(e.target.value)}
              className="w-full max-w-xs px-4 py-2.5 rounded-xl border border-slate-200 text-sm input-elegant" />
          </div>

          <div className="flex items-center gap-4">
            <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="hidden" />
            <button type="button" onClick={() => fileRef.current?.click()}
              className="px-6 py-3 border-2 border-dashed border-slate-300 rounded-xl text-slate-600 hover:border-indigo-400 hover:text-indigo-600 transition-colors cursor-pointer">
              {file ? file.name : "Choose CSV/Excel file"}
            </button>
            {file && <span className="text-sm text-slate-500">{(file.size / 1024).toFixed(1)} KB</span>}
          </div>

          <button type="submit" disabled={!file || uploading}
            className="px-6 py-2.5 btn-primary text-white rounded-xl font-medium text-sm disabled:opacity-50 cursor-pointer">
            {uploading ? "Uploading..." : "Upload Scanners"}
          </button>
        </form>
      </div>

      {/* Result */}
      {result && (
        <div className={`rounded-2xl p-6 border ${result.success ? "bg-emerald-50 border-emerald-200" : "bg-red-50 border-red-200"}`}>
          <p className={`font-semibold ${result.success ? "text-emerald-800" : "text-red-800"} text-left`}>{result.message}</p>
          {result.created !== undefined && (
            <p className="text-sm text-emerald-700 mt-1 text-left">Created: {result.created} | Skipped: {result.skipped}</p>
          )}
          {result.errors && result.errors.length > 0 && (
            <div className="mt-3 text-sm text-red-600">
              {result.errors.map((e, i) => <p key={i} className="text-left">{e}</p>)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
