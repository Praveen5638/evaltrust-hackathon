import React from 'react';
import ResultReveal from '../components/hackathon/ResultReveal';
import { motion } from 'framer-motion';

const DemoResult = () => {
  // Mock dummy data with cartoon vibes
  const mockTeams = [
    { id: '1', team_name: '🚀 Rocket Raccoons', score: 98.5, members: ['Rigby 🦝', 'Mordecai 🐦', 'Skips 🦍'], avatar: '🦊' },
    { id: '2', team_name: '⚡ Lightning Legends', score: 94.2, members: ['Pikachu ⚡', 'Sonic 🦔', 'Flash ⚡'], avatar: '🦄' },
    { id: '3', team_name: '🍕 Pizza Panthers', score: 88.0, members: ['Leo 🐢', 'Don 🐢', 'Mikey 🐢'], avatar: '🐱' },
    { id: '4', team_name: '👾 Glitch Goblins', score: 82.5, members: ['Error 404', 'NaN', 'Null'], avatar: '🐸' },
    { id: '5', team_name: '🍔 Burger Bandits', score: 75.1, members: ['Ronald', 'Grimace', 'Hamburglar'], avatar: '🐯' },
  ];

  return (
    <div className="relative">
      {/* Cartoon floating elements for demo vibe */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-20">
         <motion.div animate={{ y: [0, -100, 0], x: [0, 50, 0] }} transition={{ duration: 10, repeat: Infinity }} className="absolute top-20 left-[10%] text-9xl">🎈</motion.div>
         <motion.div animate={{ y: [0, 100, 0], x: [0, -50, 0] }} transition={{ duration: 12, repeat: Infinity }} className="absolute bottom-40 right-[15%] text-9xl">✨</motion.div>
         <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[30rem] opacity-5">🎨</motion.div>
      </div>

      <div className="relative z-10 animate-fade-in">
        <ResultReveal 
          teams={mockTeams} 
          hackathonName="Cartoon Cosmos Hackathon" 
        />
      </div>
      
      {/* Demo watermark */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[200] bg-primary text-primary-foreground px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest shadow-2xl border border-white/20">
        Demo Mode: UI Preview Only
      </div>
    </div>
  );
};

export default DemoResult;
