/**
 * Сервис для управления PDF-файлами
 * Этот сервис позволяет сохранять PDF-файлы в статическую папку public/pdfs
 * и получать список доступных PDF-файлов
 */

export interface PdfFile {
  id: string;
  name: string;
  url: string;
  size: number;
  lastModified: string;
}

// Имитация базы данных для хранения информации о PDF-файлах
// В реальном приложении эта информация должна храниться в базе данных или в JSON-файле
const pdfFilesStore: PdfFile[] = [
  {
    id: '1',
    name: 'Книга 1.pdf',
    url: '/pdfs/book1.pdf',
    size: 1024 * 1024 * 2.5, // 2.5 MB
    lastModified: '2025-05-17'
  },
  {
    id: '2',
    name: 'Книга 2.pdf',
    url: '/pdfs/book2.pdf',
    size: 1024 * 1024 * 1.8, // 1.8 MB
    lastModified: '2025-05-16'
  }
];

/**
 * Получить список всех PDF-файлов
 */
export function getAllPdfFiles(): PdfFile[] {
  return [...pdfFilesStore];
}

/**
 * Получить PDF-файл по ID
 */
export function getPdfFileById(id: string): PdfFile | undefined {
  return pdfFilesStore.find(file => file.id === id);
}

/**
 * Добавить новый PDF-файл
 * В реальном приложении здесь должна быть логика для сохранения файла в папку public/pdfs
 */
export function addPdfFile(file: File): Promise<PdfFile> {
  return new Promise((resolve) => {
    // Имитация задержки при загрузке файла
    setTimeout(() => {
      const newPdfFile: PdfFile = {
        id: Date.now().toString(),
        name: file.name,
        url: `/pdfs/${file.name.replace(/\s+/g, '_')}`,
        size: file.size,
        lastModified: new Date().toISOString().split('T')[0]
      };
      
      pdfFilesStore.push(newPdfFile);
      resolve(newPdfFile);
    }, 1000);
  });
}

/**
 * Удалить PDF-файл по ID
 * В реальном приложении здесь должна быть логика для удаления файла из папки public/pdfs
 */
export function deletePdfFile(id: string): Promise<boolean> {
  return new Promise((resolve) => {
    // Имитация задержки при удалении файла
    setTimeout(() => {
      const index = pdfFilesStore.findIndex(file => file.id === id);
      if (index !== -1) {
        pdfFilesStore.splice(index, 1);
        resolve(true);
      } else {
        resolve(false);
      }
    }, 500);
  });
}

/**
 * Получить URL для скачивания PDF-файла
 */
export function getPdfDownloadUrl(id: string): string | null {
  const file = getPdfFileById(id);
  return file ? file.url : null;
}

/**
 * Форматировать размер файла для отображения
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
}
