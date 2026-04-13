import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface ParsedDocumentResult {
  docType: string;
  summary: string;
  urgency: 'high' | 'medium' | 'low' | 'unknown';
  deadlineDate?: Date | null;
  facts: { label: string; value: string }[];
  steps: string[];
  rights: string;
  confidence: 'high' | 'medium' | 'low';
}

/**
 * Parses the raw markdown output from Gemini into distinct structured objects
 * for our animated UI components to consume.
 */
export function parseGeminiResult(rawText: string): ParsedDocumentResult {
  const result: ParsedDocumentResult = {
    docType: 'Legal Document',
    summary: '',
    urgency: 'unknown',
    facts: [],
    steps: [],
    rights: '',
    confidence: 'high',
  };

  if (!rawText) return result;

  // 1. Calculate Confidence
  // If we see a lot of hedging words, the AI is less confident
  const hedgingRegex = /\b(may|possibly|unclear|might|potentially|could|seems|appears)\b/gi;
  const hedgingMatches = rawText.match(hedgingRegex) || [];
  if (hedgingMatches.length > 4) result.confidence = 'low';
  else if (hedgingMatches.length > 2) result.confidence = 'medium';

  // 2. Extract Document Type using a simple heuristic (first line or heading)
  const firstLineMatch = rawText.match(/^#*\s*(.+)/);
  if (firstLineMatch) {
    const title = firstLineMatch[1].replace(/\*\*/g, '').trim();
    if (title.toLowerCase().includes('document') || title.length < 50) {
      result.docType = title;
    }
  }

  // 3. Define flexible regex to match common section headers produced by the prompt
  // Prompt requested headers: Summary, Key facts, Urgency, Next steps, Rights.
  
  const extractSection = (headerRegex: RegExp, nextHeaderRegex: RegExp | null = null) => {
    const match = rawText.match(headerRegex);
    if (!match) return null;
    let content = rawText.substring(match.index! + match[0].length).trim();
    
    // Snip off the remainder if there's a next section
    if (nextHeaderRegex) {
      const nextMatch = content.match(nextHeaderRegex);
      if (nextMatch) {
         content = content.substring(0, nextMatch.index).trim();
      }
    }
    return content;
  };

  // Find Urgency — order matters: check 'not urgent'/'low' BEFORE 'urgent'/'high'
  const urgencyContent = extractSection(/urgency/i, /(next steps|rights|summary|key facts)/i) || 
                         rawText.match(/urgency.*?(high|medium|low|urgent|not urgent)/i)?.[0] || '';
  if (/\bnot urgent\b|\blow\b|\bsafe\b/i.test(urgencyContent)) result.urgency = 'low';
  else if (/\bmoderate\b|\bmedium\b/i.test(urgencyContent)) result.urgency = 'medium';
  else if (/\burgent\b|\bhigh\b|\bimmediate\b/i.test(urgencyContent)) result.urgency = 'high';

  // Find Summary
  result.summary = extractSection(/summary|what it means/i, /(key facts|urgency|next steps|rights|#)/i) || "No summary provided.";

  // Find Facts (Dates, deadlines, amounts, parties)
  const factsText = extractSection(/key facts/i, /(urgency|next steps|rights|#)/i) || "";
  if (factsText) {
    // Look for bullet points or colon-separated values
    const lines = factsText.split('\n');
    lines.forEach(line => {
      const cleaned = line.replace(/^[\*\-\d\.]+\s*/, '').trim();
      // Only keep lines with real data, preferably splitting on colons
      if (cleaned.length > 3) {
        const parts = cleaned.split(':');
        if (parts.length >= 2) {
          result.facts.push({ label: parts[0].trim(), value: parts.slice(1).join(':').trim() });
        } else {
          result.facts.push({ label: 'Detail', value: cleaned });
        }
      }
    });
  }

  // Look for a date in the facts that might be a deadline
  const rawFacts = JSON.stringify(result.facts).toLowerCase();
  const dateMatch = rawFacts.match(/\b(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+\d{1,2}(?:st|nd|rd|th)?(?:,?\s+\d{4})?/i) || 
                    rawFacts.match(/\b\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b/);
  
  if (dateMatch && /deadline|due|by|vacate|court/i.test(rawFacts)) {
      // Just flag it as found for the countdown. Real robust passing requires date-fns parse
      // We will leave raw deadline parsing up to the UI using a fuzzy logic fallback.
      result.deadlineDate = new Date(dateMatch[0]); 
      if (isNaN(result.deadlineDate.getTime())) result.deadlineDate = null;
  }

  // Find Steps
  const stepsText = extractSection(/next steps|what to do/i, /(rights|#)/i) || "";
  if (stepsText) {
    result.steps = stepsText.split('\n')
      .map(s => s.replace(/^[\*\-\d\.]+\s*/, '').trim())
      .filter(s => s.length > 5);
  }

  // Find Rights
  result.rights = extractSection(/rights/i, null) || "";

  // Fallback if parsing completely fails for whatever reason
  if (!result.summary && !result.rights && result.steps.length === 0) {
      result.summary = rawText; // just dump it into summary so user sees it
  }

  return result;
}
