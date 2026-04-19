'use client';

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Trash2Icon, PlusIcon, CheckIcon, ClockIcon, RefreshCwIcon, UserIcon, WeightIcon, ChevronUpIcon, ChevronDownIcon, XIcon, Repeat2Icon, TrendingUpIcon, HistoryIcon, LinkOffIcon, LinkOnIcon } from '@/components/icons/Icons';
import { Exercise, WorkoutSet, WORKOUT_TYPE_COLORS, WorkoutType, ExerciseType, EquipmentType, GripType, PositionType, EQUIPMENT_TYPES, GRIP_TYPES, POSITION_TYPES, WeightUnit, WEIGHT_UNITS } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { getPersonalRecord, getRecordType } from '@/lib/pr';
import { useFitnessStore } from '@/lib/store';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { getPreviousSetData, getExerciseTypeFromBase } from '@/lib/storage';
import { ExerciseHistoryModal } from './ExerciseHistoryModal';
import { ExerciseStatsChart, ChartDataPoint } from './ExerciseStatsChart';

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
  // Callback for highlighting set from chart
  onHighlightSet?: (exerciseName: string, setId: string) => void;
  // Superset props
  supersetLabel?: string; // название суперсета (напр. "Суперсет 1")
  supersetChainColor?: string; // цвет иконки цепи в суперсете
  onSupersetButtonTap?: (exerciseId: string) => void; // тап по кнопке цепи
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
  highlightSetIndex,
  onHighlightSet,
  // Superset props
  supersetLabel,
  supersetChainColor,
  onSupersetButtonTap,
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
  const [editEquipment, setEditEquipment] = useState<EquipmentType | null>(null);
  const [editGrip, setEditGrip] = useState<GripType | null>(null);
  const [editPosition, setEditPosition] = useState<PositionType | null>(null);

  // State for input type
  const [useBodyweight, setUseBodyweight] = useState(false);
  const [useReps, setUseReps] = useState(true);
  const [useTime, setUseTime] = useState(false);

  // State for equipment and grip tags
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentType | null>(null);
  const [selectedGrip, setSelectedGrip] = useState<GripType | null>(null);
  const [selectedPosition, setSelectedPosition] = useState<PositionType | null>(null);
  const [selectedWeightUnit, setSelectedWeightUnit] = useState<WeightUnit>('kg');
  const [editWeightUnit, setEditWeightUnit] = useState<WeightUnit>('kg');
  const [showEquipmentPicker, setShowEquipmentPicker] = useState(false);
  const [showGripPicker, setShowGripPicker] = useState(false);
  const [showPositionPicker, setShowPositionPicker] = useState(false);
  const [showUnitPicker, setShowUnitPicker] = useState(false);
  const [pickerPosition, setPickerPosition] = useState({ top: 0, left: 0, width: 0, openUpward: false, bottom: 0 });
  const equipmentButtonRef = useRef<HTMLButtonElement>(null);
  const gripButtonRef = useRef<HTMLButtonElement>(null);
  const positionButtonRef = useRef<HTMLButtonElement>(null);
  const unitButtonRef = useRef<HTMLButtonElement>(null);
  const editEquipmentButtonRef = useRef<HTMLButtonElement>(null);
  const editGripButtonRef = useRef<HTMLButtonElement>(null);
  const editPositionButtonRef = useRef<HTMLButtonElement>(null);
  const editUnitButtonRef = useRef<HTMLButtonElement>(null);

  // Block scroll when picker is open
  useEffect(() => {
    if (showEquipmentPicker || showGripPicker || showPositionPicker || showUnitPicker) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [showEquipmentPicker, showGripPicker, showPositionPicker, showUnitPicker]);
  
  // State for delete confirmation
  const [showDeleteExerciseConfirm, setShowDeleteExerciseConfirm] = useState(false);
  const [showDeleteSetConfirm, setShowDeleteSetConfirm] = useState(false);
  const [setToDelete, setSetToDelete] = useState<string | null>(null);
  
  // State for statistics modal
  const [showStats, setShowStats] = useState(false);

  // State for history modal
  const [showHistory, setShowHistory] = useState(false);

  // State for history modal from stats (without swipe, with highlight)
  const [showHistoryFromStats, setShowHistoryFromStats] = useState(false);
  const [historyFromDate, setHistoryFromDate] = useState<string>('');
  const [historyHighlightSetId, setHistoryHighlightSetId] = useState<string | undefined>(undefined);

  // Drag-and-drop state
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartPosRef = useRef<{ x: number; y: number } | null>(null);
  const isDragActiveRef = useRef(false);
  const hasMovedRef = useRef(false);
  const dragHandleRef = useRef<HTMLDivElement>(null);
  
  // Ref for highlighted set scrolling
  const highlightedSetRef = useRef<HTMLDivElement>(null);

  // Ref for adding/editing set scrolling
  const addingSetRef = useRef<HTMLDivElement>(null);
  const editingSetRef = useRef<HTMLDivElement>(null);

  // Scroll to adding set area
  useEffect(() => {
    if (isAddingSet && addingSetRef.current) {
      setTimeout(() => {
        addingSetRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }, 100);
    }
  }, [isAddingSet]);

  // Scroll to editing set
  useEffect(() => {
    if (editingSetId && editingSetRef.current) {
      setTimeout(() => {
        editingSetRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }, 100);
    }
  }, [editingSetId]);

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

  const { addSet, removeSet, updateSet, removeExercise, currentWorkout, workouts, setSelectedDate } = useFitnessStore();
  const pr = getPersonalRecord(exercise.name);
  
  // История упражнения для графика
  const exerciseHistory = useMemo(() => {
    if (!workouts) return [];

    const history: ChartDataPoint[] = [];

    workouts.forEach(w => {
      const exerciseInWorkout = w.exercises.find(e => e.name === exercise.name);
      if (exerciseInWorkout && exerciseInWorkout.sets.length > 0) {
        // Группируем подходы по единицам измерения
        const setsByUnit = new Map<WeightUnit, typeof exerciseInWorkout.sets>();

        exerciseInWorkout.sets.forEach(set => {
          if (set.isWarmup || set.weight === 0) return;
          const unit = set.weightUnit || 'kg';
          const existing = setsByUnit.get(unit) || [];
          existing.push(set);
          setsByUnit.set(unit, existing);
        });

        // Для каждой единицы создаём отдельную точку данных
        setsByUnit.forEach((sets, unit) => {
          // Сохраняем информацию о всех подходах для фильтрации
          const setsInfo: SetInfo[] = sets.map(s => ({
            weight: s.weight,
            reps: s.reps,
            time: s.time,
            equipmentType: s.equipmentType,
            gripType: s.gripType,
            positionType: s.positionType,
            setId: s.id,
          }));

          history.push({
            date: w.date,
            setsInfo,
            userWeight: w.weight,
            workoutId: w.id,
            weightUnit: unit,
          });
        });
      }
    });

    // Сортируем по дате
    return history.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [workouts, exercise.name]);
  
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
  
  // Автозаполнение данных при открытии диалога добавления подхода
  const autofillSetData = useCallback((forWarmup: boolean) => {
    // Если есть подходы того же типа в текущем упражнении - берём из последнего
    const sameTypeSets = exercise.sets.filter(s => forWarmup ? s.isWarmup : !s.isWarmup);
    if (sameTypeSets.length > 0) {
      const lastSet = sameTypeSets[sameTypeSets.length - 1];
      if (lastSet.weight === 0) {
        setUseBodyweight(true);
        setNewWeight('');
      } else {
        setUseBodyweight(false);
        setNewWeight(String(lastSet.weight));
      }
      setNewReps(String(lastSet.reps));
      if (lastSet.time && lastSet.time > 0) {
        setUseTime(true);
        const mins = Math.floor(lastSet.time / 60);
        const secs = lastSet.time % 60;
        setNewTimeMinutes(String(mins));
        setNewTimeSeconds(String(secs));
      } else {
        setUseTime(false);
        setNewTimeMinutes('');
        setNewTimeSeconds('');
      }
      setUseReps(lastSet.reps > 0);
      
      // Наследуем теги снаряда и хвата от последнего подхода
      // Снаряд наследуем только если не bodyweight
      if (lastSet.weight !== 0 && lastSet.equipmentType) {
        setSelectedEquipment(lastSet.equipmentType);
      } else {
        setSelectedEquipment(null);
      }
      // Хват наследуем только если не time-only
      if (!lastSet.time && lastSet.gripType) {
        setSelectedGrip(lastSet.gripType);
      } else {
        setSelectedGrip(null);
      }
      // Позицию наследуем всегда
      if (lastSet.positionType) {
        setSelectedPosition(lastSet.positionType);
      } else {
        setSelectedPosition(null);
      }
      // Единицу измерения наследуем всегда
      setSelectedWeightUnit(lastSet.weightUnit || 'kg');
      return;
    }
    
    // Иначе ищем в предыдущих тренировках
    const setNumber = sameTypeSets.length + 1;
    const prevData = getPreviousSetData(exercise.name, setNumber, forWarmup);
    if (prevData) {
      if (prevData.isBodyweight) {
        setUseBodyweight(true);
        setNewWeight('');
      } else {
        setUseBodyweight(false);
        setNewWeight(prevData.weight > 0 ? String(prevData.weight) : '');
      }
      setNewReps(prevData.reps > 0 ? String(prevData.reps) : '');
      if (prevData.time > 0) {
        setUseTime(true);
        const mins = Math.floor(prevData.time / 60);
        const secs = prevData.time % 60;
        setNewTimeMinutes(String(mins));
        setNewTimeSeconds(String(secs));
      } else {
        setUseTime(false);
        setNewTimeMinutes('');
        setNewTimeSeconds('');
      }
      setUseReps(prevData.reps > 0);
      // Теги не наследуем из предыдущих тренировок
      setSelectedEquipment(null);
      setSelectedGrip(null);
      setSelectedPosition(null);
      setSelectedWeightUnit(prevData.weightUnit || 'kg');
      return;
    }
    
    // Если данных нет - оставляем пустыми
    setNewReps('');
    setNewWeight('');
    setNewTimeMinutes('');
    setNewTimeSeconds('');
    setUseBodyweight(false);
    setUseReps(true);
    setUseTime(false);
    setSelectedEquipment(null);
    setSelectedGrip(null);
    setSelectedPosition(null);
    setSelectedWeightUnit('kg');
  }, [exercise.sets, exercise.name]);
  
  // Автозаполнение при переключении типа подхода (разминочный/рабочий)
  useEffect(() => {
    if (isAddingSet) {
      autofillSetData(isWarmup);
    }
  }, [isWarmup, isAddingSet, autofillSetData]);
  
  // Начать добавление подхода с автозаполнением
  const handleStartAddingSet = useCallback(() => {
    // По умолчанию добавляем рабочий подход
    const defaultIsWarmup = false;
    setIsWarmup(defaultIsWarmup);
    
    // Автозаполняем данные
    autofillSetData(defaultIsWarmup);
    
    setIsAddingSet(true);
  }, [autofillSetData]);
  
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
  const exerciseType = exercise.exerciseType || getExerciseTypeFromBase(exercise.name);
  
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

  // Получаем предыдущие значения для следующего подхода с фильтрацией по выбранной единице
  // Используем useMemo для обновления при смене единицы
  const prevWorkingSetData = useMemo(() => {
    return getPreviousSetData(exercise.name, nextWorkingSetNumber, false, selectedWeightUnit);
  }, [exercise.name, nextWorkingSetNumber, selectedWeightUnit]);

  const prevWarmupSetData = useMemo(() => {
    return getPreviousSetData(exercise.name, nextWarmupSetNumber, true, selectedWeightUnit);
  }, [exercise.name, nextWarmupSetNumber, selectedWeightUnit]);
  
  // Цвета для рекордов
  const WEIGHT_RECORD_COLOR = '#ffb900';
  const VOLUME_RECORD_COLOR = '#cd7f32';

  // Определение типа рекорда для подхода
  const getSetRecordType = (weight: number, reps: number, setId: string, time?: number, weightUnit?: WeightUnit): 'weight' | 'volume' | null => {
    return getRecordType(exercise.name, weight, reps, setId, workoutId, time, weightUnit);
  };

  const handleAddSet = () => {
    const reps = parseInt(newReps) || 0;
    const weight = useBodyweight ? 0 : (parseFloat(newWeight) || 0);
    const time = useTime ? ((parseInt(newTimeMinutes) || 0) * 60 + (parseInt(newTimeSeconds) || 0)) : 0;

    // Validate - нужен хотя бы один показатель
    if (useReps && reps <= 0 && !useBodyweight) return;
    if (!useBodyweight && useReps && weight <= 0 && !useTime) return;
    if (useTime && time <= 0 && !useReps) return;

    addSet(workoutId, exercise.id, reps, weight, time > 0 ? time : undefined, isWarmup, selectedEquipment ?? undefined, selectedGrip ?? undefined, selectedPosition ?? undefined, selectedWeightUnit);

    // Reset form
    setNewReps('');
    setNewWeight('');
    setNewTimeMinutes('');
    setNewTimeSeconds('');
    setIsAddingSet(false);
    setIsWarmup(false);
    setSelectedEquipment(null);
    setSelectedGrip(null);
    setSelectedPosition(null);
    setSelectedWeightUnit('kg');
    setShowEquipmentPicker(false);
    setShowGripPicker(false);
    setShowPositionPicker(false);
  };

  const handleUpdateSet = (setId: string, originalSet: WorkoutSet) => {
    const reps = parseInt(editReps) || 0;
    // Если оригинальный вес был > 0, берём из поля ввода, иначе оставляем 0 (собственный вес)
    const weight = originalSet.weight > 0 ? (parseFloat(editWeight) || 0) : 0;
    const time = ((parseInt(editTimeMinutes) || 0) * 60 + (parseInt(editTimeSeconds) || 0));

    // Validate - нужен хотя бы один показатель
    if (reps <= 0 && time <= 0) return;

    // editEquipment/editGrip/editPosition могут быть:
    // - null (пользователь выбрал "не выбран" или у подхода не было тэга)
    // - конкретное значение (пользователь выбрал тэг)
    // updateSet в storage.ts обрабатывает null как удаление тэга (set.equipmentType = undefined)
    updateSet(workoutId, exercise.id, setId, reps, weight, time > 0 ? time : undefined,
      editEquipment, editGrip, editPosition, editWeightUnit
    );

    setEditingSetId(null);
    setEditReps('');
    setEditWeight('');
    setEditTimeMinutes('');
    setEditTimeSeconds('');
    setEditEquipment(null);
    setEditGrip(null);
    setEditPosition(null);
    setShowEquipmentPicker(false);
    setShowGripPicker(false);
    setShowPositionPicker(false);
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
    setEditEquipment(set.equipmentType || null);
    setEditGrip(set.gripType || null);
    setEditPosition(set.positionType || null);
    setEditWeightUnit(set.weightUnit || 'kg');
    setShowEquipmentPicker(false);
    setShowGripPicker(false);
    setShowPositionPicker(false);
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
    const recordType = getSetRecordType(set.weight, set.reps, set.id, set.time, set.weightUnit);
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
        <span className="inline-block w-12 text-right font-medium text-sm pr-0.5">
          {isBodyweight ? (
            <UserIcon className="w-4 h-4 inline" style={{ color: '#19a655' }} />
          ) : (
            <span style={{ color: getRecordColor() }}>{set.weight}</span>
          )}
        </span>

        {/* Столбец 2: "кг" */}
        <span className="inline-flex w-5 h-7 items-center justify-center text-sm text-zinc-500">
          {!isBodyweight && set.weight > 0 && (set.weightUnit ? WEIGHT_UNITS[set.weightUnit].short : 'кг')}
        </span>

        {/* Столбец 3: "×" / Иконка Clock */}
        <span className="inline-flex w-4 h-7 items-center justify-center text-sm" style={{ color: '#71717a' }}>
          {isTimeOnly ? (
            <ClockIcon className="w-2 h-2" />
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

        {/* Столбец 5: Время (если есть и повторения, и время) */}
        {hasReps && hasTime && (
          <>
            <span className="inline-flex w-4 h-7 items-center justify-center text-sm" style={{ color: '#71717a' }}>
              <ClockIcon className="w-2 h-2" />
            </span>
            <span className="inline-block font-medium text-sm" style={{ color: '#944ad4' }}>
              {formatTime(set.time!)}
            </span>
          </>
        )}
      </div>
    );
  };

  return (
    <>
      <div
        className="rounded-lg overflow-hidden bg-zinc-800 relative"
        style={{
          borderLeftWidth: '4px',
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
          transition: isDragging ? 'none' : undefined,
          willChange: isDragging || shiftDirection ? 'transform' : undefined,
          zIndex: isDragging ? 1000 : shiftDirection ? 1 : undefined,
          opacity: 1,
        }}
      >
        {/* Overlay to block clicks while adding set */}
        {isAddingSet && (
          <div className="absolute inset-0 z-10" onClick={(e) => e.stopPropagation()} />
        )}
        <div className="flex">
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center justify-between gap-2 py-2 pl-2 pr-4" style={{ background: `linear-gradient(to right, ${exerciseColors.border}, transparent) bottom left / 100% 1px no-repeat` }}>
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
                      className="h-7 w-7 hover:bg-zinc-700 active:bg-zinc-700 disabled:opacity-30 text-zinc-500 hover:text-white active:text-white"
                    >
                      <ChevronUpIcon className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onMoveDown?.(exercise.id)}
                      disabled={index === totalExercises - 1}
                      className="h-7 w-7 hover:bg-zinc-700 active:bg-zinc-700 disabled:opacity-30 text-zinc-500 hover:text-white active:text-white"
                    >
                      <ChevronDownIcon className="w-4 h-4" />
                    </Button>
                  </div>
                )}
                
                <div>
                  <ExerciseNameHeader name={exercise.name} />
                </div>
              </div>

              {currentWorkout && (
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    onClick={() => setShowHistory(true)}
                    className="text-zinc-500 hover:text-white active:text-white hover:!bg-transparent dark:hover:!bg-transparent active:!bg-transparent h-7 w-7 p-0"
                    title="История упражнения"
                  >
                    <HistoryIcon className="w-4 h-4" />
                  </Button>

                  {onReplace && (
                    <Button
                      variant="ghost"
                      onClick={() => onReplace(exercise.id, exercise.name)}
                      className="text-zinc-500 hover:text-white active:text-white hover:!bg-transparent dark:hover:!bg-transparent active:!bg-transparent h-7 w-7 p-0"
                      title="Заменить упражнение"
                    >
                      <RefreshCwIcon className="w-4 h-4" />
                    </Button>
                  )}
                  
                  <Button
                    variant="ghost"
                    onClick={() => setShowDeleteExerciseConfirm(true)}
                    className="text-zinc-500 hover:text-red-400 active:text-red-400 hover:!bg-transparent dark:hover:!bg-transparent active:!bg-transparent h-7 w-7 p-0"
                    title="Удалить упражнение"
                  >
                    <Trash2Icon className="w-4 h-4" />
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
                  ref={isHighlighted ? highlightedSetRef : editingSetId === set.id ? editingSetRef : null}
                  className={cn(
                    'flex flex-col relative gap-1',
                    editingSetId === set.id ? 'items-start rounded-lg z-[10000]' : 'items-start',
                    isHighlighted ? 'bg-amber-500/20 rounded-lg ring-1 ring-amber-500/50' : ''
                  )}
                >
                  {/* Первая строка: номер + вес + повторения */}
                  <div className="flex items-center gap-3 pr-7">
                    <div className="relative">
                      <div className={cn(
                        'w-7 h-7 rounded-lg flex items-center justify-center text-xs font-medium shrink-0',
                        set.isWarmup
                          ? 'bg-transparent text-zinc-500 border border-zinc-500'
                          : 'bg-zinc-700 text-zinc-300'
                      )}>
                        {set.isWarmup ? 'Р' : workingSetNumber}
                      </div>
                      
                      {/* Галочка поверх номера при редактировании */}
                      {editingSetId === set.id && (
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUpdateSet(set.id, set);
                          }}
                          className="h-7 w-7 p-0 flex items-center justify-center bg-[#19a655] absolute inset-0"
                        >
                          <CheckIcon className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                    
                    {editingSetId === set.id ? (
                      <div className="flex items-center gap-3 flex-1">
                        {/* Вес и повторения */}
                        {(set.weight > 0 || set.reps > 0) && (
                          <div className="flex items-center gap-3 relative">
                            {set.weight > 0 && (
                              <Input
                                type="number"
                                step="0.5"
                                min="0.1"
                                max="9999"
                                value={editWeight}
                                onChange={(e) => setEditWeight(e.target.value.slice(0, 6))}
                                placeholder={WEIGHT_UNITS[editWeightUnit].placeholder}
                                className="w-12 h-7 bg-zinc-700 border-zinc-600 text-white text-xs text-center md:!text-xs !px-1 !shadow-none focus-visible:!ring-0 placeholder:text-[10px] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              />
                            )}
                            
                            {set.weight > 0 && set.reps > 0 && (
                              <span className="absolute left-1/2 -translate-x-1/2 text-zinc-500 text-xs">×</span>
                            )}
                            
                            {set.reps > 0 && (
                              <Input
                                type="number"
                                min="1"
                                max="999"
                                value={editReps}
                                onChange={(e) => setEditReps(e.target.value.slice(0, 3))}
                                placeholder="повт."
                                className="w-12 h-7 bg-zinc-700 border-zinc-600 text-white text-xs text-center md:!text-xs !px-1 !shadow-none focus-visible:!ring-0 placeholder:text-[10px] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              />
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div
                        onClick={() => startEditingSet(set)}
                        className="flex-1 h-7 flex items-center cursor-pointer hover:bg-zinc-700/30 active:bg-zinc-700/30 px-2 -ml-2 rounded-lg transition-colors"
                      >
                        {renderSetDisplay(set, setIndex)}
                      </div>
                    )}
                  </div>
                  
                  {/* Вторая строка при редактировании: время */}
                  {editingSetId === set.id && set.time && set.time > 0 && (
                    <div className="flex items-center gap-3 pl-10">
                      <div className="flex items-center gap-3 relative">
                        <Input
                          type="number"
                          min="0"
                          max="999"
                          value={editTimeMinutes}
                          onChange={(e) => setEditTimeMinutes(e.target.value.slice(0, 3))}
                          placeholder="мин."
                          className="w-12 h-7 bg-zinc-700 border-zinc-600 text-white text-xs md:!text-xs text-center !px-1 !shadow-none focus-visible:!ring-0 placeholder:text-[10px] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <span className="absolute left-1/2 -translate-x-1/2 text-zinc-500 text-xs">:</span>
                        <Input
                          type="number"
                          min="0"
                          max={59}
                          value={editTimeSeconds}
                          onChange={(e) => setEditTimeSeconds(e.target.value.slice(0, 2))}
                          placeholder="сек."
                          className="w-12 h-7 bg-zinc-700 border-zinc-600 text-white text-xs md:!text-xs text-center !px-1 !shadow-none focus-visible:!ring-0 placeholder:text-[10px] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                      </div>
                    </div>
                  )}
                  
                  {/* Третья и четвёртая строки при редактировании: единица, позиция, снаряд и хват */}
                  {editingSetId === set.id && (
                    <>
                      {/* Единица измерения - первая */}
                      {set.weight > 0 && (
                        <div className="flex items-center gap-1 pl-10">
                          <span className="text-[10px] text-zinc-500 w-14 shrink-0">Единица</span>
                          <button
                            ref={editUnitButtonRef}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!showUnitPicker && editUnitButtonRef.current) {
                                const rect = editUnitButtonRef.current.getBoundingClientRect();
                                const viewportHeight = window.innerHeight;
                                const listHeight = 140;
                                const spaceBelow = viewportHeight - rect.bottom;
                                const spaceAbove = rect.top;
                                const openUpward = spaceBelow < listHeight && spaceAbove > spaceBelow;

                                setPickerPosition({
                                  top: rect.bottom + 2,
                                  bottom: rect.top,
                                  left: rect.left,
                                  width: rect.width,
                                  openUpward
                                });
                              }
                              setShowUnitPicker(!showUnitPicker);
                              setShowEquipmentPicker(false);
                              setShowGripPicker(false);
                              setShowPositionPicker(false);
                            }}
                            className={cn(
                              'flex items-center justify-between gap-1 px-2 py-1.5 rounded-lg transition-colors text-xs w-[160px]',
                              showUnitPicker ? 'bg-zinc-700 text-zinc-300' : 'bg-zinc-700/50 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-300'
                            )}
                          >
                            <span className="truncate overflow-hidden">{WEIGHT_UNITS[editWeightUnit].full}</span>
                            <ChevronDownIcon className={cn(
                              'w-3 h-3 transition-transform shrink-0',
                              showUnitPicker && 'rotate-180'
                            )} />
                          </button>
                        </div>
                      )}

                      {/* Позиция */}
                      <div className="flex items-center gap-1 pl-10">
                        <span className="text-[10px] text-zinc-500 w-14 shrink-0">Позиция</span>
                        <button
                          ref={editPositionButtonRef}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!showPositionPicker && editPositionButtonRef.current) {
                              const rect = editPositionButtonRef.current.getBoundingClientRect();
                              const viewportHeight = window.innerHeight;
                              const listHeight = 200;
                              const spaceBelow = viewportHeight - rect.bottom;
                              const spaceAbove = rect.top;
                              const openUpward = spaceBelow < listHeight && spaceAbove > spaceBelow;

                              setPickerPosition({
                                top: rect.bottom + 2,
                                bottom: rect.top,
                                left: rect.left,
                                width: rect.width,
                                openUpward
                              });
                            }
                            setShowPositionPicker(!showPositionPicker);
                            setShowEquipmentPicker(false);
                            setShowGripPicker(false);
                            setShowUnitPicker(false);
                          }}
                          className={cn(
                            'flex items-center justify-between gap-1 px-2 py-1.5 rounded-lg transition-colors text-xs w-[160px]',
                            showPositionPicker ? 'bg-zinc-700 text-zinc-300' : 'bg-zinc-700/50 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-300'
                          )}
                        >
                          <span className="truncate overflow-hidden">{editPosition ? POSITION_TYPES[editPosition].full : 'Не выбрана'}</span>
                          <ChevronDownIcon className={cn(
                            'w-3 h-3 transition-transform shrink-0',
                            showPositionPicker && 'rotate-180'
                          )} />
                        </button>
                      </div>

                      {/* Снаряд */}
                      {set.weight > 0 && (
                        <div className="flex items-center gap-1 pl-10">
                          <span className="text-[10px] text-zinc-500 w-14 shrink-0">Снаряд</span>
                          <button
                            ref={editEquipmentButtonRef}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!showEquipmentPicker && editEquipmentButtonRef.current) {
                                const rect = editEquipmentButtonRef.current.getBoundingClientRect();
                                const viewportHeight = window.innerHeight;
                                const listHeight = 320;
                                const spaceBelow = viewportHeight - rect.bottom;
                                const spaceAbove = rect.top;
                                const openUpward = spaceBelow < listHeight && spaceAbove > spaceBelow;

                                setPickerPosition({
                                  top: rect.bottom + 2,
                                  bottom: rect.top,
                                  left: rect.left,
                                  width: rect.width,
                                  openUpward
                                });
                              }
                              setShowEquipmentPicker(!showEquipmentPicker);
                              setShowGripPicker(false);
                              setShowPositionPicker(false);
                              setShowUnitPicker(false);
                            }}
                            className={cn(
                              'flex items-center justify-between gap-1 px-2 py-1.5 rounded-lg transition-colors text-xs w-[160px]',
                              showEquipmentPicker ? 'bg-zinc-700 text-zinc-300' : 'bg-zinc-700/50 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-300'
                            )}
                          >
                            <span className="truncate overflow-hidden">{editEquipment ? EQUIPMENT_TYPES[editEquipment].full : 'Не выбран'}</span>
                            <ChevronDownIcon className={cn(
                              'w-3 h-3 transition-transform shrink-0',
                              showEquipmentPicker && 'rotate-180'
                            )} />
                          </button>
                        </div>
                      )}

                      {/* Тип хвата */}
                      {set.reps > 0 && (
                        <div className="flex items-center gap-1 pl-10">
                          <span className="text-[10px] text-zinc-500 w-14 shrink-0">Тип хвата</span>
                          <button
                            ref={editGripButtonRef}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!showGripPicker && editGripButtonRef.current) {
                                const rect = editGripButtonRef.current.getBoundingClientRect();
                                const viewportHeight = window.innerHeight;
                                const listHeight = 200;
                                const spaceBelow = viewportHeight - rect.bottom;
                                const spaceAbove = rect.top;
                                const openUpward = spaceBelow < listHeight && spaceAbove > spaceBelow;

                                setPickerPosition({
                                  top: rect.bottom + 2,
                                  bottom: rect.top,
                                  left: rect.left,
                                  width: rect.width,
                                  openUpward
                                });
                              }
                              setShowGripPicker(!showGripPicker);
                              setShowEquipmentPicker(false);
                              setShowPositionPicker(false);
                              setShowUnitPicker(false);
                            }}
                            className={cn(
                              'flex items-center justify-between gap-1 px-2 py-1.5 rounded-lg transition-colors text-xs w-[160px]',
                              showGripPicker ? 'bg-zinc-700 text-zinc-300' : 'bg-zinc-700/50 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-300'
                            )}
                          >
                            <span className="truncate overflow-hidden">{editGrip ? GRIP_TYPES[editGrip].full : 'Не выбран'}</span>
                            <ChevronDownIcon className={cn(
                              'w-3 h-3 transition-transform shrink-0',
                              showGripPicker && 'rotate-180'
                            )} />
                          </button>
                        </div>
                      )}
                    </>
                  )}
                  
                  {/* Теги при просмотре */}
                  {editingSetId !== set.id && (set.positionType || set.equipmentType || set.gripType) && (
                    <div className="flex items-center gap-1 justify-end pr-11 w-full">
                      {set.positionType && (
                        <div className="h-5 min-w-[44px] px-1 rounded-lg text-[11px] font-medium flex items-center justify-center text-white whitespace-nowrap bg-zinc-700">
                          {POSITION_TYPES[set.positionType].short}
                        </div>
                      )}
                      {set.equipmentType && (
                        <div className="h-5 min-w-[44px] px-1 rounded-lg text-[11px] font-medium flex items-center justify-center text-white whitespace-nowrap bg-zinc-700">
                          {EQUIPMENT_TYPES[set.equipmentType].short}
                        </div>
                      )}
                      {set.gripType && (
                        <div className="h-5 min-w-[44px] px-1 rounded-lg text-[11px] font-medium flex items-center justify-center text-white whitespace-nowrap bg-zinc-700">
                          {GRIP_TYPES[set.gripType].short}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Кнопка удалить - всегда в правом столбце */}
                  <Button
                    variant="ghost"
                    onClick={() => handleRemoveSet(set.id)}
                    className="text-zinc-500 hover:text-red-400 active:text-red-400 hover:!bg-transparent dark:hover:!bg-transparent active:!bg-transparent h-7 w-7 shrink-0 p-0 absolute right-0"
                  >
                    <Trash2Icon className="w-4 h-4" />
                  </Button>
                  
                  {/* X поверх удалить при редактировании */}
                  {editingSetId === set.id && (
                    <Button
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingSetId(null);
                      }}
                      className="text-zinc-500 hover:text-white active:text-white hover:!bg-zinc-800 active:!bg-zinc-800 h-7 w-7 shrink-0 p-0 absolute right-0 bg-zinc-800 rounded-lg z-10"
                    >
                      <XIcon className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              );})}
              </div>

              {/* Overlay to block clicks while adding or editing set */}
              {(isAddingSet || editingSetId) && (
                <div className="fixed inset-0 z-[9999] bg-black/50" onClick={(e) => e.stopPropagation()} />
              )}
              {isAddingSet ? (
                <div ref={addingSetRef} className="pt-4 relative z-[10000]">
                  {/* Toggle tags */}
                  <div className="flex gap-2 flex-wrap items-center mb-2">
                    {!exercise.sets.some(s => s.isWarmup) && (
                      <div
                        onClick={() => setIsWarmup(!isWarmup)}
                        className={cn(
                          'flex items-center gap-1 px-2 py-1 rounded-lg cursor-pointer transition-colors',
                          isWarmup ? '' : 'bg-zinc-700/50'
                        )}
                        style={isWarmup ? { backgroundColor: '#734200' } : undefined}
                      >
                        <ZapIcon className="w-3 h-3" style={{ color: isWarmup ? '#ffb900' : '#a1a1aa' }} />
                        <span className="text-[9px]" style={{ color: isWarmup ? '#ffb900' : '#d4d4d8' }}>Разм.</span>
                      </div>
                    )}

                    <div
                      onClick={() => setUseBodyweight(!useBodyweight)}
                      className={cn(
                        'flex items-center gap-1 px-2 py-1 rounded-lg cursor-pointer transition-colors',
                        useBodyweight ? '' : 'bg-zinc-700/50'
                      )}
                      style={useBodyweight ? { backgroundColor: '#072f18' } : undefined}
                    >
                      <UserIcon className="w-3 h-3" style={{ color: useBodyweight ? '#19a655' : '#a1a1aa' }} />
                      <span className="text-[9px]" style={{ color: useBodyweight ? '#19a655' : '#d4d4d8' }}>Собст. вес</span>
                    </div>

                    <div
                      onClick={() => setUseReps(!useReps)}
                      className={cn(
                        'flex items-center gap-1 px-2 py-1 rounded-lg cursor-pointer transition-colors',
                        useReps ? '' : 'bg-zinc-700/50'
                      )}
                      style={useReps ? { backgroundColor: '#391013' } : undefined}
                    >
                      <Repeat2Icon className="w-3 h-3" style={{ color: useReps ? '#c93843' : '#a1a1aa' }} />
                      <span className="text-[9px]" style={{ color: useReps ? '#c93843' : '#d4d4d8' }}>Повт.</span>
                    </div>

                    <div
                      onClick={() => setUseTime(!useTime)}
                      className={cn(
                        'flex items-center gap-1 px-2 py-1 rounded-lg cursor-pointer transition-colors',
                        useTime ? '' : 'bg-zinc-700/50'
                      )}
                      style={useTime ? { backgroundColor: '#2a153c' } : undefined}
                    >
                      <ClockIcon className="w-3 h-3" style={{ color: useTime ? '#944ad4' : '#a1a1aa' }} />
                      <span className="text-[9px]" style={{ color: useTime ? '#944ad4' : '#d4d4d8' }}>Вр.</span>
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
                            max="9999"
                            value={newWeight}
                            onChange={(e) => setNewWeight(e.target.value.slice(0, 6))}
                            placeholder={WEIGHT_UNITS[selectedWeightUnit].placeholder}
                            className="w-14 h-7 bg-zinc-700 border-zinc-600 text-white text-xs text-center md:!text-xs !px-1 !shadow-none focus-visible:!ring-0 placeholder:text-[10px] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                        )}

                        {!useBodyweight && useReps && (
                          <span className="absolute left-1/2 -translate-x-1/2 text-zinc-500 text-xs">×</span>
                        )}

                        {useReps && (
                          <Input
                            type="number"
                            min="1"
                            max="999"
                            value={newReps}
                            onChange={(e) => setNewReps(e.target.value.slice(0, 3))}
                            placeholder="повт."
                            className="w-14 h-7 bg-zinc-700 border-zinc-600 text-white text-xs text-center md:!text-xs !px-1 !shadow-none focus-visible:!ring-0 placeholder:text-[10px] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                        )}
                      </div>
                    )}

                    {useTime && (
                      <div className="flex items-center gap-3 relative">
                        <Input
                          type="number"
                          min="0"
                          max="999"
                          value={newTimeMinutes}
                          onChange={(e) => setNewTimeMinutes(e.target.value.slice(0, 3))}
                          placeholder="мин."
                          className="w-14 h-7 bg-zinc-700 border-zinc-600 text-white text-xs md:!text-xs text-center !px-1 !shadow-none focus-visible:!ring-0 placeholder:text-[10px] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <span className="absolute left-1/2 -translate-x-1/2 text-zinc-500 text-xs">:</span>
                        <Input
                          type="number"
                          min="0"
                          max={59}
                          value={newTimeSeconds}
                          onChange={(e) => setNewTimeSeconds(e.target.value.slice(0, 2))}
                          placeholder="сек."
                          className="w-14 h-7 bg-zinc-700 border-zinc-600 text-white text-xs md:!text-xs text-center !px-1 !shadow-none focus-visible:!ring-0 placeholder:text-[10px] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                      </div>
                    )}
                  </div>

                  {/* Previous values hint */}
                  {(() => {
                    const prevData = isWarmup ? prevWarmupSetData : prevWorkingSetData;
                    if (!prevData) return null;

                    const prevUnit = prevData.weightUnit || 'kg';

                    return (
                      <div className="flex items-center text-[10px] text-zinc-500 -ml-9 gap-2 mb-2">
                        <div className="w-7 text-center">Было</div>
                        {(!useBodyweight || useReps) && (
                          <div className="flex items-center gap-3 relative">
                            {!useBodyweight && (
                              <div className="w-14 text-center">
                                {prevData.isBodyweight ? (
                                  <span>Собст. вес</span>
                                ) : prevData.weight > 0 ? (
                                  <span>{prevData.weight} {WEIGHT_UNITS[prevUnit].short}</span>
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

                  {/* Единица измерения - первая строка */}
                  {!useBodyweight && (
                    <div className="flex items-center gap-2 mb-2 -ml-9 pl-9">
                      <span className="text-[10px] text-zinc-500 w-[60px] shrink-0">Единица</span>
                      <button
                        ref={unitButtonRef}
                        type="button"
                        onClick={() => {
                          if (!showUnitPicker && unitButtonRef.current) {
                            const rect = unitButtonRef.current.getBoundingClientRect();
                            const viewportHeight = window.innerHeight;
                            const listHeight = 140;
                            const spaceBelow = viewportHeight - rect.bottom;
                            const spaceAbove = rect.top;
                            const openUpward = spaceBelow < listHeight && spaceAbove > spaceBelow;

                            setPickerPosition({
                              top: rect.bottom + 2,
                              bottom: rect.top,
                              left: rect.left,
                              width: rect.width,
                              openUpward
                            });
                          }
                          setShowUnitPicker(!showUnitPicker);
                          setShowEquipmentPicker(false);
                          setShowGripPicker(false);
                          setShowPositionPicker(false);
                        }}
                        className={cn(
                          'flex items-center justify-between gap-1 px-2 py-1.5 rounded-lg transition-colors text-xs w-[160px]',
                          showUnitPicker ? 'bg-zinc-700 text-zinc-300' : 'bg-zinc-700/50 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-300'
                        )}
                      >
                        <span className="truncate overflow-hidden">{WEIGHT_UNITS[selectedWeightUnit].full}</span>
                        <ChevronDownIcon className={cn(
                          'w-3 h-3 transition-transform shrink-0',
                          showUnitPicker && 'rotate-180'
                        )} />
                      </button>
                    </div>
                  )}

                  {/* Position selection */}
                  <div className="flex items-center gap-2 mb-2 -ml-9 pl-9">
                    <span className="text-[10px] text-zinc-500 w-[60px] shrink-0">Позиция</span>
                    <button
                      ref={positionButtonRef}
                      type="button"
                      onClick={() => {
                        if (!showPositionPicker && positionButtonRef.current) {
                          const rect = positionButtonRef.current.getBoundingClientRect();
                          const viewportHeight = window.innerHeight;
                          const listHeight = 200;
                          const spaceBelow = viewportHeight - rect.bottom;
                          const spaceAbove = rect.top;
                          const openUpward = spaceBelow < listHeight && spaceAbove > spaceBelow;

                          setPickerPosition({
                            top: rect.bottom + 2,
                            bottom: rect.top,
                            left: rect.left,
                            width: rect.width,
                            openUpward
                          });
                        }
                        setShowPositionPicker(!showPositionPicker);
                        setShowEquipmentPicker(false);
                        setShowGripPicker(false);
                        setShowUnitPicker(false);
                      }}
                      className={cn(
                        'flex items-center justify-between gap-1 px-2 py-1.5 rounded-lg transition-colors text-xs w-[160px]',
                        showPositionPicker ? 'bg-zinc-700 text-zinc-300' : 'bg-zinc-700/50 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-300'
                      )}
                    >
                      <span className="truncate overflow-hidden">{selectedPosition ? POSITION_TYPES[selectedPosition].full : 'Не выбрана'}</span>
                      <ChevronDownIcon className={cn(
                        'w-3 h-3 transition-transform shrink-0',
                        showPositionPicker && 'rotate-180'
                      )} />
                    </button>
                  </div>

                  {/* Equipment selection */}
                  {!useBodyweight && (
                    <div className="flex items-center gap-2 mb-2 -ml-9 pl-9">
                      <span className="text-[10px] text-zinc-500 w-[60px] shrink-0">Снаряд</span>
                      <button
                        ref={equipmentButtonRef}
                        type="button"
                        onClick={() => {
                          if (!showEquipmentPicker && equipmentButtonRef.current) {
                            const rect = equipmentButtonRef.current.getBoundingClientRect();
                            const viewportHeight = window.innerHeight;
                            const listHeight = 320;
                            const spaceBelow = viewportHeight - rect.bottom;
                            const spaceAbove = rect.top;
                            const openUpward = spaceBelow < listHeight && spaceAbove > spaceBelow;

                            setPickerPosition({
                              top: rect.bottom + 2,
                              bottom: rect.top,
                              left: rect.left,
                              width: rect.width,
                              openUpward
                            });
                          }
                          setShowEquipmentPicker(!showEquipmentPicker);
                          setShowGripPicker(false);
                          setShowUnitPicker(false);
                          setShowPositionPicker(false);
                        }}
                        className={cn(
                          'flex items-center justify-between gap-1 px-2 py-1.5 rounded-lg transition-colors text-xs w-[160px]',
                          showEquipmentPicker ? 'bg-zinc-700 text-zinc-300' : 'bg-zinc-700/50 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-300'
                        )}
                      >
                        <span className="truncate overflow-hidden">{selectedEquipment ? EQUIPMENT_TYPES[selectedEquipment].full : 'Не выбран'}</span>
                        <ChevronDownIcon className={cn(
                          'w-3 h-3 transition-transform shrink-0',
                          showEquipmentPicker && 'rotate-180'
                        )} />
                      </button>
                    </div>
                  )}

                  {/* Grip selection */}
                  <div className="flex items-center gap-2 mb-2 -ml-9 pl-9">
                    <span className="text-[10px] text-zinc-500 w-[60px] shrink-0">Тип хвата</span>
                    <button
                      ref={gripButtonRef}
                      type="button"
                      onClick={() => {
                        if (!showGripPicker && gripButtonRef.current) {
                          const rect = gripButtonRef.current.getBoundingClientRect();
                          const viewportHeight = window.innerHeight;
                          const listHeight = 200; // 6 пунктов легко влезают без прокрутки
                          const spaceBelow = viewportHeight - rect.bottom;
                          const spaceAbove = rect.top;
                          const openUpward = spaceBelow < listHeight && spaceAbove > spaceBelow;
                          
                          setPickerPosition({ 
                            top: rect.bottom + 2,
                            bottom: rect.top,
                            left: rect.left, 
                            width: rect.width,
                            openUpward
                          });
                        }
                        setShowGripPicker(!showGripPicker);
                        setShowEquipmentPicker(false);
                        setShowUnitPicker(false);
                      }}
                      className={cn(
                        'flex items-center justify-between gap-1 px-2 py-1.5 rounded-lg transition-colors text-xs w-[160px]',
                        showGripPicker ? 'bg-zinc-700 text-zinc-300' : 'bg-zinc-700/50 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-300'
                      )}
                    >
                      <span className="truncate overflow-hidden">{selectedGrip ? GRIP_TYPES[selectedGrip].full : 'Не выбран'}</span>
                      <ChevronDownIcon className={cn(
                        'w-3 h-3 transition-transform shrink-0',
                        showGripPicker && 'rotate-180'
                      )} />
                    </button>
                  </div>

                  {/* Buttons */}
                  <div className="flex justify-end items-center gap-2 pt-4">
                    <Button
                      onClick={() => {
                        setIsAddingSet(false);
                        setNewReps('');
                        setNewWeight('');
                        setNewTimeMinutes('');
                        setNewTimeSeconds('');
                        setUseBodyweight(false);
                        setUseReps(true);
                        setIsWarmup(false);
                        setSelectedEquipment(null);
                        setSelectedGrip(null);
                        setShowEquipmentPicker(false);
                        setShowGripPicker(false);
                      }}
                      className="bg-zinc-700 text-zinc-300 border-0 hover:bg-zinc-700 hover:text-zinc-300 active:bg-zinc-700 active:text-zinc-300 retro-large-text"
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
                      style={{ backgroundColor: '#19a655' }}
                      className="retro-large-text"
                    >
                      Добавить
                    </Button>
                  </div>
                </div>
              ) : (
                <div className={cn("flex items-center justify-between", exercise.sets.length > 0 && "mt-4")}>
                  {currentWorkout && (
                    <>
                      <Button
                        variant="ghost"
                        onClick={() => onSupersetButtonTap?.(exercise.id)}
                        className={cn(
                          "w-7 h-7 p-0 shrink-0 -ml-9",
                          exercise.supersetId
                            ? "hover:!bg-transparent dark:hover:!bg-transparent active:!bg-transparent"
                            : "text-zinc-500 hover:text-white active:text-white hover:!bg-transparent dark:hover:!bg-transparent active:!bg-transparent"
                        )}
                        style={exercise.supersetId && supersetChainColor ? { color: supersetChainColor } : undefined}
                        title={exercise.supersetId ? "Убрать из суперсета" : "Создать суперсет"}
                      >
                        {exercise.supersetId ? <LinkOnIcon className="w-4 h-4" /> : <LinkOffIcon className="w-4 h-4" />}
                      </Button>
                      {supersetLabel && (
                        <span className="text-xs font-medium whitespace-nowrap ml-1" style={{ color: supersetChainColor || '#f59e0b' }}>
                          {supersetLabel}
                        </span>
                      )}
                    </>
                  )}
                  <Button
                    onClick={handleStartAddingSet}
                    style={{ backgroundColor: '#19a655' }}
                    className="retro-large-text"
                  >
                    Добавить подход
                  </Button>
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
            Упражнение <strong className="text-white">"{exercise.name}"</strong> и все его подходы на текущей дате будут удалены.<br />
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
                    <strong className="text-white">Разминочный</strong> подход упражнения <strong className="text-white">"{exercise.name}"</strong> на текущей дате будет удалён.<br />
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
                  Подход <strong className="text-white">#{workingSetNumber}</strong> упражнения <strong className="text-white">"{exercise.name}"</strong> на текущей дате будет удалён.<br />
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

      {/* Exercise statistics modal */}
      <Dialog open={showStats} onOpenChange={setShowStats}>
        <DialogContent 
          className="bg-zinc-900 border !p-0 !gap-0 max-w-[95vw]"
          style={{ borderColor: exerciseColors.border }}
          showCloseButton={false}
        >
          <div className="flex items-center justify-between px-4 pt-4">
            <DialogTitle className="text-white font-medium text-base">Динамика весов упражнения</DialogTitle>
            <button
              type="button"
              onClick={() => setShowStats(false)}
              className="text-zinc-500 hover:text-white active:text-white transition-colors p-1"
              data-slot="dialog-close"
            >
              <XIcon className="w-5 h-5" />
            </button>
          </div>
          
          <div className="p-4">
            {exerciseHistory.length > 0 ? (
              <ExerciseStatsChart 
                data={exerciseHistory} 
                color={exerciseColors.border}
                textColor={exerciseColors.text}
                currentWorkoutId={workoutId}
                exerciseName={exercise.name}
                currentUnit={(() => {
                  // Берём единицу из последнего рабочего подхода
                  const lastWorkingSet = [...exercise.sets].reverse().find(s => !s.isWarmup && s.weight > 0);
                  return lastWorkingSet?.weightUnit || 'kg';
                })()}
                onNavigateToDate={(date, exerciseName, setId) => {
                  setShowStats(false);
                  // Открываем мини-карточку без свайпа, с подсветкой подхода
                  setHistoryFromDate(date);
                  setHistoryHighlightSetId(setId);
                  setShowHistoryFromStats(true);
                }}
              />
            ) : (
              <div className="text-center py-8 text-zinc-500">
                Нет данных для отображения
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Portal for dropdown pickers - rendered at top level for both add and edit modes */}
      {(showEquipmentPicker || showGripPicker || showPositionPicker || showUnitPicker) && createPortal(
        <>
          <div
            className="fixed inset-0 z-[10000]"
            onClick={() => {
              setShowEquipmentPicker(false);
              setShowGripPicker(false);
              setShowPositionPicker(false);
              setShowUnitPicker(false);
            }}
          />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={cn(
              "fixed bg-zinc-800 rounded-lg border border-zinc-700 shadow-xl z-[10001]",
              showEquipmentPicker ? "max-h-[320px] overflow-y-auto" : "overflow-hidden"
            )}
            style={{
              top: pickerPosition.openUpward ? pickerPosition.bottom : pickerPosition.top,
              left: pickerPosition.left,
              minWidth: Math.max(pickerPosition.width, 160),
              transform: pickerPosition.openUpward ? 'translateY(-100%) translateY(-2px)' : undefined
            }}
          >
            <div className="flex flex-col gap-1 p-2">
              {showUnitPicker ? (
                <>
                  {(Object.keys(WEIGHT_UNITS) as WeightUnit[]).map((unit) => {
                    const currentUnit = editingSetId ? editWeightUnit : selectedWeightUnit;
                    return (
                      <button
                        key={unit}
                        type="button"
                        onClick={() => {
                          if (editingSetId) {
                            setEditWeightUnit(unit);
                          } else {
                            setSelectedWeightUnit(unit);
                          }
                          setShowUnitPicker(false);
                        }}
                        className="px-3 py-1.5 text-xs rounded-lg transition-colors text-left text-zinc-300 hover:bg-zinc-700"
                        style={currentUnit === unit ? {
                          backgroundColor: '#3f3f46',
                          color: '#fff'
                        } : undefined}
                      >
                        {WEIGHT_UNITS[unit].full}
                      </button>
                    );
                  })}
                </>
              ) : showPositionPicker ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      if (editingSetId) {
                        setEditPosition(null);
                      } else {
                        setSelectedPosition(null);
                      }
                      setShowPositionPicker(false);
                    }}
                    className="px-3 py-1.5 text-xs rounded-lg transition-colors text-left text-zinc-300 hover:bg-zinc-700"
                  >
                    Не выбрана
                  </button>
                  {(Object.keys(POSITION_TYPES) as PositionType[]).map((type) => {
                    const currentPosition = editingSetId ? editPosition : selectedPosition;
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => {
                          if (editingSetId) {
                            setEditPosition(type);
                          } else {
                            setSelectedPosition(type);
                          }
                          setShowPositionPicker(false);
                        }}
                        className="px-3 py-1.5 text-xs rounded-lg transition-colors text-left text-zinc-300 hover:bg-zinc-700"
                        style={currentPosition === type ? {
                          backgroundColor: '#3f3f46',
                          color: '#fff'
                        } : undefined}
                      >
                        {POSITION_TYPES[type].full}
                      </button>
                    );
                  })}
                </>
              ) : showEquipmentPicker ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      if (editingSetId) {
                        setEditEquipment(null);
                      } else {
                        setSelectedEquipment(null);
                      }
                      setShowEquipmentPicker(false);
                    }}
                    className="px-3 py-1.5 text-xs rounded-lg transition-colors text-left text-zinc-300 hover:bg-zinc-700"
                  >
                    Не выбран
                  </button>
                  {(Object.keys(EQUIPMENT_TYPES) as EquipmentType[]).map((type) => {
                    const currentEquipment = editingSetId ? editEquipment : selectedEquipment;
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => {
                          if (editingSetId) {
                            setEditEquipment(type);
                          } else {
                            setSelectedEquipment(type);
                          }
                          setShowEquipmentPicker(false);
                        }}
                        className="px-3 py-1.5 text-xs rounded-lg transition-colors text-left text-zinc-300 hover:bg-zinc-700"
                        style={currentEquipment === type ? {
                          backgroundColor: '#3f3f46',
                          color: '#fff'
                        } : undefined}
                      >
                        {EQUIPMENT_TYPES[type].full}
                      </button>
                    );
                  })}
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      if (editingSetId) {
                        setEditGrip(null);
                      } else {
                        setSelectedGrip(null);
                      }
                      setShowGripPicker(false);
                    }}
                    className="px-3 py-1.5 text-xs rounded-lg transition-colors text-left text-zinc-300 hover:bg-zinc-700"
                  >
                    Не выбран
                  </button>
                  {(Object.keys(GRIP_TYPES) as GripType[]).map((type) => {
                    const currentGrip = editingSetId ? editGrip : selectedGrip;
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => {
                          if (editingSetId) {
                            setEditGrip(type);
                          } else {
                            setSelectedGrip(type);
                          }
                          setShowGripPicker(false);
                        }}
                        className="px-3 py-1.5 text-xs rounded-lg transition-colors text-left text-zinc-300 hover:bg-zinc-700"
                        style={currentGrip === type ? {
                          backgroundColor: '#3f3f46',
                          color: '#fff'
                        } : undefined}
                      >
                        {GRIP_TYPES[type].full}
                      </button>
                    );
                  })}
                </>
              )}
            </div>
          </motion.div>
        </>,
        document.body
      )}

      {/* Exercise history modal */}
      <ExerciseHistoryModal
        open={showHistory}
        onOpenChange={setShowHistory}
        exerciseName={exercise.name}
        enableSwipe={true}
        onNavigateToDate={(date, exerciseName) => {
          setShowHistory(false);
          setSelectedDate(date);
          // Подсветить первый подход упражнения после навигации
          setTimeout(() => {
            const exerciseInWorkout = useFitnessStore.getState().currentWorkout?.exercises.find(e => e.name === exerciseName);
            if (exerciseInWorkout && exerciseInWorkout.sets.length > 0 && onHighlightSet) {
              onHighlightSet(exerciseName, exerciseInWorkout.sets[0].id);
            }
          }, 300);
        }}
      />

      {/* Exercise history modal from stats (no swipe, with highlight) */}
      <ExerciseHistoryModal
        open={showHistoryFromStats}
        onOpenChange={setShowHistoryFromStats}
        exerciseName={exercise.name}
        initialDate={historyFromDate}
        highlightSetId={historyHighlightSetId}
        enableSwipe={false}
        onNavigateToDate={(date, exerciseName) => {
          setShowHistoryFromStats(false);
          setSelectedDate(date);
          // Подсветить первый подход упражнения после навигации
          setTimeout(() => {
            const exerciseInWorkout = useFitnessStore.getState().currentWorkout?.exercises.find(e => e.name === exerciseName);
            if (exerciseInWorkout && exerciseInWorkout.sets.length > 0 && onHighlightSet) {
              onHighlightSet(exerciseName, exerciseInWorkout.sets[0].id);
            }
          }, 300);
        }}
      />
    </>
  );
}
