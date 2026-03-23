'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { 
  FileJson, FileSpreadsheet, Settings, Download, Upload, 
  LogIn, LogOut, Check, AlertCircle, RefreshCw, ExternalLink,
  Sheet, XIcon, Type
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogClose, DialogTrigger, DialogTitle } from '@/components/ui/dialog';
import { exportToCSV, exportToJSON, getWorkouts, saveWorkouts } from '@/lib/storage';
import { calculatePersonalRecords } from '@/lib/pr';
import { useFitnessStore } from '@/lib/store';
import { cn } from '@/lib/utils';

interface GoogleUser {
  name: string;
  email: string;
  picture?: string;
}

// Доступные шрифты с их настройками
const AVAILABLE_FONTS = [
  { id: 'inter', name: 'Inter', family: 'var(--font-inter)', isDefault: true },
  { id: 'retro', name: 'Retro', family: 'Minecraft', isDefault: false, isRetro: true },
  { id: 'supercar', name: 'Supercar', family: 'Supercar', isDefault: false },
  { id: 'ibmmda', name: 'IBM MDA', family: 'IBMMDA', isDefault: false },
] as const;

type FontId = typeof AVAILABLE_FONTS[number]['id'];

interface SyncStatus {
  type: 'success' | 'error' | 'loading';
  message: string;
}

