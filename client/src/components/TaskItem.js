import React, { useState } from 'react';
import api from '../api';

function TaskItem({ task, onUpdate }) {
  const [showDetails, setShowDetails] = useState(false);
  const [comment, setComment] = useState('');
  const [uploading, setUploading] = useState(false);

  const hasSubtasks = task.subtasks && task.subtasks.length > 0;
  const isCompleted = hasSubtasks 
    ? task.subtasks.every(st => st.is_completed === 1)
    : !!task.completion_id;

  const handleToggle = async () => {
    if (hasSubtasks) {
      return;
    }
    
    try {
      if (isCompleted) {
        await api.uncompleteTask(task.id);
      } else {
        await api.completeTask(task.id);
      }
      onUpdate();
    } catch (error) {
      console.error('Error toggling task:', error);
    }
  };

  const handleSubtaskToggle = async (subtask) => {
    try {
      if (subtask.is_completed) {
        await api.uncompleteSubtask(task.id, subtask.id);
      } else {
        await api.completeSubtask(task.id, subtask.id);
      }
      onUpdate();
    } catch (error) {
      console.error('Error toggling subtask:', error);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    try {
      await api.addComment(task.id, comment);
      setComment('');
      onUpdate();
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      await api.uploadFile(task.id, file);
      onUpdate();
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDeleteFile = async (fileId, fileName) => {
    if (window.confirm(`Are you sure you want to delete "${fileName}"?`)) {
      try {
        await api.deleteFile(task.id, fileId);
        onUpdate();
      } catch (error) {
        console.error('Error deleting file:', error);
      }
    }
  };

  const isImageFile = (filename) => {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
    return imageExtensions.some(ext => filename.toLowerCase().endsWith(ext));
  };

  const isPdfFile = (filename) => {
    return filename.toLowerCase().endsWith('.pdf');
  };

  const getFileIcon = (filename) => {
    if (isImageFile(filename)) return '🖼️';
    if (isPdfFile(filename)) return '📑';
    if (filename.toLowerCase().endsWith('.xlsx') || filename.toLowerCase().endsWith('.xls')) return '📊';
    if (filename.toLowerCase().endsWith('.docx') || filename.toLowerCase().endsWith('.doc')) return '📝';
    return '📄';
  };

  const FilePreview = ({ file }) => {
    const fileUrl = `http://localhost:5001/uploads/${file.filename}`;

    if (isImageFile(file.filename)) {
      return (
        <img 
          src={fileUrl}
          alt={file.original_name}
          style={{
            width: '100%',
            height: '100px',
            objectFit: 'cover',
            borderRadius: '4px',
            marginBottom: '8px'
          }}
        />
      );
    } else if (isPdfFile(file.filename)) {
      return (
        <div style={{ 
          height: '100px', 
          overflow: 'hidden',
          borderRadius: '4px',
          marginBottom: '8px',
          backgroundColor: '#f0f0f0',
          position: 'relative'
        }}>
          <iframe
            src={`${fileUrl}#page=1&view=FitH`}
            style={{
              width: '100%',
              height: '200px',
              border: 'none',
              pointerEvents: 'none',
              transform: 'scale(1)',
              transformOrigin: 'top left'
            }}
            title={file.original_name}
          />
          <div style={{
            position: 'absolute',
            bottom: '5px',
            right: '5px',
            backgroundColor: 'rgba(0,0,0,0.7)',
            color: 'white',
            padding: '2px 6px',
            borderRadius: '3px',
            fontSize: '10px',
            fontWeight: 'bold'
          }}>
            PDF
          </div>
        </div>
      );
    } else {
      return (
        <div style={{
          fontSize: '48px',
          textAlign: 'center',
          marginBottom: '8px',
          height: '100px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {getFileIcon(file.filename)}
        </div>
      );
    }
  };

  return (
    <div className={`task-item ${isCompleted ? 'completed' : ''}`}>
      <div className="task-header">
        <input
          type="checkbox"
          className="task-checkbox"
          checked={isCompleted}
          onChange={handleToggle}
          disabled={hasSubtasks}
          style={{ cursor: hasSubtasks ? 'not-allowed' : 'pointer' }}
        />
        <div className="task-content">
          <div className="task-title">{task.title}</div>
          {task.description && (
            <div className="task-description">{task.description}</div>
          )}
          
          {/* Subtasks */}
          {hasSubtasks && (
            <div style={{ marginTop: '15px', marginLeft: '20px' }}>
              {task.subtasks.map((subtask) => (
                <div key={subtask.id} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '10px', 
                  marginBottom: '8px',
                  padding: '8px',
                  backgroundColor: subtask.is_completed ? '#f8f9fa' : 'transparent',
                  borderRadius: '4px'
                }}>
                  <input
                    type="checkbox"
                    checked={subtask.is_completed === 1}
                    onChange={() => handleSubtaskToggle(subtask)}
                    style={{ cursor: 'pointer' }}
                  />
                  <span style={{ 
                    textDecoration: subtask.is_completed ? 'line-through' : 'none',
                    color: subtask.is_completed ? '#7f8c8d' : '#2c3e50'
                  }}>
                    {subtask.name}
                  </span>
                </div>
              ))}
            </div>
          )}
          
          <div className="task-actions" style={{ marginTop: '10px' }}>
            <button
              className="btn btn-secondary"
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? 'Hide Details' : 'Show Details'}
            </button>
            <label className="btn btn-primary">
              {uploading ? 'Uploading...' : '📎 Upload File'}
              <input
                type="file"
                style={{ display: 'none' }}
                onChange={handleFileUpload}
                disabled={uploading}
              />
            </label>
          </div>
        </div>
      </div>

      {showDetails && (
        <div className="task-details">
          {/* Completion Status */}
          {task.completions && task.completions.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <strong>✓ Completed by:</strong>
              <div style={{ marginTop: '10px' }}>
                {task.completions.map((completion) => (
                  <div key={completion.id} style={{ 
                    padding: '8px 12px',
                    backgroundColor: '#e8f5e9',
                    borderLeft: '3px solid #4caf50',
                    marginBottom: '8px',
                    borderRadius: '4px'
                  }}>
                    <div style={{ fontWeight: '600', color: '#2c3e50' }}>
                      {completion.user_name}
                    </div>
                    <div style={{ fontSize: '12px', color: '#7f8c8d', marginTop: '4px' }}>
                      {new Date(completion.completed_at).toLocaleString('en-US')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Files */}
          {task.files && task.files.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <strong>Uploaded Files:</strong>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', 
                gap: '15px',
                marginTop: '10px'
              }}>
                {task.files.map((file) => (
                  <div key={file.id} style={{
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    padding: '10px',
                    backgroundColor: '#f8f9fa',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                  onClick={() => {
                    window.open(`http://localhost:5001/uploads/${file.filename}`, '_blank');
                  }}>
                    {/* Delete button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteFile(file.id, file.original_name);
                      }}
                      style={{
                        position: 'absolute',
                        top: '5px',
                        right: '5px',
                        backgroundColor: '#e74c3c',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: '24px',
                        height: '24px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 10,
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#c0392b'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = '#e74c3c'}
                    >
                      ×
                    </button>

                    <FilePreview file={file} />
                    <div style={{
                      fontSize: '12px',
                      fontWeight: '600',
                      marginBottom: '4px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {file.original_name}
                    </div>
                    <div style={{
                      fontSize: '10px',
                      color: '#7f8c8d'
                    }}>
                      {file.user_name}
                    </div>
                    <div style={{
                      fontSize: '10px',
                      color: '#7f8c8d'
                    }}>
                      {new Date(file.uploaded_at).toLocaleDateString('en-US')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Comments */}
          <div className="comment-form">
            <form onSubmit={handleAddComment}>
              <div className="form-group">
                <label>Add Comment</label>
                <textarea
                  className="form-control"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Type your comment here..."
                />
              </div>
              <button type="submit" className="btn btn-success">
                Post Comment
              </button>
            </form>
          </div>

          {task.comments && task.comments.length > 0 && (
            <div className="comment-list">
              <strong>Comments:</strong>
              {task.comments.map((c) => (
                <div key={c.id} className="comment-item">
                  <div className="comment-header">
                    <span className="comment-author">{c.user_name}</span>
                    <span>{new Date(c.created_at).toLocaleString('en-US')}</span>
                  </div>
                  <div className="comment-text">{c.comment}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default TaskItem;
