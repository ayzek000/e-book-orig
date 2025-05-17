import { jsPDF } from 'jspdf';
import htmlToPdfmake from 'html-to-pdfmake';
import pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { db } from './db';

// Configure pdfMake with fonts
(pdfMake as any).vfs = pdfFonts.pdfMake?.vfs || {};

// Helper function to clean HTML for PDF conversion
const cleanHtml = (html: string): string => {
  // Create a temporary div
  const temp = document.createElement('div');
  temp.innerHTML = html;
  
  // Find all images and set max width/height
  const images = temp.querySelectorAll('img');
  images.forEach(img => {
    img.style.maxWidth = '500px';
    img.style.maxHeight = '300px';
  });
  
  return temp.innerHTML;
};

export const exportBookToPDF = async (): Promise<void> => {
  try {
    // Get book data
    const book = await db.books.get(1);
    if (!book) {
      throw new Error('Kitob topilmadi');
    }
    
    // Get modules sorted by order
    const modules = await db.modules
      .where('bookId')
      .equals(book.id || 1)
      .sortBy('order');

    // Create document definition
    const docDefinition = {
      content: [
        { text: book.title, style: 'header' },
        { text: '\n\n' }, // Add some spacing
        // Welcome content
        { text: 'Kirish', style: 'sectionHeader' },
        htmlToPdfmake(cleanHtml(book.welcomeContent)),
        { text: '\n\n' },
        // Table of contents
        { text: 'Mundarija', style: 'sectionHeader' },
        ...modules.map((module, index) => ({
          text: `${index + 1}. ${module.title}`,
          style: 'tocItem'
        })),
        { text: '\n\n' },
        // Modules content
        ...modules.flatMap(module => {
          const moduleContent = [
            { text: module.title, style: 'sectionHeader' },
            htmlToPdfmake(cleanHtml(module.content))
          ];
          
          // Add PDF attachment reference if exists
          if (module.pdfAttachment) {
            moduleContent.push(
              { text: '\n' },
              { 
                text: `📎 PDF ilova: ${module.pdfAttachment.name}`, 
                style: 'pdfAttachment',
                color: '#3730a3'
              }
            );
          }
          
          moduleContent.push({ text: '\n\n' });
          return moduleContent;
        }),
        // Bibliography
        { text: 'Adabiyotlar ro\'yxati', style: 'sectionHeader' },
        htmlToPdfmake(cleanHtml(book.bibliography))
      ],
      styles: {
        header: {
          fontSize: 24,
          bold: true,
          alignment: 'center',
          margin: [0, 0, 0, 20]
        },
        sectionHeader: {
          fontSize: 18,
          bold: true,
          margin: [0, 10, 0, 10]
        },
        tocItem: {
          fontSize: 12,
          margin: [20, 5, 0, 0]
        },
        pdfAttachment: {
          fontSize: 12,
          italics: true,
          color: '#3730a3',
          margin: [0, 5, 0, 5]
        }
      },
      defaultStyle: {
        font: 'Roboto',
        fontSize: 12
      }
    };

    // Generate and download PDF
    pdfMake.createPdf(docDefinition).download(`${book.title || 'e-kitob'}.pdf`);
    
  } catch (error) {
    console.error('PDF export error:', error);
    throw error;
  }
};