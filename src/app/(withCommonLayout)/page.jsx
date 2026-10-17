import Achievement from '@/components/Home/Main/Achievement';
import Certifications from '@/components/Home/Main/Certifications';
import Blog from '@/components/Home/Main/Blog';
import Collaboration from '@/components/Home/Main/Collaboration';
import Education from '@/components/Home/Main/Education';
import Intro from '@/components/Home/Main/Intro';
import Projects from '@/components/Home/Main/Projects';
import Skills from '@/components/Home/Main/Skills';
import SideContact from '@/components/Home/SideContact';
import SideProfile from '@/components/Home/SideProfile';
import Visitors from '@/components/Home/Visitors';
import React from 'react';
import { FadeIn } from '@/components/shared/FadeIn';
import HomeDataLoader from '@/components/shared/HomeDataLoader';

const HomePage = () => {
  return (
    <HomeDataLoader>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop Left Sidebar: Sticky (hidden on mobile, visible on lg+) */}
          <aside className="hidden lg:block w-[320px] shrink-0 relative z-10">
            <div className="-mt-24 space-y-6 sticky top-24">
              <FadeIn delay={0} direction="up"><SideProfile /></FadeIn>
              <FadeIn delay={0.2} direction="up"><SideContact /></FadeIn>
              <FadeIn delay={0.3} direction="up"><Visitors /></FadeIn>
            </div>
          </aside>

          {/* Main Column */}
          <main className="w-full lg:flex-1 space-y-8 relative z-10 -mt-16 sm:-mt-20 lg:-mt-24">
            {/* Mobile / Tablet Profile Card: Positioned at the VERY FIRST, exactly like PC */}
            <div className="block lg:hidden max-w-md mx-auto w-full">
              <FadeIn delay={0} direction="up"><SideProfile /></FadeIn>
            </div>

            {/* 1. Intro */}
            <FadeIn delay={0.1} direction="up"><Intro /></FadeIn>

            {/* 2. Education */}
            <FadeIn delay={0.1} direction="up"><Education /></FadeIn>

            {/* 3. Skill & Tooling */}
            <FadeIn delay={0.2} direction="up"><Skills /></FadeIn>

            {/* 4. Projects */}
            <FadeIn delay={0.1} direction="up"><Projects /></FadeIn>

            {/* 5. Blogs */}
            <FadeIn delay={0.1} direction="up"><Blog /></FadeIn>

            {/* 6. Certifications */}
            <FadeIn delay={0.2} direction="up"><Certifications /></FadeIn>

            {/* 7. Achievements */}
            <FadeIn delay={0.2} direction="up"><Achievement /></FadeIn>

            {/* 8. Collaboration */}
            <FadeIn delay={0.1} direction="up"><Collaboration /></FadeIn>

            {/* Mobile / Tablet Contact & Visitors: Placed at the end on mobile */}
            <div className="block lg:hidden max-w-md mx-auto w-full space-y-6 pt-2">
              <FadeIn delay={0.2} direction="up"><SideContact /></FadeIn>
              <FadeIn delay={0.3} direction="up"><Visitors /></FadeIn>
            </div>
          </main>
        </div>
      </div>
    </HomeDataLoader>
  );
};

export default HomePage;
