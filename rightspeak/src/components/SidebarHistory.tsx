'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { History, X, ChevronRight, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface HistoryItem {
  id: string;
  timestamp: number;
  title: string;
  urgency: 'high' | 'medium' | 'low' | 'unknown';
  rawResponse: string;
}

interface SidebarHistoryProps {
  onSelect: (rawResponse: string) => void;
}

export default function SidebarHistory({ onSelect }: SidebarHistoryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('rs_history');
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Could not load history");
    }
  }, []);

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-500/20 text-red-500 border-red-500/50';
      case 'medium': return 'bg-amber-500/20 text-amber-500 border-amber-500/50';
      case 'low': return 'bg-green-500/20 text-green-500 border-green-500/50';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  if (history.length === 0) return null;

  return (
    <>
      {/* Floating Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed top-24 left-0 bg-[#111111] border border-white/10 border-l-0 p-3 rounded-r-2xl shadow-lg hover:w-32 transition-all flex items-center group overflow-hidden z-40"
      >
        <History className="w-5 h-5 text-gray-400 group-hover:text-[#00FF88]" />
        <span className="ml-2 text-sm text-gray-300 font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
          Recent Scans
        </span>
      </button>

      {/* Sidebar Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 h-full w-80 bg-[#111111] border-r border-white/10 shadow-2xl z-50 flex flex-col pt-[var(--header-height,60px)]"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between mt-4">
                <h3 className="text-xl font-bold flex items-center text-white">
                  <History className="w-5 h-5 mr-2 text-[#00FF88]" />
                  Document History
                </h3>
                <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-white transition">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {history.map((record) => (
                  <button 
                    key={record.id}
                    onClick={() => { onSelect(record.rawResponse); setIsOpen(false); }}
                    className="w-full text-left bg-black/40 border border-white/5 hover:border-[#00FF88]/50 p-4 rounded-xl transition-colors group flex items-start"
                  >
                    <FileText className="w-5 h-5 text-gray-500 mr-3 mt-1 shrink-0 group-hover:text-[#00FF88]" />
                    <div className="flex-1 pr-2">
                      <p className="text-sm text-white font-medium line-clamp-2 leading-snug">{record.title}</p>
                      <div className="flex items-center mt-2 space-x-2">
                        <span className={cn("text-[10px] px-2 py-0.5 rounded-full border uppercase tracking-wider font-bold", getUrgencyColor(record.urgency))}>
                          {record.urgency}
                        </span>
                        <span className="text-xs text-gray-600">
                          {new Date(record.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-600 self-center group-hover:text-white" />
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
