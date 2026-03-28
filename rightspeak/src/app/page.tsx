import DocumentAnalyzer from '@/components/DocumentAnalyzer';

export default function Home() {
  return (
    <div className="w-full flex flex-col items-center">
      <div className="text-center mb-10 max-w-2xl mx-auto mt-8">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-white">
          Legal Jargon, <span className="text-blue-500">Translated.</span>
        </h1>
        <p className="text-lg text-gray-400 leading-relaxed">
          Upload any legal document \u2014 eviction notice, court summons, or contract \u2014 and we'll summarize what it means in simple English and tell you exactly what to do next.
        </p>
      </div>

      <DocumentAnalyzer />
    </div>
  );
}
