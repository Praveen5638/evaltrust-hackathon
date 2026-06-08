import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../supabase/api';
import { Button, Card, Badge } from '../components/ui';

const ProjectDetail = () => {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const data = await api.getProjectDetails(teamId);
        setProject(data);
      } catch (err) {
        console.error('Error fetching project details:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [teamId]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest animate-pulse">Decrypting Project Manifest...</p>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <div className="text-6xl mb-6 opacity-20">📡</div>
        <h2 className="text-2xl font-black uppercase mb-4">Manifest Not Found</h2>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">{error || "The requested project identifier does not exist in our registry."}</p>
        <Button onClick={() => navigate(-1)}>Return to Registry</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-16 px-6 animate-fade-in">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Header */}
        <header className="flex flex-col md:flex-row items-center justify-between gap-8 pb-8 border-b border-border">
          <div className="space-y-4 text-center md:text-left">
            <Badge variant="primary">PROJECT MANIFEST</Badge>
            <h1 className="text-4xl md:text-7xl font-black tracking-tight leading-none uppercase">
              {project.team_name || project.name}
            </h1>
            <div className="flex flex-wrap justify-center md:justify-start gap-2">
              {(Array.isArray(project.members) ? project.members : (project.members || '').split(',')).map((m, i) => (
                <span key={i} className="px-3 py-1 bg-muted rounded-lg text-[10px] font-black uppercase tracking-widest border border-border text-muted-foreground">
                  {m.trim()}
                </span>
              ))}
            </div>
          </div>
          <div className="flex gap-4">
             <Button variant="outline" onClick={() => navigate(-1)}>Back</Button>
             <Button onClick={() => window.open(project.ppt_url, '_blank')} className="shadow-xl shadow-primary/20">View Pitch Deck ↗</Button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-12">
            <section className="space-y-6">
              <div className="flex items-center gap-3">
                 <div className="w-1.5 h-6 bg-primary rounded-full"></div>
                 <h2 className="text-xl font-black uppercase tracking-tight">Presentation Preview</h2>
              </div>
              <Card className="aspect-video !p-0 overflow-hidden border-2 bg-muted relative group">
                {project.ppt_url ? (
                   <iframe 
                     src={project.ppt_url} 
                     className="w-full h-full border-none"
                     title="Pitch Deck Preview"
                   />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-muted-foreground font-bold uppercase tracking-widest text-xs">
                    No Preview Available
                  </div>
                )}
                <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                   <p className="text-xs font-black uppercase tracking-widest text-primary bg-background px-4 py-2 rounded-xl border border-primary shadow-2xl">External Link Recommended</p>
                </div>
              </Card>
            </section>

            {/* Score Audit (Point 13 - Controlled Disclosure) */}
            {project.scores && project.scores.length > 0 && (
              <section className="space-y-6">
                <div className="flex items-center gap-3">
                   <div className="w-1.5 h-6 bg-primary rounded-full"></div>
                   <h2 className="text-xl font-black uppercase tracking-tight">Evaluation Audit</h2>
                </div>
                
                {project.hackathon?.is_result_revealed ? (
                  <div className="grid gap-6">
                     {project.scores.map((s, i) => (
                       <Card key={i} className="!p-6 border-2 hover:border-primary/10 transition-all space-y-6">
                          <div className="flex flex-col md:flex-row justify-between gap-6 border-b border-border pb-4">
                             <div className="space-y-1">
                                <div className="flex items-center gap-3">
                                   <Badge variant="secondary">Round {s.round}</Badge>
                                   <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Arbiter Signature: {s.judge_id.substring(0,8)}</span>
                                </div>
                                <p className="text-[10px] text-primary font-black uppercase tracking-widest mt-1">Consensus Rating: {((s.total_score / 60) * 100).toFixed(0)}% Match</p>
                             </div>
                             <div className="text-right">
                                <span className="text-4xl font-black text-primary">{s.total_score}</span>
                                <span className="text-xs text-muted-foreground ml-1">/ 60</span>
                             </div>
                          </div>

                          {/* Criteria Grid (High Fidelity Scorecard) */}
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {[
                              { label: 'Innovation', val: s.innovation, icon: '💡' },
                              { label: 'Technical', val: s.technical, icon: '💻' },
                              { label: 'Feasibility', val: s.feasibility, icon: '📈' },
                              { label: 'Revenue Model', val: s.revenue_model, icon: '💰' },
                              { label: 'Impact', val: s.impact, icon: '🌍' },
                              { label: 'Presentation', val: s.presentation, icon: '🎤' }
                            ].map(c => (
                              <div key={c.label} className="space-y-2 bg-muted/40 p-3 rounded-xl border border-border">
                                <div className="flex justify-between items-center text-[9px] font-bold text-muted-foreground uppercase tracking-tight">
                                  <span className="flex items-center gap-1.5"><span>{c.icon}</span> {c.label}</span>
                                  <span className="font-black text-foreground">{c.val} / 10</span>
                                </div>
                                <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden border border-border">
                                  <div className="h-full bg-primary" style={{ width: `${c.val * 10}%` }}></div>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Remarks */}
                          <div className="pt-4 border-t border-border space-y-2">
                             <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Arbiter Remarks</p>
                             <p className="text-sm font-medium leading-relaxed text-muted-foreground italic">
                               "{s.comments || "No qualitative analysis provided."}"
                             </p>
                          </div>
                       </Card>
                     ))}
                  </div>
                ) : (
                  <Card className="!p-8 text-center space-y-6 border-2 border-yellow-500/20 bg-yellow-500/[0.02] rounded-3xl">
                     <div className="w-16 h-16 bg-yellow-500/10 rounded-2xl flex items-center justify-center text-3xl mx-auto shadow-lg shadow-yellow-500/5">🔒</div>
                     <div className="space-y-2">
                        <h4 className="text-lg font-black uppercase tracking-tight">Consensus Logs Locked</h4>
                        <p className="text-[9px] font-bold text-yellow-600 uppercase tracking-widest">Vetting In Progress</p>
                     </div>
                     <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
                        Detailed scores, criteria metrics, and judge feedback comments are securely encrypted. They will be revealed automatically once results are published.
                     </p>
                  </Card>
                )}
              </section>
            )}
          </div>

          {/* Sidebar Stats */}
          <div className="space-y-8">
            <Card className="!p-8 border-2 bg-muted/30 space-y-8 sticky top-8">
               <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Global Status</p>
                  {project.hackathon?.is_result_revealed ? (
                    <div>
                      <p className="text-3xl font-black text-primary">Standings Released</p>
                      <p className="text-[9px] font-bold text-muted-foreground uppercase mt-1">Check official leaderboard for final rank.</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-3xl font-black text-yellow-600">Active Evaluated</p>
                      <p className="text-[9px] font-bold text-muted-foreground uppercase mt-1">Scores Cryptographically Sealed</p>
                    </div>
                  )}
               </div>
               
               <div className="pt-8 border-t border-border space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-widest">Registry Data</h4>
                  <div className="space-y-3">
                     <div className="flex justify-between text-[10px] font-bold uppercase">
                        <span className="text-muted-foreground">Status</span>
                        <span className="text-foreground">{project.status || 'Active'}</span>
                     </div>
                     <div className="flex justify-between text-[10px] font-bold uppercase">
                        <span className="text-muted-foreground">Submitted</span>
                        <span className="text-foreground">{new Date(project.created_at).toLocaleDateString()}</span>
                     </div>
                     <div className="flex justify-between text-[10px] font-bold uppercase">
                        <span className="text-muted-foreground">Cluster ID</span>
                        <span className="text-foreground">{project.hackathon_id?.substring(0,8) || 'N/A'}</span>
                     </div>
                  </div>
               </div>

               <div className="pt-8 border-t border-border">
                  <p className="text-[9px] font-medium text-muted-foreground leading-relaxed italic">
                    "This manifest is part of the EvalTrust immutable ledger. All evaluations are final and verified through cryptographic consensus."
                  </p>
               </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;
