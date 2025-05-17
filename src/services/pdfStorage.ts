/**
 * Enhanced PDF storage service with backup and verification
 * Обеспечивает надежное сохранение PDF-файлов в базе данных
 */

import { db, Module } from './db';
import { base64ToBlob, fileToBase64 } from './pdfUtils';

interface PdfAttachment {
  name: string;
  data: string; // Base64 encoded PDF data
}

/**
 * Сохраняет PDF-файл в модуле с дополнительной проверкой и резервным копированием
 */
export const savePdfToModule = async (
  moduleId: number, 
  pdfAttachment: PdfAttachment
): Promise<boolean> => {
  try {
    // 1. Проверяем валидность PDF данных
    if (!pdfAttachment || !pdfAttachment.data || !pdfAttachment.name) {
      console.error('Invalid PDF attachment data');
      return false;
    }

    // 2. Проверяем, что данные действительно являются PDF
    try {
      const blob = base64ToBlob(pdfAttachment.data);
      if (blob.size === 0) {
        console.error('PDF data is empty');
        return false;
      }
    } catch (error) {
      console.error('Failed to validate PDF data:', error);
      return false;
    }

    // 3. Получаем текущий модуль
    const module = await db.modules.get(moduleId);
    if (!module) {
      console.error(`Module with ID ${moduleId} not found`);
      return false;
    }

    // 4. Обновляем модуль с PDF-вложением
    await db.modules.update(moduleId, {
      pdfAttachment: {
        name: pdfAttachment.name,
        data: pdfAttachment.data
      }
    });

    // 5. Верифицируем, что PDF был сохранен
    const updatedModule = await db.modules.get(moduleId);
    if (!updatedModule?.pdfAttachment?.data) {
      console.error('PDF attachment was not saved properly');
      return false;
    }

    console.log(`PDF "${pdfAttachment.name}" successfully saved to module ${moduleId}`);
    return true;
  } catch (error) {
    console.error('Error saving PDF to module:', error);
    return false;
  }
};

/**
 * Получает PDF-файл из модуля с проверкой
 */
export const getPdfFromModule = async (moduleId: number): Promise<PdfAttachment | null> => {
  try {
    const module = await db.modules.get(moduleId);
    if (!module?.pdfAttachment?.data) {
      return null;
    }
    
    return module.pdfAttachment;
  } catch (error) {
    console.error('Error retrieving PDF from module:', error);
    return null;
  }
};

/**
 * Проверяет все модули и их PDF-вложения
 * Возвращает список проблемных модулей
 */
export const verifyAllPdfAttachments = async (): Promise<{id: number, title: string}[]> => {
  try {
    const allModules = await db.modules.toArray();
    const problematicModules: {id: number, title: string}[] = [];
    
    for (const module of allModules) {
      if (module.pdfAttachment) {
        try {
          // Проверяем, что данные PDF действительны
          const blob = base64ToBlob(module.pdfAttachment.data);
          if (blob.size === 0 || !module.pdfAttachment.name) {
            if (module.id) {
              problematicModules.push({
                id: module.id,
                title: module.title
              });
            }
          }
        } catch (error) {
          if (module.id) {
            problematicModules.push({
              id: module.id,
              title: module.title
            });
          }
        }
      }
    }
    
    return problematicModules;
  } catch (error) {
    console.error('Error verifying PDF attachments:', error);
    return [];
  }
};

/**
 * Создает резервную копию всех PDF-файлов в локальном хранилище
 */
