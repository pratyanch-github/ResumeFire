
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Button from '../ui/Button';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const publicUrl = `${window.location.origin}/#/view/${user.username}`;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold text-slate-800">Welcome to your Dashboard, {user.username}!</h1>
        <p className="text-slate-600 mt-2">Manage your resume and share it with the world.</p>
        
        <div className="mt-8 bg-slate-100 p-6 rounded-lg">
          <h2 className="text-lg font-semibold text-slate-700">Your Public Resume URL</h2>
          <p className="text-slate-500 text-sm mt-1">This is the link you can share with employers.</p>
          <div className="mt-3 flex items-center bg-white p-2 rounded-md shadow-sm">
            <a href={publicUrl} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline flex-grow truncate">
              {publicUrl}
            </a>
            <Button variant="secondary" onClick={() => navigator.clipboard.writeText(publicUrl)}>Copy</Button>
          </div>
        </div>

        <div className="mt-8 flex space-x-4">
          <Button onClick={() => navigate('/edit')} variant="primary">Edit Your Resume</Button>
          <Button onClick={() => navigate(`/view/${user.username}`)} variant="secondary">View Public Resume</Button>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
