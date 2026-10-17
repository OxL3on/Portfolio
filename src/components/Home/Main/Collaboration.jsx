'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

const Collaboration = () => {
  const [githubLink, setGithubLink] = useState('https://github.com/OxL3on');

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = await fetch('/api/contact');
        if (response.ok) {
          const data = await response.json();
          const gh = data.find(item => item.name?.toLowerCase().includes('github'));
          if (gh && gh.link) {
            setGithubLink(gh.link);
          }
        }
      } catch (error) {
        console.error("Failed to fetch contact links:", error);
      }
    };
    fetchContacts();
  }, []);

  return (
    <div className="mt-8 space-y-8">
      <section className="bg-card/90 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-gray-800 shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 transition-all duration-300">
        <div>
          <span className="text-primary text-[10px] font-bold uppercase tracking-[0.2em]">
            COLLABORATION
          </span>
          <h2 className="text-2xl font-bold text-foreground mt-1">
            Let's build something meaningful.
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            I'm always interested in learning, collaborating on technical projects, and exploring cybersecurity.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/contact" className="bg-primary/10 hover:bg-primary/20 text-primary px-6 py-2 rounded-xl text-sm font-bold border border-primary/20 transition-transform hover:-translate-y-0.5 inline-block text-center flex items-center justify-center">
            Contact
          </Link>
          <a href={githubLink} target="_blank" rel="noopener noreferrer" className="bg-gray-800/50 hover:bg-gray-700 text-gray-300 px-6 py-2 rounded-xl text-sm font-bold border border-gray-700 transition-transform hover:-translate-y-0.5 inline-block text-center flex items-center justify-center">
            GitHub
          </a>
        </div>
      </section>
    </div>
  );
};

export default Collaboration;