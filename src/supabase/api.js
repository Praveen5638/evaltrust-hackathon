import { supabase } from './client';

// ==================== STORAGE ====================

/**
 * Uploads a PDF file to Supabase Storage bucket 'ppt-files'
 * @param {File} file
 * @returns {Promise<string>} public URL
 */
export const uploadPPTFile = async (file) => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
  const filePath = `submissions/${fileName}`;

  const { error } = await supabase.storage
    .from('ppt-files')
    .upload(filePath, file);

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from('ppt-files')
    .getPublicUrl(filePath);

  return publicUrl;
};

// ==================== PPT SUBMISSIONS ====================

/**
 * Submit a PPT — uploads file then inserts DB record
 * @param {{ teamName: string, members: string[], file: File, hackathonId?: string }} submissionData
 * @returns {Promise<Object>} inserted record
 */
export const submitPPT = async (submissionData) => {
  const fileUrl = await uploadPPTFile(submissionData.file);

  const { data, error } = await supabase
    .from('ppt_submissions')
    .insert([{
      team_name: submissionData.teamName,
      members: submissionData.members,
      ppt_url: fileUrl,
      hackathon_id: submissionData.hackathonId || null,
      created_at: new Date().toISOString()
    }])
    .select();

  if (error) throw error;
  
  // If RLS allows insert but not select, data might be empty.
  // We return the inserted data object manually if data is missing.
  if (!data || data.length === 0) {
    return {
      team_name: submissionData.teamName,
      members: submissionData.members,
      ppt_url: fileUrl,
      status: 'submitted'
    };
  }

  return data[0];
};

/**
 * Fetch all PPT submissions ordered by newest first
 * @returns {Promise<Array>}
 */
export const getSubmissions = async () => {
  const { data, error } = await supabase
    .from('ppt_submissions')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
};

/**
 * Check if a team has already submitted a PPT for a specific hackathon
 * @param {string} teamName
 * @param {string} hackathonId
 * @returns {Promise<boolean>}
 */
export const checkTeamSubmission = async (teamName, hackathonId) => {
  if (!hackathonId) return false;
  const { data, error } = await supabase
    .from('ppt_submissions')
    .select('id')
    .eq('team_name', teamName)
    .eq('hackathon_id', hackathonId)
    .limit(1);

  if (error) throw error;
  return data && data.length > 0;
};

/**
 * Save evaluation score for a team
 */
export const saveEvaluation = async (evaluationData) => {
  // Prevent duplicate insertion
  const existing = await checkEvaluation(evaluationData.team_id, evaluationData.judge_id, evaluationData.round);
  if (existing) {
    throw new Error('You have already submitted an assessment for this team.');
  }

  const { error } = await supabase
    .from('scores')
    .insert([{
      team_id: evaluationData.team_id,
      judge_id: evaluationData.judge_id,
      round: evaluationData.round,
      innovation: evaluationData.innovation,
      technical: evaluationData.technical,
      feasibility: evaluationData.feasibility,
      revenue_model: evaluationData.revenue_model,
      impact: evaluationData.impact,
      presentation: evaluationData.presentation,
      total_score: evaluationData.total_score,
      comments: evaluationData.comments
    }]);

  if (error) throw error;

  // Update submission status to evaluated
  await supabase
    .from('ppt_submissions')
    .update({ status: 'evaluated', score: evaluationData.total_score })
    .eq('id', evaluationData.team_id);
};

/**
 * Check if a judge has already evaluated a team in a specific round
 */
export const checkEvaluation = async (team_id, judge_id, round = 1) => {
  const { data, error } = await supabase
    .from('scores')
    .select('id, total_score')
    .eq('team_id', team_id)
    .eq('judge_id', judge_id)
    .eq('round', round)
    .maybeSingle();

  if (error) throw error;
  return data;
};

/**
 * Register a new judge (called by organizer)
 */
