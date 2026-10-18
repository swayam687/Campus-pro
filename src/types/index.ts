export type DayOfWeek = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export interface Subject {
  id: string;
  name: string;
  code: string;
  color: string; // hex code or tailwind color
  room: string;
  professor?: string;
  requiresLabKit?: boolean;
  requiresLaptop?: boolean;
  requiresCalculator?: boolean;
  defaultMaterials: string[];
}

export interface TimeSlot {
  id: string;
  dayOfWeek: DayOfWeek;
  startTime: string; // "09:30"
  endTime: string;   // "10:20"
  subjectId: string;
  room?: string;
  notes?: string;
}

export interface ClassReview {
  id: string;
  slotId: string;
  subjectId: string;
  date: string; // YYYY-MM-DD
  topicNotUnderstood: boolean;
  topicName: string;
  needRevision: boolean;
  revisionPriority: 'low' | 'medium' | 'high';
  hasHomework: boolean;
  homeworkTitle: string;
  homeworkDeadline: string; // YYYY-MM-DD or ISO
  hasAssignment: boolean;
  assignmentTitle: string;
  assignmentDeadline: string; // YYYY-MM-DD or ISO
  clarityRating: number; // 1-5
  notes?: string;
  createdAt: number;
}

export interface RevisionItem {
  id: string;
  reviewId: string;
  subjectId: string;
  topicName: string;
  priority: 'low' | 'medium' | 'high';
  dateAdded: string;
  isRevised: boolean;
  revisedAt?: number;
  userNotes?: string;
  aiExplanation?: {
    summary: string;
    simpleAnalogy: string;
    keyPoints: string[];
    stepByStep: string;
    commonPitfalls?: string[];
    activeRecallQuestions?: Array<{ question: string; answer: string }>;
    quickActionPlan?: string;
    isAiGenerated: boolean;
  };
}

export interface TaskDeadlineItem {
  id: string;
  reviewId: string;
  subjectId: string;
  title: string;
  type: 'homework' | 'assignment';
  deadline: string; // YYYY-MM-DD or YYYY-MM-DDTHH:mm
  isCompleted: boolean;
  completedAt?: number;
  steps?: string[];
  estimatedMinutes?: number;
}

// Customizable Habit Model (Add, Remove, Toggle)
export interface HabitItem {
  id: string;
  name: string;
  category: 'fitness' | 'study' | 'health' | 'mindset' | 'routine';
  icon: string; // 'dumbbell', 'book', 'droplet', 'sun', 'brain', 'clock', 'sparkles'
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'anytime';
  streak: number;
  history: Record<string, boolean>; // date -> completed
  notes?: string;
  createdAt: number;
}

export interface PackingItem {
  id: string;
  name: string;
  category: 'textbook' | 'notebook' | 'tech' | 'gear' | 'essential';
  isPacked: boolean;
  requiredForSubject?: string;
  isEssential: boolean;
}

export interface AppSettings {
  collegeStartTime: string;
  collegeEndTime: string;
  morningReminderTime: string;
  eveningReviewTime: string;
  enableSoundEffects: boolean;
}

// Calendar & Events Model
export type CalendarEventType = 'exam' | 'homework' | 'assignment' | 'event' | 'reel';

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  type: CalendarEventType;
  subjectId?: string;
  time?: string;
  location?: string;
  notes?: string;
  isCompleted?: boolean;
}

// Instagram Reels Vault Model
export interface ReelVaultItem {
  id: string;
  title: string;
  url: string;
  scheduledDate: string; // YYYY-MM-DD
  scheduledTime?: string; // e.g. "19:30" or "Evening"
  category: 'study' | 'motivation' | 'fitness' | 'coding' | 'general';
  notes?: string;
  isWatched: boolean;
  watchedAt?: number;
  createdAt: number;
}
