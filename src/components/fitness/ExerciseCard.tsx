'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Trash2, Plus, Check, Clock, RefreshCw, User, Weight as WeightIcon, ChevronUp, ChevronDown, X, Zap, Repeat2 } from 'lucide-react';
import { Exercise, WorkoutSet, getExerciseType, WORKOUT_TYPE_COLORS, WorkoutType, ExerciseType } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { getPersonalRecord, getRecordType } from '@/lib/pr';
import { useFitnessStore } from '@/lib/store';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { getPreviousSetData } from '@/lib/storage';

// Компонент для названия упражнения с авто-размером шрифта
function ExerciseNameHeader({ name }: { name: string }) {
  const ref = useRef<HTMLHeadingElement>(null);
  const [fontSize, setFontSize] = useState<'text-base' | 'text-sm'>('text-base');

  useEffect(() => {
    if (ref.current) {
      const lineHeight = parseFloat(getComputedStyle(ref.current).lineHeight);
      const height = ref.current.scrollHeight;
      const lines = height / lineHeight;
      if (lines > 2) {
        setFontSize('text-sm');
      }
    }
  }, [name]);

  return (
    <h3 ref={ref} className={`font-semibold text-white ${fontSize}`}>{name}</h3>
  );
}

interface ExerciseCardProps {
  exercise: Exercise;
  workoutId: string;
  index: number;
  totalExercises: number;
  workoutType?: WorkoutType; // тип тренировки для определения цвета упражнения
  onReplace?: (exerciseId: string, exerciseName: string) => void;
  onMoveUp?: (exerciseId: string) => void;
  onMoveDown?: (exerciseId: string) => void;
  // Drag-and-drop props
  isDragging?: boolean;
  dragY?: number;
  shiftDirection?: 'up' | 'down' | null;
  onDragStart?: (exerciseId: string, index: number, startY: number) => void;
  onDragMove?: (currentY: number) => void;
  onDragEnd?: () => void;
  // Highlight specific set (for navigation from records)
  highlightSetIndex?: number;
}

