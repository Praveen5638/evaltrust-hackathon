import React, { useState, useEffect } from 'react';
import { useNavigate, Routes, Route, Outlet, Navigate } from 'react-router-dom';
import { supabase } from '../../supabase/client';
import JudgeRegistration from './JudgeRegistration';
import CreateHackathon from './CreateHackathon';
import OrganizerHackathonDetail from './OrganizerHackathonDetail';
import { motion } from 'framer-motion';
import { Button, Card, Badge } from '../ui';

// ─── Per-hackathon stats fetcher ───────────────────────────────────────────
const useHackathonStats = (hackathonId) => {
  const [stats, setStats] = useState({ teams: 0, evaluated: 0, shortlisted: 0 });
  useEffect(() => {
    if (!hackathonId) return;
    const fetch = async () => {
      const { data: subs } = await supabase
        .from('ppt_submissions').select('id, status').eq('hackathon_id', hackathonId);
      const ids = (subs || []).map(s => s.id);
      let evaluated = 0;
      if (ids.length > 0) {
        const { data: scores } = await supabase.from('scores').select('team_id').in('team_id', ids);
        evaluated = new Set(scores?.map(s => s.id) || []).size; // Changed to match scores uniqueness
      }
      setStats({
        teams: subs?.length || 0,
        evaluated,
        shortlisted: subs?.filter(s => s.status === 'shortlisted').length || 0,
      });
    };
    fetch();
  }, [hackathonId]);
  return stats;
};

