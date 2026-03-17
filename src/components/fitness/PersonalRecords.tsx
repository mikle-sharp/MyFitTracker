'use client';

import { useMemo } from 'react';
import { calculatePersonalRecords } from '@/lib/pr';
import { motion } from 'framer-motion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getExerciseType, EXERCISE_TYPE_COLORS, WORKOUT_TYPE_ICONS } from '@/lib/types';

const WEIGHT_RECORD_COLOR = '#ffb900';
const VOLUME_RECORD_COLOR = '#71717a';

interface PersonalRecordsProps {
  onNavigateToWorkout?: (date: string, exerciseName: string, setIndex: number) => void;
}

export function PersonalRecords({ onNavigateToWorkout }: PersonalRecordsProps) {
  const records = useMemo(() => calculatePersonalRecords(), []);

  if (records.length === 0) {
    return (
      <div className="bg-zinc-900/50 rounded-lg border border-zinc-800 p-4 text-center">
        <p className="text-zinc-500">У Вас пока нет рекордов</p>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900/50 rounded-lg border border-zinc-800 overflow-hidden">
      <div className="p-3 flex items-center justify-center">
        <h3 className="text-lg font-semibold text-white">Личные рекорды</h3>
      </div>

      <ScrollArea>
        <div className="p-2 space-y-1">
          {records.map((record, index) => {
            const exerciseType = getExerciseType(record.exerciseName);
            const colors = EXERCISE_TYPE_COLORS[exerciseType];
            
            return (
              <motion.div
                key={record.exerciseName}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="grid items-stretch rounded-lg bg-zinc-800 border-l-4 overflow-hidden py-4"
                style={{ 
                  borderLeftColor: colors.border,
                  gridTemplateColumns: 'auto 1fr 100px 1fr',
                  gap: '0.5rem'
                }}
              >
                {/* Колонка 1: Иконка */}
                <div className="flex items-center ml-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: colors.bg }}>
                    <span className="text-base">{WORKOUT_TYPE_ICONS[record.workoutType]}</span>
                  </div>
                </div>
                
                {/* Колонка 2: Название упражнения */}
                <div className="flex items-center">
                  <span className="font-medium text-white break-words">{record.exerciseName}</span>
                </div>
                
                {/* Колонка 3: Метки "По весу" / "По объёму" */}
                <div className="flex flex-col ml-6">
                  {record.weightRecord && (
                    <div className="text-xs text-zinc-500 flex-1 flex items-center">По весу</div>
                  )}
                  {record.volumeRecord && (
                    <div className="text-xs text-zinc-500 flex-1 flex items-center">По объёму</div>
                  )}
                </div>
                
                {/* Колонка 4: Рекорды */}
                <div className="flex flex-col mr-4">
                  {record.weightRecord && (
                    <button
                      onClick={() => onNavigateToWorkout?.(
                        record.weightRecord!.date,
                        record.exerciseName,
                        record.weightRecord!.setIndex
                      )}
                      className="flex items-center gap-2 px-3 text-left hover:bg-zinc-700/50 rounded-lg transition-colors flex-1"
                    >
                      <span style={{ color: WEIGHT_RECORD_COLOR }} className="font-medium">
                        {record.weightRecord.value} кг
                      </span>
                      <span className="text-zinc-500">×</span>
                      <span style={{ color: WEIGHT_RECORD_COLOR }} className="font-medium">
                        {record.weightRecord.reps}
                      </span>
                    </button>
                  )}
                  
                  {record.volumeRecord && (() => {
                    const weight = record.volumeRecord.value / record.volumeRecord.reps;
                    const weightStr = Number.isInteger(weight) ? String(weight) : weight.toFixed(1);
                    return (
                      <button
                        onClick={() => onNavigateToWorkout?.(
                          record.volumeRecord!.date,
                          record.exerciseName,
                          record.volumeRecord!.setIndex
                        )}
                        className="flex items-center gap-2 px-3 text-left hover:bg-zinc-700/50 rounded-lg transition-colors flex-1"
                      >
                        <span style={{ color: VOLUME_RECORD_COLOR }} className="font-medium">
                          {weightStr} кг
                        </span>
                        <span className="text-zinc-500">×</span>
                        <span style={{ color: VOLUME_RECORD_COLOR }} className="font-medium">
                          {record.volumeRecord.reps}
                        </span>
                      </button>
                    );
                  })()}
                </div>
              </motion.div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
