import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Features', href: '#features' },
    { name: 'How it Works', href: '#how-it-works' },
    { name: 'Results', href: '/results', isRoute: true },
    { name: 'Pricing', href: '#pricing' },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'py-4 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm' : 'py-8 bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-sm transition-all duration-300">
              E
            </div>
            <span className="text-xl font-bold tracking-tight text-gray-800">
              EvalTrust
            </span>
          </motion.div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-10">
            <div className="flex items-center space-x-8">
              {navLinks.map((link) => (
                link.isRoute ? (
                  <Link
                    key={link.name}
                    to={link.href}
                    className="text-sm font-semibold text-gray-500 hover:text-gray-900 transition-all relative group"
                  >
                    {link.name}
                  </Link>
                ) : (
                  <a
                    key={link.name}
                    href={link.href}
                    className="text-sm font-semibold text-gray-500 hover:text-gray-900 transition-all relative group"
                  >
                    {link.name}
                  </a>
                )
              ))}
            </div>
            
            <div className="flex items-center space-x-6 pl-8 border-l border-gray-100">
              <Link to="/login" className="text-sm font-semibold text-gray-500 hover:text-gray-900 transition-all">
                Sign in
              </Link>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/login')}
                className="px-6 py-2.5 bg-blue-500 text-white rounded-xl font-bold text-sm shadow-sm hover:bg-blue-600 transition-all border border-blue-600"
              >
                Get Started
              </motion.button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-400 hover:text-gray-900 focus:outline-none transition-colors"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-gray-100 overflow-hidden shadow-2xl"
          >
            <div className="px-10 pt-6 pb-12 space-y-6">
              {navLinks.map((link) => (
                link.isRoute ? (
                  <Link
                    key={link.name}
                    to={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 hover:text-gray-900 px-6 py-3 rounded-2xl transition-all"
                  >
                    {link.name}
                  </Link>
                ) : (
                  <a
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 hover:text-gray-900 px-6 py-3 rounded-2xl transition-all"
                  >
                    {link.name}
                  </a>
                )
              ))}
              <div className="pt-8 border-t border-gray-50 flex flex-col gap-4">
                <Link
                  to="/login"
                  className="block text-center text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 hover:text-gray-900 px-6 py-3 rounded-2xl"
                >
                  Registry Login
                </Link>
                <button
                  onClick={() => navigate('/login')}
                  className="w-full px-8 py-4 rounded-2xl bg-gray-900 text-white font-bold text-[10px] uppercase tracking-[0.2em] shadow-2xl shadow-gray-200"
                >
                  Get Started
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
