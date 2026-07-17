"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

interface Selection {
  id: string;
  student_name: string;
  roll_number: string;
  subject_name: string;
  subject_code: string;
  teacher_name: string;
  section_name: string;
  student_id: string;
  subject_id: string;
  teacher_id: string;
  section_id: string;
}

interface Student { id: string; name: string; roll_number: string; section_id: string; section_name: string; }
interface Subject { id: string; name: string; code: string; }
interface Teacher { id: string; name: string; }
interface Section { id: string; name: string; }

export default function FloatingPage() {
  const [selections, setSelections] = useState<Selection[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const [selRes, studentsRes, subjectsRes, sectionsRes] = await Promise.all([
        api.get("/student-teacher-selections"),
        api.get("/students"),
        api.get(`/subjects?department_id=${user.department_id}`),
        api.get(`/sections?department_id=${user.department_id}`),
      ]);
      setSelections(selRes.data.data || []);
      setStudents(studentsRes.data.data || []);
      setSubjects(subjectsRes.data.data || []);
      setSections(sectionsRes.data.data || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => {
    if (selectedSubject) {
      api.get(`/subjects/${selectedSubject}/teachers`)
        .then(({ data }) => setTeachers(data.data || []))
        .catch(() => setTeachers([]));
    } else {
      setTeachers([]);
    }
    setSelectedTeacher("");
  }, [selectedSubject]);

  useEffect(() => {
    if (selectedSection) {
      setFilteredStudents(students.filter(s => s.section_id === selectedSection));
    } else {
      setFilteredStudents(students);
    }
    setSelectedStudents([]);
  }, [selectedSection, students]);

  const handleAllocate = async () => {
    if (!selectedSubject || !selectedTeacher || selectedStudents.length === 0) {
      alert("Select subject, teacher, and at least one student");
      return;
    }
    setSaving(true);
    try {
      const selections = selectedStudents.map(sid => {
        const student = students.find(s => s.id === sid);
        return {
          student_id: sid,
          subject_id: selectedSubject,
          teacher_id: selectedTeacher,
          section_id: student?.section_id || selectedSection,
        };
      });
      await api.post("/student-teacher-selections/bulk", { selections });
      setShowAdd(false);
      setSelectedSubject("");
      setSelectedTeacher("");
      setSelectedSection("");
      setSelectedStudents([]);
      fetchData();
    } catch (e: any) {
      alert(e.response?.data?.message || "Failed to allocate");
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this allocation?")) return;
    try {
      await api.delete(`/student-teacher-selections/${id}`);
      fetchData();
    } catch (e) { console.error(e); }
  };

  const toggleStudent = (id: string) => {
    setSelectedStudents(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedStudents.length === filteredStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(filteredStudents.map(s => s.id));
    }
  };

  const filtered = selections.filter(s =>
    s.student_name.toLowerCase().includes(search.toLowerCase()) ||
    s.roll_number.toLowerCase().includes(search.toLowerCase()) ||
    s.subject_name.toLowerCase().includes(search.toLowerCase()) ||
    s.teacher_name.toLowerCase().includes(search.toLowerCase())
  );

  // Group by subject
  const groupedBySubject = filtered.reduce((acc, s) => {
    if (!acc[s.subject_name]) acc[s.subject_name] = [];
    acc[s.subject_name].push(s);
    return acc;
  }, {} as Record<string, Selection[]>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 text-left">Teacher Allocations</h1>
          <p className="text-slate-500 mt-1 text-left">Allocate students to teachers for each subject (floating classes)</p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)}
          className="px-4 py-2 bg-gradient-to-r from-violet-500 to-violet-600 text-white rounded-xl font-semibold text-sm hover:shadow-lg transition-all">
          + Allocate Students
        </button>
      </div>

      {/* Add Form */}
      {showAdd && (
        <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
          <h3 className="font-bold text-slate-900 text-left">New Teacher Allocation</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1 text-left">Subject</label>
              <select value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-500 outline-none">
                <option value="">Select subject...</option>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1 text-left">Teacher</label>
              <select value={selectedTeacher} onChange={e => setSelectedTeacher(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-500 outline-none" disabled={!selectedSubject}>
                <option value="">Select teacher...</option>
                {teachers.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1 text-left">Filter by Section (optional)</label>
              <select value={selectedSection} onChange={e => setSelectedSection(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-500 outline-none">
                <option value="">All sections</option>
                {sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>

          {/* Student List */}
          {selectedSubject && selectedTeacher && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-slate-700 text-left">Select Students ({selectedStudents.length} selected)</label>
                <button onClick={selectAll} className="text-xs text-violet-600 font-medium hover:underline">
                  {selectedStudents.length === filteredStudents.length ? "Deselect All" : "Select All"}
                </button>
              </div>
              <div className="max-h-60 overflow-y-auto border border-slate-200 rounded-xl">
                {filteredStudents.length === 0 ? (
                  <p className="p-4 text-sm text-slate-500 text-center">No students in this section</p>
                ) : (
                  filteredStudents.map(s => (
                    <label key={s.id} className="flex items-center gap-3 px-4 py-2 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-0">
                      <input type="checkbox" checked={selectedStudents.includes(s.id)} onChange={() => toggleStudent(s.id)}
                        className="w-4 h-4 text-violet-600 rounded focus:ring-violet-500" />
                      <span className="text-sm font-medium text-slate-900">{s.roll_number}</span>
                      <span className="text-sm text-slate-500">{s.name}</span>
                      <span className="text-xs text-slate-400 ml-auto">{s.section_name}</span>
                    </label>
                  ))
                )}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <button onClick={handleAllocate} disabled={saving || !selectedSubject || !selectedTeacher || selectedStudents.length === 0}
              className="px-4 py-2 bg-violet-500 text-white rounded-xl text-sm font-semibold hover:bg-violet-600 disabled:opacity-50">
              {saving ? "Saving..." : `Allocate ${selectedStudents.length} Students`}
            </button>
            <button onClick={() => setShowAdd(false)}
              className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-200">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4">
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, roll number, subject, or teacher..."
          className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-500 outline-none" />
      </div>

      {/* Grouped by Subject */}
      {loading ? (
        <div className="bg-white rounded-2xl p-12 border border-slate-100 text-center text-slate-500">Loading...</div>
      ) : Object.keys(groupedBySubject).length === 0 ? (
        <div className="bg-white rounded-2xl p-12 border border-slate-100 text-center">
          <span className="text-4xl">🎓</span>
          <p className="text-slate-500 mt-3 font-medium">No allocations yet</p>
          <p className="text-sm text-slate-400 mt-1">Allocate students to teachers for floating classes</p>
        </div>
      ) : (
        Object.entries(groupedBySubject).map(([subject, items]) => (
          <div key={subject} className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-violet-50 to-purple-50 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-left">{subject}</h3>
              <p className="text-xs text-slate-500 text-left">{items.length} student{items.length !== 1 ? 's' : ''} allocated</p>
            </div>
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Section</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Teacher</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody>
                {items.map(s => (
                  <tr key={s.id} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="px-6 py-3">
                      <p className="font-semibold text-slate-900 text-left text-sm">{s.student_name}</p>
                      <p className="text-xs text-slate-500 text-left">{s.roll_number}</p>
                    </td>
                    <td className="px-6 py-3 text-sm text-slate-700 text-left">
                      <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium">{s.section_name}</span>
                    </td>
                    <td className="px-6 py-3 text-sm text-slate-700 text-left">
                      <span className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-medium">{s.teacher_name}</span>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <button onClick={() => handleDelete(s.id)}
                        className="px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))
      )}
    </div>
  );
}
