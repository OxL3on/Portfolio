"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import PageLoader from '@/components/shared/PageLoader';
import { useSharedData } from '@/hooks/useSharedData';
import { 
  BookOpen, 
  Flame, 
  Box, 
  Flag, 
  Shield, 
  Search, 
  ArrowRight, 
  ExternalLink,
  ChevronRight,
  Layers
} from 'lucide-react';

const PLATFORM_CONFIG = [
  { 
    id: 'TryHackMe', 
    name: 'TryHackMe Writeups', 
    shortName: 'TryHackMe',
    description: 'Practical room walkthroughs, privilege escalation techniques, and Active Directory exploitation on TryHackMe.',
    icon: Flame, 
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/20'
  },
  { 
    id: 'Hack The Box', 
    name: 'Hack The Box Machines', 
    shortName: 'Hack The Box',
    description: 'Detailed box writeups spanning Linux & Windows targets, SSRF chaining, binary exploitation, and root escalations.',
    icon: Box, 
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/20'
  },
  { 
    id: 'CTF Writeups', 
    name: 'CTF Challenges & Events', 
    shortName: 'CTF Writeups',
    description: 'Competition writeups from PicoCTF, Cyber Apocalypse, KnightCTF covering binary exploitation, web, and network forensics.',
    icon: Flag, 
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/20'
  },
  { 
    id: 'Security Research', 
    name: 'Technical & Security Research', 
    shortName: 'Security Research',
    description: 'In-depth security analysis of vulnerabilities, SQL injection mechanics, JWT flaws, and OSINT methodology.',
    icon: Shield, 
    color: 'text-indigo-400',
    bgColor: 'bg-indigo-500/10',
    borderColor: 'border-indigo-500/20'
  }
];

const formatExternalUrl = (url) => {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
};

