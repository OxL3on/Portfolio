'use client';
import PageLoader from "@/components/shared/PageLoader";
import Link from 'next/link';
import React from 'react';
import { useSharedData } from '@/hooks/useSharedData';
import { Code2, ArrowRight, Calendar, Github } from 'lucide-react';

const defaultProjects = [
  {
    title: 'Automated Vulnerability Scanner',
    type: 'Security Tool',
    date: '2024',
    description: 'A multi-threaded vulnerability scanner designed to detect web application misconfigurations, unpatched CVEs, and OWASP Top 10 vulnerabilities.',
    tags: ['Python', 'Socket', 'BeautifulSoup', 'CVE Detection', 'Security'],
    github: 'https://github.com/OxL3on',
  },
  {
    title: 'Network Recon & Port Scanner',
    type: 'Network Security',
    date: '2024',
    description: 'High-performance network reconnaissance tool with asynchronous service enumeration, TCP/UDP port scanning, and banner grabbing.',
    tags: ['Python', 'Networking', 'TCP/IP', 'Scapy', 'Nmap Engine'],
    github: 'https://github.com/OxL3on',
  }
];

const Projects = () => {
  const { data: fullProjects, isLoading } = useSharedData('projectsFull', async () => {
    const res = await fetch('/api/projects');
    const data = await res.json();
    return data || [];
  });
  
  const featuredProjects = (fullProjects || []).filter(p => p.featured === true || p.isFeatured === true);
  const projectsData = (featuredProjects.length > 0)
    ? featuredProjects.slice(0, 2)
    : ((fullProjects && fullProjects.length > 0) ? fullProjects.slice(0, 2) : defaultProjects);

  return (
    <section className="bg-card/90 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-gray-800 shadow-2xl transition-all duration-300">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <span className="text-primary text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-1.5">
            <Code2 size={13} /> Projects
          </span>
          <h2 className="text-2xl font-bold text-foreground mt-1">
            Featured Projects
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            A selection of open-source security tools and projects I build and maintain.
          </p>
        </div>
        <Link 
          href={'/projects'}
          className="text-gray-400 hover:text-primary text-xs font-semibold transition-colors flex items-center gap-1 group shrink-0"
        >
          View all projects <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {isLoading ? (<div className='flex justify-center items-center py-10 w-full'><PageLoader /></div>) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          {projectsData.map((project, index) => (
            <div
              key={index}
              className="bg-background/40 border border-gray-800/60 p-6 rounded-2xl hover:border-primary/40 transition-all group relative flex flex-col justify-between"
            >
              <div>
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                    {project.title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 font-medium italic">
                    Type: {project.type}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-gray-400 mb-4 bg-background/60 w-fit px-3 py-1 rounded-lg border border-gray-800 group-hover:border-primary/20 transition-colors">
                  <Calendar size={12} className="text-primary/70" />
                  <span className="text-[11px] font-mono">
                    {project.date || project.Date}
                  </span>
                </div>

                <p className="text-sm text-gray-400 leading-relaxed mb-6 line-clamp-3">
                  {project.description}
                </p>

                <div className="flex flex-wrap gap-2 mb-8">
                  {project.tags?.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-0.5 bg-background text-[10px] text-gray-400 font-bold rounded border border-gray-700 tracking-wider group-hover:border-primary/30 transition-colors"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center pt-2">
                <a
                  href={project.github || 'https://github.com/OxL3on'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-gray-800/40 hover:bg-primary/10 hover:text-primary border border-gray-700 hover:border-primary/40 text-gray-300 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
                >
                  <Github size={14} /> View on GitHub
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default Projects;
