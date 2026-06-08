import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase/client';
import api from '../../supabase/api';
import { motion } from 'framer-motion';
import { Card, Badge, Button } from '../ui';

const EventManagement = ({ hackathon }) => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ completion: 0, evaluatedCount: 0, pendingNames: [] });

  useEffect(() => {
    fetchTeams();
  }, [hackathon.id]);

  const fetchTeams = async () => {
    setLoading(true);
    const { data: teamList } = await supabase
      .from('teams')
      .select('*')
      .eq('hackathon_id', hackathon.id)
      .in('status', ['active', 'completed'])
      .order('id', { ascending: true });
    const activeTeams = teamList || [];
    let currentRoundScores = [];
    
    if (activeTeams.length > 0) {
      const teamIds = activeTeams.map(t => t.id);
      const { data: scores } = await supabase.from('scores').select('team_id, round').in('team_id', teamIds);
      
      currentRoundScores = (scores || []).filter(s => {
        const team = activeTeams.find(t => t.id === s.team_id);
        return team && String(s.round) === String(team.round_status || 1);
      });
    }

    const evaluatedIds = new Set(currentRoundScores.map(s => s.team_id));
    const pending = activeTeams.filter(t => !evaluatedIds.has(t.id));
    
    setStats({
      completion: activeTeams.length > 0 ? Math.round((evaluatedIds.size / activeTeams.length) * 100) : 0,
      evaluatedCount: evaluatedIds.size,
      pendingNames: pending.map(t => t.team_name)
    });

    setTeams(activeTeams);
    setLoading(false);
  };

  const handlePromote = async (team) => {
    const nextRound = parseInt(team.round_status || 1) + 1;
    if (nextRound > (hackathon.total_rounds || 3)) return;
    await api.advanceTeamRound(team.id, nextRound);
    fetchTeams();
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 !p-8 border-2 border-primary/10 bg-primary/[0.02]">
           <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
              <div>
                 <h3 className="text-2xl font-black uppercase tracking-tight">Round <span className="text-primary">Progress</span></h3>
                 <p className="text-xs text-muted-foreground font-medium mt-1">Live synchronization of judge evaluation stream.</p>
              </div>
              <div className="text-right">
                 <span className="text-4xl font-black text-primary">{stats.completion}%</span>
                 <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Completion</p>
              </div>
           </div>
           
           <div className="w-full h-4 bg-muted rounded-full overflow-hidden border border-border">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${stats.completion}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-primary shadow-[0_0_20px_rgba(var(--primary),0.5)]"
              />
           </div>

           <div className="flex justify-between mt-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              <span>Evaluated: {stats.evaluatedCount}</span>
              <span>Total Teams: {teams.length}</span>
           </div>
        </Card>

        <Card className="!p-8 border-2 border-border overflow-hidden">
           <h4 className="text-sm font-bold uppercase tracking-widest mb-6 border-b border-border pb-4">⏳ Pending Evaluators</h4>
           <div className="space-y-3 max-h-[120px] overflow-y-auto pr-2 custom-scrollbar">
              {stats.pendingNames.map((name, i) => (
                <div key={i} className="flex items-center gap-3">
                   <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" />
                   <p className="text-[10px] font-bold uppercase tracking-tight truncate">{name}</p>
                </div>
              ))}
              {stats.pendingNames.length === 0 && !loading && (
                <p className="text-[10px] text-muted-foreground font-medium italic">All projects evaluated for this round.</p>
              )}
           </div>
        </Card>
      </div>

      <Card className="!p-0 overflow-hidden border-2">
        <div className="px-8 py-6 border-b border-border bg-muted/30 flex justify-between items-center">
           <div>
              <h3 className="text-xl font-bold uppercase tracking-tight">Round Management</h3>
              <p className="text-xs text-muted-foreground font-medium mt-1">Control participant progression through evaluation stages.</p>
           </div>
           <Badge variant="primary" className="!px-6 py-2">{hackathon.total_rounds || 3} Total Rounds</Badge>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-muted/50 border-b border-border">
               <tr>
                  <th className="px-8 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Team Name</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-center">Status</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-center">Current Round</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-right">Action</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-border">
               {teams.map(team => (
                 <tr key={team.id} className="hover:bg-muted/30 transition-all">
                    <td className="px-8 py-6">
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl overflow-hidden border-2 border-primary/10 shadow-lg">
                            <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${team.team_name}&backgroundColor=b6e3f4,c0aede,d1d4f9`} alt="" className="w-full h-full bg-muted" />
                          </div>
                          <span className="text-lg font-black">{team.team_name}</span>
                       </div>
                    </td>
                    <td className="px-8 py-6 text-center"><Badge variant="completed">Active</Badge></td>
                    <td className="px-8 py-6 text-center">
                      <Badge variant="primary">
                        {parseInt(team.round_status || 1) === parseInt(hackathon.total_rounds || 3) ? 'Final Round' : `Round ${team.round_status || 1}`}
                      </Badge>
                    </td>
                    <td className="px-8 py-6 text-right">
                       <Button 
                         variant="secondary"
                         size="sm"
                         disabled={parseInt(team.round_status || 1) >= (hackathon.total_rounds || 3)}
                         onClick={() => handlePromote(team)}
                         className="text-[10px] font-bold uppercase tracking-widest"
                       >Promote</Button>
                    </td>
                 </tr>
               ))}
               {teams.length === 0 && !loading && (
                 <tr>
                    <td colSpan="4" className="px-8 py-12 text-center text-muted-foreground font-medium">No active teams found for this event.</td>
                 </tr>
               )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default EventManagement;
