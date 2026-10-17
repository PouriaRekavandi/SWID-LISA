import React, { useState, useMemo, useEffect } from 'react';
import { ANTIPRISM_VIDEOS } from '../data/initialData';
import { ResearchMetrics } from './ResearchMetrics';
import { ResearchMilestoneTimeline } from './ResearchMilestoneTimeline';
import { GitHubStatsWidget } from './GitHubStatsWidget';
import {
  ChevronDown,
  Play,
  Download,
  Cpu,
  Layers,
  Activity,
  CheckCircle2,
  Filter,
  ArrowUpDown,
  Search,
  X,
  Share2,
  Check
} from 'lucide-react';

interface ResearchItem {
  id: string;
  category: 'module' | 'focus';
  numeral?: string;
  title: string;
  shortTitle: string;
  desc: string;
  tags: string[];
  highlight?: string;
  order: number;
}

const RESEARCH_ITEMS: ResearchItem[] = [
  {
    id: 'mod-1',
    category: 'module',
    numeral: 'I',
    title: 'Fatigue and Fracture Mechanics',
    shortTitle: 'Fatigue & Fracture',
    desc: 'Overview and educational materials on fatigue failure, crack initiation, stress-intensity factor formulations (KI, KII, KIII), and Paris law subcritical crack growth.',
    tags: ['Fracture', 'FEA'],
    highlight: 'Multiaxial life models & Findley critical planes',
    order: 1,
  },
  {
    id: 'mod-2',
    category: 'module',
    numeral: 'II',
    title: 'Neural Biomechanics & Traumatic Injury',
    shortTitle: 'Neural Biomechanics',
    desc: 'Research materials focusing on computational neuroscience, brain-tissue modeling, and axonal strain under dynamic impact rates and blast overpressures.',
    tags: ['Biomechanics', 'FEA'],
    highlight: 'Nonlinear Ogden & Mooney-Rivlin viscoelasticity',
    order: 2,
  },
  {
    id: 'mod-3',
    category: 'module',
    numeral: 'III',
    title: 'Energy Absorption & Metamaterials (Interactive Tutorials)',
    shortTitle: 'Energy Absorption & Metamaterials',
    desc: 'Investigation into mechanical energy dissipation, cellular metamaterials, AntiPrism unit cells, and dynamic impact mitigation.',
    tags: ['Metamaterials', 'FEA'],
    highlight: 'Interactive AntiPrism Video Tutorials (Parts 1 & 2)',
    order: 3,
  },
  {
    id: 'mod-4',
    category: 'module',
    numeral: 'IV',
    title: 'Fracture in Cementitious Materials',
    shortTitle: 'Cementitious Fracture',
    desc: 'Studies on cementitious-matrix toughness, quasi-brittle fracture, and microstructural analysis in fiber-reinforced composite systems.',
    tags: ['Fracture', 'Composites'],
    highlight: 'Digital Image Correlation & bilinear softening laws',
    order: 4,
  },
  {
    id: 'focus-1',
    category: 'focus',
    title: 'Composite Sandwich Panels',
    shortTitle: 'Composite Sandwich Panels',
    desc: 'Study and optimization of composite sandwich panels featuring various cores, specifically focusing on honeycomb configurations under uniform external compressive load.',
    tags: ['Metamaterials', 'Composites'],
    highlight: 'Uniform compressive load & core cell topology',
    order: 5,
  },
  {
    id: 'focus-2',
    category: 'focus',
    title: 'Bio-inspired Composites',
    shortTitle: 'Bio-inspired Composites',
    desc: 'Design, data extraction, and structural analysis of bio-inspired helicoidal composite structures to significantly enhance impact resistance and load-bearing capacity.',
    tags: ['Biomechanics', 'Metamaterials', 'Composites'],
    highlight: 'Bouligand architectures & crack twisting mechanisms',
    order: 6,
  },
  {
    id: 'focus-3',
    category: 'focus',
    title: 'Computational Modeling & FEA',
    shortTitle: 'Computational FEA',
    desc: 'Development and debugging of computational codes in MATLAB and Python, alongside utilizing finite element methods (Abaqus UMAT/VUMAT) for precise simulation of complex mechanical behaviors.',
    tags: ['FEA', 'Fracture', 'Biomechanics'],
    highlight: 'Explicit solvers & nonlinear constitutive routines',
    order: 7,
  },
];

