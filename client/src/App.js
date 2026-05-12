import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import Tasks from './components/Tasks';
import CalendarView from './components/CalendarView';
import Templates from './components/Templates';
import UserManagement from './components/UserManagement';
import api from './api';

function App() {
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState('tasks');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    if (token) {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    api.logout();
    setUser(null);
    localStorage.removeItem('user');
    setCurrentView('tasks');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setCurrentView('tasks');
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  // Permission helpers
  const isGrandAdmin = user.role === 'grand_admin';
  const isFrontOfficeAdmin = user.role === 'front_office_admin';
  const isSalesAdmin = user.role === 'sales_admin';
  const isManager = user.role === 'manager';
  const isAnyAdmin = isGrandAdmin || isFrontOfficeAdmin || isSalesAdmin;
  
  const canSeeCalendar = true; // Everyone can see calendar!
  const canSeeTemplates = isGrandAdmin || isFrontOfficeAdmin || isSalesAdmin;
  const canSeeUserManagement = isGrandAdmin;

  const renderView = () => {
    switch (currentView) {
      case 'tasks':
        return <Tasks selectedDate={selectedDate} onDateChange={setSelectedDate} />;
      case 'calendar':
        return canSeeCalendar ? <CalendarView onDateSelect={handleDateSelect} userRole={user.role} /> : <Tasks selectedDate={selectedDate} onDateChange={setSelectedDate} />;
      case 'templates':
        return canSeeTemplates ? <Templates /> : <Tasks selectedDate={selectedDate} onDateChange={setSelectedDate} />;
      case 'users':
        return canSeeUserManagement ? <UserManagement /> : <Tasks selectedDate={selectedDate} onDateChange={setSelectedDate} />;
      default:
        return <Tasks selectedDate={selectedDate} onDateChange={setSelectedDate} />;
    }
  };

  return (
    <div className="app">
      <button 
        className={`hamburger ${sidebarOpen ? 'sidebar-open' : ''}`} 
        onClick={toggleSidebar}
      >
        ☰
      </button>
      
      {sidebarOpen && <div className="sidebar-overlay visible" onClick={closeSidebar}></div>}
      
      <Sidebar
        user={user}
        currentView={currentView}
        setCurrentView={(view) => {
          setCurrentView(view);
          closeSidebar();
        }}
        onLogout={handleLogout}
        isOpen={sidebarOpen}
      />
      
      <div className={`main-content ${sidebarOpen ? 'sidebar-visible' : 'sidebar-hidden'}`}>
        {renderView()}
      </div>
    </div>
  );
}

export default App;
