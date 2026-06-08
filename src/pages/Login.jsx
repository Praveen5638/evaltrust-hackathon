import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Card, Input } from '../components/ui';

const Login = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState('signin'); // 'signin' | 'signup'

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    // Check if already logged in
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const role = session.user.user_metadata?.role || 'judge';
          let hackathonId = session.user.user_metadata?.hackathon_id;
          
          if (role === 'organizer') {
            navigate('/organizer/dashboard');
          } else {
            // Fallback check
            if (!hackathonId) {
              const { data: judgeData } = await supabase
                .from('judges')
                .select('hackathon_id')
                .eq('email', session.user.email)
                .maybeSingle();
              hackathonId = judgeData?.hackathon_id;
            }
            
            if (hackathonId) {
              navigate(`/judge/${hackathonId}/terminal`);
            } else {
              navigate('/judge/unassigned/terminal');
            }
          }
        }
      } catch (err) {
        console.warn('Login session verification failed/aborted:', err);
      }
    };
    checkUser();
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) throw authError;
      
      const role = data.user.user_metadata?.role || 'judge';
      let hackathonId = data.user.user_metadata?.hackathon_id;
      
      if (role === 'organizer') {
        navigate('/organizer/dashboard');
      } else {
        // Security Check: Verify judge existence in public table
        const { data: judgeData } = await supabase
          .from('judges')
          .select('id, hackathon_id')
          .eq('email', email)
          .maybeSingle();

        if (!judgeData) {
          await supabase.auth.signOut();
          setError('Access Denied. This account has been deactivated by the organizer.');
          setLoading(false);
          return;
        }

        hackathonId = judgeData.hackathon_id;
        
        if (hackathonId) {
          navigate(`/judge/${hackathonId}/terminal`);
        } else {
          navigate('/judge/unassigned/terminal');
        }
      }
    } catch (err) {
      setError(err.message || 'Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { 
            role: 'organizer', // Strictly registering as Organizer
            full_name: name 
          },
        },
      });
      
      if (signUpError) throw signUpError;
      
      setSuccess('Account created! Please check your email for confirmation.');
      setTab('signin');
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-[440px] w-full"
      >
        <Card className="!p-8 md:!p-10 border-2 shadow-2xl shadow-primary/5">
          {/* Header */}
          <div className="text-center mb-10 space-y-3">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto text-3xl shadow-inner">
               🔐
            </div>
            <h2 className="text-3xl font-black tracking-tight uppercase">
              Official <span className="text-primary">Portal</span>
            </h2>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
              Access evaluation and management protocols
            </p>
          </div>

          {/* Tab Selection */}
          <div className="flex bg-muted rounded-2xl p-1 mb-8 border border-border">
             {['signin', 'signup'].map((t) => (
               <button
                 key={t}
                 onClick={() => { setTab(t); setError(''); setSuccess(''); }}
                 className={`flex-1 py-3 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl transition-all ${
                   tab === t ? 'bg-background text-primary shadow-sm border border-border' : 'text-muted-foreground hover:text-foreground'
                 }`}
               >
                 {t === 'signin' ? 'Sign In' : 'Register'}
               </button>
             ))}
          </div>

          {/* Messages */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} 
                className="p-4 bg-destructive/5 border border-destructive/20 text-destructive rounded-xl mb-6 text-[10px] font-bold uppercase tracking-widest"
              >
                 ⚠️ {error}
              </motion.div>
            )}
            {success && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} 
                className="p-4 bg-green-500/5 border border-green-500/20 text-green-600 rounded-xl mb-6 text-[10px] font-bold uppercase tracking-widest"
              >
                 ✅ {success}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Forms */}
          <form onSubmit={tab === 'signin' ? handleLogin : handleSignUp} className="space-y-6">
            <AnimatePresence mode="wait">
              {tab === 'signup' && (
                <motion.div 
                  key="name" 
                  initial={{ opacity: 0, height: 0 }} 
                  animate={{ opacity: 1, height: 'auto' }} 
                  exit={{ opacity: 0, height: 0 }}
                >
                  <Input 
                    label="Full Name" 
                    type="text" 
                    required 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    placeholder="e.g. Jane Doe" 
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <Input 
              label="Email Address" 
              type="email" 
              required 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="user@example.com" 
            />
            
            <Input 
              label="Password" 
              type="password" 
              required 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="••••••••" 
            />

            <AnimatePresence mode="wait">
              {tab === 'signup' && (
                <motion.div 
                  key="confirm" 
                  initial={{ opacity: 0, height: 0 }} 
                  animate={{ opacity: 1, height: 'auto' }} 
                  exit={{ opacity: 0, height: 0 }}
                >
                  <Input 
                    label="Confirm Password" 
                    type="password" 
                    required 
                    value={confirmPassword} 
                    onChange={(e) => setConfirmPassword(e.target.value)} 
                    placeholder="••••••••" 
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <Button type="submit" disabled={loading} className="w-full py-6 text-xs font-bold uppercase tracking-widest shadow-xl shadow-primary/20">
              {loading ? 'Processing...' : tab === 'signin' ? 'Sign In' : 'Create Organizer Account'}
            </Button>
          </form>

          <div className="mt-10 pt-6 border-t border-border text-center">
             <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.4em] opacity-40">
               Protected by Secure Consensus Protocol
             </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default Login;
