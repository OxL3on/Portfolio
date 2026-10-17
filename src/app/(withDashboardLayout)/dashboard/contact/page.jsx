"use client";
import React, { useState, useEffect } from 'react';
import { Trash2, Plus, Edit2, Save } from 'lucide-react';

export default function ContactPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ id: '', name: '', username: '', link: '' });
  const [isEditing, setIsEditing] = useState(false);

  const fetchData = () => {
    setLoading(true);
    fetch('/api/contact').then(res => res.json()).then(d => {
      setData(Array.isArray(d) ? d : []);
      setLoading(false);
    });
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = isEditing ? 'PUT' : 'POST';
    const payload = isEditing ? formData : { name: formData.name, username: formData.username, link: formData.link };
    
    await fetch('/api/contact', {
      method,
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(payload)
    });
    setFormData({ id: '', name: '', username: '', link: '' });
    setIsEditing(false);
    fetchData();
  };

  const handleDelete = async (id) => {
    if(!confirm('Delete this contact link?')) return;
    await fetch(`/api/contact?id=${id}`, { method: 'DELETE' });
    fetchData();
  };

  const handleEdit = (item) => {
    setFormData({ id: item._id, name: item.name || '', username: item.username || '', link: item.link || '' });
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) return <div className="text-foreground/50 animate-pulse">Loading Contacts...</div>;

  return (
    <div className="animate-in slide-in-from-bottom-4 duration-500 pb-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/60 w-fit">Manage Social Links</h1>
        <p className="text-sm text-foreground/50 mt-2">Add or update your social media profiles and contact links.</p>
      </div>
      
      <form onSubmit={handleSubmit} className="mb-10 bg-card/50 backdrop-blur-sm p-6 lg:p-8 rounded-3xl border border-gray-800 shadow-lg space-y-6 transition-all focus-within:border-primary/40">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="space-y-2">
             <label className="block text-sm font-semibold text-foreground/80 ml-1">Platform Name</label>
             <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-background/60 border border-gray-700/50 rounded-2xl px-5 py-3 focus:outline-none focus:border-primary disabled:opacity-50" required placeholder="e.g. GitHub, LinkedIn, Twitter" />
           </div>
           <div className="space-y-2">
             <label className="block text-sm font-semibold text-foreground/80 ml-1">Username / Handle</label>
             <input type="text" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} className="w-full bg-background/60 border border-gray-700/50 rounded-2xl px-5 py-3 focus:outline-none focus:border-primary" required placeholder="e.g. @OxL3on" />
           </div>
           <div className="space-y-2 md:col-span-2">
             <label className="block text-sm font-semibold text-foreground/80 ml-1">Profile Link / URL</label>
             <input type="url" value={formData.link} onChange={e => setFormData({...formData, link: e.target.value})} className="w-full bg-background/60 border border-gray-700/50 rounded-2xl px-5 py-3 focus:outline-none focus:border-primary" required placeholder="https://github.com/OxL3on" />
           </div>
         </div>
         <div className="flex flex-col lg:flex-row gap-4 pt-4 border-t border-gray-800">
           <button type="submit" className="flex-1 bg-primary text-white px-8 py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 hover:-translate-y-0.5 transition-all shadow-md">
             {isEditing ? <Save size={18} /> : <Plus size={18} />} {isEditing ? 'Update Link' : 'Add Link'}
           </button>
           {isEditing && (
             <button type="button" onClick={() => { setIsEditing(false); setFormData({id: '', name: '', username: '', link: ''}); }} className="px-8 py-3.5 text-white bg-gray-800 rounded-2xl hover:bg-gray-700 font-medium transition-colors">Cancel Edit</button>
           )}
         </div>
      </form>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
         {data.map(item => (
           <div key={item._id} className="bg-card/40 backdrop-blur-sm p-5 rounded-2xl border border-gray-800/60 hover:border-gray-700 hover:bg-card/60 transition-all group flex items-center justify-between">
             <div className="overflow-hidden">
               <h3 className="font-bold text-base text-foreground">{item.name}</h3>
               <p className="text-primary text-xs font-medium mt-1 truncate">{item.username}</p>
               <a href={item.link} target="_blank" rel="noreferrer" className="text-[11px] text-gray-500 hover:text-gray-300 mt-2 block truncate max-w-[200px]">{item.link}</a>
             </div>
             <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
               <button onClick={() => handleEdit(item)} className="p-2 bg-blue-500/10 text-blue-400 rounded-xl hover:bg-blue-500 hover:text-white transition-colors"><Edit2 size={14} /></button>
               <button onClick={() => handleDelete(item._id)} className="p-2 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-colors"><Trash2 size={14} /></button>
             </div>
           </div>
         ))}
         {data.length === 0 && <p className="text-foreground/50 col-span-full text-center py-8 bg-card/20 rounded-2xl border border-dashed border-gray-800">No social links added yet.</p>}
      </div>
    </div>
  );
}
