import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const JobManagement: React.FC = () => {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);

  const jobs = [
    { id: 1, title: 'Senior Frontend Developer', status: 'Active', applications: 24, created: '2024-01-15' },
    { id: 2, title: 'Backend Engineer', status: 'Active', applications: 18, created: '2024-01-10' },
    { id: 3, title: 'Product Manager', status: 'Closed', applications: 32, created: '2024-01-05' },
  ];

  if (!user) {
    return <div>Please login to manage jobs</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Job Management</h1>
          <p className="text-gray-600 mt-2">Create and manage job postings</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary"
        >
          Create New Job
        </button>
      </div>

      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Active Jobs</h2>
        <div className="space-y-4">
          {jobs.map((job) => (
            <div key={job.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-900">{job.title}</h3>
                <p className="text-sm text-gray-600">Created: {job.created}</p>
              </div>
              <div className="flex items-center space-x-4">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  job.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {job.status}
                </span>
                <span className="text-sm text-gray-600">{job.applications} applications</span>
                <button className="btn-secondary text-sm">View Details</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default JobManagement; 