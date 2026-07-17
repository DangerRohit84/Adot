"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

export default function UploadStudentsPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string[][]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFile = useCallback((f: File) => {
    if (!f.name.endsWith(".csv")) {
      alert("Please upload a CSV file");
      return;
    }
    setFile(f);
    setResult(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const rows = text.split("\n").slice(0, 11).map((r) => r.split(",").map((c) => c.trim()));
      setPreview(rows);
    };
    reader.readAsText(f);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
  }, [handleFile]);

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const { data } = await api.post("/students/bulk", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(data.data);
    } catch (error: any) {
      setResult({ error: error.response?.data?.message || "Upload failed" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <button onClick={() => router.back()} className="text-sm text-gray-500 hover:text-gray-700 mb-3 flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Upload Students</h1>
        <p className="text-gray-500 mt-1">Bulk import students from a CSV file</p>
      </div>

      {/* CSV Format Guide */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
        <h3 className="font-semibold text-blue-900 mb-2">CSV Format Required</h3>
        <div className="bg-white rounded-xl p-3 font-mono text-xs text-gray-600 overflow-x-auto">
          <div className="text-blue-600 font-bold">roll_number,name,email,phone,section,barcode</div>
          <div>CS2024001,John Smith,john@college.com,9876543210,CS2,ABC123</div>
          <div>CS2024002,Jane Doe,jane@college.com,9876543211,CS2,DEF456</div>
        </div>
        <p className="text-xs text-blue-700 mt-2"><strong>barcode</strong> = the barcode number on the student&apos;s ID card (optional — auto-generated if empty)</p>
      </div>

      {/* Upload Area */}
      <div
        className={`bg-white rounded-2xl border-2 border-dashed p-12 text-center transition-all ${
          dragActive ? "border-indigo-400 bg-indigo-50" : file ? "border-emerald-300 bg-emerald-50" : "border-gray-200 hover:border-gray-300"
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept=".csv"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          className="hidden"
          id="file-upload"
        />
        <label htmlFor="file-upload" className="cursor-pointer">
          <svg className={`w-12 h-12 mx-auto mb-4 ${file ? "text-emerald-500" : "text-gray-300"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          {file ? (
            <div>
              <p className="font-semibold text-emerald-700">{file.name}</p>
              <p className="text-sm text-emerald-600 mt-1">Click to change file</p>
            </div>
          ) : (
            <div>
              <p className="font-semibold text-gray-700">Drop your CSV file here</p>
              <p className="text-sm text-gray-400 mt-1">or click to browse</p>
            </div>
          )}
        </label>
      </div>

      {/* Preview */}
      {preview.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Preview (first {preview.length - 1} rows)</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  {preview[0]?.map((col, i) => (
                    <th key={i} className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {preview.slice(1).map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    {row.map((cell, j) => (
                      <td key={j} className="px-4 py-2 text-gray-700">{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className={`rounded-2xl p-5 ${result.error ? "bg-red-50 border border-red-200" : "bg-emerald-50 border border-emerald-200"}`}>
          {result.error ? (
            <p className="text-red-700 font-medium">{result.error}</p>
          ) : (
            <div>
              <p className="font-semibold text-emerald-900 mb-2">Upload Complete!</p>
              <p className="text-emerald-700">{result.imported} students imported successfully</p>
              {result.errors?.length > 0 && (
                <p className="text-orange-600 mt-2">{result.errors.length} rows had errors</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Upload Button */}
      {file && !result && (
        <button
          onClick={handleUpload}
          disabled={loading}
          className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Uploading...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Upload Students
            </>
          )}
        </button>
      )}
    </div>
  );
}
