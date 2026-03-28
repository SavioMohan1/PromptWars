# PLAN.md - RightSpeak UI & Features Overhaul

## 1. Files to be created/modified
* `rightspeak/package.json`: Adding new dependencies (`framer-motion`, `jspdf`, `date-fns`).
* `rightspeak/tailwind.config.ts` or `rightspeak/src/app/globals.css`: Update root color variables for `background: #0A0A0A`, `card: #111111`, and `accent: #00FF88`. Update custom animations (`pulse`, `fade-in`).
* `rightspeak/src/app/layout.tsx`: Update font to `Geist` (from `next/font`), update navbar with new logo (Shield+Scales), "Know your rights. Instantly." tagline, and backdrop blur.
* `rightspeak/src/components/DocumentAnalyzer.tsx`: Major overhaul. Splitting into smaller components if necessary, but will incorporate entirely new Framer motion wrappers, drag-n-drop state updates, multi-language toggles, PDF download with `jspdf`, WhatsApp sharing, and mobile sticky buttons.
* `rightspeak/src/components/SidebarHistory.tsx` (New): Drawer/sidebar showing `localStorage` history.
* `rightspeak/src/components/BottomSheet.tsx` (New): Custom or framer-motion powered bottom sheet for mobile results.
* `rightspeak/src/lib/geminiParser.ts` (New): Utility to parse the result string into components (Summary, Key Facts, Urgency, Next Steps) safely to enable custom UI components for each section rather than one giant markdown block.

## 2. Dependencies to be installed
* `framer-motion` (Animations)
* `jspdf` (Download as PDF)
* `date-fns` (Simplifying countdown logic)
* `clsx`, `tailwind-merge` (Class merging)

## 3. Test Plan
* **Test 1 - Visuals & Animations:** Verify #0A0A0A background, `#111111` cards, `#00FF88` accent. Check for staggered 150ms Framer Motion animations on page load and result generation.
* **Test 2 - Upload Rich UI:** Verify live image thumbnails, text snippets, or PDF page counts work for file drop. Ensure "Drop it here!" hover state triggers correctly.
* **Test 3 - Advanced Client Features:** Use a document with a clear date. Verify countdown timer triggers. Trigger a language change to Hindi and check network requests.
* **Test 4 - Mobile View:** Inspect on mobile viewport. Ensure results slide up in a bottom sheet and the "Analyze" button is fixed to the bottom.
* **Test 5 - Document History:** Reload the page after analyzing and check if the past document title persists in the sidebar via `localStorage`.
