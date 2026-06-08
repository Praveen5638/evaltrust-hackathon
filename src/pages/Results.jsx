import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../supabase/client';
import api from '../supabase/api';
import ResultReveal from '../components/hackathon/ResultReveal';
import { Button, Card, Badge } from '../components/ui';

const Results = () => {
  const { id: hackathonId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [hackathons, setHackathons] = useState([]);
  const [state, setState] = useState({
    isComplete: false,
    isLocked: false,
    isRevealed: false,
    teams: [],
    name: ''
  });

  useEffect(() => {
    if (hackathonId) {
      fetchHackathonResults(hackathonId);
    } else {
      fetchRevealedHackathons();
    }
  }, [hackathonId]);

  const fetchRevealedHackathons = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('hackathons')
        .select('*')
        .eq('is_result_revealed', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setHackathons(data || []);
    } catch (err) {
      console.error('Error fetching revealed hackathons:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchHackathonResults = async (hid) => {
    try {
      setLoading(true);
      
      const { data: hInfo } = await supabase
        .from('hackathons')
        .select('name, is_final_locked, is_result_revealed')
        .eq('id', hid)
        .maybeSingle();

      if (!hInfo) {
        setLoading(false);
        return;
      }

      const complete = await api.isEvaluationComplete(hid);
      const locked = hInfo.is_final_locked;
      const revealed = hInfo.is_result_revealed;
      
      let teamsData = [];
      if (revealed) {
        const rawResults = await api.calculateFinalResults(hid);
        teamsData = rawResults.map(r => ({
          ...r,
          score: r.final_score
        }));
      }

      setState({
        isComplete: complete,
        isLocked: locked,
        isRevealed: revealed,
        teams: teamsData,
        name: hInfo.name
      });
    } catch (err) {
      console.error('Error fetching result data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest animate-pulse">Syncing Results...</p>
      </div>
    );
  }

  // --- List View ---
  if (!hackathonId) {
    return (
      <div className="space-y-16 animate-fade-in">
        <header className="text-center space-y-4">
          <Badge variant="primary" className="mx-auto">Official Hall of Fame</Badge>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-none uppercase">
            Consensus <span className="text-primary">Ledger</span>
          </h1>
          <p className="text-muted-foreground text-sm md:text-base max-w-2xl mx-auto font-medium">
            Authorized outcomes and transparency reports from concluded hackathons.
          </p>
        </header>

        {hackathons.length === 0 ? (
          <Card className="py-24 text-center border-dashed">
            <div className="text-6xl opacity-10 mb-6">📡</div>
            <h3 className="text-2xl font-bold mb-2">Awaiting Revelations</h3>
            <p className="text-muted-foreground">No events have been officially finalized for revelation yet.</p>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {hackathons.map(h => (
              <motion.div
                key={h.id}
                whileHover={{ y: -8 }}
                onClick={() => navigate(`/results/${h.id}`)}
              >
                <Card className="cursor-pointer group h-full border-2 hover:border-primary/20">
                  <div className="flex justify-between items-start mb-10">
                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-3xl group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">🏆</div>
                    <Badge variant="completed">Revealed</Badge>
                  </div>
                  <h3 className="text-3xl font-black mb-4 group-hover:text-primary transition-colors">{h.name}</h3>
                  <p className="text-muted-foreground text-sm line-clamp-2 mb-8">{h.description}</p>
                  <div className="pt-6 border-t border-border flex justify-between items-center text-xs font-bold uppercase tracking-widest">
                    <span className="opacity-40">{new Date(h.created_at).toLocaleDateString()}</span>
                    <span className="text-primary group-hover:translate-x-2 transition-transform">View Results →</span>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // --- Detail View ---
  if (state.isRevealed) {
    return <ResultReveal teams={state.teams} hackathonName={state.name} />;
  }

  const MessageState = ({ icon, title, subtitle, statusText }) => (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-6">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-3xl w-full">
        <Card className="!p-6 md:!p-12 text-center space-y-10 border-2">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/results')}
            className="mb-4"
          >
            ← Back to Registry
          </Button>

          <div className="w-20 h-20 md:w-24 md:h-24 bg-muted/50 border border-border rounded-3xl flex items-center justify-center text-4xl md:text-5xl mx-auto shadow-2xl group hover:rotate-12 transition-transform duration-500">
            {icon}
          </div>
          
          <div className="space-y-4">
            <h1 className="text-3xl md:text-6xl font-black tracking-tight leading-tight">{state.name}</h1>
            <h2 className="text-primary text-sm md:text-base font-bold uppercase tracking-[0.2em]">{title}</h2>
          </div>
          
          <p className="text-muted-foreground font-medium max-w-lg mx-auto leading-relaxed">
            {subtitle}
          </p>
          
          <div className="pt-10 border-t border-border">
            <div className="flex flex-col items-center gap-6">
              <Badge variant="primary" className="!px-6 !py-3">
                <span className="w-2.5 h-2.5 bg-primary rounded-full animate-pulse mr-2"></span>
                {statusText}
              </Badge>
              <div className="w-full max-w-xs h-1.5 bg-muted rounded-full overflow-hidden border border-border shadow-inner">
                <motion.div 
                  initial={{ x: -150 }}
                  animate={{ x: 150 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="w-1/2 h-full bg-primary/40"
                />
              </div>
              <p className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-widest">Registry ID: {hackathonId?.substring(0,8)}</p>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );

  if (!state.isComplete) {
    return <MessageState icon="📡" title="Evaluating Projects" subtitle="The judges are currently evaluating the final projects. Results will be available once all scores are synchronized." statusText="Live Sync Active" />;
  }

  if (!state.isLocked) {
    return <MessageState icon="⚖️" title="Final Audit" subtitle="All evaluations are complete. We are performing a final transparency audit on the results before the official reveal." statusText="Audit in Progress" />;
  }

  return <MessageState icon="🔒" title="Ready for Reveal" subtitle="The results are locked and secured. The organizer will initiate the reveal sequence shortly. Stay tuned!" statusText="Protocol Secured" />;
};

export default Results;
