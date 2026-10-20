'use client';
import PageLoader from "@/components/shared/PageLoader";

import React, { useEffect, useState } from 'react';
import { useSharedData } from '@/hooks/useSharedData';
import {
  Github,
  Code2,
  Cpu,
  Globe,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const ProjectCard = ({ project }) => (
  <div className="group relative bg-background/40 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 hover:border-primary/40 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full justify-between">
    <div>
      <div className="flex justify-between items-center mb-4">
        <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-2.5 py-1 rounded-md border border-primary/20">
          {project.type}
        </span>
        <span className="text-[10px] font-mono text-gray-500">
          {project.date || project.Date || project.year}
        </span>
      </div>

      <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors leading-tight">
        {project.title}
      </h3>
      <p className="text-sm text-gray-400 leading-relaxed line-clamp-4">
        {project.description}
      </p>
    </div>

    <div className="pt-5 border-t border-gray-800/60 mt-6 flex items-center justify-between gap-3">
      <div className="flex flex-wrap gap-2">
        {(project.tags || project.tech || []).map((t, idx) => (
          <span
            key={idx}
            className="text-[10px] font-bold text-gray-400 bg-gray-900/80 px-2.5 py-1 rounded-md border border-gray-800"
          >
            {t}
          </span>
        ))}
      </div>
      <div className="flex items-center gap-3 shrink-0">
        {project.github && project.github !== '#' && (
          <a
            href={project.github}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary font-semibold flex items-center gap-1.5 hover:underline transition-colors"
          >
            <Github size={13} /> Source
          </a>
        )}
        {project.live && project.live !== '#' && (
          <a
            href={project.live}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary font-semibold flex items-center gap-1.5 hover:underline transition-colors"
          >
            <Globe size={13} /> Live
          </a>
        )}
      </div>
    </div>
  </div>
);

const AllProjects = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const projectsPerPage = 6;

  const { data: projectsData, isLoading } = useSharedData('projectsFull', async () => {
    const response = await fetch('/api/projects');
    const data = await response.json();
    if (data && data.length > 0) return data;
    // Fallback static data if DB is empty
    return [
      {
        title: 'Automated Vulnerability Scanner',
        type: 'Security Tool',
        Date: '2024',
        image: '',
        description: 'A multi-threaded vulnerability scanner designed to detect web application misconfigurations, unpatched CVEs, and OWASP Top 10 vulnerabilities.',
        tags: ['Python', 'Socket', 'BeautifulSoup', 'CVE Detection', 'Security'],
        github: 'https://github.com/OxL3on',
      },
      {
        title: 'Network Recon & Port Scanner',
        type: 'Network Security',
        Date: '2024',
        image: '',
        description: 'High-performance network reconnaissance tool with asynchronous service enumeration, TCP/UDP port scanning, and banner grabbing.',
        tags: ['Python', 'Networking', 'TCP/IP', 'Scapy', 'Nmap Engine'],
        github: 'https://github.com/OxL3on',
      },
      {
        title: 'JWT Flaw Exploiter & Analyzer',
        type: 'Web Security',
        Date: '2023',
        image: '',
        description: 'Automated security testing script for JSON Web Tokens, testing for signature strip bypasses, algorithm confusion, and brute-forcing weak keys.',
        tags: ['Python', 'Cryptography', 'JWT', 'REST API', 'Offensive Sec'],
        github: 'https://github.com/OxL3on',
      },
      {
        title: 'Subdomain & Attack Surface Enumerator',
        type: 'Bug Bounty Tool',
        Date: '2023',
        image: '',
        description: 'Fast asynchronous OSINT reconnaissance script aggregating Certificate Transparency logs and passive DNS records to uncover target attack surfaces.',
        tags: ['Bash', 'Python', 'OSINT', 'Bug Bounty', 'Automation'],
        github: 'https://github.com/OxL3on',
      }
    ];
  });

  const projects = projectsData || [];

  // Pagination Logic
  const indexOfLastProject = currentPage * projectsPerPage;
  const indexOfFirstProject = indexOfLastProject - projectsPerPage;
  const currentProjects = projects.slice(
    indexOfFirstProject,
    indexOfLastProject,
  );
  const totalPages = Math.ceil(projects.length / projectsPerPage);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 relative z-10 -mt-20 lg:-mt-24">
      <div className="bg-card/90 backdrop-blur-md border border-gray-800 rounded-3xl p-8 md:p-12 mb-8 shadow-2xl w-full">
        {/* Header Section */}
        <div className="mb-10">
          <span className="text-primary text-xs font-bold uppercase tracking-widest">
            Showcase
          </span>
          <h1 className="text-4xl font-bold text-foreground mt-4 mb-6">
            All My Projects
          </h1>
          <p className="text-gray-400 text-base max-w-3xl">
            A curated list of my technical work, covering{' '}
            <span className="text-foreground font-semibold">
              Web Development
            </span>{' '}
            and <span className="text-foreground font-semibold">AI/ML</span>.
          </p>
        </div>

        <div className="mb-10 flex items-center gap-3">
          <span className="w-1 h-6 bg-primary rounded-full"></span>
          <h2 className="text-2xl font-bold text-foreground">
            Featured Portfolio
          </h2>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20 w-full"><PageLoader /></div>
        ) : (
          <>
            {/* Projects Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {currentProjects.map((p, i) => (
                <ProjectCard key={i} project={p} />
            ))}
            </div>

            {/* Pagination Controls */}
            {projects.length > projectsPerPage && (
            <div className="mt-12 flex justify-center items-center gap-4">
                <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-xl border border-gray-800 text-gray-400 hover:border-primary hover:text-primary disabled:opacity-30 disabled:hover:text-gray-400 transition-all"
                >
                <ChevronLeft size={20} />
                </button>

                <div className="flex gap-2">
                {[...Array(totalPages)].map((_, i) => (
                    <button
                    key={i}
                    onClick={() => paginate(i + 1)}
                    className={`w-10 h-10 rounded-xl border font-bold transition-all ${
                        currentPage === i + 1
                        ? 'bg-primary border-primary text-white shadow-[0_0_15px_rgba(var(--primary-color),0.4)]'
                        : 'border-gray-800 text-gray-500 hover:border-gray-600'
                    }`}
                    >
                    {i + 1}
                    </button>
                ))}
                </div>

                <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-xl border border-gray-800 text-gray-400 hover:border-primary hover:text-primary disabled:opacity-30 transition-all"
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

export default AllProjects;
