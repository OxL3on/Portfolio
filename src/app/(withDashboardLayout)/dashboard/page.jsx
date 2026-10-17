import React from 'react';
import { LayoutDashboard, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const sections = [
    { name: "Main Info", path: "/dashboard/maininfo", desc: "Update your name, intro, and description." },
    { name: "Skills", path: "/dashboard/skills", desc: "Add or edit technology groups and skills." },
    { name: "Education", path: "/dashboard/education", desc: "Manage your academic records." },
    { name: "Experience", path: "/dashboard/experience", desc: "Update your career timeline." },
    { name: "Projects", path: "/dashboard/projects", desc: "Showcase your latest works." },
    { name: "Writeups & Blogs", path: "/dashboard/blogs", desc: "Manage walkthroughs, research & external links." }
  ];

  return (
    <div className="animate-in fade-in zoom-in duration-500">
      <div className="mb-10 flex items-center gap-4">
         <div className="p-4 bg-primary/10 text-primary rounded-2xl shadow-inner border border-primary/20">
           <LayoutDashboard size={28} />
         </div>
         <div>
           <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Admin Dashboard</h1>
           <p className="text-foreground/60 mt-1">Easily manage your portfolio content dynamically.</p>
         </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {sections.map((sec, i) => (
           <Link key={i} href={sec.path} className="group bg-card/60 backdrop-blur-sm p-6 rounded-3xl border border-gray-800 shadow-sm hover:border-primary/50 hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-300">
             <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">{sec.name}</h3>
                  <p className="text-sm text-foreground/50 mt-2 leading-relaxed">{sec.desc}</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-gray-800/80 group-hover:bg-primary text-gray-400 group-hover:text-white flex items-center justify-center transition-all duration-300">
                  <CheckCircle size={14} />
                </div>
             </div>
           </Link>
         ))}
      </div>
    </div>
  );
}
