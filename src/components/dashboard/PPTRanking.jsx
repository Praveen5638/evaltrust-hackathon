import React, { useState, useEffect } from 'react';
import { getLeaderboard, shortlistTeams, promoteTeams, setGlobalLock, checkGlobalLock } from '../../supabase/api';
import { Button, Card, Badge } from '../ui';
import { motion, AnimatePresence } from 'framer-motion';

const PPTRanking = ({ hackathonId = null }) => {
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [topN, setTopN] = useState(10);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [shortlisting, setShortlisting] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [promoting, setPromoting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchRanking();
    checkLock();
  }, [hackathonId]);

  const checkLock = async () => {
    if (!hackathonId) return;
    const locked = await checkGlobalLock(hackathonId);
    setIsLocked(locked);
  };

  const fetchRanking = async () => {
    try {
      setLoading(true);
      const data = await getLeaderboard(hackathonId);
      setRanking(data);
      
      const initialSelection = new Set(data.slice(0, topN).map(t => t.id));
      setSelectedIds(initialSelection);
    } catch (err) {
      console.error('Error fetching ranking:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTopNChange = (n) => {
    if (isLocked) return;
    const val = parseInt(n) || 0;
    setTopN(val);
    const newSelection = new Set(ranking.slice(0, val).map(t => t.id));
    setSelectedIds(newSelection);
  };

  const toggleSelection = (id) => {
    if (isLocked) return;
    const newSelection = new Set(selectedIds);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedIds(newSelection);
  };

  const handleConfirmShortlist = async () => {
    if (selectedIds.size === 0 || isLocked) return;
    try {
      setShortlisting(true);
      await shortlistTeams(Array.from(selectedIds));
      setSuccessMsg('Teams shortlisted successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error('Shortlisting failed:', err);
    } finally {
      setShortlisting(false);
    }
  };

  const handleLockAndPromote = async () => {
    if (selectedIds.size === 0 || isLocked) return;
    
    if (!window.confirm("Confirm promotion? This will lock the selection and advance teams to the next phase.")) return;

    try {
      setPromoting(true);
      await shortlistTeams(Array.from(selectedIds));
      await promoteTeams(Array.from(selectedIds));
      await setGlobalLock(hackathonId, true);
      setIsLocked(true);
      setSuccessMsg('Teams promoted successfully! 🚀');
    } catch (err) {
      console.error('Promotion failed:', err);
    } finally {
      setPromoting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-6 no-print">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest animate-pulse">Calculating Standings...</p>
      </div>
    );
  }

  const pendingTeams = ranking.filter(t => t.count === 0);
  const canPromote = ranking.length > 0 && pendingTeams.length === 0;

  return (
    <>
      <div className="space-y-12 animate-fade-in no-print">
        {/* Pending Warning */}
        {!isLocked && pendingTeams.length > 0 && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="overflow-hidden">
            <Card className="!p-6 border-yellow-500/20 bg-yellow-500/5 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                 <div className="w-12 h-12 bg-yellow-500/10 rounded-2xl flex items-center justify-center text-2xl shadow-lg shadow-yellow-500/10">⚠️</div>
                 <div>
                    <h4 className="text-sm font-bold uppercase tracking-tight text-yellow-600">Screening Incomplete</h4>
                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mt-1">{pendingTeams.length} Teams are still awaiting judge vetting.</p>
                 </div>
              </div>
              <div className="flex flex-wrap gap-2 justify-center">
                 {pendingTeams.slice(0, 5).map(t => (
                   <Badge key={t.id} variant="secondary" className="bg-yellow-500/10 text-yellow-700 text-[8px] py-1">{t.name}</Badge>
                 ))}
                 {pendingTeams.length > 5 && <Badge variant="secondary" className="opacity-50 text-[8px]">+{pendingTeams.length - 5} more</Badge>}
              </div>
            </Card>
          </motion.div>
        )}

        {/* Control Bar */}
        <Card className={`!p-8 border-2 transition-all duration-500 ${isLocked ? 'border-primary/20 bg-primary/5' : ''}`}>
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-6">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-xl transition-all ${isLocked ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary'}`}>
                {isLocked ? '🔒' : '🎯'}
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-bold uppercase tracking-tight">{isLocked ? 'Selection Finalized' : 'Shortlist Protocol'}</h3>
                <p className="text-xs text-muted-foreground font-medium">{isLocked ? 'The standings are locked and participants promoted.' : 'Select the top projects to advance to the next round.'}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2 bg-muted pr-1 pl-4 py-1 rounded-xl border border-border">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Select Top</span>
                <input 
                  type="number" 
                  disabled={isLocked}
                  value={topN}
                  onChange={(e) => setTopN(e.target.value)}
                  onBlur={(e) => handleTopNChange(e.target.value)}
                  className="w-12 bg-transparent text-center font-bold text-foreground focus:outline-none"
                />
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleTopNChange(topN)}
                  disabled={isLocked}
                  className="h-8 px-3 rounded-lg text-[8px] font-black uppercase tracking-widest hover:bg-primary/10 hover:text-primary transition-all"
                >
                  Sync ⚡
                </Button>
              </div>

              <AnimatePresence mode="wait">
                {!isLocked ? (
                  <div className="flex gap-3">
                    <Button variant="secondary" size="sm" onClick={handleConfirmShortlist} disabled={shortlisting || promoting || selectedIds.size === 0}>
                      {shortlisting ? 'Saving...' : 'Save Draft'}
                    </Button>
                    <Button size="sm" onClick={handleLockAndPromote} disabled={promoting || selectedIds.size === 0 || !canPromote} className={!canPromote ? "opacity-50 cursor-not-allowed" : ""}>
                      {promoting ? 'Promoting...' : 'Lock & Promote'}
                    </Button>
                  </div>
                ) : (
                  <Badge variant="completed" className="!px-6 !py-2">Promotion Complete</Badge>
                )}
              </AnimatePresence>
            </div>
          </div>
          
          {successMsg && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 p-3 bg-primary text-primary-foreground text-center text-[10px] font-bold uppercase tracking-widest rounded-lg">
              {successMsg}
            </motion.div>
          )}
        </Card>

        {/* Table */}
        <Card className="!p-0 overflow-hidden border-2">
          <div className="px-8 py-6 border-b border-border bg-muted/30 flex justify-between items-center">
            <h3 className="text-lg font-bold uppercase tracking-tight">Leaderboard Registry</h3>
            <div className="flex items-center gap-3">
              {ranking.length > 0 && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => window.print()}
                  className="text-[10px] font-black uppercase tracking-widest px-6"
                >
                  📥 Export Screening Audit (PDF)
                </Button>
              )}
              {!isLocked && (
                <Button variant="ghost" size="sm" onClick={fetchRanking}>Refresh Data 🔄</Button>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-muted/50 border-b border-border">
                 <tr>
                    <th className="px-8 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-center w-24">Vetting</th>
                    <th className="px-8 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest w-24">Rank</th>
                    <th className="px-8 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Team Identifier</th>
                    <th className="px-8 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-center">Judges</th>
                    <th className="px-8 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-right">Avg Score</th>
                    <th className="px-8 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-right">Status</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-border">
                 {ranking.map((team, index) => (
                   <tr key={team.id} className={`transition-all ${selectedIds.has(team.id) ? 'bg-primary/[0.03]' : 'hover:bg-muted/30'}`}>
                      <td className="px-8 py-6 text-center">
                         <input 
                           type="checkbox"
                           disabled={isLocked}
                           checked={selectedIds.has(team.id)}
                           onChange={() => toggleSelection(team.id)}
                           className="w-5 h-5 rounded border-border text-primary focus:ring-primary"
                         />
                      </td>
                      <td className="px-8 py-6">
                         <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs ${
                           index === 0 ? 'bg-yellow-500/10 text-yellow-600' :
                           index === 1 ? 'bg-slate-400/10 text-slate-600' :
                           index === 2 ? 'bg-orange-400/10 text-orange-600' :
                           'bg-muted text-muted-foreground'
                         }`}>
                           #{index + 1}
                         </div>
                      </td>
                      <td className="px-8 py-6">
                         <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl overflow-hidden border border-border shadow-sm flex-shrink-0">
                              <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${team.name}&backgroundColor=b6e3f4,c0aede,d1d4f9`} alt="" className="w-full h-full bg-muted" />
                            </div>
                            <div>
                              <div className="font-bold text-foreground">{team.name}</div>
                              <div className="text-[10px] text-muted-foreground font-medium uppercase truncate max-w-xs">{Array.isArray(team.members) ? team.members.join(' • ') : team.members}</div>
                            </div>
                         </div>
                      </td>
                      <td className="px-8 py-6 text-center">
                         <Badge variant="primary">{team.count}</Badge>
                      </td>
                      <td className="px-8 py-6 text-right">
                         <div className="flex flex-col items-end">
                           <span className="font-black text-xl text-primary">{team.avg}</span>
                           <div className="flex gap-1.5 mt-1">
                             {[
                               { label: 'I', val: team.innovationAvg, color: 'bg-blue-500' },
                               { label: 'T', val: team.technicalAvg, color: 'bg-purple-500' },
                               { label: 'F', val: team.feasibilityAvg, color: 'bg-green-500' },
                             ].map(c => (
                               <div key={c.label} className="group/tip relative">
                                 <div className={`w-5 h-5 rounded-md ${c.color}/10 border border-${c.color}/20 flex items-center justify-center text-[7px] font-black ${c.color.replace('bg-', 'text-')}`}>
                                   {c.label}
                                 </div>
                                 <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/tip:block bg-popover text-popover-foreground px-2 py-1 rounded shadow-xl border border-border whitespace-nowrap text-[8px] font-bold z-50">
                                   {c.val} / 10
                                 </div>
                               </div>
                             ))}
                           </div>
                         </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                         {selectedIds.has(team.id) ? (
                           <Badge variant="completed">Selected</Badge>
                         ) : (
                           <Badge variant="failed" className="opacity-30">Pending</Badge>
                         )}
                      </td>
                   </tr>
                 ))}
              </tbody>
            </table>
            {ranking.length === 0 && (
              <div className="py-20 text-center text-muted-foreground font-medium">No evaluation data available.</div>
            )}
          </div>
        </Card>
      </div>

      {/* 📊 Printable Vetting Ledger Audit PDF Layout (Visible only on print) */}
      <div className="hidden print:block bg-white text-black p-10 font-mono text-xs w-full min-h-screen">
        {/* Header */}
        <div className="border-b-4 border-black pb-6 mb-8 text-center">
          <h1 className="text-2xl font-black uppercase tracking-tight">EvalTrust Vetting Audit Report</h1>
          <p className="text-[10px] font-bold uppercase tracking-widest mt-1 text-gray-500">Official Consensus Ledger</p>
          <div className="grid grid-cols-2 gap-4 text-left mt-6 text-[10px] font-bold uppercase border-t border-gray-200 pt-4">
            <div>
              <p>Hackathon ID: <span className="font-black text-black">{hackathonId ? hackathonId : 'N/A'}</span></p>
              <p>Vetting Stage: <span className="font-black text-black">Phase 1 (Concept Vetting)</span></p>
            </div>
            <div className="text-right">
              <p>Date Generated: <span className="font-black text-black">{new Date().toLocaleString()}</span></p>
              <p>Security Signature: <span className="font-black text-black">VERIFIED_Consensus_NODE</span></p>
            </div>
          </div>
        </div>

        {/* Overview */}
        <div className="p-4 bg-gray-100 rounded-xl border border-gray-300 mb-8 space-y-2">
          <h4 className="font-black uppercase text-sm">Consensus Abstract</h4>
          <p className="text-[10px] text-gray-600 leading-relaxed">
            This document lists the concept vetting standings for all registered teams. 
            Teams flagged as <strong>PROMOTED</strong> have been advanced to the offline phase by the organizer. 
            Teams flagged as <strong>NOT PROMOTED</strong> represent participants who were not selected but are archived here with audited score metrics for absolute transparency.
          </p>
        </div>

        {/* Table */}
        <table className="w-full text-left border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100 border-b border-gray-300 text-[10px] font-bold uppercase">
              <th className="p-3 border border-gray-300 w-16 text-center">Rank</th>
              <th className="p-3 border border-gray-300">Team Identifier</th>
              <th className="p-3 border border-gray-300 text-center w-28">Vetting Status</th>
              <th className="p-3 border border-gray-300 text-right w-24">Avg Score</th>
              <th className="p-3 border border-gray-300 text-right w-20">Innov Avg</th>
              <th className="p-3 border border-gray-300 text-right w-20">Tech Avg</th>
              <th className="p-3 border border-gray-300 text-right w-20">Feas Avg</th>
            </tr>
          </thead>
          <tbody>
            {ranking.map((team, idx) => {
              const isPromoted = selectedIds.has(team.id) || isLocked;
              return (
                <tr key={team.id} className="border-b border-gray-200 text-[10px]">
                  <td className="p-3 border border-gray-300 font-bold text-center">#{idx + 1}</td>
                  <td className="p-3 border border-gray-300">
                    <p className="font-bold text-xs text-black">{team.name}</p>
                    <p className="text-gray-500 text-[8px] mt-0.5">{Array.isArray(team.members) ? team.members.join(', ') : team.members}</p>
                  </td>
                  <td className="p-3 border border-gray-300 text-center">
                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${isPromoted ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {isPromoted ? 'PROMOTED' : 'NOT PROMOTED'}
                    </span>
                  </td>
                  <td className="p-3 border border-gray-300 font-bold text-right text-black">{team.avg} / 60</td>
                  <td className="p-3 border border-gray-300 text-right text-gray-600">{team.innovationAvg}</td>
                  <td className="p-3 border border-gray-300 text-right text-gray-600">{team.technicalAvg}</td>
                  <td className="p-3 border border-gray-300 text-right text-gray-600">{team.feasibilityAvg}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Verification Footer */}
        <div className="mt-16 pt-8 border-t border-gray-300 flex justify-between items-center text-[8px] font-bold uppercase text-gray-400">
          <span>Verification Signature: {hackathonId ? hackathonId : 'OFFICIAL_CONSENSUS_LEDGER'}</span>
          <span>Security Protocol: NEURAL_LINK_v4_LEDGER</span>
        </div>
      </div>
    </>
  );
};

export default PPTRanking;
