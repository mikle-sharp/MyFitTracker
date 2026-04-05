import { Workout, PersonalRecord, RecordData, WorkoutSet, WorkoutType, WeightUnit, UnitRecords } from './types';
import { getWorkouts } from './storage';

// Создание пустой структуры UnitRecords
const createEmptyUnitRecords = (): UnitRecords => ({
  weightRecord: null,
  prevWeightRecord: null,
  volumeRecord: null,
  prevVolumeRecord: null,
});

// Проверка, совпадают ли два рекорда (один и тот же подход)
const isSameRecord = (rec1: RecordData | null, rec2: RecordData | null): boolean => {
  if (!rec1 || !rec2) return false;
  return (
    rec1.date === rec2.date &&
    rec1.workoutId === rec2.workoutId &&
    rec1.setId === rec2.setId
  );
};

// Сравнение рекордов по весу
// Возвращает true, если новый подход лучше текущего рекорда
const isBetterWeightRecord = (
  newWeight: number,
  newReps: number,
  newTime: number | undefined,
  currentRecord: RecordData | null
): boolean => {
  if (!currentRecord) return newWeight > 0;

  // Больше вес = лучше
  if (newWeight > currentRecord.value) return true;

  // При равном весе сравниваем по времени или повторениям
  if (newWeight === currentRecord.value) {
    // Если оба подхода на время - больше время = лучше
    if (newTime && currentRecord.time) {
      return newTime > currentRecord.time;
    }
    // Если только новый на время - он лучше (время ценнее повторений для одной категории)
    if (newTime && !currentRecord.time) {
      return true;
    }
    // Иначе больше повторений = лучше
    if (newReps > currentRecord.reps) return true;
  }

  return false;
};

// Сравнение рекордов по объёму
const isBetterVolumeRecord = (
  newVolume: number,
  currentRecord: RecordData | null
): boolean => {
  if (!currentRecord) return newVolume > 0;
  return newVolume > currentRecord.value;
};

// Расчёт "объёма" для подхода
// - Для подходов с весом и повторениями: вес × повторения
// - Для подходов с весом и временем (без повторений): вес × время
// - Для собственного веса (weight=0): повторения
// - Для времени без веса: время в секундах
const calculateVolume = (set: WorkoutSet): number => {
  if (set.weight > 0 && set.reps > 0) {
    return set.weight * set.reps;
  }
  if (set.weight > 0 && set.time && set.time > 0) {
    return set.weight * set.time; // вес × время для упражнений на время с отягощением
  }
  if (set.reps > 0) {
    return set.reps; // собственный вес
  }
  if (set.time && set.time > 0) {
    return set.time; // время
  }
  return 0;
};

// Расчёт всех личных рекордов
export const calculatePersonalRecords = (): PersonalRecord[] => {
  const workouts = getWorkouts();
  
  // Сортируем тренировки по дате (от старых к новым)
  const sortedWorkouts = [...workouts].sort((a, b) => a.date.localeCompare(b.date));
  
  // Собираем все подходы для каждого упражнения с метаданными
  interface SetInfo {
    set: WorkoutSet;
    workout: Workout;
    exercise: { name: string; type: WorkoutType };
  }
  
  const setsByExercise = new Map<string, SetInfo[]>();
  
  sortedWorkouts.forEach(workout => {
    workout.exercises.forEach(exercise => {
      const existing = setsByExercise.get(exercise.name) || [];
      workout.exercises.forEach(ex => {
        if (ex.name === exercise.name) {
          ex.sets.forEach(set => {
            existing.push({
              set,
              workout,
              exercise: { name: ex.name, type: workout.type }
            });
          });
        }
      });
      setsByExercise.set(exercise.name, existing);
    });
  });

  const records: PersonalRecord[] = [];

  setsByExercise.forEach((sets, exerciseName) => {
    if (sets.length === 0) return;

    // Рекорды по каждой единице измерения
    const recordsByUnit: Record<WeightUnit, UnitRecords> = {
      kg: createEmptyUnitRecords(),
      lb: createEmptyUnitRecords(),
      lvl: createEmptyUnitRecords(),
    };

    // История рекордов по весу для каждой единицы (для вычисления предыдущего рекорда)
    const weightRecordHistoryByUnit: Record<WeightUnit, RecordData[]> = {
      kg: [],
      lb: [],
      lvl: [],
    };

    // История рекордов по объёму для каждой единицы
    const volumeRecordHistoryByUnit: Record<WeightUnit, RecordData[]> = {
      kg: [],
      lb: [],
      lvl: [],
    };

    // Идём хронологически
    sets.forEach(({ set, workout }) => {
      // Определяем единицу измерения (по умолчанию kg)
      const unit: WeightUnit = set.weightUnit || 'kg';
      const unitRecords = recordsByUnit[unit];

      // Золотой рекорд (по весу) - только для подходов с весом > 0
      if (set.weight > 0 && !set.isWarmup) {
        const candidate: RecordData = {
          value: set.weight,
          reps: set.reps,
          time: set.time,
          date: workout.date,
          workoutId: workout.id,
          setId: set.id,
          weightUnit: unit,
        };

        if (isBetterWeightRecord(set.weight, set.reps, set.time, unitRecords.weightRecord)) {
          if (unitRecords.weightRecord) {
            weightRecordHistoryByUnit[unit].push(unitRecords.weightRecord);
          }
          unitRecords.prevWeightRecord = unitRecords.weightRecord;
          unitRecords.weightRecord = candidate;
        }
      }

      // Бронзовый рекорд (по объёму)
      const volume = calculateVolume(set);
      if (volume > 0 && !set.isWarmup) {
        // Пропускаем подход, который является золотым рекордом для этой единицы
        if (unitRecords.weightRecord && unitRecords.weightRecord.setId === set.id) {
          return;
        }

        const candidate: RecordData = {
          value: volume,
          reps: set.reps,
          time: set.time,
          date: workout.date,
          workoutId: workout.id,
          setId: set.id,
          weightUnit: unit,
        };

        if (isBetterVolumeRecord(volume, unitRecords.volumeRecord)) {
          if (unitRecords.volumeRecord) {
            volumeRecordHistoryByUnit[unit].push(unitRecords.volumeRecord);
          }
          unitRecords.prevVolumeRecord = unitRecords.volumeRecord;
          unitRecords.volumeRecord = candidate;
        }
      }
    });

    // Проверяем, есть ли хоть один рекорд в любой единице
    const hasAnyRecord = Object.values(recordsByUnit).some(
      ur => ur.weightRecord || ur.volumeRecord
    );

    if (hasAnyRecord) {
      records.push({
        exerciseName,
        workoutType: sets[0].exercise.type,
        kg: recordsByUnit.kg,
        lb: recordsByUnit.lb,
        lvl: recordsByUnit.lvl,
      });
    }
  });

  return records.sort((a, b) => 
    a.exerciseName.localeCompare(b.exerciseName, 'ru')
  );
};

