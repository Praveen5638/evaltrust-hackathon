import React, { useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';

const QRCodeGenerator = ({ teams, eventId = "HACKATHON_2024" }) => {
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [qrValue, setQrValue] = useState('');
  const [showQR, setShowQR] = useState(false);

  const generateQRData = (teamId, eventId) => {
    const qrData = {
      team_id: teamId,
      event_id: eventId,
      timestamp: new Date().toISOString(),
      type: 'team_registration'
    };
    return JSON.stringify(qrData);
  };

  const handleTeamSelect = (team) => {
    setSelectedTeam(team);
    const qrData = generateQRData(team.id, eventId);
    setQrValue(qrData);
    setShowQR(true);
  };

  const downloadQRCode = () => {
    const canvas = document.getElementById('qr-code-canvas');
    if (canvas) {
      const pngUrl = canvas
        .toDataURL('image/png')
        .replace('image/png', 'image/octet-stream');
      
      const downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = `qr_${selectedTeam?.name || 'team'}_${selectedTeam?.id || 'code'}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  const printQRCode = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Signature - ${selectedTeam?.name || 'Team'}</title>
          <style>
            body { display: flex; justify-content: center; align-items: center; height: 100vh; font-family: monospace; background: #020617; color: white; }
            .qr-container { text-align: center; border: 2px solid #3b82f6; padding: 40px; border-radius: 40px; box-shadow: 0 0 50px rgba(59,130,246,0.3); }
            img { max-width: 300px; border-radius: 20px; border: 4px solid white; }
            h2 { text-transform: uppercase; letter-spacing: 0.3em; margin-bottom: 30px; }
            p { opacity: 0.5; font-size: 10px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="qr-container">
            <h2>${selectedTeam?.name || 'Team'}</h2>
            <img src="${document.getElementById('qr-code-canvas').toDataURL()}" />
            <p>MANIFEST ID: ${selectedTeam?.id}</p>
            <p>PROTOCOL: NEURAL_LINK_v4</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="card-premium p-10 md:p-16 relative overflow-hidden group/gen">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full -mr-64 -mt-64 blur-[120px] pointer-events-none group-hover/gen:bg-blue-500/10 transition-all duration-1000"></div>
      
      <div className="max-w-[1600px] mx-auto relative z-10">
        {/* Header */}
        <div className="mb-20 flex flex-col md:flex-row justify-between items-start md:items-end gap-10">
          <div className="animate-in slide-in-from-left-8 duration-700">
            <div className="flex items-center gap-4 mb-4">
              <span className="px-4 py-1 bg-blue-600 rounded-lg text-[9px] font-black uppercase tracking-[0.3em] text-white shadow-[0_0_20px_rgba(59,130,246,0.4)]">Master Terminal</span>
              <span className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.5em] opacity-40">Encryption Node Active</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-[var(--text-primary)] tracking-tighter uppercase leading-none">
              Signature <br /><span className="text-blue-500 neon-text">Generator</span>
            </h1>
          </div>
          <div className="flex items-center gap-5 bg-[var(--bg-secondary)] px-8 py-4 rounded-2xl border border-[var(--border-primary)] shadow-2xl group/status transition-all hover:border-blue-500/30">
             <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-20"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500 shadow-[0_0_10px_rgba(34,197,94,1)]"></span>
             </span>
             <span className="text-[10px] font-black text-[var(--text-primary)] uppercase tracking-[0.4em]">Generator Sync: Online</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-12">
          {/* Left: Team List */}
          <div className="lg:col-span-5 bg-[var(--bg-secondary)] rounded-[3rem] border border-[var(--border-primary)] shadow-2xl p-10 flex flex-col h-[650px] relative group/list overflow-hidden">
            <div className="absolute inset-0 bg-blue-500/0 group-hover/list:bg-blue-500/[0.02] transition-colors duration-1000"></div>
            <div className="flex items-center justify-between mb-10 relative z-10">
               <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--text-secondary)] opacity-40">Registry Manifests</h2>
               <span className="text-[10px] font-black text-blue-500 bg-blue-500/10 px-5 py-2 rounded-xl border border-blue-500/20">{teams.length} Nodes</span>
            </div>
            <div className="space-y-5 overflow-y-auto pr-4 custom-scrollbar flex-grow relative z-10">
              {teams.map((team) => (
                <button
                  key={team.id}
                  onClick={() => handleTeamSelect(team)}
                  className={`w-full text-left p-8 rounded-[2.5rem] transition-all duration-500 border relative group/team overflow-hidden ${
                    selectedTeam?.id === team.id
                      ? 'bg-blue-600 border-blue-600 shadow-[0_0_40px_rgba(59,130,246,0.3)] scale-[1.02]'
                      : 'bg-[var(--bg-primary)] border-[var(--border-primary)] hover:border-blue-500/50'
                  }`}
                >
                  <div className="relative z-10">
                    <div className="flex justify-between items-center mb-4">
                      <span className={`font-black text-2xl tracking-tighter uppercase leading-none ${selectedTeam?.id === team.id ? 'text-white' : 'text-[var(--text-primary)]'}`}>
                        {team.name}
                      </span>
                      {selectedTeam?.id === team.id && <span className="text-white text-2xl animate-pulse">🎯</span>}
                    </div>
                    <div className="flex items-center gap-5">
                       <span className={`text-[9px] font-black uppercase tracking-[0.3em] ${selectedTeam?.id === team.id ? 'text-white/60' : 'text-[var(--text-secondary)] opacity-40'}`}>Manifest: {team.id.slice(0, 12)}</span>
                       <span className={`w-1 h-1 rounded-full ${selectedTeam?.id === team.id ? 'bg-white/30' : 'bg-[var(--border-primary)]'}`}></span>
                       <span className={`text-[9px] font-black uppercase tracking-[0.3em] ${selectedTeam?.id === team.id ? 'text-white/60' : 'text-[var(--text-secondary)] opacity-40'}`}>{team.members?.length || 0} Entities</span>
                    </div>
                  </div>
                  {/* Hover Glow */}
                  <div className="absolute inset-0 bg-blue-500 opacity-0 group-hover/team:opacity-5 transition-opacity"></div>
                </button>
              ))}
            </div>
          </div>

          {/* Right: QR Code Display */}
          <div className="lg:col-span-7 bg-[var(--bg-secondary)] rounded-[3rem] border border-[var(--border-primary)] shadow-2xl p-12 flex flex-col items-center justify-center min-h-[650px] relative overflow-hidden group/display">
            <div className="absolute top-0 left-0 w-full h-[3px] bg-blue-500/10 group-hover/display:bg-blue-500 transition-all duration-700 shadow-[0_0_15px_rgba(59,130,246,1)]"></div>
            {showQR && selectedTeam ? (
              <div className="w-full animate-in zoom-in-95 duration-700">
                <div className="flex flex-col items-center">
                  <div className="bg-white p-12 rounded-[4rem] border-8 border-blue-500 shadow-[0_0_80px_rgba(59,130,246,0.3)] mb-16 relative transition-all hover:scale-105 duration-700">
                    <QRCodeCanvas
                      id="qr-code-canvas"
                      value={qrValue}
                      size={280}
                      level="H"
                      includeMargin={true}
                      bgColor="#FFFFFF"
                      fgColor="#020617"
                    />
                    {/* Corner Decor */}
                    <div className="absolute -top-4 -left-4 w-12 h-12 border-t-8 border-l-8 border-blue-400 rounded-tl-2xl"></div>
                    <div className="absolute -bottom-4 -right-4 w-12 h-12 border-b-8 border-r-8 border-blue-400 rounded-br-2xl"></div>
                  </div>

                  <div className="text-center mb-16">
                    <h3 className="font-black text-6xl text-[var(--text-primary)] tracking-tighter mb-4 leading-none uppercase">
                      {selectedTeam.name}
                    </h3>
                    <p className="text-[11px] font-black text-blue-500 uppercase tracking-[0.6em] animate-pulse">
                      Neural Link Verified Signature
                    </p>
                  </div>

                  <div className="flex flex-col md:flex-row gap-6 w-full max-w-lg">
                    <button
                      onClick={downloadQRCode}
                      className="btn-primary flex-1 py-5 text-[10px] tracking-[0.4em] flex items-center justify-center gap-4 shadow-[0_0_30px_rgba(59,130,246,0.3)]"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Store Key
                    </button>
                    
                    <button
                      onClick={printQRCode}
                      className="btn-secondary flex-1 py-5 text-[10px] tracking-[0.4em] flex items-center justify-center gap-4"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                      </svg>
                      Print ID
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center group-hover/display:scale-105 transition-transform duration-1000">
                <div className="w-32 h-32 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-[3rem] flex items-center justify-center text-7xl mx-auto mb-10 shadow-2xl relative overflow-hidden">
                  <div className="absolute inset-0 bg-blue-500/5 animate-pulse"></div>
                  <span className="relative z-10 opacity-30">📑</span>
                </div>
                <h3 className="text-[var(--text-primary)] font-black text-3xl tracking-tighter mb-4 uppercase leading-none">Awaiting Manifest</h3>
                <p className="text-[var(--text-secondary)] text-[10px] font-black uppercase tracking-[0.4em] leading-relaxed opacity-20">Select a neural node to generate <br /> unique verification signatures.</p>
              </div>
            )}
          </div>
        </div>

        {/* Master Registry Action */}
        {teams.length > 0 && (
          <div className="mt-16 card-premium p-12 flex flex-col md:flex-row justify-between items-center gap-10 relative overflow-hidden group/master">
            <div className="absolute inset-0 bg-blue-500/0 group-hover/master:bg-blue-500/[0.03] transition-colors duration-1000"></div>
            <div className="flex items-center gap-8 relative z-10">
               <div className="w-20 h-20 bg-blue-600 rounded-[2.5rem] flex items-center justify-center text-5xl shadow-[0_0_30px_rgba(59,130,246,0.4)] group-hover/master:scale-110 group-hover/master:rotate-6 transition-transform duration-700">⚡</div>
               <div>
                  <h3 className="text-3xl font-black text-[var(--text-primary)] tracking-tighter uppercase leading-none mb-2">Master Registry Sync</h3>
                  <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.4em] opacity-30">Synchronize and archive all {teams.length} unique neural keys for deployment.</p>
               </div>
            </div>
            <button
              onClick={() => {
                teams.forEach(team => {
                  const qrData = generateQRData(team.id, eventId);
                  console.log(`Node ${team.name} Sync:`, qrData);
                });
                alert(`Protocol: Successfully synchronized ${teams.length} neural signatures. Check terminal logs.`);
              }}
              className="btn-primary px-12 py-5 text-[11px] tracking-[0.4em] shadow-[0_0_40px_rgba(59,130,246,0.3)] relative z-10"
            >
              Export Neural Consensus
            </button>
          </div>
        )}
      </div>
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #334155; }
      `}</style>
    </div>
  );
};

export default QRCodeGenerator;