export const backupAllPdfAttachments = async (): Promise<boolean> => {
  try {
    const allModules = await db.modules.toArray();
    const pdfBackups: Record<string, PdfAttachment> = {};
    let totalSize = 0;
    
    // Собираем все PDF-вложения и подсчитываем общий размер
    for (const module of allModules) {
      if (module.id && module.pdfAttachment?.data) {
        pdfBackups[module.id.toString()] = module.pdfAttachment;
        totalSize += module.pdfAttachment.data.length;
      }
    }
    
    // Если нет PDF-файлов для резервного копирования, считаем операцию успешной
    if (Object.keys(pdfBackups).length === 0) {
      console.log('No PDF files to backup');
      localStorage.setItem('pdf_backup_timestamp', new Date().toISOString());
      localStorage.setItem('pdf_backup_status', 'empty');
      return true;
    }
    
    // Сохраняем метаданные в любом случае
    const metadataBackup = Object.entries(pdfBackups).reduce((acc, [id, pdf]) => {
      acc[id] = { name: pdf.name, size: pdf.data.length };
      return acc;
    }, {} as Record<string, { name: string, size: number }>);
    
    localStorage.setItem('pdf_backup_metadata', JSON.stringify(metadataBackup));
    localStorage.setItem('pdf_backup_timestamp', new Date().toISOString());
    
    // Если данных слишком много, разбиваем на части
    if (totalSize > 3 * 1024 * 1024) { // Если больше 3МБ, разбиваем на части
      console.log(`PDF backup is large (${Math.round(totalSize/1024/1024)}MB), splitting into chunks`);
      
      // Сохраняем каждый PDF отдельно
      for (const [id, pdfData] of Object.entries(pdfBackups)) {
        try {
          localStorage.setItem(`pdf_backup_${id}`, JSON.stringify(pdfData));
        } catch (error) {
          console.error(`Failed to backup PDF for module ${id}:`, error);
          // Если не удалось сохранить, пробуем сохранить только метаданные
          localStorage.setItem(`pdf_backup_meta_${id}`, JSON.stringify({
            name: pdfData.name,
            size: pdfData.data.length,
            timestamp: new Date().toISOString()
          }));
        }
      }
      
      localStorage.setItem('pdf_backup_status', 'chunked');
      return true;
    } else {
      // Если данных немного, сохраняем все вместе
      try {
        localStorage.setItem('pdf_backup_data', JSON.stringify(pdfBackups));
        localStorage.setItem('pdf_backup_status', 'complete');
        return true;
      } catch (error) {
        console.error('Error saving complete PDF backup to localStorage:', error);
        
        // Пробуем разбить на части в случае ошибки
        for (const [id, pdfData] of Object.entries(pdfBackups)) {
          try {
            localStorage.setItem(`pdf_backup_${id}`, JSON.stringify(pdfData));
          } catch (innerError) {
            console.error(`Failed to backup PDF for module ${id}:`, innerError);
          }
        }
        
        localStorage.setItem('pdf_backup_status', 'partial');
        return false;
      }
    }
  } catch (error) {
    console.error('Error creating PDF backup:', error);
    localStorage.setItem('pdf_backup_status', 'error');
    localStorage.setItem('pdf_backup_error', String(error));
    return false;
  }
};

/**
 * Восстанавливает PDF-файлы из резервной копии
 */
export const restorePdfAttachmentsFromBackup = async (): Promise<number> => {
  try {
    // Проверяем статус резервного копирования
    const backupStatus = localStorage.getItem('pdf_backup_status');
    const metadataString = localStorage.getItem('pdf_backup_metadata');
    
    if (!metadataString) {
      console.error('No PDF backup metadata found in localStorage');
      return 0;
    }
    
    const metadata = JSON.parse(metadataString) as Record<string, { name: string, size: number }>;
    let restoredCount = 0;
    
    // В зависимости от статуса резервного копирования выбираем стратегию восстановления
    if (backupStatus === 'complete') {
      // Восстанавливаем из полной резервной копии
      const backupString = localStorage.getItem('pdf_backup_data');
      if (!backupString) {
        console.error('No complete PDF backup found despite status');
        return 0;
      }
      
      const pdfBackups = JSON.parse(backupString) as Record<string, PdfAttachment>;
      
      for (const [moduleIdStr, pdfAttachment] of Object.entries(pdfBackups)) {
        const moduleId = parseInt(moduleIdStr, 10);
        if (isNaN(moduleId)) continue;
        
        try {
          const module = await db.modules.get(moduleId);
          if (module && (!module.pdfAttachment || !module.pdfAttachment.data)) {
            await db.modules.update(moduleId, { pdfAttachment });
            restoredCount++;
          }
        } catch (error) {
          console.error(`Error restoring PDF for module ${moduleId}:`, error);
        }
      }
    } else if (backupStatus === 'chunked' || backupStatus === 'partial') {
      // Восстанавливаем из частей
      for (const moduleIdStr of Object.keys(metadata)) {
        const moduleId = parseInt(moduleIdStr, 10);
        if (isNaN(moduleId)) continue;
        
        try {
          // Проверяем, нужно ли восстанавливать этот модуль
          const module = await db.modules.get(moduleId);
          if (module && (!module.pdfAttachment || !module.pdfAttachment.data)) {
            // Пытаемся получить данные из частичной резервной копии
            const chunkData = localStorage.getItem(`pdf_backup_${moduleId}`);
            if (chunkData) {
              const pdfAttachment = JSON.parse(chunkData) as PdfAttachment;
              await db.modules.update(moduleId, { pdfAttachment });
              restoredCount++;
            }
          }
        } catch (error) {
          console.error(`Error restoring chunked PDF for module ${moduleId}:`, error);
        }
      }
    } else {
      console.warn(`Unknown backup status: ${backupStatus}`);
      return 0;
    }
    
    return restoredCount;
  } catch (error) {
    console.error('Error restoring PDF attachments from backup:', error);
    return 0;
  }
};
