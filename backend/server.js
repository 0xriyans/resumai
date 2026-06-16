require('dotenv').config();

// Polyfill fetch for Node.js 14
if (!globalThis.fetch) {
  globalThis.fetch = require('node-fetch');
  globalThis.Headers = require('node-fetch').Headers;
  globalThis.Request = require('node-fetch').Request;
  globalThis.Response = require('node-fetch').Response;
}

// Polyfill Object.hasOwn for Node.js 14 (needed by express 5)
if (!Object.hasOwn) {
  Object.hasOwn = function (obj, prop) {
    return Object.prototype.hasOwnProperty.call(obj, prop);
  };
}

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const PDFDocument = require('pdfkit');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Konfigurasi Multer
const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Format file tidak valid. Gunakan JPG, PNG, atau WEBP.'), false);
  }
};
const upload = multer({ 
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // Max 2MB
  fileFilter
});

// Inisialisasi Gemini API Client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Endpoint 1: Analisis Kelayakan CV
app.post('/api/cv/analyze', async (req, res) => {
  try {
    const cvData = req.body;

    if (!cvData || Object.keys(cvData).length === 0) {
      return res.status(400).json({ error: 'Data CV diperlukan dalam payload JSON.' });
    }

    const targetLang = cvData.language === 'en' ? 'ENGLISH' : 'INDONESIAN';

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: `Tindak sebagai HR Consultant dan ATS Evaluator senior. Evaluasi kelayakan CV pelamar ini. Output WAJIB dalam format JSON persis seperti skema berikut, tanpa markdown wrapper.
CRITICAL INSTRUCTION: The JSON keys MUST remain exactly as shown below, but the JSON VALUES (the content) MUST be written in ${targetLang} language!
{
  "skor": 88,
  "verdict": {
    "title": "Sangat Kompetitif",
    "description": "Satu kalimat penjelasan kualitas CV secara keseluruhan."
  },
  "analisa_detil": {
    "kekuatan": ["Point kekuatan 1", "Point kekuatan 2"],
    "kelemahan": ["Point kelemahan 1", "Point kelemahan 2"],
    "kritis": ["Kesalahan fatal 1 (jika ada, kosongkan jika tidak ada)"]
  },
  "rekomendasi": {
    "ringkasan": "Saran teks ringkasan profil (3-4 kalimat, siap pakai).",
    "posisi": "Saran nama posisi/jabatan spesifik yang tepat.",
    "skills": "Saran daftar skill relevan yang siap pakai.",
    "pendidikan": [ { "degree": "...", "institution": "...", "period": "...", "description": "..." } ],
    "pengalaman": [ { "title": "...", "company": "...", "period": "...", "description": "Saran deskripsi berorientasi metrik" } ]
  }
}
Pastikan array pengalaman dan pendidikan diisi kembali dengan teks yang telah dirombak menjadi kalimat berorientasi metrik (ATS-friendly), ditulis dan disajikan dalam bahasa ${targetLang}.`,
      generationConfig: {
        responseMimeType: 'application/json',
      }
    });

    const prompt = `Data CV yang akan dianalisis:\n${JSON.stringify(cvData, null, 2)}`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const textData = response.text();
    
    let jsonResult;
    try {
      jsonResult = JSON.parse(textData);
    } catch (e) {
      console.error("Failed parsing JSON from Gemini:", textData);
      throw new Error("Invalid JSON format from AI");
    }
    res.status(200).json(jsonResult);

  } catch (error) {
    console.error('Error in /api/cv/analyze:', error);
    res.status(500).json({ 
      error: 'Terjadi kesalahan internal server saat menganalisis CV.',
      details: error.message 
    });
  }
});

// Endpoint 2: Perbaiki Otomatis Pengalaman Kerja
app.post('/api/cv/enhance', async (req, res) => {
  try {
    const { experienceText, language } = req.body;

    if (!experienceText || typeof experienceText !== 'string') {
      return res.status(400).json({ error: 'String experienceText diperlukan dalam payload JSON.' });
    }

    const targetLang = language === 'en' ? 'ENGLISH' : 'INDONESIAN';

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: `Ubah teks kasar ini menjadi 3-4 bullet points profesional berstandar ATS, berorientasi metrik, dan gunakan kata kerja aktif. Kembalikan output HANYA dalam format JSON Array berisi string: ["bullet point 1", "bullet point 2", ...] tanpa markdown wrapper. Seluruh teks HARUS ditulis dalam bahasa ${targetLang}.`,
      generationConfig: {
        responseMimeType: 'application/json',
      }
    });

    const prompt = `Teks pengalaman kerja yang perlu diperbaiki:\n"${experienceText}"`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const textData = response.text();
    
    const jsonArrayResult = JSON.parse(textData);
    res.status(200).json(jsonArrayResult);

  } catch (error) {
    console.error('Error in /api/cv/enhance:', error);
    res.status(500).json({ 
      error: 'Terjadi kesalahan internal server saat memperbaiki teks pengalaman kerja.',
      details: error.message 
    });
  }
});

