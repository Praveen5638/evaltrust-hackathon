import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import PPTPhase from './pages/PPTPhase';
import HackathonPhase from './pages/HackathonPhase';
import OrganizerDashboard from './components/dashboard/OrganizerDashboard';
import JudgeDashboard from './components/dashboard/JudgeDashboard';
import Login from './pages/Login';
import Results from './pages/Results';
import RealResult from './pages/RealResult';
import DemoResult from './pages/DemoResult';
import HackathonSelect from './pages/HackathonSelect';
import ParticipantSubmission from './pages/ParticipantSubmission';
import Transparency from './pages/Transparency';
import Scan from './pages/Scan';
import ProjectDetail from './pages/ProjectDetail';
import Gallery from './pages/Gallery';
import ParticipantStatus from './pages/ParticipantStatus';
import ProtectedRoute from './components/auth/ProtectedRoute';

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/results" element={<Results />} />
        <Route path="/results/:id" element={<RealResult />} />
        <Route path="/transparency/:id" element={<Transparency />} />
        <Route path="/demo-result" element={<DemoResult />} />
        <Route path="/scan" element={
          <ProtectedRoute allowedRole="judge">
            <Scan />
          </ProtectedRoute>
        } />
        <Route path="/project/:teamId" element={<ProjectDetail />} />
        <Route path="/gallery/:hackathonId" element={<Gallery />} />
        <Route path="/status" element={<ParticipantStatus />} />
        
        {/* Team/Participant Routes */}
        <Route path="/submit" element={<HackathonSelect />} />
        <Route path="/submit/:hackathonId" element={<ParticipantSubmission />} />

        {/* Organizer Routes - Protected */}
        <Route path="/organizer/*" element={
          <ProtectedRoute allowedRole="organizer">
            <OrganizerDashboard />
          </ProtectedRoute>
        } />

        {/* Judge Routes - Protected */}
        <Route path="/judge/:hackathonId/*" element={
          <ProtectedRoute allowedRole="judge">
            <JudgeDashboard />
          </ProtectedRoute>
        } />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default App;