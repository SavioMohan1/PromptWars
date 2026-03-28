import type { Metadata } from 'next';
import './globals.css';
import Link from 'next/link';
import { Scale, Shield, Home } from 'lucide-react';
import { GeistSans } from 'geist/font/sans';

export const metadata: Metadata = {
  title: 'RightSpeak - Legal Documents Made Simple',
  description: 'Understand complex legal documents in plain English using Gemini AI.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={GeistSans.className}>
      <body className="antialiased min-h-screen flex flex-col pt-[var(--header-height,0px)] bg-[#0A0A0A] text-[#FAFAFA] selection:bg-[#00FF88] selection:text-black">
        {/* Sticky Frosted Glass Top Navbar */}
        <header className="w-full py-4 px-6 border-b border-white/10 bg-[#0A0A0A]/70 backdrop-blur-xl sticky top-0 z-50 flex items-center justify-between">
          <a href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
            <div className="relative flex items-center justify-center w-10 h-10 bg-[#111111] rounded-xl border border-white/10 shadow-[0_0_15px_rgba(0,255,136,0.15)]">
              <Shield className="w-5 h-5 text-[#00FF88] absolute opacity-40" />
              <Scale className="w-5 h-5 text-white z-10" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-white leading-tight">
                RightSpeak
              </span>
              <span className="text-[10px] text-gray-400 font-medium tracking-wider uppercase">
                Know your rights. Instantly.
              </span>
            </div>
          </a>
          <nav className="flex items-center space-x-6">
            <a href="/" className="text-sm font-medium text-gray-400 hover:text-white transition-colors flex items-center">
              <Home className="w-4 h-4 mr-1.5" />
              Home
            </a>
            <Link href="/about" className="text-sm font-medium text-gray-400 hover:text-[#00FF88] transition-colors">
              About Platform
            </Link>
          </nav>
        </header>

        <main className="flex-1 flex flex-col p-4 md:p-8 w-full max-w-6xl mx-auto">
          {children}
        </main>

        <footer className="py-8 text-center text-sm text-gray-500 border-t border-white/5 mt-auto">
          &copy; {new Date().getFullYear()} RightSpeak. <br />
          <span className="text-xs text-gray-600 mt-2 inline-block">Disclaimer: This tool provides AI-generated analysis and does not constitute real legal advice.</span>
        </footer>
      </body>
    </html>
  );
}
