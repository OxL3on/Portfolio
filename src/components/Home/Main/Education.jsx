"use client";
import React from 'react';
import { useSharedData } from '@/hooks/useSharedData';

const Education = () => {
  const { data: fulleducation, isLoading } = useSharedData('educationData', async () => {
    const res = await fetch('/api/education');
    return await res.json();
  });
  
  const defaultEducation = [
    {
      degree: "Bachelor of Science in Computer Science and Engineering",
      institution: "Patuakhali Science and Technology University (PSTU)",
      period: "2023 - Present",
      major: ""
    },
    {
      degree: "Higher Secondary Certificate (HSC)",
      institution: "Government Syed Hatem Ali College, Barishal",
      period: "2021 - 2023",
      major: "Science"
    }
  ];

  const educationData = fulleducation && fulleducation.length > 0 ? fulleducation : defaultEducation;

  return (
    <section className="bg-card/90 backdrop-blur-md p-8 rounded-3xl border border-gray-800 shadow-2xl transition-all duration-300">
      <div className="mb-6">
        <span className="text-primary text-[10px] font-bold uppercase tracking-[0.2em]">
          Education
        </span>
        <h2 className="text-2xl font-bold text-foreground mt-1">
          Academic Background
        </h2>
        <p className="text-gray-500 text-sm mt-1">
          My academic journey in technology, computer science, and cybersecurity.
        </p>
      </div>

      {!isLoading && educationData.length > 0 && (
        <div className="space-y-4">
          {educationData.map((item, index) => (
            <div
              key={index}
              className="p-5 sm:p-6 bg-background/50 border border-gray-800/60 rounded-2xl hover:border-primary/30 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-2">
                <h3 className="font-bold text-gray-200 text-base sm:text-lg hover:text-primary transition-colors">
                  {item.degree}
                </h3>
                <span className="text-primary font-mono text-xs font-bold tracking-wider shrink-0">
                  {item.period}
                </span>
              </div>
              <div className="text-gray-400 text-sm font-medium">
                {item.institution}
              </div>
              {item.major && (
                <div className="text-gray-500 text-xs mt-1 italic">
                  {item.major}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default Education;
