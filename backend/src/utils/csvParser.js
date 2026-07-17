const { parse } = require('csv-parse/sync');

const parseCSV = (fileBuffer) => {
  try {
    const content = fileBuffer.toString('utf8');
    const records = parse(content, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });
    return records;
  } catch (error) {
    throw new Error('Failed to parse CSV file: ' + error.message);
  }
};

module.exports = { parseCSV };
