import React from 'react';
import { TabKey } from '../types';
import { Shield, ChevronUp } from 'lucide-react';

interface FooterProps {
  onSelectTab: (tab: TabKey) => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectTab }) => {
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="mt-20 border-t dark:border-[#222222] border-slate-200 dark:bg-[#000000] bg-slate-100 py-10 px-4 dark:text-zinc-400 text-slate-600 font-mono text-xs transition-colors duration-200">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col items-center md:items-start gap-1 text-center md:text-left">
          <div className="flex items-center gap-2 dark:text-white text-slate-900 font-orbitron font-bold text-sm tracking-wider">
            <span className="dark:text-[#00ff41] text-emerald-700">SWID-SHRK</span>
            <span className="dark:text-zinc-500 text-slate-400">/</span>
            <span>RKV MATERIALS</span>
          </div>
          <p className="dark:text-zinc-500 text-slate-500 text-[11px]">
            Mechanical &amp; Aerospace Research Laboratory · University of Maryland, Baltimore County
          </p>
          <div className="flex items-center gap-1.5 dark:text-[#00ff41] text-emerald-700 text-[11px] mt-1 font-semibold">
            <Shield className="w-3.5 h-3.5" />
            <span>System Secure. Encrypted HTTPS Transmission.</span>
          </div>
        </div>

        {/* Quick Links */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-bold uppercase tracking-wider dark:text-zinc-400 text-slate-600">
          <button
            onClick={() => onSelectTab('home')}
            className="hover:text-sky-700 dark:hover:text-[#00ff41] transition-colors cursor-pointer"
          >
            Home
          </button>
          <button
            onClick={() => onSelectTab('research')}
            className="hover:text-sky-700 dark:hover:text-[#00ff41] transition-colors cursor-pointer"
          >
            Research
          </button>
          <button
            onClick={() => onSelectTab('publications')}
            className="hover:text-sky-700 dark:hover:text-[#00ff41] transition-colors cursor-pointer"
          >
            Publications
          </button>
          <button
            onClick={() => onSelectTab('students')}
            className="hover:text-sky-700 dark:hover:text-[#00ff41] transition-colors cursor-pointer"
          >
            Thesis Registry
          </button>
          <button
            onClick={() => onSelectTab('gear')}
            className="hover:text-sky-700 dark:hover:text-[#00ff41] transition-colors cursor-pointer"
          >
            Lab Gear
          </button>
          <button
            onClick={() => onSelectTab('contact')}
            className="hover:text-sky-700 dark:hover:text-[#00ff41] transition-colors cursor-pointer"
          >
            Connect
          </button>
        </div>

        {/* Back to top */}
        <button
          onClick={scrollToTop}
          className="flex items-center gap-1 px-3 py-1.5 rounded dark:bg-zinc-900 bg-white border dark:border-zinc-700 border-slate-300 dark:hover:border-[#00ff41] hover:border-sky-600 dark:text-zinc-300 text-slate-700 dark:hover:text-[#00ff41] hover:text-sky-700 text-xs font-bold transition-all cursor-pointer shadow-xs"
          aria-label="Scroll to top of page"
        >
          <span>Top</span>
          <ChevronUp className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="max-w-6xl mx-auto mt-8 pt-6 border-t dark:border-zinc-900 border-slate-200 text-center text-[11px] dark:text-zinc-600 text-slate-500">
        © {currentYear} SWID-SHRK &mdash; Mechanical &amp; Aerospace Research Lab. All rights reserved.
      </div>
    </footer>
  );
};
