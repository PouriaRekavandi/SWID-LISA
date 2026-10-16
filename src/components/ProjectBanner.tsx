import React, { useState } from 'react';
import { Sparkles, X, Atom, Cpu, ArrowRight } from 'lucide-react';

export const ProjectBanner: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <aside aria-label="Active Project Announcement" className="relative z-40 dark:bg-gradient-to-b dark:from-[#00ff41]/10 dark:to-[#00ff41]/[0.02] bg-emerald-50/90 border-b dark:border-[#00ff41]/40 border-emerald-300 px-4 py-2 text-xs sm:text-sm transition-colors duration-200">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2.5 flex-1 min-w-[260px] justify-center sm:justify-start">
            <span className="relative flex items-center gap-1.5 px-2.5 py-1 rounded-full dark:bg-[#00ff41] bg-emerald-700 dark:text-[#050505] text-white font-bold text-[11px] tracking-wider uppercase flex-none shadow-sm">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-white dark:bg-[#050505] animate-ping" />
              Active Project
            </span>
            <span className="dark:text-zinc-300 text-slate-800 font-mono text-xs sm:text-sm">
              <span className="dark:text-[#00ff41] text-emerald-700 font-bold mr-1">&gt;</span>
              In development: advanced LCE polymers via neural-network algorithms
            </span>
          </div>

          <button
            onClick={() => setIsOpen(true)}
            className="px-3.5 py-1 rounded dark:bg-[#00b8ff] dark:hover:bg-[#00ff41] dark:text-[#050505] bg-sky-600 hover:bg-emerald-600 text-white font-bold text-xs uppercase tracking-wider transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 mx-auto sm:mx-0 cursor-pointer flex items-center gap-1"
          >
            Details
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </aside>

      {/* Project Details Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-2xl dark:bg-[#0b1016] bg-white border dark:border-[#00b8ff]/50 border-slate-300 rounded-xl p-6 shadow-2xl text-left transition-colors">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 dark:text-zinc-400 text-slate-500 hover:text-slate-900 dark:hover:text-white p-1 rounded-lg dark:hover:bg-zinc-800 hover:bg-slate-100 transition-colors"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 dark:text-[#00ff41] text-emerald-700 font-bold text-xs uppercase tracking-widest mb-1">
              <Sparkles className="w-4 h-4" />
              Active Laboratory Research Initiative
            </div>

            <h3 className="font-section-title text-xl sm:text-2xl dark:text-white text-slate-900 font-bold mb-4 uppercase tracking-wide">
              Advanced Liquid Crystal Elastomers (LCE) via Neural-Network Inverse Design
            </h3>

            <div className="space-y-4 dark:text-zinc-300 text-slate-700 text-sm leading-relaxed font-mono">
              <p>
                This project focuses on the generative inverse design and structural optimization of
                <strong className="dark:text-[#00b8ff] text-sky-700"> Liquid Crystal Elastomers (LCE)</strong> and metamaterial lattice configurations. By combining physics-informed machine learning (PINN) architectures with nonlinear finite element analysis (FEA) in Abaqus, we simulate large-deformation morphing behavior and dynamic shock attenuation.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3 dark:bg-[#05080c] bg-slate-50 border dark:border-zinc-800 border-slate-200 rounded-lg">
                  <div className="flex items-center gap-2 dark:text-[#00b8ff] text-sky-700 font-bold text-xs mb-1">
                    <Cpu className="w-4 h-4" /> Computational Core
                  </div>
                  <p className="text-xs dark:text-zinc-400 text-slate-600">
                    Custom Abaqus Fortran UMAT subroutines coupled with PyTorch surrogate models for millisecond inference of viscoelastic response.
                  </p>
                </div>

                <div className="p-3 dark:bg-[#05080c] bg-slate-50 border dark:border-zinc-800 border-slate-200 rounded-lg">
                  <div className="flex items-center gap-2 dark:text-[#00ff41] text-emerald-700 font-bold text-xs mb-1">
                    <Atom className="w-4 h-4" /> Metamaterial Synthesis
                  </div>
                  <p className="text-xs dark:text-zinc-400 text-slate-600">
                    High-resolution additive manufacturing and multi-rate mechanical impact testing for validation against dynamic Hopkinson pressure bar benchmarks.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3 pt-4 border-t dark:border-zinc-800 border-slate-200">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 dark:bg-zinc-800 bg-slate-200 hover:bg-slate-300 dark:hover:bg-zinc-700 dark:text-zinc-200 text-slate-800 text-xs uppercase font-bold rounded transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
