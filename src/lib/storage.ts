import { Workout, Exercise, WorkoutSet, WorkoutType, ExerciseType, EquipmentType, GripType, PositionType, WorkoutTemplate, ExercisesBase, ExerciseBaseKey, DEFAULT_EXERCISES_BASE, EXERCISE_TYPE_COLORS, EXERCISE_TYPE_MARKERS, EXERCISE_TYPE_NAMES } from './types';

const STORAGE_KEY = 'fitness-journal-workouts';
const EXERCISES_BASE_KEY = 'fitness-journal-exercises-base';
const ALL_EXERCISES_KEY = 'fitness-journal-all-exercises';
const TEMPLATES_KEY = 'fitness-journal-templates';

// Старые ключи (для миграции при импорте старых данных)
const CUSTOM_EXERCISES_KEY = 'fitness-journal-custom-exercises-by-type';
const DELETED_EXERCISES_KEY = 'fitness-journal-deleted-exercises';

// Генерация уникального ID
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// === БАЗА УПРАЖНЕНИЙ ===

// Проверка, инициализирована ли база упражнений
export const isExercisesBaseInitialized = (): boolean => {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(EXERCISES_BASE_KEY) !== null;
};

// Инициализация базы упражнений из файла (при первом запуске)
export const initExercisesBaseFromServer = async (): Promise<void> => {
  if (typeof window === 'undefined') return;
  
  // Если база уже есть в localStorage — не перезаписываем
  if (localStorage.getItem(EXERCISES_BASE_KEY) !== null) return;
  
  try {
    // Определяем basePath по текущему URL
    const basePath = window.location.pathname.startsWith('/MyFitTracker') ? '/MyFitTracker' : '';
    
    // Загружаем файл со всеми упражнениями
    const allExercisesResponse = await fetch(`${basePath}/all-exercises.json`);
    if (allExercisesResponse.ok) {
      const data = await allExercisesResponse.json();
      if (data.chest && data.back && data.legs && data.common) {
        // Сохраняем в обе базы (exercisesBase и allExercisesBase)
        saveExercisesBase({
          chest: data.chest,
          back: data.back,
          legs: data.legs,
          common: data.common,
        });
        saveAllExercises({
          chest: data.chest,
          back: data.back,
          legs: data.legs,
          common: data.common,
        });
      }
    }
    
    return;
  } catch {
    // Игнорируем ошибки загрузки
  }
};

// Получение базы упражнений (из localStorage или дефолтная)
export const getExercisesBase = (): ExercisesBase => {
  if (typeof window === 'undefined') return DEFAULT_EXERCISES_BASE;
  try {
    const data = localStorage.getItem(EXERCISES_BASE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      // Убеждаемся что все ключи существуют
      return {
        chest: parsed.chest || [],
        back: parsed.back || [],
        legs: parsed.legs || [],
        common: parsed.common || [],
      };
    }
    return DEFAULT_EXERCISES_BASE;
  } catch {
    return DEFAULT_EXERCISES_BASE;
  }
};

// Сохранение базы упражнений
export const saveExercisesBase = (base: ExercisesBase): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(EXERCISES_BASE_KEY, JSON.stringify(base));
};

// Добавление упражнения в базу
export const addExerciseToBase = (type: ExerciseBaseKey, name: string): void => {
  if (typeof window === 'undefined') return;
  const base = getExercisesBase();
  if (!base[type].includes(name)) {
    base[type].push(name);
    saveExercisesBase(base);
  }
};

// Удаление упражнения из базы
export const deleteExerciseFromBase = (name: string): void => {
  if (typeof window === 'undefined') return;
  
  // Удаляем из exercisesBase
  const base = getExercisesBase();
  (['chest', 'back', 'legs', 'common'] as ExerciseBaseKey[]).forEach(type => {
    base[type] = base[type].filter(ex => ex !== name);
  });
  saveExercisesBase(base);
  
  // Удаляем из allExercisesBase
  const allBase = getAllExercisesBase();
  (['chest', 'back', 'legs', 'common'] as ExerciseBaseKey[]).forEach(type => {
    allBase[type] = allBase[type].filter(ex => ex !== name);
  });
  saveAllExercises(allBase);
};

