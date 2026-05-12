const express = require('express');
const { dbAll, dbGet, dbRun } = require('../database');
const { authMiddleware } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const { getWeekStart, getMonthStart, getToday } = require('../utils/dates');

router.use(authMiddleware);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Get tasks for a specific date
router.get('/:date', async (req, res) => {
  try {
    const { date } = req.params;
    const userId = req.user.id;

    const weekStartStr = getWeekStart(date);
    const monthStartStr = getMonthStart(date);

    // Only generate tasks for today and future dates — never backfill past dates
    const today = getToday();
    if (date >= today) {
      const templates = await dbAll('SELECT * FROM task_templates WHERE is_active = 1');

      for (const template of templates) {
        if (template.frequency === 'daily') {
          // Unique per template + due_date
          const existing = await dbGet(
            `SELECT id FROM tasks WHERE template_id = ? AND due_date = ? AND frequency = 'daily'`,
            [template.id, date]
          );
          if (!existing) {
            const result = await dbRun(
              `INSERT INTO tasks (template_id, title, description, frequency, due_date, checklist_id, created_by)
               VALUES (?, ?, ?, 'daily', ?, ?, ?)`,
              [template.id, template.title, template.description, date, template.checklist_id, userId]
            );
            await generateSubtasks(result.id, template.id);
          }

        } else if (template.frequency === 'weekly') {
          // Unique per template + week_start — only generate once per week, not once per day
          const existing = await dbGet(
            `SELECT id FROM tasks WHERE template_id = ? AND week_start = ? AND frequency = 'weekly'`,
            [template.id, weekStartStr]
          );
          if (!existing) {
            const result = await dbRun(
              `INSERT INTO tasks (template_id, title, description, frequency, due_date, week_start, checklist_id, created_by)
               VALUES (?, ?, ?, 'weekly', ?, ?, ?, ?)`,
              [template.id, template.title, template.description, weekStartStr, weekStartStr, template.checklist_id, userId]
            );
            await generateSubtasks(result.id, template.id);
          }

        } else if (template.frequency === 'monthly') {
          // Unique per template + month_start — only generate once per month
          const existing = await dbGet(
            `SELECT id FROM tasks WHERE template_id = ? AND month_start = ? AND frequency = 'monthly'`,
            [template.id, monthStartStr]
          );
          if (!existing) {
            const result = await dbRun(
              `INSERT INTO tasks (template_id, title, description, frequency, due_date, month_start, checklist_id, created_by)
               VALUES (?, ?, ?, 'monthly', ?, ?, ?, ?)`,
              [template.id, template.title, template.description, monthStartStr, monthStartStr, template.checklist_id, userId]
            );
            await generateSubtasks(result.id, template.id);
          }
        }
      }
    }

    // Get all tasks for this date
    const dailyTasks = await dbAll(`
      SELECT DISTINCT
        t.*,
        CASE WHEN EXISTS (SELECT 1 FROM task_completions WHERE task_id = t.id) THEN 1 ELSE 0 END as completion_id
      FROM tasks t
      WHERE t.due_date = ? AND t.frequency = 'daily'
      ORDER BY t.id
    `, [date]);

    const weeklyTasks = await dbAll(`
      SELECT DISTINCT
        t.*,
        CASE WHEN EXISTS (SELECT 1 FROM task_completions WHERE task_id = t.id) THEN 1 ELSE 0 END as completion_id
      FROM tasks t
      WHERE t.week_start = ? AND t.frequency = 'weekly'
      ORDER BY t.id
    `, [weekStartStr]);

    const monthlyTasks = await dbAll(`
      SELECT DISTINCT
        t.*,
        CASE WHEN EXISTS (SELECT 1 FROM task_completions WHERE task_id = t.id) THEN 1 ELSE 0 END as completion_id
      FROM tasks t
      WHERE t.month_start = ? AND t.frequency = 'monthly'
      ORDER BY t.id
    `, [monthStartStr]);

    // Get subtasks, comments, files, and completions for each task
    const allTasks = [...dailyTasks, ...weeklyTasks, ...monthlyTasks];

    for (const task of allTasks) {
      task.subtasks = await dbAll(
        'SELECT * FROM task_subtasks WHERE task_id = ? ORDER BY sort_order',
        [task.id]
      );

      task.completions = await dbAll(`
        SELECT tc.*, u.name as user_name, u.username
        FROM task_completions tc
        JOIN users u ON tc.user_id = u.id
        WHERE tc.task_id = ?
        ORDER BY tc.completed_at DESC
      `, [task.id]);

      task.comments = await dbAll(`
        SELECT c.*, u.name as user_name, u.username
        FROM comments c
        JOIN users u ON c.user_id = u.id
        WHERE c.task_id = ?
        ORDER BY c.created_at DESC
      `, [task.id]);

      task.files = await dbAll(`
        SELECT f.*, u.name as user_name, u.username
        FROM file_uploads f
        JOIN users u ON f.user_id = u.id
        WHERE f.task_id = ?
        ORDER BY f.uploaded_at DESC
      `, [task.id]);
    }

    // Group tasks by checklist or standalone
    const groupByChecklist = (tasks) => {
      const checklists = {};
      const standaloneTasks = [];

      for (const task of tasks) {
        if (task.checklist_id) {
          if (!checklists[task.checklist_id]) {
            checklists[task.checklist_id] = {
              id: task.checklist_id,
              tasks: []
            };
          }
          checklists[task.checklist_id].tasks.push(task);
        } else {
          standaloneTasks.push(task);
        }
      }

      return { checklists: Object.values(checklists), standaloneTasks };
    };

    const daily = groupByChecklist(dailyTasks);
    const weekly = groupByChecklist(weeklyTasks);
    const monthly = groupByChecklist(monthlyTasks);

    // Get checklist details
    for (const checklist of [...daily.checklists, ...weekly.checklists, ...monthly.checklists]) {
      const checklistInfo = await dbGet('SELECT * FROM checklists WHERE id = ?', [checklist.id]);
      if (checklistInfo) {
        checklist.name = checklistInfo.name;
        checklist.description = checklistInfo.description;
      }
    }

    res.json({ daily, weekly, monthly });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Helper: copy subtasks from template to a task instance
async function generateSubtasks(taskId, templateId) {
  const templateSubtasks = await dbAll(
    'SELECT * FROM task_template_subtasks WHERE template_id = ? ORDER BY sort_order',
    [templateId]
  );
  for (const subtask of templateSubtasks) {
    await dbRun(
      'INSERT INTO task_subtasks (task_id, name, sort_order) VALUES (?, ?, ?)',
      [taskId, subtask.name, subtask.sort_order]
    );
  }
}

// Complete a task (shared across all users)
router.post('/:id/complete', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const existing = await dbGet(
      'SELECT id FROM task_completions WHERE task_id = ?',
      [id]
    );

    if (!existing) {
      await dbRun(
        'INSERT INTO task_completions (task_id, user_id) VALUES (?, ?)',
        [id, userId]
      );
    }

    res.json({ message: 'Task completed' });
  } catch (error) {
    console.error('Error completing task:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Uncomplete a task (shared across all users)
router.delete('/:id/complete', async (req, res) => {
  try {
    const { id } = req.params;
    await dbRun('DELETE FROM task_completions WHERE task_id = ?', [id]);
    res.json({ message: 'Task uncompleted' });
  } catch (error) {
    console.error('Error uncompleting task:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Complete a subtask (shared across all users)
router.post('/:taskId/subtask/:subtaskId/complete', async (req, res) => {
  try {
    const { subtaskId } = req.params;
    const userId = req.user.id;

    await dbRun(
      'UPDATE task_subtasks SET is_completed = 1, completed_by = ?, completed_at = CURRENT_TIMESTAMP WHERE id = ?',
      [userId, subtaskId]
    );

    res.json({ message: 'Subtask completed' });
  } catch (error) {
    console.error('Error completing subtask:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Uncomplete a subtask (shared across all users)
router.delete('/:taskId/subtask/:subtaskId/complete', async (req, res) => {
  try {
    const { subtaskId } = req.params;

    await dbRun(
      'UPDATE task_subtasks SET is_completed = 0, completed_by = NULL, completed_at = NULL WHERE id = ?',
      [subtaskId]
    );

    res.json({ message: 'Subtask uncompleted' });
  } catch (error) {
    console.error('Error uncompleting subtask:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add comment
router.post('/:id/comment', async (req, res) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;
    const userId = req.user.id;

    await dbRun(
      'INSERT INTO comments (task_id, user_id, comment) VALUES (?, ?, ?)',
      [id, userId, comment]
    );

    res.json({ message: 'Comment added' });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Upload file
router.post('/:id/upload', upload.single('file'), async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    await dbRun(
      'INSERT INTO file_uploads (task_id, user_id, filename, original_name, file_path) VALUES (?, ?, ?, ?, ?)',
      [id, userId, file.filename, file.originalname, file.path]
    );

    res.json({ message: 'File uploaded' });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete file
router.delete('/:taskId/file/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;

    const file = await dbGet('SELECT * FROM file_uploads WHERE id = ?', [fileId]);

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    const filePath = path.join(__dirname, '..', 'uploads', file.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await dbRun('DELETE FROM file_uploads WHERE id = ?', [fileId]);

    res.json({ message: 'File deleted' });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
