import React, { useState } from 'react';
import { Clock, Plus, MapPin, CheckCircle, AlertCircle, Edit2, Trash2, BookOpen, Layers, WifiOff, Sparkles, ChevronRight } from 'lucide-react';
import { Subject, TimeSlot, DayOfWeek, ClassReview } from '../types';

interface ScheduleTimeBlockerProps {
  subjects: Subject[];
  timeSlots: TimeSlot[];
  reviews: ClassReview[];
  currentDay: DayOfWeek;
  onSelectDay: (day: DayOfWeek) => void;
  onOpenReviewModal: (slot: TimeSlot) => void;
  onAddTimeSlot: (slot: Omit<TimeSlot, 'id'>) => void;
  onDeleteTimeSlot: (slotId: string) => void;
  onOpenSubjectManager: () => void;
}

const DAYS: Array<{ key: DayOfWeek; label: string; full: string }> = [
  { key: 'mon', label: 'Mon', full: 'Monday' },
  { key: 'tue', label: 'Tue', full: 'Tuesday' },
  { key: 'wed', label: 'Wed', full: 'Wednesday' },
  { key: 'thu', label: 'Thu', full: 'Thursday' },
  { key: 'fri', label: 'Fri', full: 'Friday' },
  { key: 'sat', label: 'Sat', full: 'Saturday' },
];

