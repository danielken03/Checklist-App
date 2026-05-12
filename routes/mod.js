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

// Get MOD report for a specific date
router.get('/:date', async (req, res) => {
  try {
    const { date } = req.params;
    const report = await dbGet('SELECT * FROM mod_reports WHERE report_date = ?', [date]);

    if (!report) {
      return res.json({
        report_date: date,
        day_of_week: getDayOfWeek(date),
        am_mod: '', pm_mod: '',
        front_desk_am: '', front_desk_mid: '', front_desk_pm: '',
        arrivals: '', departures: '', stay_overs: '', rooms_to_sell: '',
        expected_occupancy: '', current_occupancy: '',
        tomorrow_departures: '', tomorrow_arrivals: '',
        maintenance_associate: '', maintenance_manager: '',
        housekeeping_associate: '', housekeeping_manager: '',
        guest_concerns: '[]',
        entrance_lobby: '', mclub: '', market: '', fitness_center: '',
        business_center: '', meeting_space: '', associate_restrooms: '',
        public_restrooms: '', breakroom: '', guest_corridors: '',
        gss_itr_mtd: '', gss_itr_ytd: '', gss_fb_mtd: '', gss_fb_ytd: '',
        gss_staff_service_mtd: '', gss_staff_service_ytd: '',
        gss_maintenance_mtd: '', gss_maintenance_ytd: '',
        gss_elite_mtd: '', gss_elite_ytd: '',
        gss_cleanliness_mtd: '', gss_cleanliness_ytd: '',
        walked_guests: '[]',
        housekeeping_gra: '', housekeeping_hm: '', housekeeping_inspector: '',
        housekeeping_laundry: '', housekeeping_dnd: '', housekeeping_lbs: '',
        housekeeping_vm_rooms: '', housekeeping_carry_rooms: '',
        maintenance_report: ''
      });
    }

    res.json(report);
  } catch (error) {
    console.error('Error fetching MOD report:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Save MOD report for a specific date (insert or update)
router.post('/:date', async (req, res) => {
  try {
    const { date } = req.params;
    const f = req.body;

    const values = [
      date,
      f.dayOfWeek, f.amMod, f.pmMod,
      f.frontDeskAM, f.frontDeskMid, f.frontDeskPM,
      f.arrivals, f.departures, f.stayOvers, f.roomsToSell,
      f.expectedOccupancy, f.currentOccupancy,
      f.tomorrowDepartures, f.tomorrowArrivals,
      f.maintenanceAssociate, f.maintenanceManager,
      f.housekeepingAssociate, f.housekeepingManager,
      JSON.stringify(f.guestConcerns),
      f.entranceLobby, f.mclub, f.market, f.fitnessCenter,
      f.businessCenter, f.meetingSpace, f.associateRestrooms,
      f.publicRestrooms, f.breakroom, f.guestCorridors,
      f.gssItrMtd, f.gssItrYtd, f.gssFbMtd, f.gssFbYtd,
      f.gssStaffServiceMtd, f.gssStaffServiceYtd,
      f.gssMaintenanceMtd, f.gssMaintenanceYtd,
      f.gssEliteMtd, f.gssEliteYtd,
      f.gssCleanlineMtd, f.gssCleanlineYtd,
      JSON.stringify(f.walkedGuests),
      f.housekeepingGra, f.housekeepingHm, f.housekeepingInspector,
      f.housekeepingLaundry, f.housekeepingDnd, f.housekeepingLbs,
      f.housekeepingVmRooms, f.housekeepingCarryRooms,
      f.maintenanceReport,
      req.user.id
    ];

    await dbRun(`
      INSERT INTO mod_reports (
        report_date, day_of_week, am_mod, pm_mod,
        front_desk_am, front_desk_mid, front_desk_pm,
        arrivals, departures, stay_overs, rooms_to_sell,
        expected_occupancy, current_occupancy,
        tomorrow_departures, tomorrow_arrivals,
        maintenance_associate, maintenance_manager,
        housekeeping_associate, housekeeping_manager,
        guest_concerns,
        entrance_lobby, mclub, market, fitness_center,
        business_center, meeting_space, associate_restrooms,
        public_restrooms, breakroom, guest_corridors,
        gss_itr_mtd, gss_itr_ytd, gss_fb_mtd, gss_fb_ytd,
        gss_staff_service_mtd, gss_staff_service_ytd,
        gss_maintenance_mtd, gss_maintenance_ytd,
        gss_elite_mtd, gss_elite_ytd,
        gss_cleanliness_mtd, gss_cleanliness_ytd,
        walked_guests,
        housekeeping_gra, housekeeping_hm, housekeeping_inspector,
        housekeeping_laundry, housekeeping_dnd, housekeeping_lbs,
        housekeeping_vm_rooms, housekeeping_carry_rooms,
        maintenance_report, created_by
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
      ON CONFLICT(report_date) DO UPDATE SET
        day_of_week = excluded.day_of_week,
        am_mod = excluded.am_mod, pm_mod = excluded.pm_mod,
        front_desk_am = excluded.front_desk_am,
        front_desk_mid = excluded.front_desk_mid,
        front_desk_pm = excluded.front_desk_pm,
        arrivals = excluded.arrivals, departures = excluded.departures,
        stay_overs = excluded.stay_overs, rooms_to_sell = excluded.rooms_to_sell,
        expected_occupancy = excluded.expected_occupancy,
        current_occupancy = excluded.current_occupancy,
        tomorrow_departures = excluded.tomorrow_departures,
        tomorrow_arrivals = excluded.tomorrow_arrivals,
        maintenance_associate = excluded.maintenance_associate,
        maintenance_manager = excluded.maintenance_manager,
        housekeeping_associate = excluded.housekeeping_associate,
        housekeeping_manager = excluded.housekeeping_manager,
        guest_concerns = excluded.guest_concerns,
        entrance_lobby = excluded.entrance_lobby, mclub = excluded.mclub,
        market = excluded.market, fitness_center = excluded.fitness_center,
        business_center = excluded.business_center,
        meeting_space = excluded.meeting_space,
        associate_restrooms = excluded.associate_restrooms,
        public_restrooms = excluded.public_restrooms,
        breakroom = excluded.breakroom, guest_corridors = excluded.guest_corridors,
        gss_itr_mtd = excluded.gss_itr_mtd, gss_itr_ytd = excluded.gss_itr_ytd,
        gss_fb_mtd = excluded.gss_fb_mtd, gss_fb_ytd = excluded.gss_fb_ytd,
        gss_staff_service_mtd = excluded.gss_staff_service_mtd,
        gss_staff_service_ytd = excluded.gss_staff_service_ytd,
        gss_maintenance_mtd = excluded.gss_maintenance_mtd,
        gss_maintenance_ytd = excluded.gss_maintenance_ytd,
        gss_elite_mtd = excluded.gss_elite_mtd,
        gss_elite_ytd = excluded.gss_elite_ytd,
        gss_cleanliness_mtd = excluded.gss_cleanliness_mtd,
        gss_cleanliness_ytd = excluded.gss_cleanliness_ytd,
        walked_guests = excluded.walked_guests,
        housekeeping_gra = excluded.housekeeping_gra,
        housekeeping_hm = excluded.housekeeping_hm,
        housekeeping_inspector = excluded.housekeeping_inspector,
        housekeeping_laundry = excluded.housekeeping_laundry,
        housekeeping_dnd = excluded.housekeeping_dnd,
        housekeeping_lbs = excluded.housekeeping_lbs,
        housekeeping_vm_rooms = excluded.housekeeping_vm_rooms,
        housekeeping_carry_rooms = excluded.housekeeping_carry_rooms,
        maintenance_report = excluded.maintenance_report,
        updated_at = CURRENT_TIMESTAMP
    `, values);

    res.json({ message: 'MOD report saved successfully' });
  } catch (error) {
    console.error('Error saving MOD report:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all dates that have MOD reports for a month
router.get('/month/:year/:month', async (req, res) => {
  try {
    const { year, month } = req.params;
    const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0];
    const endDate = new Date(year, month, 0).toISOString().split('T')[0];
    const reports = await dbAll(
      'SELECT report_date FROM mod_reports WHERE report_date >= ? AND report_date <= ?',
      [startDate, endDate]
    );
    res.json(reports.map(r => r.report_date));
  } catch (error) {
    console.error('Error fetching MOD report dates:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
