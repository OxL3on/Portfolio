'use client';

import React from 'react';
import { useSharedData } from '@/hooks/useSharedData';

const Banner = () => {
  const { data: mainInfo } = useSharedData('mainInfo', async () => {
    const res = await fetch('/api/maininfo');
    return res.json();
  });

  const coverUrl = mainInfo?.coverImage || "/china-mountains.jpg";

  return (
    <section className="w-full relative h-[280px] sm:h-[380px] md:h-[480px] lg:h-[550px] overflow-hidden bg-black">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={coverUrl}
        alt="Cover Photo"
        className="absolute inset-0 w-full h-full object-cover object-center z-0 transition-opacity duration-500"
      />

      <div className="absolute inset-0 bg-black/20 dark:bg-black/40 z-10 transition-colors duration-300"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10"></div>

      <div className="relative z-30 h-full flex items-center justify-center"></div>
    </section>
  );
};

export default Banner;
