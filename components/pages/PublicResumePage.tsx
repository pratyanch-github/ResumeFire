import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { ResumeData, User, UserResumeProfile } from '../../types';
import { TEMPLATES } from '../../constants';
import Spinner from '../ui/Spinner';
import { useAuth } from '../../hooks/useAuth';

const getMockData = <T,>(key: string): Record<string, T> => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
};

const PublicResumePage: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const { state } = useLocation();
  const { user: loggedInUser } = useAuth(); // Get the currently logged-in user

  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Check if we're viewing a preview from the history page
  const isPreview = !!state?.resumeDataForPreview;

  useEffect(() => {
    // If it's a preview from history, use the data passed in state
    if (isPreview) {
      setResumeData(state.resumeDataForPreview);
      setLoading(false);
      return;
    }

    if (!username) {
      setError('No username provided.');
      setLoading(false);
      return;
    }

    // Mock API call to fetch active resume by username
    const fetchResume = () => {
      const users = getMockData<User>('resume_fire_users');
      const targetUser = Object.values(users).find(u => u.username.toLowerCase() === username.toLowerCase());

      if (!targetUser) {
        setError('Resume not found.');
        setLoading(false);
        return;
      }

      const resumes = getMockData<UserResumeProfile>('resume_fire_resumes');
      const userResumeProfile = resumes[targetUser.id];

      if (userResumeProfile?.active) {
        setResumeData(userResumeProfile.active);
      } else {
        setError('Resume data is missing for this user.');
      }
      setLoading(false);
    };

    fetchResume();
  }, [username, state]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center text-center">
        <div>
            <h1 className="text-2xl font-bold text-red-600">Error</h1>
            <p className="text-slate-600 mt-2">{error}</p>
             <Link to="/" className="text-primary-600 mt-4 inline-block">Go to Homepage</Link>
        </div>
      </div>
    );
  }

  if (!resumeData) {
    return (
      <div className="h-screen flex items-center justify-center text-center">
          <h1 className="text-2xl font-bold text-slate-800">No Resume Data Available</h1>
      </div>
    );
  }
  
  const TemplateComponent = TEMPLATES.find(t => t.id === resumeData.templateId)?.component;

  if (!TemplateComponent) {
      return (
          <div className="h-screen flex items-center justify-center text-center">
              <h1 className="text-2xl font-bold text-red-600">Invalid Template Selected</h1>
          </div>
      );
  }
  
  // Show back to dashboard link only if the user is logged in AND it's their own resume they are viewing.
  const showBackToDashboard = loggedInUser && loggedInUser.username === username;

  return (
    <div className="bg-slate-200 py-12 min-h-screen">
      {showBackToDashboard && (
        <Link to="/dashboard" className="fixed top-4 right-4 bg-primary-600 text-white py-2 px-4 rounded-lg shadow-lg hover:bg-primary-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 z-10">
            {isPreview ? "Back to History" : "Back to Dashboard"}
        </Link>
      )}
      <div className="max-w-4xl mx-auto">
        <TemplateComponent data={resumeData} />
      </div>
    </div>
  );
};

export default PublicResumePage;