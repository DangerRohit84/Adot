const QRCode = require('qrcode');

const generateQR = async (data) => {
  try {
    const qrDataUrl = await QRCode.toDataURL(data, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      width: 300,
      margin: 2,
    });
    return qrDataUrl;
  } catch (error) {
    throw new Error('Failed to generate QR code');
  }
};

const generateBarcodeData = (rollNumber, collegeCode) => {
  return `${collegeCode}-${rollNumber}-${Date.now()}`;
};

module.exports = { generateQR, generateBarcodeData };
