'use client';

import React from 'react';
import { ChevronUp } from 'lucide-react';

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="w-full mt-20 pb-10 relative">
      <div className="max-w-5xl mx-auto px-4 border-t border-black/5 dark:border-white/5 pt-10 text-center">
        <div className="flex flex-col items-center gap-3">
          <div className="text-[13px] text-gray-500 font-medium">
            <p>© 2026 MD Leon Islam. All Rights Reserved.</p>
          </div>

          {/* Credits
          <div className="text-[12px] text-gray-600 dark:text-gray-500">
            <span>Powered by </span>
            <span className="text-primary hover:underline cursor-pointer font-medium">
              Next.js
            </span>
            <span className="mx-1">&</span>
            <span className="text-primary hover:underline cursor-pointer font-medium">
              Fuwari
            </span>
          </div> */}
        </div>

        {/* Scroll to Top Button */}
        <button
          onClick={scrollToTop}
          className="absolute right-6 bottom-10 bg-card p-2.5 rounded-xl border border-black/10 dark:border-white/10 shadow-lg text-primary hover:scale-110 active:scale-95 transition-all duration-300"
          title="Scroll to Top"
        >
          <ChevronUp size={20} />
        </button>
      </div>
    </footer>
  );
};

export default Footer;
