const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { dbAll, dbGet, dbRun } = require('../database');
const { authMiddleware } = require('../middleware/auth');
const router = express.Router();

router.use(authMiddleware);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '..', 'uploads', 'group-logos');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'logo-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    if (allowedTypes.test(path.extname(file.originalname).toLowerCase()) && allowedTypes.test(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed (jpg, jpeg, png, gif)'));
    }
  }
});

const canEditGroupResumes = (req, res, next) => {
  const allowedRoles = ['grand_admin', 'sales_admin', 'sales_employee'];
  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Only Sales team and Grand Admin can create/edit group resumes' });
  }
  next();
};

router.get('/date/:date', async (req, res) => {
  try {
    const resumes = await dbAll('SELECT * FROM group_resumes WHERE resume_date = ? ORDER BY created_at DESC', [req.params.date]);
    res.json(resumes);
  } catch (error) {
    console.error('Error fetching group resumes:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const resume = await dbGet('SELECT * FROM group_resumes WHERE id = ?', [req.params.id]);
    if (!resume) return res.status(404).json({ error: 'Group resume not found' });
    res.json(resume);
  } catch (error) {
    console.error('Error fetching group resume:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', canEditGroupResumes, upload.single('logo'), async (req, res) => {
  try {
    const formData = JSON.parse(req.body.formData);
    const logoFilename = req.file ? req.file.filename : null;

    const result = await dbRun(`
      INSERT INTO group_resumes (
        resume_date, logo_filename, is_popup,
        organization, post_as, quote_number, arrival_date, departure_date,
        master_account, market_code, group_contact, telephone, in_house_contact,
        email, sales_manager, event_manager, reservation_coordinator,
        general_accountant, gold_keys, peak_attendees, group_profile,
        room_block_rows, reservation_method_rows, rates_rows, vip_rows,
        payment_method, direct_bill_approved, master_account_billing,
        authorized_signers, billing_address, commission, intermediary_account,
        intermediary_id, frontdesk, bellstand, concierge, garage_valet,
        outlet_information, housekeeping, catering_banquets, audio_visual,
        shipping_receiving, accounting, guest_list, created_by
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    `, [
      formData.resumeDate, logoFilename, formData.isPopup ? 1 : 0,
      formData.organization, formData.postAs, formData.quoteNumber,
      formData.arrivalDate, formData.departureDate, formData.masterAccount,
      formData.marketCode, formData.groupContact, formData.telephone,
      formData.inHouseContact, formData.email, formData.salesManager,
      formData.eventManager, formData.reservationCoordinator,
      formData.generalAccountant, formData.goldKeys, formData.peakAttendees,
      formData.groupProfile, JSON.stringify(formData.roomBlockRows),
      JSON.stringify(formData.reservationMethodRows), JSON.stringify(formData.ratesRows),
      JSON.stringify(formData.vipRows || []),
      formData.paymentMethod, formData.directBillApproved, formData.masterAccountBilling,
      formData.authorizedSigners, formData.billingAddress, formData.commission,
      formData.intermediaryAccount, formData.intermediaryId, formData.frontdesk,
      formData.bellstand, formData.concierge, formData.garageValet,
      formData.outletInformation, formData.housekeeping, formData.cateringBanquets,
      formData.audioVisual, formData.shippingReceiving, formData.accounting,
      JSON.stringify(formData.guestList), req.user.id
    ]);

    const newResume = await dbGet('SELECT * FROM group_resumes WHERE id = ?', [result.id]);
    res.json(newResume);
  } catch (error) {
    console.error('Error creating group resume:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:id', canEditGroupResumes, upload.single('logo'), async (req, res) => {
  try {
    const { id } = req.params;
    const formData = JSON.parse(req.body.formData);

    const existing = await dbGet('SELECT logo_filename FROM group_resumes WHERE id = ?', [id]);
    let logoFilename = existing.logo_filename;

    if (req.file) {
      if (existing.logo_filename) {
        const oldLogoPath = path.join(__dirname, '..', 'uploads', 'group-logos', existing.logo_filename);
        if (fs.existsSync(oldLogoPath)) fs.unlinkSync(oldLogoPath);
      }
      logoFilename = req.file.filename;
    }

    await dbRun(`
      UPDATE group_resumes SET
        logo_filename = ?, is_popup = ?, organization = ?, post_as = ?, quote_number = ?,
        arrival_date = ?, departure_date = ?, master_account = ?, market_code = ?,
        group_contact = ?, telephone = ?, in_house_contact = ?, email = ?,
        sales_manager = ?, event_manager = ?, reservation_coordinator = ?,
        general_accountant = ?, gold_keys = ?, peak_attendees = ?, group_profile = ?,
        room_block_rows = ?, reservation_method_rows = ?, rates_rows = ?, vip_rows = ?,
        payment_method = ?, direct_bill_approved = ?, master_account_billing = ?,
        authorized_signers = ?, billing_address = ?, commission = ?,
        intermediary_account = ?, intermediary_id = ?, frontdesk = ?, bellstand = ?,
        concierge = ?, garage_valet = ?, outlet_information = ?, housekeeping = ?,
        catering_banquets = ?, audio_visual = ?, shipping_receiving = ?, accounting = ?,
        guest_list = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [
      logoFilename, formData.isPopup ? 1 : 0, formData.organization, formData.postAs, formData.quoteNumber,
      formData.arrivalDate, formData.departureDate, formData.masterAccount,
      formData.marketCode, formData.groupContact, formData.telephone,
      formData.inHouseContact, formData.email, formData.salesManager,
      formData.eventManager, formData.reservationCoordinator,
      formData.generalAccountant, formData.goldKeys, formData.peakAttendees,
      formData.groupProfile, JSON.stringify(formData.roomBlockRows),
      JSON.stringify(formData.reservationMethodRows), JSON.stringify(formData.ratesRows),
      JSON.stringify(formData.vipRows || []),
      formData.paymentMethod, formData.directBillApproved, formData.masterAccountBilling,
      formData.authorizedSigners, formData.billingAddress, formData.commission,
      formData.intermediaryAccount, formData.intermediaryId, formData.frontdesk,
      formData.bellstand, formData.concierge, formData.garageValet,
      formData.outletInformation, formData.housekeeping, formData.cateringBanquets,
      formData.audioVisual, formData.shippingReceiving, formData.accounting,
      JSON.stringify(formData.guestList), id
    ]);

    const updatedResume = await dbGet('SELECT * FROM group_resumes WHERE id = ?', [id]);
    res.json(updatedResume);
  } catch (error) {
    console.error('Error updating group resume:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', canEditGroupResumes, async (req, res) => {
  try {
    const resume = await dbGet('SELECT logo_filename FROM group_resumes WHERE id = ?', [req.params.id]);
    if (resume && resume.logo_filename) {
      const logoPath = path.join(__dirname, '..', 'uploads', 'group-logos', resume.logo_filename);
      if (fs.existsSync(logoPath)) fs.unlinkSync(logoPath);
    }
    await dbRun('DELETE FROM group_resumes WHERE id = ?', [req.params.id]);
    res.json({ message: 'Group resume deleted successfully' });
  } catch (error) {
    console.error('Error deleting group resume:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/month/:year/:month', async (req, res) => {
  try {
    const { year, month } = req.params;
    const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0];
    const endDate = new Date(year, month, 0).toISOString().split('T')[0];
    const resumes = await dbAll(
      'SELECT resume_date, COUNT(*) as count FROM group_resumes WHERE resume_date >= ? AND resume_date <= ? GROUP BY resume_date',
      [startDate, endDate]
    );
    const dateMap = {};
    resumes.forEach(r => { dateMap[r.resume_date] = r.count; });
    res.json(dateMap);
  } catch (error) {
    console.error('Error fetching group resume dates:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/packet', async (req, res) => {
  try {
    const { dates } = req.body;
    if (!Array.isArray(dates) || dates.length === 0) {
      return res.status(400).json({ error: 'Dates array is required' });
    }
    const placeholders = dates.map(() => '?').join(',');
    const resumes = await dbAll(
      `SELECT * FROM group_resumes WHERE resume_date IN (${placeholders}) ORDER BY resume_date ASC, created_at ASC`,
      dates
    );
    res.json(resumes);
  } catch (error) {
    console.error('Error fetching resumes for packet:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
