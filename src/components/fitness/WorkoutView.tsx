'use client';

import { useState, useMemo, useRef, useCallback, useEffect, useReducer } from 'react';
import { Trash2Icon, CalendarIcon, ClockIcon, SearchIcon, RefreshCwIcon, PencilIcon, XIcon, CopyIcon, BookmarkIcon, DumbbellIcon, TargetIcon, LegsIcon, HeartIcon, TypeIcon, ListIcon } from '@/components/icons/Icons';
import { Workout, WorkoutType, WORKOUT_TYPE_COLORS, WORKOUT_TYPE_NAMES, WORKOUT_TYPE_ICONS, EXERCISE_TYPE_COLORS, EXERCISE_TYPE_MARKERS, EXERCISE_TYPE_NAMES, ExerciseType, WorkoutTemplate } from '@/lib/types';
import { ExerciseCard } from './ExerciseCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import { useFitnessStore } from '@/lib/store';
import { getAllExercisesForType, getAllExercises, getExerciseTypeFromBase } from '@/lib/storage';

// Компонент иконки типа тренировки
function WorkoutTypeIcon({ type, color, isDefaultStyle }: { type: WorkoutType; color: string; isDefaultStyle: boolean }) {
  // Используем color вместо stroke, т.к. иконки используют stroke="currentColor"
  const iconStyle = { color: color };

  if (isDefaultStyle) {
    switch (type) {
      case 'chest': return <DumbbellIcon className="w-6 h-6" style={iconStyle} />;
      case 'back': return <TargetIcon className="w-6 h-6" style={iconStyle} />;
      case 'legs': return <LegsIcon className="w-6 h-6" style={iconStyle} />;
      case 'fullbody': return <HeartIcon className="w-6 h-6" style={iconStyle} />;
    }
  }
  // Fallback для Retro стиля - пиксельные иконки
  switch (type) {
    case 'chest': return <DumbbellIcon className="w-6 h-6" style={iconStyle} />;
    case 'back': return <TargetIcon className="w-6 h-6" style={iconStyle} />;
    case 'legs': return <LegsIcon className="w-6 h-6" style={iconStyle} />;
    case 'fullbody': return <HeartIcon className="w-6 h-6" style={iconStyle} />;
  }
}

// Порядок сортировки по типу упражнения
const EXERCISE_TYPE_ORDER: Record<ExerciseType, number> = {
  chest: 1,
  back: 2,
  legs: 3,
  common: 4,
};

// Функция сортировки названий упражнений: сначала по тегу, потом по алфавиту
const sortExerciseNamesByTagAndName = (names: string[]): string[] => {
  return [...names].sort((a, b) => {
    const typeA = getExerciseTypeFromBase(a);
    const typeB = getExerciseTypeFromBase(b);
    
    // Сначала сортируем по типу
    const orderA = EXERCISE_TYPE_ORDER[typeA] || 4;
    const orderB = EXERCISE_TYPE_ORDER[typeB] || 4;
    
    if (orderA !== orderB) {
      return orderA - orderB;
    }
    
    // Если тип одинаковый - сортируем по алфавиту
    return a.localeCompare(b, 'ru');
  });
};

interface WorkoutViewProps {
  workout: Workout;
  highlightExercise?: { name: string; setId: string } | null;
}

