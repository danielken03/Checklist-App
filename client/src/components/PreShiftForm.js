import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import api from '../api';

function PreShiftForm({ selectedDate, onClose }) {
  const [formData, setFormData] = useState({
    dayOfWeek: '',
    date: '',
    monthlyTraining: '',
    weeklyTraining: '',
    cbkInfo: '',
    gss_itr_wtd: '',
    gss_itr_mtd: '',
    gss_itr_ytd: '',
    gss_elite_wtd: '',
    gss_elite_mtd: '',
    gss_elite_ytd: '',
    gss_staff_wtd: '',
    gss_staff_mtd: '',
    gss_staff_ytd: '',
    gxp_arrivals_am: '',
    gxp_arrivals_pm: '',
    gxp_arrivals_na: '',
    gxp_departures_am: '',
    gxp_departures_pm: '',
    gxp_departures_na: '',
    gxp_stayovers_am: '',
    gxp_stayovers_pm: '',
    gxp_stayovers_na: '',
    gxp_ooo_am: '',
    gxp_ooo_pm: '',
    gxp_ooo_na: '',
    gxp_vr_am: '',
    gxp_vr_pm: '',
    gxp_vr_na: '',
    groupArrivals: Array(8).fill(''),
    inHouseGroups: Array(8).fill(''),
    vipArrivals: '',
    ambassadorArrivals: ''
  });

  useEffect(() => {
    loadFormData();
  }, [selectedDate]);

  const loadFormData = async () => {
    try {
      const data = await api.getPreShiftForm(selectedDate);
      
      // Convert date format
      const [year, month, day] = selectedDate.split('-');
      const dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      const displayDate = dateObj.toLocaleDateString('en-US');
      
      setFormData({
        dayOfWeek: data.day_of_week || dateObj.toLocaleDateString('en-US', { weekday: 'long' }),
        date: displayDate,
        monthlyTraining: data.monthly_training || '',
        weeklyTraining: data.weekly_training || '',
        cbkInfo: data.cbk_info || '',
        gss_itr_wtd: data.gss_itr_wtd || '',
        gss_itr_mtd: data.gss_itr_mtd || '',
        gss_itr_ytd: data.gss_itr_ytd || '',
        gss_elite_wtd: data.gss_elite_wtd || '',
        gss_elite_mtd: data.gss_elite_mtd || '',
        gss_elite_ytd: data.gss_elite_ytd || '',
        gss_staff_wtd: data.gss_staff_wtd || '',
        gss_staff_mtd: data.gss_staff_mtd || '',
        gss_staff_ytd: data.gss_staff_ytd || '',
        gxp_arrivals_am: data.gxp_arrivals_am || '',
        gxp_arrivals_pm: data.gxp_arrivals_pm || '',
        gxp_arrivals_na: data.gxp_arrivals_na || '',
        gxp_departures_am: data.gxp_departures_am || '',
        gxp_departures_pm: data.gxp_departures_pm || '',
        gxp_departures_na: data.gxp_departures_na || '',
        gxp_stayovers_am: data.gxp_stayovers_am || '',
        gxp_stayovers_pm: data.gxp_stayovers_pm || '',
        gxp_stayovers_na: data.gxp_stayovers_na || '',
        gxp_ooo_am: data.gxp_ooo_am || '',
        gxp_ooo_pm: data.gxp_ooo_pm || '',
        gxp_ooo_na: data.gxp_ooo_na || '',
        gxp_vr_am: data.gxp_vr_am || '',
        gxp_vr_pm: data.gxp_vr_pm || '',
        gxp_vr_na: data.gxp_vr_na || '',
        groupArrivals: data.group_arrivals ? JSON.parse(data.group_arrivals) : Array(8).fill(''),
        inHouseGroups: data.in_house_groups ? JSON.parse(data.in_house_groups) : Array(8).fill(''),
        vipArrivals: data.vip_arrivals || '',
        ambassadorArrivals: data.ambassador_arrivals || ''
      });
    } catch (error) {
      console.error('Error loading form data:', error);
    }
  };

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleArrayChange = (arrayName, index, value) => {
    const newArray = [...formData[arrayName]];
    newArray[index] = value;
    setFormData({ ...formData, [arrayName]: newArray });
  };

  const handleSave = async () => {
    try {
      await api.savePreShiftForm(selectedDate, formData);
      alert('Pre-shift form saved successfully!');
    } catch (error) {
      console.error('Error saving form:', error);
      alert('Error saving form. Please try again.');
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF('landscape');
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Title
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Pre-Shift Form', pageWidth / 2, 15, { align: 'center' });
    
    // Day and Date
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Day: ${formData.dayOfWeek}`, 14, 25);
    doc.text(`Date: ${formData.date}`, pageWidth - 14, 25, { align: 'right' });
    
    let yPos = 35;
    
    // Training Topics and CBK Info with borders
    const boxHeight = 10;
    const boxWidth = 85;
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    
    doc.rect(14, yPos - 3, boxWidth, boxHeight);
    doc.text('Monthly Training:', 16, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(formData.monthlyTraining || '', 16, yPos + 5);
    
    doc.setFont('helvetica', 'bold');
    doc.rect(14 + boxWidth + 5, yPos - 3, boxWidth, boxHeight);
    doc.text('Weekly Training:', 16 + boxWidth + 5, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(formData.weeklyTraining || '', 16 + boxWidth + 5, yPos + 5);
    
    doc.setFont('helvetica', 'bold');
    doc.rect(14 + (boxWidth + 5) * 2, yPos - 3, boxWidth, boxHeight);
    doc.text('CBK Info:', 16 + (boxWidth + 5) * 2, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(formData.cbkInfo || '', 16 + (boxWidth + 5) * 2, yPos + 5);
    
    yPos += 18;
    
    // GSS Results Table
    autoTable(doc, {
      startY: yPos,
      head: [['GSS Results', 'WTD', 'MTD', 'YTD']],
      body: [
        ['ITR', formData.gss_itr_wtd, formData.gss_itr_mtd, formData.gss_itr_ytd],
        ['Elite', formData.gss_elite_wtd, formData.gss_elite_mtd, formData.gss_elite_ytd],
        ['Staff', formData.gss_staff_wtd, formData.gss_staff_mtd, formData.gss_staff_ytd]
      ],
      margin: { left: 14, right: pageWidth / 2 + 5 },
      styles: { 
        fontSize: 8, 
        cellPadding: 2,
        lineColor: [0, 0, 0],
        lineWidth: 0.1
      },
      headStyles: { 
        fillColor: [52, 73, 94], 
        halign: 'center',
        lineColor: [0, 0, 0],
        lineWidth: 0.1
      },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 30 }
      },
      theme: 'grid'
    });
    
    // GXP Stats Table
    autoTable(doc, {
      startY: yPos,
      head: [['GXP Stats', 'AM', 'PM', 'NA']],
      body: [
        ['Arrivals', formData.gxp_arrivals_am, formData.gxp_arrivals_pm, formData.gxp_arrivals_na],
        ['Departures', formData.gxp_departures_am, formData.gxp_departures_pm, formData.gxp_departures_na],
        ['Stayovers', formData.gxp_stayovers_am, formData.gxp_stayovers_pm, formData.gxp_stayovers_na],
        ['OOO Rooms', formData.gxp_ooo_am, formData.gxp_ooo_pm, formData.gxp_ooo_na],
        ['VR Rooms', formData.gxp_vr_am, formData.gxp_vr_pm, formData.gxp_vr_na]
      ],
      margin: { left: pageWidth / 2 + 5, right: 14 },
      styles: { 
        fontSize: 8, 
        cellPadding: 2,
        lineColor: [0, 0, 0],
        lineWidth: 0.1
      },
      headStyles: { 
        fillColor: [52, 73, 94], 
        halign: 'center',
        lineColor: [0, 0, 0],
        lineWidth: 0.1
      },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 30 }
      },
      theme: 'grid'
    });
    
    yPos = doc.lastAutoTable.finalY + 10;
    
    // Group Arrivals Table
    const groupArrivalsRows = [];
    for (let i = 0; i < 4; i++) {
      groupArrivalsRows.push([
        formData.groupArrivals[i] || '',
        formData.groupArrivals[i + 4] || ''
      ]);
    }
    
    autoTable(doc, {
      startY: yPos,
      head: [['Group Arrivals', '']],
      body: groupArrivalsRows,
      margin: { left: 14, right: pageWidth / 2 + 5 },
      styles: { 
        fontSize: 8, 
        cellPadding: 2,
        lineColor: [0, 0, 0],
        lineWidth: 0.1
      },
      headStyles: { 
        fillColor: [52, 73, 94], 
        halign: 'center',
        lineColor: [0, 0, 0],
        lineWidth: 0.1
      },
      theme: 'grid'
    });
    
    // In House Groups Table
    const inHouseRows = [];
    for (let i = 0; i < 4; i++) {
      inHouseRows.push([
        formData.inHouseGroups[i] || '',
        formData.inHouseGroups[i + 4] || ''
      ]);
    }
    
    autoTable(doc, {
      startY: yPos,
      head: [['In House Groups', '']],
      body: inHouseRows,
      margin: { left: pageWidth / 2 + 5, right: 14 },
      styles: { 
        fontSize: 8, 
        cellPadding: 2,
        lineColor: [0, 0, 0],
        lineWidth: 0.1
      },
      headStyles: { 
        fillColor: [52, 73, 94], 
        halign: 'center',
        lineColor: [0, 0, 0],
        lineWidth: 0.1
      },
      theme: 'grid'
    });
    
    yPos = doc.lastAutoTable.finalY + 10;
    
    // VIP Arrivals box
    const vipBoxHeight = 25;
    const vipBoxWidth = (pageWidth - 28 - 5) / 2;
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.rect(14, yPos - 3, vipBoxWidth, vipBoxHeight);
    doc.text('VIP Arrivals:', 16, yPos);
    doc.setFont('helvetica', 'normal');
    const vipLines = doc.splitTextToSize(formData.vipArrivals || '', vipBoxWidth - 4);
    doc.text(vipLines, 16, yPos + 5);
    
    doc.setFont('helvetica', 'bold');
    doc.rect(pageWidth / 2 + 5, yPos - 3, vipBoxWidth, vipBoxHeight);
    doc.text('Ambassador Arrivals:', pageWidth / 2 + 7, yPos);
    doc.setFont('helvetica', 'normal');
    const ambassadorLines = doc.splitTextToSize(formData.ambassadorArrivals || '', vipBoxWidth - 4);
    doc.text(ambassadorLines, pageWidth / 2 + 7, yPos + 5);
    
    return doc;
  };

  const handleDownload = () => {
    const doc = generatePDF();
    doc.save(`PreShift_${formData.date.replace(/\//g, '-')}.pdf`);
  };

  return (
    <div className="main-content">
      <div className="page-header">
        <div>
          <h1>Pre-Shift Form - {formData.date}</h1>
          <p>Fill out the daily pre-shift information</p>
        </div>
        <button className="btn btn-secondary" onClick={onClose}>
          ← Back to Calendar
        </button>
      </div>

      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <button className="btn btn-primary" onClick={handleSave}>
          💾 Save Form
        </button>
        <button className="btn btn-success" onClick={handleDownload}>
          📄 Download PDF
        </button>
      </div>

      <div className="task-section">
        {/* Day and Date - Read only */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
          <div className="form-group">
            <label>Day of Week</label>
            <input
              type="text"
              className="form-control"
              value={formData.dayOfWeek}
              readOnly
              style={{ backgroundColor: '#f5f5f5' }}
            />
          </div>
          <div className="form-group">
            <label>Date </label>
            <input
              type="text"
              className="form-control"
              value={formData.date}
              readOnly
              style={{ backgroundColor: '#f5f5f5' }}
            />
          </div>
        </div>

        {/* Training Topics and CBK Info */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '20px' }}>
          <div className="form-group">
            <label>Monthly Training Topic</label>
            <input
              type="text"
              className="form-control"
              value={formData.monthlyTraining}
              onChange={(e) => handleChange('monthlyTraining', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Weekly Training Topic</label>
            <input
              type="text"
              className="form-control"
              value={formData.weeklyTraining}
              onChange={(e) => handleChange('weeklyTraining', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>CBK Info</label>
            <input
              type="text"
              className="form-control"
              value={formData.cbkInfo}
              onChange={(e) => handleChange('cbkInfo', e.target.value)}
            />
          </div>
        </div>

        {/* Tables Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
          {/* GSS Results Table */}
          <div>
            <h3 style={{ marginBottom: '10px' }}>GSS Results</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#34495e', color: 'white' }}>
                  <th style={{ border: '1px solid #ddd', padding: '8px' }}></th>
                  <th style={{ border: '1px solid #ddd', padding: '8px' }}>WTD</th>
                  <th style={{ border: '1px solid #ddd', padding: '8px' }}>MTD</th>
                  <th style={{ border: '1px solid #ddd', padding: '8px' }}>YTD</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ border: '1px solid #ddd', padding: '8px', fontWeight: 'bold' }}>ITR</td>
                  <td style={{ border: '1px solid #ddd', padding: '4px' }}>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.gss_itr_wtd}
                      onChange={(e) => handleChange('gss_itr_wtd', e.target.value)}
                      style={{ margin: 0 }}
                    />
                  </td>
                  <td style={{ border: '1px solid #ddd', padding: '4px' }}>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.gss_itr_mtd}
                      onChange={(e) => handleChange('gss_itr_mtd', e.target.value)}
                      style={{ margin: 0 }}
                    />
                  </td>
                  <td style={{ border: '1px solid #ddd', padding: '4px' }}>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.gss_itr_ytd}
                      onChange={(e) => handleChange('gss_itr_ytd', e.target.value)}
                      style={{ margin: 0 }}
                    />
                  </td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #ddd', padding: '8px', fontWeight: 'bold' }}>Elite</td>
                  <td style={{ border: '1px solid #ddd', padding: '4px' }}>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.gss_elite_wtd}
                      onChange={(e) => handleChange('gss_elite_wtd', e.target.value)}
                      style={{ margin: 0 }}
                    />
                  </td>
                  <td style={{ border: '1px solid #ddd', padding: '4px' }}>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.gss_elite_mtd}
                      onChange={(e) => handleChange('gss_elite_mtd', e.target.value)}
                      style={{ margin: 0 }}
                    />
                  </td>
                  <td style={{ border: '1px solid #ddd', padding: '4px' }}>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.gss_elite_ytd}
                      onChange={(e) => handleChange('gss_elite_ytd', e.target.value)}
                      style={{ margin: 0 }}
                    />
                  </td>
                </tr>
                <tr>
                  <td style={{ border: '1px solid #ddd', padding: '8px', fontWeight: 'bold' }}>Staff</td>
                  <td style={{ border: '1px solid #ddd', padding: '4px' }}>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.gss_staff_wtd}
                      onChange={(e) => handleChange('gss_staff_wtd', e.target.value)}
                      style={{ margin: 0 }}
                    />
                  </td>
                  <td style={{ border: '1px solid #ddd', padding: '4px' }}>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.gss_staff_mtd}
                      onChange={(e) => handleChange('gss_staff_mtd', e.target.value)}
                      style={{ margin: 0 }}
                    />
                  </td>
                  <td style={{ border: '1px solid #ddd', padding: '4px' }}>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.gss_staff_ytd}
                      onChange={(e) => handleChange('gss_staff_ytd', e.target.value)}
                      style={{ margin: 0 }}
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* GXP Stats Table */}
          <div>
            <h3 style={{ marginBottom: '10px' }}>GXP Stats</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#34495e', color: 'white' }}>
                  <th style={{ border: '1px solid #ddd', padding: '8px' }}></th>
                  <th style={{ border: '1px solid #ddd', padding: '8px' }}>AM</th>
                  <th style={{ border: '1px solid #ddd', padding: '8px' }}>PM</th>
                  <th style={{ border: '1px solid #ddd', padding: '8px' }}>NA</th>
                </tr>
              </thead>
              <tbody>
                {['arrivals', 'departures', 'stayovers', 'ooo', 'vr'].map((type) => (
                  <tr key={type}>
                    <td style={{ border: '1px solid #ddd', padding: '8px', fontWeight: 'bold' }}>
                      {type === 'ooo' ? 'OOO Rooms' : type === 'vr' ? 'VR Rooms' : type.charAt(0).toUpperCase() + type.slice(1)}
                    </td>
                    <td style={{ border: '1px solid #ddd', padding: '4px' }}>
                      <input
                        type="text"
                        className="form-control"
                        value={formData[`gxp_${type}_am`]}
                        onChange={(e) => handleChange(`gxp_${type}_am`, e.target.value)}
                        style={{ margin: 0 }}
                      />
                    </td>
                    <td style={{ border: '1px solid #ddd', padding: '4px' }}>
                      <input
                        type="text"
                        className="form-control"
                        value={formData[`gxp_${type}_pm`]}
                        onChange={(e) => handleChange(`gxp_${type}_pm`, e.target.value)}
                        style={{ margin: 0 }}
                      />
                    </td>
                    <td style={{ border: '1px solid #ddd', padding: '4px' }}>
                      <input
                        type="text"
                        className="form-control"
                        value={formData[`gxp_${type}_na`]}
                        onChange={(e) => handleChange(`gxp_${type}_na`, e.target.value)}
                        style={{ margin: 0 }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Group Tables */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
          {/* Group Arrivals */}
          <div>
            <h3 style={{ marginBottom: '10px' }}>Group Arrivals</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                {[0, 1, 2, 3].map((row) => (
                  <tr key={row}>
                    <td style={{ border: '1px solid #ddd', padding: '4px' }}>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.groupArrivals[row]}
                        onChange={(e) => handleArrayChange('groupArrivals', row, e.target.value)}
                        style={{ margin: 0 }}
                      />
                    </td>
                    <td style={{ border: '1px solid #ddd', padding: '4px' }}>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.groupArrivals[row + 4]}
                        onChange={(e) => handleArrayChange('groupArrivals', row + 4, e.target.value)}
                        style={{ margin: 0 }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* In House Groups */}
          <div>
            <h3 style={{ marginBottom: '10px' }}>In House Groups</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                {[0, 1, 2, 3].map((row) => (
                  <tr key={row}>
                    <td style={{ border: '1px solid #ddd', padding: '4px' }}>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.inHouseGroups[row]}
                        onChange={(e) => handleArrayChange('inHouseGroups', row, e.target.value)}
                        style={{ margin: 0 }}
                      />
                    </td>
                    <td style={{ border: '1px solid #ddd', padding: '4px' }}>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.inHouseGroups[row + 4]}
                        onChange={(e) => handleArrayChange('inHouseGroups', row + 4, e.target.value)}
                        style={{ margin: 0 }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* VIP and Ambassador Arrivals */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div className="form-group">
            <label>VIP Arrivals</label>
            <textarea
              className="form-control"
              value={formData.vipArrivals}
              onChange={(e) => handleChange('vipArrivals', e.target.value)}
              rows="4"
            />
          </div>
          <div className="form-group">
            <label>Ambassador Arrivals</label>
            <textarea
              className="form-control"
              value={formData.ambassadorArrivals}
              onChange={(e) => handleChange('ambassadorArrivals', e.target.value)}
              rows="4"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default PreShiftForm;
