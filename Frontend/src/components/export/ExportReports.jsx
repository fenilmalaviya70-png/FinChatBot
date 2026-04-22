/**
 * ExportReports Component — PDF, Excel, Word export
 * Exports chat history and charts to multiple formats
 */

import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { FileDown, FileText, FileSpreadsheet, ChevronDown } from 'lucide-react';

const ExportReports = ({ messages = [], conversationTitle = 'Chat Report', chartRefs = [] }) => {
  const [open, setOpen] = useState(false);

  const fileName = (ext) =>
    `${(conversationTitle || 'chat').replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.${ext}`;

  // ───────────────────────── PDF ─────────────────────────
  const exportToPDF = async () => {
    setOpen(false);
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    let y = margin;

    // Header
    doc.setFillColor(37, 99, 235);
    doc.rect(0, 0, pageWidth, 18, 'F');
    doc.setFontSize(13);
    doc.setTextColor(255, 255, 255);
    doc.text('FinChatBot — Financial Analysis Report', margin, 12);

    y = 28;
    doc.setFontSize(16);
    doc.setTextColor(30, 30, 30);
    doc.text(conversationTitle || 'Financial AI Chat Report', margin, y);
    y += 8;

    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.text(`Generated: ${new Date().toLocaleString()}`, margin, y);
    y += 14;

    // Messages
    messages.forEach((msg) => {
      if (msg.role === 'system') return;
      if (y > pageHeight - 40) { doc.addPage(); y = margin; }

      // Role badge
      doc.setFontSize(10);
      doc.setTextColor(msg.role === 'user' ? 79 : 37, msg.role === 'user' ? 70 : 99, msg.role === 'user' ? 229 : 235);
      doc.text(msg.role === 'user' ? '👤 You' : '🤖 AI Assistant', margin, y);
      y += 6;

      // Content
      doc.setFontSize(10);
      doc.setTextColor(50, 50, 50);
      const lines = doc.splitTextToSize(msg.content || '', pageWidth - 2 * margin);
      lines.forEach((line) => {
        if (y > pageHeight - 30) { doc.addPage(); y = margin; }
        doc.text(line, margin, y);
        y += 5;
      });
      y += 8;
    });

    // Footer
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(160, 160, 160);
      doc.text(`Page ${i} of ${totalPages} | FinChatBot`, pageWidth / 2, pageHeight - 10, { align: 'center' });
    }

    doc.save(fileName('pdf'));
  };

  // ───────────────────────── EXCEL ─────────────────────────
  const exportToExcel = () => {
    setOpen(false);
    const rows = [['Timestamp', 'Role', 'Message']];

    messages.forEach((msg) => {
      if (msg.role === 'system') return;
      rows.push([
        msg.timestamp ? new Date(msg.timestamp).toLocaleString() : '',
        msg.role === 'user' ? 'You' : 'AI Assistant',
        msg.content || '',
      ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws['!cols'] = [{ wch: 22 }, { wch: 14 }, { wch: 80 }];

    // Style header row
    const headerStyle = { fill: { fgColor: { rgb: '2563EB' } }, font: { color: { rgb: 'FFFFFF' }, bold: true } };
    ['A1', 'B1', 'C1'].forEach((cell) => {
      if (ws[cell]) ws[cell].s = headerStyle;
    });

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Chat History');

    XLSX.writeFile(wb, fileName('xlsx'));
  };

  // ───────────────────────── WORD (.docx via HTML blob) ─────────────────────────
  const exportToWord = () => {
    setOpen(false);

    let html = `
      <html><head><meta charset="UTF-8">
      <style>
        body { font-family: Calibri, sans-serif; font-size: 11pt; color: #1f2937; margin: 0; }
        h1 { color: #2563eb; font-size: 18pt; }
        .meta { color: #6b7280; font-size: 9pt; margin-bottom: 20px; }
        .msg { margin-bottom: 16px; }
        .role { font-weight: bold; font-size: 10pt; color: #2563eb; margin-bottom: 4px; }
        .content { font-size: 10pt; line-height: 1.5; white-space: pre-wrap; }
        hr { border: none; border-top: 1px solid #e5e7eb; margin: 12px 0; }
      </style></head><body>
      <h1>${conversationTitle || 'FinChatBot Report'}</h1>
      <div class="meta">Generated: ${new Date().toLocaleString()}</div>
      <hr/>
    `;

    messages.forEach((msg) => {
      if (msg.role === 'system') return;
      html += `
        <div class="msg">
          <div class="role">${msg.role === 'user' ? '👤 You' : '🤖 AI Assistant'}</div>
          <div class="content">${(msg.content || '').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
        </div><hr/>
      `;
    });

    html += '</body></html>';
    const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
    saveAs(blob, fileName('doc'));
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
          bg-gray-100 dark:bg-dark-800 hover:bg-gray-200 dark:hover:bg-dark-700
          text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-dark-600
          transition-colors shadow-sm"
      >
        <FileDown className="w-3.5 h-3.5" />
        <span>Export</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 z-50 w-44
          bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-600
          rounded-xl shadow-xl overflow-hidden">
          <button
            onClick={exportToPDF}
            className="flex items-center gap-2.5 w-full px-4 py-2.5 text-xs text-left
              hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-700 dark:text-gray-300
              hover:text-red-700 dark:hover:text-red-400 transition-colors"
          >
            <FileDown className="w-3.5 h-3.5 text-red-500" />
            Download PDF
          </button>
          <button
            onClick={exportToExcel}
            className="flex items-center gap-2.5 w-full px-4 py-2.5 text-xs text-left
              hover:bg-green-50 dark:hover:bg-green-900/20 text-gray-700 dark:text-gray-300
              hover:text-green-700 dark:hover:text-green-400 transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-green-500" />
            Download Excel
          </button>
          <button
            onClick={exportToWord}
            className="flex items-center gap-2.5 w-full px-4 py-2.5 text-xs text-left
              hover:bg-blue-50 dark:hover:bg-blue-900/20 text-gray-700 dark:text-gray-300
              hover:text-blue-700 dark:hover:text-blue-400 transition-colors"
          >
            <FileText className="w-3.5 h-3.5 text-blue-500" />
            Download Word
          </button>
        </div>
      )}
    </div>
  );
};

export default ExportReports;
