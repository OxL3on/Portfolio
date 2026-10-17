"use client";
import React from 'react';
import Link from 'next/link';
import { useSharedData } from '@/hooks/useSharedData';
import { BookOpen, Calendar, Clock, ArrowRight } from 'lucide-react';

const defaultBlogs = [
  {
    slug: "sql-injection-modern-web-apps",
    title: "Deep Dive into Modern SQL Injection and Defense Mechanisms",
    excerpt: "Exploring blind, error-based, and second-order SQL injection vectors in modern microservices architectures.",
    category: "Web Security",
    date: "Oct 2024",
    readTime: "7 min read"
  },
  {
    slug: "linux-privilege-escalation-techniques",
    title: "Essential Linux Privilege Escalation Techniques for CTF & Pentesting",
    excerpt: "A tactical walkthrough of SUID binaries, cron jobs, and sudo misconfigurations in offensive security.",
    category: "Offensive Security",
    date: "Sep 2024",
    readTime: "10 min read"
  }
];

const Blog = () => {
  const { data: blogsData, isLoading } = useSharedData('blogsData', async () => {
    const res = await fetch('/api/blogs');
    return await res.json();
  });

  const blogs = (blogsData && blogsData.length > 0) ? blogsData.slice(0, 2) : defaultBlogs;

  return (
    <section className="bg-card/90 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-gray-800 shadow-2xl transition-all duration-300">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <span className="text-primary text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-1.5">
            <BookOpen size={13} /> Blog & Articles
          </span>
          <h2 className="text-2xl font-bold text-foreground mt-1">
            Latest Writeups
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Notes, tutorials, and security writeups from my technical journey.
          </p>
        </div>
        <Link
          href="/blog"
          className="text-gray-400 hover:text-primary text-xs font-semibold transition-colors shrink-0"
        >
          View all blogs →
        </Link>
      </div>

      {!isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {blogs.map((post, index) => (
            <div
              key={index}
              className="p-5 bg-background/50 border border-gray-800/60 rounded-2xl hover:border-primary/30 transition-all flex flex-col justify-between group"
            >
              <div>
                <h3 className="font-bold text-gray-200 text-base leading-snug group-hover:text-primary transition-colors">
                  {post.title}
                </h3>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-800/50 space-y-2">
                <div className="text-[11px] text-gray-400">
                  {post.author || "MD Leon Islam"} • {post.date} • {post.readTime}
                </div>
                <div className="flex items-center gap-3 text-xs pt-1">
                  <Link
                    href={`/blog/${post.slug || 'sql-injection-modern-web-apps'}`}
                    className="text-primary hover:underline font-semibold flex items-center gap-1"
                  >
                    Read Here <ArrowRight size={11} />
                  </Link>
                  <span className="text-gray-700">•</span>
                  <a
                    href={post.github || "https://github.com/OxL3on"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-foreground font-semibold transition-colors"
                  >
                    Github
                  </a>
                  <span className="text-gray-700">•</span>
                  <a
                    href={post.medium || "https://medium.com/@OxL3on"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-foreground font-semibold transition-colors"
                  >
                    Medium
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default Blog;
