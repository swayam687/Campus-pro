import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Backpack,
  Clock,
  Sparkles,
  BookOpen,
  CheckCircle2,
  ArrowRight,
  Layers,
  CheckCheck,
  Film,
  CalendarDays,
  Plus,
  RotateCcw,
} from 'lucide-react';

import {
  Subject,
  TimeSlot,
  ClassReview,
  RevisionItem,
  TaskDeadlineItem,
  HabitItem,
  DayOfWeek,
  CalendarEvent,
  ReelVaultItem,
} from './types';

import {
  getSubjects,
  saveToStorage,
  getTimeSlots,
  getReviews,
  getRevisions,
  getTasks,
  getHabitsList,
  saveHabitsList,
  getPackedItems,
  savePackedItem,
  getCurrentDayOfWeek,
  getTodayDateString,
  getCalendarEvents,
  getReelsVault,
  saveReelsVault,
  clearAllData,
  DEFAULT_SUBJECTS,
  DEFAULT_TIME_SLOTS,
  DEFAULT_HABITS_LIST,
  DEFAULT_REELS_VAULT,
} from './utils/storage';

import { TopNav, NavViewType } from './components/TopNav';
import { ScheduleTimeBlocker } from './components/ScheduleTimeBlocker';
import { HabitsTracker } from './components/HabitsTracker';
import { BagPackingWidget } from './components/BagPackingWidget';
import { PostClassReviewModal } from './components/PostClassReviewModal';
import { EveningHub } from './components/EveningHub';
import { SubjectManagerModal } from './components/SubjectManagerModal';
import { AiRevisionModal } from './components/AiRevisionModal';
import { ThreeDeskViewer } from './components/ThreeDeskViewer';
import { MonthlyCalendarView } from './components/MonthlyCalendarView';
import { ReelsVault } from './components/ReelsVault';
import { triggerHaptic } from './utils/haptics';
import confetti from 'canvas-confetti';