// Форматирование времени из секунд в MM:SS
const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export function ExerciseCard({ 
  exercise, 
  workoutId, 
  index, 
  totalExercises,
  workoutType,
  onReplace, 
  onMoveUp,
  onMoveDown,
  // Drag-and-drop props
  isDragging = false,
  dragY = 0,
  shiftDirection = null,
  onDragStart,
  onDragMove,
  onDragEnd,
  // Highlight props
  highlightSetIndex
}: ExerciseCardProps) {
  // State for adding new set
  const [newReps, setNewReps] = useState('');
  const [newWeight, setNewWeight] = useState('');
  const [newTimeMinutes, setNewTimeMinutes] = useState('');
  const [newTimeSeconds, setNewTimeSeconds] = useState('');
  const [isAddingSet, setIsAddingSet] = useState(false);
  const [isWarmup, setIsWarmup] = useState(false);
  
  // State for editing set
  const [editingSetId, setEditingSetId] = useState<string | null>(null);
  const [editReps, setEditReps] = useState('');
  const [editWeight, setEditWeight] = useState('');
  const [editTimeMinutes, setEditTimeMinutes] = useState('');
  const [editTimeSeconds, setEditTimeSeconds] = useState('');

  // State for input type
  const [useBodyweight, setUseBodyweight] = useState(false);
  const [useReps, setUseReps] = useState(true);
  const [useTime, setUseTime] = useState(false);
  
  // State for delete confirmation
  const [showDeleteExerciseConfirm, setShowDeleteExerciseConfirm] = useState(false);
  const [showDeleteSetConfirm, setShowDeleteSetConfirm] = useState(false);
  const [setToDelete, setSetToDelete] = useState<string | null>(null);

  // Drag-and-drop state
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartPosRef = useRef<{ x: number; y: number } | null>(null);
  const isDragActiveRef = useRef(false);
  const hasMovedRef = useRef(false);
  const dragHandleRef = useRef<HTMLDivElement>(null);
  
  // Ref for highlighted set scrolling
  const highlightedSetRef = useRef<HTMLDivElement>(null);
  
  // Scroll to highlighted set when it changes
  useEffect(() => {
    if (highlightSetIndex === undefined) return;
    
    // Retry scrolling until the element is available
    let attempts = 0;
    const maxAttempts = 10;
    const intervalMs = 100;
    
    const tryScroll = () => {
      if (highlightedSetRef.current) {
        highlightedSetRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
        return true;
      }
      return false;
    };
    
    // Try immediately
    if (tryScroll()) return;
    
    // If not available, retry periodically
    const interval = setInterval(() => {
      attempts++;
      if (tryScroll() || attempts >= maxAttempts) {
        clearInterval(interval);
      }
    }, intervalMs);
    
    return () => clearInterval(interval);
  }, [highlightSetIndex]);

  const { addSet, removeSet, updateSet, removeExercise, currentWorkout } = useFitnessStore();
  const pr = getPersonalRecord(exercise.name);
  
  // Disable text selection on iOS during drag
  useEffect(() => {
    if (isDragging) {
      document.body.style.webkitUserSelect = 'none';
      document.body.style.userSelect = 'none';
      document.body.style.webkitTouchCallout = 'none';
    } else {
      document.body.style.webkitUserSelect = '';
      document.body.style.userSelect = '';
      document.body.style.webkitTouchCallout = '';
    }
    return () => {
      document.body.style.webkitUserSelect = '';
      document.body.style.userSelect = '';
      document.body.style.webkitTouchCallout = '';
    };
  }, [isDragging]);
  
  // Drag handlers for touch
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    // Prevent default to avoid iOS gesture interference
    const touch = e.touches[0];
    touchStartPosRef.current = { x: touch.clientX, y: touch.clientY };
    hasMovedRef.current = false;
    isDragActiveRef.current = false;
    
    // Start long press timer
    longPressTimerRef.current = setTimeout(() => {
      // Check if finger hasn't moved more than 10px
      if (!hasMovedRef.current && touchStartPosRef.current) {
        isDragActiveRef.current = true;
        // Vibrate
        if (navigator.vibrate) {
          navigator.vibrate(50);
        }
        // Notify parent
        onDragStart?.(exercise.id, index, touch.clientY);
      }
    }, 200);
  }, [exercise.id, index, onDragStart]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    
    // Check movement before long press activates
    if (touchStartPosRef.current && !isDragActiveRef.current) {
      const dx = Math.abs(touch.clientX - touchStartPosRef.current.x);
      const dy = Math.abs(touch.clientY - touchStartPosRef.current.y);
      if (dx > 10 || dy > 10) {
        hasMovedRef.current = true;
        // Cancel long press timer
        if (longPressTimerRef.current) {
          clearTimeout(longPressTimerRef.current);
          longPressTimerRef.current = null;
        }
      }
    }
    
    // If drag is active, notify parent of movement
    if (isDragActiveRef.current) {
      e.preventDefault();
      onDragMove?.(touch.clientY);
    }
  }, [onDragMove]);

  const handleTouchEnd = useCallback(() => {
    // Clear timer
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    
    // End drag if active
    if (isDragActiveRef.current) {
      isDragActiveRef.current = false;
      onDragEnd?.();
    }
    
    touchStartPosRef.current = null;
    hasMovedRef.current = false;
  }, [onDragEnd]);
  
  // Определяем тип упражнения для цветовой маркировки
  // Приоритет: 1) явный тип упражнения, 2) вычисленный по названию
  const exerciseType = exercise.exerciseType || getExerciseType(exercise.name);
  
  // Маппинг exerciseType к workoutType для получения ярких цветов
  const exerciseTypeToWorkoutType: Record<ExerciseType, WorkoutType> = {
    chest: 'chest',
    back: 'back',
    legs: 'legs',
    common: 'fullbody', // для common используем фиолетовый как для fullbody
  };
  
  const workoutTypeForColor = exerciseTypeToWorkoutType[exerciseType] || 'fullbody';
  const exerciseColors = WORKOUT_TYPE_COLORS[workoutTypeForColor];
  
  // Вычисляем номер следующего подхода и получаем предыдущие значения
  const nextWorkingSetNumber = exercise.sets.filter(s => !s.isWarmup).length + 1;
  const nextWarmupSetNumber = exercise.sets.filter(s => s.isWarmup).length + 1;
  
  // Получаем предыдущие значения для следующего подхода
  const prevWorkingSetData = getPreviousSetData(exercise.name, nextWorkingSetNumber, false);
  const prevWarmupSetData = getPreviousSetData(exercise.name, nextWarmupSetNumber, true);
  
  // Цвета для рекордов
  const WEIGHT_RECORD_COLOR = '#ffb900';
  const VOLUME_RECORD_COLOR = '#cd7f32';

  // Определение типа рекорда для подхода
  const getSetRecordType = (weight: number, reps: number, setIndex: number): 'weight' | 'volume' | null => {
    if (weight <= 0 || reps <= 0) return null;
    return getRecordType(exercise.name, weight, reps, setIndex, workoutId);
  };

  const handleAddSet = () => {
    const reps = parseInt(newReps) || 0;
    const weight = useBodyweight ? 0 : (parseFloat(newWeight) || 0);
    const time = useTime ? ((parseInt(newTimeMinutes) || 0) * 60 + (parseInt(newTimeSeconds) || 0)) : 0;

    // Validate - нужен хотя бы один показатель
    if (!useReps && !useTime) return;
    if (useReps && reps <= 0 && !useBodyweight) return;
    if (!useBodyweight && useReps && weight <= 0 && !useTime) return;
    if (useTime && time <= 0 && !useReps) return;

    addSet(workoutId, exercise.id, reps, weight, time > 0 ? time : undefined, isWarmup);
    
    // Reset form
    setNewReps('');
    setNewWeight('');
    setNewTimeMinutes('');
    setNewTimeSeconds('');
    setIsAddingSet(false);
    setIsWarmup(false);
  };

  const handleUpdateSet = (setId: string, originalSet: WorkoutSet) => {
    const reps = parseInt(editReps) || 0;
    // Если оригинальный вес был > 0, берём из поля ввода, иначе оставляем 0 (собственный вес)
    const weight = originalSet.weight > 0 ? (parseFloat(editWeight) || 0) : 0;
    const time = ((parseInt(editTimeMinutes) || 0) * 60 + (parseInt(editTimeSeconds) || 0));

    if (reps <= 0 && time <= 0) return;

    updateSet(workoutId, exercise.id, setId, reps, weight, time > 0 ? time : undefined);
    
    setEditingSetId(null);
    setEditReps('');
    setEditWeight('');
    setEditTimeMinutes('');
    setEditTimeSeconds('');
  };

  const handleRemoveSet = (setId: string) => {
    setSetToDelete(setId);
    setShowDeleteSetConfirm(true);
  };

  const confirmDeleteSet = () => {
    if (setToDelete) {
      removeSet(workoutId, exercise.id, setToDelete);
      setSetToDelete(null);
    }
    setShowDeleteSetConfirm(false);
  };

  const startEditingSet = (set: WorkoutSet) => {
    setEditingSetId(set.id);
    setEditReps(String(set.reps));
    setEditWeight(String(set.weight));
    if (set.time) {
      const mins = Math.floor(set.time / 60);
      const secs = set.time % 60;
      setEditTimeMinutes(String(mins));
      setEditTimeSeconds(String(secs));
    }
  };

  const handleDeleteExercise = () => {
    removeExercise(workoutId, exercise.id);
    setShowDeleteExerciseConfirm(false);
  };

  // Render set display
  const renderSetDisplay = (set: WorkoutSet, setIndex: number) => {
    const isBodyweight = set.weight === 0;
    const hasReps = set.reps > 0;
    const hasTime = set.time && set.time > 0;
    const recordType = getSetRecordType(set.weight, set.reps, setIndex);
    const isTimeOnly = hasTime && !hasReps;

    // Определяем цвет для рекорда
    const getRecordColor = () => {
      if (recordType === 'weight') return WEIGHT_RECORD_COLOR;
      if (recordType === 'volume') return VOLUME_RECORD_COLOR;
      return '#fff';
    };

    return (
      <div className="flex items-center">
        {/* Столбец 1: Вес / Иконка User */}
        <span className="inline-block w-8 text-left font-medium text-sm">
          {isBodyweight ? (
            <User className="w-4 h-4 inline" style={{ color: '#19a655' }} />
          ) : (
            <span style={{ color: getRecordColor() }}>{set.weight}</span>
          )}
        </span>

        {/* Столбец 2: "кг" */}
        <span className="inline-block w-5 text-center text-xs text-zinc-500">
          {!isBodyweight && set.weight > 0 && 'кг'}
        </span>

        {/* Столбец 3: "×" / Иконка Clock */}
        <span className="inline-flex w-4 h-7 items-center justify-center text-sm" style={{ color: '#71717a' }}>
          {isTimeOnly ? (
            <Clock className="w-2 h-2" />
          ) : hasReps ? (
            '×'
          ) : (
            ''
          )}
        </span>

        {/* Столбец 4: Повторения / Время */}
        <span
          className="inline-block w-6 text-left font-medium text-sm"
          style={isTimeOnly ? { color: '#944ad4' } : recordType ? { color: getRecordColor() } : undefined}
        >
          {isTimeOnly ? formatTime(set.time!) : hasReps ? set.reps : ''}
        </span>
      </div>
    );
  };

  return (
    <>
      <div
        className="rounded-lg overflow-hidden bg-zinc-800 border-t border-r border-b relative"
        style={{
          borderTopColor: exerciseColors.border,
          borderRightColor: exerciseColors.border,
          borderBottomColor: exerciseColors.border,
          borderLeftWidth: '8px',
          borderLeftColor: exerciseColors.border,
          userSelect: isDragging ? 'none' : undefined,
          WebkitUserSelect: isDragging ? 'none' : undefined,
          touchAction: isDragging ? 'none' : undefined,
          position: isDragging ? 'relative' : undefined,
          // Transform for drag
          transform: isDragging
            ? `translateY(${dragY}px) scale(0.9)`
            : shiftDirection
              ? `translateY(${shiftDirection === 'down' ? 80 : -80}px)`
              : undefined,
          transformOrigin: 'center top',
          transition: isDragging
            ? 'none'
            : 'transform 250ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          willChange: isDragging || shiftDirection ? 'transform' : undefined,
          zIndex: isDragging ? 1000 : shiftDirection ? 1 : undefined,
          opacity: 1,
        }}
      >
        {/* Overlay to block clicks while editing or adding set */}
        {(editingSetId || isAddingSet) && (
          <div className="absolute inset-0 z-10" onClick={(e) => e.stopPropagation()} />
        )}
        <div className="flex">
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center justify-between py-2 pl-2 pr-4 border-b" style={{ borderColor: exerciseColors.border }}>
              <div className="flex items-center gap-2">
                {/* Move buttons / Drag handle */}
                {currentWorkout && (
                  <div
                    ref={dragHandleRef}
                    className="flex flex-col gap-0.5"
                    style={{
                      touchAction: 'none',
                      WebkitTouchCallout: 'none',
                      WebkitUserSelect: 'none',
                      userSelect: 'none',
                      WebkitTapHighlightColor: 'transparent',
                    }}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    onTouchCancel={handleTouchEnd}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onMoveUp?.(exercise.id)}
                      disabled={index === 0}
                      className="h-7 w-7 text-zinc-500 hover:text-white hover:bg-zinc-700 disabled:opacity-30"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onMoveDown?.(exercise.id)}
                      disabled={index === totalExercises - 1}
                      className="h-7 w-7 text-zinc-500 hover:text-white hover:bg-zinc-700 disabled:opacity-30"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                  </div>
                )}
                
                <div>
                  <ExerciseNameHeader name={exercise.name} />
                </div>
              </div>

              {currentWorkout && (
                <div className="flex items-center gap-1">
                  {onReplace && (
                    <Button
                      variant="ghost"
                      onClick={() => onReplace(exercise.id, exercise.name)}
                      className="text-zinc-500 hover:!bg-transparent dark:hover:!bg-transparent h-7 w-7 p-0"
                      title="Заменить упражнение"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                  )}
                  
                  <div className="w-1" />
                  
                  <Button
                    variant="ghost"
                    onClick={() => setShowDeleteExerciseConfirm(true)}
                    className="text-zinc-500 hover:text-red-400 hover:!bg-transparent dark:hover:!bg-transparent h-7 w-7 p-0"
                    title="Удалить упражнение"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>

            {/* Sets */}
            <div className={cn("flex flex-col", exercise.sets.length > 0 || !isAddingSet ? "py-4" : "pb-4")} style={{ paddingLeft: '44px', paddingRight: '16px' }}>
              <div className="space-y-2">
              {exercise.sets.map((set, setIndex) => {
                // Вычисляем номер рабочего подхода (не учитывая разминочные)
                let workingSetNumber = 0;
                for (let i = 0; i <= setIndex; i++) {
                  if (!exercise.sets[i].isWarmup) workingSetNumber++;
                }
                
                const isLastSet = setIndex === exercise.sets.length - 1;
                const isHighlighted = highlightSetIndex === setIndex;

                return (
                <div
                  key={set.id}
                  ref={isHighlighted ? highlightedSetRef : null}
                  className={cn(
                    'flex items-center transition-all duration-500',
                    editingSetId === set.id ? 'bg-zinc-700/30 -mx-2 px-2 rounded-lg relative z-[10000] gap-2' : 'gap-3',
                    isHighlighted ? 'bg-amber-500/20 -mx-2 px-2 rounded-lg ring-1 ring-amber-500/50' : ''
                  )}
                >
                  <div className={cn(
                    'w-7 h-7 rounded-lg flex items-center justify-center text-xs font-medium shrink-0',
                    set.isWarmup
                      ? 'bg-transparent text-zinc-500 border border-zinc-500'
                      : 'bg-zinc-700 text-zinc-300'
                  )}>
                    {set.isWarmup ? 'Р' : workingSetNumber}
                  </div>
                  
                  {editingSetId === set.id ? (
                    <>
                      <div className="flex items-center gap-3 flex-wrap flex-1">
                        {/* Вес и повторения */}
                        {(set.weight > 0 || set.reps > 0) && (
                          <div className="flex items-center gap-3 relative">
                            {set.weight > 0 && (
                              <Input
                                type="number"
                                step="0.5"
                                min="0.1"
                                value={editWeight}
                                onChange={(e) => setEditWeight(e.target.value)}
                                placeholder="Вес, кг"
                                className="w-12 h-7 bg-zinc-700 border-zinc-600 text-white text-xs [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              />
                            )}
                            
                            {set.weight > 0 && set.reps > 0 && (
                              <span className="absolute left-1/2 -translate-x-1/2 text-zinc-500 text-sm">×</span>
                            )}
                            
                            {set.reps > 0 && (
                              <Input
                                type="number"
                                min="1"
                                value={editReps}
                                onChange={(e) => setEditReps(e.target.value)}
                                placeholder="Повторения"
                                className="w-12 h-7 bg-zinc-700 border-zinc-600 text-white text-xs [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              />
                            )}
                          </div>
                        )}
                        
                        {/* Время */}
                        {set.time && set.time > 0 && (
                          <div className="flex items-center gap-3 relative">
                            <Input
                              type="number"
                              min="0"
                              value={editTimeMinutes}
                              onChange={(e) => setEditTimeMinutes(e.target.value)}
                              placeholder="Мин"
                              className="w-12 h-7 bg-zinc-700 border-zinc-600 text-white text-xs text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                            <span className="absolute left-1/2 -translate-x-1/2 text-zinc-500 text-xs">:</span>
                            <Input
                              type="number"
                              min="0"
                              max={59}
                              value={editTimeSeconds}
                              onChange={(e) => setEditTimeSeconds(e.target.value)}
                              placeholder="Сек"
                              className="w-12 h-7 bg-zinc-700 border-zinc-600 text-white text-xs text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                          </div>
                        )}
                        
                        <Button
                          size="sm"
                          onClick={() => handleUpdateSet(set.id, set)}
                          className="h-7 w-7 p-0 flex items-center justify-center bg-[#19a655]"
                        >
                          <Check className="w-3 h-3" />
                        </Button>
                      </div>
                      
                      <Button
                        variant="ghost"
                        onClick={() => setEditingSetId(null)}
                        className="text-zinc-500 hover:text-red-400 hover:!bg-transparent dark:hover:!bg-transparent h-7 w-7 shrink-0 p-0"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <div
                        onClick={() => startEditingSet(set)}
                        className="flex-1 h-7 flex items-center cursor-pointer hover:bg-zinc-700/30 px-2 -ml-2 rounded-lg transition-colors"
                      >
                        {renderSetDisplay(set, setIndex)}
                      </div>
                      
                      <Button
                        variant="ghost"
                        onClick={() => handleRemoveSet(set.id)}
                        className="text-zinc-500 hover:text-red-400 hover:!bg-transparent dark:hover:!bg-transparent h-7 w-7 shrink-0 p-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </div>
              );})}
              </div>

              {/* Overlay to block clicks while editing or adding set */}
              {(editingSetId || isAddingSet) && (
                <div className="fixed inset-0 z-[9999] bg-black/50" />
              )}
              {isAddingSet ? (
                <div className="pt-4 relative z-[10000]">
                  {/* Toggle tags */}
                  <div className="flex gap-2 flex-wrap items-center mb-2">
                    {!exercise.sets.some(s => s.isWarmup) && (
                      <div
                        onClick={() => setIsWarmup(!isWarmup)}
                        className={cn(
                          'flex items-center gap-1 px-2 py-1 rounded-lg cursor-pointer transition-colors',
                          isWarmup ? 'bg-amber-600/20 border border-amber-500/50' : 'bg-zinc-700/50 border border-zinc-600'
                        )}
                      >
                        <Zap className="w-3 h-3 text-amber-400" />
                        <span className="text-[10px] text-zinc-300">Разм.</span>
                      </div>
                    )}

                    <div
                      onClick={() => setUseBodyweight(!useBodyweight)}
                      className={cn(
                        'flex items-center gap-1 px-2 py-1 rounded-lg cursor-pointer transition-colors',
                        useBodyweight ? 'bg-emerald-600/20 border border-emerald-500/50' : 'bg-zinc-700/50 border border-zinc-600'
                      )}
                    >
                      <User className="w-3 h-3 text-emerald-400" />
                      <span className="text-[10px] text-zinc-300">Собст. вес</span>
                    </div>

                    <div
                      onClick={() => setUseReps(!useReps)}
                      className={cn(
                        'flex items-center gap-1 px-2 py-1 rounded-lg cursor-pointer transition-colors',
                        useReps ? 'bg-red-600/20 border border-red-500/50' : 'bg-zinc-700/50 border border-zinc-600'
                      )}
                    >
                      <Repeat2 className="w-3 h-3 text-red-400" />
                      <span className="text-[10px] text-zinc-300">Повт.</span>
                    </div>

                    <div
                      onClick={() => setUseTime(!useTime)}
                      className={cn(
                        'flex items-center gap-1 px-2 py-1 rounded-lg cursor-pointer transition-colors',
                        useTime ? 'bg-purple-600/20 border border-purple-500/50' : 'bg-zinc-700/50 border border-zinc-600'
                      )}
                    >
                      <Clock className="w-3 h-3 text-purple-400" />
                      <span className="text-[10px] text-zinc-300">Вр.</span>
                    </div>
                  </div>

                  {/* Input fields */}
                  <div className="flex items-center gap-2 mb-2 -ml-9">
                    <div className={cn(
                      'w-7 h-7 rounded-lg flex items-center justify-center text-xs font-medium shrink-0',
                      isWarmup
                        ? 'bg-transparent text-zinc-500 border border-zinc-500'
                        : 'bg-zinc-700 text-zinc-300'
                    )}>
                      {isWarmup ? 'Р' : exercise.sets.filter(s => !s.isWarmup).length + 1}
                    </div>

                    {(!useBodyweight || useReps) && (
                      <div className="flex items-center gap-3 relative">
                        {!useBodyweight && (
                          <Input
                            type="number"
                            step="0.5"
                            min="0.1"
                            value={newWeight}
                            onChange={(e) => setNewWeight(e.target.value)}
                            placeholder="кг"
                            className="w-14 h-7 bg-zinc-700 border-zinc-600 text-white text-xs placeholder:text-zinc-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                        )}

                        {!useBodyweight && useReps && (
                          <span className="absolute left-1/2 -translate-x-1/2 text-zinc-500 text-sm">×</span>
                        )}

                        {useReps && (
                          <Input
                            type="number"
                            min="1"
                            value={newReps}
                            onChange={(e) => setNewReps(e.target.value)}
                            placeholder="повт."
                            className="w-14 h-7 bg-zinc-700 border-zinc-600 text-white text-xs placeholder:text-zinc-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                        )}
                      </div>
                    )}

                    {useTime && (
                      <div className="flex items-center gap-3 relative ml-1">
                        <Input
                          type="number"
                          min="0"
                          value={newTimeMinutes}
                          onChange={(e) => setNewTimeMinutes(e.target.value)}
                          placeholder="мин."
                          className="w-14 h-7 bg-zinc-700 border-zinc-600 text-white text-xs text-center placeholder:text-zinc-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <span className="absolute left-1/2 -translate-x-1/2 text-zinc-500 text-xs">:</span>
                        <Input
                          type="number"
                          min="0"
                          max={59}
                          value={newTimeSeconds}
                          onChange={(e) => setNewTimeSeconds(e.target.value)}
                          placeholder="сек."
                          className="w-14 h-7 bg-zinc-700 border-zinc-600 text-white text-xs text-center placeholder:text-zinc-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                      </div>
                    )}
                  </div>

                  {/* Previous values hint */}
                  {(() => {
                    const prevData = isWarmup ? prevWarmupSetData : prevWorkingSetData;
                    if (!prevData) return null;

                    return (
                      <div className="flex items-center text-[10px] text-zinc-500 -ml-9 gap-3">
                        <div className="w-7 text-center">Было</div>
                        {(!useBodyweight || useReps) && (
                          <div className="flex items-center gap-3 relative">
                            {!useBodyweight && (
                              <div className="w-14 text-center">
                                {prevData.isBodyweight ? (
                                  <span>Собст. вес</span>
                                ) : prevData.weight > 0 ? (
                                  <span>{prevData.weight} кг</span>
                                ) : null}
                              </div>
                            )}
                            {!useBodyweight && useReps && (
                              <span className="absolute left-1/2 -translate-x-1/2 text-center">×</span>
                            )}
                            {useReps && (
                              <div className="w-14 text-center">
                                {prevData.reps > 0 ? `${prevData.reps} повт.` : ''}
                              </div>
                            )}
                          </div>
                        )}
                        {useTime && (
                          <div className="flex items-center gap-3 relative">
                            <div className="w-14 text-center">
                              {prevData.time > 0 ? Math.floor(prevData.time / 60) : ''}
                            </div>
                            <span className="absolute left-1/2 -translate-x-1/2 text-xs">:</span>
                            <div className="w-14 text-center">
                              {prevData.time > 0 ? (prevData.time % 60).toString().padStart(2, '0') : ''}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* Buttons */}
                  <div className="flex justify-end items-center gap-2 pt-4">
                    <button
                      onClick={() => {
                        setIsAddingSet(false);
                        setNewReps('');
                        setNewWeight('');
                        setNewTimeMinutes('');
                        setNewTimeSeconds('');
                        setUseBodyweight(false);
                        setUseReps(true);
                        setIsWarmup(false);
                      }}
                      className="py-2 px-4 rounded-lg bg-zinc-700 text-zinc-300 text-sm font-medium border-0 hover:bg-zinc-700 hover:text-zinc-300"
                    >
                      Отмена
                    </button>
                    <button
                      onClick={handleAddSet}
                      disabled={
                        (useReps && !newReps) || 
                        (!useBodyweight && useReps && !newWeight) ||
                        (!useReps && !newTimeMinutes && !newTimeSeconds)
                      }
                      className="py-2 px-4 rounded-lg text-primary-foreground text-sm font-medium border-0 hover:opacity-90 disabled:opacity-50"
                      style={{ backgroundColor: '#19a655' }}
                    >
                      Добавить
                    </button>
                  </div>
                </div>
              ) : (
                <div className={cn("flex justify-end", exercise.sets.length > 0 && "mt-4")}>
                  <button
                    onClick={() => setIsAddingSet(true)}
                    className="py-2 px-4 rounded-lg text-sm font-medium text-primary-foreground hover:opacity-90"
                    style={{ backgroundColor: '#19a655' }}
                  >
                    Добавить подход
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete exercise confirmation */}
      <ConfirmDialog
        open={showDeleteExerciseConfirm}
        onOpenChange={setShowDeleteExerciseConfirm}
        title="Удалить упражнение?"
        description={
          <>
            Упражнение <strong className="text-white">"{exercise.name}"</strong> и все его подходы будут удалены.<br />
            Это действие нельзя отменить.
          </>
        }
        confirmText="Удалить"
        onConfirm={handleDeleteExercise}
        borderColor={exerciseColors.border}
      />

      {/* Delete set confirmation */}
      <ConfirmDialog
        open={showDeleteSetConfirm}
        onOpenChange={(open) => {
          setShowDeleteSetConfirm(open);
          if (!open) setSetToDelete(null);
        }}
        title="Удалить подход?"
        description={
          <>
            {setToDelete && (() => {
              const setToDeleteData = exercise.sets.find(s => s.id === setToDelete);
              if (!setToDeleteData) return null;
              
              if (setToDeleteData.isWarmup) {
                return (
                  <>
                    <strong className="text-white">Разминочный</strong> подход будет удалён.<br />
                    Это действие нельзя отменить.
                  </>
                );
              }
              
              // Вычисляем номер рабочего подхода (как в UI)
              let workingSetNumber = 0;
              for (let i = 0; i < exercise.sets.length; i++) {
                if (!exercise.sets[i].isWarmup) workingSetNumber++;
                if (exercise.sets[i].id === setToDelete) break;
              }
              
              return (
                <>
                  Подход <strong className="text-white">#{workingSetNumber}</strong> будет удалён.<br />
                  Это действие нельзя отменить.
                </>
              );
            })()}
          </>
        }
        confirmText="Удалить"
        onConfirm={confirmDeleteSet}
        borderColor={exerciseColors.border}
      />
    </>
  );
}
