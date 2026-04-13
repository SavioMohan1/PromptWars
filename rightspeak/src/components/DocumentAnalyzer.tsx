'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Upload, FileText, AlertTriangle, CheckCircle, FileSearch, X, Download, Share2, Languages, Activity, Clock, ShieldAlert, Loader2 } from 'lucide-react';
import { extractTextFromPdf } from '@/lib/pdfExtract';
import { parseGeminiResult, ParsedDocumentResult, cn } from '@/lib/utils';
import SidebarHistory, { HistoryItem } from './SidebarHistory';
import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';
import { differenceInDays, differenceInHours } from 'date-fns';

const SAMPLE_DOCUMENT = `EVICTION NOTICE
Date: October 12, 2023
To: Rahul Sharma
Address: Flat 4B, Sunshine Apartments, MG Road, Bangalore 560001
From: Vikram Singh, Landlord

Dear Tenant,
You are hereby notified to vacate the premises located at the address above within 30 days from the date of this notice. This action is being taken due to non-payment of rent for the months of August and September 2023, amounting to Rs. 45,000.
Failure to vacate the property by November 11, 2023, will result in legal action against you under the Rent Control Act, including but not limited to, filing an eviction suit in the appropriate civil court.
`;

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'Hindi (\u0939\u093f\u0928\u094d\u0926\u0940)' },
  { code: 'ta', name: 'Tamil (\u0ba4\u0bae\u0bbf\u0bb4\u0bcd)' },
  { code: 'te', name: 'Telugu (\u0c24\u0c46\u0c32\u0c41\u0c17\u0c41)' },
  { code: 'kn', name: 'Kannada (\u0c95\u0ca8\u0ccd\u0ca8\u0ca1)' },
  { code: 'bn', name: 'Bengali (\u09ac\u09be\u0982\u09b2\u09be)' }
];

