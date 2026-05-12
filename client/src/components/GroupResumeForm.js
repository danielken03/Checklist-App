import React, { useState, useEffect, useRef } from 'react';
import api from '../api';

function RichTextEditor({ value, onChange, placeholder, minHeight = '120px' }) {
  const editorRef = useRef(null);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== (value || '')) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  const exec = (cmd, val = null) => {
    editorRef.current.focus();
    document.execCommand(cmd, false, val);
    onChange(editorRef.current.innerHTML);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      exec(e.shiftKey ? 'outdent' : 'indent');
    }
  };

  const toolbarBtn = (label, cmd, title = '') => (
    <button
      type="button"
      title={title || label}
      onMouseDown={(e) => { e.preventDefault(); exec(cmd); }}
      style={{ padding: '3px 8px', border: '1px solid #ccc', borderRadius: '3px', background: '#fff', cursor: 'pointer', fontSize: '13px', fontWeight: cmd === 'bold' ? 'bold' : 'normal', fontStyle: cmd === 'italic' ? 'italic' : 'normal', textDecoration: cmd === 'underline' ? 'underline' : 'none', minWidth: '28px' }}
    >
      {label}
    </button>
  );

  return (
    <div style={{ border: '1px solid #ccc', borderRadius: '4px', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 8px', background: '#f0f0f0', borderBottom: '1px solid #ccc', flexWrap: 'wrap' }}>
        {toolbarBtn('B', 'bold', 'Bold')}
        {toolbarBtn('I', 'italic', 'Italic')}
        {toolbarBtn('U', 'underline', 'Underline')}
        <span style={{ width: '1px', height: '20px', background: '#ccc', margin: '0 2px' }} />
        <button type="button" title="Bullet List" onMouseDown={(e) => { e.preventDefault(); exec('insertUnorderedList'); }} style={{ padding: '3px 8px', border: '1px solid #ccc', borderRadius: '3px', background: '#fff', cursor: 'pointer', fontSize: '13px' }}>• List</button>
        <button type="button" title="Numbered List" onMouseDown={(e) => { e.preventDefault(); exec('insertOrderedList'); }} style={{ padding: '3px 8px', border: '1px solid #ccc', borderRadius: '3px', background: '#fff', cursor: 'pointer', fontSize: '13px' }}>1. List</button>
        <span style={{ width: '1px', height: '20px', background: '#ccc', margin: '0 2px' }} />
        <button type="button" title="Indent (Tab)" onMouseDown={(e) => { e.preventDefault(); exec('indent'); }} style={{ padding: '3px 8px', border: '1px solid #ccc', borderRadius: '3px', background: '#fff', cursor: 'pointer', fontSize: '13px' }}>→</button>
        <button type="button" title="Outdent (Shift+Tab)" onMouseDown={(e) => { e.preventDefault(); exec('outdent'); }} style={{ padding: '3px 8px', border: '1px solid #ccc', borderRadius: '3px', background: '#fff', cursor: 'pointer', fontSize: '13px' }}>←</button>
        <span style={{ width: '1px', height: '20px', background: '#ccc', margin: '0 2px' }} />
        <select title="Font Size" onChange={(e) => { if (e.target.value) { exec('fontSize', e.target.value); e.target.value = ''; } }} defaultValue="" style={{ padding: '3px 5px', border: '1px solid #ccc', borderRadius: '3px', background: '#fff', cursor: 'pointer', fontSize: '12px' }}>
          <option value="" disabled>Size</option>
          <option value="1">Small</option>
          <option value="3">Normal</option>
          <option value="4">Large</option>
          <option value="5">X-Large</option>
        </select>
        <span style={{ width: '1px', height: '20px', background: '#ccc', margin: '0 2px' }} />
        <button type="button" title="Clear Formatting" onMouseDown={(e) => { e.preventDefault(); exec('removeFormat'); }} style={{ padding: '3px 8px', border: '1px solid #ccc', borderRadius: '3px', background: '#fff', cursor: 'pointer', fontSize: '11px', color: '#666' }}>Clear</button>
      </div>
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={() => onChange(editorRef.current.innerHTML)}
        onKeyDown={handleKeyDown}
        style={{ minHeight, padding: '10px', outline: 'none', fontSize: '14px', lineHeight: '1.5', background: '#fff', overflowY: 'auto' }}
        onFocus={(e) => e.currentTarget.style.outline = '2px solid #4a9eff'}
        onBlur={(e) => e.currentTarget.style.outline = 'none'}
      />
      <style>{`
        [contenteditable] ul { padding-left: 20px; margin: 4px 0; }
        [contenteditable] ol { padding-left: 20px; margin: 4px 0; }
        [contenteditable] li { margin: 2px 0; }
      `}</style>
    </div>
  );
}

const toHtml = (text) => {
  if (!text) return '';
  if (/<[a-z][\s\S]*>/i.test(text)) return text;
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>');
};

const emptyVipRow = () => ({ name: '', photo: null, arrival: '', departure: '', eta: '', roomType: '', rate: '', billMethod: '', vipLevel: '' });

function GroupResumeForm({ selectedDate, resumeId, onClose }) {
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [formData, setFormData] = useState({
    resumeDate: selectedDate,
    isPopup: false,
    organization: '', postAs: '', quoteNumber: '', arrivalDate: '', departureDate: '',
    masterAccount: '', marketCode: '', groupContact: '', telephone: '',
    inHouseContact: '', email: '', salesManager: '', eventManager: '',
    reservationCoordinator: '', generalAccountant: '',
    goldKeys: '', peakAttendees: '', groupProfile: '',
    roomBlockRows: [{ date: '', day: '', roomBlock: '', contracted: '', projected: '', pickedUp: '' }],
    reservationMethodRows: [{ roomBlock: '', billingMethod: '', reservationMethod: '', reservationType: '', preRegistration: '', preKey: '' }],
    ratesRows: [{ roomBlock: '', startDate: '', endDate: '', roomType: '', roomOccupancy: '', negotiatedRate: '' }],
    vipRows: [emptyVipRow()],
    paymentMethod: '', directBillApproved: '', masterAccountBilling: '',
    authorizedSigners: '', billingAddress: '', commission: '',
    intermediaryAccount: '', intermediaryId: '',
    frontdesk: '', bellstand: '', concierge: '', garageValet: '',
    outletInformation: '', housekeeping: '', cateringBanquets: '',
    audioVisual: '', shippingReceiving: '', accounting: '',
    guestList: [{ title: '', firstName: '', lastName: '', email: '', arrivalDate: '', departureDate: '', confirmationNumber: '' }]
  });

  useEffect(() => { if (resumeId) loadResume(); }, [resumeId]);

  const loadResume = async () => {
    try {
      const data = await api.getGroupResume(resumeId);
      setFormData({
        resumeDate: data.resume_date,
        isPopup: data.is_popup === 1,
        organization: data.organization || '', postAs: data.post_as || '',
        quoteNumber: data.quote_number || '', arrivalDate: data.arrival_date || '',
        departureDate: data.departure_date || '', masterAccount: data.master_account || '',
        marketCode: data.market_code || '', groupContact: data.group_contact || '',
        telephone: data.telephone || '', inHouseContact: data.in_house_contact || '',
        email: data.email || '', salesManager: data.sales_manager || '',
        eventManager: data.event_manager || '',
        reservationCoordinator: data.reservation_coordinator || '',
        generalAccountant: data.general_accountant || '',
        goldKeys: toHtml(data.gold_keys || ''), peakAttendees: data.peak_attendees || '',
        groupProfile: toHtml(data.group_profile || ''),
        roomBlockRows: data.room_block_rows ? JSON.parse(data.room_block_rows) : [{ date: '', day: '', roomBlock: '', contracted: '', projected: '', pickedUp: '' }],
        reservationMethodRows: data.reservation_method_rows ? JSON.parse(data.reservation_method_rows) : [{ roomBlock: '', billingMethod: '', reservationMethod: '', reservationType: '', preRegistration: '', preKey: '' }],
        ratesRows: data.rates_rows ? JSON.parse(data.rates_rows) : [{ roomBlock: '', startDate: '', endDate: '', roomType: '', roomOccupancy: '', negotiatedRate: '' }],
        vipRows: data.vip_rows ? JSON.parse(data.vip_rows) : [emptyVipRow()],
        paymentMethod: data.payment_method || '', directBillApproved: data.direct_bill_approved || '',
        masterAccountBilling: data.master_account_billing || '',
        authorizedSigners: data.authorized_signers || '',
        billingAddress: toHtml(data.billing_address || ''),
        commission: data.commission || '', intermediaryAccount: data.intermediary_account || '',
        intermediaryId: data.intermediary_id || '',
        frontdesk: toHtml(data.frontdesk || ''), bellstand: toHtml(data.bellstand || ''),
        concierge: toHtml(data.concierge || ''), garageValet: toHtml(data.garage_valet || ''),
        outletInformation: toHtml(data.outlet_information || ''),
        housekeeping: toHtml(data.housekeeping || ''),
        cateringBanquets: toHtml(data.catering_banquets || ''),
        audioVisual: toHtml(data.audio_visual || ''),
        shippingReceiving: toHtml(data.shipping_receiving || ''),
        accounting: toHtml(data.accounting || ''),
        guestList: data.guest_list ? JSON.parse(data.guest_list) : [{ title: '', firstName: '', lastName: '', email: '', arrivalDate: '', departureDate: '', confirmationNumber: '' }]
      });
      if (data.logo_filename) setLogoPreview(`/uploads/group-logos/${data.logo_filename}`);
    } catch (error) { console.error('Error loading resume:', error); }
  };

  const handleChange = (field, value) => setFormData({ ...formData, [field]: value });

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleArrayChange = (arrayName, index, field, value) => {
    const newArray = [...formData[arrayName]];
    newArray[index][field] = value;
    setFormData({ ...formData, [arrayName]: newArray });
  };

  const handleVipPhotoChange = (index, e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const newRows = [...formData.vipRows];
      newRows[index].photo = reader.result; // store as base64
      setFormData({ ...formData, vipRows: newRows });
    };
    reader.readAsDataURL(file);
  };

  const addRow = (arrayName, template) => setFormData({ ...formData, [arrayName]: [...formData[arrayName], template] });
  const removeRow = (arrayName, index) => {
    if (formData[arrayName].length > 1)
      setFormData({ ...formData, [arrayName]: formData[arrayName].filter((_, i) => i !== index) });
  };

  const handleSave = async () => {
    try {
      if (resumeId) {
        await api.updateGroupResume(resumeId, formData, logoFile);
        alert('Group resume updated successfully!');
      } else {
        await api.createGroupResume(formData, logoFile);
        alert('Group resume created successfully!');
      }
      onClose();
    } catch (error) {
      console.error('Error saving:', error);
      alert('Error saving group resume. Please try again.');
    }
  };

  const dateObj = new Date(selectedDate + 'T00:00:00');
  const displayDate = dateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <div className="main-content">
      <div className="page-header">
        <div>
          <h1>{resumeId ? 'Edit' : 'Create'} Group Resume - {displayDate}</h1>
          <p>Complete all required information</p>
        </div>
        <button className="btn btn-secondary" onClick={onClose}>← Back to List</button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <button className="btn btn-primary" onClick={handleSave}>💾 Save Group Resume</button>
      </div>

      <div className="task-section">
        {/* Logo */}
        <h3 style={{ marginBottom: '15px' }}>Group Logo</h3>
        <div style={{ marginBottom: '30px' }}>
          <input type="file" accept="image/*" onChange={handleLogoChange} style={{ marginBottom: '10px' }} />
          {logoPreview && <img src={logoPreview} alt="Logo Preview" style={{ maxWidth: '200px', maxHeight: '100px', objectFit: 'contain', marginTop: '10px' }} />}
        </div>

        {/* Pop-Up Toggle */}
        <div style={{ marginBottom: '30px', padding: '15px', backgroundColor: '#fff3cd', borderRadius: '8px', border: '2px solid #ffc107' }}>
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: '16px', fontWeight: '600' }}>
            <input type="checkbox" checked={formData.isPopup} onChange={(e) => handleChange('isPopup', e.target.checked)} style={{ marginRight: '10px', width: '20px', height: '20px' }} />
            This is a POP-UP Group
          </label>
          <p style={{ margin: '10px 0 0 30px', fontSize: '13px', color: '#856404' }}>Check this box if this group should display "POP-UP Resume" at the top of the PDF</p>
        </div>

        {/* Group Information */}
        <h3 style={{ marginBottom: '15px' }}>Group Information</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
          <div className="form-group"><label>Organization</label><input type="text" className="form-control" value={formData.organization} onChange={(e) => handleChange('organization', e.target.value)} /></div>
          <div className="form-group"><label>Post As</label><input type="text" className="form-control" value={formData.postAs} onChange={(e) => handleChange('postAs', e.target.value)} /></div>
          <div className="form-group"><label>Quote #</label><input type="text" className="form-control" value={formData.quoteNumber} onChange={(e) => handleChange('quoteNumber', e.target.value)} /></div>
          <div className="form-group"><label>Arrival Date</label><input type="date" className="form-control" value={formData.arrivalDate} onChange={(e) => handleChange('arrivalDate', e.target.value)} /></div>
          <div className="form-group"><label>Departure Date</label><input type="date" className="form-control" value={formData.departureDate} onChange={(e) => handleChange('departureDate', e.target.value)} /></div>
        </div>

        {/* Contact Information */}
        <h3 style={{ marginBottom: '15px' }}>Contact Information</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
          <div className="form-group"><label>Master Account #</label><input type="text" className="form-control" value={formData.masterAccount} onChange={(e) => handleChange('masterAccount', e.target.value)} /></div>
          <div className="form-group"><label>Market Code</label><input type="text" className="form-control" value={formData.marketCode} onChange={(e) => handleChange('marketCode', e.target.value)} /></div>
          <div className="form-group"><label>Group Contact</label><input type="text" className="form-control" value={formData.groupContact} onChange={(e) => handleChange('groupContact', e.target.value)} /></div>
          <div className="form-group"><label>Telephone</label><input type="text" className="form-control" value={formData.telephone} onChange={(e) => handleChange('telephone', e.target.value)} /></div>
          <div className="form-group"><label>In-House Contact</label><input type="text" className="form-control" value={formData.inHouseContact} onChange={(e) => handleChange('inHouseContact', e.target.value)} /></div>
          <div className="form-group"><label>Email</label><input type="email" className="form-control" value={formData.email} onChange={(e) => handleChange('email', e.target.value)} /></div>
          <div className="form-group"><label>Sales Manager(s)</label><input type="text" className="form-control" value={formData.salesManager} onChange={(e) => handleChange('salesManager', e.target.value)} /></div>
          <div className="form-group"><label>Event Manager(s)</label><input type="text" className="form-control" value={formData.eventManager} onChange={(e) => handleChange('eventManager', e.target.value)} /></div>
          <div className="form-group"><label>Reservation Coordinator</label><input type="text" className="form-control" value={formData.reservationCoordinator} onChange={(e) => handleChange('reservationCoordinator', e.target.value)} /></div>
          <div className="form-group"><label>General Accountant</label><input type="text" className="form-control" value={formData.generalAccountant} onChange={(e) => handleChange('generalAccountant', e.target.value)} /></div>
        </div>

        {/* Gold Keys & Profile */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
          <div className="form-group">
            <label style={{ display: 'block', marginBottom: '6px' }}>Gold Keys</label>
            <RichTextEditor value={formData.goldKeys} onChange={(val) => handleChange('goldKeys', val)} placeholder="Add gold key items..." minHeight="100px" />
          </div>
          <div className="form-group">
            <label>Peak Attendees</label>
            <input type="text" className="form-control" value={formData.peakAttendees} onChange={(e) => handleChange('peakAttendees', e.target.value)} />
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: '30px' }}>
          <label style={{ display: 'block', marginBottom: '6px' }}>Group Profile</label>
          <RichTextEditor value={formData.groupProfile} onChange={(val) => handleChange('groupProfile', val)} placeholder="Enter group profile..." minHeight="100px" />
        </div>

        {/* Room Block */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h3>Group Room Block</h3>
          <button className="btn btn-primary" onClick={() => addRow('roomBlockRows', { date: '', day: '', roomBlock: '', contracted: '', projected: '', pickedUp: '' })}>+ Add Row</button>
        </div>
        {formData.roomBlockRows.map((row, index) => (
          <div key={index} style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '15px', marginBottom: '15px', backgroundColor: '#f9f9f9' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <h4>Row #{index + 1}</h4>
              <button className="btn" onClick={() => removeRow('roomBlockRows', index)} style={{ backgroundColor: '#e74c3c', color: 'white', padding: '5px 10px' }}>Remove</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '10px' }}>
              <div className="form-group"><label>Date</label><input type="date" className="form-control" value={row.date} onChange={(e) => handleArrayChange('roomBlockRows', index, 'date', e.target.value)} /></div>
              <div className="form-group"><label>Day</label><input type="text" className="form-control" value={row.day} onChange={(e) => handleArrayChange('roomBlockRows', index, 'day', e.target.value)} placeholder="Monday" /></div>
              <div className="form-group"><label>Room Block</label><input type="text" className="form-control" value={row.roomBlock} onChange={(e) => handleArrayChange('roomBlockRows', index, 'roomBlock', e.target.value)} /></div>
              <div className="form-group"><label>Contracted</label><input type="text" className="form-control" value={row.contracted} onChange={(e) => handleArrayChange('roomBlockRows', index, 'contracted', e.target.value)} /></div>
              <div className="form-group"><label>Projected</label><input type="text" className="form-control" value={row.projected} onChange={(e) => handleArrayChange('roomBlockRows', index, 'projected', e.target.value)} /></div>
              <div className="form-group"><label>Picked Up</label><input type="text" className="form-control" value={row.pickedUp} onChange={(e) => handleArrayChange('roomBlockRows', index, 'pickedUp', e.target.value)} /></div>
            </div>
          </div>
        ))}

        {/* Reservation Method */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', marginTop: '30px' }}>
          <h3>Reservation Method</h3>
          <button className="btn btn-primary" onClick={() => addRow('reservationMethodRows', { roomBlock: '', billingMethod: '', reservationMethod: '', reservationType: '', preRegistration: '', preKey: '' })}>+ Add Row</button>
        </div>
        {formData.reservationMethodRows.map((row, index) => (
          <div key={index} style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '15px', marginBottom: '15px', backgroundColor: '#f9f9f9' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <h4>Row #{index + 1}</h4>
              <button className="btn" onClick={() => removeRow('reservationMethodRows', index)} style={{ backgroundColor: '#e74c3c', color: 'white', padding: '5px 10px' }}>Remove</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              <div className="form-group"><label>Room Block</label><input type="text" className="form-control" value={row.roomBlock} onChange={(e) => handleArrayChange('reservationMethodRows', index, 'roomBlock', e.target.value)} /></div>
              <div className="form-group"><label>Billing Method</label><input type="text" className="form-control" value={row.billingMethod} onChange={(e) => handleArrayChange('reservationMethodRows', index, 'billingMethod', e.target.value)} /></div>
              <div className="form-group"><label>Reservation Method</label><input type="text" className="form-control" value={row.reservationMethod} onChange={(e) => handleArrayChange('reservationMethodRows', index, 'reservationMethod', e.target.value)} /></div>
              <div className="form-group"><label>Reservation Type</label><input type="text" className="form-control" value={row.reservationType} onChange={(e) => handleArrayChange('reservationMethodRows', index, 'reservationType', e.target.value)} /></div>
              <div className="form-group"><label>Pre-Registration</label><input type="text" className="form-control" value={row.preRegistration} onChange={(e) => handleArrayChange('reservationMethodRows', index, 'preRegistration', e.target.value)} /></div>
              <div className="form-group"><label>Pre-Key</label><input type="text" className="form-control" value={row.preKey} onChange={(e) => handleArrayChange('reservationMethodRows', index, 'preKey', e.target.value)} /></div>
            </div>
          </div>
        ))}

        {/* Rates */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', marginTop: '30px' }}>
          <h3>Rates</h3>
          <button className="btn btn-primary" onClick={() => addRow('ratesRows', { roomBlock: '', startDate: '', endDate: '', roomType: '', roomOccupancy: '', negotiatedRate: '' })}>+ Add Row</button>
        </div>
        {formData.ratesRows.map((row, index) => (
          <div key={index} style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '15px', marginBottom: '15px', backgroundColor: '#f9f9f9' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <h4>Row #{index + 1}</h4>
              <button className="btn" onClick={() => removeRow('ratesRows', index)} style={{ backgroundColor: '#e74c3c', color: 'white', padding: '5px 10px' }}>Remove</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              <div className="form-group"><label>Room Block</label><input type="text" className="form-control" value={row.roomBlock} onChange={(e) => handleArrayChange('ratesRows', index, 'roomBlock', e.target.value)} /></div>
              <div className="form-group"><label>Start Date</label><input type="date" className="form-control" value={row.startDate} onChange={(e) => handleArrayChange('ratesRows', index, 'startDate', e.target.value)} /></div>
              <div className="form-group"><label>End Date</label><input type="date" className="form-control" value={row.endDate} onChange={(e) => handleArrayChange('ratesRows', index, 'endDate', e.target.value)} /></div>
              <div className="form-group"><label>Room Type</label><select className="form-control" value={row.roomType} onChange={(e) => handleArrayChange('ratesRows', index, 'roomType', e.target.value)}><option value="">-- Select Room Type --</option><option>Standard King</option><option>Standard Double</option><option>Parthenon King</option><option>Parthenon Double</option><option>Stadium King</option><option>Stadium Double</option><option>Concierge King</option><option>Concierge Double</option><option>One Bedroom Deluxe Suite</option><option>Run Of House</option></select></div>
              <div className="form-group"><label>Room Occupancy</label><input type="text" className="form-control" value={row.roomOccupancy} onChange={(e) => handleArrayChange('ratesRows', index, 'roomOccupancy', e.target.value)} /></div>
              <div className="form-group"><label>Negotiated Rate</label><input type="text" className="form-control" value={row.negotiatedRate} onChange={(e) => handleArrayChange('ratesRows', index, 'negotiatedRate', e.target.value)} placeholder="$219.00" /></div>
            </div>
          </div>
        ))}

        {/* VIP Table */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', marginTop: '30px' }}>
          <h3>VIP</h3>
          <button className="btn btn-primary" onClick={() => addRow('vipRows', emptyVipRow())}>+ Add VIP</button>
        </div>
        {formData.vipRows.map((row, index) => (
          <div key={index} style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '15px', marginBottom: '15px', backgroundColor: '#f9f9f9' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
              <h4>VIP #{index + 1}</h4>
              <button className="btn" onClick={() => removeRow('vipRows', index)} style={{ backgroundColor: '#e74c3c', color: 'white', padding: '5px 10px' }}>Remove</button>
            </div>

            {/* Name + Photo row */}
            <div style={{ display: 'flex', gap: '20px', marginBottom: '15px', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <div className="form-group">
                  <label>Name</label>
                  <input type="text" className="form-control" value={row.name} onChange={(e) => handleArrayChange('vipRows', index, 'name', e.target.value)} placeholder="Full name" />
                </div>
                <div className="form-group" style={{ marginTop: '10px' }}>
                  <label>Photo</label>
                  <input type="file" accept="image/*" onChange={(e) => handleVipPhotoChange(index, e)} style={{ display: 'block' }} />
                </div>
              </div>
              {row.photo && (
                <div style={{ flexShrink: 0 }}>
                  <img src={row.photo} alt="VIP" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '6px', border: '2px solid #ddd' }} />
                  <button
                    type="button"
                    onClick={() => handleArrayChange('vipRows', index, 'photo', null)}
                    style={{ display: 'block', marginTop: '5px', fontSize: '11px', color: '#e74c3c', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                  >
                    Remove photo
                  </button>
                </div>
              )}
            </div>

            {/* Rest of the fields */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
              <div className="form-group"><label>Arrival</label><input type="date" className="form-control" value={row.arrival} onChange={(e) => handleArrayChange('vipRows', index, 'arrival', e.target.value)} /></div>
              <div className="form-group"><label>Departure</label><input type="date" className="form-control" value={row.departure} onChange={(e) => handleArrayChange('vipRows', index, 'departure', e.target.value)} /></div>
              <div className="form-group"><label>ETA</label><input type="text" className="form-control" value={row.eta} onChange={(e) => handleArrayChange('vipRows', index, 'eta', e.target.value)} placeholder="e.g. 3:00 PM" /></div>
              <div className="form-group"><label>Room Type</label><select className="form-control" value={row.roomType} onChange={(e) => handleArrayChange('vipRows', index, 'roomType', e.target.value)}><option value="">-- Select Room Type --</option><option>Standard King</option><option>Standard Double</option><option>Parthenon King</option><option>Parthenon Double</option><option>Stadium King</option><option>Stadium Double</option><option>Concierge King</option><option>Concierge Double</option><option>One Bedroom Deluxe Suite</option><option>Run Of House</option></select></div>
              <div className="form-group"><label>Rate</label><input type="text" className="form-control" value={row.rate} onChange={(e) => handleArrayChange('vipRows', index, 'rate', e.target.value)} placeholder="$219.00" /></div>
              <div className="form-group"><label>Bill Method</label><input type="text" className="form-control" value={row.billMethod} onChange={(e) => handleArrayChange('vipRows', index, 'billMethod', e.target.value)} /></div>
              <div className="form-group"><label>VIP Level</label><input type="text" className="form-control" value={row.vipLevel} onChange={(e) => handleArrayChange('vipRows', index, 'vipLevel', e.target.value)} placeholder="e.g. VIP1, Marriott Bonvoy" /></div>
            </div>
          </div>
        ))}

        {/* Billing Instructions */}
        <h3 style={{ marginTop: '30px', marginBottom: '15px' }}>Billing Instructions</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
          <div className="form-group"><label>Payment Method</label><input type="text" className="form-control" value={formData.paymentMethod} onChange={(e) => handleChange('paymentMethod', e.target.value)} /></div>
          <div className="form-group"><label>Direct Bill Approved</label><input type="text" className="form-control" value={formData.directBillApproved} onChange={(e) => handleChange('directBillApproved', e.target.value)} placeholder="Yes/No" /></div>
          <div className="form-group"><label>Master Account</label><input type="text" className="form-control" value={formData.masterAccountBilling} onChange={(e) => handleChange('masterAccountBilling', e.target.value)} /></div>
          <div className="form-group"><label>Authorized Signers</label><input type="text" className="form-control" value={formData.authorizedSigners} onChange={(e) => handleChange('authorizedSigners', e.target.value)} /></div>
          <div className="form-group">
            <label style={{ display: 'block', marginBottom: '6px' }}>Billing Address</label>
            <RichTextEditor value={formData.billingAddress} onChange={(val) => handleChange('billingAddress', val)} placeholder="Enter billing address..." minHeight="80px" />
          </div>
          <div>
            <div className="form-group"><label>Commission</label><input type="text" className="form-control" value={formData.commission} onChange={(e) => handleChange('commission', e.target.value)} /></div>
            <div className="form-group"><label>Intermediary Account</label><input type="text" className="form-control" value={formData.intermediaryAccount} onChange={(e) => handleChange('intermediaryAccount', e.target.value)} /></div>
            <div className="form-group"><label>Intermediary ID#</label><input type="text" className="form-control" value={formData.intermediaryId} onChange={(e) => handleChange('intermediaryId', e.target.value)} /></div>
          </div>
        </div>

        {/* Department Sections */}
        <h3 style={{ marginBottom: '15px' }}>Department Information</h3>
        {[
          { label: 'FRONTDESK', field: 'frontdesk' },
          { label: 'BELLSTAND', field: 'bellstand' },
          { label: 'CONCIERGE', field: 'concierge' },
          { label: 'GARAGE/VALET', field: 'garageValet' },
          { label: 'OUTLET INFORMATION', field: 'outletInformation' },
          { label: 'HOUSEKEEPING', field: 'housekeeping' },
          { label: 'CATERING/BANQUETS', field: 'cateringBanquets' },
          { label: 'AUDIO VISUAL', field: 'audioVisual' },
          { label: 'SHIPPING & RECEIVING', field: 'shippingReceiving' },
          { label: 'ACCOUNTING', field: 'accounting' }
        ].map(({ label, field }) => (
          <div key={field} className="form-group" style={{ marginBottom: '24px' }}>
            <label style={{ fontWeight: 'bold', fontSize: '14px', display: 'block', marginBottom: '6px' }}>{label}</label>
            <RichTextEditor value={formData[field]} onChange={(val) => handleChange(field, val)} placeholder={`Enter ${label.toLowerCase()} notes...`} minHeight="100px" />
          </div>
        ))}

        {/* Guest Confirmation List */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', marginTop: '30px' }}>
          <h3>Group Confirmation List</h3>
          <button className="btn btn-primary" onClick={() => addRow('guestList', { title: '', firstName: '', lastName: '', email: '', arrivalDate: '', departureDate: '', confirmationNumber: '' })}>+ Add Guest</button>
        </div>
        {formData.guestList.map((guest, index) => (
          <div key={index} style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '15px', marginBottom: '15px', backgroundColor: '#f9f9f9' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <h4>Guest #{index + 1}</h4>
              <button className="btn" onClick={() => removeRow('guestList', index)} style={{ backgroundColor: '#e74c3c', color: 'white', padding: '5px 10px' }}>Remove</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
              <div className="form-group"><label>Title</label><input type="text" className="form-control" value={guest.title} onChange={(e) => handleArrayChange('guestList', index, 'title', e.target.value)} placeholder="Mr./Ms." /></div>
              <div className="form-group"><label>First Name</label><input type="text" className="form-control" value={guest.firstName} onChange={(e) => handleArrayChange('guestList', index, 'firstName', e.target.value)} /></div>
              <div className="form-group"><label>Last Name</label><input type="text" className="form-control" value={guest.lastName} onChange={(e) => handleArrayChange('guestList', index, 'lastName', e.target.value)} /></div>
              <div className="form-group"><label>Email</label><input type="email" className="form-control" value={guest.email} onChange={(e) => handleArrayChange('guestList', index, 'email', e.target.value)} /></div>
              <div className="form-group"><label>Arrival Date</label><input type="date" className="form-control" value={guest.arrivalDate} onChange={(e) => handleArrayChange('guestList', index, 'arrivalDate', e.target.value)} /></div>
              <div className="form-group"><label>Departure Date</label><input type="date" className="form-control" value={guest.departureDate} onChange={(e) => handleArrayChange('guestList', index, 'departureDate', e.target.value)} /></div>
              <div className="form-group"><label>Confirmation #</label><input type="text" className="form-control" value={guest.confirmationNumber} onChange={(e) => handleArrayChange('guestList', index, 'confirmationNumber', e.target.value)} /></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default GroupResumeForm;