// Endpoint 3: Audit Foto Profil AI
app.post('/api/cv/audit-photo', (req, res) => {
  const uploadSingle = upload.single('photo');

  uploadSingle(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'Ukuran file melebihi batas maksimal 2MB.' });
      }
      return res.status(400).json({ error: err.message });
    } else if (err) {
      return res.status(400).json({ error: err.message });
    }

    try {
      if (!req.file) {
        return res.status(400).json({ error: 'File foto tidak ditemukan.' });
      }

      const targetLang = req.body.language === 'en' ? 'ENGLISH' : 'INDONESIAN';
      const base64Image = req.file.buffer.toString('base64');
      const mimeType = req.file.mimetype;

      const model = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        systemInstruction: `Tindak sebagai konsultan rekrutmen. Evaluasi potret ini berdasarkan: Pencahayaan, Kerapian busana, Ekspresi wajah, dan Kesesuaian korporasi. Berikan nilai 1-10 untuk masing-masing kriteria dan satu kalimat kesimpulan. Kembalikan output HANYA dalam format JSON dengan struktur: { "kriteria": { "pencahayaan": number, "kerapian_busana": number, "ekspresi_wajah": number, "kesesuaian_korporasi": number }, "kesimpulan": string } tanpa markdown wrapper. Properti kesimpulan dan pesan lain HARUS ditulis dalam bahasa ${targetLang}.`,
        generationConfig: {
          responseMimeType: 'application/json',
        }
      });

      const prompt = 'Evaluasi foto profil ini berdasarkan kriteria konsultan rekrutmen.';
      const imagePart = {
        inlineData: {
          data: base64Image,
          mimeType
        }
      };

      const result = await model.generateContent([prompt, imagePart]);
      const response = await result.response;
      const textData = response.text();
      
      const jsonResult = JSON.parse(textData);
      res.status(200).json(jsonResult);

    } catch (error) {
      console.error('Error in /api/cv/audit-photo:', error);
      res.status(500).json({ 
        error: 'Terjadi kesalahan internal server saat mengaudit foto profil.',
        details: error.message 
      });
    }
  });
});

// Endpoint 3.5: Saran Ringkasan Profil AI
app.post('/api/cv/suggest-summary', async (req, res) => {
  try {
    const { experience, education, language } = req.body;
    const targetLang = language === 'en' ? 'ENGLISH' : 'INDONESIAN';
    
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: `Tindak sebagai penulis resume profesional. Tulis Ringkasan Profil (Professional Summary) berorientasi metrik dan ATS-friendly berdasarkan pengalaman kerja dan pendidikan pelamar. Buat dalam 1 paragraf (3-4 kalimat). Output HANYA berupa string teks ringkasan murni berformat JSON { "summary": "teks..." } tanpa markdown. Teks ringkasan HARUS ditulis dalam bahasa ${targetLang}.`,
      generationConfig: {
        responseMimeType: 'application/json',
      }
    });

    const prompt = `Pengalaman Kerja:\n${JSON.stringify(experience)}\nPendidikan:\n${JSON.stringify(education)}`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const textData = response.text();
    
    const jsonResult = JSON.parse(textData);
    res.status(200).json({ summary: jsonResult.summary });
  } catch (error) {
    console.error('Error in /api/cv/suggest-summary:', error);
    res.status(500).json({ error: 'Gagal membuat saran ringkasan profil.' });
  }
});

// Endpoint 3.6: Rekomendasi Skills AI
app.post('/api/cv/recommend-skills', async (req, res) => {
  try {
    const { position, language } = req.body;
    const targetLang = language === 'en' ? 'ENGLISH' : 'INDONESIAN';

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: `Berikan rekomendasi Hard Skills dan Soft Skills untuk posisi tersebut. Output HANYA JSON: { "hard_skills": ["skill1", "skill2"], "soft_skills": ["skillA", "skillB"], "saran": "1 kalimat saran strategis" } tanpa markdown. Semua teks (skills dan saran) HARUS ditulis dalam bahasa ${targetLang}.`,
      generationConfig: { responseMimeType: 'application/json' }
    });
    const result = await model.generateContent(`Posisi: ${position}`);
    const response = await result.response;
    res.status(200).json(JSON.parse(response.text()));
  } catch (error) {
    console.error('Error in recommend-skills:', error);
    res.status(500).json({ error: 'Gagal membuat saran skills.' });
  }
});

