import type { Metadata, Viewport } from 'next';
import { Geist_Mono, Manrope, Space_Grotesk } from 'next/font/google';
import 'katex/dist/katex.min.css';
import './globals.css';

const bodyFont = Manrope({
  variable: '--font-manrope',
  subsets: ['latin'],
});

const displayFont = Space_Grotesk({
  variable: '--font-space-grotesk',
  subsets: ['latin'],
});

const monoFont = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const themeScript = `
(() => {
  try {
    const storedTheme = window.localStorage.getItem('fruit-theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = storedTheme === 'light' || storedTheme === 'dark'
      ? storedTheme
      : systemPrefersDark
        ? 'dark'
        : 'light';

    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  } catch (error) {
    document.documentElement.dataset.theme = 'light';
    document.documentElement.style.colorScheme = 'light';
  }
})();
`;

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fff7ef' },
    { media: '(prefers-color-scheme: dark)', color: '#08101a' },
  ],
};

export const metadata: Metadata = {
  title: 'Slice Fast. Think Faster. | Fruit Ninja HTML5',
  description:
    'Experience a modern Fruit Ninja-style arcade game in your browser with precision slicing, combo chasing, and twelve unique game modes.',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Fruit Ninja HTML5',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${bodyFont.variable} ${displayFont.variable} ${monoFont.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        {children}
      </body>
    </html>
  );
}
