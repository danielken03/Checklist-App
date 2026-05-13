import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import api from '../api';

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
        if (tag === 'br') {
          text += '\n';
        } else if (tag === 'ul' || tag === 'ol') {
          text += walkList(child, 0);
        } else if (tag === 'p' || tag === 'div') {
          text += walk(child) + '\n';
        } else {
          text += walk(child);
        }
      }
    });
    return text;
  };

  return walk(tmp).replace(/\n{3,}/g, '\n\n').trim();
};

function GroupResumeView({ resumeId, onClose, onEdit, canEdit }) {
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { loadResume(); }, [resumeId]);

  const loadResume = async () => {
    try {
      setLoading(true);
      const data = await api.getGroupResume(resumeId);
      setResume(data);
    } catch (error) {
      console.error('Error loading resume:', error);
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF('portrait');
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPos = 15;

    if (resume.is_popup) {
      doc.setFillColor(255, 255, 0);
      doc.rect(55, yPos - 5, 100, 10, 'F');
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('POP-UP Resume', pageWidth / 2, yPos, { align: 'center' });
      yPos += 10;
    }

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Nashville Marriott at Vanderbilt University', pageWidth / 2, yPos, { align: 'center' });
    yPos += 5;

    doc.setFillColor(64, 64, 64);
    doc.rect(14, yPos, pageWidth - 28, 7, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('GROUP COVER SHEET', pageWidth / 2, yPos + 5, { align: 'center' });
    yPos += 12;
    doc.setTextColor(0, 0, 0);

    if (resume.logo_filename) {
      try {
        doc.addImage(`/uploads/group-logos/${resume.logo_filename}`, 'PNG', pageWidth / 2 - 25, yPos, 50, 25);
        yPos += 30;
      } catch (error) {
        yPos += 5;
      }
    } else {
      yPos += 5;
    }

    doc.setFontSize(9);
    const leftCol = 14;
    const rightCol = pageWidth / 2 + 5;
    const lineHeight = 5;

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

    const goldKeysText = htmlToText(resume.gold_keys);
    if (goldKeysText) {
      doc.setFont('helvetica', 'bold'); doc.text('Gold Keys:', leftCol, yPos); yPos += 4;
      doc.setFont('helvetica', 'normal');
      goldKeysText.split('\n').filter(l => l.trim()).forEach((line) => {
        const wrapped = doc.splitTextToSize(line, pageWidth - 34);
        wrapped.forEach(wl => { doc.text(wl, leftCol + 4, yPos); yPos += 4; });
      });
      yPos += 2;
    }

    doc.setFont('helvetica', 'bold'); doc.text('Peak Attendees:', leftCol, yPos);
    doc.setFont('helvetica', 'normal'); doc.text(resume.peak_attendees || '', leftCol + 30, yPos);
    yPos += lineHeight + 3;

    const profileText = htmlToText(resume.group_profile);
    if (profileText) {
      doc.setFont('helvetica', 'bold'); doc.text('Group Profile:', leftCol, yPos); yPos += lineHeight;
      doc.setFont('helvetica', 'normal');
      profileText.split('\n').filter(l => l.trim()).forEach((line) => {
        const wrapped = doc.splitTextToSize(line, pageWidth - 30);
        wrapped.forEach(wl => { doc.text(wl, leftCol, yPos); yPos += 4; });
      });
      yPos += 3;
    }

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

    // VIP table with photos drawn inside cells via didDrawCell
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
                doc.addImage(
                  vip.photo,
                  'JPEG',
                  data.cell.x + pad,
                  data.cell.y + pad,
                  data.cell.width - pad * 2,
                  data.cell.height - pad * 2
                );
              } catch (e) {}
            }
          }
        }
      });
      yPos = doc.lastAutoTable.finalY + 10;
    }

    if (yPos > 200) { doc.addPage(); yPos = 15; }

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
      billingText.split('\n').filter(l => l.trim()).forEach(line => {
        doc.text(line, leftCol + 5, yPos); yPos += 4;
      });
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

    return doc;
  };

  const handleDownload = () => {
    const doc = generatePDF();
    doc.save(`Group_Resume_${resume.organization?.replace(/\s+/g, '_')}_${resume.arrival_date}.pdf`);
  };

  if (loading) return <div className="loading">Loading resume...</div>;
  if (!resume) return <div>Resume not found</div>;

  const RichField = ({ html }) => (
    <div dangerouslySetInnerHTML={{ __html: html || '' }} style={{ lineHeight: '1.5', fontSize: '14px' }} />
  );

  const vipRows = resume.vip_rows ? JSON.parse(resume.vip_rows) : [];

  return (
    <div className="main-content">
      <div className="page-header">
        <div>
          <h1>{resume.organization || 'Group Resume'}</h1>
          <p>{resume.arrival_date} - {resume.departure_date}</p>
        </div>
        <button className="btn btn-secondary" onClick={onClose}>← Back to List</button>
      </div>

      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <button className="btn btn-success" onClick={handleDownload}>📄 Download PDF</button>
        {canEdit && (
          <button className="btn btn-primary" onClick={() => onEdit(resumeId)}>✏️ Edit Group</button>
        )}
      </div>

      <div className="task-section" style={{ backgroundColor: '#f9f9f9', padding: '30px' }}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          {resume.is_popup && (
            <h2 style={{ backgroundColor: 'yellow', display: 'inline-block', padding: '5px 20px', marginBottom: '10px' }}>POP-UP Resume</h2>
          )}
          <h3>Nashville Marriott at Vanderbilt University</h3>
          <div style={{ backgroundColor: '#404040', color: 'white', padding: '5px', marginTop: '10px' }}>GROUP COVER SHEET</div>
        </div>

        {resume.logo_filename && (
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <img src={`/uploads/group-logos/${resume.logo_filename}`} alt="Group Logo" style={{ maxWidth: '200px', maxHeight: '100px', objectFit: 'contain' }} />
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
          <div><strong>Organization:</strong> {resume.organization}</div>
          <div><strong>Quote #:</strong> {resume.quote_number}</div>
          <div><strong>Post As:</strong> {resume.post_as}</div>
          <div><strong>Departure Date:</strong> {resume.departure_date}</div>
          <div><strong>Arrival Date:</strong> {resume.arrival_date}</div>
        </div>

        <hr />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
          <div><strong>Master Account #:</strong> {resume.master_account}</div>
          <div><strong>Market Code:</strong> {resume.market_code}</div>
          <div><strong>Group Contact:</strong> {resume.group_contact}</div>
          <div><strong>Telephone:</strong> {resume.telephone}</div>
          <div><strong>In-House Contact:</strong> {resume.in_house_contact}</div>
          <div><strong>Email:</strong> {resume.email}</div>
          <div><strong>Sales Manager(s):</strong> {resume.sales_manager}</div>
          <div><strong>Event Manager(s):</strong> {resume.event_manager}</div>
          <div><strong>Reservation Coordinator:</strong> {resume.reservation_coordinator}</div>
          <div><strong>General Accountant:</strong> {resume.general_accountant}</div>
        </div>

        {resume.gold_keys && (
          <div style={{ marginBottom: '15px' }}>
            <strong>Gold Keys:</strong>
            <div style={{ marginTop: '5px', paddingLeft: '10px' }}><RichField html={resume.gold_keys} /></div>
          </div>
        )}

        <div style={{ marginBottom: '15px' }}>
          <strong>Peak Attendees:</strong> {resume.peak_attendees}
        </div>

        {resume.group_profile && (
          <div style={{ marginBottom: '20px' }}>
            <strong>Group Profile:</strong>
            <div style={{ marginTop: '5px' }}><RichField html={resume.group_profile} /></div>
          </div>
        )}

        {vipRows.length > 0 && vipRows.some(v => v.name) && (
          <div style={{ marginTop: '20px', marginBottom: '20px' }}>
            <strong style={{ fontSize: '15px' }}>VIP:</strong>
            <div style={{ overflowX: 'auto', marginTop: '10px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#c8c8c8' }}>
                    {['Photo', 'Name', 'Arrival', 'Departure', 'ETA', 'Room Type', 'Rate', 'Bill Method', 'VIP'].map(h => (
                      <th key={h} style={{ border: '1px solid #999', padding: '6px 8px', textAlign: 'left', fontWeight: 'bold' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {vipRows.map((v, i) => (
                    <tr key={i} style={{ backgroundColor: i % 2 === 0 ? '#fff' : '#f4f4f4' }}>
                      <td style={{ border: '1px solid #ddd', padding: '6px 8px' }}>
                        {v.photo
                          ? <img src={v.photo} alt="VIP" style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '4px' }} />
                          : <span style={{ color: '#aaa' }}>—</span>}
                      </td>
                      <td style={{ border: '1px solid #ddd', padding: '6px 8px', fontWeight: '600' }}>{v.name}</td>
                      <td style={{ border: '1px solid #ddd', padding: '6px 8px' }}>{v.arrival}</td>
                      <td style={{ border: '1px solid #ddd', padding: '6px 8px' }}>{v.departure}</td>
                      <td style={{ border: '1px solid #ddd', padding: '6px 8px' }}>{v.eta}</td>
                      <td style={{ border: '1px solid #ddd', padding: '6px 8px' }}>{v.roomType}</td>
                      <td style={{ border: '1px solid #ddd', padding: '6px 8px' }}>{v.rate}</td>
                      <td style={{ border: '1px solid #ddd', padding: '6px 8px' }}>{v.billMethod}</td>
                      <td style={{ border: '1px solid #ddd', padding: '6px 8px' }}>{v.vipLevel}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <p style={{ textAlign: 'center', color: '#666', marginTop: '30px' }}>
          Click "Download PDF" to see the full formatted resume
        </p>
      </div>
    </div>
  );
}

export default GroupResumeView;
