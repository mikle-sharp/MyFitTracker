import { create } from 'zustand';
import { Workout, WorkoutType, WorkoutSet, Exercise, ExerciseType, EquipmentType, GripType } from './types';
import * as storage from './storage';

interface FitnessStore {
  // Состояние
  workouts: Workout[];
  selectedDate: string;
  currentWorkout: Workout | null;
  isInitialized: boolean;

  // Действия
  init: () => void;
  setSelectedDate: (date: string) => void;
  loadWorkoutForDate: (date: string) => void;
  clearSelection: () => void;
  createWorkout: (date: string, type: WorkoutType) => Workout;
  updateWorkout: (workout: Workout) => void;
  updateWorkoutNotes: (workoutId: string, notes: string) => void;
  deleteWorkout: (id: string) => void;
  addExercise: (workoutId: string, name: string, exerciseType?: ExerciseType) => Exercise | null;
  replaceExercise: (workoutId: string, oldExerciseId: string, newName: string, exerciseType?: ExerciseType) => Exercise | null;
  removeExercise: (workoutId: string, exerciseId: string) => void;
  moveExerciseUp: (workoutId: string, exerciseId: string) => void;
  moveExerciseDown: (workoutId: string, exerciseId: string) => void;
  addSet: (workoutId: string, exerciseId: string, reps: number, weight: number, time?: number, isWarmup?: boolean, equipmentType?: EquipmentType, gripType?: GripType) => WorkoutSet | null;
  updateSet: (workoutId: string, exerciseId: string, setId: string, reps: number, weight: number, time?: number, equipmentType?: EquipmentType, gripType?: GripType) => void;
  removeSet: (workoutId: string, exerciseId: string, setId: string) => void;
  refreshWorkouts: () => void;
  importData: (data: string, format: 'json' | 'csv') => { success: boolean; message: string };
}

// Получить сегодняшнюю дату в формате YYYY-MM-DD
const getTodayDate = (): string => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

export const useFitnessStore = create<FitnessStore>((set, get) => ({
  // Начальное состояние
  workouts: [],
  selectedDate: getTodayDate(),
  currentWorkout: null,
  isInitialized: false,

  // Инициализация
  init: () => {
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
    const workouts = storage.getWorkouts();
    const currentWorkout = workouts.find(w => w.id === workoutId) || null;
    set({ workouts, currentWorkout });
  },

  // Добавление упражнения
  addExercise: (workoutId: string, name: string, exerciseType?: ExerciseType) => {
    const exercise = storage.addExerciseToWorkout(workoutId, name, exerciseType);
    if (exercise) {
      const workouts = storage.getWorkouts();
      const currentWorkout = workouts.find(w => w.id === workoutId) || null;
      set({ workouts, currentWorkout });
    }
    return exercise;
  },

  // Замена упражнения (сохраняет позицию)
  replaceExercise: (workoutId: string, oldExerciseId: string, newName: string, exerciseType?: ExerciseType) => {
    const exercise = storage.replaceExerciseInWorkout(workoutId, oldExerciseId, newName, exerciseType);
    if (exercise) {
      const workouts = storage.getWorkouts();
      const currentWorkout = workouts.find(w => w.id === workoutId) || null;
      set({ workouts, currentWorkout });
    }
    return exercise;
  },

  // Удаление упражнения
  removeExercise: (workoutId: string, exerciseId: string) => {
    storage.removeExerciseFromWorkout(workoutId, exerciseId);
    const workouts = storage.getWorkouts();
    const currentWorkout = workouts.find(w => w.id === workoutId) || null;
    set({ workouts, currentWorkout });
  },

  // Перемещение упражнения вверх
  moveExerciseUp: (workoutId: string, exerciseId: string) => {
    storage.moveExerciseUp(workoutId, exerciseId);
    const workouts = storage.getWorkouts();
    const currentWorkout = workouts.find(w => w.id === workoutId) || null;
    set({ workouts, currentWorkout });
  },

  // Перемещение упражнения вниз
  moveExerciseDown: (workoutId: string, exerciseId: string) => {
    storage.moveExerciseDown(workoutId, exerciseId);
    const workouts = storage.getWorkouts();
    const currentWorkout = workouts.find(w => w.id === workoutId) || null;
    set({ workouts, currentWorkout });
  },

  // Добавление подхода
  addSet: (workoutId: string, exerciseId: string, reps: number, weight: number, time?: number, isWarmup?: boolean, equipmentType?: EquipmentType, gripType?: GripType) => {
    const workoutSet = storage.addSetToExercise(workoutId, exerciseId, reps, weight, time, isWarmup, equipmentType, gripType);
    if (workoutSet) {
      const workouts = storage.getWorkouts();
      const currentWorkout = workouts.find(w => w.id === workoutId) || null;
      set({ workouts, currentWorkout });
    }
    return workoutSet;
  },

  // Обновление подхода
  updateSet: (workoutId: string, exerciseId: string, setId: string, reps: number, weight: number, time?: number, equipmentType?: EquipmentType, gripType?: GripType) => {
    storage.updateSet(workoutId, exerciseId, setId, reps, weight, time, equipmentType, gripType);
    const workouts = storage.getWorkouts();
    const currentWorkout = workouts.find(w => w.id === workoutId) || null;
    set({ workouts, currentWorkout });
  },

  // Удаление подхода
  removeSet: (workoutId: string, exerciseId: string, setId: string) => {
    storage.removeSet(workoutId, exerciseId, setId);
    const workouts = storage.getWorkouts();
    const currentWorkout = workouts.find(w => w.id === workoutId) || null;
    set({ workouts, currentWorkout });
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
}));
