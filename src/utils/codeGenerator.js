import JsBarcode from 'jsbarcode';
import QRCode from 'qrcode';

/**
 * Generate a barcode as a data URL from a text value.
 * @param {string} text - The value to encode (e.g. SKU or barcode string)
 * @returns {Promise<string>} data:image/png;base64 URL
 */
export const generateBarcodeDataUrl = (text) => {
  return new Promise((resolve, reject) => {
    if (!text) { resolve(null); return; }
    const canvas = document.createElement('canvas');
    try {
      JsBarcode(canvas, text, {
        format: 'CODE128',
        width: 2,
        height: 60,
        displayValue: true,
        fontSize: 14,
        margin: 8,
        background: '#ffffff',
        lineColor: '#000000',
      });
      resolve(canvas.toDataURL('image/png'));
    } catch (err) {
      reject(err);
    }
  });
};

/**
 * Generate a QR code as a data URL from a text value.
 * @param {string} text - The value to encode
 * @returns {Promise<string>} data:image/png base64 URL
 */
export const generateQRDataUrl = async (text) => {
  if (!text) return null;
  try {
    return await QRCode.toDataURL(text, {
      width: 200,
      margin: 2,
      color: { dark: '#000000', light: '#ffffff' },
    });
  } catch {
    return null;
  }
};

/**
 * Trigger a browser download from a data URL.
 * @param {string} dataUrl - The data URL to download
 * @param {string} filename - The filename (without extension)
 */
export const downloadDataUrl = (dataUrl, filename) => {
  if (!dataUrl) return;
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
