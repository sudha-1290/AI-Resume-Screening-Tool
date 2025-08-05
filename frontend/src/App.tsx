import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import ResumeUpload from './pages/ResumeUpload';
import JobManagement from './pages/JobManagement';
import ScreeningResults from './pages/ScreeningResults';
import Analytics from './pages/Analytics';
import Login from './pages/Login';
import Register from './pages/Register';
import TestAuth from './pages/TestAuth';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/test-auth" element={<TestAuth />} />
            <Route path="/upload" element={<ResumeUpload />} />
            <Route path="/jobs" element={<JobManagement />} />
            <Route path="/screening" element={<ScreeningResults />} />
            <Route path="/analytics" element={<Analytics />} />
          </Routes>
        </main>
        <Toaster position="top-right" />
      </div>
    </AuthProvider>
  );
}

export default App; 