// Сброс базы к дефолтной
export const resetExercisesBase = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(EXERCISES_BASE_KEY);
  localStorage.removeItem(ALL_EXERCISES_KEY);
};

// === ВСЕ УПРАЖНЕНИЯ (для списка добавления) ===

// Сохранение всех упражнений
export const saveAllExercises = (base: ExercisesBase): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ALL_EXERCISES_KEY, JSON.stringify(base));
};

// Получение всех упражнений (из localStorage или дефолтная)
export const getAllExercisesBase = (): ExercisesBase => {
  if (typeof window === 'undefined') return DEFAULT_EXERCISES_BASE;
  try {
    const data = localStorage.getItem(ALL_EXERCISES_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      return {
        chest: parsed.chest || [],
        back: parsed.back || [],
        legs: parsed.legs || [],
        common: parsed.common || [],
      };
    }
    return DEFAULT_EXERCISES_BASE;
  } catch {
    return DEFAULT_EXERCISES_BASE;
  }
};

// Получение всех упражнений для типа тренировки
export const getAllExercisesForType = (type: WorkoutType): string[] => {
  const base = getExercisesBase();
  
  if (type === 'fullbody') {
    // Для фулбоди объединяем упражнения из chest, back, legs
    const allExercises = new Set<string>();
    (['chest', 'back', 'legs'] as ExerciseBaseKey[]).forEach(t => {
      base[t].forEach(ex => allExercises.add(ex));
    });
    return Array.from(allExercises);
  }
  
  // Для других типов - упражнения соответствующего типа + common
  const exercises = new Set<string>();
  const typeKey = type as ExerciseBaseKey;
  base[typeKey]?.forEach(ex => exercises.add(ex));
  base.common?.forEach(ex => exercises.add(ex));
  return Array.from(exercises);
};

// Получение ВСЕХ упражнений из базы (для списка добавления)
export const getAllExercises = (): string[] => {
  const base = getExercisesBase();
  const allBase = getAllExercisesBase();
  const allExercises = new Set<string>();
  
  // Добавляем упражнения из обеих баз
  (['chest', 'back', 'legs', 'common'] as ExerciseBaseKey[]).forEach(type => {
    base[type].forEach(ex => allExercises.add(ex));
    allBase[type].forEach(ex => allExercises.add(ex));
  });
  
  return Array.from(allExercises);
};

// Получение типа упражнения по названию (поиск в базе)
export const getExerciseTypeFromBase = (exerciseName: string): ExerciseType => {
  const base = getExercisesBase();
  const allBase = getAllExercisesBase();
  const name = exerciseName.trim();
  
  // Ищем в базе по точному совпадению
  for (const type of ['chest', 'back', 'legs', 'common'] as ExerciseBaseKey[]) {
    if (base[type].includes(name) || allBase[type].includes(name)) {
      return type;
    }
  }
  
  // По умолчанию - общие
  return 'common';
};

// === ТРЕНИРОВКИ ===

// Получение всех тренировок
export const getWorkouts = (): Workout[] => {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

// Сохранение всех тренировок
export const saveWorkouts = (workouts: Workout[]): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(workouts));
};

// Получение тренировки по дате
export const getWorkoutByDate = (date: string): Workout | undefined => {
  const workouts = getWorkouts();
  return workouts.find(w => w.date === date);
};

// Получение тренировки по ID
export const getWorkoutById = (id: string): Workout | undefined => {
  const workouts = getWorkouts();
  return workouts.find(w => w.id === id);
};

