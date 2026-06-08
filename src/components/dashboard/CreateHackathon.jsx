import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase/client';
import { Button, Card, Badge, Input } from '../ui';
import { motion, AnimatePresence } from 'framer-motion';

const CreateHackathon = () => {
  const [form, setForm] = useState({ name: '', description: '', total_rounds: '3' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [hackathons, setHackathons] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [organizerId, setOrganizerId] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) setOrganizerId(session.user.id);
      } catch (err) {
        console.warn('CreateHackathon init session lookup failed:', err);
      }
      fetchHackathons();
    };
    init();
  }, []);

  const fetchHackathons = async () => {
    if (!organizerId) {
      // If organizerId isn't available yet, try to get it from session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
      setOrganizerId(session.user.id);
      
      setFetching(true);
      try {
        const { data, error: fetchErr } = await supabase
          .from('hackathons')
          .select('*')
          .eq('organizer_id', session.user.id)
          .order('created_at', { ascending: false });
        if (!fetchErr) setHackathons(data || []);
      } catch (err) {
        console.error('Fetch hackathons error:', err);
      } finally {
        setFetching(false);
      }
      return;
    }

    setFetching(true);
    try {
      const { data, error: fetchErr } = await supabase
        .from('hackathons')
        .select('*')
        .eq('organizer_id', organizerId)
        .order('created_at', { ascending: false });
      if (!fetchErr) setHackathons(data || []);
    } catch (err) {
      console.error('Fetch hackathons error:', err);
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const name = form.name.trim();
    const description = form.description.trim();
    const rounds = parseInt(form.total_rounds);

    if (!name) { setError('Event name is required.'); return; }
    if (!description) { setError('Description is required.'); return; }
    if (isNaN(rounds) || rounds < 1 || rounds > 10) { 
      setError('Please specify between 1 and 10 rounds.'); 
      return; 
    }

    setLoading(true);
    setError('');
    setSuccess('');

    let finalOrganizerId = organizerId;
    if (!finalOrganizerId) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        finalOrganizerId = session.user.id;
        setOrganizerId(finalOrganizerId);
      }
    }

    if (!finalOrganizerId) {
      setError('Auth session lost. Please re-login.');
      setLoading(false);
      return;
    }

    try {
      console.log('Attempting to create hackathon with ID:', finalOrganizerId);
      
      const payload = {
        name,
        description,
        total_rounds: rounds,
        organizer_id: finalOrganizerId,
        status: 'active',
      };

      const { data, error: insertError, status, statusText } = await supabase
        .from('hackathons')
        .insert([payload])
        .select();

      if (insertError) {
        console.error('Supabase Insert Error:', insertError);
        throw new Error(`${insertError.message} (Status: ${status} ${statusText})`);
      }

      console.log('Insert Success:', data);
      setSuccess(`"${form.name}" created successfully!`);
      setForm({ name: '', description: '', total_rounds: '3' });
      fetchHackathons();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      console.error('Final Create Error:', err);
      setError(err.message || 'Failed to create event. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await supabase.from('hackathons').delete().eq('id', id);
      fetchHackathons();
    } catch (err) {
      alert('Failed to delete: ' + err.message);
    }
  };

  return (
    <div className="space-y-12 animate-fade-in">
      {/* Create Form Card */}
      <Card className="!p-0 overflow-hidden border-2 shadow-2xl shadow-primary/5">
        <div className="px-10 py-10 border-b border-border bg-muted/30 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-primary/10 border border-primary/20 rounded-3xl flex items-center justify-center text-4xl shadow-lg">
              🚀
            </div>
            <div>
              <h2 className="text-3xl font-black tracking-tight uppercase leading-none">New <span className="text-primary">Hackathon</span></h2>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-2">Initialize evaluation cluster</p>
            </div>
          </div>
        </div>

        <div className="p-10 space-y-10">
          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-destructive/5 border border-destructive/20 rounded-xl flex items-center gap-4 text-destructive text-[10px] font-bold uppercase tracking-widest">
                <span className="text-lg">⚠️</span>
                {error}
              </motion.div>
            )}
            {success && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-green-500/5 border border-green-500/20 rounded-xl flex items-center gap-4 text-green-600 text-[10px] font-bold uppercase tracking-widest">
                <span className="text-lg">✅</span>
                {success}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Event Name</label>
              <Input
                name="name"
                value={form.name}
                onChange={handleChange}
                disabled={loading}
                placeholder="e.g. Global Tech Challenge 2026"
              />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Mission Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                disabled={loading}
                rows={4}
                placeholder="Briefly describe the hackathon objectives..."
                className="w-full bg-muted border border-border rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:outline-none resize-none transition-all"
              />
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Number of Rounds</label>
              <div className="flex flex-wrap gap-4">
                {['1', '2', '3', '4', '5'].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, total_rounds: num }))}
                    className={`px-6 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest border transition-all ${
                      form.total_rounds === num
                        ? 'bg-primary text-primary-foreground border-primary shadow-xl shadow-primary/20'
                        : 'bg-muted text-muted-foreground border-border hover:border-primary/30 hover:text-primary'
                    }`}
                  >
                    {num} Round{num !== '1' ? 's' : ''}
                  </button>
                ))}
                <div className="flex-1 min-w-[120px]">
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    placeholder="Custom"
                    value={form.total_rounds}
                    onChange={(e) => setForm(prev => ({ ...prev, total_rounds: e.target.value }))}
                    className="!py-4"
                  />
                </div>
              </div>
              <p className="text-[9px] font-medium text-muted-foreground ml-1">Maximum 10 rounds supported for weighted scoring.</p>
            </div>

            <div className="flex items-center gap-4 pt-4">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 py-6 text-xs font-bold uppercase tracking-[0.2em] shadow-xl shadow-primary/20"
              >
                {loading ? 'Initializing...' : 'Create Hackathon'}
              </Button>
              {(form.name || form.description) && (
                <Button
                  variant="ghost"
                  type="button"
                  onClick={() => { setForm({ name: '', description: '', total_rounds: '3' }); setError(''); }}
                  className="px-8"
                >
                  Clear
                </Button>
              )}
            </div>
          </form>
        </div>
      </Card>

      {/* List Card */}
      <Card className="!p-0 overflow-hidden border-2">
        <div className="px-10 py-8 border-b border-border bg-muted/30 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold uppercase tracking-tight">Active Events</h3>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
              {hackathons.length} Synced Cluster{hackathons.length !== 1 ? 's' : ''}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={fetchHackathons}>Refresh 🔄</Button>
        </div>

        <div className="divide-y divide-border">
          {fetching ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest animate-pulse">Syncing Registry...</span>
            </div>
          ) : hackathons.length === 0 ? (
            <div className="py-20 text-center opacity-30">
              <div className="text-5xl mb-4">📭</div>
              <p className="text-[10px] font-bold uppercase tracking-widest">No Events Found</p>
            </div>
          ) : (
            hackathons.map((h, i) => (
              <div 
                key={h.id} 
                className="px-10 py-8 flex items-center justify-between gap-8 hover:bg-primary/[0.02] transition-all group"
              >
                <div className="flex items-center gap-6 min-w-0">
                  <div className="w-14 h-14 bg-muted border border-border rounded-2xl flex items-center justify-center text-3xl shadow-sm group-hover:scale-110 transition-transform">
                    🏆
                  </div>
                  <div className="min-w-0 space-y-1">
                    <p className="text-lg font-black uppercase tracking-tight truncate group-hover:text-primary transition-colors">{h.name}</p>
                    <div className="flex items-center gap-3">
                      <Badge variant="completed" className="!px-3 !py-1 text-[8px]">{h.status || 'Active'}</Badge>
                      <Badge variant="primary" className="!px-3 !py-1 text-[8px]">{h.total_rounds || 3} Rounds</Badge>
                      <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                        {new Date(h.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(h.id, h.name)}
                  className="w-10 h-10 bg-muted border border-border rounded-xl flex items-center justify-center text-muted-foreground hover:text-destructive hover:border-destructive/30 transition-all opacity-0 group-hover:opacity-100 shadow-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
};

export default CreateHackathon;
