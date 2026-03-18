'use client';

import { useMemo, useRef, useState, useEffect } from 'react';
import { calculatePersonalRecords } from '@/lib/pr';
import { motion } from 'framer-motion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getExerciseType, EXERCISE_TYPE_COLORS, WORKOUT_TYPE_ICONS } from '@/lib/types';

// Компонент для названия упражнения с авто-размером шрифта
function ExerciseName({ name }: { name: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [fontSize, setFontSize] = useState<'text-base' | 'text-sm'>('text-base');

  useEffect(() => {
    if (ref.current) {
      const lineHeight = parseFloat(getComputedStyle(ref.current).lineHeight);
      const height = ref.current.scrollHeight;
      const lines = height / lineHeight;
      if (lines > 3) {
        setFontSize('text-sm');
      }
    }
  }, [name]);

  return (
    <span ref={ref} className={`font-medium text-white break-words ${fontSize}`}>{name}</span>
  );
}

const WEIGHT_RECORD_COLOR = '#ffb900';
const VOLUME_RECORD_COLOR = '#cd7f32';

interface PersonalRecordsProps {
  onNavigateToWorkout?: (date: string, exerciseName: string, setId: string) => void;
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
        <div className="p-2 space-y-2">
          {records.map((record, index) => {
            const exerciseType = getExerciseType(record.exerciseName);
            const colors = EXERCISE_TYPE_COLORS[exerciseType];
            
            const hasWeight = !!record.weightRecord;
            const hasVolume = !!record.volumeRecord;
            const singleRecord = (hasWeight && !hasVolume) || (!hasWeight && hasVolume);
            
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
                <div className="flex items-center gap-3 px-3 py-3">
                  <div className="w-9 h-9 shrink-0" style={{ backgroundColor: colors.border }} />
                  <ExerciseName name={record.exerciseName} />
                </div>
                
                {/* Столбец 2: записи рекордов (2/5) */}
                <div className={`flex flex-col mr-2 ${singleRecord ? 'justify-center' : ''}`}>
                  {/* Рекорд по весу */}
                  {record.weightRecord && (
                    <>
                      <button
                        onClick={() => onNavigateToWorkout?.(
                          record.weightRecord!.date,
                          record.exerciseName,
                          record.weightRecord!.setId
                        )}
                        className={`flex items-center gap-2 px-3 text-left hover:bg-zinc-700/50 transition-colors rounded-lg ${singleRecord ? '' : 'mt-2'}`}
                      >
                        <span style={{ color: WEIGHT_RECORD_COLOR }} className="font-medium">
                          {record.weightRecord.value} кг
                        </span>
                        <span className="text-zinc-500">×</span>
                        <span style={{ color: WEIGHT_RECORD_COLOR }} className="font-medium">
                          {record.weightRecord.reps}
                        </span>
                      </button>
                      <div className="flex items-center justify-end px-3 text-[10px] text-zinc-600">
                        По весу
                      </div>
                    </>
                  )}
                  
                  {/* Рекорд по объёму */}
                  {record.volumeRecord && (() => {
                    const vr = record.volumeRecord;
                    
                    // Форматируем отображение в зависимости от типа
                    let displayContent: React.ReactNode;
                    
                    if (vr.time && vr.time > 0) {
                      // Упражнение на время
                      const mins = Math.floor(vr.time / 60);
                      const secs = vr.time % 60;
                      const timeStr = `${mins}:${secs.toString().padStart(2, '0')}`;
                      displayContent = (
                        <>
                          <span style={{ color: VOLUME_RECORD_COLOR }} className="font-medium">
                            {timeStr}
                          </span>
                          <span className="text-zinc-500 text-[10px] ml-1">мин</span>
                        </>
                      );
                    } else if (vr.reps > 0 && vr.value === vr.reps) {
                      // Собственный вес - объём = повторения
                      displayContent = (
                        <>
                          <span style={{ color: VOLUME_RECORD_COLOR }} className="font-medium">
                            {vr.reps}
                          </span>
                          <span className="text-zinc-500 text-[10px] ml-1">повт</span>
                        </>
                      );
                    } else if (vr.reps > 0) {
                      // Вес × повторения
                      const weight = vr.value / vr.reps;
                      const weightStr = Number.isInteger(weight) ? String(weight) : weight.toFixed(1);
                      displayContent = (
                        <>
                          <span style={{ color: VOLUME_RECORD_COLOR }} className="font-medium">
                            {weightStr} кг
                          </span>
                          <span className="text-zinc-500">×</span>
                          <span style={{ color: VOLUME_RECORD_COLOR }} className="font-medium">
                            {vr.reps}
                          </span>
                        </>
                      );
                    } else {
                      displayContent = (
                        <span style={{ color: VOLUME_RECORD_COLOR }} className="font-medium">
                          {vr.value}
                        </span>
                      );
                    }
                    
                    return (
                      <>
                        <button
                          onClick={() => onNavigateToWorkout?.(
                            record.volumeRecord!.date,
                            record.exerciseName,
                            record.volumeRecord!.setId
                          )}
                          className="flex items-center gap-2 px-3 text-left hover:bg-zinc-700/50 transition-colors rounded-lg"
                        >
                          {displayContent}
                        </button>
                        <div className={`flex items-center justify-end px-3 text-[10px] text-zinc-600 ${hasWeight ? 'mb-2' : ''}`}>
                          По объёму
                        </div>
                      </>
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
