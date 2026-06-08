import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Card, Badge, Input } from '../ui';

// ── CONSTANTS ─────────────────────────────────────────────────
const CRITERIA = [
  { id: 'innovation',   label: 'Innovation',   icon: '💡', max: 10 },
  { id: 'technical',    label: 'Technical',     icon: '⚙️', max: 10 },
  { id: 'feasibility',  label: 'Feasibility',   icon: '🎯', max: 10 },
  { id: 'impact',       label: 'Impact',        icon: '🌍', max: 10 },
  { id: 'presentation', label: 'Presentation',  icon: '🎤', max: 10 },
];

const DEFAULT_SCORES = { innovation: 5, technical: 5, feasibility: 5, impact: 5, presentation: 5, comments: '' };

// ── HELPERS ───────────────────────────────────────────────────
const formatMembers = (members) => {
  if (!members) return [];
  return Array.isArray(members) ? members : [members];
};

// ── EVALUATION PANEL ─────────────────────────────────────────
const EvaluationPanel = ({ submission, onDone, onCancel, isEvaluated, evalScore }) => {
  const [scores, setScores] = useState(DEFAULT_SCORES);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [judgeId, setJudgeId] = useState('JUDGE_1');
  
  useEffect(() => {
    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) setJudgeId(session.user.id);
      } catch (err) {
        console.warn('EvaluationPanel session lookup failed:', err);
      }
    };
    getSession();
  }, []);

  const total = CRITERIA.reduce((sum, c) => sum + scores[c.id], 0);
  const percentage = (total / 50) * 100;

  const handleScore = (id, val) => setScores(prev => ({ ...prev, [id]: parseInt(val) }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError('');

    try {
      const { data: existing } = await supabase.from('scores').select('id').eq('team_id', submission.id).eq('judge_id', judgeId).eq('round', 0).maybeSingle();

      if (existing) {
        setSubmitError('You have already evaluated this team.');
        setSubmitting(false);
        return;
      }

      await supabase.from('scores').insert([{
        team_id: submission.id, 
        judge_id: judgeId, 
        round: 0, 
        innovation: scores.innovation, 
        technical: scores.technical, 
        feasibility: scores.feasibility, 
        impact: scores.impact, 
        presentation: scores.presentation, 
        total_score: total, 
        comments: scores.comments
      }]);

      await supabase.from('ppt_submissions').update({ status: 'evaluated', score: total }).eq('id', submission.id);

      setSubmitted(true);
      setTimeout(() => onDone(total), 1500);
    } catch (err) {
      setSubmitError(`Failed to submit: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted || isEvaluated) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-8 p-12 text-center animate-fade-in">
        <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center text-4xl shadow-xl">✅</div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold uppercase tracking-tight">Evaluation Synced</h2>
          <p className="text-muted-foreground font-medium">The results have been logged to the registry.</p>
        </div>
        <Card className="!p-10 bg-muted/30 border-2">
           <p className="text-6xl font-black">{evalScore || total}<span className="text-xs opacity-20 ml-2">/50</span></p>
        </Card>
        <Button onClick={onCancel} className="w-full">Exit Evaluation</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full animate-fade-in">
      <div className="p-8 border-b border-border bg-primary/[0.02] space-y-6">
        <div className="flex justify-between items-center">
           <Badge variant="primary">Evaluation Matrix</Badge>
           <button onClick={onCancel} className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest hover:text-primary transition-colors">Close [ESC]</button>
        </div>
        <Card className="!p-8 border-2">
           <div className="flex justify-between items-end mb-4">
              <span className="text-4xl font-black tracking-tighter">{total}<span className="text-xs opacity-20 ml-2">/50</span></span>
              <span className="text-xs font-bold text-primary uppercase tracking-widest">{percentage.toFixed(0)}% Match</span>
           </div>
           <div className="h-2 bg-muted rounded-full overflow-hidden shadow-inner">
              <motion.div initial={{ width: 0 }} animate={{ width: `${percentage}%` }} className="h-full bg-primary shadow-[0_0_15px_hsl(var(--primary))]" />
           </div>
        </Card>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar pb-32">
         {CRITERIA.map(c => (
           <div key={c.id} className="space-y-4">
              <div className="flex justify-between items-center">
                 <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-3">
                   <span className="text-lg">{c.icon}</span> {c.label}
                 </label>
                 <span className="text-xl font-black text-primary">{scores[c.id]}</span>
              </div>
              <input 
                type="range" min="0" max="10" value={scores[c.id]} 
                onChange={(e) => handleScore(c.id, e.target.value)} 
                className="w-full h-2 bg-muted rounded-full accent-primary cursor-pointer"
              />
           </div>
         ))}
         
         <div className="space-y-4 pt-6">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Observations</label>
            <textarea 
              value={scores.comments} 
              onChange={(e) => setScores(p => ({ ...p, comments: e.target.value }))}
              placeholder="Enter qualitative feedback here..."
              className="w-full h-32 bg-muted border border-border rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:outline-none resize-none transition-all"
            />
         </div>

         {submitError && <div className="p-4 bg-destructive/5 border border-destructive/20 text-destructive rounded-xl text-[10px] font-bold uppercase tracking-widest">⚠️ {submitError}</div>}

         <Button type="submit" disabled={submitting} className="w-full py-6 text-sm font-bold uppercase tracking-widest shadow-xl shadow-primary/20">
            {submitting ? 'Transmitting...' : 'Commit Assessment'}
         </Button>
      </form>
    </div>
  );
};

// ── PPT VIEWER ─────────────────────────────────────────────────────────────
const PPTViewer = ({ submission, onBack }) => {
  const [showEvaluation, setShowEvaluation] = useState(false);
  const isEvaluated = submission.status === 'evaluated';

  return (
    <div className="fixed inset-0 z-[120] bg-background flex flex-col animate-fade-in">
       <div className="h-20 border-b border-border px-8 flex items-center justify-between bg-background/80 backdrop-blur-2xl">
          <div className="flex items-center gap-6">
             <Button variant="outline" size="sm" onClick={onBack}>← Back</Button>
             <h2 className="text-xl font-black tracking-tight">{submission.team_name}</h2>
             <Badge variant={isEvaluated ? 'completed' : 'primary'}>{isEvaluated ? 'Evaluated' : 'Pending'}</Badge>
          </div>
          <a href={submission.ppt_url} target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold text-primary uppercase tracking-widest hover:underline">Open Full Document ↗</a>
       </div>

       <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 bg-muted/30 p-8">
             <iframe src={`${submission.ppt_url}#toolbar=0&view=FitH`} className="w-full h-full rounded-3xl shadow-2xl border-2 border-border" />
          </div>

          <div className="w-[450px] border-l border-border bg-background flex flex-col shadow-2xl">
             <AnimatePresence mode="wait">
                {showEvaluation ? (
                  <motion.div key="eval" initial={{ x: 450 }} animate={{ x: 0 }} exit={{ x: 450 }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="h-full">
                     <EvaluationPanel submission={submission} isEvaluated={isEvaluated} evalScore={submission.score} onCancel={() => setShowEvaluation(false)} onDone={() => onBack()} />
                  </motion.div>
                ) : (
                  <motion.div key="info" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-10 flex flex-col h-full space-y-12">
                     <div className="space-y-6">
                        <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center text-5xl shadow-xl">🛰️</div>
                        <div className="space-y-2">
                          <h2 className="text-4xl font-black tracking-tight uppercase leading-none">{submission.team_name}</h2>
                          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Project Manifest</p>
                        </div>
                     </div>
                     
                     <div className="flex-1 space-y-8">
                        <div className="space-y-4">
                           <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest border-b border-border pb-2">Team Operators</p>
                           <div className="space-y-3">
                              {formatMembers(submission.members).map((m, i) => (
                                <div key={i} className="flex items-center gap-4 text-sm font-bold text-foreground">
                                   <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-xs border border-border shadow-sm">{m?.trim().charAt(0)}</div>
                                   {m?.trim()}
                                </div>
                              ))}
                           </div>
                        </div>
                     </div>

                     <div className="mt-auto pt-8 border-t border-border">
                        <Button onClick={() => setShowEvaluation(true)} className="w-full py-6 text-sm font-bold uppercase tracking-widest shadow-xl shadow-primary/20">
                           {isEvaluated ? 'Review Scores' : 'Initialize Vetting'}
                        </Button>
                     </div>
                  </motion.div>
                )}
             </AnimatePresence>
          </div>
       </div>
    </div>
  );
};

// ── PPT LIST ──────────────────────────────────────────────────────────────
const PPTList = ({ hackathonId = null }) => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchSubmissions();
  }, [hackathonId]);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      let query = supabase.from('ppt_submissions').select('*').order('created_at', { ascending: false });
      if (hackathonId) query = query.eq('hackathon_id', hackathonId);
      const { data, error } = await query;
      if (error) throw error;
      
      // Shuffle for each judge to distribute evaluation load
      const shuffled = (data || []).sort(() => Math.random() - 0.5);
      setSubmissions(shuffled);
    } catch (err) {
      console.warn('Fetch submissions failed:', err);
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  };

  if (selectedSubmission) return <PPTViewer submission={selectedSubmission} onBack={() => { setSelectedSubmission(null); fetchSubmissions(); }} />;

  return (
    <div className="space-y-12 animate-fade-in">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 pb-8 border-b border-border">
        <div className="space-y-2">
           <Badge variant="primary">Screening Registry</Badge>
           <h2 className="text-4xl font-black tracking-tight leading-none">Concept <span className="text-primary">Manifests</span></h2>
           <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">{submissions.length} Entries Synchronized</p>
        </div>
        <div className="relative w-full md:w-80">
           <Input placeholder="Filter manifest stream..." value={search} onChange={e => setSearch(e.target.value)} />
           <span className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20">🔍</span>
        </div>
      </header>

      {loading ? (
        <div className="py-24 text-center flex flex-col items-center gap-6">
           <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
           <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest animate-pulse">Syncing Registry Nodes...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {submissions.filter(s => s.team_name?.toLowerCase().includes(search.toLowerCase())).map((sub, i) => (
             <motion.div 
               key={sub.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
               onClick={() => setSelectedSubmission(sub)}
             >
                <Card className="cursor-pointer group border-2 hover:border-primary/20 h-full flex flex-col justify-between transition-all">
                  <div>
                    <div className="flex justify-between items-start mb-10">
                       <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-4xl group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">🛰️</div>
                       <Badge variant={sub.status === 'evaluated' ? 'completed' : 'primary'}>{sub.status}</Badge>
                    </div>
                    <h3 className="text-2xl font-black mb-3 group-hover:text-primary transition-colors leading-tight uppercase truncate">{sub.team_name}</h3>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-40 mb-10">Registry ID: {sub.id.substring(0,8)}</p>
                  </div>
                  <div className="pt-6 border-t border-border flex justify-between items-center">
                    <div className="flex -space-x-3">
                       {formatMembers(sub.members).slice(0, 4).map((m, i) => (
                         <div key={i} className="w-9 h-9 rounded-full bg-muted border-2 border-background flex items-center justify-center text-[10px] font-bold text-foreground shadow-sm">{m?.trim().charAt(0)}</div>
                       ))}
                       {formatMembers(sub.members).length > 4 && (
                         <div className="w-9 h-9 rounded-full bg-primary text-primary-foreground border-2 border-background flex items-center justify-center text-[10px] font-bold shadow-sm">+{formatMembers(sub.members).length - 4}</div>
                       )}
                    </div>
                    <span className="text-primary text-[10px] font-bold uppercase tracking-widest group-hover:translate-x-2 transition-transform">Inspect →</span>
                  </div>
                </Card>
             </motion.div>
           ))}
           {submissions.length === 0 && (
             <Card className="col-span-full py-24 text-center border-dashed">
               <div className="text-6xl opacity-10 mb-6">📡</div>
               <h3 className="text-2xl font-bold mb-2">No Submissions Found</h3>
               <p className="text-muted-foreground">The registry is currently empty for this event.</p>
             </Card>
           )}
        </div>
      )}
      
      <style jsx="true">{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: hsl(var(--border)); border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default PPTList;