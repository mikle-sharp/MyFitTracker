// Типы тренировок
export type WorkoutType = 'chest' | 'back' | 'legs' | 'fullbody';

// Типы упражнений (для цветовой маркировки)
export type ExerciseType = 'chest' | 'back' | 'legs' | 'common';

// Тип ввода для упражнения
export type ExerciseInputType = 
  | 'weight_reps'      // вес + повторения
  | 'weight_time'      // вес + время
  | 'weight_reps_time' // вес + повторения + время
  | 'bodyweight_reps'      // собственный вес + повторения
  | 'bodyweight_time'      // собственный вес + время
  | 'bodyweight_reps_time' // собственный вес + повторения + время
  | 'reps'             // только повторения
  | 'time';            // только время

// Подход
export interface WorkoutSet {
  id: string;
  reps: number;
  weight: number; // в кг, может быть десятичным (0 для собственного веса)
  time?: number; // время в секундах
  inputType?: ExerciseInputType; // тип ввода для этого подхода
  isWarmup?: boolean; // разминочный подход
}

// Упражнение
export interface Exercise {
  id: string;
  name: string;
  sets: WorkoutSet[];
  isCustom?: boolean; // добавлено пользователем
  exerciseType?: ExerciseType; // тип упражнения для цветовой маркировки
}

// Тренировка
export interface Workout {
  id: string;
  date: string; // YYYY-MM-DD
  type: WorkoutType;
  exercises: Exercise[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Личный рекорд
export interface PersonalRecord {
  exerciseName: string;
  maxWeight: number;
  reps: number; // количество повторений с максимальным весом
  time?: number; // время в секундах (для рекордов по времени)
  date: string;
  workoutId: string;
  workoutType: WorkoutType; // тип тренировки для цветовой индикации
}

// Предустановленные упражнения для каждого типа тренировки
export const DEFAULT_EXERCISES: Record<WorkoutType, string[]> = {
  chest: [
    'Жим лежа',
    'Жим на наклонной',
    'Разводка гантелей',
    'Кроссовер',
    'Отжимания',
  ],
  back: [
    'Становая тяга',
    'Тяга штанги в наклоне',
    'Подтягивания',
    'Тяга гантели',
    'Горизонтальная тяга',
  ],
  legs: [
    'Приседания',
    'Жим ногами',
    'Выпады',
    'Разгибание ног',
    'Сгибание ног',
  ],
  fullbody: [
    'Приседания',
    'Жим лежа',
    'Становая тяга',
    'Подтягивания',
    'Отжимания',
  ],
};

// Упражнения на пресс (требуют особого ввода)
export const ABS_EXERCISES = [
  'Планка',
  'Скручивания на пресс',
  'Подъем ног в висе',
  'Боковая планка',
  'Русский твист',
  'Велосипед',
  'Скручивания',
  'Обратные скручивания',
  'Подъем корпуса',
  'V-up',
];

// Проверка, является ли упражнение на пресс
export const isAbsExercise = (name: string): boolean => {
  const lowerName = name.toLowerCase();
  return ABS_EXERCISES.some(e => lowerName.includes(e.toLowerCase())) ||
         lowerName.includes('пресс') ||
         lowerName.includes('скручив') ||
         lowerName.includes('планк');
};

// Цвета для типов тренировок
export const WORKOUT_TYPE_COLORS: Record<WorkoutType, { bg: string; text: string; border: string }> = {
  chest: {
    bg: 'bg-red-500/20',
    text: 'text-red-400',
    border: 'border-red-500/50',
  },
  back: {
    bg: 'bg-blue-500/20',
    text: 'text-blue-400',
    border: 'border-blue-500/50',
  },
  legs: {
    bg: 'bg-green-500/20',
    text: 'text-green-400',
    border: 'border-green-500/50',
  },
  fullbody: {
    bg: 'bg-purple-500/20',
    text: 'text-purple-400',
    border: 'border-purple-500/50',
  },
};

// Названия типов тренировок
export const WORKOUT_TYPE_NAMES: Record<WorkoutType, string> = {
  chest: 'Грудь',
  back: 'Спина',
  legs: 'Ноги',
  fullbody: 'Фулбоди',
};

// Иконки для типов тренировок
export const WORKOUT_TYPE_ICONS: Record<WorkoutType, string> = {
  chest: '💪',
  back: '🔙',
  legs: '🦵',
  fullbody: '🏋️',
};

// Цвета для типов упражнений (для цветовой маркировки внутри карточек)
export const EXERCISE_TYPE_COLORS: Record<ExerciseType, { bg: string; text: string; border: string }> = {
  chest: {
    bg: 'bg-red-950/40',
    text: 'text-red-300',
    border: 'border-red-800/60',
  },
  back: {
    bg: 'bg-blue-950/40',
    text: 'text-blue-300',
    border: 'border-blue-800/60',
  },
  legs: {
    bg: 'bg-green-950/40',
    text: 'text-green-300',
    border: 'border-green-800/60',
  },
  common: {
    bg: 'bg-purple-950/40',
    text: 'text-purple-300',
    border: 'border-purple-800/60',
  },
};

// Буквы-маркеры для типов упражнений
export const EXERCISE_TYPE_MARKERS: Record<ExerciseType, string> = {
  chest: 'Г',
  back: 'С',
  legs: 'Н',
  common: 'О',
};

// Названия типов упражнений
export const EXERCISE_TYPE_NAMES: Record<ExerciseType, string> = {
  chest: 'Грудь',
  back: 'Спина',
  legs: 'Ноги',
  common: 'Общие',
};

// Функция определения типа упражнения по названию
export const getExerciseType = (exerciseName: string): ExerciseType => {
  const name = exerciseName.toLowerCase();
  
  // Проверяем упражнения на пресс/общие
  if (isAbsExercise(exerciseName)) {
    return 'common';
  }
  
  // Упражнения груди
  const chestKeywords = ['жим лежа', 'жим на наклонной', 'разводка', 'кроссовер', 'отжимания', 'грудь', 'пек'];
  if (chestKeywords.some(k => name.includes(k))) {
    return 'chest';
  }
  
  // Упражнения спины
  const backKeywords = ['становая тяга', 'тяга штанги', 'подтягивания', 'тяга гантели', 'горизонтальная тяга', 'спина', 'широчайш'];
  if (backKeywords.some(k => name.includes(k))) {
    return 'back';
  }
  
  // Упражнения ног
  const legsKeywords = ['приседания', 'жим ногами', 'выпады', 'разгибание ног', 'сгибание ног', 'ноги', 'квадрицепс', 'бицепс бедра'];
  if (legsKeywords.some(k => name.includes(k))) {
    return 'legs';
  }
  
  // По умолчанию - общие
  return 'common';
};
