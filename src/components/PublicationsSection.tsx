import React, { useState } from 'react';
import { PUBLICATIONS } from '../data/initialData';
import { Publication } from '../types';
import { Search, ExternalLink, Copy, Check } from 'lucide-react';

interface PublicationsSectionProps {
  onNotify?: (msg: string, isError?: boolean) => void;
}

export const PublicationsSection: React.FC<PublicationsSectionProps> = ({ onNotify }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories = ['all', 'Neural Biomechanics', 'Energy-Absorbing Metamaterials', 'Fracture Mechanics', 'Fatigue & Life Prediction'];

  const filteredPublications = PUBLICATIONS.filter((pub) => {
    const matchesSearch =
      pub.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pub.authors.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pub.journal.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(pub.year).includes(searchQuery);

    const matchesCategory = selectedCategory === 'all' || pub.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleCopyBibtex = (pub: Publication) => {
    if (pub.bibtex) {
      navigator.clipboard.writeText(pub.bibtex);
      setCopiedId(pub.id);
      if (onNotify) onNotify(`BibTeX citation copied for: ${pub.title}`);
      setTimeout(() => setCopiedId(null), 2500);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="inline-block border-b-2 dark:border-[#00b8ff] border-sky-600 pb-1 mb-4">
          <h2 className="font-orbitron text-xl sm:text-2xl md:text-3xl font-bold uppercase tracking-wider dark:text-white text-slate-900">
            // Peer-Reviewed Publications
          </h2>
        </div>
        <p className="dark:text-zinc-400 text-slate-600 font-mono text-sm max-w-3xl leading-relaxed">
          Selected journal articles and proceedings across computational mechanics, biomechanics, and metamaterials.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search papers, authors, year..."
            className="w-full pl-10 pr-4 py-2.5 dark:bg-[#090909] bg-white border dark:border-[#3b3b3b] border-slate-300 focus:border-sky-600 dark:focus:border-[#00b8ff] rounded-lg text-sm dark:text-white text-slate-900 font-mono placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-sky-600 shadow-sm"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-mono font-semibold transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === cat
                  ? 'dark:bg-[#00ff41] dark:text-[#050505] bg-emerald-700 text-white shadow-sm'
                  : 'dark:bg-[#141414] bg-white dark:text-zinc-400 text-slate-700 hover:text-slate-900 border dark:border-zinc-800 border-slate-200 hover:border-slate-300'
              }`}
            >
              {cat === 'all' ? 'All Publications' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Publications List */}
      <div className="space-y-5">
        {filteredPublications.length > 0 ? (
          filteredPublications.map((pub) => {
            const isCopied = copiedId === pub.id;
            return (
              <article
                key={pub.id}
                className="group relative dark:bg-[#141414]/70 bg-white border dark:border-[#333333] border-slate-200 border-l-4 dark:border-l-[#00ff41] border-l-emerald-600 hover:border-l-sky-600 dark:hover:bg-[#1a1a1a]/80 hover:bg-slate-50/80 hover:translate-x-1.5 p-5 sm:p-6 rounded-r-lg transition-all duration-300 dark:shadow-[0_4px_20px_rgba(0,0,0,0.4)] shadow-md"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-2">
                  <h3 className="text-base sm:text-lg font-bold dark:text-[#00ff41] text-emerald-800 dark:group-hover:text-white group-hover:text-sky-800 transition-colors leading-snug">
                    {pub.title}
                  </h3>
                  <span className="font-orbitron text-xs dark:text-[#00b8ff] text-sky-700 px-2.5 py-0.5 rounded dark:bg-[#00b8ff]/10 bg-sky-50 dark:border-[#00b8ff]/30 border-sky-200 self-start flex-none font-bold">
                    {pub.year}
                  </span>
                </div>

                <div className="dark:text-zinc-300 text-slate-600 text-xs sm:text-sm font-mono mb-1.5">
                  {pub.authors}
                </div>

                <div className="dark:text-[#00b8ff] text-sky-700 text-xs sm:text-sm italic font-mono mb-4">
                  {pub.journal} {pub.doi && <span className="not-italic text-zinc-500 ml-2">· DOI: {pub.doi}</span>}
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2 border-t dark:border-zinc-800/80 border-slate-200">
                  <a
                    href={pub.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 dark:bg-[#00ff41] dark:hover:bg-[#00b8ff] dark:text-[#050505] bg-emerald-600 hover:bg-sky-600 text-white font-orbitron font-bold text-xs uppercase tracking-wider rounded transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    <span>View Publication</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <button
                    onClick={() => handleCopyBibtex(pub)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 dark:bg-zinc-900 bg-slate-100 hover:bg-slate-200 dark:border-zinc-700 border-slate-300 dark:text-zinc-300 text-slate-700 font-mono text-xs rounded transition-colors cursor-pointer border"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-[#00ff41]" />
                        <span className="text-emerald-700 dark:text-[#00ff41] font-bold">BibTeX Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-500" />
                        <span>BibTeX Citation</span>
                      </>
                    )}
                  </button>
                </div>
              </article>
            );
          })
        ) : (
          <div className="py-16 text-center text-slate-500 font-mono text-sm border border-dashed border-slate-300 rounded-lg">
            No publication matches the current search query.
          </div>
        )}
      </div>
    </div>
  );
};
