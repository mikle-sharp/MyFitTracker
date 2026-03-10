'use client';

import { useState, useMemo } from 'react';
import { Trash2, Calendar, Clock, Search, RefreshCw, Pencil } from 'lucide-react';
import { Workout, WorkoutType, WORKOUT_TYPE_COLORS, WORKOUT_TYPE_NAMES, WORKOUT_TYPE_ICONS, isAbsExercise, getExerciseType, EXERCISE_TYPE_COLORS, EXERCISE_TYPE_MARKERS, EXERCISE_TYPE_NAMES, ExerciseType } from '@/lib/types';
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

  const totalVolume = workout.exercises.reduce((sum, ex) => {
    return sum + ex.sets.reduce((s, set) => s + set.reps * set.weight, 0);
  }, 0);

  return (
    <div className="space-y-4">
      {/* Workout header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          'p-4 rounded-xl border',
          colors.bg,
          colors.border
        )}
      >
        <div className="flex flex-col">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{WORKOUT_TYPE_ICONS[workout.type]}</span>
              <h2 className={cn('text-xl font-bold', colors.text)}>
                {WORKOUT_TYPE_NAMES[workout.type]}
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setNotesValue(workout.notes || '');
                  setIsNotesOpen(true);
                }}
                className={cn(
                  'h-7 w-7 rounded-md',
                  'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-700/50'
                )}
                title="Добавить заметку"
              >
                <Pencil className={cn('w-4 h-4', workout.notes && 'text-emerald-400')} />
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
          <div className="flex items-center gap-3 text-sm text-zinc-400 mt-1 ml-10">
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>{format(parseISO(workout.date), 'd MMMM yyyy', { locale: ru })}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{format(parseISO(workout.updatedAt), 'HH:mm')}</span>
            </div>
          </div>
        </div>

        {/* Notes display */}
        {workout.notes && (
          <div className="mt-3 p-2 bg-zinc-800/50 rounded-lg text-sm text-zinc-300 border border-zinc-700/50">
            {workout.notes}
          </div>
        )}

        {/* Stats */}
        <div className="flex gap-6 mt-4 pt-4 border-t border-zinc-700/50 justify-end">
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
        {workout.exercises.map((exercise, index) => (
          <ExerciseCard
            key={exercise.id}
            exercise={exercise}
            workoutId={workout.id}
            workoutType={workout.type}
            index={index}
            totalExercises={workout.exercises.length}
            onReplace={handleReplaceExercise}
            onMoveUp={handleMoveUp}
            onMoveDown={handleMoveDown}
          />
        ))}
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
            className="w-full border-dashed border-zinc-600 text-zinc-400 hover:text-white hover:border-emerald-500 hover:bg-emerald-500/10 py-6 justify-center"
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
                        className={cn(
                          'w-full text-left px-3 py-2 rounded-lg transition-colors',
                          'hover:bg-zinc-800 text-zinc-300 hover:text-white',
                          'flex items-center gap-2'
                        )}
                      >
                        <span className={cn(
                          "w-5 h-5 rounded text-[10px] font-bold flex items-center justify-center shrink-0",
                          exerciseColors.bg,
                          exerciseColors.text
                        )}>
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
                        className={cn(
                          "flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all",
                          isSelected 
                            ? [typeColors.bg, typeColors.text, "border-2", typeColors.border.replace('/50', '')]
                            : "bg-zinc-800 text-zinc-400 border-2 border-transparent hover:bg-zinc-700"
                        )}
                      >
                        <span className={cn(
                          "w-4 h-4 rounded text-[10px] font-bold flex items-center justify-center",
                          isSelected ? typeColors.bg : "bg-zinc-700",
                          typeColors.text
                        )}>
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
                  className="w-full h-9 px-4 rounded-md text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-500 transition-colors disabled:opacity-50 disabled:pointer-events-none justify-center"
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
                    const isAbs = isAbsExercise(exerciseName);
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
                        {isAbs && (
                          <Clock className="w-4 h-4 text-blue-400" />
                        )}
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
                  className="bg-blue-600 hover:bg-blue-500"
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
              className="w-full h-32 bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white placeholder-zinc-500 resize-none focus:outline-none focus:border-emerald-500"
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
                className="bg-emerald-600 hover:bg-emerald-500"
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