const BlogCard = ({ post }) => {
  const githubUrl = formatExternalUrl(post.github);
  const mediumUrl = formatExternalUrl(post.medium);

  return (
    <article className="bg-background/40 backdrop-blur-sm border border-gray-800/80 p-5 md:p-6 rounded-2xl hover:border-primary/40 hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300 group flex flex-col justify-between h-full">
      <div>
        <h3 className="text-base sm:text-lg font-bold text-gray-100 group-hover:text-primary transition-colors leading-snug line-clamp-2">
          {post.title}
        </h3>
      </div>

      <div className="pt-4 border-t border-gray-800/60 mt-4 space-y-2.5">
        <div className="text-xs text-gray-400 font-medium">
          {post.author || "MD Leon Islam"} • {post.date} • {post.readTime}
        </div>

        <div className="flex items-center gap-3 text-xs pt-1 flex-wrap">
          <Link
            href={`/blog/${post.slug || 'sql-injection-modern-web-apps'}`}
            className="text-primary hover:underline font-semibold flex items-center gap-1"
          >
            Read Here <ArrowRight size={12} />
          </Link>
          {githubUrl && (
            <>
              <span className="text-gray-700">•</span>
              <a
                href={githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-foreground font-semibold transition-colors"
              >
                GitHub
              </a>
            </>
          )}
          {mediumUrl && (
            <>
              <span className="text-gray-700">•</span>
              <a
                href={mediumUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-foreground font-semibold transition-colors"
              >
                Medium
              </a>
            </>
          )}
        </div>
      </div>
    </article>
  );
};

export default function BlogPage() {
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [search, setSearch] = useState('');

  const { data: blogsData, isLoading } = useSharedData('blogsData', async () => {
    const res = await fetch('/api/blogs');
    return await res.json();
  });

  const blogs = (blogsData && blogsData.length > 0) ? blogsData : [];

  // Grouping helper
  const getBlogsForPlatform = (platformId) => {
    return blogs.filter(b => {
      const p = b.category || b.platform || '';
      return p.toLowerCase().includes(platformId.toLowerCase()) || 
             (platformId === 'TryHackMe' && p.toLowerCase().includes('tryhackme')) ||
             (platformId === 'Hack The Box' && (p.toLowerCase().includes('hack the box') || p.toLowerCase().includes('htb'))) ||
             (platformId === 'CTF Writeups' && p.toLowerCase().includes('ctf')) ||
             (platformId === 'Security Research' && (p.toLowerCase().includes('research') || p.toLowerCase().includes('security') || p.toLowerCase().includes('web')));
    });
  };

  // Filtered by search
  const filterBySearch = (list) => {
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter(b => 
      b.title.toLowerCase().includes(q) ||
      (b.category && b.category.toLowerCase().includes(q)) ||
      (b.platform && b.platform.toLowerCase().includes(q))
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 relative z-10 -mt-20 lg:-mt-24">
      <div className="bg-card/90 backdrop-blur-md border border-gray-800 rounded-3xl p-6 sm:p-10 md:p-12 mb-8 shadow-2xl w-full">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 pb-6 border-b border-gray-800/60">
          <div>
            <span className="text-primary text-xs font-bold uppercase tracking-widest flex items-center gap-2">
              <BookOpen size={16} /> Security Archives &amp; Documentation
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-foreground mt-3 mb-3 tracking-tight">
              Security Writeups
            </h1>
            <p className="text-gray-400 text-sm sm:text-base max-w-2xl leading-relaxed">
              Documented walkthroughs and attack vectors categorized across TryHackMe, Hack The Box, CTF challenges, and offensive security research.
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search writeups..."
              className="w-full bg-background/60 border border-gray-700/60 rounded-xl pl-11 pr-4 py-2.5 text-xs sm:text-sm text-foreground focus:outline-none focus:border-primary transition-all"
            />
          </div>
        </div>

        {/* Platform Selector Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-10 pb-4 border-b border-gray-800/40">
          <button
            onClick={() => setSelectedPlatform('all')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              selectedPlatform === 'all'
                ? 'bg-primary text-white shadow-lg shadow-primary/20 border border-primary'
                : 'bg-background/60 text-gray-400 hover:text-foreground border border-gray-800 hover:border-gray-700'
            }`}
          >
            <Layers size={14} />
            <span>All Sections</span>
          </button>

          {PLATFORM_CONFIG.map((platform) => {
            const Icon = platform.icon;
            const isSelected = selectedPlatform === platform.id;

            return (
              <button
                key={platform.id}
                onClick={() => setSelectedPlatform(platform.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  isSelected
                    ? `${platform.bgColor} ${platform.color} border ${platform.borderColor} shadow-lg`
                    : 'bg-background/60 text-gray-400 hover:text-foreground border border-gray-800 hover:border-gray-700'
                }`}
              >
                <Icon size={14} className={platform.color} />
                <span>{platform.shortName}</span>
              </button>
            );
          })}
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex justify-center items-center py-24">
            <PageLoader />
          </div>
        ) : (
          <div className="space-y-12">
            {PLATFORM_CONFIG.filter(
              platform => selectedPlatform === 'all' || selectedPlatform === platform.id
            ).map((platform) => {
              const Icon = platform.icon;
              const platformBlogs = filterBySearch(getBlogsForPlatform(platform.id));

              if (platformBlogs.length === 0 && search) return null;

              return (
                <section
                  key={platform.id}
                  id={platform.id}
                  className="bg-background/20 border border-gray-800/60 rounded-3xl p-6 sm:p-8 transition-all"
                >
                  {/* Section Title Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-gray-800/60">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl ${platform.bgColor} ${platform.color} border ${platform.borderColor}`}>
                        <Icon size={20} />
                      </div>
                      <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                          {platform.name}
                        </h2>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {platform.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Grid of Writeups in this platform section */}
                  {platformBlogs.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                      {platformBlogs.map((post, idx) => (
                        <BlogCard key={idx} post={post} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10 border border-dashed border-gray-800/80 rounded-2xl">
                      <p className="text-gray-500 text-xs">No writeups in this section matching your search.</p>
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