const HackathonCard = ({ h }) => {
  const navigate = useNavigate();
  const stats = useHackathonStats(h.id);
  return (
    <motion.div whileHover={{ y: -8 }} onClick={() => navigate(`/organizer/hackathon/${h.id}`)}>
      <Card className="group cursor-pointer h-full flex flex-col border-2 hover:border-primary/20">
        <div className="flex justify-between items-start mb-8">
          <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-3xl group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">🏆</div>
          <Badge variant={h.status === 'active' ? 'completed' : 'primary'}>{h.status || 'Active'}</Badge>
        </div>
        <h3 className="text-2xl font-black mb-3 group-hover:text-primary transition-colors">{h.name}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-8">{h.description || 'No description provided.'}</p>
        <div className="grid grid-cols-3 gap-3 mb-8 mt-auto">
          {[
            { label: 'Teams', value: stats.teams },
            { label: 'Scored', value: stats.evaluated },
            { label: 'Final', value: stats.shortlisted }
          ].map(s => (
            <div key={s.label} className="bg-muted/50 rounded-lg p-2 text-center border border-border group-hover:border-primary/10 transition-all">
              <p className="text-md font-black text-foreground leading-none mb-1">{s.value}</p>
              <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
        <div className="pt-4 border-t border-border flex justify-between items-center text-[10px] font-bold uppercase tracking-widest gap-4">
          <span className="text-muted-foreground opacity-60">{new Date(h.created_at).toLocaleDateString()}</span>
          <div className="flex items-center gap-3">
             <Button 
               variant="ghost" 
               size="sm" 
               onClick={(e) => {
                 e.stopPropagation();
                 if (window.confirm("Are you sure you want to delete this hackathon? This will permanently remove all scores, teams, and submissions.")) {
                   import('../../supabase/api').then(m => m.deleteHackathon(h.id).then(() => window.location.reload()));
                 }
               }}
               className="h-8 w-8 !p-0 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-all"
             >🗑️</Button>
             <span className="text-primary group-hover:translate-x-2 transition-transform">Manage Event →</span>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

const OrganizerHome = () => {
  const navigate = useNavigate();
  const [hackathons, setHackathons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [globalStats, setGlobalStats] = useState({ events: 0, teams: 0, judges: 0 });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          console.warn('No session found in OrganizerDashboard');
          setLoading(false);
          return;
        }

        const uid = session.user.id;
        const { data: hackathonsData, error } = await supabase
          .from('hackathons')
          .select('*')
          .eq('organizer_id', uid)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setHackathons(hackathonsData || []);
        
        const hackathonIds = (hackathonsData || []).map(h => h.id);
        const eCount = hackathonsData?.length || 0;
        
        let tCount = 0;
        if (hackathonIds.length > 0) {
          const { count } = await supabase
            .from('ppt_submissions')
            .select('*', { count: 'exact', head: true })
            .in('hackathon_id', hackathonIds);
          tCount = count || 0;
        }

        const { count: jCount } = await supabase
          .from('judges')
          .select('*', { count: 'exact', head: true })
          .eq('organizer_id', uid);
        
        setGlobalStats({ events: eCount, teams: tCount, judges: jCount || 0 });
      } catch (err) {
        console.error('Error fetching dashboard data:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) fetchData();
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-border">
        <div className="space-y-1">
          <Badge variant="primary" className="mb-1 text-[10px]">Admin Control Panel</Badge>
          <h2 className="text-2xl font-black tracking-tight uppercase">
            Organizer <span className="text-primary">Portal</span>
          </h2>
          <p className="text-muted-foreground font-medium text-[11px] md:text-xs">Real-time oversight of evaluation protocols and event clusters.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
           <Button variant="secondary" onClick={() => navigate('/organizer/judges')} className="w-full sm:w-auto py-2 px-4 rounded-xl text-xs">Manage Judges</Button>
           <Button onClick={() => navigate('/organizer/create')} className="w-full sm:w-auto py-2 px-4 rounded-xl shadow-xl shadow-primary/20 text-xs">+ Create Event</Button>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { label: 'Active Clusters', value: globalStats.events, icon: '🛰️', color: 'text-primary' },
          { label: 'Total Projects', value: globalStats.teams, icon: '👥', color: 'text-blue-500' },
          { label: 'Active Judges', value: globalStats.judges, icon: '⚖️', color: 'text-purple-500' },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className="flex items-center gap-4 !p-4 border-2 hover:border-primary/10 transition-all group">
              <div className="w-12 h-12 bg-muted border border-border rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">{s.icon}</div>
              <div><p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest leading-none mb-1">{s.label}</p><p className={`text-2xl font-black ${s.color}`}>{s.value}</p></div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black uppercase tracking-tight">Your <span className="text-primary">Hackathons</span></h2>
        </div>
        {loading ? (
          <div className="py-32 text-center flex flex-col items-center gap-6"><div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div><p className="text-sm font-bold text-muted-foreground uppercase tracking-widest animate-pulse">Syncing Administrator Data...</p></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {hackathons.map((h) => <HackathonCard key={h.id} h={h} />)}
            {hackathons.length === 0 && (
              <Card className="col-span-full py-24 text-center border-dashed border-2 bg-muted/20"><div className="text-6xl opacity-10 mb-6">🎯</div><h3 className="text-2xl font-black uppercase mb-2">No Clusters Detected</h3><Button onClick={() => navigate('/organizer/create')} size="lg" className="rounded-2xl px-10">Deploy New Event</Button></Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const OrganizerDashboard = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="dashboard" replace />} />
      <Route path="dashboard" element={<OrganizerHome />} />
      <Route path="hackathons" element={<OrganizerHome />} /> {/* Map to home for now */}
      <Route path="hackathon/:id/*" element={<OrganizerHackathonDetail />} />
      <Route path="create" element={<div className="space-y-12 animate-fade-in"><div><Button variant="outline" size="sm" onClick={() => window.history.back()}>← Back</Button></div><CreateHackathon /></div>} />
      <Route path="judges" element={<div className="space-y-12 animate-fade-in"><div><Button variant="outline" size="sm" onClick={() => window.history.back()}>← Back</Button></div><JudgeRegistration /></div>} />
      <Route path="*" element={<Navigate to="dashboard" replace />} />
    </Routes>
  );
};

export default OrganizerDashboard;