// Создание новой тренировки
export const createWorkout = (date: string, type: WorkoutType): Workout => {
  const now = new Date().toISOString();
  
  // Создаём пустую тренировку без упражнений
  const exercises: Exercise[] = [];

  const workout: Workout = {
    id: generateId(),
    date,
    type,
    exercises,
    createdAt: now,
    updatedAt: now,
  };

  const workouts = getWorkouts();
  // Удаляем существующую тренировку на эту дату
  const filteredWorkouts = workouts.filter(w => w.date !== date);
  saveWorkouts([...filteredWorkouts, workout]);

  return workout;
};

// Обновление тренировки
export const updateWorkout = (workout: Workout): void => {
  const workouts = getWorkouts();
  const index = workouts.findIndex(w => w.id === workout.id);
  
  if (index !== -1) {
    workout.updatedAt = new Date().toISOString();
    workouts[index] = workout;
    saveWorkouts(workouts);
  }
};

// Удаление тренировки
export const deleteWorkout = (id: string): void => {
  const workouts = getWorkouts();
  const filtered = workouts.filter(w => w.id !== id);
  saveWorkouts(filtered);
};

// Обновление заметок к тренировке
export const updateWorkoutNotes = (workoutId: string, notes: string): void => {
  const workouts = getWorkouts();
  const workout = workouts.find(w => w.id === workoutId);
  
  if (!workout) return;

  workout.notes = notes;
  workout.updatedAt = new Date().toISOString();
  saveWorkouts(workouts);
};

// Обновление веса пользователя в тренировке
export const updateWorkoutWeight = (workoutId: string, weight: number | undefined): void => {
  const workouts = getWorkouts();
  const workout = workouts.find(w => w.id === workoutId);
  
  if (!workout) return;

  workout.weight = weight;
  workout.updatedAt = new Date().toISOString();
  saveWorkouts(workouts);
};

// Добавление упражнения в тренировку
export const addExerciseToWorkout = (
  workoutId: string,
  exerciseName: string,
  exerciseType?: ExerciseType
): Exercise | null => {
  const workouts = getWorkouts();
  const workout = workouts.find(w => w.id === workoutId);
  
  if (!workout) return null;

  const newExercise: Exercise = {
    id: generateId(),
    name: exerciseName,
    sets: [],
    isCustom: true,
    exerciseType: exerciseType,
  };

  workout.exercises.push(newExercise);
  workout.updatedAt = new Date().toISOString();
  
  // Добавляем упражнение в базу если его там нет
  const targetType = exerciseType || 'common';
  addExerciseToBase(targetType, exerciseName);
  
  saveWorkouts(workouts);

  return newExercise;
};

// Удаление упражнения из тренировки
export const removeExerciseFromWorkout = (
  workoutId: string,
  exerciseId: string
): void => {
  const workouts = getWorkouts();
  const workout = workouts.find(w => w.id === workoutId);
  
  if (!workout) return;

  workout.exercises = workout.exercises.filter(e => e.id !== exerciseId);
  workout.updatedAt = new Date().toISOString();
  saveWorkouts(workouts);
};

// Замена упражнения в тренировке (сохраняет позицию)
export const replaceExerciseInWorkout = (
  workoutId: string,
  oldExerciseId: string,
  newExerciseName: string,
  exerciseType?: ExerciseType
): Exercise | null => {
  const workouts = getWorkouts();
  const workout = workouts.find(w => w.id === workoutId);
  
  if (!workout) return null;

  const index = workout.exercises.findIndex(e => e.id === oldExerciseId);
  if (index === -1) return null;

  const newExercise: Exercise = {
    id: generateId(),
    name: newExerciseName,
    sets: [],
    isCustom: true,
    exerciseType: exerciseType,
  };

  // Заменяем упражнение на той же позиции
  workout.exercises[index] = newExercise;
  workout.updatedAt = new Date().toISOString();
  
  // Добавляем упражнение в базу если его там нет
  const targetType = exerciseType || 'common';
  addExerciseToBase(targetType, newExerciseName);
  
  saveWorkouts(workouts);

  return newExercise;
};

