import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);

export async function POST(req: Request) {
  try {
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Gemini API key not configured. Please add it to .env.local' },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { text, inlineData } = body;

    if (!text && !inlineData) {
      return NextResponse.json(
        { error: 'No document text or image provided.' },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const systemPrompt = `You are a legal aid assistant helping ordinary people in India understand complex legal documents. The user will give you a legal document — it may be messy, scanned, or in mixed languages. You must: 
1) Identify what type of document this is. 
2) Summarize what it means in 3–4 simple sentences a Class 8 student could understand. 
3) List the key facts: dates, deadlines, amounts, parties involved. 
4) Tell the user clearly if this is urgent or not. 
5) Give 3 concrete next steps the person should take. 
6) Flag any rights the person has that they may not be aware of. 
Always respond in the same language the document is written in. Format your response in clean sections with clear headings.`;

    const instructions = "Here is the legal document. Please analyze it based on the system instructions.\n";
    
    const parts: any[] = [{ text: systemPrompt }, { text: instructions }];
    
    if (text) {
        parts.push({ text });
    } else if (inlineData) {
        parts.push({ inlineData });
    }

    // Call the Gemini API
    const result = await model.generateContent(parts);
    const responseText = result.response.text();

    return NextResponse.json({ result: responseText });
    
  } catch (error: any) {
    console.error('Error in analyze route:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to analyze the document. Please try again.' },
      { status: 500 }
    );
  }
}
