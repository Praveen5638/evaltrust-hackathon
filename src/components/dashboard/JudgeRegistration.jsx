import React, { useState, useEffect } from 'react';
import api from '../../supabase/api';
import { Button, Card, Badge, Input } from '../ui';
import { motion, AnimatePresence } from 'framer-motion';

const JudgeRegistration = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    hackathonId: '',
  });
  const [loading, setLoading] = useState(false);
  const [recentJudges, setRecentJudges] = useState([]);
  const [hackathons, setHackathons] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchJudges();
    fetchHackathons();
  }, []);

  const fetchJudges = async () => {
    try {
      const data = await api.getJudges();
      setRecentJudges(data);
    } catch (err) {
      console.error('Fetch judges failed:', err);
    }
  };

  const fetchHackathons = async () => {
    try {
      const data = await api.getHackathons();
      setHackathons(data);
      if (data.length > 0) {
        setFormData(prev => ({ ...prev, hackathonId: data[0].id }));
      }
    } catch (err) {
      console.error('Fetch hackathons failed:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.hackathonId) {
      setError('Please select a hackathon to assign the judge.');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await api.registerJudge(formData.email, formData.password, formData.name, formData.hackathonId);
      
      await fetchJudges(); // Refresh the list from DB
      setSuccess(`Judge ${formData.name} registered successfully!`);
      setFormData({ name: '', email: '', password: '', hackathonId: hackathons[0]?.id || '' });
      setTimeout(() => setSuccess(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteJudge = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove judge ${name}? They will lose access immediately.`)) return;
    
    try {
      await api.deleteJudge(id);
      fetchJudges();
      setSuccess(`Judge ${name} removed successfully.`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to remove judge.');
    }
  };

  return (
    <div className="grid lg:grid-cols-12 gap-8 animate-fade-in">
      {/* Left: Registration Form */}
      <div className="lg:col-span-5">
        <Card className="!p-0 overflow-hidden border-2 shadow-2xl shadow-primary/5 sticky top-24">
          <div className="bg-muted/30 px-8 py-8 border-b border-border flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black tracking-tight uppercase leading-none">Add <span className="text-primary">Judge</span></h2>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-2">Create arbiter credentials</p>
            </div>
            <div className="w-12 h-12 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center text-2xl shadow-lg">
              👤
            </div>
          </div>

          <div className="p-8 space-y-8">
            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="p-4 bg-destructive/5 border border-destructive/20 text-destructive text-[10px] font-bold uppercase tracking-widest rounded-xl flex items-center gap-4">
                  <span className="text-lg">⚠️</span>
                  <span>{error}</span>
                </motion.div>
              )}
              {success && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="p-4 bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest rounded-xl flex items-center gap-4">
                  <span className="text-lg">✅</span>
                  <span>{success}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">
                  Full Name
                </label>
                <Input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. John Doe"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">
                  Email Address
                </label>
                <Input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="john@example.com"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">
                  Assigned Hackathon
                </label>
                <select
                  required
                  value={formData.hackathonId}
                  onChange={(e) => setFormData({ ...formData, hackathonId: e.target.value })}
                  className="w-full bg-muted border border-border rounded-xl p-3 text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
                >
                  <option value="" disabled>Select Hackathon</option>
                  {hackathons.map(h => (
                    <option key={h.id} value={h.id}>{h.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">
                  Access Password
                </label>
                <Input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full py-6 text-xs font-bold uppercase tracking-[0.2em] shadow-xl shadow-primary/20"
              >
                {loading ? 'Processing...' : 'Register Judge'}
              </Button>
            </form>

            <div className="pt-6 border-t border-border">
              <p className="text-[9px] font-bold text-muted-foreground leading-relaxed uppercase tracking-[0.2em] opacity-50">
                Judges will use these credentials to log into the Judge Portal. They will only have access to the assigned event.
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Right: Recent Registrations List */}
      <div className="lg:col-span-7 space-y-6">
        <div className="flex items-center justify-between px-2">
           <h3 className="text-xl font-black uppercase tracking-tight">Registered <span className="text-primary">Judges</span></h3>
           <Badge variant="primary">{recentJudges.length} Total</Badge>
        </div>

        <div className="space-y-4">
          <AnimatePresence initial={false}>
            {recentJudges.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-20 text-center border-2 border-dashed border-border rounded-3xl opacity-30">
                <div className="text-5xl mb-4">📜</div>
                <p className="text-[10px] font-bold uppercase tracking-widest">No judges registered yet.</p>
              </motion.div>
            ) : (
              recentJudges.map((judge) => (
                <motion.div
                  key={judge.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <Card className="!p-6 hover:border-primary/20 transition-all group">
                    <div className="flex items-center justify-between gap-6">
                      <div className="flex items-center gap-6">
                        <div className="w-14 h-14 bg-muted border border-border rounded-2xl flex items-center justify-center text-2xl shadow-sm group-hover:bg-primary/10 group-hover:text-primary transition-all">
                          ⚖️
                        </div>
                        <div>
                          <p className="text-lg font-black uppercase tracking-tight leading-none mb-1 group-hover:text-primary transition-colors">{judge.name}</p>
                          <p className="text-xs font-medium text-muted-foreground mb-1">{judge.email}</p>
                          <div className="flex items-center gap-2">
                             <Badge variant="primary" className="text-[8px] py-0">
                               {judge.hackathons?.name || (judge.hackathon_id ? `Event: ${judge.hackathon_id.substring(0,8)}` : 'Unassigned')}
                             </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-3">
                        <Badge variant="completed">Active</Badge>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDeleteJudge(judge.id, judge.name)}
                          className="h-8 w-8 !p-0 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-all"
                        >
                          🗑️
                        </Button>
                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest opacity-40">{new Date(judge.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        <Card className="!p-8 bg-primary/[0.02] border-primary/10">
          <div className="flex items-start gap-6">
             <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-2xl text-primary flex-shrink-0">
               🛡️
             </div>
             <div className="space-y-2">
               <h4 className="text-sm font-bold uppercase tracking-widest">Security Protocol</h4>
               <p className="text-xs font-medium text-muted-foreground leading-relaxed">
                 All judge accounts are created with encrypted credentials. Ensure you communicate the password securely to the respective judges. They can access the system via the /login portal.
               </p>
             </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default JudgeRegistration;
