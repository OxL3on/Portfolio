"use client";
import React, { useState, useEffect } from 'react';
import { Trash2, Plus, Edit2, Save, Award, ExternalLink, ShieldCheck } from 'lucide-react';

export default function DashboardCertificationsPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    issuer: '',
    issueDate: '',
    credentialId: '',
    verifyUrl: '',
    image: '',
    description: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');

  const fetchData = () => {
    setLoading(true);
    fetch('/api/certifications')
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaveStatus('Saving certification...');
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const res = await fetch('/api/certifications', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setFormData({
          title: '',
          issuer: '',
          issueDate: '',
          credentialId: '',
          verifyUrl: '',
          image: '',
          description: ''
        });
        setIsEditing(false);
        setSaveStatus('Certification saved successfully!');
        setTimeout(() => setSaveStatus(''), 3000);
        fetchData();
      } else {
        const err = await res.json();
        setSaveStatus(`Error: ${err.error || 'Failed to save'}`);
      }
    } catch (err) {
      setSaveStatus('Failed to save certification.');
    }
  };

  const handleDelete = async (title) => {
    if (!confirm(`Delete certification "${title}"?`)) return;
    await fetch(`/api/certifications?title=${encodeURIComponent(title)}`, { method: 'DELETE' });
    fetchData();
  };

  const handleEdit = (item) => {
    setFormData({
      id: item.id || '',
      title: item.title || '',
      issuer: item.issuer || '',
      issueDate: item.issueDate || '',
      credentialId: item.credentialId || '',
      verifyUrl: item.verifyUrl || '',
      image: item.image || '',
      description: item.description || ''
    });
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return <div className="text-foreground/50 animate-pulse py-10">Loading Certifications...</div>;
  }

  return (
    <div className="animate-in slide-in-from-bottom-4 duration-500 pb-16">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/60 w-fit">
            Manage Certifications
          </h1>
          <p className="text-sm text-foreground/50 mt-2">
            Add cybersecurity accreditations, credential IDs, and certificate image preview banners.
          </p>
        </div>
        {saveStatus && (
          <span className="text-xs px-3 py-1.5 rounded-xl bg-primary/20 text-primary border border-primary/30 font-medium">
            {saveStatus}
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="mb-10 bg-card/50 backdrop-blur-sm p-6 lg:p-8 rounded-3xl border border-gray-800 shadow-lg space-y-6 transition-all focus-within:border-primary/40">
        <div className="flex items-center justify-between border-b border-gray-800/80 pb-3">
          <span className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-2">
            <Award size={16} /> {isEditing ? 'Editing Certification' : 'Add New Certification'}
          </span>
          {isEditing && (
            <span className="text-[11px] text-yellow-500 font-medium">Editing mode active</span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-foreground/80 ml-1">Certification Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-background/60 border border-gray-700/50 rounded-2xl px-5 py-3 focus:outline-none focus:border-primary text-sm font-medium"
              required
              placeholder="e.g. eLearnSecurity Junior Penetration Tester (eJPT)"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-foreground/80 ml-1">Issuer Organization</label>
            <input
              type="text"
              value={formData.issuer}
              onChange={e => setFormData({ ...formData, issuer: e.target.value })}
              className="w-full bg-background/60 border border-gray-700/50 rounded-2xl px-5 py-3 focus:outline-none focus:border-primary text-sm"
              required
              placeholder="e.g. INE Security, CompTIA, OffSec"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-foreground/80 ml-1">Issue Date / Year</label>
            <input
              type="text"
              value={formData.issueDate}
              onChange={e => setFormData({ ...formData, issueDate: e.target.value })}
              className="w-full bg-background/60 border border-gray-700/50 rounded-2xl px-5 py-3 focus:outline-none focus:border-primary text-sm"
              placeholder="e.g. Oct 2024"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-foreground/80 ml-1">Credential ID</label>
            <input
              type="text"
              value={formData.credentialId}
              onChange={e => setFormData({ ...formData, credentialId: e.target.value })}
              className="w-full bg-background/60 border border-gray-700/50 rounded-2xl px-5 py-3 focus:outline-none focus:border-primary text-sm font-mono"
              placeholder="e.g. INE-EJPT-849201"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-foreground/80 ml-1">Verification URL</label>
            <input
              type="text"
              value={formData.verifyUrl}
              onChange={e => setFormData({ ...formData, verifyUrl: e.target.value })}
              className="w-full bg-background/60 border border-gray-700/50 rounded-2xl px-5 py-3 focus:outline-none focus:border-primary text-sm"
              placeholder="https://verify.issuer.com/..."
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-foreground/80 ml-1">Certificate Image URL (Preview Banner)</label>
            <input
              type="text"
              value={formData.image}
              onChange={e => setFormData({ ...formData, image: e.target.value })}
              className="w-full bg-background/60 border border-gray-700/50 rounded-2xl px-5 py-3 focus:outline-none focus:border-primary text-sm font-mono"
              placeholder="https://... or /cert.png (Optional)"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="block text-sm font-semibold text-foreground/80 ml-1">Overview / Description</label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-background/60 border border-gray-700/50 rounded-2xl p-4 focus:outline-none focus:border-primary text-sm resize-none"
              placeholder="Brief description of skills tested or syllabus covered..."
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-800">
          <button
            type="submit"
            className="flex-1 bg-primary text-white px-8 py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 hover:-translate-y-0.5 transition-all shadow-md"
          >
            {isEditing ? <Save size={18} /> : <Plus size={18} />}
            {isEditing ? 'Update Certification' : 'Add Certification'}
          </button>
          {isEditing && (
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                setFormData({
                  title: '',
                  issuer: '',
                  issueDate: '',
                  credentialId: '',
                  verifyUrl: '',
                  image: '',
                  description: ''
                });
              }}
              className="px-8 py-3.5 text-white bg-gray-800 rounded-2xl hover:bg-gray-700 font-medium transition-colors"
            >
              Cancel Edit
            </button>
          )}
        </div>
      </form>

      <div className="space-y-4">
        <h2 className="text-xl font-bold text-foreground">
          Existing Certifications ({data.length})
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {data.map((item, idx) => (
            <div
              key={item.id || idx}
              className="bg-card/40 backdrop-blur-sm rounded-3xl border border-gray-800/80 hover:border-gray-700 transition-all group overflow-hidden flex flex-col justify-between"
            >
              {/* Upper half: image preview */}
              <div className="h-44 w-full relative bg-gray-950 overflow-hidden border-b border-gray-800/80 flex items-center justify-center">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center gap-1.5 text-gray-500 p-4">
                    <Award size={28} className="text-primary/40" />
                    <span className="text-xs font-bold text-gray-400">{item.issuer}</span>
                    <span className="text-[10px] text-gray-600 font-mono">No Image Uploaded</span>
                  </div>
                )}
                <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <button
                    onClick={() => handleEdit(item)}
                    className="p-1.5 bg-blue-500/20 text-blue-400 hover:bg-blue-500 hover:text-white rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(item.title)}
                    className="p-1.5 bg-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Bottom half: details */}
              <div className="p-5 flex flex-col justify-between grow space-y-3">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <ShieldCheck size={16} className="text-primary" />
                    <span className="text-xs font-bold text-primary">{item.issuer}</span>
                    <span className="text-gray-600">•</span>
                    <span className="text-xs text-gray-400 font-mono">{item.issueDate}</span>
                  </div>
                  <h3 className="font-bold text-lg text-foreground leading-snug">{item.title}</h3>
                  {item.description && (
                    <p className="text-xs text-foreground/70 mt-2 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-gray-800/60 flex items-center justify-between text-xs">
                  <span className="text-gray-500 font-mono text-[11px]">
                    ID: {item.credentialId || "N/A"}
                  </span>
                  {item.verifyUrl && (
                    <a
                      href={item.verifyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline font-semibold flex items-center gap-1"
                    >
                      Verify <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}

          {data.length === 0 && (
            <p className="text-foreground/50 col-span-full text-center py-10 bg-card/20 rounded-3xl border border-dashed border-gray-800">
              No certifications added yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
