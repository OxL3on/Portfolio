"use client";
import React, { useState } from 'react';
import PageLoader from '@/components/shared/PageLoader';
import { useSharedData } from '@/hooks/useSharedData';
import { ChevronLeft, ChevronRight, Medal, Star, Shield } from 'lucide-react';

const itemsPerPage = 6;

const AchievementCard = ({ item }) => (
  <div className="bg-background/40 backdrop-blur-sm border border-gray-800 p-6 rounded-2xl hover:border-primary/40 hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 group flex flex-col h-full">
    <div className="flex justify-between items-start mb-6">
      <div className="space-y-2">
        <span className="inline-block text-[11px] px-2 py-1 bg-primary/10 text-primary font-bold rounded-md tracking-wider uppercase">
          {item.type}
        </span>
        <p className="text-xs text-gray-500 font-medium flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-gray-600"></span> {item.date}
        </p>
      </div>
      <div className="bg-linear-to-br from-primary/20 to-primary/5 border border-primary/20 px-4 py-2 rounded-xl text-center shadow-lg transform group-hover:scale-110 transition-transform duration-300">
        <p className="text-primary font-black text-xl leading-none">
          {item.rank}
        </p>
        <p className="text-[9px] text-primary/70 uppercase font-black tracking-widest mt-1">
          Rank
        </p>
      </div>
    </div>

    <h3 className="text-xl font-bold text-gray-100 group-hover:text-primary transition-colors line-clamp-2">
      {item.title}
    </h3>
  </div>
);

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
  },
  {
    title: "Hack The Box University CTF",
    type: "Global CTF",
    date: "2024",
    rank: "Top 5%",
    result: "Qualified",
    description: "Competed globally against collegiate cybersecurity teams solving complex offensive security challenges."
  },
  {
    title: "Inter-University Cyber Security Hackathon",
    type: "Hackathon",
    date: "2023",
    rank: "Top 15",
    result: "Special Mention",
    description: "Developed and presented an automated web application vulnerability scanning tool."
  }
];

const AllAchievements = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const { data: achievementsData, isLoading } = useSharedData('achievementData', async () => {
    const res = await fetch('/api/achievements');
    return await res.json();
  });
  const achievements = (achievementsData && achievementsData.length > 0) ? achievementsData : defaultAchievements;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = achievements.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(achievements.length / itemsPerPage);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 relative z-10 -mt-20 lg:-mt-24">
      <div className="bg-card/90 backdrop-blur-md border border-gray-800 rounded-3xl p-8 md:p-12 mb-8 shadow-2xl w-full">
        <div className="mb-12">
          <span className="text-primary text-xs font-bold uppercase tracking-widest flex items-center gap-2">
            <Medal size={16} /> Honors & Awards
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-foreground mt-4 mb-6 tracking-tight">
            All Achievements
          </h1>
          <p className="text-gray-400 text-base md:text-lg max-w-3xl leading-relaxed">
            A comprehensive archive of my accomplishments in{' '}
            <span className="text-foreground font-semibold">Competitive Programming</span>,
            hackathons, and other technical competitions. Showcasing my dedication to 
            problem-solving and continuous learning.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20 w-full"><PageLoader /></div>
        ) : (
          <>
            {/* Achievement Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {currentItems.map((item, i) => (
                <AchievementCard key={i} item={item} />
                ))}
            </div>

            {achievements.length > itemsPerPage && (
                <div className="mt-14 flex justify-center items-center gap-4">
                <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2.5 rounded-xl border border-gray-800 text-gray-400 hover:border-primary hover:text-primary disabled:opacity-30 disabled:hover:text-gray-400 transition-all"
                >
                    <ChevronLeft size={20} />
                </button>

                <div className="flex gap-2">
                    {[...Array(totalPages)].map((_, i) => (
                    <button
                        key={i}
                        onClick={() => paginate(i + 1)}
                        className={`w-11 h-11 rounded-xl border font-bold transition-all ${
                        currentPage === i + 1
                            ? 'bg-primary border-primary text-white shadow-[0_0_15px_rgba(var(--primary-color),0.4)] scale-110'
                            : 'border-gray-800 text-gray-400 hover:border-gray-600 hover:text-gray-200'
                        }`}
                    >
                        {i + 1}
                    </button>
                    ))}
                </div>

                <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2.5 rounded-xl border border-gray-800 text-gray-400 hover:border-primary hover:text-primary disabled:opacity-30 transition-all"
                >
                    <ChevronRight size={20} />
                </button>
                </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AllAchievements;
