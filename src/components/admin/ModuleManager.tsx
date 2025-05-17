import { useState, useEffect } from 'react';
import { PlusCircle, Edit, Trash2, Save, X, FileText, Loader, CheckCircle, AlertCircle, BookOpen, Upload, RefreshCw } from 'lucide-react';
import RichTextEditor from '../common/RichTextEditor';
import PdfAttachment from '../common/PdfAttachment';
import DocumentImporter from './DocumentImporter';
import { db, Module, getDefaultBookId } from '../../services/db';
import { savePdfToModule, backupAllPdfAttachments, verifyAllPdfAttachments, restorePdfAttachmentsFromBackup } from '../../services/pdfStorage';

const ModuleManager = () => {
  const [modules, setModules] = useState<Module[]>([]);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newModule, setNewModule] = useState<Omit<Module, 'id'>>({
    bookId: 1,
    title: '',
    content: '',
    order: 0,
    pdfAttachment: undefined
  });
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error' | null>(null);
  const [showImporter, setShowImporter] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [backupStatus, setBackupStatus] = useState<'success' | 'error' | null>(null);

  useEffect(() => {
    loadModules();
    
    // Автоматическое создание резервной копии PDF-файлов при загрузке компонента
    backupAllPdfAttachments().then(success => {
      console.log('PDF backup created:', success ? 'success' : 'partial');
    });
  }, []);
  
  const loadModules = async () => {
    try {
      setIsLoading(true);
      const bookId = await getDefaultBookId();
      const modulesList = await db.modules
        .where('bookId')
        .equals(bookId)
        .sortBy('order');
      
      setModules(modulesList);
      
      // Update new module's bookId and order
      setNewModule(prev => ({
        ...prev,
        bookId,
        order: modulesList.length + 1
      }));
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading modules:', error);
      setIsLoading(false);
    }
  };
  
  const handleImportComplete = () => {
    // Перезагрузить список модулей после импорта
    loadModules();
    setShowImporter(false);
  };

  const handleCreateModule = async () => {
    if (!newModule.title.trim()) {
      alert('Bo\'lim sarlavhasini kiriting');
      return;
    }
    
    setSaveStatus('saving');
    
    try {
      const id = await db.modules.add(newModule);
      
      // Если есть PDF-вложение, используем улучшенный сервис для его сохранения
      if (newModule.pdfAttachment) {
        const pdfSaved = await savePdfToModule(id, newModule.pdfAttachment);
        if (!pdfSaved) {
          console.warn('PDF attachment may not have been saved properly');
        }
      }
      
      const createdModule = await db.modules.get(id);
      if (createdModule) {
        setModules([...modules, createdModule]);
      }
      
      // Reset form
      setNewModule({
        bookId: newModule.bookId,
        title: '',
        content: '',
        order: modules.length + 2, // for the next module
        pdfAttachment: undefined
      });
      
      setIsCreating(false);
      setSaveStatus('saved');
      
      // Создаем резервную копию после успешного создания
      backupAllPdfAttachments();
      
      // Reset status after 3 seconds
      setTimeout(() => {
        setSaveStatus(null);
      }, 3000);
    } catch (error) {
      console.error('Error creating module:', error);
      setSaveStatus('error');
    }
  };

  const handleEditModule = (module: Module) => {
    setEditingModule(module);
  };

  const handleSaveEdit = async () => {
    if (!editingModule || !editingModule.id) return;
    
    setSaveStatus('saving');
    
    try {
      // Обновляем основные данные модуля
      await db.modules.update(editingModule.id, {
        title: editingModule.title,
        content: editingModule.content,
        pdfAttachment: editingModule.pdfAttachment
      });
      
      // Если есть PDF-вложение, используем улучшенный сервис для его сохранения
      if (editingModule.pdfAttachment) {
        const pdfSaved = await savePdfToModule(editingModule.id, editingModule.pdfAttachment);
        if (!pdfSaved) {
          console.warn('PDF attachment may not have been saved properly');
        }
      }
      
      // Update modules list
      setModules(modules.map(m => 
        m.id === editingModule.id ? editingModule : m
      ));
      
      // Exit edit mode
      setEditingModule(null);
      setSaveStatus('saved');
      
      // Создаем резервную копию после успешного сохранения
      backupAllPdfAttachments();
      
      // Reset status after 3 seconds
      setTimeout(() => {
        setSaveStatus(null);
      }, 3000);
    } catch (error) {
      console.error('Error updating module:', error);
      setSaveStatus('error');
    }
  };

  const handleDeleteModule = async (id: number | undefined) => {
    if (!id) return;
    
    if (!confirm('Haqiqatan ham bu bo\'limni o\'chirmoqchimisiz?')) {
      return;
    }
    
    try {
      // Создаем резервную копию перед удалением
      await backupAllPdfAttachments();
      
      await db.modules.delete(id);
      
      // Remove from state
      const updatedModules = modules.filter(m => m.id !== id);
      
      // Reindex remaining modules
      const reindexedModules = updatedModules.map((m, index) => ({
        ...m,
        order: index + 1
      }));
      
      // Update order in database
      for (const module of reindexedModules) {
        if (module.id) {
          await db.modules.update(module.id, { order: module.order });
        }
      }
      
      setModules(reindexedModules);
    } catch (error) {
      console.error('Error deleting module:', error);
      alert('Xatolik yuz berdi');
    }
  };
  
  // Функция для создания резервной копии всех PDF-файлов
  const handleBackupPdfs = async () => {
    setIsBackingUp(true);
    setBackupStatus(null);
    
    try {
      const success = await backupAllPdfAttachments();
      setBackupStatus(success ? 'success' : 'error');
      
      // Проверяем все PDF-вложения на целостность
      const problematicModules = await verifyAllPdfAttachments();
      if (problematicModules.length > 0) {
        console.warn('Found problematic PDF attachments:', problematicModules);
        // Пытаемся восстановить из резервной копии
        const restoredCount = await restorePdfAttachmentsFromBackup();
        if (restoredCount > 0) {
          console.log(`Restored ${restoredCount} PDF attachments from backup`);
          // Перезагружаем список модулей
          await loadModules();
        }
      }
      
      setTimeout(() => {
        setBackupStatus(null);
      }, 3000);
    } catch (error) {
      console.error('Error backing up PDFs:', error);
      setBackupStatus('error');
    } finally {
      setIsBackingUp(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header with actions */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-primary-900">Bo'limlar</h1>
        <div className="flex space-x-3">
          <button
            onClick={handleBackupPdfs}
            className="btn btn-soft-primary"
            disabled={isBackingUp}
            title="PDF fayllarni zaxiralash"
          >
            <RefreshCw className={`h-5 w-5 mr-2 ${isBackingUp ? 'animate-spin' : ''}`} />
            PDF zaxiralash
          </button>
          <button
            onClick={() => setShowImporter(true)}
            className="btn btn-secondary shadow-glow-secondary"
            disabled={isCreating || !!editingModule}
          >
            <Upload className="h-5 w-5 mr-2" />
            Fayl yuklash
          </button>
          <button
            onClick={() => setIsCreating(true)}
            className="btn btn-primary shadow-glow-primary"
            disabled={isCreating || !!editingModule || showImporter}
          >
            <PlusCircle className="h-5 w-5 mr-2" />
            Yangi bo'lim
          </button>
        </div>
      </div>
      
      {/* Document Importer */}
      {showImporter && (
        <DocumentImporter onImportComplete={handleImportComplete} />
      )}

      {/* Status feedback */}
      {saveStatus && (
        <div className={`fixed bottom-4 right-4 p-4 rounded-xl shadow-lg flex items-center ${saveStatus === 'saved' ? 'bg-green-100 text-green-800' : saveStatus === 'saving' ? 'bg-primary-100 text-primary-800' : 'bg-red-100 text-red-800'}`}>
          {saveStatus === 'saved' && <CheckCircle className="h-5 w-5 mr-2" />}
          {saveStatus === 'saving' && <Loader className="h-5 w-5 mr-2 animate-spin" />}
          {saveStatus === 'error' && <AlertCircle className="h-5 w-5 mr-2" />}
          <span>
            {saveStatus === 'saved' && 'Muvaffaqiyatli saqlandi!'}
            {saveStatus === 'saving' && 'Saqlanmoqda...'}
            {saveStatus === 'error' && 'Xatolik yuz berdi!'}
          </span>
        </div>
      )}
      
      {/* Backup status feedback */}
      {backupStatus && (
        <div className={`fixed bottom-4 left-4 p-4 rounded-xl shadow-lg flex items-center ${backupStatus === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {backupStatus === 'success' && <CheckCircle className="h-5 w-5 mr-2" />}
          {backupStatus === 'error' && <AlertCircle className="h-5 w-5 mr-2" />}
          <span>
            {backupStatus === 'success' && 'PDF fayllar muvaffaqiyatli zaxiralandi!'}
            {backupStatus === 'error' && 'PDF fayllarni zaxiralashda xatolik!'}
          </span>
        </div>
      )}

      {/* Loading state */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center mb-4 animate-pulse">
              <Loader className="h-6 w-6 text-primary-500 animate-spin" />
            </div>
            <span className="text-neutral-500">Yuklanmoqda...</span>
          </div>
        </div>
      ) : (
        <>
          {/* Create new module form */}
          {isCreating && (
            <div className="card-glass p-6 mb-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-primary-900">Yangi bo'lim yaratish</h2>
                <button
                  onClick={() => setIsCreating(false)}
                  className="btn btn-icon btn-ghost text-neutral-500"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="mb-4">
                <label htmlFor="newModuleTitle" className="form-label">
                  Bo'lim sarlavhasi
                </label>
                <input
                  type="text"
                  id="newModuleTitle"
                  value={newModule.title}
                  onChange={(e) => setNewModule({ ...newModule, title: e.target.value })}
                  className="form-input"
                  placeholder="Masalan: Kirish"
                />
              </div>
              
              <div className="mb-6">
                <label className="form-label">
                  Bo'lim mazmuni
                </label>
                <RichTextEditor
                  content={newModule.content}
                  onChange={(html) => setNewModule({ ...newModule, content: html })}
                />
              </div>
              
              <PdfAttachment
                pdfAttachment={newModule.pdfAttachment}
                onChange={(attachment) => setNewModule({ ...newModule, pdfAttachment: attachment })}
              />
              
              <div className="flex justify-end mt-6">
                <button
                  onClick={handleCreateModule}
                  className="btn btn-primary shadow-glow-primary"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Saqlash
                </button>
              </div>
            </div>
          )}
          
          {/* Edit module form */}
          {editingModule && (
            <div className="card-glass p-6 mb-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-primary-900">Bo'limni tahrirlash</h2>
                <button
                  onClick={() => setEditingModule(null)}
                  className="btn btn-icon btn-ghost text-neutral-500"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="mb-4">
                <label htmlFor="editModuleTitle" className="form-label">
                  Bo'lim sarlavhasi
                </label>
                <input
                  type="text"
                  id="editModuleTitle"
                  value={editingModule.title}
                  onChange={(e) => setEditingModule({ ...editingModule, title: e.target.value })}
                  className="form-input"
                />
              </div>
              
              <div className="mb-6">
                <label className="form-label">
                  Bo'lim mazmuni
                </label>
                <RichTextEditor
                  content={editingModule.content}
                  onChange={(html) => setEditingModule({ ...editingModule, content: html })}
                />
              </div>
              
              <PdfAttachment
                pdfAttachment={editingModule.pdfAttachment}
                onChange={(attachment) => setEditingModule({ ...editingModule, pdfAttachment: attachment })}
              />
              
              <div className="flex justify-end mt-6">
                <button
                  onClick={handleSaveEdit}
                  className="btn btn-primary shadow-glow-primary"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Saqlash
                </button>
              </div>
            </div>
          )}

          {/* Modules list */}
          <div className="card-glass overflow-hidden">
            <div className="p-4 bg-primary-50 border-b border-primary-100 flex items-center justify-between">
              <h2 className="font-semibold text-primary-900">Bo'limlar ro'yxati</h2>
              <div className="text-sm text-neutral-500">{modules.length} ta bo'lim</div>
            </div>

            {modules.length === 0 ? (
              <div className="p-8 text-center">
                <div className="bg-neutral-50 rounded-full p-4 inline-flex mb-4">
                  <BookOpen className="h-8 w-8 text-neutral-400" />
                </div>
                <p className="text-neutral-600 font-medium">Bo'limlar mavjud emas</p>
                <p className="text-sm text-neutral-500 mt-2">
                  Yuqoridagi "Yangi bo'lim" tugmasini bosib, bo'lim qo'shing
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-neutral-200">
                {modules.map((module) => (
                  <li key={module.id} className="p-4 hover:bg-neutral-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 pr-4">
                        <h3 className="font-medium text-primary-900">{module.title}</h3>
                        <p className="text-sm text-neutral-600 mt-2 line-clamp-2">
                          {module.content.replace(/<[^>]*>/g, '').substring(0, 300)}
                          {module.content.length > 300 ? '...' : ''}
                        </p>
                        {module.pdfAttachment && (
                          <div className="flex items-center mt-2 bg-primary-50 text-primary-700 px-2 py-1 rounded-md inline-flex">
                            <FileText className="h-4 w-4 mr-1" />
                            <span className="text-xs font-medium">{typeof module.pdfAttachment === 'object' ? module.pdfAttachment.name : module.pdfAttachment}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex space-x-1">
                        <button
                          onClick={() => handleEditModule(module)}
                          className="btn btn-icon btn-ghost text-neutral-600 hover:text-primary-600"
                          title="Tahrirlash"
                          aria-label="Tahrirlash"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteModule(module.id)}
                          className="btn btn-icon btn-ghost text-neutral-600 hover:text-danger-600"
                          title="O'chirish"
                          aria-label="O'chirish"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ModuleManager;