// Перемещение упражнения вверх
export const moveExerciseUp = (
  workoutId: string,
  exerciseId: string
): void => {
  const workouts = getWorkouts();
  const workout = workouts.find(w => w.id === workoutId);
  
  if (!workout) return;

  const index = workout.exercises.findIndex(e => e.id === exerciseId);
  if (index <= 0) return;

  // Swap with previous
  [workout.exercises[index - 1], workout.exercises[index]] = 
    [workout.exercises[index], workout.exercises[index - 1]];
  
  workout.updatedAt = new Date().toISOString();
  saveWorkouts(workouts);
};

// Перемещение упражнения вниз
export const moveExerciseDown = (
  workoutId: string,
  exerciseId: string
): void => {
  const workouts = getWorkouts();
  const workout = workouts.find(w => w.id === workoutId);
  
  if (!workout) return;

  const index = workout.exercises.findIndex(e => e.id === exerciseId);
  if (index < 0 || index >= workout.exercises.length - 1) return;

  // Swap with next
  [workout.exercises[index], workout.exercises[index + 1]] = 
    [workout.exercises[index + 1], workout.exercises[index]];
  
  workout.updatedAt = new Date().toISOString();
  saveWorkouts(workouts);
};

// Добавление подхода к упражнению
export const addSetToExercise = (
  workoutId: string,
  exerciseId: string,
  reps: number,
  weight: number,
  time?: number,
  isWarmup?: boolean,
  equipmentType?: EquipmentType,
  gripType?: GripType,
  positionType?: PositionType
): WorkoutSet | null => {
  const workouts = getWorkouts();
  const workout = workouts.find(w => w.id === workoutId);

  if (!workout) return null;

  const exercise = workout.exercises.find(e => e.id === exerciseId);
  if (!exercise) return null;

  const newSet: WorkoutSet = {
    id: generateId(),
    reps,
    weight,
    time,
    isWarmup,
    timestamp: new Date().toISOString(),
    equipmentType,
    gripType,
    positionType,
  };

  // Разминочные подходы добавляем в начало списка
  if (isWarmup) {
    exercise.sets.unshift(newSet);
  } else {
    exercise.sets.push(newSet);
  }
  workout.updatedAt = new Date().toISOString();
  saveWorkouts(workouts);

  return newSet;
};

// Обновление подхода
export const updateSet = (
  workoutId: string,
  exerciseId: string,
  setId: string,
  reps: number,
  weight: number,
  time?: number,
  equipmentType?: EquipmentType,
  gripType?: GripType,
  positionType?: PositionType
): void => {
  const workouts = getWorkouts();
  const workout = workouts.find(w => w.id === workoutId);

  if (!workout) return;

  const exercise = workout.exercises.find(e => e.id === exerciseId);
  if (!exercise) return;

  const set = exercise.sets.find(s => s.id === setId);
  if (!set) return;

  set.reps = reps;
  set.weight = weight;
  if (time !== undefined) {
    set.time = time;
  }
  if (equipmentType !== undefined) {
    set.equipmentType = equipmentType || undefined;
  }
  if (gripType !== undefined) {
    set.gripType = gripType || undefined;
  }
  if (positionType !== undefined) {
    set.positionType = positionType || undefined;
  }
  workout.updatedAt = new Date().toISOString();
  saveWorkouts(workouts);
};

// Удаление подхода
export const removeSet = (
  workoutId: string,
  exerciseId: string,
  setId: string
): void => {
  const workouts = getWorkouts();
  const workout = workouts.find(w => w.id === workoutId);
  
  if (!workout) return;

  const exercise = workout.exercises.find(e => e.id === exerciseId);
  if (!exercise) return;

  exercise.sets = exercise.sets.filter(s => s.id !== setId);
  workout.updatedAt = new Date().toISOString();
  saveWorkouts(workouts);
};

