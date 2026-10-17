"use client";
import React from 'react';
import Link from 'next/link';
import { useSharedData } from '@/hooks/useSharedData';
import { ShieldCheck, Award, ExternalLink } from 'lucide-react';

const defaultCertifications = [
  {
    title: "eLearnSecurity Junior Penetration Tester (eJPT)",
    issuer: "INE Security",
    issueDate: "2024",
    skills: ["Network Pentesting", "Web App Pentesting"],
    badge: "Active",
    verifyUrl: "https://ine.com"
  },
  {
    title: "CompTIA Security+",
    issuer: "CompTIA",
    issueDate: "2024",
    skills: ["Threats & Vulnerabilities", "Network Architecture"],
    badge: "Certified",
    verifyUrl: "https://www.comptia.org"
  }
];

const Certifications = () => {
  const { data: certsData, isLoading } = useSharedData('certificationsData', async () => {
    const res = await fetch('/api/certifications');
    return await res.json();
  });

  const certs = (certsData && certsData.length > 0) ? certsData.slice(0, 2) : defaultCertifications;

  return (
    <section className="bg-card/90 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-gray-800 shadow-2xl transition-all duration-300">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <span className="text-primary text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-1.5">
            <Award size={13} /> Certifications
          </span>
          <h2 className="text-2xl font-bold text-foreground mt-1">
            Verified Credentials
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Industry-recognized offensive security and cybersecurity certifications.
          </p>
        </div>
        <Link
          href="/certifications"
          className="text-gray-400 hover:text-primary text-xs font-semibold transition-colors shrink-0"
        >
          View all certs →
        </Link>
      </div>

      {!isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {certs.map((cert, index) => (
            <div
              key={index}
              className="p-5 bg-background/50 border border-gray-800/60 rounded-2xl hover:border-primary/30 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="mb-3">
                  <span className="text-primary font-mono text-xs font-bold">
                    {cert.issuer}
                  </span>
                </div>
                <h3 className="font-bold text-gray-200 text-base leading-snug hover:text-primary transition-colors">
                  {cert.title}
                </h3>
              </div>

              <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-800/50 text-xs">
                <span className="text-gray-500 font-mono text-[11px]">
                  Issued {cert.issueDate}
                </span>
                {cert.verifyUrl && (
                  <a
                    href={cert.verifyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline flex items-center gap-1 font-medium"
                  >
                    Verify <ExternalLink size={12} />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default Certifications;
