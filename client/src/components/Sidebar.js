import React from 'react';

function Sidebar({ user, currentView, setCurrentView, onLogout, isOpen }) {
  const isGrandAdmin = user.role === 'grand_admin';
  const isFrontOfficeAdmin = user.role === 'front_office_admin';
  const isSalesAdmin = user.role === 'sales_admin';
  const isManager = user.role === 'manager';
  const isAnyAdmin = isGrandAdmin || isFrontOfficeAdmin || isSalesAdmin;
  const canSeeCalendar = true;
  const canSeeTemplates = isGrandAdmin || isFrontOfficeAdmin || isSalesAdmin;
  const canSeeUserManagement = isGrandAdmin;
  
  return (
    <div className={`sidebar ${isOpen ? '' : 'hidden'}`}>
      <div className="sidebar-header">
        <h2>Task Calendar</h2>
        <div className="user-info">
          {user.name} ({user.role.replace(/_/g, ' ')})
        </div>
      </div>
      
      <div className="sidebar-nav">
        <div
          className={`nav-item ${currentView === 'tasks' ? 'active' : ''}`}
          onClick={() => setCurrentView('tasks')}
        >
          ✅ Tasks
        </div>
        
        {canSeeCalendar && (
          <div
            className={`nav-item ${currentView === 'calendar' ? 'active' : ''}`}
            onClick={() => setCurrentView('calendar')}
          >
            🗓️ Calendar View
          </div>
        )}
        
        {canSeeTemplates && (
          <div
            className={`nav-item ${currentView === 'templates' ? 'active' : ''}`}
            onClick={() => setCurrentView('templates')}
          >
            ⚙️ Manage Templates
          </div>
        )}
        
        {canSeeUserManagement && (
          <div
            className={`nav-item ${currentView === 'users' ? 'active' : ''}`}
            onClick={() => setCurrentView('users')}
          >
            👥 Manage Users
          </div>
        )}
      </div>
      
      <button className="logout-btn" onClick={onLogout}>
        Logout
      </button>
    </div>
  );
}

export default Sidebar;
