# \u2696\ufe0f RightSpeak

**RightSpeak** is a legal aid web application built for everyday people. It takes complex, confusing legal documents \u2014 like eviction notices, court summons, rejection letters, or rental agreements \u2014 and instantly breaks them down into plain, simple English. 

Empowering you to understand your rights and know exactly what steps to take next. Built during a PromptWars challenge.

---

## \u2728 Features

- **\ud83d\udcc4 Multi-Format Support:** Paste raw text, upload scanned images, or drag-and-drop PDF documents.
- **\ud83e\udde0 Powered by Gemini 2.0 Flash:** Uses advanced AI to analyze the document in seconds.
- **\ud83d\udcca Structured Analysis:** Provides a plain English summary, key facts (dates, deadlines, amounts), urgency level, actionable next steps, and flags any hidden rights.
- **\ud83c\udf19 Dark Mode First:** A clean, modern, dark-themed UI built with Tailwind CSS.
- **\u26a1 Fast & Secure:** Fully stateless, server-side API processing ensures your Gemini API key never reaches the client. Client-side PDF extraction via `pdfjs-dist` means extra privacy!

---

## \ud83d\udee0\ufe0f Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router, TypeScript)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **AI Integration:** Google [Gemini API](https://ai.google.dev/) (`@google/generative-ai`)
- **PDF Extraction:** `pdfjs-dist`
- **Icons:** `lucide-react`

---

## \ud83d\ude80 Getting Started

To run RightSpeak locally on your machine, follow these steps:

### 1. Clone the repository
\`\`\`bash
git clone https://github.com/SavioMohan1/PromptWars.git
cd PromptWars/rightspeak
\`\`\`

### 2. Install dependencies
\`\`\`bash
npm install
\`\`\`

### 3. Configure the Gemini API Key
Create a `.env.local` file in the `rightspeak` folder and add your Gemini API Key:
\`\`\`env
GEMINI_API_KEY="your_api_key_here"
\`\`\`

### 4. Run the development server
\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result. Try clicking the **"Use a sample eviction notice"** button to test the AI on a dummy document!

---

## \ud83d\udcdc License

This project is built for educational and demonstration purposes. Note: This tool provides AI-generated analysis and **does not constitute official legal advice**. Always consult a qualified lawyer for serious legal matters.
