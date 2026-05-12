const express = require('express');
const { dbAll, dbGet, dbRun } = require('../database');
const { authMiddleware, isAdmin } = require('../middleware/auth');
const router = express.Router();
const { getWeekStart, getMonthStart } = require('../utils/dates');

router.use(authMiddleware);

// Helper: count how many tasks in an array are fully complete
const countCompleted = (tasks) =>
  tasks.filter(t => t.subtask_count > 0
    ? t.completed_subtask_count === t.subtask_count
    : t.completion_count > 0
  ).length;

// Helper: build a summary object from a task list
const buildSummary = (tasks) => {
  if (tasks.length === 0) return { percentage: 0, completedTasks: 0, totalTasks: 0 };
  const completedTasks = countCompleted(tasks);
  return {
    percentage: Math.round((completedTasks / tasks.length) * 100),
    completedTasks,
    totalTasks: tasks.length
  };
};

// Shared SQL for fetching task completion counts
const TASK_COMPLETION_SQL = `
  SELECT t.id, t.title,
         COUNT(DISTINCT tc.user_id) as completion_count,
         COUNT(DISTINCT ts.id) as subtask_count,
         COUNT(DISTINCT CASE WHEN ts.is_completed = 1 THEN ts.id END) as completed_subtask_count
  FROM tasks t
  LEFT JOIN task_completions tc ON t.id = tc.task_id
  LEFT JOIN task_subtasks ts ON t.id = ts.task_id
`;

