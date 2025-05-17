import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import React, { useCallback, useEffect, useState } from 'react';

// Define the ResizableImage component
const ResizableImageComponent = (props: any) => {
  const { node, updateAttributes } = props;
  const { src, alt, width, height } = node.attrs;
  
  const [isResizing, setIsResizing] = useState(false);
  const [currentWidth, setCurrentWidth] = useState(width || null);
  const [currentHeight, setCurrentHeight] = useState(height || null);
  
  // Handle resize start
  const startResize = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);
  
  // Handle resize end
  const endResize = useCallback(() => {
    if (isResizing) {
      setIsResizing(false);
      // Update the node attributes with the new dimensions
      updateAttributes({
        width: currentWidth,
        height: currentHeight,
      });
    }
  }, [isResizing, currentWidth, currentHeight, updateAttributes]);
  
  // Handle resize movement
  const onResize = useCallback((e: MouseEvent) => {
    if (isResizing) {
      // Calculate new dimensions based on mouse movement
      const image = document.querySelector('[data-resizable-image="true"]') as HTMLImageElement;
      if (image) {
        const rect = image.getBoundingClientRect();
        const newWidth = e.clientX - rect.left;
        
        // Maintain aspect ratio
        const aspectRatio = image.naturalWidth / image.naturalHeight;
        const newHeight = newWidth / aspectRatio;
        
        setCurrentWidth(newWidth);
        setCurrentHeight(newHeight);
      }
    }
  }, [isResizing]);
  
  // Add and remove event listeners
  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', onResize);
      window.addEventListener('mouseup', endResize);
    }
    
    return () => {
      window.removeEventListener('mousemove', onResize);
      window.removeEventListener('mouseup', endResize);
    };
  }, [isResizing, onResize, endResize]);
  
  return (
    <div className="resizable-image-wrapper relative inline-block" contentEditable={false}>
      <img
        src={src}
        alt={alt || ''}
        data-resizable-image="true"
        className={`${isResizing ? 'pointer-events-none' : ''}`}
        style={{
          width: currentWidth ? `${currentWidth}px` : 'auto',
          height: currentHeight ? `${currentHeight}px` : 'auto',
        }}
      />
      
      {/* Resize handle */}
      <div 
        className="resize-handle absolute w-6 h-6 bottom-0 right-0 bg-indigo-500 opacity-70 rounded-full cursor-se-resize flex items-center justify-center"
        onMouseDown={startResize}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="7 17 17 17 17 7"></polyline>
        </svg>
      </div>
      
      {/* Size indicator */}
      {isResizing && (
        <div className="size-indicator absolute top-0 right-0 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
          {Math.round(currentWidth || 0)} × {Math.round(currentHeight || 0)}
        </div>
      )}
    </div>
  );
};

// Create the extension
export const ResizableImage = Node.create({
  name: 'resizableImage',
  
  group: 'block',
  
  inline: false,
  
  draggable: true,
  
  selectable: true,
  
  atom: true,
  
  addAttributes() {
    return {
      src: {
        default: null,
      },
      alt: {
        default: null,
      },
      width: {
        default: null,
      },
      height: {
        default: null,
      },
    };
  },
  
  parseHTML() {
    return [
      {
        tag: 'img[src]',
        getAttrs: (dom) => {
          if (typeof dom === 'string') return {};
          const element = dom as HTMLElement;
          
          return {
            src: element.getAttribute('src'),
            alt: element.getAttribute('alt'),
            width: element.getAttribute('width'),
            height: element.getAttribute('height'),
          };
        },
      },
    ];
  },
  
  renderHTML({ HTMLAttributes }) {
    return ['img', mergeAttributes(HTMLAttributes)];
  },
  
  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageComponent);
  },
});

export default ResizableImage;
