import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { supabase } from '../../supabase/client';
import { Button, Card, Badge } from '../ui';
import { motion } from 'framer-motion';

const TeamQRList = ({ hackathonId }) => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeams();
  }, [hackathonId]);

  const fetchTeams = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .eq('hackathon_id', hackathonId)
      .order('team_name', { ascending: true });
    
    if (error) console.error('Error fetching teams:', error);
    setTeams(data || []);
    setLoading(false);
  };

  const handlePrint = () => {
    window.print();
  };

  const downloadQR = (teamId, teamName) => {
    const svg = document.getElementById(`qr-${teamId}`);
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `QR_${teamName.replace(/\s+/g, '_')}.png`;
      downloadLink.href = `${pngFile}`;
      downloadLink.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  if (loading) return <div className="py-20 text-center animate-pulse">Generating Manifests...</div>;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 no-print">
        <div className="space-y-1 text-center md:text-left">
          <h3 className="text-xl font-black uppercase tracking-tight">Team QR <span className="text-primary">Manifests</span></h3>
          <p className="text-xs text-muted-foreground font-medium">Generate physical identifiers for judge scanning and authentication.</p>
        </div>
        <Button onClick={handlePrint} className="rounded-xl px-8 shadow-xl shadow-primary/20">
          🖨️ Print All Cards
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 print:grid-cols-2 print:gap-4">
        {teams.map((team) => (
          <motion.div key={team.id} whileHover={{ y: -5 }} className="break-inside-avoid">
            <Card className="h-full flex flex-col items-center p-8 border-2 hover:border-primary/20 transition-all text-center relative overflow-hidden group bg-background">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-primary/10 group-hover:bg-primary transition-colors"></div>
              
              <div className="relative mb-8">
                <div className="p-5 bg-white rounded-[2.5rem] shadow-2xl border border-border group-hover:border-primary/20 transition-all relative z-10">
                  <QRCodeSVG 
                    id={`qr-${team.id}`}
                    value={JSON.stringify({ 
                      teamId: team.id, 
                      teamName: team.team_name,
                      hackathonId: hackathonId 
                    })} 
                    size={150}
                    level="M"
                    includeMargin={true}
                  />
                </div>
                <div className="absolute -inset-4 bg-primary/5 rounded-[3rem] blur-2xl group-hover:bg-primary/10 transition-all -z-10"></div>
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-primary text-[8px] font-black text-primary-foreground px-4 py-1 rounded-full z-20 shadow-lg tracking-[0.2em] uppercase">
                  Scan to Evaluate
                </div>
              </div>

              <div className="space-y-2 mb-6">
                <h4 className="text-lg font-black uppercase tracking-tight leading-tight group-hover:text-primary transition-colors">
                  {team.team_name}
                </h4>
                <div className="flex flex-wrap justify-center gap-1">
                  <Badge variant="primary" className="text-[8px] opacity-70">TABLE {team.table_number || 'N/A'}</Badge>
                  <Badge variant="secondary" className="text-[8px] opacity-70">ROUND {team.round_status || 1}</Badge>
                </div>
              </div>

              <div className="mt-auto w-full pt-4 border-t border-border no-print">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full text-[10px] font-black uppercase tracking-widest opacity-40 hover:opacity-100"
                  onClick={() => downloadQR(team.id, team.team_name)}
                >
                  Download PNG
                </Button>
              </div>

              {/* Print-only footer for each card */}
              <div className="hidden print:block absolute bottom-2 right-4 text-[6px] font-black uppercase tracking-widest opacity-20">
                EvalTrust Protocol
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {teams.length === 0 && (
        <Card className="py-24 text-center border-dashed">
          <div className="text-6xl opacity-10 mb-6">🎫</div>
          <h3 className="text-2xl font-black uppercase mb-2">No Active Teams</h3>
          <p className="text-muted-foreground max-w-sm mx-auto">Promote teams from the shortlist phase to generate their unique manifest IDs.</p>
        </Card>
      )}

      <style jsx="true">{`
        @media print {
          body * { visibility: hidden; }
          .print, .print * { visibility: visible; }
          .no-print { display: none !important; }
          .print {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          @page {
            margin: 1cm;
          }
        }
      `}</style>
    </div>
  );
};

export default TeamQRList;
