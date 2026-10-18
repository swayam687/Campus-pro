import React, { useState } from 'react';
import {
  Film,
  Plus,
  ExternalLink,
  Calendar,
  Clock,
  CheckCircle2,
  Trash2,
  Sparkles,
  Search,
  Filter,
  Copy,
  Check,
  Video,
  Tag,
  Bookmark,
} from 'lucide-react';
import { ReelVaultItem } from '../types';
import { getTodayDateString } from '../utils/storage';
import { triggerHaptic } from '../utils/haptics';

interface ReelsVaultProps {
  reels: ReelVaultItem[];
  onAddReel: (reel: Omit<ReelVaultItem, 'id' | 'isWatched' | 'createdAt'>) => void;
  onDeleteReel: (reelId: string) => void;
  onToggleWatched: (reelId: string) => void;
  onRescheduleReel?: (reelId: string, newDate: string, newTime?: string) => void;
}

export const ReelsVault: React.FC<ReelsVaultProps> = ({
  reels,
  onAddReel,
  onDeleteReel,
  onToggleWatched,
}) => {
  const today = getTodayDateString();
  const [activeTab, setActiveTab] = useState<'today' | 'upcoming' | 'unwatched' | 'watched'>('today');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [scheduledDate, setScheduledDate] = useState(today);
  const [scheduledTime, setScheduledTime] = useState('19:00');
  const [category, setCategory] = useState<'study' | 'motivation' | 'fitness' | 'coding' | 'general'>('study');
  const [notes, setNotes] = useState('');

  const handleCreateReel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) return;

    triggerHaptic('success');
    onAddReel({
      title: title.trim(),
      url: url.trim(),
      scheduledDate: scheduledDate || today,
      scheduledTime: scheduledTime.trim() || undefined,
      category,
      notes: notes.trim() || undefined,
    });

    setTitle('');
    setUrl('');
    setNotes('');
    setShowAddModal(false);
  };

  const handleCopyLink = (reel: ReelVaultItem) => {
    triggerHaptic('light');
    navigator.clipboard.writeText(reel.url);
    setCopiedId(reel.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleToggle = (reelId: string, isCurrentlyWatched: boolean) => {
    if (!isCurrentlyWatched) {
      triggerHaptic('success');
    } else {
      triggerHaptic('light');
    }
    onToggleWatched(reelId);
  };

  // Filter calculations
  const filteredReels = reels.filter((r) => {
    // Search query match
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = r.title.toLowerCase().includes(q);
      const matchNotes = r.notes?.toLowerCase().includes(q);
      const matchCat = r.category.toLowerCase().includes(q);
      if (!matchTitle && !matchNotes && !matchCat) return false;
    }

    if (activeTab === 'today') {
      return r.scheduledDate === today && !r.isWatched;
    }
    if (activeTab === 'upcoming') {
      return r.scheduledDate > today && !r.isWatched;
    }
    if (activeTab === 'unwatched') {
      return !r.isWatched;
    }
    if (activeTab === 'watched') {
      return r.isWatched;
    }
    return true;
  });

  const todayCount = reels.filter((r) => r.scheduledDate === today && !r.isWatched).length;
  const totalUnwatchedCount = reels.filter((r) => !r.isWatched).length;

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'study':
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/25';
      case 'coding':
        return 'bg-sky-500/10 text-sky-400 border-sky-500/25';
      case 'fitness':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25';
      case 'motivation':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/25';
      default:
        return 'bg-purple-500/10 text-purple-400 border-purple-500/25';
    }
  };

  return (
    <div className="flex flex-col gap-5 sm:gap-6">
      {/* Vault Header Banner */}
      <div className="bg-slate-900/90 border border-slate-800/90 rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 via-pink-500 to-amber-400 text-white flex items-center justify-center shadow-lg shadow-pink-500/20 shrink-0">
            <Film className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-slate-100">Instagram Reels Vault</h2>
              <span className="text-[10px] font-bold text-pink-400 bg-pink-500/10 border border-pink-500/25 px-2 py-0.5 rounded-full">
                Watch Later Queue
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Copy-paste reels during the day, schedule them with a title, and watch them distraction-free at home.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => {
              triggerHaptic('light');
              setScheduledDate(today);
              setShowAddModal(true);
            }}
            className="min-h-[42px] px-4 text-xs font-bold text-white bg-gradient-to-r from-pink-600 via-rose-600 to-indigo-600 hover:opacity-90 active:scale-95 rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule New Reel</span>
          </button>
        </div>
      </div>

      {/* Tabs & Search Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Segmented Filter Switcher */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => {
              triggerHaptic('light');
              setActiveTab('today');
            }}
            className={`min-h-[36px] px-3.5 text-xs font-semibold rounded-xl flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'today'
                ? 'bg-pink-600 text-white shadow-md'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Scheduled for Today</span>
            {todayCount > 0 && (
              <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded-full tabular-nums">
                {todayCount}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              triggerHaptic('light');
              setActiveTab('upcoming');
            }}
            className={`min-h-[36px] px-3.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'upcoming'
                ? 'bg-pink-600 text-white shadow-md'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            Upcoming
          </button>

          <button
            onClick={() => {
              triggerHaptic('light');
              setActiveTab('unwatched');
            }}
            className={`min-h-[36px] px-3.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'unwatched'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            All Unwatched ({totalUnwatchedCount})
          </button>

          <button
            onClick={() => {
              triggerHaptic('light');
              setActiveTab('watched');
            }}
            className={`min-h-[36px] px-3.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'watched'
                ? 'bg-slate-800 text-slate-200 shadow-md'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            Watched Archive
          </button>
        </div>

        {/* Search input */}
        <div className="relative min-w-[200px] sm:w-64">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search saved reels..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full min-h-[36px] pl-9 pr-3 text-xs bg-slate-900 border border-slate-800 rounded-xl text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-pink-500"
          />
        </div>
      </div>

      {/* Reels Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filteredReels.map((reel) => {
          return (
            <div
              key={reel.id}
              className={`p-4 rounded-3xl border flex flex-col justify-between gap-3.5 transition-all ${
                reel.isWatched
                  ? 'bg-slate-950/40 border-slate-800/80 opacity-60 text-slate-400'
                  : 'bg-slate-900/90 border-slate-800/90 hover:border-pink-500/40 text-slate-200 shadow-xl'
              }`}
            >
              <div className="flex flex-col gap-2">
                <div className="flex items-start justify-between gap-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize ${getCategoryBadge(
                      reel.category
                    )}`}
                  >
                    {reel.category}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleCopyLink(reel)}
                      className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg active:scale-90 transition-transform cursor-pointer"
                      title="Copy Reel Link"
                    >
                      {copiedId === reel.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>

                    <button
                      onClick={() => {
                        triggerHaptic('warning');
                        onDeleteReel(reel.id);
                      }}
                      className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg active:scale-90 transition-transform cursor-pointer"
                      title="Delete from Vault"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Reel Title */}
                <h3
                  className={`text-sm font-bold line-clamp-2 ${
                    reel.isWatched ? 'line-through text-slate-500' : 'text-slate-100'
                  }`}
                >
                  {reel.title}
                </h3>

                {reel.notes && (
                  <p className="text-xs text-slate-400 line-clamp-2 italic">
                    {reel.notes}
                  </p>
                )}

                {/* Schedule badge */}
                <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-pink-400" />
                    <span>
                      {reel.scheduledDate === today ? 'Today' : reel.scheduledDate}
                    </span>
                  </span>
                  {reel.scheduledTime && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-pink-400" />
                      <span>{reel.scheduledTime}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons Row */}
              <div className="flex items-center justify-between pt-2.5 border-t border-slate-800/80 gap-2">
                {/* Watch Reel Button */}
                <a
                  href={reel.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => triggerHaptic('light')}
                  className="min-h-[38px] px-3.5 text-xs font-bold text-white bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 active:scale-95 rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>Open Reel</span>
                  <ExternalLink className="w-3 h-3 opacity-70" />
                </a>

                {/* Mark as Watched Toggle */}
                <button
                  onClick={() => handleToggle(reel.id, reel.isWatched)}
                  className={`min-h-[38px] px-3 text-xs font-semibold rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                    reel.isWatched
                      ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{reel.isWatched ? 'Watched' : 'Mark Done'}</span>
                </button>
              </div>
            </div>
          );
        })}

        {filteredReels.length === 0 && (
          <div className="col-span-full py-12 px-4 bg-slate-900/40 border border-slate-800 rounded-3xl text-center flex flex-col items-center gap-3">
            <Film className="w-9 h-9 text-pink-400 opacity-60" />
            <div className="text-sm font-semibold text-slate-300">
              No reels found in this view
            </div>
            <div className="text-xs text-slate-500 max-w-sm">
              Copy-paste an Instagram reel URL above to save it with a title and schedule it for later!
            </div>
          </div>
        )}
      </div>

      {/* Add Reel Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-700/80 p-5 sm:p-6 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Film className="w-5 h-5 text-pink-400" />
                <span>Save Reel to Vault</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateReel} className="flex flex-col gap-3.5">
              {/* Instagram URL */}
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">
                  Paste Instagram Reel URL
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://www.instagram.com/reel/..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-pink-500 font-mono"
                />
              </div>

              {/* Title */}
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">
                  Custom Title (Why are you saving this?)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. DSA Binary Search Quick Explanation, Morning Spine Stretch"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-pink-500"
                />
              </div>

              {/* Schedule Date & Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">
                    Schedule Date
                  </label>
                  <input
                    type="date"
                    required
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full min-h-[44px] px-3 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-pink-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">
                    Scheduled Time
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 19:30 or Evening"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="w-full min-h-[44px] px-3 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-pink-500"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">
                  Category Tag
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as typeof category)}
                  className="w-full min-h-[44px] px-3 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-pink-500"
                >
                  <option value="study">Study & College</option>
                  <option value="coding">Coding & Algorithms</option>
                  <option value="fitness">Fitness & Workout</option>
                  <option value="motivation">Motivation & Mindset</option>
                  <option value="general">General & Entertainment</option>
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">
                  Optional Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Useful for upcoming midterm exam viva"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-pink-500"
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
                  className="min-h-[40px] px-4 text-xs font-bold text-white bg-gradient-to-r from-pink-600 to-indigo-600 hover:opacity-90 active:scale-95 rounded-xl shadow-md transition-all cursor-pointer"
                >
                  Save to Vault
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
