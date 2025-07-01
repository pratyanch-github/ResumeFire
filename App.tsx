import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import HomePage from './components/pages/HomePage';
import DashboardPage from './components/pages/DashboardPage';
import EditorPage from './components/pages/EditorPage';
import PublicResumePage from './components/pages/PublicResumePage';
import ProtectedRoute from './components/ui/ProtectedRoute';
import DashboardLayout from './components/ui/DashboardLayout';
import ModifyPage from './components/pages/ModifyPage';
import HistoryPage from './components/pages/HistoryPage';

function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/view/:username" element={<PublicResumePage />} />
          
          {/* Protected routes with Dashboard Layout */}
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/edit" element={<EditorPage />} />
              <Route path="/modify" element={<ModifyPage />} />
              <Route path="/history" element={<HistoryPage />} />
            </Route>
          </Route>
        </Routes>
      </HashRouter>
    </AuthProvider>
  );
}

export default App;
