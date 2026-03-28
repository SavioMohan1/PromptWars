'use client';

import React, { useState, useRef } from 'react';
import { extractTextFromPdf } from '@/lib/pdfExtract';
import { Upload, FileText, AlertTriangle, CheckCircle, Info, FileSearch } from 'lucide-react';

const SAMPLE_DOCUMENT = `
EVICTION NOTICE
Date: October 12, 2023
To: Rahul Sharma
Address: Flat 4B, Sunshine Apartments, MG Road, Bangalore 560001
From: Vikram Singh, Landlord

Dear Tenant,
You are hereby notified to vacate the premises located at the address above within 30 days from the date of this notice. This action is being taken due to non-payment of rent for the months of August and September 2023, amounting to Rs. 45,000.
Failure to vacate the property by November 11, 2023, will result in legal action against you under the Rent Control Act, including but not limited to, filing an eviction suit in the appropriate civil court. You will also be liable for all legal costs incurred.
Please contact me immediately to settle your dues and hand over the keys.

Sincerely,
Vikram Singh
9876543210
`;

export default function DocumentAnalyzer() {
  const [textInput, setTextInput] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsHovering(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsHovering(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsHovering(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
      setTextInput(''); // Clear text if file is uploaded
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setTextInput('');
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          // Remove the data URI prefix (e.g., "data:image/jpeg;base64,")
          resolve(reader.result.split(',')[1]);
        } else {
          reject(new Error("Failed to convert file to base64"));
        }
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleAnalyze = async () => {
    setError(null);
    setResult(null);
    setIsLoading(true);

    try {
      let finalPayload: any = {};

      if (file) {
        if (file.type === 'application/pdf') {
          // Extract text client-side
          const buffer = await file.arrayBuffer();
          const extractedText = await extractTextFromPdf(buffer);
          finalPayload = { text: extractedText };
        } else if (file.type.startsWith('image/')) {
          // Convert to base64 for Gemini vision
          const base64Data = await fileToBase64(file);
          finalPayload = {
            inlineData: {
              data: base64Data,
              mimeType: file.type
            }
          };
        } else {
          throw new Error("Unsupported file type. Please upload a PDF or an Image.");
        }
      } else if (textInput.trim()) {
        finalPayload = { text: textInput };
      } else {
        throw new Error("Please provide a document either by uploading or pasting text.");
      }

      // Call API
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalPayload),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong while analyzing.');
      }

      setResult(data.result);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadSample = () => {
    setTextInput(SAMPLE_DOCUMENT);
    setFile(null);
  };

  const clearSelection = () => {
    setFile(null);
    if(fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-8">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl">
        <h2 className="text-2xl font-semibold mb-4 text-white">Input Document</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* File Upload Area */}
          <div 
            className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-colors cursor-pointer
              ${isHovering ? 'border-primary bg-primary/10' : 'border-gray-700 hover:border-gray-500 bg-gray-800/50'}
              ${file ? 'border-green-500/50 bg-green-500/5' : ''}
            `}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input 
              type="file" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleFileSelect} 
              accept="application/pdf,image/*"
            />
            
            {file ? (
              <div className="flex flex-col items-center space-y-3" onClick={(e) => { e.stopPropagation(); clearSelection(); }}>
                <CheckCircle className="text-green-400 w-10 h-10" />
                <div>
                  <p className="text-white font-medium">{file.name}</p>
                  <p className="text-gray-400 text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <button className="text-xs text-red-400 hover:text-red-300 mt-2 p-1">Remove File</button>
              </div>
            ) : (
              <>
                <Upload className="w-10 h-10 text-gray-400 mb-4" />
                <p className="text-white font-medium">Click or Drag & Drop to upload</p>
                <p className="text-gray-500 text-sm mt-2">Supports PDF, JPG, PNG</p>
              </>
            )}
          </div>

          {/* Text Paste Area */}
          <div className="flex flex-col">
            <textarea
              className="flex-grow w-full bg-gray-800 border border-gray-700 rounded-xl p-4 text-white placeholder-gray-500 focus:ring-2 focus:ring-primary focus:border-transparent resize-none h-48 md:h-auto"
              placeholder="Or paste your legal text here..."
              value={textInput}
              onChange={(e) => { setTextInput(e.target.value); setFile(null); }}
              disabled={file !== null}
            />
            <button 
              onClick={loadSample}
              className="mt-3 text-sm text-primary hover:text-primary/80 flex items-center self-start"
            >
              <FileSearch className="w-4 h-4 mr-1" />
              Use a sample eviction notice
            </button>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button 
            onClick={handleAnalyze}
            disabled={isLoading || (!file && !textInput.trim())}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 disabled:cursor-not-allowed text-white rounded-xl font-medium shadow-lg shadow-blue-600/20 transition-all flex items-center"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Reading your document...
              </>
            ) : 'Analyze Document'}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-900/40 border border-red-800 rounded-xl flex items-start text-red-200">
          <AlertTriangle className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {result && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 md:p-8 shadow-xl animate-fade-in">
          <div className="prose prose-invert prose-blue max-w-none">
            {/* We use basic Markdown rendering or pre-wrap. Since Gemini returns Markdown, 
                we can render it simply by formatting. */}
            <div className="whitespace-pre-wrap font-sans leading-relaxed">
              {result}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
