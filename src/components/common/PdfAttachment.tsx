import { useState, useRef } from 'react';
import { FileUp, FileText, X, Download, Eye, AlertCircle } from 'lucide-react';
import { fileToBase64, validatePdfFile, formatFileSize, createPdfObjectUrl } from '../../services/pdfUtils';

interface PdfAttachmentProps {
  pdfAttachment?: {
    name: string;
    data: string; // Base64 encoded PDF data
  };
  onChange: (attachment: { name: string; data: string } | undefined) => void;
}

const PdfAttachment = ({ pdfAttachment, onChange }: PdfAttachmentProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!validatePdfFile(file)) {
      setError('Faqat PDF fayl formatiga ruxsat berilgan');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Fayl hajmi 10MB dan oshmasligi kerak');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const base64Data = await fileToBase64(file);
      onChange({ name: file.name, data: base64Data });
      setIsUploading(false);
    } catch (error) {
      console.error('PDF upload error:', error);
      setError('Faylni yuklashda xatolik yuz berdi');
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    onChange(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  const handlePreview = () => {
    if (pdfAttachment?.data) {
      // Create object URL for preview
      const url = createPdfObjectUrl(pdfAttachment.data);
      setPreviewUrl(url);
      
      // Open in new tab
      window.open(url, '_blank');
    }
  };

  const handleDownload = () => {
    if (pdfAttachment?.data) {
      const url = createPdfObjectUrl(pdfAttachment.data);
      
      // Create a temporary link and trigger download
      const a = document.createElement('a');
      a.href = url;
      a.download = pdfAttachment.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      // Clean up
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="mt-6">
      <label className="form-label flex items-center space-x-2">
        <FileText className="h-4 w-4 text-primary-700" />
        <span>PDF fayl biriktirish</span>
      </label>

      {!pdfAttachment ? (
        <div className="border-2 border-dashed border-primary-200 dark:border-primary-800 rounded-xl p-6 mt-2 bg-primary-50/50 dark:bg-primary-900/10 transition-colors hover:bg-primary-50 dark:hover:bg-primary-900/20">
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="p-3 rounded-full bg-primary-100 dark:bg-primary-800">
              <FileUp className="h-8 w-8 text-primary-600 dark:text-primary-400" />
            </div>
            <p className="text-sm text-neutral-700 dark:text-neutral-300 text-center">
              PDF faylni tanlash uchun bosing yoki bu yerga tashlang
            </p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              (Maksimal hajm: 10MB)
            </p>
            <input
              type="file"
              ref={fileInputRef}
              accept="application/pdf"
              onChange={handleFileChange}
              className="hidden"
              id="pdf-upload"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="btn btn-primary shadow-glow-primary"
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <div className="loading-spinner-sm mr-2"></div>
                  Yuklanmoqda...
                </>
              ) : (
                <>
                  <FileUp className="h-4 w-4 mr-2" />
                  PDF faylni tanlash
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="card-glass p-4 mt-2 transition-all duration-300 hover:shadow-glow-primary">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-primary-100 dark:bg-primary-900">
                <FileText className="h-5 w-5 text-primary-700 dark:text-primary-300" />
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200">{pdfAttachment.name}</p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  {formatFileSize(Math.ceil((pdfAttachment.data.length * 3) / 4))}
                </p>
              </div>
            </div>
            <div className="flex space-x-1">
              <button
                onClick={handlePreview}
                className="btn btn-icon btn-ghost text-neutral-600 hover:text-primary-600"
                title="Ko'rish"
                aria-label="Ko'rish"
              >
                <Eye className="h-5 w-5" />
              </button>
              <button
                onClick={handleDownload}
                className="btn btn-icon btn-ghost text-neutral-600 hover:text-primary-600"
                title="Yuklab olish"
                aria-label="Yuklab olish"
              >
                <Download className="h-5 w-5" />
              </button>
              <button
                onClick={handleRemove}
                className="btn btn-icon btn-ghost text-neutral-600 hover:text-danger-600"
                title="O'chirish"
                aria-label="O'chirish"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center mt-2 text-sm text-danger-600 bg-danger-50 p-2 rounded-lg">
          <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default PdfAttachment;
