import {
  Subject,
  TimeSlot,
  ClassReview,
  RevisionItem,
  TaskDeadlineItem,
  AppSettings,
  CalendarEvent,
  HabitItem,
  ReelVaultItem,
} from '../types';

const STORAGE_KEYS = {
  SUBJECTS: 'campusflow_subjects_v1',
  TIME_SLOTS: 'campusflow_time_slots_v1',
  REVIEWS: 'campusflow_reviews_v1',
  REVISIONS: 'campusflow_revisions_v1',
  TASKS: 'campusflow_tasks_v1',
  HABITS_LIST: 'campusflow_habits_list_v2',
  PACKED_ITEMS: 'campusflow_packed_items_v1',
  SETTINGS: 'campusflow_settings_v1',
  CALENDAR_EVENTS: 'campusflow_calendar_events_v1',
  REELS_VAULT: 'campusflow_reels_vault_v1',
};

export const DEFAULT_SUBJECTS: Subject[] = [
  {
    id: 'sub-dsa',
    name: 'Data Structures & Algorithms',
    code: 'CS301',
    color: '#3B82F6', // Blue
    room: 'Hall 204',
    professor: 'Dr. Sharma',
    requiresLaptop: true,
    requiresCalculator: false,
    defaultMaterials: ['DSA Textbook', 'Algorithm Notebook', 'Laptop'],
  },
  {
    id: 'sub-dbms',
    name: 'Database Management Systems',
    code: 'CS304',
    color: '#10B981', // Emerald
    room: 'Lab 2',
    professor: 'Prof. Vance',
    requiresLaptop: true,
    requiresLabKit: true,
    defaultMaterials: ['DBMS Lecture Notes', 'SQL Workbook', 'Laptop'],
  },
  {
    id: 'sub-os',
    name: 'Operating Systems',
    code: 'CS302',
    color: '#8B5CF6', // Purple
    room: 'Lecture Theatre B',
    professor: 'Dr. Katherine Cole',
    requiresLaptop: false,
    defaultMaterials: ['OS Concepts Book', 'Class Notebook'],
  },
  {
    id: 'sub-cn',
    name: 'Computer Networks',
    code: 'CS303',
    color: '#F59E0B', // Amber
    room: 'Hall 108',
    professor: 'Prof. Miller',
    requiresLaptop: true,
    defaultMaterials: ['Networks Textbook', 'Packet Tracer Notes'],
  },
  {
    id: 'sub-math',
    name: 'Probability & Discrete Math',
    code: 'MA202',
    color: '#EC4899', // Pink
    room: 'Auditorium A',
    professor: 'Dr. Aris Thorne',
    requiresCalculator: true,
    defaultMaterials: ['Formula Sheet', 'Scientific Calculator', 'Math Notebook'],
  },
];

