import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface ImageSizeDialogProps {
  imageUrl: string;
  onConfirm: (width: number, height: number) => void;
  onCancel: () => void;
}

const ImageSizeDialog: React.FC<ImageSizeDialogProps> = ({ 
  imageUrl, 
  onConfirm, 
  onCancel 
}) => {
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const [naturalWidth, setNaturalWidth] = useState<number>(0);
  const [naturalHeight, setNaturalHeight] = useState<number>(0);
  const [keepAspectRatio, setKeepAspectRatio] = useState<boolean>(true);
  const [aspectRatio, setAspectRatio] = useState<number>(1);

  // Load image dimensions when the component mounts
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setNaturalWidth(img.naturalWidth);
      setNaturalHeight(img.naturalHeight);
      setWidth(Math.min(img.naturalWidth, 500)); // Default max width 500px
      setHeight(Math.round(Math.min(img.naturalWidth, 500) * (img.naturalHeight / img.naturalWidth)));
      setAspectRatio(img.naturalWidth / img.naturalHeight);
    };
    img.src = imageUrl;
  }, [imageUrl]);

  // Handle width change
  const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newWidth = parseInt(e.target.value, 10);
    setWidth(newWidth);
    
    if (keepAspectRatio && !isNaN(newWidth)) {
      setHeight(Math.round(newWidth / aspectRatio));
    }
  };

  // Handle height change
  const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newHeight = parseInt(e.target.value, 10);
    setHeight(newHeight);
    
    if (keepAspectRatio && !isNaN(newHeight)) {
      setWidth(Math.round(newHeight * aspectRatio));
    }
  };

  // Handle aspect ratio toggle
  const handleAspectRatioToggle = () => {
    setKeepAspectRatio(!keepAspectRatio);
  };

  // Reset to original dimensions
  const handleReset = () => {
    setWidth(naturalWidth);
    setHeight(naturalHeight);
  };

  // Handle confirmation
  const handleConfirm = () => {
    onConfirm(width, height);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-lg w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Rasm o'lchamini sozlash</h3>
          <button 
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="flex flex-col md:flex-row gap-6 mb-6">
          <div className="flex-1 flex justify-center items-center bg-gray-100 rounded-lg p-4">
            <img 
              src={imageUrl} 
              alt="Preview" 
              style={{ 
                maxWidth: '100%', 
                maxHeight: '200px',
                width: width ? `${width}px` : 'auto',
                height: height ? `${height}px` : 'auto'
              }}
              className="object-contain"
            />
          </div>
          
          <div className="flex-1">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Eni (piksel)
              </label>
              <input
                type="number"
                value={width}
                onChange={handleWidthChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                min="10"
                max="2000"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bo'yi (piksel)
              </label>
              <input
                type="number"
                value={height}
                onChange={handleHeightChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                min="10"
                max="2000"
              />
            </div>
            
            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                id="keepAspectRatio"
                checked={keepAspectRatio}
                onChange={handleAspectRatioToggle}
                className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <label htmlFor="keepAspectRatio" className="ml-2 text-sm text-gray-700">
                Proporsiyalarni saqlash
              </label>
            </div>
            
            <button
              onClick={handleReset}
              className="text-sm text-indigo-600 hover:text-indigo-800"
            >
              Asl o'lchamga qaytarish
            </button>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Bekor qilish
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Tasdiqlash
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageSizeDialog;
