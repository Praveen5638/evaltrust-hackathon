import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase/client';
import api from '../supabase/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Card, Badge } from '../components/ui';

const Transparency = () => {
  const { id: hackathonId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [hackathon, setHackathon] = useState(null);
  const [results, setResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchData();
  }, [hackathonId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch hackathon info
      const { data: hData } = await supabase
        .from('hackathons')
        .select('*')
        .eq('id', hackathonId)
        .single();
      setHackathon(hData);

      // Fetch detailed results (we'll reuse calculateFinalResults but maybe need more detail)
      const { data: scores } = await supabase
        .from('scores')
        .select(`
          *,
          teams!inner (
            team_name,
            members
          )
        `)
        .eq('teams.hackathon_id', hackathonId);

      // Group by team
      const teamMap = {};
      (scores || []).forEach(s => {
        const tid = s.team_id;
        if (!teamMap[tid]) {
          teamMap[tid] = {
            id: tid,
            name: s.teams.team_name,
            members: s.teams.members,
            scores: [],
            averages: {
              innovation: 0,
              technical: 0,
              feasibility: 0,
              impact: 0,
              presentation: 0,
              total: 0
            }
          };
        }
        teamMap[tid].scores.push(s);
      });

      // Calculate averages per team
      const finalResults = Object.values(teamMap).map(team => {
        const count = team.scores.length;
        const sums = team.scores.reduce((acc, s) => ({
          innovation: acc.innovation + s.innovation,
          technical: acc.technical + s.technical,
          feasibility: acc.feasibility + s.feasibility,
          impact: acc.impact + s.impact,
          presentation: acc.presentation + s.presentation,
          total: acc.total + s.total_score
        }), { innovation: 0, technical: 0, feasibility: 0, impact: 0, presentation: 0, total: 0 });

        return {
          ...team,
          averages: {
            innovation: (sums.innovation / count).toFixed(1),
            technical: (sums.technical / count).toFixed(1),
            feasibility: (sums.feasibility / count).toFixed(1),
            impact: (sums.impact / count).toFixed(1),
            presentation: (sums.presentation / count).toFixed(1),
            total: (sums.total / count).toFixed(2)
          }
        };
      }).sort((a, b) => b.averages.total - a.averages.total);

      setResults(finalResults);
    } catch (err) {
      console.error('Transparency fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredResults = results.filter(r => 
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (Array.isArray(r.members) ? r.members.join(' ') : r.members).toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest animate-pulse">Syncing Transparency Registry...</p>
      </div>
    );
  }

  return (
    <div className="space-y-16 animate-fade-in pb-20">
      <header className="text-center space-y-6 max-w-4xl mx-auto pt-10">
        <Badge variant="primary" className="mx-auto">Public Audit Ledger</Badge>
        <div className="space-y-2">
          <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-none uppercase">
            {hackathon?.name} <span className="text-primary">Protocol</span>
          </h1>
          <p className="text-muted-foreground font-medium uppercase tracking-[0.3em] text-[10px]">Verification ID: {hackathonId?.substring(0,12)}</p>
        </div>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto font-medium leading-relaxed">
          In our commitment to absolute fairness, every score and consensus decision is cryptographically logged and made accessible for public audit.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <div className="relative w-full max-w-md group">
             <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">🔍</div>
             <input 
               type="text" 
               placeholder="Search team or manifest identifier..." 
               className="w-full bg-muted/50 border-2 border-border focus:border-primary focus:bg-background rounded-2xl py-4 pl-12 pr-6 text-sm font-bold transition-all outline-none"
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
             />
          </div>
          <Button variant="outline" className="rounded-2xl py-4 px-8" onClick={() => navigate(-1)}>Return</Button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto space-y-8">
        {filteredResults.map((team, i) => (
          <motion.div 
            key={team.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="!p-0 overflow-hidden border-2 group hover:border-primary/20 transition-all shadow-xl shadow-primary/5">
              <div className="flex flex-col lg:flex-row">
                {/* Team Info Sidebar */}
                <div className="lg:w-80 p-8 bg-muted/30 border-b lg:border-b-0 lg:border-r border-border flex flex-col justify-between">
                  <div className="space-y-4">
                    <Badge variant="primary" className="text-[10px]">RANK #{i+1}</Badge>
                    <h3 className="text-2xl font-black uppercase tracking-tight group-hover:text-primary transition-colors leading-tight">{team.name}</h3>
                    <div className="flex flex-wrap gap-1">
                       {(Array.isArray(team.members) ? team.members : (team.members || '').split(',')).map((m, idx) => (
                         <span key={idx} className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest bg-muted px-2 py-0.5 rounded border border-border">{m.trim()}</span>
                       ))}
                    </div>
                  </div>
                  <div className="mt-8 pt-6 border-t border-border">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Consensus Score</p>
                    <p className="text-5xl font-black text-primary tracking-tighter">{team.averages.total}</p>
                  </div>
                </div>

                {/* Metrics Grid */}
                <div className="flex-1 p-8">
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                    {[
                      { label: 'Innovation', val: team.averages.innovation, color: 'text-blue-500', icon: '💡' },
                      { label: 'Technical', val: team.averages.technical, color: 'text-purple-500', icon: '💻' },
                      { label: 'Feasibility', val: team.averages.feasibility, color: 'text-green-500', icon: '⚙️' },
                      { label: 'Impact', val: team.averages.impact, color: 'text-orange-500', icon: '🌍' },
                      { label: 'Presentation', val: team.averages.presentation, color: 'text-pink-500', icon: '📢' },
                    ].map(m => (
                      <div key={m.label} className="space-y-3 p-4 rounded-2xl bg-muted/20 border border-border hover:border-primary/10 transition-all">
                        <div className="flex justify-between items-center">
                          <span className="text-lg">{m.icon}</span>
                          <span className={`text-xl font-black ${m.color}`}>{m.val}</span>
                        </div>
                        <p className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground">{m.label}</p>
                        <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                           <motion.div 
                             initial={{ width: 0 }}
                             whileInView={{ width: `${(m.val / 10) * 100}%` }}
                             className={`h-full ${m.color.replace('text-', 'bg-')}`}
                           />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Judge Comments Audit */}
                  <div className="mt-10 space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                       <div className="w-1 h-4 bg-primary rounded-full"></div>
                       <p className="text-[10px] font-black uppercase tracking-widest">Arbiter Logs</p>
                    </div>
                    <div className="grid gap-3">
                       {team.scores.map((s, idx) => (
                         <div key={idx} className="p-4 bg-background border border-border rounded-xl text-xs font-medium text-muted-foreground leading-relaxed flex gap-4">
                            <span className="opacity-20 font-black">0{idx+1}</span>
                            <p>"{s.comments || 'No comment logged by arbiter.'}"</p>
                         </div>
                       ))}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}

        {filteredResults.length === 0 && (
          <div className="py-32 text-center">
             <div className="text-6xl opacity-10 mb-6">🏜️</div>
             <p className="text-lg font-bold text-muted-foreground uppercase tracking-widest">No matching manifests found.</p>
          </div>
        )}
      </div>

      <footer className="text-center pt-20 border-t border-border">
         <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.8em]">End of Transcript // Verified by EvalTrust Engine</p>
      </footer>
    </div>
  );
};

export default Transparency;
