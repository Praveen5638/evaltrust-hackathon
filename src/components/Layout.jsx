import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../supabase/client';
import Navbar from './ui/Navbar';
import { motion, AnimatePresence } from 'framer-motion';

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [isDbOffline, setIsDbOffline] = useState(false);

  useEffect(() => {
    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
        setRole(session?.user?.user_metadata?.role ?? null);
      } catch (err) {
        console.warn('Supabase Connection Notice: Central DB is currently offline/paused.', err);
        setIsDbOffline(true);
      }
    };
    getSession();

    let subscription = null;
    try {
      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
        setRole(session?.user?.user_metadata?.role ?? null);
      });
      subscription = data?.subscription || null;
    } catch (err) {
      console.warn('Auth subscription notice:', err);
    }

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, []);

  const isRevealPage = location.pathname.includes('/demo-result') || (location.pathname.includes('/results/') && location.pathname.split('/').length > 2);

  return (
    <div className="min-h-screen flex flex-col bg-background transition-colors duration-500 relative selection:bg-primary/20">
      {/* Offline Database Notification Banner */}
      {isDbOffline && (
        <div className="bg-amber-50 border-b border-amber-200 py-3 px-4 text-center z-[110] relative animate-fade-in no-print flex items-center justify-center gap-3">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
          </span>
          <p className="text-xs font-bold text-amber-800 uppercase tracking-widest leading-none">
            📡 Service Notice: Central Database node is paused or offline. Running in secure Offline Simulation Mode.
          </p>
        </div>
      )}

      {/* Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[80%] md:w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[80%] md:w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {!isRevealPage && <Navbar />}

      <main className="flex-grow relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="w-full h-full"
          >
            <div className={isRevealPage ? "" : "max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-10"}>
              <Outlet />
            </div>
          </motion.div>
        </AnimatePresence>
      </main>

      {!isRevealPage && (
        <footer className="py-12 border-t border-border relative z-10 bg-background/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 md:px-6 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold text-sm">E</div>
              <span className="text-lg font-bold text-foreground">Eval<span className="text-primary">Trust</span></span>
            </div>
            
            <div className="flex flex-wrap justify-center gap-6 md:gap-8 text-sm font-medium text-muted-foreground">
              <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-primary transition-colors">Contact</a>
            </div>

            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} EvalTrust. All rights reserved.
            </p>
          </div>
        </footer>
      )}
    </div>
  );
};

export default Layout;
