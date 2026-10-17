'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Home,
  Moon,
  Palette,
  Sun,
  Monitor,
  Menu,
  X,
  RotateCcw,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSharedData } from '@/hooks/useSharedData';

const Navbar = () => {
  const { data: mainInfo } = useSharedData('mainInfo', async () => {
    const res = await fetch('/api/maininfo');
    return res.json();
  });
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState('dark');
  const [hue, setHue] = useState(240);
  const pathname = usePathname();

  const dropdownRef = useRef(null);
  const pickerRef = useRef(null);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Projects', path: '/projects' },
    { name: 'Blog', path: '/blog' },
    { name: 'Certifications', path: '/certifications' },
    { name: 'Achievements', path: '/achievements' },
    { name: 'Contact', path: '/contact' },
  ];

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    const savedHue = localStorage.getItem('primary-hue') || 240;
    setTheme(savedTheme);
    setHue(savedHue);
    applyTheme(savedTheme);
    applyColor(savedHue);

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target))
        setIsThemeOpen(false);
      if (pickerRef.current && !pickerRef.current.contains(event.target))
        setIsColorPickerOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const applyTheme = (t) => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    if (t === 'system') {
      const system = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
      root.classList.add(system);
    } else root.classList.add(t);
  };

  const applyColor = (h) => {
    const root = document.documentElement;
    root.style.setProperty('--primary-hue', h);
    root.style.setProperty('--primary-color', `hsl(${h}, 100%, 65%)`);
    root.style.setProperty('--primary-border', `hsla(${h}, 100%, 65%, 0.2)`);
    root.style.setProperty('--primary-shade', `hsla(${h}, 100%, 65%, 0.1)`);
  };

  const handleThemeChange = (t) => {
    setTheme(t);
    localStorage.setItem('theme', t);
    applyTheme(t);
    setIsThemeOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 px-4">
      <div className="max-w-305 mx-auto bg-card backdrop-blur-xl border border-primary-border/30 px-6 py-3 rounded-b-2xl flex items-center justify-between shadow-2xl transition-all duration-300">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-foreground/70 hover:text-primary transition-colors"
          >
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          <Link
            href="/"
            className="flex items-center gap-2.5 font-bold cursor-pointer group"
            style={{ color: 'var(--primary-color)' }}
          >
            <div className="w-7 h-7 rounded-lg overflow-hidden border border-primary/20 transition-transform group-hover:scale-110 flex items-center justify-center bg-black/80 shrink-0">
              <img 
                src={mainInfo?.logoImage || "/logo.png"} 
                alt="Leon Logo" 
                className="w-full h-full object-contain p-0.5" 
              />
            </div>
            <span className="text-[15px] tracking-tight text-foreground font-bold">
              {mainInfo?.siteTitle || "LEON"}
            </span>
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-4 lg:gap-7 text-[13px] lg:text-[14px] font-medium">
          {navLinks.map((link) => {
            const isActive = pathname === link.path;
            return (
              <Link
                key={link.path}
                href={link.path}
                className={`transition-all ${isActive ? 'text-primary font-bold scale-105' : 'text-foreground/80 hover:text-primary'}`}
              >
                {link.name}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-2 md:gap-4 text-foreground/70 relative h-full">
          {/* Color Picker Switcher */}
          <div ref={pickerRef} className="relative flex items-center h-full">
            <button
              onClick={() => setIsColorPickerOpen(!isColorPickerOpen)}
              className="hover:text-primary transition-colors p-2 cursor-pointer"
            >
              <Palette size={19} />
            </button>
            {isColorPickerOpen && (
              <div className="absolute right-0 top-10 pt-4 w-72 z-50">
                <div className="bg-card backdrop-blur-2xl border border-primary-border rounded-xl p-4 shadow-2xl animate-in fade-in zoom-in duration-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 relative">
                      <span className="w-1.5 h-4 bg-primary rounded-full absolute -left-2"></span>
                      <p className="text-sm font-bold text-foreground">
                        Theme Color
                      </p>
                      <button
                        onClick={() => {
                          setHue(240);
                          applyColor(240);
                          localStorage.setItem('primary-hue', 240);
                        }}
                        className="p-1 ml-1 text-foreground/50 hover:text-foreground bg-foreground/5 hover:bg-foreground/10 rounded-md transition-colors"
                        title="Reset to default"
                      >
                        <RotateCcw size={14} />
                      </button>
                    </div>
                    <div className="px-2 py-1 bg-foreground/5 rounded-md text-xs font-bold text-primary border border-primary-border/20">
                      {hue}
                    </div>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={hue}
                    onChange={(e) => {
                      const val = e.target.value;
                      setHue(val);
                      applyColor(val);
                      localStorage.setItem('primary-hue', val);
                    }}
                    className="w-full h-4 rounded-md appearance-none cursor-pointer border-2 border-primary-border/10"
                    style={{
                      background:
                        'linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)',
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Theme Switcher */}
          <div ref={dropdownRef} className="relative flex items-center h-full">
            <button
              onClick={() => setIsThemeOpen(!isThemeOpen)}
              className="p-2 rounded-lg hover:text-primary transition-all cursor-pointer"
            >
              {theme === 'light' ? (
                <Sun size={19} />
              ) : theme === 'system' ? (
                <Monitor size={19} />
              ) : (
                <Moon size={19} />
              )}
            </button>
            {isThemeOpen && (
              <div className="absolute right-0 top-10 pt-4 w-36 z-50">
                <div className="bg-card backdrop-blur-2xl border border-primary-border rounded-xl shadow-2xl p-1.5 animate-in fade-in zoom-in duration-200">
                  {['light', 'dark', 'system'].map((t) => (
                    <button
                      key={t}
                      onClick={() => handleThemeChange(t)}
                      className={`flex w-full items-center gap-3 px-3 py-2.5 text-xs rounded-lg capitalize transition-colors ${theme === t ? 'text-primary bg-primary/10 font-bold' : 'text-foreground/60 hover:bg-primary/5'}`}
                    >
                      {t === 'light' ? (
                        <Sun size={14} />
                      ) : t === 'system' ? (
                        <Monitor size={14} />
                      ) : (
                        <Moon size={14} />
                      )}
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden mt-2 mx-auto max-w-sm bg-card/90 backdrop-blur-2xl border border-primary-border/30 rounded-2xl p-2 shadow-2xl animate-in slide-in-from-top-4 duration-300 z-40">
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.path;
              return (
                <Link
                  key={link.path}
                  href={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive ? 'bg-primary/10 text-primary' : 'text-foreground/70 hover:bg-primary/5 hover:text-primary'}`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
