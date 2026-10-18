import React, { useState } from 'react';
import {
  CheckCircle2,
  Circle,
  Flame,
  Plus,
  Trash2,
  Sparkles,
  Dumbbell,
  BookOpen,
  Droplets,
  Sun,
  Brain,
  Clock,
  RotateCcw,
  Play,
  Pause,
  Filter,
  Check,
  Calendar,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { HabitItem } from '../types';
import { getTodayDateString } from '../utils/storage';
import { triggerHaptic } from '../utils/haptics';

interface HabitsTrackerProps {
  habits: HabitItem[];
  onAddHabit: (habit: Omit<HabitItem, 'id' | 'streak' | 'history' | 'createdAt'>) => void;
  onDeleteHabit: (habitId: string) => void;
  onToggleHabit: (habitId: string) => void;
  onResetHabitStreak: (habitId: string) => void;
}

const HABIT_ICONS = [
  { id: 'dumbbell', label: 'Workout', icon: Dumbbell },
  { id: 'droplet', label: 'Water', icon: Droplets },
  { id: 'book', label: 'Study', icon: BookOpen },
  { id: 'sun', label: 'Morning', icon: Sun },
  { id: 'brain', label: 'Mindset', icon: Brain },
  { id: 'clock', label: 'Routine', icon: Clock },
  { id: 'sparkles', label: 'Focus', icon: Sparkles },
];

export const HabitsTracker: React.FC<HabitsTrackerProps> = ({
  habits,
  onAddHabit,
  onDeleteHabit,
  onToggleHabit,
  onResetHabitStreak,
}) => {
  const today = getTodayDateString();
  const [filterTime, setFilterTime] = useState<'all' | 'morning' | 'afternoon' | 'evening'>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [category, setCategory] = useState<'fitness' | 'study' | 'health' | 'mindset' | 'routine'>('fitness');
  const [icon, setIcon] = useState('dumbbell');
  const [timeOfDay, setTimeOfDay] = useState<'morning' | 'afternoon' | 'evening' | 'anytime'>('morning');
  const [notes, setNotes] = useState('');

  // 10-Min Quick Guided Timer (Available for any habit)
  const [activeTimerHabit, setActiveTimerHabit] = useState<HabitItem | null>(null);
  const [timerSecondsLeft, setTimerSecondsLeft] = useState(600);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  React.useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning && timerSecondsLeft > 0) {
      interval = setInterval(() => {
        setTimerSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (timerSecondsLeft === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      triggerHaptic('success');
      confetti({
        particleCount: 90,
        spread: 60,
        origin: { y: 0.65 },
        colors: ['#10B981', '#6366F1', '#F59E0B'],
      });
      if (activeTimerHabit) {
        onToggleHabit(activeTimerHabit.id);
      }
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, timerSecondsLeft, activeTimerHabit, onToggleHabit]);

  const handleStartTimer = (habit: HabitItem) => {
    triggerHaptic('light');
    setActiveTimerHabit(habit);
    setTimerSecondsLeft(600);
    setIsTimerRunning(true);
  };

  const handleToggle = (habitId: string, isDone: boolean) => {
    if (!isDone) {
      triggerHaptic('success');
      confetti({
        particleCount: 50,
        spread: 45,
        origin: { y: 0.7 },
        colors: ['#10B981', '#3B82F6', '#F59E0B'],
      });
    } else {
      triggerHaptic('light');
    }
    onToggleHabit(habitId);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    triggerHaptic('success');
    onAddHabit({
      name: name.trim(),
      category,
      icon,
      timeOfDay,
      notes: notes.trim() || undefined,
    });

    setName('');
    setNotes('');
    setShowAddModal(false);
  };

  const filteredHabits = habits.filter((h) => {
    if (filterTime === 'all') return true;
    return h.timeOfDay === filterTime;
  });

  const completedTodayCount = habits.filter((h) => Boolean(h.history[today])).length;
  const totalHabitsCount = habits.length;
  const completionPercentage = totalHabitsCount > 0 ? Math.round((completedTodayCount / totalHabitsCount) * 100) : 0;

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'dumbbell':
        return <Dumbbell className="w-5 h-5 text-amber-400" />;
      case 'droplet':
        return <Droplets className="w-5 h-5 text-sky-400" />;
      case 'book':
        return <BookOpen className="w-5 h-5 text-indigo-400" />;
      case 'sun':
        return <Sun className="w-5 h-5 text-orange-400" />;
      case 'brain':
        return <Brain className="w-5 h-5 text-rose-400" />;
      case 'clock':
        return <Clock className="w-5 h-5 text-emerald-400" />;
      case 'sparkles':
      default:
        return <Sparkles className="w-5 h-5 text-purple-400" />;
    }
  };

  // 7-day history helper
  const past7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(Date.now() - 86400000 * (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    const dayName = d.toLocaleDateString('en-US', { weekday: 'narrow' });
    return { dateStr, dayName, isToday: dateStr === today };
  });

  return (
    <div className="flex flex-col gap-5 sm:gap-6">
      {/* Habits Header & Progress Bar */}
      <div className="bg-slate-900/90 border border-slate-800/90 rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col gap-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-slate-100">Daily Habits & Routines</h2>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded-full">
                  Ad-Free
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Add, manage, and tick off your workouts, hydration, and study habits.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => {
                triggerHaptic('light');
                setShowAddModal(true);
              }}
              className="min-h-[42px] px-4 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 active:scale-95 rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Custom Habit</span>
            </button>
          </div>
        </div>

        {/* Today's completion metric */}
        <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex flex-col gap-2.5">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-300">
              Today&apos;s Progress: <span className="font-bold text-white tabular-nums">{completedTodayCount} of {totalHabitsCount} habits</span>
            </span>
            <span className="font-mono font-bold text-indigo-400 tabular-nums">{completionPercentage}%</span>
          </div>
          <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 via-sky-400 to-emerald-400 transition-all duration-300"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>

        {/* Active 10-Minute Timer Drawer (If running) */}
        {activeTimerHabit && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950/70 via-slate-900 to-purple-950/60 border border-indigo-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                  <span>10-Minute Focus Timer</span>
                  <span className="text-[10px] text-indigo-400 font-semibold px-2 py-0.2 bg-indigo-500/10 rounded-md">
                    {activeTimerHabit.name}
                  </span>
                </div>
                <div className="text-lg font-mono font-extrabold text-white mt-0.5">
                  {String(Math.floor(timerSecondsLeft / 60)).padStart(2, '0')}:
                  {String(timerSecondsLeft % 60).padStart(2, '0')}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  triggerHaptic('light');
                  setIsTimerRunning(!isTimerRunning);
                }}
                className="min-h-[38px] px-3.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 active:scale-95 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
              >
                {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{isTimerRunning ? 'Pause' : 'Resume'}</span>
              </button>

              <button
                onClick={() => {
                  triggerHaptic('light');
                  setTimerSecondsLeft(600);
                  setIsTimerRunning(false);
                }}
                className="p-2 text-slate-400 hover:text-slate-200 bg-slate-800 rounded-xl border border-slate-700 active:scale-90 transition-transform cursor-pointer"
                title="Reset Timer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  triggerHaptic('light');
                  setActiveTimerHabit(null);
                  setIsTimerRunning(false);
                }}
                className="px-3 text-xs text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: 'all', label: 'All Habits' },
          { id: 'morning', label: '🌅 Morning' },
          { id: 'afternoon', label: '☀️ Afternoon' },
          { id: 'evening', label: '🌙 Evening' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              triggerHaptic('light');
              setFilterTime(tab.id as typeof filterTime);
            }}
            className={`min-h-[36px] px-3.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
              filterTime === tab.id
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Habits List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {filteredHabits.map((habit) => {
          const isDoneToday = Boolean(habit.history[today]);

          return (
            <div
              key={habit.id}
              className={`p-4 rounded-3xl border flex flex-col justify-between gap-3.5 transition-all ${
                isDoneToday
                  ? 'bg-slate-950/60 border-slate-800/90 text-slate-400'
                  : 'bg-slate-900/90 border-slate-800/90 hover:border-indigo-500/40 text-slate-200 shadow-xl'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    onClick={() => handleToggle(habit.id, isDoneToday)}
                    className="shrink-0 cursor-pointer active:scale-90 transition-transform"
                  >
                    {isDoneToday ? (
                      <div className="w-8 h-8 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shadow-md shadow-emerald-500/20">
                        <Check className="w-5 h-5 stroke-[3]" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full border-2 border-slate-600 hover:border-indigo-400 flex items-center justify-center" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="p-1 rounded-lg bg-slate-800/80 shrink-0">
                        {renderIcon(habit.icon)}
                      </span>
                      <h3
                        className={`text-sm font-bold truncate ${
                          isDoneToday ? 'line-through text-slate-500' : 'text-slate-100'
                        }`}
                      >
                        {habit.name}
                      </h3>
                    </div>

                    {habit.notes && (
                      <p className="text-[11px] text-slate-400 truncate mt-1">
                        {habit.notes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Delete / Actions */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleStartTimer(habit)}
                    className="p-1.5 text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 rounded-lg active:scale-90 transition-transform cursor-pointer"
                    title="Start 10-Min Timer for this Habit"
                  >
                    <Clock className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      triggerHaptic('warning');
                      onDeleteHabit(habit.id);
                    }}
                    className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg active:scale-90 transition-transform cursor-pointer"
                    title="Delete Habit"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Bottom Row: Streak & 7-Day History Bubbles */}
              <div className="flex items-center justify-between pt-2.5 border-t border-slate-800/80 text-xs">
                {/* Streak Badge */}
                <div className="flex items-center gap-1.5">
                  <Flame
                    className={`w-4 h-4 ${
                      habit.streak > 0 ? 'text-amber-400 fill-amber-400' : 'text-slate-600'
                    }`}
                  />
                  <span className="font-bold text-slate-200 tabular-nums">
                    {habit.streak} {habit.streak === 1 ? 'day' : 'days'}
                  </span>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider">
                    streak
                  </span>
                </div>

                {/* 7-Day Bubbles */}
                <div className="flex items-center gap-1.5">
                  {past7Days.map((d) => {
                    const doneOnDate = Boolean(habit.history[d.dateStr]);
                    return (
                      <div
                        key={d.dateStr}
                        className="flex flex-col items-center gap-0.5"
                        title={`${d.dateStr}: ${doneOnDate ? 'Done' : 'Missed'}`}
                      >
                        <span className="text-[9px] text-slate-500 font-mono">
                          {d.dayName}
                        </span>
                        <div
                          className={`w-3.5 h-3.5 rounded-full flex items-center justify-center transition-all ${
                            doneOnDate
                              ? 'bg-emerald-500'
                              : d.isToday
                              ? 'border border-indigo-400 bg-slate-800'
                              : 'bg-slate-800'
                          }`}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}

        {filteredHabits.length === 0 && (
          <div className="col-span-full py-10 px-4 bg-slate-900/40 border border-slate-800 rounded-3xl text-center flex flex-col items-center gap-3">
            <Sparkles className="w-8 h-8 text-indigo-400 opacity-60" />
            <div className="text-xs text-slate-400">
              No habits found for this time of day. Add one above!
            </div>
          </div>
        )}
      </div>

      {/* Add Habit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-700/80 p-5 sm:p-6 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Plus className="w-5 h-5 text-indigo-400" />
                <span>Create New Habit</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="flex flex-col gap-3.5">
              {/* Habit Name */}
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">
                  Habit Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 10-Min Morning Workout, Read 10 Pages, Drink 1L Water"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Time of Day */}
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1.5">
                  Schedule Time of Day
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { id: 'morning', label: 'Morning' },
                    { id: 'afternoon', label: 'Afternoon' },
                    { id: 'evening', label: 'Evening' },
                    { id: 'anytime', label: 'Anytime' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTimeOfDay(t.id as typeof timeOfDay)}
                      className={`min-h-[36px] px-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                        timeOfDay === t.id
                          ? 'bg-indigo-600 text-white border-indigo-500'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1.5">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as typeof category)}
                  className="w-full min-h-[44px] px-3 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500"
                >
                  <option value="fitness">Fitness & Workout</option>
                  <option value="study">Study & College</option>
                  <option value="health">Health & Hydration</option>
                  <option value="mindset">Mindset & Focus</option>
                  <option value="routine">Routine & Bag Packing</option>
                </select>
              </div>

              {/* Icon Picker */}
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1.5">
                  Select Icon
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  {HABIT_ICONS.map((item) => {
                    const IconComponent = item.icon;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setIcon(item.id)}
                        className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                          icon === item.id
                            ? 'bg-indigo-600 text-white border-indigo-500'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                        title={item.label}
                      >
                        <IconComponent className="w-4 h-4" />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">
                  Optional Reminder / Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Right after waking up, 10 min without phone"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="min-h-[40px] px-4 text-xs font-semibold text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="min-h-[40px] px-4 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 active:scale-95 rounded-xl shadow-md transition-all cursor-pointer"
                >
                  Save Habit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
