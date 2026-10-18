import React, { useState, useEffect } from 'react';
import { X, CheckSquare, Square, AlertCircle, BookOpen, Clock, Calendar, Star, FileText, CheckCircle2, ChevronDown } from 'lucide-react';
import { Subject, TimeSlot, ClassReview } from '../types';
import { getTodayDateString } from '../utils/storage';
import { triggerHaptic } from '../utils/haptics';

interface PostClassReviewModalProps {
  slot: TimeSlot | null;
  subject: Subject | null;
  existingReview: ClassReview | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveReview: (reviewData: Omit<ClassReview, 'id' | 'createdAt'>) => void;
}

export const PostClassReviewModal: React.FC<PostClassReviewModalProps> = ({
  slot,
  subject,
  existingReview,
  isOpen,
  onClose,
  onSaveReview,
}) => {
  const [topicNotUnderstood, setTopicNotUnderstood] = useState(false);
  const [topicName, setTopicName] = useState('');
  const [needRevision, setNeedRevision] = useState(false);
  const [revisionPriority, setRevisionPriority] = useState<'low' | 'medium' | 'high'>('medium');

  const [hasHomework, setHasHomework] = useState(false);
  const [homeworkTitle, setHomeworkTitle] = useState('');
  const [homeworkDeadline, setHomeworkDeadline] = useState('');

  const [hasAssignment, setHasAssignment] = useState(false);
  const [assignmentTitle, setAssignmentTitle] = useState('');
  const [assignmentDeadline, setAssignmentDeadline] = useState('');

  const [clarityRating, setClarityRating] = useState(4);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (existingReview) {
      setTopicNotUnderstood(existingReview.topicNotUnderstood);
      setTopicName(existingReview.topicName || '');
      setNeedRevision(existingReview.needRevision);
      setRevisionPriority(existingReview.revisionPriority || 'medium');
      setHasHomework(existingReview.hasHomework);
      setHomeworkTitle(existingReview.homeworkTitle || '');
      setHomeworkDeadline(existingReview.homeworkDeadline || '');
      setHasAssignment(existingReview.hasAssignment);
      setAssignmentTitle(existingReview.assignmentTitle || '');
      setAssignmentDeadline(existingReview.assignmentDeadline || '');
      setClarityRating(existingReview.clarityRating || 4);
      setNotes(existingReview.notes || '');
    } else {
      const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
      const nextWeek = new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0];

      setTopicNotUnderstood(false);
      setTopicName('');
      setNeedRevision(false);
      setRevisionPriority('medium');
      setHasHomework(false);
      setHomeworkTitle('');
      setHomeworkDeadline(`${tomorrow}T23:59`);
      setHasAssignment(false);
      setAssignmentTitle('');
      setAssignmentDeadline(`${nextWeek}T18:00`);
      setClarityRating(4);
      setNotes('');
    }
  }, [existingReview, isOpen]);

  if (!isOpen || !slot || !subject) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic('success');

    onSaveReview({
      slotId: slot.id,
      subjectId: subject.id,
      date: getTodayDateString(),
      topicNotUnderstood,
      topicName: topicNotUnderstood ? topicName.trim() : '',
      needRevision,
      revisionPriority,
      hasHomework,
      homeworkTitle: hasHomework ? homeworkTitle.trim() : '',
      homeworkDeadline: hasHomework ? homeworkDeadline : '',
      hasAssignment,
      assignmentTitle: hasAssignment ? assignmentTitle.trim() : '',
      assignmentDeadline: hasAssignment ? assignmentDeadline : '',
      clarityRating,
      notes: notes.trim() || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-hidden">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative z-10 w-full max-w-xl bg-slate-900 border-t sm:border border-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[85vh]">
        {/* Mobile Drag Handle */}
        <div className="w-12 h-1.5 bg-slate-700/80 rounded-full mx-auto mt-3 mb-1 sm:hidden shrink-0" />

        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-start justify-between gap-3 bg-slate-950/70 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: subject.color }}
              />
              <h3 className="text-base sm:text-lg font-bold text-slate-100">Post-Class Micro-Review</h3>
            </div>
            <div className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-2">
              <span className="font-semibold text-slate-200">{subject.name}</span>
              <span>·</span>
              <span className="font-mono tabular-nums">{slot.startTime} – {slot.endTime}</span>
              {slot.room && <span>· Room: {slot.room}</span>}
            </div>
          </div>

          <button
            onClick={() => {
              triggerHaptic('light');
              onClose();
            }}
            className="min-h-[38px] min-w-[38px] flex items-center justify-center text-slate-400 hover:text-slate-200 bg-slate-800/80 rounded-xl active:scale-95 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 flex flex-col gap-4 overflow-y-auto flex-1">
          {/* Lecture Clarity Rating */}
          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300">
              Lecture Clarity:
            </span>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    setClarityRating(star);
                  }}
                  className="min-h-[38px] min-w-[38px] flex items-center justify-center text-amber-400 hover:scale-110 active:scale-90 transition-transform cursor-pointer"
                >
                  <Star
                    className={`w-5 h-5 ${
                      star <= clarityRating ? 'fill-amber-400 text-amber-400' : 'text-slate-700'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Section 1: Topic Not Understood (Multi-select) */}
          <div className={`p-4 rounded-2xl border transition-all flex flex-col gap-3 ${
            topicNotUnderstood
              ? 'bg-rose-950/20 border-rose-500/40'
              : 'bg-slate-950/50 border-slate-800'
          }`}>
            <div
              onClick={() => {
                triggerHaptic('medium');
                setTopicNotUnderstood(!topicNotUnderstood);
              }}
              className="flex items-center justify-between cursor-pointer select-none active:scale-[0.99]"
            >
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-md flex items-center justify-center ${
                  topicNotUnderstood ? 'bg-rose-500 text-white' : 'border-2 border-slate-600'
                }`}>
                  {topicNotUnderstood && <CheckCircle2 className="w-4 h-4 stroke-[3]" />}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-200">
                    Topic Not Understood
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Log immediately to revise when reaching home
                  </div>
                </div>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                topicNotUnderstood ? 'bg-rose-500/20 text-rose-400' : 'text-slate-500'
              }`}>
                {topicNotUnderstood ? 'Flagged' : 'None'}
              </span>
            </div>

            {topicNotUnderstood && (
              <div className="pt-2 border-t border-slate-800 flex flex-col gap-1.5">
                <label className="text-[11px] font-medium text-slate-400">
                  Topic Name to Revise Tonight:
                </label>
                <input
                  type="text"
                  required={topicNotUnderstood}
                  placeholder="e.g. B-Tree balancing, Normalization BCNF"
                  value={topicName}
                  onChange={(e) => setTopicName(e.target.value)}
                  className="w-full min-h-[44px] bg-slate-900 border border-slate-700 rounded-xl px-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
              </div>
            )}
          </div>

          {/* Section 2: Need Revision (Multi-select) */}
          <div className={`p-4 rounded-2xl border transition-all flex flex-col gap-3 ${
            needRevision
              ? 'bg-amber-950/20 border-amber-500/40'
              : 'bg-slate-950/50 border-slate-800'
          }`}>
            <div
              onClick={() => {
                triggerHaptic('medium');
                setNeedRevision(!needRevision);
              }}
              className="flex items-center justify-between cursor-pointer select-none active:scale-[0.99]"
            >
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-md flex items-center justify-center ${
                  needRevision ? 'bg-amber-500 text-slate-950' : 'border-2 border-slate-600'
                }`}>
                  {needRevision && <CheckCircle2 className="w-4 h-4 stroke-[3]" />}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-200">
                    Need Revision for This Class
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Adds directly to evening study queue
                  </div>
                </div>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                needRevision ? 'bg-amber-500/20 text-amber-400' : 'text-slate-500'
              }`}>
                {needRevision ? 'Queued' : 'Optional'}
              </span>
            </div>

            {needRevision && (
              <div className="pt-2 border-t border-slate-800 flex items-center gap-2">
                <span className="text-[11px] font-medium text-slate-400">Priority:</span>
                {(['low', 'medium', 'high'] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => {
                      triggerHaptic('light');
                      setRevisionPriority(p);
                    }}
                    className={`min-h-[36px] flex-1 text-xs font-bold rounded-xl uppercase transition-all cursor-pointer ${
                      revisionPriority === p
                        ? p === 'high'
                          ? 'bg-rose-600 text-white shadow-md'
                          : p === 'medium'
                          ? 'bg-amber-600 text-white shadow-md'
                          : 'bg-slate-700 text-white'
                        : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Section 3: Any Homework? (Multi-select) */}
          <div className={`p-4 rounded-2xl border transition-all flex flex-col gap-3 ${
            hasHomework
              ? 'bg-sky-950/20 border-sky-500/40'
              : 'bg-slate-950/50 border-slate-800'
          }`}>
            <div
              onClick={() => {
                triggerHaptic('medium');
                setHasHomework(!hasHomework);
              }}
              className="flex items-center justify-between cursor-pointer select-none active:scale-[0.99]"
            >
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-md flex items-center justify-center ${
                  hasHomework ? 'bg-sky-500 text-slate-950' : 'border-2 border-slate-600'
                }`}>
                  {hasHomework && <CheckCircle2 className="w-4 h-4 stroke-[3]" />}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-200">
                    Any Homework Assigned?
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Track exercises and due date
                  </div>
                </div>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                hasHomework ? 'bg-sky-500/20 text-sky-400' : 'text-slate-500'
              }`}>
                {hasHomework ? 'Yes' : 'None'}
              </span>
            </div>

            {hasHomework && (
              <div className="pt-2 border-t border-slate-800 flex flex-col gap-2.5">
                <div>
                  <label className="text-[11px] font-medium text-slate-400 block mb-1">
                    Homework Task / Problems:
                  </label>
                  <input
                    type="text"
                    required={hasHomework}
                    placeholder="e.g. Chapter 4 problems 12 to 18"
                    value={homeworkTitle}
                    onChange={(e) => setHomeworkTitle(e.target.value)}
                    className="w-full min-h-[44px] bg-slate-900 border border-slate-700 rounded-xl px-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-medium text-slate-400 block mb-1">
                    Homework Deadline:
                  </label>
                  <input
                    type="datetime-local"
                    required={hasHomework}
                    value={homeworkDeadline}
                    onChange={(e) => setHomeworkDeadline(e.target.value)}
                    className="w-full min-h-[44px] bg-slate-900 border border-slate-700 rounded-xl px-3 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Section 4: Any Assignment? (Multi-select) */}
          <div className={`p-4 rounded-2xl border transition-all flex flex-col gap-3 ${
            hasAssignment
              ? 'bg-purple-950/20 border-purple-500/40'
              : 'bg-slate-950/50 border-slate-800'
          }`}>
            <div
              onClick={() => {
                triggerHaptic('medium');
                setHasAssignment(!hasAssignment);
              }}
              className="flex items-center justify-between cursor-pointer select-none active:scale-[0.99]"
            >
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-md flex items-center justify-center ${
                  hasAssignment ? 'bg-purple-500 text-white' : 'border-2 border-slate-600'
                }`}>
                  {hasAssignment && <CheckCircle2 className="w-4 h-4 stroke-[3]" />}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-200">
                    Any Assignment / Project?
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Track submission deadline & specs
                  </div>
                </div>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                hasAssignment ? 'bg-purple-500/20 text-purple-400' : 'text-slate-500'
              }`}>
                {hasAssignment ? 'Yes' : 'None'}
              </span>
            </div>

            {hasAssignment && (
              <div className="pt-2 border-t border-slate-800 flex flex-col gap-2.5">
                <div>
                  <label className="text-[11px] font-medium text-slate-400 block mb-1">
                    Assignment Title:
                  </label>
                  <input
                    type="text"
                    required={hasAssignment}
                    placeholder="e.g. Relational Database Schema Design"
                    value={assignmentTitle}
                    onChange={(e) => setAssignmentTitle(e.target.value)}
                    className="w-full min-h-[44px] bg-slate-900 border border-slate-700 rounded-xl px-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-medium text-slate-400 block mb-1">
                    Submission Deadline:
                  </label>
                  <input
                    type="datetime-local"
                    required={hasAssignment}
                    value={assignmentDeadline}
                    onChange={(e) => setAssignmentDeadline(e.target.value)}
                    className="w-full min-h-[44px] bg-slate-900 border border-slate-700 rounded-xl px-3 text-xs text-slate-100 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Quick Notes */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Lecture Notes / Exam Hint (Optional):
            </label>
            <input
              type="text"
              placeholder="e.g. Prof said slide 8 is guaranteed midterm question"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full min-h-[44px] bg-slate-950 border border-slate-700 rounded-xl px-3 text-xs text-slate-100 placeholder-slate-500"
            />
          </div>

          {/* Sticky Bottom Actions */}
          <div className="pt-2 pb-safe border-t border-slate-800 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                onClose();
              }}
              className="min-h-[48px] px-4 text-xs font-medium text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="min-h-[48px] flex-1 sm:flex-none px-6 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 active:scale-95 rounded-2xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Save & Add to Evening Hub</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