// Получение личного рекорда для конкретного упражнения
export const getPersonalRecord = (exerciseName: string): PersonalRecord | null => {
  const records = calculatePersonalRecords();
  return records.find(r => r.exerciseName === exerciseName) || null;
};

// Проверка, является ли подход рекордным (для подсветки в ExerciseCard)
// Возвращает тип рекорда или null
export const getRecordType = (
  exerciseName: string,
  weight: number,
  reps: number,
  currentSetId: string,
  currentWorkoutId: string,
  time?: number,
  weightUnit?: WeightUnit
): 'weight' | 'volume' | null => {
  const record = getPersonalRecord(exerciseName);
  if (!record) return null;

  // Определяем единицу измерения (по умолчанию kg)
  const unit: WeightUnit = weightUnit || 'kg';
  const unitRecords = record[unit];

  // Проверяем рекорд по весу - только если вес > 0
  if (weight > 0 && unitRecords.weightRecord) {
    const isWeightMatch = 
      weight === unitRecords.weightRecord.value &&
      reps === unitRecords.weightRecord.reps &&
      currentWorkoutId === unitRecords.weightRecord.workoutId &&
      currentSetId === unitRecords.weightRecord.setId;
    
    if (isWeightMatch) return 'weight';
  }
  
  // Проверяем рекорд по объёму
  if (unitRecords.volumeRecord) {
    const volume = calculateVolume({ 
      id: currentSetId, 
      weight, 
      reps, 
      time,
      weightUnit: unit
    } as WorkoutSet);
    
    const isVolumeMatch = 
      volume === unitRecords.volumeRecord.value &&
      currentWorkoutId === unitRecords.volumeRecord.workoutId &&
      currentSetId === unitRecords.volumeRecord.setId;
    
    if (isVolumeMatch) return 'volume';
  }
  
  return null;
};

// Получение истории упражнения
export const getExerciseHistory = (
  exerciseName: string
): { date: string; sets: { reps: number; weight: number; time?: number; weightUnit?: WeightUnit }[] }[] => {
  const workouts = getWorkouts();
  const history: { date: string; sets: { reps: number; weight: number; time?: number; weightUnit?: WeightUnit }[] }[] = [];

  workouts
    .sort((a, b) => b.date.localeCompare(a.date))
    .forEach(workout => {
      const exercise = workout.exercises.find(e => e.name === exerciseName);
      if (exercise && exercise.sets.length > 0) {
        history.push({
          date: workout.date,
          sets: exercise.sets.map(s => ({ reps: s.reps, weight: s.weight, time: s.time, weightUnit: s.weightUnit })),
        });
      }
    });

  return history;
};

// Получение статистики по тренировкам
export const getWorkoutStats = (): {
  totalWorkouts: number;
  totalExercises: number;
  totalSets: number;
  totalReps: number;
  totalWeight: number;
  totalTime: number;
  workoutTypes: Record<string, number>;
} => {
  const workouts = getWorkouts();
  
  const stats = {
    totalWorkouts: workouts.length,
    totalExercises: 0,
    totalSets: 0,
    totalReps: 0,
    totalWeight: 0,
    totalTime: 0,
    workoutTypes: {} as Record<string, number>,
  };

  workouts.forEach(workout => {
    // Подсчет по типам
    stats.workoutTypes[workout.type] = (stats.workoutTypes[workout.type] || 0) + 1;

    workout.exercises.forEach(exercise => {
      stats.totalExercises++;
      
      exercise.sets.forEach(set => {
        stats.totalSets++;
        stats.totalReps += set.reps;
        stats.totalWeight += set.weight * set.reps;
        if (set.time) {
          stats.totalTime += set.time;
        }
      });
    });
  });

  return stats;
};

// Получение прогресса по упражнению (последние N тренировок)
export const getExerciseProgress = (
  exerciseName: string,
  lastN: number = 5
): { date: string; maxWeight: number; totalVolume: number }[] => {
  const history = getExerciseHistory(exerciseName);
  
  return history.slice(0, lastN).map(h => {
    const maxWeight = Math.max(...h.sets.map(s => s.weight), 0);
    const totalVolume = h.sets.reduce((sum, s) => sum + s.weight * s.reps, 0);
    return {
      date: h.date,
      maxWeight,
      totalVolume,
    };
  });
};
