"use client";
import React, { useState, useEffect } from 'react';
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
  Layers,
  Terminal,
  Server,
  Cpu,
  Globe,
  Tag,
  Hash
} from 'lucide-react';

const DEFAULT_CATEGORIES = [
  'TryHackMe',
  'Hack The Box',
  'CTF Writeups',
  'Security Research',
  'VulnHub',
  'Root me'
];

const DYNAMIC_PALETTES = [
  { color: 'text-violet-400', bgColor: 'bg-violet-500/10', borderColor: 'border-violet-500/20', icon: Terminal },
  { color: 'text-cyan-400', bgColor: 'bg-cyan-500/10', borderColor: 'border-cyan-500/20', icon: Server },
  { color: 'text-pink-400', bgColor: 'bg-pink-500/10', borderColor: 'border-pink-500/20', icon: Cpu },
  { color: 'text-teal-400', bgColor: 'bg-teal-500/10', borderColor: 'border-teal-500/20', icon: Globe },
  { color: 'text-amber-400', bgColor: 'bg-amber-500/10', borderColor: 'border-amber-500/20', icon: Flag },
  { color: 'text-rose-400', bgColor: 'bg-rose-500/10', borderColor: 'border-rose-500/20', icon: Shield },
  { color: 'text-lime-400', bgColor: 'bg-lime-500/10', borderColor: 'border-lime-500/20', icon: Hash }
];

