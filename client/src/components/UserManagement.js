import React, { useState, useEffect } from 'react';
import api from '../api';

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    role: 'front_office_employee'
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await api.getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await api.createUser(formData);
      setFormData({ username: '', password: '', name: '', role: 'front_office_employee' });
      setShowCreateForm(false);
      loadUsers();
      alert('User created successfully!');
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Error creating user. Username may already exist.');
    }
  };

  const handleDeleteUser = async (userId, username) => {
    if (!window.confirm(`Are you sure you want to delete user "${username}"? This cannot be undone.`)) return;
    try {
      await api.deleteUser(userId);
      loadUsers();
      alert('User deleted successfully!');
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Error deleting user.');
    }
  };

  const getRoleBadgeColor = (role) => {
    const colors = {
      grand_admin: '#8e44ad',
      front_office_admin: '#3498db',
      sales_admin: '#e67e22',
      manager: '#16a085',
      front_office_employee: '#27ae60',
      sales_employee: '#f39c12',
    };
    return colors[role] || '#95a5a6';
  };

  const formatRole = (role) =>
    role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  if (loading) return <div className="loading">Loading users...</div>;

  return (
    <div className="main-content">
      <div className="page-header">
        <h1>User Management</h1>
        <p>Create and manage user accounts</p>
      </div>

      <button
        className="btn btn-primary um-toggle-btn"
        onClick={() => setShowCreateForm(!showCreateForm)}
      >
        {showCreateForm ? 'Cancel' : '+ Create New User'}
      </button>

      {showCreateForm && (
        <div className="task-section um-form-section">
          <h3 className="um-form-heading">Create New User</h3>
          <form onSubmit={handleCreateUser}>
            <div className="um-form-grid">
              <div className="form-group">
                <label>Username</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  className="form-control"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select
                  className="form-control"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="grand_admin">Grand Admin</option>
                  <option value="front_office_admin">Front Office Admin</option>
                  <option value="front_office_employee">Front Office Employee</option>
                  <option value="sales_admin">Sales Admin</option>
                  <option value="sales_employee">Sales Employee</option>
                  <option value="manager">Manager</option>
                </select>
              </div>
            </div>
            <button type="submit" className="btn btn-success um-submit-btn">
              Create User
            </button>
          </form>
        </div>
      )}

      <div className="task-section">
        <h3 className="um-table-heading">All Users ({users.length})</h3>
        <table className="um-table">
          <thead>
            <tr className="um-table-header-row">
              <th className="um-th">Username</th>
              <th className="um-th">Name</th>
              <th className="um-th">Role</th>
              <th className="um-th">Created</th>
              <th className="um-th um-th-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td className="um-td">{user.username}</td>
                <td className="um-td">{user.name}</td>
                <td className="um-td">
                  <span
                    className="um-role-badge"
                    style={{ backgroundColor: getRoleBadgeColor(user.role) }}
                  >
                    {formatRole(user.role)}
                  </span>
                </td>
                <td className="um-td">{new Date(user.created_at).toLocaleDateString('en-US')}</td>
                <td className="um-td um-td-center">
                  <button
                    className="btn um-delete-btn"
                    onClick={() => handleDeleteUser(user.id, user.username)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default UserManagement;
