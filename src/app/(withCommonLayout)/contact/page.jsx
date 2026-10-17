"use client";
import React from 'react';
import PageLoader from '@/components/shared/PageLoader';
import { useSharedData } from '@/hooks/useSharedData';
import { Clock } from 'lucide-react';
import { ContactCard, ContactItem } from './_components/ContactCard';

const ContactPage = () => {
  const { data: links, isLoading } = useSharedData('socialLinks', async () => {
    const res = await fetch('/api/contact');
    if (!res.ok) return [];
    return await res.json();
  });
  
  const socialLinks = links ? links.map((item) => ({
    iconName: item.name.toLowerCase().trim(),
    label: item.name,
    value: item.username,
    subValue: "Let's connect",
    href: item.link,
  })) : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 relative z-10 -mt-20 lg:-mt-24">
      <ContactCard>
        {/* Header Section */}
        <div className="mb-12">
          <p className="text-primary text-[13px] font-bold uppercase tracking-widest mb-1.5">
            Get in touch
          </p>
          <h1 className="text-4xl md:text-5xl font-extrabold text-foreground mb-6 leading-tight">
            Let&apos;s connect and <br /> collaborate together.
          </h1>
          <p className="text-foreground/80 leading-relaxed max-w-2xl text-[15px]">
            I&apos;m always open to discussing web application security, penetration testing, offensive security, and collaborative projects. Reach out through any of these channels below!
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20 w-full"><PageLoader /></div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              <div className="lg:col-span-1 space-y-6">
                <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-3">
                  <span className="w-1 h-5 rounded-full bg-primary" style={{ backgroundColor: 'var(--primary-color)' }}></span>
                  Direct Contact
                </h3>
                <ContactItem
                  iconName="mail"
                  label="Primary Email"
                  value="leonislamofficial123@gmail.com"
                  subValue="Best for collaboration inquiries"
                  href="mailto:leonislamofficial123@gmail.com"
                  isPrimary={true}
                />
              </div>

              <div className="lg:col-span-2">
                <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-3">
                  <span className="w-1 h-5 rounded-full bg-primary" style={{ backgroundColor: 'var(--primary-color)' }}></span>
                  Social & Professional
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {socialLinks.length > 0 ? (
                    socialLinks.map((link, index) => (
                      <ContactItem key={index} {...link} />
                    ))
                  ) : (
                    <div className="col-span-full py-4 text-foreground/50">
                      No contact links added yet.
                    </div>
                  )}
                </div>
              </div>

            </div>

            <div className="mt-14 flex items-center justify-center gap-3 py-4 px-8 bg-card/50 backdrop-blur-md rounded-2xl border border-gray-800 w-fit mx-auto shadow-sm">
              <Clock size={16} className="text-primary" />
              <p className="text-sm text-foreground/70">
                Typical response time:{' '}
                <span className="text-foreground font-bold">24-48 hours</span>
              </p>
            </div>
          </>
        )}
      </ContactCard>
    </div>
  );
};

export default ContactPage;
