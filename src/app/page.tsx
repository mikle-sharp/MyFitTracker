'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MainIcon, TrophyIcon, CalendarIcon } from '@/components/icons/Icons';

import { useFitnessStore } from '@/lib/store';
import { Calendar } from '@/components/fitness/Calendar';
import { WorkoutView } from '@/components/fitness/WorkoutView';
import { NewWorkoutForm } from '@/components/fitness/NewWorkoutForm';
import { PersonalRecords } from '@/components/fitness/PersonalRecords';
import { SettingsPanel } from '@/components/fitness/SettingsPanel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Home() {
  const [activeTab, setActiveTab] = useState('workout');
  const [mounted, setMounted] = useState(false);
  const [isDefaultStyle, setIsDefaultStyle] = useState(true);
  const [highlightExercise, setHighlightExercise] = useState<{ name: string; setId: string } | null>(null);
  
  const {
    init,
    isInitialized,
    selectedDate,
    loadWorkoutForDate,
    currentWorkout,
  } = useFitnessStore();

  // Навигация к тренировке с рекордом
  const handleNavigateToWorkout = (date: string, exerciseName: string, setId: string) => {
    // Переключаемся на вкладку тренировок
    setActiveTab('workout');
    // Загружаем тренировку для указанной даты
    loadWorkoutForDate(date);
    // Устанавливаем подсветку упражнения
    setHighlightExercise({ name: exerciseName, setId });
    // Сбрасываем подсветку через 2 секунды
    setTimeout(() => setHighlightExercise(null), 2000);
  };

  useEffect(() => {
    if (!isInitialized) {
      init();
    }
    // Проверяем текущий стиль
    const savedFont = localStorage.getItem('app-font');
    setIsDefaultStyle(!savedFont || savedFont === 'inter');
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, [init, isInitialized]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-zinc-800 rounded-full" />
          <div className="h-4 w-32 bg-zinc-800 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-zinc-950/80 backdrop-blur-lg border-b border-zinc-800">
        <div className="max-w-lg mx-auto px-4 py-3">
          <div className="flex items-center">
            <div className="flex-1 flex justify-start">
              <div className="w-9 h-9 flex items-center justify-center">
                <MainIcon className="w-6 h-6" style={{ color: '#19a655' }} />
              </div>
            </div>
            <h1 className="text-lg font-bold text-white cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Мой журнал тренировок</h1>
            <div className="flex-1 flex justify-end">
              <SettingsPanel />
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-lg mx-auto px-4 py-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 bg-zinc-900 border border-zinc-800 relative">
            <TabsTrigger
              value="workout"
              className="relative z-10 transition-colors py-0"
              style={{ color: activeTab === 'workout' ? '#1a1a1a' : '#19a655' }}
            >
              <span className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4" />
                Тренировки
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="records"
              className="relative z-10 transition-colors py-0"
              style={{ color: activeTab === 'records' ? '#1a1a1a' : '#ffae00' }}
            >
              <span className="flex items-center gap-2">
                <TrophyIcon className="w-4 h-4" />
                Рекорды
              </span>
            </TabsTrigger>

            {/* Animated background */}
            <div
              className="absolute top-0 bottom-0 w-1/2 rounded-lg transition-all duration-300 ease-out"
              style={{
                left: activeTab === 'workout' ? '0%' : '50%',
                backgroundColor: activeTab === 'workout' ? '#19a655' : '#ffae00'
              }}
            />
          </TabsList>

          <TabsContent value="workout" className="space-y-4 mt-0">
            {/* Calendar */}
            <Calendar />

            {/* Workout content */}
            <AnimatePresence mode="wait">
              {selectedDate ? (
                currentWorkout ? (
                  <motion.div
                    key="workout"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <WorkoutView workout={currentWorkout} highlightExercise={highlightExercise} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="new-workout"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <NewWorkoutForm
                      date={selectedDate}
                      onCreated={() => loadWorkoutForDate(selectedDate)}
                    />
                  </motion.div>
                )
              ) : null}
            </AnimatePresence>
          </TabsContent>

          <TabsContent value="records" className="mt-0">
            <PersonalRecords onNavigateToWorkout={handleNavigateToWorkout} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
