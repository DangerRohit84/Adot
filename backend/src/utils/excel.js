const ExcelJS = require('exceljs');

const generateAttendanceExcel = async (data, sheetName = 'Attendance') => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(sheetName);

  // Headers
  worksheet.columns = [
    { header: 'Roll Number', key: 'roll_number', width: 15 },
    { header: 'Student Name', key: 'name', width: 25 },
    { header: 'Section', key: 'section', width: 10 },
    ...data.periods.map(p => ({
      header: `Period ${p}`,
      key: `period_${p}`,
      width: 12,
    })),
    { header: 'Total Present', key: 'total_present', width: 15 },
    { header: 'Total Absent', key: 'total_absent', width: 15 },
    { header: 'Attendance %', key: 'attendance_pct', width: 15 },
  ];

  // Style header row
  worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF2563EB' },
  };

  // Data rows
  data.students.forEach((student) => {
    const row = {
      roll_number: student.roll_number,
      name: student.name,
      section: student.section,
    };

    let presentCount = 0;
    data.periods.forEach((period) => {
      const status = student.periods[period] || 'absent';
      row[`period_${period}`] = status.toUpperCase();
      if (status === 'present') presentCount++;
    });

    row.total_present = presentCount;
    row.total_absent = data.periods.length - presentCount;
    row.attendance_pct = ((presentCount / data.periods.length) * 100).toFixed(1) + '%';

    const addedRow = worksheet.addRow(row);

    // Color code status cells
    data.periods.forEach((period, index) => {
      const cell = addedRow.getCell(4 + index);
      if (student.periods[period] === 'present') {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDCFCE7' } };
        cell.font = { color: { argb: 'FF166534' } };
      } else {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEE2E2' } };
        cell.font = { color: { argb: 'FF991B1B' } };
      }
    });
  });

  return workbook;
};

const generateCSV = (data) => {
  const headers = ['Roll Number', 'Name', 'Section', ...data.periods.map(p => `Period ${p}`), 'Present', 'Absent', 'Percentage'];
  const rows = data.students.map((student) => {
    const row = [student.roll_number, student.name, student.section];
    let presentCount = 0;
    data.periods.forEach((period) => {
      const status = student.periods[period] || 'absent';
      row.push(status);
      if (status === 'present') presentCount++;
    });
    row.push(presentCount, data.periods.length - presentCount, ((presentCount / data.periods.length) * 100).toFixed(1) + '%');
    return row;
  });

  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
};

module.exports = { generateAttendanceExcel, generateCSV };
