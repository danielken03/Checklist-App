import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import api from '../api';
import PreShiftForm from './PreShiftForm';
import MODReport from './MODReport';
import GroupResumeList from './GroupResumeList';

const MARRIOTT_LOGO_B64 = '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';

const htmlToText = (html) => {
  if (!html) return '';
  if (!/<[a-z][\s\S]*>/i.test(html)) return html;
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  const walkList = (listNode, depth) => {
    let text = '';
    const indent = '    '.repeat(depth);
    const bullet = depth === 0 ? '- ' : '  - ';
    Array.from(listNode.childNodes).forEach((child) => {
      if (child.nodeType === Node.ELEMENT_NODE) {
        const tag = child.tagName.toLowerCase();
        if (tag === 'li') {
          const liClone = child.cloneNode(true);
          liClone.querySelectorAll('ul, ol').forEach(n => n.remove());
          const lineText = liClone.textContent.trim();
          if (lineText) text += indent + bullet + lineText + '\n';
        } else if (tag === 'ul' || tag === 'ol') {
          text += walkList(child, depth + 1);
        }
      }
    });
    return text;
  };
  const walk = (node) => {
    let text = '';
    node.childNodes.forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        text += child.textContent;
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        const tag = child.tagName.toLowerCase();
        if (tag === 'br') text += '\n';
        else if (tag === 'ul' || tag === 'ol') text += walkList(child, 0);
        else if (tag === 'p' || tag === 'div') text += walk(child) + '\n';
        else text += walk(child);
      }
    });
    return text;
  };
  return walk(tmp).replace(/\n{3,}/g, '\n\n').trim();
};