export function WorkoutView({ workout, highlightExercise }: WorkoutViewProps) {
  const [isAddExerciseOpen, setIsAddExerciseOpen] = useState(false);
  const [isDefaultStyle, setIsDefaultStyle] = useState(true);
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
  const [weightValue, setWeightValue] = useState(workout.weight?.toString() || '');
  
  // Template modal state
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [selectedTemplates, setSelectedTemplates] = useState<WorkoutTemplate[]>([]);
  const [templateName, setTemplateName] = useState('');
  const [templateSearchQuery, setTemplateSearchQuery] = useState('');
  const [showNoExercisesError, setShowNoExercisesError] = useState(false);
  const [showNoTemplatesError, setShowNoTemplatesError] = useState(false);
  const [showDeleteTemplateConfirm, setShowDeleteTemplateConfirm] = useState(false);
  const [exerciseListVersion, setExerciseListVersion] = useState(0);

  // Delete exercises dialog state
  const [isDeleteExerciseOpen, setIsDeleteExerciseOpen] = useState(false);
  const [deleteSearchQuery, setDeleteSearchQuery] = useState('');
  const [deleteTypeFilter, setDeleteTypeFilter] = useState<ExerciseType | null>(null);
  const [selectedDeleteExercises, setSelectedDeleteExercises] = useState<string[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
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

  // Проверяем стиль при монтировании
  useEffect(() => {
    const savedFont = localStorage.getItem('app-font');
    setIsDefaultStyle(!savedFont || savedFont === 'inter');
  }, []);

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
  
  const { addExercise, removeExercise, replaceExercise, deleteWorkout, moveExerciseUp, moveExerciseDown, updateWorkoutNotes, updateWorkoutWeight, getTemplates, saveTemplate, loadTemplate, deleteTemplate, deleteExerciseFromPresets } = useFitnessStore();

  const colors = WORKOUT_TYPE_COLORS[workout.type];
  
  // Шаблоны для текущего типа тренировки
  const templates = getTemplates(workout.type);

  // Отфильтрованные шаблоны по поиску
  const filteredTemplates = useMemo(() => {
    if (!templateSearchQuery) return templates;
    const query = templateSearchQuery.toLowerCase();
    return templates.filter(t => t.name.toLowerCase().includes(query));
  }, [templates, templateSearchQuery]);

  // Получаем ВСЕ упражнения из базы (стандартные + пользовательские всех типов)
  const allExercisesList = useMemo(() => {
    return getAllExercises();
  }, [exerciseListVersion]);

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
      result = result.filter(ex => getExerciseTypeFromBase(ex) === exerciseTypeFilter);
    }

    // Сортируем по тегу, потом по алфавиту
    return sortExerciseNamesByTagAndName(result);
  }, [allExercisesList, searchQuery, exerciseTypeFilter]);

  // Упражнения для отображения в диалоге удаления
  const deleteDialogExercises = useMemo(() => {
    let result = allExercisesList;

    if (deleteSearchQuery) {
      result = result.filter(ex =>
        ex.toLowerCase().includes(deleteSearchQuery.toLowerCase())
      );
    }

    if (deleteTypeFilter) {
      result = result.filter(ex => getExerciseTypeFromBase(ex) === deleteTypeFilter);
    }

    // Сортируем по тегу, потом по алфавиту
    return sortExerciseNamesByTagAndName(result);
  }, [allExercisesList, deleteSearchQuery, deleteTypeFilter]);

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
      const exerciseType = getExerciseTypeFromBase(selectedExercise);
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
    setExerciseTypeFilter(getExerciseTypeFromBase(exerciseName));
    setIsReplaceExerciseOpen(true);
  };

  const handleConfirmReplace = (newName: string) => {
    setPendingReplaceName(newName);
    setShowReplaceConfirm(true);
  };

  const confirmReplace = () => {
    if (replacingExerciseId && pendingReplaceName) {
      // Заменяем упражнение (сохраняет позицию)
      replaceExercise(workout.id, replacingExerciseId, pendingReplaceName, getExerciseTypeFromBase(pendingReplaceName));
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
    // Сохраняем вес только для сегодняшней и прошедших дат
    const isFutureDate = workout.date > new Date().toISOString().split('T')[0];
    if (!isFutureDate) {
      const weight = weightValue ? parseFloat(weightValue) : undefined;
      updateWorkoutWeight(workout.id, weight);
    }
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

  // Template handlers
  const handleSaveTemplate = () => {
    if (workout.exercises.length === 0) {
      setShowNoExercisesError(true);
      return;
    }
    if (templateName.trim()) {
      const exerciseNames = workout.exercises.map(e => e.name);
      saveTemplate(templateName.trim(), workout.type, exerciseNames);
      setTemplateName('');
      setIsTemplatesOpen(false);
    }
  };

  const handleLoadTemplate = () => {
    if (templates.length === 0) {
      setShowNoTemplatesError(true);
      return;
    }
    if (selectedTemplates.length === 1) {
      loadTemplate(workout.id, selectedTemplates[0].id);
      setSelectedTemplates([]);
      setIsTemplatesOpen(false);
    }
  };

  const handleDeleteTemplates = () => {
    if (selectedTemplates.length > 0) {
      setShowDeleteTemplateConfirm(true);
    }
  };

  const confirmDeleteTemplates = () => {
    selectedTemplates.forEach(t => deleteTemplate(t.id));
    setSelectedTemplates([]);
    setShowDeleteTemplateConfirm(false);
  };

  const toggleTemplateSelection = (template: WorkoutTemplate) => {
    const isSelected = selectedTemplates.some(t => t.id === template.id);
    if (isSelected) {
      setSelectedTemplates(selectedTemplates.filter(t => t.id !== template.id));
    } else {
      setSelectedTemplates([...selectedTemplates, template]);
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
    
    // Очищаем Map от удалённых упражнений
    const currentIds = new Set(workout.exercises.map(e => e.id));
    exerciseRefsRef.current.forEach((_, id) => {
      if (!currentIds.has(id)) {
        exerciseRefsRef.current.delete(id);
      }
    });
    
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
              <div className="w-9 h-9 shrink-0 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.35)' }}>
                <WorkoutTypeIcon type={workout.type} color={colors.border} isDefaultStyle={isDefaultStyle} />
              </div>
              <h2 className="text-xl font-bold" style={{ color: colors.text }}>
                {WORKOUT_TYPE_NAMES[workout.type]}
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setNotesValue(workout.notes || '');
                  setWeightValue(workout.weight?.toString() || '');
                  setIsNotesOpen(true);
                }}
                className="h-9 w-9 rounded-lg text-zinc-500 hover:text-zinc-300 active:text-zinc-300 hover:!bg-transparent dark:hover:!bg-transparent active:!bg-transparent"
                title="Добавить заметку"
              >
                <PencilIcon className="w-4 h-4" style={(workout.notes || workout.weight) ? { color: colors.text } : undefined} />
              </Button>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowDeleteWorkoutConfirm(true)}
              className="text-zinc-500 hover:text-red-400 active:text-red-400 hover:!bg-transparent dark:hover:!bg-transparent active:!bg-transparent"
            >
              <Trash2Icon className="w-5 h-5" />
            </Button>
          </div>

        </div>

        {/* Weight and Notes display */}
        {(workout.weight || workout.notes) && (
          <div className="mt-3 space-y-2">
            {workout.weight && (
              <div className="p-2 bg-zinc-800/50 rounded-lg text-sm text-zinc-300 border border-zinc-700/50">
                <span className="text-zinc-500">
                  {workout.date === new Date().toISOString().split('T')[0] ? 'Мой вес сегодня' : 'Мой вес был'}: </span>{workout.weight} кг
              </div>
            )}
            {workout.notes && (
              <div className="p-2 bg-zinc-800/50 rounded-lg text-sm text-zinc-300 border border-zinc-700/50">
                {workout.notes}
              </div>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="flex justify-between mt-4">
          <div className="flex items-center gap-4">
            {/* Template icon button */}
            <div className="w-9 flex justify-center shrink-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setSelectedTemplates([]);
                  setTemplateName('');
                  setIsTemplatesOpen(true);
                }}
                className="h-9 w-9 shrink-0 text-zinc-500 hover:text-zinc-300 active:text-zinc-300 hover:!bg-transparent dark:hover:!bg-transparent active:!bg-transparent"
                title="Шаблоны тренировок"
              >
                <BookmarkIcon className="w-5 h-5" />
              </Button>
            </div>

            {workoutDuration !== null && (
              <div className="text-center min-w-[60px]">
                <div className="text-lg font-bold text-white">{formatDuration(workoutDuration)}</div>
                <div className="text-xs text-zinc-500">Затрачено</div>
              </div>
            )}
          </div>
          <div className="flex gap-4">
            <div className="text-center min-w-[75px]">
              <div className="text-lg font-bold text-white">{workout.exercises.length}</div>
              <div className="text-xs text-zinc-500">Упражнений</div>
            </div>
            <div className="text-center min-w-[70px]">
              <div className={cn(
                "font-bold text-white",
                Math.round(totalVolume).toString().length > 5 ? "text-sm" : "text-lg"
              )}>
                {Math.round(totalVolume)}
              </div>
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
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 100, opacity: 0 }}
              transition={{
                layout: { duration: suppressLayoutAnimation ? 0 : 0.35, ease: 'easeOut' },
                default: { duration: 0.35, ease: 'easeOut' }
              }}
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
                highlightSetIndex={highlightExercise?.name === exercise.name ? exercise.sets.findIndex(s => s.id === highlightExercise.setId) : undefined}
              />
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Delete button and Add exercise button */}
      <div className="flex gap-4">
        {/* Delete exercises button */}
        <Button
          onClick={() => {
            setDeleteSearchQuery('');
            setDeleteTypeFilter(null);
            setSelectedDeleteExercises([]);
            setIsDeleteExerciseOpen(true);
          }}
          className="w-9 h-9 shrink-0 p-0 text-primary-foreground"
          style={{ backgroundColor: 'rgb(201, 56, 67)' }}
        >
          <ListIcon className="w-5 h-5" />
        </Button>

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
            <Button
              className="flex-1 retro-large-text"
              style={{ backgroundColor: '#19a655' }}
            >
              Добавить упражнение
            </Button>
          </DialogTrigger>
        <DialogContent 
          className="bg-zinc-800 border h-[70vh] !top-[15vh] !translate-y-0 !p-0 !gap-0 flex flex-col"
          style={{ borderColor: colors.border }}
          showCloseButton={false}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 pt-4 shrink-0">
            <DialogTitle className="text-white font-medium text-base">Добавить упражнение</DialogTitle>
            <DialogClose className="text-zinc-500 hover:text-white active:text-white transition-colors p-1">
              <XIcon className="w-5 h-5" />
            </DialogClose>
          </div>

          <div className="flex flex-col min-h-0 p-4 gap-4 flex-1">
            {/* Search */}
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск упражнения..."
                className="!bg-zinc-900/50 border border-zinc-700 rounded-lg text-white placeholder:text-[10px] pl-9"
                autoComplete="off"
                inputMode="search"
              />
            </div>

            {/* Type filter tags */}
            <div className="flex gap-3">
              {(['chest', 'back', 'legs', 'common'] as ExerciseType[]).map((type) => {
                const typeColors = EXERCISE_TYPE_COLORS[type];
                const isSelected = exerciseTypeFilter === type;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setExerciseTypeFilter(isSelected ? null : type)}
                    className="flex items-center justify-center px-2 py-1 rounded-lg text-sm font-medium transition-colors flex-1"
                    style={isSelected ? {
                      backgroundColor: typeColors.bg,
                      color: typeColors.text,
                    } : {
                      backgroundColor: 'rgb(63 63 70 / 0.5)',
                      color: '#d4d4d8',
                    }}
                  >
                    <span className="truncate">{EXERCISE_TYPE_NAMES[type]}</span>
                  </button>
                );
              })}
            </div>

            {/* Available exercises list */}
            <div className="flex-1 min-h-0 overflow-y-auto space-y-1 border border-zinc-700 rounded-lg p-2 bg-zinc-900/50" style={{ touchAction: 'pan-y' }}>
              {displayedExercises.length > 0 ? (
                displayedExercises.map((exerciseName) => {
                  const exerciseType = getExerciseTypeFromBase(exerciseName);
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
                            : "hover:bg-zinc-700/50 active:bg-zinc-700/50 text-zinc-300 hover:text-white active:text-white"
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
            <Button
              onClick={() => {
                setIsAddExerciseOpen(false);
                setIsCreateCustomOpen(true);
              }}
              style={{ backgroundColor: '#ffae00' }}
              className="text-black retro-large-text"
            >
              Создать своё
            </Button>
            <Button
              onClick={handleAddSelectedExercise}
              disabled={!selectedExercise}
              style={{ backgroundColor: '#19a655' }}
              className="retro-large-text"
            >
              Добавить
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>

      {/* Delete exercises dialog */}
      <Dialog open={isDeleteExerciseOpen} onOpenChange={(open) => {
        setIsDeleteExerciseOpen(open);
        if (!open) {
          setDeleteSearchQuery('');
          setDeleteTypeFilter(null);
          setSelectedDeleteExercises([]);
        }
      }}>
        <DialogContent
          className="bg-zinc-800 border h-[70vh] !top-[15vh] !translate-y-0 !p-0 !gap-0 flex flex-col"
          style={{ borderColor: '#c93843' }}
          showCloseButton={false}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 pt-4 shrink-0">
            <DialogTitle className="text-white font-medium text-base">Удаление упражнений</DialogTitle>
            <DialogClose className="text-zinc-500 hover:text-white active:text-white transition-colors p-1">
              <XIcon className="w-5 h-5" />
            </DialogClose>
          </div>

          <div className="flex flex-col min-h-0 p-4 gap-4 flex-1">
            {/* Search */}
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <Input
                value={deleteSearchQuery}
                onChange={(e) => setDeleteSearchQuery(e.target.value)}
                placeholder="Поиск упражнения..."
                className="!bg-zinc-900/50 border border-zinc-700 rounded-lg text-white placeholder:text-[10px] pl-9"
                autoComplete="off"
                inputMode="search"
              />
            </div>

            {/* Type filter tags */}
            <div className="flex gap-3">
              {(['chest', 'back', 'legs', 'common'] as ExerciseType[]).map((type) => {
                const typeColors = EXERCISE_TYPE_COLORS[type];
                const isSelected = deleteTypeFilter === type;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setDeleteTypeFilter(isSelected ? null : type)}
                    className="flex items-center justify-center px-2 py-1 rounded-lg text-sm font-medium transition-colors flex-1"
                    style={isSelected ? {
                      backgroundColor: typeColors.bg,
                      color: typeColors.text,
                    } : {
                      backgroundColor: 'rgb(63 63 70 / 0.5)',
                      color: '#d4d4d8',
                    }}
                  >
                    <span className="truncate">{EXERCISE_TYPE_NAMES[type]}</span>
                  </button>
                );
              })}
            </div>

            {/* Exercises list */}
            <div className="flex-1 min-h-0 overflow-y-auto space-y-1 border border-zinc-700 rounded-lg p-2 bg-zinc-900/50" style={{ touchAction: 'pan-y' }}>
              {deleteDialogExercises.length > 0 ? (
                deleteDialogExercises.map((exerciseName) => {
                  const exerciseType = getExerciseTypeFromBase(exerciseName);
                  const exerciseColors = EXERCISE_TYPE_COLORS[exerciseType];
                  const exerciseMarker = EXERCISE_TYPE_MARKERS[exerciseType];
                  const isSelected = selectedDeleteExercises.includes(exerciseName);
                  return (
                    <button
                      key={exerciseName}
                      onClick={() => {
                        if (isSelected) {
                          setSelectedDeleteExercises(selectedDeleteExercises.filter(e => e !== exerciseName));
                        } else {
                          setSelectedDeleteExercises([...selectedDeleteExercises, exerciseName]);
                        }
                      }}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center gap-2",
                        isSelected
                          ? "bg-zinc-600 text-white"
                          : "hover:bg-zinc-700/50 active:bg-zinc-700/50 text-zinc-300 hover:text-white active:text-white"
                      )}
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
                })
              ) : (
                <p className="text-center text-zinc-500 py-4">Нет упражнений</p>
              )}
            </div>
          </div>

          {/* Delete button */}
          <div className="flex justify-end px-4 pb-4 shrink-0">
            <Button
              onClick={() => setShowDeleteConfirm(true)}
              disabled={selectedDeleteExercises.length === 0}
              style={{ backgroundColor: '#c93843' }}
              className="text-primary-foreground retro-large-text"
            >
              Удалить
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete exercise confirmation dialog */}
      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title={selectedDeleteExercises.length === 1 ? `Удалить упражнение?` : `Удалить упражнения?`}
        description={selectedDeleteExercises.length === 1
          ? <>
              Это удалит упражнение <strong className="text-white">"{selectedDeleteExercises[0]}"</strong>, а также все его подходы во всех тренировках на всех датах.<br />Это действие нельзя отменить.
            </>
          : <>
              Это удалит <strong className="text-white">выделенные</strong> упражнения, а также все их подходы во всех тренировках на всех датах.<br />Это действие нельзя отменить.
            </>
        }
        confirmText="Удалить"
        cancelText="Отмена"
        onConfirm={() => {
          if (selectedDeleteExercises.length > 0) {
            selectedDeleteExercises.forEach(exerciseName => deleteExerciseFromPresets(exerciseName));
            setSelectedDeleteExercises([]);
            setDeleteSearchQuery('');
            setDeleteTypeFilter(null);
            setExerciseListVersion(v => v + 1);
          }
        }}
        borderColor="#c93843"
      />

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
            <DialogClose className="text-zinc-500 hover:text-white active:text-white transition-colors p-1">
              <XIcon className="w-5 h-5" />
            </DialogClose>
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
              className="!bg-zinc-900/50 border border-zinc-700 rounded-lg text-white placeholder:text-[10px]"
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
            <div className="flex gap-3">
              {(['chest', 'back', 'legs', 'common'] as ExerciseType[]).map((type) => {
                const typeColors = EXERCISE_TYPE_COLORS[type];
                const isSelected = newExerciseType === type;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setNewExerciseType(type)}
                    className="flex items-center justify-center px-2 py-1 rounded-lg text-sm font-medium transition-colors flex-1"
                    style={isSelected ? {
                      backgroundColor: typeColors.bg,
                      color: typeColors.text,
                    } : {
                      backgroundColor: 'rgb(63 63 70 / 0.5)',
                      color: '#d4d4d8',
                    }}
                  >
                    <span className="truncate">{EXERCISE_TYPE_NAMES[type]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Create button */}
          <div className="flex justify-end px-4 pb-4">
            <Button
              onClick={handleAddCustomExercise}
              disabled={!newExerciseName.trim()}
              style={{ backgroundColor: '#ffae00' }}
              className="text-black retro-large-text"
            >
              Создать
            </Button>
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
          style={{ borderColor: EXERCISE_TYPE_COLORS[getExerciseTypeFromBase(replacingExerciseName)]?.border || colors.border }}
          showCloseButton={false}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 pt-4 shrink-0">
            <DialogTitle className="text-white font-medium text-base">
              Заменить "{replacingExerciseName}" на
            </DialogTitle>
            <DialogClose className="text-zinc-500 hover:text-white active:text-white transition-colors p-1">
              <XIcon className="w-5 h-5" />
            </DialogClose>
          </div>

          <div className="flex flex-col min-h-0 p-4 gap-4 flex-1">
            {/* Search */}
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск упражнения..."
                className="!bg-zinc-900/50 border border-zinc-700 rounded-lg text-white placeholder:text-[10px] pl-9"
                autoComplete="off"
                inputMode="search"
              />
            </div>

            {/* Type filter tags */}
            <div className="flex gap-3">
              {(['chest', 'back', 'legs', 'common'] as ExerciseType[]).map((type) => {
                const typeColors = EXERCISE_TYPE_COLORS[type];
                const isSelected = exerciseTypeFilter === type;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setExerciseTypeFilter(isSelected ? null : type)}
                    className="flex items-center justify-center px-2 py-1 rounded-lg text-sm font-medium transition-colors flex-1"
                    style={isSelected ? {
                      backgroundColor: typeColors.bg,
                      color: typeColors.text,
                    } : {
                      backgroundColor: 'rgb(63 63 70 / 0.5)',
                      color: '#d4d4d8',
                    }}
                  >
                    <span className="truncate">{EXERCISE_TYPE_NAMES[type]}</span>
                  </button>
                );
              })}
            </div>

            {/* Available exercises list */}
            <div className="flex-1 min-h-0 overflow-y-auto space-y-1 border border-zinc-700 rounded-lg p-2 bg-zinc-900/50" style={{ touchAction: 'pan-y' }}>
              {displayedExercises.length > 0 ? (
                displayedExercises.map((exerciseName) => {
                  const exerciseType = getExerciseTypeFromBase(exerciseName);
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
                            : "hover:bg-zinc-700/50 active:bg-zinc-700/50 text-zinc-300 hover:text-white active:text-white"
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
            <Button
              onClick={() => selectedReplaceExercise && handleConfirmReplace(selectedReplaceExercise)}
              disabled={!selectedReplaceExercise}
              style={{ backgroundColor: '#19a655' }}
            >
              Заменить
            </Button>
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
            <DialogClose className="text-zinc-500 hover:text-white active:text-white transition-colors p-1">
              <XIcon className="w-5 h-5" />
            </DialogClose>
          </div>
          
          {/* Weight input - only for today and past dates */}
          {workout.date <= new Date().toISOString().split('T')[0] && (
            <div className="flex items-center px-4 mt-4">
              <span className="text-sm text-zinc-400">
                {workout.date === new Date().toISOString().split('T')[0] ? 'Мой вес сегодня' : 'Мой вес был'}
              </span>
              <input
                type="text"
                inputMode="decimal"
                value={weightValue}
                onChange={(e) => {
                  // Разрешаем только цифры и одну точку/запятую
                  const value = e.target.value.replace(/[^0-9.,]/g, '');
                  // Заменяем запятую на точку
                  const normalized = value.replace(',', '.');
                  // Проверяем максимум один знак после точки
                  const parts = normalized.split('.');
                  if (parts.length > 1 && parts[1] && parts[1].length > 1) {
                    return;
                  }
                  setWeightValue(normalized);
                }}
                placeholder="00.0"
                className="w-16 bg-zinc-900/50 border border-zinc-700 rounded-lg px-2 py-1.5 mx-1 text-white placeholder-zinc-500 focus:outline-none text-center text-sm"
              />
              <span className="text-sm text-zinc-400">кг</span>
            </div>
          )}
          
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
            <Button
              onClick={handleSaveNotes}
              disabled={workout.date > new Date().toISOString().split('T')[0] ? !notesValue.trim() : !notesValue.trim() && !weightValue.trim()}
              className="min-w-[100px] retro-large-text"
              style={{ backgroundColor: '#19a655' }}
            >
              Сохранить
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Replace confirmation dialog */}
      <ConfirmDialog
        open={showReplaceConfirm}
        onOpenChange={setShowReplaceConfirm}
        title="Заменить упражнение?"
        description={
          <>
            Упражнение <span className="text-white">"{replacingExerciseName}"</span> будет заменено на <span className="text-white">"{pendingReplaceName}"</span>.<br />Все подходы заменяемого упражнения на текущей дате будут удалены.<br />Это действие нельзя отменить.
          </>
        }
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

      {/* Templates dialog */}
      <Dialog open={isTemplatesOpen} onOpenChange={(open) => {
        setIsTemplatesOpen(open);
        if (!open) {
          setSelectedTemplates([]);
          setTemplateName('');
          setTemplateSearchQuery('');
        }
      }}>
        <DialogContent
          className="bg-zinc-800 border h-[70vh] !top-[15vh] !translate-y-0 !p-0 !gap-0 flex flex-col"
          style={{ borderColor: colors.border }}
          showCloseButton={false}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 pt-4 shrink-0">
            <DialogTitle className="text-white font-medium text-base">Шаблоны тренировок</DialogTitle>
            <DialogClose className="text-zinc-500 hover:text-white active:text-white transition-colors p-1">
              <XIcon className="w-5 h-5" />
            </DialogClose>
          </div>

          <div className="flex flex-col min-h-0 p-4 gap-4 flex-1">
            {/* Search */}
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <Input
                value={templateSearchQuery}
                onChange={(e) => setTemplateSearchQuery(e.target.value)}
                placeholder="Поиск шаблона..."
                className="!bg-zinc-900/50 border border-zinc-700 rounded-lg text-white placeholder:text-[10px] pl-9"
                autoComplete="off"
                inputMode="search"
              />
            </div>

            {/* Templates list */}
            <div className="flex-1 min-h-0 overflow-y-auto space-y-1 border border-zinc-700 rounded-lg p-2 bg-zinc-900/50" style={{ touchAction: 'pan-y' }}>
              {filteredTemplates.length > 0 ? (
                filteredTemplates.map((template) => {
                  const isSelected = selectedTemplates.some(t => t.id === template.id);
                  return (
                    <button
                      key={template.id}
                      onClick={() => toggleTemplateSelection(template)}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center justify-between gap-2",
                        isSelected
                          ? "bg-zinc-600 text-white"
                          : "hover:bg-zinc-700/50 active:bg-zinc-700/50 text-zinc-300 hover:text-white active:text-white"
                      )}
                    >
                      <span className="flex-1">{template.name}</span>
                      <span className="text-xs text-zinc-500 shrink-0">{template.exerciseNames.length} упр.</span>
                    </button>
                  );
                })
              ) : (
                <p className="text-center text-zinc-500 py-4">Нет сохранённых шаблонов</p>
              )}
            </div>

            {/* Template name input for save */}
            <Input
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="Имя нового шаблона"
              className="!bg-zinc-900/50 border border-zinc-700 rounded-lg text-white placeholder:text-[10px]"
              autoComplete="off"
            />
          </div>

          {/* Bottom buttons */}
          <div className="flex items-center justify-between px-4 pb-4 shrink-0 gap-3">
            <Button
              onClick={selectedTemplates.length > 0 ? () => setShowDeleteTemplateConfirm(true) : handleSaveTemplate}
              disabled={selectedTemplates.length === 0 && !templateName.trim()}
              className="flex-1 text-primary-foreground border-0 retro-large-text"
              style={{ backgroundColor: selectedTemplates.length > 0 ? '#c93843' : '#ffae00' }}
            >
              {selectedTemplates.length > 0 ? 'Удалить' : 'Сохранить'}
            </Button>
            <Button
              onClick={handleLoadTemplate}
              disabled={selectedTemplates.length !== 1}
              className="flex-1 text-primary-foreground border-0 retro-large-text"
              style={{ backgroundColor: '#19a655' }}
            >
              Загрузить
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete template confirmation dialog */}
      <ConfirmDialog
        open={showDeleteTemplateConfirm}
        onOpenChange={setShowDeleteTemplateConfirm}
        title="Удалить шаблон?"
        description={
          <>
            {selectedTemplates.length === 1 ? (
              <>Шаблон <strong className="text-white">{selectedTemplates[0].name}</strong> будет удалён.</>
            ) : (
              <><strong className="text-white">Шаблоны</strong> будут удалены.</>
            )}
            <br />
            Это действие нельзя отменить.
          </>
        }
        confirmText="Удалить"
        onConfirm={confirmDeleteTemplates}
        borderColor="#c93843"
      />

      {/* No exercises error dialog */}
      <Dialog open={showNoExercisesError} onOpenChange={setShowNoExercisesError}>
        <DialogContent 
          className="bg-zinc-800 border !p-0 !gap-0"
          style={{ borderColor: colors.border }}
          showCloseButton={false}
        >
          <div className="p-6 text-center">
            <p className="text-zinc-300">Сначала добавьте упражнения в текущую дату</p>
          </div>
          <div className="flex justify-center pb-4">
            <button
              onClick={() => setShowNoExercisesError(false)}
              className="py-2 px-4 rounded-lg text-sm font-medium text-primary-foreground hover:opacity-90"
              style={{ backgroundColor: '#19a655' }}
            >
              Хорошо
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* No templates error dialog */}
      <Dialog open={showNoTemplatesError} onOpenChange={setShowNoTemplatesError}>
        <DialogContent 
          className="bg-zinc-800 border !p-0 !gap-0"
          style={{ borderColor: colors.border }}
          showCloseButton={false}
        >
          <div className="p-6 text-center">
            <p className="text-zinc-300">Сначала сохраните хотя бы один шаблон</p>
          </div>
          <div className="flex justify-center pb-4">
            <button
              onClick={() => setShowNoTemplatesError(false)}
              className="py-2 px-4 rounded-lg text-sm font-medium text-primary-foreground hover:opacity-90"
              style={{ backgroundColor: '#19a655' }}
            >
              Хорошо
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