// Получение дат, в которые есть тренировки
export const getWorkoutDates = (): Set<string> => {
  const workouts = getWorkouts();
  return new Set(workouts.map(w => w.date));
};

// === ЭКСПОРТ / ИМПОРТ ===

// Экспорт данных в CSV
export const exportToCSV = (): string => {
  const workouts = getWorkouts();

  if (workouts.length === 0) {
    return '';
  }

  const headers = ['Дата', 'Тип тренировки', 'Длительность (мин)', 'Вес пользователя (кг)', 'Упражнение', 'Подход', 'Повторения', 'Вес (кг)', 'Время (сек)', 'Разминка', 'Позиция', 'Снаряд', 'Хват', 'Время добавления', 'Заметки'];
  const rows: string[][] = [headers];

  workouts
    .sort((a, b) => a.date.localeCompare(b.date))
    .forEach(workout => {
      workout.exercises.forEach(exercise => {
        exercise.sets.forEach((set, index) => {
          rows.push([
            workout.date,
            workout.type,
            workout.duration ? String(workout.duration) : '',
            workout.weight ? String(workout.weight) : '',
            exercise.name,
            String(index + 1),
            String(set.reps),
            String(set.weight),
            set.time ? String(set.time) : '',
            set.isWarmup ? '1' : '0',
            set.positionType || '',
            set.equipmentType || '',
            set.gripType || '',
            set.timestamp || '',
            workout.notes || '',
          ]);
        });
      });
    });

  return rows.map(row => row.join(',')).join('\n');
};

// Экспорт данных в JSON
export const exportToJSON = (): string => {
  const workouts = getWorkouts();
  const exercisesBase = getExercisesBase();
  const allExercisesBase = getAllExercisesBase();
  
  const exportData = {
    workouts,
    exercisesBase,
    allExercisesBase,
    exportDate: new Date().toISOString(),
    version: '2.1',
  };
  
  return JSON.stringify(exportData, null, 2);
};

// Импорт данных из JSON
export const importFromJSON = (jsonString: string): { success: boolean; message: string } => {
  try {
    const data = JSON.parse(jsonString);
    
    // Новый формат (версия 2.0+)
    if (data.workouts && Array.isArray(data.workouts)) {
      saveWorkouts(data.workouts);
      
      // Импортируем базу упражнений - ПОЛНОСТЬЮ заменяем
      if (data.exercisesBase) {
        saveExercisesBase(data.exercisesBase);
        // Если есть allExercisesBase в бэкапе (версия 2.1+) - используем её
        // Иначе allExercisesBase = exercisesBase (для совместимости со старыми бэкапами)
        if (data.allExercisesBase) {
          saveAllExercises(data.allExercisesBase);
        } else {
          saveAllExercises(data.exercisesBase);
        }
      } else if (data.customExercisesByType) {
        // Миграция со старого формата
        const base = { ...DEFAULT_EXERCISES_BASE };
        const deleted: string[] = data.deletedExercises || [];
        
        // Добавляем пользовательские упражнения
        (['chest', 'back', 'legs'] as WorkoutType[]).forEach(type => {
          const custom = data.customExercisesByType[type] || [];
          custom.forEach((ex: string) => {
            if (!deleted.includes(ex) && !base[type as ExerciseBaseKey].includes(ex)) {
              base[type as ExerciseBaseKey].push(ex);
            }
          });
        });
        
        // Фильтруем удалённые из дефолтных
        (['chest', 'back', 'legs', 'common'] as ExerciseBaseKey[]).forEach(type => {
          base[type] = base[type].filter(ex => !deleted.includes(ex));
        });
        
        saveExercisesBase(base);
        saveAllExercises(base);
      }
      
      // Очищаем старые ключи
      localStorage.removeItem(CUSTOM_EXERCISES_KEY);
      localStorage.removeItem(DELETED_EXERCISES_KEY);
      
      return { success: true, message: `Импортировано ${data.workouts.length} тренировок` };
    }
    
    // Попытка импорта старого формата (просто массив тренировок)
    if (Array.isArray(data)) {
      saveWorkouts(data);
      // Сбрасываем базу к дефолтной
      resetExercisesBase();
      return { success: true, message: `Импортировано ${data.length} тренировок` };
    }
    
    return { success: false, message: 'Неверный формат файла' };
  } catch {
    return { success: false, message: 'Ошибка при чтении файла' };
  }
};

