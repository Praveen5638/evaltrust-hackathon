import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase } from '../../supabase/client';

const ProtectedRoute = ({ children, allowedRole }) => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setUser(session.user);
        }
      } catch (err) {
        console.warn('ProtectedRoute checkUser session fetch aborted:', err);
      } finally {
        setLoading(false);
      }
    };
    checkUser();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const userRole = user.user_metadata?.role || 'judge'; // Default to judge if not specified

  if (allowedRole && userRole !== allowedRole) {
    // If user is organizer but trying to access judge routes, or vice-versa
    const redirectPath = userRole === 'organizer' ? '/organizer/dashboard' : `/judge/${user.user_metadata?.hackathon_id}/dashboard`;
    return <Navigate to={redirectPath} replace />;
  }

  // Enforce hackathon restriction for judges
  if (userRole === 'judge') {
    const assignedHackathonId = user.user_metadata?.hackathon_id;
    const pathParts = location.pathname.split('/');
    
    // If metadata is missing, we might want to fetch from DB, 
    // but for now let's just prevent the 'undefined' redirect loop
    if (!assignedHackathonId) {
      console.warn('Judge has no assigned hackathon in metadata');
      // If they are at /judge/undefined/..., they are stuck. 
      // Let's not redirect them further to prevent loops.
      if (pathParts[2] === 'undefined') {
        return (
          <div className="min-h-screen flex items-center justify-center p-8 text-center">
            <div className="space-y-4">
              <h1 className="text-2xl font-bold">Account Configuration Error</h1>
              <p className="text-muted-foreground">Your judge account is not assigned to any active event. Please contact the administrator.</p>
              <button onClick={() => supabase.auth.signOut()} className="text-primary font-bold underline">Sign Out</button>
            </div>
          </div>
        );
      }
      return children;
    }

    // Check if the URL contains a hackathon ID that doesn't match the assigned one
    // Path structure: /judge/:hackathonId/...
    if (pathParts[1] === 'judge' && pathParts[2] && pathParts[2] !== assignedHackathonId && pathParts[2] !== 'undefined') {
      return <Navigate to={`/judge/${assignedHackathonId}/dashboard`} replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
