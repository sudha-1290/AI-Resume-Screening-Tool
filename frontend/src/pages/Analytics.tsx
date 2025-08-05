import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const Analytics: React.FC = () => {
  const { user } = useAuth();

  const metrics = [
    { label: 'Total Applications', value: '1,234', change: '+15%' },
    { label: 'Average Screening Score', value: '87%', change: '+5%' },
    { label: 'Time to Hire', value: '12 days', change: '-20%' },
    { label: 'Cost per Hire', value: '$2,450', change: '-12%' },
  ];

  if (!user) {
    return <div>Please login to view analytics</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-600 mt-2">Comprehensive insights into your hiring process</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <div key={index} className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{metric.label}</p>
                <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
              </div>
            </div>
            <div className="mt-4">
              <span className="text-sm text-green-600 font-medium">{metric.change}</span>
              <span className="text-sm text-gray-500 ml-1">from last month</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Applications Over Time</h3>
          <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Chart will be displayed here</p>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Screening Score Distribution</h3>
          <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Chart will be displayed here</p>
          </div>
        </div>
      </div>

      {/* Top Skills */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Most Requested Skills</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['JavaScript', 'Python', 'React', 'Node.js', 'SQL', 'AWS', 'Docker', 'TypeScript'].map((skill, index) => (
            <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl mb-2">💻</div>
              <div className="font-medium text-gray-900">{skill}</div>
              <div className="text-sm text-gray-600">{Math.floor(Math.random() * 50) + 20}%</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Analytics; 