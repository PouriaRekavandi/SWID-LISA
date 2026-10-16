import React, { useState, useEffect, useRef } from 'react';
import { StudentRecord, StudentDegree, StudentStatus } from '../types';
import { INITIAL_STUDENTS } from '../data/initialData';
import { Upload, Edit2, Trash2, Search, CheckCircle, FileSpreadsheet, FileCode } from 'lucide-react';

interface ThesisRegistryProps {
  onNotify: (msg: string, isError?: boolean) => void;
}

const STORAGE_KEY = 'rkvThesisStudentsV1';
const LEGACY_KEY = 'swidStudents';

export const ThesisRegistry: React.FC<ThesisRegistryProps> = ({ onNotify }) => {
  const [records, setRecords] = useState<StudentRecord[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      const legacy = localStorage.getItem(LEGACY_KEY);
      if (legacy) {
        const parsedLegacy = JSON.parse(legacy);
        if (Array.isArray(parsedLegacy) && parsedLegacy.length > 0) {
          return parsedLegacy.map((r: any, idx: number) => ({
            id: r.id || `legacy-${idx}`,
            name: r.name || 'Unnamed Student',
            degree: (r.degree as StudentDegree) || 'MSc',
            studentId: r.studentId || '',
            title: r.title || 'Untitled Research',
            status: (r.status as StudentStatus) || 'In Progress',
            startDate: r.startDate || '',
            expectedDate: r.expectedDate || '',
            email: r.email || '',
            notes: r.notes || '',
            updatedAt: new Date().toISOString(),
          }));
        }
      }
      return INITIAL_STUDENTS;
    } catch {
      return INITIAL_STUDENTS;
    }
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [degree, setDegree] = useState<StudentDegree>('PhD');
  const [studentId, setStudentId] = useState('');
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [expectedDate, setExpectedDate] = useState('');
  const [status, setStatus] = useState<StudentStatus>('In Progress');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');

  const formRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    } catch (err) {
      console.error('Failed to save students to localStorage', err);
    }
  }, [records]);

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setDegree('PhD');
    setStudentId('');
    setTitle('');
    setStartDate('');
    setExpectedDate('');
    setStatus('In Progress');
    setEmail('');
    setNotes('');
  };

  const handleEdit = (record: StudentRecord) => {
    setEditingId(record.id);
    setName(record.name);
    setDegree(record.degree);
    setStudentId(record.studentId || '');
    setTitle(record.title);
    setStartDate(record.startDate || '');
    setExpectedDate(record.expectedDate || '');
    setStatus(record.status);
    setEmail(record.email || '');
    setNotes(record.notes || '');

    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleDelete = (id: string, studentName: string) => {
    if (window.confirm(`Are you sure you want to remove record for "${studentName}"?`)) {
      setRecords((prev) => prev.filter((r) => r.id !== id));
      if (editingId === id) resetForm();
      onNotify(`Student record for "${studentName}" removed.`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !title.trim()) {
      onNotify('Please fill in student name and thesis title.', true);
      return;
    }

    if (startDate && expectedDate && expectedDate < startDate) {
      onNotify('Expected completion date cannot be earlier than the start date.', true);
      return;
    }

    if (editingId) {
      // Update
      setRecords((prev) =>
        prev.map((r) =>
          r.id === editingId
            ? {
                ...r,
                name: name.trim(),
                degree,
                studentId: studentId.trim(),
                title: title.trim(),
                startDate,
                expectedDate,
                status,
                email: email.trim(),
                notes: notes.trim(),
                updatedAt: new Date().toISOString(),
              }
            : r
        )
      );
      onNotify(`Student record for "${name}" updated successfully.`);
    } else {
      // Create
      const newRec: StudentRecord = {
        id: 'rec-' + Date.now().toString(36),
        name: name.trim(),
        degree,
        studentId: studentId.trim(),
        title: title.trim(),
        startDate,
        expectedDate,
        status,
        email: email.trim(),
        notes: notes.trim(),
        updatedAt: new Date().toISOString(),
      };
      setRecords((prev) => [newRec, ...prev]);
      onNotify(`Student record for "${name}" registered successfully.`);
    }

    resetForm();
  };

  // Export CSV
  const handleExportCSV = () => {
    const cols: (keyof StudentRecord)[] = ['name', 'degree', 'studentId', 'title', 'startDate', 'expectedDate', 'status', 'email', 'notes'];
    const escapeCSV = (val: any) => `"${String(val ?? '').replace(/"/g, '""')}"`;
    const header = cols.map((c) => `"${c}"`).join(',');
    const rows = records.map((r) => cols.map((c) => escapeCSV(r[c])).join(','));
    const csvContent = [header, ...rows].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'swid-thesis-students.csv';
    link.click();
    URL.revokeObjectURL(url);
    onNotify('Thesis registry exported as CSV.');
  };

  // Export JSON
  const handleExportJSON = () => {
    const jsonString = JSON.stringify(records, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'swid-thesis-students.json';
    link.click();
    URL.revokeObjectURL(url);
    onNotify('Thesis registry exported as JSON.');
  };

  // Import JSON
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setRecords(parsed);
          onNotify(`Imported ${parsed.length} student records successfully.`);
        } else {
          onNotify('Imported file does not contain a valid records array.', true);
        }
      } catch (err) {
        onNotify('Failed to parse JSON file.', true);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Filtered Records
  const filteredRecords = records.filter((r) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      r.name.toLowerCase().includes(q) ||
      r.title.toLowerCase().includes(q) ||
      (r.studentId && r.studentId.toLowerCase().includes(q)) ||
      r.degree.toLowerCase().includes(q) ||
      r.status.toLowerCase().includes(q) ||
      (r.notes && r.notes.toLowerCase().includes(q))
    );
  });

  const totalCount = records.length;
  const inProgressCount = records.filter((r) => r.status === 'In Progress').length;
  const completedCount = records.filter((r) => r.status === 'Completed').length;

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr + 'T00:00:00');
      return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString();
    } catch {
      return dateStr;
    }
  };

  const getStatusBadge = (s: StudentStatus) => {
    switch (s) {
      case 'In Progress':
        return 'dark:bg-[#00ff41]/20 dark:text-[#00ff41] dark:border-[#00ff41]/40 bg-emerald-100 text-emerald-800 border border-emerald-300';
      case 'Submitted':
        return 'dark:bg-[#00b8ff]/20 dark:text-[#00b8ff] dark:border-[#00b8ff]/40 bg-sky-100 text-sky-800 border border-sky-300';
      case 'Completed':
        return 'dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/40 bg-emerald-100 text-emerald-900 border border-emerald-400 font-bold';
      case 'On Hold':
        return 'dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/40 bg-amber-100 text-amber-900 border border-amber-300';
      default:
        return 'dark:bg-zinc-800 dark:text-zinc-300 bg-slate-200 text-slate-800';
    }
  };

  return (
    <div className="space-y-8" ref={formRef}>
      {/* Title */}
      <div>
        <div className="inline-block border-b-2 dark:border-[#00b8ff] border-sky-600 pb-1 mb-4">
          <h2 className="font-section-title text-2xl sm:text-3xl md:text-4xl font-bold uppercase tracking-wider dark:text-white text-slate-900 flex items-center">
            <span className="dark:text-[#00ff41] text-emerald-600 font-mono mr-2 select-none">//</span>
            <span>Thesis Student Supervision Registry</span>
          </h2>
        </div>
        <p className="dark:text-zinc-400 text-slate-600 font-mono text-sm max-w-3xl leading-relaxed">
          Supervision tracking, graduate research milestones, dissertation topics, and completion status.
        </p>
      </div>

      {/* Notice Banner */}
      <div className="p-3.5 sm:p-4 dark:bg-[#00b8ff]/[0.08] bg-sky-50 dark:border-[#00b8ff]/30 border-sky-300 border-l-4 dark:border-l-[#00b8ff] border-l-sky-600 rounded-r-lg text-xs sm:text-sm dark:text-[#bdefff] text-sky-900 font-mono leading-relaxed flex items-start gap-3 shadow-xs">
        <CheckCircle className="w-5 h-5 dark:text-[#00b8ff] text-sky-600 flex-none mt-0.5" />
        <div>
          <strong className="dark:text-white text-slate-900">Local Encrypted Cache:</strong> Student records are securely preserved in your browser's persistent storage. Use <strong>Export JSON</strong> or <strong>Export CSV</strong> to save backups or transfer to external institutional archives.
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Register / Edit Student Form */}
        <section className="lg:col-span-5 dark:bg-[#141414]/80 bg-white border dark:border-[#333333] border-slate-200 rounded-xl p-5 sm:p-6 dark:shadow-[0_10px_30px_rgba(0,0,0,0.5)] shadow-md">
          <h3 className="font-orbitron font-bold text-base sm:text-lg dark:text-white text-slate-900 pb-3 border-b-2 dark:border-[#00b8ff] border-sky-600 mb-5 flex items-center justify-between">
            <span>{editingId ? 'Update Record' : 'Register Student'}</span>
            {editingId && (
              <span className="text-[11px] font-mono font-normal dark:text-[#00ff41] text-emerald-700 font-bold">
                Editing Mode
              </span>
            )}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs sm:text-sm">
            <div>
              <label className="block dark:text-zinc-300 text-slate-700 font-bold mb-1.5 text-xs">
                Student Name *
              </label>
              <input
                type="text"
                required
                maxLength={100}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alireza Karimi"
                className="w-full px-3 py-2 dark:bg-[#090909] bg-slate-50 border dark:border-[#3b3b3b] border-slate-300 focus:border-sky-600 dark:focus:border-[#00b8ff] rounded dark:text-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-sky-600 focus:bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block dark:text-zinc-300 text-slate-700 font-bold mb-1.5 text-xs">
                  Degree *
                </label>
                <select
                  value={degree}
                  onChange={(e) => setDegree(e.target.value as StudentDegree)}
                  className="w-full px-3 py-2 dark:bg-[#090909] bg-slate-50 border dark:border-[#3b3b3b] border-slate-300 focus:border-sky-600 dark:focus:border-[#00b8ff] rounded dark:text-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-sky-600 focus:bg-white"
                >
                  <option value="BSc">BSc</option>
                  <option value="MSc">MSc</option>
                  <option value="PhD">PhD</option>
                  <option value="Postdoctoral">Postdoctoral</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block dark:text-zinc-300 text-slate-700 font-bold mb-1.5 text-xs">
                  Student ID
                </label>
                <input
                  type="text"
                  maxLength={40}
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="e.g. UMBC-ME-8831"
                  className="w-full px-3 py-2 dark:bg-[#090909] bg-slate-50 border dark:border-[#3b3b3b] border-slate-300 focus:border-sky-600 dark:focus:border-[#00b8ff] rounded dark:text-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-sky-600 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block dark:text-zinc-300 text-slate-700 font-bold mb-1.5 text-xs">
                Thesis / Dissertation Title *
              </label>
              <textarea
                required
                maxLength={300}
                rows={3}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Full title or preliminary research topic..."
                className="w-full px-3 py-2 dark:bg-[#090909] bg-slate-50 border dark:border-[#3b3b3b] border-slate-300 focus:border-sky-600 dark:focus:border-[#00b8ff] rounded dark:text-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-sky-600 focus:bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block dark:text-zinc-300 text-slate-700 font-bold mb-1.5 text-xs">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 dark:bg-[#090909] bg-slate-50 border dark:border-[#3b3b3b] border-slate-300 focus:border-sky-600 dark:focus:border-[#00b8ff] rounded dark:text-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-sky-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block dark:text-zinc-300 text-slate-700 font-bold mb-1.5 text-xs">
                  Expected Completion
                </label>
                <input
                  type="date"
                  value={expectedDate}
                  onChange={(e) => setExpectedDate(e.target.value)}
                  className="w-full px-3 py-2 dark:bg-[#090909] bg-slate-50 border dark:border-[#3b3b3b] border-slate-300 focus:border-sky-600 dark:focus:border-[#00b8ff] rounded dark:text-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-sky-600 focus:bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block dark:text-zinc-300 text-slate-700 font-bold mb-1.5 text-xs">
                  Status *
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as StudentStatus)}
                  className="w-full px-3 py-2 dark:bg-[#090909] bg-slate-50 border dark:border-[#3b3b3b] border-slate-300 focus:border-sky-600 dark:focus:border-[#00b8ff] rounded dark:text-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-sky-600 focus:bg-white"
                >
                  <option value="In Progress">In Progress</option>
                  <option value="Submitted">Submitted</option>
                  <option value="Completed">Completed</option>
                  <option value="On Hold">On Hold</option>
                </select>
              </div>

              <div>
                <label className="block dark:text-zinc-300 text-slate-700 font-bold mb-1.5 text-xs">
                  Institutional Email
                </label>
                <input
                  type="email"
                  maxLength={120}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@umbc.edu"
                  className="w-full px-3 py-2 dark:bg-[#090909] bg-slate-50 border dark:border-[#3b3b3b] border-slate-300 focus:border-sky-600 dark:focus:border-[#00b8ff] rounded dark:text-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-sky-600 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block dark:text-zinc-300 text-slate-700 font-bold mb-1.5 text-xs">
                Progress Notes
              </label>
              <textarea
                maxLength={800}
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Milestones, exams passed, committee feedback..."
                className="w-full px-3 py-2 dark:bg-[#090909] bg-slate-50 border dark:border-[#3b3b3b] border-slate-300 focus:border-sky-600 dark:focus:border-[#00b8ff] rounded dark:text-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-sky-600 focus:bg-white"
              />
            </div>

            <div className="flex items-center gap-3 pt-3">
              <button
                type="submit"
                className="flex-1 py-2.5 px-4 dark:bg-[#00ff41] dark:hover:bg-[#00ff41]/90 dark:text-[#050505] bg-emerald-600 hover:bg-emerald-700 text-white font-orbitron font-bold text-xs uppercase tracking-wider rounded transition-all duration-200 dark:hover:shadow-[0_0_15px_rgba(0,255,65,0.6)] shadow-sm cursor-pointer"
              >
                {editingId ? 'Update Record' : 'Save Student'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="py-2.5 px-4 dark:bg-zinc-800 bg-slate-200 hover:bg-slate-300 dark:hover:bg-zinc-700 dark:text-zinc-300 text-slate-700 font-orbitron font-bold text-xs uppercase tracking-wider rounded transition-colors cursor-pointer"
              >
                Clear
              </button>
            </div>
          </form>
        </section>

        {/* Right Column: Statistics & Data Table */}
        <section className="lg:col-span-7 space-y-4">
          {/* Statistics row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="dark:bg-[#0c0c0c] bg-white border dark:border-zinc-800 border-slate-200 rounded-lg p-3.5 text-center shadow-xs">
              <span className="block font-orbitron text-xl sm:text-2xl font-bold dark:text-[#00ff41] text-emerald-700">
                {totalCount}
              </span>
              <span className="text-[11px] font-mono dark:text-zinc-400 text-slate-600 uppercase tracking-wider">
                Total Supervised
              </span>
            </div>

            <div className="dark:bg-[#0c0c0c] bg-white border dark:border-zinc-800 border-slate-200 rounded-lg p-3.5 text-center shadow-xs">
              <span className="block font-orbitron text-xl sm:text-2xl font-bold dark:text-[#00b8ff] text-sky-700">
                {inProgressCount}
              </span>
              <span className="text-[11px] font-mono dark:text-zinc-400 text-slate-600 uppercase tracking-wider">
                In Progress
              </span>
            </div>

            <div className="dark:bg-[#0c0c0c] bg-white border dark:border-zinc-800 border-slate-200 rounded-lg p-3.5 text-center shadow-xs">
              <span className="block font-orbitron text-xl sm:text-2xl font-bold dark:text-emerald-400 text-emerald-700">
                {completedCount}
              </span>
              <span className="text-[11px] font-mono dark:text-zinc-400 text-slate-600 uppercase tracking-wider">
                Defended / Complete
              </span>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 dark:bg-[#111111] bg-slate-100 p-3 rounded-lg border dark:border-zinc-800 border-slate-200">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name, title, ID, status..."
                className="w-full pl-9 pr-3 py-1.5 dark:bg-[#080808] bg-white border dark:border-zinc-700 border-slate-300 focus:border-sky-600 dark:focus:border-[#00b8ff] rounded text-xs dark:text-white text-slate-900 placeholder:text-zinc-400 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleExportCSV}
                className="px-2.5 py-1.5 dark:bg-zinc-800 bg-white hover:bg-slate-50 border border-slate-300 dark:border-transparent dark:text-zinc-200 text-slate-700 text-xs font-mono font-bold rounded flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                title="Export as CSV spreadsheet"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 dark:text-[#00ff41] text-emerald-600" />
                CSV
              </button>

              <button
                type="button"
                onClick={handleExportJSON}
                className="px-2.5 py-1.5 dark:bg-zinc-800 bg-white hover:bg-slate-50 border border-slate-300 dark:border-transparent dark:text-zinc-200 text-slate-700 text-xs font-mono font-bold rounded flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                title="Export as JSON file"
              >
                <FileCode className="w-3.5 h-3.5 dark:text-[#00b8ff] text-sky-600" />
                JSON
              </button>

              <label className="px-2.5 py-1.5 dark:bg-zinc-800 bg-white hover:bg-slate-50 border border-slate-300 dark:border-transparent dark:text-zinc-200 text-slate-700 text-xs font-mono font-bold rounded flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs">
                <Upload className="w-3.5 h-3.5 text-zinc-500" />
                Import
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/json,.json"
                  onChange={handleImportJSON}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Table Wrap */}
          <div className="overflow-x-auto border dark:border-zinc-800 border-slate-200 rounded-lg dark:bg-[#0e1217] bg-white shadow-sm">
            <table className="w-full text-left font-mono text-xs border-collapse">
              <thead>
                <tr className="dark:bg-[#05070a] bg-slate-100 border-b dark:border-zinc-800 border-slate-200 dark:text-[#00b8ff] text-sky-800 uppercase tracking-wider text-[11px]">
                  <th className="p-3">Student</th>
                  <th className="p-3">Thesis Topic</th>
                  <th className="p-3">Timeline</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-zinc-800/60 divide-slate-200">
                {filteredRecords.length > 0 ? (
                  filteredRecords.map((r) => (
                    <tr key={r.id} className="dark:hover:bg-[#00b8ff]/[0.03] hover:bg-slate-50 transition-colors">
                      <td className="p-3 align-top min-w-[150px]">
                        <div className="font-bold dark:text-white text-slate-900 text-sm">{r.name}</div>
                        <div className="dark:text-zinc-400 text-slate-500 text-[11px] mt-0.5">
                          <span className="dark:text-[#00ff41] text-emerald-700 font-bold">{r.degree}</span>
                          {r.studentId && <span> · {r.studentId}</span>}
                        </div>
                        {r.email && (
                          <div className="dark:text-zinc-500 text-slate-400 text-[11px] mt-0.5">
                            {r.email}
                          </div>
                        )}
                      </td>

                      <td className="p-3 align-top min-w-[220px]">
                        <div className="dark:text-zinc-200 text-slate-800 font-medium leading-relaxed">
                          {r.title}
                        </div>
                        {r.notes && (
                          <div className="dark:text-zinc-400 text-slate-600 text-[11px] italic mt-1 dark:bg-black/40 bg-slate-50 p-1.5 rounded border dark:border-zinc-800/80 border-slate-200">
                            {r.notes}
                          </div>
                        )}
                      </td>

                      <td className="p-3 align-top whitespace-nowrap dark:text-zinc-400 text-slate-600 text-[11px]">
                        <div>
                          <span className="dark:text-zinc-500 text-slate-400">Start:</span> {formatDate(r.startDate)}
                        </div>
                        <div className="mt-0.5">
                          <span className="dark:text-zinc-500 text-slate-400">Exp:</span> {formatDate(r.expectedDate)}
                        </div>
                      </td>

                      <td className="p-3 align-top whitespace-nowrap">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${getStatusBadge(r.status)}`}>
                          {r.status}
                        </span>
                      </td>

                      <td className="p-3 align-top text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleEdit(r)}
                            className="p-1.5 rounded dark:hover:bg-zinc-800 hover:bg-slate-200 dark:text-zinc-300 text-slate-600 hover:text-sky-600 dark:hover:text-[#00b8ff] transition-colors cursor-pointer"
                            title="Edit record"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(r.id, r.name)}
                            className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-950/40 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer"
                            title="Delete record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500">
                      No student records match the search criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
};