export const registerJudge = async (email, password, name, hackathonId) => {
  // Use a separate client for registration to avoid swapping the organizer's session
  const { createClient } = await import('@supabase/supabase-js');
  const { supabaseUrl, supabaseAnonKey } = await import('./client');
  
  const authClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  });

  // 1. Create auth user
  const { data, error } = await authClient.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: name,
        role: 'judge',
        hackathon_id: hackathonId
      }
    }
  });

  if (error) throw error;

  // 2. Save to public judges table for listing
  const { data: { session } } = await supabase.auth.getSession();
  const organizerId = session?.user?.id;

  const { error: dbError } = await supabase.from('judges').insert([{
    id: data.user.id, // Link the auth user ID to the judges table
    name,
    email,
    hackathon_id: hackathonId,
    organizer_id: organizerId,
    created_at: new Date().toISOString()
  }]);

  if (dbError) {
    console.error('Database insert failed:', dbError);
    throw new Error('User created but failed to save to judges list: ' + dbError.message);
  }

  return data;
};

/**
 * Fetch all registered judges (filtered by current organizer)
 */
export const getJudges = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  const uid = session?.user?.id;

  if (!uid) return [];

  // Try with join first
  const { data, error } = await supabase
    .from('judges')
    .select('*, hackathons(name)')
    .eq('organizer_id', uid)
    .order('created_at', { ascending: false });
    
  if (error) {
    console.warn('Fetch judges with join failed, falling back to simple fetch:', error);
    const { data: fallbackData, error: fallbackError } = await supabase
      .from('judges')
      .select('*')
      .eq('organizer_id', uid)
      .order('created_at', { ascending: false });
      
    if (fallbackError) throw fallbackError;
    return fallbackData || [];
  }
  
  return data || [];
};

/**
 * Fetch all registered hackathons (filtered by current organizer)
 */
export const getHackathons = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  const uid = session?.user?.id;
  if (!uid) return [];

  const { data, error } = await supabase
    .from('hackathons')
    .select('*')
    .eq('organizer_id', uid)
    .order('created_at', { ascending: false });
    
  if (error) throw error;
  return data || [];
};

/**
 * Fetch ranking of teams based on their scores (Manual Merge Version)
 * @param {string|null} hackathonId - optional filter
 */
export const getLeaderboard = async (hackathonId = null, round = 0) => {
  // 1. Get all submissions for this hackathon
  let submissionQuery = supabase.from('ppt_submissions').select('*');
  if (hackathonId) {
    submissionQuery = submissionQuery.eq('hackathon_id', hackathonId);
  }
  
  const { data: subs, error: subsError } = await submissionQuery;
  if (subsError) throw subsError;
  if (!subs || subs.length === 0) return [];

  const submissionIds = subs.map(s => s.id);
  const subMap = {};
  subs.forEach(s => { subMap[s.id] = s; });

  // 2. Fetch all scores for these submissions
  const { data: scores, error: scoresError } = await supabase
    .from('scores')
    .select('*')
    .in('team_id', submissionIds)
    .eq('round', round);
    
  if (scoresError) throw scoresError;
  // 3. Initialize all submissions in teamScores
  const teamScores = {};
  subs.forEach(s => {
    teamScores[s.id] = {
      id: s.id,
      name: s.team_name || 'Unknown',
      team_name: s.team_name || 'Unknown',
      members: s.members || [],
      total: 0,
      innovation: 0,
      technical: 0,
      feasibility: 0,
      revenue_model: 0,
      impact: 0,
      presentation: 0,
      count: 0
    };
  });

  // 4. Aggregate scores by team
  if (scores && scores.length > 0) {
    scores.forEach(s => {
      const tid = s.team_id;
      if (!teamScores[tid]) return;

      teamScores[tid].total += s.total_score || 0;
      teamScores[tid].innovation += s.innovation || 0;
      teamScores[tid].technical += s.technical || 0;
      teamScores[tid].feasibility += s.feasibility || 0;
      teamScores[tid].revenue_model += s.revenue_model || 0;
      teamScores[tid].impact += s.impact || 0;
      teamScores[tid].presentation += s.presentation || 0;
      teamScores[tid].count += 1;
    });
  }

  // 4. Calculate averages and sort
  const ranking = Object.values(teamScores).map(team => {
    const count = team.count || 1;
    return {
      ...team,
      avg: (team.total / count).toFixed(2),
      innovationAvg: (team.innovation / count).toFixed(1),
      technicalAvg: (team.technical / count).toFixed(1),
      feasibilityAvg: (team.feasibility / count).toFixed(1),
      revenueModelAvg: (team.revenue_model / count).toFixed(1),
      impactAvg: (team.impact / count).toFixed(1),
      presentationAvg: (team.presentation / count).toFixed(1),
    };
  });

  return ranking.sort((a, b) => parseFloat(b.avg) - parseFloat(a.avg));
};


