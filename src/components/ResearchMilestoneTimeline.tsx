import React, { useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Layers,
  Activity,
  Cpu,
  BookmarkCheck,
  Flame,
  Milestone
} from 'lucide-react';

export interface MilestoneItem {
  id: string;
  year: string;
  title: string;
  project: string;
  category: 'Metamaterials' | 'Biomechanics' | 'Fracture Mechanics' | 'Composites' | 'AI & FEA';
  status: 'Pioneered' | 'Validated' | 'Benchmark Model' | 'Active Deployment' | 'Forward Horizon';
  phase: string;
  description: string;
  breakthrough: string;
  deliverables: string[];
  keyReference?: {
    label: string;
    doi?: string;
  };
}

const MILESTONES: MilestoneItem[] = [
  {
    id: 'ms-1',
    year: '2018 – 2019',
    title: 'Multiaxial Fatigue & Non-Proportional Crack Growth',
    project: 'Fatigue & Life Prediction',
    category: 'Fracture Mechanics',
    status: 'Pioneered',
    phase: 'Phase I · Analytical & Numerical',
    description:
      'Formulation of multiaxial life estimation algorithms and critical-plane shear strain criteria (Findley & Brown-Miller) to evaluate subcritical crack initiation in complex aerospace alloys.',
    breakthrough:
      'Formulated unified Paris law subcritical propagation routines accounting for out-of-phase loading paths.',
    deliverables: [
      'Findley plane optimization routines',
      'Crack opening displacement (COD) numerical solvers',
      'Fatigue life prediction benchmark suite',
    ],
    keyReference: {
      label: 'International Journal of Fatigue (2022)',
      doi: '10.1016/j.ijfatigue.2022.107055',
    },
  },
  {
    id: 'ms-2',
    year: '2020 – 2021',
    title: 'Viscoelastic Neural Parenchyma under Traumatic Blast',
    project: 'Neural Biomechanics & TBI',
    category: 'Biomechanics',
    status: 'Validated',
    phase: 'Phase II · Bio-Mechanics & Constitutive Law',
    description:
      'Development of high-strain-rate hyper-viscoelastic constitutive models (Ogden & Mooney-Rivlin formulations) capturing micro-mechanical axonal strain and cavitation thresholds under explosive blast waves.',
    breakthrough:
      'Quantified cellular strain distribution and mapped critical shear injury thresholds across heterogenous white/gray matter interfaces.',
    deliverables: [
      'Viscoelastic Fortran UMAT/VUMAT for high-rate brain tissue',
      'Blast overpressure wave simulation benchmarks',
      'Cavitation risk assessment protocol',
    ],
    keyReference: {
      label: 'J. Mechanical Behavior of Biomedical Materials (2024)',
      doi: '10.1016/j.jmbbm.2024.106421',
    },
  },
  {
    id: 'ms-3',
    year: '2022 – 2023',
    title: '3D AntiPrism Metamaterial Architectures for Kinetic Dissipation',
    project: 'Energy Absorption Metamaterials',
    category: 'Metamaterials',
    status: 'Benchmark Model',
    phase: 'Phase III · Structural Metamaterials',
    description:
      'Synthesis and crashworthiness optimization of non-conventional AntiPrism origami unit cells capable of extreme energy dissipation, plateau stress enhancement, and specific energy absorption (SEA) gains.',
    breakthrough:
      'Demonstrated 48% higher specific energy absorption compared to standard hexagonal honeycombs under high-velocity dynamic compression.',
    deliverables: [
      'Parametric Python CAE script for AntiPrism unit cells',
      'Open-source interactive video tutorial suite (Parts 1 & 2)',
      'High-speed drop-weight calibration data',
    ],
    keyReference: {
      label: 'Materials & Design / Computational Mechanics (2023)',
      doi: '10.1016/j.matdes.2023.111890',
    },
  },
  {
    id: 'ms-4',
    year: '2023 – 2024',
    title: 'Bio-Inspired Helicoidal Bouligand Architectures',
    project: 'Bio-Inspired Composites',
    category: 'Composites',
    status: 'Active Deployment',
    phase: 'Phase IV · Biomimetic Armor',
    description:
      'Engineered helicoidal pitch angles based on the stomatopod dactyl club to trigger continuous crack-twisting, fiber bridging, and delamination suppression under intense out-of-plane ballistic impacts.',
    breakthrough:
      'Eliminated catastrophic through-thickness shear punch failure via progressive helicoidal crack redirection.',
    deliverables: [
      'Helicoidal ply stacking optimization algorithm',
      'Low-velocity impact damage resistance maps',
      'High-toughness 3D printed photopolymer test specimens',
    ],
    keyReference: {
      label: 'Advanced Composite Structures & Impact Dynamics (2024)',
    },
  },
  {
    id: 'ms-5',
    year: '2024 – 2025',
    title: 'Digital Image Correlation & Quasi-Brittle Cementitious Fracture',
    project: 'Quasi-Brittle Interfaces',
    category: 'Fracture Mechanics',
    status: 'Active Deployment',
    phase: 'Phase V · Experimental & DIC Full-Field',
    description:
      'Coupling 2D/3D full-field Digital Image Correlation (DIC) with cohesive zone modeling (CZM) to inspect microstructural crack trajectories in fiber-reinforced cementitious and geopolymer matrixes.',
    breakthrough:
      'Captured precise traction-separation softening curves across heterogeneous fiber debonding zones under mixed-mode loading.',
    deliverables: [
      'High-speed optical DIC synchronization workflow',
      'Bilinear softening traction-separation subroutine',
      'Quasi-brittle crack tortuosity index calculator',
    ],
    keyReference: {
      label: 'Theoretical & Applied Fracture Mechanics (2023)',
      doi: '10.1016/j.tafmec.2023.103980',
    },
  },
  {
    id: 'ms-6',
    year: '2025 – 2026+',
    title: 'Physics-Informed Neural FEA & Real-Time Digital Twins',
    project: 'Next-Gen Structural AI',
    category: 'AI & FEA',
    status: 'Forward Horizon',
    phase: 'Phase VI · Smart Materials & Future Frontier',
    description:
      'Constructing physics-informed neural operators (PINNs) and surrogate models trained on high-fidelity Abaqus/Explicit runs to predict structural impact damage and crack propagation in sub-millisecond response times.',
    breakthrough:
      'Achieving 1000x acceleration over traditional explicit FEA solves while retaining 96%+ strain tensor fidelity.',
    deliverables: [
      'PINN surrogate model training pipeline',
      'Real-time structural health monitoring telemetry connector',
      'Generative metamaterial topology inverse designer',
    ],
    keyReference: {
      label: 'SWID-SHRK Future Roadmap Research Initiative',
    },
  },
];

