import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NavLink } from 'react-router-dom';
import { Button, Card, Badge } from '../components/ui';

// Premium Visual Asset Imports
import heroDashboard from '../hero_dashboard.png';
import heroTrophy from '../hero_trophy.png';
import heroShield from '../hero_shield.png';

const LandingPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [activeSlide, setActiveSlide] = useState(0);
  const slides = [
    {
      title: "Evaluate with Unrivaled Precision",
      subtitle: "The all-in-one platform for high-integrity hackathons.",
      cta: "Get Started Free",
      color: "from-primary via-blue-500 to-primary",
      image: heroDashboard
    },
    {
      title: "Cinematic Result Reveal Sequences",
      subtitle: "Experience the thrill of victory with high-impact visuals.",
      cta: "See Case Studies",
      color: "from-purple-500 via-pink-500 to-purple-500",
      image: heroTrophy
    },
    {
      title: "Decentralized Judging Protocol",
      subtitle: "Fairness guaranteed through secure consensus mechanisms.",
      cta: "Learn More",
      color: "from-emerald-500 via-teal-500 to-emerald-500",
      image: heroShield
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const testimonials = [
    {
      name: "Alex Rivera",
      role: "Director of Engineering, TechFlow",
      text: "EvalTrust transformed how we manage our internal hackathons. The cinematic reveal is a crowd favorite every time!",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex"
    },
    {
      name: "Sarah Chen",
      role: "Founder, InnovateHQ",
      text: "The split-layout evaluation terminal is a game changer for judges. It's so intuitive and fast.",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah"
    },
    {
      name: "Marcus Thorne",
      role: "Hackathon Organizer, DevSummit",
      text: "Finally, a platform that understands the scale of global tech events. Secure, robust, and beautiful.",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus"
    }
  ];

  const features = [
    { 
      title: 'Seamless PPT Uploads', 
      desc: 'Hassle-free presentation management with secure cloud storage and real-time syncing.', 
      icon: '📤'
    },
    { 
      title: 'Live Evaluation', 
      desc: 'Real-time scoring system with dynamic round weighting and instant judge feedback.', 
      icon: '⚖️'
    },
    { 
      title: 'Cinematic Results', 
      desc: 'Experience the thrill of victory with our high-impact, cinematic winner reveal sequences.', 
      icon: '🏆'
    },
    { 
      title: 'Secure Registry', 
      desc: 'Immutable scoring ledger powered by secure protocols to ensure 100% fair consensus.', 
      icon: '🛡️'
    }
  ];

  return (
    <div className="space-y-16 pb-20 overflow-hidden">
      {/* 🌌 HERO SLIDER */}
      <section className="relative min-h-[70vh] flex flex-col items-center justify-center pt-8">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-1/4 -left-1/4 w-[60%] h-[60%] bg-primary/10 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-1/4 -right-1/4 w-[60%] h-[60%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse delay-1000"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSlide}
              initial={{ opacity: 0, x: 20, filter: 'blur(10px)' }}
              animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, x: -20, filter: 'blur(10px)' }}
              transition={{ duration: 0.8, ease: "circOut" }}
              className="grid lg:grid-cols-2 gap-16 items-center"
            >
              <div className="space-y-6 md:space-y-8 text-center lg:text-left">
                <Badge variant="primary" className="mx-auto lg:mx-0 animate-bounce-slow">
                  Next-Gen Evaluation Protocol
                </Badge>
                
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] text-foreground">
                  {slides[activeSlide].title.split(' ').map((word, i) => (
                    <span key={i} className={i === 2 ? `text-transparent bg-clip-text bg-gradient-to-r ${slides[activeSlide].color}` : ""}>
                      {word}{" "}
                    </span>
                  ))}
                </h1>

                <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground font-medium leading-relaxed max-w-xl mx-auto lg:mx-0">
                  {slides[activeSlide].subtitle}
                </p>

                <div className="flex flex-wrap items-center gap-4 md:gap-6 pt-6 justify-center lg:justify-start">
                  <NavLink to="/login" className="w-full sm:w-auto">
                    <Button size="lg" className="w-full sm:w-auto px-10 py-6 text-lg rounded-2xl shadow-2xl shadow-primary/20 group">
                      {slides[activeSlide].cta}
                      <svg className="ml-2 w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                    </Button>
                  </NavLink>
                  <NavLink to="/status" className="w-full sm:w-auto">
                    <Button variant="outline" size="lg" className="w-full sm:w-auto px-10 py-6 text-lg rounded-2xl border-2 border-primary/20 hover:bg-primary/5 text-primary">
                      🔍 Track Submission
                    </Button>
                  </NavLink>
                  <NavLink to="/demo-result" className="w-full sm:w-auto">
                    <Button size="lg" className="w-full sm:w-auto px-10 py-6 text-lg rounded-2xl bg-gradient-to-r from-orange-400 to-pink-500 hover:opacity-90 border-0 shadow-xl shadow-orange-500/20">
                      🍭 Demo Reveal
                    </Button>
                  </NavLink>
                </div>

                <div className="flex items-center gap-4 pt-12 justify-center lg:justify-start">
                  <div className="flex -space-x-3">
                    {[1, 2, 3, 4].map(i => (
                      <img key={i} src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i+10}`} className="w-10 h-10 rounded-full border-2 border-background" alt="User" />
                    ))}
                  </div>
                  <p className="text-sm font-bold text-muted-foreground">
                    <span className="text-foreground">2,500+</span> organizers already trust us
                  </p>
                </div>
              </div>

              <div className="hidden lg:flex justify-center relative w-full">
                <motion.div
                  initial={{ scale: 0.8, rotate: -5 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 1 }}
                  className="relative z-10 w-[420px] h-[340px] rounded-[2.5rem] overflow-hidden border-2 border-primary/20 shadow-2xl bg-card/50 flex items-center justify-center p-6 group/hero backdrop-blur-sm"
                >
                  <img 
                    src={slides[activeSlide].image} 
                    alt="Evaluation Vector Illustration" 
                    className="w-full h-full object-contain rounded-2xl group-hover/hero:scale-105 transition-transform duration-700" 
                  />
                  <div className="absolute inset-0 bg-primary/10 blur-[100px] rounded-full -z-10 animate-pulse"></div>
                </motion.div>
                
                {/* Floating Stats UI */}
                <Card className="absolute top-10 right-0 !p-6 glass animate-float delay-700 shadow-2xl border-primary/20">
                  <div className="flex items-center gap-4">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <p className="text-xs font-black uppercase tracking-widest">Live Sync Active</p>
                  </div>
                </Card>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Slider Indicators */}
          <div className="flex justify-center lg:justify-start gap-3 mt-16">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveSlide(i)}
                className={`h-2 transition-all duration-500 rounded-full ${
                  activeSlide === i ? 'w-12 bg-primary' : 'w-4 bg-muted hover:bg-primary/50'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 🏢 TRUSTED BY */}
      <section className="max-w-7xl mx-auto px-6 overflow-hidden">
        <p className="text-center text-[10px] font-black text-muted-foreground uppercase tracking-[0.5em] mb-12">Authorized Node Clusters</p>
        <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-30 grayscale hover:grayscale-0 transition-all duration-700">
          {['Google', 'Microsoft', 'Amazon', 'Meta', 'Netflix', 'Tesla'].map(logo => (
            <span key={logo} className="text-3xl font-black tracking-tighter text-foreground">{logo}</span>
          ))}
        </div>
      </section>

      {/* 🧱 FEATURE GRID */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-24 space-y-4">
          <Badge variant="primary" className="mb-4">Global Infrastructure</Badge>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-none">Built for <span className="text-primary">High-Stakes</span></h2>
          <p className="text-muted-foreground text-xl max-w-2xl mx-auto font-medium">
            A comprehensive suite of tools designed to ensure transparency and excitement at scale.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="h-full border-2 hover:border-primary/20 group relative overflow-hidden transition-all duration-500">
                <div className="absolute -right-4 -bottom-4 text-8xl opacity-[0.03] group-hover:opacity-[0.07] transition-all duration-700 rotate-12 group-hover:rotate-0">
                  {feature.icon}
                </div>
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-8 group-hover:scale-110 transition-transform duration-500 bg-primary/10 text-primary`}>
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-black mb-4 uppercase tracking-tight">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed font-medium">
                  {feature.desc}
                </p>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 💬 TESTIMONIALS */}
      <section className="bg-muted/30 py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
             <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-6">User <span className="text-primary">Consensus</span></h2>
             <p className="text-muted-foreground font-medium uppercase tracking-[0.2em] text-xs">Vetted by the global community</p>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
              >
                <Card className="h-full !p-10 flex flex-col justify-between border-2 hover:border-primary/30 transition-all duration-500 shadow-xl shadow-primary/5">
                  <div className="space-y-6">
                    <div className="text-4xl text-primary opacity-20">"</div>
                    <p className="text-lg font-medium leading-relaxed italic text-foreground">
                      {t.text}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-5 mt-12 pt-8 border-t border-border">
                    <img src={t.avatar} alt={t.name} className="w-14 h-14 rounded-2xl border-2 border-primary/20 shadow-lg" />
                    <div>
                      <p className="font-black text-foreground uppercase tracking-tight">{t.name}</p>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{t.role}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 📊 GLOBAL STATS */}
      <section className="max-w-7xl mx-auto px-6">
        <Card className="!p-12 text-center border-0 bg-primary/[0.03] overflow-hidden relative group">
          <div className="absolute inset-0 bg-grid-primary opacity-5"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 relative z-10">
            {[
              { label: 'Events Managed', value: '1,200+' },
              { label: 'Project Nodes', value: '15,000+' },
              { label: 'Arbiter Nodes', value: '500+' },
              { label: 'Uptime Relay', value: '99.9%' }
            ].map((stat, i) => (
              <div key={i} className="space-y-3 group/stat">
                <p className="text-5xl md:text-6xl font-black text-primary tracking-tighter group-hover/stat:scale-110 transition-transform duration-500">{stat.value}</p>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">{stat.label}</p>
              </div>
            ))}
          </div>
        </Card>
      </section>

      {/* ❓ FAQ SECTION */}
      <section className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black tracking-tight">Vetting <span className="text-primary">FAQ</span></h2>
        </div>
        <div className="space-y-4">
          {[
            { q: "How is evaluation integrity maintained?", a: "We use a decentralized consensus model where multiple arbiter nodes must verify and sign off on results before they are manifesting on the global registry." },
            { q: "Is there a limit on participant nodes?", a: "Our architecture is horizontally scalable, supporting events ranging from local meetups to global hackathons with 10,000+ participants." },
            { q: "Can we customize the vetting criteria?", a: "Absolutely. Organizers can define custom neural weights and scoring categories for each individual round of evaluation." }
          ].map((faq, i) => (
            <Card key={i} className="!p-8 group cursor-pointer hover:border-primary/20 transition-all">
              <h4 className="text-xl font-bold mb-4 flex items-center justify-between group-hover:text-primary transition-colors">
                {faq.q}
                <span className="text-primary opacity-20">→</span>
              </h4>
              <p className="text-muted-foreground font-medium leading-relaxed">
                {faq.a}
              </p>
            </Card>
          ))}
        </div>
      </section>

      {/* ⚡ FINAL CTA */}
      <section className="relative py-40 overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 skew-y-3 -z-10"></div>
        <div className="max-w-7xl mx-auto px-6 text-center space-y-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-none mb-8">
              Initiate your next <br /> <span className="text-primary">Grand Reveal.</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-medium mb-12">
              Join the elite circle of organizers who demand nothing but the best for their tech communities.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-6">
              <NavLink to="/login">
                <Button size="lg" className="px-16 py-8 text-xl rounded-2xl shadow-2xl shadow-primary/20">
                  Launch Terminal
                </Button>
              </NavLink>
              <NavLink to="/demo-result">
                <Button variant="outline" size="lg" className="px-16 py-8 text-xl rounded-2xl glass border-orange-500/50 text-orange-600">
                  🍭 Try Demo Reveal
                </Button>
              </NavLink>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 📧 FOOTER */}
      <footer className="max-w-7xl mx-auto px-6 border-t border-border pt-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-16 mb-20">
          <div className="col-span-2 space-y-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-primary/20">E</div>
              <span className="text-2xl font-black tracking-tighter uppercase">EvalTrust</span>
            </div>
            <p className="text-muted-foreground font-medium max-w-xs leading-relaxed">
              The world's most advanced platform for tech evaluation and event management.
            </p>
          </div>
          <div className="space-y-6">
            <h5 className="text-xs font-black uppercase tracking-[0.4em] text-foreground">Protocol</h5>
            <ul className="space-y-4 text-sm font-bold text-muted-foreground">
              <li className="hover:text-primary cursor-pointer transition-colors">Manifests</li>
              <li className="hover:text-primary cursor-pointer transition-colors">Consensus</li>
              <li className="hover:text-primary cursor-pointer transition-colors">Security</li>
            </ul>
          </div>
          <div className="space-y-6">
            <h5 className="text-xs font-black uppercase tracking-[0.4em] text-foreground">Connect</h5>
            <ul className="space-y-4 text-sm font-bold text-muted-foreground">
              <li className="hover:text-primary cursor-pointer transition-colors">Twitter / X</li>
              <li className="hover:text-primary cursor-pointer transition-colors">Discord</li>
              <li className="hover:text-primary cursor-pointer transition-colors">Email Terminal</li>
            </ul>
          </div>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center py-10 border-t border-border gap-6">
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.6em]">
            © {new Date().getFullYear()} EvalTrust Engine // Protocol v4.2.0
          </p>
          <div className="flex gap-10">
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest hover:text-primary cursor-pointer transition-colors">Privacy Privacy</span>
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest hover:text-primary cursor-pointer transition-colors">Terms of Service</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;