import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Clock,
  MapPin,
  GraduationCap,
  FileText,
  Sparkles,
  CheckCircle2,
  AlertOctagon,
  Trash2,
  CalendarDays,
  Filter,
} from 'lucide-react';
import { CalendarEvent, CalendarEventType, Subject, TaskDeadlineItem, TimeSlot, DayOfWeek } from '../types';
import { triggerHaptic } from '../utils/haptics';

interface MonthlyCalendarViewProps {
  events: CalendarEvent[];
  tasks: TaskDeadlineItem[];
  subjects: Subject[];
  timeSlots: TimeSlot[];
  onAddEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  onDeleteEvent: (eventId: string) => void;
  onToggleEventComplete: (eventId: string) => void;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const MonthlyCalendarView: React.FC<MonthlyCalendarViewProps> = ({
  events,
  tasks,
  subjects,
  timeSlots,
  onAddEvent,
  onDeleteEvent,
  onToggleEventComplete,
}) => {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth()); // 0-11
  const [selectedDate, setSelectedDate] = useState<string>(
    today.toISOString().split('T')[0]
  );
  const [activeFilter, setActiveFilter] = useState<'all' | 'exam' | 'deadline' | 'event'>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states for adding new event
  const [formTitle, setFormTitle] = useState('');
  const [formType, setFormType] = useState<CalendarEventType>('exam');
  const [formDate, setFormDate] = useState(selectedDate);
  const [formTime, setFormTime] = useState('10:00 AM');
  const [formSubjectId, setFormSubjectId] = useState(subjects[0]?.id || '');
  const [formLocation, setFormLocation] = useState('');
  const [formNotes, setFormNotes] = useState('');

  // Combine calendar events with tasks that have deadlines
  const combinedEvents = useMemo(() => {
    const list: Array<CalendarEvent & { isTaskItem?: boolean }> = [...events];

    // Add tasks as homework/assignment events if not already present
    tasks.forEach((task) => {
      if (task.deadline) {
        const taskDate = task.deadline.split('T')[0];
        const alreadyInList = list.some(
          (e) => e.title === task.title && e.date === taskDate
        );
        if (!alreadyInList) {
          list.push({
            id: `task-evt-${task.id}`,
            title: task.title,
            date: taskDate,
            type: task.type === 'homework' ? 'homework' : 'assignment',
            subjectId: task.subjectId,
            time: task.deadline.includes('T') ? task.deadline.split('T')[1] : undefined,
            isCompleted: task.isCompleted,
            isTaskItem: true,
          });
        }
      }
    });

    return list;
  }, [events, tasks]);

