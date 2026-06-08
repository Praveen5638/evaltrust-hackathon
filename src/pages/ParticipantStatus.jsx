import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../supabase/client';
import { Button, Card, Badge } from '../components/ui';

const ParticipantStatus = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [hackathonId, setHackathonId] = useState('');
  const [hackathonsList, setHackathonsList] = useState([]);
  const [hackathonsLoading, setHackathonsLoading] = useState(true);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // Fetch hackathons list for the dropdown selection
  useEffect(() => {
    const fetchHackathons = async () => {
      try {
        const { data, error: fetchErr } = await supabase
          .from('hackathons')
          .select('id, name')
          .order('created_at', { ascending: false });

        if (fetchErr) throw fetchErr;

        if (data) {
          setHackathonsList(data);
          if (data.length > 0) {
            setHackathonId(data[0].id); // Default to the latest hackathon
          }
        }
      } catch (err) {
        console.error('Error fetching hackathons:', err);
      } finally {
        setHackathonsLoading(false);
      }
    };

    fetchHackathons();
  }, []);

  const handleLookup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    const trimmedTeamName = teamName.trim();
    const trimmedHackathonId = hackathonId.trim();

    if (!trimmedTeamName || !trimmedHackathonId) {
      setError('Please select a hackathon and enter your team name.');
      setLoading(false);
      return;
    }

    try {
      // 1. Search in 'teams' table (Hackathon Phase) first
      const { data: teamData, error: teamErr } = await supabase
        .from('teams')
        .select(`
          *,
          hackathons (
            name,
            total_rounds,
            is_result_revealed
          )
        `)
        .ilike('team_name', trimmedTeamName)
        .eq('hackathon_id', trimmedHackathonId)
        .maybeSingle();

      if (teamErr) throw teamErr;

      if (teamData) {
        setResult({
          type: 'hackathon',
          team_name: teamData.team_name,
          members: teamData.members,
          ppt_url: teamData.ppt_url,
          status: teamData.status, // e.g. 'active', 'completed'
          round_status: teamData.round_status, // current round number
          id: teamData.id,
          hackathonName: teamData.hackathons?.name,
          totalRounds: teamData.hackathons?.total_rounds || 1,
          isResultRevealed: teamData.hackathons?.is_result_revealed
        });
      } else {
        // 2. If not found in 'teams', search in 'ppt_submissions' (Concept/PPT Phase)
        const { data: pptData, error: pptErr } = await supabase
          .from('ppt_submissions')
          .select(`
            *,
            hackathons (
              name,
              total_rounds,
              is_result_revealed
            )
          `)
          .ilike('team_name', trimmedTeamName)
          .eq('hackathon_id', trimmedHackathonId)
          .maybeSingle();

        if (pptErr) throw pptErr;

        if (pptData) {
          setResult({
            type: 'ppt',
            team_name: pptData.team_name,
            members: pptData.members,
            ppt_url: pptData.ppt_url,
            status: pptData.status || 'submitted', // e.g. 'submitted', 'evaluated', 'shortlisted'
            id: pptData.id,
            hackathonName: pptData.hackathons?.name,
            isResultRevealed: pptData.hackathons?.is_result_revealed
          });
        } else {
          setError('No record found for this team in the selected hackathon. Please check your spelling.');
        }
      }
    } catch (err) {
      console.error('Lookup error:', err);
      setError('An error occurred during verification. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const getBadgeVariant = () => {
    if (!result) return 'pending';
    if (result.type === 'hackathon') {
      return 'completed'; // Active or Completed in hackathon phase
    }
    // For PPT phase
    if (result.status === 'shortlisted') return 'completed';
    if (result.status === 'evaluated') return 'primary';
    return 'pending';
  };

  const getStatusText = () => {
    if (!result) return '';
    if (result.type === 'hackathon') {
      return result.status === 'active' ? 'Active in Hackathon' : 'Completed';
    }
    if (result.status === 'shortlisted') return 'Shortlisted';
    if (result.status === 'evaluated') return 'Evaluated';
    return 'Submitted';
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
            <div className="space-y-2 flex flex-col">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 mb-1">
                Select Hackathon
              </label>
              {hackathonsLoading ? (
                <div className="py-3 px-4 bg-muted/30 border border-border rounded-xl text-xs font-semibold animate-pulse text-muted-foreground">
                  Syncing Event Clusters...
                </div>
              ) : (
                <div className="relative">
                  <select 
                    className="w-full bg-muted/50 border-2 border-border focus:border-primary focus:bg-background rounded-xl py-4 px-6 text-sm font-bold transition-all outline-none appearance-none cursor-pointer"
                    value={hackathonId}
                    onChange={(e) => setHackathonId(e.target.value)}
                    required
                  >
                    <option value="" disabled>-- Select Hackathon --</option>
                    {hackathonsList.map((h) => (
                      <option key={h.id} value={h.id} className="bg-background text-foreground font-semibold">
                        {h.name}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-muted-foreground">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                  </div>
                </div>
              )}
            </div>

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

            <Button 
              type="submit" 
              className="w-full py-4 rounded-xl shadow-xl shadow-primary/20 font-black uppercase tracking-widest"
              disabled={loading || hackathonsLoading}
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
                    <Badge variant={getBadgeVariant()}>{getStatusText()}</Badge>
                 </div>
                 
                 <div className="space-y-6 relative z-10">
                    <div>
                       <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Authenticated Record</p>
                       <h2 className="text-3xl font-black uppercase">{result.team_name}</h2>
                       <p className="text-muted-foreground font-bold text-xs uppercase tracking-tight">{result.hackathonName}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                       <div className="p-4 bg-background rounded-xl border border-border">
                          <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">Phase</p>
                          <p className="text-sm font-black">
                            {result.type === 'hackathon' ? '🏆 Hackathon (Build)' : '📂 Concept (PPT Pitch)'}
                          </p>
                       </div>
                       <div className="p-4 bg-background rounded-xl border border-border">
                          <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">Outcome</p>
                          <p className="text-sm font-black">
                            {result.type === 'hackathon' ? (
                              `Round ${result.round_status} of ${result.totalRounds}`
                            ) : (
                              result.status === 'shortlisted' ? 'Advanced to Hackathon' : 'Pending Review'
                            )}
                          </p>
                       </div>
                    </div>

                    {result.members && result.members.length > 0 && (
                      <div className="p-4 bg-background rounded-xl border border-border">
                        <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-2">Team Members</p>
                        <div className="flex flex-wrap gap-2">
                          {result.members.map((m, idx) => (
                            <span key={idx} className="bg-muted px-2.5 py-1 rounded-md text-xs font-bold text-foreground">
                              {m}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="pt-6 border-t border-border flex justify-between items-center">
                       <Button variant="outline" size="sm" onClick={() => navigate(`/project/${result.id}`)}>
                          View Full Manifest
                       </Button>
                       <p className="text-[9px] font-bold text-muted-foreground uppercase opacity-40">
                          Sync Time: {new Date().toLocaleTimeString()}
                       </p>
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
