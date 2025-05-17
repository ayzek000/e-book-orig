import { useState } from 'react';
import { FileText, Download, ChevronUp, ChevronDown, ExternalLink, Eye } from 'lucide-react';
import { createPdfObjectUrl } from '../../services/pdfUtils';

interface PdfViewerProps {
  pdfAttachment: {
    name: string;
    data: string; // Base64 encoded PDF data
  };
}

const PdfViewer = ({ pdfAttachment }: PdfViewerProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  const handleToggleExpand = () => {
    if (!objectUrl && !isExpanded) {
      // Create object URL only when expanding for the first time
      const url = createPdfObjectUrl(pdfAttachment.data);
      setObjectUrl(url);
    }
    setIsExpanded(!isExpanded);
  };

  const handleDownload = () => {
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
  };

  const handleOpenInNewTab = () => {
    const url = createPdfObjectUrl(pdfAttachment.data);
    window.open(url, '_blank');
  };

  return (
    <div className="card-glass overflow-hidden transition-all duration-300 hover:shadow-glow-primary">
      <div 
        className="p-4 flex items-center justify-between cursor-pointer bg-neutral-50 dark:bg-neutral-900 transition-colors"
        onClick={handleToggleExpand}
      >
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-primary-100 dark:bg-primary-900">
            <FileText className="h-5 w-5 text-primary-700 dark:text-primary-300" />
          </div>
          <span className="font-medium text-neutral-800 dark:text-neutral-200">{pdfAttachment.name}</span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDownload();
            }}
            className="btn btn-icon btn-ghost"
            title="Yuklab olish"
            aria-label="Yuklab olish"
          >
            <Download className="h-5 w-5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleOpenInNewTab();
            }}
            className="btn btn-icon btn-ghost"
            title="Yangi oynada ochish"
            aria-label="Yangi oynada ochish"
          >
            <ExternalLink className="h-5 w-5" />
          </button>
          <button 
            className="btn btn-icon btn-ghost" 
            aria-label={isExpanded ? "Yopish" : "Ochish"}
            onClick={handleToggleExpand}
          >
            {isExpanded ? (
              <ChevronUp className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {isExpanded && objectUrl && (
        <div className="p-4 bg-white dark:bg-neutral-800 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Eye className="h-4 w-4 text-primary-600 mr-2" />
              <span className="text-sm text-neutral-600 dark:text-neutral-300">PDF hujjatni ko'rish</span>
            </div>
            <button
              onClick={handleOpenInNewTab}
              className="btn btn-sm btn-soft text-primary-700"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Yangi oynada ochish
            </button>
          </div>
          <div className="rounded-xl overflow-hidden shadow-md">
            <iframe
              src={objectUrl}
              className="w-full h-[600px] border-0"
              title={pdfAttachment.name}
              loading="lazy"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PdfViewer;
