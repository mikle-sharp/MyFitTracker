import { Workout, PersonalRecord, RecordData, WorkoutSet } from './types';
import { getWorkouts } from './storage';

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
  currentRecord: RecordData | null
): boolean => {
  if (!currentRecord) return newWeight > 0;
  
  // Больше вес = лучше
  if (newWeight > currentRecord.value) return true;
  // При равном весе больше повторений = лучше
  if (newWeight === currentRecord.value && newReps > currentRecord.reps) return true;
  
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
// - Для подходов с весом: вес × повторения
// - Для собственного веса (weight=0): повторения
// - Для времени: время в секундах
const calculateVolume = (set: WorkoutSet): number => {
  if (set.weight > 0) {
    return set.weight * set.reps;
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
      exercise.sets.forEach(set => {
        const existing = setsByExercise.get(exercise.name) || [];
        existing.push({
          set,
          workout,
          exercise: { name: exercise.name, type: workout.type }
        });
        setsByExercise.set(exercise.name, existing);
      });
    });
  });
  
  const records: PersonalRecord[] = [];
  
  // Для каждого упражнения вычисляем рекорды
  setsByExercise.forEach((sets, exerciseName) => {
    // === ПРОХОД 1: Находим золотой рекорд (по весу) ===
    // Золотой рекорд может быть только у подходов с весом > 0
    const setsWithWeight = sets.filter(s => s.set.weight > 0);
    
    let weightRecord: RecordData | null = null;
    let prevWeightRecord: RecordData | null = null;
    const weightRecordHistory: RecordData[] = []; // история для восстановления при удалении
    
    // Проходим хронологически для weight рекорда
    setsWithWeight.forEach(({ set, workout }) => {
      const candidate: RecordData = {
        value: set.weight,
        reps: set.reps,
        date: workout.date,
        workoutId: workout.id,
        setId: set.id
      };
      
      if (isBetterWeightRecord(set.weight, set.reps, weightRecord)) {
        if (weightRecord) {
          weightRecordHistory.push(weightRecord);
        }
        prevWeightRecord = weightRecord;
        weightRecord = candidate;
      }
    });
    
    // === ПРОХОД 2: Находим бронзовый рекорд (по объёму) ===
    // Бронзовый рекорд - среди ВСЕХ подходов, КРОМЕ того, который является золотым
    let volumeRecord: RecordData | null = null;
    let prevVolumeRecord: RecordData | null = null;
    const volumeRecordHistory: RecordData[] = [];
    
    // Идём хронологически
    sets.forEach(({ set, workout }) => {
      const volume = calculateVolume(set);
      if (volume <= 0) return;
      
      // Пропускаем подход, который является золотым рекордом
      if (weightRecord && weightRecord.setId === set.id) return;
      
      const candidate: RecordData = {
        value: volume,
        reps: set.reps,
        time: set.time,
        date: workout.date,
        workoutId: workout.id,
        setId: set.id
      };
      
      if (isBetterVolumeRecord(volume, volumeRecord)) {
        if (volumeRecord) {
          volumeRecordHistory.push(volumeRecord);
        }
        prevVolumeRecord = volumeRecord;
        volumeRecord = candidate;
      }
    });
    
    // Если есть хотя бы один рекорд - создаём запись
    if (weightRecord || volumeRecord) {
      records.push({
        exerciseName,
        workoutType: sets[0].exercise.type,
        weightRecord,
        prevWeightRecord,
        volumeRecord,
        prevVolumeRecord
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
  time?: number
): 'weight' | 'volume' | null => {
  const record = getPersonalRecord(exerciseName);
  if (!record) return null;
  
  // Проверяем рекорд по весу - только если вес > 0
  if (weight > 0 && record.weightRecord) {
    const isWeightMatch = 
      weight === record.weightRecord.value &&
      reps === record.weightRecord.reps &&
      currentWorkoutId === record.weightRecord.workoutId &&
      currentSetId === record.weightRecord.setId;
    
    if (isWeightMatch) return 'weight';
  }
  
  // Проверяем рекорд по объёму
  if (record.volumeRecord) {
    const volume = calculateVolume({ 
      id: currentSetId, 
      weight, 
      reps, 
      time 
    } as WorkoutSet);
    
    const isVolumeMatch = 
      volume === record.volumeRecord.value &&
      currentWorkoutId === record.volumeRecord.workoutId &&
      currentSetId === record.volumeRecord.setId;
    
    if (isVolumeMatch) return 'volume';
  }
  
  return null;
};

// Форматирование рекорда по весу для отображения
export const formatWeightRecord = (record: RecordData | null): string => {
  if (!record) return '-';
  return `${record.value} кг × ${record.reps}`;
};

// Форматирование рекорда по объёму для отображения
export const formatVolumeRecord = (record: RecordData | null): string => {
  if (!record) return '-';
  return `${record.value} кг`;
};

// Форматирование времени
export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// Форматирование подхода для отображения
export const formatSet = (set: WorkoutSet): string => {
  const parts: string[] = [];
  
  if (set.weight > 0) {
    parts.push(`${set.reps} × ${set.weight} кг`);
  } else if (set.reps > 0) {
    parts.push(`${set.reps} повторений`);
  }
  
  if (set.time && set.time > 0) {
    parts.push(formatTime(set.time));
  }
  
  return parts.join(' | ');
};

// Получение истории упражнения
export const getExerciseHistory = (
  exerciseName: string
): { date: string; sets: { reps: number; weight: number; time?: number }[] }[] => {
  const workouts = getWorkouts();
  const history: { date: string; sets: { reps: number; weight: number; time?: number }[] }[] = [];

  workouts
    .sort((a, b) => b.date.localeCompare(a.date))
    .forEach(workout => {
      const exercise = workout.exercises.find(e => e.name === exerciseName);
      if (exercise && exercise.sets.length > 0) {
        history.push({
          date: workout.date,
          sets: exercise.sets.map(s => ({ reps: s.reps, weight: s.weight, time: s.time })),
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
