"use client";
import React, { useState, useEffect } from 'react';
import { Trash2, Plus, Edit2, Save, BookOpen, ExternalLink, Github, CheckCircle2 } from 'lucide-react';

const CATEGORIES = [
  'TryHackMe',
  'Hack The Box',
  'CTF Writeups',
  'Security Research'
];

export default function DashboardBlogsPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');

  const initialForm = {
    title: '',
    slug: '',
    category: 'TryHackMe',
    platform: 'TryHackMe',
    date: '',
    readTime: '',
    author: 'MD Leon Islam',
    github: '',
    medium: '',
    content: ''
  };

  const [formData, setFormData] = useState(initialForm);

  const fetchData = () => {
    setLoading(true);
    fetch('/api/blogs')
      .then(res => res.json())
      .then(d => {
        setData(Array.isArray(d) ? d : []);
        setLoading(false);
      })
      .catch(() => {
        setData([]);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTitleChange = (e) => {
    const titleVal = e.target.value;
    if (!isEditing) {
      // Auto-generate slug from title if new
      const autoSlug = titleVal
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setFormData(prev => ({ ...prev, title: titleVal, slug: autoSlug }));
    } else {
      setFormData(prev => ({ ...prev, title: titleVal }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaveStatus('Saving writeup...');
    const method = isEditing ? 'PUT' : 'POST';

    const payload = {
      ...formData,
      github: formData.github.trim(),
      medium: formData.medium.trim()
    };

    try {
      const res = await fetch('/api/blogs', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setFormData(initialForm);
        setIsEditing(false);
        setSaveStatus('Writeup saved successfully!');
        setTimeout(() => setSaveStatus(''), 3000);
        fetchData();
      } else {
        const err = await res.json();
        setSaveStatus(`Failed to save: ${err.error || 'Server error'}`);
      }
    } catch (err) {
      setSaveStatus('Failed to save writeup.');
    }
  };

  const handleDelete = async (item) => {
    if (!confirm(`Delete writeup "${item.title}"?`)) return;
    await fetch(`/api/blogs?slug=${encodeURIComponent(item.slug || '')}&title=${encodeURIComponent(item.title || '')}`, {
      method: 'DELETE'
    });
    fetchData();
  };

  const handleEdit = (item) => {
    setFormData({
      id: item.id || '',
      title: item.title || '',
      slug: item.slug || '',
      category: item.category || item.platform || 'TryHackMe',
      platform: item.platform || item.category || 'TryHackMe',
      date: item.date || '',
      readTime: item.readTime || '',
      author: item.author || 'MD Leon Islam',
      github: item.github || '',
      medium: item.medium || '',
      content: item.content || ''
    });
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return <div className="text-foreground/50 animate-pulse py-10">Loading Writeups &amp; Blogs...</div>;
  }

  const hasGithub = Boolean(formData.github && formData.github.trim());
  const hasMedium = Boolean(formData.medium && formData.medium.trim());

  return (
    <div className="animate-in slide-in-from-bottom-4 duration-500 pb-16">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/60 w-fit">
            Manage Writeups &amp; Blogs
          </h1>
          <p className="text-sm text-foreground/50 mt-2">
            Publish walkthroughs and choose where readers can access them (website only, GitHub, Medium, or both).
          </p>
        </div>
        {saveStatus && (
          <span className="text-xs px-3 py-1.5 rounded-xl bg-primary/20 text-primary border border-primary/30 font-medium">
            {saveStatus}
          </span>
        )}
      </div>

      {/* Editor Form */}
      <form onSubmit={handleSubmit} className="mb-10 bg-card/50 backdrop-blur-sm p-6 lg:p-8 rounded-3xl border border-gray-800 shadow-lg space-y-6 transition-all focus-within:border-primary/40">
        <div className="flex items-center justify-between border-b border-gray-800/80 pb-3">
          <span className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-2">
            <BookOpen size={16} /> {isEditing ? 'Editing Existing Writeup' : 'Create New Writeup'}
          </span>
          {isEditing && (
            <span className="text-[11px] text-yellow-500 font-medium">
              Editing mode active
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="md:col-span-2 space-y-2">
            <label className="block text-sm font-semibold text-foreground/80 ml-1">Writeup Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={handleTitleChange}
              className="w-full bg-background/60 border border-gray-700/50 rounded-2xl px-5 py-3 focus:outline-none focus:border-primary text-sm font-medium"
              required
              placeholder="e.g. TryHackMe: Blue (EternalBlue MS17-010 Walkthrough)"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-foreground/80 ml-1">URL Slug</label>
            <input
              type="text"
              value={formData.slug}
              onChange={e => setFormData({ ...formData, slug: e.target.value })}
              className="w-full bg-background/60 border border-gray-700/50 rounded-2xl px-5 py-3 focus:outline-none focus:border-primary text-xs font-mono"
              required
              placeholder="thm-blue-eternalblue"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-foreground/80 ml-1">Platform / Category</label>
            <select
              value={formData.category}
              onChange={e => setFormData({ ...formData, category: e.target.value, platform: e.target.value })}
              className="w-full bg-background/60 border border-gray-700/50 rounded-2xl px-5 py-3 focus:outline-none focus:border-primary text-sm text-primary font-bold"
            >
              {CATEGORIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-foreground/80 ml-1">Date</label>
            <input
              type="text"
              value={formData.date}
              onChange={e => setFormData({ ...formData, date: e.target.value })}
              className="w-full bg-background/60 border border-gray-700/50 rounded-2xl px-5 py-3 focus:outline-none focus:border-primary text-sm"
              placeholder="e.g. Oct 2024"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-foreground/80 ml-1">Read Time</label>
            <input
              type="text"
              value={formData.readTime}
              onChange={e => setFormData({ ...formData, readTime: e.target.value })}
              className="w-full bg-background/60 border border-gray-700/50 rounded-2xl px-5 py-3 focus:outline-none focus:border-primary text-sm"
              placeholder="e.g. 6 min read"
            />
          </div>
        </div>

        {/* Where can visitors read this article: External Platforms Control */}
        <div className="p-5 rounded-2xl bg-background/50 border border-gray-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-800/80 pb-3">
            <div>
              <h3 className="text-sm font-bold text-foreground">External Reading Destinations</h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Control where visitors can read this writeup aside from your website. Select one, both, or neither.
              </p>
            </div>
            {/* Quick Presets */}
            <div className="flex items-center gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, github: '', medium: '' })}
                className={`px-3 py-1.5 rounded-xl border font-semibold transition-all ${
                  !hasGithub && !hasMedium
                    ? 'bg-primary/20 border-primary text-primary'
                    : 'bg-background border-gray-800 text-gray-400 hover:text-foreground'
                }`}
              >
                Website Only
              </button>
              <button
                type="button"
                onClick={() => setFormData({
                  ...formData,
                  github: formData.github || 'https://github.com/OxL3on',
                  medium: ''
                })}
                className={`px-3 py-1.5 rounded-xl border font-semibold transition-all ${
                  hasGithub && !hasMedium
                    ? 'bg-primary/20 border-primary text-primary'
                    : 'bg-background border-gray-800 text-gray-400 hover:text-foreground'
                }`}
              >
                GitHub Only
              </button>
              <button
                type="button"
                onClick={() => setFormData({
                  ...formData,
                  github: '',
                  medium: formData.medium || 'https://medium.com/@OxL3on'
                })}
                className={`px-3 py-1.5 rounded-xl border font-semibold transition-all ${
                  !hasGithub && hasMedium
                    ? 'bg-primary/20 border-primary text-primary'
                    : 'bg-background border-gray-800 text-gray-400 hover:text-foreground'
                }`}
              >
                Medium Only
              </button>
              <button
                type="button"
                onClick={() => setFormData({
                  ...formData,
                  github: formData.github || 'https://github.com/OxL3on',
                  medium: formData.medium || 'https://medium.com/@OxL3on'
                })}
                className={`px-3 py-1.5 rounded-xl border font-semibold transition-all ${
                  hasGithub && hasMedium
                    ? 'bg-primary/20 border-primary text-primary'
                    : 'bg-background border-gray-800 text-gray-400 hover:text-foreground'
                }`}
              >
                Both
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* GitHub Option */}
            <div className={`p-4 rounded-xl border transition-all ${hasGithub ? 'bg-primary/5 border-primary/30' : 'bg-background/30 border-gray-800'}`}>
              <label className="flex items-center gap-2.5 cursor-pointer mb-2.5">
                <input
                  type="checkbox"
                  checked={hasGithub}
                  onChange={e => {
                    if (e.target.checked) {
                      setFormData({ ...formData, github: formData.github || 'https://github.com/OxL3on' });
                    } else {
                      setFormData({ ...formData, github: '' });
                    }
                  }}
                  className="w-4 h-4 accent-primary rounded cursor-pointer"
                />
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Github size={14} /> Enable GitHub Link
                </span>
              </label>
              <input
                type="text"
                disabled={!hasGithub}
                value={formData.github}
                onChange={e => setFormData({ ...formData, github: e.target.value })}
                placeholder={hasGithub ? "https://github.com/..." : "Enable checkbox to specify GitHub link"}
                className="w-full bg-background border border-gray-700/60 disabled:opacity-40 rounded-xl px-4 py-2.5 text-xs font-mono focus:outline-none focus:border-primary"
              />
            </div>

            {/* Medium Option */}
            <div className={`p-4 rounded-xl border transition-all ${hasMedium ? 'bg-primary/5 border-primary/30' : 'bg-background/30 border-gray-800'}`}>
              <label className="flex items-center gap-2.5 cursor-pointer mb-2.5">
                <input
                  type="checkbox"
                  checked={hasMedium}
                  onChange={e => {
                    if (e.target.checked) {
                      setFormData({ ...formData, medium: formData.medium || 'https://medium.com/@OxL3on' });
                    } else {
                      setFormData({ ...formData, medium: '' });
                    }
                  }}
                  className="w-4 h-4 accent-primary rounded cursor-pointer"
                />
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <ExternalLink size={14} /> Enable Medium Link
                </span>
              </label>
              <input
                type="text"
                disabled={!hasMedium}
                value={formData.medium}
                onChange={e => setFormData({ ...formData, medium: e.target.value })}
                placeholder={hasMedium ? "https://medium.com/@..." : "Enable checkbox to specify Medium link"}
                className="w-full bg-background border border-gray-700/60 disabled:opacity-40 rounded-xl px-4 py-2.5 text-xs font-mono focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          {/* Destination Preview indicator */}
          <div className="flex items-center gap-2 text-xs text-gray-400 pt-1">
            <span className="text-gray-500">Live reader destinations:</span>
            <span className="px-2.5 py-1 rounded-lg bg-gray-800 text-gray-300 font-mono text-[11px]">
              🌐 Website (Always Included)
            </span>
            {hasGithub && (
              <span className="px-2.5 py-1 rounded-lg bg-primary/20 text-primary border border-primary/30 font-mono text-[11px]">
                🐙 GitHub
              </span>
            )}
            {hasMedium && (
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono text-[11px]">
                ✍️ Medium
              </span>
            )}
            {!hasGithub && !hasMedium && (
              <span className="text-gray-500 text-[11px] italic">
                (Exclusive to website — no external links shown)
              </span>
            )}
          </div>
        </div>

        {/* Markdown Content */}
        <div className="space-y-2">
          <div className="flex items-center justify-between ml-1">
            <label className="block text-sm font-semibold text-foreground/80">Full Markdown Content</label>
            <span className="text-xs text-gray-500 font-mono">
              {formData.content.length} characters • {formData.content.split('\n').length} lines
            </span>
          </div>
          <textarea
            rows={10}
            value={formData.content}
            onChange={e => setFormData({ ...formData, content: e.target.value })}
            className="w-full bg-background/80 border border-gray-700/60 rounded-2xl p-5 text-xs font-mono text-gray-200 leading-relaxed focus:outline-none focus:border-primary"
            placeholder="# Title&#10;&#10;Write your walkthrough markdown here..."
            required
          />
        </div>

        {/* Form Actions */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-800">
          <button
            type="submit"
            className="flex-1 bg-primary text-white px-8 py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 hover:-translate-y-0.5 transition-all shadow-md"
          >
            {isEditing ? <Save size={18} /> : <Plus size={18} />}
            {isEditing ? 'Update Writeup' : 'Publish Writeup'}
          </button>
          {isEditing && (
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                setFormData(initialForm);
              }}
              className="px-8 py-3.5 text-white bg-gray-800 rounded-2xl hover:bg-gray-700 font-medium transition-colors"
            >
              Cancel Edit
            </button>
          )}
        </div>
      </form>

      {/* Published Writeups List */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-foreground">
          Existing Writeups ({data.length})
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.map((item, idx) => {
            const itemGithub = Boolean(item.github && item.github.trim());
            const itemMedium = Boolean(item.medium && item.medium.trim());

            return (
              <div
                key={item.slug || idx}
                className="bg-card/50 backdrop-blur-sm rounded-2xl border border-gray-800 p-5 flex flex-col justify-between hover:border-gray-700 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[11px] font-bold text-primary px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20">
                      {item.category || item.platform || 'Writeup'}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleEdit(item)}
                        className="p-1.5 text-gray-400 hover:text-primary transition-colors"
                        title="Edit writeup"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(item)}
                        className="p-1.5 text-gray-400 hover:text-rose-400 transition-colors"
                        title="Delete writeup"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-foreground line-clamp-2">
                    {item.title}
                  </h3>
                  <p className="text-xs text-gray-400 font-mono mt-1">
                    /{item.slug}
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-800/60 mt-4 space-y-2">
                  <div className="text-[11px] text-gray-400">
                    {item.date} • {item.readTime}
                  </div>

                  <div className="flex items-center gap-2 text-xs flex-wrap">
                    <span className="text-[11px] text-gray-500">Read on:</span>
                    <span className="px-2 py-0.5 rounded-md bg-gray-800 text-gray-300 text-[10px] font-mono">
                      Website
                    </span>
                    {itemGithub && (
                      <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20 text-[10px] font-mono">
                        GitHub
                      </span>
                    )}
                    {itemMedium && (
                      <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono">
                        Medium
                      </span>
                    )}
                    {!itemGithub && !itemMedium && (
                      <span className="text-[10px] text-gray-500 italic">
                        (Website only)
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {data.length === 0 && (
            <p className="text-foreground/50 col-span-full text-center py-10 bg-card/20 rounded-3xl border border-dashed border-gray-800">
              No writeups found. Create your first writeup above!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
