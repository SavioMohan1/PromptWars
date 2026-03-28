import { ShieldCheck } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col items-center mt-12 py-10 px-8 bg-gray-900 border border-gray-800 rounded-3xl shadow-xl text-center">
      <ShieldCheck className="w-20 h-20 text-blue-500 mb-6" />
      <h1 className="text-4xl font-bold text-white mb-6">About RightSpeak</h1>
      <p className="text-lg text-gray-400 leading-relaxed max-w-2xl">
        RightSpeak is a legal aid tool designed for everyday people. 
        We believe that legal protection should not be hidden behind dense, 
        confusing jargon. Whether it's an eviction notice, a court summons, 
        a rejection letter, or a rental agreement, RightSpeak uses advanced AI 
        to instantly break it down into plain, simple language and tells you exactly what to do next. Empowering you to know your rights and take action.
      </p>
    </div>
  );
}