const getCategoryMeta = (categoryId) => {
  const key = (categoryId || '').toLowerCase().trim();

  if (key.includes('tryhackme') || key === 'thm') {
    return {
      id: categoryId,
      name: 'TryHackMe Writeups',
      shortName: 'TryHackMe',
      description: 'Practical room walkthroughs, privilege escalation techniques, and Active Directory exploitation on TryHackMe.',
      icon: Flame,
      color: 'text-red-400',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/20'
    };
  }

  if (key.includes('hack the box') || key === 'htb') {
    return {
      id: categoryId,
      name: 'Hack The Box Machines',
      shortName: 'Hack The Box',
      description: 'Detailed box writeups spanning Linux & Windows targets, SSRF chaining, binary exploitation, and root escalations.',
      icon: Box,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/20'
    };
  }

  if (key.includes('ctf')) {
    return {
      id: categoryId,
      name: 'CTF Challenges & Events',
      shortName: 'CTF Writeups',
      description: 'Competition writeups from PicoCTF, Cyber Apocalypse, KnightCTF covering binary exploitation, web, and network forensics.',
      icon: Flag,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/20'
    };
  }

  if (key.includes('research') || key.includes('security')) {
    return {
      id: categoryId,
      name: 'Technical & Security Research',
      shortName: 'Security Research',
      description: 'In-depth security analysis of vulnerabilities, SQL injection mechanics, JWT flaws, and OSINT methodology.',
      icon: Shield,
      color: 'text-indigo-400',
      bgColor: 'bg-indigo-500/10',
      borderColor: 'border-indigo-500/20'
    };
  }

  if (key.includes('vulnhub')) {
    return {
      id: categoryId,
      name: 'VulnHub Machines & Labs',
      shortName: 'VulnHub',
      description: 'Boot2Root vulnerable VM walkthroughs, network service exploitation, and privilege escalation techniques.',
      icon: Server,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10',
      borderColor: 'border-cyan-500/20'
    };
  }

  if (key.includes('root') && (key.includes('me') || key.includes('-me'))) {
    return {
      id: categoryId,
      name: 'Root-Me Challenges & CTF',
      shortName: 'Root me',
      description: 'Offensive cybersecurity challenge solutions spanning web client, server-side, cryptanalysis, and forensic challenges.',
      icon: Terminal,
      color: 'text-pink-400',
      bgColor: 'bg-pink-500/10',
      borderColor: 'border-pink-500/20'
    };
  }

  // Dynamic palette for any custom user-added category
  let hash = 0;
  for (let i = 0; i < categoryId.length; i++) {
    hash = categoryId.charCodeAt(i) + ((hash << 5) - hash);
  }
  const palette = DYNAMIC_PALETTES[Math.abs(hash) % DYNAMIC_PALETTES.length];

  return {
    id: categoryId,
    name: `${categoryId} Documentation`,
    shortName: categoryId,
    description: `Tactical walkthroughs, challenge solutions, and technical security analysis for ${categoryId}.`,
    icon: palette.icon || Tag,
    color: palette.color,
    bgColor: palette.bgColor,
    borderColor: palette.borderColor
  };
};

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
  const cat = post.category || post.platform || 'Writeup';

  return (
    <article className="bg-background/40 backdrop-blur-sm border border-gray-800/80 p-5 md:p-6 rounded-2xl hover:border-primary/40 hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300 group flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-0.5 rounded-md border border-primary/20">
            {cat}
          </span>
          {post.difficulty && (
            <span className="text-[10px] font-mono text-gray-400 bg-gray-900 px-2 py-0.5 rounded border border-gray-800">
              {post.difficulty}
            </span>
          )}
        </div>
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
  const [categoriesList, setCategoriesList] = useState(DEFAULT_CATEGORIES);

  const { data: blogsData, isLoading } = useSharedData('blogsData', async () => {
    const res = await fetch('/api/blogs');
    return await res.json();
  });

  const blogs = (blogsData && blogsData.length > 0) ? blogsData : [];

  // Fetch configured categories from backend API
  useEffect(() => {
    fetch('/api/blog-categories')
      .then(res => res.json())
      .then(cats => {
        if (Array.isArray(cats) && cats.length > 0) {
          setCategoriesList(cats);
        } else {
          setCategoriesList(DEFAULT_CATEGORIES);
        }
      })
      .catch(() => {
        setCategoriesList(DEFAULT_CATEGORIES);
      });
  }, []);

  // Grouping helper matching blogs to a specific category
  const getBlogsForCategory = (categoryId) => {
    const target = (categoryId || '').toLowerCase().trim();
    return blogs.filter(b => {
      const p = (b.category || b.platform || '').toLowerCase().trim();
      if (!p) return false;
      if (p === target) return true;
      if (target.includes('tryhackme') && p.includes('tryhackme')) return true;
      if ((target.includes('hack the box') || target === 'htb') && (p.includes('hack the box') || p === 'htb')) return true;
      if (target.includes('ctf') && p.includes('ctf')) return true;
      if (target.includes('research') && (p.includes('research') || p.includes('security'))) return true;
      if (target.includes('vulnhub') && p.includes('vulnhub')) return true;
      if (target.includes('root') && target.includes('me') && p.includes('root') && p.includes('me')) return true;
      return p.includes(target) || target.includes(p);
    });
  };

  // Filtered by search
  const filterBySearch = (list) => {
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter(b => 
      b.title.toLowerCase().includes(q) ||
      (b.category && b.category.toLowerCase().includes(q)) ||
      (b.platform && b.platform.toLowerCase().includes(q)) ||
      (b.content && b.content.toLowerCase().includes(q))
    );
  };

  // Convert categories list to dynamic platform configs
  const platformConfigs = categoriesList.map(cat => getCategoryMeta(cat));

  // Determine which sections to render
  const visibleConfigs = platformConfigs.filter(platform => {
    if (selectedPlatform !== 'all' && selectedPlatform !== platform.id) {
      return false;
    }
    // If viewing all and user is searching, hide sections with 0 search matches
    if (search.trim()) {
      const matched = filterBySearch(getBlogsForCategory(platform.id));
      return matched.length > 0;
    }
    // If viewing all without search, only show categories that have writeups or if explicitly selected
    if (selectedPlatform === 'all') {
      return getBlogsForCategory(platform.id).length > 0;
    }
    return true;
  });

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
              Documented walkthroughs, vulnerable machine exploits, and attack vectors categorized across offensive platforms and technical research.
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

          {platformConfigs.map((platform) => {
            const Icon = platform.icon || Tag;
            const isSelected = selectedPlatform === platform.id;
            const count = getBlogsForCategory(platform.id).length;

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
                {count > 0 && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-background/80 text-gray-400 font-mono">
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex justify-center items-center py-24">
            <PageLoader />
          </div>
        ) : visibleConfigs.length > 0 ? (
          <div className="space-y-12">
            {visibleConfigs.map((platform) => {
              const Icon = platform.icon || Tag;
              const platformBlogs = filterBySearch(getBlogsForCategory(platform.id));

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
                        <BlogCard key={post.slug || idx} post={post} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10 border border-dashed border-gray-800/80 rounded-2xl">
                      <p className="text-gray-500 text-xs">No writeups in this section yet.</p>
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 border border-dashed border-gray-800/80 rounded-3xl">
            <p className="text-gray-400 text-sm">No writeups found matching your query.</p>
            <button
              onClick={() => { setSearch(''); setSelectedPlatform('all'); }}
              className="mt-4 px-4 py-2 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 rounded-xl text-xs font-bold transition-colors"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
