"use client";
import React, { useState, useEffect } from 'react';

export default function MainInfoPage() {
  const [formData, setFormData] = useState({ name: '', description: '', image: '', resume: '', roadmap: '', gmail: ''});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('/api/maininfo').then(res => res.json()).then(data => {
      if(!data.message) setFormData(data);
      setLoading(false);
    });
  }, []);

  const handleChange = (e) => setFormData({...formData, [e.target.name]: e.target.value});

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const res = await fetch('/api/maininfo', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(formData)
      });
      if(res.ok) setMessage("Saved successfully!");
      else setMessage("Failed to save.");
    } catch(e) {
      setMessage("An error occurred.");
    }
    setSaving(false);
    setTimeout(() => setMessage(''), 3000);
  };

  if (loading) return <div className="text-foreground/50 animate-pulse">Loading Main Info...</div>;

  return (
    <div className="animate-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/60 w-fit">Edit Main Profile Info</h1>
        <p className="text-sm text-foreground/50 mt-2">These details appear on your home Intro and About timeline.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6 bg-card/60 backdrop-blur-md p-8 rounded-3xl border border-gray-800 shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground/80 ml-1">Full Name</label>
            <input type="text" name="name" value={formData.name || ''} onChange={handleChange} className="w-full bg-background/50 border border-gray-700/50 rounded-2xl px-5 py-3.5 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 text-foreground transition-all" required />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground/80 ml-1">Profile Image URL</label>
            <input type="text" name="image" value={formData.image || ''} onChange={handleChange} className="w-full bg-background/50 border border-gray-700/50 rounded-2xl px-5 py-3.5 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 text-foreground transition-all" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-semibold text-foreground/80 ml-1">Admin Email (Firebase Login Auth)</label>
            <input type="email" name="gmail" value={formData.gmail || ''} onChange={handleChange} placeholder="e.g., leonislamofficial123@gmail.com" className="w-full bg-background/50 border border-gray-700/50 rounded-2xl px-5 py-3.5 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 text-foreground transition-all" required />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground/80 ml-1">About Description</label>
          <textarea name="description" value={formData.description || ''} onChange={handleChange} rows={5} className="w-full bg-background/50 border border-gray-700/50 rounded-2xl px-5 py-3.5 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 text-foreground transition-all resize-none" required />
        </div>

        <div className="pt-4 border-t border-gray-800 flex items-center justify-between">
          <p className="text-primary text-sm font-medium h-5">{message}</p>
          <button type="submit" disabled={saving} className="bg-primary text-white px-8 py-3.5 rounded-2xl font-bold hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
