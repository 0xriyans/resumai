"use client";

import { useState, useEffect } from 'react';
import { 
  FileText, 
  Bot, 
  Sparkles, 
  UserCheck, 
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import { ThemeToggle } from '../components/ThemeToggle';

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [showContent, setShowContent] = useState(false);
  const [language, setLanguage] = useState<'id' | 'en'>('id');
  const [isLangOpen, setIsLangOpen] = useState(false);


  useEffect(() => {
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += Math.floor(Math.random() * 10) + 5;
      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(interval);
        setTimeout(() => setLoading(false), 500);
        setTimeout(() => setShowContent(true), 1200);
      }
      setProgress(currentProgress);
    }, 150);

    return () => clearInterval(interval);
  }, []);

  const features = {
    id: [
      { title: 'Format Resume Profesional', description: 'Template yang dioptimalkan khusus untuk sistem pelacakan pelamar (ATS).', icon: <FileText className="w-8 h-8 text-purple-400" /> },
      { title: 'Analisis Kelayakan AI', description: 'Pindai kecocokan Resume Anda dengan deskripsi pekerjaan dalam hitungan detik.', icon: <Bot className="w-8 h-8 text-green-400" /> },
      { title: 'Perbaiki Otomatis (ATS)', description: 'Saran perbaikan otomatis untuk struktur, kata kunci, dan tata bahasa.', icon: <Sparkles className="w-8 h-8 text-pink-400" /> },
      { title: 'Audit Foto Profil AI', description: 'Analisis dan tingkatkan profesionalisme foto profil LinkedIn/Resume Anda.', icon: <UserCheck className="w-8 h-8 text-blue-400" /> }
    ],
    en: [
      { title: 'Professional Resume Format', description: 'Templates specifically optimized for Applicant Tracking Systems (ATS).', icon: <FileText className="w-8 h-8 text-purple-400" /> },
      { title: 'AI Suitability Analysis', description: 'Scan your Resume for job description matches in seconds.', icon: <Bot className="w-8 h-8 text-green-400" /> },
      { title: 'Auto-Enhance (ATS)', description: 'Automatic improvement suggestions for structure, keywords, and grammar.', icon: <Sparkles className="w-8 h-8 text-pink-400" /> },
      { title: 'AI Profile Photo Audit', description: 'Analyze and improve the professionalism of your LinkedIn/Resume photo.', icon: <UserCheck className="w-8 h-8 text-blue-400" /> }
    ]
  };

  const steps = {
    id: [
      { id: 1, title: 'Pilih Template', description: 'Tentukan gaya Resume ATS atau Modern yang paling cocok.' },
      { id: 2, title: 'Isi Data Diri', description: 'Lengkapi profil, pendidikan, dan pengalaman Anda.' },
      { id: 3, title: 'Analisis AI', description: 'Biarkan AI merombak teks agar berstandar HRD.' },
      { id: 4, title: 'Unduh Resume', description: 'Simpan ke format PDF yang siap dilamar.' }
    ],
    en: [
      { id: 1, title: 'Choose Template', description: 'Determine the most suitable ATS or Modern Resume style.' },
      { id: 2, title: 'Fill Details', description: 'Complete your profile, education, and experience.' },
      { id: 3, title: 'AI Analysis', description: 'Let AI revamp your text to meet HR standards.' },
      { id: 4, title: 'Download Resume', description: 'Save to PDF format ready for job applications.' }
    ]
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gradient-to-br dark:from-slate-950 dark:via-[#0a0a1a] dark:to-slate-900 text-slate-900 dark:text-white selection:bg-purple-500/30 font-sans overflow-x-hidden relative transition-colors duration-300">
      
      {/* Top Controls: Theme & Language */}
      <div className="absolute top-6 right-6 z-50 flex items-center gap-3">
        <ThemeToggle />
        <button onClick={() => setIsLangOpen(!isLangOpen)} className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-white/5 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-lg hover:bg-gray-50 dark:hover:bg-white/10 transition-all shadow-sm">
          <img src={language === 'id' ? 'https://flagcdn.com/w80/id.png' : 'https://flagcdn.com/w80/gb.png'} alt="Flag" className="w-5 h-3.5 object-cover rounded-sm" crossOrigin="anonymous" />
          <span className="text-xs font-bold text-gray-800 dark:text-white uppercase">{language === 'id' ? 'ID' : 'EN'}</span>
          <svg className={`w-3 h-3 text-gray-500 dark:text-gray-400 transition-transform ${isLangOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        </button>
        {isLangOpen && (
          <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-[#0D121F] border border-gray-200 dark:border-white/10 rounded-lg shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2">
            <button onClick={() => { setLanguage('id'); setIsLangOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
              <img src="https://flagcdn.com/w80/id.png" alt="ID" className="w-6 h-4 object-cover rounded-sm" crossOrigin="anonymous" />
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Indonesia</span>
            </button>
            <button onClick={() => { setLanguage('en'); setIsLangOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors border-t border-gray-100 dark:border-white/5">
              <img src="https://flagcdn.com/w80/gb.png" alt="EN" className="w-6 h-4 object-cover rounded-sm" crossOrigin="anonymous" />
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">English</span>
            </button>
          </div>
        )}
      </div>
      
      {/* Loading Splash Screen */}
      {!showContent && (
        <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 transition-opacity duration-700 ${loading ? 'opacity-100' : 'opacity-0'}`}>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-purple-900/10 blur-[120px] pointer-events-none" />
          
          <div className="relative z-10 flex flex-col items-center">
            {/* Logo matching the screenshot */}
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-[2rem] bg-gradient-to-br from-[#8A2BE2] to-[#4B0082] flex items-center justify-center mb-8 shadow-[0_0_60px_rgba(138,43,226,0.6)]">
              <Sparkles className="w-10 h-10 md:w-12 md:h-12 text-white fill-white" />
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight flex items-center gap-2">
              RESUMAI
            </h1>
            
            <p className="text-[10px] md:text-xs tracking-[0.2em] text-gray-500 uppercase mb-12 font-mono">
              AI Resume & Photo Suitability Engine
            </p>
            
            <div className="w-64 md:w-80">
              <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden mb-3">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-[10px] font-mono text-gray-500 dark:text-gray-400">
                <span>{progress === 100 ? 'Sistem siap digunakan!' : 'Memuat aset sistem...'}</span>
                <span className="font-bold text-purple-600 dark:text-purple-400">{progress}%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className={`transition-opacity duration-1000 ${loading ? 'opacity-0' : 'opacity-100'}`}>
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-900/20 blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-900/20 blur-[120px]" />
        </div>

        <main className="relative z-10 max-w-6xl mx-auto px-4 md:px-6 py-12 md:py-20 flex flex-col items-center">
          {/* Header */}
          <div className="text-center mb-20 space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-white/5 backdrop-blur-lg border border-gray-200 dark:border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.1)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] mb-6">
              <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">RESUMAI by riyans.dev</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-[1.15] md:leading-tight">
              {language === 'id' ? 'Tingkatkan Karier dengan' : 'Boost Your Career with'} <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-emerald-400">
                {language === 'id' ? 'Kekuatan AI' : 'The Power of AI'}
              </span>
            </h1>
            <p className="text-base md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mt-6 px-2 md:px-0 leading-relaxed">
              {language === 'id' 
                ? 'Tulis resume profesional dalam hitungan menit. Dilengkapi teknologi AI cerdas untuk memastikan CV Anda menembus sistem ATS dan memikat perhatian rekruter.' 
                : "Build a professional resume in minutes. Powered by smart AI to ensure your CV beats the ATS and instantly grabs the recruiter's attention."}
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full mb-24">
            {features[language].map((feature, index) => (
              <div 
                key={index}
                className="group p-6 bg-white dark:bg-white/5 backdrop-blur-lg border border-gray-200 dark:border-white/10 rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.05)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(168,85,247,0.2)] dark:hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] cursor-pointer flex flex-col items-center text-center md:block md:text-left"
              >
                <div className="w-14 h-14 rounded-xl bg-gray-50 dark:bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 border border-gray-200 dark:border-white/10">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-gray-100">{feature.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          {/* Workflow */}
          <div className="w-full max-w-4xl mx-auto mb-24">
            <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12 md:mb-16">{language === 'id' ? 'Alur Kerja Cerdas' : 'Smart Workflow'}</h2>
            <div className="relative flex flex-col md:flex-row justify-between items-center px-4 md:px-0 gap-8 md:gap-0">
              {/* Garis Horizontal untuk Desktop */}
              <div className="absolute left-[5%] right-[5%] top-1/2 -translate-y-1/2 h-[2px] bg-gradient-to-r from-purple-200 via-emerald-200 to-purple-200 dark:from-purple-500/20 dark:via-emerald-500/20 dark:to-purple-500/20 z-0 hidden md:block" />
              
              {/* Garis Vertikal untuk Mobile */}
              <div className="absolute top-4 bottom-4 left-1/2 -translate-x-1/2 w-[2px] bg-gradient-to-b from-purple-200 via-emerald-200 to-purple-200 dark:from-purple-500/20 dark:via-emerald-500/20 dark:to-purple-500/20 z-0 block md:hidden" />
              
              {steps[language].map((step, index) => (
                <div key={index} className="relative z-10 flex flex-col items-center gap-3 group bg-transparent py-2 w-40 md:w-48 text-center">
                  <div className="w-14 h-14 md:w-12 md:h-12 rounded-full bg-white dark:bg-slate-950 border-2 border-purple-300 dark:border-purple-500/50 flex items-center justify-center text-lg font-bold text-purple-600 dark:text-purple-300 group-hover:border-emerald-500 dark:group-hover:border-emerald-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-300 group-hover:shadow-[0_0_20px_rgba(52,211,153,0.3)] transition-all duration-300">
                    {step.id}
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-sm md:text-sm font-bold md:font-medium text-gray-800 dark:text-gray-300 md:text-gray-600 dark:md:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors bg-white dark:bg-slate-950 md:bg-transparent dark:md:bg-transparent px-4 py-1.5 md:px-0 md:py-0 rounded-full border border-gray-200 dark:border-white/5 md:border-none shadow-sm dark:shadow-lg md:shadow-none mb-2 md:mb-1">
                      {step.title}
                    </span>
                    <p className="text-[10px] md:text-xs text-gray-500 dark:text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-400 transition-colors leading-relaxed px-1 md:px-0">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 mt-8 w-full">
            <Link href={`/builder?lang=${language}`} className="w-full md:w-auto relative px-8 py-4 rounded-xl font-bold text-white bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-400 hover:to-cyan-500 transition-all duration-300 shadow-[0_0_20px_rgba(16,185,129,0.2)] dark:shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] dark:hover:shadow-[0_0_40px_rgba(16,185,129,0.5)] hover:-translate-y-0.5 flex items-center justify-center gap-2 group">
              {language === 'id' ? 'Buat Resume Baru' : 'Create New Resume'}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <Link href={`/builder?lang=${language}`} className="w-full md:w-auto px-8 py-4 rounded-xl font-bold text-purple-600 dark:text-purple-300 bg-white dark:bg-white/5 backdrop-blur-lg border border-purple-200 dark:border-purple-500/30 hover:bg-purple-50 dark:hover:bg-purple-500/10 hover:border-purple-300 dark:hover:border-purple-500/50 hover:shadow-[0_0_15px_rgba(168,85,247,0.2)] dark:hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all duration-300 shadow-sm dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] flex justify-center">
              {language === 'id' ? 'Lihat Contoh Template' : 'View Template Examples'}
            </Link>
          </div>

        </main>
      </div>
    </div>
  );
}
