"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import PageLoader from '@/components/shared/PageLoader';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  User, 
  Github, 
  ExternalLink, 
  Share2, 
  Check, 
  Copy, 
  Image as ImageIcon, 
  PlusCircle, 
  Edit3, 
  Eye, 
  Save, 
  RotateCcw,
  X,
  Upload
} from 'lucide-react';

const fallbackPosts = [
  {
    slug: "sql-injection-modern-web-apps",
    title: "Deep Dive into Modern SQL Injection and Defense Mechanisms",
    excerpt: "Exploring blind, error-based, and second-order SQL injection vectors in modern microservices architectures and how parameterized queries prevent them.",
    date: "Oct 2024",
    readTime: "7 min read",
    author: "MD Leon Islam",
    github: "https://github.com/OxL3on",
    medium: "https://medium.com/@OxL3on",
    content: `# Deep Dive into Modern SQL Injection and Defense Mechanisms

SQL Injection (SQLi) remains one of the most persistent and critical security flaws in web applications. Despite parameterized queries being well-known, modern microservices and complex dynamic report builders frequently introduce vulnerable injection surfaces.

![Security Architecture & Threat Vectors](/china-mountains.jpg)

---

## 1. Vulnerability Fundamentals
SQL Injection occurs when user-supplied input is directly concatenated or unsafely formatted into an active database query without proper validation or parameter binding:

\`\`\`sql
-- Vulnerable dynamic query pattern
SELECT id, username, email FROM accounts 
WHERE username = 'admin' AND password = '' OR '1'='1';
\`\`\`

When this input is executed by the database engine, the logical condition \`'1'='1'\` always evaluates to \`TRUE\`, effectively bypassing authentication checks entirely.

---

## 2. Advanced Attack Vectors

### A. Second-Order SQL Injection
In second-order attacks, the malicious payload is stored in the database first (e.g., during profile registration) and later executed unsafely in a different administrative workflow:

\`\`\`python
# Attacker registers with a crafted username
malicious_user = "admin'--"

# Later, an administrative reporting job triggers the stored value unsafely:
cursor.execute(f"UPDATE login_logs SET status = 'active' WHERE username = '{malicious_user}'")
\`\`\`

### B. Time-Based Blind Extraction
When an application returns identical HTTP status codes and suppresses error messages, attackers use database sleep functions to extract data character by character:

\`\`\`sql
-- PostgreSQL time delay payload for data extraction
SELECT CASE WHEN (SELECT substring(password, 1, 1) FROM users WHERE username='admin')='a' 
       THEN pg_sleep(5) 
       ELSE pg_sleep(0) END;
\`\`\`

---

## 3. Defense & Remediation Matrix

Never trust user-supplied input. Always utilize parameterized queries and prepared statements:

| Mitigation Strategy | Effectiveness | Implementation Details |
|---|---|---|
| **Prepared Statements (Parameterized)** | 100% against injection | Database compiles SQL template first, treating inputs strictly as literal values. |
| **Object-Relational Mapping (ORM)** | High | Use built-in ORM abstractions (Prisma, Hibernate, SQLAlchemy) safely. |
| **Input Sanitization & Allowlisting** | Defense in Depth | Enforce strict regex validation on user identifiers. |

\`\`\`javascript
// Secure parameterized implementation using PostgreSQL in Node.js
const query = 'SELECT id, email, role FROM accounts WHERE id = $1';
const values = [userId];
const result = await pool.query(query, values);
\`\`\`

### Summary
SQL Injection is completely preventable by avoiding raw string concatenation in queries and enforcing prepared statements at every data tier.
`
  },
  {
    slug: "linux-privilege-escalation-techniques",
    title: "Essential Linux Privilege Escalation Techniques for CTF & Pentesting",
    excerpt: "A tactical walkthrough of SUID binaries, cron jobs, sudo misconfigurations, and kernel exploit enumerations commonly encountered in offensive security.",
    date: "Sep 2024",
    readTime: "10 min read",
    author: "MD Leon Islam",
    github: "https://github.com/OxL3on",
    medium: "https://medium.com/@OxL3on",
    content: `# Essential Linux Privilege Escalation Techniques for CTF & Pentesting

Gaining an initial foothold via a reverse shell is only the first step. Privilege escalation (PrivEsc) is the methodology used to elevate from low-privileged user access to \`root\`.

![Terminal and Offensive Security Tools](/profile.jpg)

---

## 1. Initial Reconnaissance & Enumeration
Before running automated scripts, execute basic manual enumeration commands to understand system privileges:

\`\`\`bash
# Check current user and groups
id
whoami

# List sudo privileges without requiring password
sudo -l

# Check Linux kernel and distribution release
uname -a
cat /etc/os-release
\`\`\`

---

## 2. Abusing SUID / SGID Binaries
Files with the SUID (Set User ID) bit set execute with the file owner's permissions, typically \`root\`.

To discover all SUID binaries across the filesystem:
\`\`\`bash
find / -perm -u=s -type f 2>/dev/null
\`\`\`

Look out for uncommon or custom binaries or GTFOBins staples such as \`vim\`, \`nmap\`, \`bash\`, or \`find\`:

\`\`\`bash
# Example: Escaping through SUID find
find . -exec /bin/sh -p \\; -quit
\`\`\`

---

## 3. Vulnerable Sudo Permissions (GTFOBins)
If \`sudo -l\` reveals permissions like \`(root) NOPASSWD: /usr/bin/python3\`, you can immediately spawn a root shell:

\`\`\`bash
sudo python3 -c 'import os; os.system("/bin/bash")'
\`\`\`

Always check [GTFOBins](https://gtfobins.github.io) for verified bypasses against binary binaries.
`
  },
  {
    slug: "api-security-jwt-vulnerabilities",
    title: "Breaking and Securing JSON Web Tokens (JWT) in REST APIs",
    excerpt: "Common cryptographic pitfalls in JWT implementations: 'None' algorithm attacks, weak HMAC secret brute-forcing, and JWK header injection.",
    date: "Aug 2024",
    readTime: "6 min read",
    author: "MD Leon Islam",
    github: "https://github.com/OxL3on",
    medium: "https://medium.com/@OxL3on",
    content: `# Breaking and Securing JSON Web Tokens (JWT) in REST APIs

JSON Web Tokens (JWT) are widely adopted for stateless authentication in modern web APIs. However, improper signature verification and algorithmic confusion often introduce severe authentication bypasses.

---

## 1. JWT Structure Breakdown
A standard JSON Web Token consists of three base64url-encoded parts separated by periods:
1. **Header**: Contains token type and signing algorithm (\`{"alg": "HS256", "typ": "JWT"}\`)
2. **Payload**: Contains session claims and user metadata (\`{"sub": "1234", "role": "user"}\`)
3. **Signature**: Cryptographic proof guaranteeing integrity

---

## 2. Classic Flaws & Exploits

### A. The "None" Algorithm Flaw
Some outdated libraries accept tokens signed with \`"alg": "none"\`, completely ignoring signature verification:

\`\`\`python
# Header payload with none algorithm
{
  "alg": "none",
  "typ": "JWT"
}
\`\`\`
By stripping the signature and changing \`"role": "admin"\`, an attacker can gain unauthorized administrative privileges.

### B. Weak HMAC Secrets
When tokens are signed using \`HS256\` with short or dictionary secrets, tools like \`hashcat\` or \`jwt-tool\` can brute-force the secret key offline in minutes:

\`\`\`bash
hashcat -m 16500 jwt.txt /usr/share/wordlists/rockyou.txt
\`\`\`

---

## 3. Remediation Checklist
- Always enforce explicit algorithm whitelisting on the verification server.
- Use strong, asymmetric keys (\`RS256\` or \`EdDSA\`) with at least 2048-bit length.
- Never rely on the client-specified \`alg\` header to determine the verification logic.
`
  },
  {
    slug: "recon-methodology-bug-bounty",
    title: "My Reconnaissance Methodology for Bug Bounty Hunting",
    excerpt: "From subdomain enumeration and port scanning to visual discovery and JS secret scraping: how to build an efficient bug bounty hunting pipeline.",
    date: "Jul 2024",
    readTime: "8 min read",
    author: "MD Leon Islam",
    github: "https://github.com/OxL3on",
    medium: "https://medium.com/@OxL3on",
    content: `# My Reconnaissance Methodology for Bug Bounty Hunting

In bug bounty programs with wide scopes (\`*.target.com\`), quality reconnaissance accounts for over 80% of finding novel bugs before other hunters.

---

## 1. Asset Discovery Pipeline

1. **Subdomain Enumeration**:
   - Passive sources: Certificate Transparency logs (crt.sh), VirusTotal, SecurityTrails.
   - Active brute-forcing with \`shuffledns\` or \`massdns\`.

2. **Port Probing & Service Discovery**:
   \`\`\`bash
   # Probe alive HTTP/HTTPS services
   cat subdomains.txt | httpx -silent -title -status-code -tech-detect
   \`\`\`

3. **JavaScript Endpoint Analysis**:
   - Extract hidden API routes and token leaks using \`katana\` and \`gau\`.
`
  }
];

