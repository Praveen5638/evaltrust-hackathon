import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase/client';
import { motion } from 'framer-motion';
import { Button, Card, Badge } from '../components/ui';

const HackathonSelect = () => {
  const navigate = useNavigate();
  const [hackathons, setHackathons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetchHackathons();
  }, []);

  const fetchHackathons = async () => {
    setLoading(true);
    setError('');
    try {
      const { data, error: fetchErr } = await supabase
        .from('hackathons')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (fetchErr) throw fetchErr;
      setHackathons(data || []);
    } catch (err) {
      console.error('Fetch hackathons error:', err);
      setError('Could not load hackathons. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleParticipate = (hackathon) => {
    sessionStorage.setItem('selectedHackathon', JSON.stringify(hackathon));
    navigate(`/submit/${hackathon.id}`);
  };

  return (
    <div className="space-y-12">
      {/* Hero Header */}
        <header className="text-center space-y-4">
          <Badge variant="primary" className="mx-auto">Project Submission Portal</Badge>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-none uppercase">
            Select <span className="text-primary">Event</span>
          </h1>
          <p className="text-muted-foreground text-sm md:text-base max-w-2xl mx-auto font-medium">
            Choose an active hackathon cluster to submit your project manifest.
          </p>
        </header>

      {/* Main Content */}
      <div className="min-h-[400px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-6">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest animate-pulse">Loading Events...</p>
          </div>
        ) : error ? (
          <Card className="max-w-xl mx-auto text-center p-12 border-destructive/20">
            <div className="text-4xl mb-6">⚠️</div>
            <p className="text-destructive font-bold mb-8 uppercase tracking-wider">{error}</p>
            <Button onClick={fetchHackathons} variant="outline">Retry Loading</Button>
          </Card>
        ) : hackathons.length === 0 ? (
          <Card className="text-center py-24 border-dashed">
            <div className="text-6xl mb-6 opacity-20">📭</div>
            <h3 className="text-2xl font-bold mb-2">No Active Hackathons</h3>
            <p className="text-muted-foreground">Check back later for new events.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {hackathons.map((hackathon, i) => (
              <motion.div
                key={hackathon.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card 
                  className={`group h-full flex flex-col justify-between border-2 transition-all duration-300 ${
                    selected?.id === hackathon.id ? 'border-primary shadow-2xl shadow-primary/10' : 'hover:border-primary/20'
                  }`}
                  onClick={() => setSelected(hackathon)}
                >
                  <div>
                    <div className="flex justify-between items-start mb-8">
                      <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                        🏆
                      </div>
                      <Badge variant="completed">Active</Badge>
                    </div>

                    <h2 className="text-2xl font-black mb-3 group-hover:text-primary transition-colors">
                      {hackathon.name}
                    </h2>
                    <p className="text-muted-foreground text-sm line-clamp-3 mb-6">
                      {hackathon.description || 'No description provided for this event.'}
                    </p>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      <span className="mr-2">📅</span>
                      {new Date(hackathon.created_at).toLocaleDateString()}
                    </div>
                    
                    <Button 
                      disabled={hackathon.is_ppt_locked}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleParticipate(hackathon);
                      }}
                      className="w-full py-4 rounded-xl shadow-xl shadow-primary/10"
                      variant={selected?.id === hackathon.id ? 'primary' : 'secondary'}
                    >
                      {hackathon.is_ppt_locked ? 'Submissions Closed' : 'Participate Now'}
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HackathonSelect;
