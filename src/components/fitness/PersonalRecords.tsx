'use client';

import { useMemo } from 'react';
import { calculatePersonalRecords } from '@/lib/pr';
import { motion } from 'framer-motion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getExerciseType, EXERCISE_TYPE_COLORS, WORKOUT_TYPE_ICONS } from '@/lib/types';

const WEIGHT_RECORD_COLOR = '#ffb900';
const VOLUME_RECORD_COLOR = '#cd7f32';

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
                className="grid items-stretch rounded-lg bg-zinc-800 border-l-4 overflow-hidden"
                style={{ 
                  borderLeftColor: colors.border,
                  gridTemplateColumns: '3fr 2fr'
                }}
              >
                {/* Столбец 1: Иконка и название упражнения (3/5) */}
                <div className="flex items-center gap-3 px-4 py-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: colors.bg }}>
                    <span className="text-base">{WORKOUT_TYPE_ICONS[record.workoutType]}</span>
                  </div>
                  <span className="font-medium text-white break-words">{record.exerciseName}</span>
                </div>
                
                {/* Столбец 2: 4 строки рекордов (2/5), отступ 8px от правого края */}
                <div className="flex flex-col mr-2">
                  {/* Строка 1: Рекорд по весу (отступ 4px сверху, высота n, flex-2) */}
                  {record.weightRecord && (
                    <button
                      onClick={() => onNavigateToWorkout?.(
                        record.weightRecord!.date,
                        record.exerciseName,
                        record.weightRecord!.setIndex
                      )}
                      className="flex items-center gap-2 px-3 text-left hover:bg-zinc-700/50 transition-colors mt-2 rounded-lg"
                      style={{ flex: '2 1 0%' }}
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
                  
                  {/* Строка 2: Подсказка "По весу" (высота n/2, flex-1) */}
                  {record.weightRecord && (
                    <div className="flex items-center justify-end px-3 text-[10px] text-zinc-600" style={{ flex: '1 1 0%' }}>
                      По весу
                    </div>
                  )}
                  
                  {/* Строка 3: Рекорд по объёму (высота n, flex-2) */}
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
                        className="flex items-center gap-2 px-3 text-left hover:bg-zinc-700/50 transition-colors rounded-lg"
                        style={{ flex: '2 1 0%' }}
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
                  
                  {/* Строка 4: Подсказка "По объёму" (отступ 4px снизу, высота n/2, flex-1) */}
                  {record.volumeRecord && (
                    <div className="flex items-center justify-end px-3 text-[10px] text-zinc-600 mb-2" style={{ flex: '1 1 0%' }}>
                      По объёму
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
