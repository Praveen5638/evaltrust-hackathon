import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PPTList from '../components/ppt/PPTList';
import { Badge, Card } from '../components/ui';


const PPTPhase = () => {
  const { hackathonId } = useParams();

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-8 pb-4 border-b border-border">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Badge variant="primary">Phase 01</Badge>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight">Concept <span className="text-primary">Phase</span></h1>
          </div>
          <p className="text-muted-foreground font-medium">Manage and review all project presentations.</p>
        </div>
      </div>

      {/* Content Area */}
      <div className="min-h-[500px]">
        <div className="animate-fade-up">
           <PPTList hackathonId={hackathonId} />
        </div>
      </div>
    </div>
  );
};

export default PPTPhase;