import React, { useState, useEffect } from 'react';
import api from '../../supabase/api';

const PPTUpload = ({ onUploadSuccess, hackathonId = null }) => {
  // --- STATE ---
  const [formData, setFormData] = useState({
    teamName: '',
    members: '',
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [locked, setLocked] = useState(false);
  const [existingSubmission, setExistingSubmission] = useState(null);

  // --- HANDLERS ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
    if (existingSubmission) setExistingSubmission(null);
  };

  const handleBlur = async () => {
    if (!formData.teamName.trim()) return;
    try {
      const isSubmitted = await api.checkTeamSubmission(formData.teamName.trim(), hackathonId);
      if (isSubmitted) {
        setExistingSubmission(true);
        setError(`Team "${formData.teamName}" has already submitted their PPT.`);
      } else {
        setExistingSubmission(false);
      }
    } catch (err) {
      console.error('Check failed:', JSON.stringify(err, null, 2) || err);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      if (selectedFile.size > 15 * 1024 * 1024) {
        setError('File size too large. Maximum 15MB allowed.');
        setFile(null);
      } else {
        setFile(selectedFile);
        setError('');
      }
    } else {
      setFile(null);
      setError('Invalid file type. Please upload a PDF presentation.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (locked || loading) return;

    // --- VALIDATION ---
    const teamName = formData.teamName.trim();
    if (!teamName) return setError('Team name is required.');
    if (!formData.members.trim()) return setError('Team members are required.');
    if (!file) return setError('Please upload your PPT (PDF).');

    try {
      setLoading(true);
      setError('');

      // --- FINAL DUPLICATE CHECK ---
      const isSubmitted = await api.checkTeamSubmission(teamName, hackathonId);
      if (isSubmitted) {
        setError(`Submission blocked: Team "${teamName}" already exists in our records.`);
        setExistingSubmission(true);
        setLoading(false);
        return;
      }

      // Prepare data
      const submissionData = {
        teamName: teamName,
        members: formData.members.split(',').map(m => m.trim()).filter(m => m !== ''),
        file: file,
        hackathonId: hackathonId,
      };

      // --- SUPABASE SUBMISSION ---
      const result = await api.submitPPT(submissionData);

      // --- SUCCESS & LOCK ---
      setSuccess(true);
      setLocked(true);
      
      // Trigger callback after delay
      setTimeout(() => {
        if (onUploadSuccess) onUploadSuccess(result);
      }, 3000);
      
    } catch (err) {
      console.error('Submission failed:', JSON.stringify(err, null, 2) || err);
      setError(`Upload failed: ${err.message || 'Please check your connection and try again.'}`);
    } finally {
      setLoading(false);
    }
  };

  // --- SUCCESS VIEW ---
  if (success) {
    return (
      <div className="w-full card-premium p-16 text-center animate-in zoom-in-95 duration-700 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-blue-500/5 rounded-full -mr-32 -mt-32 blur-[100px]"></div>
        
        <div className="mx-auto w-32 h-32 bg-blue-500/10 border border-blue-500/20 rounded-[3rem] flex items-center justify-center text-6xl mb-12 shadow-2xl relative">
          <div className="absolute inset-0 bg-blue-500/20 blur-[30px] rounded-full animate-pulse"></div>
          <span className="relative z-10">✅</span>
        </div>
        
        <h2 className="text-5xl font-black text-[var(--text-primary)] mb-4 tracking-tighter uppercase leading-none">Manifest Logged</h2>
        <p className="text-[var(--text-secondary)] font-bold text-sm uppercase tracking-tight opacity-40 mb-12 leading-relaxed">
          Your project presentation has been securely stored. <br /> 
          Node <span className="text-blue-500">"{formData.teamName}"</span> is now locked in registry.
        </p>
        
        <div className="inline-flex items-center gap-4 px-8 py-3 bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-primary)] shadow-2xl">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-20"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,1)]"></span>
          </span>
          <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em]">Protocol: Locked</span>
        </div>
      </div>
    );
  }

  // --- FORM VIEW ---
  return (
    <div className="w-full card-premium glass-morphism overflow-hidden relative group">
      <div className="bg-muted/30 px-8 py-8 border-b border-border relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
        <div className="relative z-10 flex items-center gap-6">
          <div className="w-16 h-16 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center text-3xl shadow-inner">
            📂
          </div>
          <div>
            <h2 className="text-2xl font-black text-foreground tracking-tight uppercase">Project <span className="text-primary">Manifest</span></h2>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Node Registration Protocol</p>
          </div>
        </div>
      </div>

      <div className="p-8 md:p-10">
        {error && (
          <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-bold uppercase tracking-[0.2em] rounded-2xl flex items-center gap-4 animate-in slide-in-from-top-4 duration-500">
            <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center shrink-0 shadow-lg">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
               </svg>
            </div>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Team Name */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] ml-1">
              Team Name / Node ID
            </label>
            <input
              type="text"
              name="teamName"
              value={formData.teamName}
              onChange={handleInputChange}
              onBlur={handleBlur}
              placeholder="Enter your team name"
              disabled={loading}
              className={`w-full bg-muted/50 border-2 border-border rounded-xl px-5 py-3 text-sm font-bold focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all ${
                existingSubmission === true ? 'border-red-500/50 text-red-500 bg-red-500/5' : 
                existingSubmission === false ? 'border-green-500/50 text-green-500 bg-green-500/5' : ''
              }`}
            />
          </div>

          {/* Team Members */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] ml-1">
              Core Members (Comma Separated)
            </label>
            <input
              type="text"
              name="members"
              value={formData.members}
              onChange={handleInputChange}
              placeholder="e.g. Alice, Bob, Charlie"
              disabled={loading}
              className="w-full bg-muted/50 border-2 border-border rounded-xl px-5 py-3 text-sm font-bold focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all"
            />
          </div>

          {/* PPT Upload */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-[var(--text-primary)] uppercase tracking-[0.4em] ml-2">
              Digital Manifest (PDF)
            </label>
            <div className="relative group/upload">
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                disabled={loading}
                className="hidden"
                id="ppt-upload"
              />
              <label
                htmlFor="ppt-upload"
                className={`flex items-center justify-between w-full px-8 py-8 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-500 ${
                  file 
                    ? 'bg-primary/5 border-primary/40 shadow-xl shadow-primary/5' 
                    : 'bg-muted/30 border-border hover:border-primary/50'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-500 ${file ? 'bg-primary text-primary-foreground shadow-lg' : 'bg-background text-muted-foreground border border-border'}`}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <p className={`text-sm font-black tracking-tight uppercase ${file ? 'text-primary' : 'text-foreground'}`}>
                      {file ? file.name : 'Upload Presentation'}
                    </p>
                    <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest mt-0.5 opacity-60">
                      {file ? `${(file.size / (1024 * 1024)).toFixed(2)} MB • Ready` : 'PDF Format • Max 15MB'}
                    </p>
                  </div>
                </div>
                {!file && <span className="text-[9px] font-bold text-primary bg-primary/10 px-4 py-2 rounded-lg border border-primary/20 uppercase tracking-widest">Select File</span>}
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading || existingSubmission === true}
              className="btn-primary w-full py-4 text-[10px] tracking-[0.4em]"
            >
              {loading ? 'Transmitting...' : existingSubmission === true ? 'Locked Node' : 'Finalize & Encrypt'}
            </button>
            
            <p className="text-center text-[9px] text-[var(--text-secondary)] font-black uppercase tracking-[0.4em] mt-8 opacity-30">
              Connections are permanent once verified by system nodes.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PPTUpload;