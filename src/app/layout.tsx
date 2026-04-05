import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'SafePass — Free Password Generator',
    template: '%s | SafePass',
  },
  description:
    'Generate strong, unique passwords instantly with SafePass. Free, browser-based password generator — no data stored, no server involved. Create secure passwords for banking, social media, and more.',
  keywords: [
    'password generator',
    'free password generator',
    'strong password generator',
    'secure password',
    'random password generator',
    'online password generator',
    'password maker',
    'safe password',
    'password creator',
    'complex password generator',
    'passphrase generator',
    'PIN generator',
  ],
  authors: [{ name: 'SafePass' }],
  creator: 'SafePass',
  metadataBase: new URL('https://safepass.world'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://safepass.world',
    siteName: 'SafePass',
    title: 'SafePass — Free Password Generator',
    description:
      'Generate strong, unique passwords instantly. Free, browser-based — no data stored, no server involved.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SafePass — Free Password Generator',
    description:
      'Generate strong, unique passwords instantly. Free, browser-based — no data stored, no server involved.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  category: 'technology',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#0A0F1E] min-h-screen">{children}</body>
    </html>
  );
}
