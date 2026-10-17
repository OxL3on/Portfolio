"use client";
import PageLoader from "@/components/shared/PageLoader";
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { useSharedData } from '@/hooks/useSharedData';
import { FaGithub, FaTwitter, FaInstagram, FaLinkedin, FaFacebook, FaDiscord, FaGlobe } from 'react-icons/fa';

const iconMap = {
  github: <FaGithub />,
  twitter: <FaTwitter />,
  instagram: <FaInstagram />,
  linkedin: <FaLinkedin />,
  facebook: <FaFacebook />,
  discord: <FaDiscord />
};

const getIcon = (name) => {
  const lowercaseName = name.toLowerCase();
  for (const key in iconMap) {
    if (lowercaseName.includes(key)) {
      return iconMap[key];
    }
  }
  return <FaGlobe />;
};

const SideProfile = () => {
  const { data: mainData } = useSharedData('mainInfo', async () => {
    const res = await fetch('/api/maininfo');
    return res.ok ? res.json() : null;
  });
  
  const { data: socialsData } = useSharedData('sideContact', async () => {
    const res = await fetch('/api/contact');
    return res.ok ? res.json() : [];
  });

  const defaultSocials = [
    { name: 'github', link: 'https://github.com/OxL3on' },
    { name: 'linkedin', link: 'https://www.linkedin.com/in/mdleonislam/' },
    { name: 'discord', link: 'https://discord.com/users/luffy_111000' }
  ];

  const mainInfo = mainData || null;
  const socials = socialsData && socialsData.length > 0 ? socialsData : defaultSocials;

  return (
    <div className="bg-card/90 backdrop-blur-md rounded-3xl overflow-hidden border border-gray-800 shadow-lg transition-all duration-300">
      <div className="p-5 pb-0">
        <div className="aspect-square w-full rounded-3xl overflow-hidden border-2 border-primary/20 bg-gray-800/50">
          <Image
            src={mainInfo?.image || "/profile.jpg"}
            alt={mainInfo?.name || "MD Leon Islam"}
            className="w-full h-full object-cover object-center transition-transform duration-300 hover:scale-105"
            width={500}
            height={500}
            priority
          />
        </div>
      </div>

      <div className="p-6 text-center">
        <h3 className="text-xl font-bold text-foreground">
          {mainInfo?.name || "MD Leon Islam"}
        </h3>
        <p className="text-gray-400 text-sm mt-3 leading-relaxed line-clamp-4">
          {mainInfo?.bio || "CSE student at PSTU and Offensive Security enthusiast"}
        </p>

        <div className="flex justify-center flex-wrap gap-4 mt-6">
          {socials.map((social, idx) => {
            const isSafe = social.link && /^(https?:\/\/|mailto:)/i.test(social.link.trim());
            const hasLink = isSafe && social.link.trim() !== '' && social.link !== '#';
            return (
              <a
                key={idx}
                href={hasLink ? social.link : undefined}
                target={hasLink ? "_blank" : undefined}
                rel={hasLink ? "noopener noreferrer" : undefined}
                className={`p-2.5 bg-gray-800 rounded-lg hover:text-primary transition-colors text-lg flex items-center justify-center ${!hasLink ? 'cursor-default' : ''}`}
                title={hasLink ? social.name : `${social.name} (Unconfigured)`}
                aria-label={hasLink ? social.name : `${social.name} (Unconfigured)`}
              >
                {getIcon(social.name)}
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SideProfile;