export const DEFAULT_TIME_SLOTS: TimeSlot[] = [
  // Monday: 09:30 AM to 04:30 PM
  { id: 'slot-mon-1', dayOfWeek: 'mon', startTime: '09:30', endTime: '10:20', subjectId: 'sub-dsa', room: 'Hall 204' },
  { id: 'slot-mon-2', dayOfWeek: 'mon', startTime: '10:25', endTime: '11:15', subjectId: 'sub-os', room: 'LT-B' },
  { id: 'slot-mon-3', dayOfWeek: 'mon', startTime: '11:30', endTime: '12:20', subjectId: 'sub-dbms', room: 'Lab 2' },
  { id: 'slot-mon-4', dayOfWeek: 'mon', startTime: '13:00', endTime: '14:40', subjectId: 'sub-dbms', room: 'Lab 2 (Practical)', notes: 'Bring SQL Project file' },
  { id: 'slot-mon-5', dayOfWeek: 'mon', startTime: '14:50', endTime: '16:30', subjectId: 'sub-cn', room: 'Hall 108' },

  // Tuesday
  { id: 'slot-tue-1', dayOfWeek: 'tue', startTime: '09:30', endTime: '10:20', subjectId: 'sub-math', room: 'Auditorium A' },
  { id: 'slot-tue-2', dayOfWeek: 'tue', startTime: '10:25', endTime: '11:15', subjectId: 'sub-dsa', room: 'Hall 204' },
  { id: 'slot-tue-3', dayOfWeek: 'tue', startTime: '11:30', endTime: '12:20', subjectId: 'sub-cn', room: 'Hall 108' },
  { id: 'slot-tue-4', dayOfWeek: 'tue', startTime: '13:15', endTime: '14:45', subjectId: 'sub-os', room: 'LT-B' },
  { id: 'slot-tue-5', dayOfWeek: 'tue', startTime: '15:00', endTime: '16:30', subjectId: 'sub-math', room: 'Auditorium A (Tutorial)' },

  // Wednesday
  { id: 'slot-wed-1', dayOfWeek: 'wed', startTime: '09:30', endTime: '10:20', subjectId: 'sub-dbms', room: 'Hall 102' },
  { id: 'slot-wed-2', dayOfWeek: 'wed', startTime: '10:25', endTime: '11:15', subjectId: 'sub-dsa', room: 'Hall 204' },
  { id: 'slot-wed-3', dayOfWeek: 'wed', startTime: '11:30', endTime: '13:10', subjectId: 'sub-dsa', room: 'Computer Center (Lab)', notes: 'Graph algorithms coding' },
  { id: 'slot-wed-4', dayOfWeek: 'wed', startTime: '14:00', endTime: '15:15', subjectId: 'sub-cn', room: 'Hall 108' },
  { id: 'slot-wed-5', dayOfWeek: 'wed', startTime: '15:20', endTime: '16:30', subjectId: 'sub-os', room: 'LT-B' },

  // Thursday
  { id: 'slot-thu-1', dayOfWeek: 'thu', startTime: '09:30', endTime: '10:20', subjectId: 'sub-cn', room: 'Hall 108' },
  { id: 'slot-thu-2', dayOfWeek: 'thu', startTime: '10:25', endTime: '11:15', subjectId: 'sub-math', room: 'Auditorium A' },
  { id: 'slot-thu-3', dayOfWeek: 'thu', startTime: '11:30', endTime: '12:20', subjectId: 'sub-os', room: 'LT-B' },
  { id: 'slot-thu-4', dayOfWeek: 'thu', startTime: '13:00', endTime: '14:30', subjectId: 'sub-dbms', room: 'Lab 2' },
  { id: 'slot-thu-5', dayOfWeek: 'thu', startTime: '14:45', endTime: '16:30', subjectId: 'sub-dsa', room: 'Hall 204' },

  // Friday
  { id: 'slot-fri-1', dayOfWeek: 'fri', startTime: '09:30', endTime: '10:20', subjectId: 'sub-os', room: 'LT-B' },
  { id: 'slot-fri-2', dayOfWeek: 'fri', startTime: '10:25', endTime: '11:15', subjectId: 'sub-dbms', room: 'Hall 102' },
  { id: 'slot-fri-3', dayOfWeek: 'fri', startTime: '11:30', endTime: '12:20', subjectId: 'sub-math', room: 'Auditorium A' },
  { id: 'slot-fri-4', dayOfWeek: 'fri', startTime: '13:00', endTime: '14:30', subjectId: 'sub-cn', room: 'Networks Lab' },
  { id: 'slot-fri-5', dayOfWeek: 'fri', startTime: '14:45', endTime: '16:30', subjectId: 'sub-dsa', room: 'Hall 204 (Weekly Review)' },
];

export const DEFAULT_SETTINGS: AppSettings = {
  collegeStartTime: '09:30',
  collegeEndTime: '16:30',
  morningReminderTime: '08:15',
  eveningReviewTime: '17:15',
  enableSoundEffects: true,
};

export const getTodayDateString = (): string => {
  const d = new Date();
  return d.toISOString().split('T')[0];
};

export const getCurrentDayOfWeek = (): 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun' => {
  const dayIndex = new Date().getDay();
  const map: Array<'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat'> = [
    'sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'
  ];
  return map[dayIndex];
};