export const ScheduleTimeBlocker: React.FC<ScheduleTimeBlockerProps> = ({
  subjects,
  timeSlots,
  reviews,
  currentDay,
  onSelectDay,
  onOpenReviewModal,
  onAddTimeSlot,
  onDeleteTimeSlot,
  onOpenSubjectManager,
}) => {
  const [showAddSlot, setShowAddSlot] = useState(false);
  const [newSubId, setNewSubId] = useState(subjects[0]?.id || '');
  const [newStartTime, setNewStartTime] = useState('09:30');
  const [newEndTime, setNewEndTime] = useState('10:20');
  const [newRoom, setNewRoom] = useState('');
  const [newNotes, setNewNotes] = useState('');

  // Filter slots for active day and sort chronologically
  const activeDaySlots = timeSlots
    .filter((slot) => slot.dayOfWeek === currentDay)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  // Determine current time in HH:mm
  const now = new Date();
  const currentHours = now.getHours().toString().padStart(2, '0');
  const currentMinutes = now.getMinutes().toString().padStart(2, '0');
  const currentTimeString = `${currentHours}:${currentMinutes}`;

  const isViewingActualDay = (() => {
    const todayIndex = now.getDay();
    const map: Record<number, DayOfWeek> = { 1: 'mon', 2: 'tue', 3: 'wed', 4: 'thu', 5: 'fri', 6: 'sat' };
    return map[todayIndex] === currentDay;
  })();

  const activeSlot = isViewingActualDay
    ? activeDaySlots.find(
        (slot) => currentTimeString >= slot.startTime && currentTimeString <= slot.endTime
      )
    : null;

  const calculateDuration = (start: string, end: string) => {
    const [h1, m1] = start.split(':').map(Number);
    const [h2, m2] = end.split(':').map(Number);
    return (h2 * 60 + m2) - (h1 * 60 + m1);
  };

  const handleCreateSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubId) return;

    onAddTimeSlot({
      dayOfWeek: currentDay,
      startTime: newStartTime,
      endTime: newEndTime,
      subjectId: newSubId,
      room: newRoom.trim() || undefined,
      notes: newNotes.trim() || undefined,
    });

    setShowAddSlot(false);
    setNewRoom('');
    setNewNotes('');
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800/90 rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col gap-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-100">College Schedule & Time Blocks</h2>
            <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
              <WifiOff className="w-2.5 h-2.5" /> Offline-Ready
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            9:30 AM – 4:30 PM · Tap any class to log your review immediately.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={onOpenSubjectManager}
            className="min-h-[40px] flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800/90 hover:bg-slate-800 active:scale-95 border border-slate-700/80 rounded-xl transition-all cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span>Subjects</span>
          </button>

          <button
            onClick={() => setShowAddSlot(!showAddSlot)}
            className="min-h-[40px] flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:scale-95 rounded-xl transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Slot</span>
          </button>
        </div>
      </div>

      {/* Horizontal Touch Day Scroller */}
      <div className="overflow-x-auto -mx-1 px-1 py-1 flex items-center gap-2 no-scrollbar">
        {DAYS.map((d) => {
          const isSelected = d.key === currentDay;
          const slotCount = timeSlots.filter((s) => s.dayOfWeek === d.key).length;
          return (
            <button
              key={d.key}
              onClick={() => onSelectDay(d.key)}
              className={`min-w-[68px] sm:min-w-[76px] py-2.5 px-3 rounded-2xl text-xs font-semibold transition-all flex flex-col items-center gap-0.5 active:scale-95 cursor-pointer shrink-0 ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25 ring-2 ring-indigo-400/40'
                  : 'bg-slate-800/70 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <span className="uppercase tracking-wider text-[11px]">{d.label}</span>
              <span className={`text-[10px] tabular-nums ${isSelected ? 'text-indigo-100' : 'text-slate-500'}`}>
                {slotCount} {slotCount === 1 ? 'class' : 'classes'}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Class Highlight Banner */}
      {activeSlot && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-indigo-950/60 via-purple-950/40 to-slate-900 border border-indigo-500/40 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 animate-pulse" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">
                  Current Class In Session
                </span>
                <span className="text-xs text-slate-400 font-mono tabular-nums">
                  {activeSlot.startTime} – {activeSlot.endTime}
                </span>
              </div>

              {(() => {
                const sub = subjects.find((s) => s.id === activeSlot.subjectId);
                return (
                  <div className="text-base sm:text-lg font-bold text-slate-100 mt-0.5">
                    {sub ? sub.name : 'College Lecture'} ({sub?.code})
                  </div>
                );
              })()}

              <div className="text-xs text-slate-400 flex items-center gap-2 mt-1">
                {activeSlot.room && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-500" /> {activeSlot.room}
                  </span>
                )}
                {activeSlot.notes && <span>· {activeSlot.notes}</span>}
              </div>
            </div>
          </div>

          <button
            onClick={() => onOpenReviewModal(activeSlot)}
            className="min-h-[44px] w-full sm:w-auto px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 active:scale-95 rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            <Edit2 className="w-4 h-4" />
            <span>Review Class Now</span>
          </button>
        </div>
      )}

      {/* Add Slot Form Drawer */}
      {showAddSlot && (
        <form onSubmit={handleCreateSlot} className="p-4 sm:p-5 bg-slate-950/90 rounded-2xl border border-slate-800 flex flex-col gap-4">
          <div className="text-xs font-bold text-slate-200">
            Add New Time Block · {DAYS.find((d) => d.key === currentDay)?.full}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="text-[11px] font-medium text-slate-400 block mb-1">Subject</label>
              <select
                value={newSubId}
                onChange={(e) => setNewSubId(e.target.value)}
                className="w-full min-h-[42px] bg-slate-900 border border-slate-700 rounded-xl px-3 text-xs text-slate-200"
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-medium text-slate-400 block mb-1">Start Time</label>
              <input
                type="time"
                value={newStartTime}
                onChange={(e) => setNewStartTime(e.target.value)}
                className="w-full min-h-[42px] bg-slate-900 border border-slate-700 rounded-xl px-3 text-xs text-slate-200"
              />
            </div>

            <div>
              <label className="text-[11px] font-medium text-slate-400 block mb-1">End Time</label>
              <input
                type="time"
                value={newEndTime}
                onChange={(e) => setNewEndTime(e.target.value)}
                className="w-full min-h-[42px] bg-slate-900 border border-slate-700 rounded-xl px-3 text-xs text-slate-200"
              />
            </div>

            <div>
              <label className="text-[11px] font-medium text-slate-400 block mb-1">Room / Hall</label>
              <input
                type="text"
                placeholder="e.g. Hall 204"
                value={newRoom}
                onChange={(e) => setNewRoom(e.target.value)}
                className="w-full min-h-[42px] bg-slate-900 border border-slate-700 rounded-xl px-3 text-xs text-slate-200"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-medium text-slate-400 block mb-1">Notes / Practical Details</label>
            <input
              type="text"
              placeholder="e.g. Bring lab coat, project submission, viva session"
              value={newNotes}
              onChange={(e) => setNewNotes(e.target.value)}
              className="w-full min-h-[42px] bg-slate-900 border border-slate-700 rounded-xl px-3 text-xs text-slate-200 placeholder-slate-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowAddSlot(false)}
              className="min-h-[40px] px-4 text-xs font-medium text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="min-h-[40px] px-5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-colors cursor-pointer"
            >
              Save Time Slot
            </button>
          </div>
        </form>
      )}

      {/* Class Schedule Timeline Feed */}
      <div className="flex flex-col gap-3">
        {activeDaySlots.length === 0 ? (
          <div className="py-14 text-center border border-dashed border-slate-800 rounded-2xl text-slate-500 flex flex-col items-center">
            <Clock className="w-10 h-10 mb-2 opacity-30" />
            <p className="text-sm font-semibold text-slate-300">No classes scheduled for {DAYS.find((d) => d.key === currentDay)?.full}.</p>
            <p className="text-xs text-slate-500 mt-1">Tap &quot;Add Slot&quot; to build your time blocks.</p>
          </div>
        ) : (
          activeDaySlots.map((slot, index) => {
            const subject = subjects.find((s) => s.id === slot.subjectId);
            const duration = calculateDuration(slot.startTime, slot.endTime);
            const review = reviews.find((r) => r.slotId === slot.id);

            return (
              <div
                key={slot.id}
                onClick={() => onOpenReviewModal(slot)}
                className={`group relative p-4 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 active:scale-[0.99] ${
                  review
                    ? 'bg-slate-850/60 border-slate-800 hover:border-slate-700'
                    : 'bg-slate-800/70 border-slate-800 hover:border-indigo-500/50 shadow-sm'
                }`}
              >
                {/* Left Information */}
                <div className="flex items-start gap-3.5 min-w-0">
                  {/* Color Accent Indicator Pill */}
                  <div
                    className="w-2.5 h-12 rounded-full shrink-0 mt-0.5"
                    style={{ backgroundColor: subject?.color || '#6366f1' }}
                  />

                  <div className="min-w-0 flex-1">
                    {/* Time & Duration Header */}
                    <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                      <span className="font-bold text-slate-200 tabular-nums">{slot.startTime} – {slot.endTime}</span>
                      <span>·</span>
                      <span className="text-slate-400 tabular-nums">{duration}m</span>
                      {slot.room && (
                        <>
                          <span>·</span>
                          <span className="flex items-center gap-0.5 text-slate-400 truncate">
                            <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                            {slot.room}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Subject Title */}
                    <div className="text-sm sm:text-base font-bold text-slate-100 truncate mt-0.5">
                      {subject ? subject.name : 'Unknown Subject'}
                      {subject?.code && (
                        <span className="text-xs font-normal text-slate-400 ml-1.5 font-mono">
                          {subject.code}
                        </span>
                      )}
                    </div>

                    {slot.notes && (
                      <p className="text-xs text-amber-400/90 truncate mt-0.5">
                        {slot.notes}
                      </p>
                    )}

                    {/* Review Snippet Tags */}
                    {review && (
                      <div className="flex flex-wrap items-center gap-1.5 mt-2 text-[11px]">
                        <span className="text-emerald-400 font-semibold flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Reviewed
                        </span>
                        {review.topicNotUnderstood && review.topicName && (
                          <span className="text-rose-300 bg-rose-500/15 border border-rose-500/30 px-2 py-0.5 rounded-md truncate max-w-[200px]">
                            {review.topicName}
                          </span>
                        )}
                        {review.hasHomework && (
                          <span className="text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-md">
                            HW due
                          </span>
                        )}
                        {review.hasAssignment && (
                          <span className="text-purple-300 bg-purple-500/15 border border-purple-500/30 px-2 py-0.5 rounded-md">
                            Assignment
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Action Trigger */}
                <div className="flex items-center justify-between sm:justify-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/80 shrink-0">
                  <span
                    className={`min-h-[38px] px-3.5 py-1.5 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors ${
                      review
                        ? 'bg-slate-800 text-slate-300 group-hover:bg-slate-700'
                        : 'bg-indigo-600/90 text-white group-hover:bg-indigo-500 shadow-sm'
                    }`}
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>{review ? 'Edit Review' : 'Review Class'}</span>
                    <ChevronRight className="w-3 h-3 opacity-60" />
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteTimeSlot(slot.id);
                    }}
                    className="min-h-[38px] min-w-[38px] flex items-center justify-center text-slate-500 hover:text-rose-400 p-1.5 rounded-lg active:scale-95 transition-colors cursor-pointer"
                    title="Delete Time Slot"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
