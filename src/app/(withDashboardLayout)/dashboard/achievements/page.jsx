"use client";
import React, { useState, useEffect } from 'react';
import { Trash2, Plus, Edit2, Save, Star } from 'lucide-react';

export default function AchievementsPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ title: '', type: '', date: '', rank: '', result: '', featured: false });
  const [isEditing, setIsEditing] = useState(false);

  const fetchData = () => {
    setLoading(true);
    fetch('/api/achievements').then(res => res.json()).then(d => {
      setData(Array.isArray(d) ? d : []);
      setLoading(false);
    });
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = isEditing ? 'PUT' : 'POST';
    await fetch('/api/achievements', {
      method,
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(formData)
    });
    setFormData({ title: '', type: '', date: '', rank: '', result: '' });
    setIsEditing(false);
    fetchData();
  };

  const handleDelete = async (title) => {
    if(!confirm('Delete this achievement?')) return;
    await fetch(`/api/achievements?title=${encodeURIComponent(title)}`, { method: 'DELETE' });
    fetchData();
  };

  
  const handleToggleFeatured = async (item) => {
    const updatedFeatured = !item.featured;
    try {
      await fetch('/api/achievements', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ ...item, featured: updatedFeatured })
      });
      setData(prev => prev.map(a => (a.title === item.title ? { ...a, featured: updatedFeatured } : a)));
    } catch (e) {}
  };

  const handleEdit = (item) => {
    setFormData({ title: item.title || '', type: item.type || '', date: item.date || '', rank: item.rank || '', result: item.result || '', featured: Boolean(item.featured) });
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) return <div className="text-foreground/50 animate-pulse">Loading Achievements...</div>;

  return (
    <div className="animate-in slide-in-from-bottom-4 duration-500 pb-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/60 w-fit">Manage Achievements</h1>
        <p className="text-sm text-foreground/50 mt-2">Add your competitive programming ranks, hackathon results, or awards.</p>
      </div>
      
      <form onSubmit={handleSubmit} className="mb-10 bg-card/50 backdrop-blur-sm p-6 lg:p-8 rounded-3xl border border-gray-800 shadow-lg space-y-6 transition-all focus-within:border-primary/40">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="space-y-2">
             <label className="block text-sm font-semibold text-foreground/80 ml-1">Achievement Title</label>
             <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-background/60 border border-gray-700/50 rounded-2xl px-5 py-3 focus:outline-none focus:border-primary disabled:opacity-50" required disabled={isEditing} placeholder="e.g. ICPC Regional" />
             {isEditing && <p className="text-xs text-yellow-500 ml-1">Title cannot be changed while editing.</p>}
           </div>
           <div className="space-y-2">
             <label className="block text-sm font-semibold text-foreground/80 ml-1">Type / Category</label>
             <input type="text" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full bg-background/60 border border-gray-700/50 rounded-2xl px-5 py-3 focus:outline-none focus:border-primary" placeholder="e.g. Programming Contest" />
           </div>
           <div className="space-y-2">
             <label className="block text-sm font-semibold text-foreground/80 ml-1">Date / Year</label>
             <input type="text" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full bg-background/60 border border-gray-700/50 rounded-2xl px-5 py-3 focus:outline-none focus:border-primary" placeholder="e.g. Nov 2023" />
           </div>
           <div className="space-y-2">
             <label className="block text-sm font-semibold text-foreground/80 ml-1">Rank / Position</label>
             <input type="text" value={formData.rank} onChange={e => setFormData({...formData, rank: e.target.value})} className="w-full bg-background/60 border border-gray-700/50 rounded-2xl px-5 py-3 focus:outline-none focus:border-primary" placeholder="e.g. 1st Place" />
           </div>
         </div>
         <div className="space-y-2">
            <label className="block text-sm font-semibold text-foreground/80 ml-1">Additional Result / Description</label>
            <textarea value={formData.result} onChange={e => setFormData({...formData, result: e.target.value})} rows={2} className="w-full bg-background/60 border border-gray-700/50 rounded-2xl px-5 py-3 focus:outline-none focus:border-primary resize-none" placeholder="Solved 5 problems, highest in university..."></textarea>
         </div>
         <div className="pt-2">
            <label className="inline-flex items-center gap-2.5 cursor-pointer bg-background/50 border border-gray-800 hover:border-gray-700 px-4 py-2.5 rounded-2xl transition-all">
              <input
                type="checkbox"
                checked={Boolean(formData.featured)}
                onChange={e => setFormData({ ...formData, featured: e.target.checked })}
                className="rounded border-gray-700 bg-background text-primary focus:ring-primary h-4 w-4"
              />
              <span className="text-sm font-semibold text-foreground/80 flex items-center gap-1.5">
                <Star size={14} className={formData.featured ? "fill-amber-400 text-amber-400" : "text-gray-400"} />
                Feature this achievement on the Home Page
              </span>
            </label>
          </div>
          <div className="flex flex-col lg:flex-row gap-4 pt-4 border-t border-gray-800">
           <button type="submit" className="flex-1 bg-primary text-white px-8 py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 hover:-translate-y-0.5 transition-all shadow-md">
             {isEditing ? <Save size={18} /> : <Plus size={18} />} {isEditing ? 'Update Achievement' : 'Add Achievement'}
           </button>
           {isEditing && (
             <button type="button" onClick={() => { setIsEditing(false); setFormData({title: '', type: '', date: '', rank: '', result: ''}); }} className="px-8 py-3.5 text-white bg-gray-800 rounded-2xl hover:bg-gray-700 font-medium transition-colors">Cancel Edit</button>
           )}
         </div>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         {data.map(item => (
           <div key={item.title} className="bg-card/40 backdrop-blur-sm p-6 rounded-3xl border border-gray-800/60 hover:border-gray-700 hover:bg-card/60 transition-all group relative">
             <div className="absolute top-4 right-4 flex items-center gap-1.5 z-10">
                <button
                  type="button"
                  onClick={() => handleToggleFeatured(item)}
                  className={`px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                    item.featured
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm"
                      : "bg-gray-800/80 text-gray-400 hover:text-gray-200 opacity-0 group-hover:opacity-100"
                  }`}
                  title={item.featured ? "Featured on Home (Click to unfeature)" : "Click to feature on Home page"}
                >
                  <Star size={13} className={item.featured ? "fill-amber-400 text-amber-400" : "text-gray-400"} />
                  <span className="hidden sm:inline">{item.featured ? "Featured" : "Feature"}</span>
                </button>
               <button onClick={() => handleEdit(item)} className="p-2 bg-blue-500/10 text-blue-400 rounded-xl hover:bg-blue-500 hover:text-white transition-colors"><Edit2 size={16} /></button>
               <button onClick={() => handleDelete(item.title)} className="p-2 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-colors"><Trash2 size={16} /></button>
             </div>
             <h3 className="font-bold text-xl text-foreground pr-20">{item.title}</h3>
             <p className="text-primary text-sm font-medium mt-1">{item.type} {item.date && `• ${item.date}`}</p>
             <div className="mt-3 flex items-center gap-2">
                 <span className="px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full text-xs font-bold">{item.rank}</span>
             </div>
             {item.result && <p className="text-sm text-foreground/70 mt-3">{item.result}</p>}
           </div>
         ))}
         {data.length === 0 && <p className="text-foreground/50 col-span-full text-center py-10 bg-card/20 rounded-3xl border border-dashed border-gray-800">No achievements added.</p>}
      </div>
    </div>
  );
}