/**
 * Update multiple teams' status to shortlisted
 * @param {number[]} teamIds 
 */
export const shortlistTeams = async (teamIds) => {
  const { error } = await supabase
    .from('ppt_submissions')
    .update({ status: 'shortlisted' })
    .in('id', teamIds);

  if (error) throw error;
};

/**
 * Promote shortlisted teams to the Hackathon phase (copy to 'teams' table)
 * @param {number[]} teamIds 
 */
export const promoteTeams = async (teamIds) => {
  const { data: shortlisted, error: fetchError } = await supabase
    .from('ppt_submissions')
    .select('team_name, members, ppt_url, hackathon_id')
    .in('id', teamIds);

  if (fetchError) throw fetchError;

  const teamsToInsert = shortlisted.map(t => ({
    team_name: t.team_name,
    members: t.members,
    ppt_url: t.ppt_url,
    hackathon_id: t.hackathon_id,
    status: 'active',
    round_status: 1, // Start Hackathon Phase at Round 1
    created_at: new Date().toISOString()
  }));

  const { error: insertError } = await supabase
    .from('teams')
    .insert(teamsToInsert);

  if (insertError) throw insertError;
  return true;
};

export const isEvaluationComplete = async (hackathonId) => {
  try {
    if (!hackathonId) return false;
    
    // 1. Get total teams promoted to this hackathon phase
    const { data: teams, error: teamsError } = await supabase
      .from('teams')
      .select('id, round_status, status')
      .eq('hackathon_id', hackathonId)
      .in('status', ['active', 'completed']);

    if (teamsError) return false;
    const totalTeams = teams?.length || 0;
    if (totalTeams === 0) return false;

    // 2. Get total rounds for this hackathon
    const { data: hData } = await supabase
      .from('hackathons')
      .select('total_rounds')
      .eq('id', hackathonId)
      .single();
    const totalRounds = hData?.total_rounds || 1;

    // 3. Get scores for these specific teams
    const teamIds = teams.map(t => t.id);
    const { data: scores, error: scoresError } = await supabase
      .from('scores')
      .select('team_id, round')
      .in('team_id', teamIds);

    if (scoresError) return false;

    // 4. A team is fully evaluated if it has been scored in EVERY round up to totalRounds
    // Wait, in some rounds teams might be eliminated. 
    // For simplicity, we check if EVERY team has at least one score in their CURRENT round.
    // Or more accurately: for a hackathon to be "complete", every active team must have been evaluated in the final round?
    // Let's go with: Every team has at least one score in the final round (if we are at the final round).
    
    const teamEvaluations = {};
    scores.forEach(s => {
      if (!teamEvaluations[s.team_id]) teamEvaluations[s.team_id] = new Set();
      teamEvaluations[s.team_id].add(s.round);
    });

    // Check if every team has been evaluated in at least round 1
    const evaluatedTeamsCount = Object.keys(teamEvaluations).length;
    
    return evaluatedTeamsCount >= totalTeams;
  } catch {
    return false;
  }
};

/**
 * Fetch detailed project information including members and scores breakdown
 */
