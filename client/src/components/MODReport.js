import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import api from '../api';

function MODReport({ selectedDate, onClose }) {
  const [formData, setFormData] = useState({
    dayOfWeek: '',
    date: '',
    amMod: '',
    pmMod: '',
    frontDeskAM: '',
    frontDeskMid: '',
    frontDeskPM: '',
    arrivals: '',
    departures: '',
    stayOvers: '',
    roomsToSell: '',
    expectedOccupancy: '',
    currentOccupancy: '',
    tomorrowDepartures: '',
    tomorrowArrivals: '',
    maintenanceAssociate: '',
    maintenanceManager: '',
    housekeepingAssociate: '',
    housekeepingManager: '',
    guestConcerns: [{ roomNumber: '', guestName: '', problem: '', agent: '', departments: '', contact: '', ampm: 'AM' }],
    entranceLobby: '',
    mclub: '',
    market: '',
    fitnessCenter: '',
    businessCenter: '',
    meetingSpace: '',
    associateRestrooms: '',
    publicRestrooms: '',
    breakroom: '',
    guestCorridors: '',
    gssItrMtd: '',
    gssItrYtd: '',
    gssFbMtd: '',
    gssFbYtd: '',
    gssStaffServiceMtd: '',
    gssStaffServiceYtd: '',
    gssMaintenanceMtd: '',
    gssMaintenanceYtd: '',
    gssEliteMtd: '',
    gssEliteYtd: '',
    gssCleanlineMtd: '',
    gssCleanlineYtd: '',
    walkedGuests: [{ name: '', rateCode: '', location: '', walkedTo: '', willReturn: '', reaction: '' }],
    housekeepingGra: '',
    housekeepingHm: '',
    housekeepingInspector: '',
    housekeepingLaundry: '',
    housekeepingDnd: '',
    housekeepingLbs: '',
    housekeepingVmRooms: '',
    housekeepingCarryRooms: '',
    maintenanceReport: ''
  });

  useEffect(() => {
    loadFormData();
  }, [selectedDate]);

  const loadFormData = async () => {
    try {
      const data = await api.getMODReport(selectedDate);
      
      const [year, month, day] = selectedDate.split('-');
      const dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      const displayDate = dateObj.toLocaleDateString('en-US');
      const dayOfWeek = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
      
      setFormData({
        dayOfWeek: data.day_of_week || dayOfWeek,
        date: displayDate,
        amMod: data.am_mod || '',
        pmMod: data.pm_mod || '',
        frontDeskAM: data.front_desk_am || '',
        frontDeskMid: data.front_desk_mid || '',
        frontDeskPM: data.front_desk_pm || '',
        arrivals: data.arrivals || '',
        departures: data.departures || '',
        stayOvers: data.stay_overs || '',
        roomsToSell: data.rooms_to_sell || '',
        expectedOccupancy: data.expected_occupancy || '',
        currentOccupancy: data.current_occupancy || '',
        tomorrowDepartures: data.tomorrow_departures || '',
        tomorrowArrivals: data.tomorrow_arrivals || '',
        maintenanceAssociate: data.maintenance_associate || '',
        maintenanceManager: data.maintenance_manager || '',
        housekeepingAssociate: data.housekeeping_associate || '',
        housekeepingManager: data.housekeeping_manager || '',
        guestConcerns: data.guest_concerns ? JSON.parse(data.guest_concerns) : [{ roomNumber: '', guestName: '', problem: '', agent: '', departments: '', contact: '', ampm: 'AM' }],
        entranceLobby: data.entrance_lobby || '',
        mclub: data.mclub || '',
        market: data.market || '',
        fitnessCenter: data.fitness_center || '',
        businessCenter: data.business_center || '',
        meetingSpace: data.meeting_space || '',
        associateRestrooms: data.associate_restrooms || '',
        publicRestrooms: data.public_restrooms || '',
        breakroom: data.breakroom || '',
        guestCorridors: data.guest_corridors || '',
        gssItrMtd: data.gss_itr_mtd || '',
        gssItrYtd: data.gss_itr_ytd || '',
        gssFbMtd: data.gss_fb_mtd || '',
        gssFbYtd: data.gss_fb_ytd || '',
        gssStaffServiceMtd: data.gss_staff_service_mtd || '',
        gssStaffServiceYtd: data.gss_staff_service_ytd || '',
        gssMaintenanceMtd: data.gss_maintenance_mtd || '',
        gssMaintenanceYtd: data.gss_maintenance_ytd || '',
        gssEliteMtd: data.gss_elite_mtd || '',
        gssEliteYtd: data.gss_elite_ytd || '',
        gssCleanlineMtd: data.gss_cleanliness_mtd || '',
        gssCleanlineYtd: data.gss_cleanliness_ytd || '',
        walkedGuests: data.walked_guests ? JSON.parse(data.walked_guests) : [{ name: '', rateCode: '', location: '', walkedTo: '', willReturn: '', reaction: '' }],
        housekeepingGra: data.housekeeping_gra || '',
        housekeepingHm: data.housekeeping_hm || '',
        housekeepingInspector: data.housekeeping_inspector || '',
        housekeepingLaundry: data.housekeeping_laundry || '',
        housekeepingDnd: data.housekeeping_dnd || '',
        housekeepingLbs: data.housekeeping_lbs || '',
        housekeepingVmRooms: data.housekeeping_vm_rooms || '',
        housekeepingCarryRooms: data.housekeeping_carry_rooms || '',
        maintenanceReport: data.maintenance_report || ''
      });
    } catch (error) {
      console.error('Error loading form data:', error);
    }
  };

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleArrayChange = (arrayName, index, field, value) => {
    const newArray = [...formData[arrayName]];
    newArray[index][field] = value;
    setFormData({ ...formData, [arrayName]: newArray });
  };

  const addGuestConcern = () => {
    setFormData({
      ...formData,
      guestConcerns: [...formData.guestConcerns, { roomNumber: '', guestName: '', problem: '', agent: '', departments: '', contact: '', ampm: 'AM' }]
    });
  };

  const removeGuestConcern = (index) => {
    if (formData.guestConcerns.length > 1) {
      setFormData({
        ...formData,
        guestConcerns: formData.guestConcerns.filter((_, i) => i !== index)
      });
    }
  };

  const addWalkedGuest = () => {
    setFormData({
      ...formData,
      walkedGuests: [...formData.walkedGuests, { name: '', rateCode: '', location: '', walkedTo: '', willReturn: '', reaction: '' }]
    });
  };

  const removeWalkedGuest = (index) => {
    if (formData.walkedGuests.length > 1) {
      setFormData({
        ...formData,
        walkedGuests: formData.walkedGuests.filter((_, i) => i !== index)
      });
    }
  };

  const handleSave = async () => {
    try {
      await api.saveMODReport(selectedDate, formData);
      alert('MOD report saved successfully!');
    } catch (error) {
      console.error('Error saving form:', error);
      alert('Error saving form. Please try again.');
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF('landscape');
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPos = 15;
    
    // Title
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('MOD Report', pageWidth / 2, yPos, { align: 'center' });
    yPos += 10;
    
    // Date and Day
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Date: ${formData.date}`, 14, yPos);
    doc.text(`Day: ${formData.dayOfWeek}`, pageWidth - 14, yPos, { align: 'right' });
    yPos += 8;
    
    // Table 1: MODs and Front Desk
    autoTable(doc, {
      startY: yPos,
      head: [['AM MOD', 'PM MOD', 'Front Desk AM', 'Front Desk Mid', 'Front Desk PM']],
      body: [[
        formData.amMod,
        formData.pmMod,
        formData.frontDeskAM,
        formData.frontDeskMid,
        formData.frontDeskPM
      ]],
      styles: { fontSize: 8, cellPadding: 3, lineColor: [0, 0, 0], lineWidth: 0.1 },
      headStyles: { fillColor: [52, 73, 94], halign: 'center', lineColor: [0, 0, 0], lineWidth: 0.1 },
      theme: 'grid'
    });
    yPos = doc.lastAutoTable.finalY + 5;
    
    // Table 2: Occupancy Information
    autoTable(doc, {
      startY: yPos,
      head: [['Arrivals', 'Departures', 'Stay Overs', 'Expected Occ %', 'Current Occ %', 'Rooms to Sell', 'Tomorrow Arr', 'Tomorrow Dep']],
      body: [[
        formData.arrivals,
        formData.departures,
        formData.stayOvers,
        formData.expectedOccupancy,
        formData.currentOccupancy,
        formData.roomsToSell,
        formData.tomorrowArrivals,
        formData.tomorrowDepartures
      ]],
      styles: { fontSize: 8, cellPadding: 3, lineColor: [0, 0, 0], lineWidth: 0.1 },
      headStyles: { fillColor: [52, 73, 94], halign: 'center', lineColor: [0, 0, 0], lineWidth: 0.1 },
      theme: 'grid'
    });
    yPos = doc.lastAutoTable.finalY + 5;
    
    // Table 3: Department Staff
    autoTable(doc, {
      startY: yPos,
      head: [['Department', 'Associate on Duty', 'Department Manager']],
      body: [
        ['Maintenance', formData.maintenanceAssociate, formData.maintenanceManager],
        ['Housekeeping', formData.housekeepingAssociate, formData.housekeepingManager]
      ],
      styles: { fontSize: 8, cellPadding: 3, lineColor: [0, 0, 0], lineWidth: 0.1 },
      headStyles: { fillColor: [52, 73, 94], halign: 'center', lineColor: [0, 0, 0], lineWidth: 0.1 },
      columnStyles: { 0: { fontStyle: 'bold' } },
      theme: 'grid'
    });
    yPos = doc.lastAutoTable.finalY + 5;
    
    // Table 4: Housekeeping Report
    autoTable(doc, {
      startY: yPos,
      head: [['GRA', 'HM', 'Inspector', 'Laundry', 'DND', 'Lbs', 'VM Rooms', 'Carry Rooms']],
      body: [[
        formData.housekeepingGra,
        formData.housekeepingHm,
        formData.housekeepingInspector,
        formData.housekeepingLaundry,
        formData.housekeepingDnd,
        formData.housekeepingLbs,
        formData.housekeepingVmRooms,
        formData.housekeepingCarryRooms
      ]],
      styles: { fontSize: 8, cellPadding: 3, lineColor: [0, 0, 0], lineWidth: 0.1 },
      headStyles: { fillColor: [52, 73, 94], halign: 'center', lineColor: [0, 0, 0], lineWidth: 0.1 },
      theme: 'grid'
    });
    yPos = doc.lastAutoTable.finalY + 5;
    
    // Table 5: Maintenance Report
    autoTable(doc, {
      startY: yPos,
      head: [['Maintenance Report']],
      body: [[formData.maintenanceReport]],
      styles: { fontSize: 8, cellPadding: 3, lineColor: [0, 0, 0], lineWidth: 0.1 },
      headStyles: { fillColor: [52, 73, 94], halign: 'center', lineColor: [0, 0, 0], lineWidth: 0.1 },
      theme: 'grid'
    });
    yPos = doc.lastAutoTable.finalY + 8;
    
    // Guest Concerns Table
    if (formData.guestConcerns.length > 0 && formData.guestConcerns.some(gc => gc.roomNumber || gc.guestName || gc.problem)) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Guest Concerns', 14, yPos);
      yPos += 5;
      
      autoTable(doc, {
        startY: yPos,
        head: [['Room #', 'Guest Name', 'Problem & Time', 'Agent', 'Departments', 'Contact Info', 'AM/PM']],
        body: formData.guestConcerns.map(gc => [
          gc.roomNumber, gc.guestName, gc.problem, gc.agent, gc.departments, gc.contact, gc.ampm
        ]),
        styles: { fontSize: 7, cellPadding: 2, lineColor: [0, 0, 0], lineWidth: 0.1 },
        headStyles: { fillColor: [52, 73, 94], halign: 'center', lineColor: [0, 0, 0], lineWidth: 0.1 },
        theme: 'grid'
      });
      yPos = doc.lastAutoTable.finalY + 8;
    }
    
    // Check if we need a new page
    if (yPos > 170) {
      doc.addPage();
      yPos = 15;
    }
    
    // Property Walk
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Property Walk Observations', 14, yPos);
    yPos += 5;
    
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    const areas = [
      ['Entrance & Lobby', formData.entranceLobby],
      ['Mclub', formData.mclub],
      ['Market', formData.market],
      ['Fitness Center', formData.fitnessCenter],
      ['Business Center', formData.businessCenter],
      ['Meeting Space', formData.meetingSpace],
      ['Associate Restrooms', formData.associateRestrooms],
      ['Public Restrooms', formData.publicRestrooms],
      ['Breakroom', formData.breakroom],
      ['Guest Corridors', formData.guestCorridors]
    ];
    
    autoTable(doc, {
      startY: yPos,
      body: areas,
      styles: { fontSize: 7, cellPadding: 2, lineColor: [0, 0, 0], lineWidth: 0.1 },
      columnStyles: { 0: { fontStyle: 'bold', cellWidth: 40 } },
      theme: 'grid'
    });
    yPos = doc.lastAutoTable.finalY + 8;
    
    // GSS Scores
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('GSS Scores (Goal: 75%)', 14, yPos);
    yPos += 5;
    
    autoTable(doc, {
      startY: yPos,
      head: [['Category', 'MTD', 'YTD']],
      body: [
        ['ITR', formData.gssItrMtd, formData.gssItrYtd],
        ['F&B', formData.gssFbMtd, formData.gssFbYtd],
        ['Staff Service', formData.gssStaffServiceMtd, formData.gssStaffServiceYtd],
        ['Maintenance & Upkeep', formData.gssMaintenanceMtd, formData.gssMaintenanceYtd],
        ['Elite Appreciation', formData.gssEliteMtd, formData.gssEliteYtd],
        ['Cleanliness', formData.gssCleanlineMtd, formData.gssCleanlineYtd]
      ],
      styles: { fontSize: 7, cellPadding: 2, lineColor: [0, 0, 0], lineWidth: 0.1 },
      headStyles: { fillColor: [52, 73, 94], halign: 'center', lineColor: [0, 0, 0], lineWidth: 0.1 },
      columnStyles: { 0: { fontStyle: 'bold' } },
      theme: 'grid'
    });
    yPos = doc.lastAutoTable.finalY + 8;
    
    // Walked/Relocated Guests
    if (formData.walkedGuests.length > 0 && formData.walkedGuests.some(wg => wg.name || wg.location)) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Walked/Relocated Guests', 14, yPos);
      yPos += 5;
      
      autoTable(doc, {
        startY: yPos,
        head: [['Name', 'Rate Code', 'Location', 'Walked To', 'Will Return?', 'Reaction & Service Recovery']],
        body: formData.walkedGuests.map(wg => [
          wg.name, wg.rateCode, wg.location, wg.walkedTo, wg.willReturn, wg.reaction
        ]),
        styles: { fontSize: 7, cellPadding: 2, lineColor: [0, 0, 0], lineWidth: 0.1 },
        headStyles: { fillColor: [52, 73, 94], halign: 'center', lineColor: [0, 0, 0], lineWidth: 0.1 },
        theme: 'grid'
      });
    }
    
    return doc;
  };

  const handleDownload = () => {
    const doc = generatePDF();
    doc.save(`MOD_Report_${formData.date.replace(/\//g, '-')}.pdf`);
  };

  return (
    <div className="main-content">
      <div className="page-header">
        <div>
          <h1>MOD Report - {formData.date}</h1>
          <p>Manager on Duty daily report</p>
        </div>
        <button className="btn btn-secondary" onClick={onClose}>
          ← Back to Calendar
        </button>
      </div>

      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <button className="btn btn-primary" onClick={handleSave}>
          💾 Save Report
        </button>
        <button className="btn btn-success" onClick={handleDownload}>
          📄 Download PDF
        </button>
      </div>

      <div className="task-section">
        {/* Date and Day - Read only */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
          <div className="form-group">
            <label>Day of Week</label>
            <input type="text" className="form-control" value={formData.dayOfWeek} readOnly style={{ backgroundColor: '#f5f5f5' }} />
          </div>
          <div className="form-group">
            <label>Date (MM/DD/YYYY)</label>
            <input type="text" className="form-control" value={formData.date} readOnly style={{ backgroundColor: '#f5f5f5' }} />
          </div>
        </div>

        {/* MODs and Staff */}
        <h3 style={{ marginBottom: '15px' }}>Staff Information</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
          <div className="form-group">
            <label>AM MOD</label>
            <input type="text" className="form-control" value={formData.amMod} onChange={(e) => handleChange('amMod', e.target.value)} />
          </div>
          <div className="form-group">
            <label>PM MOD</label>
            <input type="text" className="form-control" value={formData.pmMod} onChange={(e) => handleChange('pmMod', e.target.value)} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '20px' }}>
          <div className="form-group">
            <label>Front Desk AM</label>
            <input type="text" className="form-control" value={formData.frontDeskAM} onChange={(e) => handleChange('frontDeskAM', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Front Desk Mid</label>
            <input type="text" className="form-control" value={formData.frontDeskMid} onChange={(e) => handleChange('frontDeskMid', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Front Desk PM</label>
            <input type="text" className="form-control" value={formData.frontDeskPM} onChange={(e) => handleChange('frontDeskPM', e.target.value)} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
          <div className="form-group">
            <label>Maintenance Associate</label>
            <input type="text" className="form-control" value={formData.maintenanceAssociate} onChange={(e) => handleChange('maintenanceAssociate', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Maintenance Manager</label>
            <input type="text" className="form-control" value={formData.maintenanceManager} onChange={(e) => handleChange('maintenanceManager', e.target.value)} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
          <div className="form-group">
            <label>Housekeeping Associate</label>
            <input type="text" className="form-control" value={formData.housekeepingAssociate} onChange={(e) => handleChange('housekeepingAssociate', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Housekeeping Manager</label>
            <input type="text" className="form-control" value={formData.housekeepingManager} onChange={(e) => handleChange('housekeepingManager', e.target.value)} />
          </div>
        </div>

        {/* Housekeeping Report */}
        <h3 style={{ marginBottom: '15px' }}>Housekeeping Report</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '30px' }}>
          <div className="form-group">
            <label>GRA</label>
            <input type="text" className="form-control" value={formData.housekeepingGra} onChange={(e) => handleChange('housekeepingGra', e.target.value)} />
          </div>
          <div className="form-group">
            <label>HM</label>
            <input type="text" className="form-control" value={formData.housekeepingHm} onChange={(e) => handleChange('housekeepingHm', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Inspector</label>
            <input type="text" className="form-control" value={formData.housekeepingInspector} onChange={(e) => handleChange('housekeepingInspector', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Laundry</label>
            <input type="text" className="form-control" value={formData.housekeepingLaundry} onChange={(e) => handleChange('housekeepingLaundry', e.target.value)} />
          </div>
          <div className="form-group">
            <label>DND</label>
            <input type="text" className="form-control" value={formData.housekeepingDnd} onChange={(e) => handleChange('housekeepingDnd', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Lbs</label>
            <input type="text" className="form-control" value={formData.housekeepingLbs} onChange={(e) => handleChange('housekeepingLbs', e.target.value)} />
          </div>
          <div className="form-group">
            <label>VM Rooms</label>
            <input type="text" className="form-control" value={formData.housekeepingVmRooms} onChange={(e) => handleChange('housekeepingVmRooms', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Carry Rooms</label>
            <input type="text" className="form-control" value={formData.housekeepingCarryRooms} onChange={(e) => handleChange('housekeepingCarryRooms', e.target.value)} />
          </div>
        </div>

        {/* Maintenance Report */}
        <h3 style={{ marginBottom: '15px' }}>Maintenance Report</h3>
        <div className="form-group" style={{ marginBottom: '30px' }}>
          <label>Report</label>
          <textarea 
            className="form-control" 
            rows="4" 
            value={formData.maintenanceReport} 
            onChange={(e) => handleChange('maintenanceReport', e.target.value)}
            placeholder="Enter maintenance report details..."
          />
        </div>

        {/* Occupancy Info */}
        <h3 style={{ marginBottom: '15px' }}>Occupancy Information</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '20px', marginBottom: '20px' }}>
          <div className="form-group">
            <label>Arrivals</label>
            <input type="text" className="form-control" value={formData.arrivals} onChange={(e) => handleChange('arrivals', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Departures</label>
            <input type="text" className="form-control" value={formData.departures} onChange={(e) => handleChange('departures', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Stay Overs</label>
            <input type="text" className="form-control" value={formData.stayOvers} onChange={(e) => handleChange('stayOvers', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Rooms to Sell</label>
            <input type="text" className="form-control" value={formData.roomsToSell} onChange={(e) => handleChange('roomsToSell', e.target.value)} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '20px', marginBottom: '30px' }}>
          <div className="form-group">
            <label>Expected Occupancy %</label>
            <input type="text" className="form-control" value={formData.expectedOccupancy} onChange={(e) => handleChange('expectedOccupancy', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Current Occupancy %</label>
            <input type="text" className="form-control" value={formData.currentOccupancy} onChange={(e) => handleChange('currentOccupancy', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Tomorrow Departures</label>
            <input type="text" className="form-control" value={formData.tomorrowDepartures} onChange={(e) => handleChange('tomorrowDepartures', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Tomorrow Arrivals</label>
            <input type="text" className="form-control" value={formData.tomorrowArrivals} onChange={(e) => handleChange('tomorrowArrivals', e.target.value)} />
          </div>
        </div>

        {/* Guest Concerns */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h3>Guest Concerns</h3>
          <button className="btn btn-primary" onClick={addGuestConcern}>+ Add Guest Concern</button>
        </div>

        {formData.guestConcerns.map((concern, index) => (
          <div key={index} style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '15px', marginBottom: '15px', backgroundColor: '#f9f9f9' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <h4>Concern #{index + 1}</h4>
              <button 
                className="btn" 
                onClick={() => removeGuestConcern(index)}
                style={{ backgroundColor: '#e74c3c', color: 'white', padding: '5px 10px' }}
              >
                Remove
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
              <div className="form-group">
                <label>Room #</label>
                <input type="text" className="form-control" value={concern.roomNumber} onChange={(e) => handleArrayChange('guestConcerns', index, 'roomNumber', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Guest Name</label>
                <input type="text" className="form-control" value={concern.guestName} onChange={(e) => handleArrayChange('guestConcerns', index, 'guestName', e.target.value)} />
              </div>
              <div className="form-group">
                <label>AM/PM</label>
                <select className="form-control" value={concern.ampm} onChange={(e) => handleArrayChange('guestConcerns', index, 'ampm', e.target.value)}>
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '15px', marginTop: '10px' }}>
              <div className="form-group">
                <label>Problem and Time</label>
                <textarea className="form-control" rows="2" value={concern.problem} onChange={(e) => handleArrayChange('guestConcerns', index, 'problem', e.target.value)} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginTop: '10px' }}>
              <div className="form-group">
                <label>Agent/Service Recovery</label>
                <input type="text" className="form-control" value={concern.agent} onChange={(e) => handleArrayChange('guestConcerns', index, 'agent', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Departments Involved</label>
                <input type="text" className="form-control" value={concern.departments} onChange={(e) => handleArrayChange('guestConcerns', index, 'departments', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Contact Info & Follow Up</label>
                <input type="text" className="form-control" value={concern.contact} onChange={(e) => handleArrayChange('guestConcerns', index, 'contact', e.target.value)} />
              </div>
            </div>
          </div>
        ))}

        {/* Property Walk */}
        <h3 style={{ marginTop: '30px', marginBottom: '15px' }}>Property Walk Observations</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
          {[
            ['Entrance & Lobby', 'entranceLobby'],
            ['Mclub', 'mclub'],
            ['Market', 'market'],
            ['Fitness Center', 'fitnessCenter'],
            ['Business Center', 'businessCenter'],
            ['Meeting Space', 'meetingSpace'],
            ['Associate Restrooms', 'associateRestrooms'],
            ['Public Restrooms', 'publicRestrooms'],
            ['Breakroom', 'breakroom'],
            ['Guest Room Corridors', 'guestCorridors']
          ].map(([label, field]) => (
            <div key={field} className="form-group">
              <label>{label}</label>
              <input type="text" className="form-control" value={formData[field]} onChange={(e) => handleChange(field, e.target.value)} placeholder="Observations..." />
            </div>
          ))}
        </div>

        {/* GSS Scores */}
        <h3 style={{ marginBottom: '15px' }}>GSS Scores (Goal: 75%)</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px' }}>
          <thead>
            <tr style={{ backgroundColor: '#34495e', color: 'white' }}>
              <th style={{ border: '1px solid #ddd', padding: '12px' }}>Category</th>
              <th style={{ border: '1px solid #ddd', padding: '12px' }}>MTD</th>
              <th style={{ border: '1px solid #ddd', padding: '12px' }}>YTD</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['ITR', 'gssItrMtd', 'gssItrYtd'],
              ['F&B', 'gssFbMtd', 'gssFbYtd'],
              ['Staff Service', 'gssStaffServiceMtd', 'gssStaffServiceYtd'],
              ['Maintenance & Upkeep', 'gssMaintenanceMtd', 'gssMaintenanceYtd'],
              ['Elite Appreciation', 'gssEliteMtd', 'gssEliteYtd'],
              ['Cleanliness', 'gssCleanlineMtd', 'gssCleanlineYtd']
            ].map(([label, mtdField, ytdField]) => (
              <tr key={label}>
                <td style={{ border: '1px solid #ddd', padding: '8px', fontWeight: 'bold' }}>{label}</td>
                <td style={{ border: '1px solid #ddd', padding: '4px' }}>
                  <input type="text" className="form-control" value={formData[mtdField]} onChange={(e) => handleChange(mtdField, e.target.value)} style={{ margin: 0 }} />
                </td>
                <td style={{ border: '1px solid #ddd', padding: '4px' }}>
                  <input type="text" className="form-control" value={formData[ytdField]} onChange={(e) => handleChange(ytdField, e.target.value)} style={{ margin: 0 }} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Walked/Relocated Guests */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h3>Walked/Relocated Guests</h3>
          <button className="btn btn-primary" onClick={addWalkedGuest}>+ Add Walked Guest</button>
        </div>

        {formData.walkedGuests.map((guest, index) => (
          <div key={index} style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '15px', marginBottom: '15px', backgroundColor: '#f9f9f9' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <h4>Guest #{index + 1}</h4>
              <button 
                className="btn" 
                onClick={() => removeWalkedGuest(index)}
                style={{ backgroundColor: '#e74c3c', color: 'white', padding: '5px 10px' }}
              >
                Remove
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
              <div className="form-group">
                <label>Name</label>
                <input type="text" className="form-control" value={guest.name} onChange={(e) => handleArrayChange('walkedGuests', index, 'name', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Rate Code</label>
                <input type="text" className="form-control" value={guest.rateCode} onChange={(e) => handleArrayChange('walkedGuests', index, 'rateCode', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Location</label>
                <input type="text" className="form-control" value={guest.location} onChange={(e) => handleArrayChange('walkedGuests', index, 'location', e.target.value)} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '10px' }}>
              <div className="form-group">
                <label>Walked To</label>
                <input type="text" className="form-control" value={guest.walkedTo} onChange={(e) => handleArrayChange('walkedGuests', index, 'walkedTo', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Will Guest Return?</label>
                <input type="text" className="form-control" value={guest.willReturn} onChange={(e) => handleArrayChange('walkedGuests', index, 'willReturn', e.target.value)} />
              </div>
            </div>
            <div className="form-group" style={{ marginTop: '10px' }}>
              <label>Guest Reaction & Service Recovery</label>
              <textarea className="form-control" rows="2" value={guest.reaction} onChange={(e) => handleArrayChange('walkedGuests', index, 'reaction', e.target.value)} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MODReport;
