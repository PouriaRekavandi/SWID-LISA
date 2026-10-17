import React, { useState, useEffect, useRef } from 'react';
import { BookOpen, DollarSign, Clock, Quote, Cpu, Users, Award, TrendingUp } from 'lucide-react';

interface MetricItem {
  id: string;
  label: string;
  target: number;
  prefix?: string;
  suffix?: string;
  displayDecimals?: number;
  icon: React.ReactNode;
  subtext: string;
  highlightTag: string;
  glowColor: string;
  borderColor: string;
}

const METRICS: MetricItem[] = [
  {
    id: 'papers',
    label: 'Papers Published',
    target: 38,
    suffix: '+',
    icon: <BookOpen className="w-5 h-5 text-emerald-500 dark:text-[#00ff41]" />,
    subtext: 'Q1/Q2 Peer-Reviewed Journals & Conferences',
    highlightTag: 'Peer-Reviewed',
    glowColor: 'rgba(0, 255, 65, 0.25)',
    borderColor: 'dark:border-[#00ff41]/40 border-emerald-500/40',
  },
  {
    id: 'grants',
    label: 'Active Grants & Funding',
    target: 1.8,
    prefix: '$',
    suffix: 'M+',
    displayDecimals: 1,
    icon: <DollarSign className="w-5 h-5 text-sky-500 dark:text-[#00b8ff]" />,
    subtext: 'NSF, DoD, State & Industrial Research Awards',
    highlightTag: 'Funded R&D',
    glowColor: 'rgba(0, 184, 255, 0.25)',
    borderColor: 'dark:border-[#00b8ff]/40 border-sky-500/40',
  },
  {
    id: 'years',
    label: 'Years Operational',
    target: 9,
    suffix: '+ Yrs',
    icon: <Clock className="w-5 h-5 text-cyan-400 dark:text-[#38bdf8]" />,
    subtext: 'Continuous Aerospace & Computational Mechanics',
    highlightTag: 'Est. 2017',
    glowColor: 'rgba(56, 189, 248, 0.25)',
    borderColor: 'dark:border-cyan-500/40 border-cyan-500/40',
  },
  {
    id: 'citations',
    label: 'Citations Indexed',
    target: 740,
    suffix: '+',
    icon: <Quote className="w-5 h-5 text-emerald-400 dark:text-emerald-300" />,
    subtext: 'High-Impact Scientific Citations (Google Scholar)',
    highlightTag: 'h-index 14',
    glowColor: 'rgba(16, 185, 129, 0.25)',
    borderColor: 'dark:border-emerald-500/40 border-emerald-500/40',
  },
  {
    id: 'simulations',
    label: 'FEA Simulations Run',
    target: 520,
    suffix: '+ Runs',
    icon: <Cpu className="w-5 h-5 text-sky-400 dark:text-[#00b8ff]" />,
    subtext: 'Nonlinear Abaqus & LS-DYNA High-Strain Models',
    highlightTag: 'HPC Clusters',
    glowColor: 'rgba(0, 184, 255, 0.25)',
    borderColor: 'dark:border-[#00b8ff]/40 border-sky-500/40',
  },
  {
    id: 'students',
    label: 'Scholars Supervised',
    target: 16,
    suffix: '+ Fellows',
    icon: <Users className="w-5 h-5 text-indigo-400 dark:text-purple-300" />,
    subtext: 'PhD Dissertations, Master Theses & Postdocs',
    highlightTag: '100% Defense Success',
    glowColor: 'rgba(168, 85, 247, 0.25)',
    borderColor: 'dark:border-purple-500/40 border-purple-500/40',
  },
];

interface AnimatedNumberProps {
  target: number;
  decimals?: number;
  isVisible: boolean;
}

const AnimatedNumber: React.FC<AnimatedNumberProps> = ({ target, decimals = 0, isVisible }) => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!isVisible) {
      setCurrent(0);
      return;
    }

    let start = 0;
    const duration = 1800; // 1.8 seconds
    const startTime = performance.now();

    const animate = (time: number) => {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic formula
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const val = easeOut * target;
      setCurrent(val);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCurrent(target);
      }
    };

    const handle = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(handle);
  }, [isVisible, target]);

  return <span>{decimals > 0 ? current.toFixed(decimals) : Math.round(current)}</span>;
};