export default function DocumentAnalyzer() {
  const [textInput, setTextInput] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  
  const [isHovering, setIsHovering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [rawResult, setRawResult] = useState<string | null>(null);
  const [parsedResult, setParsedResult] = useState<ParsedDocumentResult | null>(null);
  
  const [countdownStr, setCountdownStr] = useState<string | null>(null);
  const [targetLang, setTargetLang] = useState('en');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Countdown effect
  useEffect(() => {
    if (!parsedResult?.deadlineDate) {
      setCountdownStr(null);
      return;
    }
    const updateCountdown = () => {
      const now = new Date();
      const target = parsedResult.deadlineDate!;
      const days = differenceInDays(target, now);
      const hours = differenceInHours(target, now) % 24;
      
      if (days < 0 || hours < 0) {
        setCountdownStr("Deadline Passed!");
      } else {
        setCountdownStr(`\u23f1 You have ${days} days, ${hours} hours left`);
      }
    };
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000 * 60 * 60); // update every hour
    return () => clearInterval(interval);
  }, [parsedResult?.deadlineDate]);

  // Parse Raw Result Effect
  useEffect(() => {
    if (rawResult) {
      const p = parseGeminiResult(rawResult);
      setParsedResult(p);

      // Save to history
      try {
        const history: HistoryItem[] = JSON.parse(localStorage.getItem('rs_history') || '[]');
        const newItem: HistoryItem = {
          id: Date.now().toString(),
          timestamp: Date.now(),
          title: p.docType.substring(0, 60),
          urgency: p.urgency,
          rawResponse: rawResult
        };
        // Keep last 5
        localStorage.setItem('rs_history', JSON.stringify([newItem, ...history].slice(0, 5)));
      } catch (e) {
        console.error(e);
      }
    } else {
      setParsedResult(null);
    }
  }, [rawResult]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsHovering(true);
  };
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsHovering(false);
  };
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsHovering(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFileSelected = (f: File) => {
    setFile(f);
    setTextInput('');
    if (f.type.startsWith('image/')) {
        const previewUrl = URL.createObjectURL(f);
        setFilePreview(previewUrl);
    } else {
        setFilePreview(null);
    }
  };

  const clearSelection = () => {
    setFile(null);
    setFilePreview(null);
    setTextInput('');
    setRawResult(null);
    setError(null);
    if(fileInputRef.current) fileInputRef.current.value = '';
  };

  const loadSample = () => {
    clearSelection();
    setTextInput(SAMPLE_DOCUMENT);
  };

  const fileToBase64 = (f: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(f);
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = (e) => reject(e);
    });
  };

  const handleAnalyze = async (overrideLang?: string) => {
    setError(null);
    setRawResult(null);
    setIsLoading(true);

    try {
      let finalPayload: any = {};
      let docText = textInput;

      if (file) {
        if (file.type === 'application/pdf') {
          const buffer = await file.arrayBuffer();
          docText = await extractTextFromPdf(buffer);
        } else if (file.type.startsWith('image/')) {
          finalPayload = {
            inlineData: { data: await fileToBase64(file), mimeType: file.type }
          };
        } else {
          throw new Error("Unsupported file. Please upload PDF or Image.");
        }
      } else if (!docText.trim()) {
        throw new Error("Please upload a file or paste text.");
      }

      const langToUse = overrideLang || targetLang;
      const translationPrompt = `\n\n[CRITICAL OVERRIDE: Translate your ENTIRE analysis output into ${LANGUAGES.find(l=>l.code === langToUse)?.name}. However, you MUST keep the exact English markdown headings: 'Summary', 'Key Facts', 'Urgency', 'Next Steps', 'Rights'. DO NOT translate the headings, only the content beneath them.]`;
      
      if (docText) {
        // Embed language modifier directly into the user text payload
        finalPayload.text = docText + (langToUse !== 'en' ? translationPrompt : '');
      } else if (langToUse !== 'en') {
        // If pure image, attach instruction as text alongside image inline data
        finalPayload.text = translationPrompt;
      }

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalPayload),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Something went wrong.');

      setRawResult(data.result);
      if (overrideLang) setTargetLang(overrideLang);

    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const generatePDF = async () => {
    if (!resultsRef.current || !parsedResult || isGeneratingPdf) return;
    setIsGeneratingPdf(true);
    try {
      const element = resultsRef.current;
      const canvas = await html2canvas(element, {
        backgroundColor: '#0A0A0A',
        scale: 2,
        useCORS: true,
        allowTaint: true,
      });
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`RightSpeak_Analysis_${parsedResult.urgency}.pdf`);
    } catch (e: any) {
      console.error("PDF Gen failed", e);
      alert("Failed to generate PDF: " + (e.message || "Unknown error"));
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const shareWhatsApp = () => {
    if (!parsedResult) return;
    let text = `\u2696\ufe0f *RightSpeak Document Analysis*\n*Type:* ${parsedResult.docType}\n*Urgency:* ${parsedResult.urgency.toUpperCase()}\n\n*Summary:*\n${parsedResult.summary}\n\n*Next Steps:*\n`;
    parsedResult.steps.forEach((s, i) => text += `${i+1}. ${s}\n`);
    text += `\nAnalyzed securely via RightSpeak AI.`;
    
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  // Animations variants
  const containerVars: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };
  const itemVars: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', damping: 20 } }
  };

  return (
    <>
      <SidebarHistory onSelect={(raw) => { clearSelection(); setRawResult(raw); }} />

      <div className="w-full relative min-h-[500px] flex justify-center pb-24 md:pb-0">
        <AnimatePresence mode="wait">
          {!rawResult ? (
            // ================= UPLOAD ZONE =================
            <motion.div 
              key="upload"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
              className="w-full max-w-3xl"
            >
              <div className={cn("animated-border p-8 md:p-10", isHovering && "scale-[1.02] transition-transform")}>
                <div className="flex justify-between items-end mb-6">
                  <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">Scan Document</h2>
                  {file && (
                     <button onClick={clearSelection} aria-label="Clear selected file" className="text-sm text-red-400 flex items-center hover:bg-red-400/10 px-3 py-1.5 rounded-lg transition-colors">
                       <X className="w-4 h-4 mr-1" aria-hidden="true" /> Clear
                     </button>
                  )}
                </div>
                
                <div className="flex flex-col md:flex-row gap-6">
                  {/* File Upload / Preview Box */}
                  <div 
                    role="button"
                    tabIndex={0}
                    aria-label={file ? `Selected file: ${file.name}` : 'Upload a PDF or image document'}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); !file && fileInputRef.current?.click(); } }}
                    className={cn(
                      "flex-1 relative animated-border-dashed rounded-2xl flex flex-col items-center justify-center p-6 min-h-[220px] cursor-pointer group",
                      isHovering && "border-[#00FF88] bg-[#00FF88]/5",
                      file && "border-green-500/30 bg-green-500/10 border-solid animated-border-dashed-none"
                    )}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => !file && fileInputRef.current?.click()}
                  >
                    <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileChange} accept="application/pdf,image/*" aria-label="Upload legal document file" id="file-upload" />
                    
                    {file ? (
                      <div className="absolute inset-0 p-4 flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300">
                        {filePreview ? (
                          <div className="w-full h-full relative rounded-xl overflow-hidden border border-white/20 shadow-2xl">
                             <img src={filePreview} alt="Preview" className="w-full h-full object-cover opacity-80" />
                             <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-4">
                                <span className="text-white font-medium truncate shrink-0">{file.name}</span>
                                <span className="text-[#00FF88] text-xs font-bold uppercase tracking-wider">Image Ready</span>
                             </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center text-center">
                            <CheckCircle className="w-16 h-16 text-[#00FF88] mb-3 drop-shadow-[0_0_15px_rgba(0,255,136,0.3)]" />
                            <p className="text-white font-bold text-lg truncate w-48">{file.name}</p>
                            <span className="text-[#00FF88] text-xs font-bold uppercase tracking-wider mt-1 border border-[#00FF88]/30 px-3 py-1 rounded-full bg-[#00FF88]/10">PDF Ready</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <>
                        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4 group-hover:bg-[#00FF88]/10 group-hover:border-[#00FF88]/50 transition-colors">
                          <Upload className={cn("w-8 h-8 transition-colors", isHovering ? "text-[#00FF88]" : "text-gray-400")} aria-hidden="true" />
                        </div>
                        <p className="text-white font-medium text-lg">
                          {isHovering ? "Drop it here!" : "Drag & drop a file"}
                        </p>
                        <p className="text-gray-500 text-sm mt-1">PDF or Images (JPEG, PNG)</p>
                      </>
                    )}
                  </div>

                  {/* Text Upload */}
                  <div className="flex-1 flex flex-col">
                    <div className="relative flex-grow">
                      <textarea
                        id="legal-text-input"
                        aria-label="Paste legal document text"
                        className={cn(
                          "w-full h-full min-h-[220px] bg-black/40 border border-white/10 rounded-2xl p-5 text-gray-200 placeholder-gray-600 focus:ring-2 focus:ring-[#00FF88] focus:border-transparent resize-none transition-all",
                          file && "opacity-30 cursor-not-allowed"
                        )}
                        placeholder="Or paste the raw legal text here..."
                        value={textInput}
                        onChange={(e) => { setTextInput(e.target.value); if(file) clearSelection(); }}
                        disabled={file !== null}
                      />
                      {textInput.length > 0 && !file && (
                        <div className="absolute bottom-4 right-4 text-xs text-gray-500 font-medium">
                          {textInput.length} chars
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <button onClick={loadSample} aria-label="Load a sample eviction notice document" className="text-sm text-gray-400 hover:text-[#00FF88] flex items-center font-medium transition-colors w-full sm:w-auto justify-center">
                    <FileSearch className="w-4 h-4 mr-2" aria-hidden="true" /> Load sample document
                  </button>
                  
                  {/* Desktop Analyze Button */}
                  <button 
                    onClick={() => handleAnalyze()}
                    disabled={isLoading || (!file && !textInput.trim())}
                    aria-label="Analyze document with Gemini AI"
                    aria-busy={isLoading}
                    className="hidden md:flex relative overflow-hidden px-8 py-3.5 bg-[#FAFAFA] text-black disabled:bg-gray-800 disabled:text-gray-500 hover:bg-[#00FF88] rounded-xl font-bold shadow-lg shadow-white/10 hover:shadow-[#00FF88]/20 transition-all items-center"
                  >
                    {isLoading ? (
                       <span className="flex items-center">
                         <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" /> Reading via Gemini AI...
                       </span>
                    ) : 'Analyze Document'}
                  </button>
                </div>
                
                {error && (
                  <div className="mt-6 p-4 bg-red-900/20 border border-red-500/50 rounded-xl flex items-start text-red-400">
                    <AlertTriangle className="w-5 h-5 mr-3 mt-0.5 shrink-0" />
                    <p className="text-sm">{error}</p>
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            // ================= RESULTS ZONE =================
            <motion.div 
              key="results"
              variants={containerVars}
              initial="hidden"
              animate="show"
              className="w-full max-w-4xl"
            >
              {parsedResult && (
                <div className="space-y-6">
                   {/* ACTION BAR */}
                   <motion.div variants={itemVars} className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2 border-b border-white/10 pb-4">
                      <div className="flex items-center space-x-3">
                         <div className="p-2 bg-[#111111] border border-white/10 rounded-lg">
                           <Languages className="w-4 h-4 text-gray-400" aria-hidden="true" />
                         </div>
                         <select 
                           value={targetLang}
                           onChange={(e) => handleAnalyze(e.target.value)}
                           aria-label="Select output language for analysis"
                           className="bg-transparent text-sm font-medium text-white border-none focus:ring-0 cursor-pointer outline-none"
                           disabled={isLoading}
                         >
                           {LANGUAGES.map(l => <option key={l.code} value={l.code} className="bg-[#111111]">{l.name}</option>)}
                         </select>
                         {isLoading && <Loader2 className="w-4 h-4 text-[#00FF88] animate-spin" aria-hidden="true" />}
                      </div>
                      
                      <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
                        <button onClick={generatePDF} disabled={isGeneratingPdf} aria-label="Download analysis as PDF" className="flex-1 sm:flex-none text-xs flex items-center justify-center font-medium bg-[#111111] disabled:opacity-50 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-lg transition-colors whitespace-nowrap">
                          {isGeneratingPdf ? <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" aria-hidden="true" /> : <Download className="w-3.5 h-3.5 mr-2" aria-hidden="true" />} 
                          {isGeneratingPdf ? 'Saving...' : 'PDF'}
                        </button>
                        <button onClick={shareWhatsApp} aria-label="Share analysis summary via WhatsApp" className="flex-1 sm:flex-none text-xs flex items-center justify-center font-medium bg-green-600/20 text-green-400 hover:bg-green-600/30 border border-green-500/30 px-4 py-2 rounded-lg transition-colors whitespace-nowrap">
                          <Share2 className="w-3.5 h-3.5 mr-2" aria-hidden="true" /> WhatsApp
                        </button>
                        <button onClick={clearSelection} aria-label="Start a new document analysis" className="flex-1 sm:flex-none text-xs flex items-center justify-center font-medium bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30 px-4 py-2 rounded-lg transition-colors whitespace-nowrap">
                          New File
                        </button>
                      </div>
                   </motion.div>

                   {/* WRAPPER FOR PDF EXPORT */}
                   <section ref={resultsRef} className="space-y-6 bg-[#0A0A0A] p-1" aria-label="Document Analysis Results">
                      {/* HEADER ROW */}
                      <motion.div variants={itemVars} className="flex flex-col md:flex-row gap-4 items-stretch">
                        <div className="flex-1 card-layer p-6 pb-5 border-l-4 border-l-[#00FF88]">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-[#00FF88] mb-1 block">Document Type</span>
                          <h1 className="text-2xl font-bold text-white capitalize">{parsedResult.docType}</h1>
                          
                          <div className="flex items-center mt-4 text-xs text-gray-500 gap-4 font-medium uppercase tracking-wider">
                            <span className="flex items-center"><Activity className="w-3.5 h-3.5 mr-1.5"/> AI Confidence: <span className={cn("ml-1", parsedResult.confidence==='high'?'text-white':'text-amber-500')}>{parsedResult.confidence}</span></span>
                            {countdownStr && <span className="flex items-center text-red-400 font-bold bg-red-900/20 px-2.5 py-1 rounded-md border border-red-500/30"><Clock className="w-3.5 h-3.5 mr-1.5"/> {countdownStr}</span>}
                          </div>
                        </div>
                        
                        <div className={cn(
                          "w-full md:w-48 card-layer flex flex-col items-center justify-center p-6",
                          parsedResult.urgency === 'high' ? 'pulse-glow-red border-red-500/50' :
                          parsedResult.urgency === 'medium' ? 'pulse-glow-amber border-amber-500/50' :
                          'pulse-glow-green border-green-500/50'
                        )}>
                           <ShieldAlert className={cn(
                             "w-10 h-10 mb-2",
                             parsedResult.urgency === 'high' ? 'text-red-500' :
                             parsedResult.urgency === 'medium' ? 'text-amber-500' : 'text-green-500'
                           )} aria-hidden="true"/>
                           <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">Urgency</span>
                           <h2 className={cn(
                             "text-xl font-black uppercase mt-1",
                             parsedResult.urgency === 'high' ? 'text-red-400' :
                             parsedResult.urgency === 'medium' ? 'text-amber-400' : 'text-green-400'
                           )}>{parsedResult.urgency}</h2>
                        </div>
                      </motion.div>

                      {/* PLAIN ENGLISH SUMMARY */}
                      <motion.div variants={itemVars} className="card-layer p-6 md:p-8 relative">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                           <div className="w-2 h-6 bg-[#00FF88] rounded-full mr-3" />
                           Plain English Summary
                        </h3>
                        {/* We use pre-wrap for any markdown paragraphs rendering */}
                        <div className="text-gray-300 text-[17px] leading-relaxed font-medium whitespace-pre-wrap">
                          {parsedResult.summary}
                        </div>
                        <button 
                          onClick={() => { navigator.clipboard.writeText(parsedResult.summary); }}
                          aria-label="Copy plain English summary to clipboard"
                          className="absolute top-6 right-6 text-xs text-gray-500 hover:text-white border border-white/10 px-3 py-1.5 rounded-lg bg-black/50"
                        >
                          Copy
                        </button>
                      </motion.div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                         {/* KEY FACTS TABLE */}
                         <motion.div variants={itemVars} className="card-layer p-6 md:p-8 flex flex-col">
                           <h3 className="text-lg font-bold text-white mb-5 flex items-center">
                             <div className="w-2 h-6 bg-amber-500 rounded-full mr-3" />
                             Key Facts
                           </h3>
                           {parsedResult.facts.length > 0 ? (
                             <div className="overflow-hidden rounded-xl border border-white/5 bg-black/30">
                               {parsedResult.facts.map((fact, idx) => {
                                 // Highlight deadline within 7 days logic
                                 let isCriticalDate = false;
                                 if (/dead|due|by|date/i.test(fact.label) && parsedResult.deadlineDate) {
                                   const daysLeft = differenceInDays(parsedResult.deadlineDate, new Date());
                                   if (daysLeft >= 0 && daysLeft <= 7) isCriticalDate = true;
                                 }

                                 return (
                                   <div key={idx} className={cn(
                                     "flex flex-col sm:flex-row sm:items-center p-3 sm:p-4 text-sm border-b border-white/5 last:border-0",
                                     idx % 2 === 0 ? "bg-white/[0.02]" : "",
                                     isCriticalDate && "bg-red-500/10 border-red-500/20"
                                   )}>
                                     <span className="text-gray-500 font-bold uppercase w-1/3 text-xs tracking-wider shrink-0 break-words pr-2">{fact.label}</span>
                                     <span className={cn("font-medium break-words mt-1 sm:mt-0", isCriticalDate ? "text-red-400 font-bold" : "text-white")}>{fact.value}</span>
                                   </div>
                                 )
                               })}
                             </div>
                           ) : (
                             <p className="text-gray-500 italic text-sm">No specific key facts identified.</p>
                           )}
                         </motion.div>

                         <div className="flex flex-col gap-6">
                           {/* NEXT STEPS */}
                           <motion.div variants={itemVars} className="card-layer p-6 flex-1">
                             <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                               <div className="w-2 h-6 bg-blue-500 rounded-full mr-3" />
                               Actionable Next Steps
                             </h3>
                             {parsedResult.steps.length > 0 ? (
                               <ul className="space-y-4">
                                 {parsedResult.steps.map((step, idx) => (
                                   <li key={idx} className="flex font-medium text-gray-300 leading-relaxed text-[15px]">
                                     <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold mr-3 mt-0.5 border border-blue-500/30">
                                       {idx + 1}
                                     </div>
                                     <span dangerouslySetInnerHTML={{ __html: step.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>') }} />
                                   </li>
                                 ))}
                               </ul>
                             ) : (
                               <p className="text-gray-500 italic text-sm">Review summary for general instructions.</p>
                             )}
                           </motion.div>
                           
                           {/* SURVIVOR RIGHTS (If mapped) */}
                           {parsedResult.rights && (
                           <motion.div variants={itemVars} className="card-layer p-6 bg-indigo-900/10 border-indigo-500/30">
                             <h3 className="text-[15px] font-bold text-indigo-400 mb-2 flex items-center uppercase tracking-widest">
                               Know Your Rights
                             </h3>
                             <p className="text-gray-300 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: parsedResult.rights.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>') }}></p>
                           </motion.div>
                           )}
                         </div>
                       </div>
                   </section>
                 </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* MOBILE FLOATING CTA (Analyzes on Mobile if no parsed layout) */}
      {!rawResult && (
      <div className="md:hidden fixed bottom-6 left-0 right-0 px-6 z-40">
        <button 
          onClick={() => handleAnalyze()}
          disabled={isLoading || (!file && !textInput.trim())}
          aria-label="Analyze document with Gemini AI"
          aria-busy={isLoading}
          className="w-full relative overflow-hidden px-8 py-4 bg-[#00FF88] text-black disabled:bg-gray-800 disabled:text-gray-500 hover:bg-[#00ffa2] rounded-2xl font-black shadow-[0_10px_40px_rgba(0,255,136,0.3)] disabled:shadow-none transition-all flex items-center justify-center text-lg"
        >
          {isLoading ? <Loader2 className="animate-spin h-6 w-6" aria-hidden="true" /> : "Analyze Document"}
        </button>
      </div>
      )}
    </>
  );
}