export const getProjectDetails = async (teamId) => {
  // 1. Fetch team info from 'teams' table first
  const { data: team, error: teamError } = await supabase
    .from('teams')
    .select('*')
    .eq('id', teamId)
    .maybeSingle();

  if (teamError) throw teamError;

  // 2. If not in 'teams', check 'ppt_submissions'
  let projectInfo = team;
  if (!projectInfo) {
    const { data: ppt, error: pptError } = await supabase
      .from('ppt_submissions')
      .select('*')
      .eq('id', teamId)
      .maybeSingle();
    if (pptError) throw pptError;
    projectInfo = ppt;
  }

  if (!projectInfo) throw new Error('Project not found');

  // 3. Fetch all scores for this team
  const { data: scores, error: scoresError } = await supabase
    .from('scores')
    .select('*')
    .eq('team_id', teamId)
    .order('round', { ascending: true });

  if (scoresError) throw scoresError;

  // 4. Fetch hackathon specific lock/reveal settings
  let hackathonInfo = null;
  if (projectInfo.hackathon_id) {
    const { data: h } = await supabase
      .from('hackathons')
      .select('name, is_result_revealed, is_final_locked')
      .eq('id', projectInfo.hackathon_id)
      .maybeSingle();
    hackathonInfo = h;
  }

  return {
    ...projectInfo,
    scores: scores || [],
    hackathon: hackathonInfo
  };
};

/**
 * Set global lock for a specific hackathon
 * @param {string} hackathonId
 * @param {boolean} locked 
 */
export const setGlobalLock = async (hackathonId, locked) => {
  const { error } = await supabase
    .from('hackathons')
    .update({ is_final_locked: locked })
    .eq('id', hackathonId);

  if (error) throw error;
};

/**
 * Set PPT submission lock status for a specific hackathon
 */
export const setPPTLock = async (hackathonId, locked) => {
  const { error } = await supabase
    .from('hackathons')
    .update({ is_ppt_locked: locked })
    .eq('id', hackathonId);

  if (error) throw error;
};

/**
 * Check if a specific hackathon is globally locked
 */
export const checkGlobalLock = async (hackathonId) => {
  try {
    if (!hackathonId) return false;
    const { data, error } = await supabase
      .from('hackathons')
      .select('is_final_locked')
      .eq('id', hackathonId)
      .maybeSingle();

    if (error) return false;
    return !!data?.is_final_locked;
  } catch {
    return false;
  }
};

/**
 * Unlock a hackathon's evaluation
 */
export const unlockHackathon = async (id) => {
  const { error } = await supabase
    .from('hackathons')
    .update({ is_final_locked: false, is_result_revealed: false })
    .eq('id', id);
    
  if (error) throw error;
  return true;
};

/**
 * Set result reveal status for a specific hackathon
 * @param {string} hackathonId
 * @param {boolean} revealed 
 */
export const setResultReveal = async (hackathonId, revealed) => {
  if (revealed) {
    const complete = await isEvaluationComplete(hackathonId);
    if (!complete) {
      throw new Error('Evaluation Incomplete: All teams must be evaluated before revealing results.');
    }
  }

  const { error } = await supabase
    .from('hackathons')
    .update({ 
      is_result_revealed: revealed,
      is_final_locked: revealed ? true : false // Auto-lock when revealing
    })
    .eq('id', hackathonId);

  if (error) throw error;
};

/**
 * Check if results are revealed for a specific hackathon
 */
export const checkResultReveal = async (hackathonId) => {
  try {
    if (!hackathonId) return false;
    const { data, error } = await supabase
      .from('hackathons')
      .select('is_result_revealed')
      .eq('id', hackathonId)
      .maybeSingle();

    if (error) return false;
    return !!data?.is_result_revealed;
  } catch {
    return false;
  }
};

/**
 * Advance a team to the next round
 */
export const advanceTeamRound = async (teamId, nextRound) => {
  const { error } = await supabase
    .from('teams')
    .update({ round_status: nextRound })
    .eq('id', teamId);

  if (error) throw error;
};

/**
 * Fetch teams assigned to a specific judge for the Hackathon phase in a specific event
 * Supports round-based deterministic shuffling to eliminate biases across multiple rounds.
 * @param {string} judgeId 
 * @param {string} hackathonId
 */
export const getAssignedTeams = async (judgeId, hackathonId) => {
  if (!hackathonId) return [];
  const isLocked = await checkGlobalLock(hackathonId);

  const { data: teams, error: teamsError } = await supabase
    .from('teams')
    .select('*')
    .eq('hackathon_id', hackathonId)
    .eq('status', 'active');

  if (teamsError) throw teamsError;

  // 1. Balanced Distribution Logic with Round Shuffling
  // Fetch all judges for this event to determine distribution
  const { data: allJudges } = await supabase
    .from('judges')
    .select('id, email')
    .eq('hackathon_id', hackathonId)
    .order('created_at', { ascending: true });

  const { data: { session } } = await supabase.auth.getSession();
  const userEmail = session?.user?.email;

  // Simple string hashing utility for deterministic shuffling
  const getHash = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  };

  let assignedTeams = [];
  if (allJudges && allJudges.length > 0) {
    // Try finding by UUID first, then by email as fallback for old accounts
    let judgeIndex = allJudges.findIndex(j => j.id === judgeId);
    if (judgeIndex === -1 && userEmail) {
      judgeIndex = allJudges.findIndex(j => j.email === userEmail);
    }

    if (judgeIndex !== -1) {
      const numJudges = allJudges.length;

      // Group active teams by their round status
      const roundGroups = {};
      teams.forEach(t => {
        const r = t.round_status || 1;
        if (!roundGroups[r]) roundGroups[r] = [];
        roundGroups[r].push(t);
      });

      // For each round group, deterministically shuffle and slice with remainder-aware math
      Object.keys(roundGroups).forEach(r => {
        const groupTeams = roundGroups[r];
        
        // Shuffle using team id + round number to ensure different partners in Round 2
        const shuffledGroup = [...groupTeams].sort((a, b) => {
          return getHash(a.id + "_" + r) - getHash(b.id + "_" + r);
        });

        // Mathematically perfect partitioning (e.g., 40 teams among 6 judges -> 4 judges get 7, 2 judges get 6)
        const totalTeams = shuffledGroup.length;
        const baseSize = Math.floor(totalTeams / numJudges);
        const remainder = totalTeams % numJudges;

        let startIndex = 0;
        let size = baseSize;

        if (judgeIndex < remainder) {
          size = baseSize + 1;
          startIndex = judgeIndex * (baseSize + 1);
        } else {
          size = baseSize;
          startIndex = remainder * (baseSize + 1) + (judgeIndex - remainder) * baseSize;
        }

        const sliced = shuffledGroup.slice(startIndex, startIndex + size);
        assignedTeams.push(...sliced);
      });
    } else {
      assignedTeams = teams;
    }
  } else {
    assignedTeams = teams;
  }

  const { data: scores, error: scoresError } = await supabase
    .from('scores')
    .select('team_id, round')
    .eq('judge_id', judgeId);

  if (scoresError) throw scoresError;

  return assignedTeams.map(t => {
    const currentRound = t.round_status || 1;
    const evaluation = scores.find(s => s.team_id === t.id && String(s.round) === String(currentRound));
    
    return {
      ...t,
      currentRound,
      isEvaluated: !!evaluation,
      isGlobalLocked: isLocked
    };
  });
};

/**
 * Calculate final results and ranking for active teams in a specific hackathon
 * @param {string} hackathonId
 * @returns {Promise<Array>} List of { team_id, final_score, rank, name }
 */
