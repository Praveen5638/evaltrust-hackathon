import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../supabase/client';
import { Button, Card, Badge } from '../components/ui';

const Gallery = () => {
  const { hackathonId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [hackathon, setHackathon] = useState(null);
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // 1. Fetch hackathon info
        const { data: hData } = await supabase
          .from('hackathons')
          .select('*')
          .eq('id', hackathonId)
          .single();
        setHackathon(hData);

        // 2. Fetch all submissions (both initial and promoted)
        // We'll combine teams and ppt_submissions if necessary, 
        // but usually ppt_submissions contains everyone.
        const { data: ppts } = await supabase
          .from('ppt_submissions')
          .select('*')
          .eq('hackathon_id', hackathonId)
          .order('created_at', { ascending: false });
        
        setProjects(ppts || []);
      } catch (err) {
        console.error('Gallery fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [hackathonId]);

  const filtered = projects.filter(p => 
    p.team_name.toLowerCase().includes(search.toLowerCase()) ||
    (Array.isArray(p.members) ? p.members.join(' ') : p.members || '').toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest animate-pulse">Syncing Project Gallery...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-16 px-6 animate-fade-in">
      <div className="max-w-7xl mx-auto space-y-16">
        {/* Header */}
        <header className="text-center space-y-6 max-w-3xl mx-auto">
          <Badge variant="primary" className="mx-auto">Project Showcase</Badge>
          <div className="space-y-2">
            <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-none uppercase">
              {hackathon?.name} <span className="text-primary">Gallery</span>
            </h1>
            <p className="text-muted-foreground font-medium uppercase tracking-[0.3em] text-[10px]">Public Manifest Registry</p>
          </div>
          <p className="text-muted-foreground text-lg font-medium leading-relaxed">
            Explore the innovative solutions and technical manifests submitted to this event cluster.
          </p>

          <div className="relative max-w-md mx-auto group pt-4">
             <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">🔍</div>
             <input 
               type="text" 
               placeholder="Search by team name or member..." 
               className="w-full bg-muted/50 border-2 border-border focus:border-primary focus:bg-background rounded-2xl py-4 pl-12 pr-6 text-sm font-bold transition-all outline-none"
               value={search}
               onChange={(e) => setSearch(e.target.value)}
             />
          </div>
        </header>

        {/* Project Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((project, i) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              onClick={() => navigate(`/project/${project.id}`)}
              className="group cursor-pointer"
            >
              <Card className="h-full flex flex-col border-2 hover:border-primary/20 transition-all shadow-xl shadow-primary/5">
                <div className="aspect-video bg-muted rounded-xl mb-6 relative overflow-hidden flex items-center justify-center border border-border">
                   <div className="text-4xl opacity-20 group-hover:scale-125 transition-transform duration-500">📄</div>
                   <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                      <Button size="sm" className="w-full rounded-lg text-[10px] font-black uppercase tracking-widest">Explore Manifest</Button>
                   </div>
                </div>
                
                <div className="flex-1 space-y-4">
                   <div className="flex justify-between items-start">
                      <h3 className="text-xl font-black uppercase tracking-tight group-hover:text-primary transition-colors line-clamp-1">{project.team_name}</h3>
                      <Badge variant={project.status === 'shortlisted' ? 'completed' : 'primary'} className="text-[8px]">{project.status}</Badge>
                   </div>
                   
                   <div className="flex flex-wrap gap-1">
                      {(Array.isArray(project.members) ? project.members : (project.members || '').split(',')).slice(0, 3).map((m, idx) => (
                        <span key={idx} className="text-[9px] font-bold text-muted-foreground uppercase tracking-tight bg-muted px-2 py-0.5 rounded border border-border">{m.trim()}</span>
                      ))}
                      {(Array.isArray(project.members) ? project.members.length : (project.members || '').split(',').length) > 3 && (
                        <span className="text-[9px] font-bold text-muted-foreground px-2 py-0.5">+ more</span>
                      )}
                   </div>
                </div>

                <div className="mt-8 pt-4 border-t border-border flex justify-between items-center text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                   <span>ID: {project.id.substring(0,8)}</span>
                   <span>{new Date(project.created_at).toLocaleDateString()}</span>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="py-32 text-center space-y-4">
             <div className="text-6xl opacity-10">🏜️</div>
             <p className="text-lg font-bold text-muted-foreground uppercase tracking-widest">No matching projects found.</p>
             <Button variant="outline" onClick={() => setSearch('')}>Clear Search</Button>
          </div>
        )}

        <footer className="text-center pt-20 border-t border-border">
           <Button variant="ghost" onClick={() => navigate(-1)} className="text-xs font-black uppercase tracking-widest">← Back to Registry</Button>
        </footer>
      </div>
    </div>
  );
};

export default Gallery;
