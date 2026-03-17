'use client';

import { useState, useRef, useCallback } from 'react';
import { 
  FileJson, FileSpreadsheet, Settings, Download, Upload, 
  LogIn, LogOut, Check, AlertCircle, RefreshCw, ExternalLink,
  Sheet, XIcon
} from 'lucide-react';
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
      
      const flatRecords = records.map(r => ({
        exercise: r.exerciseName,
        reps: r.reps,
        weight: r.maxWeight,
        date: r.date,
      }));
      
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
  const handleLoadTestData = () => {
    const testJSON = JSON.stringify({
      "workouts": [
        {
          "id": "1773169362744-py2fkhssf",
          "date": "2026-03-08",
          "type": "chest",
          "exercises": [
            {
              "id": "1773169362744-0yopr4yj8",
              "name": "Жим лежа",
              "sets": [
                { "id": "1773169465092-h3fsxnofs", "reps": 10, "weight": 60, "isWarmup": true },
                { "id": "1773169481224-f187zeiiw", "reps": 6, "weight": 80, "isWarmup": false },
                { "id": "1773169489306-1clw0qbzk", "reps": 5, "weight": 85, "isWarmup": false },
                { "id": "1773169498664-okrwevfr4", "reps": 3, "weight": 90, "isWarmup": false }
              ],
              "isCustom": false
            },
            {
              "id": "1773169362744-bwtqra8jg",
              "name": "Жим на наклонной",
              "sets": [
                { "id": "1773169635842-mldkxtfnj", "reps": 10, "weight": 40, "isWarmup": false },
                { "id": "1773169641843-ncmyc4kk7", "reps": 10, "weight": 50, "isWarmup": false },
                { "id": "1773169647360-t7v8ar8vx", "reps": 10, "weight": 60, "isWarmup": false },
                { "id": "1773169654459-lw4wdkdk3", "reps": 6, "weight": 70, "isWarmup": false }
              ],
              "isCustom": false
            },
            {
              "id": "1773169362744-ohs0htxai",
              "name": "Разводка гантелей",
              "sets": [
                { "id": "1773169666503-xzunbjuxf", "reps": 10, "weight": 12, "isWarmup": false },
                { "id": "1773169672547-129jo7vlp", "reps": 10, "weight": 14, "isWarmup": false },
                { "id": "1773169677190-f6zmird4a", "reps": 10, "weight": 16, "isWarmup": false }
              ],
              "isCustom": false
            },
            {
              "id": "1773169362744-j5dlsipi9",
              "name": "Отжимания",
              "sets": [
                { "id": "1773169716147-qqmo7tor5", "reps": 15, "weight": 0, "isWarmup": false },
                { "id": "1773169726244-mm2zq41pc", "reps": 15, "weight": 0, "isWarmup": false },
                { "id": "1773169730481-xrgt2n5p7", "reps": 15, "weight": 0, "isWarmup": false }
              ],
              "isCustom": false
            },
            {
              "id": "1773169767479-bs8tjw2fd",
              "name": "Пресс подъём ног в висе",
              "sets": [
                { "id": "1773169772944-i9lr8jueq", "reps": 15, "weight": 0, "isWarmup": false },
                { "id": "1773169776099-amjrd0ydl", "reps": 15, "weight": 0, "isWarmup": false },
                { "id": "1773169779663-0xjvp4qks", "reps": 15, "weight": 0, "isWarmup": false },
                { "id": "1773189863343-0rjamfl6c", "reps": 0, "weight": 0, "time": 100, "isWarmup": false }
              ],
              "isCustom": true,
              "exerciseType": "common"
            }
          ],
          "createdAt": "2026-03-10T19:02:42.744Z",
          "updatedAt": "2026-03-12T22:33:15.126Z",
          "notes": "это коммент"
        },
        {
          "id": "1773169983093-m24kkunf5",
          "date": "2026-03-15",
          "type": "chest",
          "exercises": [
            { "id": "1773169983093-mgsq2jiwj", "name": "Жим лежа", "sets": [], "isCustom": false },
            { "id": "1773169983093-gm8h1996z", "name": "Жим на наклонной", "sets": [], "isCustom": false },
            { "id": "1773169983093-zlrp6mnp2", "name": "Разводка гантелей", "sets": [], "isCustom": false },
            { "id": "1773169983093-funfk4iie", "name": "Кроссовер", "sets": [], "isCustom": false },
            { "id": "1773169983093-w93y4y22t", "name": "Отжимания", "sets": [], "isCustom": false }
          ],
          "createdAt": "2026-03-10T19:13:03.093Z",
          "updatedAt": "2026-03-10T19:13:03.093Z"
        },
        {
          "id": "1773171015778-qig9wfs2r",
          "date": "2026-03-10",
          "type": "back",
          "exercises": [
            {
              "id": "1773171015778-nvxxnlms8",
              "name": "Подтягивания",
              "sets": [
                { "id": "1773171107909-y0syd9964", "reps": 10, "weight": 0, "isWarmup": true },
                { "id": "1773171119553-wt2grgkit", "reps": 4, "weight": 32, "isWarmup": false },
                { "id": "1773171543129-lgdn8hou5", "reps": 3, "weight": 32, "isWarmup": false },
                { "id": "1773171564604-hfa3vpiku", "reps": 2, "weight": 32, "isWarmup": false },
                { "id": "1773176135677-gb94y3lla", "reps": 19, "weight": 0, "isWarmup": false },
                { "id": "1773189938504-kp3tqzopb", "reps": 4, "weight": 32, "isWarmup": false }
              ],
              "isCustom": false
            },
            {
              "id": "1773171015778-jqe1cmmwm",
              "name": "Становая тяга",
              "sets": [
                { "id": "1773171586488-riwto2qew", "reps": 10, "weight": 60, "isWarmup": true },
                { "id": "1773171594034-wuzjs2r8g", "reps": 6, "weight": 120, "isWarmup": false },
                { "id": "1773171600356-d53a2kyu0", "reps": 6, "weight": 120, "isWarmup": false },
                { "id": "1773171609544-csgmtr5qu", "reps": 5, "weight": 130, "isWarmup": false }
              ],
              "isCustom": false
            },
            {
              "id": "1773171015778-h5w123v2b",
              "name": "Тяга штанги в наклоне",
              "sets": [
                { "id": "1773171824984-lbuleoth5", "reps": 10, "weight": 60, "isWarmup": false },
                { "id": "1773171829903-ncq10ifub", "reps": 10, "weight": 60, "isWarmup": false },
                { "id": "1773171836046-sppsczm0g", "reps": 10, "weight": 60, "isWarmup": false }
              ],
              "isCustom": false
            },
            {
              "id": "1773171015778-j6pfio5qh",
              "name": "Тяга гантели",
              "sets": [
                { "id": "1773171854328-kwxhgmdc8", "reps": 8, "weight": 12, "isWarmup": false },
                { "id": "1773171860522-j2dy5mulm", "reps": 8, "weight": 12, "isWarmup": false },
                { "id": "1773171865497-whzvfki0c", "reps": 8, "weight": 12, "isWarmup": false },
                { "id": "1773171870413-o1pw05s04", "reps": 8, "weight": 12, "isWarmup": false }
              ],
              "isCustom": false
            },
            {
              "id": "1773171879701-9saqgrzsv",
              "name": "пресс планка",
              "sets": [
                { "id": "1773171892034-copnxv5tj", "reps": 0, "weight": 0, "time": 90, "isWarmup": false },
                { "id": "1773171915478-eczpqnx3f", "reps": 0, "weight": 0, "time": 90, "isWarmup": false },
                { "id": "1773171926709-cfliq0051", "reps": 0, "weight": 0, "time": 90, "isWarmup": false }
              ],
              "isCustom": true
            }
          ],
          "createdAt": "2026-03-10T19:30:15.778Z",
          "updatedAt": "2026-03-11T00:45:38.504Z",
          "notes": "ещё заметка"
        },
        {
          "id": "1773173166399-l0hzy9a7q",
          "date": "2026-03-17",
          "type": "back",
          "exercises": [
            { "id": "1773173166399-wj9pajbs9", "name": "Становая тяга", "sets": [], "isCustom": false },
            { "id": "1773173166399-a5hdnf87p", "name": "Тяга штанги в наклоне", "sets": [], "isCustom": false },
            { "id": "1773173166399-qsur64s9p", "name": "Подтягивания", "sets": [], "isCustom": false },
            { "id": "1773173166399-isu2525uj", "name": "Тяга гантели", "sets": [], "isCustom": false },
            {
              "id": "1773173172356-0y56czkqx",
              "name": "пресс планка",
              "sets": [
                { "id": "1773173201598-q0xmhini1", "reps": 0, "weight": 0, "time": 90, "isWarmup": false }
              ],
              "isCustom": true
            }
          ],
          "createdAt": "2026-03-10T20:06:06.399Z",
          "updatedAt": "2026-03-10T20:06:41.598Z"
        },
        {
          "id": "1773176301714-5ho5b0cjr",
          "date": "2026-03-13",
          "type": "fullbody",
          "exercises": [
            { "id": "1773176301714-fi71iabg2", "name": "Жим лежа", "sets": [], "isCustom": false },
            { "id": "1773176301714-ieaz07c5u", "name": "Жим на наклонной", "sets": [], "isCustom": false },
            { "id": "1773176301714-qwyeetrhs", "name": "Становая тяга", "sets": [], "isCustom": false },
            { "id": "1773176301714-7hdby9vl8", "name": "Тяга штанги в наклоне", "sets": [], "isCustom": false },
            { "id": "1773176301714-hj7zok5gp", "name": "Приседания", "sets": [], "isCustom": false },
            { "id": "1773176301714-fgo42gor0", "name": "Жим ногами", "sets": [], "isCustom": false },
            { "id": "1773176301714-s4c2fw08y", "name": "Планка", "sets": [], "isCustom": false }
          ],
          "createdAt": "2026-03-10T20:58:21.713Z",
          "updatedAt": "2026-03-10T20:58:21.713Z"
        },
        {
          "id": "1773217035976-njybwsmsf",
          "date": "2026-03-11",
          "type": "legs",
          "exercises": [
            {
              "id": "1773217035976-0ou7cil8d",
              "name": "Приседания",
              "sets": [
                { "id": "1773217637129-te5ozqzj4", "reps": 10, "weight": 60, "isWarmup": true }
              ],
              "isCustom": false
            },
            { "id": "1773217035976-dlzs0b3ny", "name": "Жим ногами", "sets": [], "isCustom": false },
            { "id": "1773217035976-hiv9l0s1d", "name": "Выпады", "sets": [], "isCustom": false },
            { "id": "1773217035976-flzaedf4z", "name": "Разгибание ног", "sets": [], "isCustom": false },
            { "id": "1773217035976-r5uu0t594", "name": "Сгибание ног", "sets": [], "isCustom": false }
          ],
          "createdAt": "2026-03-11T08:17:15.976Z",
          "updatedAt": "2026-03-11T08:27:17.129Z",
          "notes": "123"
        }
      ],
      "customExercisesByType": {
        "chest": ["пресс планка", "Отжимания", "Пресс подъём ног в висе"],
        "back": ["пресс планка"],
        "legs": [],
        "fullbody": ["пресс планка", "Жим на наклонной"]
      },
      "exportDate": "2026-03-12T23:52:22.457Z",
      "version": "1.0"
    });

    const result = importData(testJSON, 'json');
    setTestDataStatus({ type: result.success ? 'success' : 'error', message: result.message });

    if (result.success) {
      refreshWorkouts();
    }
  };

  // Clear test data
  const handleClearTestData = () => {
    saveWorkouts([]);
    refreshWorkouts();
    setTestDataStatus({ type: 'success', message: 'Данные очищены' });
  };

  // Load credentials on first open
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      loadSavedCredentials();
      setImportStatus(null);
      setTestDataStatus(null);
      setSyncStatus(null);
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
          <DialogTitle className="text-lg font-semibold text-white m-0">Инструменты</DialogTitle>
          <DialogClose className="absolute right-4 rounded-lg opacity-70 transition-opacity hover:opacity-100 focus:outline-none text-zinc-400 hover:text-white">
            <XIcon className="w-4 h-4" />
          </DialogClose>
        </div>

        <div className="p-4 space-y-4">
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
                  <Upload className="w-5 h-5 mb-1" />
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
                  <Download className="w-5 h-5 mb-1" />
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
      </DialogContent>
    </Dialog>
  );
}