function CalendarView({ onDateSelect, userRole }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarData, setCalendarData] = useState({ daily: {}, weekly: {}, monthly: {} });
  const [preshiftDates, setPreshiftDates] = useState([]);
  const [modDates, setModDates] = useState([]);
  const [groupResumeDates, setGroupResumeDates] = useState({});
  const [viewMode, setViewMode] = useState('tasks');
  const [selectedDate, setSelectedDate] = useState(null);
  const [showPreShiftForm, setShowPreShiftForm] = useState(false);
  const [showMODReport, setShowMODReport] = useState(false);
  const [showGroupResumeList, setShowGroupResumeList] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedDates, setSelectedDates] = useState([]);
  const [generatingPacket, setGeneratingPacket] = useState(false);

  const canCreatePacket = ['grand_admin', 'sales_admin', 'sales_employee'].includes(userRole);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { loadCalendarData(); }, [currentDate, viewMode]);

  const loadCalendarData = async () => {
    setLoading(true);
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    try {
      if (viewMode === 'tasks') {
        const data = await api.getCalendarData(year, month);
        setCalendarData(data);
      } else if (viewMode === 'preshift') {
        const dates = await api.getPreShiftFormDates(year, month);
        setPreshiftDates(dates);
      } else if (viewMode === 'mod') {
        const dates = await api.getMODReportDates(year, month);
        setModDates(dates);
      } else if (viewMode === 'groupresumes') {
        const dates = await api.getGroupResumeDates(year, month);
        setGroupResumeDates(dates);
      }
    } catch (error) {
      console.error('Error loading calendar data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateClick = (dateStr) => {
    if (viewMode === 'groupresumes' && selectionMode) {
      if (selectedDates.includes(dateStr)) {
        setSelectedDates(selectedDates.filter(d => d !== dateStr));
      } else {
        setSelectedDates([...selectedDates, dateStr].sort());
      }
      return;
    }
    if (viewMode === 'preshift') { setSelectedDate(dateStr); setShowPreShiftForm(true); }
    else if (viewMode === 'mod') { setSelectedDate(dateStr); setShowMODReport(true); }
    else if (viewMode === 'groupresumes') { setSelectedDate(dateStr); setShowGroupResumeList(true); }
    else { onDateSelect(dateStr); }
  };

  const handleClosePreShiftForm = () => { setShowPreShiftForm(false); setSelectedDate(null); loadCalendarData(); };
  const handleCloseMODReport = () => { setShowMODReport(false); setSelectedDate(null); loadCalendarData(); };
  const handleCloseGroupResumeList = () => { setShowGroupResumeList(false); setSelectedDate(null); loadCalendarData(); };
  const startSelectionMode = () => { setSelectionMode(true); setSelectedDates([]); };
  const cancelSelection = () => { setSelectionMode(false); setSelectedDates([]); };

  const formatDateRange = (startDate, endDate) => {
    const start = new Date(startDate + 'T00:00:00');
    const end = new Date(endDate + 'T00:00:00');
    const startMonth = start.toLocaleDateString('en-US', { month: 'long' });
    const startDay = start.getDate();
    const endMonth = end.toLocaleDateString('en-US', { month: 'long' });
    const endDay = end.getDate();
    const getOrdinal = (n) => { const s = ['th','st','nd','rd']; const v = n % 100; return n + (s[(v-20)%10] || s[v] || s[0]); };
    if (startMonth === endMonth) return `${startMonth} ${getOrdinal(startDay)} - ${getOrdinal(endDay)}`.toUpperCase();
    return `${startMonth} ${getOrdinal(startDay)} - ${endMonth} ${getOrdinal(endDay)}`.toUpperCase();
  };

  const generateCoverPage = (doc, startDate, endDate) => {
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Marriott logo centered
    try {
      doc.addImage(MARRIOTT_LOGO_B64, 'JPEG', pageWidth / 2 - 30, 30, 60, 50);
    } catch(e) {
      doc.setFontSize(50);
      doc.setTextColor(139, 0, 49);
      doc.setFont('helvetica', 'bold');
      doc.text('M', pageWidth / 2, 70, { align: 'center' });
    }

    // Hotel name
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    doc.text('MARRIOTT', pageWidth / 2, 95, { align: 'center' });
    doc.text('NASHVILLE', pageWidth / 2, 105, { align: 'center' });
    doc.text('VANDERBILT', pageWidth / 2, 115, { align: 'center' });

    // RESUME PACKET title
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('RESUME PACKET:', pageWidth / 2, 155, { align: 'center' });

    // Date range
    doc.setFontSize(16);
    doc.text(formatDateRange(startDate, endDate), pageWidth / 2, 172, { align: 'center' });

    // Footer
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('** Please review and share the following information with your Staff **', pageWidth / 2, pageHeight - 40, { align: 'center' });
    doc.setFontSize(9);
    doc.text('Marriott International Proprietary and Confidential', pageWidth / 2, pageHeight - 15, { align: 'center' });
  };

  const addResumePage = (doc, resume) => {
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPos = 15;
    const leftCol = 14;
    const rightCol = pageWidth / 2 + 5;
    const lineHeight = 5;

    // POP-UP banner
    if (resume.is_popup) {
      doc.setFillColor(255, 255, 0);
      doc.rect(55, yPos - 5, 100, 10, 'F');
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text('POP-UP Resume', pageWidth / 2, yPos, { align: 'center' });
      yPos += 10;
    }

    // Hotel name
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    doc.text('Nashville Marriott at Vanderbilt University', pageWidth / 2, yPos, { align: 'center' });
    yPos += 5;

    // GROUP COVER SHEET header
    doc.setFillColor(64, 64, 64);
    doc.rect(14, yPos, pageWidth - 28, 7, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('GROUP COVER SHEET', pageWidth / 2, yPos + 5, { align: 'center' });
    yPos += 12;
    doc.setTextColor(0, 0, 0);

    // Group logo
    if (resume.logo_filename) {
      try {
        doc.addImage(`/uploads/group-logos/${resume.logo_filename}`, 'PNG', pageWidth / 2 - 25, yPos, 50, 25);
        yPos += 30;
      } catch(e) { yPos += 5; }
    } else {
      yPos += 5;
    }

    // Main info
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold'); doc.text('Organization:', leftCol, yPos);
    doc.setFont('helvetica', 'normal'); doc.text(resume.organization || '', leftCol + 30, yPos);
    doc.setFont('helvetica', 'bold'); doc.text('Quote #:', rightCol, yPos);
    doc.setFont('helvetica', 'normal'); doc.text(resume.quote_number || '', rightCol + 20, yPos);
    yPos += lineHeight;

    doc.setFont('helvetica', 'bold'); doc.text('Post As:', leftCol, yPos);
    doc.setFont('helvetica', 'normal'); doc.text(resume.post_as || '', leftCol + 30, yPos);
    yPos += lineHeight;

    doc.setFont('helvetica', 'bold'); doc.text('Arrival Date:', leftCol, yPos);
    doc.setFont('helvetica', 'normal'); doc.text(resume.arrival_date || '', leftCol + 30, yPos);
    doc.setFont('helvetica', 'bold'); doc.text('Departure Date:', rightCol, yPos);
    doc.setFont('helvetica', 'normal'); doc.text(resume.departure_date || '', rightCol + 30, yPos);
    yPos += lineHeight + 3;

    doc.setDrawColor(0, 0, 0);
    doc.line(14, yPos, pageWidth - 14, yPos);
    yPos += 5;

    doc.setFont('helvetica', 'bold'); doc.text('Master Account #:', leftCol, yPos);
    doc.setFont('helvetica', 'normal'); doc.text(resume.master_account || '', leftCol + 35, yPos);
    doc.setFont('helvetica', 'bold'); doc.text('Market Code:', rightCol, yPos);
    doc.setFont('helvetica', 'normal'); doc.text(resume.market_code || '', rightCol + 25, yPos);
    yPos += lineHeight;

    doc.setFont('helvetica', 'bold'); doc.text('Group Contact:', leftCol, yPos);
    doc.setFont('helvetica', 'normal'); doc.text(resume.group_contact || '', leftCol + 35, yPos);
    doc.setFont('helvetica', 'bold'); doc.text('Telephone:', rightCol, yPos);
    doc.setFont('helvetica', 'normal'); doc.text(resume.telephone || '', rightCol + 25, yPos);
    yPos += lineHeight;

    doc.setFont('helvetica', 'bold'); doc.text('In-House Contact:', leftCol, yPos);
    doc.setFont('helvetica', 'normal'); doc.text(resume.in_house_contact || '', leftCol + 35, yPos);
    doc.setFont('helvetica', 'bold'); doc.text('Email:', rightCol, yPos);
    doc.setFont('helvetica', 'normal'); doc.text(resume.email || '', rightCol + 25, yPos);
    yPos += lineHeight;

    doc.setFont('helvetica', 'bold'); doc.text('Sales Manager(s):', leftCol, yPos);
    doc.setFont('helvetica', 'normal'); doc.text(resume.sales_manager || '', leftCol + 35, yPos);
    doc.setFont('helvetica', 'bold'); doc.text('Event Manager(s):', rightCol, yPos);
    doc.setFont('helvetica', 'normal'); doc.text(resume.event_manager || '', rightCol + 30, yPos);
    yPos += lineHeight;

    doc.setFont('helvetica', 'bold'); doc.text('Reservation Coordinator:', leftCol, yPos);
    doc.setFont('helvetica', 'normal'); doc.text(resume.reservation_coordinator || '', leftCol + 45, yPos);
    doc.setFont('helvetica', 'bold'); doc.text('General Accountant:', rightCol, yPos);
    doc.setFont('helvetica', 'normal'); doc.text(resume.general_accountant || '', rightCol + 35, yPos);
    yPos += lineHeight + 3;

    // Gold Keys
    const goldKeysText = htmlToText(resume.gold_keys);
    if (goldKeysText) {
      doc.setFont('helvetica', 'bold'); doc.text('Gold Keys:', leftCol, yPos); yPos += 4;
      doc.setFont('helvetica', 'normal');
      goldKeysText.split('\n').filter(l => l.trim()).forEach(line => {
        const wrapped = doc.splitTextToSize(line, pageWidth - 34);
        wrapped.forEach(wl => { doc.text(wl, leftCol + 4, yPos); yPos += 4; });
      });
      yPos += 2;
    }

    doc.setFont('helvetica', 'bold'); doc.text('Peak Attendees:', leftCol, yPos);
    doc.setFont('helvetica', 'normal'); doc.text(resume.peak_attendees || '', leftCol + 30, yPos);
    yPos += lineHeight + 3;

    // Group Profile
    const profileText = htmlToText(resume.group_profile);
    if (profileText) {
      doc.setFont('helvetica', 'bold'); doc.text('Group Profile:', leftCol, yPos); yPos += lineHeight;
      doc.setFont('helvetica', 'normal');
      profileText.split('\n').filter(l => l.trim()).forEach(line => {
        const wrapped = doc.splitTextToSize(line, pageWidth - 30);
        wrapped.forEach(wl => { doc.text(wl, leftCol, yPos); yPos += 4; });
      });
      yPos += 3;
    }

    // Room Block table
    const roomBlockRows = resume.room_block_rows ? JSON.parse(resume.room_block_rows) : [];
    if (roomBlockRows.length > 0) {
      doc.setFont('helvetica', 'bold'); doc.setFontSize(10);
      doc.text('GROUP ROOM BLOCK:', leftCol, yPos); yPos += 5;
      autoTable(doc, {
        startY: yPos,
        head: [['Date', 'Day', 'Room Block', 'Contracted', 'Projected', 'Picked Up']],
        body: roomBlockRows.map(r => [r.date, r.day, r.roomBlock, r.contracted, r.projected, r.pickedUp]),
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [200, 200, 200], textColor: [0, 0, 0] },
        theme: 'grid'
      });
      yPos = doc.lastAutoTable.finalY + 5;
    }

    if (yPos > 220) { doc.addPage(); yPos = 15; }

    // Reservation Method table
    const reservationMethodRows = resume.reservation_method_rows ? JSON.parse(resume.reservation_method_rows) : [];
    if (reservationMethodRows.length > 0) {
      doc.setFont('helvetica', 'bold'); doc.setFontSize(10);
      doc.text('RESERVATION METHOD(S)', leftCol, yPos); yPos += 5;
      autoTable(doc, {
        startY: yPos,
        head: [['Room Block', 'Billing Method', 'Reservation Method', 'Reservation Type', 'Pre-Registration', 'Pre-Key']],
        body: reservationMethodRows.map(r => [r.roomBlock, r.billingMethod, r.reservationMethod, r.reservationType, r.preRegistration, r.preKey]),
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [200, 200, 200], textColor: [0, 0, 0] },
        theme: 'grid'
      });
      yPos = doc.lastAutoTable.finalY + 5;
    }

    // Rates table
    const ratesRows = resume.rates_rows ? JSON.parse(resume.rates_rows) : [];
    if (ratesRows.length > 0) {
      doc.setFont('helvetica', 'bold'); doc.setFontSize(10);
      doc.text('RATES:', leftCol, yPos); yPos += 5;
      autoTable(doc, {
        startY: yPos,
        head: [['Room Block', 'Start Date', 'End Date', 'Room Type', 'Room Occupancy', 'Negotiated Rate']],
        body: ratesRows.map(r => [r.roomBlock, r.startDate, r.endDate, r.roomType, r.roomOccupancy, r.negotiatedRate]),
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [200, 200, 200], textColor: [0, 0, 0] },
        theme: 'grid'
      });
      yPos = doc.lastAutoTable.finalY + 10;
    }

    // VIP table with photos in cells
    const vipRows = resume.vip_rows ? JSON.parse(resume.vip_rows) : [];
    if (vipRows.length > 0 && vipRows.some(v => v.name)) {
      if (yPos > 200) { doc.addPage(); yPos = 15; }
      doc.setFont('helvetica', 'bold'); doc.setFontSize(10);
      doc.text('VIP:', leftCol, yPos); yPos += 5;
      autoTable(doc, {
        startY: yPos,
        head: [['Photo', 'Name', 'Arrival', 'Departure', 'ETA', 'Room Type', 'Rate', 'Bill Method', 'VIP']],
        body: vipRows.map(v => ['', v.name, v.arrival, v.departure, v.eta, v.roomType, v.rate, v.billMethod, v.vipLevel]),
        styles: { fontSize: 7, cellPadding: 2 },
        headStyles: { fillColor: [200, 200, 200], textColor: [0, 0, 0] },
        theme: 'grid',
        columnStyles: { 0: { cellWidth: 25 } },
        bodyStyles: { minCellHeight: 22 },
        rowPageBreak: 'avoid',
        didDrawCell: (data) => {
          if (data.section === 'body' && data.column.index === 0) {
            const vip = vipRows[data.row.index];
            if (vip && vip.photo) {
              try {
                const pad = 1;
                doc.addImage(vip.photo, 'JPEG', data.cell.x + pad, data.cell.y + pad, data.cell.width - pad * 2, data.cell.height - pad * 2);
              } catch(e) {}
            }
          }
        }
      });
      yPos = doc.lastAutoTable.finalY + 10;
    }

    if (yPos > 200) { doc.addPage(); yPos = 15; }

    // Billing Instructions
    doc.setFont('helvetica', 'bold'); doc.setFontSize(10);
    doc.text('BILLING INSTRUCTIONS:', leftCol, yPos); yPos += 5;
    doc.setFontSize(9);

    doc.setFont('helvetica', 'bold'); doc.text('Payment Method:', leftCol, yPos);
    doc.setFont('helvetica', 'normal'); doc.text(resume.payment_method || '', leftCol + 35, yPos);
    doc.setFont('helvetica', 'bold'); doc.text('Direct Bill Approved:', leftCol + 80, yPos);
    doc.setFont('helvetica', 'normal'); doc.text(resume.direct_bill_approved || '', leftCol + 120, yPos);
    yPos += lineHeight;

    doc.setFont('helvetica', 'bold'); doc.text('Master Account:', leftCol, yPos);
    doc.setFont('helvetica', 'normal'); doc.text(resume.master_account_billing || '', leftCol + 35, yPos);
    yPos += lineHeight;

    doc.setFont('helvetica', 'bold'); doc.text('Authorized Signers:', leftCol, yPos);
    doc.setFont('helvetica', 'normal'); doc.text(resume.authorized_signers || '', leftCol + 35, yPos);
    yPos += lineHeight;

    const billingText = htmlToText(resume.billing_address);
    if (billingText) {
      doc.setFont('helvetica', 'bold'); doc.text('Billing Address:', leftCol, yPos); yPos += lineHeight;
      doc.setFont('helvetica', 'normal');
      billingText.split('\n').filter(l => l.trim()).forEach(line => { doc.text(line, leftCol + 5, yPos); yPos += 4; });
    }

    doc.setFont('helvetica', 'bold'); doc.text('Commission:', leftCol, yPos);
    doc.setFont('helvetica', 'normal'); doc.text(resume.commission || '', leftCol + 25, yPos);
    yPos += lineHeight;

    doc.setFont('helvetica', 'bold'); doc.text('Intermediary Account:', leftCol, yPos);
    doc.setFont('helvetica', 'normal'); doc.text(resume.intermediary_account || '', leftCol + 40, yPos);
    yPos += lineHeight;

    doc.setFont('helvetica', 'bold'); doc.text('Intermediary ID#:', leftCol, yPos);
    doc.setFont('helvetica', 'normal'); doc.text(resume.intermediary_id || '', leftCol + 35, yPos);
    yPos += lineHeight + 5;

    // Department sections
    const departments = [
      { label: 'FRONTDESK', field: 'frontdesk' },
      { label: 'BELLSTAND', field: 'bellstand' },
      { label: 'CONCIERGE', field: 'concierge' },
      { label: 'GARAGE/VALET', field: 'garage_valet' },
      { label: 'OUTLET INFORMATION', field: 'outlet_information' },
      { label: 'HOUSEKEEPING', field: 'housekeeping' },
      { label: 'CATERING/BANQUETS', field: 'catering_banquets' },
      { label: 'AUDIO VISUAL', field: 'audio_visual' },
      { label: 'SHIPPING & RECEIVING', field: 'shipping_receiving' },
      { label: 'ACCOUNTING', field: 'accounting' }
    ];

    departments.forEach(dept => {
      const text = htmlToText(resume[dept.field]);
      if (!text) return;
      if (yPos > 255) { doc.addPage(); yPos = 15; }
      doc.setFont('helvetica', 'bold'); doc.setFontSize(9);
      doc.text(dept.label + ':', leftCol, yPos); yPos += 4;
      doc.setFont('helvetica', 'normal'); doc.setFontSize(8);
      text.split('\n').filter(l => l.trim()).forEach(line => {
        if (yPos > 280) { doc.addPage(); yPos = 15; }
        const wrapped = doc.splitTextToSize(line, pageWidth - 30);
        wrapped.forEach(wl => { doc.text(wl, leftCol + 2, yPos); yPos += 3.5; });
      });
      yPos += 3;
    });

    // Guest Confirmation List
    const guestList = resume.guest_list ? JSON.parse(resume.guest_list) : [];
    if (guestList.length > 0 && guestList.some(g => g.firstName || g.lastName)) {
      doc.addPage(); yPos = 15;
      doc.setFont('helvetica', 'bold'); doc.setFontSize(12);
      doc.text('Group Confirmation List', leftCol, yPos); yPos += 5;
      doc.setFontSize(10); doc.text('NASH/VANDERBILT UNIV', leftCol, yPos); yPos += 5;
      doc.setFontSize(9); doc.text(`Group: ${resume.organization?.toUpperCase() || 'GROUP'}`, leftCol, yPos); yPos += 7;
      autoTable(doc, {
        startY: yPos,
        head: [['Title', 'First Name', 'Last Name', 'Email', 'Arrival Date', 'Departure Date', 'Confirmation #']],
        body: guestList.map(g => [g.title, g.firstName, g.lastName, g.email, g.arrivalDate, g.departureDate, g.confirmationNumber]),
        styles: { fontSize: 7, cellPadding: 2 },
        headStyles: { fillColor: [200, 200, 200], textColor: [0, 0, 0] },
        theme: 'grid'
      });
    }
  };

  const generatePacket = async () => {
    if (selectedDates.length === 0) { alert('Please select at least one date'); return; }
    setGeneratingPacket(true);
    try {
      const resumes = await api.getGroupResumesForPacket(selectedDates);
      if (resumes.length === 0) {
        alert('No group resumes found for selected dates');
        setGeneratingPacket(false);
        return;
      }

      const doc = new jsPDF('portrait');
      const startDate = selectedDates[0];
      const endDate = selectedDates[selectedDates.length - 1];
      generateCoverPage(doc, startDate, endDate);

      for (const resume of resumes) {
        doc.addPage();
        addResumePage(doc, resume);
      }

      // Page numbers (skip cover page)
      const totalPages = doc.internal.getNumberOfPages();
      for (let i = 2; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(9);
        doc.setTextColor(0, 0, 0);
        doc.text(
          `Page ${i - 1} of ${totalPages - 1}`,
          doc.internal.pageSize.getWidth() - 20,
          doc.internal.pageSize.getHeight() - 10,
          { align: 'right' }
        );
      }

      const start = new Date(startDate + 'T00:00:00');
      const end = new Date(endDate + 'T00:00:00');
      const startStr = `${start.toLocaleDateString('en-US', { month: 'short' })}_${start.getDate()}`;
      const endStr = `${end.toLocaleDateString('en-US', { month: 'short' })}_${end.getDate()}`;
      doc.save(`Group_Resume_Packet_${startStr}-${endStr}_${start.getFullYear()}.pdf`);

      alert('Packet generated successfully!');
      setSelectionMode(false);
      setSelectedDates([]);
    } catch (error) {
      console.error('Error generating packet:', error);
      alert('Error generating packet. Please try again.');
    } finally {
      setGeneratingPacket(false);
    }
  };

  const getColor = (percentage) => {
    if (percentage >= 90) return 'green';
    if (percentage >= 50) return 'yellow';
    if (percentage > 0) return 'red';
    return 'gray';
  };

  const getBackgroundColor = (percentage) => {
    if (percentage >= 90) return '#d4edda';
    if (percentage >= 50) return '#fff3cd';
    if (percentage > 0) return '#f8d7da';
    return 'white';
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];
    const startingDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();
    const prevMonth = new Date(year, month, 0);
    const daysInPrevMonth = prevMonth.getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({ date: new Date(year, month - 1, daysInPrevMonth - i), isCurrentMonth: false });
    }
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({ date: new Date(year, month, day), isCurrentMonth: true });
    }
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      days.push({ date: new Date(year, month + 1, day), isCurrentMonth: false });
    }
    return days;
  };

  const getWeekStart = (date) => {
    const d = new Date(date);
    d.setDate(d.getDate() - d.getDay());
    return d.toISOString().split('T')[0];
  };

  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const hasPreShiftForm = (dateStr) => preshiftDates.includes(dateStr);
  const hasMODReport = (dateStr) => modDates.includes(dateStr);
  const getGroupResumeCount = (dateStr) => groupResumeDates[dateStr] || 0;

  if (showPreShiftForm && selectedDate) return <PreShiftForm selectedDate={selectedDate} onClose={handleClosePreShiftForm} />;
  if (showMODReport && selectedDate) return <MODReport selectedDate={selectedDate} onClose={handleCloseMODReport} />;
  if (showGroupResumeList && selectedDate) return <GroupResumeList selectedDate={selectedDate} onClose={handleCloseGroupResumeList} userRole={userRole} />;
  if (loading) return <div className="loading">Loading calendar...</div>;

  const days = getDaysInMonth();
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="main-content">
      <div className="page-header">
        <h1>Calendar View</h1>
        <p>Track team performance, pre-shift forms, MOD reports, and group resumes</p>
      </div>

      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
        <label style={{ fontWeight: '600' }}>View:</label>
        <select
          className="form-control"
          value={viewMode}
          onChange={(e) => { setViewMode(e.target.value); setSelectionMode(false); setSelectedDates([]); }}
          style={{ width: '200px' }}
        >
          <option value="tasks">Task Calendar</option>
          <option value="preshift">Pre-Shift Forms</option>
          <option value="mod">MOD Reports</option>
          <option value="groupresumes">Group Resumes</option>
        </select>

        {viewMode === 'groupresumes' && canCreatePacket && !selectionMode && (
          <button className="btn btn-primary" onClick={startSelectionMode}>📦 Select Dates for Packet</button>
        )}

        {selectionMode && (
          <>
            <button className="btn btn-success" onClick={generatePacket} disabled={selectedDates.length === 0 || generatingPacket}>
              {generatingPacket ? '⏳ Generating...' : `✓ Generate Packet (${selectedDates.length} dates)`}
            </button>
            <button className="btn btn-secondary" onClick={cancelSelection}>Cancel</button>
          </>
        )}
      </div>

      {selectionMode && (
        <div style={{ padding: '15px', backgroundColor: '#e3f2fd', borderRadius: '8px', marginBottom: '20px', border: '2px solid #1976d2' }}>
          <p style={{ margin: 0, fontWeight: '600', color: '#1976d2' }}>
            📦 Selection Mode: Click dates to add to packet. Selected: {selectedDates.length} date{selectedDates.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}

      <div className="calendar-container">
        <div className="calendar-header">
          <div className="calendar-nav">
            <button onClick={prevMonth}>← Previous</button>
            <span className="calendar-title">{currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
            <button onClick={nextMonth}>Next →</button>
          </div>
        </div>

        <div className="calendar-grid">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="calendar-day-header">{day}</div>
          ))}

          {days.map((dayObj, index) => {
            const dateStr = dayObj.date.toISOString().split('T')[0];
            const isToday = dateStr === today;
            const isPast = new Date(dateStr) <= new Date(today);
            const isSelected = selectedDates.includes(dateStr);

            if (viewMode === 'tasks') {
              const dayData = calendarData?.daily?.[dateStr] || { percentage: 0 };
              const weekStart = getWeekStart(dayObj.date);
              const weekData = calendarData?.weekly?.[weekStart] || { percentage: 0 };
              const backgroundColor = dayObj.isCurrentMonth && isPast ? getBackgroundColor(dayData.percentage) : 'white';
              return (
                <div key={index} className={`calendar-day ${!dayObj.isCurrentMonth ? 'other-month' : ''} ${isToday ? 'today' : ''}`}
                  onClick={() => dayObj.isCurrentMonth && isPast && handleDateClick(dateStr)}
                  style={{ cursor: dayObj.isCurrentMonth && isPast ? 'pointer' : 'default', backgroundColor }}>
                  {dayObj.isCurrentMonth && isPast && <div className={`weekly-indicator ${getColor(weekData.percentage)}`} />}
                  <div className="day-number">{dayObj.date.getDate()}</div>
                  {dayObj.isCurrentMonth && isPast && <div className="day-completion">{dayData.percentage}% complete</div>}
                </div>
              );
            } else if (viewMode === 'preshift') {
              const hasFilled = hasPreShiftForm(dateStr);
              return (
                <div key={index} className={`calendar-day ${!dayObj.isCurrentMonth ? 'other-month' : ''} ${isToday ? 'today' : ''}`}
                  onClick={() => dayObj.isCurrentMonth && handleDateClick(dateStr)}
                  style={{ cursor: dayObj.isCurrentMonth ? 'pointer' : 'default', backgroundColor: hasFilled ? '#d4edda' : 'white' }}>
                  <div className="day-number">{dayObj.date.getDate()}</div>
                  {dayObj.isCurrentMonth && hasFilled && <div style={{ fontSize: '12px', color: '#27ae60', fontWeight: '600', marginTop: '5px' }}>✓ Filled</div>}
                </div>
              );
            } else if (viewMode === 'mod') {
              const hasFilled = hasMODReport(dateStr);
              return (
                <div key={index} className={`calendar-day ${!dayObj.isCurrentMonth ? 'other-month' : ''} ${isToday ? 'today' : ''}`}
                  onClick={() => dayObj.isCurrentMonth && handleDateClick(dateStr)}
                  style={{ cursor: dayObj.isCurrentMonth ? 'pointer' : 'default', backgroundColor: hasFilled ? '#d4edda' : 'white' }}>
                  <div className="day-number">{dayObj.date.getDate()}</div>
                  {dayObj.isCurrentMonth && hasFilled && <div style={{ fontSize: '12px', color: '#27ae60', fontWeight: '600', marginTop: '5px' }}>✓ Filled</div>}
                </div>
              );
            } else {
              const groupCount = getGroupResumeCount(dateStr);
              let backgroundColor = groupCount > 0 ? '#e3f2fd' : 'white';
              if (isSelected) backgroundColor = '#1976d2';
              return (
                <div key={index} className={`calendar-day ${!dayObj.isCurrentMonth ? 'other-month' : ''} ${isToday ? 'today' : ''}`}
                  onClick={() => dayObj.isCurrentMonth && handleDateClick(dateStr)}
                  style={{ cursor: dayObj.isCurrentMonth ? 'pointer' : 'default', backgroundColor, border: isSelected ? '3px solid #0d47a1' : undefined }}>
                  <div className="day-number" style={{ color: isSelected ? 'white' : undefined }}>{dayObj.date.getDate()}</div>
                  {dayObj.isCurrentMonth && groupCount > 0 && (
                    <div style={{ fontSize: '12px', color: isSelected ? 'white' : '#1976d2', fontWeight: '600', marginTop: '5px' }}>
                      {isSelected && '✓ '}{groupCount} {groupCount === 1 ? 'Group' : 'Groups'}
                    </div>
                  )}
                </div>
              );
            }
          })}
        </div>

        {viewMode === 'tasks' && (
          <div className="calendar-legend">
            <div className="legend-item"><div className="legend-color green"></div><span>90%+ Complete</span></div>
            <div className="legend-item"><div className="legend-color yellow"></div><span>50-89% Complete</span></div>
            <div className="legend-item"><div className="legend-color red"></div><span>Below 50%</span></div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CalendarView;
