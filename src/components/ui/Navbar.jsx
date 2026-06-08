import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { supabase } from '../../supabase/client';
import ThemeToggle from '../ThemeToggle';
import { Button } from './index';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user || null);
      } catch (err) {
        console.warn('Navbar session lookup aborted:', err);
      }
    };
    getSession();

    let subscription = null;
    try {
      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user || null);
      });
      subscription = data?.subscription || null;
    } catch (err) {
      console.warn('Navbar auth subscription failed:', err);
    }

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const role = user?.user_metadata?.role || 'public';

  const getNavLinks = () => {
    if (role === 'organizer') {
      return [
        { name: 'Dashboard', path: '/organizer/dashboard' },
        { name: 'Judges', path: '/organizer/judges' },
        { name: 'Create', path: '/organizer/create' },
        { name: 'Results', path: '/results' },
      ];
    }
    if (role === 'judge') {
      return [
        { name: 'Judge Home', path: '/judge/dashboard' },
      ];
    }
    return [
      { name: 'Submit PPT', path: '/submit' },
    ];
  };

  const navLinks = getNavLinks();

  return (
    <nav className="sticky top-0 z-[100] w-full glass border-b border-border px-4 md:px-6 py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Left: Logo */}
        <div 
          onClick={() => { navigate('/'); setIsOpen(false); }} 
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-primary-foreground font-black text-xl shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform duration-300">
            E
          </div>
          <span className="text-xl font-bold text-foreground tracking-tight">
            Eval<span className="text-primary">Trust</span>
          </span>
        </div>

        {/* Right: Desktop Links & Actions */}
        <div className="flex items-center gap-4 md:gap-6">
          <div className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                className={({ isActive }) =>
                  `text-sm font-semibold transition-all duration-300 hover:text-primary ${
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
          </div>

          <div className="flex items-center gap-2 md:gap-3 lg:border-l lg:border-border lg:pl-6">
            <ThemeToggle />
            {user ? (
              <div className="hidden sm:flex items-center gap-3">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest hidden xl:block">
                  {user.user_metadata?.full_name || user.email.split('@')[0]}
                </span>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  Logout
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => navigate('/login')}
                size="sm"
                className="hidden sm:flex"
              >
                Get Started
              </Button>
            )}
            
            {/* Mobile Menu Button */}
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-muted border border-border"
            >
              <div className="w-5 flex flex-col gap-1">
                <motion.span 
                  animate={isOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
                  className="w-full h-0.5 bg-foreground rounded-full block origin-center"
                />
                <motion.span 
                  animate={isOpen ? { opacity: 0 } : { opacity: 1 }}
                  className="w-full h-0.5 bg-foreground rounded-full block"
                />
                <motion.span 
                  animate={isOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
                  className="w-full h-0.5 bg-foreground rounded-full block origin-center"
                />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden absolute top-full left-0 w-full bg-background/95 backdrop-blur-xl border-b border-border overflow-hidden"
          >
            <div className="p-6 space-y-4">
              {navLinks.map((link) => (
                <NavLink
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) =>
                    `block p-4 rounded-xl text-lg font-bold transition-all ${
                      isActive ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-muted'
                    }`
                  }
                >
                  {link.name}
                </NavLink>
              ))}
              <div className="pt-4 border-t border-border">
                {user ? (
                  <Button onClick={handleLogout} className="w-full py-6 text-lg rounded-2xl" variant="outline">
                    Logout
                  </Button>
                ) : (
                  <Button
                    onClick={() => { navigate('/login'); setIsOpen(false); }}
                    className="w-full py-6 text-lg rounded-2xl"
                  >
                    Get Started
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
