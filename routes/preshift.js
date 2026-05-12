const express = require('express');
const { dbAll, dbGet, dbRun } = require('../database');
const { authMiddleware } = require('../middleware/auth');
const router = express.Router();

router.use(authMiddleware);

// Helper: derive day-of-week string from a YYYY-MM-DD string without timezone issues
const getDayOfWeek = (dateStr) => {
  const [year, month, day] = dateStr.split('-');
  return new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
    .toLocaleDateString('en-US', { weekday: 'long' });
};

// Get pre-shift form for a specific date
router.get('/:date', async (req, res) => {
  try {
    const { date } = req.params;
    const form = await dbGet('SELECT * FROM preshift_forms WHERE form_date = ?', [date]);

    if (!form) {
      return res.json({
        form_date: date,
        day_of_week: getDayOfWeek(date),
        monthly_training: '', weekly_training: '', cbk_info: '',
        gss_itr_wtd: '', gss_itr_mtd: '', gss_itr_ytd: '',
        gss_elite_wtd: '', gss_elite_mtd: '', gss_elite_ytd: '',
        gss_staff_wtd: '', gss_staff_mtd: '', gss_staff_ytd: '',
        gxp_arrivals_am: '', gxp_arrivals_pm: '', gxp_arrivals_na: '',
        gxp_departures_am: '', gxp_departures_pm: '', gxp_departures_na: '',
        gxp_stayovers_am: '', gxp_stayovers_pm: '', gxp_stayovers_na: '',
        gxp_ooo_am: '', gxp_ooo_pm: '', gxp_ooo_na: '',
        gxp_vr_am: '', gxp_vr_pm: '', gxp_vr_na: '',
        group_arrivals: '', in_house_groups: '',
        vip_arrivals: '', ambassador_arrivals: ''
      });
    }

    res.json(form);
  } catch (error) {
    console.error('Error fetching pre-shift form:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Save pre-shift form for a specific date (insert or update)
router.post('/:date', async (req, res) => {
  try {
    const { date } = req.params;
    const f = req.body;

    const values = [
      date,
      f.dayOfWeek, f.monthlyTraining, f.weeklyTraining, f.cbkInfo,
      f.gss_itr_wtd, f.gss_itr_mtd, f.gss_itr_ytd,
      f.gss_elite_wtd, f.gss_elite_mtd, f.gss_elite_ytd,
      f.gss_staff_wtd, f.gss_staff_mtd, f.gss_staff_ytd,
      f.gxp_arrivals_am, f.gxp_arrivals_pm, f.gxp_arrivals_na,
      f.gxp_departures_am, f.gxp_departures_pm, f.gxp_departures_na,
      f.gxp_stayovers_am, f.gxp_stayovers_pm, f.gxp_stayovers_na,
      f.gxp_ooo_am, f.gxp_ooo_pm, f.gxp_ooo_na,
      f.gxp_vr_am, f.gxp_vr_pm, f.gxp_vr_na,
      JSON.stringify(f.groupArrivals), JSON.stringify(f.inHouseGroups),
      f.vipArrivals, f.ambassadorArrivals,
      req.user.id
    ];

    await dbRun(`
      INSERT INTO preshift_forms (
        form_date, day_of_week, monthly_training, weekly_training, cbk_info,
        gss_itr_wtd, gss_itr_mtd, gss_itr_ytd,
        gss_elite_wtd, gss_elite_mtd, gss_elite_ytd,
        gss_staff_wtd, gss_staff_mtd, gss_staff_ytd,
        gxp_arrivals_am, gxp_arrivals_pm, gxp_arrivals_na,
        gxp_departures_am, gxp_departures_pm, gxp_departures_na,
        gxp_stayovers_am, gxp_stayovers_pm, gxp_stayovers_na,
        gxp_ooo_am, gxp_ooo_pm, gxp_ooo_na,
        gxp_vr_am, gxp_vr_pm, gxp_vr_na,
        group_arrivals, in_house_groups, vip_arrivals, ambassador_arrivals,
        created_by
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
      ON CONFLICT(form_date) DO UPDATE SET
        day_of_week = excluded.day_of_week,
        monthly_training = excluded.monthly_training,
        weekly_training = excluded.weekly_training,
        cbk_info = excluded.cbk_info,
        gss_itr_wtd = excluded.gss_itr_wtd, gss_itr_mtd = excluded.gss_itr_mtd,
        gss_itr_ytd = excluded.gss_itr_ytd,
        gss_elite_wtd = excluded.gss_elite_wtd, gss_elite_mtd = excluded.gss_elite_mtd,
        gss_elite_ytd = excluded.gss_elite_ytd,
        gss_staff_wtd = excluded.gss_staff_wtd, gss_staff_mtd = excluded.gss_staff_mtd,
        gss_staff_ytd = excluded.gss_staff_ytd,
        gxp_arrivals_am = excluded.gxp_arrivals_am,
        gxp_arrivals_pm = excluded.gxp_arrivals_pm,
        gxp_arrivals_na = excluded.gxp_arrivals_na,
        gxp_departures_am = excluded.gxp_departures_am,
        gxp_departures_pm = excluded.gxp_departures_pm,
        gxp_departures_na = excluded.gxp_departures_na,
        gxp_stayovers_am = excluded.gxp_stayovers_am,
        gxp_stayovers_pm = excluded.gxp_stayovers_pm,
        gxp_stayovers_na = excluded.gxp_stayovers_na,
        gxp_ooo_am = excluded.gxp_ooo_am, gxp_ooo_pm = excluded.gxp_ooo_pm,
        gxp_ooo_na = excluded.gxp_ooo_na,
        gxp_vr_am = excluded.gxp_vr_am, gxp_vr_pm = excluded.gxp_vr_pm,
        gxp_vr_na = excluded.gxp_vr_na,
        group_arrivals = excluded.group_arrivals,
        in_house_groups = excluded.in_house_groups,
        vip_arrivals = excluded.vip_arrivals,
        ambassador_arrivals = excluded.ambassador_arrivals,
        updated_at = CURRENT_TIMESTAMP
    `, values);

    res.json({ message: 'Form saved successfully' });
  } catch (error) {
    console.error('Error saving pre-shift form:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all dates that have pre-shift forms for a month
router.get('/month/:year/:month', async (req, res) => {
  try {
    const { year, month } = req.params;
    const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0];
    const endDate = new Date(year, month, 0).toISOString().split('T')[0];
    const forms = await dbAll(
      'SELECT form_date FROM preshift_forms WHERE form_date >= ? AND form_date <= ?',
      [startDate, endDate]
    );
    res.json(forms.map(f => f.form_date));
  } catch (error) {
    console.error('Error fetching pre-shift form dates:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
