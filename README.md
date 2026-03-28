<div align="center">

<br/>

```
██████╗ ██╗ ██████╗ ██╗  ██╗████████╗███████╗██████╗ ███████╗ █████╗ ██╗  ██╗
██╔══██╗██║██╔════╝ ██║  ██║╚══██╔══╝██╔════╝██╔══██╗██╔════╝██╔══██╗██║ ██╔╝
██████╔╝██║██║  ███╗███████║   ██║   ███████╗██████╔╝█████╗  ███████║█████╔╝ 
██╔══██╗██║██║   ██║██╔══██║   ██║   ╚════██║██╔═══╝ ██╔══╝  ██╔══██║██╔═██╗ 
██║  ██║██║╚██████╔╝██║  ██║   ██║   ███████║██║     ███████╗██║  ██║██║  ██╗
╚═╝  ╚═╝╚═╝ ╚═════╝ ╚═╝  ╚═╝   ╚═╝   ╚══════╝╚═╝     ╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝
```

### ⚖️ Know your rights. Instantly.

**AI-powered legal document simplification — built for real people, not lawyers.**

<br/>

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-rightspeak.app-00FF88?style=for-the-badge&logoColor=black)](https://rightspeak-831018266459.us-central1.run.app/)
[![Built with Gemini](https://img.shields.io/badge/Powered_by-Gemini_2.5_Flash-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![Next.js](https://img.shields.io/badge/Next.js_16-Framework-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Deployed on](https://img.shields.io/badge/Deployed_on-Google_Cloud_Run-4285F4?style=for-the-badge&logo=googlecloud&logoColor=white)](https://cloud.google.com/run)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

<br/>

---

</div>

## 🔥 What is RightSpeak?

> Most people receive a legal document — an eviction notice, a court summons, a bank notice — and have **no idea what it actually means or what to do next.** RightSpeak fixes that.

RightSpeak uses **Google Gemini 2.5 Flash** to instantly decode any legal document into plain English, giving ordinary people a fair fighting chance against complex legal language.

Upload a PDF, paste text, or even snap a photo of a document. In seconds, you'll get:

- 📋 A plain English summary anyone can understand
- 🚨 An urgency rating that tells you how fast to act
- 📅 Key facts: dates, deadlines, amounts, parties involved
- 🎯 3 concrete next steps to take right now
- ⚖️ Your legal rights — ones you might not even know you have

---

## ✨ Features

<table>
<tr>
<td width="50%">

### 🧠 AI Core
- **Gemini 2.5 Flash** for cutting-edge legal analysis
- Structured Markdown output parsed into beautiful UI sections
- Handles text, images, and PDF documents natively
- Works on messy, scanned, or mixed-language documents

</td>
<td width="50%">

### 🎨 Premium UI
- Antigravity dark-mode aesthetic (`#0A0A0A` / `#00FF88`)
- Framer Motion staggered animations (150ms delay per card)
- Animated gradient border on the main upload card
- Frosted glass sticky navbar with `backdrop-blur`
- Geist Sans typography throughout

</td>
</tr>
<tr>
<td width="50%">

### 🌐 Multi-Language
- Re-analyze any document in **6 languages**:
  - 🇮🇳 Hindi, Tamil, Telugu, Kannada, Bengali
  - 🇬🇧 English
- One-click translation preserving UI structure
- Section headings kept in English for consistent parsing

</td>
<td width="50%">

### ⏱️ Smart Urgency Engine
- Urgency badge **pulses** red / amber / green
- AI Confidence meter (High / Medium / Low)
- **Live deadline countdown** — "You have 12 days, 4 hours left to respond"
- Key dates highlighted 🔴 red if due within 7 days

</td>
</tr>
<tr>
<td width="50%">

### 📤 Export & Share
- **Download as PDF** — dark-mode screenshot via `html2canvas-pro`
- **WhatsApp Share** — pre-fills `wa.me` with the formatted summary and next steps
- **Copy Summary** button on every analysis
- Full analysis shared in seconds to family or local lawyers

</td>
<td width="50%">

### 📚 Document History
- Last 5 scanned documents saved to `localStorage`
- Collapsible slide-out sidebar panel
- Restores analysis instantly without re-uploading
- Shows urgency badge and scan date per entry

</td>
</tr>
</table>

---

## 📱 Mobile First

- **Floating "Analyze" button** fixed to bottom on mobile — never scroll to submit
- Touch-friendly drag-and-drop with native file picker fallback
- Live image thumbnail and PDF filename preview on file selection
- Responsive grid layout that collapses gracefully on small screens

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16 (App Router, TypeScript) |
| **Styling** | Tailwind CSS v4 (Dark Mode) |
| **Font** | Geist Sans (Vercel) |
| **AI** | Google Gemini 2.5 Flash via `@google/generative-ai` |
| **Animations** | Framer Motion |
| **PDF Export** | `jsPDF` + `html2canvas-pro` |
| **Date Logic** | `date-fns` |
| **PDF Parsing** | `pdfjs-dist` (dynamic, client-side) |
| **Deployment** | Google Cloud Run (fully containerized) |

---

## 🚀 Getting Started Locally

### Prerequisites
- Node.js 18+
- A [Google AI Studio](https://aistudio.google.com/) API Key (Gemini)

### 1. Clone the repository

```bash
git clone https://github.com/SavioMohan1/PromptWars.git
cd PromptWars/rightspeak
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure your API Key

Create a `.env.local` file in the `rightspeak/` directory:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and start analyzing documents! 🎉

---

## ☁️ Deploying to Google Cloud Run

From your Google Cloud Shell:

```bash
# Clone the repo
git clone https://github.com/SavioMohan1/PromptWars.git

# Navigate into the app folder
cd PromptWars/rightspeak

# Deploy!
gcloud run deploy rightspeak \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars GEMINI_API_KEY=your_key_here
```

> ⚠️ **Important:** Replace `your_key_here` with your actual Gemini API key, or configure it in the Google Cloud Console under **Cloud Run → rightspeak → Edit & Deploy → Variables & Secrets**.

---

## 📁 Project Structure

```
rightspeak/
├── src/
│   ├── app/
│   │   ├── api/analyze/route.ts   # 🔐 Secure Gemini API endpoint
│   │   ├── about/page.tsx         # About page
│   │   ├── page.tsx               # Main dashboard
│   │   ├── layout.tsx             # Root layout + navbar
│   │   └── globals.css            # Design system tokens
│   ├── components/
│   │   ├── DocumentAnalyzer.tsx   # 🧠 Core analysis UI component
│   │   └── SidebarHistory.tsx     # 📚 Document history panel
│   └── lib/
│       ├── utils.ts               # Gemini response parser + helpers
│       └── pdfExtract.ts          # Client-side PDF text extraction
└── package.json
```

---

## 🔐 Security

- The **Gemini API key is never exposed to the client**. All AI calls are made server-side through a secure Next.js API route (`/api/analyze`).
- PDF parsing is done entirely **client-side** — your documents never leave your browser for processing.
- No user data is stored server-side. History is saved locally in the browser's `localStorage`.

---

## 🎯 Use Cases

| 🏠 Eviction Notice | 🏦 Bank Notice | 📃 Court Summons |
|---|---|---|
| Know your rights as a tenant before the deadline | Understand what you owe and when | Know whether to appear or respond in writing |

| 📝 Employment Contract | 🤝 Loan Agreement | 📬 Legal Notice |
|---|---|---|
| Spot unfair clauses before signing | Understand interest rates & penalties | Know if it's urgent or just a formality |

---

## 🤝 Contributing

Contributions are welcome! Open an issue or submit a pull request.

---

## ⚠️ Disclaimer

> RightSpeak is an **AI-powered tool** designed to help users **understand** legal documents. It does **not** constitute legal advice and should not substitute consultation with a qualified legal professional for serious legal matters.

---

<div align="center">

Built with ❤️ for the people who can't afford a lawyer.

**[⭐ Star this repo](https://github.com/SavioMohan1/PromptWars)** · **[🌐 Try the Live App](https://rightspeak-831018266459.us-central1.run.app/)**

</div>
