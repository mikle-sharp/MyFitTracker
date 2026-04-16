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

// Типы снаряда
export type EquipmentType = 
  | 'barbell_20' 
  | 'barbell_10' 
  | 'trap_bar' 
  | 'ez_bar' 
  | 'w_bar'
  | 'dumbbells'
  | 'ball'
  | 'rope'
  | 'straight_crossover'
  | 'ez_crossover'
  | 'power_grip'
  | 'v_handle'
  | 'parallel_bar';

// Типы хвата
export type GripType = 'wide' | 'narrow' | 'parallel' | 'cross' | 'reverse' | 'alternate';

// Типы позиции
export type PositionType = 'sitting' | 'lying' | 'standing';

// Единицы измерения веса
export type WeightUnit = 'kg' | 'lb' | 'lvl';

// Константы для единиц измерения веса
export const WEIGHT_UNITS: Record<WeightUnit, { short: string; full: string; placeholder: string }> = {
  kg: { short: 'кг', full: 'Килограмм', placeholder: 'кг' },
  lb: { short: 'ф', full: 'Фунт', placeholder: 'ф' },
  lvl: { short: 'ур', full: 'Уровень', placeholder: 'ур' },
};

// Подход
export interface WorkoutSet {
  id: string;
  reps: number;
  weight: number; // значение веса (единица измерения в weightUnit)
  time?: number; // время в секундах
  inputType?: ExerciseInputType; // тип ввода для этого подхода
  isWarmup?: boolean; // разминочный подход
  timestamp?: string; // время добавления подхода (ISO string)
  equipmentType?: EquipmentType; // тип снаряда
  gripType?: GripType; // тип хвата
  positionType?: PositionType; // позиция
  weightUnit?: WeightUnit; // единица измерения веса (по умолчанию kg)
}

// Константы для типов снаряда (упорядочены по полному названию)
export const EQUIPMENT_TYPES: Record<EquipmentType, { short: string; full: string }> = {
  w_bar: { short: 'w-г', full: 'W-гриф' },
  ez_bar: { short: 'ez-г', full: 'EZ-гриф' },
  ez_crossover: { short: 'ez-к', full: 'EZ-гриф для кроссовера' },
  power_grip: { short: 'p-g', full: 'Power-grip' },
  v_handle: { short: 'v-р', full: 'V-образная ручка' },
  dumbbells: { short: 'ган', full: 'Гантели' },
  rope: { short: 'кан', full: 'Канат' },
  ball: { short: 'мяч', full: 'Мяч' },
  parallel_bar: { short: 'п-г', full: 'Параллельный гриф' },
  straight_crossover: { short: 'п-к', full: 'Прямой гриф для кроссовера' },
  trap_bar: { short: 'т-г', full: 'Трэп-гриф' },
  barbell_10: { short: 'ш-10', full: 'Штанга 10 кг' },
  barbell_20: { short: 'ш-20', full: 'Штанга 20 кг' },
};

// Константы для типов хвата
export const GRIP_TYPES: Record<GripType, { short: string; full: string }> = {
  wide: { short: 'шир', full: 'Широкий' },
  narrow: { short: 'узк', full: 'Узкий' },
  parallel: { short: 'пар', full: 'Параллельный' },
  cross: { short: 'пер', full: 'Перекрёстный' },
  reverse: { short: 'обр', full: 'Обратный' },
  alternate: { short: '1-р', full: 'Поочерёдный' },
};

// Константы для типов позиции
export const POSITION_TYPES: Record<PositionType, { short: string; full: string }> = {
  sitting: { short: 'сидя', full: 'Сидя' },
  lying: { short: 'лёжа', full: 'Лёжа' },
  standing: { short: 'стоя', full: 'Стоя' },
};

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
  weight?: number; // вес пользователя в кг (один знак после запятой)
  duration?: number; // длительность в минутах (для импортированных данных)
  createdAt: string;
  updatedAt: string;
}

// Данные о рекорде
export interface RecordData {
  value: number;        // вес для weight рекорда, объём для volume рекорда
  reps: number;         // повторения
  time?: number;        // время в секундах (для упражнений на время)
  date: string;         // дата установки рекорда
  workoutId: string;    // ID тренировки
  setId: string;        // ID подхода (уникальный идентификатор)
  weightUnit?: WeightUnit; // единица измерения веса
  isBodyweight?: boolean;  // true если собственный вес (weight=0)
}

// Рекорды для одной единицы измерения
export interface UnitRecords {
  weightRecord: RecordData | null;
  prevWeightRecord: RecordData | null;
  volumeRecord: RecordData | null;
  prevVolumeRecord: RecordData | null;
}

// Личный рекорд (рекорды по каждой единице измерения отдельно)
export interface PersonalRecord {
  exerciseName: string;
  workoutType: WorkoutType; // тип тренировки для цветовой индикации
  // Рекорды по единицам измерения
  kg: UnitRecords;
  lb: UnitRecords;
  lvl: UnitRecords;
}

// Тип для базы упражнений (ключи - типы для цветовой маркировки)
export type ExerciseBaseKey = 'chest' | 'back' | 'legs' | 'common';
export type ExercisesBase = Record<ExerciseBaseKey, string[]>;

// Дефолтная база упражнений (пустая - реальная база загружается из all-exercises.json)
export const DEFAULT_EXERCISES_BASE: ExercisesBase = {
  chest: [],
  back: [],
  legs: [],
  common: [],
};

// Предустановленные упражнения для каждого типа тренировки (для обратной совместимости)
export const DEFAULT_EXERCISES: Record<WorkoutType, string[]> = {
  chest: DEFAULT_EXERCISES_BASE.chest,
  back: DEFAULT_EXERCISES_BASE.back,
  legs: DEFAULT_EXERCISES_BASE.legs,
  fullbody: [
    ...DEFAULT_EXERCISES_BASE.chest.slice(0, 2),
    ...DEFAULT_EXERCISES_BASE.back.slice(0, 2),
    ...DEFAULT_EXERCISES_BASE.legs.slice(0, 2),
    'Планка',
  ],
};

// Упражнения на пресс (требуют особого ввода)
export const ABS_EXERCISES = DEFAULT_EXERCISES_BASE.common;



// Цвета для типов тренировок (hex без прозрачности)
export const WORKOUT_TYPE_COLORS: Record<WorkoutType, { bg: string; text: string; border: string }> = {
  chest: {
    bg: '#391013',
    text: '#c93843',
    border: '#9a1d24',
  },
  back: {
    bg: '#10203c',
    text: '#3871d4',
    border: '#1d4fa0',
  },
  legs: {
    bg: '#072f18',
    text: '#19a655',
    border: '#037b34',
  },
  fullbody: {
    bg: '#1a0a2e',
    text: '#944ad4',
    border: '#6b2da1',
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

// Цвета для типов упражнений (для цветовой маркировки внутри карточек, hex без прозрачности)
export const EXERCISE_TYPE_COLORS: Record<ExerciseType, { bg: string; text: string; border: string }> = {
  chest: {
    bg: '#391013',
    text: '#c93843',
    border: '#9a1d24',
  },
  back: {
    bg: '#10203c',
    text: '#3871d4',
    border: '#1d4fa0',
  },
  legs: {
    bg: '#072f18',
    text: '#19a655',
    border: '#037b34',
  },
  common: {
    bg: '#1a0a2e',
    text: '#944ad4',
    border: '#6b2da1',
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

// Шаблон тренировки
export interface WorkoutTemplate {
  id: string;
  name: string;
  workoutType: WorkoutType;
  exerciseNames: string[]; // только названия упражнений, без весов и подходов
  createdAt: string;
}
