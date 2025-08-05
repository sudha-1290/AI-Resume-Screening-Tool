import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const TestAuth: React.FC = () => {
  const { user, login, register, logout } = useAuth();

  const handleTestRegister = async () => {
    try {
      await register('Test User', 'test@example.com', 'password123');
      alert('Test registration successful!');
    } catch (error) {
      alert('Test registration failed: ' + error);
    }
  };

  const handleTestLogin = async () => {
    try {
      await login('test@example.com', 'password123');
      alert('Test login successful!');
    } catch (error) {
      alert('Test login failed: ' + error);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Authentication Test Page</h1>
      
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Current User:</h2>
          <pre className="bg-gray-100 p-4 rounded">
            {user ? JSON.stringify(user, null, 2) : 'Not logged in'}
          </pre>
        </div>

        <div className="space-y-2">
          <button 
            onClick={handleTestRegister}
            className="btn-primary"
          >
            Test Register
          </button>
          
          <button 
            onClick={handleTestLogin}
            className="btn-secondary"
          >
            Test Login
          </button>
          
          <button 
            onClick={logout}
            className="btn-secondary"
          >
            Logout
          </button>
        </div>

        <div className="mt-8">
          <h2 className="text-lg font-semibold">Instructions:</h2>
          <ol className="list-decimal list-inside space-y-1">
            <li>Click "Test Register" to create a test account</li>
            <li>Click "Test Login" to log in with test credentials</li>
            <li>Check the "Current User" section to see if authentication worked</li>
            <li>Click "Logout" to clear the session</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default TestAuth; 