// Импорт данных из CSV
export const importFromCSV = (csvString: string): { success: boolean; message: string } => {
  try {
    const lines = csvString.trim().split('\n');
    if (lines.length < 2) {
      return { success: false, message: 'Файл пуст или имеет неверный формат' };
    }

    const workoutsMap = new Map<string, Workout>();

    // Пропускаем заголовок
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const parts = line.split(',');
      if (parts.length < 6) continue;

      // Поддерживаем разные форматы CSV
      // Новейший формат (14 колонок): Дата, Тип, Длительность, Вес пользователя, Упражнение, Подход, Повторения, Вес, Время, Разминка, Снаряд, Хват, Время добавления, Заметки
      // Формат с userWeight (10 колонок): Дата, Тип, Длительность, Вес пользователя, Упражнение, Подход, Повторения, Вес, Время, Заметки
      // Старый формат (9 колонок): Дата, Тип, Длительность, Упражнение, Подход, Повторения, Вес, Время, Заметки
      // Ещё старее (8 колонок): Дата, Тип, Упражнение, Подход, Повторения, Вес, Время, Заметки
      
      let date: string, type: string, duration: string | undefined, userWeight: string | undefined, 
          exerciseName: string, reps: string, weight: string, time: string | undefined,
          isWarmup: string | undefined, equipmentType: string | undefined, gripType: string | undefined,
          timestamp: string | undefined, notes: string | undefined;

      if (parts.length >= 14) {
        // Новейший формат с полными данными
        [date, type, duration, userWeight, exerciseName, , reps, weight, time, isWarmup, equipmentType, gripType, timestamp, notes] = parts;
      } else if (parts.length >= 10) {
        // Формат с userWeight
        [date, type, duration, userWeight, exerciseName, , reps, weight, time, notes] = parts;
      } else if (parts.length >= 9) {
        // Старый формат с duration
        [date, type, duration, exerciseName, , reps, weight, time, notes] = parts;
      } else if (parts.length >= 8) {
        // Самый старый формат
        [date, type, exerciseName, , reps, weight, time, notes] = parts;
      } else {
        // Очень старый формат без времени
        [date, type, exerciseName, , reps, weight] = parts;
      }

      if (!date || !type || !exerciseName) continue;

      let workout = workoutsMap.get(date.trim());
      if (!workout) {
        workout = {
          id: generateId(),
          date: date.trim(),
          type: type.trim() as WorkoutType,
          exercises: [],
          notes: notes ? notes.trim() : undefined,
          weight: userWeight ? parseFloat(userWeight) : undefined,
          duration: duration ? parseInt(duration) : undefined,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        workoutsMap.set(date.trim(), workout);
      }

      let exercise = workout.exercises.find(e => e.name === exerciseName.trim());
      if (!exercise) {
        exercise = {
          id: generateId(),
          name: exerciseName.trim(),
          sets: [],
          isCustom: true,
        };
        workout.exercises.push(exercise);
      }

      const newSet: WorkoutSet = {
        id: generateId(),
        reps: parseInt(reps) || 0,
        weight: parseFloat(weight) || 0,
        time: time ? parseInt(time) : undefined,
        isWarmup: isWarmup === '1',
        equipmentType: equipmentType ? equipmentType.trim() as EquipmentType : undefined,
        gripType: gripType ? gripType.trim() as GripType : undefined,
        timestamp: timestamp ? timestamp.trim() : undefined,
      };

      exercise.sets.push(newSet);
    }

    const workouts = Array.from(workoutsMap.values());
    saveWorkouts(workouts);
    
    // При импорте CSV сбрасываем базу к дефолтной
    resetExercisesBase();

    return { success: true, message: `Импортировано ${workouts.length} тренировок` };
  } catch (error) {
    return { success: false, message: 'Ошибка при обработке CSV файла' };
  }
};

