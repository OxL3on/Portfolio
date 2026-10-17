'use client';
import Image from 'next/image';
import React, { useState, useEffect } from 'react';

const Visitors = () => {
  const [mounted, setMounted] = useState(false);
  const githubUsername = 'OxL3on'; 

  useEffect(() => {
    setMounted(true);
  }, []);

  const counterUrl = `https://count.getloli.com/get/@${githubUsername}?theme=moebooru`;

  return (
    <div className="bg-card/90 backdrop-blur-md p-6 rounded-3xl border border-gray-800 transition-all duration-300 shadow-xl overflow-hidden group hover:border-primary/30">
      <h4 className="text-foreground font-bold mb-5 flex items-center gap-2">
        <span className="w-1 h-4 bg-primary rounded-full"></span>
        <span className="tracking-wide text-sm">Visitors</span>
      </h4>

      <div className="flex justify-center items-center h-28 bg-background/50 rounded-2xl border border-gray-800/60 overflow-hidden relative group-hover:border-primary/20 transition-all">
        {mounted ? (
          <div className="relative w-full h-full flex justify-center items-center">
            <Image
              src={counterUrl}
              alt="Dynamic Visitor Counter"
              fill 
              className="object-contain transition-all duration-500 scale-[0.9] md:scale-[1] filter drop-shadow-[0_0_10px_rgba(var(--primary-rgb),0.3)]"
              unoptimized={true}
            />
          </div>
        ) : (
          <div className="h-10 flex gap-1 items-center">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="w-6 h-10 bg-gray-800/50 animate-pulse rounded"
              ></div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default Visitors;
