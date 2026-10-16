import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export interface ThemeSwitcherProps {
  compact?: boolean;
  variant?: 'navbar' | 'hero' | 'compact';
  className?: string;
}

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({
  compact = false,
  variant = 'navbar',
  className = '',
}) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const isHero = variant === 'hero';
  const isCompactOnly = compact || variant === 'compact';

  return (
    <button
      onClick={toggleTheme}
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={`Toggle theme: currently ${isDark ? 'Cyber Dark' : 'Light Mode'}. Click to switch to ${isDark ? 'Light' : 'Cyber Dark'} mode.`}
      title={`Switch to ${isDark ? 'Light' : 'Cyber Dark'} Mode`}
      className={`group relative flex items-center cursor-pointer select-none rounded-full border transition-all duration-500 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 ${
        isDark
          ? 'bg-[#090d12]/90 border-[#333333] hover:border-[#00ff41] text-zinc-200 hover:text-white shadow-[0_0_12px_rgba(0,0,0,0.6)] hover:shadow-[0_0_18px_rgba(0,255,65,0.3)] focus:ring-[#00ff41]/50 focus:ring-offset-black'
          : 'bg-white/95 border-slate-300 hover:border-amber-500 text-slate-800 hover:text-slate-900 shadow-sm hover:shadow-md focus:ring-amber-500/50 focus:ring-offset-white'
      } ${
        isHero
          ? 'px-3.5 py-2 gap-3 backdrop-blur-md'
          : isCompactOnly
          ? 'p-1.5'
          : 'px-3 py-1.5 gap-2.5'
      } ${className}`}
    >
      {/* Visual Indicator with Sun/Moon Icon & Smooth Color Transition */}
      <div
        className={`relative rounded-full flex items-center justify-center border transition-all duration-500 ease-out overflow-hidden flex-none ${
          isHero ? 'w-7 h-7' : 'w-6 h-6'
        } ${
          isDark
            ? 'bg-black/80 border-[#00ff41]/50 text-[#00ff41] shadow-[0_0_12px_rgba(0,255,65,0.4)]'
            : 'bg-amber-100/90 border-amber-300 text-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.35)]'
        }`}
      >
        {/* Moon Icon (Cyber Dark) */}
        <Moon
          className={`transition-all duration-500 ease-out transform ${
            isHero ? 'w-4 h-4' : 'w-3.5 h-3.5'
          } ${
            isDark
              ? 'opacity-100 rotate-0 scale-100 text-[#00ff41]'
              : 'opacity-0 -rotate-90 scale-50 pointer-events-none absolute text-[#00ff41]'
          }`}
        />

        {/* Sun Icon (Light Mode) */}
        <Sun
          className={`transition-all duration-500 ease-out transform ${
            isHero ? 'w-4 h-4' : 'w-3.5 h-3.5'
          } ${
            !isDark
              ? 'opacity-100 rotate-0 scale-100 text-amber-500'
              : 'opacity-0 rotate-90 scale-50 pointer-events-none absolute text-amber-500'
          }`}
        />
      </div>

      {/* Visual Mode Label & Status LED Indicator */}
      {!isCompactOnly && (
        <div className="flex flex-col text-left transition-colors duration-500 ease-in-out">
          {isHero ? (
            <>
              <div className="flex items-center gap-1.5">
                {/* Active Mode LED indicator dot */}
                <span
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ease-in-out ${
                    isDark
                      ? 'bg-[#00ff41] shadow-[0_0_6px_#00ff41]'
                      : 'bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.8)]'
                  }`}
                />
                <span className="text-[10px] font-mono uppercase tracking-wider dark:text-zinc-400 text-slate-500 leading-none transition-colors duration-500">
                  Theme
                </span>
              </div>
              <span className="font-orbitron font-bold text-xs tracking-wider transition-colors duration-500 leading-tight">
                {isDark ? (
                  <span className="text-[#00ff41] group-hover:text-emerald-300">
                    Cyber Dark
                  </span>
                ) : (
                  <span className="text-amber-600 group-hover:text-amber-700">
                    Light Mode
                  </span>
                )}
              </span>
            </>
          ) : (
            <div className="flex items-center gap-2">
              {/* Active Mode LED indicator dot */}
              <span
                className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ease-in-out ${
                  isDark
                    ? 'bg-[#00ff41] shadow-[0_0_6px_#00ff41]'
                    : 'bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.8)]'
                }`}
              />
              <span className="font-mono text-[11px] font-bold uppercase tracking-wider select-none hidden sm:inline-block transition-colors duration-500">
                {isDark ? (
                  <span className="text-[#00ff41] group-hover:text-emerald-300">
                    Cyber Dark
                  </span>
                ) : (
                  <span className="text-amber-600 group-hover:text-amber-700">
                    Light Mode
                  </span>
                )}
              </span>
            </div>
          )}
        </div>
      )}
    </button>
  );
};