// Get calendar data for a month with completion percentages
// Everyone can view calendar - NO isAdmin middleware here
router.get('/calendar/:year/:month', async (req, res) => {
  try {
    const { year, month } = req.params;
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    // Daily data — one entry per day in the month
    const dailyData = {};
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const dayTasks = await dbAll(
        `${TASK_COMPLETION_SQL} WHERE t.due_date = ? AND t.frequency = 'daily' GROUP BY t.id`,
        [dateStr]
      );
      dailyData[dateStr] = buildSummary(dayTasks);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Weekly data — one entry per week that overlaps the month
    const weeklyData = {};
    const firstDay = new Date(startDate);
    firstDay.setDate(firstDay.getDate() - firstDay.getDay()); // rewind to Sunday
    const currentWeek = new Date(firstDay);
    while (currentWeek <= endDate) {
      const weekStartStr = currentWeek.toISOString().split('T')[0];
      const weekTasks = await dbAll(
        `${TASK_COMPLETION_SQL} WHERE t.week_start = ? AND t.frequency = 'weekly' GROUP BY t.id`,
        [weekStartStr]
      );
      if (weekTasks.length > 0) weeklyData[weekStartStr] = buildSummary(weekTasks);
      currentWeek.setDate(currentWeek.getDate() + 7);
    }

    // Monthly data — single entry for the whole month
    const monthStartStr = startDate.toISOString().split('T')[0];
    const monthTasks = await dbAll(
      `${TASK_COMPLETION_SQL} WHERE t.month_start = ? AND t.frequency = 'monthly' GROUP BY t.id`,
      [monthStartStr]
    );
    const monthlyData = buildSummary(monthTasks);

    res.json({ daily: dailyData, weekly: weeklyData, monthly: monthlyData });
  } catch (error) {
    console.error('Error fetching calendar data:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get detailed view of a specific date
// Everyone can view - NO isAdmin middleware here
router.get('/day/:date', async (req, res) => {
  try {
    const { date } = req.params;

    const weekStartStr = getWeekStart(date);
    const monthStartStr = getMonthStart(date);

    const tasks = await dbAll(`
      SELECT t.*, GROUP_CONCAT(DISTINCT tc.user_id) as completed_by_ids
      FROM tasks t
      LEFT JOIN task_completions tc ON t.id = tc.task_id
      WHERE (t.due_date = ? AND t.frequency = 'daily')
         OR (t.week_start = ? AND t.frequency = 'weekly')
         OR (t.month_start = ? AND t.frequency = 'monthly')
      GROUP BY t.id
      ORDER BY t.frequency, t.id
    `, [date, weekStartStr, monthStartStr]);

    for (const task of tasks) {
      task.completions = await dbAll(`
        SELECT tc.*, u.name as user_name, u.username
        FROM task_completions tc
        JOIN users u ON tc.user_id = u.id
        WHERE tc.task_id = ? ORDER BY tc.completed_at DESC
      `, [task.id]);

      task.comments = await dbAll(`
        SELECT c.*, u.name as user_name, u.username
        FROM comments c
        JOIN users u ON c.user_id = u.id
        WHERE c.task_id = ? ORDER BY c.created_at DESC
      `, [task.id]);

      task.files = await dbAll(`
        SELECT f.*, u.name as user_name, u.username
        FROM file_uploads f
        JOIN users u ON f.user_id = u.id
        WHERE f.task_id = ? ORDER BY f.uploaded_at DESC
      `, [task.id]);
    }

    res.json({
      daily: tasks.filter(t => t.frequency === 'daily'),
      weekly: tasks.filter(t => t.frequency === 'weekly'),
      monthly: tasks.filter(t => t.frequency === 'monthly')
    });
  } catch (error) {
    console.error('Error fetching day details:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// === ADMIN-ONLY ROUTES BELOW ===

// Get all checklists
router.get('/checklists', isAdmin, async (req, res) => {
  try {
    const checklists = await dbAll('SELECT * FROM checklists ORDER BY frequency, name');
    res.json(checklists);
  } catch (error) {
    console.error('Error fetching checklists:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create checklist
router.post('/checklists', isAdmin, async (req, res) => {
  try {
    const { name, description, frequency } = req.body;
    const result = await dbRun(
      'INSERT INTO checklists (name, description, frequency, created_by) VALUES (?, ?, ?, ?)',
      [name, description, frequency, req.user.id]
    );
    const checklist = await dbGet('SELECT * FROM checklists WHERE id = ?', [result.id]);
    res.json(checklist);
  } catch (error) {
    console.error('Error creating checklist:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update checklist
router.put('/checklists/:id', isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, is_active } = req.body;
    await dbRun(
      'UPDATE checklists SET name = ?, description = ?, is_active = ? WHERE id = ?',
      [name, description, is_active, id]
    );
    const checklist = await dbGet('SELECT * FROM checklists WHERE id = ?', [id]);
    res.json(checklist);
  } catch (error) {
    console.error('Error updating checklist:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete checklist
router.delete('/checklists/:id', isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await dbRun('DELETE FROM task_templates WHERE checklist_id = ?', [id]);
    await dbRun('DELETE FROM tasks WHERE checklist_id = ?', [id]);
    await dbRun('DELETE FROM checklists WHERE id = ?', [id]);
    res.json({ message: 'Checklist deleted' });
  } catch (error) {
    console.error('Error deleting checklist:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all task templates
router.get('/templates', isAdmin, async (req, res) => {
  try {
    const templates = await dbAll('SELECT * FROM task_templates ORDER BY frequency, checklist_id, sort_order, id');
    res.json(templates);
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Reorder task templates — MUST come before /:id route
router.put('/templates/reorder', isAdmin, async (req, res) => {
  try {
    const { templates } = req.body;
    for (const template of templates) {
      await dbRun('UPDATE task_templates SET sort_order = ? WHERE id = ?', [template.sort_order, template.id]);
    }
    res.json({ message: 'Templates reordered' });
  } catch (error) {
    console.error('Error reordering templates:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create task template
router.post('/templates', isAdmin, async (req, res) => {
  try {
    const { title, description, frequency, checklist_id } = req.body;
    const maxSortOrder = await dbGet(
      `SELECT MAX(sort_order) as max_sort FROM task_templates 
       WHERE frequency = ? AND (checklist_id = ? OR (checklist_id IS NULL AND ? IS NULL))`,
      [frequency, checklist_id, checklist_id]
    );
    const nextSortOrder = (maxSortOrder.max_sort || 0) + 1;
    const result = await dbRun(
      'INSERT INTO task_templates (title, description, frequency, checklist_id, created_by, sort_order) VALUES (?, ?, ?, ?, ?, ?)',
      [title, description, frequency, checklist_id || null, req.user.id, nextSortOrder]
    );
    const template = await dbGet('SELECT * FROM task_templates WHERE id = ?', [result.id]);
    res.json(template);
  } catch (error) {
    console.error('Error creating template:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update task template
router.put('/templates/:id', isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, is_active, checklist_id } = req.body;
    await dbRun(
      'UPDATE task_templates SET title = ?, description = ?, is_active = ?, checklist_id = ? WHERE id = ?',
      [title, description, is_active, checklist_id || null, id]
    );
    const template = await dbGet('SELECT * FROM task_templates WHERE id = ?', [id]);
    res.json(template);
  } catch (error) {
    console.error('Error updating template:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete task template
router.delete('/templates/:id', isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await dbRun('DELETE FROM task_templates WHERE id = ?', [id]);
    await dbRun('DELETE FROM tasks WHERE template_id = ?', [id]);
    res.json({ message: 'Task template deleted' });
  } catch (error) {
    console.error('Error deleting template:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get subtasks for a template
router.get('/templates/:id/subtasks', isAdmin, async (req, res) => {
  try {
    const subtasks = await dbAll(
      'SELECT * FROM task_template_subtasks WHERE template_id = ? ORDER BY sort_order',
      [req.params.id]
    );
    res.json(subtasks);
  } catch (error) {
    console.error('Error fetching subtasks:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add subtask to template
router.post('/templates/:id/subtasks', isAdmin, async (req, res) => {
  try {
    const { name, sort_order } = req.body;
    const result = await dbRun(
      'INSERT INTO task_template_subtasks (template_id, name, sort_order) VALUES (?, ?, ?)',
      [req.params.id, name, sort_order || 0]
    );
    const subtask = await dbGet('SELECT * FROM task_template_subtasks WHERE id = ?', [result.id]);
    res.json(subtask);
  } catch (error) {
    console.error('Error adding subtask:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete subtask from template
router.delete('/templates/:templateId/subtasks/:subtaskId', isAdmin, async (req, res) => {
  try {
    await dbRun('DELETE FROM task_template_subtasks WHERE id = ?', [req.params.subtaskId]);
    res.json({ message: 'Subtask deleted' });
  } catch (error) {
    console.error('Error deleting subtask:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create one-off task for a specific date
router.post('/tasks/one-off', isAdmin, async (req, res) => {
  try {
    const { title, description, frequency, due_date, checklist_id } = req.body;
    const dueDate = new Date(due_date);

    let weekStart = null;
    let monthStart = null;

    if (frequency === 'weekly') weekStart = getWeekStart(due_date);
    else if (frequency === 'monthly') monthStart = getMonthStart(due_date);

    const result = await dbRun(
      'INSERT INTO tasks (title, description, frequency, due_date, week_start, month_start, checklist_id, is_one_off, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)',
      [title, description, frequency, due_date, weekStart, monthStart, checklist_id || null, req.user.id]
    );

    const task = await dbGet('SELECT * FROM tasks WHERE id = ?', [result.id]);
    res.json(task);
  } catch (error) {
    console.error('Error creating one-off task:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all employees
router.get('/employees', isAdmin, async (req, res) => {
  try {
    const employees = await dbAll('SELECT id, username, name, role FROM users ORDER BY name');
    res.json(employees);
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;