// Получение предыдущих значений для упражнения по номеру подхода
export interface PreviousSetData {
  weight: number;
  reps: number;
  time: number;
  isBodyweight: boolean;
}

export const getPreviousSetData = (
  exerciseName: string,
  setNumber: number, // 0 = разминка, 1 = первый рабочий, 2 = второй рабочий и т.д.
  isWarmup: boolean
): PreviousSetData | null => {
  const workouts = getWorkouts();
  
  // Сортируем по дате (новые сначала)
  const sortedWorkouts = [...workouts].sort((a, b) => b.date.localeCompare(a.date));
  
  for (const workout of sortedWorkouts) {
    const exercise = workout.exercises.find(e => e.name === exerciseName);
    if (!exercise) continue;
    
    // Фильтруем подходы по типу (разминочные или рабочие)
    const relevantSets = exercise.sets.filter(s => 
      isWarmup ? s.isWarmup : !s.isWarmup
    );
    
    // Ищем подход с нужным номером (индекс setNumber - 1 или setNumber для разминки)
    const targetSet = relevantSets[setNumber - 1];
    
    if (targetSet) {
      return {
        weight: targetSet.weight,
        reps: targetSet.reps,
        time: targetSet.time || 0,
        isBodyweight: targetSet.weight === 0,
      };
    }
  }
  
  return null;
};

// === ШАБЛОНЫ ТРЕНИРОВОК ===