// Endpoint 3.7: Enhance Photo AI (Mock)
app.post('/api/cv/enhance-photo', (req, res) => {
  const uploadSingle = upload.single('photo');
  uploadSingle(req, res, async (err) => {
    try {
      if (!req.file) return res.status(400).json({ error: 'File foto tidak ditemukan.' });
      const base64Image = req.file.buffer.toString('base64');
      const dataUri = `data:${req.file.mimetype};base64,${base64Image}`;
      
      // Simulasi delay 3 detik untuk proses AI Generator
      setTimeout(() => {
        res.status(200).json({ 
          success: true, 
          message: 'Foto berhasil di-enhance dengan AI (Simulasi)',
          imageUrl: dataUri 
        });
      }, 3000);
    } catch (error) {
      res.status(500).json({ error: 'Gagal melakukan enhance foto.' });
    }
  });
});

// Endpoint 3.8: Enhance Description AI
app.post('/api/cv/enhance-description', async (req, res) => {
  try {
    const { text, type, language } = req.body;
    const targetLang = language === 'en' ? 'ENGLISH' : 'INDONESIAN';
    let systemInstruction = `Perbaiki kalimat ini menjadi lebih profesional. Output HANYA JSON: { "enhanced": "teks hasil..." } tanpa markdown. Seluruh teks HARUS ditulis dalam bahasa ${targetLang}.`;
    
    if (type === 'experience') {
      systemInstruction = `Tindak sebagai penulis resume HRD. Tingkatkan deksripsi pengalaman kerja ini. Gunakan action verbs, tambahkan metrik imajiner jika perlu untuk contoh, dan buat kalimatnya lebih berdampak. Output HANYA JSON: { "enhanced": "teks hasil..." } tanpa markdown. Seluruh teks HARUS ditulis dalam bahasa ${targetLang}.`;
    } else if (type === 'education') {
      systemInstruction = `Tindak sebagai penulis resume HRD. Tingkatkan deskripsi pendidikan ini menjadi lebih profesional dan menonjolkan pencapaian. Output HANYA JSON: { "enhanced": "teks hasil..." } tanpa markdown. Seluruh teks HARUS ditulis dalam bahasa ${targetLang}.`;
    } else if (type === 'summary') {
      systemInstruction = `Tindak sebagai penulis resume HRD. Tingkatkan ringkasan profil ini menjadi paragraf yang lebih kuat, ringkas, dan memikat. Output HANYA JSON: { "enhanced": "teks hasil..." } tanpa markdown. Seluruh teks HARUS ditulis dalam bahasa ${targetLang}.`;
    } else if (type === 'seminar') {
      systemInstruction = `Tindak sebagai penulis resume HRD. Tingkatkan deskripsi silabus atau detail pembelajaran seminar/pelatihan ini menjadi lebih profesional, ringkas, dan menonjolkan keahlian yang relevan. Output HANYA JSON: { "enhanced": "teks hasil..." } tanpa markdown. Seluruh teks HARUS ditulis dalam bahasa ${targetLang}.`;
    }

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction,
      generationConfig: { responseMimeType: 'application/json' }
    });
    
    const result = await model.generateContent(`Teks asli:\n${text}`);
    const response = await result.response;
    const jsonResult = JSON.parse(response.text());
    
    res.status(200).json({ enhanced: jsonResult.enhanced });
  } catch (error) {
    console.error('Error in enhance-description:', error);
    res.status(500).json({ error: 'Gagal meningkatkan deskripsi.' });
  }
});

