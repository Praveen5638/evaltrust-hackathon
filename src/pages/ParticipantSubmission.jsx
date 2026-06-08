import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import PPTUpload from '../components/ppt/PPTUpload';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Card, Badge } from '../components/ui';

const ParticipantSubmission = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const hackathon = location.state?.hackathon
    || JSON.parse(sessionStorage.getItem('selectedHackathon') || 'null');

  const [submitted, setSubmitted] = useState(false);
  const [submissionData, setSubmissionData] = useState(null);

  const handleUploadSuccess = (data) => {
    setSubmissionData(data);
    setSubmitted(true);
    sessionStorage.removeItem('selectedHackathon');
  };

  if (hackathon?.is_ppt_locked && !submitted) {
    return (
      <div className="max-w-2xl mx-auto py-24 text-center space-y-8 animate-fade-in">
        <div className="w-24 h-24 bg-destructive/5 rounded-full flex items-center justify-center mx-auto text-5xl opacity-40">🔒</div>
        <div className="space-y-4">
          <h2 className="text-4xl font-black uppercase tracking-tight">Submissions <span className="text-primary">Closed</span></h2>
          <p className="text-muted-foreground text-lg font-medium">The registration window for "{hackathon.name}" has officially ended. Please contact the event organizer for further assistance.</p>
        </div>
        <Button variant="outline" onClick={() => navigate('/hackathons')} className="px-10 py-4 rounded-xl">Return to Event List</Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-fade-in">
      <AnimatePresence mode="wait">
        {!submitted ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Header */}
            <div className="text-center space-y-2">
              <div className="flex justify-center mb-4">
                {hackathon ? (
                  <Badge variant="primary" className="text-[10px]">Submit for {hackathon.name}</Badge>
                ) : (
                  <Badge variant="primary" className="text-[10px]">Project Submission</Badge>
                )}
              </div>
              <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-none uppercase">
                Submit <span className="text-primary">Project</span>
              </h1>
              <p className="text-muted-foreground text-xs md:text-sm max-w-2xl mx-auto font-medium">
                {hackathon
                  ? `Upload your presentation and project details for "${hackathon.name}".`
                  : 'Establish your project presence for the decentralized evaluation protocol.'}
              </p>
            </div>

            {/* Form Content */}
            <Card className="!p-0 border-2 shadow-2xl shadow-primary/5 overflow-hidden">
              <PPTUpload onUploadSuccess={handleUploadSuccess} hackathonId={hackathon?.id} />
            </Card>

            <div className="text-center">
              <Button variant="ghost" size="sm" onClick={() => navigate('/hackathons')}>
                ← Back to Hackathons
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl mx-auto text-center space-y-10"
          >
            <div className="space-y-6">
              <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-12 text-6xl shadow-2xl">
                ✅
              </div>
              <h2 className="text-5xl font-black tracking-tight uppercase leading-none">Submission <span className="text-primary">Logged</span></h2>
              <p className="text-muted-foreground text-lg font-medium">
                Your project has been successfully added to the evaluation queue.
              </p>
            </div>

            <Card className="!p-8 text-left space-y-6 border-2 bg-muted/30">
              <div className="space-y-4">
                {hackathon && (
                  <div className="flex justify-between items-center pb-4 border-b border-border">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Event</span>
                    <span className="text-sm font-bold text-primary uppercase">{hackathon.name}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pb-4 border-b border-border">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Status</span>
                  <Badge variant="completed">Verified Sync</Badge>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-border">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Team Name</span>
                  <span className="text-2xl font-black uppercase text-foreground">{submissionData?.team_name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Timestamp</span>
                  <span className="text-xs font-bold text-muted-foreground uppercase">{new Date().toLocaleString()}</span>
                </div>
              </div>
            </Card>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={() => navigate('/hackathons')}
                className="flex-1 py-5 rounded-2xl"
              >
                Browse Registry
              </Button>
              <Button
                variant="secondary"
                onClick={() => navigate('/')}
                className="flex-1 py-5 rounded-2xl"
              >
                Return to Home
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ParticipantSubmission;
