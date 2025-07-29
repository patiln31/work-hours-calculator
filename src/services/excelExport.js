// src/services/excelExport.js
import * as XLSX from 'xlsx';

export const excelExportService = {
  // Generate Excel file with formatting
  exportTimeEntriesToExcel(entries, stats, options = {}) {
    const workbook = XLSX.utils.book_new();
    
    // Main data sheet
    const mainSheetData = this.formatEntriesForExcel(entries);
    const mainWorksheet = XLSX.utils.json_to_sheet(mainSheetData);
    
    // Apply styling to main sheet
    this.applyMainSheetStyling(mainWorksheet, mainSheetData.length);
    
    // Add main sheet
    XLSX.utils.book_append_sheet(workbook, mainWorksheet, "Time Entries");
    
    // Summary sheet with averages
    const summaryData = this.generateSummarySheet(stats, entries);
    const summaryWorksheet = XLSX.utils.json_to_sheet(summaryData);
    
    // Apply styling to summary sheet
    this.applySummarySheetStyling(summaryWorksheet, summaryData.length);
    
    // Add summary sheet
    XLSX.utils.book_append_sheet(workbook, summaryWorksheet, "Summary");
    
    // Generate filename
    const filename = `time-entries-${options.month || 'export'}-${new Date().toISOString().split('T')[0]}.xlsx`;
    
    // Download file
    XLSX.writeFile(workbook, filename);
  },

  // Format entries for Excel
  formatEntriesForExcel(entries) {
    return entries.map(entry => ({
      'Date': this.formatDate(entry.date),
      'Check In': entry.check_in || '-',
      'Check Out': entry.check_out || '-',
      'Break In': entry.break_in || '-',
      'Break Out': entry.break_out || '-',
      'Total Hours': entry.total_hours ? parseFloat(entry.total_hours).toFixed(2) : '-',
      'Break Duration (min)': entry.break_duration_minutes || 0,
      'Break Credit (min)': entry.break_credit_minutes || 0,
      'Expected Leave': entry.expected_leave_time || '-',
      'Meeting Hours': entry.meeting_hours ? parseFloat(entry.meeting_hours).toFixed(2) : '-',
      'Status': this.getStatus(entry.total_hours),
      'Notes': entry.notes || ''
    }));
  },

  // Generate summary sheet data
  generateSummarySheet(stats, entries) {
    const validEntries = entries.filter(entry => entry.total_hours != null);
    
    return [
      { 'Metric': 'Total Days Worked', 'Value': stats.totalDaysWorked },
      { 'Metric': 'Average Hours per Day', 'Value': stats.averageHours.toFixed(2) },
      { 'Metric': 'Total Hours This Month', 'Value': stats.totalHours.toFixed(2) },
      { 'Metric': 'Days Under 8.5 Hours', 'Value': stats.daysUnder8_5 },
      { 'Metric': 'Days Over 8.5 Hours', 'Value': stats.totalDaysWorked - stats.daysUnder8_5 },
      { 'Metric': 'Average Break Duration', 'Value': this.calculateAverageBreak(entries) },
      { 'Metric': 'Total Meeting Hours', 'Value': this.calculateTotalMeetings(entries) },
      { 'Metric': 'Average Meeting Hours per Day', 'Value': this.calculateAverageMeetings(entries) },
      { 'Metric': 'Completion Rate', 'Value': `${((stats.totalDaysWorked - stats.daysUnder8_5) / stats.totalDaysWorked * 100).toFixed(1)}%` }
    ];
  },

  // Apply styling to main sheet
  applyMainSheetStyling(worksheet, rowCount) {
    // Set column widths
    const columnWidths = [
      { wch: 12 }, // Date
      { wch: 10 }, // Check In
      { wch: 10 }, // Check Out
      { wch: 10 }, // Break In
      { wch: 10 }, // Break Out
      { wch: 12 }, // Total Hours
      { wch: 15 }, // Break Duration
      { wch: 15 }, // Break Credit
      { wch: 12 }, // Expected Leave
      { wch: 12 }, // Meeting Hours
      { wch: 10 }, // Status
      { wch: 20 }  // Notes
    ];
    worksheet['!cols'] = columnWidths;

    // Header styling
    const headerStyle = {
      font: { bold: true, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "4F46E5" } }, // Indigo background
      alignment: { horizontal: "center", vertical: "center" }
    };

    // Apply header styling
    const headerRange = XLSX.utils.decode_range(worksheet['!ref']);
    for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
      if (!worksheet[cellAddress]) worksheet[cellAddress] = {};
      worksheet[cellAddress].s = headerStyle;
    }

    // Row styling based on status
    for (let row = 1; row <= rowCount; row++) {
      const statusCell = XLSX.utils.encode_cell({ r: row, c: 10 }); // Status column
      
      if (worksheet[statusCell] && worksheet[statusCell].v) {
        const status = worksheet[statusCell].v;
        const rowStyle = this.getRowStyle(status);
        
        // Apply row styling
        for (let col = 0; col <= 11; col++) {
          const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
          if (!worksheet[cellAddress]) worksheet[cellAddress] = {};
          worksheet[cellAddress].s = rowStyle;
        }
      }
    }
  },

  // Apply styling to summary sheet
  applySummarySheetStyling(worksheet, rowCount) {
    // Set column widths
    worksheet['!cols'] = [{ wch: 25 }, { wch: 15 }];

    // Header styling
    const headerStyle = {
      font: { bold: true, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "059669" } }, // Green background
      alignment: { horizontal: "center", vertical: "center" }
    };

    // Apply header styling
    for (let col = 0; col <= 1; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
      if (!worksheet[cellAddress]) worksheet[cellAddress] = {};
      worksheet[cellAddress].s = headerStyle;
    }

    // Data row styling
    const dataStyle = {
      font: { color: { rgb: "1F2937" } },
      fill: { fgColor: { rgb: "F3F4F6" } },
      alignment: { horizontal: "left", vertical: "center" }
    };

    for (let row = 1; row <= rowCount; row++) {
      for (let col = 0; col <= 1; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
        if (!worksheet[cellAddress]) worksheet[cellAddress] = {};
        worksheet[cellAddress].s = dataStyle;
      }
    }
  },

  // Get row styling based on status
  getRowStyle(status) {
    switch (status) {
      case 'Complete':
        return {
          font: { color: { rgb: "059669" } }, // Green text
          fill: { fgColor: { rgb: "D1FAE5" } } // Light green background
        };
      case 'Under Hours':
        return {
          font: { color: { rgb: "DC2626" } }, // Red text
          fill: { fgColor: { rgb: "FEE2E2" } } // Light red background
        };
      case 'In Progress':
        return {
          font: { color: { rgb: "D97706" } }, // Orange text
          fill: { fgColor: { rgb: "FED7AA" } } // Light orange background
        };
      default:
        return {
          font: { color: { rgb: "6B7280" } }, // Gray text
          fill: { fgColor: { rgb: "F9FAFB" } } // Light gray background
        };
    }
  },

  // Helper functions
  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  },

  getStatus(totalHours) {
    if (!totalHours) return 'In Progress';
    const hours = parseFloat(totalHours);
    if (hours >= 8.5) return 'Complete';
    if (hours > 0) return 'Under Hours';
    return 'In Progress';
  },

  calculateAverageBreak(entries) {
    const validEntries = entries.filter(entry => entry.break_duration_minutes);
    if (validEntries.length === 0) return '0 min';
    const totalBreak = validEntries.reduce((sum, entry) => sum + (entry.break_duration_minutes || 0), 0);
    return `${Math.round(totalBreak / validEntries.length)} min`;
  },

  calculateTotalMeetings(entries) {
    const total = entries.reduce((sum, entry) => sum + (parseFloat(entry.meeting_hours) || 0), 0);
    return `${total.toFixed(2)} hours`;
  },

  calculateAverageMeetings(entries) {
    const validEntries = entries.filter(entry => entry.meeting_hours);
    if (validEntries.length === 0) return '0 hours';
    const total = validEntries.reduce((sum, entry) => sum + (parseFloat(entry.meeting_hours) || 0), 0);
    return `${(total / validEntries.length).toFixed(2)} hours`;
  }
}; 