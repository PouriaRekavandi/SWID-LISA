import React, { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import profilePhoto from '../assets/profile.png';
import profileFallback from '../assets/profile.jpg';

export const ProfileSection: React.FC = () => {
  const [imageLoaded, setImageLoaded] = useState(true);

  return (
    <section className="relative overflow-hidden dark:bg-[#141414]/70 bg-white border dark:border-[#333333] border-slate-200 dark:hover:border-[#00b8ff] hover:border-sky-500 rounded-2xl p-6 sm:p-8 md:p-10 dark:shadow-[0_10px_30px_rgba(0,0,0,0.55)] shadow-md transition-all duration-300 group">
      {/* Scanline subtle overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-20 dark:bg-[linear-gradient(to_bottom,transparent_calc(100%-14px),rgba(0,255,65,0.25)_calc(100%-3px),#00ff41_100%)] bg-[linear-gradient(to_bottom,transparent_calc(100%-14px),rgba(2,132,199,0.2)_calc(100%-3px),#0284c7_100%)] animate-[scanline_6s_infinite_linear]" />

      <div className="relative z-10 grid grid-cols-1 md:grid-cols-[auto_1fr] items-center gap-8">
        {/* Artistic Academic Avatar / Portrait */}
        <div className="flex flex-col items-center justify-center">
          <div className="relative group/avatar">
            {/* Artistic Cosmic Aura Halo */}
            <div className="absolute -inset-1.5 rounded-full bg-gradient-to-tr from-[#00ff41]/50 via-[#00b8ff]/60 to-purple-600/50 opacity-70 blur-sm group-hover/avatar:opacity-100 transition-opacity duration-500 animate-[spin_20s_linear_infinite]" />

            {/* Portrait Frame */}
            <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-full border-2 dark:border-[#00b8ff] border-sky-600 dark:shadow-[0_0_30px_rgba(0,184,255,0.45)] shadow-xl overflow-hidden dark:bg-black bg-slate-900 transition-transform duration-500 group-hover/avatar:scale-105">
              {imageLoaded ? (
                <img
                  src={profilePhoto}
                  alt="Pouria Hejazi Rekavandi"
                  loading="eager"
                  decoding="async"
                  className="w-full h-full object-cover object-top select-none transition-transform duration-700 group-hover/avatar:scale-110"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    if (target.src !== profileFallback) {
                      target.src = profileFallback;
                    } else {
                      setImageLoaded(false);
                    }
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center dark:bg-gradient-to-b dark:from-[#102538] dark:to-[#050b11] bg-gradient-to-b from-sky-50 to-slate-100">
                  <span className="font-orbitron font-bold text-3xl sm:text-4xl dark:text-[#00b8ff] text-sky-700 select-none">
                    PHR
                  </span>
                </div>
              )}
            </div>

            {/* PI / Lead Badge */}
            <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 px-3.5 py-0.5 rounded-full dark:bg-[#050505] bg-white border dark:border-[#00ff41] border-emerald-600 dark:text-[#00ff41] text-emerald-700 text-[10px] font-bold tracking-widest uppercase flex items-center gap-1.5 shadow-md whitespace-nowrap z-20">
              <ShieldCheck className="w-3.5 h-3.5" /> PI / Lead
            </div>
          </div>
        </div>

        {/* Bio Content */}
        <div className="space-y-4 text-left">
          {/* Tags */}
          <ul className="flex flex-wrap gap-2 list-none p-0 m-0">
            {['Fatigue & Fracture', 'Biomechanics', 'Metamaterials', 'Abaqus / FEA'].map((tag) => (
              <li
                key={tag}
                className="px-3 py-1 border dark:border-[#00b8ff]/40 border-sky-300 rounded-full dark:text-[#00b8ff] text-sky-800 text-xs font-mono uppercase tracking-wider dark:bg-[#00b8ff]/5 bg-sky-50"
              >
                {tag}
              </li>
            ))}
          </ul>

          <p className="dark:text-zinc-300 text-slate-700 text-sm sm:text-base leading-relaxed">
            I am an interdisciplinary engineering researcher specializing in{' '}
            <strong className="dark:text-[#00ff41] text-emerald-700 font-semibold">mechanical and aerospace engineering</strong>, embodying the continuous evolution of a childhood curiosity that has shaped my entire 40-year journey.
          </p>

          {/* Personal Verse */}
          <blockquote className="my-4 py-3.5 px-4 sm:px-6 dark:bg-[#00b8ff]/[0.04] bg-sky-50/80 border-l-3 dark:border-[#00b8ff] border-sky-600 rounded-r-lg">
            <p className="my-1 dark:text-[#d8f6ff] text-slate-800 text-sm sm:text-base italic leading-relaxed">
              Listen to the whispers of your dreaming soul,<br />
              Speak only truth to keep your spirit whole.<br />
              Fix your steady gaze upon a single star,<br />
              Work with burning fire to reach for what you are.<br />
              And let no passing shadow dim your inner light,<br />
              For nothing can eclipse a purpose shining bright.
            </p>
          </blockquote>

          {/* Signature */}
          <div className="pt-2 font-mono text-sm">
            <p className="mb-0.5 text-xs uppercase tracking-wider dark:text-zinc-500 text-slate-500">Principal Investigator</p>
            <p className="dark:text-zinc-200 text-slate-800">
              With sincere dedication<br />
              <strong className="text-base dark:text-white text-slate-900 font-semibold">Pouria 🌻</strong>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
