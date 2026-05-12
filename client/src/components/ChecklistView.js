import React, { useState, useEffect, useRef } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import TaskItem from './TaskItem';

const WL_LOGO_B64 = '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';

function ChecklistView({ checklist, tasks, onBack, onUpdate }) {
  const scrollPositionRef = useRef(0);
  const shouldRestoreScrollRef = useRef(false);
  const [localTasks, setLocalTasks] = useState(tasks);

  useEffect(() => { setLocalTasks(tasks); }, [tasks]);

  useEffect(() => {
    if (shouldRestoreScrollRef.current) {
      requestAnimationFrame(() => {
        window.scrollTo(0, scrollPositionRef.current);
        shouldRestoreScrollRef.current = false;
      });
    }
  }, [localTasks]);

  const handleTaskUpdate = () => {
    scrollPositionRef.current = window.scrollY;
    shouldRestoreScrollRef.current = true;
    onUpdate();
  };

  const getCompletionStatus = () => {
    if (localTasks.length === 0) return { badge: 'incomplete', text: 'No tasks' };
    const completed = localTasks.filter(t => t.completion_id).length;
    const total = localTasks.length;
    const percentage = (completed / total) * 100;
    if (percentage === 100) return { badge: 'completed', text: `${completed}/${total} Complete` };
    if (percentage > 0) return { badge: 'partial', text: `${completed}/${total} Complete` };
    return { badge: 'incomplete', text: `${completed}/${total} Complete` };
  };

  const status = getCompletionStatus();

  const generateChecklistPDF = () => {
    const doc = new jsPDF('portrait');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 14;
    const navy = [13, 36, 76];

    const drawPageHeader = () => {
      // Top thick navy bar
      doc.setFillColor(...navy);
      doc.rect(0, 0, pageWidth, 3, 'F');

      // White Lodging logo
      try {
        doc.addImage(WL_LOGO_B64, 'JPEG', margin, 5, 14, 14);
      } catch (e) {}

      // "White Lodging Way" text
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...navy);
      doc.text('White Lodging Way', margin + 18, 15);

      // Thin navy line below header
      doc.setDrawColor(...navy);
      doc.setLineWidth(0.8);
      doc.line(margin, 22, pageWidth - margin, 22);

      doc.setTextColor(0, 0, 0);
      return 28; // yPos after header
    };

    const drawPageFooter = (pageNum) => {
      // Thin line above footer
      doc.setDrawColor(180, 180, 180);
      doc.setLineWidth(0.3);
      doc.line(margin, pageHeight - 13, pageWidth - margin, pageHeight - 13);

      // Small logo
      try {
        doc.addImage(WL_LOGO_B64, 'JPEG', margin, pageHeight - 11, 6, 6);
      } catch (e) {}

      // Footer text
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(80, 80, 80);
      doc.text('WHITE LODGING', margin + 8, pageHeight - 7);
      doc.text('WHITE LODGING PROPRIETARY AND CONFIDENTIAL', pageWidth / 2, pageHeight - 7, { align: 'center' });
      doc.text(String(pageNum), pageWidth - margin, pageHeight - 7, { align: 'right' });

      // Bottom thick navy bar
      doc.setFillColor(...navy);
      doc.rect(0, pageHeight - 4, pageWidth, 4, 'F');
    };

    // ── PAGE 1 ──────────────────────────────────────────────
    let yPos = drawPageHeader();

    // Checklist title (centered, bold, underlined)
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    const title = checklist.name;
    doc.text(title, pageWidth / 2, yPos + 7, { align: 'center' });
    const titleW = doc.getTextWidth(title);
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.4);
    doc.line(pageWidth / 2 - titleW / 2, yPos + 8.5, pageWidth / 2 + titleW / 2, yPos + 8.5);
    yPos += 15;

    // Hotel name + Date line
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Nashville Marriott Vanderbilt', margin, yPos);
    doc.text('Date: _______________', pageWidth - margin, yPos, { align: 'right' });
    yPos += 6;

    // Stats table
    const statsRows = [
      ['Arrivals:', '', 'Left To Sell:', ''],
      ['Departures:', '', '12 REGA:', '$'],
      ['Stayovers:', '', 'ITR (MTD):', ''],
      ['Projected Occ:', '', 'STAFF (MTD):', ''],
      ['MOD:', '', 'ELITE (MTD):', ''],
    ];

    autoTable(doc, {
      startY: yPos,
      body: statsRows,
      styles: { fontSize: 10, cellPadding: { top: 3, bottom: 3, left: 4, right: 4 }, lineColor: [0, 0, 0], lineWidth: 0.3 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 42, halign: 'center' },
        1: { cellWidth: 44 },
        2: { fontStyle: 'bold', cellWidth: 42, halign: 'center' },
        3: { cellWidth: 44 },
      },
      theme: 'grid',
      tableLineColor: [0, 0, 0],
      tableLineWidth: 0.3,
      didDrawCell: (data) => {
        // Underline the label columns (0 and 2)
        if (data.section === 'body' && (data.column.index === 0 || data.column.index === 2)) {
          const txt = data.cell.text[0];
          if (txt) {
            doc.setDrawColor(0, 0, 0);
            doc.setLineWidth(0.3);
            const tw = doc.getTextWidth(txt);
            const cx = data.cell.x + (data.cell.width - tw) / 2;
            const cy = data.cell.y + data.cell.height - data.cell.padding('bottom') - 0.5;
            doc.line(cx, cy, cx + tw, cy);
          }
        }
      }
    });
    yPos = doc.lastAutoTable.finalY + 5;

    // Agents on Duty header (underlined)
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Agents on Duty:', margin, yPos);
    const agW = doc.getTextWidth('Agents on Duty:');
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.3);
    doc.line(margin, yPos + 1, margin + agW, yPos + 1);
    yPos += 6;

    // Employee table (6 empty rows)
    autoTable(doc, {
      startY: yPos,
      head: [['Employee', 'Break Time', 'Shift Hours', 'Weekly Script Audit Score']],
      body: Array(6).fill(['', '', '', '']),
      styles: { fontSize: 9, cellPadding: 4, lineColor: [0, 0, 0], lineWidth: 0.3 },
      headStyles: {
        fillColor: navy,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9,
      },
      theme: 'grid',
      tableLineColor: [0, 0, 0],
      tableLineWidth: 0.3,
    });
    yPos = doc.lastAutoTable.finalY + 8;

    // Draw footer for page 1 now (before table starts potentially adding pages)
    // We'll handle all footers in didDrawPage below

    // ── CHECKLIST TABLE ──────────────────────────────────────
    let pageCount = 1;
    // Every task is a regular row with an Initial cell
    const completionStatus = localTasks.map(task =>
      task.subtasks && task.subtasks.length > 0
        ? task.subtasks.every(st => st.is_completed === 1)
        : !!task.completion_id
    );
    const checklistBody = localTasks.map((task, i) => {
      const taskText = task.description
        ? task.title + '\n' + task.description
        : task.title;
      return ['', taskText];
    });


    autoTable(doc, {
      startY: yPos,
      margin: { top: 30, left: margin, right: margin, bottom: 18 },
      head: [[
        { content: 'Initial', styles: { fillColor: navy, textColor: [255, 255, 255], fontStyle: 'bold', halign: 'center', fontSize: 9 } },
        { content: '', styles: { fillColor: navy } }
      ]],
      body: checklistBody,
      styles: { fontSize: 8.5, cellPadding: { top: 3, bottom: 3, left: 4, right: 4 }, lineColor: [0, 0, 0], lineWidth: 0.3, overflow: 'linebreak' },
      columnStyles: {
        0: { cellWidth: 20, halign: 'center', fontStyle: 'bold', fontSize: 12, textColor: [0, 0, 0] },
        1: { cellWidth: pageWidth - margin * 2 - 20 },
      },
      theme: 'grid',
      tableLineColor: [0, 0, 0],
      tableLineWidth: 0.3,
      rowPageBreak: 'avoid',
      didDrawCell: (data) => {
        if (data.section === 'body' && data.column.index === 0 && completionStatus[data.row.index]) {
          // Draw a checkmark using lines
          const x = data.cell.x + data.cell.width / 2 - 2.5;
          const y = data.cell.y + data.cell.height / 2;
          doc.setDrawColor(0, 0, 0);
          doc.setLineWidth(0.8);
          // Short left stroke (down-left leg of tick)
          doc.line(x, y + 1, x + 2.2, y + 2.7);
          // Long right stroke (up-right leg of tick)
          doc.line(x + 1.9, y + 3, x + 6, y - 2);
        }
      },
      didDrawPage: (data) => {
        pageCount = data.pageNumber;
        // Draw header on pages 2+ (page 1 header already drawn)
        if (data.pageNumber > 1) {
          drawPageHeader();
        }
        // Draw footer on every page
        drawPageFooter(data.pageNumber);
      }
    });

    // MOD Signature line on last page
    const finalY = doc.lastAutoTable.finalY + 15;
    if (finalY < pageHeight - 30) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      doc.text('MOD Signature:', pageWidth - margin - 80, finalY);
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.4);
      doc.line(pageWidth - margin - 80, finalY + 12, pageWidth - margin, finalY + 12);
    }

    // Save
    const dateStr = new Date().toISOString().split('T')[0];
    doc.save(`${checklist.name.replace(/\s+/g, '_')}_${dateStr}.pdf`);
  };

  return (
    <div className="main-content">
      <div className="page-header">
        <button className="btn btn-secondary" onClick={onBack} style={{ marginBottom: '15px' }}>
          ← Back to Tasks
        </button>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
          <div>
            <h1>{checklist.name}</h1>
            <p>{checklist.description}</p>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button
              className="btn btn-secondary"
              onClick={generateChecklistPDF}
              style={{ whiteSpace: 'nowrap' }}
            >
              🖨️ Print Checklist
            </button>
            <span className={`completion-badge ${status.badge}`} style={{ fontSize: '16px', padding: '10px 20px' }}>
              {status.text}
            </span>
          </div>
        </div>
      </div>

      <div className="task-section">
        <div className="task-list">
          {localTasks.map(task => (
            <TaskItem key={task.id} task={task} onUpdate={handleTaskUpdate} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default ChecklistView;
