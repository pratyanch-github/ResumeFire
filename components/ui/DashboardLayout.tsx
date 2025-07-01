import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import Header from './Header';

const ICONS = {
    dashboard: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>,
    edit: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>,
    modify: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>,
    history: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
};


const NavItem: React.FC<{ to: string; icon: React.ReactNode; children: React.ReactNode }> = ({ to, icon, children }) => {
    const activeClass = 'bg-primary-700 text-white';
    const inactiveClass = 'text-slate-300 hover:bg-slate-700 hover:text-white';
    return (
        <NavLink
            to={to}
            className={({ isActive }) =>
                `flex items-center px-4 py-3 rounded-lg transition-colors duration-200 ${isActive ? activeClass : inactiveClass}`
            }
        >
            {icon}
            <span className="ml-4 font-medium">{children}</span>
        </NavLink>
    );
}

const DashboardLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex bg-slate-100">
      <aside className="w-64 bg-slate-800 text-white flex flex-col p-4 fixed h-full">
         <div className="flex-shrink-0 mb-8">
            <a href="/#/dashboard" className="flex items-center space-x-2 px-2">
               <span className="text-2xl font-bold text-primary-500">Resume</span>
               <span className="text-2xl font-bold text-white">Fire</span>
               <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 18.657A8 8 0 016.343 7.343m11.314 11.314a8 8 0 00-11.314-11.314m11.314 11.314L22 22M12 12v-6m0 6l-3.5-3.5M12 6V3" /></svg>
            </a>
         </div>
         <nav className="flex-grow space-y-2">
            <NavItem to="/dashboard" icon={ICONS.dashboard}>Dashboard</NavItem>
            <NavItem to="/edit" icon={ICONS.edit}>Editor</NavItem>
            <NavItem to="/modify" icon={ICONS.modify}>AI Modifier</NavItem>
            <NavItem to="/history" icon={ICONS.history}>History</NavItem>
         </nav>
      </aside>
      <div className="flex-1 flex flex-col ml-64">
        <Header />
        <main className="flex-grow p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
