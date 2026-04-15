'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  SettingsIcon, XIcon, CheckIcon, ImportIcon, ExportIcon, StyleIcon, BackupIcon
} from '@/components/icons/Icons';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogClose, DialogTrigger, DialogTitle } from '@/components/ui/dialog';
import { exportToCSV, exportToJSON, getWorkouts, saveWorkouts, getAppFont, setAppFont } from '@/lib/storage';
import { useFitnessStore } from '@/lib/store';
import { cn } from '@/lib/utils';

// Доступные стили приложения
const AVAILABLE_FONTS = [
  { id: 'inter', name: 'По умолчанию', family: 'var(--font-inter)', isDefault: true },
  { id: 'retro', name: 'Retro', family: 'Monocraft', isDefault: false, isRetro: true },
] as const;

type FontId = typeof AVAILABLE_FONTS[number]['id'];

export function SettingsPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDefaultStyle, setIsDefaultStyle] = useState(true);
  const [importStatus, setImportStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [testDataStatus, setTestDataStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [showTestDataSection, setShowTestDataSection] = useState(false);
  const [tapCount, setTapCount] = useState(0);
  const [lastTapTime, setLastTapTime] = useState(0);
  const [selectedFont, setSelectedFont] = useState<FontId>('inter');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { importData, refreshWorkouts } = useFitnessStore();

  // Export handlers
  const handleExportCSV = () => {
    const csv = exportToCSV();
    if (csv) {
      const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `fitness-journal-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
    }
  };

  const handleExportJSON = () => {
    const json = exportToJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `fitness-journal-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  // Import handler
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileName = file.name.toLowerCase();
    const isJson = fileName.endsWith('.json');
    const isCsv = fileName.endsWith('.csv');

    if (!isJson && !isCsv) {
      setImportStatus({ type: 'error', message: 'Поддерживаются только .json и .csv файлы' });
      return;
    }

    try {
      const content = await file.text();
      const result = importData(content, isJson ? 'json' : 'csv');
      setImportStatus({ type: result.success ? 'success' : 'error', message: result.message });
      
      if (result.success) {
        refreshWorkouts();
      }
    } catch {
      setImportStatus({ type: 'error', message: 'Ошибка при чтении файла' });
    }

    e.target.value = '';
  };

  // Load test data
  const handleLoadTestData = async () => {
    setTestDataStatus({ type: 'success', message: 'Загрузка...' });
    
    try {
      // Определяем basePath по текущему URL
      const basePath = window.location.pathname.startsWith('/MyFitTracker') ? '/MyFitTracker' : '';
      const response = await fetch(`${basePath}/test-data/fitness-journal.json`);
      if (!response.ok) {
        throw new Error('Файл не найден');
      }
      const testJSON = await response.text();
      const result = importData(testJSON, 'json');
      setTestDataStatus({ type: result.success ? 'success' : 'error', message: result.message });

      if (result.success) {
        refreshWorkouts();
      }
    } catch (error) {
      setTestDataStatus({ type: 'error', message: 'Ошибка загрузки файла' });
    }
  };

  // Clear test data
  const handleClearTestData = () => {
    saveWorkouts([]);
    refreshWorkouts();
    setTestDataStatus({ type: 'success', message: 'Данные очищены' });
  };

  // Handle secret tap on header left area
  const handleSecretTap = () => {
    const now = Date.now();
    const timeDiff = now - lastTapTime;
    
    if (timeDiff < 500) {
      // Quick tap within 500ms
      const newCount = tapCount + 1;
      setTapCount(newCount);
      setLastTapTime(now);
      
      if (newCount >= 3) {
        setShowTestDataSection(true);
        setTapCount(0);
      }
    } else {
      // Reset count if too slow
      setTapCount(1);
      setLastTapTime(now);
    }
  };

  // Load saved font on mount
  useEffect(() => {
    const savedFont = getAppFont() as FontId | null;
    if (savedFont && AVAILABLE_FONTS.some(f => f.id === savedFont)) {
      setSelectedFont(savedFont);
      applyFont(savedFont);
    }
    // Проверяем, является ли стиль по умолчанию
    setIsDefaultStyle(!savedFont || savedFont === 'inter');
  }, []);

  // Apply font to body
  const applyFont = (fontId: FontId) => {
    const font = AVAILABLE_FONTS.find(f => f.id === fontId);
    if (font) {
      document.body.style.fontFamily = font.family;
      
      // Toggle retro mode class
      if (font.isRetro) {
        document.body.classList.add('retro-mode');
      } else {
        document.body.classList.remove('retro-mode');
      }
    }
  };

  // Handle font change
  const handleFontChange = (fontId: string) => {
    const typedFontId = fontId as FontId;
    setSelectedFont(typedFontId);
    setAppFont(fontId);
    applyFont(typedFontId);
    setIsDefaultStyle(fontId === 'inter');
  };

  // Handle open change
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      setImportStatus(null);
      setTestDataStatus(null);
      setShowTestDataSection(false);
      setTapCount(0);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="border-zinc-700 text-zinc-300 hover:text-white active:text-white hover:bg-zinc-800 active:bg-zinc-800"
        >
          <SettingsIcon className="w-6 h-6" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-zinc-900 border-zinc-700 max-h-[90vh] overflow-y-auto p-0 gap-0" showCloseButton={false}>
        {/* Header with title and close button */}
        <div className="flex items-center justify-between px-4 pt-4 relative">
          <div className="relative">
            {/* Secret tap area over title */}
            <div 
              className="absolute inset-0 cursor-default z-10"
              onClick={handleSecretTap}
            />
            <DialogTitle className="text-white font-medium text-base">Инструменты</DialogTitle>
          </div>
          <DialogClose className="rounded-lg opacity-70 transition-opacity hover:opacity-100 active:opacity-100 focus:outline-none text-zinc-400 hover:text-white active:text-white">
            <XIcon className="w-4 h-4" />
          </DialogClose>
        </div>

        <div className="px-4 pt-4 pb-4 flex flex-col gap-4">
          {/* Font Selection Section */}
          <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
            <div className="flex items-center gap-2 mb-4">
              <StyleIcon className="w-4 h-4" style={{ color: '#c93843' }} />
              <h4 className="text-sm font-medium text-white">Стиль приложения</h4>
            </div>
            
            <Select value={selectedFont} onValueChange={handleFontChange}>
              <SelectTrigger className="w-full border-zinc-600 bg-zinc-800 text-white">
                <SelectValue placeholder="Выберите стиль" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-800 border-zinc-600">
                {AVAILABLE_FONTS.map((font) => (
                  <SelectItem 
                    key={font.id} 
                    value={font.id}
                    className="text-white focus:bg-zinc-700"
                  >
                    {font.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Import/Export section */}
          <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
            <div className="flex items-center gap-2 mb-4">
              <BackupIcon className="w-4 h-4" style={{ color: '#3871d4' }} />
              <h4 className="text-sm font-medium text-white">Импорт и экспорт данных</h4>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {/* Import */}
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,.csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Button
                  onClick={handleImportClick}
                  variant="outline"
                  className="w-full border-zinc-700 text-zinc-300 hover:text-white active:text-white hover:bg-zinc-800 active:bg-zinc-800 h-auto py-3 flex-col"
                >
                  <ImportIcon className="w-5 h-5 mb-1" />
                  <span className="text-sm">Импорт</span>
                  <span className="text-xs text-zinc-500">CSV / JSON</span>
                </Button>
              </div>

              {/* Export with animated dropdown */}
              <div className="flex flex-col">
                <Button
                  id="export-main-btn"
                  onClick={() => {
                    const formatBtns = document.getElementById('export-format-btns');
                    if (formatBtns) {
                      formatBtns.classList.toggle('grid-rows-[0fr]');
                      formatBtns.classList.toggle('grid-rows-[1fr]');
                    }
                  }}
                  variant="outline"
                  className="w-full border-zinc-700 text-zinc-300 hover:text-white active:text-white hover:bg-zinc-800 active:bg-zinc-800 h-auto py-3 flex-col"
                >
                  <ExportIcon className="w-5 h-5 mb-1" />
                  <span className="text-sm">Экспорт</span>
                  <span className="text-xs text-zinc-500">CSV / JSON</span>
                </Button>

                {/* Animated format buttons */}
                <div
                  id="export-format-btns"
                  className="grid grid-rows-[0fr] transition-all duration-300 ease-in-out"
                >
                  <div className="overflow-hidden">
                    <div className="grid grid-cols-2 gap-4 pt-4">
                      <Button
                        onClick={handleExportCSV}
                        variant="outline"
                        className="w-full border-zinc-700 text-zinc-300 hover:text-white active:text-white hover:bg-zinc-800 active:bg-zinc-800 h-auto py-3 flex-col items-center justify-center"
                      >
                        <span className="text-sm font-medium">CSV</span>
                      </Button>
                      <Button
                        onClick={handleExportJSON}
                        variant="outline"
                        className="w-full border-zinc-700 text-zinc-300 hover:text-white active:text-white hover:bg-zinc-800 active:bg-zinc-800 h-auto py-3 flex-col items-center justify-center"
                      >
                        <span className="text-sm font-medium">JSON</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Import status */}
            {importStatus && (
              <div className={cn(
                'mt-4 p-3 rounded-lg flex items-center gap-2',
                importStatus.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-red-500/10 border border-red-500/30'
              )}>
                {importStatus.type === 'success' ? (
                  <CheckIcon className="w-4 h-4 text-emerald-400" />
                ) : (
                  <XIcon className="w-4 h-4 text-red-400" />
                )}
                <span className={cn(
                  'text-sm',
                  importStatus.type === 'success' ? 'text-emerald-400' : 'text-red-400'
                )}>
                  {importStatus.message}
                </span>
              </div>
            )}
          </div>

          {/* Test data section */}
          <div
            className={cn(
              "grid transition-all duration-300 ease-in-out",
              !showTestDataSection && "-mt-4"
            )}
            style={{ gridTemplateRows: showTestDataSection ? '1fr' : '0fr' }}
          >
            <div className="overflow-hidden">
              <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
                <div className="flex flex-col gap-4">
                  <Button
                    onClick={handleLoadTestData}
                    variant="outline"
                    className="w-full border-zinc-700 text-zinc-300 hover:text-white active:text-white hover:bg-zinc-800 active:bg-zinc-800"
                  >
                    Загрузить тестовые данные
                  </Button>
                  <Button
                    onClick={handleClearTestData}
                    variant="outline"
                    className="w-full border-zinc-700 text-zinc-300 hover:text-white active:text-white hover:bg-zinc-800 active:bg-zinc-800"
                  >
                    Очистить данные календаря
                  </Button>
                </div>

                {testDataStatus && (
                  <div
                    className={cn(
                      'mt-4 px-3 rounded-lg flex items-center gap-2 h-9',
                      testDataStatus.type === 'success' ? 'bg-[rgb(7,47,24)] border border-[rgb(3,123,52)]' : 'bg-red-500/10 border border-red-500/30'
                    )}
                  >
                    {testDataStatus.type === 'success' ? (
                      <CheckIcon className="w-4 h-4" style={{ color: 'rgb(25, 166, 85)' }} />
                    ) : (
                      <XIcon className="w-4 h-4 text-red-400" />
                    )}
                    <span className={cn(
                      'text-sm',
                      testDataStatus.type === 'success' ? '' : 'text-red-400'
                    )} style={testDataStatus.type === 'success' ? { color: 'rgb(25, 166, 85)' } : undefined}>
                      {testDataStatus.message}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-xs text-zinc-500 text-center pb-4">
          Создано кривыми руками mikle.sharp
        </div>
      </DialogContent>
    </Dialog>
  );
}
