"use client";

import { useState, useRef, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { api } from '../../lib/api';
import { Sparkles, Download, Loader2, Bot, CheckCircle2, AlertTriangle, AlertOctagon, UserCircle2, GraduationCap, Code2, Search, Wand2, Image as ImageIcon, X, FileText, LayoutTemplate } from 'lucide-react';
import Link from 'next/link';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import Swal from 'sweetalert2';
import { ThemeToggle } from '../../components/ThemeToggle';

type FormValues = {
  fullName: string;
  targetPosition: string;
  birthPlace: string;
  birthDate: string;
  gender: string;
  status: string;
  citizenship: string;
  address: string;
  phone: string;
  email: string;
  instagram: string;
  summary: string;
  experience: { title: string; company: string; period: string; description: string }[];
  education: { degree: string; institution: string; period: string; description: string }[];
  seminar: { title: string; institution: string; period: string; description: string }[];
  hardSkills: string;
  softSkills: string;
};

const SKILL_PRESETS = {
  id: [
    { id: 'hr', icon: '💼', title: 'Administrasi & HRD', hint: 'Dunia HR sangat menyukai skill analitik data dan empati sosial.', hard: ['Talent Acquisition', 'HRIS (Talentics, Workday)', 'KPI & Performance Management', 'Payroll Administration', 'Labor Law & Compliance', 'Data Visualization (Tableau)'], soft: ['Komunikasi Interpersonal', 'Problem Solving', 'Empati & Kecerdasan Emosional', 'Kepemimpinan', 'Negosiasi', 'Manajemen Konflik'] },
    { id: 'finance', icon: '📊', title: 'Keuangan & Akuntansi', hint: 'Angka adalah segalanya. Tunjukkan presisi dan penguasaan software akuntansi.', hard: ['Financial Modeling', 'Corporate Finance', 'SAP / Oracle ERP', 'Taxation (Brevet A/B)', 'Audit & Compliance', 'Microsoft Excel (Advanced)'], soft: ['Analytical Thinking', 'Detail-Oriented', 'Integritas Tinggi', 'Manajemen Waktu', 'Decision Making', 'Stress Management'] },
    { id: 'marketing', icon: '🎨', title: 'Pemasaran & Desain', hint: 'Padukan kreativitas desain dengan analisa data metrik konversi riil.', hard: ['SEO & SEM', 'Social Media Management', 'Google Analytics & Meta Ads', 'Adobe Creative Cloud', 'Content Marketing', 'Copywriting'], soft: ['Kreativitas & Inovasi', 'Komunikasi Visual', 'Sensibilitas Tren Pasar', 'Adaptabilitas Tinggi', 'Kolaborasi Kreatif', 'Berpikir Kritis'] },
    { id: 'it', icon: '💻', title: 'Teknologi & IT', hint: 'Teknologi terus berkembang, pastikan stack pemrograman Anda mutakhir.', hard: ['JavaScript / TypeScript', 'React & Next.js', 'Node.js & Express', 'SQL & NoSQL Database', 'Cloud Computing (AWS/GCP)', 'Git & CI/CD'], soft: ['Logika Algoritma', 'Continuous Learning', 'Teamwork (Agile/Scrum)', 'Resilience', 'Komunikasi Teknis', 'Time Management'] },
    { id: 'sales', icon: '📈', title: 'Sales & Business Dev', hint: 'Tunjukkan kemampuan Anda mencapai target dan membangun relasi B2B/B2C.', hard: ['B2B/B2C Sales', 'CRM Software (Salesforce, HubSpot)', 'Lead Generation', 'Account Management', 'Sales Forecasting', 'Market Research'], soft: ['Negosiasi Persuasif', 'Presentasi Bisnis', 'Orientasi Target', 'Membangun Relasi', 'Kegigihan (Persistence)', 'Active Listening'] },
    { id: 'healthcare', icon: '🏥', title: 'Kesehatan & Medis', hint: 'Integritas, kepatuhan prosedur, dan pelayanan pasien adalah kunci.', hard: ['Patient Care', 'Medical Record Management', 'Triage & Emergency Response', 'Clinical Operations', 'Infection Control', 'Healthcare Compliance (HIPAA)'], soft: ['Empati & Kepedulian', 'Ketenangan dalam Tekanan', 'Komunikasi Terapeutik', 'Kerja Tim Medis', 'Etika Profesi', 'Detail & Akurasi'] },
    { id: 'education', icon: '📚', title: 'Pendidikan & Pengajaran', hint: 'Sertakan metode pedagogi dan penguasaan platform edutech terkini.', hard: ['Curriculum Development', 'Instructional Design', 'E-Learning Platforms (Moodle, Canvas)', 'Student Assessment', 'Classroom Management', 'Special Education'], soft: ['Kesabaran Ekstra', 'Public Speaking', 'Mentoring & Coaching', 'Kreativitas Mengajar', 'Kecerdasan Emosional', 'Adaptasi Karakter Siswa'] },
    { id: 'engineering', icon: '🏗️', title: 'Teknik & Arsitektur', hint: 'Fokus pada software CAD, manajemen proyek, dan kepatuhan standar K3.', hard: ['AutoCAD & SketchUp', 'Project Management (PMP)', 'Structural Analysis', 'Quality Control (QC)', 'HSE/K3 Compliance', 'Cost Estimation'], soft: ['Pemecahan Masalah Kompleks', 'Berpikir Logis', 'Manajemen Risiko', 'Kolaborasi Proyek', 'Perhatian pada Detail', 'Analytical Thinking'] },
    { id: 'operations', icon: '⚙️', title: 'Operasional & Logistik', hint: 'Efisiensi rantai pasok dan pemahaman sistem logistik adalah daya jual utama.', hard: ['Supply Chain Management', 'Inventory Control', 'Warehouse Management Systems (WMS)', 'Fleet Management', 'Lean Six Sigma', 'Vendor Negotiation'], soft: ['Multitasking', 'Manajemen Krisis', 'Problem Solving Cepat', 'Koordinasi Lintas Divisi', 'Decision Making', 'Time Management'] },
    { id: 'hospitality', icon: '🏨', title: 'Hospitality & Pariwisata', hint: 'Berikan kesan pelayanan prima (excellent service) dan kepuasan pelanggan.', hard: ['Front Office Operations', 'F&B Management', 'Property Management Systems (Opera)', 'Event Planning', 'Guest Relations', 'Quality Assurance'], soft: ['Service Excellence', 'Komunikasi Ramah', 'Resolusi Konflik', 'Kecerdasan Antarbudaya', 'Adaptabilitas', 'Kerja Sama Tim'] },
    { id: 'data', icon: '🔬', title: 'Data Science & Analisis', hint: 'Kombinasi antara statistik matematis dan insight bisnis adalah hal krusial.', hard: ['Python / R', 'Machine Learning Algorithms', 'SQL & Database Management', 'Data Visualization (PowerBI)', 'A/B Testing', 'Big Data (Hadoop/Spark)'], soft: ['Berpikir Analitis Ekstrem', 'Rasa Ingin Tahu', 'Komunikasi Data Kompleks', 'Pemecahan Masalah Terstruktur', 'Skeptisisme Ilmiah', 'Storytelling'] },
    { id: 'legal', icon: '⚖️', title: 'Hukum & Kepatuhan', hint: 'Perhatian terhadap detail kontrak dan hukum positif menentukan karier Anda.', hard: ['Legal Drafting', 'Contract Negotiation', 'Corporate Law', 'Regulatory Compliance', 'Litigation & Dispute Resolution', 'Intellectual Property'], soft: ['Kerahasiaan Tinggi (Confidentiality)', 'Berpikir Logis & Kritis', 'Objektivitas', 'Argumentasi Lisan & Tulisan', 'Perhatian Ekstra pada Detail', 'Etika Profesional Tinggi'] },
    { id: 'media', icon: '🎙️', title: 'Media & Jurnalistik', hint: 'Akurasi informasi dan penyampaian narasi yang kuat adalah keunggulan utama.', hard: ['Journalistic Writing', 'Video & Audio Editing', 'SEO Copywriting', 'Broadcasting', 'Fact Checking', 'Press Relations'], soft: ['Kemampuan Wawancara', 'Bekerja di Bawah Deadline', 'Objektivitas Berita', 'Keberanian (Courage)', 'Keterampilan Interpersonal', 'Adaptabilitas Lapangan'] },
    { id: 'cs', icon: '🎧', title: 'Customer Support', hint: 'Tunjukkan tingkat empati dan kemampuan retensi pelanggan Anda.', hard: ['CRM Software (Zendesk, Freshdesk)', 'Ticketing Systems', 'Product Knowledge', 'Technical Troubleshooting', 'Live Chat Support', 'SLA Monitoring'], soft: ['Kesabaran Tinggi', 'Empati Aktif', 'De-eskalasi Konflik', 'Komunikasi Asertif', 'Mendengarkan Aktif', 'Problem Solving Cepat'] },
    { id: 'pr', icon: '📢', title: 'Humas & Public Relations', hint: 'Keterampilan membangun citra positif perusahaan dan mitigasi krisis.', hard: ['Crisis Communication', 'Press Release Writing', 'Media Pitching', 'Event Management', 'Corporate Social Responsibility (CSR)', 'Brand Management'], soft: ['Diplomasi', 'Networking & Relasi', 'Berpikir Taktis', 'Komunikasi Publik', 'Kepekaan Sosial', 'Storytelling Visual & Teks'] },
    { id: 'manufacturing', icon: '🏭', title: 'Manufaktur & Produksi', hint: 'Pemahaman tentang alur produksi pabrik dan standar jaminan mutu.', hard: ['Production Planning (PPIC)', 'Quality Assurance/QC', 'Total Productive Maintenance (TPM)', 'ISO 9001/14001', 'OEE Monitoring', '5S & Kaizen'], soft: ['Manajemen Keselamatan', 'Kerja Sama Tim Operasional', 'Disiplin Waktu', 'Problem Solving Lini Produksi', 'Ketelitian Tingkat Tinggi', 'Kepemimpinan Mandor'] },
    { id: 'agriculture', icon: '🌾', title: 'Pertanian & Agribisnis', hint: 'Pengetahuan agronomi modern dan manajemen bisnis komoditas pertanian.', hard: ['Agronomy & Soil Science', 'Farm Management', 'Pest & Disease Control', 'AgTech (Drone/Sensor)', 'Commodity Trading', 'Supply Chain Agribisnis'], soft: ['Ketahanan Fisik', 'Pemecahan Masalah Lapangan', 'Pengambilan Keputusan Cepat', 'Kesadaran Lingkungan', 'Manajemen Krisis (Cuaca)', 'Inovasi Berkelanjutan'] },
    { id: 'government', icon: '🏛️', title: 'Pemerintahan & Publik', hint: 'Fokus pada penyusunan kebijakan, pelayanan publik, dan regulasi negara.', hard: ['Public Policy Analysis', 'Government Budgeting', 'Legal Regulations', 'Community Outreach', 'Public Administration', 'Grant Writing'], soft: ['Pelayanan Publik', 'Netralitas & Integritas', 'Diplomasi Birokrasi', 'Manajemen Konflik Komunitas', 'Kepemimpinan Melayani (Servant)', 'Komunikasi Kebijakan'] }
  ],
  en: [
    { id: 'hr', icon: '💼', title: 'Administration & HR', hint: 'The HR world loves data analytics and social empathy skills.', hard: ['Talent Acquisition', 'HRIS (Talentics, Workday)', 'KPI & Performance Management', 'Payroll Administration', 'Labor Law & Compliance', 'Data Visualization (Tableau)'], soft: ['Interpersonal Communication', 'Problem Solving', 'Empathy & Emotional Intelligence', 'Leadership', 'Negotiation', 'Conflict Management'] },
    { id: 'finance', icon: '📊', title: 'Finance & Accounting', hint: 'Numbers are everything. Show precision and accounting software mastery.', hard: ['Financial Modeling', 'Corporate Finance', 'SAP / Oracle ERP', 'Taxation', 'Audit & Compliance', 'Microsoft Excel (Advanced)'], soft: ['Analytical Thinking', 'Detail-Oriented', 'High Integrity', 'Time Management', 'Decision Making', 'Stress Management'] },
    { id: 'marketing', icon: '🎨', title: 'Marketing & Design', hint: 'Combine design creativity with real conversion metrics data analysis.', hard: ['SEO & SEM', 'Social Media Management', 'Google Analytics & Meta Ads', 'Adobe Creative Cloud', 'Content Marketing', 'Copywriting'], soft: ['Creativity & Innovation', 'Visual Communication', 'Market Trend Sensibility', 'High Adaptability', 'Creative Collaboration', 'Critical Thinking'] },
    { id: 'it', icon: '💻', title: 'Technology & IT', hint: 'Technology evolves, make sure your programming stack is up to date.', hard: ['JavaScript / TypeScript', 'React & Next.js', 'Node.js & Express', 'SQL & NoSQL Database', 'Cloud Computing (AWS/GCP)', 'Git & CI/CD'], soft: ['Algorithmic Logic', 'Continuous Learning', 'Teamwork (Agile/Scrum)', 'Resilience', 'Technical Communication', 'Time Management'] },
    { id: 'sales', icon: '📈', title: 'Sales & Business Dev', hint: 'Show your ability to hit targets and build B2B/B2C relationships.', hard: ['B2B/B2C Sales', 'CRM Software (Salesforce, HubSpot)', 'Lead Generation', 'Account Management', 'Sales Forecasting', 'Market Research'], soft: ['Persuasive Negotiation', 'Business Presentation', 'Target Orientation', 'Relationship Building', 'Persistence', 'Active Listening'] },
    { id: 'healthcare', icon: '🏥', title: 'Healthcare & Medical', hint: 'Integrity, procedural compliance, and patient care are key.', hard: ['Patient Care', 'Medical Record Management', 'Triage & Emergency Response', 'Clinical Operations', 'Infection Control', 'Healthcare Compliance (HIPAA)'], soft: ['Empathy & Compassion', 'Calm Under Pressure', 'Therapeutic Communication', 'Medical Teamwork', 'Professional Ethics', 'Detail & Accuracy'] },
    { id: 'education', icon: '📚', title: 'Education & Teaching', hint: 'Include pedagogical methods and mastery of current edutech platforms.', hard: ['Curriculum Development', 'Instructional Design', 'E-Learning Platforms (Moodle, Canvas)', 'Student Assessment', 'Classroom Management', 'Special Education'], soft: ['Extra Patience', 'Public Speaking', 'Mentoring & Coaching', 'Teaching Creativity', 'Emotional Intelligence', 'Student Character Adaptation'] },
    { id: 'engineering', icon: '🏗️', title: 'Engineering & Architecture', hint: 'Focus on CAD software, project management, and safety compliance.', hard: ['AutoCAD & SketchUp', 'Project Management (PMP)', 'Structural Analysis', 'Quality Control (QC)', 'HSE/K3 Compliance', 'Cost Estimation'], soft: ['Complex Problem Solving', 'Logical Thinking', 'Risk Management', 'Project Collaboration', 'Attention to Detail', 'Analytical Thinking'] },
    { id: 'operations', icon: '⚙️', title: 'Operations & Logistics', hint: 'Supply chain efficiency and logistic systems understanding are top selling points.', hard: ['Supply Chain Management', 'Inventory Control', 'Warehouse Management Systems (WMS)', 'Fleet Management', 'Lean Six Sigma', 'Vendor Negotiation'], soft: ['Multitasking', 'Crisis Management', 'Fast Problem Solving', 'Cross-Divisional Coordination', 'Decision Making', 'Time Management'] },
    { id: 'hospitality', icon: '🏨', title: 'Hospitality & Tourism', hint: 'Provide excellent service impressions and customer satisfaction.', hard: ['Front Office Operations', 'F&B Management', 'Property Management Systems (Opera)', 'Event Planning', 'Guest Relations', 'Quality Assurance'], soft: ['Service Excellence', 'Friendly Communication', 'Conflict Resolution', 'Cross-Cultural Intelligence', 'Adaptability', 'Teamwork'] },
    { id: 'data', icon: '🔬', title: 'Data Science & Analytics', hint: 'The combination of mathematical statistics and business insight is crucial.', hard: ['Python / R', 'Machine Learning Algorithms', 'SQL & Database Management', 'Data Visualization (PowerBI)', 'A/B Testing', 'Big Data (Hadoop/Spark)'], soft: ['Extreme Analytical Thinking', 'Curiosity', 'Complex Data Communication', 'Structured Problem Solving', 'Scientific Skepticism', 'Storytelling'] },
    { id: 'legal', icon: '⚖️', title: 'Legal & Compliance', hint: 'Attention to contract details and positive law determines your career.', hard: ['Legal Drafting', 'Contract Negotiation', 'Corporate Law', 'Regulatory Compliance', 'Litigation & Dispute Resolution', 'Intellectual Property'], soft: ['High Confidentiality', 'Logical & Critical Thinking', 'Objectivity', 'Oral & Written Argumentation', 'Extra Attention to Detail', 'High Professional Ethics'] },
    { id: 'media', icon: '🎙️', title: 'Media & Journalism', hint: 'Information accuracy and strong narrative delivery are the main advantages.', hard: ['Journalistic Writing', 'Video & Audio Editing', 'SEO Copywriting', 'Broadcasting', 'Fact Checking', 'Press Relations'], soft: ['Interviewing Skills', 'Working Under Deadlines', 'News Objectivity', 'Courage', 'Interpersonal Skills', 'Field Adaptability'] },
    { id: 'cs', icon: '🎧', title: 'Customer Support', hint: 'Show your level of empathy and customer retention skills.', hard: ['CRM Software (Zendesk, Freshdesk)', 'Ticketing Systems', 'Product Knowledge', 'Technical Troubleshooting', 'Live Chat Support', 'SLA Monitoring'], soft: ['High Patience', 'Active Empathy', 'Conflict De-escalation', 'Assertive Communication', 'Active Listening', 'Fast Problem Solving'] },
    { id: 'pr', icon: '📢', title: 'Public Relations (PR)', hint: 'Skills in building positive company image and crisis mitigation.', hard: ['Crisis Communication', 'Press Release Writing', 'Media Pitching', 'Event Management', 'Corporate Social Responsibility (CSR)', 'Brand Management'], soft: ['Diplomacy', 'Networking & Relations', 'Tactical Thinking', 'Public Communication', 'Social Sensitivity', 'Visual & Text Storytelling'] },
    { id: 'manufacturing', icon: '🏭', title: 'Manufacturing & Prod', hint: 'Understanding of factory production flow and quality assurance standards.', hard: ['Production Planning (PPIC)', 'Quality Assurance/QC', 'Total Productive Maintenance (TPM)', 'ISO 9001/14001', 'OEE Monitoring', '5S & Kaizen'], soft: ['Safety Management', 'Operational Teamwork', 'Time Discipline', 'Production Line Problem Solving', 'High Level Accuracy', 'Foreman Leadership'] },
    { id: 'agriculture', icon: '🌾', title: 'Agriculture & Agribiz', hint: 'Modern agronomy knowledge and agricultural commodity business management.', hard: ['Agronomy & Soil Science', 'Farm Management', 'Pest & Disease Control', 'AgTech (Drone/Sensors)', 'Commodity Trading', 'Agribusiness Supply Chain'], soft: ['Physical Endurance', 'Field Problem Solving', 'Fast Decision Making', 'Environmental Awareness', 'Crisis Management (Weather)', 'Continuous Innovation'] },
    { id: 'government', icon: '🏛️', title: 'Government & Public Sector', hint: 'Focus on policy making, public service, and state regulations.', hard: ['Public Policy Analysis', 'Government Budgeting', 'Legal Regulations', 'Community Outreach', 'Public Administration', 'Grant Writing'], soft: ['Public Service Excellence', 'Neutrality & Integrity', 'Bureaucratic Diplomacy', 'Community Conflict Management', 'Servant Leadership', 'Policy Communication'] }
  ]
};

const DEFAULT_CV_DATA = {
  fullName: 'Lamine Yamal, S.Or., M.M.',
  targetPosition: 'Sports Marketing Director & Global Athlete',
  birthPlace: 'Esplugues de Llobregat',
  birthDate: '2007-07-13',
  gender: 'Laki-laki',
  status: 'Belum Kawin',
  citizenship: 'Spanyol',
  address: 'La Masia, Ciutat Esportiva Joan Gamper, Barcelona',
  phone: '+34 600-123-456',
  email: 'lamine.yamal@fcbarcelona.com',
  instagram: '@lamineyamal',
  summary: 'Profesional visioner dengan rekam jejak spektakuler di industri olahraga dan pemasaran komersial. Lulusan Magister Manajemen Spesialisasi Sports Business yang memadukan keunggulan performa atletik dengan strategi branding global. Berpengalaman memimpin kampanye bernilai jutaan euro, negosiasi sponsor multinasional, serta memecahkan rekor performa tertinggi di kompetisi elite Eropa.',
  experience: [{ 
    title: 'Brand Ambassador Global & Winger Utama', 
    company: 'FC BARCELONA & ADIDAS GLOBAL', 
    period: '[2023-Sekarang]', 
    description: 'Menjadi wajah utama untuk kampanye pemasaran global, meningkatkan brand engagement sebesar 400% di kalangan Gen-Z. Memecahkan berbagai rekor sejarah Eropa yang memicu lonjakan penjualan merchandise klub hingga 1.2 juta unit dalam kuartal pertama. Terlibat dalam perancangan strategi akuisisi sponsor.' 
  }],
  education: [{ 
    degree: 'Magister Manajemen Olahraga (M.M.)', 
    institution: 'UNIVERSITAS BARCELONA BUSINESS SCHOOL', 
    period: '[2024-2026]', 
    description: 'Lulus dengan predikat Summa Cum Laude (IPK 3.98/4.00). Tesis: "Strategi Monetisasi dan Retensi Penggemar Gen-Z di Klub Olahraga Modern". Memenangkan penghargaan Best Business Strategy Project.' 
  }],
  seminar: [{
    title: 'Pembicara Utama (Keynote Speaker)',
    institution: 'Global Sports Marketing Summit',
    period: '[AGU 2024]',
    description: 'Mempresentasikan materi inovatif mengenai pemanfaatan kecerdasan buatan (AI) dalam menganalisa taktik bermain dan kecenderungan pasar merchandise olahraga di hadapan 5,000 eksekutif internasional.'
  }],
  hardSkills: 'Sports Marketing Strategy, Sponsorship Negotiation, Data-Driven Performance Analysis, Brand Management, Multilingual Communication',
  softSkills: 'Kepemimpinan Strategis, Pengambilan Keputusan Cepat, Kerja Sama Tim, Adaptabilitas Ekstrem, Kecerdasan Emosional',
};

export default function BuilderPage() { 
  const { register, control, watch, setValue, getValues, reset } = useForm<FormValues>({
    defaultValues: DEFAULT_CV_DATA
  });

  const { fields: expFields, append: appendExp, remove: removeExp } = useFieldArray({ control, name: 'experience' });
  const { fields: eduFields, append: appendEdu, remove: removeEdu } = useFieldArray({ control, name: 'education' });
  const { fields: semFields, append: appendSem, remove: removeSem } = useFieldArray({ control, name: 'seminar' });

  const formValues = watch();

  const [activeTab, setActiveTab] = useState<'profil' | 'edukasi' | 'skill'>('profil');
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  
  // AI Audit State
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  
  // PDF Export State
  const [previewTemplate, setPreviewTemplate] = useState<'standard' | 'modern'>('modern');
  const [language, setLanguage] = useState<'id' | 'en'>('id');
  const [isLangOpen, setIsLangOpen] = useState(false);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const lang = params.get('lang');
      if (lang === 'en' || lang === 'id') {
        setLanguage(lang);
      }
    }
  }, []);

  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  
  // AI Recommendations State
  const [customPosition, setCustomPosition] = useState('');
  const [aiSkills, setAiSkills] = useState<{hard_skills: string[], soft_skills: string[], saran: string} | null>(null);
  const [activePreset, setActivePreset] = useState<any>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const resumePreviewRef = useRef<HTMLDivElement>(null);

  const handleAnalyze = async () => {
    setLoadingAction('analyze');
    setShowAnalysisModal(true);
    setAnalysisResult(null); // Reset previous
    try {
      const res = await api.analyze({ ...formValues, language });
      setAnalysisResult(res);
    } catch (err) {
      console.error(err);
      setShowAnalysisModal(false);
      Swal.fire({ title: language === 'id' ? 'Gagal' : 'Failed', text: language === 'id' ? 'Gagal menganalisis CV' : 'Failed to analyze CV', icon: 'error' });
    } finally {
      setLoadingAction(null);
    }
  };

  const handleExportStandardPdf = async () => {
    setLoadingAction('export-standard');
    try {
      await api.exportPdf({ ...formValues, language });
    } catch (err) {
      console.error(err);
      Swal.fire({ title: language === 'id' ? 'Gagal' : 'Failed', text: language === 'id' ? 'Gagal mengekspor PDF Standar' : 'Failed to export Standard PDF', icon: 'error' });
    } finally {
      setLoadingAction(null);
    }
  };

  const handleExportModernPdf = async () => {
    setLoadingAction('export-modern');
    
    // Add a slight delay to allow UI to update if needed
    setTimeout(() => {
      window.print();
      setLoadingAction(null);
    }, 500);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPhotoUrl(url);
  };



  const searchCustomSkills = async () => {
    if (!customPosition) return;
    setLoadingAction('search-skills');
    try {
      const res = await api.recommendSkills(customPosition, language);
      setAiSkills(res);
      setActivePreset(null);
    } catch (err) {
      console.error(err);
      Swal.fire({ title: language === 'id' ? 'Gagal' : 'Failed', text: language === 'id' ? 'Gagal mendapatkan saran skills' : 'Failed to get skills suggestion', icon: 'error' });
    } finally {
      setLoadingAction(null);
    }
  };

  const handleEnhanceDescription = async (text: string, type: 'experience' | 'education' | 'summary' | 'seminar', setterCallback: (newText: string) => void) => {
    if (!text) {
      Swal.fire({ title: language === 'id' ? 'Kosong' : 'Empty', text: language === 'id' ? 'Silakan isi teks terlebih dahulu sebelum di-enhance.' : 'Please enter text before enhancing.', icon: 'warning' });
      return;
    }
    setLoadingAction(`enhance-${type}`);
    try {
      const res = await api.enhanceDescription(text, type, language);
      setterCallback(res.enhanced);
      Swal.fire({ title: language === 'id' ? 'Ajaib!' : 'Amazing!', text: language === 'id' ? 'Teks berhasil diperbagus oleh AI!' : 'Text successfully enhanced by AI!', icon: 'success', timer: 1500, showConfirmButton: false });
    } catch (err) {
      console.error(err);
      Swal.fire({ title: language === 'id' ? 'Gagal' : 'Failed', text: language === 'id' ? 'Gagal meningkatkan deskripsi' : 'Failed to enhance description', icon: 'error' });
    } finally {
      setLoadingAction(null);
    }
  };

  const formatDateId = (dateString: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch {
      return dateString;
    }
  };

  const applyPresetSkills = (preset: any) => {
    setActivePreset(preset);
    setAiSkills(null);
  };

  const appendHardSkill = (skill: string) => {
    const current = getValues('hardSkills');
    if (current) {
      if (!current.includes(skill)) setValue('hardSkills', current + ', ' + skill);
    } else {
      setValue('hardSkills', skill);
    }
  };

  const appendSoftSkill = (skill: string) => {
    const current = getValues('softSkills');
    if (current) {
      if (!current.includes(skill)) setValue('softSkills', current + ', ' + skill);
    } else {
      setValue('softSkills', skill);
    }
  };

  const handleClearCV = () => {
    Swal.fire({
      title: language === 'id' ? 'Kosongkan Resume?' : 'Clear Resume?',
      text: language === 'id' ? 'Semua data akan dihapus. Yakin?' : 'All data will be cleared. Are you sure?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#3b82f6',
      confirmButtonText: language === 'id' ? 'Ya, Kosongkan' : 'Yes, Clear',
      cancelButtonText: language === 'id' ? 'Batal' : 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        reset({
          fullName: '', targetPosition: '', birthPlace: '', birthDate: '', gender: '', status: '', citizenship: '', address: '', phone: '', email: '', instagram: '', summary: '',
          experience: [], education: [], seminar: [], hardSkills: '', softSkills: ''
        });
        setPhotoUrl(null);
        Swal.fire({ title: language === 'id' ? 'Dikosongkan!' : 'Cleared!', text: language === 'id' ? 'Silakan mulai mengetik Resume baru.' : 'You can start typing your new resume.', icon: 'success', timer: 1500, showConfirmButton: false });
      }
    });
  };

  const handleLoadExample = () => {
    reset(DEFAULT_CV_DATA);
    Swal.fire({ title: language === 'id' ? 'Contoh Dimuat!' : 'Example Loaded!', text: language === 'id' ? 'Contoh template berhasil di-load kembali.' : 'Template example successfully loaded.', icon: 'success', timer: 1500, showConfirmButton: false });
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 dark:bg-[#0B0F19] text-gray-900 dark:text-white selection:bg-blue-500/30 font-sans overflow-auto md:overflow-hidden print:bg-white print:overflow-visible">
      
      {/* LEFT: FORM (100% Mobile, 50% Desktop) */}
      <div className="w-full md:w-1/2 min-h-screen md:h-screen overflow-visible md:overflow-y-auto border-b md:border-b-0 md:border-r border-gray-100 dark:border-white/5 bg-white dark:bg-[#0D121F] z-10 custom-scrollbar flex flex-col relative print:hidden">
        
        {/* HEADER */}
        <div className="sticky top-0 bg-slate-50/90 dark:bg-[#0B0F19]/90 backdrop-blur-md p-5 z-30 border-b border-gray-100 dark:border-white/5 shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-[0_0_15px_rgba(37,99,235,0.5)]">
                <Sparkles className="w-4 h-4 text-gray-900 dark:text-white" />
              </div>
              <span className="text-xl font-bold tracking-wide">RESUMAI</span>
            </Link>
            <div className="flex gap-2">
              <ThemeToggle />
              <div className="relative z-50">
                <button onClick={() => setIsLangOpen(!isLangOpen)} className="flex items-center gap-2 px-3 py-1.5 bg-purple-500/10 text-purple-400 rounded-md border border-purple-500/20 text-xs font-semibold hover:bg-purple-500/20 transition-all shadow-lg">
                  <img src={language === 'id' ? 'https://flagcdn.com/w80/id.png' : 'https://flagcdn.com/w80/gb.png'} alt="Flag" className="w-5 h-3.5 object-cover rounded-sm" crossOrigin="anonymous" />
                  <span className="uppercase text-xs font-bold">{language === 'id' ? 'ID' : 'EN'}</span>
                  <svg className={`w-3 h-3 transition-transform ${isLangOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
                {isLangOpen && (
                  <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-[#0D121F] border border-gray-200 dark:border-white/10 rounded-lg shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2">
                    <button onClick={() => { setLanguage('id'); setIsLangOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:bg-white/5 transition-colors text-left">
                      <img src="https://flagcdn.com/w80/id.png" alt="ID" className="w-6 h-4 object-cover rounded-sm" crossOrigin="anonymous" />
                      <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Indonesia</span>
                    </button>
                    <button onClick={() => { setLanguage('en'); setIsLangOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:bg-white/5 transition-colors text-left border-t border-gray-100 dark:border-white/5">
                      <img src="https://flagcdn.com/w80/gb.png" alt="EN" className="w-6 h-4 object-cover rounded-sm" crossOrigin="anonymous" />
                      <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">English</span>
                    </button>
                  </div>
                )}
              </div>
              <button onClick={handleLoadExample} className="px-3 py-1.5 bg-blue-500/10 text-blue-400 rounded-md border border-blue-500/20 text-xs font-semibold hover:bg-blue-500/20 transition-all flex items-center gap-2 hidden md:flex">
                {language === 'id' ? '📄 Contoh Template' : '📄 Template Example'}
              </button>
              <button onClick={handleClearCV} className="px-3 py-1.5 bg-red-500/10 text-red-400 rounded-md border border-red-500/20 text-xs font-semibold hover:bg-red-500/20 transition-all flex items-center gap-2">
                {language === 'id' ? '🗑 Kosongkan Resume' : '🗑 Clear Resume'}
              </button>
            </div>
          </div>

          {/* TABS */}
          <div className="flex gap-2 bg-gray-100 dark:bg-[#1A2235] p-1.5 rounded-xl border border-gray-100 dark:border-white/5">
            <button onClick={() => setActiveTab('profil')} className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-all ${activeTab === 'profil' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:text-white'}`}>
              <UserCircle2 className="w-4 h-4" /> {language === 'id' ? 'Profil & Foto' : 'Profile & Photo'}
            </button>
            <button onClick={() => setActiveTab('edukasi')} className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-all ${activeTab === 'edukasi' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:text-white'}`}>
              <GraduationCap className="w-4 h-4" /> {language === 'id' ? 'Edukasi & Organisasi' : 'Education & Org'}
            </button>
            <button onClick={() => setActiveTab('skill')} className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-all ${activeTab === 'skill' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:text-white'}`}>
              <Code2 className="w-4 h-4" /> {language === 'id' ? 'Skill & Bio' : 'Skill & Bio'}
            </button>
          </div>
        </div>

        {/* FORM CONTENT */}
        <div className="p-6 md:p-8 flex-1 pb-24">
          {activeTab === 'profil' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              
              <section className="bg-white dark:bg-[#131A29] border border-gray-100 dark:border-white/5 rounded-2xl p-6 shadow-xl">
                <p className="text-[10px] font-bold text-blue-400 mb-4 tracking-widest uppercase">{language === 'id' ? '1. IDENTITAS UTAMA' : '1. MAIN IDENTITY'}</p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1.5 font-medium">{language === 'id' ? 'Nama Lengkap & Titel Akademik' : 'Full Name & Academic Title'}</label>
                    <input {...register('fullName')} className="w-full bg-slate-50 dark:bg-[#0B0F19] border border-gray-100 dark:border-white/5 rounded-xl p-3 text-sm text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 transition-all outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1.5 font-medium">{language === 'id' ? 'Target Posisi Pekerjaan' : 'Target Job Position'}</label>
                    <input {...register('targetPosition')} className="w-full bg-slate-50 dark:bg-[#0B0F19] border border-gray-100 dark:border-white/5 rounded-xl p-3 text-sm text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 transition-all outline-none" />
                  </div>
                </div>
              </section>

              <section className="bg-white dark:bg-[#131A29] border border-gray-100 dark:border-white/5 rounded-2xl p-6 shadow-xl">
                <p className="text-[10px] font-bold text-blue-400 mb-4 tracking-widest uppercase">{language === 'id' ? '2. FOTO PROFIL RESUME' : '2. RESUME PROFILE PHOTO'}</p>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-24 h-32 bg-slate-50 dark:bg-[#0B0F19] rounded-xl border border-gray-200 dark:border-white/10 flex items-center justify-center overflow-hidden relative group shrink-0">
                      {photoUrl ? (
                        <img src={photoUrl} alt="Profil" className="w-full h-full object-cover" crossOrigin="anonymous" />
                      ) : (
                        <ImageIcon className="w-8 h-8 text-gray-600" />
                      )}
                    </div>
                    <div className="flex-1 space-y-3">
                      <input type="file" ref={fileInputRef} accept="image/*" onChange={handlePhotoUpload} className="w-full text-xs text-gray-600 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-500/10 file:text-blue-400 hover:file:bg-blue-500/20 transition-all cursor-pointer" />
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-relaxed">{language === 'id' ? 'Unggah pasfoto berkualitas, cerah, tegak, serta formal (rasio 3:4 disarankan). Untuk mengedit foto dengan AI, silakan gunakan aplikasi eksternal seperti Google Gemini, lalu unggah hasilnya ke sini.' : 'Upload a bright, upright, formal passport photo (3:4 ratio recommended). To edit photos with AI, please use external apps like Google Gemini, then upload the result here.'}</p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="bg-white dark:bg-[#131A29] border border-gray-100 dark:border-white/5 rounded-2xl p-6 shadow-xl">
                <p className="text-[10px] font-bold text-blue-400 mb-4 tracking-widest uppercase">{language === 'id' ? '3. KONTAK & DETAIL DATA DIRI' : '3. CONTACT & PERSONAL DETAILS'}</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1.5 font-medium">{language === 'id' ? 'Tempat Lahir' : 'Place of Birth'}</label>
                    <input {...register('birthPlace')} className="w-full bg-slate-50 dark:bg-[#0B0F19] border border-gray-100 dark:border-white/5 rounded-xl p-2.5 text-xs text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1.5 font-medium">{language === 'id' ? 'Tanggal Lahir' : 'Date of Birth'}</label>
                    <input type="date" {...register('birthDate')} className="w-full bg-slate-50 dark:bg-[#0B0F19] border border-gray-100 dark:border-white/5 rounded-xl p-2.5 text-xs text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 outline-none [color-scheme:dark]" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1.5 font-medium">{language === 'id' ? 'Jenis Kelamin' : 'Gender'}</label>
                    <select {...register('gender')} className="w-full bg-slate-50 dark:bg-[#0B0F19] border border-gray-100 dark:border-white/5 rounded-xl p-2.5 text-xs text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 outline-none appearance-none">
                      <option value={language === 'id' ? 'Laki-laki' : 'Male'}>{language === 'id' ? 'Laki-laki' : 'Male'}</option>
                      <option value={language === 'id' ? 'Perempuan' : 'Female'}>{language === 'id' ? 'Perempuan' : 'Female'}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1.5 font-medium">{language === 'id' ? 'Status Pernikahan' : 'Marital Status'}</label>
                    <select {...register('status')} className="w-full bg-slate-50 dark:bg-[#0B0F19] border border-gray-100 dark:border-white/5 rounded-xl p-2.5 text-xs text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 outline-none appearance-none">
                      <option value={language === 'id' ? 'Belum Kawin' : 'Single'}>{language === 'id' ? 'Belum Kawin' : 'Single'}</option>
                      <option value={language === 'id' ? 'Kawin' : 'Married'}>{language === 'id' ? 'Kawin' : 'Married'}</option>
                      <option value={language === 'id' ? 'Cerai Hidup' : 'Divorced'}>{language === 'id' ? 'Cerai Hidup' : 'Divorced'}</option>
                      <option value={language === 'id' ? 'Cerai Mati' : 'Widowed'}>{language === 'id' ? 'Cerai Mati' : 'Widowed'}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1.5 font-medium">{language === 'id' ? 'Kewarganegaraan' : 'Citizenship / Nationality'}</label>
                    <input {...register('citizenship')} className="w-full bg-slate-50 dark:bg-[#0B0F19] border border-gray-100 dark:border-white/5 rounded-xl p-2.5 text-xs text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 outline-none" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1.5 font-medium">{language === 'id' ? 'Alamat Tempat Tinggal' : 'Residential Address'}</label>
                    <input {...register('address')} className="w-full bg-slate-50 dark:bg-[#0B0F19] border border-gray-100 dark:border-white/5 rounded-xl p-2.5 text-xs text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1.5 font-medium">{language === 'id' ? 'No. HP / WhatsApp' : 'Phone Number / WhatsApp'}</label>
                    <input {...register('phone')} className="w-full bg-slate-50 dark:bg-[#0B0F19] border border-gray-100 dark:border-white/5 rounded-xl p-2.5 text-xs text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1.5 font-medium">{language === 'id' ? 'Alamat Email' : 'Email Address'}</label>
                    <input {...register('email')} className="w-full bg-slate-50 dark:bg-[#0B0F19] border border-gray-100 dark:border-white/5 rounded-xl p-2.5 text-xs text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 outline-none" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1.5 font-medium">{language === 'id' ? 'Akun LinkedIn / Instagram' : 'LinkedIn / Instagram Account'}</label>
                    <input {...register('instagram')} className="w-full bg-slate-50 dark:bg-[#0B0F19] border border-gray-100 dark:border-white/5 rounded-xl p-2.5 text-xs text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 outline-none" />
                  </div>
                </div>
              </section>

            </div>
          )}

          {activeTab === 'edukasi' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              
              <section className="bg-white dark:bg-[#131A29] border border-gray-100 dark:border-white/5 rounded-2xl p-6 shadow-xl">
                <p className="text-[10px] font-bold text-blue-400 mb-4 tracking-widest uppercase">{language === 'id' ? '4. KURSUS / RIWAYAT PENDIDIKAN' : '4. EDUCATION / COURSE HISTORY'}</p>
                {eduFields.map((field, index) => (
                  <div key={field.id} className="bg-slate-50 dark:bg-[#0B0F19] p-4 rounded-xl border border-gray-100 dark:border-white/5 mb-4 relative group">
                    <button type="button" onClick={() => removeEdu(index)} className="absolute top-4 right-4 text-gray-600 hover:text-red-400">✕</button>
                    <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 mb-3 uppercase">{index + 1}. {language === 'id' ? 'RIWAYAT PENDIDIKAN' : 'EDUCATION RECORD'}</p>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[10px] text-gray-600 dark:text-gray-400 mb-1">{language === 'id' ? 'Nama Sekolah / Universitas' : 'School / University Name'}</label>
                        <input {...register(`education.${index}.institution`)} placeholder="SDN UTAMA INDONESIA 01" className="w-full bg-transparent border-b border-gray-200 dark:border-white/10 p-1.5 text-xs text-gray-900 dark:text-white focus:border-blue-500 outline-none" />
                      </div>
                      <div>
                        <label className="block text-[10px] text-gray-600 dark:text-gray-400 mb-1">{language === 'id' ? 'Gelar / Jurusan' : 'Degree / Major'}</label>
                        <input {...register(`education.${index}.degree`)} placeholder="Sarjana Psikologi (S.Psi)" className="w-full bg-transparent border-b border-gray-200 dark:border-white/10 p-1.5 text-xs text-gray-900 dark:text-white focus:border-blue-500 outline-none" />
                      </div>
                      <div>
                        <label className="block text-[10px] text-gray-600 dark:text-gray-400 mb-1">{language === 'id' ? 'Tahun Berlangsung (Gunakan Kurung Siku)' : 'Study Period (Use Brackets)'}</label>
                        <input {...register(`education.${index}.period`)} placeholder="[2019-2023]" className="w-full bg-transparent border-b border-gray-200 dark:border-white/10 p-1.5 text-xs text-gray-900 dark:text-white focus:border-blue-500 outline-none" />
                        <p className="text-[9px] text-gray-500 dark:text-gray-400 mt-1">{language === 'id' ? 'Contoh: Teknik Komputer & Jaringan [2016-2019] atau [2007-2013].' : 'Example: Computer Engineering [2016-2019] or [2007-2013].'}</p>
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <label className="block text-[10px] text-gray-600 dark:text-gray-400">{language === 'id' ? 'Pencapaian / Catatan Prestasi' : 'Achievements / Notes'}</label>
                          <button type="button" onClick={() => handleEnhanceDescription(getValues(`education.${index}.description`), 'education', (val) => setValue(`education.${index}.description`, val))} className="text-[10px] text-purple-400 hover:text-purple-300 flex items-center gap-1 font-bold">
                            {loadingAction === 'enhance-education' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />} AI Enhance
                          </button>
                        </div>
                        <textarea {...register(`education.${index}.description`)} rows={2} placeholder="Lulus dengan predikat sangat baik..." className="w-full bg-transparent border border-gray-200 dark:border-white/10 rounded-lg p-2 text-xs text-gray-900 dark:text-white focus:border-blue-500 outline-none resize-none" />
                      </div>
                    </div>
                  </div>
                ))}
                <button type="button" onClick={() => appendEdu({ degree: '', institution: '', period: '', description: '' })} className="w-full py-3 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-xl text-xs font-bold hover:bg-blue-500/20 transition-all flex items-center justify-center gap-2">
                  🎓 {language === 'id' ? 'Tambah Jenjang Studi' : 'Add Education'}
                </button>
              </section>

              <section className="bg-white dark:bg-[#131A29] border border-gray-100 dark:border-white/5 rounded-2xl p-6 shadow-xl relative">
                <div className="absolute -top-3 left-4 bg-orange-500/20 border border-orange-500/50 text-orange-300 text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 font-bold">
                  🏷 {language === 'id' ? 'JUDUL BAGIAN PERTAMA' : 'FIRST SECTION TITLE'}
                </div>
                <p className="text-[10px] font-bold text-blue-400 mt-2 mb-1 tracking-widest uppercase">{language === 'id' ? 'PENGALAMAN ORGANISASI / KERJA' : 'WORK / ORG EXPERIENCE'}</p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">{language === 'id' ? 'Jika Anda tidak memiliki riwayat Organisasi, seksi ini bisa diganti menjadi PROYEK MANDIRI / PRESTASI.' : 'If you have no organization experience, this section can be used for INDEPENDENT PROJECTS / ACHIEVEMENTS.'}</p>
                
                {expFields.map((field, index) => (
                  <div key={field.id} className="bg-slate-50 dark:bg-[#0B0F19] p-4 rounded-xl border border-gray-100 dark:border-white/5 mb-4 relative">
                    <button type="button" onClick={() => removeExp(index)} className="absolute top-4 right-4 text-gray-600 hover:text-red-400">✕</button>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[10px] text-gray-600 dark:text-gray-400 mb-1">{language === 'id' ? 'Nama Peran / Jabatan [Tahun]' : 'Role / Position [Year]'}</label>
                        <input {...register(`experience.${index}.title`)} placeholder="Ketua HMJ Psikologi [2018-2019]" className="w-full bg-transparent border-b border-gray-200 dark:border-white/10 p-1.5 text-xs text-gray-900 dark:text-white focus:border-blue-500 outline-none" />
                      </div>
                      <div>
                        <label className="block text-[10px] text-gray-600 dark:text-gray-400 mb-1">{language === 'id' ? 'Tempat Kerja / Kampus / Kompetisi' : 'Workplace / Campus / Competition'}</label>
                        <input {...register(`experience.${index}.company`)} placeholder="UNIVERSITAS BIMA SAKTI" className="w-full bg-transparent border-b border-gray-200 dark:border-white/10 p-1.5 text-xs text-gray-900 dark:text-white focus:border-blue-500 outline-none" />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <label className="block text-[10px] text-gray-600 dark:text-gray-400">{language === 'id' ? 'Deskripsi Detail Kegiatan & Hasil Nyata' : 'Detailed Description & Achievements'}</label>
                          <button type="button" onClick={() => handleEnhanceDescription(getValues(`experience.${index}.description`), 'experience', (val) => setValue(`experience.${index}.description`, val))} className="text-[10px] text-purple-400 hover:text-purple-300 flex items-center gap-1 font-bold">
                            {loadingAction === 'enhance-experience' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />} AI Enhance
                          </button>
                        </div>
                        <textarea {...register(`experience.${index}.description`)} rows={3} placeholder="Memberikan kontribusi ide..." className="w-full bg-transparent border border-gray-200 dark:border-white/10 rounded-lg p-2 text-xs text-gray-900 dark:text-white focus:border-blue-500 outline-none resize-none" />
                      </div>
                    </div>
                  </div>
                ))}
                <button type="button" onClick={() => appendExp({ title: '', company: '', period: '', description: '' })} className="w-full py-2 bg-gray-50 dark:bg-white/5 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-white/10 rounded-xl text-xs font-bold hover:bg-gray-200 dark:hover:bg-white/10 transition-all">
                  + {language === 'id' ? 'Tambah Organisasi' : 'Add Organization'}
                </button>
              </section>

              <section className="bg-white dark:bg-[#131A29] border border-gray-100 dark:border-white/5 rounded-2xl p-6 shadow-xl relative">
                <div className="absolute -top-3 left-4 bg-purple-500/20 border border-purple-500/50 text-purple-300 text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 font-bold">
                  🏷 {language === 'id' ? 'JUDUL BAGIAN KEDUA' : 'SECOND SECTION TITLE'}
                </div>
                <p className="text-[10px] font-bold text-blue-400 mt-2 mb-1 tracking-widest uppercase">{language === 'id' ? 'PENGALAMAN SEMINAR / PELATIHAN' : 'SEMINAR / TRAINING EXPERIENCE'}</p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">{language === 'id' ? 'Rekomendasi: SERTIFIKASI & PELATIHAN, PORTFOLIO.' : 'Recommendation: CERTIFICATIONS & TRAININGS, PORTFOLIO.'}</p>
                
                {semFields.map((field, index) => (
                  <div key={field.id} className="bg-slate-50 dark:bg-[#0B0F19] p-4 rounded-xl border border-gray-100 dark:border-white/5 mb-4 relative">
                    <button type="button" onClick={() => removeSem(index)} className="absolute top-4 right-4 text-gray-600 hover:text-red-400">✕</button>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <label className="block text-[10px] text-gray-600 dark:text-gray-400 mb-1">{language === 'id' ? 'Sertifikasi / Peran & Waktu' : 'Certification / Role & Time'}</label>
                        <input {...register(`seminar.${index}.title`)} placeholder="Peserta [JAN 2021]" className="w-full bg-transparent border-b border-gray-200 dark:border-white/10 p-1.5 text-xs text-gray-900 dark:text-white focus:border-blue-500 outline-none" />
                      </div>
                      <div>
                        <label className="block text-[10px] text-gray-600 dark:text-gray-400 mb-1">{language === 'id' ? 'Penyelenggara / Lembaga Penerbit' : 'Organizer / Publisher Institution'}</label>
                        <input {...register(`seminar.${index}.institution`)} placeholder="SEMINAR NASIONAL INDONESIA" className="w-full bg-transparent border-b border-gray-200 dark:border-white/10 p-1.5 text-xs text-gray-900 dark:text-white focus:border-blue-500 outline-none" />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <label className="block text-[10px] text-gray-600 dark:text-gray-400">{language === 'id' ? 'Detail / Silabus Pembelajaran' : 'Details / Learning Syllabus'}</label>
                        <button type="button" onClick={() => handleEnhanceDescription(getValues(`seminar.${index}.description`), 'seminar', (val) => setValue(`seminar.${index}.description`, val))} className="text-[10px] text-purple-400 hover:text-purple-300 flex items-center gap-1 font-bold">
                          {loadingAction === 'enhance-seminar' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />} AI Enhance
                        </button>
                      </div>
                      <textarea {...register(`seminar.${index}.description`)} rows={2} placeholder="Tema psikoedukasi secara online..." className="w-full bg-transparent border border-gray-200 dark:border-white/10 rounded-lg p-2 text-xs text-gray-900 dark:text-white focus:border-blue-500 outline-none resize-none" />
                    </div>
                  </div>
                ))}
                <button type="button" onClick={() => appendSem({ title: '', institution: '', period: '', description: '' })} className="w-full py-2 bg-gray-50 dark:bg-white/5 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-white/10 rounded-xl text-xs font-bold hover:bg-gray-200 dark:hover:bg-white/10 transition-all">
                  + {language === 'id' ? 'Tambah Seminar/Sertifikasi' : 'Add Seminar/Certification'}
                </button>
              </section>

            </div>
          )}

          {activeTab === 'skill' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              
              <section className="bg-white dark:bg-[#131A29] border border-gray-100 dark:border-white/5 rounded-2xl p-6 shadow-xl">
                <p className="text-[10px] font-bold text-blue-400 mb-2 tracking-widest uppercase">{language === 'id' ? '5. SKILL & KETERAMPILAN' : '5. SKILLS'}</p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] text-gray-600 dark:text-gray-400 mb-1">{language === 'id' ? 'Hard Skills (Teknis)' : 'Hard Skills (Technical)'}</label>
                    <textarea {...register('hardSkills')} rows={2} placeholder="Manajemen SDM, MS Excel..." className="w-full bg-slate-50 dark:bg-[#0B0F19] border border-gray-200 dark:border-white/10 rounded-xl p-3 text-sm text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 transition-all outline-none" />
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-600 dark:text-gray-400 mb-1">{language === 'id' ? 'Soft Skills (Interpersonal)' : 'Soft Skills (Interpersonal)'}</label>
                    <textarea {...register('softSkills')} rows={2} placeholder="Kepemimpinan, Komunikasi..." className="w-full bg-slate-50 dark:bg-[#0B0F19] border border-gray-200 dark:border-white/10 rounded-xl p-3 text-sm text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 transition-all outline-none" />
                  </div>
                </div>
              </section>

              <section className="bg-white dark:bg-[#050914] border border-blue-500/20 rounded-2xl p-6 shadow-[0_0_30px_rgba(37,99,235,0.1)] relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
                <div className="flex items-center gap-2 mb-2">
                  <Bot className="w-5 h-5 text-blue-400" />
                  <p className="text-sm font-bold text-gray-900 dark:text-white tracking-widest uppercase">AI RECOMMENDATIONS</p>
                </div>
                <p className="text-[10px] text-gray-600 dark:text-gray-400 mb-6">{language === 'id' ? 'Asisten & Database Rekomendasi Kompetensi. Pilih kategori atau cari dengan AI.' : 'Assistant & Competency Recommendation Database. Select a category or search with AI.'}</p>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-6">
                  {SKILL_PRESETS[language].map((preset: any) => (
                    <button 
                      key={preset.id}
                      onClick={() => applyPresetSkills(preset)}
                      className={`p-2 rounded-xl text-xs font-semibold text-left transition-all border ${activePreset?.id === preset.id ? 'bg-blue-600/20 border-blue-500 text-blue-300 shadow-[0_0_15px_rgba(37,99,235,0.2)]' : 'bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10'}`}
                    >
                      <span className="text-sm mr-1">{preset.icon}</span> {preset.title}
                    </button>
                  ))}
                </div>

                <div className="relative mb-6">
                  <div className="flex items-center bg-slate-50 dark:bg-[#0B0F19] border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden focus-within:border-purple-500 focus-within:ring-1 focus-within:ring-purple-500/50 transition-all">
                    <span className="pl-3 text-gray-500 dark:text-gray-400"><Search className="w-4 h-4" /></span>
                    <input 
                      value={customPosition}
                      onChange={(e) => setCustomPosition(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && searchCustomSkills()}
                      placeholder={language === 'id' ? "Ketik posisi kustom... (misal: Digital Marketer)" : "Type custom position... (e.g. Digital Marketer)"} 
                      className="w-full bg-transparent p-2.5 text-xs text-gray-900 dark:text-white outline-none"
                    />
                    <button 
                      onClick={searchCustomSkills}
                      disabled={loadingAction === 'search-skills' || !customPosition}
                      className="bg-purple-600 hover:bg-purple-500 text-gray-900 dark:text-white px-4 py-2.5 text-xs font-bold disabled:opacity-50 flex items-center gap-2"
                    >
                      {loadingAction === 'search-skills' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : (language === 'id' ? 'Cari' : 'Search')}
                    </button>
                  </div>
                </div>

                {(activePreset || aiSkills) && (
                  <div className="bg-white dark:bg-[#131A29] rounded-xl p-4 border border-gray-100 dark:border-white/5 animate-in fade-in slide-in-from-bottom-4">
                    <div className="flex justify-between items-start mb-4 border-b border-gray-100 dark:border-white/5 pb-3">
                      <div>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 flex items-center gap-1 mb-1">
                          <Bot className="w-3 h-3 text-blue-400" /> PRESET: {activePreset ? activePreset.title : customPosition}
                        </p>
                        <p className="text-[10px] text-blue-300 italic max-w-sm">" {activePreset ? activePreset.hint : aiSkills?.saran} "</p>
                      </div>
                      <button 
                        onClick={() => {
                          const hard = activePreset ? activePreset.hard : (aiSkills?.hard_skills || []);
                          const soft = activePreset ? activePreset.soft : (aiSkills?.soft_skills || []);
                          setValue('hardSkills', hard.join(', '));
                          setValue('softSkills', soft.join(', '));
                        }}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-gray-900 dark:text-white text-[10px] font-bold rounded-lg transition-colors whitespace-nowrap"
                      >
                        {language === 'id' ? 'Pasang Semua' : 'Apply All'}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <p className="text-[10px] font-bold text-gray-600 dark:text-gray-400 mb-2 tracking-widest">{language === 'id' ? 'HARD SKILLS (TEKNIS)' : 'HARD SKILLS (TECHNICAL)'}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {(activePreset ? activePreset.hard : aiSkills?.hard_skills)?.map(skill => (
                            <button type="button" key={skill} onClick={() => appendHardSkill(skill)} className="px-2 py-1 bg-gray-50 dark:bg-white/5 hover:bg-blue-500/20 hover:text-blue-300 border border-gray-200 dark:border-white/10 rounded-md text-[10px] text-gray-700 dark:text-gray-300 transition-colors">
                              + {skill}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-600 dark:text-gray-400 mb-2 tracking-widest">{language === 'id' ? 'SOFT SKILLS (KARAKTER)' : 'SOFT SKILLS (CHARACTER)'}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {(activePreset ? activePreset.soft : aiSkills?.soft_skills)?.map(skill => (
                            <button type="button" key={skill} onClick={() => appendSoftSkill(skill)} className="px-2 py-1 bg-gray-50 dark:bg-white/5 hover:bg-purple-500/20 hover:text-purple-300 border border-gray-200 dark:border-white/10 rounded-md text-[10px] text-gray-700 dark:text-gray-300 transition-colors">
                              + {skill}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </section>

              <section className="bg-white dark:bg-[#131A29] border border-gray-100 dark:border-white/5 rounded-2xl p-6 shadow-xl">
                <p className="text-[10px] font-bold text-blue-400 mb-2 tracking-widest uppercase">{language === 'id' ? '6. TENTANG SAYA (SUMMARY BIOGRAFI)' : '6. ABOUT ME (SUMMARY)'}</p>
                <div className="flex justify-between items-end mb-4">
                  <p className="text-[10px] text-gray-600 dark:text-gray-400 w-3/4">{language === 'id' ? 'Ringkasan tentang saya adalah gerbang kualifikasi pertama yang dibaca oleh HRD. Susun dalam bahasa yang formal dan berbobot.' : 'The summary is the first qualification gate read by HR. Write it in formal language.'}</p>
                  <button type="button" onClick={() => handleEnhanceDescription(getValues('summary'), 'summary', (val) => setValue('summary', val))} className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-3 py-1.5 rounded-lg hover:bg-purple-500/30 flex items-center gap-1 font-bold transition-all">
                    {loadingAction === 'enhance-summary' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />} AI Enhance
                  </button>
                </div>
                <textarea {...register('summary')} rows={5} placeholder={language === 'id' ? "Saya adalah fresh graduate yang memiliki ketertarikan tinggi..." : "I am a fresh graduate with a high interest in..."} className="w-full bg-slate-50 dark:bg-[#0B0F19] border border-gray-200 dark:border-white/10 rounded-xl p-3 text-sm text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 transition-all outline-none leading-relaxed" />
              </section>

            </div>
          )}

          {/* Spacer div to ensure bottom scroll clearance for the fixed action bar */}
          <div className="h-32 w-full shrink-0"></div>
        </div>

        {/* BOTTOM ACTION BAR - REBUILT TO SUPPORT AI MODAL AND PDF DUAL OPTION */}
        <div className="fixed bottom-0 w-full md:w-1/2 p-5 border-t border-gray-100 dark:border-white/5 bg-slate-50 dark:bg-[#0B0F19]/80 backdrop-blur-md z-20 flex gap-4 print:hidden">
          <button 
            onClick={handleAnalyze}
            className="flex-1 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-gray-900 dark:text-white rounded-xl font-bold text-sm shadow-[0_0_20px_rgba(124,58,237,0.3)] hover:shadow-[0_0_30px_rgba(124,58,237,0.5)] transition-all flex items-center justify-center gap-2"
          >
            {loadingAction === 'analyze' ? <Loader2 className="w-5 h-5 animate-spin" /> : <Bot className="w-5 h-5" />}
            {language === 'id' ? 'Generate & Analisis AI' : 'Generate & AI Analysis'}
          </button>
          
          <button 
            onClick={() => previewTemplate === 'standard' ? handleExportStandardPdf() : handleExportModernPdf()}
            className="flex-1 py-4 bg-gray-50 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2"
          >
            {loadingAction?.startsWith('export') ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
            {language === 'id' ? `Export ${previewTemplate === 'standard' ? 'Standar ATS' : 'Modern'} PDF` : `Export ${previewTemplate === 'standard' ? 'Standard ATS' : 'Modern'} PDF`}
          </button>
        </div>
      </div>

      {/* RIGHT: PREVIEW (100% Mobile, 50% Desktop) */}
      <div id="preview-section" className="w-full md:w-1/2 min-h-screen md:h-screen overflow-visible md:overflow-y-auto bg-gray-100 dark:bg-[#070A12] p-4 md:p-8 flex justify-center items-start custom-scrollbar relative print:w-full print:h-auto print:bg-white print:p-0 print:overflow-visible print:block">
        <div className="absolute top-4 left-6 flex items-center gap-2 print:hidden">
          <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
          <span className="text-[10px] text-gray-500 dark:text-gray-400 tracking-widest font-bold">{language === 'id' ? 'PREVIEW RESUME REAL-TIME' : 'REAL-TIME RESUME PREVIEW'}</span>
        </div>
        
        <div className="absolute top-4 right-6 flex items-center gap-2 bg-white dark:bg-[#131A29] p-1 rounded-lg border border-gray-200 dark:border-white/10 z-20 print:hidden">
          <button 
            onClick={() => setPreviewTemplate('standard')}
            className={`px-3 py-1.5 text-[10px] font-bold rounded-md transition-all ${previewTemplate === 'standard' ? 'bg-blue-600 text-gray-900 dark:text-white shadow-lg' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:text-white'}`}
          >
            {language === 'id' ? 'Standar ATS (1 Kolom)' : 'Standard ATS (1 Column)'}
          </button>
          <button 
            onClick={() => setPreviewTemplate('modern')}
            className={`px-3 py-1.5 text-[10px] font-bold rounded-md transition-all ${previewTemplate === 'modern' ? 'bg-emerald-600 text-gray-900 dark:text-white shadow-lg' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:text-white'}`}
          >
            Modern (2 Kolom)
          </button>
        </div>
        
        {/* RESUME PAPER */}
        <div ref={resumePreviewRef} className={`bg-white w-full max-w-[210mm] min-h-[297mm] shadow-[0_0_50px_rgba(0,0,0,0.8)] mt-12 flex flex-col font-sans text-gray-900 print:shadow-none print:mt-0 print:min-h-0 print:max-w-none print:w-full ${previewTemplate === 'standard' ? 'p-12' : ''}`}>
          
          {previewTemplate === 'modern' ? (
          <div className="flex flex-1">
            {/* LEFT COLUMN */}
            <div className="w-[35%] bg-white border-r-2 border-gray-100 p-8 flex flex-col items-center">
              {/* Photo Box */}
              <div className="w-32 h-40 border-[1.5px] border-emerald-600 p-1 mb-6">
                {photoUrl ? (
                  <img src={photoUrl} alt="Resume" className="w-full h-full object-cover grayscale-[20%]" crossOrigin="anonymous" />
                ) : (
                  <div className="w-full h-full bg-gray-50 flex flex-col items-center justify-center text-gray-700 dark:text-gray-300">
                    <UserCircle2 className="w-12 h-12 mb-2" />
                    <span className="text-[8px] font-bold tracking-wider">{language === 'id' ? 'FOTO PROFIL' : 'PROFILE PHOTO'}</span>
                    <span className="text-[7px]">{language === 'id' ? 'Ukuran 3x4' : 'Size 3x4'}</span>
                  </div>
                )}
              </div>

              {/* Target Position */}
              <h3 className="text-emerald-700 font-extrabold text-sm text-center uppercase tracking-widest mb-1">{formValues.targetPosition || (language === 'id' ? 'TARGET POSISI PEKERJAAN' : 'TARGET JOB POSITION')}</h3>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 text-center mb-8 italic">{formValues.fullName || (language === 'id' ? '(Nama Lengkap Anda & Titel)' : '(Your Full Name & Title)')}</p>

              {/* Data Diri */}
              <div className="w-full">
                <h4 className="text-xs font-extrabold tracking-widest border-b-[1.5px] border-gray-900 pb-1 mb-4 uppercase">{language === 'id' ? 'DATA DIRI & KONTAK' : 'PERSONAL INFO & CONTACT'}</h4>
                <ul className="text-[10px] space-y-1.5 mt-2">
                  <li className="flex gap-2"><span className="font-bold text-emerald-700 w-3 shrink-0">▶</span> <div><span className="font-bold">{language === 'id' ? 'Tempat, Tanggal Lahir:' : 'Place, Date of Birth:'}</span> <span className="text-gray-600 block">{formValues.birthPlace && formValues.birthDate ? `${formValues.birthPlace}, ${formatDateId(formValues.birthDate)}` : language === 'id' ? '(Kota, Tanggal Lahir)' : '(City, Date of Birth)'}</span></div></li>
                  <li className="flex gap-2"><span className="font-bold text-emerald-700 w-3 shrink-0">▶</span> <div><span className="font-bold">Gender:</span> <span className="text-gray-600 block">{formValues.gender || (language === 'id' ? '(Jenis Kelamin)' : '(Gender)')}</span></div></li>
                  <li className="flex gap-2"><span className="font-bold text-emerald-700 w-3 shrink-0">▶</span> <div><span className="font-bold">{language === 'id' ? 'Status:' : 'Marital Status:'}</span> <span className="text-gray-600 block">{formValues.status || (language === 'id' ? '(Status Pernikahan)' : '(Marital Status)')}</span></div></li>
                  <li className="flex gap-2"><span className="font-bold text-emerald-700 w-3 shrink-0">▶</span> <div><span className="font-bold">{language === 'id' ? 'WN:' : 'Nationality:'}</span> <span className="text-gray-600 block">{formValues.citizenship || (language === 'id' ? '(Kewarganegaraan)' : '(Citizenship)')}</span></div></li>
                  <li className="flex gap-2"><span className="font-bold text-emerald-700 w-3 shrink-0">▶</span> <div><span className="font-bold">{language === 'id' ? 'Alamat:' : 'Address:'}</span> <span className="text-gray-600 block">{formValues.address || (language === 'id' ? '(Alamat Domisili)' : '(Current Address)')}</span></div></li>
                  <div className="h-2"></div>
                  <li className="flex gap-2"><span className="font-bold text-emerald-700 w-3 shrink-0">▶</span> <div><span className="font-bold">HP/WA:</span> <span className="text-gray-600 block">{formValues.phone || (language === 'id' ? '(Nomor HP)' : '(Phone Number)')}</span></div></li>
                  <li className="flex gap-2"><span className="font-bold text-emerald-700 w-3 shrink-0">▶</span> <div><span className="font-bold">Email:</span> <span className="text-gray-600 block">{formValues.email || '(email@domain.com)'}</span></div></li>
                  <li className="flex gap-2"><span className="font-bold text-emerald-700 w-3 shrink-0">▶</span> <div><span className="font-bold">IG/IN:</span> <span className="text-gray-600 block">{formValues.instagram || '(@username)'}</span></div></li>
                </ul>
              </div>

              {/* Skills */}
              <div className="w-full mt-8">
                {formValues.hardSkills && (
                  <div className="mb-4">
                    <h4 className="text-xs font-extrabold tracking-widest border-b-[1.5px] border-gray-900 pb-1 mb-2 uppercase">HARD SKILLS</h4>
                    <div className="text-[10px] leading-relaxed text-gray-800 font-medium">
                      {formValues.hardSkills.split(',').map(s => s.trim()).filter(Boolean).join(' • ')}
                    </div>
                  </div>
                )}
                {formValues.softSkills && (
                  <div className="mb-4">
                    <h4 className="text-xs font-extrabold tracking-widest border-b-[1.5px] border-gray-900 pb-1 mb-2 uppercase">SOFT SKILLS</h4>
                    <div className="text-[10px] leading-relaxed text-gray-800 font-medium">
                      {formValues.softSkills.split(',').map(s => s.trim()).filter(Boolean).join(' • ')}
                    </div>
                  </div>
                )}
                {!formValues.hardSkills && !formValues.softSkills && (
                  <div className="mb-4">
                    <h4 className="text-xs font-extrabold tracking-widest border-b-[1.5px] border-gray-900 pb-1 mb-2 uppercase">{language === 'id' ? 'KETERAMPILAN' : 'SKILLS'}</h4>
                    <p className="text-gray-600 dark:text-gray-400 italic text-[10px]">{language === 'id' ? 'Daftar keterampilan akan muncul di sini...' : 'Skills list will appear here...'}</p>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="w-[65%] p-10 pt-12">
              
              {/* Summary */}
              <div className="mb-8">
                <h2 className="text-sm font-extrabold tracking-[0.2em] mb-3 text-gray-900">{language === 'id' ? 'TENTANG SAYA' : 'ABOUT ME'}</h2>
                {formValues.summary ? (
                  <p className="text-[11px] leading-relaxed text-gray-700 text-justify">{formValues.summary}</p>
                ) : (
                  <p className="text-[11px] leading-relaxed text-gray-700 dark:text-gray-300 italic">{language === 'id' ? '(Tulis ringkasan profesional di sini. Ceritakan latar belakang, kompetensi unggulan, serta visi karir Anda.)' : '(Write your professional summary here. Share your background, core competencies, and career vision.)'}</p>
                )}
              </div>

              {/* Education */}
              <div className="mb-8">
                <h2 className="text-sm font-extrabold tracking-[0.2em] mb-4 text-gray-900 border-b border-gray-200 pb-2">{language === 'id' ? 'RIWAYAT PENDIDIKAN' : 'EDUCATION'}</h2>
                {eduFields.map((edu, i) => {
                  const inst = getValues(`education.${i}.institution`);
                  const deg = getValues(`education.${i}.degree`);
                  const per = getValues(`education.${i}.period`);
                  const desc = getValues(`education.${i}.description`);
                  if(!inst && !deg) return null;
                  return (
                    <div key={i} className="mb-4">
                      <p className="text-xs font-bold text-gray-800">{inst}</p>
                      <p className="text-[11px] text-emerald-700 font-semibold mb-1">{deg} <span className="text-gray-500 dark:text-gray-400 font-normal">{per}</span></p>
                      <p className="text-[10px] text-gray-600 leading-relaxed text-justify">{desc}</p>
                    </div>
                  )
                })}
              </div>

              {/* Experience */}
              <div className="mb-8">
                <h2 className="text-sm font-extrabold tracking-[0.2em] mb-4 text-gray-900 border-b border-gray-200 pb-2">{language === 'id' ? 'PENGALAMAN KERJA' : 'WORK EXPERIENCE'}</h2>
                {expFields.map((exp, i) => {
                  const title = getValues(`experience.${i}.title`);
                  const comp = getValues(`experience.${i}.company`);
                  const desc = getValues(`experience.${i}.description`);
                  if(!title && !comp) return null;
                  return (
                    <div key={i} className="mb-4">
                      <p className="text-[11px] text-emerald-700 font-bold mb-0.5">{title}</p>
                      <p className="text-xs font-extrabold text-gray-800 mb-1.5 uppercase">{comp}</p>
                      <p className="text-[10px] text-gray-600 leading-relaxed text-justify whitespace-pre-wrap">{desc}</p>
                    </div>
                  )
                })}
                {(!expFields.length || (!getValues('experience.0.title') && !getValues('experience.0.company'))) && (
                  <p className="text-[11px] text-gray-700 dark:text-gray-300 italic" dangerouslySetInnerHTML={{ __html: language === 'id' ? '[Tahun Menjabat] Jabatan / Peran Organisasi<br/>NAMA ORGANISASI / INSTANSI<br/>Kontribusi utama, program kerja, atau pencapaian kepemimpinan tim.' : '[Year] Job Title / Role<br/>COMPANY / ORGANIZATION<br/>Key contributions, programs, or team leadership achievements.' }} />
                )}
              </div>

              {/* Seminar */}
              <div className="mb-8">
                <h2 className="text-sm font-extrabold tracking-[0.2em] mb-4 text-gray-900 border-b border-gray-200 pb-2">{language === 'id' ? 'PENGALAMAN SEMINAR / PELATIHAN' : 'SEMINARS / TRAININGS'}</h2>
                {semFields.map((sem, i) => {
                  const title = getValues(`seminar.${i}.title`);
                  const inst = getValues(`seminar.${i}.institution`);
                  const desc = getValues(`seminar.${i}.description`);
                  if(!title && !inst) return null;
                  return (
                    <div key={i} className="mb-4">
                      <p className="text-[11px] text-emerald-700 font-bold mb-0.5">{title}</p>
                      <p className="text-xs font-extrabold text-gray-800 mb-1.5 uppercase">{inst}</p>
                      <p className="text-[10px] text-gray-600 leading-relaxed text-justify">{desc}</p>
                    </div>
                  )
                })}
                {(!semFields.length || (!getValues('seminar.0.title') && !getValues('seminar.0.institution'))) && (
                  <p className="text-[11px] text-gray-700 dark:text-gray-300 italic" dangerouslySetInnerHTML={{ __html: language === 'id' ? '[Tahun Pelaksanaan] Nama Seminar / Sertifikasi<br/>LEMBAGA PENYELENGGARA<br/>Keahlian bersertifikat yang diujikan atau seminar keprofesian.' : '[Year] Seminar / Certification Name<br/>ORGANIZER<br/>Certified skills tested or professional seminars.' }} />
                )}
              </div>

            </div>
          </div>
          ) : (
            <div className="flex flex-col">
              <div className="text-center mb-6">
                <h1 className="text-2xl font-black text-gray-900 uppercase tracking-widest">{formValues.fullName || (language === 'id' ? 'NAMA LENGKAP' : 'FULL NAME')}</h1>
                <p className="text-[11px] text-gray-600 mt-2">
                  {formValues.address} | {formValues.phone} | {formValues.email} | {formValues.instagram}
                </p>
              </div>
              <div className="w-full h-[1px] bg-gray-300 mb-6"></div>

              {formValues.summary && (
                <div className="mb-6">
                  <h2 className="text-sm font-black tracking-widest uppercase mb-2 border-b border-gray-300 pb-1">{language === 'id' ? 'RINGKASAN PROFIL' : 'PROFESSIONAL SUMMARY'}</h2>
                  <p className="text-[11px] text-gray-800 leading-relaxed text-justify">{formValues.summary}</p>
                </div>
              )}

              <div className="mb-6">
                <h2 className="text-sm font-black tracking-widest uppercase mb-3 border-b border-gray-300 pb-1">{language === 'id' ? 'PENGALAMAN KERJA' : 'WORK EXPERIENCE'}</h2>
                {expFields.map((exp, i) => {
                  const title = getValues(`experience.${i}.title`);
                  const comp = getValues(`experience.${i}.company`);
                  const desc = getValues(`experience.${i}.description`);
                  if(!title && !comp) return null;
                  return (
                    <div key={i} className="mb-3">
                      <div className="flex justify-between items-baseline mb-0.5">
                        <p className="text-xs font-bold text-gray-900">{title}</p>
                      </div>
                      <p className="text-[11px] text-gray-700 font-semibold mb-1">{comp}</p>
                      <p className="text-[10px] text-gray-800 leading-relaxed text-justify whitespace-pre-wrap ml-2">{desc}</p>
                    </div>
                  )
                })}
              </div>

              <div className="mb-6">
                <h2 className="text-sm font-black tracking-widest uppercase mb-3 border-b border-gray-300 pb-1">{language === 'id' ? 'PENDIDIKAN' : 'EDUCATION'}</h2>
                {eduFields.map((edu, i) => {
                  const inst = getValues(`education.${i}.institution`);
                  const deg = getValues(`education.${i}.degree`);
                  const per = getValues(`education.${i}.period`);
                  const desc = getValues(`education.${i}.description`);
                  if(!inst && !deg) return null;
                  return (
                    <div key={i} className="mb-3">
                      <p className="text-xs font-bold text-gray-900">{deg}</p>
                      <div className="flex justify-between items-baseline mb-0.5">
                        <p className="text-[11px] text-gray-700 font-semibold">{inst}</p>
                        <p className="text-[10px] text-gray-600">{per}</p>
                      </div>
                      <p className="text-[10px] text-gray-800 leading-relaxed text-justify ml-2">{desc}</p>
                    </div>
                  )
                })}
              </div>

              <div className="mb-6">
                <h2 className="text-sm font-black tracking-widest uppercase mb-3 border-b border-gray-300 pb-1">{language === 'id' ? 'KETERAMPILAN' : 'SKILLS'}</h2>
                <ul className="text-[11px] text-gray-800 leading-relaxed text-justify list-disc pl-4">
                  {(formValues.hardSkills || formValues.softSkills) ? (
                    [...(formValues.hardSkills?.split(',') || []), ...(formValues.softSkills?.split(',') || [])]
                      .map((skill, i) => skill.trim() && <li key={i}>{skill.trim()}</li>)
                  ) : (
                    <li className="text-gray-600 dark:text-gray-400 italic">{language === 'id' ? 'Daftar keterampilan akan muncul di sini...' : 'Skills list will appear here...'}</li>
                  )}
                </ul>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* MODAL: AI ANALYSIS AUDIT */}
      {showAnalysisModal && (
        <div className="fixed inset-0 bg-white/80 dark:bg-[#070A12]/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#131A29] border border-gray-200 dark:border-white/10 rounded-3xl w-full max-w-3xl h-[85vh] flex flex-col shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300">
            {/* Header Modal */}
            <div className="absolute top-0 w-full h-3 bg-gradient-to-r from-purple-600 to-blue-500"></div>
            <button onClick={() => setShowAnalysisModal(false)} className="absolute top-6 right-6 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:text-white">
              <X className="w-6 h-6" />
            </button>
            <div className="p-8 pb-4 border-b border-gray-100 dark:border-white/5 flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center border border-purple-500/30">
                <Bot className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{language === 'id' ? 'Laporan Audit HRD AI' : 'AI HR Audit Report'}</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">{language === 'id' ? 'Analisis kelayakan Resume berstandar ATS' : 'ATS-standard Resume feasibility analysis'}</p>
              </div>
            </div>

            {/* Content Modal */}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              {!analysisResult ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                  <div className="relative">
                    <div className="w-24 h-24 border-4 border-gray-100 dark:border-white/5 rounded-full border-t-purple-500 animate-spin"></div>
                    <Bot className="w-8 h-8 text-purple-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{language === 'id' ? 'AI Sedang Mengevaluasi Resume...' : 'AI is Evaluating Resume...'}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 max-w-sm mx-auto">{language === 'id' ? 'Sistem kami sedang membedah setiap kata dan kalimat di Resume Anda menggunakan standar HRD multinasional.' : 'Our system is dissecting every word and sentence in your Resume using multinational HR standards.'}</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-8 animate-in fade-in duration-700">
                  {/* Skor & Verdict */}
                  <div className="flex flex-col md:flex-row items-center gap-8 bg-slate-50 dark:bg-[#0B0F19] p-6 rounded-2xl border border-gray-100 dark:border-white/5">
                    {/* Circle Score */}
                    <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="64" cy="64" r="56" className="stroke-white/5" strokeWidth="12" fill="none" />
                        <circle 
                          cx="64" cy="64" r="56" 
                          className={`${analysisResult.skor >= 80 ? 'stroke-emerald-500' : analysisResult.skor >= 60 ? 'stroke-amber-500' : 'stroke-red-500'}`} 
                          strokeWidth="12" fill="none" strokeLinecap="round" 
                          style={{ strokeDasharray: 351.85, strokeDashoffset: 351.85 - (351.85 * analysisResult.skor) / 100 }} 
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <span className="text-3xl font-black text-gray-900 dark:text-white">{analysisResult.skor}</span>
                        <span className="text-[9px] font-bold tracking-widest text-gray-500 dark:text-gray-400 uppercase">/ 100</span>
                      </div>
                    </div>
                    <div>
                      <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-2 ${analysisResult.skor >= 80 ? 'bg-emerald-500/20 text-emerald-400' : analysisResult.skor >= 60 ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'}`}>
                        {analysisResult.verdict?.title || (language === 'id' ? 'Evaluasi Selesai' : 'Evaluation Complete')}
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{language === 'id' ? 'Kesimpulan HRD' : 'HR Conclusion'}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{analysisResult.verdict?.description}</p>
                    </div>
                  </div>

                  {/* Analisa Detil Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-emerald-500/5 border border-emerald-500/20 p-5 rounded-2xl">
                      <h4 className="text-sm font-bold text-emerald-400 mb-4 flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> {language === 'id' ? 'Kekuatan Profil' : 'Profile Strengths'}</h4>
                      <ul className="space-y-3">
                        {analysisResult.analisa_detil?.kekuatan?.map((item: string, i: number) => (
                          <li key={i} className="text-xs text-gray-700 dark:text-gray-300 flex items-start gap-2"><span className="text-emerald-500 mt-0.5">•</span> <span>{item}</span></li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-amber-500/5 border border-amber-500/20 p-5 rounded-2xl">
                      <h4 className="text-sm font-bold text-amber-400 mb-4 flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> {language === 'id' ? 'Area Perbaikan' : 'Areas for Improvement'}</h4>
                      <ul className="space-y-3">
                        {analysisResult.analisa_detil?.kelemahan?.map((item: string, i: number) => (
                          <li key={i} className="text-xs text-gray-700 dark:text-gray-300 flex items-start gap-2"><span className="text-amber-500 mt-0.5">•</span> <span>{item}</span></li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Critical Warnings */}
                  {analysisResult.analisa_detil?.kritis?.length > 0 && analysisResult.analisa_detil.kritis[0] !== "" && (
                    <div className="bg-red-500/10 border border-red-500/20 p-5 rounded-2xl">
                      <h4 className="text-sm font-bold text-red-400 mb-3 flex items-center gap-2"><AlertOctagon className="w-4 h-4" /> {language === 'id' ? 'Kesalahan Fatal (Kritis)' : 'Fatal Errors (Critical)'}</h4>
                      <ul className="space-y-2">
                        {analysisResult.analisa_detil.kritis.map((item: string, i: number) => (
                          item && <li key={i} className="text-xs text-red-200 flex items-start gap-2"><span className="text-red-500 mt-0.5">⚠️</span> <span>{item}</span></li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Rekomendasi Aksi */}
                  <div className="bg-slate-50 dark:bg-[#0B0F19] border border-blue-500/20 p-6 rounded-2xl">
                    <h4 className="text-sm font-bold text-blue-400 mb-4 flex items-center gap-2"><Sparkles className="w-4 h-4" /> {language === 'id' ? 'Saran Rekomendasi AI' : 'AI Recommendations'}</h4>
                    
                    <div className="space-y-6">
                      <div>
                        <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">{language === 'id' ? 'Ringkasan Profil (Siap Pakai)' : 'Profile Summary (Ready to Use)'}</p>
                        <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10 text-xs text-gray-600 dark:text-gray-400 italic mb-3">"{analysisResult.rekomendasi?.ringkasan}"</div>
                        <button 
                          onClick={() => { setValue('summary', analysisResult.rekomendasi?.ringkasan); Swal.fire({ title: language === 'id' ? 'Berhasil!' : 'Success!', text: language === 'id' ? 'Summary diperbarui!' : 'Summary updated!', icon: 'success', timer: 2000, showConfirmButton: false }); }}
                          className="px-4 py-2 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded-lg text-[10px] font-bold transition-colors"
                        >{language === 'id' ? 'Terapkan Ringkasan Ke Resume' : 'Apply Summary to Resume'}</button>
                      </div>

                      <div className="pt-4 border-t border-gray-100 dark:border-white/5">
                        <button 
                          onClick={() => {
                            if (analysisResult.rekomendasi?.pendidikan) setValue('education', analysisResult.rekomendasi.pendidikan);
                            if (analysisResult.rekomendasi?.pengalaman) setValue('experience', analysisResult.rekomendasi.pengalaman);
                            if (analysisResult.rekomendasi?.skills) setValue('skills', analysisResult.rekomendasi.skills);
                            if (analysisResult.rekomendasi?.posisi) setValue('targetPosition', analysisResult.rekomendasi.posisi);
                            setShowAnalysisModal(false);
                            Swal.fire({ title: language === 'id' ? 'Ajaib!' : 'Amazing!', text: language === 'id' ? 'Seluruh data edukasi, pengalaman, dan skill telah dirombak oleh AI!' : 'All education, experience, and skill data has been revamped by AI!', icon: 'success' });
                          }}
                          className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-gray-900 dark:text-white rounded-xl text-xs font-bold shadow-lg transition-colors flex items-center justify-center gap-2"
                        >
                          ✦ {language === 'id' ? 'Terapkan Semua Perbaikan Otomatis' : 'Apply All Auto-Improvements'} ✦
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
