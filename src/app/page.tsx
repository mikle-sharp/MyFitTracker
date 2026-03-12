'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dumbbell, Trophy, Calendar as CalendarIcon } from 'lucide-react';

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
  
  const {
    init,
    isInitialized,
    selectedDate,
    loadWorkoutForDate,
    currentWorkout,
  } = useFitnessStore();

  useEffect(() => {
    if (!isInitialized) {
      init();
    }
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
    <div className="min-h-screen bg-zinc-950 pb-16">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-zinc-950/80 backdrop-blur-lg border-b border-zinc-800">
        <div className="max-w-lg mx-auto px-4 py-3">
          <div className="flex items-center">
            <div className="flex-1 flex justify-start">
              <div className="w-9 h-9 flex items-center justify-center">
                <Dumbbell className="w-6 h-6" style={{ color: '#19a655' }} />
              </div>
            </div>
            <h1 className="text-lg font-bold text-white">Мой журнал тренировок</h1>
            <div className="flex-1 flex justify-end">
              <SettingsPanel />
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-lg mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-zinc-900 border border-zinc-800 relative">
            <TabsTrigger
              value="workout"
              className="relative z-10 transition-colors"
              style={{ color: activeTab === 'workout' ? '#fff' : '#19a655' }}
            >
              <CalendarIcon className="w-4 h-4 mr-2" />
              Тренировки
            </TabsTrigger>
            <TabsTrigger
              value="records"
              className="relative z-10 transition-colors"
              style={{ color: activeTab === 'records' ? '#fff' : '#ffb900' }}
            >
              <Trophy className="w-4 h-4 mr-2" />
              Рекорды
            </TabsTrigger>

            {/* Animated background */}
            <div
              className="absolute top-0 bottom-0 w-1/2 rounded-md transition-all duration-300 ease-out"
              style={{
                left: activeTab === 'workout' ? '0%' : '50%',
                backgroundColor: activeTab === 'workout' ? '#072f18' : '#ffb900'
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
                    <WorkoutView workout={currentWorkout} />
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
            <PersonalRecords />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-zinc-950/80 backdrop-blur-lg border-t border-zinc-800 safe-area-inset-bottom">
        <div className="max-w-lg mx-auto px-4 py-2">
          <p className="text-center text-xs text-zinc-600">
            Данные сохраняются локально на устройстве
          </p>
        </div>
      </footer>
    </div>
  );
}
