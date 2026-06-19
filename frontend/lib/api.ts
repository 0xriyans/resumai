const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/cv';

export const api = {
  analyze: async (cvData: any) => {
    const res = await fetch(`${API_BASE_URL}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cvData)
    });
    if (!res.ok) throw new Error('Analyze failed');
    return res.json();
  },
  suggestSummary: async (data: { experience: any[], education: any[] }) => {
    const res = await fetch(`${API_BASE_URL}/suggest-summary`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Suggest Summary failed');
    return res.json();
  },
  enhance: async (experienceText: string) => {
    const res = await fetch(`${API_BASE_URL}/enhance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ experienceText })
    });
    if (!res.ok) throw new Error('Enhance failed');
    return res.json();
  },
  auditPhoto: async (file: File) => {
    const formData = new FormData();
    formData.append('photo', file);
    const res = await fetch(`${API_BASE_URL}/audit-photo`, {
      method: 'POST',
      body: formData
    });
    if (!res.ok) throw new Error('Audit failed');
    return res.json();
  },
  exportPdf: async (cvData: any) => {
    const res = await fetch(`${API_BASE_URL}/export/pdf`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cvData)
    });
    if (!res.ok) throw new Error('Export PDF failed');
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'CV_ATS.pdf';
    document.body.appendChild(a);
    a.click();
    a.remove();
  },
  recommendSkills: async (position: string, language: string = 'id') => {
    const res = await fetch(`${API_BASE_URL}/recommend-skills`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ position, language })
    });
    if (!res.ok) throw new Error('Recommend Skills failed');
    return res.json();
  },
  enhancePhoto: async (file: File, style: string) => {
    const formData = new FormData();
    formData.append('photo', file);
    formData.append('style', style);
    const res = await fetch(`${API_BASE_URL}/enhance-photo`, {
      method: 'POST',
      body: formData
    });
    if (!res.ok) throw new Error('Enhance Photo failed');
    return res.json();
  },
  enhanceDescription: async (text: string, type: 'experience' | 'education' | 'summary' | 'seminar', language: string = 'id') => {
    const res = await fetch(`${API_BASE_URL}/enhance-description`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, type, language })
    });
    if (!res.ok) throw new Error('Enhance Description failed');
    return res.json();
  }
};
