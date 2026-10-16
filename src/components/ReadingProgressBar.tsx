import React, { useEffect, useState } from 'react';

export const ReadingProgressBar: React.FC = () => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
          if (totalHeight > 100) {
            const currentScroll = window.scrollY;
            const progress = Math.min(Math.max((currentScroll / totalHeight) * 100, 0), 100);
            setScrollProgress(progress);
            setIsVisible(currentScroll > 10);
          } else {
            setScrollProgress(0);
            setIsVisible(false);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  if (!isVisible && scrollProgress === 0) {
    return null;
  }

  return (
    <div
      role="progressbar"
      aria-label="Reading progress"
      aria-valuenow={Math.round(scrollProgress)}
      aria-valuemin={0}
      aria-valuemax={100}
      className="fixed top-0 left-0 right-0 h-[3px] sm:h-[4px] z-[100] bg-transparent pointer-events-none transition-opacity duration-300"
    >
      {/* Background track */}
      <div className="absolute inset-0 dark:bg-zinc-900/30 bg-slate-200/40 backdrop-blur-xs" />

      {/* Progress fill */}
      <div
        className="h-full relative transition-[width] duration-75 ease-out dark:bg-gradient-to-r dark:from-[#00b8ff] dark:via-[#00e676] dark:to-[#00ff41] bg-gradient-to-r from-sky-600 via-teal-600 to-emerald-600 dark:shadow-[0_0_10px_rgba(0,255,65,0.7)] shadow-sm"
        style={{ width: `${scrollProgress}%` }}
      >
        {/* Glow bead at the leading edge */}
        {scrollProgress > 0 && scrollProgress < 100 && (
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full dark:bg-white bg-sky-200 dark:shadow-[0_0_8px_#00ff41] shadow-xs translate-x-1/2" />
        )}
      </div>
    </div>
  );
};
