'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { XIcon, ClockIcon } from '@/components/icons/Icons';
import { Exercise, Workout, WorkoutSet, WORKOUT_TYPE_COLORS, WorkoutType, ExerciseType, EQUIPMENT_TYPES, GRIP_TYPES, POSITION_TYPES, WEIGHT_UNITS, WeightUnit } from '@/lib/types';
import { useFitnessStore } from '@/lib/store';
import { getExerciseTypeFromBase } from '@/lib/storage';
import { format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface ExerciseHistoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exerciseName: string;
  initialDate?: string; // начальная дата для показа
  highlightSetId?: string; // подсветить конкретный подход
  enableSwipe?: boolean; // разрешить свайп по истории
  onNavigateToDate?: (date: string) => void; // переход на дату при клике на дату
}

// Форматирование времени из секунд в MM:SS
const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export function ExerciseHistoryModal({
  open,
  onOpenChange,
  exerciseName,
  initialDate,
  highlightSetId,
  enableSwipe = true,
  onNavigateToDate,
}: ExerciseHistoryModalProps) {
  const { workouts, setSelectedDate } = useFitnessStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const highlightedSetRef = useRef<HTMLDivElement>(null);

  // Получаем все тренировки с этим упражнением
  const workoutHistory = useMemo(() => {
    if (!workouts) return [];

    return workouts
      .filter(w => w.exercises.some(e => e.name === exerciseName))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // новые сначала
  }, [workouts, exerciseName]);

  // Находим индекс начальной тренировки
  useEffect(() => {
    if (open && initialDate) {
      const idx = workoutHistory.findIndex(w => w.date === initialDate);
      if (idx >= 0) {
        setCurrentIndex(idx);
      }
    } else if (open && workoutHistory.length > 0) {
      setCurrentIndex(0);
    }
  }, [open, initialDate, workoutHistory]);

  // Скролл к подсвеченному подходу
  useEffect(() => {
    if (highlightSetId && highlightedSetRef.current) {
      setTimeout(() => {
        highlightedSetRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }, 100);
    }
  }, [highlightSetId, currentIndex]);

  const currentWorkout = workoutHistory[currentIndex];
  const currentExercise = currentWorkout?.exercises.find(e => e.name === exerciseName);

  // Определяем тип упражнения для цветов
  const exerciseType = currentExercise?.exerciseType || getExerciseTypeFromBase(exerciseName);
  const exerciseTypeToWorkoutType: Record<ExerciseType, WorkoutType> = {
    chest: 'chest',
    back: 'back',
    legs: 'legs',
    common: 'fullbody',
  };
  const workoutTypeForColor = exerciseTypeToWorkoutType[exerciseType] || 'fullbody';
  const exerciseColors = WORKOUT_TYPE_COLORS[workoutTypeForColor];

  // Обработчики свайпа
  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (!enableSwipe) return;

    const threshold = 50;
    if (info.offset.x > threshold && currentIndex < workoutHistory.length - 1) {
      // Свайп вправо - к более старым
      setDirection(-1);
      setCurrentIndex(prev => prev + 1);
    } else if (info.offset.x < -threshold && currentIndex > 0) {
      // Свайп влево - к более новым
      setDirection(1);
      setCurrentIndex(prev => prev - 1);
    }
  };

  // Обработка клика по дате
  const handleDateClick = () => {
    if (currentWorkout && onNavigateToDate) {
      onNavigateToDate(currentWorkout.date);
      onOpenChange(false);
    }
  };

  if (!currentWorkout || !currentExercise) {
    return null;
  }

  // Форматирование даты: понедельник, 18 марта 2026
  const formattedDate = format(parseISO(currentWorkout.date), 'EEEE, d MMMM yyyy', { locale: ru });
  const formattedDateShort = format(parseISO(currentWorkout.date), 'dd.MM.yy');

  // Варианты анимации для свайпа
  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0,
    }),
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="bg-zinc-900 border !p-0 !gap-0 max-w-[95vw] max-h-[80vh] overflow-hidden"
        style={{ borderColor: exerciseColors.border }}
        showCloseButton={false}
      >
        {/* Header */}
        <div 
          className="flex items-center justify-between px-4 py-3"
          style={{ background: `linear-gradient(to right, ${exerciseColors.border}, transparent) bottom left / 100% 1px no-repeat` }}
        >
          <DialogTitle className="text-white font-medium text-base">{exerciseName}</DialogTitle>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="text-zinc-500 hover:text-white active:text-white transition-colors p-1"
            data-slot="dialog-close"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Swipeable content */}
        <motion.div
          key={currentWorkout.id}
          custom={direction}
          variants={enableSwipe ? variants : undefined}
          initial={enableSwipe ? "enter" : undefined}
          animate="center"
          exit={enableSwipe ? "exit" : undefined}
          transition={{ duration: 0.2 }}
          drag={enableSwipe ? "x" : false}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragEnd={enableSwipe ? handleDragEnd : undefined}
          className="overflow-y-auto"
        >
          {/* Date row - clickable */}
          <div className="flex items-center justify-end px-4 py-2 text-sm">
            <span
              className={cn(
                "text-zinc-400",
                onNavigateToDate ? "cursor-pointer hover:bg-zinc-800/50 active:bg-zinc-800/50 rounded-lg px-2 py-0.5 -mr-2" : ""
              )}
              onClick={handleDateClick}
            >
              {formattedDate}
            </span>
          </div>

          {/* Exercise content */}
          <div className="px-4 pb-4">
            {/* Sets */}
            <div className="flex flex-col gap-0.5">
              {currentExercise.sets.map((set, setIndex) => {
                // Вычисляем номер рабочего подхода
                let workingSetNumber = 0;
                for (let i = 0; i <= setIndex; i++) {
                  if (!currentExercise.sets[i].isWarmup) workingSetNumber++;
                }

                const isHighlighted = set.id === highlightSetId;

                return (
                  <div
                    key={set.id}
                    ref={isHighlighted ? highlightedSetRef : null}
                    className={cn(
                      'flex items-center gap-3 py-1',
                      isHighlighted ? 'bg-amber-500/20 rounded-lg px-2 -mx-2 ring-1 ring-amber-500/50' : ''
                    )}
                  >
                    {/* Set number */}
                    <div className={cn(
                      'w-7 h-7 rounded-lg flex items-center justify-center text-xs font-medium shrink-0',
                      set.isWarmup
                        ? 'bg-transparent text-zinc-500 border border-zinc-500'
                        : 'bg-zinc-700 text-zinc-300'
                    )}>
                      {set.isWarmup ? 'Р' : workingSetNumber}
                    </div>

                    {/* Weight and reps */}
                    <div className="flex items-center gap-2 flex-1">
                      {set.weight > 0 && (
                        <>
                          <span className="text-white font-medium">
                            {set.weight} {WEIGHT_UNITS[set.weightUnit || 'kg'].short}
                          </span>
                          {set.reps > 0 && (
                            <>
                              <span className="text-zinc-500">×</span>
                              <span className="text-white font-medium">{set.reps}</span>
                            </>
                          )}
                        </>
                      )}

                      {/* Time */}
                      {set.time && set.time > 0 && (
                        <>
                          <ClockIcon className="w-3 h-3 text-zinc-500" />
                          <span className="text-white font-medium">{formatTime(set.time)}</span>
                        </>
                      )}

                      {/* Bodyweight (weight=0, reps>0) */}
                      {set.weight === 0 && set.reps > 0 && !set.time && (
                        <span className="text-white font-medium">{set.reps} повт</span>
                      )}
                    </div>

                    {/* Tags */}
                    <div className="flex items-center gap-1">
                      {set.equipmentType && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-lg bg-zinc-700 text-zinc-300">
                          {EQUIPMENT_TYPES[set.equipmentType].short}
                        </span>
                      )}
                      {set.gripType && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-lg bg-zinc-700 text-zinc-300">
                          {GRIP_TYPES[set.gripType].short}
                        </span>
                      )}
                      {set.positionType && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-lg bg-zinc-700 text-zinc-300">
                          {POSITION_TYPES[set.positionType].short}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Swipe indicator */}
        {enableSwipe && workoutHistory.length > 1 && (
          <div className="flex items-center justify-center gap-2 py-2 border-t border-zinc-800">
            <button
              type="button"
              onClick={() => {
                if (currentIndex < workoutHistory.length - 1) {
                  setDirection(-1);
                  setCurrentIndex(prev => prev + 1);
                }
              }}
              disabled={currentIndex >= workoutHistory.length - 1}
              className={cn(
                "text-xs px-2 py-1 rounded transition-colors",
                currentIndex < workoutHistory.length - 1
                  ? "text-zinc-500 hover:text-white hover:bg-zinc-800 cursor-pointer"
                  : "text-zinc-700 cursor-default"
              )}
            >
              ◀
            </button>
            <span className="text-xs text-zinc-500">
              {workoutHistory.length - currentIndex} из {workoutHistory.length}
            </span>
            <button
              type="button"
              onClick={() => {
                if (currentIndex > 0) {
                  setDirection(1);
                  setCurrentIndex(prev => prev - 1);
                }
              }}
              disabled={currentIndex <= 0}
              className={cn(
                "text-xs px-2 py-1 rounded transition-colors",
                currentIndex > 0
                  ? "text-zinc-500 hover:text-white hover:bg-zinc-800 cursor-pointer"
                  : "text-zinc-700 cursor-default"
              )}
            >
              ▶
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
