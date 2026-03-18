'use client';

import { useState, useMemo, useRef, useCallback, useEffect, useReducer } from 'react';
import { Trash2, Calendar, Clock, Search, RefreshCw, Pencil, X } from 'lucide-react';
import { Workout, WorkoutType, WORKOUT_TYPE_COLORS, WORKOUT_TYPE_NAMES, WORKOUT_TYPE_ICONS, getExerciseType, EXERCISE_TYPE_COLORS, EXERCISE_TYPE_MARKERS, EXERCISE_TYPE_NAMES, ExerciseType } from '@/lib/types';
import { ExerciseCard } from './ExerciseCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import { useFitnessStore } from '@/lib/store';
import { getAllExercisesForType, getAllExercises } from '@/lib/storage';

interface WorkoutViewProps {
  workout: Workout;
  highlightExercise?: { name: string; setIndex: number } | null;
}

export function WorkoutView({ workout, highlightExercise }: WorkoutViewProps) {
  const [isAddExerciseOpen, setIsAddExerciseOpen] = useState(false);
  const [isCreateCustomOpen, setIsCreateCustomOpen] = useState(false);
  const [isReplaceExerciseOpen, setIsReplaceExerciseOpen] = useState(false);
  const [replacingExerciseId, setReplacingExerciseId] = useState<string | null>(null);
  const [replacingExerciseName, setReplacingExerciseName] = useState('');
  const [newExerciseName, setNewExerciseName] = useState('');
  const [newExerciseType, setNewExerciseType] = useState<ExerciseType>('chest');
  const [searchQuery, setSearchQuery] = useState('');
  const [exerciseTypeFilter, setExerciseTypeFilter] = useState<ExerciseType | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [selectedReplaceExercise, setSelectedReplaceExercise] = useState<string | null>(null);
  const [duplicateExerciseError, setDuplicateExerciseError] = useState(false);
  const [showDeleteWorkoutConfirm, setShowDeleteWorkoutConfirm] = useState(false);
  const [showReplaceConfirm, setShowReplaceConfirm] = useState(false);
  const [pendingReplaceName, setPendingReplaceName] = useState('');
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [notesValue, setNotesValue] = useState(workout.notes || '');
  
  // Drag-and-drop state
  const [dragState, setDragState] = useState<{
    draggedId: string;
    draggedIndex: number;
    currentIndex: number;
    startY: number;
    currentY: number;
    startScrollY: number;
  } | null>(null);
  const [suppressLayoutAnimation, setSuppressLayoutAnimation] = useState(false);
  const [, forceUpdate] = useReducer(x => x + 1, 0);
  const dragStateRef = useRef<typeof dragState>(null);
  const exerciseRefsRef = useRef<Map<string, HTMLDivElement>>(new Map());
  const containerRefRef = useRef<HTMLDivElement>(null);
  const autoScrollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const notesTextareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Keep ref in sync with state
  dragStateRef.current = dragState;

  // Auto-resize notes textarea when dialog opens
  useEffect(() => {
    if (isNotesOpen) {
      // Use requestAnimationFrame to ensure textarea is rendered
      requestAnimationFrame(() => {
        if (notesTextareaRef.current) {
          notesTextareaRef.current.style.height = 'auto';
          notesTextareaRef.current.style.height = notesTextareaRef.current.scrollHeight + 'px';
        }
      });
    }
  }, [isNotesOpen]);

  // Force re-render on scroll during drag to keep element with finger
  // Also prevent iOS default touch behavior during drag
  useEffect(() => {
    if (!dragState) return;

    const handleScroll = () => {
      forceUpdate();
    };

    // Prevent default touch behavior on iOS during drag (passive: false is required)
    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [dragState]);
  
  const { addExercise, removeExercise, replaceExercise, deleteWorkout, moveExerciseUp, moveExerciseDown, updateWorkoutNotes } = useFitnessStore();

  const colors = WORKOUT_TYPE_COLORS[workout.type];

  // Получаем ВСЕ упражнения из базы (стандартные + пользовательские всех типов)
  const allExercisesList = useMemo(() => {
    return getAllExercises();
  }, []);

  // Добавленные упражнения
  const addedExerciseNames = useMemo(() => {
    return new Set(workout.exercises.map(e => e.name));
  }, [workout.exercises]);

  // Упражнения для отображения
  const displayedExercises = useMemo(() => {
    let result = allExercisesList;
    
    // Фильтр по поиску - ищет по всем упражнениям
    if (searchQuery) {
      result = result.filter(ex => 
        ex.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Теги фильтруют - показываем только совпадающие
    if (exerciseTypeFilter) {
      result = result.filter(ex => getExerciseType(ex) === exerciseTypeFilter);
    }
    
    return result;
  }, [allExercisesList, searchQuery, exerciseTypeFilter]);

  // Проверка на дубликат упражнения
  const checkDuplicateExercise = (name: string): boolean => {
    const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
    return allExercisesList.some(ex => ex.toLowerCase() === capitalizedName.toLowerCase());
  };

  const handleAddExercise = (name?: string, exerciseType?: ExerciseType) => {
    const exerciseName = name || newExerciseName.trim();
    const type = exerciseType || newExerciseType;
    if (exerciseName) {
      addExercise(workout.id, exerciseName, type);
      setNewExerciseName('');
      setNewExerciseType('chest');
      setSearchQuery('');
      setExerciseTypeFilter(null);
      setSelectedExercise(null);
      setDuplicateExerciseError(false);
      setIsAddExerciseOpen(false);
      setIsCreateCustomOpen(false);
    }
  };

  const handleAddSelectedExercise = () => {
    if (selectedExercise) {
      const exerciseType = getExerciseType(selectedExercise);
      handleAddExercise(selectedExercise, exerciseType);
    }
  };

  const handleAddCustomExercise = () => {
    if (newExerciseName.trim()) {
      // Проверка на дубликат
      if (checkDuplicateExercise(newExerciseName.trim())) {
        setDuplicateExerciseError(true);
        return;
      }
      // Делаем первую букву заглавной
      const capitalizedName = newExerciseName.trim().charAt(0).toUpperCase() + newExerciseName.trim().slice(1);
      handleAddExercise(capitalizedName, newExerciseType);
    }
  };

  const handleReplaceExercise = (exerciseId: string, exerciseName: string) => {
    setReplacingExerciseId(exerciseId);
    setReplacingExerciseName(exerciseName);
    setSearchQuery('');
    setNewExerciseName('');
    setSelectedReplaceExercise(null);
    setExerciseTypeFilter(getExerciseType(exerciseName));
    setIsReplaceExerciseOpen(true);
  };

  const handleConfirmReplace = (newName: string) => {
    setPendingReplaceName(newName);
    setShowReplaceConfirm(true);
  };

  const confirmReplace = () => {
    if (replacingExerciseId && pendingReplaceName) {
      // Заменяем упражнение (сохраняет позицию)
      replaceExercise(workout.id, replacingExerciseId, pendingReplaceName, getExerciseType(pendingReplaceName));
      setIsReplaceExerciseOpen(false);
      setReplacingExerciseId(null);
      setReplacingExerciseName('');
      setShowReplaceConfirm(false);
      setPendingReplaceName('');
    }
  };

  const handleMoveUp = (exerciseId: string) => {
    moveExerciseUp(workout.id, exerciseId);
  };

  const handleMoveDown = (exerciseId: string) => {
    moveExerciseDown(workout.id, exerciseId);
  };

  const handleDeleteWorkout = () => {
    deleteWorkout(workout.id);
    setShowDeleteWorkoutConfirm(false);
  };

  const handleSaveNotes = () => {
    updateWorkoutNotes(workout.id, notesValue);
    setIsNotesOpen(false);
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotesValue(e.target.value);
    // Auto-resize textarea
    if (notesTextareaRef.current) {
      notesTextareaRef.current.style.height = 'auto';
      notesTextareaRef.current.style.height = notesTextareaRef.current.scrollHeight + 'px';
    }
  };

  // Drag-and-drop handlers
  const handleDragStart = useCallback((exerciseId: string, index: number, startY: number) => {
    setDragState({
      draggedId: exerciseId,
      draggedIndex: index,
      currentIndex: index,
      startY,
      currentY: startY,
      startScrollY: window.scrollY,
    });
  }, []);

  const handleDragMove = useCallback((currentY: number) => {
    const currentDragState = dragStateRef.current;
    if (!currentDragState) return;
    
    // Update currentY for animation (account for scroll changes)
    const scrollDelta = window.scrollY - currentDragState.startScrollY;
    setDragState(prev => prev ? { ...prev, currentY: currentY } : null);
    
    // Find which exercise we're hovering over by checking Y position
    let targetIndex = currentDragState.draggedIndex;
    
    const exerciseRects: { id: string; index: number; top: number; bottom: number; height: number }[] = [];
    exerciseRefsRef.current.forEach((element, id) => {
      const rect = element.getBoundingClientRect();
      const idx = workout.exercises.findIndex(e => e.id === id);
      exerciseRects.push({
        id,
        index: idx,
        top: rect.top,
        bottom: rect.bottom,
        height: rect.height
      });
    });
    
    // Sort by position
    exerciseRects.sort((a, b) => a.top - b.top);
    
    // Find target index - use top third of element as threshold
    for (let i = 0; i < exerciseRects.length; i++) {
      const item = exerciseRects[i];
      const threshold = item.top + item.height * 0.33; // Top 33% of element
      
      // If dragging down and past threshold of this item
      if (i > currentDragState.draggedIndex) {
        if (currentY > threshold) {
          targetIndex = i;
        }
      }
      // If dragging up and before threshold of this item
      else if (i < currentDragState.draggedIndex) {
        if (currentY < item.bottom - item.height * 0.33) {
          targetIndex = i;
          break;
        }
      }
    }
    
    if (targetIndex !== currentDragState.currentIndex) {
      setDragState(prev => prev ? { ...prev, currentIndex: targetIndex } : null);
    }
    
    // Auto-scroll
    if (autoScrollIntervalRef.current) {
      clearInterval(autoScrollIntervalRef.current);
      autoScrollIntervalRef.current = null;
    }
    
    const scrollZone = 60;
    if (currentY < scrollZone) {
      autoScrollIntervalRef.current = setInterval(() => {
        window.scrollBy(0, -15);
      }, 16);
    } else if (currentY > window.innerHeight - scrollZone) {
      autoScrollIntervalRef.current = setInterval(() => {
        window.scrollBy(0, 15);
      }, 16);
    }
  }, [workout.exercises]);

  const handleDragEnd = useCallback(() => {
    if (autoScrollIntervalRef.current) {
      clearInterval(autoScrollIntervalRef.current);
      autoScrollIntervalRef.current = null;
    }
    
    const currentDragState = dragStateRef.current;
    
    // Отключаем layout анимацию при drag
    setSuppressLayoutAnimation(true);
    
    // Сбрасываем dragState
    setDragState(null);
    
    // Перемещаем карточку
    if (currentDragState && currentDragState.currentIndex !== currentDragState.draggedIndex) {
      const moves = currentDragState.currentIndex - currentDragState.draggedIndex;
      const exerciseId = currentDragState.draggedId;
      
      if (moves > 0) {
        for (let i = 0; i < moves; i++) {
          moveExerciseDown(workout.id, exerciseId);
        }
      } else {
        for (let i = 0; i < Math.abs(moves); i++) {
          moveExerciseUp(workout.id, exerciseId);
        }
      }
    }
    
    // Включаем анимацию обратно после рендера
    requestAnimationFrame(() => {
      setSuppressLayoutAnimation(false);
    });
  }, [workout.id, moveExerciseUp, moveExerciseDown]);

  const totalVolume = workout.exercises.reduce((sum, ex) => {
    return sum + ex.sets.reduce((s, set) => s + set.reps * set.weight, 0);
  }, 0);

  // Расчёт затраченного времени
  const getWorkoutDuration = (): number | null => {
    // Если есть duration из импорта - используем его
    if (workout.duration) {
      return workout.duration;
    }

    // Проверяем, что дата тренировки = сегодня
    const today = new Date().toISOString().split('T')[0];
    if (workout.date !== today) {
      return null;
    }

    // Собираем все timestamps из подходов
    const timestamps: number[] = [];
    workout.exercises.forEach(ex => {
      ex.sets.forEach(set => {
        if (set.timestamp) {
          timestamps.push(new Date(set.timestamp).getTime());
        }
      });
    });

    if (timestamps.length < 2) {
      return null;
    }

    // Считаем разницу между первым и последним подходом в минутах
    const minTime = Math.min(...timestamps);
    const maxTime = Math.max(...timestamps);
    const diffMinutes = Math.round((maxTime - minTime) / (1000 * 60));

    return diffMinutes;
  };

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  const workoutDuration = getWorkoutDuration();

  return (
    <div className="space-y-4">
      {/* Workout header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 rounded-lg border"
        style={{
          backgroundColor: colors.bg,
          borderColor: colors.border
        }}
      >
        <div className="flex flex-col">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-9 h-9 shrink-0" style={{ backgroundColor: colors.border }} />
              <h2 className="text-xl font-bold" style={{ color: colors.text }}>
                {WORKOUT_TYPE_NAMES[workout.type]}
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setNotesValue(workout.notes || '');
                  setIsNotesOpen(true);
                }}
                className="h-9 w-9 rounded-lg text-zinc-500 hover:text-zinc-300 hover:!bg-transparent dark:hover:!bg-transparent"
                title="Добавить заметку"
              >
                <Pencil className="w-4 h-4" style={workout.notes ? { color: colors.text } : undefined} />
              </Button>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowDeleteWorkoutConfirm(true)}
              className="text-zinc-500 hover:text-red-400 hover:!bg-transparent dark:hover:!bg-transparent"
            >
              <Trash2 className="w-5 h-5" />
            </Button>
          </div>

        </div>

        {/* Notes display */}
        {workout.notes && (
          <div className="mt-3 p-2 bg-zinc-800/50 rounded-lg text-sm text-zinc-300 border border-zinc-700/50">
            {workout.notes}
          </div>
        )}

        {/* Stats */}
        <div className="flex justify-between mt-4">
          <div className="ml-10">
            {workoutDuration !== null && (
              <>
                <div className="text-2xl font-bold text-white">{formatDuration(workoutDuration)}</div>
                <div className="text-xs text-zinc-500">Затрачено (чч:мм)</div>
              </>
            )}
          </div>
          <div className="flex gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{workout.exercises.length}</div>
              <div className="text-xs text-zinc-500">Упражнений</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{Math.round(totalVolume)}</div>
              <div className="text-xs text-zinc-500">Объем (кг)</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Exercises list */}
      <AnimatePresence mode="popLayout">
        {workout.exercises.map((exercise, index) => {
          const isDragging = dragState?.draggedId === exercise.id;
          const draggedIndex = dragState?.draggedIndex ?? 0;
          const currentIndex = dragState?.currentIndex ?? 0;
          const exerciseIndex = index;
          
          // Calculate dragY for dragged element (relative movement from start)
          // Account for scroll changes during drag - this keeps element with finger
          let dragY = 0;
          if (isDragging && dragState) {
            const scrollDelta = window.scrollY - dragState.startScrollY;
            dragY = dragState.currentY - dragState.startY;
            // Add scrollDelta to compensate for page movement
            dragY += scrollDelta;
          }
          
          // Calculate shift direction for non-dragged items
          let shiftDirection: 'up' | 'down' | null = null;
          if (dragState && !isDragging) {
            if (exerciseIndex > draggedIndex && exerciseIndex <= currentIndex) {
              shiftDirection = 'up';
            } else if (exerciseIndex < draggedIndex && exerciseIndex >= currentIndex) {
              shiftDirection = 'down';
            }
          }
          
          return (
            <motion.div
              key={exercise.id}
              layout
              transition={suppressLayoutAnimation ? { duration: 0 } : { duration: 0.35, ease: 'easeOut' }}
              ref={(el) => {
                if (el) exerciseRefsRef.current.set(exercise.id, el);
              }}
            >
              <ExerciseCard
                exercise={exercise}
                workoutId={workout.id}
                workoutType={workout.type}
                index={index}
                totalExercises={workout.exercises.length}
                onReplace={handleReplaceExercise}
                onMoveUp={handleMoveUp}
                onMoveDown={handleMoveDown}
                isDragging={isDragging}
                dragY={dragY}
                shiftDirection={shiftDirection}
                onDragStart={handleDragStart}
                onDragMove={handleDragMove}
                onDragEnd={handleDragEnd}
              highlightSetIndex={highlightExercise?.name === exercise.name ? highlightExercise.setIndex : undefined}
              />
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Add exercise button */}
      <Dialog open={isAddExerciseOpen} onOpenChange={(open) => {
        setIsAddExerciseOpen(open);
        if (!open) {
          setSearchQuery('');
          setNewExerciseName('');
          setExerciseTypeFilter(null);
          setSelectedExercise(null);
        }
      }}>
        <DialogTrigger asChild>
          <button
            className="w-full py-2 rounded-lg text-sm font-medium text-primary-foreground"
            style={{ backgroundColor: '#19a655' }}
          >
            Добавить упражнение
          </button>
        </DialogTrigger>
        <DialogContent 
          className="bg-zinc-800 border h-[70vh] !top-[15vh] !translate-y-0 !p-0 !gap-0 flex flex-col"
          style={{ borderColor: colors.border }}
          showCloseButton={false}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 pt-4 shrink-0">
            <DialogTitle className="text-white font-medium text-base">Добавить упражнение</DialogTitle>
            <button
              onClick={() => setIsAddExerciseOpen(false)}
              className="text-zinc-500 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex flex-col min-h-0 p-4 gap-4 flex-1">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск упражнения..."
                className="!bg-zinc-900/50 border border-zinc-700 rounded-lg text-white placeholder:text-zinc-500 pl-9"
                autoComplete="off"
                inputMode="search"
              />
            </div>

            {/* Type filter tags */}
            <div className="flex gap-1">
              {(['chest', 'back', 'legs', 'common'] as ExerciseType[]).map((type) => {
                const typeColors = EXERCISE_TYPE_COLORS[type];
                const typeMarker = EXERCISE_TYPE_MARKERS[type];
                const isSelected = exerciseTypeFilter === type;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setExerciseTypeFilter(isSelected ? null : type)}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-all border flex-1 justify-center"
                    style={isSelected ? {
                      backgroundColor: typeColors.bg,
                      color: typeColors.text,
                      borderColor: typeColors.border
                    } : {
                      backgroundColor: '#27272a',
                      color: '#a1a1aa',
                      borderColor: 'transparent'
                    }}
                  >
                    <span
                      className="w-3.5 h-3.5 rounded text-[9px] font-bold flex items-center justify-center"
                      style={{ backgroundColor: isSelected ? typeColors.bg : '#3f3f46', color: typeColors.text }}
                    >
                      {typeMarker}
                    </span>
                    <span className="truncate">{EXERCISE_TYPE_NAMES[type]}</span>
                  </button>
                );
              })}
            </div>

            {/* Available exercises list */}
            <div className="flex-1 min-h-0 overflow-y-auto space-y-1 border border-zinc-700 rounded-lg p-2 bg-zinc-900/50" style={{ touchAction: 'pan-y' }}>
              {displayedExercises.length > 0 ? (
                displayedExercises.map((exerciseName) => {
                  const exerciseType = getExerciseType(exerciseName);
                  const exerciseColors = EXERCISE_TYPE_COLORS[exerciseType];
                  const exerciseMarker = EXERCISE_TYPE_MARKERS[exerciseType];
                  const isSelected = selectedExercise === exerciseName;
                  const isAdded = addedExerciseNames.has(exerciseName);
                  return (
                    <button
                      key={exerciseName}
                      onClick={() => !isAdded && setSelectedExercise(isSelected ? null : exerciseName)}
                      disabled={isAdded}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-2",
                        isAdded 
                          ? "opacity-40 cursor-not-allowed text-zinc-500"
                          : isSelected 
                            ? "bg-zinc-600 text-white" 
                            : "hover:bg-zinc-700/50 text-zinc-300 hover:text-white"
                      )}
                    >
                      <span
                        className="w-5 h-5 rounded text-[10px] font-bold flex items-center justify-center shrink-0"
                        style={{ backgroundColor: exerciseColors.bg, color: exerciseColors.text }}
                      >
                        {exerciseMarker}
                      </span>
                      <span className="flex-1">{exerciseName}</span>
                      {isAdded && <span className="text-xs">✓</span>}
                    </button>
                  );
                })
              ) : (
                <p className="text-center text-zinc-500 py-4">Нет упражнений</p>
              )}
            </div>
          </div>

          {/* Bottom buttons */}
          <div className="flex items-center justify-between px-4 pb-4 shrink-0">
            <button
              onClick={() => {
                setIsAddExerciseOpen(false);
                setIsCreateCustomOpen(true);
              }}
              className="py-2 px-4 rounded-lg text-sm font-medium text-black hover:opacity-90"
              style={{ backgroundColor: '#ffae00' }}
            >
              Создать своё
            </button>
            <button
              onClick={handleAddSelectedExercise}
              disabled={!selectedExercise}
              className="py-2 px-4 rounded-lg text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#19a655' }}
            >
              Добавить
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create custom exercise dialog */}
      <Dialog open={isCreateCustomOpen} onOpenChange={(open) => {
        setIsCreateCustomOpen(open);
        if (!open) {
          setNewExerciseName('');
          setNewExerciseType('chest');
          setDuplicateExerciseError(false);
        }
      }}>
        <DialogContent 
          className="bg-zinc-800 border max-h-[80vh] !p-0 !gap-0"
          style={{ borderColor: colors.border }}
          showCloseButton={false}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 pt-4">
            <DialogTitle className="text-white font-medium text-base">Введите название упражнения</DialogTitle>
            <button
              onClick={() => setIsCreateCustomOpen(false)}
              className="text-zinc-500 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 space-y-4">
            {/* Name input */}
            <Input
              value={newExerciseName}
              onChange={(e) => {
                setNewExerciseName(e.target.value);
                setDuplicateExerciseError(false);
              }}
              placeholder="Название упражнения"
              className="!bg-zinc-900/50 border border-zinc-700 rounded-lg text-white placeholder:text-zinc-500"
              autoComplete="off"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newExerciseName.trim() && !duplicateExerciseError) {
                  handleAddCustomExercise();
                }
              }}
            />

            {/* Duplicate error */}
            {duplicateExerciseError && (
              <p className="text-red-400 text-xs">Такое упражнение уже существует</p>
            )}

            {/* Type tags */}
            <div className="flex gap-1">
              {(['chest', 'back', 'legs', 'common'] as ExerciseType[]).map((type) => {
                const typeColors = EXERCISE_TYPE_COLORS[type];
                const typeMarker = EXERCISE_TYPE_MARKERS[type];
                const isSelected = newExerciseType === type;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setNewExerciseType(type)}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-all border flex-1 justify-center"
                    style={isSelected ? {
                      backgroundColor: typeColors.bg,
                      color: typeColors.text,
                      borderColor: typeColors.border
                    } : {
                      backgroundColor: '#27272a',
                      color: '#a1a1aa',
                      borderColor: 'transparent'
                    }}
                  >
                    <span
                      className="w-3.5 h-3.5 rounded text-[9px] font-bold flex items-center justify-center"
                      style={{ backgroundColor: isSelected ? typeColors.bg : '#3f3f46', color: typeColors.text }}
                    >
                      {typeMarker}
                    </span>
                    <span className="truncate">{EXERCISE_TYPE_NAMES[type]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Create button */}
          <div className="flex justify-end px-4 pb-4">
            <button
              onClick={handleAddCustomExercise}
              disabled={!newExerciseName.trim()}
              className="py-2 px-4 rounded-lg text-sm font-medium text-black hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#ffae00' }}
            >
              Создать
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Replace exercise dialog */}
      <Dialog open={isReplaceExerciseOpen} onOpenChange={(open) => {
        setIsReplaceExerciseOpen(open);
        if (!open) {
          setReplacingExerciseId(null);
          setReplacingExerciseName('');
          setSearchQuery('');
          setNewExerciseName('');
          setSelectedReplaceExercise(null);
          setExerciseTypeFilter(null);
        }
      }}>
        <DialogContent
          className="bg-zinc-800 border h-[70vh] !top-[15vh] !translate-y-0 !p-0 !gap-0 flex flex-col"
          style={{ borderColor: EXERCISE_TYPE_COLORS[getExerciseType(replacingExerciseName)]?.border || colors.border }}
          showCloseButton={false}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 pt-4 shrink-0">
            <DialogTitle className="text-white font-medium text-base">
              Заменить <span className="text-zinc-400">{replacingExerciseName}</span> на
            </DialogTitle>
            <button
              onClick={() => setIsReplaceExerciseOpen(false)}
              className="text-zinc-500 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex flex-col min-h-0 p-4 gap-4 flex-1">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск упражнения..."
                className="!bg-zinc-900/50 border border-zinc-700 rounded-lg text-white placeholder:text-zinc-500 pl-9"
                autoComplete="off"
                inputMode="search"
              />
            </div>

            {/* Type filter tags */}
            <div className="flex gap-1">
              {(['chest', 'back', 'legs', 'common'] as ExerciseType[]).map((type) => {
                const typeColors = EXERCISE_TYPE_COLORS[type];
                const typeMarker = EXERCISE_TYPE_MARKERS[type];
                const isSelected = exerciseTypeFilter === type;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setExerciseTypeFilter(isSelected ? null : type)}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-all border flex-1 justify-center"
                    style={isSelected ? {
                      backgroundColor: typeColors.bg,
                      color: typeColors.text,
                      borderColor: typeColors.border
                    } : {
                      backgroundColor: '#27272a',
                      color: '#a1a1aa',
                      borderColor: 'transparent'
                    }}
                  >
                    <span
                      className="w-3.5 h-3.5 rounded text-[9px] font-bold flex items-center justify-center"
                      style={{ backgroundColor: isSelected ? typeColors.bg : '#3f3f46', color: typeColors.text }}
                    >
                      {typeMarker}
                    </span>
                    <span className="truncate">{EXERCISE_TYPE_NAMES[type]}</span>
                  </button>
                );
              })}
            </div>

            {/* Available exercises list */}
            <div className="flex-1 min-h-0 overflow-y-auto space-y-1 border border-zinc-700 rounded-lg p-2 bg-zinc-900/50" style={{ touchAction: 'pan-y' }}>
              {displayedExercises.length > 0 ? (
                displayedExercises.map((exerciseName) => {
                  const exerciseType = getExerciseType(exerciseName);
                  const exerciseColors = EXERCISE_TYPE_COLORS[exerciseType];
                  const exerciseMarker = EXERCISE_TYPE_MARKERS[exerciseType];
                  const isSelected = selectedReplaceExercise === exerciseName;
                  const isCurrent = exerciseName === replacingExerciseName;
                  const isAlreadyAdded = addedExerciseNames.has(exerciseName) && !isCurrent;
                  return (
                    <button
                      key={exerciseName}
                      onClick={() => !isCurrent && !isAlreadyAdded && setSelectedReplaceExercise(isSelected ? null : exerciseName)}
                      disabled={isCurrent || isAlreadyAdded}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-2",
                        (isCurrent || isAlreadyAdded)
                          ? "opacity-40 cursor-not-allowed text-zinc-500"
                          : isSelected
                            ? "bg-zinc-600 text-white"
                            : "hover:bg-zinc-700/50 text-zinc-300 hover:text-white"
                      )}
                    >
                      <span
                        className="w-5 h-5 rounded text-[10px] font-bold flex items-center justify-center shrink-0"
                        style={{ backgroundColor: exerciseColors.bg, color: exerciseColors.text }}
                      >
                        {exerciseMarker}
                      </span>
                      <span className="flex-1">{exerciseName}</span>
                      {isCurrent && <span className="text-xs">текущее</span>}
                      {isAlreadyAdded && <span className="text-xs">✓</span>}
                    </button>
                  );
                })
              ) : (
                <p className="text-center text-zinc-500 py-4">Нет упражнений</p>
              )}
            </div>
          </div>

          {/* Replace button */}
          <div className="flex justify-end px-4 pb-4 shrink-0">
            <button
              onClick={() => selectedReplaceExercise && handleConfirmReplace(selectedReplaceExercise)}
              disabled={!selectedReplaceExercise}
              className="py-2 px-4 rounded-lg text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#19a655' }}
            >
              Заменить
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Notes dialog */}
      <Dialog open={isNotesOpen} onOpenChange={setIsNotesOpen}>
        <DialogContent 
          className="bg-zinc-800 border !p-0 !gap-0"
          style={{ borderColor: colors.border }}
          showCloseButton={false}
        >
          {/* Header row: title + close button */}
          <div className="flex items-center justify-between px-4 pt-4">
            <DialogTitle className="text-white font-medium text-base">Заметки к тренировке</DialogTitle>
            <button
              onClick={() => setIsNotesOpen(false)}
              className="text-zinc-500 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Textarea */}
          <textarea
            ref={notesTextareaRef}
            value={notesValue}
            onChange={handleNotesChange}
            placeholder="Добавьте заметки к этой тренировке..."
            className="w-[calc(100%-2rem)] bg-zinc-900/50 border border-zinc-700 rounded-lg p-2 mx-4 mt-4 text-white placeholder-zinc-500 resize-none focus:outline-none block"
            style={{ overflow: 'hidden', height: 'auto', minHeight: '60px' }}
          />

          {/* Buttons */}
          <div className="flex justify-end px-4 pt-4 pb-4">
            <button
              onClick={handleSaveNotes}
              disabled={!notesValue.trim()}
              className="py-2 px-4 rounded-lg text-primary-foreground text-sm font-medium min-w-[100px] disabled:opacity-50 disabled:pointer-events-none"
              style={{ backgroundColor: '#19a655' }}
            >
              Сохранить
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Replace confirmation dialog */}
      <ConfirmDialog
        open={showReplaceConfirm}
        onOpenChange={setShowReplaceConfirm}
        title="Заменить упражнение?"
        description={`Упражнение "${replacingExerciseName}" будет заменено на "${pendingReplaceName}". Все подходы будут удалены.`}
        confirmText="Заменить"
        onConfirm={confirmReplace}
        borderColor={colors.border}
      />

      {/* Delete workout confirmation */}
      <ConfirmDialog
        open={showDeleteWorkoutConfirm}
        onOpenChange={setShowDeleteWorkoutConfirm}
        title="Удалить тренировку?"
        description={
          <>
            Тренировка от <strong className="text-white">{format(parseISO(workout.date), 'd MMMM yyyy', { locale: ru })}</strong> будет удалена вместе со всеми упражнениями и подходами.<br />
            Это действие нельзя отменить.
          </>
        }
        confirmText="Удалить"
        onConfirm={handleDeleteWorkout}
        borderColor={colors.border}
      />
    </div>
  );
}
