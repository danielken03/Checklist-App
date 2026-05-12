import React, { useState, useEffect } from 'react';
import api from '../api';
import GroupResumeForm from './GroupResumeForm';
import GroupResumeView from './GroupResumeView';

function GroupResumeList({ selectedDate, onClose, userRole }) {
  const [resumes, setResumes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showView, setShowView] = useState(false);
  const [selectedResumeId, setSelectedResumeId] = useState(null);
  const [loading, setLoading] = useState(true);

  const canEdit = ['grand_admin', 'sales_admin', 'sales_employee'].includes(userRole);

  useEffect(() => {
    loadResumes();
  }, [selectedDate]);

  const loadResumes = async () => {
    try {
      setLoading(true);
      const data = await api.getGroupResumesForDate(selectedDate);
      setResumes(data);
    } catch (error) {
      console.error('Error loading group resumes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddGroup = () => {
    setSelectedResumeId(null);
    setShowForm(true);
  };

  const handleViewResume = (id) => {
    setSelectedResumeId(id);
    setShowView(true);
  };

  const handleEditResume = (id) => {
    setSelectedResumeId(id);
    setShowView(false);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedResumeId(null);
    loadResumes();
  };

  const handleCloseView = () => {
    setShowView(false);
    setSelectedResumeId(null);
    loadResumes();
  };

  if (showForm) {
    return (
      <GroupResumeForm
        selectedDate={selectedDate}
        resumeId={selectedResumeId}
        onClose={handleCloseForm}
      />
    );
  }

  if (showView) {
    return (
      <GroupResumeView
        resumeId={selectedResumeId}
        onClose={handleCloseView}
        onEdit={handleEditResume}
        canEdit={canEdit}
      />
    );
  }

  const dateObj = new Date(selectedDate + 'T00:00:00');
  const displayDate = dateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <div className="main-content">
      <div className="page-header">
        <div>
          <h1>Group Resumes - {displayDate}</h1>
          <p>View and manage group bookings</p>
        </div>
        <button className="btn btn-secondary" onClick={onClose}>
          ← Back to Calendar
        </button>
      </div>

      {canEdit && (
        <div style={{ marginBottom: '20px' }}>
          <button className="btn btn-primary" onClick={handleAddGroup}>
            + Add Group
          </button>
        </div>
      )}

      {loading ? (
        <div className="loading">Loading group resumes...</div>
      ) : resumes.length === 0 ? (
        <div className="task-section" style={{ textAlign: 'center', padding: '40px' }}>
          <p style={{ fontSize: '16px', color: '#666' }}>No group resumes for this date.</p>
          {canEdit && (
            <p style={{ marginTop: '10px' }}>Click "+ Add Group" to create one.</p>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '20px' }}>
          {resumes.map((resume) => (
            <div
              key={resume.id}
              className="task-section"
              style={{
                cursor: 'pointer',
                transition: 'all 0.2s',
                border: '2px solid #ddd',
                ':hover': { borderColor: '#3498db' }
              }}
              onClick={() => handleViewResume(resume.id)}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = '#3498db'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = '#ddd'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                {resume.logo_filename && (
                  <img
                    src={`/uploads/group-logos/${resume.logo_filename}`}
                    alt="Group Logo"
                    style={{ width: '80px', height: '80px', objectFit: 'contain' }}
                  />
                )}
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 5px 0', color: '#2c3e50' }}>
                    {resume.organization || 'Untitled Group'}
                  </h3>
                  <p style={{ margin: '0', color: '#7f8c8d', fontSize: '14px' }}>
                    {resume.arrival_date} - {resume.departure_date}
                  </p>
                  {resume.peak_attendees && (
                    <p style={{ margin: '5px 0 0 0', color: '#7f8c8d', fontSize: '14px' }}>
                      Peak Attendees: {resume.peak_attendees}
                    </p>
                  )}
                </div>
                <div style={{ fontSize: '24px', color: '#3498db' }}>→</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default GroupResumeList;