export const ResearchMilestoneTimeline: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [expandedId, setExpandedId] = useState<string | null>('ms-3');

  const categories = ['All', 'Metamaterials', 'Biomechanics', 'Fracture Mechanics', 'Composites', 'AI & FEA'];

  const filteredMilestones = selectedCategory === 'All'
    ? MILESTONES
    : MILESTONES.filter((m) => m.category === selectedCategory);

  const getStatusBadge = (status: MilestoneItem['status']) => {
    switch (status) {
      case 'Pioneered':
        return 'dark:bg-zinc-800 dark:text-zinc-300 bg-slate-200 text-slate-700 border-slate-300 dark:border-zinc-700';
      case 'Validated':
        return 'dark:bg-[#00b8ff]/20 dark:text-[#00b8ff] bg-sky-100 text-sky-800 border-sky-300 dark:border-[#00b8ff]/40';
      case 'Benchmark Model':
        return 'dark:bg-[#00ff41]/20 dark:text-[#00ff41] bg-emerald-100 text-emerald-800 border-emerald-400 dark:border-[#00ff41]/40 font-bold';
      case 'Active Deployment':
        return 'dark:bg-emerald-500/20 dark:text-emerald-400 bg-emerald-100 text-emerald-900 border-emerald-400 dark:border-emerald-500/40';
      case 'Forward Horizon':
        return 'dark:bg-purple-500/20 dark:text-purple-300 bg-purple-100 text-purple-900 border-purple-300 dark:border-purple-500/40 font-bold';
      default:
        return 'dark:bg-zinc-800 dark:text-zinc-300 bg-slate-200 text-slate-700';
    }
  };

  const getCategoryIcon = (category: MilestoneItem['category']) => {
    switch (category) {
      case 'Metamaterials':
        return <Layers className="w-4 h-4 text-emerald-500 dark:text-[#00ff41]" />;
      case 'Biomechanics':
        return <Activity className="w-4 h-4 text-sky-500 dark:text-[#00b8ff]" />;
      case 'Fracture Mechanics':
        return <Flame className="w-4 h-4 text-amber-500 dark:text-amber-400" />;
      case 'Composites':
        return <BookmarkCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-300" />;
      case 'AI & FEA':
        return <Cpu className="w-4 h-4 text-purple-500 dark:text-purple-300" />;
      default:
        return <Milestone className="w-4 h-4 text-sky-500" />;
    }
  };

  return (
    <div className="space-y-6 pt-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b-2 dark:border-[#00b8ff] border-sky-600 pb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Milestone className="w-5 h-5 dark:text-[#00b8ff] text-sky-700" />
            <span className="font-mono text-xs uppercase tracking-widest dark:text-[#00ff41] text-emerald-800 font-bold">
              // Evolution Roadmap
            </span>
          </div>
          <h3 className="font-orbitron text-xl sm:text-2xl font-bold dark:text-white text-slate-900 tracking-wider">
            RESEARCH PROJECT MILESTONE TIMELINE
          </h3>
        </div>
        <p className="font-mono text-xs dark:text-zinc-400 text-slate-600 max-w-sm sm:text-right">
          Interactive development chronology of major theoretical, computational, and experimental breakthroughs.
        </p>
      </div>

      {/* Filter Category Tabs */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-xs font-mono font-bold dark:text-zinc-400 text-slate-600 mr-1 flex items-center gap-1">
          Stream:
        </span>
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-mono font-bold transition-all duration-200 cursor-pointer ${
                isSelected
                  ? 'dark:bg-[#00b8ff] dark:text-black bg-sky-600 text-white shadow-xs dark:shadow-[0_0_12px_rgba(0,184,255,0.5)]'
                  : 'dark:bg-[#12161f] bg-slate-100 dark:text-zinc-300 text-slate-700 hover:bg-slate-200 dark:hover:bg-zinc-800 border dark:border-zinc-800 border-slate-300'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Visual Timeline Stream */}
      <div className="relative pl-6 sm:pl-8 border-l-2 dark:border-[#00b8ff]/40 border-sky-300 space-y-8 my-4">
        {filteredMilestones.map((ms) => {
          const isExpanded = expandedId === ms.id;
          return (
            <div key={ms.id} className="relative group">
              {/* Timeline Node Marker */}
              <div
                className={`absolute -left-[31px] sm:-left-[39px] top-1.5 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                  isExpanded
                    ? 'dark:border-[#00ff41] border-emerald-600 dark:bg-black bg-white dark:shadow-[0_0_15px_#00ff41] shadow-md scale-110'
                    : 'dark:border-[#00b8ff] border-sky-600 dark:bg-[#080d14] bg-white group-hover:scale-110'
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full transition-colors ${
                    isExpanded ? 'dark:bg-[#00ff41] bg-emerald-600' : 'dark:bg-[#00b8ff] bg-sky-600'
                  }`}
                />
              </div>

              {/* Milestone Card */}
              <div
                className={`rounded-xl border transition-all duration-300 overflow-hidden dark:bg-[#0d121a]/90 bg-white shadow-sm hover:shadow-md ${
                  isExpanded
                    ? 'dark:border-[#00b8ff] border-sky-600 dark:shadow-[0_0_25px_rgba(0,184,255,0.15)] shadow-md'
                    : 'dark:border-zinc-800 border-slate-200 hover:border-sky-400 dark:hover:border-zinc-700'
                }`}
              >
                {/* Header (Clickable to Toggle Details) */}
                <button
                  type="button"
                  onClick={() => setExpandedId(isExpanded ? null : ms.id)}
                  className="w-full p-4 sm:p-5 text-left flex flex-col md:flex-row md:items-center justify-between gap-3 cursor-pointer focus:outline-none"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Year Badge */}
                      <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-full dark:bg-[#00b8ff]/20 dark:text-[#00b8ff] bg-sky-100 text-sky-800 border dark:border-[#00b8ff]/30 border-sky-300 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {ms.year}
                      </span>

                      {/* Phase Tag */}
                      <span className="font-mono text-[11px] dark:text-zinc-400 text-slate-500 font-medium">
                        {ms.phase}
                      </span>

                      {/* Status Badge */}
                      <span
                        className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded border ${getStatusBadge(
                          ms.status
                        )}`}
                      >
                        {ms.status}
                      </span>
                    </div>

                    <h4 className="font-orbitron font-bold text-base sm:text-lg dark:text-white text-slate-900 group-hover:dark:text-[#00b8ff] group-hover:text-sky-700 transition-colors">
                      {ms.title}
                    </h4>

                    <div className="flex items-center gap-2 text-xs font-mono dark:text-zinc-400 text-slate-600">
                      <span className="flex items-center gap-1">
                        {getCategoryIcon(ms.category)}
                        <strong className="dark:text-zinc-300 text-slate-700">{ms.project}</strong>
                      </span>
                      <span>·</span>
                      <span className="dark:text-[#00ff41] text-emerald-700 font-semibold">{ms.category}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start md:self-center flex-none">
                    <span className="text-xs font-mono dark:text-zinc-400 text-slate-500 hidden sm:inline">
                      {isExpanded ? 'Collapse' : 'Details'}
                    </span>
                    <ChevronRight
                      className={`w-5 h-5 text-zinc-400 transition-transform duration-200 ${
                        isExpanded ? 'rotate-90 text-sky-600 dark:text-[#00b8ff]' : ''
                      }`}
                    />
                  </div>
                </button>

                {/* Expanded Details Body */}
                {isExpanded && (
                  <div className="px-4 pb-5 sm:px-5 sm:pb-6 pt-2 border-t dark:border-zinc-800/80 border-slate-100 space-y-4 animate-fadeIn">
                    <p className="font-mono text-xs sm:text-sm dark:text-zinc-300 text-slate-700 leading-relaxed">
                      {ms.description}
                    </p>

                    {/* Breakthrough Highlight Box */}
                    <div className="p-3.5 rounded-lg dark:bg-[#00ff41]/[0.08] bg-emerald-50 dark:border-[#00ff41]/30 border-emerald-300 border-l-4 dark:border-l-[#00ff41] border-l-emerald-600">
                      <div className="flex items-center gap-2 mb-1">
                        <Sparkles className="w-4 h-4 dark:text-[#00ff41] text-emerald-700 flex-none" />
                        <span className="font-orbitron text-xs font-bold uppercase tracking-wider dark:text-[#00ff41] text-emerald-800">
                          Milestone Breakthrough
                        </span>
                      </div>
                      <p className="font-mono text-xs dark:text-emerald-100 text-emerald-950 font-medium leading-relaxed">
                        {ms.breakthrough}
                      </p>
                    </div>

                    {/* Key Technical Deliverables */}
                    <div>
                      <span className="block font-orbitron text-xs font-bold uppercase tracking-wider dark:text-zinc-300 text-slate-800 mb-2">
                        Core Technical Deliverables &amp; Output:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {ms.deliverables.map((deliv, idx) => (
                          <div
                            key={idx}
                            className="p-2.5 rounded-md dark:bg-black/50 bg-slate-50 border dark:border-zinc-800 border-slate-200 text-xs font-mono dark:text-zinc-300 text-slate-700 flex items-start gap-2"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 dark:text-[#00b8ff] text-sky-600 flex-none mt-0.5" />
                            <span>{deliv}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Scientific Citation Reference */}
                    {ms.keyReference && (
                      <div className="pt-2 flex items-center justify-between gap-3 text-xs font-mono dark:text-zinc-400 text-slate-600 flex-wrap">
                        <span className="flex items-center gap-1.5">
                          <span className="font-bold dark:text-zinc-300 text-slate-700">Archived Paper:</span>
                          <span className="italic">{ms.keyReference.label}</span>
                        </span>
                        {ms.keyReference.doi && (
                          <a
                            href={`https://doi.org/${ms.keyReference.doi}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 dark:text-[#00b8ff] text-sky-600 hover:underline font-bold"
                          >
                            <span>DOI: {ms.keyReference.doi}</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