  // Calendar matrix calculations
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);

    const startingDayIndex = (firstDayOfMonth.getDay() + 6) % 7; // Adjust so Monday = 0
    const totalDaysInMonth = lastDayOfMonth.getDate();

    const days: Array<{
      dateString: string;
      dayNumber: number;
      isCurrentMonth: boolean;
      isToday: boolean;
    }> = [];

    // Previous month padding
    const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();
    for (let i = startingDayIndex - 1; i >= 0; i--) {
      const pDay = prevMonthLastDay - i;
      const pDate = new Date(currentYear, currentMonth - 1, pDay);
      const str = pDate.toISOString().split('T')[0];
      days.push({
        dateString: str,
        dayNumber: pDay,
        isCurrentMonth: false,
        isToday: str === today.toISOString().split('T')[0],
      });
    }

    // Current month days
    for (let d = 1; d <= totalDaysInMonth; d++) {
      const cDate = new Date(currentYear, currentMonth, d);
      const str = cDate.toISOString().split('T')[0];
      days.push({
        dateString: str,
        dayNumber: d,
        isCurrentMonth: true,
        isToday: str === today.toISOString().split('T')[0],
      });
    }

    // Next month padding to complete 35 or 42 grid cells
    const remaining = (7 - (days.length % 7)) % 7;
    for (let n = 1; n <= remaining; n++) {
      const nDate = new Date(currentYear, currentMonth + 1, n);
      const str = nDate.toISOString().split('T')[0];
      days.push({
        dateString: str,
        dayNumber: n,
        isCurrentMonth: false,
        isToday: str === today.toISOString().split('T')[0],
      });
    }

    return days;
  }, [currentYear, currentMonth]);

  const handlePrevMonth = () => {
    triggerHaptic('light');
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    triggerHaptic('light');
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleTodayClick = () => {
    triggerHaptic('light');
    const now = new Date();
    setCurrentYear(now.getFullYear());
    setCurrentMonth(now.getMonth());
    setSelectedDate(now.toISOString().split('T')[0]);
  };

  const handleDaySelect = (dateStr: string) => {
    triggerHaptic('light');
    setSelectedDate(dateStr);
  };

  // Day of week for selected date
  const selectedDateDayOfWeek = useMemo<DayOfWeek>(() => {
    const d = new Date(selectedDate);
    const dayIndex = d.getDay();
    const map: Array<'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat'> = [
      'sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat',
    ];
    return map[dayIndex];
  }, [selectedDate]);

  // Classes scheduled for the selected day of week
  const scheduledClassesForDay = useMemo(() => {
    return timeSlots
      .filter((s) => s.dayOfWeek === selectedDateDayOfWeek)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [timeSlots, selectedDateDayOfWeek]);

  // Events filtered for the selected day
  const selectedDateEvents = useMemo(() => {
    return combinedEvents.filter((e) => {
      if (e.date !== selectedDate) return false;
      if (activeFilter === 'exam') return e.type === 'exam';
      if (activeFilter === 'deadline') return e.type === 'homework' || e.type === 'assignment';
      if (activeFilter === 'event') return e.type === 'event';
      return true;
    });
  }, [combinedEvents, selectedDate, activeFilter]);

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    triggerHaptic('success');
    onAddEvent({
      title: formTitle.trim(),
      type: formType,
      date: formDate || selectedDate,
      time: formTime.trim() || undefined,
      subjectId: formType !== 'event' ? formSubjectId : undefined,
      location: formLocation.trim() || undefined,
      notes: formNotes.trim() || undefined,
      isCompleted: false,
    });

    setFormTitle('');
    setFormNotes('');
    setFormLocation('');
    setShowAddModal(false);
  };

  const getEventBadgeStyle = (type: CalendarEventType) => {
    switch (type) {
      case 'exam':
        return {
          bg: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
          dot: 'bg-rose-500',
          label: 'Exam',
          icon: AlertOctagon,
        };
      case 'homework':
        return {
          bg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          dot: 'bg-amber-400',
          label: 'Homework',
          icon: FileText,
        };
      case 'assignment':
        return {
          bg: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
          dot: 'bg-sky-400',
          label: 'Assignment',
          icon: GraduationCap,
        };
      case 'event':
      default:
        return {
          bg: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
          dot: 'bg-purple-400',
          label: 'Campus Event',
          icon: Sparkles,
        };
    }
  };

  return (
    <div className="flex flex-col gap-5 sm:gap-6">
      {/* Month Header & Controls */}
      <div className="bg-slate-900/90 border border-slate-800/90 rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shrink-0">
            <CalendarDays className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-slate-100">
                {MONTH_NAMES[currentMonth]} {currentYear}
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Monthly overview of college exams, homework deadlines & campus events.
            </p>
          </div>
        </div>

        {/* Navigation & Add Event Button */}
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <button
            onClick={handleTodayClick}
            className="min-h-[40px] px-3 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 active:scale-95 border border-slate-700 rounded-xl transition-all cursor-pointer"
          >
            Today
          </button>

          <div className="flex items-center bg-slate-800 rounded-xl border border-slate-700 p-0.5">
            <button
              onClick={handlePrevMonth}
              className="p-2 text-slate-300 hover:text-white active:scale-90 transition-transform cursor-pointer"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextMonth}
              className="p-2 text-slate-300 hover:text-white active:scale-90 transition-transform cursor-pointer"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => {
              triggerHaptic('light');
              setFormDate(selectedDate);
              setShowAddModal(true);
            }}
            className="min-h-[40px] px-3.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:scale-95 rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Event / Exam</span>
          </button>
        </div>
      </div>

      {/* Filter Chips & Legend */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-1">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => {
              triggerHaptic('light');
              setActiveFilter('all');
            }}
            className={`min-h-[34px] px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeFilter === 'all'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            All Items
          </button>
          <button
            onClick={() => {
              triggerHaptic('light');
              setActiveFilter('exam');
            }}
            className={`min-h-[34px] px-3 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeFilter === 'exam'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            Exams
          </button>
          <button
            onClick={() => {
              triggerHaptic('light');
              setActiveFilter('deadline');
            }}
            className={`min-h-[34px] px-3 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeFilter === 'deadline'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            Deadlines
          </button>
          <button
            onClick={() => {
              triggerHaptic('light');
              setActiveFilter('event');
            }}
            className={`min-h-[34px] px-3 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeFilter === 'event'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-purple-400" />
            Events
          </button>
        </div>

        {/* Legend */}
        <div className="hidden md:flex items-center gap-4 text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm shadow-rose-500/50" />
            <span>Exams</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span>Homework / Deadlines</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
            <span>Campus Events</span>
          </div>
        </div>
      </div>

      {/* Main Grid & Selected Day Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
        {/* Calendar Grid (2 Cols on Desktop) */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800/90 rounded-3xl p-3 sm:p-5 shadow-2xl flex flex-col">
          {/* Day of Week Headers */}
          <div className="grid grid-cols-7 mb-2 text-center">
            {DAYS_OF_WEEK.map((day) => (
              <div key={day} className="text-xs font-bold text-slate-400 py-1.5 uppercase tracking-wider">
                {day}
              </div>
            ))}
          </div>

          {/* Month Cells Grid */}
          <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
            {calendarDays.map((cell) => {
              const dayEvents = combinedEvents.filter((e) => e.date === cell.dateString);
              const isSelected = selectedDate === cell.dateString;

              const hasExam = dayEvents.some((e) => e.type === 'exam');
              const hasHomework = dayEvents.some((e) => e.type === 'homework' || e.type === 'assignment');
              const hasEvent = dayEvents.some((e) => e.type === 'event');

              return (
                <div
                  key={cell.dateString}
                  onClick={() => handleDaySelect(cell.dateString)}
                  className={`min-h-[64px] sm:min-h-[82px] p-1.5 sm:p-2 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between active:scale-[0.98] ${
                    isSelected
                      ? 'bg-indigo-950/60 border-indigo-500/80 shadow-lg shadow-indigo-950/50 ring-1 ring-indigo-500/50'
                      : cell.isCurrentMonth
                      ? 'bg-slate-950/40 border-slate-800/80 hover:border-slate-700'
                      : 'bg-slate-950/20 border-slate-900 text-slate-600 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-semibold rounded-lg px-1.5 py-0.5 ${
                        cell.isToday
                          ? 'bg-indigo-600 text-white font-bold'
                          : isSelected
                          ? 'text-indigo-200 font-bold'
                          : cell.isCurrentMonth
                          ? 'text-slate-200'
                          : 'text-slate-500'
                      }`}
                    >
                      {cell.dayNumber}
                    </span>

                    {/* Compact Marker Dots on Mobile */}
                    <div className="flex items-center gap-1 sm:hidden">
                      {hasExam && <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />}
                      {hasHomework && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
                      {hasEvent && <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />}
                    </div>
                  </div>

                  {/* Tablet/Desktop Event Pills inside cell */}
                  <div className="hidden sm:flex flex-col gap-1 mt-1 overflow-hidden">
                    {dayEvents.slice(0, 2).map((evt) => {
                      const badge = getEventBadgeStyle(evt.type);
                      return (
                        <div
                          key={evt.id}
                          className={`text-[10px] font-medium px-1.5 py-0.5 rounded-md truncate border flex items-center gap-1 ${badge.bg}`}
                          title={evt.title}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${badge.dot}`} />
                          <span className="truncate">{evt.title}</span>
                        </div>
                      );
                    })}
                    {dayEvents.length > 2 && (
                      <span className="text-[9px] font-bold text-slate-400 pl-1">
                        +{dayEvents.length - 2} more
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Date Drawer & Day Planner */}
        <div className="bg-slate-900/90 border border-slate-800/90 rounded-3xl p-4 sm:p-5 shadow-2xl flex flex-col gap-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                Selected Day
              </span>
              <h3 className="text-base font-bold text-white mt-0.5">
                {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                })}
              </h3>
            </div>

            <button
              onClick={() => {
                triggerHaptic('light');
                setFormDate(selectedDate);
                setShowAddModal(true);
              }}
              className="min-h-[36px] px-3 text-xs font-semibold text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 rounded-xl active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>

          {/* Events list for selected date */}
          <div className="flex flex-col gap-2.5 max-h-[380px] overflow-y-auto pr-1">
            {selectedDateEvents.length === 0 && (
              <div className="text-center py-6 px-4 bg-slate-950/40 rounded-2xl border border-slate-800/60 text-slate-400 text-xs">
                No exams or deadlines scheduled for this day.
              </div>
            )}

            {selectedDateEvents.map((evt) => {
              const badge = getEventBadgeStyle(evt.type);
              const sub = subjects.find((s) => s.id === evt.subjectId);

              return (
                <div
                  key={evt.id}
                  className={`p-3 rounded-2xl border flex flex-col gap-2 transition-all ${
                    evt.isCompleted
                      ? 'bg-slate-950/40 border-slate-800/60 opacity-60'
                      : 'bg-slate-950/70 border-slate-800/90 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.bg}`}>
                        {badge.label}
                      </span>
                      {sub && (
                        <span
                          className="text-[10px] font-semibold px-2 py-0.5 rounded-full text-white"
                          style={{ backgroundColor: `${sub.color}33`, color: sub.color }}
                        >
                          {sub.code}
                        </span>
                      )}
                    </div>

                    {!evt.isTaskItem && (
                      <button
                        onClick={() => {
                          triggerHaptic('warning');
                          onDeleteEvent(evt.id);
                        }}
                        className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer"
                        title="Delete event"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="text-xs sm:text-sm font-bold text-slate-100">
                    {evt.title}
                  </div>

                  {(evt.time || evt.location) && (
                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                      {evt.time && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{evt.time}</span>
                        </span>
                      )}
                      {evt.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{evt.location}</span>
                        </span>
                      )}
                    </div>
                  )}

                  {evt.notes && (
                    <p className="text-[11px] text-slate-400 italic">
                      {evt.notes}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Regular Scheduled Lectures for this Day of Week */}
          <div className="pt-3 border-t border-slate-800 flex flex-col gap-2">
            <span className="text-[11px] font-bold text-slate-400">
              Timetable Lectures ({scheduledClassesForDay.length}):
            </span>

            <div className="flex flex-col gap-1.5 max-h-[140px] overflow-y-auto pr-1">
              {scheduledClassesForDay.length === 0 ? (
                <span className="text-xs text-slate-500 italic">No college lectures on this day.</span>
              ) : (
                scheduledClassesForDay.map((slot) => {
                  const sub = subjects.find((s) => s.id === slot.subjectId);
                  return (
                    <div
                      key={slot.id}
                      className="text-xs p-2 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: sub?.color || '#6366F1' }}
                        />
                        <span className="font-semibold text-slate-200 truncate">
                          {sub?.name || 'Class'}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 shrink-0">
                        {slot.startTime} - {slot.endTime}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Event / Exam Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-700/80 p-5 sm:p-6 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-slate-100">Schedule Exam or Event</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="flex flex-col gap-3.5">
              {/* Type selector */}
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1.5">
                  Category
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormType('exam')}
                    className={`min-h-[36px] px-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                      formType === 'exam'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/60'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    🔴 Exam
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormType('homework')}
                    className={`min-h-[36px] px-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                      formType === 'homework'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/60'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    🟡 Deadline
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormType('event')}
                    className={`min-h-[36px] px-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                      formType === 'event'
                        ? 'bg-purple-500/20 text-purple-300 border-purple-500/60'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    🟣 Event
                  </button>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">
                  Title / Subject Test
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Midterm Theory Exam, Lab Viva, Tech Fest"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Subject selector (if exam/deadline) */}
              {formType !== 'event' && (
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">
                    Related Subject
                  </label>
                  <select
                    value={formSubjectId}
                    onChange={(e) => setFormSubjectId(e.target.value)}
                    className="w-full min-h-[44px] px-3 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500"
                  >
                    {subjects.map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.code} - {sub.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full min-h-[44px] px-3 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">
                    Time / Slot
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 10:00 AM or All Day"
                    value={formTime}
                    onChange={(e) => setFormTime(e.target.value)}
                    className="w-full min-h-[44px] px-3 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">
                  Location / Room
                </label>
                <input
                  type="text"
                  placeholder="e.g. Hall 204, Examination Hall 3, Online"
                  value={formLocation}
                  onChange={(e) => setFormLocation(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">
                  Syllabus / Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Chapters 1-4, bring scientific calculator"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full p-2.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 resize-none"
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
                  className="min-h-[40px] px-4 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 active:scale-95 rounded-xl transition-all cursor-pointer shadow-md"
                >
                  Save to Calendar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