export const loadFromStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw);
  } catch (e) {
    console.warn(`Error reading ${key} from localStorage, using default`, e);
    return defaultValue;
  }
};

export const saveToStorage = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error saving ${key} to localStorage`, e);
  }
};

export const getSubjects = (): Subject[] => {
  return loadFromStorage<Subject[]>(STORAGE_KEYS.SUBJECTS, DEFAULT_SUBJECTS);
};

export const getTimeSlots = (): TimeSlot[] => {
  return loadFromStorage<TimeSlot[]>(STORAGE_KEYS.TIME_SLOTS, DEFAULT_TIME_SLOTS);
};

export const getReviews = (): ClassReview[] => {
  return loadFromStorage<ClassReview[]>(STORAGE_KEYS.REVIEWS, []);
};

export const getRevisions = (): RevisionItem[] => {
  const defaultRevisions: RevisionItem[] = [
    {
      id: 'rev-sample-1',
      reviewId: 'init-1',
      subjectId: 'sub-dsa',
      topicName: 'Red-Black Tree Balance Rotations',
      priority: 'high',
      dateAdded: getTodayDateString(),
      isRevised: false,
      aiExplanation: {
        summary: 'Red-Black trees use left and right rotations with color flipping to maintain O(log N) balance after insertions.',
        simpleAnalogy: 'Think of a rotation like pulling the pivot node up to become the parent, while the old root slides down to become its child, keeping alphabetical balance.',
        keyPoints: [
          'Root and leaves (NIL) are always black',
          'No two red nodes can be adjacent (red parent cannot have red child)',
          'Every path from root to leaves must have equal black nodes',
          'Case 1: Uncle is red -> Recolor; Case 2 & 3: Uncle is black -> Rotate and recolor',
        ],
        stepByStep: '1. Insert node with color red as in a standard BST.\n2. If parent is black, tree remains valid.\n3. If parent is red, inspect uncle color.\n4. Recolor or rotate depending on whether node is LL, LR, RR, or RL.',
        activeRecallQuestions: [
          {
            question: 'What happens if a newly inserted red node has a RED uncle?',
            answer: 'Recolor both parent and uncle to black, recolor grandparent to red, and check grandparent recursively.',
          },
          {
            question: 'Why do Red-Black trees prefer rotations over AVL trees in database indexes?',
            answer: 'They allow slightly less rigid balance (at most 2x depth), requiring fewer expensive rotations on frequent inserts/deletes.',
          },
        ],
        isAiGenerated: true,
      },
    },
    {
      id: 'rev-sample-2',
      reviewId: 'init-2',
      subjectId: 'sub-dbms',
      topicName: 'BCNF vs 3NF Normalization Edge Cases',
      priority: 'medium',
      dateAdded: getTodayDateString(),
      isRevised: false,
    },
  ];
  return loadFromStorage<RevisionItem[]>(STORAGE_KEYS.REVISIONS, defaultRevisions);
};

export const getTasks = (): TaskDeadlineItem[] => {
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const in3Days = new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0];

  const defaultTasks: TaskDeadlineItem[] = [
    {
      id: 'task-sample-1',
      reviewId: 'init-1',
      subjectId: 'sub-dsa',
      title: 'Implement Dijkstra’s Algorithm in C++/Python',
      type: 'homework',
      deadline: `${tomorrow}T23:59`,
      isCompleted: false,
      steps: [
        'Initialize min-priority queue and distance array with infinity',
        'Relax edges iteratively from source vertex',
        'Test on directed weighted cyclic graph with 6 nodes',
      ],
      estimatedMinutes: 45,
    },
    {
      id: 'task-sample-2',
      reviewId: 'init-2',
      subjectId: 'sub-dbms',
      title: 'ER Diagram & Relational Schema for University Portal',
      type: 'assignment',
      deadline: `${in3Days}T18:00`,
      isCompleted: false,
      steps: [
        'Identify strong and weak entity sets (Student, Course, Department)',
        'Specify cardinality ratios and foreign key references',
        'Write DDL table creation scripts with constraints',
      ],
      estimatedMinutes: 60,
    },
  ];
  return loadFromStorage<TaskDeadlineItem[]>(STORAGE_KEYS.TASKS, defaultTasks);
};

// ==========================================
// CUSTOMIZABLE HABITS STORE
// ==========================================

export const DEFAULT_HABITS_LIST: HabitItem[] = [
  {
    id: 'habit-workout',
    name: '10-Min Morning Home Workout',
    category: 'fitness',
    icon: 'dumbbell',
    timeOfDay: 'morning',
    streak: 4,
    history: {
      [new Date(Date.now() - 86400000 * 4).toISOString().split('T')[0]]: true,
      [new Date(Date.now() - 86400000 * 3).toISOString().split('T')[0]]: true,
      [new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0]]: true,
      [new Date(Date.now() - 86400000 * 1).toISOString().split('T')[0]]: true,
    },
    notes: 'No ads, quick morning energizer',
    createdAt: Date.now() - 86400000 * 5,
  },
  {
    id: 'habit-water',
    name: 'Morning Hydration (500ml Water)',
    category: 'health',
    icon: 'droplet',
    timeOfDay: 'morning',
    streak: 5,
    history: {
      [new Date(Date.now() - 86400000 * 1).toISOString().split('T')[0]]: true,
      [getTodayDateString()]: true,
    },
    notes: 'Before leaving for college',
    createdAt: Date.now() - 86400000 * 6,
  },
  {
    id: 'habit-bag',
    name: 'Pack College Bag from Timetable',
    category: 'routine',
    icon: 'backpack',
    timeOfDay: 'morning',
    streak: 4,
    history: {
      [new Date(Date.now() - 86400000 * 1).toISOString().split('T')[0]]: true,
    },
    notes: 'Ensure books, lab coat & laptop are packed',
    createdAt: Date.now() - 86400000 * 5,
  },
  {
    id: 'habit-review',
    name: 'Post-Class Instant Micro-Review',
    category: 'study',
    icon: 'sparkles',
    timeOfDay: 'afternoon',
    streak: 3,
    history: {},
    notes: 'Log unclear topics & homework right after lecture',
    createdAt: Date.now() - 86400000 * 4,
  },
  {
    id: 'habit-revision',
    name: 'Evening 20-min Revision & Homework',
    category: 'study',
    icon: 'book',
    timeOfDay: 'evening',
    streak: 2,
    history: {},
    notes: 'Revise logged lecture topics at home',
    createdAt: Date.now() - 86400000 * 3,
  },
];

export const getHabitsList = (): HabitItem[] => {
  return loadFromStorage<HabitItem[]>(STORAGE_KEYS.HABITS_LIST, DEFAULT_HABITS_LIST);
};

export const saveHabitsList = (habits: HabitItem[]): void => {
  saveToStorage(STORAGE_KEYS.HABITS_LIST, habits);
};

export const getPackedItems = (date: string = getTodayDateString()): Record<string, boolean> => {
  const key = `${STORAGE_KEYS.PACKED_ITEMS}_${date}`;
  return loadFromStorage<Record<string, boolean>>(key, {});
};

export const savePackedItem = (itemId: string, isPacked: boolean, date: string = getTodayDateString()): void => {
  const current = getPackedItems(date);
  current[itemId] = isPacked;
  const key = `${STORAGE_KEYS.PACKED_ITEMS}_${date}`;
  saveToStorage(key, current);
};

// ==========================================
// CALENDAR & EVENTS STORE
// ==========================================

export const getCalendarEvents = (): CalendarEvent[] => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');

  const defaultEvents: CalendarEvent[] = [
    {
      id: 'evt-1',
      title: 'DBMS Midterm Theory Exam',
      date: `${year}-${month}-21`,
      type: 'exam',
      subjectId: 'sub-dbms',
      time: '10:00 AM',
      location: 'Examination Hall 3',
      notes: 'Covers SQL, Relational Algebra & ER Modeling',
      isCompleted: false,
    },
    {
      id: 'evt-2',
      title: 'DSA Practical Lab Viva & Coding Test',
      date: `${year}-${month}-24`,
      type: 'exam',
      subjectId: 'sub-dsa',
      time: '02:00 PM',
      location: 'Computer Center 2',
      notes: 'Graph algorithms & tree traversals on system',
      isCompleted: false,
    },
    {
      id: 'evt-3',
      title: 'Computer Networks Packet Tracer Submission',
      date: `${year}-${month}-23`,
      type: 'homework',
      subjectId: 'sub-cn',
      time: '11:59 PM',
      location: 'College Portal',
      notes: 'Subnetting & routing table configuration report',
      isCompleted: false,
    },
    {
      id: 'evt-4',
      title: 'Probability & Discrete Math Problem Set 4',
      date: `${year}-${month}-26`,
      type: 'assignment',
      subjectId: 'sub-math',
      time: '04:30 PM',
      location: 'Auditorium A submission box',
      notes: 'Bayes Theorem and Graph Isomorphism',
      isCompleted: false,
    },
    {
      id: 'evt-5',
      title: 'Annual University Tech Hackathon 2026',
      date: `${year}-${month}-28`,
      type: 'event',
      time: '09:00 AM',
      location: 'Student Innovation Center',
      notes: '36-hour offline campus hackathon',
      isCompleted: false,
    },
  ];

  return loadFromStorage<CalendarEvent[]>(STORAGE_KEYS.CALENDAR_EVENTS, defaultEvents);
};

// ==========================================
// INSTAGRAM REELS VAULT STORE
// ==========================================

export const DEFAULT_REELS_VAULT: ReelVaultItem[] = [
  {
    id: 'reel-1',
    title: 'Intuitive Tree Inversion & BFS Tracing',
    url: 'https://www.instagram.com/reel/C8xyz123',
    scheduledDate: getTodayDateString(),
    scheduledTime: '19:00',
    category: 'study',
    notes: 'Watch during evening revision for DSA midterm viva',
    isWatched: false,
    createdAt: Date.now() - 86400000,
  },
  {
    id: 'reel-2',
    title: '10-Minute Full Body Mobility Routine for Students',
    url: 'https://www.instagram.com/reel/C7abc456',
    scheduledDate: getTodayDateString(),
    scheduledTime: '08:30',
    category: 'fitness',
    notes: 'Quick stretch before morning commute',
    isWatched: true,
    watchedAt: Date.now() - 3600000,
    createdAt: Date.now() - 86400000 * 2,
  },
  {
    id: 'reel-3',
    title: 'Operating System Banker’s Algorithm in 60 Seconds',
    url: 'https://www.instagram.com/reel/C6def789',
    scheduledDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    scheduledTime: '20:15',
    category: 'coding',
    notes: 'Deadlock avoidance quick recap',
    isWatched: false,
    createdAt: Date.now() - 40000000,
  },
  {
    id: 'reel-4',
    title: 'Dopamine Detox & Focus Habits for Exam Week',
    url: 'https://www.instagram.com/reel/C5ghi012',
    scheduledDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    scheduledTime: '21:00',
    category: 'motivation',
    notes: 'Watch on weekend evening',
    isWatched: false,
    createdAt: Date.now() - 50000000,
  },
];

export const getReelsVault = (): ReelVaultItem[] => {
  return loadFromStorage<ReelVaultItem[]>(STORAGE_KEYS.REELS_VAULT, DEFAULT_REELS_VAULT);
};

export const saveReelsVault = (reels: ReelVaultItem[]): void => {
  saveToStorage(STORAGE_KEYS.REELS_VAULT, reels);
};

/**
 * Resets / Clears application data back to defaults or clean state
 */
export const clearAllData = (): void => {
  try {
    Object.values(STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key);
    });
    // Remove any packed item dates
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith('campusflow_')) {
        localStorage.removeItem(k);
      }
    }
  } catch (e) {
    console.error('Error clearing data from localStorage', e);
  }
};
