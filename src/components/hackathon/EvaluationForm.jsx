import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Card, Badge } from '../ui';

const EvaluationForm = ({ team, judgeId, round, totalRounds, onComplete, onCancel }) => {
  const [scores, setScores] = useState({
    innovation: 5, technical: 5, feasibility: 5, revenue_model: 5, impact: 5, presentation: 5, comments: ''
  });

  const criteria = [
    { id: 'innovation', label: 'Innovation', icon: '💡' },
    { id: 'technical', label: 'Technical', icon: '💻' },
    { id: 'feasibility', label: 'Feasibility', icon: '📈' },
    { id: 'revenue_model', label: 'Revenue Model', icon: '💰' },
    { id: 'impact', label: 'Impact', icon: '🌍' },
    { id: 'presentation', label: 'Presentation', icon: '🎤' }
  ];

  const [submitting, setSubmitting] = useState(false);
  const [alreadyEvaluated, setAlreadyEvaluated] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [history, setHistory] = useState([]);
  
  // Voice Dictation states (Point 2 - Speech-to-Text)
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [speechSupported, setSpeechSupported] = useState(false);

  // Word count utility
  const countWords = (str) => {
    if (!str || !str.trim()) return 0;
    return str.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const wordCount = countWords(scores.comments);
  const isWordLimitMet = wordCount >= 200;

  useEffect(() => {
    const checkExisting = async () => {
      if (!team?.id || !judgeId) return;
      const { data } = await supabase
        .from('scores')
        .select('id')
        .eq('team_id', team.id)
        .eq('judge_id', judgeId)
        .eq('round', round || 1)
        .maybeSingle();
      if (data) setAlreadyEvaluated(true);
    };
    checkExisting();
  }, [team.id, judgeId, round]);

  useEffect(() => {
    const fetchHistory = async () => {
      const currentRound = parseInt(round || 1);
      if (!team?.id || currentRound <= 1) return;
      
      const { data, error } = await supabase
        .from('scores')
        .select('round, total_score, comments, innovation, technical, feasibility, revenue_model, impact, presentation')
        .eq('team_id', team.id)
        .lt('round', currentRound)
        .order('round', { ascending: true });
        
      if (error) {
        console.error('Error fetching round history:', error);
      } else {
        setHistory(data || []);
      }
    };
    fetchHistory();
  }, [team.id, round]);

  // Initialize Speech Recognition API
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = false;
      rec.lang = 'en-IN'; // Optimized for bilingual Indian English pronunciations

      rec.onstart = () => {
        setIsListening(true);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      rec.onerror = (e) => {
        console.error("Speech recognition error:", e);
        setIsListening(false);
      };

      rec.onresult = (event) => {
        const transcript = event.results[event.results.length - 1][0].transcript;
        setScores(prev => ({
          ...prev,
          comments: prev.comments ? prev.comments.trim() + " " + transcript.trim() : transcript.trim()
        }));
      };

      setRecognition(rec);
    }
  }, []);

  const toggleListening = () => {
    if (!recognition) return;
    if (isListening) {
      recognition.stop();
    } else {
      recognition.start();
    }
  };

  const handleSliderChange = (id, val) => {
    if (alreadyEvaluated) return;
    setScores(prev => ({ ...prev, [id]: parseInt(val) }));
  };

  const calculateTotal = () => criteria.reduce((sum, c) => sum + scores[c.id], 0);

  const handleSubmitAttempt = (e) => {
    e.preventDefault();
    if (alreadyEvaluated) return;
    if (!isWordLimitMet) return;
    
    // Stop recording if active before submitting
    if (isListening && recognition) {
      recognition.stop();
    }
    
    setShowConfirmModal(true);
  };

  const handleFinalSubmit = async () => {
    setShowConfirmModal(false);
    setSubmitting(true);

    try {
      const total = calculateTotal();
      const currentRound = parseInt(round || 1);
      
      // 1. Submit the score with proper error checking
      const { error: scoreError } = await supabase.from('scores').insert([{
        team_id: team.id, 
        judge_id: judgeId, 
        round: currentRound, 
        innovation: scores.innovation, 
        technical: scores.technical, 
        feasibility: scores.feasibility, 
        revenue_model: scores.revenue_model,
        impact: scores.impact, 
        presentation: scores.presentation, 
        total_score: total, 
        comments: scores.comments
      }]);

      if (scoreError) throw scoreError;

      // 2. Autonomous Promotion: Advance to next round if available
      if (currentRound < totalRounds) {
        await supabase
          .from('teams')
          .update({ round_status: currentRound + 1 })
          .eq('id', team.id);
      } else {
        await supabase
          .from('teams')
          .update({ status: 'completed' })
          .eq('id', team.id);
      }

      onComplete();
    } catch (err) {
      alert('Sync failed: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const total = calculateTotal();
  const maxScore = criteria.length * 10;
  const percentage = (total / maxScore) * 100;

  if (alreadyEvaluated) {
    return (
      <div className="py-24 text-center space-y-8">
         <div className="w-24 h-24 bg-primary/10 rounded-3xl flex items-center justify-center text-5xl mx-auto mb-10 shadow-xl">🔒</div>
         <h2 className="text-3xl font-black uppercase tracking-tight">Vetting Locked</h2>
         <p className="text-muted-foreground font-medium max-w-sm mx-auto">This assessment has been securely archived in the global ledger.</p>
         <Button onClick={onCancel} variant="secondary" className="px-12 py-4 rounded-xl">Return to Hub</Button>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-center gap-10 pb-10 border-b border-border">
         <div>
            <Badge variant="primary" className="mb-4">
              {parseInt(round) === parseInt(totalRounds) ? '🔥 Final Round' : `📍 Round ${round}`} • {team.team_name}
            </Badge>
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight leading-none">Vetting <span className="text-primary">Logic</span></h2>
         </div>
         <Card className="!p-6 flex items-center gap-8 shadow-2xl border-primary/20">
            <div className="text-right">
               <div className="text-5xl font-black leading-none">{total}<span className="text-xs opacity-20 ml-2">/{maxScore}</span></div>
               <p className="text-[10px] font-bold uppercase tracking-widest text-primary mt-2">{percentage.toFixed(0)}% Match</p>
            </div>
            <div className="w-px h-12 bg-border" />
            <div className="relative w-16 h-16">
               <svg className="w-full h-full -rotate-90">
                  <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-muted/30" />
                  <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" strokeDasharray="175.9" strokeDashoffset={175.9 - (175.9 * percentage) / 100} className="text-primary transition-all duration-1000 ease-out" />
               </svg>
            </div>
         </Card>
      </div>

      {/* Renders previous round remarks (Point 9 context helper) */}
      {history.length > 0 && (
        <Card className="!p-6 border-2 border-primary/10 bg-primary/[0.01] space-y-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-primary">📜 Previous Round History</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {history.map((hist, idx) => (
              <div key={idx} className="p-4 bg-muted/40 rounded-xl border border-border space-y-2">
                <div className="flex justify-between items-center text-[10px] font-bold uppercase">
                  <span>Round {hist.round}</span>
                  <Badge variant="primary" className="text-[8px]">Score: {hist.total_score}</Badge>
                </div>
                <p className="text-xs text-muted-foreground italic font-medium">"{hist.comments}"</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      <form onSubmit={handleSubmitAttempt} className="space-y-12">
         <div className="grid md:grid-cols-2 gap-x-12 gap-y-10">
            {criteria.map(c => (
              <div key={c.id} className="space-y-4">
                 <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-3">
                      <span className="text-lg">{c.icon}</span> {c.label}
                    </label>
                    <span className="text-xl font-black text-primary">{scores[c.id]}</span>
                 </div>
                 <div className="relative h-2 bg-muted rounded-full overflow-hidden border border-border shadow-inner">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${scores[c.id] * 10}%` }} className="h-full bg-primary" />
                    <input 
                      type="range" min="0" max="10" value={scores[c.id]} 
                      onChange={(e) => handleSliderChange(c.id, e.target.value)} 
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                 </div>
              </div>
            ))}
         </div>

         {/* Mandated Feedback section with 200 word validation (Point 6) & Speech Dictation */}
         <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Arbiter Observations (Required)</label>
              
              <div className="flex items-center gap-3">
                {speechSupported && (
                  <button
                    type="button"
                    onClick={toggleListening}
                    className={`flex items-center gap-2 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                      isListening
                        ? 'bg-red-500/10 text-red-500 border-red-500/30 shadow-lg shadow-red-500/10 animate-pulse'
                        : 'bg-primary/5 text-primary border-primary/20 hover:bg-primary/10'
                    }`}
                  >
                    <span>{isListening ? '🛑 Stop Listening' : '🎙️ Dictate feedback'}</span>
                  </button>
                )}
                <span className={`text-[10px] font-bold uppercase px-3 py-1 rounded-full ${isWordLimitMet ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-yellow-500/10 text-yellow-600 border border-yellow-500/20 animate-pulse'}`}>
                  Words: {wordCount} / 200
                </span>
              </div>
            </div>
            
            <div className="relative">
              <textarea 
                value={scores.comments} 
                onChange={(e) => setScores(p => ({ ...p, comments: e.target.value }))}
                placeholder="Provide exhaustive expert constructive feedback here (minimum 200 words). Use 'Dictate feedback' above to speak into your microphone and transcribe instantly."
                className="w-full h-40 bg-muted border border-border rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:outline-none resize-none transition-all pr-12"
              />
              {isListening && (
                <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-500 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                  Mic Active
                </div>
              )}
            </div>
         </div>

         <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <Button type="button" variant="secondary" onClick={onCancel} className="flex-1 py-5 rounded-2xl">Discard Protocol</Button>
            <button 
              type="submit" 
              disabled={submitting || !isWordLimitMet} 
              className="flex-[2] py-5 rounded-2xl bg-primary text-primary-foreground font-black uppercase tracking-widest text-xs shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-30 disabled:hover:scale-100 disabled:cursor-not-allowed"
            >
               {submitting ? 'Transmitting...' : !isWordLimitMet ? 'Feedback Incomplete (< 200 Words)' : 'Commit Assessment'}
            </button>
         </div>
      </form>

      {/* Framer Motion warning modal (Point 10) */}
      <AnimatePresence>
        {showConfirmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card border-2 border-border p-10 rounded-[2rem] max-w-lg w-full text-center space-y-6 shadow-2xl relative overflow-hidden"
            >
              <div className="w-20 h-20 bg-yellow-500/10 rounded-2xl flex items-center justify-center text-4xl mx-auto shadow-lg shadow-yellow-500/5">⚠️</div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black uppercase tracking-tight text-foreground">Confirm Submission</h3>
                <p className="text-muted-foreground text-xs font-semibold uppercase tracking-widest text-yellow-600">CRITICAL INSTRUCTION WARNING</p>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                This evaluation is **strictly immutable**. Once confirmed, scores will be encrypted and committed to the ledger. You will **not** be able to edit or reverse these entries.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowConfirmModal(false)}>Cancel</Button>
                <Button className="flex-1" onClick={handleFinalSubmit}>Confirm & Lock</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EvaluationForm;