export const ResearchMetrics: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.15 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={sectionRef} className="space-y-6 pt-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b-2 dark:border-[#00ff41] border-sky-600 pb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Award className="w-5 h-5 dark:text-[#00ff41] text-sky-700" />
            <span className="font-mono text-xs uppercase tracking-widest dark:text-[#00b8ff] text-sky-800 font-bold">
              // Performance Analytics
            </span>
          </div>
          <h3 className="font-orbitron text-xl sm:text-2xl font-bold dark:text-white text-slate-900 tracking-wider">
            RESEARCH METRICS &amp; IMPACT
          </h3>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono dark:text-zinc-400 text-slate-600 bg-slate-100 dark:bg-black/40 px-3 py-1.5 rounded-full border dark:border-zinc-800 border-slate-300">
          <TrendingUp className="w-3.5 h-3.5 dark:text-[#00ff41] text-emerald-600" />
          <span>Real-time Laboratory Tracking</span>
        </div>
      </div>

      {/* Grid of Key Performance Data Cards with Animated Counting Numbers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {METRICS.map((metric) => (
          <div
            key={metric.id}
            className={`group relative overflow-hidden rounded-xl p-5 border transition-all duration-300 dark:bg-[#0c1015]/90 bg-white shadow-sm hover:shadow-md dark:hover:shadow-[0_0_25px_rgba(0,184,255,0.2)] hover:-translate-y-1 ${metric.borderColor}`}
          >
            {/* Ambient Background Gradient Accent */}
            <div
              className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full pointer-events-none opacity-20 blur-2xl transition-opacity group-hover:opacity-40"
              style={{ backgroundColor: metric.glowColor }}
            />

            {/* Top row: Icon + Highlight Badge */}
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="p-2.5 rounded-lg dark:bg-black/60 bg-slate-100 border dark:border-zinc-800 border-slate-200 group-hover:border-sky-500 transition-colors">
                {metric.icon}
              </div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full dark:bg-zinc-900 bg-slate-100 dark:text-zinc-300 text-slate-700 border dark:border-zinc-800 border-slate-200">
                {metric.highlightTag}
              </span>
            </div>

            {/* Animated Counting Value */}
            <div className="font-orbitron text-3xl sm:text-4xl font-extrabold tracking-tight dark:text-white text-slate-900 mb-1 flex items-baseline gap-1">
              {metric.prefix && (
                <span className="text-xl sm:text-2xl font-bold dark:text-[#00b8ff] text-sky-700">
                  {metric.prefix}
                </span>
              )}
              <span className="dark:text-[#00ff41] text-emerald-700 group-hover:dark:text-[#00b8ff] group-hover:text-sky-700 transition-colors">
                <AnimatedNumber
                  target={metric.target}
                  decimals={metric.displayDecimals}
                  isVisible={isVisible}
                />
              </span>
              {metric.suffix && (
                <span className="text-base sm:text-lg font-bold dark:text-zinc-300 text-slate-600">
                  {metric.suffix}
                </span>
              )}
            </div>

            {/* Label */}
            <h4 className="font-orbitron text-xs sm:text-sm font-bold dark:text-zinc-200 text-slate-800 uppercase tracking-wider mb-1.5">
              {metric.label}
            </h4>

            {/* Subtext description */}
            <p className="font-mono text-xs dark:text-zinc-400 text-slate-500 leading-relaxed">
              {metric.subtext}
            </p>

            {/* Bottom Progress Accent Line */}
            <div className="mt-4 pt-3 border-t dark:border-zinc-800/80 border-slate-100 flex items-center justify-between text-[11px] font-mono dark:text-zinc-400 text-slate-500">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full dark:bg-[#00ff41] bg-emerald-600 animate-pulse" />
                Verified Laboratory KPI
              </span>
              <span className="dark:text-zinc-300 text-slate-600 font-bold">2026 Active</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
