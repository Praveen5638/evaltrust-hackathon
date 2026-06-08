import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase/client';
import api from '../supabase/api';
import ResultReveal from '../components/hackathon/ResultReveal';
import { Card, Button, Badge } from '../components/ui';
import { motion } from 'framer-motion';

const RealResult = () => {
  const { id: hackathonId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
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
    }
  }, [hackathonId]);

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
          score: r.final_score,
          team_name: r.team_name // Ensure team_name is correctly mapped
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
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-background">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest animate-pulse">Syncing Production Data...</p>
      </div>
    );
  }

  if (state.isRevealed) {
    return <ResultReveal teams={state.teams} hackathonName={state.name} />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-3xl w-full">
        <Card className="!p-12 text-center space-y-10 border-2">
          <div className="w-24 h-24 bg-muted/50 border border-border rounded-3xl flex items-center justify-center text-5xl mx-auto shadow-2xl">
            🔒
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">{state.name}</h1>
            <h2 className="text-primary text-sm font-bold uppercase tracking-[0.2em]">Registry Protocol Secured</h2>
          </div>
          <p className="text-muted-foreground font-medium max-w-lg mx-auto leading-relaxed">
            The final standings for this event are currently encrypted and awaiting the official reveal command from the Organizer.
          </p>
          <div className="pt-10 border-t border-border flex flex-col items-center gap-6">
            <Badge variant="primary" className="!px-6 !py-3">
              Status: {state.isLocked ? 'Locked & Verified' : 'Awaiting Final Lock'}
            </Badge>
            <Button variant="outline" onClick={() => navigate('/results')}>Back to Ledger</Button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default RealResult;
