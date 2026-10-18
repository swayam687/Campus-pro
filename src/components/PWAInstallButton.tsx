import React, { useState } from 'react';
import { Download, Share2, PlusSquare, X, Check, Smartphone } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { triggerHaptic } from '../utils/haptics';

interface PWAInstallButtonProps {
  variant?: 'nav' | 'banner' | 'pill';
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'nav',
  className = '',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);

  // If already installed and running standalone, do not show
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    triggerHaptic('medium');
    if (isInstallable) {
      await install();
    } else {
      setShowGuide(true);
    }
  };

  if (variant === 'banner') {
    return (
      <>
        <div className={`p-4 rounded-3xl bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-slate-900 border border-indigo-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xl ${className}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shrink-0">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                <span>Download App to Home Screen</span>
                <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded">Chrome PWA</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Works 100% offline, opens fullscreen with zero browser bars.
              </div>
            </div>
          </div>

          <button
            onClick={handleInstallClick}
            className="min-h-[42px] px-4 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 active:scale-95 rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
          >
            <Download className="w-4 h-4" />
            <span>Install on Device</span>
          </button>
        </div>

        {/* Instructions modal if manual Chrome install or iOS */}
        {showGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-700/80 p-5 shadow-2xl flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-indigo-400" />
                  <h3 className="text-sm font-bold text-slate-100">
                    {isIOS ? 'Install on iPhone / iPad' : 'Install from Chrome'}
                  </h3>
                </div>
                <button
                  onClick={() => setShowGuide(false)}
                  className="p-1 text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {isIOS ? (
                <div className="text-xs text-slate-300 flex flex-col gap-2.5">
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-indigo-400 flex items-center justify-center font-bold text-[11px] shrink-0">1</span>
                    <span>Tap the <strong>Share</strong> icon in the bottom Safari toolbar.</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-indigo-400 flex items-center justify-center font-bold text-[11px] shrink-0">2</span>
                    <span>Scroll down and select <strong>Add to Home Screen</strong>.</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-indigo-400 flex items-center justify-center font-bold text-[11px] shrink-0">3</span>
                    <span>Launch CampusFlow anytime offline directly from your home screen!</span>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-slate-300 flex flex-col gap-2.5">
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-indigo-400 flex items-center justify-center font-bold text-[11px] shrink-0">1</span>
                    <span>Tap the <strong>three dots (⋮)</strong> menu in Chrome&apos;s top-right corner (or the install icon in address bar).</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-indigo-400 flex items-center justify-center font-bold text-[11px] shrink-0">2</span>
                    <span>Select <strong>Install app</strong> or <strong>Add to Home screen</strong>.</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-indigo-400 flex items-center justify-center font-bold text-[11px] shrink-0">3</span>
                    <span>CampusFlow installs as a standalone native-feeling app!</span>
                  </div>
                </div>
              )}

              <button
                onClick={() => {
                  triggerHaptic('light');
                  setShowGuide(false);
                }}
                className="w-full min-h-[44px] text-xs font-bold text-slate-200 bg-slate-800 hover:bg-slate-700 active:scale-95 rounded-xl transition-all cursor-pointer"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <button
        onClick={handleInstallClick}
        className={`min-h-[36px] flex items-center gap-1.5 px-3 text-xs font-semibold text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 rounded-xl active:scale-95 transition-all cursor-pointer ${className}`}
        title="Download and install app to device"
      >
        <Download className="w-3.5 h-3.5 text-indigo-400" />
        <span>Install App</span>
      </button>

      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-700/80 p-5 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm font-bold text-slate-100">
                  {isIOS ? 'Install on iPhone / iPad' : 'Download from Chrome'}
                </h3>
              </div>
              <button
                onClick={() => setShowGuide(false)}
                className="p-1 text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {isIOS ? (
              <div className="text-xs text-slate-300 flex flex-col gap-2.5">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-indigo-400 flex items-center justify-center font-bold text-[11px] shrink-0">1</span>
                  <span>Tap the <strong>Share</strong> button in Safari toolbar.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-indigo-400 flex items-center justify-center font-bold text-[11px] shrink-0">2</span>
                  <span>Tap <strong>Add to Home Screen</strong>.</span>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-300 flex flex-col gap-2.5">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-indigo-400 flex items-center justify-center font-bold text-[11px] shrink-0">1</span>
                  <span>Click the <strong>Install</strong> icon in Chrome&apos;s address bar, or tap the three dots (⋮) menu.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-indigo-400 flex items-center justify-center font-bold text-[11px] shrink-0">2</span>
                  <span>Select <strong>Install app</strong> / <strong>Add to Home Screen</strong>.</span>
                </div>
              </div>
            )}

            <button
              onClick={() => {
                triggerHaptic('light');
                setShowGuide(false);
              }}
              className="w-full min-h-[44px] text-xs font-bold text-slate-200 bg-slate-800 hover:bg-slate-700 active:scale-95 rounded-xl transition-all cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </>
  );
};