const formatExternalUrl = (url, fallback = '') => {
  if (!url || typeof url !== 'string') return fallback;
  const trimmed = url.trim();
  if (!trimmed) return fallback;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
};

// Helper code block component with copy button
const CodeBlock = ({ children, className }) => {
  const [copied, setCopied] = useState(false);
  const codeText = String(children).replace(/\n$/, '');
  const language = className ? className.replace('language-', '') : '';

  const handleCopy = () => {
    navigator.clipboard.writeText(codeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group my-5 rounded-2xl overflow-hidden border border-gray-800 bg-gray-950/90 shadow-xl">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-900/80 border-b border-gray-800/80 text-xs text-gray-400">
        <span className="font-mono uppercase font-bold text-primary/80">{language || 'code'}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gray-800/60 hover:bg-primary/20 hover:text-primary text-gray-300 transition-all text-[11px] font-semibold"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check size={12} className="text-emerald-400" />
              <span className="text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy size={12} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <div className="p-4 overflow-x-auto text-sm font-mono text-gray-200 leading-relaxed">
        <pre className="!bg-transparent !p-0 !m-0">
          <code>{codeText}</code>
        </pre>
      </div>
    </div>
  );
};

export default function BlogPostPage() {
  const params = useParams();
  const slug = params?.slug;
  const router = useRouter();

  const [post, setPost] = useState(null);
  const [markdown, setMarkdown] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [copiedShare, setCopiedShare] = useState(false);

  // Image Adder & Editor state
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [imageAlt, setImageAlt] = useState('');
  const [imageCaption, setImageCaption] = useState('');
  const [activeTab, setActiveTab] = useState('image'); // 'image' or 'markdown'
  const [customMarkdown, setCustomMarkdown] = useState('');

  // Scroll to top instantly when page loads
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [slug]);

  useEffect(() => {
    const fetchPost = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/blogs?slug=${slug}`);
        const data = await res.json();
        
        let found = null;
        if (data && data.title) {
          found = data;
        } else if (Array.isArray(data)) {
          found = data.find(b => b.slug === slug);
        }

        if (!found) {
          found = fallbackPosts.find(b => b.slug === slug) || fallbackPosts[0];
        }

        // Check if user previously edited this in localStorage
        const savedCustom = localStorage.getItem(`blog_content_${slug}`);
        const initialContent = savedCustom || found.content || found.excerpt || '';

        setPost(found);
        setMarkdown(initialContent);
        setCustomMarkdown(initialContent);
      } catch (e) {
        const found = fallbackPosts.find(b => b.slug === slug) || fallbackPosts[0];
        setPost(found);
        setMarkdown(found.content);
        setCustomMarkdown(found.content);
      } finally {
        setIsLoading(false);
      }
    };

    if (slug) {
      fetchPost();
    }
  }, [slug]);

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    }
  };

  // Image adder handler
  const handleInsertImage = (e) => {
    e.preventDefault();
    if (!imageUrl) return;

    const alt = imageAlt || 'Security Diagram';
    const captionText = imageCaption ? `\n*${imageCaption}*\n` : '\n';
    const imageMarkdown = `\n\n![${alt}](${imageUrl})${captionText}\n`;

    const updated = markdown + imageMarkdown;
    setMarkdown(updated);
    setCustomMarkdown(updated);
    localStorage.setItem(`blog_content_${slug}`, updated);

    // Reset inputs & close
    setImageUrl('');
    setImageAlt('');
    setImageCaption('');
    setIsEditorOpen(false);
  };

  // Local file upload to Data URI for instant image adder
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setImageUrl(event.target.result);
      if (!imageAlt) {
        setImageAlt(file.name.replace(/\.[^/.]+$/, ""));
      }
    };
    reader.readAsDataURL(file);
  };

  // Save manual markdown edits
  const handleSaveMarkdown = () => {
    setMarkdown(customMarkdown);
    localStorage.setItem(`blog_content_${slug}`, customMarkdown);
    setIsEditorOpen(false);
  };

  // Reset to original
  const handleResetOriginal = () => {
    if (post) {
      localStorage.removeItem(`blog_content_${slug}`);
      setMarkdown(post.content || '');
      setCustomMarkdown(post.content || '');
      setIsEditorOpen(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[70vh] w-full">
        <PageLoader />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-gray-200">Writeup Not Found</h2>
        <Link href="/blog" className="mt-4 inline-block text-primary hover:underline">
          Return to All Writeups
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 relative z-10 -mt-20 lg:-mt-24">
      {/* Top Back Navigation Bar */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-background/60 hover:bg-card border border-gray-800 hover:border-gray-700 text-gray-300 hover:text-primary text-xs font-semibold transition-all backdrop-blur-md shadow-lg"
        >
          <ArrowLeft size={14} /> Back to all writeups
        </Link>

        {/* Action Controls: Add Image / Edit + Share */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEditorOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary text-xs font-bold transition-all shadow-lg"
            title="Add image or edit markdown content"
          >
            <ImageIcon size={14} />
            <span>Add Image / Edit</span>
          </button>

          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-background/60 hover:bg-card border border-gray-800 hover:border-gray-700 text-gray-300 hover:text-foreground text-xs font-semibold transition-all"
            title="Copy share link"
          >
            {copiedShare ? (
              <>
                <Check size={14} className="text-emerald-400" />
                <span className="text-emerald-400">Link Copied!</span>
              </>
            ) : (
              <>
                <Share2 size={14} />
                <span>Share</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Article Container */}
      <article className="bg-card/90 backdrop-blur-md border border-gray-800 rounded-3xl p-6 sm:p-10 md:p-14 shadow-2xl relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10 pointer-events-none" />

        {/* Article Header */}
        <header className="mb-10 pb-8 border-b border-gray-800/80">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-foreground tracking-tight leading-tight mb-6">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-gray-400 font-medium">
            <div className="flex items-center gap-3">
              <span className="text-gray-200 font-semibold flex items-center gap-1.5">
                <User size={13} className="text-primary" /> {post.author || "MD Leon Islam"}
              </span>
              <span className="text-gray-700">•</span>
              <span className="flex items-center gap-1.5">
                <Calendar size={13} className="text-primary/70" /> {post.date}
              </span>
              <span className="text-gray-700">•</span>
              <span className="flex items-center gap-1.5">
                <Clock size={13} className="text-primary/70" /> {post.readTime}
              </span>
            </div>

            {/* Social / External Links */}
            <div className="flex items-center gap-3">
              <a
                href={formatExternalUrl(post.github, "https://github.com/OxL3on")}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-gray-400 hover:text-primary transition-colors font-semibold"
              >
                <Github size={13} /> GitHub
              </a>
              <span className="text-gray-700">•</span>
              <a
                href={formatExternalUrl(post.medium, "https://medium.com/@OxL3on")}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-gray-400 hover:text-primary transition-colors font-semibold"
              >
                <ExternalLink size={13} /> Medium
              </a>
            </div>
          </div>
        </header>

        {/* Rendered Markdown Content */}
        <div className="prose prose-invert max-w-none text-gray-300 leading-relaxed space-y-6">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              pre({ children }) {
                return <>{children}</>;
              },
              code({ node, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '');
                const isBlock = Boolean(match) || (typeof children === 'string' && children.includes('\n'));
                if (!isBlock) {
                  return (
                    <code className="bg-gray-800/80 text-primary px-1.5 py-0.5 rounded font-mono text-xs border border-gray-700/50" {...props}>
                      {children}
                    </code>
                  );
                }
                return <CodeBlock className={className}>{children}</CodeBlock>;
              },
              img({ src, alt }) {
                const safeSrc = src && /^(https?:\/\/|\/|data:image\/(png|jpe?g|webp|gif);base64,)/i.test(src.trim()) ? src : '/profile.jpg';
                return (
                  <figure className="my-8 rounded-2xl overflow-hidden border border-gray-800 bg-background/50 p-2 shadow-2xl group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={safeSrc}
                      alt={alt || "Blog image illustration"}
                      className="w-full max-h-[500px] object-cover rounded-xl transition-transform duration-500 group-hover:scale-[1.01]"
                    />
                    {alt && (
                      <figcaption className="text-center text-xs text-gray-400 font-mono mt-3 mb-1 italic">
                        {alt}
                      </figcaption>
                    )}
                  </figure>
                );
              },
              h1: ({ children }) => (
                <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground mt-10 mb-4 pb-2 border-b border-gray-800/80">
                  {children}
                </h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-xl sm:text-2xl font-bold text-foreground mt-8 mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-5 bg-primary rounded-full inline-block"></span>
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-lg sm:text-xl font-bold text-primary/90 mt-6 mb-2">
                  {children}
                </h3>
              ),
              p: ({ children }) => (
                <div className="text-gray-300 text-sm sm:text-base leading-relaxed mb-4">
                  {children}
                </div>
              ),
              ul: ({ children }) => (
                <ul className="list-disc list-inside space-y-2 text-gray-300 text-sm sm:text-base pl-2 mb-4">
                  {children}
                </ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal list-inside space-y-2 text-gray-300 text-sm sm:text-base pl-2 mb-4">
                  {children}
                </ol>
              ),
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-primary bg-primary/5 p-4 rounded-r-2xl my-6 text-gray-300 italic text-sm sm:text-base">
                  {children}
                </blockquote>
              ),
              table: ({ children }) => (
                <div className="overflow-x-auto my-6 rounded-2xl border border-gray-800 shadow-xl">
                  <table className="w-full text-left text-xs sm:text-sm text-gray-300">
                    {children}
                  </table>
                </div>
              ),
              thead: ({ children }) => (
                <thead className="bg-gray-900/90 text-primary uppercase text-[11px] font-bold tracking-wider border-b border-gray-800">
                  {children}
                </thead>
              ),
              th: ({ children }) => (
                <th className="px-4 py-3">{children}</th>
              ),
              td: ({ children }) => (
                <td className="px-4 py-3 border-b border-gray-800/50">{children}</td>
              ),
              a: ({ href, children }) => {
                const safeHref = href && /^(https?:\/\/|\/|mailto:)/i.test(href.trim()) ? href : '#';
                return (
                  <a
                    href={safeHref}
                    target={safeHref.startsWith('http') ? "_blank" : undefined}
                    rel="noopener noreferrer"
                    className="text-primary hover:underline font-semibold"
                  >
                    {children}
                  </a>
                );
              },
              hr: () => <hr className="border-gray-800/80 my-8" />
            }}
          >
            {markdown}
          </ReactMarkdown>
        </div>

        {/* Footer Navigation within Article */}
        <div className="mt-12 pt-8 border-t border-gray-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link
            href="/blog"
            className="flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-primary transition-colors"
          >
            <ArrowLeft size={13} /> Back to all articles
          </Link>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="text-xs text-primary hover:underline font-semibold"
          >
            ↑ Back to Top
          </button>
        </div>
      </article>

      {/* Image Adder & Markdown Editor Modal */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card border border-gray-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-800 flex items-center justify-between bg-background/50">
              <div className="flex items-center gap-2">
                <ImageIcon size={18} className="text-primary" />
                <h3 className="font-bold text-foreground text-lg">Blog Tool & Image Adder</h3>
              </div>
              <button
                onClick={() => setIsEditorOpen(false)}
                className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-800 bg-background/30 px-6 pt-3 gap-4 text-xs font-bold">
              <button
                onClick={() => setActiveTab('image')}
                className={`pb-3 border-b-2 flex items-center gap-1.5 transition-colors ${
                  activeTab === 'image'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-400 hover:text-foreground'
                }`}
              >
                <PlusCircle size={14} /> Add Image
              </button>
              <button
                onClick={() => setActiveTab('markdown')}
                className={`pb-3 border-b-2 flex items-center gap-1.5 transition-colors ${
                  activeTab === 'markdown'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-400 hover:text-foreground'
                }`}
              >
                <Edit3 size={14} /> Edit Full Markdown
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-6">
              {activeTab === 'image' ? (
                <form onSubmit={handleInsertImage} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                      Upload from Computer or Paste URL
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="text"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="e.g. /profile.jpg, /china-mountains.jpg or https://..."
                        className="w-full bg-background/60 border border-gray-700 rounded-xl px-4 py-2.5 text-xs text-foreground focus:outline-none focus:border-primary transition-all"
                      />
                      <label className="cursor-pointer shrink-0 px-3.5 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-200 text-xs font-semibold flex items-center gap-1.5 transition-all">
                        <Upload size={14} />
                        <span>Upload</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  {/* Preset quick buttons */}
                  <div>
                    <span className="text-[11px] text-gray-500 block mb-1.5 font-medium">Quick Presets:</span>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => { setImageUrl('/china-mountains.jpg'); setImageAlt('Network Topology Diagram'); }}
                        className="px-2.5 py-1 bg-background text-[11px] text-gray-400 rounded-lg border border-gray-800 hover:border-primary/40 transition-colors"
                      >
                        China Mountains Wallpaper
                      </button>
                      <button
                        type="button"
                        onClick={() => { setImageUrl('/profile.jpg'); setImageAlt('Offensive Security Workflow'); }}
                        className="px-2.5 py-1 bg-background text-[11px] text-gray-400 rounded-lg border border-gray-800 hover:border-primary/40 transition-colors"
                      >
                        Profile Character Artwork
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                      Image Description / Alt Text
                    </label>
                    <input
                      type="text"
                      value={imageAlt}
                      onChange={(e) => setImageAlt(e.target.value)}
                      placeholder="e.g. Network Architecture Diagram"
                      className="w-full bg-background/60 border border-gray-700 rounded-xl px-4 py-2.5 text-xs text-foreground focus:outline-none focus:border-primary transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                      Caption (Optional)
                    </label>
                    <input
                      type="text"
                      value={imageCaption}
                      onChange={(e) => setImageCaption(e.target.value)}
                      placeholder="e.g. Figure 1.1: Multi-tier vulnerability assessment flow"
                      className="w-full bg-background/60 border border-gray-700 rounded-xl px-4 py-2.5 text-xs text-foreground focus:outline-none focus:border-primary transition-all"
                    />
                  </div>

                  {/* Live Preview of image */}
                  {imageUrl && (
                    <div className="p-3 bg-background/60 rounded-xl border border-gray-800">
                      <span className="text-[10px] text-gray-400 uppercase font-bold block mb-2">Image Preview</span>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imageUrl}
                        alt="Preview"
                        className="w-full max-h-48 object-cover rounded-lg border border-gray-800"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    </div>
                  )}

                  <div className="pt-2 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setIsEditorOpen(false)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!imageUrl}
                      className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-lg shadow-primary/20 flex items-center gap-1.5"
                    >
                      <PlusCircle size={14} /> Insert Image into Article
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <p className="text-xs text-gray-400">
                    You can directly edit the Markdown of this article, add headers, images (\`![alt](url)\`), tables, or code snippets. Changes will be saved locally.
                  </p>
                  <textarea
                    rows={12}
                    value={customMarkdown}
                    onChange={(e) => setCustomMarkdown(e.target.value)}
                    className="w-full bg-background/80 border border-gray-700 rounded-2xl p-4 text-xs font-mono text-gray-200 leading-relaxed focus:outline-none focus:border-primary transition-all"
                    placeholder="Enter markdown..."
                  />
                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={handleResetOriginal}
                      className="flex items-center gap-1 text-xs text-rose-400 hover:underline"
                    >
                      <RotateCcw size={12} /> Reset to Original Post
                    </button>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setIsEditorOpen(false)}
                        className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveMarkdown}
                        className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-bold transition-all shadow-lg flex items-center gap-1.5"
                      >
                        <Save size={14} /> Save Changes
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
