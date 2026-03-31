'use client';

import { useState, useRef, useEffect } from 'react';
import { WorkoutType } from '@/lib/types';
import { WorkoutTypeSelector } from './WorkoutTypeSelector';
import { motion } from 'framer-motion';
import { useFitnessStore } from '@/lib/store';
import { Button } from '@/components/ui/button';

interface NewWorkoutFormProps {
  date: string;
  onCreated?: () => void;
}

export function NewWorkoutForm({ date, onCreated }: NewWorkoutFormProps) {
  const [selectedType, setSelectedType] = useState<WorkoutType | null>(null);
  const { createWorkout } = useFitnessStore();
  const startButtonRef = useRef<HTMLButtonElement>(null);

  // Скролл к кнопке "Начать" при выборе типа тренировки
  useEffect(() => {
    if (selectedType && startButtonRef.current) {
      setTimeout(() => {
        startButtonRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }, 100);
    }
  }, [selectedType]);

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
      className="bg-zinc-900/50 rounded-lg border border-zinc-800 relative"
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
          <Button
            ref={startButtonRef}
            onClick={handleCreate}
            disabled={!selectedType}
            className="w-1/2"
            style={{ backgroundColor: '#19a655' }}
          >
            Начать
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
