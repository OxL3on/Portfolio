"use client";
import React from 'react';
import { useSharedData } from '@/hooks/useSharedData';
import { Shield, Globe, Server, Terminal, Wrench, Lock } from 'lucide-react';

const defaultSkills = [
  {
    title: "Offensive Security & Pentesting",
    skills: ["Burp Suite", "Nmap", "Metasploit", "Wireshark", "SQLmap", "OWASP ZAP", "Hydra", "John the Ripper"]
  },
  {
    title: "Web Application & API Security",
    skills: ["OWASP Top 10", "Vulnerability Assessment", "API Pentesting", "ffuf", "Sublist3r", "JWT Exploitation", "XSS & SQLi"]
  },
  {
    title: "Networking & Security Systems",
    skills: ["Kali Linux", "TCP/IP & Subnetting", "Packet Analysis", "Firewalls", "IDS / IPS", "Network Forensics", "Linux Hardening"]
  },
  {
    title: "Programming & Tooling",
    skills: ["Python", "C / C++", "Bash Scripting", "JavaScript", "SQL", "Git / GitHub", "Docker", "Regular Expressions"]
  }
];

const getIconForCategory = (title) => {
  const lowerTitle = title.toLowerCase();
  if (lowerTitle.includes('offensive') || lowerTitle.includes('pentest') || lowerTitle.includes('security')) return Shield;
  if (lowerTitle.includes('web') || lowerTitle.includes('api')) return Globe;
  if (lowerTitle.includes('network') || lowerTitle.includes('system') || lowerTitle.includes('linux')) return Server;
  if (lowerTitle.includes('program') || lowerTitle.includes('code') || lowerTitle.includes('script')) return Terminal;
  return Wrench;
};

const SkillCategory = ({ title, skills }) => {
  const Icon = getIconForCategory(title);
  
  return (
    <div className="bg-background/40 backdrop-blur-sm p-6 rounded-2xl border border-gray-800 hover:border-primary/40 transition-all duration-300 group">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20 group-hover:bg-primary group-hover:text-white transition-all duration-300">
          <Icon size={18} />
        </div>
        <h3 className="font-bold text-gray-200 text-sm uppercase tracking-wider group-hover:text-primary transition-colors">
          {title}
        </h3>
      </div>
      <div className="flex flex-wrap gap-2">
        {skills.map((skill) => (
          <span
            key={skill}
            className="px-3 py-1.5 text-xs font-medium rounded-xl bg-background/80 border border-gray-800 text-gray-300 group-hover:border-primary/20 hover:border-primary/50 hover:text-primary transition-all"
          >
            {skill}
          </span>
        ))}
      </div>
    </div>
  );
};

const Skills = () => {
  const { data: fullskill, isLoading } = useSharedData('skillsData', async () => {
    const res = await fetch('/api/skills');
    return await res.json();
  });
  
  const skillData = (fullskill && fullskill.length > 0) ? fullskill : defaultSkills;

  return (
    <section className="bg-card/90 backdrop-blur-md p-8 rounded-3xl border border-gray-800 shadow-2xl transition-all duration-300">
      <div className="mb-8">
        <span className="text-primary text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-1.5">
          <Wrench size={13} /> Expertise
        </span>
        <h2 className="text-2xl font-bold text-foreground mt-1">
          Skill &amp; Tooling
        </h2>
        <p className="text-gray-500 text-sm mt-1">
          Technical arsenal, security methodologies, and penetration testing tooling.
        </p>
      </div>

      {!isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {skillData.map((category, index) => (
            <SkillCategory
              key={category._id || category.title || index}
              title={category.title}
              skills={Array.isArray(category.skills) ? category.skills : []}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default Skills;
