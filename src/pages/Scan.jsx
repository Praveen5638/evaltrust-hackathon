import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import { supabase } from '../supabase/client';
import { getAssignedTeams } from '../supabase/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Card, Badge } from '../components/ui';

const Scan = () => {
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState('');
  const [validating, setValidating] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [hackathonId, setHackathonId] = useState(location.state?.hackathonId || sessionStorage.getItem('last_hackathon_id'));
  const html5QrCodeRef = useRef(null);

  useEffect(() => {
    if (location.state?.hackathonId) {
      sessionStorage.setItem('last_hackathon_id', location.state.hackathonId);
    }
  }, [location.state]);

  useEffect(() => {
    // Initializing the low-level API
    const html5QrCode = new Html5Qrcode("reader");
    html5QrCodeRef.current = html5QrCode;

    startScanner();

    return () => {
      stopScanner();
    };
  }, []);

  const startScanner = async () => {
    if (!html5QrCodeRef.current) return;
    
    try {
      setError('');
      setIsCameraActive(false);
      
      const config = { 
        fps: 10, 
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0
      };

      await html5QrCodeRef.current.start(
        { facingMode: "environment" }, 
        config, 
        onScanSuccess,
        onScanError
      );
      setIsCameraActive(true);
    } catch (err) {
      console.error("Failed to start scanner:", err);
      setError("Camera access denied or not found. Please ensure permissions are granted.");
    }
  };

  const stopScanner = async () => {
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      try {
        await html5QrCodeRef.current.stop();
        setIsCameraActive(false);
      } catch (err) {
        console.error("Failed to stop scanner:", err);
      }
    }
  };

  const onScanSuccess = async (decodedText) => {
    try {
      // Basic validation of decoded text
      if (!decodedText.startsWith('{')) {
        // Not a JSON, ignore or show hint
        return;
      }

      const data = JSON.parse(decodedText);
      console.log("Decoded QR Data:", data);
      
      const teamId = data.team_id || data.teamId;
      const qrHackathonId = data.hackathonId || data.event_id || data.hackathon_id;
      
      if (!teamId) {
        console.error("No teamId found in QR");
        return;
      }
      
      // Use hackathonId from QR if the current one is missing
      const effectiveHackathonId = hackathonId || qrHackathonId;
      
      if (!effectiveHackathonId) {
        setError('Configuration Error: No hackathon context found. Please start from the judge dashboard.');
        return;
      }
      
      // Stop scanner immediately on success
      await stopScanner();
      
      setValidating(true);
      setError('');

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login');
        return;
      }

      console.log(`Fetching assigned teams for judge ${session.user.id} in hackathon ${effectiveHackathonId}`);
      let assignedTeams = await getAssignedTeams(session.user.id, effectiveHackathonId);
      console.log("Assigned Teams fetched:", assignedTeams);
      
      let team = assignedTeams.find(t => t.id === teamId || t.team_id === teamId);

      // FALLBACK: If not in assigned list, try fetching directly from 'teams' table
      if (!team) {
        console.log("Team not in assigned list, trying direct fetch...");
        const { data: directTeam, error: fetchError } = await supabase
          .from('teams')
          .select('*')
          .eq('id', teamId)
          .maybeSingle();
        
        if (directTeam) {
          console.log("Direct team found:", directTeam);
          // Check if already evaluated by this judge
          const { data: existingScore } = await supabase
            .from('scores')
            .select('id')
            .eq('team_id', teamId)
            .eq('judge_id', session.user.id)
            .eq('round', directTeam.round_status || 1)
            .maybeSingle();

          team = {
            ...directTeam,
            isEvaluated: !!existingScore,
            isGlobalLocked: false // We can't easily check lock here without another query, default to false
          };
          
          // Update effective hackathon ID to match the team's actual hackathon
          if (directTeam.hackathon_id) {
            setHackathonId(directTeam.hackathon_id);
            sessionStorage.setItem('last_hackathon_id', directTeam.hackathon_id);
          }
        }
      }

      if (!team) {
        setError('Registry Error: Manifest ID not found in the central database.');
        setValidating(false);
        setTimeout(startScanner, 3000);
        return;
      }

      if (effectiveHackathonId && effectiveHackathonId !== hackathonId) {
        setHackathonId(effectiveHackathonId);
        sessionStorage.setItem('last_hackathon_id', effectiveHackathonId);
      }

      setScanResult(team);
      
      // Auto-proceed to evaluation immediately
      navigate(`/judge/${effectiveHackathonId}/hackathon`, { 
        state: { autoSelectTeam: team },
        replace: true 
      });
    } catch (err) {
      console.error("Scan Success Error:", err);
      // Silently ignore parse errors as they might be partial scans
    } finally {
      setValidating(false);
    }
  };

  const handleFileUpload = async (file) => {
    if (!file) return;
    
    // Reset input so the same file can be picked again
    const input = document.getElementById('qr-input');
    if (input) input.value = '';

    try {
      setValidating(true);
      setError('');
      
      // Stop camera if active
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        try {
          await html5QrCodeRef.current.stop();
          setIsCameraActive(false);
        } catch (stopErr) {
          console.warn("Stop error during file upload:", stopErr);
        }
      }

      // Small delay to ensure camera is fully released
      await new Promise(r => setTimeout(r, 500));

      // Use a fresh instance for file scan to avoid state issues
      const tempScanner = new Html5Qrcode("reader");
      const decodedText = await tempScanner.scanFile(file, false);
      console.log("File scan success:", decodedText);
      await onScanSuccess(decodedText);
      // Clean up temp scanner
      tempScanner.clear();
    } catch (err) {
      console.error("File scan error:", err);
      setError("QR code not detected in this image. Please ensure the QR is clear and well-lit.");
      // Auto-restart camera so they can try scanning live again
      startScanner();
    } finally {
      setValidating(false);
    }
  };

  const handleProceed = () => {
    navigate(`/judge/${hackathonId}/hackathon`, { state: { autoSelectTeam: scanResult } });
  };

  const resetScanner = () => {
    setScanResult(null);
    setError('');
    startScanner();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-fade-in pb-20">
      <div className="text-center space-y-4">
        <Badge variant="primary" className="mx-auto">Optical Recognition</Badge>
        <h1 className="text-4xl md:text-6xl font-black tracking-tight">Identify <span className="text-primary">Manifest</span></h1>
        <p className="text-muted-foreground font-medium max-w-lg mx-auto">Point your camera at the team's QR manifest to sync their profile.</p>
      </div>

      <div className="max-w-xl mx-auto">
        <Card className="!p-4 border-2 shadow-2xl shadow-primary/5">
          <div className="rounded-[2rem] overflow-hidden relative bg-black aspect-square">
            {!scanResult ? (
              <div className="relative h-full w-full">
                <div id="reader" className="w-full h-full"></div>
                
                {/* Custom Overlay */}
                <div className="absolute inset-0 pointer-events-none z-10">
                   {/* Dimmed background around the center box */}
                   <div className="absolute inset-0 border-[60px] border-black/40"></div>
                   
                   {/* Viewfinder Corners */}
                   <div className="absolute top-[50px] left-[50px] w-12 h-12 border-t-4 border-l-4 border-primary rounded-tl-2xl"></div>
                   <div className="absolute top-[50px] right-[50px] w-12 h-12 border-t-4 border-r-4 border-primary rounded-tr-2xl"></div>
                   <div className="absolute bottom-[50px] left-[50px] w-12 h-12 border-b-4 border-l-4 border-primary rounded-bl-2xl"></div>
                   <div className="absolute bottom-[50px] right-[50px] w-12 h-12 border-b-4 border-r-4 border-primary rounded-br-2xl"></div>
                   
                   {/* Animated Scan Line */}
                   {isCameraActive && (
                     <motion.div 
                       animate={{ top: ['15%', '85%'] }}
                       transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                       className="absolute left-[15%] right-[15%] h-0.5 bg-primary shadow-[0_0_15px_hsl(var(--primary))]"
                     />
                   )}

                   {/* File Upload Overlay */}
                   <div className="absolute bottom-8 left-0 w-full flex justify-center px-8 pointer-events-auto">
                      <input 
                        type="file" 
                        id="qr-input" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => handleFileUpload(e.target.files[0])}
                      />
                      <Button 
                        variant="primary" 
                        className="w-full bg-primary shadow-2xl shadow-primary/40 rounded-2xl py-6 flex flex-col items-center justify-center gap-1 group transition-all hover:scale-[1.02]"
                        onClick={() => document.getElementById('qr-input').click()}
                      >
                        <span className="text-2xl group-hover:scale-125 transition-transform">📸</span>
                        <div className="text-center">
                           <p className="text-[9px] font-black uppercase tracking-[0.3em]">No Camera Access?</p>
                           <p className="font-black uppercase tracking-tighter text-xs">Upload QR from Gallery</p>
                        </div>
                      </Button>
                   </div>
                </div>

                {!isCameraActive && !error && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted/20 animate-pulse">
                     <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Initializing Camera...</span>
                  </div>
                )}
                
                <AnimatePresence>
                  {validating && (
                    <motion.div 
                      initial={{ opacity: 0 }} 
                      animate={{ opacity: 1 }} 
                      className="absolute inset-0 z-30 bg-background/90 backdrop-blur-md flex flex-col items-center justify-center space-y-6"
                    >
                      <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                      <div className="text-center">
                        <p className="text-sm font-black uppercase tracking-widest text-primary">Validating</p>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Registry Sync in Progress</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="h-full flex flex-col items-center justify-center p-10 space-y-10 text-center bg-background"
              >
                <div className="relative">
                   <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center text-5xl shadow-2xl animate-bounce-subtle">
                     ✅
                   </div>
                   <div className="absolute -inset-4 bg-primary/5 rounded-full blur-2xl -z-10"></div>
                </div>
                
                <div className="space-y-3">
                  <Badge variant="primary" className="bg-primary/20 text-primary border-primary/30">Registry Match Found</Badge>
                  <h2 className="text-4xl font-black tracking-tight leading-none uppercase">{scanResult.team_name}</h2>
                  <div className="flex items-center justify-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                    <span>Table {scanResult.table_number || '??'}</span>
                    <span className="w-1 h-1 bg-muted rounded-full"></span>
                    <span>{scanResult.members?.length || 0} Operators</span>
                  </div>
                </div>
                
                <div className="flex flex-col w-full gap-4">
                  <Button onClick={handleProceed} className="w-full py-6 rounded-2xl shadow-xl shadow-primary/20 text-xs font-bold uppercase tracking-widest">🚀 Start Evaluation</Button>
                  <Button variant="ghost" onClick={resetScanner} className="text-[9px] font-black uppercase tracking-[0.3em] opacity-40 hover:opacity-100">Reset Scanner</Button>
                </div>
              </motion.div>
            )}
          </div>
        </Card>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="mt-8 p-6 bg-destructive/5 border border-destructive/20 rounded-2xl flex items-center gap-5 text-destructive"
          >
            <span className="text-2xl">⚠️</span>
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-widest">Protocol Interrupted</p>
              <p className="text-xs font-medium leading-relaxed">{error}</p>
            </div>
          </motion.div>
        )}
      </div>

      <div className="text-center">
        <Button variant="outline" className="rounded-2xl px-12 py-4" onClick={() => navigate(hackathonId ? `/judge/${hackathonId}/terminal` : '/judge/dashboard')}>Return to Command Center</Button>
      </div>

      <style jsx="true">{`
        #reader { border: none !important; }
        #reader video { 
          width: 100% !important; 
          height: 100% !important; 
          object-fit: cover !important; 
        }
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 2s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default Scan;
