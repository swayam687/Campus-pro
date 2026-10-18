import React, { useState } from 'react';
import { X, Plus, Trash2, Edit2, Layers, BookOpen, Laptop, FlaskConical, Calculator } from 'lucide-react';
import { Subject } from '../types';

interface SubjectManagerModalProps {
  subjects: Subject[];
  isOpen: boolean;
  onClose: () => void;
  onSaveSubject: (subject: Subject) => void;
  onDeleteSubject: (subjectId: string) => void;
}

const PRESET_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Emerald
  '#8B5CF6', // Purple
  '#F59E0B', // Amber
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#F97316', // Orange
  '#14B8A6', // Teal
];

export const SubjectManagerModal: React.FC<SubjectManagerModalProps> = ({
  subjects,
  isOpen,
  onClose,
  onSaveSubject,
  onDeleteSubject,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [room, setRoom] = useState('');
  const [professor, setProfessor] = useState('');
  const [requiresLaptop, setRequiresLaptop] = useState(false);
  const [requiresLabKit, setRequiresLabKit] = useState(false);
  const [requiresCalculator, setRequiresCalculator] = useState(false);
  const [materialsStr, setMaterialsStr] = useState('');

  if (!isOpen) return null;

  const handleEdit = (sub: Subject) => {
    setEditingId(sub.id);
    setName(sub.name);
    setCode(sub.code);
    setColor(sub.color);
    setRoom(sub.room);
    setProfessor(sub.professor || '');
    setRequiresLaptop(Boolean(sub.requiresLaptop));
    setRequiresLabKit(Boolean(sub.requiresLabKit));
    setRequiresCalculator(Boolean(sub.requiresCalculator));
    setMaterialsStr(sub.defaultMaterials.join(', '));
  };

  const handleResetForm = () => {
    setEditingId(null);
    setName('');
    setCode('');
    setColor(PRESET_COLORS[0]);
    setRoom('');
    setProfessor('');
    setRequiresLaptop(false);
    setRequiresLabKit(false);
    setRequiresCalculator(false);
    setMaterialsStr('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const materials = materialsStr
      .split(',')
      .map((m) => m.trim())
      .filter(Boolean);

    const updated: Subject = {
      id: editingId || `sub-${Date.now()}`,
      name: name.trim(),
      code: code.trim() || 'SUB',
      color,
      room: room.trim() || 'Room 101',
      professor: professor.trim() || undefined,
      requiresLaptop,
      requiresLabKit,
      requiresCalculator,
      defaultMaterials: materials.length > 0 ? materials : [`${name.trim()} Notebook`],
    };

    onSaveSubject(updated);
    handleResetForm();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-start justify-between gap-4 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">Manage College Subjects</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Customize your course catalog, color codes, equipment & bag packing items.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 bg-slate-800/80 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 flex flex-col gap-6 max-h-[75vh] overflow-y-auto">
          {/* Subject Form */}
          <form onSubmit={handleSubmit} className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200">
                {editingId ? 'Edit Subject' : 'Add New Subject'}
              </span>
              {editingId && (
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="text-[11px] text-slate-400 hover:text-slate-200 underline cursor-pointer"
                >
                  Cancel Edit
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Subject Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Artificial Intelligence"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Course Code</label>
                <input
                  type="text"
                  placeholder="e.g. CS401"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Default Room / Hall</label>
                <input
                  type="text"
                  placeholder="e.g. Hall 204"
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Professor Name (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Vance"
                  value={professor}
                  onChange={(e) => setProfessor(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Color swatches */}
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Subject Color</label>
              <div className="flex items-center gap-2">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-6 h-6 rounded-full transition-transform cursor-pointer ${
                      color === c ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-slate-950' : 'hover:scale-110'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            {/* Gear & Bag packing flags */}
            <div>
              <label className="text-[11px] text-slate-400 block mb-1.5">
                Gear Needed for this Subject (Packs in Bag):
              </label>
              <div className="flex flex-wrap items-center gap-3">
                <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={requiresLaptop}
                    onChange={(e) => setRequiresLaptop(e.target.checked)}
                    className="rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-0"
                  />
                  <span>Laptop</span>
                </label>

                <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={requiresLabKit}
                    onChange={(e) => setRequiresLabKit(e.target.checked)}
                    className="rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-0"
                  />
                  <span>Lab Coat / Kit</span>
                </label>

                <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={requiresCalculator}
                    onChange={(e) => setRequiresCalculator(e.target.checked)}
                    className="rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-0"
                  />
                  <span>Calculator</span>
                </label>
              </div>
            </div>

            {/* Materials String */}
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">
                Books / Notebooks to Pack (Comma-separated)
              </label>
              <input
                type="text"
                placeholder="e.g. AI Textbook, Lecture Notebook"
                value={materialsStr}
                onChange={(e) => setMaterialsStr(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors cursor-pointer"
              >
                {editingId ? 'Update Subject' : 'Add Subject'}
              </button>
            </div>
          </form>

          {/* Current Subjects List */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Active Courses ({subjects.length})
            </span>

            <div className="flex flex-col gap-2">
              {subjects.map((sub) => (
                <div
                  key={sub.id}
                  className="p-3 rounded-xl bg-slate-800/60 border border-slate-800 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-3.5 h-3.5 rounded-full shrink-0"
                      style={{ backgroundColor: sub.color }}
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-100 truncate">{sub.name}</span>
                        <span className="text-[10px] font-mono text-slate-400">{sub.code}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {sub.room} · {sub.defaultMaterials.join(', ')}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleEdit(sub)}
                      className="p-1.5 text-slate-400 hover:text-slate-200 bg-slate-900 rounded-lg cursor-pointer"
                      title="Edit Subject"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {subjects.length > 1 && (
                      <button
                        onClick={() => onDeleteSubject(sub.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 bg-slate-900 rounded-lg cursor-pointer"
                        title="Delete Subject"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
