import React, { useEffect, useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import { 
  Bold, Italic, Underline as UnderlineIcon, List, ListOrdered, 
  Link as LinkIcon, Heading1, Heading2, Heading3, Image as ImageIcon,
  AlertCircle, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Type, Palette
} from 'lucide-react';
import { processClipboardData, imageToBase64, validateImageFile } from '../../services/imageUtils';
import ImageSizeDialog from './ImageSizeDialog';

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  className?: string;
  placeholder?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ 
  content, 
  onChange,
  className = '',
  placeholder = 'Matn kiriting...'
}) => {
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [pendingImageData, setPendingImageData] = useState<string | null>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showFontSizePicker, setShowFontSizePicker] = useState(false);

  // Custom paste handler for the editor
  const handlePaste = (e: React.ClipboardEvent) => {
    if (!e.clipboardData) return;
    
    // Prevent default paste behavior temporarily
    e.preventDefault();
    
    processClipboardData(e.clipboardData)
      .then(base64Data => {
        if (base64Data) {
          // Show image size dialog
          setPendingImageData(base64Data);
          setShowImageDialog(true);
        } else {
          // If no image found, proceed with default paste behavior
          const text = e.clipboardData.getData('text/plain');
          editor?.chain().focus().insertContent(text).run();
        }
      })
      .catch(err => {
        setError(err.message);
        setTimeout(() => setError(null), 5000);
        
        // Proceed with default paste behavior
        const text = e.clipboardData.getData('text/plain');
        editor?.chain().focus().insertContent(text).run();
      });
  };
  
  // Handle image size confirmation
  const handleImageSizeConfirm = (width: number, height: number) => {
    if (pendingImageData && editor) {
      // Insert image with HTML to ensure dimensions are applied
      const html = `<img src="${pendingImageData}" alt="Image" width="${width}" height="${height}" style="width: ${width}px; height: ${height}px;" />`;
      editor.chain().focus().insertContent(html).run();
      setPendingImageData(null);
      setShowImageDialog(false);
    }
  };
  
  // Handle image dialog cancel
  const handleImageDialogCancel = () => {
    setPendingImageData(null);
    setShowImageDialog(false);
  };

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false
      }),
      Image.configure({
        inline: false,
        allowBase64: true,
        HTMLAttributes: {
          class: 'resize-handle',
          style: 'max-width: 100%; height: auto;'
        }
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        alignments: ['left', 'center', 'right', 'justify'],
        defaultAlignment: 'left',
      }),
      TextStyle,
      Color,
    ],
    content,
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-xl p-4 focus:outline-none min-h-[200px]',
      },
      handleClick: (view, pos, event) => {
        // Check if clicked on an image
        const node = view.state.doc.nodeAt(pos);
        if (node && node.type.name === 'image') {
          // Find the DOM element
          const element = event.target as HTMLElement;
          if (element.tagName === 'IMG') {
            // Toggle resize-active class
            element.classList.toggle('resize-active');
            return true; // Handled
          }
        }
        return false; // Not handled
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    }
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    // cancelled
    if (url === null) {
      return;
    }

    // empty
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    // update link
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!validateImageFile(file)) {
      setError('Faqat rasm fayl formatiga ruxsat berilgan');
      setTimeout(() => setError(null), 5000);
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Rasm hajmi 5MB dan oshmasligi kerak');
      setTimeout(() => setError(null), 5000);
      return;
    }

    try {
      const base64Data = await imageToBase64(file);
      // Show image size dialog
      setPendingImageData(base64Data);
      setShowImageDialog(true);
      
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Image upload error:', error);
      setError('Rasmni yuklashda xatolik yuz berdi');
      setTimeout(() => setError(null), 5000);
    }
  };
  
  // Set text color
  const setTextColor = (color: string) => {
    editor.chain().focus().setColor(color).run();
    setShowColorPicker(false);
  };
  
  // Set font size
  const setFontSize = (size: string) => {
    // Apply font size using HTML span with inline style
    const { view } = editor;
    const { state } = view;
    const { from, to } = state.selection;
    
    if (from === to) {
      // If no text is selected, just close the picker
      setShowFontSizePicker(false);
      return;
    }
    
    // Get selected text
    const selectedText = state.doc.textBetween(from, to);
    
    // Create a span with the font size
    const html = `<span style="font-size: ${size};">${selectedText}</span>`;
    
    // Replace selected text with the styled span
    editor.chain().focus().deleteSelection().insertContent(html).run();
    
    setShowFontSizePicker(false);
  };

  return (
    <div className={`border border-gray-300 rounded-md overflow-hidden bg-white ${className}`}>
      <div className="flex flex-wrap gap-1 p-2 border-b border-gray-200 bg-gray-50">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('bold') ? 'bg-gray-200' : ''}`}
          title="Qalin qilish"
        >
          <Bold className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('italic') ? 'bg-gray-200' : ''}`}
          title="Kursiv qilish"
        >
          <Italic className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('underline') ? 'bg-gray-200' : ''}`}
          title="Chizish"
        >
          <UnderlineIcon className="h-5 w-5" />
        </button>
        <div className="w-px h-6 bg-gray-300 mx-1 self-center"></div>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('heading', { level: 1 }) ? 'bg-gray-200' : ''}`}
          title="Sarlavha 1"
        >
          <Heading1 className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('heading', { level: 2 }) ? 'bg-gray-200' : ''}`}
          title="Sarlavha 2"
        >
          <Heading2 className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('heading', { level: 3 }) ? 'bg-gray-200' : ''}`}
          title="Sarlavha 3"
        >
          <Heading3 className="h-5 w-5" />
        </button>
        <div className="w-px h-6 bg-gray-300 mx-1 self-center"></div>
        
        {/* Text alignment buttons */}
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive({ textAlign: 'left' }) ? 'bg-gray-200' : ''}`}
          title="Chapga tekislash"
        >
          <AlignLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive({ textAlign: 'center' }) ? 'bg-gray-200' : ''}`}
          title="Markazga tekislash"
        >
          <AlignCenter className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive({ textAlign: 'right' }) ? 'bg-gray-200' : ''}`}
          title="O'ngga tekislash"
        >
          <AlignRight className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive({ textAlign: 'justify' }) ? 'bg-gray-200' : ''}`}
          title="Kenglikka tekislash"
        >
          <AlignJustify className="h-5 w-5" />
        </button>
        
        <div className="w-px h-6 bg-gray-300 mx-1 self-center"></div>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('bulletList') ? 'bg-gray-200' : ''}`}
          title="Markerli ro'yxat"
        >
          <List className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('orderedList') ? 'bg-gray-200' : ''}`}
          title="Raqamli ro'yxat"
        >
          <ListOrdered className="h-5 w-5" />
        </button>
        <div className="w-px h-6 bg-gray-300 mx-1 self-center"></div>
        <button
          type="button"
          onClick={setLink}
          className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('link') ? 'bg-gray-200' : ''}`}
          title="Havola qo'shish"
        >
          <LinkIcon className="h-5 w-5" />
        </button>
        
        {/* Text color picker */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowColorPicker(!showColorPicker)}
            className="p-2 rounded hover:bg-gray-200"
            title="Matn rangini o'zgartirish"
          >
            <Palette className="h-5 w-5" />
          </button>
          {showColorPicker && (
            <div className="absolute top-full left-0 mt-1 p-2 bg-white shadow-lg rounded-md z-10 grid grid-cols-5 gap-1">
              {['#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', 
                '#FF00FF', '#00FFFF', '#FFA500', '#800080', '#008000',
                '#800000', '#008080', '#000080', '#FFC0CB', '#A52A2A',
                '#808080', '#C0C0C0', '#FFFFFF', '#4B0082', '#FF4500'].map(color => (
                <button
                  key={color}
                  onClick={() => setTextColor(color)}
                  className="w-6 h-6 rounded-full border border-gray-300"
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          )}
        </div>
        
        {/* Font size picker */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowFontSizePicker(!showFontSizePicker)}
            className="p-2 rounded hover:bg-gray-200"
            title="Shrift o'lchamini o'zgartirish"
          >
            <Type className="h-5 w-5" />
          </button>
          {showFontSizePicker && (
            <div className="absolute top-full left-0 mt-1 p-2 bg-white shadow-lg rounded-md z-10 w-32">
              {['8px', '10px', '12px', '14px', '16px', '18px', '20px', '24px', '30px', '36px', '48px', '60px'].map(size => (
                <button
                  key={size}
                  onClick={() => setFontSize(size)}
                  className="block w-full text-left px-2 py-1 hover:bg-gray-100 rounded"
                  style={{ fontSize: size }}
                >
                  {size}
                </button>
              ))}
            </div>
          )}
        </div>
        
        <div className="w-px h-6 bg-gray-300 mx-1 self-center"></div>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className={`p-2 rounded hover:bg-gray-200`}
          title="Rasm qo'shish"
        >
          <ImageIcon className="h-5 w-5" />
        </button>
        <input 
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleImageUpload}
        />
      </div>
      <EditorContent 
        editor={editor} 
        className="min-h-[200px] max-h-[600px] overflow-y-auto"
        onPaste={handlePaste}
      />
      {editor.isEmpty && (
        <div className="absolute top-16 left-6 text-gray-400 pointer-events-none">
          {placeholder}
        </div>
      )}
      
      {error && (
        <div className="p-2 bg-red-50 text-red-600 text-sm flex items-center border-t border-red-200">
          <AlertCircle className="h-4 w-4 mr-1" />
          {error}
        </div>
      )}
      
      {/* Image size dialog */}
      {showImageDialog && pendingImageData && (
        <ImageSizeDialog
          imageUrl={pendingImageData}
          onConfirm={handleImageSizeConfirm}
          onCancel={handleImageDialogCancel}
        />
      )}
    </div>
  );
};

export default RichTextEditor;