import React, { useEffect, useRef, useState } from 'react';
import { Camera, Backpack, Dumbbell, Clock, Lamp, Eye, EyeOff, Sparkles } from 'lucide-react';
import { initThreeDeskScene, SceneController, CameraPreset } from '../utils/threeDeskScene';

interface ThreeDeskViewerProps {
  isBagPacked: boolean;
  onToggleBagPack: () => void;
  onWorkoutComplete?: () => void;
  className?: string;
}

export const ThreeDeskViewer: React.FC<ThreeDeskViewerProps> = ({
  isBagPacked,
  onToggleBagPack,
  className = '',
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<SceneController | null>(null);

  const [activePreset, setActivePreset] = useState<CameraPreset>('overview');
  const [isLampOn, setIsLampOn] = useState(true);
  const [isHudCollapsed, setIsHudCollapsed] = useState(false);

  useEffect(() => {
    if (!mountRef.current) return;
    const controller = initThreeDeskScene(mountRef.current);
    controllerRef.current = controller;

    return () => {
      controller.dispose();
      controllerRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (controllerRef.current) {
      controllerRef.current.triggerBagPacking(isBagPacked);
    }
  }, [isBagPacked]);

  const handleSelectPreset = (preset: CameraPreset) => {
    setActivePreset(preset);
    controllerRef.current?.setCameraPreset(preset);
  };

  const handleToggleLamp = () => {
    if (controllerRef.current) {
      const state = controllerRef.current.toggleLamp();
      setIsLampOn(state);
    }
  };

  const handleTriggerWorkout = () => {
    handleSelectPreset('workout');
    controllerRef.current?.triggerWorkoutCelebration();
  };

  return (
    <div className={`relative w-full h-[460px] sm:h-[540px] lg:h-[620px] rounded-3xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl ${className}`}>
      {/* Three.js Canvas Container */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Left Title Badge */}
      <div className="absolute top-3.5 left-3.5 z-10 flex items-center gap-2 pointer-events-none select-none">
        <span className="text-[11px] font-bold text-slate-200 bg-slate-900/90 border border-slate-700/80 px-3 py-1.5 rounded-xl shadow-lg backdrop-blur-md">
          3D Study Desk & Bag Orbit
        </span>
      </div>

      {/* Top Right Quick Zen Mode */}
      <div className="absolute top-3.5 right-3.5 z-10 flex items-center gap-2">
        <button
          onClick={() => setIsHudCollapsed(!isHudCollapsed)}
          className="min-h-[36px] flex items-center gap-1.5 px-3 text-xs font-semibold text-slate-300 bg-slate-900/90 hover:bg-slate-800 active:scale-95 border border-slate-700/80 rounded-xl transition-all cursor-pointer backdrop-blur-md shadow-lg"
          title="Toggle Controls Visibility"
        >
          {isHudCollapsed ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          <span>{isHudCollapsed ? 'Controls' : 'Zen View'}</span>
        </button>
      </div>

      {/* Collapsible Mobile Bottom Control Dock */}
      {!isHudCollapsed && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 w-[94%] max-w-xl bg-slate-900/95 border border-slate-700/90 rounded-2xl p-2 sm:p-2.5 shadow-2xl backdrop-blur-xl">
          <div className="flex flex-wrap items-center justify-between gap-1.5">
            {/* Camera Angle Selector Pills */}
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
              <button
                onClick={() => handleSelectPreset('overview')}
                className={`min-h-[36px] flex items-center gap-1 px-2.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap active:scale-95 cursor-pointer ${
                  activePreset === 'overview'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Desk</span>
              </button>

              <button
                onClick={() => handleSelectPreset('bag')}
                className={`min-h-[36px] flex items-center gap-1 px-2.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap active:scale-95 cursor-pointer ${
                  activePreset === 'bag'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Backpack className="w-3.5 h-3.5" />
                <span>Bag</span>
              </button>

              <button
                onClick={() => handleSelectPreset('workout')}
                className={`min-h-[36px] flex items-center gap-1 px-2.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap active:scale-95 cursor-pointer ${
                  activePreset === 'workout'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Dumbbell className="w-3.5 h-3.5" />
                <span>Workout</span>
              </button>

              <button
                onClick={() => handleSelectPreset('clock')}
                className={`min-h-[36px] flex items-center gap-1 px-2.5 text-xs font-semibold rounded-xl transition-all whitespace-nowrap active:scale-95 cursor-pointer ${
                  activePreset === 'clock'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Schedule</span>
              </button>
            </div>

            {/* Interactive Scene Actions */}
            <div className="flex items-center gap-1.5 ml-auto">
              <button
                onClick={onToggleBagPack}
                className={`min-h-[36px] flex items-center gap-1 px-3 text-xs font-bold rounded-xl transition-all whitespace-nowrap active:scale-95 cursor-pointer ${
                  isBagPacked
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/30'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                <Backpack className="w-3.5 h-3.5" />
                <span>{isBagPacked ? 'Packed' : 'Pack'}</span>
              </button>

              <button
                onClick={handleTriggerWorkout}
                className="min-h-[36px] flex items-center gap-1 px-2.5 text-xs font-bold text-amber-300 bg-amber-500/15 border border-amber-500/30 rounded-xl active:scale-95 cursor-pointer"
                title="Lift Dumbbell"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Lift</span>
              </button>

              <button
                onClick={handleToggleLamp}
                className={`min-h-[36px] min-w-[36px] flex items-center justify-center rounded-xl border active:scale-95 transition-all cursor-pointer ${
                  isLampOn
                    ? 'bg-yellow-500/15 text-yellow-300 border-yellow-500/40'
                    : 'bg-slate-800 text-slate-500 border-slate-700'
                }`}
                title="Toggle Lamp Light"
              >
                <Lamp className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
