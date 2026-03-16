'use client';

import { useState } from 'react';
import { WorkoutType } from '@/lib/types';
import { WorkoutTypeSelector } from './WorkoutTypeSelector';
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
      <div className="p-4">
        <div className="text-center mb-4">
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

        <div className="mt-4 flex justify-center">
          <button
            onClick={handleCreate}
            disabled={!selectedType}
            className="w-1/2 py-2 rounded-md text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: '#19a655' }}
          >
            Начать
          </button>
        </div>
      </div>
    </motion.div>
  );
}
