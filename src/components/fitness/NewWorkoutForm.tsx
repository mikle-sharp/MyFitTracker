'use client';

import { useState } from 'react';
import { WorkoutType } from '@/lib/types';
import { WorkoutTypeSelector } from './WorkoutTypeSelector';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useFitnessStore } from '@/lib/store';

interface NewWorkoutFormProps {
  date: string;
  onCreated?: () => void;
}

export function NewWorkoutForm({ date, onCreated }: NewWorkoutFormProps) {
  const [selectedType, setSelectedType] = useState<WorkoutType | null>(null);
  const { createWorkout } = useFitnessStore();

  const handleCreate = () => {
    if (selectedType) {
      createWorkout(date, selectedType);
      onCreated?.();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-zinc-900/50 rounded-xl border border-zinc-800 relative"
    >
      <div className="p-6 pb-20">
        <div className="text-center mb-6">
          <p className="text-zinc-400 text-sm">
            Выберите тип тренировки
          </p>
        </div>

        <div>
          <WorkoutTypeSelector
            selectedType={selectedType}
            onSelect={setSelectedType}
          />
        </div>
      </div>

      {/* Button centered */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-1/2">
        <Button
          onClick={handleCreate}
          disabled={!selectedType}
          className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg text-white font-medium"
        >
          Добавить
        </Button>
      </div>
    </motion.div>
  );
}
