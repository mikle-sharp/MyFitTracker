import { Workout, Exercise, WorkoutSet, WorkoutType, DEFAULT_EXERCISES, isAbsExercise, ExerciseType, EquipmentType, GripType, WorkoutTemplate } from './types';

const STORAGE_KEY = 'fitness-journal-workouts';
const CUSTOM_EXERCISES_KEY = 'fitness-journal-custom-exercises-by-type';
const TEMPLATES_KEY = 'fitness-journal-templates';

// Генерация уникального ID
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

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

// Получение пользовательских упражнений по типу тренировки
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

// Сохранение пользовательского упражнения для типа тренировки
export const addCustomExerciseForType = (type: WorkoutType, name: string): void => {
  if (typeof window === 'undefined') return;
  try {
    const data = localStorage.getItem(CUSTOM_EXERCISES_KEY);
    const allCustom: Record<WorkoutType, string[]> = data ? JSON.parse(data) : {
      chest: [],
      back: [],
      legs: [],
      fullbody: [],
    };
    
    if (!allCustom[type].includes(name)) {
      allCustom[type].push(name);
      localStorage.setItem(CUSTOM_EXERCISES_KEY, JSON.stringify(allCustom));
    }
  } catch {
    // ignore
  }
};

// Получение всех упражнений для типа тренировки (стандартные + пользовательские)
export const getAllExercisesForType = (type: WorkoutType): string[] => {
  if (type === 'fullbody') {
    // Для фулбоди объединяем упражнения из всех типов
    const allExercises = new Set<string>();
    (['chest', 'back', 'legs'] as WorkoutType[]).forEach(t => {
      const defaultExercises = DEFAULT_EXERCISES[t];
      const customExercises = getCustomExercisesByType(t);
      [...defaultExercises, ...customExercises].forEach(ex => allExercises.add(ex));
    });
    // Добавляем пользовательские упражнения для fullbody
    const fullbodyCustom = getCustomExercisesByType('fullbody');
    fullbodyCustom.forEach(ex => allExercises.add(ex));
    return Array.from(allExercises);
  }
  
  const defaultExercises = DEFAULT_EXERCISES[type];
  const customExercises = getCustomExercisesByType(type);
  return [...defaultExercises, ...customExercises];
};

// Получение ВСЕХ упражнений из базы (стандартные + пользовательские всех типов)
export const getAllExercises = (): string[] => {
  const allExercises = new Set<string>();
  
  // Стандартные упражнения всех типов
  (['chest', 'back', 'legs'] as WorkoutType[]).forEach(t => {
    const defaultExercises = DEFAULT_EXERCISES[t];
    defaultExercises.forEach(ex => allExercises.add(ex));
  });
  
  // Пользовательские упражнения всех типов
  (['chest', 'back', 'legs', 'fullbody'] as WorkoutType[]).forEach(t => {
    const customExercises = getCustomExercisesByType(t);
    customExercises.forEach(ex => allExercises.add(ex));
  });
  
  return Array.from(allExercises);
};

// Создание новой тренировки
export const createWorkout = (date: string, type: WorkoutType): Workout => {
  const now = new Date().toISOString();
  
  let exerciseNames: string[];
  
  if (type === 'fullbody') {
    // Для фулбоди: по 2 упражнения из каждого типа + 1 на пресс
    exerciseNames = [
      ...DEFAULT_EXERCISES.chest.slice(0, 2),
      ...DEFAULT_EXERCISES.back.slice(0, 2),
      ...DEFAULT_EXERCISES.legs.slice(0, 2),
      'Планка', // пресс
    ];
  } else {
    exerciseNames = [...DEFAULT_EXERCISES[type]];
  }
  
  const exercises: Exercise[] = exerciseNames.map(name => ({
    id: generateId(),
    name,
    sets: [],
    isCustom: false,
  }));

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
  
  // Сохраняем упражнение для данного типа тренировки
  addCustomExerciseForType(workout.type, exerciseName);
  
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
  
  // Сохраняем упражнение для данного типа тренировки
  addCustomExerciseForType(workout.type, newExerciseName);
  
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
  gripType?: GripType
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
  gripType?: GripType
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
    set.equipmentType = equipmentType;
  }
  if (gripType !== undefined) {
    set.gripType = gripType;
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

// Экспорт данных в CSV
export const exportToCSV = (): string => {
  const workouts = getWorkouts();

  if (workouts.length === 0) {
    return '';
  }

  const headers = ['Дата', 'Тип тренировки', 'Длительность (мин)', 'Упражнение', 'Подход', 'Повторения', 'Вес (кг)', 'Время (сек)', 'Заметки'];
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
            exercise.name,
            String(index + 1),
            String(set.reps),
            String(set.weight),
            set.time ? String(set.time) : '',
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
  const customExercisesData = typeof window !== 'undefined' 
    ? localStorage.getItem(CUSTOM_EXERCISES_KEY) 
    : null;
  
  const exportData = {
    workouts,
    customExercisesByType: customExercisesData ? JSON.parse(customExercisesData) : {
      chest: [],
      back: [],
      legs: [],
      fullbody: [],
    },
    exportDate: new Date().toISOString(),
    version: '1.0',
  };
  
  return JSON.stringify(exportData, null, 2);
};

// Импорт данных из JSON
export const importFromJSON = (jsonString: string): { success: boolean; message: string } => {
  try {
    const data = JSON.parse(jsonString);
    
    if (data.workouts && Array.isArray(data.workouts)) {
      saveWorkouts(data.workouts);
      
      if (data.customExercisesByType) {
        localStorage.setItem(CUSTOM_EXERCISES_KEY, JSON.stringify(data.customExercisesByType));
      }
      
      return { success: true, message: `Импортировано ${data.workouts.length} тренировок` };
    }
    
    // Попытка импорта старого формата (просто массив тренировок)
    if (Array.isArray(data)) {
      saveWorkouts(data);
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

      // Поддерживаем как новый формат (с duration), так и старый (без)
      const hasDuration = parts.length >= 9;
      const [date, type, durationOrExercise, exerciseOrSetNum, repsOrWeight, weightOrTime, timeOrNotes, notesOrUndefined] = parts;

      let exerciseName: string;
      let reps: string;
      let weight: string;
      let time: string | undefined;
      let notes: string | undefined;
      let duration: string | undefined;

      if (hasDuration) {
        // Новый формат: Дата, Тип, Длительность, Упражнение, Подход, Повторения, Вес, Время, Заметки
        duration = durationOrExercise;
        exerciseName = exerciseOrSetNum;
        // setNum пропускаем
        reps = repsOrWeight;
        weight = weightOrTime;
        time = timeOrNotes;
        notes = notesOrUndefined;
      } else {
        // Старый формат: Дата, Тип, Упражнение, Подход, Повторения, Вес, Время, Заметки
        exerciseName = durationOrExercise;
        // setNum пропускаем
        reps = exerciseOrSetNum;
        weight = repsOrWeight;
        time = weightOrTime;
        notes = timeOrNotes;
      }

      if (!date || !type || !exerciseName) continue;

      let workout = workoutsMap.get(date);
      if (!workout) {
        workout = {
          id: generateId(),
          date: date.trim(),
          type: type.trim() as WorkoutType,
          exercises: [],
          notes: notes ? notes.trim() : undefined,
          duration: duration ? parseInt(duration) : undefined,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        workoutsMap.set(date, workout);
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
      };

      exercise.sets.push(newSet);
    }

    const workouts = Array.from(workoutsMap.values());
    saveWorkouts(workouts);

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
