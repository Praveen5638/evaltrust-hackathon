import React, { useState, useEffect } from 'react';
import { useNavigate, Routes, Route, useParams, Link, Navigate } from 'react-router-dom';
import { supabase } from '../../supabase/client';
import PPTList from '../ppt/PPTList';
import PPTPhase from '../../pages/PPTPhase';
import HackathonPhase from '../../pages/HackathonPhase';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Card, Badge } from '../ui';

const JudgePhaseSelect = () => {
  const navigate = useNavigate();
  const { hackathonId } = useParams();
  const [hackathon, setHackathon] = useState(null);
  const [judgeName, setJudgeName] = useState('Judge');

  useEffect(() => {
    const init = async () => {
      try {
        if (!hackathonId || hackathonId === 'unassigned' || hackathonId === 'undefined') {
          setHackathon({ name: 'Unassigned' });
          return;
        }
        const { data: h } = await supabase.from('hackathons').select('name').eq('id', hackathonId).single();
        setHackathon(h);
        const { data: { session } } = await supabase.auth.getSession();
        if (session) setJudgeName(session.user.user_metadata?.full_name || 'Judge');
      } catch (err) {
        console.warn('Dashboard initialization failed/aborted:', err);
      }
    };
    init();
  }, [hackathonId]);

  return (
    <div className="space-y-16 animate-fade-in">
      <header className="text-center md:text-left space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Badge variant="primary" className="bg-primary/20 text-primary border-primary/30 animate-pulse">Live Protocol</Badge>
                <div className="h-1 w-1 rounded-full bg-primary/40" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">{hackathon?.name || 'Loading Mission...'}</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-none">
                Evaluation<br />
                <span className="text-primary tracking-normal drop-shadow-2xl">{hackathon?.name || 'Terminal'}</span>
              </h1>
              <p className="text-muted-foreground text-lg max-w-2xl font-medium border-l-2 border-primary/20 pl-6 py-2">
                Welcome, <span className="text-foreground font-bold">{judgeName}</span>. Your access to this event is secured. Please select your mission protocol below.
              </p>
            </div>
            <Button 
              onClick={() => navigate('/scan', { state: { hackathonId } })}
              className="md:self-start py-6 px-10 rounded-2xl shadow-2xl shadow-primary/20 flex items-center gap-3 group"
            >
              <span className="text-2xl group-hover:rotate-12 transition-transform">📷</span>
              <div className="text-left">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Authentication</p>
                <p className="font-black uppercase tracking-tighter">Quick Scan QR</p>
              </div>
            </Button>
          </div>
      </header>
      <div className="grid md:grid-cols-2 gap-8">
        <motion.div whileHover={{ y: -8 }} onClick={() => navigate(`/judge/${hackathonId}/ppt`)}>
          <Card className="cursor-pointer group relative overflow-hidden h-full flex flex-col border-2 hover:border-primary/20">
            <div className="w-20 h-20 bg-blue-500/10 rounded-3xl flex items-center justify-center text-5xl mb-12 group-hover:bg-blue-500 group-hover:text-white transition-all duration-500">📊</div>
            <h2 className="text-3xl font-black mb-4 group-hover:text-primary transition-colors">Concept <br />Screening</h2>
            <p className="text-xs text-muted-foreground font-medium leading-relaxed mb-8">Review and score project presentations during the initial screening phase.</p>
            <div className="mt-auto pt-8 border-t border-border flex justify-between items-center"><Badge variant="primary">Phase 01</Badge><Button className="group-hover:translate-x-2 transition-transform">Initialize Portal →</Button></div>
          </Card>
        </motion.div>
        <motion.div whileHover={{ y: -8 }} onClick={() => navigate(`/judge/${hackathonId}/hackathon`)}>
          <Card className="cursor-pointer group relative overflow-hidden h-full flex flex-col border-2 hover:border-indigo-400/20">
            <div className="w-20 h-20 bg-indigo-500/10 rounded-3xl flex items-center justify-center text-5xl mb-12 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">🚀</div>
            <h2 className="text-3xl font-black mb-4 group-hover:text-indigo-500 transition-colors">Live <br />Evaluation</h2>
            <p className="text-xs text-muted-foreground font-medium leading-relaxed mb-8">Live evaluation of project demos and technical implementation during the main event.</p>
            <div className="mt-auto pt-8 border-t border-border flex justify-between items-center"><Badge variant="primary" className="bg-indigo-500">Phase 02</Badge><Button className="bg-indigo-600 hover:bg-indigo-700 group-hover:translate-x-2 transition-transform">Initialize Portal →</Button></div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

const JudgeDashboard = () => {
  const { hackathonId } = useParams();
  
  return (
    <Routes>
      <Route path="/" element={<Navigate to="terminal" replace />} />
      <Route path="terminal" element={<JudgePhaseSelect />} />
      <Route path="ppt" element={<PPTPhase />} />
      <Route path="hackathon" element={<HackathonPhase />} />
      <Route path="*" element={<Navigate to="terminal" replace />} />
    </Routes>
  );
};

export default JudgeDashboard;
