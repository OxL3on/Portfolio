"use client";
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { auth, signOut } from '@/lib/firebase';
import { LogOut, LayoutDashboard, User, Code2, GraduationCap, Briefcase, Award, FolderGit2, Mail, BookOpen, ShieldCheck } from 'lucide-react';

const menuItems = [
  { path: '/dashboard', name: 'Overview', icon: LayoutDashboard },
  { path: '/dashboard/maininfo', name: 'Main Info', icon: User },
  { path: '/dashboard/skills', name: 'Skills', icon: Code2 },
  { path: '/dashboard/education', name: 'Education', icon: GraduationCap },
  { path: '/dashboard/experience', name: 'Experience', icon: Briefcase },
  { path: '/dashboard/certifications', name: 'Certifications', icon: ShieldCheck },
  { path: '/dashboard/achievements', name: 'Achievements', icon: Award },
  { path: '/dashboard/projects', name: 'Projects', icon: FolderGit2 },
  { path: '/dashboard/blogs', name: 'Writeups / Blogs', icon: BookOpen },
  { path: '/dashboard/contact', name: 'Social Links', icon: Mail },
];

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  
  return (
    <aside className="w-64 bg-card/90 backdrop-blur-md border-r border-gray-800 h-screen sticky top-0 flex flex-col pt-8 z-50">
      <div className="px-6 mb-8">
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <span className="w-2 h-6 bg-primary rounded-full"></span>
          Dashboard
        </h2>
      </div>
      
      <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          const Icon = item.icon;
          return (
            <Link key={item.path} href={item.path} 
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${isActive ? 'bg-primary/10 text-primary font-bold' : 'text-foreground/60 hover:bg-gray-800/50 hover:text-foreground font-medium'}`}
            >
              <Icon size={18} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-800 mt-auto flex flex-col gap-2">
        <Link href="/" className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-800/50 hover:bg-primary/20 hover:text-primary rounded-xl transition-colors text-sm text-foreground/80 font-medium">
          View Live Website
        </Link>
        <button onClick={async () => { await signOut(auth); router.push('/'); }} className="flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl transition-colors text-sm font-medium w-full">
          <LogOut size={16} /> Logout
        </button>
      </div>
    </aside>
  );
}
