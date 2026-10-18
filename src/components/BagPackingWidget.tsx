import React, { useMemo } from 'react';
import { Backpack, CheckCircle2, Circle, Sparkles, Book, Laptop, FlaskConical, Calculator, ShieldCheck, RotateCcw, Check } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Subject, TimeSlot, DayOfWeek, PackingItem } from '../types';
import { triggerHaptic } from '../utils/haptics';

interface BagPackingWidgetProps {
  subjects: Subject[];
  timeSlots: TimeSlot[];
  currentDay: DayOfWeek;
  packedState: Record<string, boolean>;
  onToggleItem: (itemId: string) => void;
  onResetPacking: () => void;
  onPackAll: () => void;
}

export const BagPackingWidget: React.FC<BagPackingWidgetProps> = ({
  subjects,
  timeSlots,
  currentDay,
  packedState,
  onToggleItem,
  onResetPacking,
  onPackAll,
}) => {
  const packingItems: PackingItem[] = useMemo(() => {
    const todaySlots = timeSlots.filter((s) => s.dayOfWeek === currentDay);
    const todaySubjectIds = Array.from(new Set(todaySlots.map((s) => s.subjectId)));
    const todaySubjects = subjects.filter((s) => todaySubjectIds.includes(s.id));

    const items: PackingItem[] = [];

    items.push({
      id: 'essential-id',
      name: 'College Student ID Card & Transit Pass',
      category: 'essential',
      isPacked: Boolean(packedState['essential-id']),
      isEssential: true,
    });

    items.push({
      id: 'essential-water',
      name: 'Insulated Water Bottle (Filled)',
      category: 'gear',
      isPacked: Boolean(packedState['essential-water']),
      isEssential: true,
    });

    const needsLaptop = todaySubjects.some((s) => s.requiresLaptop);
    if (needsLaptop) {
      items.push({
        id: 'tech-laptop',
        name: 'Laptop & Power Charger Cable',
        category: 'tech',
        isPacked: Boolean(packedState['tech-laptop']),
        isEssential: true,
      });
    }

    const needsLab = todaySubjects.some((s) => s.requiresLabKit);
    if (needsLab) {
      items.push({
        id: 'gear-lab',
        name: 'Lab Coat / Practical File & Safety Kit',
        category: 'gear',
        isPacked: Boolean(packedState['gear-lab']),
        isEssential: true,
      });
    }

    const needsCalculator = todaySubjects.some((s) => s.requiresCalculator);
    if (needsCalculator) {
      items.push({
        id: 'tech-calculator',
        name: 'Scientific Calculator (Casio / Sharp)',
        category: 'tech',
        isPacked: Boolean(packedState['tech-calculator']),
        isEssential: true,
      });
    }

    todaySubjects.forEach((sub) => {
      sub.defaultMaterials.forEach((material, idx) => {
        const itemId = `mat-${sub.id}-${idx}`;
        items.push({
          id: itemId,
          name: `${sub.name}: ${material}`,
          category: 'notebook',
          isPacked: Boolean(packedState[itemId]),
          requiredForSubject: sub.name,
          isEssential: false,
        });
      });
    });

    return items;
  }, [subjects, timeSlots, currentDay, packedState]);

  const packedCount = packingItems.filter((i) => i.isPacked).length;
  const totalCount = packingItems.length;
  const isAllPacked = totalCount > 0 && packedCount === totalCount;
  const progressPercent = totalCount > 0 ? Math.round((packedCount / totalCount) * 100) : 0;

  const handleToggle = (itemId: string) => {
    const willBePacked = !packedState[itemId];
    if (willBePacked) {
      if (packedCount + 1 === totalCount) {
        triggerHaptic('success');
      } else {
        triggerHaptic('medium');
      }
    } else {
      triggerHaptic('light');
    }

    onToggleItem(itemId);

    if (willBePacked && packedCount + 1 === totalCount) {
      confetti({
        particleCount: 80,
        spread: 50,
        origin: { y: 0.65 },
        colors: ['#38BDF8', '#818CF8', '#34D399'],
      });
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'tech':
        return <Laptop className="w-4 h-4 text-sky-400" />;
      case 'gear':
        return <FlaskConical className="w-4 h-4 text-amber-400" />;
      case 'essential':
        return <ShieldCheck className="w-4 h-4 text-emerald-400" />;
      default:
        return <Book className="w-4 h-4 text-indigo-400" />;
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800/90 rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col gap-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shrink-0">
            <Backpack className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-100">Smart College Bag Packing</h2>
              {isAllPacked && (
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Ready
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Auto-matched to today&apos;s lectures & lab gear.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => {
              triggerHaptic('success');
              onPackAll();
            }}
            className="min-h-[40px] px-3.5 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 active:scale-95 border border-slate-700 rounded-xl transition-all cursor-pointer"
          >
            Pack All
          </button>
          <button
            onClick={() => {
              triggerHaptic('warning');
              onResetPacking();
            }}
            className="min-h-[40px] min-w-[40px] flex items-center justify-center text-slate-400 hover:text-slate-200 bg-slate-800 rounded-xl border border-slate-700 active:scale-95 cursor-pointer"
            title="Reset Checklist"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress Bar Card */}
      <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-300 font-medium">
            Packed: <span className="font-bold text-white tabular-nums">{packedCount} of {totalCount}</span> items
          </span>
          <span className="font-mono font-bold text-indigo-400 tabular-nums">{progressPercent}%</span>
        </div>
        <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              isAllPacked ? 'bg-emerald-500' : 'bg-gradient-to-r from-indigo-500 to-sky-400'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Item Checklist Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {packingItems.map((item) => (
          <div
            key={item.id}
            onClick={() => handleToggle(item.id)}
            className={`min-h-[60px] p-3.5 rounded-2xl border flex items-center justify-between gap-3.5 cursor-pointer transition-all active:scale-[0.98] ${
              item.isPacked
                ? 'bg-slate-950/40 border-slate-800/80 text-slate-500'
                : 'bg-slate-800/70 border-slate-700/80 hover:border-indigo-500/50 text-slate-200 shadow-sm'
            }`}
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="shrink-0">
                {item.isPacked ? (
                  <div className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded-full border-2 border-slate-600 flex items-center justify-center" />
                )}
              </div>

              <div className="min-w-0">
                <div className={`text-xs sm:text-sm font-semibold truncate ${item.isPacked ? 'line-through text-slate-500' : 'text-slate-100'}`}>
                  {item.name}
                </div>
                {item.requiredForSubject && (
                  <div className="text-[11px] text-slate-400 truncate mt-0.5">
                    For {item.requiredForSubject}
                  </div>
                )}
              </div>
            </div>

            <div className="p-2 rounded-xl bg-slate-900/80 shrink-0">
              {getCategoryIcon(item.category)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
