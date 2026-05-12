import React, { useState, useEffect } from 'react';
import api from '../api';
import AdminChecklistView from './AdminChecklistView';

function Templates() {
  const [templates, setTemplates] = useState([]);
  const [checklists, setChecklists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [showChecklistForm, setShowChecklistForm] = useState(false);
  const [showOneOffForm, setShowOneOffForm] = useState(false);
  const [selectedChecklist, setSelectedChecklist] = useState(null);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editFormData, setEditFormData] = useState({ title: '', description: '' });
  const [editSubtasks, setEditSubtasks] = useState([]);
  const [newEditSubtaskName, setNewEditSubtaskName] = useState('');
  const [originalSubtasks, setOriginalSubtasks] = useState([]);
  
  const [templateFormData, setTemplateFormData] = useState({
    title: '',
    description: '',
    frequency: 'daily',
    checklist_id: ''
  });
  
  const [templateSubtasks, setTemplateSubtasks] = useState([]);
  const [newTemplateSubtaskName, setNewTemplateSubtaskName] = useState('');
  
  const [checklistFormData, setChecklistFormData] = useState({
    name: '',
    description: '',
    frequency: 'daily'
  });
  
  const [oneOffData, setOneOffData] = useState({
    title: '',
    description: '',
    frequency: 'daily',
    due_date: new Date().toISOString().split('T')[0],
    checklist_id: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [templatesData, checklistsData] = await Promise.all([
        api.getTemplates(),
        api.getChecklists()
      ]);
      setTemplates(templatesData);
      setChecklists(checklistsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTemplateSubtask = () => {
    if (newTemplateSubtaskName.trim()) {
      setTemplateSubtasks([...templateSubtasks, { name: newTemplateSubtaskName.trim(), sort_order: templateSubtasks.length }]);
      setNewTemplateSubtaskName('');
    }
  };

  const handleRemoveTemplateSubtask = (index) => {
    setTemplateSubtasks(templateSubtasks.filter((_, i) => i !== index));
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

  const handleCreateTemplate = async (e) => {
    e.preventDefault();
    try {
      const template = await api.createTemplate({
        ...templateFormData,
        checklist_id: templateFormData.checklist_id || null
      });
      
      // Add subtasks if any
      for (const subtask of templateSubtasks) {
        await api.addTemplateSubtask(template.id, subtask.name, subtask.sort_order);
      }
      
      setTemplateFormData({ title: '', description: '', frequency: 'daily', checklist_id: '' });
      setTemplateSubtasks([]);
      setShowTemplateForm(false);
      loadData();
    } catch (error) {
      console.error('Error creating template:', error);
    }
  };

  const handleCreateChecklist = async (e) => {
    e.preventDefault();
    try {
      await api.createChecklist(checklistFormData);
      setChecklistFormData({ name: '', description: '', frequency: 'daily' });
      setShowChecklistForm(false);
      loadData();
    } catch (error) {
      console.error('Error creating checklist:', error);
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

  const handleSaveEdit = async (task) => {
    try {
      // Update task title and description
      await api.updateTemplate(task.id, {
        ...task,
        title: editFormData.title,
        description: editFormData.description
      });

      // Handle subtasks changes
      // Delete removed subtasks
      const removedSubtasks = originalSubtasks.filter(
        orig => !editSubtasks.find(curr => curr.id === orig.id)
      );
      for (const subtask of removedSubtasks) {
        await api.deleteTemplateSubtask(task.id, subtask.id);
      }

      // Add new subtasks
      const newSubtasks = editSubtasks.filter(st => st.isNew);
      for (let i = 0; i < newSubtasks.length; i++) {
        await api.addTemplateSubtask(task.id, newSubtasks[i].name, i);
      }

      setEditingTaskId(null);
      setEditFormData({ title: '', description: '' });
      setEditSubtasks([]);
      setOriginalSubtasks([]);
      setNewEditSubtaskName('');
      loadData();
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

  const handleDeleteTemplate = async (template) => {
    if (window.confirm(`Are you sure you want to delete "${template.title}"? This will permanently remove the task and cannot be undone.`)) {
      try {
        await api.deleteTemplate(template.id);
        loadData();
      } catch (error) {
        console.error('Error deleting template:', error);
      }
    }
  };

  const handleCreateOneOff = async (e) => {
    e.preventDefault();
    try {
      await api.createOneOffTask({
        ...oneOffData,
        checklist_id: oneOffData.checklist_id || null
      });
      setOneOffData({
        title: '',
        description: '',
        frequency: 'daily',
        due_date: new Date().toISOString().split('T')[0],
        checklist_id: ''
      });
      setShowOneOffForm(false);
      alert('One-off task created successfully!');
    } catch (error) {
      console.error('Error creating one-off task:', error);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  // If viewing a specific checklist
  if (selectedChecklist) {
    return (
      <AdminChecklistView
        checklist={selectedChecklist}
        allTemplates={templates}
        onBack={() => setSelectedChecklist(null)}
        onUpdate={() => {
          loadData();
        }}
      />
    );
  }

  // Group templates by frequency (only standalone tasks)
  const standaloneTemplates = {
    daily: templates.filter(t => t.frequency === 'daily' && !t.checklist_id),
    weekly: templates.filter(t => t.frequency === 'weekly' && !t.checklist_id),
    monthly: templates.filter(t => t.frequency === 'monthly' && !t.checklist_id)
  };

  // Group checklists by frequency
  const groupedChecklists = {
    daily: checklists.filter(c => c.frequency === 'daily'),
    weekly: checklists.filter(c => c.frequency === 'weekly'),
    monthly: checklists.filter(c => c.frequency === 'monthly')
  };

  return (
    <div className="main-content">
      <div className="page-header">
        <h1>Manage Templates & Checklists</h1>
        <p>Create and manage recurring tasks and checklists</p>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', flexWrap: 'wrap' }}>
        <button className="btn btn-primary" onClick={() => setShowChecklistForm(!showChecklistForm)}>
          {showChecklistForm ? 'Cancel' : '+ New Checklist'}
        </button>
        <button className="btn btn-primary" onClick={() => setShowTemplateForm(!showTemplateForm)}>
          {showTemplateForm ? 'Cancel' : '+ New Standalone Task'}
        </button>
        <button className="btn btn-success" onClick={() => setShowOneOffForm(!showOneOffForm)}>
          {showOneOffForm ? 'Cancel' : '+ One-Off Task'}
        </button>
      </div>

      {/* Create Checklist Form */}
      {showChecklistForm && (
        <div className="task-section" style={{ marginBottom: '30px' }}>
          <h3 style={{ marginBottom: '20px' }}>Create New Checklist</h3>
          <form onSubmit={handleCreateChecklist}>
            <div className="form-group">
              <label>Checklist Name</label>
              <input
                type="text"
                className="form-control"
                value={checklistFormData.name}
                onChange={(e) => setChecklistFormData({ ...checklistFormData, name: e.target.value })}
                required
                placeholder="e.g., AM Checklist, PM Checklist"
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                className="form-control"
                value={checklistFormData.description}
                onChange={(e) => setChecklistFormData({ ...checklistFormData, description: e.target.value })}
                placeholder="Optional description"
              />
            </div>
            <div className="form-group">
              <label>Frequency</label>
              <select
                className="form-control"
                value={checklistFormData.frequency}
                onChange={(e) => setChecklistFormData({ ...checklistFormData, frequency: e.target.value })}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary">
              Create Checklist
            </button>
          </form>
        </div>
      )}

      {/* Create Standalone Task Template Form */}
      {showTemplateForm && (
        <div className="task-section" style={{ marginBottom: '30px' }}>
          <h3 style={{ marginBottom: '20px' }}>Create New Standalone Task</h3>
          <p style={{ color: '#7f8c8d', marginBottom: '20px' }}>
            This task will not belong to any checklist. To add tasks to a checklist, click on the checklist below.
          </p>
          <form onSubmit={handleCreateTemplate}>
            <div className="form-group">
              <label>Task Title</label>
              <input
                type="text"
                className="form-control"
                value={templateFormData.title}
                onChange={(e) => setTemplateFormData({ ...templateFormData, title: e.target.value })}
                required
                placeholder="e.g., Review quarterly reports"
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                className="form-control"
                value={templateFormData.description}
                onChange={(e) => setTemplateFormData({ ...templateFormData, description: e.target.value })}
                placeholder="Optional description"
              />
            </div>
            <div className="form-group">
              <label>Frequency</label>
              <select
                className="form-control"
                value={templateFormData.frequency}
                onChange={(e) => setTemplateFormData({ ...templateFormData, frequency: e.target.value })}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
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
                  value={newTemplateSubtaskName}
                  onChange={(e) => setNewTemplateSubtaskName(e.target.value)}
                  placeholder="e.g., Employee 1, John Smith"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTemplateSubtask();
                    }
                  }}
                />
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={handleAddTemplateSubtask}
                >
                  + Add
                </button>
              </div>
              
              {templateSubtasks.length > 0 && (
                <div style={{ 
                  border: '1px solid #e0e0e0', 
                  borderRadius: '4px', 
                  padding: '10px',
                  backgroundColor: '#f8f9fa'
                }}>
                  {templateSubtasks.map((subtask, index) => (
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
                        onClick={() => handleRemoveTemplateSubtask(index)}
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
              Create Standalone Task
            </button>
          </form>
        </div>
      )}

      {/* Create One-Off Task Form */}
      {showOneOffForm && (
        <div className="task-section" style={{ marginBottom: '30px' }}>
          <h3 style={{ marginBottom: '20px' }}>Create One-Off Task</h3>
          <form onSubmit={handleCreateOneOff}>
            <div className="form-group">
              <label>Task Title</label>
              <input
                type="text"
                className="form-control"
                value={oneOffData.title}
                onChange={(e) => setOneOffData({ ...oneOffData, title: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                className="form-control"
                value={oneOffData.description}
                onChange={(e) => setOneOffData({ ...oneOffData, description: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Frequency Type</label>
              <select
                className="form-control"
                value={oneOffData.frequency}
                onChange={(e) => setOneOffData({ ...oneOffData, frequency: e.target.value, checklist_id: '' })}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            <div className="form-group">
              <label>Assign to Checklist (Optional)</label>
              <select
                className="form-control"
                value={oneOffData.checklist_id}
                onChange={(e) => setOneOffData({ ...oneOffData, checklist_id: e.target.value })}
              >
                <option value="">None (Standalone Task)</option>
                {checklists
                  .filter(c => c.frequency === oneOffData.frequency)
                  .map(checklist => (
                    <option key={checklist.id} value={checklist.id}>
                      {checklist.name}
                    </option>
                  ))}
              </select>
            </div>
            <div className="form-group">
              <label>Due Date</label>
              <input
                type="date"
                className="form-control"
                value={oneOffData.due_date}
                onChange={(e) => setOneOffData({ ...oneOffData, due_date: e.target.value })}
                required
              />
            </div>
            <button type="submit" className="btn btn-success">
              Create One-Off Task
            </button>
          </form>
        </div>
      )}

      {/* Checklists Section */}
      <div className="task-section" style={{ marginBottom: '30px' }}>
        <h2 style={{ marginBottom: '20px' }}>📋 Checklists</h2>
        <p style={{ color: '#7f8c8d', marginBottom: '20px' }}>
          Click on a checklist to view and manage its tasks
        </p>
        
        {['daily', 'weekly', 'monthly'].map(freq => (
          groupedChecklists[freq].length > 0 && (
            <div key={freq} style={{ marginBottom: '30px' }}>
              <h3 style={{ marginBottom: '15px', textTransform: 'capitalize', color: '#7f8c8d' }}>
                {freq} Checklists
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '15px' }}>
                {groupedChecklists[freq].map(checklist => {
                  const taskCount = templates.filter(t => t.checklist_id === checklist.id).length;
                  return (
                    <div
                      key={checklist.id}
                      onClick={() => setSelectedChecklist(checklist)}
                      style={{
                        border: '2px solid #3498db',
                        borderRadius: '8px',
                        padding: '20px',
                        backgroundColor: 'white',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(52, 152, 219, 0.3)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = 'none';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      <h4 style={{ marginBottom: '8px', color: '#2c3e50' }}>{checklist.name}</h4>
                      {checklist.description && (
                        <p style={{ color: '#7f8c8d', fontSize: '14px', marginBottom: '12px' }}>
                          {checklist.description}
                        </p>
                      )}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '14px', color: '#7f8c8d' }}>
                          {taskCount} task{taskCount !== 1 ? 's' : ''}
                        </span>
                        <span style={{ color: '#3498db', fontWeight: '600' }}>Manage →</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )
        ))}
      </div>

      {/* Standalone Task Templates Section */}
      <div className="task-section">
        <h2 style={{ marginBottom: '20px' }}>📝 Standalone Tasks</h2>
        <p style={{ color: '#7f8c8d', marginBottom: '20px' }}>
          Tasks that are not part of any checklist
        </p>
        
        {['daily', 'weekly', 'monthly'].map(freq => (
          standaloneTemplates[freq].length > 0 && (
            <div key={freq} style={{ marginBottom: '30px' }}>
              <h3 style={{ marginBottom: '15px', textTransform: 'capitalize', color: '#7f8c8d' }}>
                {freq} Tasks
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {standaloneTemplates[freq].map(template => (
                  <div
                    key={template.id}
                    style={{
                      border: '1px solid #e0e0e0',
                      borderRadius: '6px',
                      padding: '15px',
                      backgroundColor: 'white'
                    }}
                  >
                    {editingTaskId === template.id ? (
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
                            onClick={() => handleSaveEdit(template)}
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
                        <div style={{ flex: 1 }}>
                          <h4 style={{ marginBottom: '5px' }}>{template.title}</h4>
                          <p style={{ color: '#7f8c8d', fontSize: '14px', marginBottom: '10px' }}>
                            {template.description}
                          </p>
                          <div style={{ display: 'flex', gap: '15px', fontSize: '14px' }}>
                            <span>
                              <strong>Frequency:</strong> {template.frequency}
                            </span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <button
                            className="btn btn-secondary"
                            onClick={() => handleEditTask(template)}
                          >
                            ✏️ Edit
                          </button>
                          <button
                            className="btn"
                            onClick={() => handleDeleteTemplate(template)}
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
            </div>
          )
        ))}
        
        {standaloneTemplates.daily.length === 0 && 
         standaloneTemplates.weekly.length === 0 && 
         standaloneTemplates.monthly.length === 0 && (
          <p style={{ color: '#7f8c8d', textAlign: 'center', padding: '20px' }}>
            No standalone tasks. All tasks are organized in checklists.
          </p>
        )}
      </div>
    </div>
  );
}

export default Templates;