type SortOption = 'default' | 'name-asc' | 'name-desc' | 'tags-count';

export interface ResearchSectionProps {
  onNotify?: (message: string, isError?: boolean) => void;
}

export const ResearchSection: React.FC<ResearchSectionProps> = ({ onNotify }) => {
  const [selectedTag, setSelectedTag] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toastNotification, setToastNotification] = useState<{ title: string; link: string } | null>(null);

  const [openAccordions, setOpenAccordions] = useState<Record<string, boolean>>({
    'mod-1': false,
    'mod-2': false,
    'mod-3': true, // Expanded by default to highlight video player
    'mod-4': false,
  });

  const [currentVideo, setCurrentVideo] = useState(ANTIPRISM_VIDEOS[0]);

  // Handle deep-link hashes (e.g. #mod-1 or #focus-2)
  useEffect(() => {
    const handleHash = () => {
      const rawHash = window.location.hash.replace('#', '');
      if (rawHash) {
        if (['mod-1', 'mod-2', 'mod-3', 'mod-4'].includes(rawHash)) {
          setOpenAccordions((prev) => ({ ...prev, [rawHash]: true }));
        }
        setTimeout(() => {
          const el = document.getElementById(rawHash);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 200);
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const toggleAccordion = (id: string) => {
    setOpenAccordions((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const expandAll = () => {
    setOpenAccordions({
      'mod-1': true,
      'mod-2': true,
      'mod-3': true,
      'mod-4': true,
    });
  };

  const collapseAll = () => {
    setOpenAccordions({
      'mod-1': false,
      'mod-2': false,
      'mod-3': false,
      'mod-4': false,
    });
  };

  const handleShare = async (item: ResearchItem, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }

    const origin = window.location.origin;
    const pathname = window.location.pathname;
    const shareUrl = `${origin}${pathname}#${item.id}`;

    let success = false;
    if (navigator?.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(shareUrl);
        success = true;
      } catch {
        success = false;
      }
    }

    if (!success) {
      try {
        const textarea = document.createElement('textarea');
        textarea.value = shareUrl;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        success = true;
      } catch {
        success = false;
      }
    }

    setCopiedId(item.id);
    setTimeout(() => {
      setCopiedId((curr) => (curr === item.id ? null : curr));
    }, 2500);

    const notifyText = `Project link copied to clipboard: ${item.shortTitle || item.title}`;
    if (onNotify) {
      onNotify(notifyText);
    } else {
      setToastNotification({
        title: item.title,
        link: shareUrl,
      });
      setTimeout(() => {
        setToastNotification((curr) => (curr?.title === item.title ? null : curr));
      }, 4000);
    }
  };

  const allTags = ['All', 'Biomechanics', 'Metamaterials', 'Fracture', 'FEA', 'Composites'];

  // Tag counts
  const tagCounts = useMemo(() => {
    const counts: Record<string, number> = { All: RESEARCH_ITEMS.length };
    allTags.slice(1).forEach((tag) => {
      counts[tag] = RESEARCH_ITEMS.filter((item) => item.tags.includes(tag)).length;
    });
    return counts;
  }, []);

  // Filtered & Sorted items
  const filteredItems = useMemo(() => {
    let result = RESEARCH_ITEMS.filter((item) => {
      const matchesTag = selectedTag === 'All' || item.tags.includes(selectedTag);
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        item.title.toLowerCase().includes(query) ||
        item.desc.toLowerCase().includes(query) ||
        (item.highlight && item.highlight.toLowerCase().includes(query)) ||
        item.tags.some((t) => t.toLowerCase().includes(query));

      return matchesTag && matchesSearch;
    });

    // Sorting
    result = [...result].sort((a, b) => {
      if (sortBy === 'name-asc') {
        return a.title.localeCompare(b.title);
      }
      if (sortBy === 'name-desc') {
        return b.title.localeCompare(a.title);
      }
      if (sortBy === 'tags-count') {
        return b.tags.length - a.tags.length;
      }
      return a.order - b.order;
    });

    return result;
  }, [selectedTag, searchQuery, sortBy]);

  const modules = filteredItems.filter((i) => i.category === 'module');
  const focusAreas = filteredItems.filter((i) => i.category === 'focus');

  const handleTagClick = (tag: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedTag(tag);
  };

  const resetFilters = () => {
    setSelectedTag('All');
    setSearchQuery('');
    setSortBy('default');
  };

  return (
    <div className="space-y-10 relative">
      {/* Section Header */}
      <div>
        <div className="inline-block border-b-2 dark:border-[#00b8ff] border-sky-600 pb-1 mb-4">
          <h2 className="font-section-title text-2xl sm:text-3xl md:text-4xl font-bold uppercase tracking-wider dark:text-white text-slate-900 flex items-center">
            <span className="dark:text-[#00ff41] text-emerald-600 font-mono mr-2 select-none">//</span>
            <span>Research Modules &amp; Domains</span>
          </h2>
        </div>
        <p className="dark:text-zinc-400 text-slate-600 font-mono text-sm max-w-3xl leading-relaxed">
          Fundamental and applied investigations across continuum mechanics, bio-inspired architectures, nonlinear material deformation, and dynamic crashworthiness.
        </p>
      </div>

      {/* Research Metrics Section with Animated Counting Numbers */}
      <ResearchMetrics />

      {/* Interactive Filter & Sort Toolbar */}
      <div className="dark:bg-[#11161d] bg-white border dark:border-[#22303c] border-slate-200 rounded-xl p-4 sm:p-5 shadow-sm space-y-4">
        {/* Top Controls: Search + Sort + Expand */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Keyword Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter topics (e.g. Viscoelastic, Honeycomb, DIC)..."
              className="w-full pl-10 pr-4 py-2 dark:bg-[#080d14] bg-slate-50 border dark:border-[#2a3b4c] border-slate-300 focus:border-sky-600 dark:focus:border-[#00b8ff] rounded-lg text-xs sm:text-sm dark:text-white text-slate-900 font-mono placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-sky-600 focus:bg-white"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2.5 flex-wrap justify-between md:justify-end">
            {/* Sort Selector */}
            <div className="flex items-center gap-1.5 dark:bg-[#080d14] bg-slate-50 border dark:border-[#2a3b4c] border-slate-300 px-3 py-1.5 rounded-lg text-xs font-mono">
              <ArrowUpDown className="w-3.5 h-3.5 dark:text-[#00b8ff] text-sky-600 flex-none" />
              <label htmlFor="sort-select" className="text-zinc-400 sr-only">Sort by</label>
              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="bg-transparent dark:text-zinc-200 text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="default">Default Order</option>
                <option value="name-asc">Title (A &rarr; Z)</option>
                <option value="name-desc">Title (Z &rarr; A)</option>
                <option value="tags-count">Most Related Tags</option>
              </select>
            </div>

            {/* Expand / Collapse All */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={expandAll}
                className="px-2.5 py-1.5 text-[11px] font-mono dark:bg-zinc-800 bg-slate-100 dark:hover:bg-zinc-700 hover:bg-slate-200 dark:text-zinc-300 text-slate-700 rounded transition-colors cursor-pointer"
                title="Expand all accordion modules"
              >
                Expand All
              </button>
              <button
                type="button"
                onClick={collapseAll}
                className="px-2.5 py-1.5 text-[11px] font-mono dark:bg-zinc-800 bg-slate-100 dark:hover:bg-zinc-700 hover:bg-slate-200 dark:text-zinc-300 text-slate-700 rounded transition-colors cursor-pointer"
                title="Collapse all accordion modules"
              >
                Collapse All
              </button>
            </div>
          </div>
        </div>

        {/* Tag Filters Row */}
        <div className="pt-2 border-t dark:border-zinc-800/80 border-slate-200 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-mono uppercase tracking-wider dark:text-zinc-400 text-slate-500 flex items-center gap-1.5 mr-1">
            <Filter className="w-3.5 h-3.5 dark:text-[#00ff41] text-emerald-600" />
            Filter by Tag:
          </span>

          {allTags.map((tag) => {
            const isSelected = selectedTag === tag;
            const count = tagCounts[tag] ?? 0;
            return (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'dark:bg-[#00ff41] dark:text-black bg-emerald-700 text-white font-bold shadow-sm'
                    : 'dark:bg-[#0c1219] bg-slate-100 dark:text-zinc-300 text-slate-700 dark:border-[#22303c] border-slate-200 hover:border-sky-500 hover:text-sky-700'
                }`}
              >
                <span>{tag}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isSelected
                      ? 'dark:bg-black/30 bg-emerald-900/40 text-white'
                      : 'dark:bg-zinc-800 bg-slate-200 dark:text-zinc-400 text-slate-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}

          {(selectedTag !== 'All' || searchQuery) && (
            <button
              onClick={resetFilters}
              className="ml-auto text-xs font-mono dark:text-zinc-400 text-slate-500 hover:text-red-500 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Active filter count status */}
      <div className="flex items-center justify-between text-xs font-mono dark:text-zinc-400 text-slate-500 px-1">
        <span>
          Showing <strong className="dark:text-[#00ff41] text-emerald-700">{filteredItems.length}</strong> of {RESEARCH_ITEMS.length} research projects
          {selectedTag !== 'All' && <span> under <strong className="dark:text-white text-slate-800">#{selectedTag}</strong></span>}
        </span>
      </div>

      {filteredItems.length === 0 ? (
        <div className="p-12 text-center dark:bg-[#10141b] bg-white border border-dashed dark:border-zinc-800 border-slate-300 rounded-xl space-y-3">
          <Filter className="w-8 h-8 text-zinc-500 mx-auto" />
          <h4 className="font-orbitron font-bold text-white text-base">No Matching Research Modules</h4>
          <p className="font-mono text-xs text-zinc-400">
            No research projects matched your current search and tag criteria.
          </p>
          <button
            onClick={resetFilters}
            className="px-4 py-2 rounded bg-sky-600 hover:bg-sky-500 text-white font-mono text-xs font-bold cursor-pointer transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <>
          {/* Research Modules (Accordions) */}
          {modules.length > 0 && (
            <div className="space-y-4">
              {modules.map((item) => {
                const isOpen = openAccordions[item.id] ?? false;
                const isCopied = copiedId === item.id;

                return (
                  <div
                    key={item.id}
                    id={item.id}
                    className={`overflow-hidden rounded-lg border transition-all duration-300 ${
                      isOpen
                        ? 'dark:bg-[#121b24]/90 bg-sky-50/80 dark:border-[#00ff41] border-sky-600 shadow-sm'
                        : 'dark:bg-[#141414]/70 bg-white dark:border-[#333333] border-slate-200 hover:border-sky-500 shadow-sm'
                    }`}
                  >
                    <h3>
                      <div
                        onClick={() => toggleAccordion(item.id)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            toggleAccordion(item.id);
                          }
                        }}
                        aria-expanded={isOpen}
                        className="w-full px-5 py-4 flex items-center justify-between text-left cursor-pointer group select-none"
                      >
                        <div className="flex items-center gap-3 sm:gap-4 flex-wrap flex-1 mr-3">
                          <span className="font-orbitron font-bold text-sm dark:text-[#00b8ff] text-sky-700 w-6 flex-none">
                            {item.numeral}
                          </span>
                          <span className="font-bold text-sm sm:text-base dark:text-white text-slate-900 group-hover:text-sky-700 dark:group-hover:text-[#00ff41] transition-colors">
                            {item.title}
                          </span>

                          {/* Item Tags */}
                          <div className="flex items-center gap-1.5 ml-auto sm:ml-2">
                            {item.tags.map((t) => (
                              <span
                                key={t}
                                onClick={(e) => handleTagClick(t, e)}
                                className={`text-[10px] font-mono px-2 py-0.5 rounded-full border transition-colors ${
                                  selectedTag === t
                                    ? 'dark:bg-[#00ff41]/20 dark:border-[#00ff41] border-emerald-600 dark:text-[#00ff41] text-emerald-800 font-bold'
                                    : 'dark:bg-black/40 bg-slate-100 dark:border-zinc-800 border-slate-200 dark:text-zinc-400 text-slate-600 hover:border-sky-500'
                                }`}
                              >
                                #{t}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-none">
                          {/* Share Button for Module */}
                          <button
                            type="button"
                            onClick={(e) => handleShare(item, e)}
                            title={`Copy project link for ${item.title}`}
                            aria-label={`Share ${item.title}`}
                            className={`px-2.5 py-1.5 rounded-md text-xs font-mono flex items-center gap-1.5 transition-all duration-200 cursor-pointer ${
                              isCopied
                                ? 'dark:bg-[#00ff41]/20 bg-emerald-100 dark:text-[#00ff41] text-emerald-800 border dark:border-[#00ff41] border-emerald-500 font-bold shadow-xs'
                                : 'dark:bg-zinc-900/80 bg-slate-100 dark:hover:bg-zinc-800 hover:bg-slate-200 dark:text-zinc-300 text-slate-700 dark:border-zinc-700 border-slate-300 hover:border-sky-500 dark:hover:text-[#00b8ff] hover:text-sky-700 border'
                            }`}
                          >
                            {isCopied ? (
                              <>
                                <Check className="w-3.5 h-3.5 dark:text-[#00ff41] text-emerald-700" />
                                <span className="hidden sm:inline">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Share2 className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Share</span>
                              </>
                            )}
                          </button>

                          <ChevronDown
                            className={`w-5 h-5 dark:text-[#00ff41] text-sky-700 transition-transform duration-300 ${
                              isOpen ? 'rotate-180' : ''
                            }`}
                          />
                        </div>
                      </div>
                    </h3>

                    {isOpen && (
                      <div className="px-5 pb-6 pt-1 text-sm dark:text-zinc-300 text-slate-700 font-mono leading-relaxed border-t dark:border-zinc-800 border-slate-200 space-y-4">
                        <p>{item.desc}</p>

                        {/* Module-Specific Content */}
                        {item.id === 'mod-1' && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                            <div className="p-3 dark:bg-black/40 bg-white border dark:border-zinc-800 border-slate-200 rounded shadow-xs">
                              <div className="text-xs font-bold dark:text-[#00b8ff] text-sky-700 uppercase mb-1">
                                Multiaxial Life Models
                              </div>
                              <p className="text-xs dark:text-zinc-400 text-slate-600">
                                Critical plane approaches combined with Findley &amp; Brown-Miller criteria for non-proportional cycle counting.
                              </p>
                            </div>
                            <div className="p-3 dark:bg-black/40 bg-white border dark:border-zinc-800 border-slate-200 rounded shadow-xs">
                              <div className="text-xs font-bold dark:text-[#00ff41] text-emerald-700 uppercase mb-1">
                                Abaqus Subroutines
                              </div>
                              <p className="text-xs dark:text-zinc-400 text-slate-600">
                                Implementation of custom cyclic damage accumulation subroutines and cohesive element degradation.
                              </p>
                            </div>
                          </div>
                        )}

                        {item.id === 'mod-2' && (
                          <div className="p-3 dark:bg-black/40 bg-white border dark:border-zinc-800 border-slate-200 rounded shadow-xs">
                            <div className="text-xs font-bold dark:text-[#00ff41] text-emerald-700 uppercase mb-1">
                              High-Rate Viscoelasticity
                            </div>
                            <p className="text-xs dark:text-zinc-400 text-slate-600">
                              Nonlinear Ogden and Mooney-Rivlin hyperelastic formulations coupled with Prony series relaxation spectra to quantify localized cellular shears under blast overpressures.
                            </p>
                          </div>
                        )}

                        {item.id === 'mod-3' && (
                          <div className="p-4 sm:p-5 dark:bg-[#0b1016] bg-white border dark:border-[#00b8ff]/30 border-slate-300 rounded-xl space-y-4 shadow-sm">
                            <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b dark:border-[#00b8ff]/20 border-slate-200">
                              <h4 className="font-section-title font-bold text-base sm:text-lg dark:text-[#00b8ff] text-sky-700 flex items-center uppercase tracking-wide">
                                <span className="dark:text-[#00ff41] text-emerald-600 font-mono mr-2 select-none">//</span>
                                <span>Research Environment: AntiPrism Structures</span>
                              </h4>
                              <span className="text-xs dark:text-zinc-400 text-slate-500 font-mono">
                                Select a tutorial part from the playlist below
                              </span>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                              <div className="lg:col-span-2 bg-black border dark:border-zinc-800 border-slate-800 rounded-lg p-3 space-y-3">
                                <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                                  <span className="font-bold text-xs sm:text-sm text-[#00b8ff] flex items-center gap-2">
                                    <Play className="w-3.5 h-3.5 text-[#00ff41]" />
                                    {currentVideo.title}
                                  </span>
                                  <a
                                    href={currentVideo.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-[#00ff41] hover:underline flex items-center gap-1"
                                  >
                                    <Download className="w-3.5 h-3.5" />
                                    Download MP4
                                  </a>
                                </div>

                                <div className="relative aspect-video bg-black rounded overflow-hidden border border-zinc-900">
                                  <video
                                    key={currentVideo.url}
                                    src={currentVideo.url}
                                    controls
                                    playsInline
                                    preload="metadata"
                                    className="w-full h-full object-contain"
                                    onEnded={() => {
                                      const next = ANTIPRISM_VIDEOS.find((v) => v.id !== currentVideo.id);
                                      if (next) setCurrentVideo(next);
                                    }}
                                  >
                                    <p className="text-zinc-400 text-xs p-4">
                                      Your browser does not support HTML5 video playback.{' '}
                                      <a href={currentVideo.url} className="text-[#00ff41] underline">
                                        Download the video here
                                      </a>.
                                    </p>
                                  </video>
                                </div>

                                <p className="text-xs text-zinc-400">
                                  {currentVideo.description}
                                </p>
                              </div>

                              <div className="dark:bg-[#0f0f0f]/90 bg-slate-50 border dark:border-zinc-800 border-slate-200 rounded-lg p-3 space-y-2.5">
                                <h5 className="font-section-title font-bold text-xs uppercase tracking-wider dark:text-[#00ff41] text-emerald-700 pb-2 border-b dark:border-zinc-800 border-slate-200 flex items-center">
                                  <span className="text-[#00b8ff] font-mono mr-1.5 select-none">//</span>
                                  <span>Video Playlist</span>
                                </h5>

                                <div className="space-y-2">
                                  {ANTIPRISM_VIDEOS.map((video) => {
                                    const isSelected = currentVideo.id === video.id;
                                    return (
                                      <button
                                        key={video.id}
                                        onClick={() => setCurrentVideo(video)}
                                        className={`w-full p-2.5 rounded text-left transition-all text-xs font-mono flex items-start gap-2.5 border-l-3 cursor-pointer ${
                                          isSelected
                                            ? 'dark:bg-[#00ff41]/10 bg-emerald-100 dark:border-[#00ff41] border-emerald-600 dark:text-[#00ff41] text-emerald-900 font-bold'
                                            : 'dark:bg-zinc-900/60 bg-white dark:border-zinc-700 border-slate-200 dark:text-zinc-300 text-slate-700 hover:border-sky-500 hover:bg-sky-50'
                                        }`}
                                      >
                                        <span className="font-orbitron text-[11px] opacity-75">
                                          0{video.part}
                                        </span>
                                        <div className="flex-1">
                                          <div>{video.title}</div>
                                          <div className="text-[10px] dark:text-zinc-400 text-slate-500 font-normal line-clamp-1 mt-0.5">
                                            {video.description}
                                          </div>
                                        </div>
                                      </button>
                                    );
                                  })}
                                </div>

                                <div className="p-2.5 dark:bg-black/60 bg-white border dark:border-zinc-800/80 border-slate-200 rounded text-[11px] dark:text-zinc-400 text-slate-600 space-y-1 mt-3 shadow-xs">
                                  <div className="dark:text-zinc-200 text-slate-900 font-bold">Simulation Notes:</div>
                                  <div>• Explicit dynamic analysis via Abaqus 2024</div>
                                  <div>• Automated python scripting for unit cell parametrization</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {item.id === 'mod-4' && (
                          <div className="p-3 dark:bg-black/40 bg-white border dark:border-zinc-800 border-slate-200 rounded shadow-xs">
                            <div className="text-xs font-bold dark:text-[#00b8ff] text-sky-700 uppercase mb-1">
                              Crack Bridging &amp; Cohesive Laws
                            </div>
                            <p className="text-xs dark:text-zinc-400 text-slate-600">
                              Experimental Digital Image Correlation (DIC) synchronized with bilinear softening traction-separation laws to capture progressive fiber pull-out and tortuous matrix microcracking.
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Primary Research Focus Cards */}
          {focusAreas.length > 0 && (
            <div className="pt-6 border-t dark:border-zinc-800 border-slate-200">
              <h3 className="font-section-title text-xl sm:text-2xl font-bold uppercase tracking-wider dark:text-white text-slate-900 mb-6 flex items-center">
                <span className="dark:text-[#00ff41] text-emerald-600 font-mono mr-2 select-none">//</span>
                <span>Primary Research Focus Areas</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {focusAreas.map((area) => {
                  const isCopied = copiedId === area.id;

                  return (
                    <div
                      key={area.id}
                      id={area.id}
                      className="dark:bg-gradient-to-br dark:from-[#121b24] dark:to-[#0d1218] bg-white border dark:border-[#26333d] border-slate-200 dark:hover:border-[#00b8ff] hover:border-sky-500 rounded-xl p-5 dark:shadow-[0_10px_25px_rgba(0,0,0,0.5)] shadow-md transition-all duration-300 hover:-translate-y-1 space-y-4 flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="p-2 rounded dark:bg-black/50 bg-sky-50 border dark:border-zinc-800 border-sky-100">
                            {area.title.includes('Sandwich') && <Layers className="w-5 h-5 dark:text-[#00b8ff] text-sky-600" />}
                            {area.title.includes('Bio-inspired') && <Activity className="w-5 h-5 dark:text-[#00ff41] text-emerald-600" />}
                            {area.title.includes('Computational') && <Cpu className="w-5 h-5 dark:text-[#36c7ff] text-sky-600" />}
                          </div>

                          {/* Tags */}
                          <div className="flex items-center gap-1 flex-wrap justify-end">
                            {area.tags.map((t) => (
                              <button
                                key={t}
                                onClick={() => setSelectedTag(t)}
                                className={`text-[9px] font-mono px-2 py-0.5 rounded-full border cursor-pointer transition-colors ${
                                  selectedTag === t
                                    ? 'dark:bg-[#00ff41]/20 dark:border-[#00ff41] border-emerald-600 dark:text-[#00ff41] text-emerald-800 font-bold'
                                    : 'dark:bg-black/40 bg-slate-100 dark:border-zinc-800 border-slate-200 dark:text-zinc-400 text-slate-600 hover:border-sky-500'
                                }`}
                              >
                                #{t}
                              </button>
                            ))}
                          </div>
                        </div>

                        <h4 className="font-orbitron font-bold text-sm sm:text-base dark:text-white text-slate-900">
                          {area.title}
                        </h4>

                        <p className="text-xs sm:text-sm dark:text-zinc-300 text-slate-600 font-mono leading-relaxed">
                          {area.desc}
                        </p>
                      </div>

                      <div className="pt-3 border-t dark:border-zinc-800/80 border-slate-100 flex items-center justify-between gap-3 mt-auto">
                        {area.highlight ? (
                          <div className="flex items-center gap-1.5 text-[11px] dark:text-[#00ff41] text-emerald-700 font-semibold line-clamp-1 flex-1">
                            <CheckCircle2 className="w-3.5 h-3.5 flex-none" />
                            <span className="truncate">{area.highlight}</span>
                          </div>
                        ) : (
                          <div className="flex-1" />
                        )}

                        {/* Share Button for Focus Area Card */}
                        <button
                          type="button"
                          onClick={(e) => handleShare(area, e)}
                          title={`Copy project link for ${area.title}`}
                          aria-label={`Share ${area.title}`}
                          className={`px-2.5 py-1.5 rounded-md text-xs font-mono flex items-center gap-1.5 transition-all duration-200 cursor-pointer flex-none ${
                            isCopied
                              ? 'dark:bg-[#00ff41]/20 bg-emerald-100 dark:text-[#00ff41] text-emerald-800 border dark:border-[#00ff41] border-emerald-500 font-bold shadow-xs'
                              : 'dark:bg-black/40 bg-slate-100 dark:hover:bg-zinc-800 hover:bg-slate-200 dark:text-zinc-300 text-slate-700 dark:border-zinc-700 border-slate-300 hover:border-sky-500 dark:hover:text-[#00b8ff] hover:text-sky-700 border'
                          }`}
                        >
                          {isCopied ? (
                            <>
                              <Check className="w-3.5 h-3.5 dark:text-[#00ff41] text-emerald-700" />
                              <span>Copied!</span>
                            </>
                          ) : (
                            <>
                              <Share2 className="w-3.5 h-3.5" />
                              <span>Share</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* Visual Timeline Component: Key Project Developmental Milestones */}
      <ResearchMilestoneTimeline />

      {/* GitHub Statistics & Open-Source Repositories Activity Widget */}
      <GitHubStatsWidget onNotify={onNotify} />

      {/* Standalone / Fallback Toast Notification */}
      {toastNotification && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 flex items-start gap-3 p-4 rounded-xl font-mono text-xs shadow-2xl transition-all duration-300 max-w-md dark:bg-[#0c131c] bg-white border dark:border-[#00ff41] border-emerald-500 text-slate-900 dark:text-white dark:shadow-[0_0_25px_rgba(0,255,65,0.3)] shadow-lg"
        >
          <div className="p-1 rounded-full dark:bg-[#00ff41]/20 bg-emerald-100 dark:text-[#00ff41] text-emerald-700 flex-none mt-0.5">
            <Check className="w-4 h-4" />
          </div>
          <div className="flex-1 space-y-1">
            <div className="font-bold font-orbitron dark:text-[#00ff41] text-emerald-700 text-xs tracking-wide">
              PROJECT LINK COPIED
            </div>
            <p className="dark:text-zinc-200 text-slate-700 text-[11px] font-medium line-clamp-1">
              {toastNotification.title}
            </p>
            <p className="dark:text-zinc-500 text-slate-400 text-[10px] truncate max-w-xs">
              {toastNotification.link}
            </p>
          </div>
          <button
            onClick={() => setToastNotification(null)}
            className="dark:text-zinc-400 text-slate-400 hover:text-red-500 cursor-pointer p-0.5"
            aria-label="Dismiss toast"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
