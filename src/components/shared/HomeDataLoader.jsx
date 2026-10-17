'use client';
import { useState, useEffect } from 'react';
import PageLoader from '@/components/shared/PageLoader';
import { preloadMultipleData } from '@/hooks/useSharedData';

export default function HomeDataLoader({ children }) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAll = async () => {
      await preloadMultipleData([
        { key: 'mainInfo', fetcher: () => fetch('/api/maininfo').then(res => res.json()) },
        { key: 'skillsData', fetcher: () => fetch('/api/skills').then(res => res.json()) },
        { key: 'projectsFull', fetcher: () => fetch('/api/projects').then(res => res.json()) },
        { key: 'educationData', fetcher: () => fetch('/api/education').then(res => res.json()) },
        { key: 'experienceData', fetcher: () => fetch('/api/journey').then(res => res.json()) },
        { key: 'achievementData', fetcher: () => fetch('/api/achievements').then(res => res.json()) },
        { key: 'certificationsData', fetcher: () => fetch('/api/certifications').then(res => res.json()) },
        { key: 'blogsData', fetcher: () => fetch('/api/blogs').then(res => res.json()) },
      ]);
      // Small artificially wait so component mounting does not flash
      setTimeout(() => setIsLoading(false), 50);
    };
    
    loadAll();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[70vh] w-full">
        <PageLoader />
      </div>
    );
  }

  return children;
}
