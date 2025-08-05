import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  const stats = [
    { label: 'Total Resumes', value: '1,234', change: '+12%', icon: '📄' },
    { label: 'Active Jobs', value: '45', change: '+5%', icon: '💼' },
    { label: 'Screening Score', value: '92%', change: '+3%', icon: '🎯' },
    { label: 'Time Saved', value: '156h', change: '+18%', icon: '⏰' },
  ];

  const recentActivities = [
    { action: 'Resume uploaded', candidate: 'John Doe', time: '2 hours ago', status: 'Processing' },
    { action: 'Screening completed', candidate: 'Jane Smith', time: '4 hours ago', status: 'Completed' },
    { action: 'Job posted', title: 'Senior Developer', time: '1 day ago', status: 'Active' },
    { action: 'Interview scheduled', candidate: 'Mike Johnson', time: '2 days ago', status: 'Scheduled' },
  ];

  if (!user) {
    return (
      <div className="text-center py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Welcome to AI Resume Screening</h1>
        <p className="text-gray-600 mb-8">Please login to access your dashboard</p>
        <Link to="/login" className="btn-primary">
          Login
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back, {user.name}! Here's what's happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className="text-3xl">{stat.icon}</div>
            </div>
            <div className="mt-4">
              <span className="text-sm text-green-600 font-medium">{stat.change}</span>
              <span className="text-sm text-gray-500 ml-1">from last month</span>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/upload" className="card hover:shadow-md transition-shadow cursor-pointer">
          <div className="text-center">
            <div className="text-4xl mb-4">📄</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload Resume</h3>
            <p className="text-gray-600">Upload and analyze new resumes</p>
          </div>
        </Link>

        <Link to="/jobs" className="card hover:shadow-md transition-shadow cursor-pointer">
          <div className="text-center">
            <div className="text-4xl mb-4">💼</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Create Job</h3>
            <p className="text-gray-600">Post new job openings</p>
          </div>
        </Link>

        <Link to="/screening" className="card hover:shadow-md transition-shadow cursor-pointer">
          <div className="text-center">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Start Screening</h3>
            <p className="text-gray-600">Begin AI-powered screening</p>
          </div>
        </Link>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Activity</h2>
        <div className="space-y-4">
          {recentActivities.map((activity, index) => (
            <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div>
                  <p className="font-medium text-gray-900">{activity.action}</p>
                  <p className="text-sm text-gray-600">
                    {activity.candidate || activity.title} • {activity.time}
                  </p>
                </div>
              </div>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                activity.status === 'Completed' ? 'bg-green-100 text-green-800' :
                activity.status === 'Processing' ? 'bg-yellow-100 text-yellow-800' :
                activity.status === 'Active' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {activity.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 