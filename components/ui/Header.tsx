import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Button from './Button';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-end h-16">
          <div className="flex items-center">
            {user ? (
                <>
                    <span className="text-slate-600 mr-4">Welcome, <span className="font-semibold">{user.username}</span>!</span>
                    <Button onClick={handleLogout} variant="secondary" size="sm">Logout</Button>
                </>
            ) : (
              <div className="space-x-2">
                {/* Fallback for non-user context, though shouldn't be reached in DashboardLayout */}
                <Button onClick={() => navigate('/')} variant="primary">Login</Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
