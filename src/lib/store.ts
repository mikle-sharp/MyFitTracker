import { create } from 'zustand';
import { Workout, WorkoutType, WorkoutSet, Exercise, ExerciseType, EquipmentType, GripType, PositionType, WorkoutTemplate, WeightUnit } from './types';
import * as storage from './storage';

interface FitnessStore {
  // Состояние
  workouts: Workout[];
  selectedDate: string;
  currentWorkout: Workout | null;
  isInitialized: boolean;

  // Действия
  init: () => Promise<void>;
  setSelectedDate: (date: string) => void;
  loadWorkoutForDate: (date: string) => void;
  clearSelection: () => void;
  createWorkout: (date: string, type: WorkoutType) => Workout;
  updateWorkout: (workout: Workout) => void;
  updateWorkoutNotes: (workoutId: string, notes: string) => void;
  updateWorkoutWeight: (workoutId: string, weight: number | undefined) => void;
  deleteWorkout: (id: string) => void;
  addExercise: (workoutId: string, name: string, exerciseType?: ExerciseType) => Exercise | null;
  replaceExercise: (workoutId: string, oldExerciseId: string, newName: string, exerciseType?: ExerciseType) => Exercise | null;
  removeExercise: (workoutId: string, exerciseId: string) => void;
  moveExerciseUp: (workoutId: string, exerciseId: string) => void;
  moveExerciseDown: (workoutId: string, exerciseId: string) => void;
  addSet: (workoutId: string, exerciseId: string, reps: number, weight: number, time?: number, isWarmup?: boolean, equipmentType?: EquipmentType, gripType?: GripType, positionType?: PositionType, weightUnit?: WeightUnit) => WorkoutSet | null;
  updateSet: (workoutId: string, exerciseId: string, setId: string, reps: number, weight: number, time?: number, equipmentType?: EquipmentType, gripType?: GripType, positionType?: PositionType, weightUnit?: WeightUnit) => void;
  removeSet: (workoutId: string, exerciseId: string, setId: string) => void;
  refreshWorkouts: () => void;
  importData: (data: string, format: 'json' | 'csv') => { success: boolean; message: string };
  // Шаблоны
  getTemplates: (workoutType: WorkoutType) => WorkoutTemplate[];
  saveTemplate: (name: string, workoutType: WorkoutType, exerciseNames: string[]) => void;
  loadTemplate: (workoutId: string, templateId: string) => Workout | null;
  deleteTemplate: (templateId: string) => void;
  // Удаление упражнения из предустановок
  deleteExerciseFromPresets: (exerciseName: string) => void;
}

// Получить сегодняшнюю дату в формате YYYY-MM-DD
const getTodayDate = (): string => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

// Helper для обновления состояния после изменений в тренировке
const updateWorkoutState = (
  set: (partial: Partial<FitnessStore>) => void,
  workoutId?: string
) => {
  const workouts = storage.getWorkouts();
  const currentWorkout = workoutId 
    ? workouts.find(w => w.id === workoutId) || null 
    : null;
  set({ workouts, currentWorkout });
};

