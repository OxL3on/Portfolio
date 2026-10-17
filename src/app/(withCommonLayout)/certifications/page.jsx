"use client";
import React, { useState } from 'react';
import PageLoader from '@/components/shared/PageLoader';
import { useSharedData } from '@/hooks/useSharedData';
import { Award, ExternalLink, CheckCircle2, ShieldCheck, Search } from 'lucide-react';

const defaultCertifications = [
  {
    title: "eLearnSecurity Junior Penetration Tester (eJPT)",
    issuer: "INE Security",
    issueDate: "2024",
    credentialId: "INE-EJPT-849201",
    verifyUrl: "https://ine.com",
    skills: ["Network Pentesting", "Web App Pentesting", "Host & Network Auditing"],
    badge: "Active",
    description: "Hands-on assessment covering vulnerability analysis, network assessment, web application security, and system exploitation."
  },
  {
    title: "CompTIA Security+",
    issuer: "CompTIA",
    issueDate: "2024",
    credentialId: "COMP001029482",
    verifyUrl: "https://www.comptia.org",
    skills: ["Threats & Vulnerabilities", "Security Operations", "Network Architecture"],
    badge: "Certified",
    description: "Demonstrates core security knowledge in threat management, hybrid environment security, and network defenses."
  },
  {
    title: "Certified Ethical Hacker (CEH Practical)",
    issuer: "EC-Council",
    issueDate: "2024",
    credentialId: "ECC-CEHP-19283",
    verifyUrl: "https://www.eccouncil.org",
    skills: ["Ethical Hacking", "Malware Analysis", "Penetration Testing"],
    badge: "Certified",
    description: "Rigorous practical exam demonstrating ethical hacking techniques, packet analysis, and system vulnerability exploitation."
  },
  {
    title: "TryHackMe Pre-Security & Offensive Pentesting",
    issuer: "TryHackMe",
    issueDate: "2023",
    credentialId: "THM-CERT-294819",
    verifyUrl: "https://tryhackme.com",
    skills: ["Linux Fundamentals", "Networking", "Web App Security", "Privilege Escalation"],
    badge: "Completed",
    description: "Comprehensive path covering web exploitation, Linux privilege escalation, network auditing, and Active Directory security."
  }
];

const CertificationCard = ({ cert }) => (
  <div className="bg-background/40 backdrop-blur-sm border border-gray-800 p-6 rounded-2xl hover:border-primary/40 hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 group flex flex-col h-full">
    <div className="mb-4">
      <div className="flex items-center gap-2">
        <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20 group-hover:scale-105 transition-transform">
          <ShieldCheck size={20} />
        </div>
        <div>
          <span className="text-xs font-bold text-primary tracking-wide">
            {cert.issuer}
          </span>
          <p className="text-[11px] text-gray-500 font-medium">
            Issued {cert.issueDate}
          </p>
        </div>
      </div>
    </div>

    <h3 className="text-lg font-bold text-gray-100 mb-2 group-hover:text-primary transition-colors">
      {cert.title}
    </h3>

    <div className="mt-auto pt-4 border-t border-gray-800/60 flex items-center justify-between text-xs">
      <span className="text-gray-500 font-mono text-[11px]">
        ID: {cert.credentialId || "N/A"}
      </span>
      {cert.verifyUrl && cert.verifyUrl !== '#' && (
        <a
          href={cert.verifyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline font-semibold flex items-center gap-1.5 transition-colors"
        >
          Verify <ExternalLink size={12} />
        </a>
      )}
    </div>
  </div>
);

export default function CertificationsPage() {
  const [search, setSearch] = useState('');
  const { data: certsData, isLoading } = useSharedData('certificationsData', async () => {
    const res = await fetch('/api/certifications');
    return await res.json();
  });

  const certs = (certsData && certsData.length > 0) ? certsData : defaultCertifications;

  const filteredCerts = certs.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.issuer.toLowerCase().includes(search.toLowerCase()) ||
    (c.skills && c.skills.some(s => s.toLowerCase().includes(search.toLowerCase())))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 relative z-10 -mt-20 lg:-mt-24">
      <div className="bg-card/90 backdrop-blur-md border border-gray-800 rounded-3xl p-8 md:p-12 mb-8 shadow-2xl w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <span className="text-primary text-xs font-bold uppercase tracking-widest flex items-center gap-2">
              <Award size={16} /> Credentials & Verification
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold text-foreground mt-4 mb-4 tracking-tight">
              Certifications
            </h1>
            <p className="text-gray-400 text-base max-w-2xl leading-relaxed">
              Professional cybersecurity certifications, hands-on penetration testing accreditations, and technical training completions.
            </p>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search certifications..."
              className="w-full bg-background/60 border border-gray-700/60 rounded-xl pl-11 pr-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary transition-all"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <PageLoader />
          </div>
        ) : filteredCerts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {filteredCerts.map((cert, index) => (
              <CertificationCard key={index} cert={cert} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 border border-dashed border-gray-800 rounded-2xl">
            <p className="text-gray-500 text-sm">No certifications found matching &quot;{search}&quot;</p>
          </div>
        )}
      </div>
    </div>
  );
}
