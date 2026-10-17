"use client";
import PageLoader from "@/components/shared/PageLoader";
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { useSharedData } from '@/hooks/useSharedData';

const Intro = () => {
  const { data: mainInfo, isLoading } = useSharedData('mainInfo', async () => {
    const res = await fetch('/api/maininfo');
    return res.json();
  });

  if (isLoading) { return <div className="flex justify-center items-center py-10 w-full bg-card/90 backdrop-blur-md rounded-3xl border border-gray-800 shadow-lg min-h-[400px]"><PageLoader /></div>; }

  // Helper arrays for dynamic titles based on user preferences in future
  const defaultTitles = [
    "Penetration Tester",
    "CTF Player",
    "Network Security",
    "Bug Bounty Hunter",
    "Offensive Security Enthusiast"
  ];

  return (
    <section className="bg-card/90 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-gray-800 shadow-2xl transition-colors duration-300">
      <span className="text-primary text-xs font-bold uppercase tracking-widest">
        {mainInfo?.tagline || "CYBERSECURITY & OFFENSIVE SECURITY ENTHUSIAST"}
      </span>

      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mt-3 sm:mt-4">
        {mainInfo?.greeting || `Hi, I'm ${mainInfo?.name || "MD Leon Islam"}.`}
      </h1>

      <p className="text-gray-400 mt-6 leading-relaxed whitespace-pre-line">
        {mainInfo?.description || "I'm Md Leon Islam, a Computer Science and Engineering student at Patuakhali Science and Technology University (PSTU) (currently in my 5th semester), passionate about cybersecurity, penetration testing, and offensive security. My interests include web application security, network security, vulnerability assessment, and bug bounty hunting."}
      </p>

      <div className="flex flex-wrap gap-3 mt-6">
        {(mainInfo?.roles && mainInfo.roles.length > 0 ? mainInfo.roles : defaultTitles).map((title, idx) => (
          <span key={idx} className="px-3 py-1 bg-background text-gray-400 text-xs rounded-lg border border-gray-700">
            {title}
          </span>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-6 mt-10">
        <Link href={'/projects'}>
          <button className="bg-primary text-white px-6 py-2.5 rounded-xl font-medium hover:opacity-90 transition shadow-lg">
            View Projects
          </button>
        </Link>
        <Link href={'/about'}>
          <button className="text-gray-400 font-medium hover:text-primary transition">
            About Me
          </button>
        </Link>
        <Link href={'/contact'}>
          <button className="text-gray-400 font-medium hover:text-primary transition">
            Get in Touch
          </button>
        </Link>
      </div>
    </section>
  );
};

export default Intro;