export const useFitnessStore = create<FitnessStore>((set, get) => ({
  // Начальное состояние
  workouts: [],
  selectedDate: getTodayDate(),
  currentWorkout: null,
  isInitialized: false,

  // Инициализация
  init: async () => {
    // Сначала инициализируем базу упражнений из файла
    await storage.initExercisesBaseFromServer();
    
    // Инициализируем базовые шаблоны
    storage.initDefaultTemplates();
    
    const workouts = storage.getWorkouts();
    const today = getTodayDate();
    const currentWorkout = storage.getWorkoutByDate(today);
    set({
      workouts,
      currentWorkout,
      selectedDate: today,
      isInitialized: true,
    });
  },

  // Установка выбранной даты
  setSelectedDate: (date: string) => {
    const currentWorkout = storage.getWorkoutByDate(date);
    set({ selectedDate: date, currentWorkout });
  },

  // Загрузка тренировки для даты
  loadWorkoutForDate: (date: string) => {
    const currentWorkout = storage.getWorkoutByDate(date);
    set({ currentWorkout, selectedDate: date });
  },

  // Очистка выделения
  clearSelection: () => {
    set({ selectedDate: '', currentWorkout: null });
  },

  // Создание тренировки
  createWorkout: (date: string, type: WorkoutType) => {
    const workout = storage.createWorkout(date, type);
    const workouts = storage.getWorkouts();
    set({ workouts, currentWorkout: workout });
    return workout;
  },

  // Обновление тренировки
  updateWorkout: (workout: Workout) => {
    storage.updateWorkout(workout);
    const workouts = storage.getWorkouts();
    set({ workouts, currentWorkout: workout });
  },

  // Удаление тренировки
  deleteWorkout: (id: string) => {
    storage.deleteWorkout(id);
    const workouts = storage.getWorkouts();
    set({ workouts, currentWorkout: null });
  },

  // Обновление заметок к тренировке
  updateWorkoutNotes: (workoutId: string, notes: string) => {
    storage.updateWorkoutNotes(workoutId, notes);
    updateWorkoutState(set, workoutId);
  },

  // Обновление веса пользователя в тренировке
  updateWorkoutWeight: (workoutId: string, weight: number | undefined) => {
    storage.updateWorkoutWeight(workoutId, weight);
    updateWorkoutState(set, workoutId);
  },

  // Добавление упражнения
  addExercise: (workoutId: string, name: string, exerciseType?: ExerciseType) => {
    const exercise = storage.addExerciseToWorkout(workoutId, name, exerciseType);
    if (exercise) {
      updateWorkoutState(set, workoutId);
    }
    return exercise;
  },

  // Замена упражнения (сохраняет позицию)
  replaceExercise: (workoutId: string, oldExerciseId: string, newName: string, exerciseType?: ExerciseType) => {
    const exercise = storage.replaceExerciseInWorkout(workoutId, oldExerciseId, newName, exerciseType);
    if (exercise) {
      updateWorkoutState(set, workoutId);
    }
    return exercise;
  },

  // Удаление упражнения
  removeExercise: (workoutId: string, exerciseId: string) => {
    storage.removeExerciseFromWorkout(workoutId, exerciseId);
    updateWorkoutState(set, workoutId);
  },

  // Перемещение упражнения вверх
  moveExerciseUp: (workoutId: string, exerciseId: string) => {
    storage.moveExerciseUp(workoutId, exerciseId);
    updateWorkoutState(set, workoutId);
  },

  // Перемещение упражнения вниз
  moveExerciseDown: (workoutId: string, exerciseId: string) => {
    storage.moveExerciseDown(workoutId, exerciseId);
    updateWorkoutState(set, workoutId);
  },

  // Добавление подхода
  addSet: (workoutId: string, exerciseId: string, reps: number, weight: number, time?: number, isWarmup?: boolean, equipmentType?: EquipmentType, gripType?: GripType, positionType?: PositionType, weightUnit?: WeightUnit) => {
    const workoutSet = storage.addSetToExercise(workoutId, exerciseId, reps, weight, time, isWarmup, equipmentType, gripType, positionType, weightUnit);
    if (workoutSet) {
      updateWorkoutState(set, workoutId);
    }
    return workoutSet;
  },

  // Обновление подхода
  updateSet: (workoutId: string, exerciseId: string, setId: string, reps: number, weight: number, time?: number, equipmentType?: EquipmentType, gripType?: GripType, positionType?: PositionType, weightUnit?: WeightUnit) => {
    storage.updateSet(workoutId, exerciseId, setId, reps, weight, time, equipmentType, gripType, positionType, weightUnit);
    updateWorkoutState(set, workoutId);
  },

  // Удаление подхода
  removeSet: (workoutId: string, exerciseId: string, setId: string) => {
    storage.removeSet(workoutId, exerciseId, setId);
    updateWorkoutState(set, workoutId);
  },

  // Обновление списка тренировок
  refreshWorkouts: () => {
    const workouts = storage.getWorkouts();
    set({ workouts });
  },

  // Импорт данных
  importData: (data: string, format: 'json' | 'csv') => {
    const result = format === 'json' 
      ? storage.importFromJSON(data)
      : storage.importFromCSV(data);
    
    if (result.success) {
      const workouts = storage.getWorkouts();
      set({ workouts, currentWorkout: null });
    }
    
    return result;
  },
  
  // Шаблоны
  getTemplates: (workoutType: WorkoutType) => {
    return storage.getTemplatesByType(workoutType);
  },
  
  saveTemplate: (name: string, workoutType: WorkoutType, exerciseNames: string[]) => {
    storage.saveTemplate(name, workoutType, exerciseNames);
  },
  
  loadTemplate: (workoutId: string, templateId: string) => {
    const workout = storage.loadTemplateToWorkout(workoutId, templateId);
    if (workout) {
      updateWorkoutState(set, workoutId);
    }
    return workout;
  },
  
  deleteTemplate: (templateId: string) => {
    storage.deleteTemplate(templateId);
  },
  
  // Удаление упражнения из предустановок
  deleteExerciseFromPresets: (exerciseName: string) => {
    storage.deleteExerciseFromPresets(exerciseName);
    const workouts = storage.getWorkouts();
    const currentWorkout = get().currentWorkout;
    // Обновляем текущую тренировку если она изменилась
    const updatedCurrentWorkout = currentWorkout 
      ? workouts.find(w => w.id === currentWorkout.id) || null 
      : null;
    set({ workouts, currentWorkout: updatedCurrentWorkout });
  },
}));
