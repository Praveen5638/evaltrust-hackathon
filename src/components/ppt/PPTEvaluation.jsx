import React, { useState } from 'react';
import PDFViewer from './PPTViewer'; // Reusing the PDF viewer component

const PPTEvaluation = ({ file_url, teamName = "Team Name" }) => {
  const [evaluation, setEvaluation] = useState({
    innovation: 5,
    technical: 5,
    feasibility: 5,
    impact: 5,
    presentation: 5,
    comments: ''
  });

  const criteria = [
    { id: 'innovation', label: 'Innovation', max: 10 },
    { id: 'technical', label: 'Technical', max: 10 },
    { id: 'feasibility', label: 'Feasibility', max: 10 },
    { id: 'impact', label: 'Impact', max: 10 },
    { id: 'presentation', label: 'Presentation', max: 10 }
  ];

  const handleSliderChange = (criteriaId, value) => {
    setEvaluation(prev => ({
      ...prev,
      [criteriaId]: parseInt(value)
    }));
  };

  const handleCommentChange = (e) => {
    setEvaluation(prev => ({
      ...prev,
      comments: e.target.value
    }));
  };

  const calculateTotal = () => {
    const total = evaluation.innovation + 
                  evaluation.technical + 
                  evaluation.feasibility + 
                  evaluation.impact + 
                  evaluation.presentation;
    return total;
  };

  const calculatePercentage = () => {
    return (calculateTotal() / 50) * 100;
  };

  const getScoreColor = (score) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-blue-600';
    if (score >= 4) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const totalScore = calculateTotal();
    const percentage = calculatePercentage();
    
    const evaluationData = {
      ...evaluation,
      totalScore,
      percentage: `${percentage.toFixed(1)}%`,
      teamName,
      evaluatedAt: new Date().toISOString()
    };
    
    console.log('Evaluation submitted:', evaluationData);
    // TODO: Add Firebase logic here
    alert(`Evaluation submitted!\nTotal Score: ${totalScore}/50 (${percentage.toFixed(1)}%)`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">PPT Evaluation</h1>
          <p className="text-gray-600">Evaluating: {teamName}</p>
        </div>

        {/* Main Content - Left Viewer + Right Form */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left: PDF Viewer */}
          <div className="lg:w-1/2">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden sticky top-4">
              <div className="border-b p-3 bg-gray-50">
                <h2 className="font-semibold text-gray-700">Presentation Viewer</h2>
              </div>
              <PDFViewer file_url={file_url} />
            </div>
          </div>

          {/* Right: Evaluation Form */}
          <div className="lg:w-1/2">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Evaluation Form</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Criteria Sliders */}
                {criteria.map((criterion) => (
                  <div key={criterion.id} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="font-medium text-gray-700">
                        {criterion.label}
                      </label>
                      <span className={`font-bold text-lg ${getScoreColor(evaluation[criterion.id])}`}>
                        {evaluation[criterion.id]} / {criterion.max}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500">0</span>
                      <input
                        type="range"
                        min="0"
                        max={criterion.max}
                        value={evaluation[criterion.id]}
                        onChange={(e) => handleSliderChange(criterion.id, e.target.value)}
                        className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      />
                      <span className="text-xs text-gray-500">{criterion.max}</span>
                    </div>
                    
                    {/* Score description */}
                    <div className="text-xs text-gray-400">
                      {evaluation[criterion.id] <= 3 && "Needs improvement"}
                      {evaluation[criterion.id] >= 4 && evaluation[criterion.id] <= 6 && "Good"}
                      {evaluation[criterion.id] >= 7 && evaluation[criterion.id] <= 9 && "Very Good"}
                      {evaluation[criterion.id] === 10 && "Excellent!"}
                    </div>
                  </div>
                ))}

                {/* Total Score Display */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-600">Total Score</p>
                      <p className="text-3xl font-bold text-blue-600">
                        {calculateTotal()} / 50
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Percentage</p>
                      <p className="text-2xl font-semibold text-indigo-600">
                        {calculatePercentage().toFixed(1)}%
                      </p>
                    </div>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-300"
                      style={{ width: `${calculatePercentage()}%` }}
                    />
                  </div>
                </div>

                {/* Comments Box */}
                <div className="space-y-2">
                  <label className="font-medium text-gray-700">
                    Comments & Feedback
                  </label>
                  <textarea
                    value={evaluation.comments}
                    onChange={handleCommentChange}
                    rows="4"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Provide detailed feedback about the presentation..."
                  />
                  <p className="text-xs text-gray-500">
                    {evaluation.comments.length} characters
                  </p>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit Evaluation
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PPTEvaluation;