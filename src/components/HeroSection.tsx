import React from 'react';
import { TabKey } from '../types';
import { ThemeSwitcher } from './ThemeSwitcher';
import { ArrowRight, BookOpen, GraduationCap, PlayCircle } from 'lucide-react';
import logoTransparent from '../assets/logo_transparent.png';

interface HeroSectionProps {
  onSelectTab: (tab: TabKey) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onSelectTab }) => {
  return (
    <header className="relative isolate flex flex-col items-center justify-center min-h-[580px] sm:min-h-[660px] py-16 px-4 overflow-hidden dark:bg-black bg-gradient-to-b from-slate-100 via-white to-slate-100 dark:border-b-2 dark:border-[#00ff41] border-b-2 border-sky-600 transition-colors duration-200">
      {/* Persistent Theme Toggle in Header */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-30">
        <ThemeSwitcher variant="hero" />
      </div>

      {/* Background radial effects */}
      <div className="absolute inset-[-4%] -z-10 pointer-events-none opacity-60">
        <div className="absolute inset-0 dark:bg-[radial-gradient(circle_at_30%_25%,rgba(255,255,255,0.08),transparent_45%)] bg-[radial-gradient(circle_at_30%_25%,rgba(2,132,199,0.06),transparent_45%)]" />
        <div className="absolute inset-0 dark:bg-[radial-gradient(circle_at_72%_70%,rgba(0,184,255,0.12),transparent_50%)] bg-[radial-gradient(circle_at_72%_70%,rgba(16,185,129,0.05),transparent_50%)]" />
        <div className="absolute inset-0 dark:bg-[repeating-linear-gradient(to_bottom,rgba(255,255,255,0.02)_0_1px,transparent_1px_3px)] bg-[repeating-linear-gradient(to_bottom,rgba(0,0,0,0.015)_0_1px,transparent_1px_3px)]" />
      </div>

      {/* Animated Logo Stage with Transparent Crest Image */}
      <div className="relative z-10 flex items-center justify-center w-[270px] sm:w-[330px] md:w-[390px] aspect-square rounded-full border border-dashed dark:border-[#00b8ff]/50 border-sky-400/60 dark:bg-[radial-gradient(circle,rgba(0,184,255,0.22)_0%,rgba(0,184,255,0.06)_45%,transparent_75%)] bg-[radial-gradient(circle,rgba(2,132,199,0.14)_0%,rgba(2,132,199,0.03)_45%,transparent_75%)] p-2 sm:p-4 mb-8 dark:shadow-[0_0_50px_rgba(0,184,255,0.3)] shadow-[0_10px_35px_rgba(2,132,199,0.15)] group transition-all duration-300">
        <div className="relative w-full h-full flex items-center justify-center">
          <img
            src={logoTransparent}
            alt="SWID-SHRK Research Group Crest Logo"
            className="w-full h-full object-contain select-none animate-logo-fade-in transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/logo_transparent.png';
            }}
          />
        </div>

        {/* Twinkling Sparkles */}
        <span
          className="absolute w-[4px] h-[4px] bg-white rounded-full pointer-events-none z-20 shadow-[0_0_4px_2px_#fff,0_0_8px_3px_rgba(190,240,255,0.7),0_0_14px_5px_rgba(0,184,255,0.4)] animate-[twinkle_2s_infinite_ease-in-out_0.2s]"
          style={{ top: '16%', left: '49%' }}
        />
        <span
          className="absolute w-[4px] h-[4px] bg-white rounded-full pointer-events-none z-20 shadow-[0_0_4px_2px_#fff,0_0_8px_3px_rgba(190,240,255,0.7),0_0_14px_5px_rgba(0,184,255,0.4)] animate-[twinkle_3.5s_infinite_ease-in-out_0.5s]"
          style={{ top: '45%', left: '16%' }}
        />
        <span
          className="absolute w-[4px] h-[4px] bg-white rounded-full pointer-events-none z-20 shadow-[0_0_4px_2px_#fff,0_0_8px_3px_rgba(190,240,255,0.7),0_0_14px_5px_rgba(0,184,255,0.4)] animate-[twinkle_2.8s_infinite_ease-in-out_0.8s]"
          style={{ top: '38%', left: '83%' }}
        />
        <span
          className="absolute w-[4px] h-[4px] bg-white rounded-full pointer-events-none z-20 shadow-[0_0_4px_2px_#fff,0_0_8px_3px_rgba(190,240,255,0.7),0_0_14px_5px_rgba(0,184,255,0.4)] animate-[twinkle_4s_infinite_ease-in-out_1.1s]"
          style={{ top: '72%', left: '22%' }}
        />
        <span
          className="absolute w-[4px] h-[4px] bg-white rounded-full pointer-events-none z-20 shadow-[0_0_4px_2px_#fff,0_0_8px_3px_rgba(190,240,255,0.7),0_0_14px_5px_rgba(0,184,255,0.4)] animate-[twinkle_2.5s_infinite_ease-in-out_1.4s]"
          style={{ top: '82%', left: '52%' }}
        />
      </div>

      {/* Main Titles */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-4xl px-2">
        <h1 className="font-allura text-4xl sm:text-5xl md:text-7xl dark:text-white text-slate-900 font-normal leading-tight tracking-wide dark:drop-shadow-[0_0_3px_rgba(255,255,255,0.9)] drop-shadow-sm mb-3">
          Something Weird is Discovering…!
        </h1>
        <p className="dark:text-zinc-400 text-slate-600 font-mono text-xs sm:text-sm md:text-base tracking-[0.15em] uppercase mb-4">
          Mechanical &amp; aerospace engineering research
        </p>

        {/* MIGA Badge */}
        <div className="inline-flex items-baseline px-4 py-1 border dark:border-white/10 border-slate-300 rounded-full font-orbitron font-bold text-xs sm:text-sm tracking-[0.2em] uppercase mb-8 dark:bg-black/40 bg-white/90 shadow-sm">
          <span className="text-[#ff3131] dark:drop-shadow-[0_0_6px_rgba(255,49,49,0.7)]">M</span>
          <span className="dark:text-white text-slate-800 dark:drop-shadow-[0_0_5px_rgba(255,255,255,0.6)]">IG</span>
          <span className="dark:text-[#00e676] text-emerald-600 dark:drop-shadow-[0_0_6px_rgba(0,230,118,0.7)]">A</span>
        </div>

        {/* Interactive Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => onSelectTab('research')}
            className="flex items-center gap-2 px-5 py-2.5 rounded dark:bg-[#00ff41] dark:hover:bg-[#00ff41]/90 dark:text-[#050505] bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider transition-all duration-200 dark:hover:shadow-[0_0_18px_rgba(0,255,65,0.6)] hover:shadow-md cursor-pointer"
          >
            Research Modules
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => onSelectTab('students')}
            className="flex items-center gap-2 px-5 py-2.5 rounded border dark:border-[#00b8ff] dark:text-[#00b8ff] dark:hover:bg-[#00b8ff] dark:hover:text-[#050505] border-sky-600 text-sky-700 hover:bg-sky-600 hover:text-white font-bold text-xs uppercase tracking-wider transition-all duration-200 dark:hover:shadow-[0_0_16px_rgba(0,184,255,0.5)] hover:shadow-md cursor-pointer"
          >
            <GraduationCap className="w-4 h-4" />
            Thesis Registry
          </button>

          <button
            onClick={() => onSelectTab('abaqus')}
            className="flex items-center gap-2 px-5 py-2.5 rounded dark:bg-zinc-900 dark:border-zinc-700 dark:hover:border-[#00ff41] dark:text-zinc-200 dark:hover:text-[#00ff41] bg-white border-slate-300 hover:border-sky-600 text-slate-700 hover:text-sky-700 font-bold text-xs uppercase tracking-wider transition-all duration-200 shadow-sm cursor-pointer"
          >
            <PlayCircle className="w-4 h-4" />
            Abaqus Video Tutorials
          </button>
        </div>
      </div>
    </header>
  );
};
