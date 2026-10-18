import React, { useState, useEffect } from 'react';
import { X, Sparkles, Brain, CheckCircle2, AlertCircle, Eye, EyeOff, BookOpen, Clock, Loader2, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { RevisionItem, Subject } from '../types';

interface AiRevisionModalProps {
  item: RevisionItem | null;
  subject: Subject | null;
  isOpen: boolean;
  onClose: () => void;
  onMarkMastered: (itemId: string) => void;
  onSaveExplanation: (itemId: string, explanation: any) => void;
}

export const AiRevisionModal: React.FC<AiRevisionModalProps> = ({
  item,
  subject,
  isOpen,
  onClose,
  onMarkMastered,
  onSaveExplanation,
}) => {
  const [loading, setLoading] = useState(false);
  const [explanation, setExplanation] = useState<any>(null);
  const [revealedAnswers, setRevealedAnswers] = useState<Record<number, boolean>>({});
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!item || !isOpen) return;

    // If already cached on this item, use it
    if (item.aiExplanation) {
      setExplanation(item.aiExplanation);
      return;
    }

    // Otherwise fetch from server
    fetchExplanation(item.topicName, subject?.name || 'College Subject');
  }, [item, isOpen]);

  const fetchExplanation = async (topic: string, subName: string) => {
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/ai/explain-topic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          subject: subName,
          classTime: item?.dateAdded,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();
      setExplanation(data);
      if (item) {
        onSaveExplanation(item.id, data);
      }
    } catch (err: any) {
      console.warn('Falling back to local offline explanation', err);
      // Fallback offline revision template
      const fallback = {
        summary: `Structured revision breakdown for ${topic} in ${subName}.`,
        simpleAnalogy: `Think of ${topic} as an essential mechanism in ${subName}. Break it into input, transformation rule, and output.`,
        keyPoints: [
          `Review the primary theorem or algorithm definition from today's lecture`,
          `Trace 1 complete example step-by-step on scratch paper`,
          `Identify boundary conditions or edge cases (empty set, negative numbers, single element)`,
          `Write down the formula or pseudo-code from memory`,
        ],
        stepByStep: `1. Re-read the lecture slide on ${topic}.\n2. Close your notes and write a 2-sentence summary in your own words.\n3. Solve 1 sample question from textbook without looking.\n4. Verify your solution.`,
        activeRecallQuestions: [
          {
            question: `What is the core definition and purpose of ${topic}?`,
            answer: `Explain the fundamental concept in simple terms without reading your notes.`,
          },
          {
            question: `What is the most common pitfall students make on exam questions about ${topic}?`,
            answer: `Misinterpreting initial conditions or confusing similar terms.`,
          },
        ],
        isAiGenerated: false,
      };
      setExplanation(fallback);
      if (item) {
        onSaveExplanation(item.id, fallback);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !item) return null;

  const toggleAnswer = (idx: number) => {
    setRevealedAnswers((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const handleCompleteRevision = () => {
    onMarkMastered(item.id);
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#10B981', '#6366F1', '#38BDF8'],
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-start justify-between gap-4 bg-slate-950/60">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-[11px] font-semibold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-md">
                <Brain className="w-3.5 h-3.5" />
                High Thinking AI Tutor
              </span>
              {subject && (
                <span
                  className="text-xs font-semibold px-2 py-0.5 rounded"
                  style={{ backgroundColor: `${subject.color}20`, color: subject.color }}
                >
                  {subject.name}
                </span>
              )}
            </div>
            <h2 className="text-xl font-bold text-slate-100 mt-1">{item.topicName}</h2>
            <div className="text-xs text-slate-400 mt-0.5">
              Logged immediately after class · 15-Minute Evening Deep Dive
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 bg-slate-800/80 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col gap-5 max-h-[72vh] overflow-y-auto">
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center gap-3 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
              <div className="text-sm font-medium text-slate-200">
                Engaging Deep Reasoning & Step-by-Step Breakdown...
              </div>
              <div className="text-xs text-slate-500">
                Synthesizing plain analogies, exam pitfalls, and active-recall test cards.
              </div>
            </div>
          ) : explanation ? (
            <>
              {/* Summary Card */}
              <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/30">
                <div className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Quick Core Summary
                </div>
                <p className="text-sm text-slate-200 leading-relaxed">{explanation.summary}</p>
              </div>

              {/* Simple Analogy (ELI5) */}
              {explanation.simpleAnalogy && (
                <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30">
                  <div className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-1">
                    Plain-English Analogy (Why It Makes Sense)
                  </div>
                  <p className="text-xs text-amber-200/90 leading-relaxed italic">
                    &quot;{explanation.simpleAnalogy}&quot;
                  </p>
                </div>
              )}

              {/* Key Concept Takeaways */}
              {explanation.keyPoints && explanation.keyPoints.length > 0 && (
                <div className="flex flex-col gap-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Key Concepts to Remember
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {explanation.keyPoints.map((pt: string, idx: number) => (
                      <div
                        key={idx}
                        className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-xs text-slate-300 flex items-start gap-2"
                      >
                        <span className="w-4 h-4 rounded-full bg-slate-800 text-indigo-400 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span>{pt}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step-by-Step Walkthrough */}
              {explanation.stepByStep && (
                <div className="flex flex-col gap-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Step-by-Step Method & Mechanism
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 font-mono whitespace-pre-line leading-relaxed">
                    {explanation.stepByStep}
                  </div>
                </div>
              )}

              {/* Active Recall Self-Test Questions */}
              {explanation.activeRecallQuestions && explanation.activeRecallQuestions.length > 0 && (
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Active Recall Self-Test (Test Yourself Before Ending)
                    </span>
                    <span className="text-[11px] text-slate-500">Tap to reveal answer</span>
                  </div>

                  <div className="flex flex-col gap-2">
                    {explanation.activeRecallQuestions.map((q: any, idx: number) => {
                      const isRevealed = Boolean(revealedAnswers[idx]);
                      return (
                        <div
                          key={idx}
                          className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col gap-2"
                        >
                          <div className="flex items-start justify-between gap-3 text-xs font-semibold text-slate-200">
                            <span>Q{idx + 1}: {q.question}</span>
                            <button
                              onClick={() => toggleAnswer(idx)}
                              className="text-[11px] font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1 shrink-0 cursor-pointer"
                            >
                              {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                              <span>{isRevealed ? 'Hide' : 'Reveal'}</span>
                            </button>
                          </div>

                          {isRevealed && (
                            <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-500/30 text-xs text-emerald-300 mt-1">
                              <span className="font-bold">Answer: </span>
                              {q.answer}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          ) : null}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between gap-3">
          <div className="text-xs text-slate-400">
            {item.isRevised ? (
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Marked as Mastered
              </span>
            ) : (
              <span>Take 5-10 minutes to review notes and self-test.</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={handleCompleteRevision}
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-all shadow-md shadow-emerald-600/20 flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Mark Understood & Mastered!</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
