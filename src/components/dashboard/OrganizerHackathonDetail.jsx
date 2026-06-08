import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { supabase } from '../../supabase/client';
import PPTRanking from './PPTRanking';
import TeamQRList from './TeamQRList';
import api from '../../supabase/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Card, Badge } from '../ui';
import EventManagement from './EventManagement'; // I'll extract this in next step

const JudgeActivity = ({ hackathonId }) => {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      // 1. Get all teams for this hackathon
      const { data: subs } = await supabase.from('ppt_submissions').select('id').eq('hackathon_id', hackathonId);
      const teamIds = new Set((subs || []).map(s => s.id));
      
      // 2. Get all scores for these teams
      const { data: scores } = await supabase
        .from('scores')
        .select('judge_id, team_id')
        .in('team_id', Array.from(teamIds));

      const judgeMap = {};
      (scores || []).forEach(s => {
        if (!judgeMap[s.judge_id]) judgeMap[s.judge_id] = new Set();
        judgeMap[s.judge_id].add(s.team_id);
      });

      setStats(Object.entries(judgeMap).map(([id, teams]) => ({
        id,
        count: teams.size,
        total: teamIds.size
      })));
      setLoading(false);
    };
    if (hackathonId) fetch();
  }, [hackathonId]);

  return (
    <Card className="!p-0 overflow-hidden border-2">
      <div className="px-8 py-6 border-b border-border bg-muted/30">
        <h2 className="text-xl font-bold uppercase tracking-tight">Judge Engagement</h2>
      </div>
      <div className="divide-y divide-border">
        {stats.map((j) => (
          <div key={j.id} className="px-8 py-6 flex items-center justify-between gap-6 hover:bg-muted/30 transition-all">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center text-lg">👤</div>
              <div>
                <p className="text-sm font-bold uppercase tracking-widest">Judge #{j.id.substring(0,6)}</p>
                <p className="text-[10px] text-muted-foreground font-medium">Assigned Stream Evaluation</p>
              </div>
            </div>
            <div className="text-right">
               <p className="text-lg font-black leading-none mb-1">{j.count}/{j.total}</p>
               <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Projects Evaluated</p>
            </div>
          </div>
        ))}
        {stats.length === 0 && !loading && (
          <div className="py-20 text-center text-muted-foreground uppercase font-bold tracking-widest opacity-30">No active judging detected.</div>
        )}
      </div>
    </Card>
  );
};

const OrganizerHackathonDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [hackathon, setHackathon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [teams, setTeams] = useState([]);
  const [isFullyEvaluated, setIsFullyEvaluated] = useState(false);
  const [eventSettings, setEventSettings] = useState({ is_final_locked: false, is_result_revealed: false });

  // Get current sub-tab from URL or default to submissions
  const currentTab = location.pathname.split('/').pop() || 'submissions';

  useEffect(() => {
    fetchHackathon();
    fetchTeams();
    fetchEventSettings();
    checkFullEvaluation();
  }, [id]);

  const fetchHackathon = async () => {
    const { data } = await supabase.from('hackathons').select('*').eq('id', id).single();
    setHackathon(data);
    setLoading(false);
  };

  const checkFullEvaluation = async () => {
    const complete = await api.isEvaluationComplete(id);
    setIsFullyEvaluated(complete);
  };

  const fetchEventSettings = async () => {
    const locked = await api.checkGlobalLock(id);
    const revealed = await api.checkResultReveal(id);
    setEventSettings({ is_final_locked: locked, is_result_revealed: revealed });
  };

  const fetchTeams = async () => {
    const { data } = await supabase.from('ppt_submissions').select('*').eq('hackathon_id', id).order('created_at', { ascending: false });
    setTeams(data || []);
  };

  const handleReveal = async () => {
    if (!window.confirm("CRITICAL ACTION: Are you sure you want to reveal the final results to the public?")) return;
    try {
      await api.setResultReveal(id, true);
      setEventSettings(prev => ({ ...prev, is_result_revealed: true }));
      window.open(`/results/${id}`, '_blank');
    } catch (err) { alert(err.message); }
  };

  const handleLock = async () => {
    await api.setGlobalLock(id, true);
    setEventSettings(prev => ({ ...prev, is_final_locked: true }));
    alert('Evaluation phase locked.');
  };

  if (loading || !hackathon) return <div className="py-20 text-center animate-pulse">Loading Hackathon Protocol...</div>;

  const tabs = [
    { id: 'submissions', label: '📥 Submissions' },
    { id: 'judges', label: '⚖️ Judges' },
    { id: 'shortlist', label: '⭐ Shortlist' },
    { id: 'phase', label: '🚀 Hackathon' },
    { id: 'qr', label: '🎫 QR Manifests' },
    { id: 'results', label: '🏆 Results' },
    { id: 'settings', label: '⚙️ Settings' }
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <header className="flex flex-col lg:flex-row items-center justify-between gap-8 pb-8 border-b border-border">
        <div className="flex items-center gap-6">
          <Button variant="outline" size="sm" onClick={() => navigate('/organizer/dashboard')} className="rounded-xl">← Back</Button>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Badge variant="primary" className="text-[8px]">ID: {hackathon.id.substring(0,8)}</Badge>
            <h2 className="text-2xl font-black tracking-tight">{hackathon.name}</h2>
            </div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Management Terminal</p>
          </div>
        </div>
        
        <nav className="flex p-1 bg-muted rounded-2xl border border-border overflow-x-auto w-full lg:w-auto">
          {tabs.map(t => (
            <Link 
              key={t.id} 
              to={`/organizer/hackathon/${id}/${t.id}`}
              className={`px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap ${
                currentTab === t.id ? 'bg-background text-primary shadow-sm border border-border' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t.label}
            </Link>
          ))}
        </nav>
      </header>

      <div className="min-h-[500px]">
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="submissions" element={
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <Card className="!p-0 overflow-hidden border-2">
                  <div className="px-8 py-6 border-b border-border flex justify-between items-center bg-muted/30">
                    <h2 className="text-xl font-bold uppercase tracking-tight">Project Submissions</h2>
                    <Badge variant="primary">{teams.length} Projects</Badge>
                  </div>
                  <div className="divide-y divide-border">
                    {teams.map((team, i) => (
                      <div key={team.id} className="px-8 py-6 flex flex-col md:flex-row items-start md:items-center gap-6 hover:bg-muted/30 transition-all group">
                        <span className="hidden md:block text-2xl font-black opacity-10 w-10 text-right">#{i+1}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <p className="text-lg font-bold group-hover:text-primary transition-colors truncate">{team.team_name}</p>
                            <Badge variant={team.status === 'shortlisted' ? 'completed' : 'primary'} className="text-[8px]">{team.status}</Badge>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {(Array.isArray(team.members) ? team.members : (team.members || '').split(',')).map((member, idx) => (
                              <span key={idx} className="bg-muted px-2 py-0.5 rounded text-[9px] font-bold text-muted-foreground uppercase tracking-tight border border-border">
                                {member.trim()}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center gap-4 w-full md:w-auto justify-between border-t md:border-t-0 pt-4 md:pt-0 border-border">
                          <div className="md:text-right">
                             <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest opacity-40">Submitted On</p>
                             <p className="text-[10px] font-black">{new Date(team.created_at).toLocaleDateString()}</p>
                          </div>
                          <Button variant="secondary" size="sm" onClick={() => window.open(team.ppt_url, '_blank')} className="text-[10px] font-black uppercase tracking-widest px-6">View Deck</Button>
                        </div>
                      </div>
                    ))}
                    {teams.length === 0 && <div className="py-20 text-center text-muted-foreground uppercase font-bold tracking-widest opacity-30">No projects submitted yet.</div>}
                  </div>
                </Card>
              </motion.div>
            } />
            <Route path="judges" element={<JudgeActivity hackathonId={id} />} />
            <Route path="shortlist" element={<PPTRanking hackathonId={id} onPromote={fetchTeams} />} />
            <Route path="phase" element={<EventManagement hackathon={hackathon} />} />
            <Route path="qr" element={<TeamQRList hackathonId={id} />} />
            <Route path="results" element={
              <Card className="!p-0 overflow-hidden border-2">
                 <div className="px-8 py-6 border-b border-border bg-muted/30 flex justify-between items-center">
                    <h2 className="text-xl font-bold uppercase tracking-tight">Final Standings</h2>
                    <Badge variant={eventSettings.is_result_revealed ? 'completed' : 'primary'}>{eventSettings.is_result_revealed ? 'Live' : 'Private'}</Badge>
                 </div>
                 <div className="p-12 text-center space-y-6">
                    <div className="text-6xl mb-4">{eventSettings.is_final_locked ? '🛡️' : '🏆'}</div>
                    <h3 className="text-2xl font-black uppercase tracking-tight">{eventSettings.is_final_locked ? 'Evaluation Archive Locked' : 'Ready for Finalization'}</h3>
                    <p className="text-muted-foreground max-w-md mx-auto">{eventSettings.is_final_locked ? 'All scores have been cryptographically sealed.' : 'Once all teams have completed all rounds, you must apply the Final Lock.'}</p>
                    <div className="flex flex-col items-center gap-4 pt-6">
                       {!eventSettings.is_final_locked ? (
                         <Button onClick={handleLock} disabled={!isFullyEvaluated} className="px-12 py-6 rounded-2xl shadow-xl shadow-primary/20">{isFullyEvaluated ? '🔒 Apply Final Lock' : 'Final Lock (Pending Evaluations)'}</Button>
                       ) : (
                         <div className="flex flex-col items-center gap-6">
                           <div className="flex gap-4">
                              <Button onClick={() => window.open(`/results/${id}`, '_blank')} variant="outline" className="px-8">View Report</Button>
                              <Button onClick={handleReveal} disabled={eventSettings.is_result_revealed} className="px-10 shadow-xl shadow-primary/20">{eventSettings.is_result_revealed ? 'Results are Public' : '👁️ Reveal Results'}</Button>
                           </div>
                           <Button 
                              variant="ghost" 
                              onClick={async () => {
                                if(window.confirm("Unlock evaluation? Judges will be able to submit scores again.")) {
                                  await api.unlockHackathon(id);
                                  fetchEventSettings();
                                }
                              }}
                              className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest hover:text-primary"
                            >🔓 Emergency Unlock</Button>
                           <div className="pt-8 flex flex-col items-center gap-4 border-t border-border w-full max-w-md mx-auto">
                              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Public Access Links</p>
                              <div className="flex gap-3">
                                 <Button variant="secondary" size="sm" onClick={() => window.open(`/gallery/${id}`, '_blank')} className="text-[9px] font-black uppercase tracking-widest px-4">🖼️ Public Gallery</Button>
                                 <Button variant="secondary" size="sm" onClick={() => window.open(`/status`, '_blank')} className="text-[9px] font-black uppercase tracking-widest px-4">🔍 Status Lookup</Button>
                              </div>
                           </div>
                         </div>
                       )}
                    </div>
                 </div>
               </Card>
            } />
            <Route path="settings" element={
              <Card className="!p-10 space-y-10 border-2 max-w-2xl mx-auto">
                <div className="space-y-4">
                  <h2 className="text-3xl font-black uppercase tracking-tight">Management <span className="text-primary">Controls</span></h2>
                  <p className="text-muted-foreground font-medium">Core protocol settings for {hackathon.name}.</p>
                </div>
                <div className="space-y-6">
                  <div className="p-6 bg-muted/30 rounded-2xl border border-border flex items-center justify-between gap-6">
                     <div><p className="text-sm font-bold uppercase tracking-widest mb-1">PPT Submissions Lock</p><p className="text-[10px] text-muted-foreground">Stop new teams from joining or uploading manifest files.</p></div>
                     <Button 
                       variant={eventSettings.is_ppt_locked ? 'completed' : 'outline'} 
                       size="sm" 
                       onClick={async () => {
                         await api.setPPTLock(id, !eventSettings.is_ppt_locked);
                         setEventSettings(prev => ({ ...prev, is_ppt_locked: !prev.is_ppt_locked }));
                       }}
                     >
                       {eventSettings.is_ppt_locked ? 'Unlock PPT' : 'Lock PPT'}
                     </Button>
                  </div>

                  <div className="p-6 bg-muted/30 rounded-2xl border border-border flex items-center justify-between gap-6">
                     <div><p className="text-sm font-bold uppercase tracking-widest mb-1">Evaluation Lock</p><p className="text-[10px] text-muted-foreground">Prevent judges from submitting any further scores.</p></div>
                     <Button 
                       variant={eventSettings.is_final_locked ? 'completed' : 'outline'} 
                       size="sm" 
                       onClick={async () => {
                         await api.setGlobalLock(id, !eventSettings.is_final_locked);
                         setEventSettings(prev => ({ ...prev, is_final_locked: !prev.is_final_locked }));
                       }}
                     >
                       {eventSettings.is_final_locked ? 'Unlock Phase' : 'Lock Phase'}
                     </Button>
                  </div>

                  <div className="p-6 bg-muted/30 rounded-2xl border border-border space-y-4">
                     <div className="flex items-center justify-between">
                        <div><p className="text-sm font-bold uppercase tracking-widest mb-1">Total Event Rounds</p><p className="text-[10px] text-muted-foreground">Adjust the number of evaluation stages dynamically.</p></div>
                        <div className="flex items-center gap-2">
                           {[1, 2, 3, 4, 5].map(r => (
                             <button 
                               key={r} 
                               onClick={async () => {
                                 const { error } = await supabase.from('hackathons').update({ total_rounds: r }).eq('id', id);
                                 if (!error) setHackathon(prev => ({ ...prev, total_rounds: r }));
                               }}
                               className={`w-8 h-8 rounded-lg text-[10px] font-black transition-all ${hackathon.total_rounds === r ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' : 'bg-muted hover:bg-primary/10'}`}
                             >
                               {r}
                             </button>
                           ))}
                        </div>
                     </div>
                  </div>

                  <div className="p-6 bg-muted/30 rounded-2xl border border-border flex items-center justify-between gap-6">
                     <div>
                       <p className="text-sm font-bold uppercase tracking-widest mb-1">Hackathon Status</p>
                       <p className="text-[10px] text-muted-foreground">Active allows PPT submissions. Archived hides the event from the registration list.</p>
                     </div>
                     <Button 
                       variant={hackathon.status === 'active' ? 'completed' : 'outline'} 
                       size="sm" 
                       onClick={async () => {
                         const nextStatus = hackathon.status === 'active' ? 'archived' : 'active';
                         const { error } = await supabase.from('hackathons').update({ status: nextStatus }).eq('id', id);
                         if (!error) {
                           setHackathon(prev => ({ ...prev, status: nextStatus }));
                         } else {
                           alert('Failed to update status: ' + error.message);
                         }
                       }}
                     >
                       {hackathon.status === 'active' ? 'Active' : 'Archived'}
                     </Button>
                  </div>

                  <div className="p-6 bg-muted/30 rounded-2xl border border-border flex items-center justify-between gap-6">
                     <div><p className="text-sm font-bold uppercase tracking-widest mb-1">Delete Cluster</p><p className="text-[10px] text-muted-foreground text-destructive">Irreversibly remove all event data and scores.</p></div>
                     <Button 
                       variant="failed" 
                       size="sm"
                       onClick={async () => {
                         if (window.confirm("CRITICAL WARNING: Are you sure you want to permanently delete this hackathon? This will permanently remove all scores, judges, teams, and submissions.")) {
                           try {
                             await api.deleteHackathon(id);
                             navigate('/organizer/dashboard');
                           } catch (err) {
                             alert('Failed to delete hackathon: ' + err.message);
                           }
                         }
                       }}
                     >
                       Terminate
                     </Button>
                  </div>
                </div>
              </Card>
            } />
            <Route path="*" element={<Navigate to="submissions" replace />} />
          </Routes>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default OrganizerHackathonDetail;
