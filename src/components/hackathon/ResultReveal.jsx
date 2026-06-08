import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Button, Card, Badge } from '../ui';
import { useNavigate } from 'react-router-dom';

const ResultReveal = ({ teams = [], hackathonName = 'EvalTrust' }) => {
  const navigate = useNavigate();
  const [stage, setStage] = useState('countdown');
  const [countdown, setCountdown] = useState(3);
  const [revealIndex, setRevealIndex] = useState(0);
  const [shouldShake, setShouldShake] = useState(false);

  const leaderboard = [...teams]
    .sort((a, b) => (b.score || 0) - (a.score || 0))
    .map((team, index) => ({
      ...team,
      rank: index + 1
    }));

  const bestTechnicalTeam = [...teams].sort((a, b) => (b.technical_avg || 0) - (a.technical_avg || 0))[0];
  const bestUiTeam = [...teams].sort((a, b) => (b.presentation_avg || 0) - (a.presentation_avg || 0))[0];
  const bestInnovationTeam = [...teams].sort((a, b) => (b.innovation_avg || 0) - (a.innovation_avg || 0))[0];

  const topThree = leaderboard.slice(0, 3).reverse();

  // Score Ticker Logic
  const CountUp = ({ end, duration = 2000 }) => {
    const [count, setCount] = useState(0);
    useEffect(() => {
      let start = 0;
      const increment = end / (duration / 16);
      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setCount(end);
          clearInterval(timer);
        } else {
          setCount(Math.floor(start));
        }
      }, 16);
      return () => clearInterval(timer);
    }, [end]);
    return <span>{count.toFixed(1)}</span>;
  };

  const triggerRumble = () => {
    setShouldShake(true);
    setTimeout(() => setShouldShake(false), 400);
  };

  useEffect(() => {
    if (stage === 'countdown') {
      if (countdown > 0) {
        const timer = setTimeout(() => {
          setCountdown(countdown - 1);
          triggerRumble();
        }, 1000);
        return () => clearTimeout(timer);
      } else {
        setStage('revealing');
        triggerRumble();
      }
    }
  }, [countdown, stage]);

  useEffect(() => {
    if (stage === 'revealing') {
      const current = topThree[revealIndex];
      triggerRumble();

      if (current && current.rank === 1) {
        // Celebratory confetti screen burst
        const duration = 5 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 45, spread: 360, ticks: 100, zIndex: 200 };

        const interval = setInterval(() => {
          const timeLeft = animationEnd - Date.now();
          if (timeLeft <= 0) return clearInterval(interval);
          const particleCount = 85 * (timeLeft / duration);
          confetti({ ...defaults, particleCount, origin: { x: Math.random() * 0.4, y: Math.random() - 0.2 } });
          confetti({ ...defaults, particleCount, origin: { x: Math.random() * 0.4 + 0.6, y: Math.random() - 0.2 } });
        }, 200);
      }

      if (revealIndex < topThree.length) {
        const timer = setTimeout(() => {
          if (revealIndex < topThree.length - 1) {
            setRevealIndex(revealIndex + 1);
          } else {
            setStage('final');
          }
        }, 5500);
        return () => clearTimeout(timer);
      } else {
        setStage('final');
      }
    }
  }, [revealIndex, stage, topThree.length]);

  const shakeStyle = shouldShake 
    ? { transform: `translate(${(Math.random() - 0.5) * 8}px, ${(Math.random() - 0.5) * 8}px)` }
    : {};

  if (stage === 'countdown') {
    return (
      <div 
        style={shakeStyle}
        className="fixed inset-0 z-[100] bg-slate-50 flex flex-col items-center justify-center overflow-hidden transition-transform duration-75 font-mono"
      >
        {/* Crisp Light Cyber Blueprint Grid */}
        <div className="absolute inset-0 bg-cyber-grid-light opacity-30 pointer-events-none"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.06),transparent_70%)] animate-pulse"></div>

        {/* Circular Scanning Reticle */}
        <div className="absolute w-[400px] h-[400px] md:w-[600px] md:h-[600px] border border-primary/10 rounded-full animate-spin-slow flex items-center justify-center pointer-events-none">
          <div className="w-[380px] h-[380px] md:w-[580px] md:h-[580px] border border-dashed border-primary/5 rounded-full"></div>
          <div className="absolute w-full h-[1px] bg-primary/15"></div>
        </div>

        <motion.div 
          key={countdown}
          initial={{ scale: 0.4, opacity: 0, filter: 'blur(10px)' }}
          animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
          exit={{ scale: 2, opacity: 0, filter: 'blur(20px)' }}
          transition={{ type: "spring", damping: 15 }}
          className="text-8xl md:text-[12rem] font-black text-slate-900 z-10 select-none tracking-tight drop-shadow-[0_0_30px_rgba(59,130,246,0.15)] relative font-sans"
        >
          {countdown > 0 ? `0${countdown}` : 'SYNC'}
        </motion.div>
        
        <div className="absolute bottom-24 text-center space-y-4 z-20 no-print">
          <p className="text-[10px] font-bold text-primary uppercase tracking-[0.6em] animate-pulse">Establishing Cryptographic Vetting Nodes</p>
          <div className="flex items-center justify-center gap-3 text-[8px] font-black text-muted-foreground uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_10px_#22c55e]"></span>
            <span>Ledger: SECURE</span>
            <span className="opacity-30">|</span>
            <span>Entropy: STABLE</span>
          </div>
        </div>
      </div>
    );
  }

  if (stage === 'revealing') {
    const current = topThree[revealIndex];
    if (!current) return null;

    const rankColors = {
      1: 'text-yellow-600 drop-shadow-[0_0_30px_rgba(234,179,8,0.25)]',
      2: 'text-blue-500 drop-shadow-[0_0_30px_rgba(59,130,246,0.15)]',
      3: 'text-purple-500 drop-shadow-[0_0_30px_rgba(168,85,247,0.15)]'
    };

    const rankLabels = {
      1: 'GRAND CHAMPION',
      2: 'RUNNER UP',
      3: 'SECOND RUNNER UP'
    };

    return (
      <div 
        style={shakeStyle}
        className="fixed inset-0 z-[100] bg-slate-50 flex items-center justify-center p-6 overflow-hidden transition-transform duration-75 font-mono"
      >
        {/* Crisp Light Cyber Blueprint Grid */}
        <div className="absolute inset-0 bg-cyber-grid-light opacity-30 pointer-events-none"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.05),transparent_75%)]"></div>

        {/* Dynamic laser sweeper lines */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-1/2 left-0 right-0 h-4 bg-gradient-to-b from-primary/5 via-primary/20 to-primary/5 opacity-20 blur-2xl animate-laser-sweep"></div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div 
            key={revealIndex}
            initial={{ scale: 0.8, y: 50, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 1.8, opacity: 0, filter: 'blur(30px)' }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="w-full max-w-4xl z-10"
          >
            {/* Holographic White Glass Dashboard Card */}
            <div className="bg-white/80 border-2 border-primary/20 p-8 md:p-12 rounded-[2.5rem] shadow-2xl backdrop-blur-2xl relative overflow-hidden text-left space-y-8">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.02] to-transparent h-1/2 w-full animate-laser-sweep pointer-events-none"></div>
              
              {/* Top Meta Headers */}
              <div className="flex justify-between items-start border-b border-border pb-6 relative z-10">
                <div className="space-y-1">
                  <Badge variant="primary" className="bg-primary/10 text-primary border border-primary/20 text-[9px] font-black uppercase tracking-widest px-4 py-1.5">
                    {rankLabels[current.rank]}
                  </Badge>
                  <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-2">CONSENSUS ARCHIVE REGISTRY</p>
                </div>
                <div className="text-right">
                  <span className={`text-5xl font-black ${rankColors[current.rank]}`}>
                    {current.rank === 1 ? '01' : current.rank === 2 ? '02' : '03'}
                  </span>
                  <span className="text-[10px] text-muted-foreground block font-bold uppercase tracking-widest mt-1">RANK NODE</span>
                </div>
              </div>

              {/* Main Content Info */}
              <div className="grid md:grid-cols-12 gap-10 items-center relative z-10">
                {/* Visual Avatar Reticle placeholder */}
                <div className="md:col-span-4 flex justify-center">
                  <div className="relative">
                    <div className="w-40 h-40 rounded-[2rem] border border-border bg-slate-50 overflow-hidden flex items-center justify-center p-3 relative shadow-2xl">
                      <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${current.team_name}&backgroundColor=f1f5f9`} alt="" className="w-full h-full object-cover rounded-xl" />
                      {/* Scanning corners */}
                      <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-primary"></div>
                      <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-primary"></div>
                      <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-primary"></div>
                      <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-primary"></div>
                    </div>
                  </div>
                </div>

                {/* Team Info & Ticker */}
                <div className="md:col-span-8 space-y-6">
                  <div>
                    <h2 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 uppercase truncate">{current.team_name}</h2>
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.25em] mt-2 truncate">
                      MEMBERS: {Array.isArray(current.members) ? current.members.join(', ') : current.members}
                    </p>
                  </div>

                  {/* Criteria Micro-Rating Metrics */}
                  <div className="grid grid-cols-2 gap-4 border-t border-b border-border py-6">
                    {[
                      { label: 'Technical', val: current.technical_avg || 8.5, color: 'bg-blue-500' },
                      { label: 'Presentation', val: current.presentation_avg || 9.0, color: 'bg-pink-500' },
                      { label: 'Innovation', val: current.innovation_avg || 8.0, color: 'bg-green-500' }
                    ].map(m => (
                      <div key={m.label} className="space-y-1.5">
                        <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                          <span>{m.label}</span>
                          <span className="text-slate-800">{m.val} / 10</span>
                        </div>
                        <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden border border-border">
                          <div className={`h-full ${m.color}`} style={{ width: `${m.val * 10}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Final Ticker */}
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">AGGREGATED SCORE</span>
                    <span className="text-4xl font-black text-primary drop-shadow-[0_0_20px_rgba(59,130,246,0.2)] tracking-tighter">
                      <CountUp end={current.score} /> <span className="text-xs text-muted-foreground ml-1">POINTS</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        <button 
          onClick={() => setStage('final')}
          className="absolute bottom-8 right-8 px-6 py-3 bg-white border border-border rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-primary hover:text-primary-foreground transition-all z-[110] shadow-2xl no-print"
        >
          Skip Reveal ⏭️
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-foreground py-16 px-6 overflow-y-auto relative animate-fade-in font-mono">
      {/* Crisp Light Cyber Blueprint Grid */}
      <div className="absolute inset-0 bg-cyber-grid-light opacity-30 pointer-events-none"></div>

      <div className="max-w-6xl mx-auto space-y-16 relative z-10">
        {/* Title Section */}
        <div className="text-center space-y-4">
          <Badge variant="primary" className="mx-auto text-[10px] bg-primary/10 text-primary border border-primary/20 px-6 py-1.5 uppercase tracking-widest">🏆 OFFICIAL VERDICT REGISTRY 🏆</Badge>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-[0.9] text-slate-900">
            Hall Of <span className="text-primary drop-shadow-[0_0_20px_rgba(59,130,246,0.2)]">Fame</span>
          </h1>
          <p className="text-muted-foreground font-bold tracking-[0.4em] uppercase text-[9px] opacity-60">Immutable Consensus Protocol Standings</p>
        </div>

        {/* 🏆 THE PODIUM STANDS */}
        <div className="grid md:grid-cols-3 gap-8 items-end max-w-5xl mx-auto pt-10">
          
          {/* 2nd Place Card */}
          {leaderboard[1] && (
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-white/80 border-2 border-blue-500/20 p-8 rounded-[2.5rem] text-center space-y-6 relative overflow-hidden backdrop-blur-md group shadow-xl shadow-blue-500/[0.02]"
            >
              <div className="absolute -top-12 -left-12 w-28 h-28 bg-blue-500/5 rounded-full blur-xl"></div>
              <div className="w-20 h-20 rounded-2xl border border-border bg-slate-50 p-2 mx-auto shadow-xl relative z-10">
                <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${leaderboard[1]?.team_name}&backgroundColor=f1f5f9`} alt="" className="w-full h-full object-cover rounded-xl" />
              </div>
              <div className="space-y-1 relative z-10">
                <Badge variant="primary" className="bg-blue-500/10 text-blue-600 border border-blue-500/20 text-[8px] tracking-widest px-3">RUNNER UP</Badge>
                <h3 className="text-xl font-black text-slate-900 uppercase truncate pt-2">{leaderboard[1]?.team_name}</h3>
                <p className="text-[8px] text-muted-foreground uppercase tracking-widest">Table: {leaderboard[1]?.table_number || 'T-02'}</p>
              </div>
              <div className="pt-4 border-t border-border flex justify-between items-center text-[10px] font-bold uppercase relative z-10">
                <span className="text-muted-foreground">Vetted Score</span>
                <span className="text-blue-500 font-black text-lg">{leaderboard[1]?.score} pts</span>
              </div>
            </motion.div>
          )}

          {/* 1st Place Card (Central Highlight) */}
          {leaderboard[0] && (
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-white border-4 border-primary/30 p-10 rounded-[3rem] text-center space-y-8 relative overflow-hidden shadow-[0_20px_50px_rgba(59,130,246,0.12)] backdrop-blur-md group md:-translate-y-4"
            >
              <div className="absolute -top-14 -left-14 w-32 h-32 bg-primary/5 rounded-full blur-xl"></div>
              
              {/* Glowing Halo */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-44 h-44 bg-primary/5 blur-[50px] rounded-full"></div>

              <div className="w-28 h-28 rounded-3xl border border-primary/20 bg-slate-50 p-2.5 mx-auto shadow-2xl relative z-10">
                <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${leaderboard[0]?.team_name}&backgroundColor=f1f5f9`} alt="" className="w-full h-full object-cover rounded-2xl" />
              </div>
              
              <div className="space-y-1 relative z-10">
                <Badge variant="primary" className="bg-primary/10 text-primary border border-primary/30 text-[9px] tracking-widest px-4 py-1">GRAND CHAMPION</Badge>
                <h3 className="text-3xl font-black text-slate-900 uppercase truncate pt-3">{leaderboard[0]?.team_name}</h3>
                <p className="text-[8px] text-primary font-bold uppercase tracking-widest">Table: {leaderboard[0]?.table_number || 'T-01'}</p>
              </div>

              <div className="pt-6 border-t border-border flex justify-between items-center text-[10px] font-bold uppercase relative z-10">
                <span className="text-muted-foreground">Consensus Score</span>
                <span className="text-primary font-black text-2xl drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]">{leaderboard[0]?.score} pts</span>
              </div>
            </motion.div>
          )}

          {/* 3rd Place Card */}
          {leaderboard[2] && (
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="bg-white/80 border-2 border-purple-500/20 p-8 rounded-[2.5rem] text-center space-y-6 relative overflow-hidden backdrop-blur-md group shadow-xl shadow-purple-500/[0.02]"
            >
              <div className="absolute -top-12 -left-12 w-28 h-28 bg-purple-500/5 rounded-full blur-xl"></div>
              <div className="w-20 h-20 rounded-2xl border border-border bg-slate-50 p-2 mx-auto shadow-xl relative z-10">
                <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${leaderboard[2]?.team_name}&backgroundColor=f1f5f9`} alt="" className="w-full h-full object-cover rounded-xl" />
              </div>
              <div className="space-y-1 relative z-10">
                <Badge variant="primary" className="bg-purple-500/10 text-purple-600 border border-purple-500/20 text-[8px] tracking-widest px-3">2nd RUNNER UP</Badge>
                <h3 className="text-xl font-black text-slate-900 uppercase truncate pt-2">{leaderboard[2]?.team_name}</h3>
                <p className="text-[8px] text-muted-foreground uppercase tracking-widest">Table: {leaderboard[2]?.table_number || 'T-03'}</p>
              </div>
              <div className="pt-4 border-t border-border flex justify-between items-center text-[10px] font-bold uppercase relative z-10">
                <span className="text-muted-foreground">Vetted Score</span>
                <span className="text-purple-500 font-black text-lg">{leaderboard[2]?.score} pts</span>
              </div>
            </motion.div>
          )}
        </div>

        {/* 🏆 Category Champions Showcase (Point 12) */}
        {teams.length > 0 && (
          <div className="max-w-5xl mx-auto space-y-8 pt-16">
            <div className="pb-6 border-b border-border text-center md:text-left">
              <Badge variant="primary" className="mb-2 bg-primary/10 text-primary border border-primary/20 px-4">🏆 EXCELLENCE AWARDS 🏆</Badge>
              <h3 className="text-3xl font-black uppercase tracking-tight text-slate-900">Category Champions</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Best Technical */}
              {bestTechnicalTeam && (
                <Card className="border-2 border-blue-500/20 bg-white hover:border-blue-500/40 transition-all flex flex-col justify-between p-8 text-center md:text-left group relative overflow-hidden h-full shadow-lg shadow-blue-500/[0.01]">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/[0.02] rounded-bl-[4rem] flex items-center justify-end pr-4 pt-4 text-3xl opacity-20 group-hover:scale-110 transition-transform">💻</div>
                  <div className="space-y-4">
                    <Badge variant="primary" className="bg-blue-500/10 text-blue-600 border border-blue-500/20 text-[8px] tracking-widest px-3">Best Engineering & AI</Badge>
                    <h4 className="text-2xl font-black uppercase tracking-tight truncate text-slate-900 pt-2">{bestTechnicalTeam.team_name || bestTechnicalTeam.name}</h4>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-relaxed">
                      Assigned to teams building exceptionally robust technical architectures, clean code logic, or superior integrations.
                    </p>
                  </div>
                  <div className="pt-6 border-t border-border mt-8 flex justify-between items-center text-[10px] font-black uppercase">
                    <span className="text-muted-foreground">Technical Avg</span>
                    <span className="text-blue-500 text-lg font-black">{bestTechnicalTeam.technical_avg} / 10</span>
                  </div>
                </Card>
              )}

              {/* Best UI/UX */}
              {bestUiTeam && (
                <Card className="border-2 border-pink-500/20 bg-white hover:border-pink-500/40 transition-all flex flex-col justify-between p-8 text-center md:text-left group relative overflow-hidden h-full shadow-lg shadow-pink-500/[0.01]">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-pink-500/[0.02] rounded-bl-[4rem] flex items-center justify-end pr-4 pt-4 text-3xl opacity-20 group-hover:scale-110 transition-transform">🎨</div>
                  <div className="space-y-4">
                    <Badge variant="primary" className="bg-pink-500/10 text-pink-600 border border-pink-500/20 text-[8px] tracking-widest px-3">Best UI/UX & Pitch</Badge>
                    <h4 className="text-2xl font-black uppercase tracking-tight truncate text-slate-900 pt-2">{bestUiTeam.team_name || bestUiTeam.name}</h4>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-relaxed">
                      Awarded for outstanding aesthetic execution, responsive design components, and a premium presentation flow.
                    </p>
                  </div>
                  <div className="pt-6 border-t border-border mt-8 flex justify-between items-center text-[10px] font-black uppercase">
                    <span className="text-muted-foreground">Presentation Avg</span>
                    <span className="text-pink-500 text-lg font-black">{bestUiTeam.presentation_avg} / 10</span>
                  </div>
                </Card>
              )}

              {/* Best Innovation */}
              {bestInnovationTeam && (
                <Card className="border-2 border-green-500/20 bg-white hover:border-green-500/40 transition-all flex flex-col justify-between p-8 text-center md:text-left group relative overflow-hidden h-full shadow-lg shadow-green-500/[0.01]">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/[0.02] rounded-bl-[4rem] flex items-center justify-end pr-4 pt-4 text-3xl opacity-20 group-hover:scale-110 transition-transform">💡</div>
                  <div className="space-y-4">
                    <Badge variant="primary" className="bg-green-500/10 text-green-600 border border-green-500/20 text-[8px] tracking-widest px-3">Most Innovative & Feasible</Badge>
                    <h4 className="text-2xl font-black uppercase tracking-tight truncate text-slate-900 pt-2">{bestInnovationTeam.team_name || bestInnovationTeam.name}</h4>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-relaxed">
                      Conferred upon the concept showing extreme novelty, market viability, social value, or economic feasibility.
                    </p>
                  </div>
                  <div className="pt-6 border-t border-border mt-8 flex justify-between items-center text-[10px] font-black uppercase">
                    <span className="text-muted-foreground">Innovation Index</span>
                    <span className="text-green-500 text-lg font-black">{bestInnovationTeam.innovation_avg} / 10</span>
                  </div>
                </Card>
              )}
            </div>
          </div>
        )}

        {/* Full Ranking Table */}
        <div className="max-w-5xl mx-auto space-y-10 pt-20">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 pb-6 border-b border-border">
            <h4 className="text-3xl font-black uppercase tracking-tight text-slate-900">Full Leaderboard</h4>
            <Badge variant="completed" className="bg-muted text-foreground border border-border text-[9px] px-4">{leaderboard.length} Teams Synchronized</Badge>
          </div>
          
          <div className="space-y-3">
            {leaderboard.map((team, i) => (
              <Card 
                key={team.id} 
                className="!p-4 flex items-center justify-between group hover:border-primary/40 transition-all cursor-pointer bg-white border-border shadow-md shadow-slate-100"
                onClick={() => navigate(`/project/${team.id}`)}
              >
                <div className="flex items-center gap-8">
                  <div className={`text-4xl font-black w-16 ${i < 3 ? 'text-primary animate-pulse' : 'text-muted-foreground/30'}`}>
                    {i < 9 ? `0${i + 1}` : i + 1}
                  </div>
                  <div>
                    <div className="text-2xl font-black uppercase group-hover:text-primary transition-colors text-slate-900">{team.team_name}</div>
                    <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-2">
                       {Array.isArray(team.members) ? team.members.join(' • ') : team.members}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                   <div className="text-right hidden md:block">
                      <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">Status</p>
                      <Badge variant="primary" className="text-[8px] bg-primary/10 text-primary border border-primary/20">Verified</Badge>
                   </div>
                   <div className="text-4xl font-black text-slate-900">{team.score}</div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div className="text-center pb-20 no-print">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 mx-auto">
            <button 
              onClick={() => window.location.reload()}
              className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] hover:text-primary transition-colors flex items-center gap-3"
            >
              Resync Registry Data 🔄
            </button>
            <button 
              onClick={() => window.location.href = `/transparency/${window.location.pathname.split('/').pop()}`}
              className="text-[10px] font-black text-primary uppercase tracking-[0.4em] hover:opacity-70 transition-all flex items-center gap-3"
            >
              Full Transparency Report 🛡️
            </button>
          </div>
        </div>
      </div>

      <style jsx="true">{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: hsl(var(--border)); border-radius: 10px; }

        /* Conic Gradient rotating border logic (100% compatible with Light Theme inner box) */
        .neon-border-glowing {
          position: relative;
          overflow: hidden;
          border: 4px solid transparent;
        }
        .neon-border-glowing::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: conic-gradient(from 0deg, transparent, #3b82f6, #ec4899, #10b981, transparent);
          animation: rotate-border 4s linear infinite;
          z-index: 0;
        }
        .neon-border-glowing::after {
          content: '';
          position: absolute;
          inset: 4px;
          background: #ffffff; /* Crisp white inner card background */
          border-radius: 2.7rem;
          z-index: 1;
        }
        .neon-border-glowing span {
          position: relative;
          z-index: 2;
        }

        /* 🌌 Moving Light Cyber Grid Background */
        .bg-cyber-grid-light {
          background-image: 
            linear-gradient(to right, rgba(59, 130, 246, 0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(59, 130, 246, 0.05) 1px, transparent 1px);
          background-size: 40px 40px;
          background-repeat: repeat;
        }

        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 25s linear infinite;
        }

        @keyframes laser-sweep {
          0% { top: -50%; }
          100% { top: 150%; }
        }
        .animate-laser-sweep {
          animation: laser-sweep 4.5s linear infinite;
        }

        @keyframes loading-bar {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
        .animate-loading-bar { animation: loading-bar 1.5s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default ResultReveal;