export function SettingsPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [importStatus, setImportStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [testDataStatus, setTestDataStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [googleUser, setGoogleUser] = useState<GoogleUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [spreadsheetId, setSpreadsheetId] = useState<string | null>(null);
  const [spreadsheetUrl, setSpreadsheetUrl] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [showTestDataSection, setShowTestDataSection] = useState(false);
  const [tapCount, setTapCount] = useState(0);
  const [lastTapTime, setLastTapTime] = useState(0);
  const [selectedFont, setSelectedFont] = useState<FontId>('inter');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { importData, refreshWorkouts } = useFitnessStore();

  // Load saved Google credentials on mount
  const loadSavedCredentials = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    const savedUser = localStorage.getItem('google-user');
    const savedAccessToken = localStorage.getItem('google-access-token');
    const savedRefreshToken = localStorage.getItem('google-refresh-token');
    const savedSpreadsheetId = localStorage.getItem('google-spreadsheet-id');
    const savedSpreadsheetUrl = localStorage.getItem('google-spreadsheet-url');
    
    if (savedUser) setGoogleUser(JSON.parse(savedUser));
    if (savedAccessToken) setAccessToken(savedAccessToken);
    if (savedRefreshToken) setRefreshToken(savedRefreshToken);
    if (savedSpreadsheetId) setSpreadsheetId(savedSpreadsheetId);
    if (savedSpreadsheetUrl) setSpreadsheetUrl(savedSpreadsheetUrl);
  }, []);

  // Save credentials
  const saveCredentials = (user: GoogleUser, access: string, refresh?: string, sheetId?: string, sheetUrl?: string) => {
    localStorage.setItem('google-user', JSON.stringify(user));
    localStorage.setItem('google-access-token', access);
    if (refresh) localStorage.setItem('google-refresh-token', refresh);
    if (sheetId) localStorage.setItem('google-spreadsheet-id', sheetId);
    if (sheetUrl) localStorage.setItem('google-spreadsheet-url', sheetUrl);
  };

  // Clear credentials
  const clearCredentials = () => {
    localStorage.removeItem('google-user');
    localStorage.removeItem('google-access-token');
    localStorage.removeItem('google-refresh-token');
    localStorage.removeItem('google-spreadsheet-id');
    localStorage.removeItem('google-spreadsheet-url');
    setGoogleUser(null);
    setAccessToken(null);
    setRefreshToken(null);
    setSpreadsheetId(null);
    setSpreadsheetUrl(null);
  };

  // Handle Google Login
  const handleGoogleLogin = async () => {
    try {
      // Get OAuth URL from our API
      const response = await fetch('/api/google-auth?action=login');
      const { authUrl } = await response.json();
      
      // Open popup for OAuth
      const width = 500;
      const height = 600;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;
      
      const popup = window.open(
        authUrl,
        'GoogleSignIn',
        `width=${width},height=${height},left=${left},top=${top}`
      );

      // Listen for callback message
      const handleMessage = async (event: MessageEvent) => {
        if (event.data.type === 'GOOGLE_AUTH_CALLBACK') {
          window.removeEventListener('message', handleMessage);
          popup?.close();
          
          const { access_token, refresh_token, user } = event.data;
          
          setGoogleUser(user);
          setAccessToken(access_token);
          if (refresh_token) setRefreshToken(refresh_token);
          
          saveCredentials(user, access_token, refresh_token);
        }
      };
      
      window.addEventListener('message', handleMessage);
    } catch (error) {
      console.error('Google login error:', error);
    }
  };

  // Handle Google Logout
  const handleGoogleLogout = () => {
    clearCredentials();
  };

  // Create new Google Sheet
  const handleCreateSheet = async () => {
    if (!accessToken) return;
    
    setSyncStatus({ type: 'loading', message: 'Создание таблицы...' });
    
    try {
      const response = await fetch('/api/google-sheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          accessToken,
        }),
      });
      
      const data = await response.json();
      
      if (data.spreadsheetId) {
        setSpreadsheetId(data.spreadsheetId);
        setSpreadsheetUrl(data.spreadsheetUrl);
        saveCredentials(googleUser!, accessToken, refreshToken || undefined, data.spreadsheetId, data.spreadsheetUrl);
        setSyncStatus({ type: 'success', message: 'Таблица создана!' });
      } else {
        setSyncStatus({ type: 'error', message: 'Ошибка создания таблицы' });
      }
    } catch {
      setSyncStatus({ type: 'error', message: 'Ошибка соединения' });
    }
  };

  // Sync data to Google Sheets
  const handleSync = async () => {
    if (!accessToken || !spreadsheetId) return;
    
    setSyncStatus({ type: 'loading', message: 'Синхронизация...' });
    
    try {
      const workouts = getWorkouts();
      const records = calculatePersonalRecords();
      
      // Flatten workouts for sync
      const flatWorkouts: Array<{
        date: string;
        type: string;
        exercise: string;
        setNum: number;
        reps: number;
        weight: number;
        time?: number;
      }> = [];
      
      workouts.forEach(w => {
        w.exercises.forEach(e => {
          e.sets.forEach((s, idx) => {
            flatWorkouts.push({
              date: w.date,
              type: w.type,
              exercise: e.name,
              setNum: idx + 1,
              reps: s.reps,
              weight: s.weight,
              time: s.time,
            });
          });
        });
      });
      
      const flatRecords: Array<{
        exercise: string;
        type: 'weight' | 'volume';
        reps?: number;
        weight?: number;
        volume?: number;
        date?: string;
      }> = [];
      
      records.forEach(r => {
        // Weight record
        if (r.weightRecord) {
          flatRecords.push({
            exercise: r.exerciseName,
            type: 'weight',
            reps: r.weightRecord.reps,
            weight: r.weightRecord.value,
            date: r.weightRecord.date,
          });
        }
        
        // Volume record
        if (r.volumeRecord) {
          flatRecords.push({
            exercise: r.exerciseName,
            type: 'volume',
            volume: r.volumeRecord.value,
            date: r.volumeRecord.date,
          });
        }
      });

      
      const response = await fetch('/api/google-sheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'sync',
          accessToken,
          refreshToken,
          spreadsheetId,
          data: {
            workouts: flatWorkouts,
            records: flatRecords,
          },
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSyncStatus({ type: 'success', message: `Синхронизировано ${data.rowsWritten} записей` });
      } else {
        setSyncStatus({ type: 'error', message: data.error || 'Ошибка синхронизации' });
      }
    } catch {
      setSyncStatus({ type: 'error', message: 'Ошибка соединения' });
    }
  };

  // Import from Google Sheets
  const handleImportFromSheets = async () => {
    if (!accessToken || !spreadsheetId) return;
    
    setSyncStatus({ type: 'loading', message: 'Импорт...' });
    
    try {
      const response = await fetch('/api/google-sheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'import',
          accessToken,
          spreadsheetId,
        }),
      });
      
      const data = await response.json();
      
      if (data.data && Array.isArray(data.data)) {
        // Convert rows to CSV for import
        const csvRows = [
          ['Дата', 'Тип тренировки', 'Упражнение', 'Подход', 'Повторения', 'Вес (кг)', 'Время (сек)'],
          ...data.data
        ];
        const csv = csvRows.map(row => row.join(',')).join('\n');
        
        const result = importData(csv, 'csv');
        
        if (result.success) {
          refreshWorkouts();
          setSyncStatus({ type: 'success', message: result.message });
        } else {
          setSyncStatus({ type: 'error', message: result.message });
        }
      } else {
        setSyncStatus({ type: 'error', message: 'Нет данных для импорта' });
      }
    } catch {
      setSyncStatus({ type: 'error', message: 'Ошибка импорта' });
    }
  };

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
      const response = await fetch('/test-data/fitness-journal.json');
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
    const savedFont = localStorage.getItem('app-font') as FontId | null;
    if (savedFont && AVAILABLE_FONTS.some(f => f.id === savedFont)) {
      setSelectedFont(savedFont);
      applyFont(savedFont);
    }
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
    localStorage.setItem('app-font', fontId);
    applyFont(typedFontId);
  };

  // Load credentials on first open
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      loadSavedCredentials();
      setImportStatus(null);
      setTestDataStatus(null);
      setSyncStatus(null);
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
          className="border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800"
        >
          <Settings className="w-6 h-6" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-zinc-900 border-zinc-700 max-h-[90vh] overflow-y-auto p-0 gap-0" showCloseButton={false}>
        {/* Header with title and close button */}
        <div className="flex items-center justify-center px-4 pt-4 pb-0 relative">
          {/* Secret tap area on the left */}
          <div 
            className="absolute left-4 w-12 h-8 cursor-default"
            onClick={handleSecretTap}
          />
          <DialogTitle className="text-lg font-semibold text-white m-0">Инструменты</DialogTitle>
          <DialogClose className="absolute right-4 rounded-lg opacity-70 transition-opacity hover:opacity-100 focus:outline-none text-zinc-400 hover:text-white">
            <XIcon className="w-4 h-4" />
          </DialogClose>
        </div>

        <div className="px-4 pt-4 pb-4 flex flex-col gap-4">
          {/* Font Selection Section */}
          <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
            <div className="flex items-center gap-2 mb-4">
              <Type className="w-4 h-4 text-purple-400" />
              <h4 className="text-sm font-medium text-white">Шрифт приложения</h4>
            </div>
            
            <Select value={selectedFont} onValueChange={handleFontChange}>
              <SelectTrigger className="w-full border-zinc-600 bg-zinc-800 text-white">
                <SelectValue placeholder="Выберите шрифт" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-800 border-zinc-600">
                {AVAILABLE_FONTS.map((font) => (
                  <SelectItem 
                    key={font.id} 
                    value={font.id}
                    className="text-white focus:bg-zinc-700"
                  >
                    <span style={{ fontFamily: font.family }}>{font.name}</span>
                    {font.isDefault && (
                      <span className="ml-2 text-xs text-zinc-400">(по умолчанию)</span>
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Font Preview */}
            <div className="mt-4 p-3 bg-zinc-700/50 rounded-lg">
              <p className="text-xs text-zinc-400 mb-2">Предпросмотр:</p>
              <p 
                className="text-white text-lg"
                style={{ fontFamily: AVAILABLE_FONTS.find(f => f.id === selectedFont)?.family }}
              >
                Аа Бб Вв 123 Тренировка
              </p>
            </div>
          </div>

          {/* Google Account Section */}
          <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
            <div className="flex items-center gap-2 mb-4">
              <Sheet className="w-4 h-4" style={{ color: '#037b34' }} />
              <h4 className="text-sm font-medium text-white">Google Sheets</h4>
            </div>
            
            {googleUser ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white font-medium overflow-hidden">
                      {googleUser.picture ? (
                        <img src={googleUser.picture} alt="" className="w-full h-full object-cover" />
                      ) : (
                        googleUser.name.charAt(0)
                      )}
                    </div>
                    <div>
                      <div className="text-white font-medium">{googleUser.name}</div>
                      <div className="text-xs text-zinc-500">{googleUser.email}</div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleGoogleLogout}
                    className="text-zinc-400 hover:text-white"
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>

                {/* Spreadsheet info */}
                {spreadsheetId && spreadsheetUrl ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 p-2 bg-zinc-700/50 rounded-lg">
                      <Sheet className="w-4 h-4 text-emerald-400" />
                      <span className="text-sm text-zinc-300 flex-1 truncate">
                        Мой журнал тренировок
                      </span>
                      <a
                        href={spreadsheetUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-400 hover:text-emerald-300"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <Button
                        onClick={handleSync}
                        disabled={syncStatus?.type === 'loading'}
                        className="bg-emerald-600 hover:bg-emerald-500"
                      >
                        <RefreshCw className={cn(
                          'w-4 h-4 mr-2',
                          syncStatus?.type === 'loading' && 'animate-spin'
                        )} />
                        Синхронизировать
                      </Button>
                      <Button
                        onClick={handleImportFromSheets}
                        variant="outline"
                        className="border-zinc-600 text-zinc-300 hover:text-white"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Импорт
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    onClick={handleCreateSheet}
                    className="w-full bg-emerald-600 hover:bg-emerald-500"
                  >
                    <Sheet className="w-4 h-4 mr-2" />
                    Создать таблицу Google
                  </Button>
                )}

                {/* Sync status */}
                {syncStatus && (
                  <div className={cn(
                    'p-3 rounded-lg flex items-center gap-2',
                    syncStatus.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/30' :
                    syncStatus.type === 'loading' ? 'bg-blue-500/10 border border-blue-500/30' :
                    'bg-red-500/10 border border-red-500/30'
                  )}>
                    {syncStatus.type === 'success' && <Check className="w-4 h-4 text-emerald-400" />}
                    {syncStatus.type === 'loading' && <RefreshCw className="w-4 h-4 text-blue-400 animate-spin" />}
                    {syncStatus.type === 'error' && <AlertCircle className="w-4 h-4 text-red-400" />}
                    <span className={cn(
                      'text-sm',
                      syncStatus.type === 'success' ? 'text-emerald-400' :
                      syncStatus.type === 'loading' ? 'text-blue-400' :
                      'text-red-400'
                    )}>
                      {syncStatus.message}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <Button
                  onClick={handleGoogleLogin}
                  variant="outline"
                  className="w-full border-zinc-600 text-zinc-300 hover:text-white hover:bg-zinc-700"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Войти через Google
                </Button>
                <p className="text-xs text-zinc-500 text-center">
                  Для синхронизации с Google Sheets необходимо войти в аккаунт Google
                </p>
              </div>
            )}
          </div>

          {/* Import/Export section */}
          <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
            <div className="flex items-center gap-2 mb-4">
              <FileSpreadsheet className="w-4 h-4" style={{ color: '#1d4fa0' }} />
              <h4 className="text-sm font-medium text-white">Восстановление / Резервное копирование</h4>
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
                  className="w-full border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800 h-auto py-3 flex-col"
                >
                  <Download className="w-5 h-5 mb-1" />
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
                  className="w-full border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800 h-auto py-3 flex-col"
                >
                  <Upload className="w-5 h-5 mb-1" />
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
                        className="w-full border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800 h-auto py-3 flex-col items-center justify-center"
                      >
                        <span className="text-sm font-medium">CSV</span>
                      </Button>
                      <Button
                        onClick={handleExportJSON}
                        variant="outline"
                        className="w-full border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800 h-auto py-3 flex-col items-center justify-center"
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
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-400" />
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
                    className="w-full border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800"
                  >
                    Загрузить тестовые данные
                  </Button>
                  <Button
                    onClick={handleClearTestData}
                    variant="outline"
                    className="w-full border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800"
                  >
                    Очистить данные календаря
                  </Button>
                </div>

                {testDataStatus && (
                  <div className={cn(
                    'mt-4 p-3 rounded-lg flex items-center gap-2',
                    testDataStatus.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-red-500/10 border border-red-500/30'
                  )}>
                    {testDataStatus.type === 'success' ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-400" />
                    )}
                    <span className={cn(
                      'text-sm',
                      testDataStatus.type === 'success' ? 'text-emerald-400' : 'text-red-400'
                    )}>
                      {testDataStatus.message}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
