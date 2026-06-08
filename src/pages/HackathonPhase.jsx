import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase/client';
import { getAssignedTeams } from '../supabase/api';
import EvaluationForm from '../components/hackathon/EvaluationForm';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Card, Badge, Input } from '../components/ui';

const HackathonPhase = ({ hackathonId: propId }) => {
  const { hackathonId: paramId } = useParams();
  const hackathonId = propId || paramId;
  const navigate = useNavigate();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hackathon, setHackathon] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [judgeInfo, setJudgeInfo] = useState({ id: '', name: 'Judge' });
  const location = useLocation();

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate('/login');
          return;
        }

        const jId = session.user.id;
        const jName = session.user.user_metadata?.full_name || 'Judge';
        setJudgeInfo({ id: jId, name: jName });

        const { data: hData } = await supabase.from('hackathons').select('*').eq('id', hackathonId).single();
        setHackathon(hData);

        const data = await getAssignedTeams(jId, hackathonId);
        // Shuffle teams so each judge sees a different order
        const shuffled = [...data].sort(() => Math.random() - 0.5);
        setTeams(shuffled);

        const channel = supabase.channel('schema-db-changes').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'scores' }, async () => {
          const updatedData = await getAssignedTeams(jId, hackathonId);
          setTeams(updatedData);
        }).subscribe();

        return () => { supabase.removeChannel(channel); };
      } catch (err) {
        console.error('Init failed:', err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [navigate, hackathonId]);

  useEffect(() => {
    if (location.state?.autoSelectTeam) {
      const targetTeam = location.state.autoSelectTeam;
      const targetId = targetTeam.id || targetTeam.team_id;
      
      // Find in existing teams or use the passed object directly
      const team = teams.find(t => t.id === targetId || t.team_id === targetId) || targetTeam;
      
      if (team && !team.isEvaluated && !team.isGlobalLocked) {
        setSelectedTeam(team);
        // Clean up state to prevent re-triggering
        window.history.replaceState({}, document.title);
      }
    }
  }, [location.state, teams]);

  const handleEvaluationComplete = async () => {
    const data = await getAssignedTeams(judgeInfo.id, hackathonId);
    setTeams(data);
    setSelectedTeam(null);
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
       <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
       <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest animate-pulse">Syncing Evaluation Nodes...</p>
    </div>
  );

  if (selectedTeam) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="flex items-center justify-between pb-6 border-b border-border">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => setSelectedTeam(null)}>
              ← Back to List
            </Button>
            <div className="h-8 w-px bg-border hidden md:block"></div>
            <div>
              <h2 className="text-2xl font-black">{selectedTeam.team_name}</h2>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Table: {selectedTeam.table_number || 'T-01'}</p>
            </div>
          </div>
          <Badge variant="primary">Round {selectedTeam.currentRound || '1'}</Badge>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Left -> Project Info / Viewer Placeholder */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="!p-6 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Team Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Table Number</label>
                  <p className="text-lg font-black">{selectedTeam.table_number || 'Not Assigned'}</p>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Current Phase</label>
                  <p className="text-lg font-black text-primary uppercase">{selectedTeam.currentRound || 'Round 1'}</p>
                </div>
              </div>
            </Card>
            
            <Card className="!p-6 space-y-4 bg-muted/30">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Evaluation Guide</h3>
              <ul className="text-xs font-medium text-muted-foreground space-y-2 list-disc pl-4">
                <li>Be fair and consistent across all teams.</li>
                <li>Score based on the defined criteria only.</li>
                <li>Provide constructive feedback if possible.</li>
                <li>Final scores are immutable once submitted.</li>
              </ul>
            </Card>
          </div>

          {/* Right -> Scoring Form */}
          <div className="lg:col-span-8">
            <Card className="!p-10 border-2 border-primary/10 shadow-2xl shadow-primary/5">
              <EvaluationForm 
                team={selectedTeam} 
                judgeId={judgeInfo.id} 
                round={selectedTeam.currentRound} 
                totalRounds={hackathon?.total_rounds || 3}
                onComplete={handleEvaluationComplete} 
                onCancel={() => setSelectedTeam(null)} 
              />
            </Card>
          </div>
        </div>
      </div>
    );
  }

  const evaluatedCount = teams.filter(t => t.isEvaluated).length;
  const progress = teams.length > 0 ? (evaluatedCount / teams.length) * 100 : 0;

  return (
    <div className="space-y-12">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 pb-8 border-b border-border">
        <div className="space-y-2">
          <Badge variant="primary" className="mb-2">Evaluation Terminal</Badge>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-none uppercase">Active <span className="text-primary">Teams</span></h1>
          <p className="text-muted-foreground font-medium text-sm md:text-base">Real-time judging dashboard for {judgeInfo.name}.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
          <Button 
            className="w-full sm:w-auto py-4 px-8 rounded-2xl"
            onClick={() => navigate('/scan', { state: { hackathonId } })}
          >
            📷 Quick Scan QR
          </Button>
          <div className="flex items-center justify-between sm:justify-start gap-4 glass border-border rounded-2xl px-6 py-2">
            <div className="text-left sm:text-right">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Arbiter</p>
              <p className="text-sm font-bold">{judgeInfo.name}</p>
            </div>
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary font-black">
              {judgeInfo.name.charAt(0)}
            </div>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <Card className="!p-6 flex flex-col md:flex-row items-center gap-8 bg-muted/30 border-0">
        <div className="text-sm font-bold text-muted-foreground uppercase tracking-widest min-w-fit">Judging Progress</div>
        <div className="flex-1 w-full h-3 bg-background rounded-full overflow-hidden border border-border shadow-inner">
          <motion.div 
            initial={{ width: 0 }} 
            animate={{ width: `${progress}%` }} 
            className="h-full bg-primary shadow-lg shadow-primary/20" 
          />
        </div>
        <div className="text-xl font-black text-primary min-w-[80px] text-right">
          {evaluatedCount} <span className="text-muted-foreground font-medium">/ {teams.length}</span>
        </div>
      </Card>

      {/* Team Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {teams.map((team, i) => (
          <motion.div 
            key={team.id} 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: i * 0.05 }}
          >
            <Card className={`group relative h-full flex flex-col justify-between transition-all duration-300 ${team.isEvaluated || team.isGlobalLocked ? 'opacity-60 bg-muted/20' : 'hover:border-primary/30'}`}>
              <div>
                <div className="flex justify-between items-start mb-8">
                  <div className="relative">
                    <div className={`w-16 h-16 rounded-2xl overflow-hidden border-2 transition-all duration-500 shadow-2xl ${
                      team.isEvaluated ? 'border-green-500/20' : 'border-primary/20 group-hover:border-primary/40'
                    }`}>
                      <img 
                        src={`https://api.dicebear.com/7.x/notionists/svg?seed=${team.team_name}&backgroundColor=b6e3f4,c0aede,d1d4f9`} 
                        alt="Avatar" 
                        className="w-full h-full object-cover bg-muted"
                      />
                    </div>
                    <div className={`absolute -bottom-2 -right-2 w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shadow-lg border-2 border-background ${
                      team.isEvaluated ? 'bg-green-500 text-white' : 'bg-primary text-primary-foreground'
                    }`}>
                      {team.table_number || '??'}
                    </div>
                  </div>
                  {team.isEvaluated ? (
                    <Badge variant="completed">Evaluated</Badge>
                  ) : team.isGlobalLocked ? (
                    <Badge variant="failed">Locked</Badge>
                  ) : (
                    <div className="w-3 h-3 bg-primary rounded-full animate-pulse shadow-lg shadow-primary/50"></div>
                  )}
                </div>
                <h3 className="text-2xl font-black mb-2 group-hover:text-primary transition-colors">{team.team_name}</h3>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-40 mb-8">Team ID: {team.id.substring(0,8)}</p>
              </div>

              <Button 
                disabled={team.isEvaluated || team.isGlobalLocked}
                onClick={() => setSelectedTeam(team)}
                variant={team.isEvaluated ? 'secondary' : 'primary'}
                className="w-full py-4 rounded-xl font-bold"
              >
                 {team.isEvaluated ? 'Review Complete' : team.isGlobalLocked ? 'Access Restricted' : 'Start Evaluation'}
              </Button>
            </Card>
          </motion.div>
        ))}
      </div>

      {teams.length === 0 && !loading && (
        <Card className="py-24 text-center border-dashed">
          <div className="text-6xl opacity-10 mb-6">📡</div>
          <p className="text-muted-foreground font-bold uppercase tracking-widest">No teams assigned for evaluation in this round.</p>
        </Card>
      )}
    </div>
  );
};

export default HackathonPhase;