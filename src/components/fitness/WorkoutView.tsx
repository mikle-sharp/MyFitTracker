'use client';

import { useState, useMemo, useRef, useCallback, useEffect, useReducer } from 'react';
import { Trash2, Calendar, Clock, Search, RefreshCw, Pencil } from 'lucide-react';
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
import { getAllExercisesForType } from '@/lib/storage';

interface WorkoutViewProps {
  workout: Workout;
}

export function WorkoutView({ workout }: WorkoutViewProps) {
  const [isAddExerciseOpen, setIsAddExerciseOpen] = useState(false);
  const [isReplaceExerciseOpen, setIsReplaceExerciseOpen] = useState(false);
  const [replacingExerciseId, setReplacingExerciseId] = useState<string | null>(null);
  const [replacingExerciseName, setReplacingExerciseName] = useState('');
  const [newExerciseName, setNewExerciseName] = useState('');
  const [newExerciseType, setNewExerciseType] = useState<ExerciseType>('chest');
  const [searchQuery, setSearchQuery] = useState('');
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
  const [, forceUpdate] = useReducer(x => x + 1, 0);
  const dragStateRef = useRef<typeof dragState>(null);
  const exerciseRefsRef = useRef<Map<string, HTMLDivElement>>(new Map());
  const containerRefRef = useRef<HTMLDivElement>(null);
  const autoScrollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Keep ref in sync with state
  dragStateRef.current = dragState;

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
  
  const { addExercise, removeExercise, deleteWorkout, moveExerciseUp, moveExerciseDown, updateWorkoutNotes } = useFitnessStore();

  const colors = WORKOUT_TYPE_COLORS[workout.type];

  // Получаем все упражнения для данного типа (стандартные + пользовательские)
  const availableExercises = useMemo(() => {
    return getAllExercisesForType(workout.type);
  }, [workout.type]);

  // Фильтруем упражнения по поиску
  const filteredExercises = useMemo(() => {
    if (!searchQuery) return availableExercises;
    return availableExercises.filter(ex => 
      ex.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [availableExercises, searchQuery]);

  // Упражнения, которые еще не добавлены
  const notAddedExercises = useMemo(() => {
    const addedNames = new Set(workout.exercises.map(e => e.name));
    return filteredExercises.filter(ex => !addedNames.has(ex));
  }, [filteredExercises, workout.exercises]);

  const handleAddExercise = (name?: string, exerciseType?: ExerciseType) => {
    const exerciseName = name || newExerciseName.trim();
    const type = exerciseType || newExerciseType;
    if (exerciseName) {
      addExercise(workout.id, exerciseName, type);
      setNewExerciseName('');
      setNewExerciseType('chest');
      setSearchQuery('');
      setIsAddExerciseOpen(false);
    }
  };

  const handleAddCustomExercise = () => {
    if (newExerciseName.trim()) {
      handleAddExercise(newExerciseName.trim(), newExerciseType);
    }
  };

  const handleReplaceExercise = (exerciseId: string, exerciseName: string) => {
    setReplacingExerciseId(exerciseId);
    setReplacingExerciseName(exerciseName);
    setSearchQuery('');
    setNewExerciseName('');
    setIsReplaceExerciseOpen(true);
  };

  const handleConfirmReplace = (newName: string) => {
    setPendingReplaceName(newName);
    setShowReplaceConfirm(true);
  };

  const confirmReplace = () => {
    if (replacingExerciseId && pendingReplaceName) {
      // Удаляем старое упражнение
      removeExercise(workout.id, replacingExerciseId);
      // Добавляем новое
      addExercise(workout.id, pendingReplaceName);
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
    if (currentDragState && currentDragState.currentIndex !== currentDragState.draggedIndex) {
      // Move exercise to new position
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
    
    setDragState(null);
  }, [workout.id, moveExerciseUp, moveExerciseDown]);

  const totalVolume = workout.exercises.reduce((sum, ex) => {
    return sum + ex.sets.reduce((s, set) => s + set.reps * set.weight, 0);
  }, 0);

  return (
    <div className="space-y-4">
      {/* Workout header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 rounded-xl border"
        style={{
          backgroundColor: colors.bg,
          borderColor: colors.border
        }}
      >
        <div className="flex flex-col">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{WORKOUT_TYPE_ICONS[workout.type]}</span>
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
                className="h-9 w-9 rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-zinc-700/50"
                title="Добавить заметку"
              >
                <Pencil className="w-4 h-4" style={workout.notes ? { color: colors.text } : undefined} />
              </Button>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowDeleteWorkoutConfirm(true)}
              className="text-zinc-500 hover:text-red-400 hover:bg-red-500/10"
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
        <div className="flex gap-6 mt-4 justify-end">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{workout.exercises.length}</div>
            <div className="text-xs text-zinc-500">Упражнений</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{Math.round(totalVolume)}</div>
            <div className="text-xs text-zinc-500">Объем (кг)</div>
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
            <div
              key={exercise.id}
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
              />
            </div>
          );
        })}
      </AnimatePresence>

      {/* Add exercise button */}
      <Dialog open={isAddExerciseOpen} onOpenChange={(open) => {
        setIsAddExerciseOpen(open);
        if (!open) {
          setSearchQuery('');
          setNewExerciseName('');
        }
      }}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="w-full border-dashed border-zinc-600 text-zinc-400 hover:text-white py-6 justify-center"
            style={{ '--hover-border': '#037b34', '--hover-bg': '#072f18' } as React.CSSProperties}
          >
            Добавить упражнение
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-zinc-900 border-zinc-700 max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="text-white">Добавить упражнение</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск упражнения..."
                className="bg-zinc-800 border-zinc-700 text-white pl-9"
              />
            </div>

            {/* Available exercises */}
            {notAddedExercises.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-zinc-500 uppercase tracking-wide">
                  Доступные упражнения
                </p>
                <div className="max-h-[200px] overflow-y-auto space-y-1">
                  {notAddedExercises.map((exerciseName) => {
                    const exerciseType = getExerciseType(exerciseName);
                    const exerciseColors = EXERCISE_TYPE_COLORS[exerciseType];
                    const exerciseMarker = EXERCISE_TYPE_MARKERS[exerciseType];
                    return (
                      <button
                        key={exerciseName}
                        onClick={() => handleAddExercise(exerciseName)}
                        className="w-full text-left px-3 py-2 rounded-lg transition-colors hover:bg-zinc-800 text-zinc-300 hover:text-white flex items-center gap-2"
                      >
                        <span
                          className="w-5 h-5 rounded text-[10px] font-bold flex items-center justify-center shrink-0"
                          style={{ backgroundColor: exerciseColors.bg, color: exerciseColors.text }}
                        >
                          {exerciseMarker}
                        </span>
                        <span className="flex-1">{exerciseName}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Custom exercise input */}
            <div className="border-t border-zinc-700 pt-4">
              <p className="text-xs text-zinc-500 uppercase tracking-wide mb-2">
                Свое упражнение
              </p>
              <div className="space-y-3">
                <Input
                  value={newExerciseName}
                  onChange={(e) => setNewExerciseName(e.target.value)}
                  placeholder="Название упражнения"
                  className="bg-zinc-800 border-zinc-700 text-white"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleAddCustomExercise();
                    }
                  }}
                />
                
                {/* Тип упражнения */}
                <div className="flex flex-wrap gap-2">
                  {(['chest', 'back', 'legs', 'common'] as ExerciseType[]).map((type) => {
                    const typeColors = EXERCISE_TYPE_COLORS[type];
                    const typeMarker = EXERCISE_TYPE_MARKERS[type];
                    const isSelected = newExerciseType === type;
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setNewExerciseType(type)}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all border-2"
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
                          className="w-4 h-4 rounded text-[10px] font-bold flex items-center justify-center"
                          style={{ backgroundColor: isSelected ? typeColors.bg : '#3f3f46', color: typeColors.text }}
                        >
                          {typeMarker}
                        </span>
                        {EXERCISE_TYPE_NAMES[type]}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={handleAddCustomExercise}
                  disabled={!newExerciseName.trim()}
                  className="w-full h-9 px-4 rounded-md text-sm font-medium text-white transition-colors disabled:opacity-50 disabled:pointer-events-none justify-center"
                  style={{ backgroundColor: '#037b34' }}
                >
                  Добавить
                </button>
              </div>
            </div>
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
        }
      }}>
        <DialogContent className="bg-zinc-900 border-zinc-700 max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="text-white">Заменить упражнение</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <p className="text-sm text-zinc-400">
              Заменить <strong className="text-white">{replacingExerciseName}</strong> на:
            </p>
            
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск упражнения..."
                className="bg-zinc-800 border-zinc-700 text-white pl-9"
              />
            </div>

            {/* Available exercises */}
            {filteredExercises.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-zinc-500 uppercase tracking-wide">
                  Выберите упражнение
                </p>
                <div className="max-h-[250px] overflow-y-auto space-y-1">
                  {filteredExercises.map((exerciseName) => {
                    const isCurrent = exerciseName === replacingExerciseName;
                    return (
                      <button
                        key={exerciseName}
                        onClick={() => handleConfirmReplace(exerciseName)}
                        disabled={isCurrent}
                        className={cn(
                          'w-full text-left px-3 py-2 rounded-lg transition-colors',
                          'hover:bg-zinc-800 text-zinc-300 hover:text-white',
                          'flex items-center justify-between',
                          isCurrent && 'opacity-50 cursor-not-allowed'
                        )}
                      >
                        <span>{exerciseName}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Custom exercise input */}
            <div className="border-t border-zinc-700 pt-4">
              <p className="text-xs text-zinc-500 uppercase tracking-wide mb-2">
                Или введите своё
              </p>
              <div className="flex gap-2">
                <Input
                  value={newExerciseName}
                  onChange={(e) => setNewExerciseName(e.target.value)}
                  placeholder="Название упражнения"
                  className="bg-zinc-800 border-zinc-700 text-white flex-1"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newExerciseName.trim()) {
                      handleConfirmReplace(newExerciseName.trim());
                    }
                  }}
                />
                <Button
                  onClick={() => handleConfirmReplace(newExerciseName.trim())}
                  disabled={!newExerciseName.trim()}
                  style={{ backgroundColor: '#1d4fa0' }}
                >
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Заменить
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Notes dialog */}
      <Dialog open={isNotesOpen} onOpenChange={setIsNotesOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-700">
          <DialogHeader>
            <DialogTitle className="text-white">Заметки к тренировке</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <textarea
              value={notesValue}
              onChange={(e) => setNotesValue(e.target.value)}
              placeholder="Добавьте заметки к этой тренировке..."
              className="w-full h-32 bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white placeholder-zinc-500 resize-none focus:outline-none"
              style={{ '--tw-ring-color': '#037b34' } as React.CSSProperties}
              onFocus={(e) => e.target.style.borderColor = '#037b34'}
              onBlur={(e) => e.target.style.borderColor = '#3f3f46'}
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                onClick={() => setIsNotesOpen(false)}
                className="text-zinc-400"
              >
                Отмена
              </Button>
              <Button
                onClick={handleSaveNotes}
                style={{ backgroundColor: '#037b34' }}
              >
                Сохранить
              </Button>
            </div>
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
        variant="warning"
      />

      {/* Delete workout confirmation */}
      <ConfirmDialog
        open={showDeleteWorkoutConfirm}
        onOpenChange={setShowDeleteWorkoutConfirm}
        title="Удалить тренировку?"
        description={`Тренировка от ${format(parseISO(workout.date), 'd MMMM yyyy', { locale: ru })} будет удалена вместе со всеми упражнениями и подходами. Это действие нельзя отменить.`}
        confirmText="Удалить"
        onConfirm={handleDeleteWorkout}
        variant="danger"
      />
    </div>
  );
}
