import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../supabase/client';
import { Button, Card, Badge, Input } from '../components/ui';

const ParticipantStatus = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [hackathonId, setHackathonId] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleLookup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      // 1. Search in ppt_submissions
      const { data, error: fetchErr } = await supabase
        .from('ppt_submissions')
        .select(`
          *,
          hackathons (
            name,
            is_result_revealed
          )
        `)
        .ilike('team_name', teamName.trim())
        .eq('hackathon_id', hackathonId.trim())
        .maybeSingle();

      if (fetchErr) throw fetchErr;
      
      if (!data) {
        setError('No record found for this team in the specified event cluster.');
      } else {
        setResult(data);
      }
    } catch (err) {
      console.error('Lookup error:', err);
      setError('An error occurred during verification. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-20 px-6 flex flex-col items-center">
      <div className="max-w-xl w-full space-y-12 animate-fade-in">
        <header className="text-center space-y-4">
          <Badge variant="primary" className="mx-auto">PARTICIPANT TERMINAL</Badge>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-none uppercase">
            Check <span className="text-primary">Status</span>
          </h1>
          <p className="text-muted-foreground font-medium text-sm">Verify your submission progress and consensus outcomes.</p>
        </header>

        <Card className="!p-8 border-2 shadow-2xl shadow-primary/5">
          <form onSubmit={handleLookup} className="space-y-6">
            <div className="space-y-2">
               <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Team Name</label>
               <input 
                 type="text" 
                 placeholder="Enter registered team name..." 
                 className="w-full bg-muted/50 border-2 border-border focus:border-primary focus:bg-background rounded-xl py-4 px-6 text-sm font-bold transition-all outline-none"
                 value={teamName}
                 onChange={(e) => setTeamName(e.target.value)}
                 required
               />
            </div>
            <div className="space-y-2">
               <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Hackathon ID</label>
               <input 
                 type="text" 
                 placeholder="Enter event UUID or ID..." 
                 className="w-full bg-muted/50 border-2 border-border focus:border-primary focus:bg-background rounded-xl py-4 px-6 text-sm font-bold transition-all outline-none"
                 value={hackathonId}
                 onChange={(e) => setHackathonId(e.target.value)}
                 required
               />
            </div>
            <Button 
              type="submit" 
              className="w-full py-4 rounded-xl shadow-xl shadow-primary/20 font-black uppercase tracking-widest"
              disabled={loading}
            >
              {loading ? 'Verifying Protocol...' : 'Initialize Verification'}
            </Button>
          </form>
        </Card>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0 }}
              className="p-6 bg-destructive/10 border border-destructive/20 rounded-2xl text-center"
            >
              <p className="text-destructive text-sm font-bold uppercase tracking-tight">{error}</p>
            </motion.div>
          )}

          {result && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              <Card className="!p-8 border-2 border-primary/20 bg-primary/5 relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-4">
                    <Badge variant="completed">{result.status}</Badge>
                 </div>
                 
                 <div className="space-y-6 relative z-10">
                    <div>
                       <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Authenticated Record</p>
                       <h2 className="text-3xl font-black uppercase">{result.team_name}</h2>
                       <p className="text-muted-foreground font-bold text-xs uppercase tracking-tight">{result.hackathons?.name}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                       <div className="p-4 bg-background rounded-xl border border-border">
                          <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">Phase</p>
                          <p className="text-sm font-black">{result.status === 'shortlisted' ? 'Hackathon' : 'Concept'}</p>
                       </div>
                       <div className="p-4 bg-background rounded-xl border border-border">
                          <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">Outcome</p>
                          <p className="text-sm font-black">{result.hackathons?.is_result_revealed ? 'Revealed' : 'In Progress'}</p>
                       </div>
                    </div>

                    <div className="pt-6 border-t border-border flex justify-between items-center">
                       <Button variant="outline" size="sm" onClick={() => navigate(`/project/${result.id}`)}>View Full Manifest</Button>
                       <p className="text-[9px] font-bold text-muted-foreground uppercase opacity-40">Sync Time: {new Date().toLocaleTimeString()}</p>
                    </div>
                 </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="text-center">
           <Button variant="ghost" onClick={() => navigate('/')} className="text-xs font-black uppercase tracking-widest opacity-60 hover:opacity-100">← Back to Terminal</Button>
        </div>
      </div>
    </div>
  );
};

export default ParticipantStatus;