export default function App() {
  const [subjects, setSubjects] = useState<Subject[]>(getSubjects);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>(getTimeSlots);
  const [reviews, setReviews] = useState<ClassReview[]>(getReviews);
  const [revisions, setRevisions] = useState<RevisionItem[]>(getRevisions);
  const [tasks, setTasks] = useState<TaskDeadlineItem[]>(getTasks);
  const [habits, setHabits] = useState<HabitItem[]>(getHabitsList);
  const [reels, setReels] = useState<ReelVaultItem[]>(getReelsVault);
  const [packedState, setPackedState] = useState<Record<string, boolean>>(getPackedItems);
  const [currentDay, setCurrentDay] = useState<DayOfWeek>(getCurrentDayOfWeek);

  // Calendar State
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(getCalendarEvents);

  const [activeView, setActiveView] = useState<NavViewType>('schedule');
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  const [reviewModalSlot, setReviewModalSlot] = useState<TimeSlot | null>(null);
  const [isSubjectManagerOpen, setIsSubjectManagerOpen] = useState(false);
  const [activeRevisionItem, setActiveRevisionItem] = useState<RevisionItem | null>(null);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    saveToStorage('campusflow_subjects_v1', subjects);
  }, [subjects]);

  useEffect(() => {
    saveToStorage('campusflow_time_slots_v1', timeSlots);
  }, [timeSlots]);

  useEffect(() => {
    saveToStorage('campusflow_reviews_v1', reviews);
  }, [reviews]);

  useEffect(() => {
    saveToStorage('campusflow_revisions_v1', revisions);
  }, [revisions]);

  useEffect(() => {
    saveToStorage('campusflow_tasks_v1', tasks);
  }, [tasks]);

  useEffect(() => {
    saveHabitsList(habits);
  }, [habits]);

  useEffect(() => {
    saveReelsVault(reels);
  }, [reels]);

  useEffect(() => {
    saveToStorage('campusflow_calendar_events_v1', calendarEvents);
  }, [calendarEvents]);

  const todayDate = getTodayDateString();
  const pendingTasksCount = tasks.filter((t) => !t.isCompleted).length;
  const pendingRevisionsCount = revisions.filter((r) => !r.isRevised).length;

  const isBagPacked = Object.values(packedState).length > 0 && Object.values(packedState).every(Boolean);

  const handleTogglePackedItem = (itemId: string) => {
    const nextState = !packedState[itemId];
    savePackedItem(itemId, nextState, todayDate);
    setPackedState((prev) => ({
      ...prev,
      [itemId]: nextState,
    }));
  };

  const handleResetPacking = () => {
    triggerHaptic('warning');
    const cleared: Record<string, boolean> = {};
    saveToStorage(`campusflow_packed_items_v1_${todayDate}`, cleared);
    setPackedState(cleared);
  };

  const handlePackAll = () => {
    triggerHaptic('success');
    const todaySlots = timeSlots.filter((s) => s.dayOfWeek === currentDay);
    const todaySubjectIds = Array.from(new Set(todaySlots.map((s) => s.subjectId)));
    const todaySubjects = subjects.filter((s) => todaySubjectIds.includes(s.id));

    const allPacked: Record<string, boolean> = {
      'essential-id': true,
      'essential-water': true,
    };
    if (todaySubjects.some((s) => s.requiresLaptop)) allPacked['tech-laptop'] = true;
    if (todaySubjects.some((s) => s.requiresLabKit)) allPacked['gear-lab'] = true;
    if (todaySubjects.some((s) => s.requiresCalculator)) allPacked['tech-calculator'] = true;

    todaySubjects.forEach((sub) => {
      sub.defaultMaterials.forEach((_, idx) => {
        allPacked[`mat-${sub.id}-${idx}`] = true;
      });
    });

    saveToStorage(`campusflow_packed_items_v1_${todayDate}`, allPacked);
    setPackedState(allPacked);
  };

  const handleSaveReview = (reviewData: Omit<ClassReview, 'id' | 'createdAt'>) => {
    const reviewId = `rev-${Date.now()}`;
    const newReview: ClassReview = {
      ...reviewData,
      id: reviewId,
      createdAt: Date.now(),
    };

    setReviews((prev) => {
      const filtered = prev.filter((r) => r.slotId !== reviewData.slotId);
      return [newReview, ...filtered];
    });

    if ((reviewData.topicNotUnderstood && reviewData.topicName) || reviewData.needRevision) {
      const topicTitle = reviewData.topicName || `${subjects.find((s) => s.id === reviewData.subjectId)?.name || 'Class'} Revision`;
      const newRevItem: RevisionItem = {
        id: `rev-item-${Date.now()}`,
        reviewId,
        subjectId: reviewData.subjectId,
        topicName: topicTitle,
        priority: reviewData.revisionPriority,
        dateAdded: todayDate,
        isRevised: false,
      };
      setRevisions((prev) => [newRevItem, ...prev]);
    }

    if (reviewData.hasHomework && reviewData.homeworkTitle) {
      const newHwTask: TaskDeadlineItem = {
        id: `task-hw-${Date.now()}`,
        reviewId,
        subjectId: reviewData.subjectId,
        title: reviewData.homeworkTitle,
        type: 'homework',
        deadline: reviewData.homeworkDeadline || `${todayDate}T23:59`,
        isCompleted: false,
      };
      setTasks((prev) => [newHwTask, ...prev]);
    }

    if (reviewData.hasAssignment && reviewData.assignmentTitle) {
      const newAssignTask: TaskDeadlineItem = {
        id: `task-assign-${Date.now()}`,
        reviewId,
        subjectId: reviewData.subjectId,
        title: reviewData.assignmentTitle,
        type: 'assignment',
        deadline: reviewData.assignmentDeadline || `${todayDate}T18:00`,
        isCompleted: false,
      };
      setTasks((prev) => [newAssignTask, ...prev]);
    }
  };

  const handleToggleTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, isCompleted: !t.isCompleted, completedAt: Date.now() } : t))
    );
  };

  const handleAddTask = (newTask: Omit<TaskDeadlineItem, 'id'>) => {
    setTasks((prev) => [{ ...newTask, id: `task-${Date.now()}` }, ...prev]);
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  const handleToggleRevision = (revId: string) => {
    setRevisions((prev) =>
      prev.map((r) => (r.id === revId ? { ...r, isRevised: !r.isRevised, revisedAt: Date.now() } : r))
    );
  };

  const handleAddRevision = (newRev: Omit<RevisionItem, 'id'>) => {
    setRevisions((prev) => [{ ...newRev, id: `rev-item-${Date.now()}` }, ...prev]);
  };

  const handleDeleteRevision = (revId: string) => {
    setRevisions((prev) => prev.filter((r) => r.id !== revId));
  };

  const handleStartRevision = (rev: RevisionItem) => {
    setActiveRevisionItem(rev);
  };

  const handleBreakdownTask = async (task: TaskDeadlineItem) => {
    const sub = subjects.find((s) => s.id === task.subjectId);
    try {
      const res = await fetch('/api/ai/homework-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: task.title,
          subject: sub?.name || 'General',
          deadline: task.deadline,
          type: task.type,
        }),
      });
      const data = await res.json();
      if (data.plan) {
        setTasks((prev) =>
          prev.map((t) =>
            t.id === task.id ? { ...t, steps: data.plan, estimatedMinutes: data.estimatedMinutes } : t
          )
        );
      }
    } catch {
      const defaultSteps = [
        'Review the homework assignment brief and gather lecture notes',
        'Draft the core solutions or practical exercises',
        'Verify with textbook answers and submit ahead of the deadline',
      ];
      setTasks((prev) =>
        prev.map((t) =>
          t.id === task.id ? { ...t, steps: defaultSteps, estimatedMinutes: 40 } : t
        )
      );
    }
  };

  const handleAddTimeSlot = (slot: Omit<TimeSlot, 'id'>) => {
    triggerHaptic('light');
    const newSlot: TimeSlot = {
      ...slot,
      id: `slot-${Date.now()}`,
    };
    setTimeSlots((prev) => [...prev, newSlot]);
  };

  const handleDeleteTimeSlot = (slotId: string) => {
    triggerHaptic('warning');
    setTimeSlots((prev) => prev.filter((s) => s.id !== slotId));
  };

  const handleSaveSubject = (savedSubject: Subject) => {
    triggerHaptic('success');
    setSubjects((prev) => {
      const exists = prev.some((s) => s.id === savedSubject.id);
      if (exists) {
        return prev.map((s) => (s.id === savedSubject.id ? savedSubject : s));
      }
      return [...prev, savedSubject];
    });
  };

  const handleDeleteSubject = (subjectId: string) => {
    triggerHaptic('warning');
    setSubjects((prev) => prev.filter((s) => s.id !== subjectId));
  };

  // Calendar Event Handlers
  const handleAddCalendarEvent = (newEvent: Omit<CalendarEvent, 'id'>) => {
    const eventWithId: CalendarEvent = {
      ...newEvent,
      id: `evt-${Date.now()}`,
    };
    setCalendarEvents((prev) => [eventWithId, ...prev]);
  };

  const handleDeleteCalendarEvent = (eventId: string) => {
    setCalendarEvents((prev) => prev.filter((e) => e.id !== eventId));
  };

  const handleToggleCalendarEventComplete = (eventId: string) => {
    setCalendarEvents((prev) =>
      prev.map((e) => (e.id === eventId ? { ...e, isCompleted: !e.isCompleted } : e))
    );
  };

  // Habit Handlers (Add, Remove, Toggle)
  const handleAddHabit = (newHabit: Omit<HabitItem, 'id' | 'streak' | 'history' | 'createdAt'>) => {
    const item: HabitItem = {
      ...newHabit,
      id: `habit-${Date.now()}`,
      streak: 0,
      history: {},
      createdAt: Date.now(),
    };
    setHabits((prev) => [item, ...prev]);
  };

  const handleDeleteHabit = (habitId: string) => {
    setHabits((prev) => prev.filter((h) => h.id !== habitId));
  };

  const handleToggleHabit = (habitId: string) => {
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id === habitId) {
          const isDone = Boolean(h.history[todayDate]);
          const newHistory = { ...h.history };
          let newStreak = h.streak;

          if (isDone) {
            delete newHistory[todayDate];
            newStreak = Math.max(0, h.streak - 1);
          } else {
            newHistory[todayDate] = true;
            newStreak = h.streak + 1;
          }

          return {
            ...h,
            streak: newStreak,
            history: newHistory,
          };
        }
        return h;
      })
    );
  };

  const handleResetHabitStreak = (habitId: string) => {
    triggerHaptic('warning');
    setHabits((prev) =>
      prev.map((h) => (h.id === habitId ? { ...h, streak: 0 } : h))
    );
  };

  // Reels Vault Handlers (Add, Delete, Toggle Watched)
  const handleAddReel = (newReel: Omit<ReelVaultItem, 'id' | 'isWatched' | 'createdAt'>) => {
    const item: ReelVaultItem = {
      ...newReel,
      id: `reel-${Date.now()}`,
      isWatched: false,
      createdAt: Date.now(),
    };
    setReels((prev) => [item, ...prev]);
  };

  const handleDeleteReel = (reelId: string) => {
    setReels((prev) => prev.filter((r) => r.id !== reelId));
  };

  const handleToggleWatchedReel = (reelId: string) => {
    setReels((prev) =>
      prev.map((r) =>
        r.id === reelId
          ? {
              ...r,
              isWatched: !r.isWatched,
              watchedAt: !r.isWatched ? Date.now() : undefined,
            }
          : r
      )
    );
  };

  // Clear / Reset All Data
  const handleClearAllData = () => {
    clearAllData();
    setSubjects(DEFAULT_SUBJECTS);
    setTimeSlots(DEFAULT_TIME_SLOTS);
    setReviews([]);
    setRevisions([]);
    setTasks([]);
    setHabits(DEFAULT_HABITS_LIST);
    setReels(DEFAULT_REELS_VAULT);
    setCalendarEvents([]);
    setPackedState({});
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.6 },
    });
  };

  const handleOpenQuickReview = () => {
    triggerHaptic('light');
    const todaySlots = timeSlots.filter((s) => s.dayOfWeek === currentDay);
    const unreviewed = todaySlots.find((s) => !reviews.some((r) => r.slotId === s.id));
    if (unreviewed) {
      setReviewModalSlot(unreviewed);
    } else if (todaySlots[0]) {
      setReviewModalSlot(todaySlots[0]);
    } else {
      setActiveView('schedule');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Top Bar with Clear Data, Quick Review, & Navigation */}
      <TopNav
        activeView={activeView}
        onSelectView={setActiveView}
        onOpenQuickReview={handleOpenQuickReview}
        onClearAllData={handleClearAllData}
        isOnline={isOnline}
        pendingReviewsCount={pendingTasksCount + pendingRevisionsCount}
      />

      {/* Main Container - clean without repetitive top banners */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3.5 sm:px-6 py-4 sm:py-6 pb-24 md:pb-12 flex flex-col gap-5 sm:gap-6">
        {/* View Router */}
        {activeView === 'schedule' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
            <div className="lg:col-span-2 flex flex-col gap-5 sm:gap-6">
              <ScheduleTimeBlocker
                subjects={subjects}
                timeSlots={timeSlots}
                reviews={reviews}
                currentDay={currentDay}
                onSelectDay={(day) => {
                  triggerHaptic('light');
                  setCurrentDay(day);
                }}
                onOpenReviewModal={(slot) => {
                  triggerHaptic('light');
                  setReviewModalSlot(slot);
                }}
                onAddTimeSlot={handleAddTimeSlot}
                onDeleteTimeSlot={handleDeleteTimeSlot}
                onOpenSubjectManager={() => {
                  triggerHaptic('light');
                  setIsSubjectManagerOpen(true);
                }}
              />
            </div>

            <div className="flex flex-col gap-5 sm:gap-6">
              <BagPackingWidget
                subjects={subjects}
                timeSlots={timeSlots}
                currentDay={currentDay}
                packedState={packedState}
                onToggleItem={handleTogglePackedItem}
                onResetPacking={handleResetPacking}
                onPackAll={handlePackAll}
              />

              {/* Monthly Calendar View Shortcut */}
              <div
                onClick={() => {
                  triggerHaptic('light');
                  setActiveView('calendar');
                }}
                className="p-4 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3 shadow-xl active:scale-[0.99] cursor-pointer transition-transform group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/25 flex items-center justify-center shrink-0">
                    <CalendarDays className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-200">Monthly Calendar & Exams</div>
                    <div className="text-[11px] text-slate-400">
                      View deadlines, exams & college events
                    </div>
                  </div>
                </div>

                <ArrowRight className="w-4 h-4 text-rose-400 group-hover:translate-x-1 transition-transform" />
              </div>

              {/* Instagram Reels Vault Shortcut */}
              <div
                onClick={() => {
                  triggerHaptic('light');
                  setActiveView('vault');
                }}
                className="p-4 rounded-3xl bg-gradient-to-r from-pink-950/40 via-purple-950/30 to-slate-900 border border-pink-500/30 active:scale-[0.99] transition-transform cursor-pointer flex items-center justify-between gap-3 group shadow-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-pink-500/20 text-pink-400 flex items-center justify-center shrink-0">
                    <Film className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-100">
                      Instagram Reels Vault
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {reels.filter((r) => r.scheduledDate === todayDate && !r.isWatched).length} scheduled for today
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-pink-400 group-hover:translate-x-1 transition-transform" />
              </div>

              {/* 3D Visualizer Link */}
              <div
                onClick={() => {
                  triggerHaptic('light');
                  setActiveView('3d');
                }}
                className="p-4 rounded-3xl bg-slate-900 border border-slate-800 active:scale-[0.99] transition-transform cursor-pointer flex items-center justify-between gap-3 group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-100">
                      3D Study Desk & Backpack
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Interactive 3D campus desk
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-indigo-400 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        )}

        {/* Monthly Calendar View */}
        {activeView === 'calendar' && (
          <MonthlyCalendarView
            events={calendarEvents}
            tasks={tasks}
            subjects={subjects}
            timeSlots={timeSlots}
            onAddEvent={handleAddCalendarEvent}
            onDeleteEvent={handleDeleteCalendarEvent}
            onToggleEventComplete={handleToggleCalendarEventComplete}
          />
        )}

        {/* Customizable Habits View */}
        {activeView === 'habits' && (
          <div className="max-w-4xl mx-auto w-full flex flex-col gap-6">
            <HabitsTracker
              habits={habits}
              onAddHabit={handleAddHabit}
              onDeleteHabit={handleDeleteHabit}
              onToggleHabit={handleToggleHabit}
              onResetHabitStreak={handleResetHabitStreak}
            />
          </div>
        )}

        {/* Instagram Reels Vault View */}
        {activeView === 'vault' && (
          <div className="max-w-5xl mx-auto w-full flex flex-col gap-6">
            <ReelsVault
              reels={reels}
              onAddReel={handleAddReel}
              onDeleteReel={handleDeleteReel}
              onToggleWatched={handleToggleWatchedReel}
            />
          </div>
        )}

        {/* Bag Packing View */}
        {activeView === 'bag' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
            <div className="lg:col-span-2">
              <BagPackingWidget
                subjects={subjects}
                timeSlots={timeSlots}
                currentDay={currentDay}
                packedState={packedState}
                onToggleItem={handleTogglePackedItem}
                onResetPacking={handleResetPacking}
                onPackAll={handlePackAll}
              />
            </div>

            <div>
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <h3 className="text-sm font-bold text-slate-100">Zero-Stress College Mornings</h3>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  CampusFlow keeps your schedule offline so you can pack your bag with the right books and equipment even if your college app fails.
                </p>

                <div className="pt-2 border-t border-slate-800 flex flex-col gap-2">
                  <button
                    onClick={() => {
                      triggerHaptic('light');
                      setActiveView('schedule');
                    }}
                    className="min-h-[44px] w-full text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 active:scale-95 rounded-xl transition-all cursor-pointer flex items-center justify-center"
                  >
                    View Timetable
                  </button>
                  <button
                    onClick={() => {
                      triggerHaptic('light');
                      setActiveView('calendar');
                    }}
                    className="min-h-[44px] w-full text-xs font-semibold text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 active:scale-95 rounded-xl transition-all cursor-pointer flex items-center justify-center"
                  >
                    View Monthly Exams
                  </button>
                  <button
                    onClick={() => {
                      triggerHaptic('light');
                      setActiveView('vault');
                    }}
                    className="min-h-[44px] w-full text-xs font-semibold text-pink-300 bg-pink-500/10 hover:bg-pink-500/20 border border-pink-500/30 active:scale-95 rounded-xl transition-all cursor-pointer flex items-center justify-center"
                  >
                    Open Reels Vault
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Evening Study Hub View */}
        {activeView === 'evening' && (
          <div className="max-w-5xl mx-auto w-full flex flex-col gap-6">
            <EveningHub
              subjects={subjects}
              tasks={tasks}
              revisions={revisions}
              onToggleTask={handleToggleTask}
              onAddTask={handleAddTask}
              onDeleteTask={handleDeleteTask}
              onToggleRevision={handleToggleRevision}
              onAddRevision={handleAddRevision}
              onDeleteRevision={handleDeleteRevision}
              onStartRevision={handleStartRevision}
              onBreakdownTask={handleBreakdownTask}
            />
          </div>
        )}

        {/* 3D Study Desk */}
        {activeView === '3d' && (
          <div className="flex flex-col gap-4">
            <ThreeDeskViewer
              isBagPacked={isBagPacked}
              onToggleBagPack={isBagPacked ? handleResetPacking : handlePackAll}
            />
          </div>
        )}
      </main>

      {/* Floating Mobile Bottom Tab Bar with haptic feedback */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800/90 grid grid-cols-6 items-center h-16 pb-safe px-1 shadow-2xl">
        <button
          onClick={() => {
            triggerHaptic('light');
            setActiveView('schedule');
          }}
          className={`min-h-[48px] flex flex-col items-center justify-center gap-1 active:scale-90 transition-transform cursor-pointer ${
            activeView === 'schedule' ? 'text-indigo-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span className="text-[9px] tracking-tight">Classes</span>
        </button>

        <button
          onClick={() => {
            triggerHaptic('light');
            setActiveView('calendar');
          }}
          className={`min-h-[48px] flex flex-col items-center justify-center gap-1 active:scale-90 transition-transform cursor-pointer ${
            activeView === 'calendar' ? 'text-rose-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <CalendarDays className="w-4 h-4" />
          <span className="text-[9px] tracking-tight">Monthly</span>
        </button>

        <button
          onClick={() => {
            triggerHaptic('light');
            setActiveView('habits');
          }}
          className={`min-h-[48px] flex flex-col items-center justify-center gap-1 active:scale-90 transition-transform cursor-pointer ${
            activeView === 'habits' ? 'text-indigo-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <CheckCheck className="w-4 h-4" />
          <span className="text-[9px] tracking-tight">Habits</span>
        </button>

        <button
          onClick={() => {
            triggerHaptic('light');
            setActiveView('bag');
          }}
          className={`min-h-[48px] flex flex-col items-center justify-center gap-1 active:scale-90 transition-transform cursor-pointer ${
            activeView === 'bag' ? 'text-indigo-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Backpack className="w-4 h-4" />
          <span className="text-[9px] tracking-tight">Bag</span>
        </button>

        <button
          onClick={() => {
            triggerHaptic('light');
            setActiveView('evening');
          }}
          className={`min-h-[48px] flex flex-col items-center justify-center gap-1 relative active:scale-90 transition-transform cursor-pointer ${
            activeView === 'evening' ? 'text-indigo-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span className="text-[9px] tracking-tight">Evening</span>
          {pendingTasksCount + pendingRevisionsCount > 0 && (
            <span className="absolute top-1.5 right-2 w-2 h-2 rounded-full bg-indigo-500 ring-2 ring-slate-950" />
          )}
        </button>

        <button
          onClick={() => {
            triggerHaptic('light');
            setActiveView('vault');
          }}
          className={`min-h-[48px] flex flex-col items-center justify-center gap-1 active:scale-90 transition-transform cursor-pointer ${
            activeView === 'vault' ? 'text-pink-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Film className="w-4 h-4" />
          <span className="text-[9px] tracking-tight">Vault</span>
        </button>
      </nav>

      {/* Post-Class Micro-Review Bottom Sheet Modal */}
      {reviewModalSlot && (
        <PostClassReviewModal
          slot={reviewModalSlot}
          subject={subjects.find((s) => s.id === reviewModalSlot.subjectId) || null}
          existingReview={reviews.find((r) => r.slotId === reviewModalSlot.id) || null}
          isOpen={Boolean(reviewModalSlot)}
          onClose={() => setReviewModalSlot(null)}
          onSaveReview={handleSaveReview}
        />
      )}

      {/* Subject Manager Modal */}
      <SubjectManagerModal
        subjects={subjects}
        isOpen={isSubjectManagerOpen}
        onClose={() => setIsSubjectManagerOpen(false)}
        onSaveSubject={handleSaveSubject}
        onDeleteSubject={handleDeleteSubject}
      />

      {/* AI Deep Thinking Revision Modal */}
      {activeRevisionItem && (
        <AiRevisionModal
          item={activeRevisionItem}
          subject={subjects.find((s) => s.id === activeRevisionItem.subjectId) || null}
          isOpen={Boolean(activeRevisionItem)}
          onClose={() => setActiveRevisionItem(null)}
          onMarkMastered={(id) => {
            triggerHaptic('success');
            setRevisions((prev) =>
              prev.map((r) => (r.id === id ? { ...r, isRevised: true, revisedAt: Date.now() } : r))
            );
          }}
          onSaveExplanation={(id, explanation) => {
            setRevisions((prev) =>
              prev.map((r) => (r.id === id ? { ...r, aiExplanation: explanation } : r))
            );
          }}
        />
      )}
    </div>
  );
}
