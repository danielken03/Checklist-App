import React, { useState, useEffect, useRef } from 'react';
import api from '../api';
import TaskItem from './TaskItem';
import ChecklistView from './ChecklistView';

function Tasks({ selectedDate, onDateChange }) {
  const [tasks, setTasks] = useState({ 
    daily: { checklists: [], standaloneTasks: [] }, 
    weekly: { checklists: [], standaloneTasks: [] }, 
    monthly: { checklists: [], standaloneTasks: [] } 
  });
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState('daily');
  const [selectedChecklist, setSelectedChecklist] = useState(null);
  const scrollPositionRef = useRef(0);
  const shouldRestoreScrollRef = useRef(false);

  useEffect(() => {
    loadTasks();
  }, [selectedDate]);

  // Restore scroll position after tasks update
  useEffect(() => {
    if (shouldRestoreScrollRef.current && !loading) {
      window.scrollTo(0, scrollPositionRef.current);
      shouldRestoreScrollRef.current = false;
    }
  }, [tasks, loading]);

  const loadTasks = async (preserveScroll = false) => {
    if (preserveScroll) {
      scrollPositionRef.current = window.scrollY;
      shouldRestoreScrollRef.current = true;
    }
    
    setLoading(true);
    try {
      const data = await api.getTasksForDate(selectedDate);
      setTasks(data);
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskUpdate = () => {
    loadTasks(true); // Pass true to preserve scroll position
  };

  const getCompletionStatus = (taskList) => {
    if (taskList.length === 0) return { badge: 'incomplete', text: 'No tasks' };
    const completed = taskList.filter(t => t.completion_id).length;
    const total = taskList.length;
    const percentage = (completed / total) * 100;

    if (percentage === 100) return { badge: 'completed', text: `${completed}/${total} Complete` };
    if (percentage > 0) return { badge: 'partial', text: `${completed}/${total} Complete` };
    return { badge: 'incomplete', text: `${completed}/${total} Complete` };
  };

  const handleChecklistClick = (checklist) => {
    setSelectedChecklist(checklist);
  };

  // Convert YYYY-MM-DD to MM/DD/YYYY for display
  const formatDateForDisplay = (isoDate) => {
    const [year, month, day] = isoDate.split('-');
    return `${month}/${day}/${year}`;
  };

  const handleDateInputChange = (e) => {
    const input = e.target.value.replace(/\D/g, ''); // Remove non-digits
    
    if (input.length <= 8) {
      let formatted = input;
      
      // Add slashes as user types
      if (input.length >= 2) {
        formatted = input.slice(0, 2) + '/' + input.slice(2);
      }
      if (input.length >= 4) {
        formatted = input.slice(0, 2) + '/' + input.slice(2, 4) + '/' + input.slice(4);
      }
      
      e.target.value = formatted;
      
      // Only update if we have a complete date
      if (input.length === 8) {
        const month = input.slice(0, 2);
        const day = input.slice(2, 4);
        const year = input.slice(4, 8);
        
        // Basic validation
        if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
          onDateChange(`${year}-${month}-${day}`);
        }
      }
    }
  };

  if (loading && !shouldRestoreScrollRef.current) {
    return <div className="loading">Loading tasks...</div>;
  }

  // If viewing a specific checklist
  if (selectedChecklist) {
    const updatedChecklist = [...tasks.daily.checklists, ...tasks.weekly.checklists, ...tasks.monthly.checklists]
      .find(cl => cl.id === selectedChecklist.id);
    
    return (
      <ChecklistView 
        checklist={updatedChecklist || selectedChecklist}
        tasks={(updatedChecklist || selectedChecklist).tasks}
        onBack={() => setSelectedChecklist(null)}
        onUpdate={handleTaskUpdate}
      />
    );
  }

  const viewTitles = {
    daily: 'Daily Tasks',
    weekly: 'Weekly Tasks', 
    monthly: 'Monthly Tasks'
  };

  const viewEmojis = {
    daily: '📅',
    weekly: '📊',
    monthly: '📈'
  };

  const currentData = tasks[currentView];

  return (
    <div className="main-content">
      <div className="page-header">
        <h1>My Tasks</h1>
        <p>Manage and complete your tasks for {formatDateForDisplay(selectedDate)}</p>
      </div>

      <div style={{ display: 'flex', gap: '20px', marginBottom: '30px', maxWidth: '600px' }}>
        <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
          <label>Task Type</label>
          <select
            className="form-control"
            value={currentView}
            onChange={(e) => setCurrentView(e.target.value)}
          >
            <option value="daily">Daily Tasks</option>
            <option value="weekly">Weekly Tasks</option>
            <option value="monthly">Monthly Tasks</option>
          </select>
        </div>
        <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
          <label>Select Date</label>
          <input
            type="text"
            className="form-control"
            defaultValue={formatDateForDisplay(selectedDate)}
            onChange={handleDateInputChange}
            placeholder="MM/DD/YYYY"
            maxLength="10"
          />
        </div>
      </div>

      {/* Checklists */}
      {currentData.checklists && currentData.checklists.length > 0 && (
        <div className="task-section">
          <div className="section-header">
            <h2>{viewEmojis[currentView]} {viewTitles[currentView]} - Checklists</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '15px' }}>
            {currentData.checklists.map(checklist => {
              const status = getCompletionStatus(checklist.tasks);
              return (
                <div
                  key={checklist.id}
                  onClick={() => handleChecklistClick(checklist)}
                  style={{
                    border: '2px solid #e0e0e0',
                    borderRadius: '8px',
                    padding: '20px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    backgroundColor: 'white'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <h3 style={{ marginBottom: '10px', color: '#2c3e50' }}>{checklist.name}</h3>
                  {checklist.description && (
                    <p style={{ color: '#7f8c8d', fontSize: '14px', marginBottom: '15px' }}>
                      {checklist.description}
                    </p>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className={`completion-badge ${status.badge}`}>
                      {status.text}
                    </span>
                    <span style={{ color: '#3498db', fontWeight: '600' }}>View →</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Standalone Tasks */}
      {currentData.standaloneTasks && currentData.standaloneTasks.length > 0 && (
        <div className="task-section">
          <div className="section-header">
            <h2>{viewEmojis[currentView]} {viewTitles[currentView]} - Individual Tasks</h2>
            <span className={`completion-badge ${getCompletionStatus(currentData.standaloneTasks).badge}`}>
              {getCompletionStatus(currentData.standaloneTasks).text}
            </span>
          </div>
          <div className="task-list">
            {currentData.standaloneTasks.map(task => (
              <TaskItem key={task.id} task={task} onUpdate={handleTaskUpdate} />
            ))}
          </div>
        </div>
      )}

      {/* No tasks message */}
      {currentData.checklists.length === 0 && currentData.standaloneTasks.length === 0 && (
        <div className="task-section">
          <p style={{ color: '#7f8c8d', textAlign: 'center', padding: '40px' }}>
            No {currentView} tasks for this period
          </p>
        </div>
      )}
    </div>
  );
}

export default Tasks;
