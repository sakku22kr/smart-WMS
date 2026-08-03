import { useFormContext } from 'react-hook-form';
import { useCallback, useState, useEffect, useRef } from 'react';
import { MdRefresh, MdQrCode, MdDownload, MdImage, MdClose } from 'react-icons/md';
import toast from 'react-hot-toast';
import productService from '@api/services/productService';
import { generateSku, generateBarcodeNumber } from '@utils/skuGenerator';
import { generateBarcodeDataUrl, generateQRDataUrl, downloadDataUrl } from '@utils/codeGenerator';

const UNITS = ['PCS', 'KG', 'LTR', 'BOX', 'MTR', 'SET', 'PAIR', 'DOZEN'];

const fieldClass = 'w-full px-3 py-2 rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-800 dark:text-surface-100 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors';
const labelClass = 'block text-sm font-medium text-surface-600 dark:text-surface-300 mb-1';
const errorClass = 'text-xs text-red-500 mt-1';
const sectionTitle = 'text-sm font-semibold text-surface-800 dark:text-surface-100 pb-2 mb-2 border-b border-surface-100 dark:border-surface-700';
const btnSmall = 'inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md bg-surface-100 dark:bg-surface-700 text-surface-600 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-600 transition-colors';

const ProductFormFields = ({ categories = [], suppliers = [], warehouses = [], excludeId = null }) => {
  const { register, formState: { errors }, watch, setValue, getValues, setError, clearErrors } = useFormContext();
  const [barcodeImg, setBarcodeImg] = useState(null);
  const [qrImg, setQrImg] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [imagePreviewError, setImagePreviewError] = useState(false);

  const skuValue = watch('sku');
  const barcodeValue = watch('barcode');
  const imageUrlValue = watch('imageUrl');
  const nameValue = watch('name');

  // ─── Image Preview ────────────────────────────────────────
  useEffect(() => {
    setImagePreviewError(false);
  }, [imageUrlValue]);

  // ─── SKU Uniqueness Validation ────────────────────────────
  const validateSkuUniqueness = useCallback(async (value) => {
    if (!value || value.length < 3) return true;
    try {
      const res = await productService.checkSku(value, excludeId);
      if (res?.data === false) return 'SKU is already taken';
      return true;
    } catch {
      return true;
    }
  }, [excludeId]);

  // ─── Barcode Uniqueness Validation ────────────────────────
  const validateBarcodeUniqueness = useCallback(async (value) => {
    if (!value || value.length < 3) return true;
    try {
      const res = await productService.checkBarcode(value, excludeId);
      if (res?.data === false) return 'Barcode is already taken';
      return true;
    } catch {
      return true;
    }
  }, [excludeId]);

  // ─── Auto-generate SKU ───────────────────────────────────
  const handleGenerateSku = useCallback(() => {
    const name = getValues('name');
    if (!name || name.trim().length < 2) {
      toast.error('Enter a product name first');
      return;
    }
    const sku = generateSku(name);
    setValue('sku', sku, { shouldValidate: true });
    toast.success(`SKU generated: ${sku}`);
  }, [getValues, setValue]);

  // ─── Auto-generate Barcode ────────────────────────────────
  const handleGenerateBarcode = useCallback(async () => {
    const barcode = generateBarcodeNumber();
    setValue('barcode', barcode, { shouldValidate: true });
    toast.success(`Barcode generated: ${barcode}`);
  }, [setValue]);

  // ─── Generate Barcode Image ───────────────────────────────
  const handleGenerateBarcodeImage = useCallback(async () => {
    const value = barcodeValue || skuValue;
    if (!value) {
      toast.error('Enter a SKU or barcode first');
      return;
    }
    setGenerating(true);
    try {
      const dataUrl = await generateBarcodeDataUrl(value);
      setBarcodeImg(dataUrl);
      toast.success('Barcode image generated');
    } catch {
      toast.error('Failed to generate barcode');
    } finally {
      setGenerating(false);
    }
  }, [barcodeValue, skuValue]);

  // ─── Generate QR Code Image ───────────────────────────────
  const handleGenerateQR = useCallback(async () => {
    const value = skuValue || barcodeValue;
    if (!value) {
      toast.error('Enter a SKU or barcode first');
      return;
    }
    setGenerating(true);
    try {
      const dataUrl = await generateQRDataUrl(value);
      setQrImg(dataUrl);
      toast.success('QR code generated');
    } catch {
      toast.error('Failed to generate QR code');
    } finally {
      setGenerating(false);
    }
  }, [skuValue, barcodeValue]);

  // ─── Download Handlers ────────────────────────────────────
  const handleDownloadBarcode = () => {
    if (!barcodeImg) return;
    const name = skuValue || barcodeValue || 'product';
    downloadDataUrl(barcodeImg, `barcode-${name}.png`);
  };

  const handleDownloadQR = () => {
    if (!qrImg) return;
    const name = skuValue || barcodeValue || 'product';
    downloadDataUrl(qrImg, `qr-${name}.png`);
  };

  return (
    <div className="space-y-6">
      {/* ── Basic Information ──────────────────────────────── */}
      <div>
        <h3 className={sectionTitle}>Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="md:col-span-2 lg:col-span-3">
            <label className={labelClass}>Product Name *</label>
            <input {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'Min 2 characters' } })} className={fieldClass} placeholder="e.g. Wireless Headset Pro X200" />
            {errors.name && <p className={errorClass}>{errors.name.message}</p>}
          </div>

          <div>
            <label className={labelClass}>SKU *</label>
            <div className="flex gap-2">
              <input
                {...register('sku', {
                  required: 'SKU is required',
                  minLength: { value: 3, message: 'Min 3 characters' },
                  validate: validateSkuUniqueness,
                })}
                className={fieldClass}
                placeholder="e.g. WH-X200"
              />
              <button type="button" onClick={handleGenerateSku} title="Auto-generate SKU" className={btnSmall + ' flex-shrink-0'}>
                <MdRefresh size={14} /> Generate
              </button>
            </div>
            {errors.sku && <p className={errorClass}>{errors.sku.message}</p>}
          </div>

          <div>
            <label className={labelClass}>Barcode</label>
            <div className="flex gap-2">
              <input
                {...register('barcode', { validate: validateBarcodeUniqueness })}
                className={fieldClass}
                placeholder="e.g. 8901234567890"
              />
              <button type="button" onClick={handleGenerateBarcode} title="Auto-generate barcode" className={btnSmall + ' flex-shrink-0'}>
                <MdRefresh size={14} /> Gen
              </button>
            </div>
            {errors.barcode && <p className={errorClass}>{errors.barcode.message}</p>}
          </div>

          <div>
            <label className={labelClass}>Brand</label>
            <input {...register('brand')} className={fieldClass} placeholder="e.g. AudioTech" />
          </div>

          <div>
            <label className={labelClass}>Model</label>
            <input {...register('model')} className={fieldClass} placeholder="e.g. AT-WH200" />
          </div>

          <div>
            <label className={labelClass}>Unit</label>
            <select {...register('unit')} className={fieldClass}>
              {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>

          <div>
            <label className={labelClass}>Status</label>
            <select {...register('status')} className={fieldClass}>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="DISCONTINUED">Discontinued</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Image ──────────────────────────────────────────── */}
      <div>
        <h3 className={sectionTitle}>Product Image</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Image URL</label>
            <input {...register('imageUrl')} className={fieldClass} placeholder="https://example.com/images/product.png" />
            <p className="text-xs text-surface-400 mt-1">Paste a direct image URL (PNG, JPG, WebP)</p>
          </div>
          <div>
            <label className={labelClass}>Preview</label>
            {imageUrlValue && !imagePreviewError ? (
              <div className="relative w-full h-32 rounded-lg border border-surface-200 dark:border-surface-700 overflow-hidden bg-surface-50 dark:bg-surface-800">
                <img
                  src={imageUrlValue}
                  alt="Product preview"
                  className="w-full h-full object-contain"
                  onError={() => setImagePreviewError(true)}
                />
                <button
                  type="button"
                  onClick={() => { setValue('imageUrl', ''); setImagePreviewError(false); }}
                  className="absolute top-1 right-1 p-1 rounded-full bg-surface-800/60 text-white hover:bg-surface-800/80"
                >
                  <MdClose size={14} />
                </button>
              </div>
            ) : (
              <div className="w-full h-32 rounded-lg border-2 border-dashed border-surface-200 dark:border-surface-700 flex flex-col items-center justify-center text-surface-400">
                <MdImage size={28} className="mb-1 opacity-40" />
                <span className="text-xs">No image</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Relationships ──────────────────────────────────── */}
      <div>
        <h3 className={sectionTitle}>Relationships</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Category</label>
            <select {...register('categoryId')} className={fieldClass}>
              <option value="">Select Category</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div>
            <label className={labelClass}>Supplier</label>
            <select {...register('supplierId')} className={fieldClass}>
              <option value="">Select Supplier</option>
              {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>

          <div>
            <label className={labelClass}>Warehouse</label>
            <select {...register('warehouseId')} className={fieldClass}>
              <option value="">Select Warehouse</option>
              {warehouses.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* ── Pricing ────────────────────────────────────────── */}
      <div>
        <h3 className={sectionTitle}>Pricing</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Purchase Price *</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-surface-400">₹</span>
              <input
                type="number"
                step="0.01"
                {...register('purchasePrice', { required: 'Required', min: { value: 0.01, message: 'Must be greater than 0' } })}
                className={fieldClass + ' pl-7'}
                placeholder="0.00"
              />
            </div>
            {errors.purchasePrice && <p className={errorClass}>{errors.purchasePrice.message}</p>}
          </div>

          <div>
            <label className={labelClass}>Selling Price *</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-surface-400">₹</span>
              <input
                type="number"
                step="0.01"
                {...register('sellingPrice', { required: 'Required', min: { value: 0.01, message: 'Must be greater than 0' } })}
                className={fieldClass + ' pl-7'}
                placeholder="0.00"
              />
            </div>
            {errors.sellingPrice && <p className={errorClass}>{errors.sellingPrice.message}</p>}
          </div>

          <div>
            <label className={labelClass}>Tax Rate (%)</label>
            <input
              type="number"
              step="0.01"
              {...register('taxRate', { min: { value: 0, message: 'Min 0' }, max: { value: 100, message: 'Max 100' } })}
              className={fieldClass}
              placeholder="0"
            />
            {errors.taxRate && <p className={errorClass}>{errors.taxRate.message}</p>}
          </div>
        </div>
      </div>

      {/* ── Stock & Reorder ────────────────────────────────── */}
      <div>
        <h3 className={sectionTitle}>Stock & Reorder</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Reorder Level</label>
            <input
              type="number"
              {...register('reorderLevel', { min: { value: 0, message: 'Min 0' } })}
              className={fieldClass}
              placeholder="10"
            />
            {errors.reorderLevel && <p className={errorClass}>{errors.reorderLevel.message}</p>}
          </div>

          <div>
            <label className={labelClass}>Reorder Quantity</label>
            <input
              type="number"
              {...register('reorderQuantity', { min: { value: 0, message: 'Min 0' } })}
              className={fieldClass}
              placeholder="50"
            />
            {errors.reorderQuantity && <p className={errorClass}>{errors.reorderQuantity.message}</p>}
          </div>
        </div>
      </div>

      {/* ── Barcode & QR Code ──────────────────────────────── */}
      <div>
        <h3 className={sectionTitle}>Barcode & QR Code</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Barcode Image</label>
            <div className="flex gap-2 mb-2">
              <button type="button" onClick={handleGenerateBarcodeImage} disabled={generating || (!barcodeValue && !skuValue)} className={btnSmall}>
                <MdRefresh size={14} /> Generate Barcode
              </button>
              {barcodeImg && (
                <button type="button" onClick={handleDownloadBarcode} className={btnSmall}>
                  <MdDownload size={14} /> Download
                </button>
              )}
            </div>
            {barcodeImg ? (
              <div className="w-full p-3 bg-white dark:bg-surface-700 rounded-lg border border-surface-200 dark:border-surface-700 flex items-center justify-center">
                <img src={barcodeImg} alt="Barcode" className="max-h-24" />
              </div>
            ) : (
              <div className="w-full h-24 rounded-lg border-2 border-dashed border-surface-200 dark:border-surface-700 flex items-center justify-center text-surface-400 text-xs">
                Enter SKU or barcode, then click Generate
              </div>
            )}
          </div>

          <div>
            <label className={labelClass}>QR Code</label>
            <div className="flex gap-2 mb-2">
              <button type="button" onClick={handleGenerateQR} disabled={generating || (!skuValue && !barcodeValue)} className={btnSmall}>
                <MdQrCode size={14} /> Generate QR
              </button>
              {qrImg && (
                <button type="button" onClick={handleDownloadQR} className={btnSmall}>
                  <MdDownload size={14} /> Download
                </button>
              )}
            </div>
            {qrImg ? (
              <div className="w-full p-3 bg-white dark:bg-surface-700 rounded-lg border border-surface-200 dark:border-surface-700 flex items-center justify-center">
                <img src={qrImg} alt="QR Code" className="h-24" />
              </div>
            ) : (
              <div className="w-full h-24 rounded-lg border-2 border-dashed border-surface-200 dark:border-surface-700 flex items-center justify-center text-surface-400 text-xs">
                Enter SKU or barcode, then click Generate
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Additional ─────────────────────────────────────── */}
      <div>
        <h3 className={sectionTitle}>Additional Details</h3>
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Description</label>
            <textarea
              {...register('description', { maxLength: { value: 1000, message: 'Max 1000 characters' } })}
              rows={3}
              className={fieldClass}
              placeholder="Product description..."
            />
            {errors.description && <p className={errorClass}>{errors.description.message}</p>}
          </div>

          <div>
            <label className={labelClass}>Notes</label>
            <textarea
              {...register('notes', { maxLength: { value: 1000, message: 'Max 1000 characters' } })}
              rows={2}
              className={fieldClass}
              placeholder="Additional notes..."
            />
            {errors.notes && <p className={errorClass}>{errors.notes.message}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductFormFields;
