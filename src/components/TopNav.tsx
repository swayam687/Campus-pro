import React, { useState } from 'react';
import {
  Sparkles,
  WifiOff,
  CheckCircle2,
  Calendar,
  Film,
  RotateCcw,
  CheckCheck,
  AlertTriangle,
  X,
} from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';

export type NavViewType =
  | 'schedule'
  | 'calendar'
  | 'habits'
  | 'bag'
  | 'evening'
  | 'vault'
  | '3d';

interface TopNavProps {
  activeView: NavViewType;
  onSelectView: (view: NavViewType) => void;
  onOpenQuickReview: () => void;
  onClearAllData: () => void;
  isOnline: boolean;
  pendingReviewsCount: number;
}

export const TopNav: React.FC<TopNavProps> = ({
  activeView,
  onSelectView,
  onOpenQuickReview,
  onClearAllData,
  isOnline,
  pendingReviewsCount,
}) => {
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleConfirmClear = () => {
    triggerHaptic('warning');
    setShowClearConfirm(false);
    onClearAllData();
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-xl border-b border-slate-800/80 pt-safe">
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 h-13 sm:h-14 flex items-center justify-between gap-3">
        {/* Brand Zone */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => {
              triggerHaptic('light');
              onSelectView('schedule');
            }}
            className="flex items-center gap-2 text-base sm:text-lg font-bold tracking-tight text-white whitespace-nowrap cursor-pointer active:scale-95 transition-transform"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 ring-4 ring-indigo-500/20" />
            <span>CampusFlow</span>
          </button>

          {!isOnline && (
            <span className="flex items-center gap-1 text-[10px] font-medium text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded-md">
              <WifiOff className="w-2.5 h-2.5" />
              <span>Offline</span>
            </span>
          )}
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-5 text-xs font-semibold text-slate-400">
          <button
            onClick={() => {
              triggerHaptic('light');
              onSelectView('schedule');
            }}
            className={`whitespace-nowrap transition-colors cursor-pointer py-1 ${
              activeView === 'schedule' ? 'text-indigo-400 font-bold border-b-2 border-indigo-500' : 'hover:text-slate-200'
            }`}
          >
            Schedule
          </button>

          <button
            onClick={() => {
              triggerHaptic('light');
              onSelectView('calendar');
            }}
            className={`whitespace-nowrap transition-colors cursor-pointer py-1 flex items-center gap-1.5 ${
              activeView === 'calendar' ? 'text-rose-400 font-bold border-b-2 border-rose-500' : 'hover:text-slate-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Monthly Calendar</span>
          </button>

          <button
            onClick={() => {
              triggerHaptic('light');
              onSelectView('habits');
            }}
            className={`whitespace-nowrap transition-colors cursor-pointer py-1 flex items-center gap-1.5 ${
              activeView === 'habits' ? 'text-indigo-400 font-bold border-b-2 border-indigo-500' : 'hover:text-slate-200'
            }`}
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Habits</span>
          </button>

          <button
            onClick={() => {
              triggerHaptic('light');
              onSelectView('bag');
            }}
            className={`whitespace-nowrap transition-colors cursor-pointer py-1 ${
              activeView === 'bag' ? 'text-indigo-400 font-bold border-b-2 border-indigo-500' : 'hover:text-slate-200'
            }`}
          >
            Pack Bag
          </button>

          <button
            onClick={() => {
              triggerHaptic('light');
              onSelectView('evening');
            }}
            className={`whitespace-nowrap transition-colors cursor-pointer py-1 flex items-center gap-1.5 ${
              activeView === 'evening' ? 'text-indigo-400 font-bold border-b-2 border-indigo-500' : 'hover:text-slate-200'
            }`}
          >
            <span>Evening Hub</span>
            {pendingReviewsCount > 0 && (
              <span className="text-[10px] font-mono bg-indigo-600 text-white px-1.5 py-0.2 rounded-full tabular-nums">
                {pendingReviewsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              triggerHaptic('light');
              onSelectView('vault');
            }}
            className={`whitespace-nowrap transition-colors cursor-pointer py-1 flex items-center gap-1.5 ${
              activeView === 'vault' ? 'text-pink-400 font-bold border-b-2 border-pink-500' : 'hover:text-slate-200'
            }`}
          >
            <Film className="w-3.5 h-3.5 text-pink-400" />
            <span>Reels Vault</span>
          </button>

          <button
            onClick={() => {
              triggerHaptic('light');
              onSelectView('3d');
            }}
            className={`whitespace-nowrap transition-colors cursor-pointer py-1 flex items-center gap-1 ${
              activeView === '3d' ? 'text-indigo-400 font-bold border-b-2 border-indigo-500' : 'hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3 h-3 text-indigo-400" />
            <span>3D Desk</span>
          </button>
        </nav>

        {/* Right Actions: Clear Data + Quick Review */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Clear / Reset Data Button */}
          <button
            onClick={() => {
              triggerHaptic('warning');
              setShowClearConfirm(true);
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-slate-400 hover:text-rose-300 bg-slate-900 hover:bg-rose-950/40 border border-slate-800 hover:border-rose-500/30 rounded-xl active:scale-95 transition-all cursor-pointer"
            title="Clear and reset application data"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Data</span>
          </button>

          {/* Quick Review CTA */}
          <button
            onClick={() => {
              triggerHaptic('light');
              onOpenQuickReview();
            }}
            className="min-h-[38px] px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:scale-95 rounded-xl transition-all shadow-md shadow-indigo-600/25 flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Review Class</span>
            <span className="sm:hidden">Review</span>
          </button>
        </div>
      </div>

      {/* Clear Data Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-700/80 p-5 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                <AlertTriangle className="w-5 h-5" />
                <span>Reset Application Data?</span>
              </div>
              <button
                onClick={() => setShowClearConfirm(false)}
                className="text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              This will clear your logged reviews, tasks, custom habits, and reels vault, and restore pristine defaults. This action cannot be undone.
            </p>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="min-h-[38px] px-3.5 text-xs font-semibold text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmClear}
                className="min-h-[38px] px-4 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 active:scale-95 rounded-xl shadow-md transition-all cursor-pointer"
              >
                Yes, Reset Data
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