// Endpoint 4: Export CV ke PDF (ATS Friendly)
app.post('/api/cv/export/pdf', (req, res) => {
  try {
    const cvData = req.body;
    
    if (!cvData || Object.keys(cvData).length === 0) {
      return res.status(400).json({ error: 'Data CV diperlukan.' });
    }

    const lang = cvData.language === 'en' ? 'en' : 'id';
    const HEADINGS = {
      summary: lang === 'en' ? 'PROFESSIONAL SUMMARY' : 'RINGKASAN PROFIL',
      experience: lang === 'en' ? 'WORK EXPERIENCE' : 'PENGALAMAN KERJA',
      education: lang === 'en' ? 'EDUCATION' : 'PENDIDIKAN',
      seminar: lang === 'en' ? 'SEMINARS / TRAININGS' : 'PENGALAMAN SEMINAR / PELATIHAN',
      skills: lang === 'en' ? 'SKILLS' : 'KETERAMPILAN'
    };

    // Set header response untuk download PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=CV_ATS.pdf');

    // Buat dokumen PDF baru
    const doc = new PDFDocument({
      margin: 50,
      size: 'A4',
      font: 'Helvetica'
    });

    // Alirkan dokumen ke response
    doc.pipe(res);

    // 1. Nama Lengkap
    if (cvData.fullName) {
      doc.fontSize(24).font('Helvetica-Bold').text(cvData.fullName.toUpperCase(), { align: 'center' });
      doc.moveDown(0.2);
    }

    // 2. Info Kontak
    const contactInfo = [cvData.address, cvData.phone, cvData.email, cvData.instagram].filter(Boolean).join(' | ');
    if (contactInfo) {
      doc.fontSize(10).font('Helvetica').text(contactInfo, { align: 'center' });
      doc.moveDown(1);
    }

    // Garis Batas Horizontal
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(1);

    // 3. Ringkasan Profil
    if (cvData.summary) {
      doc.fontSize(12).font('Helvetica-Bold').text(HEADINGS.summary);
      doc.moveDown(0.3);
      doc.fontSize(10).font('Helvetica').text(cvData.summary, { align: 'justify' });
      doc.moveDown(1);
    }

    // 4. Pengalaman Kerja
    if (cvData.experience && Array.isArray(cvData.experience) && cvData.experience.length > 0 && cvData.experience[0].title) {
      doc.fontSize(12).font('Helvetica-Bold').text(HEADINGS.experience);
      doc.moveDown(0.3);
      
      cvData.experience.forEach(exp => {
        if (!exp.title) return;
        doc.fontSize(11).font('Helvetica-Bold').text(exp.title);
        doc.fontSize(10).font('Helvetica-Oblique').text(`${exp.company || ''} ${exp.period ? ' | ' + exp.period : ''}`);
        doc.moveDown(0.2);
        doc.fontSize(10).font('Helvetica').text(exp.description || '', { align: 'justify' });
        doc.moveDown(0.8);
      });
    }

    // 5. Pendidikan
    if (cvData.education && Array.isArray(cvData.education) && cvData.education.length > 0 && cvData.education[0].institution) {
      doc.fontSize(12).font('Helvetica-Bold').text(HEADINGS.education);
      doc.moveDown(0.3);
      
      cvData.education.forEach(edu => {
        if (!edu.institution) return;
        doc.fontSize(11).font('Helvetica-Bold').text(edu.degree || '');
        doc.fontSize(10).font('Helvetica').text(`${edu.institution || ''} ${edu.period ? ' | ' + edu.period : ''}`);
        if (edu.description) {
          doc.moveDown(0.2);
          doc.fontSize(10).font('Helvetica').text(edu.description, { align: 'justify' });
        }
        doc.moveDown(0.8);
      });
    }

    // 6. Seminar
    if (cvData.seminar && Array.isArray(cvData.seminar) && cvData.seminar.length > 0 && cvData.seminar[0].title) {
      doc.fontSize(12).font('Helvetica-Bold').text(HEADINGS.seminar);
      doc.moveDown(0.3);
      
      cvData.seminar.forEach(sem => {
        if (!sem.title) return;
        doc.fontSize(11).font('Helvetica-Bold').text(sem.title);
        doc.fontSize(10).font('Helvetica').text(`${sem.institution || ''} ${sem.period ? ' | ' + sem.period : ''}`);
        if (sem.description) {
          doc.moveDown(0.2);
          doc.fontSize(10).font('Helvetica').text(sem.description, { align: 'justify' });
        }
        doc.moveDown(0.8);
      });
    }

    // 7. Keterampilan
    if (cvData.hardSkills || cvData.softSkills) {
      doc.fontSize(12).font('Helvetica-Bold').text(HEADINGS.skills);
      doc.moveDown(0.3);
      
      if (cvData.hardSkills) {
        doc.fontSize(10).font('Helvetica-Bold').text('HARD SKILLS:');
        const hardSkillsArray = cvData.hardSkills.split(',').map(s => s.trim()).filter(Boolean);
        doc.fontSize(10).font('Helvetica').text(hardSkillsArray.join(' • '));
        doc.moveDown(0.5);
      }
      
      if (cvData.softSkills) {
        doc.fontSize(10).font('Helvetica-Bold').text('SOFT SKILLS:');
        const softSkillsArray = cvData.softSkills.split(',').map(s => s.trim()).filter(Boolean);
        doc.fontSize(10).font('Helvetica').text(softSkillsArray.join(' • '));
        doc.moveDown(0.5);
      }
      
      doc.moveDown(0.5);
    }

    // Akhiri dokumen
    doc.end();

  } catch (error) {
    console.error('Error in /api/cv/export/pdf:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Terjadi kesalahan saat menghasilkan PDF.' });
    }
  }
});

app.listen(port, () => {
  console.log(`🚀 API Server Antigravity ATS berjalan di http://localhost:${port}`);
});
 
