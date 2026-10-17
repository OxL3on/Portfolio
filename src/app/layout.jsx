import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { GlobalLoader } from '@/components/shared/GlobalLoader';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

// --- Advanced Optimized Metadata ---
export const metadata = {
  title: {
    default: 'MD Leon Islam | Cybersecurity Student',
    template: '%s | MD Leon Islam',
  },
  description:
    'Official portfolio of MD Leon Islam. A Cybersecurity Student exploring web application security, penetration testing, and offensive security.',

  keywords: [
    'MD Leon Islam',
    'Leon Islam',
    'Luffy',
    'OxL3on',
    'Cybersecurity Student',
    'Web Application Security',
    'Penetration Testing',
    'Offensive Security',
    'Network Security',
    'API Security',
    'Security Research',
    'Bangladesh',
  ],

  authors: [{ name: 'MD Leon Islam', url: 'https://github.com/OxL3on' }],
  creator: 'MD Leon Islam',
  publisher: 'MD Leon Islam',

  openGraph: {
    type: 'website',
    locale: 'en_US',
    title: 'MD Leon Islam - Cybersecurity Student',
    description:
      'Cybersecurity student exploring web application security, penetration testing, and offensive security.',
    siteName: 'MD Leon Islam Portfolio',
  },

  twitter: {
    card: 'summary_large_image',
    title: 'MD Leon Islam | Cybersecurity Student',
    description:
      'Cybersecurity student passionate about web security, penetration testing, and continuous learning.',
  },

  robots: {
    index: true,
    follow: true,
    nocache: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/logo.png',
    shortcut: '/favicon.ico',
    apple: '/logo.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var savedTheme = localStorage.getItem('theme') || 'dark';
                  var savedHue = localStorage.getItem('primary-hue') || '240';
                  var root = document.documentElement;
                  if (savedTheme === 'system') {
                    root.classList.add(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
                  } else {
                    root.classList.add(savedTheme);
                  }
                  root.style.setProperty('--primary-hue', savedHue);
                  root.style.setProperty('--primary-color', 'hsl(' + savedHue + ', 100%, 65%)');
                  root.style.setProperty('--primary-border', 'hsla(' + savedHue + ', 100%, 65%, 0.2)');
                  root.style.setProperty('--primary-shade', 'hsla(' + savedHue + ', 100%, 65%, 0.1)');
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground transition-colors duration-300">
        <GlobalLoader>{children}</GlobalLoader>
      </body>
    </html>
  );
}
