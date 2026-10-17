import React, { useState, useEffect, useRef } from 'react';
import { TabKey } from '../types';
import { ThemeSwitcher } from './ThemeSwitcher';
import { DarkMatterSimulation } from './DarkMatterSimulation';
import { ArrowRight, GraduationCap, PlayCircle, Bot, Sparkles } from 'lucide-react';
import logoTransparent from '../assets/logo_transparent.png';
import logoFallback from '../assets/logo.jpg';

interface HeroSectionProps {
  onSelectTab: (tab: TabKey) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onSelectTab }) => {
  return (
    <header className="relative isolate flex flex-col items-center justify-center min-h-[500px] sm:min-h-[640px] py-12 sm:py-16 px-4 overflow-hidden dark:bg-[#030712]/75 bg-gradient-to-b from-slate-100/80 via-white/70 to-slate-100/80 backdrop-blur-[1px] dark:border-b-2 dark:border-[#00ff41] border-b-2 border-sky-600 transition-colors duration-200">
      {/* Interactive Universe Dark Matter Gravitational Cosmic Web Simulation (desktop overlay, mobile uses unified global CosmicBackground) */}
      <div className="hidden sm:block absolute inset-0 pointer-events-none">
        <DarkMatterSimulation className="opacity-95" />
      </div>

      {/* Persistent Theme Toggle in Header */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-30">
        <ThemeSwitcher variant="hero" />
      </div>

      {/* Pure Transparent Logo Crest Reverified from Uploaded Master Asset */}
      <div className="relative z-10 flex flex-col items-center mb-4 sm:mb-6 pointer-events-none">
        <div className="relative flex items-center justify-center w-[190px] xs:w-[230px] sm:w-[300px] md:w-[360px] max-w-[82vw] aspect-square group transition-all duration-300 pointer-events-auto">
          <img
            src={logoTransparent}
            alt="SWID-SHRK Research Group Crest Logo"
            loading="eager"
            decoding="async"
            onError={(e) => {
              (e.target as HTMLImageElement).src = logoFallback;
            }}
            className="w-full h-full object-contain select-none animate-logo-fade-in filter drop-shadow-[0_4px_24px_rgba(0,184,255,0.4)] dark:drop-shadow-[0_0_32px_rgba(0,184,255,0.75)] group-hover:scale-105 transition-transform duration-300"
          />

          {/* Twinkling Sparkles on Crest */}
          <span
            className="absolute w-[4px] h-[4px] bg-white rounded-full pointer-events-none z-20 shadow-[0_0_5px_2px_#fff,0_0_9px_3px_rgba(190,240,255,0.8),0_0_15px_5px_rgba(0,184,255,0.5)] animate-[twinkle_2s_infinite_ease-in-out_0.2s]"
            style={{ top: '16%', left: '49%' }}
          />
          <span
            className="absolute w-[4px] h-[4px] bg-white rounded-full pointer-events-none z-20 shadow-[0_0_5px_2px_#fff,0_0_9px_3px_rgba(190,240,255,0.8),0_0_15px_5px_rgba(0,184,255,0.5)] animate-[twinkle_3.5s_infinite_ease-in-out_0.5s]"
            style={{ top: '45%', left: '16%' }}
          />
          <span
            className="absolute w-[4px] h-[4px] bg-white rounded-full pointer-events-none z-20 shadow-[0_0_5px_2px_#fff,0_0_9px_3px_rgba(190,240,255,0.8),0_0_15px_5px_rgba(0,184,255,0.5)] animate-[twinkle_2.8s_infinite_ease-in-out_0.8s]"
            style={{ top: '38%', left: '83%' }}
          />
          <span
            className="absolute w-[4px] h-[4px] bg-white rounded-full pointer-events-none z-20 shadow-[0_0_5px_2px_#fff,0_0_9px_3px_rgba(190,240,255,0.8),0_0_15px_5px_rgba(0,184,255,0.5)] animate-[twinkle_4s_infinite_ease-in-out_1.1s]"
            style={{ top: '72%', left: '22%' }}
          />
          <span
            className="absolute w-[4px] h-[4px] bg-white rounded-full pointer-events-none z-20 shadow-[0_0_5px_2px_#fff,0_0_9px_3px_rgba(190,240,255,0.8),0_0_15px_5px_rgba(0,184,255,0.5)] animate-[twinkle_2.5s_infinite_ease-in-out_1.4s]"
            style={{ top: '82%', left: '52%' }}
          />
        </div>
      </div>

      {/* Main Titles */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-4xl px-2 w-full">
        <h1 className="font-allura hero-title-cursive text-black dark:text-white text-2xl xs:text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold leading-tight tracking-wide mb-3 select-none break-words px-2 max-w-full">
          Something Weird is Discovering…!
        </h1>
        <p className="dark:text-zinc-400 text-slate-600 font-mono text-xs sm:text-sm md:text-base tracking-[0.15em] uppercase mb-4 px-2">
          Mechanical &amp; aerospace engineering research
        </p>

        {/* MIGA Badge */}
        <div className="inline-flex items-baseline px-4 py-1 border dark:border-white/10 border-slate-300 rounded-full font-orbitron font-bold text-xs sm:text-sm tracking-[0.2em] uppercase mb-6 sm:mb-8 dark:bg-black/40 bg-white/90 shadow-sm">
          <span className="text-[#ff3131] dark:drop-shadow-[0_0_6px_rgba(255,49,49,0.7)]">M</span>
          <span className="dark:text-white text-slate-800 dark:drop-shadow-[0_0_5px_rgba(255,255,255,0.6)]">IG</span>
          <span className="dark:text-[#00e676] text-emerald-600 dark:drop-shadow-[0_0_6px_rgba(0,230,118,0.7)]">A</span>
        </div>

        {/* Interactive Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 w-full max-w-xl">
          <button
            onClick={() => onSelectTab('chat')}
            className="flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded dark:bg-gradient-to-r dark:from-[#00ff41] dark:to-[#00b8ff] dark:hover:from-[#00ff41]/90 dark:hover:to-[#00b8ff]/90 dark:text-black bg-gradient-to-r from-emerald-600 to-sky-600 hover:from-emerald-700 hover:to-sky-700 text-white font-bold text-[11px] sm:text-xs uppercase tracking-wider transition-all duration-200 shadow-md dark:shadow-[0_0_20px_rgba(0,184,255,0.4)] cursor-pointer"
          >
            <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            AI Lab Assistant
            <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          </button>

          <button
            onClick={() => onSelectTab('research')}
            className="flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded dark:bg-zinc-900 dark:border-zinc-700 dark:hover:border-[#00ff41] dark:text-zinc-200 dark:hover:text-[#00ff41] bg-white border-slate-300 hover:border-sky-600 text-slate-700 hover:text-sky-700 font-bold text-[11px] sm:text-xs uppercase tracking-wider transition-all duration-200 shadow-sm cursor-pointer"
          >
            Research Modules
            <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          <button
            onClick={() => onSelectTab('students')}
            className="flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded border dark:border-[#00b8ff] dark:text-[#00b8ff] dark:hover:bg-[#00b8ff] dark:hover:text-[#050505] border-sky-600 text-sky-700 hover:bg-sky-600 hover:text-white font-bold text-[11px] sm:text-xs uppercase tracking-wider transition-all duration-200 dark:hover:shadow-[0_0_16px_rgba(0,184,255,0.5)] hover:shadow-md cursor-pointer"
          >
            <GraduationCap className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Thesis Registry
          </button>

          <button
            onClick={() => onSelectTab('abaqus')}
            className="flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded dark:bg-zinc-900 dark:border-zinc-700 dark:hover:border-[#00ff41] dark:text-zinc-200 dark:hover:text-[#00ff41] bg-white border-slate-300 hover:border-sky-600 text-slate-700 hover:text-sky-700 font-bold text-[11px] sm:text-xs uppercase tracking-wider transition-all duration-200 shadow-sm cursor-pointer"
          >
            <PlayCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Abaqus Sims
          </button>
        </div>
      </div>
    </header>
  );
};
