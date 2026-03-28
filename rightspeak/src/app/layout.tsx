import type { Metadata } from 'next';
import './globals.css';
import Link from 'next/link';
import { Scale } from 'lucide-react';

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
    <html lang="en">
      <body className="antialiased min-h-screen flex flex-col pt-[var(--header-height,0px)]">
        <header className="w-full py-4 px-6 border-b border-gray-800 bg-gray-900/80 backdrop-blur-md sticky top-0 z-50 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <Scale className="w-6 h-6 text-blue-500" />
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500">
              RightSpeak
            </span>
          </Link>
          <nav>
            <Link href="/about" className="text-sm text-gray-400 hover:text-white transition-colors">
              About
            </Link>
          </nav>
        </header>

        <main className="flex-1 flex flex-col items-center p-6 md:p-12 w-full max-w-7xl mx-auto">
          {children}
        </main>

        <footer className="py-6 text-center text-sm text-gray-500 border-t border-gray-900 mt-auto">
          \u00a9 {new Date().getFullYear()} RightSpeak. Disclaimer: This tool does not constitute official legal advice.
        </footer>
      </body>
    </html>
  );
}
