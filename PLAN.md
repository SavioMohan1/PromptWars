# PLAN.md - RightSpeak App

## 1. Files to be created/modified
* `RightSpeak/src/app/page.tsx`: Main page with drag-and-drop upload, sample button, and result display.
* `RightSpeak/src/app/about/page.tsx`: About page explaining the mission.
* `RightSpeak/src/app/api/analyze/route.ts`: Server-side API route that securely calls the Gemini 2.0 Flash API.
* `RightSpeak/src/components/DocumentAnalyzer.tsx`: Main client UI component handling file selection, camera/photo uploads, and API interactions.
* `RightSpeak/src/lib/pdfExtract.ts`: Utility to extract text from PDFs using `pdfjs-dist`.
* `RightSpeak/.env.local`: Environment variables storing `GEMINI_API_KEY`.

## 2. Dependencies to be installed
* `next`, `react`, `react-dom` (Core Framework)
* `tailwindcss`, `postcss`, `autoprefixer` (Styling)
* `@google/generative-ai` (Gemini API integration)
* `pdfjs-dist` (Client-side PDF text extraction)
* `lucide-react` (Icons for clean UI)

## 3. Test Plan
* **Test 1 - Sample Document**: Use the "Sample Document" button to populate the textarea with a fake eviction notice and submit it. Verify the UI updates to "Reading your document..." and then displays the structured sections correctly.
* **Test 2 - Server API**: Verify the API route `/api/analyze` handles the request properly and calls the `gemini-2.0-flash` model.
* **Test 3 - PDF Extraction**: Upload a dummy document and verify the client-side extraction works correctly via `pdfjs-dist`.
* **Test 4 - Error Handling**: Ensure an invalid upload or API failure triggers a friendly fallback message instead of a crash.
