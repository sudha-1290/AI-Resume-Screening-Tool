import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const ResumeUpload: React.FC = () => {
  const { user } = useAuth();
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFiles = (files: FileList) => {
    setUploading(true);
    // TODO: Implement file upload logic
    setTimeout(() => {
      setUploading(false);
      alert('Resume uploaded successfully!');
    }, 2000);
  };

  if (!user) {
    return <div>Please login to upload resumes</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Upload Resume</h1>
        <p className="text-gray-600 mt-2">Upload resumes to analyze and screen candidates</p>
      </div>

      <div className="card">
        <div
          className={`border-2 border-dashed rounded-lg p-12 text-center ${
            dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="text-6xl mb-4">📄</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Drop your resume here
          </h3>
          <p className="text-gray-600 mb-4">
            or click to browse files (PDF, DOCX)
          </p>
          <input
            type="file"
            accept=".pdf,.docx"
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload" className="btn-primary cursor-pointer">
            Choose File
          </label>
        </div>
      </div>

      {uploading && (
        <div className="card">
          <div className="flex items-center space-x-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <div>
              <p className="font-medium text-gray-900">Uploading resume...</p>
              <p className="text-sm text-gray-600">Please wait while we process your file</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeUpload; 