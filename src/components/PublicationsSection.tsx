import React, { useState, useMemo } from 'react';
import { PUBLICATIONS } from '../data/initialData';
import { Publication } from '../types';
import {
  Search,
  Calendar,
  Tag,
  ExternalLink,
  Copy,
  Check,
  X,
  Filter,
  ArrowUpDown,
  FileText,
  RotateCcw,
  BookOpen,
} from 'lucide-react';

interface PublicationsSectionProps {
  onNotify?: (msg: string, isError?: boolean) => void;
}

export const PublicationsSection: React.FC<PublicationsSectionProps> = ({ onNotify }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedKeyword, setSelectedKeyword] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'year-desc' | 'year-asc' | 'title-asc'>('year-desc');
  const [expandedAbstracts, setExpandedAbstracts] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Extract all unique years present in publications, sorted newest to oldest
  const availableYears = useMemo(() => {
    const years = Array.from(new Set(PUBLICATIONS.map((p) => p.year))).sort((a, b) => b - a);
    return years;
  }, []);

  // Extract all unique categories
  const categories = useMemo(() => {
    const cats = Array.from(new Set(PUBLICATIONS.map((p) => p.category)));
    return ['all', ...cats];
  }, []);

  // Extract top keywords across all publications
  const popularKeywords = useMemo(() => {
    const kwMap = new Map<string, number>();
    PUBLICATIONS.forEach((p) => {
      p.keywords?.forEach((k) => {
        kwMap.set(k, (kwMap.get(k) || 0) + 1);
      });
    });
    return Array.from(kwMap.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([k]) => k);
  }, []);

  // Count publications per year for filter badges
  const countPerYear = useMemo(() => {
    const map: Record<number, number> = {};
    PUBLICATIONS.forEach((p) => {
      map[p.year] = (map[p.year] || 0) + 1;
    });
    return map;
  }, []);

  // Filter and sort publications
  const filteredPublications = useMemo(() => {
    return PUBLICATIONS.filter((pub) => {
      // Keyword/query search in title, authors, journal, abstract, or keyword tags
      const query = searchQuery.trim().toLowerCase();
      const matchesQuery =
        !query ||
        pub.title.toLowerCase().includes(query) ||
        pub.authors.toLowerCase().includes(query) ||
        pub.journal.toLowerCase().includes(query) ||
        String(pub.year).includes(query) ||
        (pub.abstract && pub.abstract.toLowerCase().includes(query)) ||
        (pub.keywords && pub.keywords.some((k) => k.toLowerCase().includes(query)));

      // Year filter
      const matchesYear = selectedYear === 'all' || pub.year === Number(selectedYear);

      // Category filter
      const matchesCategory = selectedCategory === 'all' || pub.category === selectedCategory;

      // Specific tag keyword filter
      const matchesKeyword =
        selectedKeyword === 'all' ||
        (pub.keywords && pub.keywords.includes(selectedKeyword));

      return matchesQuery && matchesYear && matchesCategory && matchesKeyword;
    }).sort((a, b) => {
      if (sortBy === 'year-desc') return b.year - a.year;
      if (sortBy === 'year-asc') return a.year - b.year;
      if (sortBy === 'title-asc') return a.title.localeCompare(b.title);
      return 0;
    });
  }, [searchQuery, selectedYear, selectedCategory, selectedKeyword, sortBy]);

  const handleCopyBibtex = (pub: Publication) => {
    if (pub.bibtex) {
      navigator.clipboard.writeText(pub.bibtex);
      setCopiedId(pub.id);
      if (onNotify) onNotify(`BibTeX citation copied for: "${pub.title}"`);
      setTimeout(() => setCopiedId(null), 2500);
    }
  };

  const toggleAbstract = (id: string) => {
    setExpandedAbstracts((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedYear('all');
    setSelectedCategory('all');
    setSelectedKeyword('all');
    setSortBy('year-desc');
    if (onNotify) onNotify('All publication search filters cleared.');
  };

  const hasActiveFilters =
    Boolean(searchQuery.trim()) ||
    selectedYear !== 'all' ||
    selectedCategory !== 'all' ||
    selectedKeyword !== 'all';

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <div className="inline-block border-b-2 dark:border-[#00b8ff] border-sky-600 pb-1 mb-4">
          <h2 className="font-section-title text-2xl sm:text-3xl md:text-4xl font-bold uppercase tracking-wider dark:text-white text-slate-900 flex items-center">
            <span className="dark:text-[#00ff41] text-emerald-600 font-mono mr-2 select-none">//</span>
            <span>Peer-Reviewed Publications &amp; Papers</span>
          </h2>
        </div>
        <p className="dark:text-zinc-400 text-slate-600 font-mono text-xs sm:text-sm max-w-3xl leading-relaxed">
          Archived research publications across multiaxial fatigue, fracture mechanics, neural biomechanics, and energy-absorbing metamaterials authored by Pouria Hejazi Rekavandi and research associates.
        </p>
      </div>

      {/* Main Search & Year Filter Controls Card */}
      <div className="p-4 sm:p-5 rounded-xl dark:bg-[#090d12] bg-white border dark:border-zinc-800 border-slate-200 shadow-sm space-y-4 font-mono">
        {/* Top Row: Search Input & Year Select & Sort Select */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Keyword Search Input */}
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by keywords, title, author, topic, or journal..."
              className="w-full pl-10 pr-9 py-2.5 dark:bg-[#040608] bg-slate-50 border dark:border-zinc-700 border-slate-300 focus:border-sky-600 dark:focus:border-[#00ff41] rounded-lg text-xs sm:text-sm dark:text-white text-slate-900 placeholder:text-zinc-500 focus:outline-none transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200 p-0.5"
                title="Clear keyword search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filter by Year Dropdown */}
          <div className="md:col-span-3 relative">
            <div className="relative">
              <Calendar className="w-4 h-4 text-[#00b8ff] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full pl-9 pr-8 py-2.5 dark:bg-[#040608] bg-slate-50 border dark:border-zinc-700 border-slate-300 focus:border-sky-600 dark:focus:border-[#00b8ff] rounded-lg text-xs sm:text-sm dark:text-white text-slate-900 focus:outline-none cursor-pointer appearance-none"
              >
                <option value="all">All Years ({PUBLICATIONS.length})</option>
                {availableYears.map((year) => (
                  <option key={year} value={year}>
                    Year: {year} ({countPerYear[year] || 0} papers)
                  </option>
                ))}
              </select>
              <ArrowUpDown className="w-3.5 h-3.5 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Sort By Dropdown */}
          <div className="md:col-span-3 relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2.5 dark:bg-[#040608] bg-slate-50 border dark:border-zinc-700 border-slate-300 focus:border-sky-600 dark:focus:border-[#00b8ff] rounded-lg text-xs sm:text-sm dark:text-white text-slate-900 focus:outline-none cursor-pointer"
            >
              <option value="year-desc">Sort: Newest First</option>
              <option value="year-asc">Sort: Oldest First</option>
              <option value="title-asc">Sort: Title (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Quick Year Pill Selector */}
        <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t dark:border-zinc-800/80 border-slate-200">
          <span className="text-[11px] font-bold uppercase tracking-wider dark:text-zinc-400 text-slate-500 mr-1 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-[#00b8ff]" />
            Year:
          </span>
          <button
            onClick={() => setSelectedYear('all')}
            className={`px-2.5 py-1 rounded text-xs transition-all cursor-pointer ${
              selectedYear === 'all'
                ? 'dark:bg-[#00b8ff] dark:text-black bg-sky-600 text-white font-bold shadow-sm'
                : 'dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 bg-slate-100 text-slate-700 hover:bg-slate-200 border dark:border-zinc-800 border-slate-200'
            }`}
          >
            All Years
          </button>
          {availableYears.map((year) => (
            <button
              key={year}
              onClick={() => setSelectedYear(String(year))}
              className={`px-2.5 py-1 rounded text-xs transition-all cursor-pointer ${
                selectedYear === String(year)
                  ? 'dark:bg-[#00b8ff] dark:text-black bg-sky-600 text-white font-bold shadow-sm'
                  : 'dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 bg-slate-100 text-slate-700 hover:bg-slate-200 border dark:border-zinc-800 border-slate-200'
              }`}
            >
              {year} <span className="opacity-70 text-[10px]">({countPerYear[year]})</span>
            </button>
          ))}
        </div>

        {/* Popular Keywords Row */}
        <div className="flex items-center gap-1.5 flex-wrap pt-2">
          <span className="text-[11px] font-bold uppercase tracking-wider dark:text-zinc-400 text-slate-500 mr-1 flex items-center gap-1">
            <Tag className="w-3.5 h-3.5 text-[#00ff41]" />
            Keywords:
          </span>
          <button
            onClick={() => setSelectedKeyword('all')}
            className={`px-2 py-0.5 rounded text-[11px] transition-all cursor-pointer ${
              selectedKeyword === 'all'
                ? 'dark:bg-[#00ff41] dark:text-black bg-emerald-600 text-white font-bold'
                : 'dark:bg-zinc-900 dark:text-zinc-400 bg-slate-100 text-slate-600 hover:text-slate-900 dark:hover:text-white border dark:border-zinc-800 border-slate-200'
            }`}
          >
            All Keywords
          </button>
          {popularKeywords.slice(0, 8).map((keyword) => (
            <button
              key={keyword}
              onClick={() =>
                setSelectedKeyword(selectedKeyword === keyword ? 'all' : keyword)
              }
              className={`px-2 py-0.5 rounded text-[11px] transition-all cursor-pointer flex items-center gap-1 ${
                selectedKeyword === keyword
                  ? 'dark:bg-[#00ff41] dark:text-black bg-emerald-600 text-white font-bold shadow-sm'
                  : 'dark:bg-zinc-900 dark:text-zinc-400 bg-slate-100 text-slate-600 hover:text-slate-900 dark:hover:text-white border dark:border-zinc-800 border-slate-200 hover:border-emerald-500'
              }`}
            >
              <span>#{keyword}</span>
            </button>
          ))}
        </div>

        {/* Categories Row */}
        <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t dark:border-zinc-800/80 border-slate-200">
          <span className="text-[11px] font-bold uppercase tracking-wider dark:text-zinc-400 text-slate-500 mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-amber-500" />
            Field:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded text-xs transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === cat
                  ? 'dark:bg-[#00ff41]/20 dark:border-[#00ff41] dark:text-[#00ff41] bg-emerald-100 border-emerald-500 text-emerald-800 font-bold border'
                  : 'dark:bg-zinc-900/60 dark:text-zinc-400 text-slate-600 hover:text-slate-900 dark:hover:text-white border dark:border-zinc-800 border-slate-200'
              }`}
            >
              {cat === 'all' ? 'All Fields' : cat}
            </button>
          ))}
        </div>

        {/* Filter Summary & Active Badges */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t dark:border-zinc-800/80 border-slate-200 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="dark:text-zinc-300 text-slate-700 font-bold">
              Showing {filteredPublications.length} of {PUBLICATIONS.length} papers
            </span>

            {/* Active filter pills */}
            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] dark:bg-sky-950/60 bg-sky-100 dark:text-sky-300 text-sky-800 border dark:border-sky-800 border-sky-300">
                Keyword: "{searchQuery}"
                <button
                  onClick={() => setSearchQuery('')}
                  className="hover:text-red-400 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {selectedYear !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] dark:bg-sky-950/60 bg-sky-100 dark:text-sky-300 text-sky-800 border dark:border-sky-800 border-sky-300">
                Year: {selectedYear}
                <button
                  onClick={() => setSelectedYear('all')}
                  className="hover:text-red-400 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {selectedKeyword !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] dark:bg-emerald-950/60 bg-emerald-100 dark:text-emerald-300 text-emerald-800 border dark:border-emerald-800 border-emerald-300">
                Tag: #{selectedKeyword}
                <button
                  onClick={() => setSelectedKeyword('all')}
                  className="hover:text-red-400 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {selectedCategory !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] dark:bg-purple-950/60 bg-purple-100 dark:text-purple-300 text-purple-800 border dark:border-purple-800 border-purple-300">
                Category: {selectedCategory}
                <button
                  onClick={() => setSelectedCategory('all')}
                  className="hover:text-red-400 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>

          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="flex items-center gap-1 px-2.5 py-1 rounded text-xs dark:bg-red-950/40 dark:text-red-400 dark:border-red-900 bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 dark:hover:bg-red-900/60 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Publications Cards List */}
      <div className="space-y-5">
        {filteredPublications.length > 0 ? (
          filteredPublications.map((pub) => {
            const isCopied = copiedId === pub.id;
            const isAbstractExpanded = Boolean(expandedAbstracts[pub.id]);

            return (
              <article
                key={pub.id}
                className="group relative dark:bg-[#0c1015] bg-white border dark:border-[#22272e] border-slate-200 border-l-4 dark:border-l-[#00ff41] border-l-emerald-600 hover:border-l-sky-600 dark:hover:bg-[#111720] hover:bg-slate-50 p-5 sm:p-6 rounded-r-xl transition-all duration-300 dark:shadow-[0_4px_20px_rgba(0,0,0,0.5)] shadow-md hover:-translate-y-0.5 font-mono"
              >
                {/* Header: Title and Year Badge */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-2">
                  <h3 className="text-base sm:text-lg font-bold dark:text-[#00ff41] text-emerald-800 dark:group-hover:text-white group-hover:text-sky-900 transition-colors leading-snug">
                    {pub.title}
                  </h3>
                  <div className="flex items-center gap-2 self-start flex-none">
                    <button
                      onClick={() => setSelectedYear(String(pub.year))}
                      className="font-orbitron text-xs dark:text-[#00b8ff] text-sky-700 px-3 py-1 rounded-full dark:bg-[#00b8ff]/15 bg-sky-50 dark:border dark:border-[#00b8ff]/40 border border-sky-300 font-bold hover:scale-105 transition-transform cursor-pointer"
                      title={`Filter papers published in ${pub.year}`}
                    >
                      {pub.year}
                    </button>
                  </div>
                </div>

                {/* Authors and Journal */}
                <div className="dark:text-zinc-300 text-slate-700 text-xs sm:text-sm font-semibold mb-1">
                  {pub.authors}
                </div>

                <div className="dark:text-[#00b8ff] text-sky-700 text-xs sm:text-sm italic mb-3 flex flex-wrap items-center gap-2">
                  <span>{pub.journal}</span>
                  {pub.doi && (
                    <span className="not-italic text-[11px] dark:text-zinc-400 text-slate-500 font-mono">
                      · DOI: {pub.doi}
                    </span>
                  )}
                </div>

                {/* Keyword Tags (Clickable to filter!) */}
                {pub.keywords && pub.keywords.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 mb-3">
                    {pub.keywords.map((kw) => (
                      <button
                        key={kw}
                        onClick={() => {
                          setSelectedKeyword(kw);
                          setSearchQuery('');
                        }}
                        className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold transition-colors cursor-pointer ${
                          selectedKeyword === kw
                            ? 'dark:bg-[#00ff41] dark:text-black bg-emerald-600 text-white'
                            : 'dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 bg-slate-100 text-slate-600 hover:text-sky-700 border dark:border-zinc-800 border-slate-200'
                        }`}
                        title={`Filter by keyword #${kw}`}
                      >
                        #{kw}
                      </button>
                    ))}
                  </div>
                )}

                {/* Abstract Accordion */}
                {pub.abstract && (
                  <div className="mb-4">
                    {isAbstractExpanded ? (
                      <div className="p-3 rounded-lg dark:bg-black/40 bg-slate-100 text-xs leading-relaxed dark:text-zinc-300 text-slate-700 border dark:border-zinc-800 border-slate-200 animate-fadeIn">
                        <div className="font-bold uppercase tracking-wider text-[10px] dark:text-[#00ff41] text-emerald-700 mb-1">
                          Abstract:
                        </div>
                        {pub.abstract}
                      </div>
                    ) : null}

                    <button
                      onClick={() => toggleAbstract(pub.id)}
                      className="mt-1.5 text-xs text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <FileText className="w-3 h-3" />
                      {isAbstractExpanded ? 'Collapse Abstract' : 'Read Abstract...'}
                    </button>
                  </div>
                )}

                {/* Action Buttons: View Publication & BibTeX Citation */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t dark:border-zinc-800/80 border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-2 py-0.5 rounded dark:bg-zinc-900 bg-slate-100 dark:text-zinc-400 text-slate-500 uppercase font-bold border dark:border-zinc-800 border-slate-200">
                      {pub.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopyBibtex(pub)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 dark:bg-zinc-900 bg-slate-100 hover:bg-slate-200 dark:border-zinc-700 border-slate-300 dark:text-zinc-300 text-slate-700 font-mono text-xs rounded transition-colors cursor-pointer border shadow-sm"
                      title="Copy BibTeX format citation"
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-[#00ff41]" />
                          <span className="text-emerald-700 dark:text-[#00ff41] font-bold">
                            BibTeX Copied!
                          </span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-400" />
                          <span>Copy BibTeX</span>
                        </>
                      )}
                    </button>

                    <a
                      href={pub.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 dark:bg-[#00ff41] dark:hover:bg-[#00b8ff] dark:text-[#050505] bg-emerald-600 hover:bg-sky-600 text-white font-orbitron font-bold text-xs uppercase tracking-wider rounded transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      <span>View Paper</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </article>
            );
          })
        ) : (
          <div className="py-16 px-4 text-center dark:bg-[#0c1015] bg-white border border-dashed dark:border-zinc-800 border-slate-300 rounded-xl space-y-3 font-mono">
            <BookOpen className="w-8 h-8 mx-auto text-zinc-400" />
            <h4 className="text-base font-bold dark:text-white text-slate-800">
              No matching publications found
            </h4>
            <p className="text-xs text-zinc-500 max-w-md mx-auto">
              No research papers matched your current keyword or year filter criteria. Try clearing the search or choosing a different year.
            </p>
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg dark:bg-[#00ff41] dark:text-black bg-emerald-600 text-white font-bold text-xs uppercase tracking-wider cursor-pointer shadow-sm hover:opacity-90"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
