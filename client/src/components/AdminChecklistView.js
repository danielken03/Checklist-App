import React, { useState, useEffect } from 'react';
import api from '../api';

function AdminChecklistView({ checklist, allTemplates, onBack, onUpdate }) {
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskFormData, setTaskFormData] = useState({
    title: '',
    description: ''
  });
  const [subtasks, setSubtasks] = useState([]);
  const [newSubtaskName, setNewSubtaskName] = useState('');
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [localTasks, setLocalTasks] = useState([]);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editFormData, setEditFormData] = useState({ title: '', description: '' });
  const [editSubtasks, setEditSubtasks] = useState([]);
  const [newEditSubtaskName, setNewEditSubtaskName] = useState('');
  const [originalSubtasks, setOriginalSubtasks] = useState([]);

  // Get tasks that belong to this checklist, sorted by sort_order
  useEffect(() => {
    const tasks = allTemplates
      .filter(t => t.checklist_id === checklist.id)
      .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
    setLocalTasks(tasks);
  }, [allTemplates, checklist.id]);

  const handleAddSubtask = () => {
    if (newSubtaskName.trim()) {
      setSubtasks([...subtasks, { name: newSubtaskName.trim(), sort_order: subtasks.length }]);
      setNewSubtaskName('');
    }
  };

  const handleRemoveSubtask = (index) => {
    setSubtasks(subtasks.filter((_, i) => i !== index));
  };

  const handleAddEditSubtask = () => {
    if (newEditSubtaskName.trim()) {
      setEditSubtasks([...editSubtasks, { name: newEditSubtaskName.trim(), sort_order: editSubtasks.length, isNew: true }]);
      setNewEditSubtaskName('');
    }
  };

  const handleRemoveEditSubtask = (index) => {
    setEditSubtasks(editSubtasks.filter((_, i) => i !== index));
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const template = await api.createTemplate({
        ...taskFormData,
        frequency: checklist.frequency,
        checklist_id: checklist.id
      });
      
      // Add subtasks if any
      for (const subtask of subtasks) {
        await api.addTemplateSubtask(template.id, subtask.name, subtask.sort_order);
      }
      
      setTaskFormData({ title: '', description: '' });
      setSubtasks([]);
      setShowTaskForm(false);
      onUpdate();
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleEditTask = async (task) => {
    setEditingTaskId(task.id);
    setEditFormData({ title: task.title, description: task.description || '' });
    
    // Load existing subtasks
    try {
      const existingSubtasks = await api.getTemplateSubtasks(task.id);
      setEditSubtasks(existingSubtasks);
      setOriginalSubtasks(existingSubtasks);
    } catch (error) {
      console.error('Error loading subtasks:', error);
      setEditSubtasks([]);
      setOriginalSubtasks([]);
    }
  };

  const handleSaveEdit = async (taskId) => {
    try {
      // Update task title and description
      await api.updateTemplate(taskId, {
        ...localTasks.find(t => t.id === taskId),
        title: editFormData.title,
        description: editFormData.description
      });

      // Handle subtasks changes
      // Delete removed subtasks
      const removedSubtasks = originalSubtasks.filter(
        orig => !editSubtasks.find(curr => curr.id === orig.id)
      );
      for (const subtask of removedSubtasks) {
        await api.deleteTemplateSubtask(taskId, subtask.id);
      }

      // Add new subtasks
      const newSubtasks = editSubtasks.filter(st => st.isNew);
      for (let i = 0; i < newSubtasks.length; i++) {
        await api.addTemplateSubtask(taskId, newSubtasks[i].name, i);
      }

      setEditingTaskId(null);
      setEditFormData({ title: '', description: '' });
      setEditSubtasks([]);
      setOriginalSubtasks([]);
      setNewEditSubtaskName('');
      onUpdate();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditingTaskId(null);
    setEditFormData({ title: '', description: '' });
    setEditSubtasks([]);
    setOriginalSubtasks([]);
    setNewEditSubtaskName('');
  };

  const handleDeleteTask = async (task) => {
    if (window.confirm(`Are you sure you want to delete "${task.title}"? This will permanently remove the task and cannot be undone.`)) {
      try {
        await api.deleteTemplate(task.id);
        onUpdate();
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    }
  };

  const handleDeleteChecklist = async () => {
    if (window.confirm(`Are you sure you want to delete the entire "${checklist.name}" checklist? This will permanently delete the checklist and ALL ${localTasks.length} tasks inside it. This cannot be undone.`)) {
      try {
        await api.deleteChecklist(checklist.id);
        onBack();
      } catch (error) {
        console.error('Error deleting checklist:', error);
      }
    }
  };

  const handleDragStart = (index) => {
    setDraggedIndex(index);
  };

  const handleDragEnter = (index) => {
    if (draggedIndex === null) return;
    setDragOverIndex(index);
  };

  const handleDragEnd = async () => {
    if (draggedIndex === null || dragOverIndex === null || draggedIndex === dragOverIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    // Optimistically update local state immediately
    const reorderedTasks = [...localTasks];
    const [removed] = reorderedTasks.splice(draggedIndex, 1);
    reorderedTasks.splice(dragOverIndex, 0, removed);
    
    // Update local state immediately for instant UI feedback
    setLocalTasks(reorderedTasks);

    // Update sort_order for all tasks
    const updates = reorderedTasks.map((task, index) => ({
      id: task.id,
      sort_order: index
    }));

    try {
      await api.reorderTemplates(updates);
      setDraggedIndex(null);
      setDragOverIndex(null);
      onUpdate();
    } catch (error) {
      console.error('Error reordering tasks:', error);
      const tasks = allTemplates
        .filter(t => t.checklist_id === checklist.id)
        .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
      setLocalTasks(tasks);
      setDraggedIndex(null);
      setDragOverIndex(null);
    }
  };

  return (
    <div className="main-content">
      <div className="page-header">
        <button 
          className="btn btn-secondary" 
          onClick={onBack}
          style={{ marginBottom: '15px' }}
        >
          ← Back to Templates
        </button>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
          <div>
            <h1>{checklist.name}</h1>
            <p>{checklist.description}</p>
            <div style={{ marginTop: '10px' }}>
              <span style={{ color: '#7f8c8d' }}>
                Frequency: {checklist.frequency}
              </span>
            </div>
          </div>
          <button
            className="btn"
            onClick={handleDeleteChecklist}
            style={{ backgroundColor: '#e74c3c', color: 'white' }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#c0392b'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#e74c3c'}
          >
            🗑️ Delete Checklist
          </button>
        </div>
      </div>

      <button 
        className="btn btn-primary" 
        onClick={() => setShowTaskForm(!showTaskForm)}
        style={{ marginBottom: '20px' }}
      >
        {showTaskForm ? 'Cancel' : '+ Add Task to Checklist'}
      </button>

      {/* Add Task Form */}
      {showTaskForm && (
        <div className="task-section" style={{ marginBottom: '30px' }}>
          <h3 style={{ marginBottom: '20px' }}>Add New Task</h3>
          <form onSubmit={handleCreateTask}>
            <div className="form-group">
              <label>Task Title</label>
              <input
                type="text"
                className="form-control"
                value={taskFormData.title}
                onChange={(e) => setTaskFormData({ ...taskFormData, title: e.target.value })}
                required
                placeholder="e.g., Weekly Training"
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                className="form-control"
                value={taskFormData.description}
                onChange={(e) => setTaskFormData({ ...taskFormData, description: e.target.value })}
                placeholder="Optional description"
              />
            </div>
            
            {/* Subtasks Section */}
            <div className="form-group">
              <label>Sub-tasks (Optional)</label>
              <p style={{ fontSize: '14px', color: '#7f8c8d', marginBottom: '10px' }}>
                Add sub-tasks that need to be individually checked off. The main task will auto-complete when all sub-tasks are done.
              </p>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                <input
                  type="text"
                  className="form-control"
                  value={newSubtaskName}
                  onChange={(e) => setNewSubtaskName(e.target.value)}
                  placeholder="e.g., Employee 1, John Smith"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSubtask();
                    }
                  }}
                />
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={handleAddSubtask}
                >
                  + Add
                </button>
              </div>
              
              {subtasks.length > 0 && (
                <div style={{ 
                  border: '1px solid #e0e0e0', 
                  borderRadius: '4px', 
                  padding: '10px',
                  backgroundColor: '#f8f9fa'
                }}>
                  {subtasks.map((subtask, index) => (
                    <div key={index} style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      padding: '8px',
                      marginBottom: '5px',
                      backgroundColor: 'white',
                      borderRadius: '4px'
                    }}>
                      <span>{subtask.name}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSubtask(index)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#e74c3c',
                          cursor: 'pointer',
                          fontSize: '18px'
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <button type="submit" className="btn btn-primary">
              Add Task
            </button>
          </form>
        </div>
      )}

      {/* Tasks in this Checklist */}
      <div className="task-section">
        <div className="section-header">
          <h2>Tasks in this Checklist</h2>
          <span style={{ fontSize: '14px', color: '#7f8c8d' }}>
            {localTasks.length} task{localTasks.length !== 1 ? 's' : ''} • Drag to reorder
          </span>
        </div>

        {localTasks.length === 0 ? (
          <p style={{ color: '#7f8c8d', textAlign: 'center', padding: '40px' }}>
            No tasks in this checklist yet. Click "+ Add Task to Checklist" to create one.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {localTasks.map((task, index) => (
              <div
                key={task.id}
                draggable={editingTaskId !== task.id}
                onDragStart={() => handleDragStart(index)}
                onDragEnter={() => handleDragEnter(index)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => e.preventDefault()}
                style={{
                  border: dragOverIndex === index ? '2px dashed #3498db' : '1px solid #e0e0e0',
                  borderRadius: '6px',
                  padding: '15px',
                  backgroundColor: 'white',
                  cursor: editingTaskId === task.id ? 'default' : 'move',
                  opacity: draggedIndex === index ? 0.5 : 1,
                  transition: 'all 0.2s'
                }}
              >
                {editingTaskId === task.id ? (
                  // Edit Form
                  <div>
                    <div className="form-group" style={{ marginBottom: '15px' }}>
                      <label>Task Title</label>
                      <input
                        type="text"
                        className="form-control"
                        value={editFormData.title}
                        onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                        autoFocus
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: '15px' }}>
                      <label>Description</label>
                      <textarea
                        className="form-control"
                        value={editFormData.description}
                        onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                      />
                    </div>

                    {/* Edit Subtasks */}
                    <div className="form-group" style={{ marginBottom: '15px' }}>
                      <label>Sub-tasks</label>
                      <p style={{ fontSize: '14px', color: '#7f8c8d', marginBottom: '10px' }}>
                        Add or remove sub-tasks for this task.
                      </p>
                      <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                        <input
                          type="text"
                          className="form-control"
                          value={newEditSubtaskName}
                          onChange={(e) => setNewEditSubtaskName(e.target.value)}
                          placeholder="e.g., Employee 1, John Smith"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddEditSubtask();
                            }
                          }}
                        />
                        <button 
                          type="button" 
                          className="btn btn-secondary"
                          onClick={handleAddEditSubtask}
                        >
                          + Add
                        </button>
                      </div>
                      
                      {editSubtasks.length > 0 && (
                        <div style={{ 
                          border: '1px solid #e0e0e0', 
                          borderRadius: '4px', 
                          padding: '10px',
                          backgroundColor: '#f8f9fa'
                        }}>
                          {editSubtasks.map((subtask, index) => (
                            <div key={subtask.id || `new-${index}`} style={{ 
                              display: 'flex', 
                              justifyContent: 'space-between', 
                              alignItems: 'center',
                              padding: '8px',
                              marginBottom: '5px',
                              backgroundColor: 'white',
                              borderRadius: '4px'
                            }}>
                              <span>{subtask.name}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveEditSubtask(index)}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: '#e74c3c',
                                  cursor: 'pointer',
                                  fontSize: '18px'
                                }}
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        className="btn btn-primary"
                        onClick={() => handleSaveEdit(task.id)}
                      >
                        Save
                      </button>
                      <button
                        className="btn btn-secondary"
                        onClick={handleCancelEdit}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  // Display Mode
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '20px', color: '#7f8c8d', cursor: 'grab' }}>⋮⋮</span>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ marginBottom: '5px', color: '#2c3e50' }}>{task.title}</h4>
                        {task.description && (
                          <p style={{ color: '#7f8c8d', fontSize: '14px', marginBottom: '10px' }}>
                            {task.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        className="btn btn-secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditTask(task);
                        }}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        className="btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTask(task);
                        }}
                        style={{ backgroundColor: '#e74c3c', color: 'white' }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#c0392b'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = '#e74c3c'}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminChecklistView;
