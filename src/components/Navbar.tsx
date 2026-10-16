import React, { useState } from 'react';
import { TabKey } from '../types';
import { ThemeSwitcher } from './ThemeSwitcher';
import { Menu, X, Layers, BookOpen, GraduationCap, Wrench, PlayCircle, Mail, Home, Bot } from 'lucide-react';

interface NavbarProps {
  activeTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, onSelectTab }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: { key: TabKey; label: string; icon: React.ReactNode }[] = [
    { key: 'home', label: 'Home', icon: <Home className="w-4 h-4" /> },
    { key: 'chat', label: 'AI Assistant', icon: <Bot className="w-4 h-4" /> },
    { key: 'research', label: 'Research Areas', icon: <Layers className="w-4 h-4" /> },
    { key: 'publications', label: 'Publications', icon: <BookOpen className="w-4 h-4" /> },
    { key: 'students', label: 'Thesis Registry', icon: <GraduationCap className="w-4 h-4" /> },
    { key: 'gear', label: 'Lab Gear', icon: <Wrench className="w-4 h-4" /> },
    { key: 'abaqus', label: 'Abaqus_Sims', icon: <PlayCircle className="w-4 h-4" /> },
    { key: 'contact', label: 'Connect', icon: <Mail className="w-4 h-4" /> },
  ];

  const handleNavClick = (key: TabKey) => {
    onSelectTab(key);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <nav className="sticky top-0 z-50 dark:bg-[#050505]/95 bg-white/95 backdrop-blur-md border-b dark:border-[#333333] border-slate-200 transition-colors duration-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between min-h-[58px] gap-2">
        {/* Brand / Logo */}
        <button
          onClick={() => handleNavClick('home')}
          className="flex items-center gap-2.5 text-left group cursor-pointer focus:outline-none flex-none"
        >
          <div className="w-8 h-8 rounded-full border dark:border-[#00b8ff]/80 border-sky-600/80 overflow-hidden dark:bg-black/60 bg-sky-50 flex items-center justify-center p-0.5 shadow-[0_0_10px_rgba(0,184,255,0.4)] group-hover:shadow-[0_0_15px_rgba(0,255,65,0.6)] transition-all flex-none">
            <img
              src="/logo.jpg"
              alt="SWID-SHRK Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-orbitron font-bold text-sm tracking-wider dark:text-white text-slate-900 dark:group-hover:text-[#00ff41] group-hover:text-sky-600 transition-colors">
              SWID-SHRK
            </span>
            <span className="text-[10px] dark:text-zinc-400 text-slate-500 font-mono tracking-widest uppercase">
              Aerospace &amp; Mechanics Lab
            </span>
          </div>
        </button>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => handleNavClick(item.key)}
                className={`relative px-2.5 py-1.5 text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'dark:text-[#00ff41] text-sky-700 dark:glow-green'
                    : 'dark:text-zinc-300 text-slate-600 hover:text-sky-600 dark:hover:text-[#00ff41]'
                }`}
              >
                <span>{item.label}</span>
                {isActive && (
                  <span className="absolute bottom-0 left-0 w-full h-[2px] dark:bg-[#00ff41] bg-sky-600 dark:shadow-[0_0_8px_#00ff41]" />
                )}
              </button>
            );
          })}
        </div>

        {/* Right Actions: Theme Switcher & Mobile Menu */}
        <div className="flex items-center gap-2">
          {/* Theme Switcher Toggle */}
          <ThemeSwitcher />

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 dark:text-zinc-300 text-slate-700 hover:text-sky-600 dark:hover:text-white border dark:border-[#333333] border-slate-300 rounded hover:border-sky-500 transition-colors"
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-sky-600 dark:text-[#00ff41]" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b dark:border-[#333333] border-slate-200 dark:bg-[#090d12] bg-white px-4 py-3 space-y-1 animate-fadeIn shadow-lg">
          {navItems.map((item) => {
            const isActive = activeTab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => handleNavClick(item.key)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-xs font-bold uppercase tracking-wider text-left transition-all ${
                  isActive
                    ? 'dark:bg-[#00ff41]/10 bg-sky-50 dark:text-[#00ff41] text-sky-700 border-l-2 dark:border-[#00ff41] border-sky-600 font-bold'
                    : 'dark:text-zinc-300 text-slate-600 hover:bg-slate-100 dark:hover:bg-zinc-800'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}

          <div className="pt-2 border-t dark:border-zinc-800 border-slate-200 flex items-center justify-between px-3 py-2">
            <span className="text-xs font-mono uppercase tracking-wider dark:text-zinc-400 text-slate-500 font-semibold">
              Theme Mode
            </span>
            <ThemeSwitcher />
          </div>
        </div>
      )}
    </nav>
  );
};
