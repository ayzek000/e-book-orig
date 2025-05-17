import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Grip, Edit2, X } from 'lucide-react';
import { db } from '../../services/db';
import { Module } from '../../services/db';

const TableOfContentsEditor: React.FC = () => {
  const [modules, setModules] = useState<Module[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error' | null>(null);

  useEffect(() => {
    const loadModules = async () => {
      try {
        const bookId = 1; // Using default book ID
        const modulesList = await db.modules
          .where('bookId')
          .equals(bookId)
          .sortBy('order');
        
        setModules(modulesList);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading modules:', error);
        setIsLoading(false);
      }
    };
    
    loadModules();
  }, []);

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source } = result;
    
    // If dropped outside the list or no change in position
    if (!destination || destination.index === source.index) {
      return;
    }
    
    // Reorder the modules array
    const reorderedModules = Array.from(modules);
    const [removed] = reorderedModules.splice(source.index, 1);
    reorderedModules.splice(destination.index, 0, removed);
    
    // Update the order property for each module
    const updatedModules = reorderedModules.map((module, index) => ({
      ...module,
      order: index + 1
    }));
    
    setModules(updatedModules);
    
    // Save changes to the database
    await saveChanges(updatedModules);
  };
  
  const handleTitleChange = (id: number | undefined, newTitle: string) => {
    if (!id) return;
    
    const updatedModules = modules.map(module => 
      module.id === id ? { ...module, title: newTitle } : module
    );
    
    setModules(updatedModules);
  };
  
  const removeModule = async (id: number | undefined) => {
    if (!id) return;
    
    // Remove from state
    const updatedModules = modules.filter(module => module.id !== id);
    setModules(updatedModules);
    
    // Remove from database
    try {
      await db.modules.delete(id);
      
      // Update order for remaining modules
      const reindexedModules = updatedModules.map((module, index) => ({
        ...module,
        order: index + 1
      }));
      
      setModules(reindexedModules);
      
      // Save updated order to database
      await saveChanges(reindexedModules);
    } catch (error) {
      console.error('Error removing module:', error);
    }
  };

  const saveChanges = async (modulesToSave: Module[] = modules) => {
    setIsSaving(true);
    setSaveStatus('saving');
    
    try {
      // Update each module in the database
      for (const module of modulesToSave) {
        if (module.id) {
          await db.modules.update(module.id, {
            title: module.title,
            order: module.order
          });
        }
      }
      
      setSaveStatus('saved');
      
      // Reset status after 3 seconds
      setTimeout(() => {
        setSaveStatus(null);
      }, 3000);
    } catch (error) {
      console.error('Error saving table of contents:', error);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">Yuklanmoqda...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Mundarija</h1>
        <div className="flex items-center gap-2">
          {saveStatus === 'saved' && (
            <span className="text-green-500 text-sm">Saqlandi</span>
          )}
          {saveStatus === 'saving' && (
            <span className="text-gray-500 text-sm">Saqlanmoqda...</span>
          )}
          {saveStatus === 'error' && (
            <span className="text-red-500 text-sm">Xatolik yuz berdi</span>
          )}
          <button
            onClick={() => saveChanges()}
            disabled={isSaving}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-300 transition"
          >
            Saqlash
          </button>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-sm text-gray-500 mb-4">
          Bo'limlar tartibini o'zgartirish uchun, ularni yuqoriga yoki pastga torting. Bo'lim sarlavhasini o'zgartirish uchun matn maydonini tahrirlang.
        </p>
        
        {modules.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Bo'limlar mavjud emas</p>
            <p className="text-sm text-gray-400 mt-2">
              Bo'limlar qo'shish uchun "Bo'limlar" sahifasiga o'ting
            </p>
          </div>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="modules">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-2"
                >
                  {modules.map((module, index) => (
                    <Draggable 
                      key={module.id?.toString() || index.toString()} 
                      draggableId={module.id?.toString() || index.toString()} 
                      index={index}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className="flex items-center p-3 bg-gray-50 rounded-md border border-gray-200 group"
                        >
                          <div 
                            {...provided.dragHandleProps}
                            className="mr-3 text-gray-400 cursor-grab active:cursor-grabbing"
                          >
                            <Grip className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <input
                              type="text"
                              value={module.title}
                              onChange={(e) => handleTitleChange(module.id, e.target.value)}
                              className="w-full px-2 py-1 border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                          </div>
                          <button
                            onClick={() => removeModule(module.id)}
                            className="ml-2 p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="O'chirish"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </div>
    </div>
  );
};

export default TableOfContentsEditor;