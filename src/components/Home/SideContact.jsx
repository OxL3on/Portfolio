"use client";
import PageLoader from "@/components/shared/PageLoader";
import React from 'react';
import { useSharedData } from '@/hooks/useSharedData';
import { FiExternalLink, FiMail } from 'react-icons/fi';
import { FaGithub, FaLinkedin, FaDiscord, FaGlobe, FaTwitter, FaFacebook } from 'react-icons/fa';

const iconMap = {
  github: <FaGithub />,
  linkedin: <FaLinkedin />,
  discord: <FaDiscord />,
  twitter: <FaTwitter />,
  facebook: <FaFacebook />
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

const SideContact = () => {
  const { data: mainData } = useSharedData('mainInfo', async () => {
    const res = await fetch('/api/maininfo');
    return res.ok ? res.json() : null;
  });

  const { data: socialLinksData, isLoading } = useSharedData('socialLinks', async () => {
    const res = await fetch('/api/contact');
    return await res.json();
  });

  const email = mainData?.email || "leonislamofficial123@gmail.com";
  const defaultSocialLinks = [
    {
      name: 'GitHub',
      username: 'OxL3on',
      link: 'https://github.com/OxL3on'
    },
    {
      name: 'LinkedIn',
      username: 'MD Leon Islam',
      link: 'https://www.linkedin.com/in/mdleonislam/'
    },
    {
      name: 'Discord',
      username: 'luffy_111000',
      link: 'https://discord.com/users/luffy_111000'
    }
  ];

  const socialLinks = (socialLinksData && socialLinksData.length > 0) ? socialLinksData : defaultSocialLinks;

  return (
    <div className="bg-card/40 backdrop-blur-xl p-6 rounded-[32px] border border-primary-border/10 mt-6 transition-all duration-500 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.3)] hover:shadow-primary/5 group/main relative overflow-hidden">
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/5 blur-[50px] -z-10 group-hover/main:bg-primary/10 transition-colors duration-500"></div> 
      <h4 className="text-foreground font-bold mb-8 flex items-center gap-3">
        <span className="w-1.5 h-6 bg-primary rounded-full"></span>
        <span className="tracking-tight text-lg">Contact Me</span>
      </h4>

      {/* Email Section */}
      <a
        href={`mailto:${email}`}
        className="mb-8 p-5 bg-primary/5 rounded-2xl border border-primary-border/10 flex items-center gap-4 hover:border-primary/40 hover:bg-primary/10 transition-all duration-300 group/email"
      >
        <div className="p-3 bg-primary/10 rounded-xl text-primary group-hover/email:scale-110 transition-transform duration-300">
          <FiMail size={22} />
        </div>
        <div>
          <p className="text-[10px] text-primary uppercase font-bold tracking-[0.2em] mb-1">
            Email Me
          </p>
          <p className="text-[13px] text-foreground/80 font-medium group-hover/email:text-primary transition-colors">
            {email}
          </p>
        </div>
      </a>

      <div className="space-y-6">
        <p className="text-[10px] text-foreground/40 uppercase font-bold tracking-[0.2em] ml-1">
          Social Connect
        </p>

        {isLoading ? (<div className='flex justify-center items-center py-10 w-full'><PageLoader /></div>) : (
          <div className="grid gap-2">
            {socialLinks.map((social, index) => {
              const isSafe = social.link && /^(https?:\/\/|mailto:)/i.test(social.link.trim());
              const hasLink = isSafe && social.link.trim() !== '' && social.link !== '#';
              return (
                <a
                  key={index}
                  href={hasLink ? social.link : undefined}
                  target={hasLink ? "_blank" : undefined}
                  rel={hasLink ? "noopener noreferrer" : undefined}
                  aria-label={hasLink ? `${social.name} - ${social.username || social.name}` : `${social.name} (Unconfigured)`}
                  className={`flex items-center justify-between p-4 rounded-2xl bg-transparent hover:bg-primary/5 border border-transparent hover:border-primary-border/20 transition-all duration-300 group/link ${!hasLink ? 'cursor-default' : ''}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-foreground/5 text-foreground/60 group-hover/link:bg-primary/10 group-hover/link:text-primary transition-all duration-300 text-xl">
                      {getIcon(social.name)}
                    </div>
                    <div>
                      <p className="text-sm text-foreground/80 font-bold group-hover/link:text-primary transition-colors">
                        {social.name}
                      </p>
                      <p className="text-[11px] text-foreground/40 font-medium">
                        {social.username}
                      </p>
                    </div>
                  </div>
                  {hasLink && (
                    <FiExternalLink
                      className="text-foreground/20 group-hover/link:text-primary group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-all duration-300"
                      size={14}
                    />
                  )}
                </a>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SideContact;
