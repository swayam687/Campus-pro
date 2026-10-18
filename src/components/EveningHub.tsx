import React, { useState } from 'react';
import { BookOpen, CheckCircle2, Circle, Clock, AlertTriangle, Calendar, Brain, Plus, Sparkles, Filter, ChevronRight, CheckSquare, Trash2, ArrowUpRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Subject, TaskDeadlineItem, RevisionItem } from '../types';
import { getTodayDateString } from '../utils/storage';
import { triggerHaptic } from '../utils/haptics';

interface EveningHubProps {
  subjects: Subject[];
  tasks: TaskDeadlineItem[];
  revisions: RevisionItem[];
  onToggleTask: (taskId: string) => void;
  onAddTask: (task: Omit<TaskDeadlineItem, 'id'>) => void;
  onDeleteTask: (taskId: string) => void;
  onToggleRevision: (revId: string) => void;
  onAddRevision: (rev: Omit<RevisionItem, 'id'>) => void;
  onDeleteRevision: (revId: string) => void;
  onStartRevision: (rev: RevisionItem) => void;
  onBreakdownTask: (task: TaskDeadlineItem) => Promise<void>;
}

export const EveningHub: React.FC<EveningHubProps> = ({
  subjects,
  tasks,
  revisions,
  onToggleTask,
  onAddTask,
  onDeleteTask,
  onToggleRevision,
  onAddRevision,
  onDeleteRevision,
  onStartRevision,
  onBreakdownTask,
}) => {
  const [activeTab, setActiveTab] = useState<'deadlines' | 'revision'>('deadlines');
  const [filterType, setFilterType] = useState<'all' | 'homework' | 'assignment'>('all');
  const [showAddTask, setShowAddTask] = useState(false);
  const [showAddRevision, setShowAddRevision] = useState(false);

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskSubId, setNewTaskSubId] = useState(subjects[0]?.id || '');
  const [newTaskType, setNewTaskType] = useState<'homework' | 'assignment'>('homework');
  const [newTaskDeadline, setNewTaskDeadline] = useState('');

  const [newRevTopic, setNewRevTopic] = useState('');
  const [newRevSubId, setNewRevSubId] = useState(subjects[0]?.id || '');
  const [newRevPriority, setNewRevPriority] = useState<'low' | 'medium' | 'high'>('medium');

  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);

  const pendingTasks = tasks.filter((t) => !t.isCompleted);
  const pendingRevisions = revisions.filter((r) => !r.isRevised);

  const filteredTasks = tasks.filter((t) => {
    if (filterType === 'homework') return t.type === 'homework';
    if (filterType === 'assignment') return t.type === 'assignment';
    return true;
  });

  const getDeadlineStatus = (deadlineStr: string) => {
    if (!deadlineStr) return { text: 'No deadline', color: 'text-slate-400 bg-slate-800/80 border-slate-700' };

    const target = new Date(deadlineStr).getTime();
    const now = Date.now();
    const diffHours = (target - now) / (1000 * 60 * 60);

    if (diffHours < 0) {
      return { text: 'Overdue', color: 'text-rose-400 bg-rose-500/10 border-rose-500/30 font-bold' };
    }
    if (diffHours <= 12) {
      return { text: `Due in ${Math.round(diffHours)}h`, color: 'text-rose-400 bg-rose-500/10 border-rose-500/30 font-bold' };
    }
    if (diffHours <= 24) {
      return { text: 'Due Tomorrow', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30 font-bold' };
    }
    const days = Math.round(diffHours / 24);
    return { text: `Due in ${days}d`, color: 'text-slate-300 bg-slate-800 border-slate-700' };
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    triggerHaptic('success');

    onAddTask({
      reviewId: 'manual',
      subjectId: newTaskSubId,
      title: newTaskTitle.trim(),
      type: newTaskType,
      deadline: newTaskDeadline || `${getTodayDateString()}T23:59`,
      isCompleted: false,
    });

    setNewTaskTitle('');
    setShowAddTask(false);
  };

  const handleCreateRevision = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRevTopic.trim()) return;
    triggerHaptic('success');

    onAddRevision({
      reviewId: 'manual',
      subjectId: newRevSubId,
      topicName: newRevTopic.trim(),
      priority: newRevPriority,
      dateAdded: getTodayDateString(),
      isRevised: false,
    });

    setNewRevTopic('');
    setShowAddRevision(false);
  };

  const handleTaskCheck = (taskId: string, isCurrentlyDone: boolean) => {
    if (!isCurrentlyDone) {
      triggerHaptic('success');
      confetti({
        particleCount: 60,
        spread: 45,
        origin: { y: 0.7 },
        colors: ['#34D399', '#38BDF8'],
      });
    } else {
      triggerHaptic('light');
    }
    onToggleTask(taskId);
  };

  const handleRevisionToggle = (revId: string, isCurrentlyDone: boolean) => {
    if (!isCurrentlyDone) {
      triggerHaptic('success');
    } else {
      triggerHaptic('light');
    }
    onToggleRevision(revId);
  };

  const handleRequestPlan = async (task: TaskDeadlineItem) => {
    triggerHaptic('light');
    setLoadingPlanId(task.id);
    await onBreakdownTask(task);
    setLoadingPlanId(null);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800/90 rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col gap-5">
      {/* Overview Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-100">Evening Study & Deadline Hub</h2>
            <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full">
              Post-College
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Everything you logged right after classes: finish homework before deadlines and revise tricky topics.
          </p>
        </div>

        {/* Counter Pills */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="px-3.5 py-2 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center gap-2">
            <span className="text-sm font-bold text-amber-400 tabular-nums">{pendingTasks.length}</span>
            <span className="text-xs text-slate-400">Tasks Due</span>
          </div>

          <div className="px-3.5 py-2 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center gap-2">
            <span className="text-sm font-bold text-rose-400 tabular-nums">{pendingRevisions.length}</span>
            <span className="text-xs text-slate-400">To Revise</span>
          </div>
        </div>
      </div>

      {/* Segmented Tab Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        {/* Tab Switcher */}
        <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 p-1 bg-slate-950/80 rounded-2xl border border-slate-800">
          <button
            onClick={() => {
              triggerHaptic('light');
              setActiveTab('deadlines');
            }}
            className={`min-h-[42px] px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 ${
              activeTab === 'deadlines'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Deadlines</span>
            <span className="text-[10px] px-1.5 py-0.2 bg-black/30 rounded-full tabular-nums">
              {pendingTasks.length}
            </span>
          </button>

          <button
            onClick={() => {
              triggerHaptic('light');
              setActiveTab('revision');
            }}
            className={`min-h-[42px] px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 ${
              activeTab === 'revision'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Brain className="w-3.5 h-3.5" />
            <span>Topics to Revise</span>
            <span className="text-[10px] px-1.5 py-0.2 bg-black/30 rounded-full tabular-nums">
              {pendingRevisions.length}
            </span>
          </button>
        </div>

        {/* Action button corresponding to active tab */}
        {activeTab === 'deadlines' ? (
          <div className="flex items-center justify-between sm:justify-end gap-2">
            <div className="flex items-center gap-1 p-0.5 bg-slate-950 rounded-xl border border-slate-800 text-[11px]">
              <button
                onClick={() => {
                  triggerHaptic('light');
                  setFilterType('all');
                }}
                className={`min-h-[32px] px-2.5 rounded-lg transition-colors cursor-pointer ${
                  filterType === 'all' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400'
                }`}
              >
                All
              </button>
              <button
                onClick={() => {
                  triggerHaptic('light');
                  setFilterType('homework');
                }}
                className={`min-h-[32px] px-2.5 rounded-lg transition-colors cursor-pointer ${
                  filterType === 'homework' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400'
                }`}
              >
                HW
              </button>
              <button
                onClick={() => {
                  triggerHaptic('light');
                  setFilterType('assignment');
                }}
                className={`min-h-[32px] px-2.5 rounded-lg transition-colors cursor-pointer ${
                  filterType === 'assignment' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400'
                }`}
              >
                Assign
              </button>
            </div>

            <button
              onClick={() => {
                triggerHaptic('light');
                setShowAddTask(!showAddTask);
              }}
              className="min-h-[40px] px-3.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Task</span>
            </button>
          </div>
        ) : (
          <button
            onClick={() => {
              triggerHaptic('light');
              setShowAddRevision(!showAddRevision);
            }}
            className="min-h-[40px] px-4 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Log Topic</span>
          </button>
        )}
      </div>

      {/* DEADLINES CONTENT */}
      {activeTab === 'deadlines' && (
        <div className="flex flex-col gap-3">
          {showAddTask && (
            <form onSubmit={handleCreateTask} className="p-4 sm:p-5 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col gap-3">
              <div className="text-xs font-bold text-slate-200">Add Homework or Assignment</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Subject</label>
                  <select
                    value={newTaskSubId}
                    onChange={(e) => setNewTaskSubId(e.target.value)}
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
                  <label className="text-[11px] text-slate-400 block mb-1">Type</label>
                  <select
                    value={newTaskType}
                    onChange={(e) => setNewTaskType(e.target.value as any)}
                    className="w-full min-h-[42px] bg-slate-900 border border-slate-700 rounded-xl px-3 text-xs text-slate-200"
                  >
                    <option value="homework">Homework</option>
                    <option value="assignment">Assignment / Project</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Deadline</label>
                  <input
                    type="datetime-local"
                    value={newTaskDeadline}
                    onChange={(e) => setNewTaskDeadline(e.target.value)}
                    className="w-full min-h-[42px] bg-slate-900 border border-slate-700 rounded-xl px-3 text-xs text-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Task Title / Problem Set</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Solve Chapter 3 Exercises 1-10 on B-Trees"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full min-h-[44px] bg-slate-900 border border-slate-700 rounded-xl px-3 text-xs text-slate-200 placeholder-slate-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddTask(false)}
                  className="min-h-[40px] px-3 text-xs text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="min-h-[40px] px-5 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-colors cursor-pointer"
                >
                  Save Task
                </button>
              </div>
            </form>
          )}

          {filteredTasks.length === 0 ? (
            <div className="py-14 text-center border border-dashed border-slate-800 rounded-2xl text-slate-500 flex flex-col items-center">
              <CheckCircle2 className="w-10 h-10 mb-2 opacity-30 text-emerald-400" />
              <p className="text-sm font-bold text-slate-300">All caught up!</p>
              <p className="text-xs text-slate-500 mt-0.5">No pending homework or assignments due.</p>
            </div>
          ) : (
            filteredTasks.map((task) => {
              const subject = subjects.find((s) => s.id === task.subjectId);
              const status = getDeadlineStatus(task.deadline);

              return (
                <div
                  key={task.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col gap-3 ${
                    task.isCompleted
                      ? 'bg-slate-950/40 border-slate-850 opacity-60'
                      : 'bg-slate-800/70 border-slate-800 hover:border-slate-700 shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3.5 min-w-0">
                      <button
                        onClick={() => handleTaskCheck(task.id, task.isCompleted)}
                        className="mt-0.5 min-h-[36px] min-w-[36px] flex items-center justify-center text-slate-400 hover:text-emerald-400 active:scale-90 transition-all cursor-pointer shrink-0"
                      >
                        {task.isCompleted ? (
                          <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                        ) : (
                          <Circle className="w-6 h-6 text-slate-500" />
                        )}
                      </button>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className="text-[11px] font-bold px-2 py-0.5 rounded-md"
                            style={{ backgroundColor: `${subject?.color || '#6366f1'}20`, color: subject?.color || '#818cf8' }}
                          >
                            {subject?.name || 'College Task'}
                          </span>

                          <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-md ${
                            task.type === 'homework'
                              ? 'bg-sky-500/15 text-sky-400'
                              : 'bg-purple-500/15 text-purple-400'
                          }`}>
                            {task.type}
                          </span>
                        </div>

                        <div className={`text-sm sm:text-base font-semibold mt-1.5 ${task.isCompleted ? 'line-through text-slate-500' : 'text-slate-100'}`}>
                          {task.title}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[11px] font-bold border px-2.5 py-1 rounded-xl whitespace-nowrap tabular-nums ${status.color}`}>
                        {status.text}
                      </span>

                      <button
                        onClick={() => {
                          triggerHaptic('warning');
                          onDeleteTask(task.id);
                        }}
                        className="min-h-[36px] min-w-[36px] flex items-center justify-center text-slate-500 hover:text-rose-400 active:scale-95 transition-colors cursor-pointer"
                        title="Delete task"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* 3-Step Action Plan */}
                  {task.steps && task.steps.length > 0 ? (
                    <div className="mt-1 pt-3 border-t border-slate-800 pl-9 flex flex-col gap-2">
                      <div className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span>Action Plan ({task.estimatedMinutes || 45} mins):</span>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        {task.steps.map((st, i) => (
                          <div key={i} className="text-xs text-slate-300 flex items-start gap-2.5">
                            <span className="w-4 h-4 rounded-full bg-slate-900 text-indigo-400 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                              {i + 1}
                            </span>
                            <span className="leading-relaxed">{st}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    !task.isCompleted && (
                      <div className="pl-9 pt-0.5">
                        <button
                          onClick={() => handleRequestPlan(task)}
                          disabled={loadingPlanId === task.id}
                          className="min-h-[36px] flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer active:scale-95 transition-transform"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                          <span>{loadingPlanId === task.id ? 'Generating 3-Step Plan...' : 'Generate 3-Step Action Plan (AI)'}</span>
                        </button>
                      </div>
                    )
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* REVISION CONTENT */}
      {activeTab === 'revision' && (
        <div className="flex flex-col gap-3">
          {showAddRevision && (
            <form onSubmit={handleCreateRevision} className="p-4 sm:p-5 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col gap-3">
              <div className="text-xs font-bold text-slate-200">Log Topic to Revise Tonight</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Subject</label>
                  <select
                    value={newRevSubId}
                    onChange={(e) => setNewRevSubId(e.target.value)}
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
                  <label className="text-[11px] text-slate-400 block mb-1">Priority</label>
                  <select
                    value={newRevPriority}
                    onChange={(e) => setNewRevPriority(e.target.value as any)}
                    className="w-full min-h-[42px] bg-slate-900 border border-slate-700 rounded-xl px-3 text-xs text-slate-200"
                  >
                    <option value="high">High (Need deep focus)</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low (Quick brush up)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Topic Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AVL Tree rebalancing, SQL window functions, Process scheduling"
                  value={newRevTopic}
                  onChange={(e) => setNewRevTopic(e.target.value)}
                  className="w-full min-h-[44px] bg-slate-900 border border-slate-700 rounded-xl px-3 text-xs text-slate-200 placeholder-slate-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddRevision(false)}
                  className="min-h-[40px] px-3 text-xs text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="min-h-[40px] px-5 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-colors cursor-pointer"
                >
                  Add Topic
                </button>
              </div>
            </form>
          )}

          {revisions.length === 0 ? (
            <div className="py-14 text-center border border-dashed border-slate-800 rounded-2xl text-slate-500 flex flex-col items-center">
              <Brain className="w-10 h-10 mb-2 opacity-30 text-indigo-400" />
              <p className="text-sm font-bold text-slate-300">Revision queue is clean!</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Mark &quot;Topic not understood&quot; or &quot;Need revision&quot; after any class, and it will queue here.
              </p>
            </div>
          ) : (
            revisions.map((rev) => {
              const subject = subjects.find((s) => s.id === rev.subjectId);

              return (
                <div
                  key={rev.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    rev.isRevised
                      ? 'bg-slate-950/40 border-slate-850 opacity-60'
                      : 'bg-slate-800/70 border-slate-800 hover:border-slate-700 shadow-sm'
                  }`}
                >
                  <div className="flex items-start gap-3.5 min-w-0">
                    <button
                      onClick={() => handleRevisionToggle(rev.id, rev.isRevised)}
                      className="mt-0.5 min-h-[36px] min-w-[36px] flex items-center justify-center text-slate-400 hover:text-emerald-400 active:scale-90 transition-all cursor-pointer shrink-0"
                    >
                      {rev.isRevised ? (
                        <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                      ) : (
                        <Circle className="w-6 h-6 text-slate-500" />
                      )}
                    </button>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className="text-[11px] font-bold px-2 py-0.5 rounded-md"
                          style={{ backgroundColor: `${subject?.color || '#6366f1'}20`, color: subject?.color || '#818cf8' }}
                        >
                          {subject?.name || 'Course Topic'}
                        </span>

                        <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-md ${
                          rev.priority === 'high'
                            ? 'bg-rose-500/15 text-rose-400'
                            : rev.priority === 'medium'
                            ? 'bg-amber-500/15 text-amber-400'
                            : 'bg-slate-700 text-slate-300'
                        }`}>
                          {rev.priority} Priority
                        </span>

                        <span className="text-[11px] text-slate-500 tabular-nums">
                          Logged {rev.dateAdded}
                        </span>
                      </div>

                      <div className={`text-sm sm:text-base font-semibold mt-1.5 ${rev.isRevised ? 'line-through text-slate-500' : 'text-slate-100'}`}>
                        {rev.topicName}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <button
                      onClick={() => {
                        triggerHaptic('light');
                        onStartRevision(rev);
                      }}
                      className="min-h-[40px] px-4 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 active:scale-95 rounded-xl transition-all shadow-md shadow-indigo-600/20 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Brain className="w-4 h-4" />
                      <span>{rev.aiExplanation ? 'Review Deep Guide' : 'Revise with AI'}</span>
                      <ArrowUpRight className="w-3.5 h-3.5 opacity-70" />
                    </button>

                    <button
                      onClick={() => {
                        triggerHaptic('warning');
                        onDeleteRevision(rev.id);
                      }}
                      className="min-h-[40px] min-w-[40px] flex items-center justify-center text-slate-500 hover:text-rose-400 active:scale-95 cursor-pointer"
                      title="Delete revision item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
