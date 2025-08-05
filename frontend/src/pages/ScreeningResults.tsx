import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const ScreeningResults: React.FC = () => {
  const { user } = useAuth();

  const results = [
    { id: 1, name: 'John Doe', score: 92, status: 'Recommended', skills: ['React', 'TypeScript', 'Node.js'] },
    { id: 2, name: 'Jane Smith', score: 85, status: 'Consider', skills: ['Python', 'Django', 'PostgreSQL'] },
    { id: 3, name: 'Mike Johnson', score: 78, status: 'Review', skills: ['Java', 'Spring', 'MySQL'] },
  ];

  if (!user) {
    return <div>Please login to view screening results</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Screening Results</h1>
        <p className="text-gray-600 mt-2">AI-powered candidate screening results</p>
      </div>

      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Candidate Rankings</h2>
        <div className="space-y-4">
          {results.map((candidate) => (
            <div key={candidate.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">{candidate.name.split(' ').map(n => n[0]).join('')}</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{candidate.name}</h3>
                  <div className="flex space-x-2 mt-1">
                    {candidate.skills.map((skill, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{candidate.score}%</div>
                  <div className="text-sm text-gray-600">Score</div>
                </div>
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                  candidate.status === 'Recommended' ? 'bg-green-100 text-green-800' :
                  candidate.status === 'Consider' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {candidate.status}
                </span>
                <button className="btn-secondary text-sm">View Details</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ScreeningResults; 