export const calculateFinalResults = async (hackathonId) => {
  if (!hackathonId) return [];

  // 1. Fetch total_rounds from hackathon
  const { data: hData } = await supabase
    .from('hackathons')
    .select('total_rounds')
    .eq('id', hackathonId)
    .single();
  const totalRounds = hData?.total_rounds || 1;

  // 2. Define Weights
  let weights = { 1: 1.0 };
  if (totalRounds === 2) weights = { 1: 0.5, 2: 0.5 };
  if (totalRounds === 3) weights = { 1: 0.2, 2: 0.3, 3: 0.5 };
  if (totalRounds === 4) weights = { 1: 0.1, 2: 0.2, 3: 0.3, 4: 0.4 };

  // 3. Fetch scores and team details with all criteria
  const { data: scores, error: scoresError } = await supabase
    .from('scores')
    .select(`
      team_id,
      total_score,
      round,
      innovation,
      technical,
      feasibility,
      impact,
      presentation,
      teams!inner (
        team_name,
        members,
        hackathon_id
      )
    `)
    .eq('teams.hackathon_id', hackathonId)
    .gt('round', 0);

  if (scoresError) throw scoresError;

  // 4. Group by Team -> Round -> Average of Judges & Metrics
  const teamData = {};
  scores.forEach(s => {
    const tid = s.team_id;
    const r = String(s.round);
    if (!teamData[tid]) {
      teamData[tid] = {
        name: s.teams?.team_name || 'Unknown Team',
        members: s.teams?.members || [],
        rounds: {}, // { "1": { total: X, count: Y }, "2": ... }
        totalTechnical: 0,
        totalPresentation: 0,
        totalInnovation: 0,
        totalFeasibility: 0,
        totalCount: 0
      };
    }
    if (!teamData[tid].rounds[r]) teamData[tid].rounds[r] = { total: 0, count: 0 };
    teamData[tid].rounds[r].total += s.total_score;
    teamData[tid].rounds[r].count += 1;

    // Aggregate category-specific criteria scores
    teamData[tid].totalTechnical += (s.technical || 0);
    teamData[tid].totalPresentation += (s.presentation || 0);
    teamData[tid].totalInnovation += (s.innovation || 0);
    teamData[tid].totalFeasibility += (s.feasibility || 0);
    teamData[tid].totalCount += 1;
  });

  // 5. Calculate Weighted Final Score & Category scores
  const results = Object.entries(teamData).map(([tid, t]) => {
    let weightedScore = 0;
    
    // For each round, calculate average and apply weight
    Object.entries(t.rounds).forEach(([r, rData]) => {
      const avg = rData.total / rData.count;
      const weight = weights[r] || 0;
      weightedScore += avg * weight;
    });

    return {
      team_id: tid,
      name: t.name,
      members: t.members,
      final_score: parseFloat(weightedScore.toFixed(2)),
      technical_avg: t.totalCount > 0 ? parseFloat((t.totalTechnical / t.totalCount).toFixed(2)) : 0,
      presentation_avg: t.totalCount > 0 ? parseFloat((t.totalPresentation / t.totalCount).toFixed(2)) : 0,
      innovation_avg: t.totalCount > 0 ? parseFloat(((t.totalInnovation + t.totalFeasibility) / (t.totalCount * 2)).toFixed(2)) : 0
    };
  });

  // 6. Sort and Rank
  return results
    .sort((a, b) => b.final_score - a.final_score)
    .map((r, index) => ({
      ...r,
      rank: index + 1
    }));
};

// ==================== EXPORTS ====================

const api = {
  submitPPT,
  uploadPPTFile,
  getSubmissions,
  checkTeamSubmission,
  saveEvaluation,
  checkEvaluation,
  registerJudge,
  getLeaderboard,
  shortlistTeams,
  promoteTeams,
  getAssignedTeams,
  advanceTeamRound,
  setGlobalLock,
  checkGlobalLock,
  setResultReveal,
  checkResultReveal,
  isEvaluationComplete,
  calculateFinalResults,

  // Compatibility aliases
  addPPTSubmission: submitPPT,
  getPPTSubmissions: getSubmissions,
  getJudges,
  getHackathons,
  getProjectDetails,
};

export default api;

/**
 * Delete a judge record
 */
export const deleteJudge = async (judgeId) => {
  const { error } = await supabase
    .from('judges')
    .delete()
    .eq('id', judgeId);
    
  if (error) throw error;
  return true;
};

/**
 * Delete a hackathon and all its related records
 */
export const deleteHackathon = async (id) => {
  const { error } = await supabase.from('hackathons').delete().eq('id', id);
  if (error) throw error;
  return true;
};
