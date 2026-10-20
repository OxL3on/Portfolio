'use client';
import PageLoader from "@/components/shared/PageLoader";
import React from 'react';
import { useSharedData } from '@/hooks/useSharedData';
import Link from 'next/link';

const Achievement = () => {
    const { data: fullachievements, isLoading } = useSharedData('achievementData', async () => {
    const res = await fetch('/api/achievements');
    return await res.json();
  });
  
  const defaultAchievements = [
    {
      title: "National Cyber Drill 2024",
      type: "CTF / Cyber Drill",
      date: "Dec 2024",
      rank: "Top 10",
      result: "Finalist",
      description: "Participated in national level cyber defense drill testing vulnerability assessment, incident response, and forensic capabilities."
    },
    {
      title: "PSTU Intra University CTF",
      type: "Jeopardy CTF",
      date: "Oct 2024",
      rank: "1st Place",
      result: "Champion",
      description: "Secured 1st position solving web exploitation, reverse engineering, cryptography, and network forensics challenges."
    }
  ];
  
  const featuredAchievements = (fullachievements || []).filter(a => a.featured === true || a.isFeatured === true);
  const achievementsData = (featuredAchievements.length > 0)
    ? featuredAchievements.slice(0, 2)
    : ((fullachievements && fullachievements.length > 0) ? fullachievements.slice(0, 2) : defaultAchievements);

  return (
    <section className="bg-card/90 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-gray-800 shadow-2xl">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <span className="text-primary text-[10px] font-bold uppercase tracking-[0.2em]">
            Achievements
          </span>
          <h2 className="text-2xl font-bold text-foreground mt-1">
            Recent Competition Highlights
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            A few highlights from recent competitions. The rest lives in the
            full archive.
          </p>
        </div>
        <Link
          href="/achievements"
          className="text-gray-400 hover:text-primary text-xs font-semibold transition-colors shrink-0"
        >
          View all achievements →
        </Link>
      </div>

      {!isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
          {achievementsData.map((item, index) => (
            <div
              key={index}
              className="bg-background/50 border border-gray-800 p-5 rounded-2xl hover:border-primary/30 transition-all group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="space-y-1">
                  <span className="text-[10px] text-primary/80 font-bold border-b border-primary/30 pb-0.5">
                    {item.type}
                  </span>
                  <p className="text-[11px] text-gray-500 font-medium">
                    {item.date}
                  </p>
                </div>
                <div className="bg-primary/10 px-3 py-1 rounded-lg text-center">
                  <p className="text-primary font-bold text-sm leading-none">
                    {item.rank}
                  </p>
                  <p className="text-[8px] text-primary/60 uppercase font-bold tracking-tighter">
                    Rank
                  </p>
                </div>
              </div>

              <h3 className="text-lg font-bold text-gray-200 mb-2 group-hover:text-foreground transition-colors">
                {item.title}
              </h3>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default Achievement;
