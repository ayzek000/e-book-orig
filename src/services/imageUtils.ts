/**
 * Utility functions for handling images in the rich text editor
 */

/**
 * Convert a File object to a base64 string
 */
export const imageToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert image to base64'));
      }
    };
    reader.onerror = error => reject(error);
  });
};

/**
 * Validate if a file is an image
 */
export const validateImageFile = (file: File): boolean => {
  return file.type.startsWith('image/');
};

/**
 * Format file size to human-readable format
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' bytes';
  else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  else return (bytes / 1048576).toFixed(1) + ' MB';
};

/**
 * Process clipboard data to extract images
 */
export const processClipboardData = async (clipboardData: DataTransfer): Promise<string | null> => {
  // Check if there are any files in the clipboard
  if (clipboardData.files && clipboardData.files.length > 0) {
    const file = clipboardData.files[0];
    
    // Validate if it's an image
    if (validateImageFile(file)) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('Rasm hajmi 5MB dan oshmasligi kerak');
      }
      
      try {
        // Convert image to base64
        const base64Data = await imageToBase64(file);
        return base64Data;
      } catch (error) {
        console.error('Error processing pasted image:', error);
        throw new Error('Rasmni qayta ishlashda xatolik yuz berdi');
      }
    }
  }
  
  // Check for image in clipboard items (for browsers that support it)
  if (clipboardData.items) {
    for (let i = 0; i < clipboardData.items.length; i++) {
      const item = clipboardData.items[i];
      
      if (item.type.indexOf('image') !== -1) {
        const file = item.getAsFile();
        if (file) {
          // Check file size (max 5MB)
          if (file.size > 5 * 1024 * 1024) {
            throw new Error('Rasm hajmi 5MB dan oshmasligi kerak');
          }
          
          try {
            // Convert image to base64
            const base64Data = await imageToBase64(file);
            return base64Data;
          } catch (error) {
            console.error('Error processing pasted image:', error);
            throw new Error('Rasmni qayta ishlashda xatolik yuz berdi');
          }
        }
      }
    }
  }
  
  return null;
};