// Получение всех шаблонов
export const getTemplates = (): WorkoutTemplate[] => {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(TEMPLATES_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

// Получение шаблонов по типу тренировки
export const getTemplatesByType = (workoutType: WorkoutType): WorkoutTemplate[] => {
  const templates = getTemplates();
  return templates.filter(t => t.workoutType === workoutType);
};

// Сохранение шаблона
export const saveTemplate = (name: string, workoutType: WorkoutType, exerciseNames: string[]): WorkoutTemplate => {
  const templates = getTemplates();
  
  const newTemplate: WorkoutTemplate = {
    id: generateId(),
    name,
    workoutType,
    exerciseNames,
    createdAt: new Date().toISOString(),
  };
  
  templates.push(newTemplate);
  localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
  
  return newTemplate;
};

// Удаление шаблона
export const deleteTemplate = (templateId: string): void => {
  const templates = getTemplates();
  const filtered = templates.filter(t => t.id !== templateId);
  localStorage.setItem(TEMPLATES_KEY, JSON.stringify(filtered));
};

// Загрузка шаблона в тренировку (заменяет упражнения)
export const loadTemplateToWorkout = (workoutId: string, templateId: string): Workout | null => {
  const templates = getTemplates();
  const template = templates.find(t => t.id === templateId);
  if (!template) return null;
  
  const workouts = getWorkouts();
  const workoutIndex = workouts.findIndex(w => w.id === workoutId);
  if (workoutIndex === -1) return null;
  
  const workout = workouts[workoutIndex];
  
  // Заменяем упражнения на упражнения из шаблона (без весов, подходов, тегов)
  workout.exercises = template.exerciseNames.map(name => ({
    id: generateId(),
    name,
    sets: [],
    isCustom: true,
  }));
  
  workout.updatedAt = new Date().toISOString();
  saveWorkouts(workouts);
  
  return workout;
};

// === БАЗОВЫЕ ШАБЛОНЫ ===

// Базовые шаблоны тренировок
const DEFAULT_TEMPLATES: Omit<WorkoutTemplate, 'id' | 'createdAt'>[] = [
  {
    name: 'Базовая тренировка груди',
    workoutType: 'chest',
    exerciseNames: [
      'Жим штанги лёжа',
      'Жим в Хаммере',
      'Жим на плечи в тренажёре',
      'Разгибания на трицепс в кроссовере',
      'Классическая планка',
    ],
  },
  {
    name: 'Базовая тренировка спины',
    workoutType: 'back',
    exerciseNames: [
      'Подтягивания на перекладине',
      'Тяга вертикального блока',
      'Шраги в машине Смита',
      'Сгибания на бицепс',
      'Скручивания на пресс',
    ],
  },
  {
    name: 'Базовая тренировка ног',
    workoutType: 'legs',
    exerciseNames: [
      'Приседания со штангой',
      'Сгибания ног в тренажёре',
      'Разгибания ног в тренажёре',
      'Подъем на носки',
      'Сгибания запястий',
      'Подъём ног на брусьях',
    ],
  },
  {
    name: 'Базовая тренировка всего тела',
    workoutType: 'fullbody',
    exerciseNames: [
      'Приседания со штангой',
      'Подтягивания на перекладине',
      'Жим штанги лёжа',
      'Жим на плечи',
      'Сгибания на бицепс',
      'Подъём ног в висе на перекладине',
    ],
  },
];

// Ключ для отметки что базовые шаблоны уже инициализированы
const DEFAULT_TEMPLATES_INITIALIZED_KEY = 'fitness-journal-default-templates-initialized';

// Инициализация базовых шаблонов (при первом запуске)
export const initDefaultTemplates = (): void => {
  if (typeof window === 'undefined') return;
  
  // Проверяем, были ли уже инициализированы базовые шаблоны
  if (localStorage.getItem(DEFAULT_TEMPLATES_INITIALIZED_KEY) === 'true') return;
  
  const templates = getTemplates();
  const now = new Date().toISOString();
  
  // Добавляем базовые шаблоны
  DEFAULT_TEMPLATES.forEach(defaultTemplate => {
    // Проверяем, нет ли уже шаблона с таким именем
    if (!templates.some(t => t.name === defaultTemplate.name)) {
      templates.push({
        id: generateId(),
        ...defaultTemplate,
        createdAt: now,
      });
    }
  });
  
  localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
  localStorage.setItem(DEFAULT_TEMPLATES_INITIALIZED_KEY, 'true');
};

// Удаление упражнения из базы и всех тренировок
export const deleteExerciseFromPresets = (exerciseName: string): void => {
  if (typeof window === 'undefined') return;
  
  // 1. Удаляем из базы упражнений
  deleteExerciseFromBase(exerciseName);
  
  // 2. Удаляем из всех тренировок
  const workouts = getWorkouts();
  workouts.forEach(workout => {
    workout.exercises = workout.exercises.filter(e => e.name !== exerciseName);
    workout.updatedAt = new Date().toISOString();
  });
  saveWorkouts(workouts);
};

// === УСТАРЕВШИЕ ФУНКЦИИ (для обратной совместимости) ===

// Получение списка удалённых упражнений (устарело)
export const getDeletedExercises = (): string[] => {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(DELETED_EXERCISES_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

// Получение пользовательских упражнений по типу тренировки (устарело)
export const getCustomExercisesByType = (type: WorkoutType): string[] => {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(CUSTOM_EXERCISES_KEY);
    const allCustom: Record<WorkoutType, string[]> = data ? JSON.parse(data) : {
      chest: [],
      back: [],
      legs: [],
      fullbody: [],
    };
    return allCustom[type] || [];
  } catch {
    return [];
  }
};

// Сохранение пользовательского упражнения для типа тренировки (устарело)
export const addCustomExerciseForType = (type: WorkoutType, name: string): void => {
  if (typeof window === 'undefined') return;
  
  // Теперь добавляем в новую базу
  const typeKey = type === 'fullbody' ? 'common' : type as ExerciseBaseKey;
  addExerciseToBase(typeKey, name);
};
