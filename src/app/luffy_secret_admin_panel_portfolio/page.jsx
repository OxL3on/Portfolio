"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  Lock, 
  Eye, 
  EyeOff, 
  LogOut, 
  Check, 
  Save, 
  Plus, 
  Trash2, 
  Edit2, 
  Upload, 
  Image as ImageIcon, 
  User, 
  GraduationCap, 
  Wrench, 
  FolderGit2, 
  BookOpen, 
  Award, 
  Trophy, 
  Share2, 
  ExternalLink,
  RefreshCw,
  Sliders,
  KeyRound,
  Layers,
  X
} from 'lucide-react';

export default function SecretAdminPortal() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [showPasscode, setShowPasscode] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Active Management Tab
  const [activeTab, setActiveTab] = useState('assets');
  const [saveSuccess, setSaveSuccess] = useState('');
  const [saveError, setSaveError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Form States
  const [mainInfo, setMainInfo] = useState({});
  const [education, setEducation] = useState([]);
  const [skills, setSkills] = useState([]);
  const [projects, setProjects] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [contact, setContact] = useState([]);
  const [blogCategories, setBlogCategories] = useState([
    'TryHackMe',
    'Hack The Box',
    'CTF Writeups',
    'Security Research',
    'VulnHub',
    'Root me'
  ]);
  const [newCatInput, setNewCatInput] = useState('');
  const [editingCategory, setEditingCategory] = useState(null); // { oldName: string, value: string }

  // Sub-forms / Modals
  const [editingItem, setEditingItem] = useState(null);
  const [modalType, setModalType] = useState(null); // 'project', 'blog', 'cert', 'edu', 'skill', 'ach'

  // Settings
  const [currentPasscode, setCurrentPasscode] = useState('');
  const [newPasscode, setNewPasscode] = useState('');
  const [confirmPasscode, setConfirmPasscode] = useState('');

  // Check existing server-validated session on mount
  useEffect(() => {
    const verifySession = async () => {
      try {
        const res = await fetch('/api/admin/auth', {
          credentials: 'same-origin'
        });
        if (res.ok) {
          setIsAuthenticated(true);
          fetchAllData();
        } else {
          setIsAuthenticated(false);
        }
      } catch (err) {
        setIsAuthenticated(false);
      }
    };
    verifySession();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ passcode: passcode.trim() })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setIsAuthenticated(true);
        fetchAllData();
      } else {
        setLoginError(data.error || 'Incorrect secret passcode');
      }
    } catch (err) {
      setLoginError('Authentication service unreachable');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth', { method: 'DELETE', credentials: 'same-origin' });
    } catch (e) {}
    setIsAuthenticated(false);
    setPasscode('');
  };

  const fetchAllData = async () => {
    try {
      const [m, e, s, p, b, c, a, ct, cats] = await Promise.all([
        fetch('/api/maininfo').then(r => r.json()),
        fetch('/api/education').then(r => r.json()),
        fetch('/api/skills').then(r => r.json()),
        fetch('/api/projects').then(r => r.json()),
        fetch('/api/blogs').then(r => r.json()),
        fetch('/api/certifications').then(r => r.json()),
        fetch('/api/achievements').then(r => r.json()),
        fetch('/api/contact').then(r => r.json()),
        fetch('/api/blog-categories').then(r => r.json()).catch(() => [])
      ]);

      setMainInfo(m || {});
      setEducation(Array.isArray(e) ? e : []);
      setSkills(Array.isArray(s) ? s : []);
      setProjects(Array.isArray(p) ? p : []);
      setBlogs(Array.isArray(b) ? b : []);
      setCertifications(Array.isArray(c) ? c : []);
      setAchievements(Array.isArray(a) ? a : []);
      setContact(Array.isArray(ct) ? ct : []);
      if (Array.isArray(cats) && cats.length > 0) {
        setBlogCategories(cats);
      }
    } catch (err) {
      console.error('Failed to load portfolio data:', err);
    }
  };

  const notifySuccess = (msg) => {
    setSaveSuccess(msg);
    setTimeout(() => setSaveSuccess(''), 3000);
  };

  const notifyError = (msg) => {
    setSaveError(msg);
    setTimeout(() => setSaveError(''), 4000);
  };

  // Central authenticated fetch helper using secure HttpOnly cookies
  const authFetch = async (url, options = {}) => {
    const res = await fetch(url, {
      ...options,
      credentials: 'same-origin'
    });
    if (res.status === 401) {
      setIsAuthenticated(false);
      notifyError('Admin session expired or invalid. Please sign in again.');
    }
    return res;
  };

  // Upload file helper
  const handleFileUpload = async (e, fieldName, targetType = 'general') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('targetType', targetType);

    try {
      const res = await authFetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (res.ok && data.url) {
        setMainInfo(prev => ({ ...prev, [fieldName]: data.url }));
        notifySuccess(`Uploaded ${file.name} successfully!`);
      } else {
        notifyError(data.error || 'Upload failed');
      }
    } catch (err) {
      notifyError('Failed to upload file');
    }
  };

  // Certificate image upload helper
  const handleCertFileUpload = async (e, certIdx) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('targetType', 'general');

    notifySuccess(`Uploading ${file.name}...`);
    try {
      const res = await authFetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (res.ok && data.url) {
        const updated = [...certifications];
        updated[certIdx].image = data.url;
        setCertifications(updated);
        notifySuccess(`Uploaded ${file.name} successfully! Remember to click "Save All Certifications".`);
      } else {
        notifyError(data.error || 'Upload failed');
      }
    } catch (err) {
      notifyError('Failed to upload image from computer');
    }
  };

  // Save Main Info & Assets
  const saveMainInfo = async (e) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    try {
      const res = await authFetch('/api/maininfo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mainInfo)
      });
      if (res.ok) {
        notifySuccess('Profile & Visual Assets saved successfully!');
      } else {
        notifyError('Failed to save profile');
      }
    } catch (err) {
      notifyError('Save error');
    } finally {
      setIsSaving(false);
    }
  };

  // Generic Save list for a section
  const saveSection = async (endpoint, data, name) => {
    setIsSaving(true);
    try {
      const res = await authFetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        notifySuccess(`${name} updated successfully!`);
      } else {
        notifyError(`Failed to update ${name}`);
      }
    } catch (err) {
      notifyError(`Error saving ${name}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Change Passcode
  const handleUpdatePasscode = async (e) => {
    e.preventDefault();
    if (!currentPasscode) {
      notifyError("Please enter your current master passcode!");
      return;
    }
    if (newPasscode !== confirmPasscode) {
      notifyError("New passcodes do not match!");
      return;
    }
    try {
      const res = await authFetch('/api/admin/auth', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPasscode: currentPasscode.trim(),
          newPasscode: newPasscode.trim()
        })
      });
      const data = await res.json();
      if (res.ok) {
        notifySuccess('Master passcode updated successfully!');
        setCurrentPasscode('');
        setNewPasscode('');
        setConfirmPasscode('');
      } else {
        notifyError(data.error || 'Failed to update passcode');
      }
    } catch (err) {
      notifyError('Error updating passcode');
    }
  };

  // ==========================================
  // 1. LOGIN SCREEN (If not authenticated)
  // ==========================================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#07080c] text-foreground flex items-center justify-center p-4 relative overflow-hidden font-sans">
        {/* Hacker / Cyber Aura Background */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-md w-full bg-card/80 backdrop-blur-2xl p-8 sm:p-10 rounded-3xl border border-primary/30 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.8)] relative z-10 text-center">
          <div className="w-16 h-16 bg-primary/10 border border-primary/30 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-primary/20 text-primary">
            <Lock size={32} />
          </div>

          <span className="text-[10px] font-mono font-bold tracking-[0.3em] uppercase text-primary/80">
            RESTRICTED ACCESS
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground mt-1 mb-2 tracking-tight">
            Luffy Secret Portal
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm mb-8 leading-relaxed">
            Enter master authentication key to access the portfolio backend management suite.
          </p>

          {loginError && (
            <div className="mb-6 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs font-semibold text-left">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5 text-left">
            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                Master Security Passcode
              </label>
              <div className="relative">
                <input
                  type={showPasscode ? "text" : "password"}
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="Enter secret passcode..."
                  required
                  className="w-full bg-background/80 border border-gray-700/80 rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary font-mono transition-all pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPasscode(!showPasscode)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPasscode ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3.5 rounded-xl text-sm transition-all shadow-lg shadow-primary/25 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loginLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <KeyRound size={16} /> Authenticate &amp; Access Dashboard
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-800/80 text-center">
            <Link href="/" className="text-xs text-gray-500 hover:text-primary transition-colors">
              ← Return to Portfolio Website
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // 2. MASTER DASHBOARD (When authenticated)
  // ==========================================
  const NAV_TABS = [
    { id: 'assets', label: 'Branding & Visuals', icon: ImageIcon },
    { id: 'bio', label: 'Bio & Profile Info', icon: User },
    { id: 'education', label: 'Education', icon: GraduationCap },
    { id: 'skills', label: 'Skill & Tooling', icon: Wrench },
    { id: 'projects', label: 'Projects', icon: FolderGit2 },
    { id: 'blogs', label: 'Writeups & Blogs', icon: BookOpen },
    { id: 'certifications', label: 'Certifications', icon: Award },
    { id: 'achievements', label: 'Achievements', icon: Trophy },
    { id: 'contact', label: 'Social & Contact', icon: Share2 },
    { id: 'settings', label: 'Security & Key', icon: Sliders }
  ];

  return (
    <div className="min-h-screen bg-[#08090d] text-foreground flex flex-col font-sans">
      {/* Top Admin Header Bar */}
      <header className="sticky top-0 z-50 bg-card/90 backdrop-blur-xl border-b border-gray-800 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold">
            <Lock size={16} />
          </div>
          <div>
            <h1 className="font-extrabold text-foreground text-sm sm:text-base leading-none">
              Portfolio Command Center
            </h1>
            <span className="text-[10px] text-emerald-400 font-mono font-medium flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              LIVE BACKEND SYSTEM • ROOT ADMIN
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-background/60 hover:bg-gray-800 border border-gray-700 text-xs text-gray-300 font-medium transition-colors"
          >
            <span>Live Site</span>
            <ExternalLink size={12} />
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-xs text-rose-400 font-semibold transition-colors"
          >
            <LogOut size={12} />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Floating Status Toast Notifications */}
      {saveSuccess && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-500 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 text-xs font-bold animate-in fade-in slide-in-from-bottom-4">
          <Check size={16} /> {saveSuccess}
        </div>
      )}
      {saveError && (
        <div className="fixed bottom-6 right-6 z-50 bg-rose-500 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 text-xs font-bold animate-in fade-in slide-in-from-bottom-4">
          {saveError}
        </div>
      )}

      {/* Main Workspace Body */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Navigation Sidebar */}
        <aside className="w-full md:w-64 bg-card/40 border-r border-gray-800/80 p-4 shrink-0 flex md:flex-col overflow-x-auto md:overflow-y-auto space-x-2 md:space-x-0 md:space-y-1.5">
          {NAV_TABS.map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left whitespace-nowrap shrink-0 md:w-full ${
                  isSelected
                    ? 'bg-primary text-white shadow-lg shadow-primary/20'
                    : 'text-gray-400 hover:text-foreground hover:bg-gray-800/50'
                }`}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </aside>

        {/* Content Panel */}
        <main className="flex-1 p-4 sm:p-8 max-w-5xl overflow-y-auto">
          {/* ==================================================== */}
          {/* TAB 1: BRANDING & VISUAL ASSETS */}
          {/* ==================================================== */}
          {activeTab === 'assets' && (
            <div className="space-y-8 animate-in fade-in duration-200">
              <div className="border-b border-gray-800 pb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-foreground">Branding &amp; Visual Assets</h2>
                  <p className="text-xs text-gray-400 mt-1">
                    Upload or update profile avatar, 4K cover wallpaper, website logo, and favicon without coding.
                  </p>
                </div>
                <button
                  onClick={saveMainInfo}
                  disabled={isSaving}
                  className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-primary/20"
                >
                  <Save size={14} /> Save Assets
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Avatar / Profile Picture */}
                <div className="bg-card/70 border border-gray-800 p-6 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-primary">Avatar Photo</span>
                    <span className="text-[10px] text-gray-500 font-mono">1:1 Square</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-primary/30 bg-black shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={mainInfo.image || "/profile.jpg"}
                        alt="Avatar Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="space-y-2 grow">
                      <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-xs font-semibold text-gray-200 border border-gray-700 transition-colors">
                        <Upload size={14} /> Upload from Computer
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileUpload(e, 'image', 'avatar')}
                        />
                      </label>
                      <input
                        type="text"
                        value={mainInfo.image || ''}
                        onChange={(e) => setMainInfo({ ...mainInfo, image: e.target.value })}
                        placeholder="Or enter URL (/profile.jpg)..."
                        className="w-full bg-background border border-gray-700 rounded-lg px-3 py-1.5 text-xs text-foreground font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Website Logo & Favicon */}
                <div className="bg-card/70 border border-gray-800 p-6 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-primary">Logo &amp; Favicon</span>
                    <span className="text-[10px] text-gray-500 font-mono">Transparent / Square</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-primary/30 bg-black flex items-center justify-center p-2 shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={mainInfo.logoImage || "/logo.png"}
                        alt="Logo Preview"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="space-y-2 grow">
                      <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-xs font-semibold text-gray-200 border border-gray-700 transition-colors">
                        <Upload size={14} /> Upload Logo
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileUpload(e, 'logoImage', 'logo')}
                        />
                      </label>
                      <input
                        type="text"
                        value={mainInfo.logoImage || ''}
                        onChange={(e) => setMainInfo({ ...mainInfo, logoImage: e.target.value })}
                        placeholder="Or enter URL (/logo.png)..."
                        className="w-full bg-background border border-gray-700 rounded-lg px-3 py-1.5 text-xs text-foreground font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Cover Banner Wallpaper */}
                <div className="bg-card/70 border border-gray-800 p-6 rounded-2xl space-y-4 md:col-span-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-primary">Cover Banner Wallpaper</span>
                    <span className="text-[10px] text-gray-500 font-mono">Wide 16:9 / 4K</span>
                  </div>
                  <div className="h-32 sm:h-44 w-full rounded-2xl overflow-hidden border border-gray-800 relative bg-black">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={mainInfo.coverImage || "/china-mountains.jpg"}
                      alt="Banner Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <label className="cursor-pointer shrink-0 inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-xs font-semibold text-gray-200 border border-gray-700 transition-colors">
                      <Upload size={14} /> Upload New Wallpaper
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, 'coverImage', 'cover')}
                      />
                    </label>
                    <input
                      type="text"
                      value={mainInfo.coverImage || ''}
                      onChange={(e) => setMainInfo({ ...mainInfo, coverImage: e.target.value })}
                      placeholder="Or enter URL (/china-mountains.jpg)..."
                      className="w-full bg-background border border-gray-700 rounded-xl px-3 py-2 text-xs text-foreground font-mono"
                    />
                  </div>
                </div>

                {/* Brand Title */}
                <div className="bg-card/70 border border-gray-800 p-6 rounded-2xl space-y-3 md:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-300">
                    Website Brand / Monogram Text
                  </label>
                  <input
                    type="text"
                    value={mainInfo.siteTitle || 'LEON'}
                    onChange={(e) => setMainInfo({ ...mainInfo, siteTitle: e.target.value })}
                    className="w-full bg-background border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-foreground font-bold tracking-widest"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 2: BIO, INTRO & PERSONAL INFO */}
          {/* ==================================================== */}
          {activeTab === 'bio' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="border-b border-gray-800 pb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-foreground">Bio &amp; Profile Information</h2>
                  <p className="text-xs text-gray-400 mt-1">Edit intro text, greetings, hero badge, sidebar bio, location and status.</p>
                </div>
                <button
                  onClick={saveMainInfo}
                  disabled={isSaving}
                  className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-primary/20"
                >
                  <Save size={14} /> Save Bio Info
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase mb-2">Full Display Name</label>
                  <input
                    type="text"
                    value={mainInfo.name || ''}
                    onChange={(e) => setMainInfo({ ...mainInfo, name: e.target.value })}
                    className="w-full bg-card border border-gray-700 rounded-xl px-4 py-2.5 text-xs text-foreground font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase mb-2">Hero Section Subtitle / Badge</label>
                  <input
                    type="text"
                    value={mainInfo.tagline || ''}
                    onChange={(e) => setMainInfo({ ...mainInfo, tagline: e.target.value })}
                    className="w-full bg-card border border-gray-700 rounded-xl px-4 py-2.5 text-xs text-foreground font-mono uppercase"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase mb-2">Hero Headline Greeting</label>
                  <input
                    type="text"
                    value={mainInfo.greeting || ''}
                    onChange={(e) => setMainInfo({ ...mainInfo, greeting: e.target.value })}
                    className="w-full bg-card border border-gray-700 rounded-xl px-4 py-2.5 text-xs text-foreground font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase mb-2">Sidebar Bio (Under Avatar)</label>
                  <input
                    type="text"
                    value={mainInfo.bio || ''}
                    onChange={(e) => setMainInfo({ ...mainInfo, bio: e.target.value })}
                    className="w-full bg-card border border-gray-700 rounded-xl px-4 py-2.5 text-xs text-foreground"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase mb-2">Location</label>
                  <input
                    type="text"
                    value={mainInfo.location || ''}
                    onChange={(e) => setMainInfo({ ...mainInfo, location: e.target.value })}
                    className="w-full bg-card border border-gray-700 rounded-xl px-4 py-2.5 text-xs text-foreground"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase mb-2">Availability Status</label>
                  <input
                    type="text"
                    value={mainInfo.status || ''}
                    onChange={(e) => setMainInfo({ ...mainInfo, status: e.target.value })}
                    className="w-full bg-card border border-gray-700 rounded-xl px-4 py-2.5 text-xs text-foreground"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-300 uppercase mb-2">Full Intro Paragraph (About Me)</label>
                  <textarea
                    rows={4}
                    value={mainInfo.description || ''}
                    onChange={(e) => setMainInfo({ ...mainInfo, description: e.target.value })}
                    className="w-full bg-card border border-gray-700 rounded-2xl p-4 text-xs text-foreground leading-relaxed"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-300 uppercase mb-2">
                    Hero Role Badges (Comma Separated)
                  </label>
                  <input
                    type="text"
                    value={Array.isArray(mainInfo.roles) ? mainInfo.roles.join(', ') : ''}
                    onChange={(e) => setMainInfo({
                      ...mainInfo,
                      roles: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                    })}
                    placeholder="Penetration Tester, Bug Bounty Hunter, CTF Player..."
                    className="w-full bg-card border border-gray-700 rounded-xl px-4 py-2.5 text-xs text-foreground"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-300 uppercase mb-2">
                    CV / Resume Download Link
                  </label>
                  <input
                    type="text"
                    value={mainInfo.resumeUrl || ''}
                    onChange={(e) => setMainInfo({ ...mainInfo, resumeUrl: e.target.value })}
                    placeholder="e.g., https://drive.google.com/... or /resume.pdf"
                    className="w-full bg-card border border-gray-700 rounded-xl px-4 py-2.5 text-xs text-foreground focus:border-primary focus:outline-none"
                  />
                  <p className="text-[11px] text-gray-500 mt-1.5">
                    This link is used by the &quot;Download CV/Resume&quot; button on your home hero section. You can update it anytime to any Google Drive link, direct PDF, or file URL.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 3: EDUCATION */}
          {/* ==================================================== */}
          {activeTab === 'education' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="border-b border-gray-800 pb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-foreground">Academic Background</h2>
                  <p className="text-xs text-gray-400 mt-1">Manage university, colleges, degrees and academic periods.</p>
                </div>
                <button
                  onClick={() => {
                    setEducation([
                      ...education,
                      { id: `edu-${Date.now()}`, degree: 'New Degree', institution: 'University Name', period: '2024 - Present', major: '' }
                    ]);
                  }}
                  className="px-3.5 py-2 bg-primary hover:bg-primary/90 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
                >
                  <Plus size={14} /> Add Degree
                </button>
              </div>

              <div className="space-y-4">
                {education.map((edu, idx) => (
                  <div key={idx} className="bg-card border border-gray-800 p-5 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-primary font-mono">Degree #{idx + 1}</span>
                      <button
                        onClick={() => setEducation(education.filter((_, i) => i !== idx))}
                        className="text-rose-400 hover:text-rose-300 p-1 text-xs"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] text-gray-400 uppercase font-bold block mb-1">Degree Title</label>
                        <input
                          type="text"
                          value={edu.degree || ''}
                          onChange={(e) => {
                            const updated = [...education];
                            updated[idx].degree = e.target.value;
                            setEducation(updated);
                          }}
                          className="w-full bg-background border border-gray-700 rounded-lg p-2 text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-gray-400 uppercase font-bold block mb-1">Period (Years)</label>
                        <input
                          type="text"
                          value={edu.period || ''}
                          onChange={(e) => {
                            const updated = [...education];
                            updated[idx].period = e.target.value;
                            setEducation(updated);
                          }}
                          className="w-full bg-background border border-gray-700 rounded-lg p-2 text-xs font-mono"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-[10px] text-gray-400 uppercase font-bold block mb-1">Institution</label>
                        <input
                          type="text"
                          value={edu.institution || ''}
                          onChange={(e) => {
                            const updated = [...education];
                            updated[idx].institution = e.target.value;
                            setEducation(updated);
                          }}
                          className="w-full bg-background border border-gray-700 rounded-lg p-2 text-xs"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  onClick={() => saveSection('/api/education', education, 'Education')}
                  className="w-full py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg"
                >
                  <Save size={14} /> Save All Education Entries
                </button>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 4: SKILL & TOOLING */}
          {/* ==================================================== */}
          {activeTab === 'skills' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="border-b border-gray-800 pb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-foreground">Skill &amp; Tooling Categories</h2>
                  <p className="text-xs text-gray-400 mt-1">Customize skill boxes and tags on the homepage.</p>
                </div>
                <button
                  onClick={() => {
                    setSkills([
                      ...skills,
                      { id: `skill-${Date.now()}`, title: 'New Skill Category', skills: ['Tool 1', 'Tool 2'] }
                    ]);
                  }}
                  className="px-3.5 py-2 bg-primary hover:bg-primary/90 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
                >
                  <Plus size={14} /> Add Category
                </button>
              </div>

              <div className="space-y-4">
                {skills.map((category, idx) => (
                  <div key={idx} className="bg-card border border-gray-800 p-5 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-primary uppercase font-mono">Category #{idx + 1}</span>
                      <button
                        onClick={() => setSkills(skills.filter((_, i) => i !== idx))}
                        className="text-rose-400 hover:text-rose-300 p-1 text-xs"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-400 uppercase font-bold block mb-1">Category Title</label>
                      <input
                        type="text"
                        value={category.title || ''}
                        onChange={(e) => {
                          const updated = [...skills];
                          updated[idx].title = e.target.value;
                          setSkills(updated);
                        }}
                        className="w-full bg-background border border-gray-700 rounded-lg p-2 text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-400 uppercase font-bold block mb-1">
                        Skills / Tools (Comma Separated)
                      </label>
                      <input
                        type="text"
                        value={Array.isArray(category.skills) ? category.skills.join(', ') : ''}
                        onChange={(e) => {
                          const updated = [...skills];
                          updated[idx].skills = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                          setSkills(updated);
                        }}
                        className="w-full bg-background border border-gray-700 rounded-lg p-2 text-xs"
                      />
                    </div>
                  </div>
                ))}

                <button
                  onClick={() => saveSection('/api/skills', skills, 'Skills')}
                  className="w-full py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg"
                >
                  <Save size={14} /> Save All Skills
                </button>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 5: FEATURED PROJECTS */}
          {/* ==================================================== */}
          {activeTab === 'projects' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="border-b border-gray-800 pb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-foreground">Featured Projects</h2>
                  <p className="text-xs text-gray-400 mt-1">Add, edit, or delete security tools and open source projects.</p>
                </div>
                <button
                  onClick={() => {
                    setProjects([
                      {
                        id: `proj-${Date.now()}`,
                        title: 'New Security Project',
                        type: 'Security Tool',
                        date: '2024',
                        description: 'Project description here...',
                        tags: ['Python', 'Security'],
                        github: 'https://github.com/OxL3on'
                      },
                      ...projects
                    ]);
                  }}
                  className="px-3.5 py-2 bg-primary hover:bg-primary/90 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
                >
                  <Plus size={14} /> Add Project
                </button>
              </div>

              <div className="space-y-4">
                {projects.map((proj, idx) => (
                  <div key={idx} className="bg-card border border-gray-800 p-5 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-primary font-mono">Project #{idx + 1}</span>
                      <button
                        onClick={() => setProjects(projects.filter((_, i) => i !== idx))}
                        className="text-rose-400 hover:text-rose-300 p-1 text-xs"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2">
                        <label className="text-[10px] text-gray-400 uppercase font-bold block mb-1">Title</label>
                        <input
                          type="text"
                          value={proj.title || ''}
                          onChange={(e) => {
                            const updated = [...projects];
                            updated[idx].title = e.target.value;
                            setProjects(updated);
                          }}
                          className="w-full bg-background border border-gray-700 rounded-lg p-2 text-xs font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-gray-400 uppercase font-bold block mb-1">Type (Badge)</label>
                        <input
                          type="text"
                          value={proj.type || ''}
                          onChange={(e) => {
                            const updated = [...projects];
                            updated[idx].type = e.target.value;
                            setProjects(updated);
                          }}
                          className="w-full bg-background border border-gray-700 rounded-lg p-2 text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-gray-400 uppercase font-bold block mb-1">Year / Date</label>
                        <input
                          type="text"
                          value={proj.date || proj.Date || ''}
                          onChange={(e) => {
                            const updated = [...projects];
                            updated[idx].date = e.target.value;
                            setProjects(updated);
                          }}
                          className="w-full bg-background border border-gray-700 rounded-lg p-2 text-xs font-mono"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-[10px] text-gray-400 uppercase font-bold block mb-1">GitHub Repository URL</label>
                        <input
                          type="text"
                          value={proj.github || ''}
                          onChange={(e) => {
                            const updated = [...projects];
                            updated[idx].github = e.target.value;
                            setProjects(updated);
                          }}
                          className="w-full bg-background border border-gray-700 rounded-lg p-2 text-xs font-mono"
                        />
                      </div>
                      <div className="sm:col-span-3">
                        <label className="text-[10px] text-gray-400 uppercase font-bold block mb-1">Description</label>
                        <textarea
                          rows={2}
                          value={proj.description || ''}
                          onChange={(e) => {
                            const updated = [...projects];
                            updated[idx].description = e.target.value;
                            setProjects(updated);
                          }}
                          className="w-full bg-background border border-gray-700 rounded-lg p-2 text-xs"
                        />
                      </div>
                      <div className="sm:col-span-3">
                        <label className="text-[10px] text-gray-400 uppercase font-bold block mb-1">Tags (Comma Separated)</label>
                        <input
                          type="text"
                          value={Array.isArray(proj.tags) ? proj.tags.join(', ') : ''}
                          onChange={(e) => {
                            const updated = [...projects];
                            updated[idx].tags = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                            setProjects(updated);
                          }}
                          className="w-full bg-background border border-gray-700 rounded-lg p-2 text-xs"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  onClick={() => saveSection('/api/projects', projects, 'Projects')}
                  className="w-full py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg"
                >
                  <Save size={14} /> Save All Projects
                </button>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 6: SECURITY WRITEUPS & BLOGS */}
          {/* ==================================================== */}
          {activeTab === 'blogs' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="border-b border-gray-800 pb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-foreground">Writeups &amp; Blogs (Markdown CMS)</h2>
                  <p className="text-xs text-gray-400 mt-1">Full control over writeups, platforms, slugs, and Markdown content.</p>
                </div>
                <button
                  onClick={() => {
                    const newBlog = {
                      id: `blog-${Date.now()}`,
                      slug: `new-writeup-${Date.now()}`,
                      title: 'New Security Walkthrough',
                      category: 'TryHackMe',
                      platform: 'TryHackMe',
                      date: 'Oct 2024',
                      readTime: '6 min read',
                      author: 'MD Leon Islam',
                      github: '',
                      medium: '',
                      content: '# New Writeup\n\nWrite your markdown content here...'
                    };
                    setBlogs([newBlog, ...blogs]);
                  }}
                  className="px-3.5 py-2 bg-primary hover:bg-primary/90 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
                >
                  <Plus size={14} /> Add Writeup
                </button>
              </div>

              {/* Category Management Bar */}
              <div className="bg-background/40 border border-gray-800 p-4 rounded-2xl space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <span className="text-xs font-bold text-gray-300">
                    Categories ({blogCategories.length}):
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newCatInput}
                      onChange={(e) => setNewCatInput(e.target.value)}
                      onKeyDown={async (e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const trimmed = newCatInput.trim();
                          if (!trimmed) return;
                          try {
                            const res = await authFetch('/api/blog-categories', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ name: trimmed })
                            });
                            const data = await res.json().catch(() => ({}));
                            if (res.ok) {
                              const updatedList = Array.isArray(data.result)
                                ? data.result
                                : Array.from(new Set([...blogCategories, trimmed]));
                              setBlogCategories(updatedList);
                              setNewCatInput('');
                              notifySuccess(`Category "${trimmed}" added!`);
                            } else {
                              notifyError(data.error || 'Failed to add category');
                            }
                          } catch (err) {
                            notifyError('Failed to add category');
                          }
                        }
                      }}
                      placeholder="New category (e.g. VulnHub, Root me)"
                      className="bg-background border border-gray-700 rounded-lg px-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary w-48 sm:w-56"
                    />
                    <button
                      type="button"
                      onClick={async () => {
                        const trimmed = newCatInput.trim();
                        if (!trimmed) return;
                        try {
                          const res = await authFetch('/api/blog-categories', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ name: trimmed })
                          });
                          const data = await res.json().catch(() => ({}));
                          if (res.ok) {
                            const updatedList = Array.isArray(data.result)
                              ? data.result
                              : Array.from(new Set([...blogCategories, trimmed]));
                            setBlogCategories(updatedList);
                            setNewCatInput('');
                            notifySuccess(`Category "${trimmed}" added!`);
                          } else {
                            notifyError(data.error || 'Failed to add category');
                          }
                        } catch (err) {
                          notifyError('Failed to add category');
                        }
                      }}
                      className="px-3 py-1.5 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 rounded-lg text-xs font-bold flex items-center gap-1 transition-all"
                    >
                      <Plus size={12} /> Add Category
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {blogCategories.map(cat => {
                    const isEditingThis = editingCategory?.oldName === cat;

                    if (isEditingThis) {
                      return (
                        <span
                          key={cat}
                          className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-xl bg-primary/10 border border-primary/50 text-foreground font-medium"
                        >
                          <input
                            type="text"
                            value={editingCategory.value}
                            onChange={(e) => setEditingCategory({ ...editingCategory, value: e.target.value })}
                            onKeyDown={async (e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                const trimmed = (editingCategory.value || '').trim();
                                if (!trimmed) {
                                  notifyError('Category name cannot be empty');
                                  return;
                                }
                                if (trimmed.toLowerCase() === cat.toLowerCase() && trimmed === cat) {
                                  setEditingCategory(null);
                                  return;
                                }
                                try {
                                  const res = await authFetch('/api/blog-categories', {
                                    method: 'PUT',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ oldName: cat, newName: trimmed })
                                  });
                                  const data = await res.json().catch(() => ({}));
                                  if (res.ok) {
                                    const updatedList = Array.isArray(data.result)
                                      ? data.result
                                      : blogCategories.map(c => (c.toLowerCase() === cat.toLowerCase() ? trimmed : c));
                                    setBlogCategories(updatedList);
                                    setBlogs(prev => prev.map(b => {
                                      let modified = false;
                                      let updatedBlog = { ...b };
                                      if (b.platform && b.platform.toLowerCase() === cat.toLowerCase()) {
                                        updatedBlog.platform = trimmed;
                                        modified = true;
                                      }
                                      if (b.category && b.category.toLowerCase() === cat.toLowerCase()) {
                                        updatedBlog.category = trimmed;
                                        modified = true;
                                      }
                                      return modified ? updatedBlog : b;
                                    }));
                                    setEditingCategory(null);
                                    notifySuccess(`Category renamed to "${trimmed}"!`);
                                  } else {
                                    notifyError(data.error || 'Failed to rename category');
                                  }
                                } catch (err) {
                                  notifyError('Failed to rename category');
                                }
                              } else if (e.key === 'Escape') {
                                setEditingCategory(null);
                              }
                            }}
                            className="bg-background border border-primary/40 rounded px-2 py-0.5 text-xs text-foreground focus:outline-none focus:border-primary w-28 sm:w-36"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={async () => {
                              const trimmed = (editingCategory.value || '').trim();
                              if (!trimmed) {
                                notifyError('Category name cannot be empty');
                                return;
                              }
                              if (trimmed.toLowerCase() === cat.toLowerCase() && trimmed === cat) {
                                setEditingCategory(null);
                                return;
                              }
                              try {
                                const res = await authFetch('/api/blog-categories', {
                                  method: 'PUT',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ oldName: cat, newName: trimmed })
                                });
                                const data = await res.json().catch(() => ({}));
                                if (res.ok) {
                                  const updatedList = Array.isArray(data.result)
                                    ? data.result
                                    : blogCategories.map(c => (c.toLowerCase() === cat.toLowerCase() ? trimmed : c));
                                  setBlogCategories(updatedList);
                                  setBlogs(prev => prev.map(b => {
                                    let modified = false;
                                    let updatedBlog = { ...b };
                                    if (b.platform && b.platform.toLowerCase() === cat.toLowerCase()) {
                                      updatedBlog.platform = trimmed;
                                      modified = true;
                                    }
                                    if (b.category && b.category.toLowerCase() === cat.toLowerCase()) {
                                      updatedBlog.category = trimmed;
                                      modified = true;
                                    }
                                    return modified ? updatedBlog : b;
                                  }));
                                  setEditingCategory(null);
                                  notifySuccess(`Category renamed to "${trimmed}"!`);
                                } else {
                                  notifyError(data.error || 'Failed to rename category');
                                }
                              } catch (err) {
                                notifyError('Failed to rename category');
                              }
                            }}
                            className="text-emerald-400 hover:text-emerald-300 p-0.5 rounded transition-colors"
                            title="Save rename"
                          >
                            <Check size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingCategory(null)}
                            className="text-gray-400 hover:text-gray-200 p-0.5 rounded transition-colors"
                            title="Cancel"
                          >
                            <X size={13} />
                          </button>
                        </span>
                      );
                    }

                    return (
                      <span
                        key={cat}
                        className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl bg-card border border-gray-800 text-gray-200 font-medium group hover:border-gray-700 transition-colors"
                      >
                        <span
                          className="cursor-pointer hover:text-primary transition-colors"
                          onClick={() => setEditingCategory({ oldName: cat, value: cat })}
                          title="Click to rename"
                        >
                          {cat}
                        </span>
                        <button
                          type="button"
                          onClick={() => setEditingCategory({ oldName: cat, value: cat })}
                          className="text-gray-500 hover:text-primary p-0.5 rounded transition-colors ml-0.5"
                          title={`Rename category "${cat}"`}
                        >
                          <Edit2 size={11} />
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            if (!confirm(`Are you sure you want to delete the category "${cat}"? This will remove it from available categories.`)) return;
                            try {
                              const res = await authFetch(`/api/blog-categories?category=${encodeURIComponent(cat)}`, {
                                method: 'DELETE'
                              });
                              const data = await res.json().catch(() => ({}));
                              if (res.ok) {
                                const updatedList = Array.isArray(data.result)
                                  ? data.result
                                  : blogCategories.filter(c => c.toLowerCase() !== cat.toLowerCase());
                                setBlogCategories(updatedList);
                                notifySuccess(`Category "${cat}" removed successfully!`);
                              } else {
                                notifyError(data.error || `Failed to remove category "${cat}"`);
                              }
                            } catch (err) {
                              notifyError('Error removing category');
                            }
                          }}
                          className="text-gray-500 hover:text-rose-400 p-0.5 rounded transition-colors ml-0.5"
                          title={`Delete category "${cat}"`}
                        >
                          <X size={13} />
                        </button>
                      </span>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-6">
                {blogs.map((b, idx) => (
                  <div key={idx} className="bg-card border border-gray-800 p-6 rounded-2xl space-y-4">
                    <div className="flex items-center justify-between border-b border-gray-800/60 pb-3">
                      <span className="text-xs font-bold text-primary font-mono">
                        Writeup #{idx + 1} • {b.category || b.platform}
                      </span>
                      <button
                        onClick={() => setBlogs(blogs.filter((_, i) => i !== idx))}
                        className="text-rose-400 hover:text-rose-300 p-1 text-xs"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2">
                        <label className="text-[10px] text-gray-400 uppercase font-bold block mb-1">Title</label>
                        <input
                          type="text"
                          value={b.title || ''}
                          onChange={(e) => {
                            const updated = [...blogs];
                            updated[idx].title = e.target.value;
                            setBlogs(updated);
                          }}
                          className="w-full bg-background border border-gray-700 rounded-lg p-2 text-xs font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-gray-400 uppercase font-bold block mb-1">Slug (URL)</label>
                        <input
                          type="text"
                          value={b.slug || ''}
                          onChange={(e) => {
                            const updated = [...blogs];
                            updated[idx].slug = e.target.value;
                            setBlogs(updated);
                          }}
                          className="w-full bg-background border border-gray-700 rounded-lg p-2 text-xs font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-gray-400 uppercase font-bold block mb-1">
                          Platform / Category
                        </label>
                        <input
                          list={`luffy-categories-${idx}`}
                          type="text"
                          value={b.category || b.platform || 'TryHackMe'}
                          onChange={(e) => {
                            const updated = [...blogs];
                            updated[idx].category = e.target.value;
                            updated[idx].platform = e.target.value;
                            setBlogs(updated);
                          }}
                          placeholder="Select or type category..."
                          className="w-full bg-background border border-gray-700 rounded-lg p-2 text-xs font-bold text-primary"
                        />
                        <datalist id={`luffy-categories-${idx}`}>
                          {blogCategories.map(c => (
                            <option key={c} value={c} />
                          ))}
                        </datalist>
                      </div>
                      <div>
                        <label className="text-[10px] text-gray-400 uppercase font-bold block mb-1">Date</label>
                        <input
                          type="text"
                          value={b.date || ''}
                          onChange={(e) => {
                            const updated = [...blogs];
                            updated[idx].date = e.target.value;
                            setBlogs(updated);
                          }}
                          className="w-full bg-background border border-gray-700 rounded-lg p-2 text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-gray-400 uppercase font-bold block mb-1">Read Time</label>
                        <input
                          type="text"
                          value={b.readTime || ''}
                          onChange={(e) => {
                            const updated = [...blogs];
                            updated[idx].readTime = e.target.value;
                            setBlogs(updated);
                          }}
                          className="w-full bg-background border border-gray-700 rounded-lg p-2 text-xs"
                        />
                      </div>

                      {/* External Reading Destinations Control */}
                      <div className="sm:col-span-3 bg-background/60 p-4 rounded-xl border border-gray-800 space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-800/60 pb-2.5">
                          <div>
                            <span className="text-[11px] font-bold text-foreground flex items-center gap-1.5">
                              External Reading Destinations
                            </span>
                            <p className="text-[10px] text-gray-400">
                              Select where readers can access this writeup aside from your website (pick one, both, or neither).
                            </p>
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px]">
                            <button
                              type="button"
                              onClick={() => {
                                const updated = [...blogs];
                                updated[idx].github = '';
                                updated[idx].medium = '';
                                setBlogs(updated);
                              }}
                              className={`px-2 py-1 rounded-md border font-semibold transition-all ${
                                !b.github && !b.medium
                                  ? 'bg-primary/20 border-primary text-primary'
                                  : 'bg-background border-gray-800 text-gray-400 hover:text-foreground'
                              }`}
                            >
                              Website Only
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const updated = [...blogs];
                                if (!updated[idx].github) updated[idx].github = 'https://github.com/OxL3on';
                                updated[idx].medium = '';
                                setBlogs(updated);
                              }}
                              className={`px-2 py-1 rounded-md border font-semibold transition-all ${
                                b.github && !b.medium
                                  ? 'bg-primary/20 border-primary text-primary'
                                  : 'bg-background border-gray-800 text-gray-400 hover:text-foreground'
                              }`}
                            >
                              GitHub Only
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const updated = [...blogs];
                                updated[idx].github = '';
                                if (!updated[idx].medium) updated[idx].medium = 'https://medium.com/@OxL3on';
                                setBlogs(updated);
                              }}
                              className={`px-2 py-1 rounded-md border font-semibold transition-all ${
                                !b.github && b.medium
                                  ? 'bg-primary/20 border-primary text-primary'
                                  : 'bg-background border-gray-800 text-gray-400 hover:text-foreground'
                              }`}
                            >
                              Medium Only
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const updated = [...blogs];
                                if (!updated[idx].github) updated[idx].github = 'https://github.com/OxL3on';
                                if (!updated[idx].medium) updated[idx].medium = 'https://medium.com/@OxL3on';
                                setBlogs(updated);
                              }}
                              className={`px-2 py-1 rounded-md border font-semibold transition-all ${
                                b.github && b.medium
                                  ? 'bg-primary/20 border-primary text-primary'
                                  : 'bg-background border-gray-800 text-gray-400 hover:text-foreground'
                              }`}
                            >
                              Both
                            </button>
                          </div>
                        </div>

                        {/* Interactive Checkbox + URL Inputs */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                          {/* GitHub Choice */}
                          <div className={`p-3 rounded-lg border transition-all ${b.github ? 'bg-primary/5 border-primary/40' : 'bg-background/40 border-gray-800/80'}`}>
                            <label className="flex items-center gap-2 cursor-pointer mb-2">
                              <input
                                type="checkbox"
                                checked={Boolean(b.github && b.github.trim())}
                                onChange={(e) => {
                                  const updated = [...blogs];
                                  if (e.target.checked) {
                                    updated[idx].github = 'https://github.com/OxL3on';
                                  } else {
                                    updated[idx].github = '';
                                  }
                                  setBlogs(updated);
                                }}
                                className="w-3.5 h-3.5 accent-primary rounded cursor-pointer"
                              />
                              <span className="text-[11px] font-bold text-foreground flex items-center gap-1">
                                GitHub Writeup Link
                              </span>
                            </label>
                            <input
                              type="text"
                              disabled={!b.github && b.github !== undefined}
                              placeholder={b.github ? "https://github.com/..." : "Enable checkbox to specify GitHub link"}
                              value={b.github || ''}
                              onChange={(e) => {
                                const updated = [...blogs];
                                updated[idx].github = e.target.value;
                                setBlogs(updated);
                              }}
                              className="w-full bg-background border border-gray-700 disabled:opacity-40 disabled:bg-gray-900 rounded-lg p-2 text-xs font-mono"
                            />
                          </div>

                          {/* Medium Choice */}
                          <div className={`p-3 rounded-lg border transition-all ${b.medium ? 'bg-primary/5 border-primary/40' : 'bg-background/40 border-gray-800/80'}`}>
                            <label className="flex items-center gap-2 cursor-pointer mb-2">
                              <input
                                type="checkbox"
                                checked={Boolean(b.medium && b.medium.trim())}
                                onChange={(e) => {
                                  const updated = [...blogs];
                                  if (e.target.checked) {
                                    updated[idx].medium = 'https://medium.com/@OxL3on';
                                  } else {
                                    updated[idx].medium = '';
                                  }
                                  setBlogs(updated);
                                }}
                                className="w-3.5 h-3.5 accent-primary rounded cursor-pointer"
                              />
                              <span className="text-[11px] font-bold text-foreground flex items-center gap-1">
                                Medium Article Link
                              </span>
                            </label>
                            <input
                              type="text"
                              disabled={!b.medium && b.medium !== undefined}
                              placeholder={b.medium ? "https://medium.com/@..." : "Enable checkbox to specify Medium link"}
                              value={b.medium || ''}
                              onChange={(e) => {
                                const updated = [...blogs];
                                updated[idx].medium = e.target.value;
                                setBlogs(updated);
                              }}
                              className="w-full bg-background border border-gray-700 disabled:opacity-40 disabled:bg-gray-900 rounded-lg p-2 text-xs font-mono"
                            />
                          </div>
                        </div>

                        {/* Current Status Preview */}
                        <div className="text-[10px] text-gray-400 font-medium flex items-center gap-1.5 pt-1">
                          <span className="text-gray-500">Live preview for visitors:</span>
                          <span className="px-2 py-0.5 rounded-full bg-gray-800/80 text-gray-300 font-mono">
                            Website
                          </span>
                          {b.github && b.github.trim() && (
                            <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30 font-mono">
                              + GitHub
                            </span>
                          )}
                          {b.medium && b.medium.trim() && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono">
                              + Medium
                            </span>
                          )}
                          {!b.github?.trim() && !b.medium?.trim() && (
                            <span className="text-gray-500 italic">(Website Exclusive — no external links shown)</span>
                          )}
                        </div>
                      </div>
                      <div className="sm:col-span-3">
                        <label className="text-[10px] text-gray-400 uppercase font-bold block mb-1">
                          Full Markdown Content (Headers, Code blocks, Images \`![alt](url)\`)
                        </label>
                        <textarea
                          rows={6}
                          value={b.content || ''}
                          onChange={(e) => {
                            const updated = [...blogs];
                            updated[idx].content = e.target.value;
                            setBlogs(updated);
                          }}
                          className="w-full bg-background/90 border border-gray-700 rounded-xl p-3 text-xs font-mono text-gray-200 leading-relaxed"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  onClick={() => saveSection('/api/blogs', blogs, 'Blogs')}
                  className="w-full py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg"
                >
                  <Save size={14} /> Save All Writeups
                </button>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 7: CERTIFICATIONS */}
          {/* ==================================================== */}
          {activeTab === 'certifications' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="border-b border-gray-800 pb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-foreground">Certifications</h2>
                  <p className="text-xs text-gray-400 mt-1">Manage verified credentials, issuers, and verification URLs.</p>
                </div>
                <button
                  onClick={() => {
                    setCertifications([
                      {
                        id: `cert-${Date.now()}`,
                        title: 'New Certification Title',
                        issuer: 'CompTIA / INE / OffSec',
                        issueDate: '2024',
                        credentialId: 'CERT-123456',
                        verifyUrl: 'https://verify.com',
                        image: ''
                      },
                      ...certifications
                    ]);
                  }}
                  className="px-3.5 py-2 bg-primary hover:bg-primary/90 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
                >
                  <Plus size={14} /> Add Certification
                </button>
              </div>

              <div className="space-y-4">
                {certifications.map((cert, idx) => (
                  <div key={idx} className="bg-card border border-gray-800 p-5 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-primary font-mono">Certification #{idx + 1}</span>
                      <button
                        onClick={() => setCertifications(certifications.filter((_, i) => i !== idx))}
                        className="text-rose-400 hover:text-rose-300 p-1 text-xs"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] text-gray-400 uppercase font-bold block mb-1">Title</label>
                        <input
                          type="text"
                          value={cert.title || ''}
                          onChange={(e) => {
                            const updated = [...certifications];
                            updated[idx].title = e.target.value;
                            setCertifications(updated);
                          }}
                          className="w-full bg-background border border-gray-700 rounded-lg p-2 text-xs font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-gray-400 uppercase font-bold block mb-1">Issuer</label>
                        <input
                          type="text"
                          value={cert.issuer || ''}
                          onChange={(e) => {
                            const updated = [...certifications];
                            updated[idx].issuer = e.target.value;
                            setCertifications(updated);
                          }}
                          className="w-full bg-background border border-gray-700 rounded-lg p-2 text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-gray-400 uppercase font-bold block mb-1">Issue Date</label>
                        <input
                          type="text"
                          value={cert.issueDate || ''}
                          onChange={(e) => {
                            const updated = [...certifications];
                            updated[idx].issueDate = e.target.value;
                            setCertifications(updated);
                          }}
                          className="w-full bg-background border border-gray-700 rounded-lg p-2 text-xs font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-gray-400 uppercase font-bold block mb-1">Credential ID</label>
                        <input
                          type="text"
                          value={cert.credentialId || ''}
                          onChange={(e) => {
                            const updated = [...certifications];
                            updated[idx].credentialId = e.target.value;
                            setCertifications(updated);
                          }}
                          className="w-full bg-background border border-gray-700 rounded-lg p-2 text-xs font-mono"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-[10px] text-gray-400 uppercase font-bold block mb-1">Verification URL</label>
                        <input
                          type="text"
                          value={cert.verifyUrl || ''}
                          onChange={(e) => {
                            const updated = [...certifications];
                            updated[idx].verifyUrl = e.target.value;
                            setCertifications(updated);
                          }}
                          className="w-full bg-background border border-gray-700 rounded-lg p-2 text-xs font-mono"
                        />
                      </div>
                      <div className="sm:col-span-2 space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] text-gray-400 uppercase font-bold">
                            Certificate Image (Preview Banner)
                          </label>
                          <label className="cursor-pointer px-3 py-1 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 transition-all">
                            <Upload size={12} /> Upload from Computer
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleCertFileUpload(e, idx)}
                            />
                          </label>
                        </div>

                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={cert.image || ''}
                            onChange={(e) => {
                              const updated = [...certifications];
                              updated[idx].image = e.target.value;
                              setCertifications(updated);
                            }}
                            placeholder="Paste external image link (e.g. https://...) or upload image above"
                            className="w-full bg-background border border-gray-700 rounded-lg p-2 text-xs font-mono"
                          />
                          {cert.image && (
                            <button
                              type="button"
                              onClick={() => {
                                const updated = [...certifications];
                                updated[idx].image = '';
                                setCertifications(updated);
                              }}
                              className="px-2.5 py-1 text-xs text-rose-400 hover:bg-rose-500/10 border border-rose-500/30 rounded-lg transition-colors shrink-0"
                            >
                              Clear
                            </button>
                          )}
                        </div>

                        {cert.image && (
                          <div className="relative w-full h-36 bg-gray-950 rounded-xl overflow-hidden border border-gray-700 flex items-center justify-center">
                            <img
                              src={cert.image}
                              alt="Certificate Preview"
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                const errEl = e.currentTarget.parentElement?.querySelector('.cert-load-error');
                                if (errEl) errEl.classList.remove('hidden');
                              }}
                            />
                            <div className="cert-load-error hidden flex-col items-center justify-center text-xs text-amber-400 p-3 text-center">
                              <p className="font-bold">Image failed to load</p>
                              <p className="text-[10px] text-gray-400 mt-0.5">The external link might be private or blocked (403 Forbidden). Click "Upload from Computer" above to upload your certificate directly!</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  onClick={() => saveSection('/api/certifications', certifications, 'Certifications')}
                  className="w-full py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg"
                >
                  <Save size={14} /> Save All Certifications
                </button>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 8: ACHIEVEMENTS */}
          {/* ==================================================== */}
          {activeTab === 'achievements' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="border-b border-gray-800 pb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-foreground">Achievements &amp; Honors</h2>
                  <p className="text-xs text-gray-400 mt-1">Manage CTF podium finishes, cyber drills, and hackathon ranks.</p>
                </div>
                <button
                  onClick={() => {
                    setAchievements([
                      {
                        id: `ach-${Date.now()}`,
                        title: 'New Achievement Title',
                        type: 'Competition',
                        date: '2024',
                        rank: '1st Place',
                        result: 'Champion',
                        description: 'Detailed description of the achievement...'
                      },
                      ...achievements
                    ]);
                  }}
                  className="px-3.5 py-2 bg-primary hover:bg-primary/90 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
                >
                  <Plus size={14} /> Add Achievement
                </button>
              </div>

              <div className="space-y-4">
                {achievements.map((ach, idx) => (
                  <div key={idx} className="bg-card border border-gray-800 p-5 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-primary font-mono">Achievement #{idx + 1}</span>
                      <button
                        onClick={() => setAchievements(achievements.filter((_, i) => i !== idx))}
                        className="text-rose-400 hover:text-rose-300 p-1 text-xs"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2">
                        <label className="text-[10px] text-gray-400 uppercase font-bold block mb-1">Title</label>
                        <input
                          type="text"
                          value={ach.title || ''}
                          onChange={(e) => {
                            const updated = [...achievements];
                            updated[idx].title = e.target.value;
                            setAchievements(updated);
                          }}
                          className="w-full bg-background border border-gray-700 rounded-lg p-2 text-xs font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-gray-400 uppercase font-bold block mb-1">Type / Category</label>
                        <input
                          type="text"
                          value={ach.type || ''}
                          onChange={(e) => {
                            const updated = [...achievements];
                            updated[idx].type = e.target.value;
                            setAchievements(updated);
                          }}
                          className="w-full bg-background border border-gray-700 rounded-lg p-2 text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-gray-400 uppercase font-bold block mb-1">Date</label>
                        <input
                          type="text"
                          value={ach.date || ''}
                          onChange={(e) => {
                            const updated = [...achievements];
                            updated[idx].date = e.target.value;
                            setAchievements(updated);
                          }}
                          className="w-full bg-background border border-gray-700 rounded-lg p-2 text-xs font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-gray-400 uppercase font-bold block mb-1">Rank Metric</label>
                        <input
                          type="text"
                          value={ach.rank || ach.metric || ''}
                          onChange={(e) => {
                            const updated = [...achievements];
                            updated[idx].rank = e.target.value;
                            setAchievements(updated);
                          }}
                          className="w-full bg-background border border-gray-700 rounded-lg p-2 text-xs"
                        />
                      </div>
                      <div className="sm:col-span-3">
                        <label className="text-[10px] text-gray-400 uppercase font-bold block mb-1">Description</label>
                        <textarea
                          rows={2}
                          value={ach.description || ''}
                          onChange={(e) => {
                            const updated = [...achievements];
                            updated[idx].description = e.target.value;
                            setAchievements(updated);
                          }}
                          className="w-full bg-background border border-gray-700 rounded-lg p-2 text-xs"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  onClick={() => saveSection('/api/achievements', achievements, 'Achievements')}
                  className="w-full py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg"
                >
                  <Save size={14} /> Save All Achievements
                </button>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 9: SOCIAL & CONTACT LINKS */}
          {/* ==================================================== */}
          {activeTab === 'contact' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="border-b border-gray-800 pb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-foreground">Social &amp; Contact Links</h2>
                  <p className="text-xs text-gray-400 mt-1">Configure GitHub, LinkedIn, Discord, Twitter, TryHackMe, and HackTheBox profiles.</p>
                </div>
                <button
                  onClick={() => {
                    setContact([
                      ...contact,
                      { name: 'new-link', link: 'https://...' }
                    ]);
                  }}
                  className="px-3.5 py-2 bg-primary hover:bg-primary/90 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
                >
                  <Plus size={14} /> Add Social Link
                </button>
              </div>

              <div className="space-y-4">
                {contact.map((item, idx) => (
                  <div key={idx} className="bg-card border border-gray-800 p-4 rounded-xl flex flex-col sm:flex-row items-center gap-3">
                    <div className="w-full sm:w-40">
                      <label className="text-[10px] text-gray-400 uppercase font-bold block mb-1">Platform Name</label>
                      <input
                        type="text"
                        value={item.name || ''}
                        onChange={(e) => {
                          const updated = [...contact];
                          updated[idx].name = e.target.value;
                          setContact(updated);
                        }}
                        className="w-full bg-background border border-gray-700 rounded-lg p-2 text-xs font-bold"
                      />
                    </div>
                    <div className="w-full sm:flex-1">
                      <label className="text-[10px] text-gray-400 uppercase font-bold block mb-1">Profile / Channel URL</label>
                      <input
                        type="text"
                        value={item.link || ''}
                        onChange={(e) => {
                          const updated = [...contact];
                          updated[idx].link = e.target.value;
                          setContact(updated);
                        }}
                        className="w-full bg-background border border-gray-700 rounded-lg p-2 text-xs font-mono"
                      />
                    </div>
                    <button
                      onClick={() => setContact(contact.filter((_, i) => i !== idx))}
                      className="text-rose-400 hover:text-rose-300 p-2 sm:mt-5"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}

                <button
                  onClick={() => saveSection('/api/contact', contact, 'Contact Links')}
                  className="w-full py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg"
                >
                  <Save size={14} /> Save All Contact Links
                </button>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 10: SECURITY SETTINGS */}
          {/* ==================================================== */}
          {activeTab === 'settings' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="border-b border-gray-800 pb-4">
                <h2 className="text-xl sm:text-2xl font-bold text-foreground">Admin Security &amp; Key Settings</h2>
                <p className="text-xs text-gray-400 mt-1">Change master secret passcode for this unpredictable route.</p>
              </div>

              <form onSubmit={handleUpdatePasscode} className="bg-card border border-gray-800 p-6 rounded-2xl max-w-lg space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase mb-2">Current Master Passcode</label>
                  <input
                    type="password"
                    value={currentPasscode}
                    onChange={(e) => setCurrentPasscode(e.target.value)}
                    placeholder="Enter current master passcode..."
                    required
                    className="w-full bg-background border border-gray-700 rounded-xl px-4 py-2.5 text-xs text-foreground font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase mb-2">New Master Passcode</label>
                  <input
                    type="password"
                    value={newPasscode}
                    onChange={(e) => setNewPasscode(e.target.value)}
                    placeholder="Enter new strong passcode..."
                    required
                    className="w-full bg-background border border-gray-700 rounded-xl px-4 py-2.5 text-xs text-foreground font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-300 uppercase mb-2">Confirm New Passcode</label>
                  <input
                    type="password"
                    value={confirmPasscode}
                    onChange={(e) => setConfirmPasscode(e.target.value)}
                    placeholder="Repeat new passcode..."
                    required
                    className="w-full bg-background border border-gray-700 rounded-xl px-4 py-2.5 text-xs text-foreground font-mono"
                  />
                </div>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-lg"
                >
                  <KeyRound size={14} /> Update Master Passcode
                </button>
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
