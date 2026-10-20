"use client";
import React, { useState, useEffect } from 'react';
import { Trash2, Plus, Edit2, Save } from 'lucide-react';
import Image from 'next/image';

export default function ProjectsPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ title: '', image: '', type: '', date: '', description: '', tags: '', github: '', live: '' });
  const [isEditing, setIsEditing] = useState(false);

  const fetchData = () => {
    setLoading(true);
    fetch('/api/projects').then(res => res.json()).then(d => {
      setData(Array.isArray(d) ? d : []);
      setLoading(false);
    });
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = isEditing ? 'PUT' : 'POST';
    
    // Convert tags from comma separated to array
    const tagsArray = formData.tags.split(',').map(s => s.trim()).filter(Boolean);
    
    await fetch('/api/projects', {
      method,
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ ...formData, tags: tagsArray })
    });
    setFormData({ title: '', image: '', type: '', date: '', description: '', tags: '', github: '', live: '' });
    setIsEditing(false);
    fetchData();
  };

  const handleDelete = async (title) => {
    if(!confirm('Delete this project?')) return;
    await fetch(`/api/projects?title=${encodeURIComponent(title)}`, { method: 'DELETE' });
    fetchData();
  };

  const handleEdit = (item) => {
    const tagsStr = Array.isArray(item.tags) ? item.tags.join(', ') : '';
    setFormData({ 
       title: item.title || '', 
       image: item.image || '', 
       type: item.type || '',
       date: item.date || '',
       description: item.description || '', 
       tags: tagsStr, 
       github: item.github || '', 
       live: item.live || '' 
    });
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) return <div className="text-foreground/50 animate-pulse">Loading Projects...</div>;

  return (
    <div className="animate-in slide-in-from-bottom-4 duration-500 pb-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/60 w-fit">Manage Projects</h1>
        <p className="text-sm text-foreground/50 mt-2">Add your awesome portfolio projects here.</p>
      </div>
      
      <form onSubmit={handleSubmit} className="mb-10 bg-card/50 backdrop-blur-sm p-6 lg:p-8 rounded-3xl border border-gray-800 shadow-lg space-y-6 transition-all focus-within:border-primary/40">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="space-y-2">
             <label className="block text-sm font-semibold text-foreground/80 ml-1">Project Title</label>
             <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-background/60 border border-gray-700/50 rounded-2xl px-5 py-3 focus:outline-none focus:border-primary disabled:opacity-50" required disabled={isEditing} placeholder="e.g. Task Manager App" />
           </div>
           <div className="space-y-2">
             <label className="block text-sm font-semibold text-foreground/80 ml-1">Type</label>
             <input type="text" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full bg-background/60 border border-gray-700/50 rounded-2xl px-5 py-3 focus:outline-none focus:border-primary" placeholder="e.g. Full-Stack Web App" />
           </div>
           <div className="space-y-2">
             <label className="block text-sm font-semibold text-foreground/80 ml-1">Image URL (Optional)</label>
             <input type="text" value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} className="w-full bg-background/60 border border-gray-700/50 rounded-2xl px-5 py-3 focus:outline-none focus:border-primary" placeholder="https://... (Optional)" />
           </div>
           <div className="space-y-2">
             <label className="block text-sm font-semibold text-foreground/80 ml-1">Date</label>
             <input type="text" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full bg-background/60 border border-gray-700/50 rounded-2xl px-5 py-3 focus:outline-none focus:border-primary" placeholder="e.g. 2024" />
           </div>
           <div className="space-y-2 md:col-span-2">
             <label className="block text-sm font-semibold text-foreground/80 ml-1">Description</label>
             <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={3} className="w-full bg-background/60 border border-gray-700/50 rounded-2xl px-5 py-3 focus:outline-none focus:border-primary resize-none" required placeholder="Project overview..."></textarea>
           </div>
           <div className="space-y-2 md:col-span-2">
             <label className="block text-sm font-semibold text-foreground/80 ml-1">Tags (Comma Separated)</label>
             <input type="text" value={formData.tags} onChange={e => setFormData({...formData, tags: e.target.value})} className="w-full bg-background/60 border border-gray-700/50 rounded-2xl px-5 py-3 focus:outline-none focus:border-primary" required placeholder="React, Node.js, Tailwnind" />
           </div>
           <div className="space-y-2">
             <label className="block text-sm font-semibold text-foreground/80 ml-1">GitHub Link</label>
             <input type="text" value={formData.github} onChange={e => setFormData({...formData, github: e.target.value})} className="w-full bg-background/60 border border-gray-700/50 rounded-2xl px-5 py-3 focus:outline-none focus:border-primary" placeholder="https://github.com/..." />
           </div>
           <div className="space-y-2">
             <label className="block text-sm font-semibold text-foreground/80 ml-1">Live Link</label>
             <input type="text" value={formData.live} onChange={e => setFormData({...formData, live: e.target.value})} className="w-full bg-background/60 border border-gray-700/50 rounded-2xl px-5 py-3 focus:outline-none focus:border-primary" placeholder="https://..." />
           </div>
         </div>
         <div className="flex flex-col lg:flex-row gap-4 pt-4 border-t border-gray-800">
           <button type="submit" className="flex-1 bg-primary text-white px-8 py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 hover:-translate-y-0.5 transition-all shadow-md">
             {isEditing ? <Save size={18} /> : <Plus size={18} />} {isEditing ? 'Update Project' : 'Add Project'}
           </button>
           {isEditing && (
             <button type="button" onClick={() => { setIsEditing(false); setFormData({title: '', image: '', type: '', date: '', description: '', tags: '', github: '', live: ''}); }} className="px-8 py-3.5 text-white bg-gray-800 rounded-2xl hover:bg-gray-700 font-medium transition-colors">Cancel Edit</button>
           )}
         </div>
      </form>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         {data.map(item => (
           <div key={item.title} className="bg-card/40 backdrop-blur-sm rounded-3xl border border-gray-800/60 hover:border-gray-700 hover:bg-card/60 transition-all group overflow-hidden flex flex-col p-6 justify-between">
             <div>
               <div className="flex items-center justify-between mb-2">
                 <span className="text-xs text-primary font-bold px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20">
                   {item.type}
                 </span>
                 <div className="flex gap-2">
                   <button onClick={() => handleEdit(item)} className="p-1.5 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded-lg transition-colors"><Edit2 size={15} /></button>
                   <button onClick={() => handleDelete(item.title)} className="p-1.5 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg transition-colors"><Trash2 size={15} /></button>
                 </div>
               </div>
               <h3 className="font-bold text-xl text-foreground mt-2">{item.title}</h3>
               <p className="text-sm text-foreground/70 mt-3 line-clamp-3 leading-relaxed">{item.description}</p>
             </div>
             <div className="flex flex-wrap gap-2 mt-5 pt-4 border-t border-gray-800/60">
               {(item.tags||[]).slice(0,3).map(t => <span key={t} className="text-[10px] px-2.5 py-1 bg-gray-900 border border-gray-800 rounded-lg text-gray-300 font-mono">{t}</span>)}
               {(item.tags||[]).length > 3 && <span className="text-[10px] px-2.5 py-1 bg-gray-900 border border-gray-800 rounded-lg text-gray-400 font-mono">+{item.tags.length - 3} more</span>}
             </div>
           </div>
         ))}
         {data.length === 0 && <p className="text-foreground/50 col-span-full text-center py-10 bg-card/20 rounded-3xl border border-dashed border-gray-800">No projects added yet.</p>}
      </div>
    </div>
  );
}
