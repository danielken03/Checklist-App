import axios from 'axios';

const API_URL = 'https://checklist-api-rfci.onrender.com/api';

class ApiService {
  constructor() {
    this.token = localStorage.getItem('token');
  }

  setToken(token) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('token');
  }

  getHeaders() {
    return {
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json'
    };
  }

  // Auth
  async login(username, password) {
    const response = await axios.post(`${API_URL}/auth/login`, { username, password });
    this.setToken(response.data.token);
    return response.data;
  }

  logout() {
    this.clearToken();
  }

  // Tasks
  async getTasksForDate(date) {
    const response = await axios.get(`${API_URL}/tasks/${date}`, {
      headers: this.getHeaders()
    });
    return response.data;
  }

  async completeTask(taskId) {
    const response = await axios.post(`${API_URL}/tasks/${taskId}/complete`, {}, {
      headers: this.getHeaders()
    });
    return response.data;
  }

  async uncompleteTask(taskId) {
    const response = await axios.delete(`${API_URL}/tasks/${taskId}/complete`, {
      headers: this.getHeaders()
    });
    return response.data;
  }

  async completeSubtask(taskId, subtaskId) {
    const response = await axios.post(`${API_URL}/tasks/${taskId}/subtask/${subtaskId}/complete`, {}, {
      headers: this.getHeaders()
    });
    return response.data;
  }

  async uncompleteSubtask(taskId, subtaskId) {
    const response = await axios.delete(`${API_URL}/tasks/${taskId}/subtask/${subtaskId}/complete`, {
      headers: this.getHeaders()
    });
    return response.data;
  }

  async addComment(taskId, comment) {
    const response = await axios.post(`${API_URL}/tasks/${taskId}/comment`, 
      { comment },
      { headers: this.getHeaders() }
    );
    return response.data;
  }

  async uploadFile(taskId, file) {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await axios.post(`${API_URL}/tasks/${taskId}/upload`, formData, {
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }

  async deleteFile(taskId, fileId) {
    const response = await axios.delete(`${API_URL}/tasks/${taskId}/file/${fileId}`, {
      headers: this.getHeaders()
    });
    return response.data;
  }

  // Admin - Calendar
  async getCalendarData(year, month) {
    const response = await axios.get(`${API_URL}/admin/calendar/${year}/${month}`, {
      headers: this.getHeaders()
    });
    return response.data;
  }

  async getDayDetails(date) {
    const response = await axios.get(`${API_URL}/admin/day/${date}`, {
      headers: this.getHeaders()
    });
    return response.data;
  }

  // Admin - Checklists
  async getChecklists() {
    const response = await axios.get(`${API_URL}/admin/checklists`, {
      headers: this.getHeaders()
    });
    return response.data;
  }

  async createChecklist(checklist) {
    const response = await axios.post(`${API_URL}/admin/checklists`, checklist, {
      headers: this.getHeaders()
    });
    return response.data;
  }

  async updateChecklist(id, checklist) {
    const response = await axios.put(`${API_URL}/admin/checklists/${id}`, checklist, {
      headers: this.getHeaders()
    });
    return response.data;
  }

  async deleteChecklist(id) {
    const response = await axios.delete(`${API_URL}/admin/checklists/${id}`, {
      headers: this.getHeaders()
    });
    return response.data;
  }

  // Admin - Templates
  async getTemplates() {
    const response = await axios.get(`${API_URL}/admin/templates`, {
      headers: this.getHeaders()
    });
    return response.data;
  }

  async createTemplate(template) {
    const response = await axios.post(`${API_URL}/admin/templates`, template, {
      headers: this.getHeaders()
    });
    return response.data;
  }

  async updateTemplate(id, template) {
    const response = await axios.put(`${API_URL}/admin/templates/${id}`, template, {
      headers: this.getHeaders()
    });
    return response.data;
  }

  async reorderTemplates(templates) {
    const response = await axios.put(`${API_URL}/admin/templates/reorder`, 
      { templates },
      { headers: this.getHeaders() }
    );
    return response.data;
  }

  async deleteTemplate(id) {
    const response = await axios.delete(`${API_URL}/admin/templates/${id}`, {
      headers: this.getHeaders()
    });
    return response.data;
  }

  async getTemplateSubtasks(templateId) {
    const response = await axios.get(`${API_URL}/admin/templates/${templateId}/subtasks`, {
      headers: this.getHeaders()
    });
    return response.data;
  }

  async addTemplateSubtask(templateId, name, sortOrder) {
    const response = await axios.post(`${API_URL}/admin/templates/${templateId}/subtasks`, 
      { name, sort_order: sortOrder },
      { headers: this.getHeaders() }
    );
    return response.data;
  }

  async deleteTemplateSubtask(templateId, subtaskId) {
    const response = await axios.delete(`${API_URL}/admin/templates/${templateId}/subtasks/${subtaskId}`, {
      headers: this.getHeaders()
    });
    return response.data;
  }

  async createOneOffTask(task) {
    const response = await axios.post(`${API_URL}/admin/tasks/one-off`, task, {
      headers: this.getHeaders()
    });
    return response.data;
  }

  async getEmployees() {
    const response = await axios.get(`${API_URL}/admin/employees`, {
      headers: this.getHeaders()
    });
    return response.data;
  }

  // Pre-Shift Forms
  async getPreShiftForm(date) {
    const response = await axios.get(`${API_URL}/preshift/${date}`, {
      headers: this.getHeaders()
    });
    return response.data;
  }

  async savePreShiftForm(date, formData) {
    const response = await axios.post(`${API_URL}/preshift/${date}`, formData, {
      headers: this.getHeaders()
    });
    return response.data;
  }

  async getPreShiftFormDates(year, month) {
    const response = await axios.get(`${API_URL}/preshift/month/${year}/${month}`, {
      headers: this.getHeaders()
    });
    return response.data;
  }

  // User Management (Grand Admin only)
  async getAllUsers() {
    const response = await axios.get(`${API_URL}/admin/users`, {
      headers: this.getHeaders()
    });
    return response.data;
  }

  async createUser(userData) {
    const response = await axios.post(`${API_URL}/admin/users`, userData, {
      headers: this.getHeaders()
    });
    return response.data;
  }

  async deleteUser(userId) {
    const response = await axios.delete(`${API_URL}/admin/users/${userId}`, {
      headers: this.getHeaders()
    });
    return response.data;
  }

  // MOD Reports
  async getMODReport(date) {
    const response = await axios.get(`${API_URL}/mod/${date}`, {
      headers: this.getHeaders()
    });
    return response.data;
  }

  async saveMODReport(date, formData) {
    const response = await axios.post(`${API_URL}/mod/${date}`, formData, {
      headers: this.getHeaders()
    });
    return response.data;
  }

  async getMODReportDates(year, month) {
    const response = await axios.get(`${API_URL}/mod/month/${year}/${month}`, {
      headers: this.getHeaders()
    });
    return response.data;
  }

  // Group Resumes
  async getGroupResumesForDate(date) {
    const response = await axios.get(`${API_URL}/groupresumes/date/${date}`, {
      headers: this.getHeaders()
    });
    return response.data;
  }

  async getGroupResume(id) {
    const response = await axios.get(`${API_URL}/groupresumes/${id}`, {
      headers: this.getHeaders()
    });
    return response.data;
  }

  async createGroupResume(formData, logoFile) {
    const data = new FormData();
    data.append('formData', JSON.stringify(formData));
    if (logoFile) {
      data.append('logo', logoFile);
    }
    
    const response = await axios.post(`${API_URL}/groupresumes`, data, {
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }

  async updateGroupResume(id, formData, logoFile) {
    const data = new FormData();
    data.append('formData', JSON.stringify(formData));
    if (logoFile) {
      data.append('logo', logoFile);
    }
    
    const response = await axios.put(`${API_URL}/groupresumes/${id}`, data, {
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }

  async deleteGroupResume(id) {
    const response = await axios.delete(`${API_URL}/groupresumes/${id}`, {
      headers: this.getHeaders()
    });
    return response.data;
  }

  async getGroupResumeDates(year, month) {
    const response = await axios.get(`${API_URL}/groupresumes/month/${year}/${month}`, {
      headers: this.getHeaders()
    });
    return response.data;
  }

  // Group Resume Packet Generation
  async getGroupResumesForPacket(dates) {
    const response = await axios.post(`${API_URL}/groupresumes/packet`, 
      { dates },
      { headers: this.getHeaders() }
    );
    return response.data;
  }
}

export default new ApiService();
