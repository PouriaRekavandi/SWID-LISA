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
          <a
            href="https://github.com/PouriaRekavandi/SWID-SHRK"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-sky-700 dark:hover:text-[#00ff41] transition-colors cursor-pointer flex items-center gap-1"
          >
            GitHub
          </a>
        </div>

        {/* Social Media Channels Component */}
        <div className="flex flex-col items-center sm:items-end gap-2">
          <span className="text-[10px] uppercase tracking-widest font-mono text-zinc-500 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00ff41] animate-pulse" />
            // Research Channels
          </span>
          <div className="flex items-center gap-2.5">
            {/* GitHub */}
            <a
              href="https://github.com/PouriaRekavandi"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub Profile (@PouriaRekavandi)"
              title="GitHub — Pouria Rekavandi"
              className="group relative flex items-center justify-center w-9 h-9 rounded-lg border dark:border-zinc-800 border-slate-300 dark:bg-zinc-950/80 bg-white dark:text-zinc-300 text-slate-700 dark:hover:border-[#00ff41] hover:border-emerald-500 dark:hover:text-[#00ff41] hover:text-emerald-600 transition-all duration-300 dark:hover:shadow-[0_0_16px_rgba(0,255,65,0.45)] hover:shadow-md hover:-translate-y-0.5"
            >
              <svg className="w-4 h-4 fill-current transition-transform duration-300 group-hover:scale-110" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
            </a>

            {/* Google Scholar */}
            <a
              href="https://scholar.google.com/citations?view_op=search_authors&mauthors=Pouria+Hejazi+Rekavandi"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Google Scholar (Pouria Hejazi Rekavandi)"
              title="Google Scholar — Pouria Hejazi Rekavandi"
              className="group relative flex items-center justify-center w-9 h-9 rounded-lg border dark:border-zinc-800 border-slate-300 dark:bg-zinc-950/80 bg-white dark:text-zinc-300 text-slate-700 dark:hover:border-[#00b8ff] hover:border-sky-500 dark:hover:text-[#00b8ff] hover:text-sky-600 transition-all duration-300 dark:hover:shadow-[0_0_16px_rgba(0,184,255,0.45)] hover:shadow-md hover:-translate-y-0.5"
            >
              <svg className="w-4 h-4 fill-current transition-transform duration-300 group-hover:scale-110" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M5.242 13.769L0 9.5 12 0l12 9.5-5.242 4.269C17.548 11.249 14.978 9.5 12 9.5c-2.977 0-5.548 1.748-6.758 4.269zM12 10a7 7 0 1 0 0 14 7 7 0 0 0 0-14z"/>
              </svg>
            </a>

            {/* LinkedIn */}
            <a
              href="https://www.linkedin.com/in/pouria-hejazi-rekavandi"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn Profile (Pouria Hejazi Rekavandi)"
              title="LinkedIn — Pouria Hejazi Rekavandi"
              className="group relative flex items-center justify-center w-9 h-9 rounded-lg border dark:border-zinc-800 border-slate-300 dark:bg-zinc-950/80 bg-white dark:text-zinc-300 text-slate-700 dark:hover:border-[#00b8ff] hover:border-sky-500 dark:hover:text-[#00b8ff] hover:text-sky-600 transition-all duration-300 dark:hover:shadow-[0_0_16px_rgba(0,184,255,0.45)] hover:shadow-md hover:-translate-y-0.5"
            >
              <svg className="w-4 h-4 fill-current transition-transform duration-300 group-hover:scale-110" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9h2.77v8.37H6.46v-8.37M7.85 6.28a1.62 1.62 0 1 0 0 3.24 1.62 1.62 0 0 0 0-3.24z" />
              </svg>
            </a>
          </div>
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
