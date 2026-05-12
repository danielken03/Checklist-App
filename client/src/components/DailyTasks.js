import React, { useState, useEffect } from 'react';
import api from '../api';
import TaskItem from './TaskItem';

function DailyTasks({ initialView = 'daily' }) {
  const [tasks, setTasks] = useState({ daily: [], weekly: [], monthly: [] });
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [currentView, setCurrentView] = useState(initialView);

  useEffect(() => {
    setCurrentView(initialView);
  }, [initialView]);

  useEffect(() => {
    loadTasks();
  }, [selectedDate]);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const data = await api.getTasksForDate(selectedDate);
      setTasks(data);
      
      // Auto-progress logic (only if not manually navigated)
      if (initialView === 'daily') {
        const dailyCompleted = data.daily.every(t => t.completion_id);
        const weeklyCompleted = data.weekly.every(t => t.completion_id);
        
        if (currentView === 'daily' && dailyCompleted && data.weekly.length > 0) {
          setCurrentView('weekly');
        } else if (currentView === 'weekly' && weeklyCompleted && data.monthly.length > 0) {
          setCurrentView('monthly');
        }
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
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

  const renderTaskSection = (taskList, title, frequency) => {
    const status = getCompletionStatus(taskList);

    return (
      <div className="task-section">
        <div className="section-header">
          <h2>{title}</h2>
          <span className={`completion-badge ${status.badge}`}>
            {status.text}
          </span>
        </div>
        <div className="task-list">
          {taskList.length === 0 ? (
            <p style={{ color: '#7f8c8d' }}>No {frequency} tasks for this period</p>
          ) : (
            taskList.map(task => (
              <TaskItem key={task.id} task={task} onUpdate={loadTasks} />
            ))
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return <div className="loading">Loading tasks...</div>;
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

  return (
    <div className="main-content">
      <div className="page-header">
        <h1>{viewTitles[currentView]}</h1>
        <p>Complete your {currentView} tasks for {new Date(selectedDate).toLocaleDateString()}</p>
      </div>

      <div className="form-group" style={{ maxWidth: '300px', marginBottom: '30px' }}>
        <label>Select Date</label>
        <input
          type="date"
          className="form-control"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
      </div>

      {currentView === 'daily' && renderTaskSection(tasks.daily, `${viewEmojis.daily} Daily Tasks`, 'daily')}
      {currentView === 'weekly' && renderTaskSection(tasks.weekly, `${viewEmojis.weekly} Weekly Tasks`, 'weekly')}
      {currentView === 'monthly' && renderTaskSection(tasks.monthly, `${viewEmojis.monthly} Monthly Tasks`, 'monthly')}
    </div>
  );
}

export default DailyTasks;
