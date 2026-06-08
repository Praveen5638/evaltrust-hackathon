import React, { useState, useEffect } from 'react';
import api from '../../supabase/api';

const ShortlistDashboard = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeams, setSelectedTeams] = useState([]);
  const [topN, setTopN] = useState('');
  const [showHighlight, setShowHighlight] = useState(false);

  // Fetch all submissions on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const submissions = await api.getSubmissions();
        // Filter only evaluated ones client-side
        setTeams(submissions.filter(s => s.status === 'evaluated'));
      } catch (error) {
        console.error('Error fetching submissions:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleTeamSelect = (teamId) => {
    setSelectedTeams(prev =>
      prev.includes(teamId) ? prev.filter(id => id !== teamId) : [...prev, teamId]
    );
    setShowHighlight(false);
  };

  const handleSelectAll = () => {
    setSelectedTeams(selectedTeams.length === teams.length ? [] : teams.map(t => t.id));
    setShowHighlight(false);
  };

  const handleTopNChange = (e) => {
    const value = e.target.value;
    setTopN(value);
    if (value && !isNaN(value) && value > 0) {
      const sorted = [...teams].sort((a, b) => (b.score || 0) - (a.score || 0));
      setSelectedTeams(sorted.slice(0, parseInt(value)).map(t => t.id));
      setShowHighlight(true);
    } else {
      setSelectedTeams([]);
      setShowHighlight(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 45) return 'text-green-600 bg-green-50';
    if (score >= 40) return 'text-blue-600 bg-blue-50';
    if (score >= 35) return 'text-yellow-600 bg-yellow-50';
    return 'text-gray-600 bg-gray-50';
  };

  const isSelected = (id) => selectedTeams.includes(id);
  const allSelected = selectedTeams.length === teams.length && teams.length > 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Shortlist Dashboard</h1>
          <p className="text-gray-600 mt-2">Select top teams to promote to the final Hackathon phase.</p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={handleSelectAll}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
              >
                {allSelected ? 'Deselect All' : 'Select All'}
              </button>

              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Auto Top N:</label>
                <input
                  type="number"
                  min="1"
                  max={teams.length}
                  value={topN}
                  onChange={handleTopNChange}
                  className="w-20 px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="N"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">
                Selected: <span className="font-bold text-blue-600">{selectedTeams.length}</span> / {teams.length}
              </span>
              <button
                disabled={selectedTeams.length === 0}
                className="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition shadow-sm disabled:opacity-50"
                onClick={() => alert('Promote feature: implement Supabase update here.')}
              >
                Promote to Hackathon 🚀
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input type="checkbox" checked={allSelected} onChange={handleSelectAll} className="w-4 h-4 text-blue-600 rounded" />
                  </th>
                  {['Team Name', 'Members', 'Score', 'Status'].map(h => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {teams.map((team) => (
                  <tr
                    key={team.id}
                    className={`transition-colors ${
                      isSelected(team.id) && showHighlight
                        ? 'bg-yellow-50 hover:bg-yellow-100'
                        : isSelected(team.id)
                        ? 'bg-blue-50 hover:bg-blue-100'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <td className="px-6 py-4">
                      <input type="checkbox" checked={isSelected(team.id)} onChange={() => handleTeamSelect(team.id)} className="w-4 h-4 text-blue-600 rounded" />
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">{team.team_name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {Array.isArray(team.members) ? team.members.join(', ') : team.members}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getScoreColor(team.score)}`}>
                        {team.score != null ? `${team.score}/50` : 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">
                        Ready
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {teams.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No evaluated teams available for shortlisting yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShortlistDashboard;