'use client';

import { useState } from 'react';
import { Trash2, Plus, Trophy, Check, Clock, RefreshCw, User, Weight as WeightIcon, ChevronUp, ChevronDown, X, Zap, Repeat2 } from 'lucide-react';
import { Exercise, WorkoutSet, isAbsExercise, getExerciseType, EXERCISE_TYPE_COLORS, WORKOUT_TYPE_COLORS, WorkoutType, ExerciseType } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { getPersonalRecord, isNewPersonalRecord } from '@/lib/pr';
import { useFitnessStore } from '@/lib/store';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { getPreviousSetData } from '@/lib/storage';

interface ExerciseCardProps {
  exercise: Exercise;
  workoutId: string;
  index: number;
  totalExercises: number;
  workoutType?: WorkoutType; // тип тренировки для определения цвета упражнения
  onReplace?: (exerciseId: string, exerciseName: string) => void;
  onMoveUp?: (exerciseId: string) => void;
  onMoveDown?: (exerciseId: string) => void;
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
  onMoveDown 
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

  const { addSet, removeSet, updateSet, removeExercise, currentWorkout } = useFitnessStore();
  const pr = getPersonalRecord(exercise.name);
  
  const isAbs = isAbsExercise(exercise.name);
  
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
  
  const workoutTypeForColor = exerciseTypeToWorkoutType[exerciseType];
  const exerciseColors = WORKOUT_TYPE_COLORS[workoutTypeForColor];
  
  // Вычисляем номер следующего подхода и получаем предыдущие значения
  const nextWorkingSetNumber = exercise.sets.filter(s => !s.isWarmup).length + 1;
  const nextWarmupSetNumber = exercise.sets.filter(s => s.isWarmup).length + 1;
  
  // Получаем предыдущие значения для следующего подхода
  const prevWorkingSetData = getPreviousSetData(exercise.name, nextWorkingSetNumber, false);
  const prevWarmupSetData = getPreviousSetData(exercise.name, nextWarmupSetNumber, true);
  
  // При активации повторений - время отключается автоматически
  const handleRepsToggle = (checked: boolean) => {
    setUseReps(checked);
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

  const isCurrentPR = (weight: number) => {
    return pr && weight > 0 && weight >= pr.maxWeight;
  };

  const isNewPR = (weight: number) => {
    return weight > 0 && isNewPersonalRecord(exercise.name, weight);
  };

  // Render set display
  const renderSetDisplay = (set: WorkoutSet) => {
    const isBodyweight = set.weight === 0;
    const hasTime = set.time && set.time > 0;
    
    return (
      <div className="flex items-center gap-2 flex-wrap">
        {isBodyweight && (
          <User className="w-4 h-4 text-emerald-400" />
        )}
        
        {!isBodyweight && set.weight > 0 && (
          <span className={cn(
            'font-medium',
            isCurrentPR(set.weight) ? 'text-amber-400' : 'text-white'
          )}>
            {set.weight} кг
          </span>
        )}
        
        {set.reps > 0 && (
          <>
            {!isBodyweight && set.weight > 0 && (
              <span className="text-zinc-500">×</span>
            )}
            <span className="text-emerald-400 font-medium">{set.reps}</span>
            <span className="text-zinc-500 text-xs">повт.</span>
          </>
        )}
        
        {hasTime && (
          <>
            <span className="text-zinc-600">|</span>
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-blue-400 font-medium">{formatTime(set.time!)}</span>
          </>
        )}
      </div>
    );
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="rounded-xl border overflow-hidden bg-zinc-800/50 border-zinc-700"
      >
        <div className="flex">
          {/* Цветная полоса слева */}
          <div className={cn(
            "w-3 shrink-0 self-stretch",
            exerciseColors.bg.replace('/20', '/60')
          )} />
          
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-zinc-700">
              <div className="flex items-center gap-3">
                {/* Move buttons */}
                {currentWorkout && (
                  <div className="flex flex-col gap-0.5">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onMoveUp?.(exercise.id)}
                      disabled={index === 0}
                      className="h-6 w-6 text-zinc-500 hover:text-white hover:bg-zinc-700 disabled:opacity-30"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onMoveDown?.(exercise.id)}
                      disabled={index === totalExercises - 1}
                      className="h-6 w-6 text-zinc-500 hover:text-white hover:bg-zinc-700 disabled:opacity-30"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                  </div>
                )}
                
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-white">{exercise.name}</h3>
                    {isAbs && (
                      <span className="hidden text-[10px] px-1.5 py-0.5 bg-blue-500/20 text-blue-400 rounded">пресс</span>
                    )}
                  </div>
                  {pr && (
                    <div className="flex items-center gap-1 text-amber-400 text-xs mt-0.5">
                      <Trophy className="w-3 h-3" />
                      <span>{pr.reps} × {pr.maxWeight} кг</span>
                    </div>
                  )}
                </div>
              </div>
              
              {currentWorkout && (
                <div className="flex items-center gap-1">
                  {onReplace && !exercise.isCustom && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onReplace(exercise.id, exercise.name)}
                      className="text-zinc-500 hover:text-blue-400 hover:bg-blue-500/10 h-8 w-8"
                      title="Заменить упражнение"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                  )}
                  
                  <div className="w-1" />
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowDeleteExerciseConfirm(true)}
                    className="text-zinc-500 hover:text-red-400 hover:bg-red-500/10 h-8 w-8"
                    title="Удалить упражнение"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>

            {/* Sets */}
            <div className="p-4">
              {exercise.sets.map((set, setIndex) => {
                // Вычисляем номер рабочего подхода (не учитывая разминочные)
                let workingSetNumber = 0;
                for (let i = 0; i <= setIndex; i++) {
                  if (!exercise.sets[i].isWarmup) workingSetNumber++;
                }
                
                return (
                <div
                  key={set.id}
                  className={cn(
                    'flex items-center gap-3 py-2 border-b border-zinc-700/50 last:border-0',
                    editingSetId === set.id ? 'bg-zinc-700/30 -mx-2 px-2 rounded-lg' : ''
                  )}
                >
                  <div className={cn(
                    'w-7 h-7 rounded-lg flex items-center justify-center text-xs font-medium shrink-0',
                    set.isWarmup
                      ? 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                      : 'bg-zinc-700 text-zinc-300'
                  )}>
                    {set.isWarmup ? 'Р' : workingSetNumber}
                  </div>
                  
                  {editingSetId === set.id ? (
                    <>
                      <div className="flex items-center gap-2 flex-wrap flex-1">
                        {/* Вес - показываем только если он был введен (не 0 и не собственный вес) */}
                        {set.weight > 0 && (
                          <Input
                            type="number"
                            step="0.5"
                            min="0.1"
                            value={editWeight}
                            onChange={(e) => setEditWeight(e.target.value)}
                            placeholder="Вес, кг"
                            className="w-20 h-7 bg-zinc-700 border-zinc-600 text-white text-xs"
                          />
                        )}
                        
                        {/* Повторения - показываем только если были */}
                        {set.reps > 0 && (
                          <Input
                            type="number"
                            min="1"
                            value={editReps}
                            onChange={(e) => setEditReps(e.target.value)}
                            placeholder="Повторения"
                            className="w-24 h-7 bg-zinc-700 border-zinc-600 text-white text-xs"
                          />
                        )}
                        
                        {/* Время - показываем только если было */}
                        {set.time && set.time > 0 && (
                          <div className="flex items-center gap-0.5">
                            <Input
                              type="number"
                              min="0"
                              value={editTimeMinutes}
                              onChange={(e) => setEditTimeMinutes(e.target.value)}
                              placeholder="Мин"
                              className="w-14 h-7 bg-zinc-700 border-zinc-600 text-white text-xs text-center"
                            />
                            <span className="text-zinc-500 text-xs">:</span>
                            <Input
                              type="number"
                              min="0"
                              max={59}
                              value={editTimeSeconds}
                              onChange={(e) => setEditTimeSeconds(e.target.value)}
                              placeholder="Сек"
                              className="w-14 h-7 bg-zinc-700 border-zinc-600 text-white text-xs text-center"
                            />
                          </div>
                        )}
                        
                        <Button
                          size="sm"
                          onClick={() => handleUpdateSet(set.id, set)}
                          className="bg-emerald-600 hover:bg-emerald-500 h-7 w-7 p-0"
                        >
                          <Check className="w-3 h-3" />
                        </Button>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditingSetId(null)}
                        className="text-zinc-500 hover:text-red-400 hover:bg-red-500/10 h-7 w-7 shrink-0 self-end"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <div
                        onClick={() => startEditingSet(set)}
                        className="flex-1 cursor-pointer hover:bg-zinc-700/30 py-1 px-2 -ml-2 rounded-lg transition-colors"
                      >
                        {renderSetDisplay(set)}
                        {isCurrentPR(set.weight) && (
                          <Trophy className="inline w-3 h-3 text-amber-400 ml-1" />
                        )}
                        {isNewPR(set.weight) && !isCurrentPR(set.weight) && (
                          <span className="text-[10px] text-emerald-400 font-medium ml-1">NEW!</span>
                        )}
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveSet(set.id)}
                        className="text-zinc-500 hover:text-red-400 hover:bg-red-500/10 h-7 w-7 shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </>
                  )}
                </div>
              );})}

              {/* Add set form */}
              {isAddingSet ? (
                <div className="space-y-2 mt-4 pt-4 border-t border-zinc-700">
                  {/* Toggle buttons */}
                  <div className="flex gap-2 flex-wrap items-center">
                    {/* Чекбокс разминки */}
                    <label className={cn(
                      'flex items-center gap-1 px-2 py-1 rounded cursor-pointer transition-colors',
                      isWarmup ? 'bg-amber-600/20 border border-amber-500/50' : 'bg-zinc-700/50 border border-zinc-600'
                    )}>
                      <input
                        type="checkbox"
                        checked={isWarmup}
                        onChange={(e) => setIsWarmup(e.target.checked)}
                        className="w-3.5 h-3.5 rounded border-zinc-600 bg-zinc-700 text-amber-600"
                        />
                        <Zap className="w-3 h-3 text-amber-400" />
                        <span className="text-[10px] text-zinc-300">Разминка</span>
                      </label>
                    
                    <label className={cn(
                      'flex items-center gap-1 px-2 py-1 rounded cursor-pointer transition-colors',
                      useBodyweight ? 'bg-emerald-600/20 border border-emerald-500/50' : 'bg-zinc-700/50 border border-zinc-600'
                    )}>
                      <input
                        type="checkbox"
                        checked={useBodyweight}
                        onChange={(e) => setUseBodyweight(e.target.checked)}
                        className="w-3.5 h-3.5 rounded border-zinc-600 bg-zinc-700 text-emerald-600"
                      />
                      <User className="w-3 h-3 text-emerald-400" />
                      <span className="text-[10px] text-zinc-300">Собственный вес</span>
                    </label>
                    
                    <label className={cn(
                      'flex items-center gap-1 px-2 py-1 rounded cursor-pointer transition-colors',
                      useReps ? 'bg-red-600/20 border border-red-500/50' : 'bg-zinc-700/50 border border-zinc-600'
                    )}>
                      <input
                        type="checkbox"
                        checked={useReps}
                        onChange={(e) => setUseReps(e.target.checked)}
                        className="w-3.5 h-3.5 rounded border-zinc-600 bg-zinc-700 text-red-600"
                      />
                      <Repeat2 className="w-3 h-3 text-red-400" />
                      <span className="text-[10px] text-zinc-300">Повторения</span>
                    </label>
                    
                    <label className={cn(
                      'flex items-center gap-1 px-2 py-1 rounded cursor-pointer transition-colors',
                      useTime ? 'bg-purple-600/20 border border-purple-500/50' : 'bg-zinc-700/50 border border-zinc-600'
                    )}>
                      <input
                        type="checkbox"
                        checked={useTime}
                        onChange={(e) => setUseTime(e.target.checked)}
                        className="w-3.5 h-3.5 rounded border-zinc-600 bg-zinc-700 text-purple-600"
                      />
                      <Clock className="w-3 h-3 text-purple-400" />
                      <span className="text-[10px] text-zinc-300">Время</span>
                    </label>
                  </div>

                  {/* Input fields */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className={cn(
                      'w-7 h-7 rounded-lg flex items-center justify-center text-xs font-medium shrink-0',
                      isWarmup
                        ? 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                        : 'bg-zinc-700 text-zinc-300'
                    )}>
                      {isWarmup ? 'Р' : exercise.sets.filter(s => !s.isWarmup).length + 1}
                    </div>

                    {!useBodyweight && (
                      <div className="flex items-center gap-1">
                        <WeightIcon className="w-3 h-3 text-zinc-500" />
                        <Input
                          type="number"
                          step="0.5"
                          min={"0.1"}
                          value={newWeight}
                          onChange={(e) => setNewWeight(e.target.value)}
                          placeholder="Вес, кг"
                          className="w-20 h-8 bg-zinc-700 border-zinc-600 text-white text-xs"
                        />
                      </div>
                    )}

                    {useReps && (
                      <Input
                        type="number"
                        min={"1"}
                        value={newReps}
                        onChange={(e) => setNewReps(e.target.value)}
                        placeholder="Повторения"
                        className="w-24 h-8 bg-zinc-700 border-zinc-600 text-white text-xs"
                      />
                    )}

                    {useTime && (
                      <div className="flex items-center gap-0.5">
                        <Clock className="w-3 h-3 text-purple-400" />
                        <Input
                          type="number"
                          min={"0"}
                          value={newTimeMinutes}
                          onChange={(e) => setNewTimeMinutes(e.target.value)}
                          placeholder="Мин"
                          className="w-14 h-8 bg-zinc-700 border-zinc-600 text-white text-xs text-center"
                        />
                        <span className="text-zinc-500 text-xs">:</span>
                        <Input
                          type="number"
                          min={"0"}
                          max={59}
                          value={newTimeSeconds}
                          onChange={(e) => setNewTimeSeconds(e.target.value)}
                          placeholder="Сек"
                          className="w-14 h-8 bg-zinc-700 border-zinc-600 text-white text-xs text-center"
                        />
                      </div>
                    )}
                  </div>
                  
                  {/* Previous values hint */}
                  {(() => {
                    const prevData = isWarmup ? prevWarmupSetData : prevWorkingSetData;
                    if (!prevData) return null;
                    
                    return (
                      <div className="flex items-center gap-2 text-[10px] text-zinc-500 mt-1 ml-9">
                        <span>Прошлый раз:</span>
                        {prevData.isBodyweight ? (
                          <span className="text-emerald-400">собственный вес</span>
                        ) : prevData.weight > 0 ? (
                          <span>{prevData.weight} кг</span>
                        ) : null}
                        {prevData.reps > 0 && (
                          <span>× {prevData.reps} повт.</span>
                        )}
                        {prevData.time > 0 && (
                          <span className="text-purple-400">{formatTime(prevData.time)}</span>
                        )}
                      </div>
                    );
                  })()}

                  {/* Buttons in bottom-right corner */}
                  <div className="flex justify-end items-center gap-2 mt-3">
                    <Button
                      variant="ghost"
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
                      className="h-9 text-zinc-400 text-xs"
                    >
                      Отмена
                    </Button>
                    <Button
                      onClick={handleAddSet}
                      disabled={
                        (useReps && !newReps) || 
                        (!useBodyweight && useReps && !newWeight) ||
                        (!useReps && !newTimeMinutes && !newTimeSeconds)
                      }
                      className="bg-emerald-600 hover:bg-emerald-500 h-9 px-4 text-white font-medium"
                    >
                      Добавить
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  onClick={() => setIsAddingSet(true)}
                  className="w-full mt-3 bg-zinc-700/30 text-zinc-400 hover:text-white hover:bg-zinc-700/50"
                >
                  Добавить подход
                </Button>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Delete exercise confirmation */}
      <ConfirmDialog
        open={showDeleteExerciseConfirm}
        onOpenChange={setShowDeleteExerciseConfirm}
        title="Удалить упражнение?"
        description={`Упражнение "${exercise.name}" и все его подходы будут удалены. Это действие нельзя отменить.`}
        confirmText="Удалить"
        onConfirm={handleDeleteExercise}
        variant="danger"
      />

      {/* Delete set confirmation */}
      <ConfirmDialog
        open={showDeleteSetConfirm}
        onOpenChange={(open) => {
          setShowDeleteSetConfirm(open);
          if (!open) setSetToDelete(null);
        }}
        title="Удалить подход?"
        description="Этот подход будет удалён. Это действие нельзя отменить."
        confirmText="Удалить"
        onConfirm={confirmDeleteSet}
        variant="danger"
      />
    </>
  );
}
