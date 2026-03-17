import { Workout, PersonalRecord, RecordData, WorkoutSet } from './types';
import { getWorkouts } from './storage';

// Проверка, совпадают ли два рекорда (один и тот же подход)
const isSameRecord = (rec1: RecordData | null, rec2: RecordData | null): boolean => {
  if (!rec1 || !rec2) return false;
  return (
    rec1.date === rec2.date &&
    rec1.workoutId === rec2.workoutId &&
    rec1.setIndex === rec2.setIndex
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

// Расчёт всех личных рекордов
export const calculatePersonalRecords = (): PersonalRecord[] => {
  const workouts = getWorkouts();
  const records: Map<string, PersonalRecord> = new Map();

  // Сортируем тренировки по дате (от старых к новым) для правильного отслеживания первого рекорда
  const sortedWorkouts = [...workouts].sort((a, b) => a.date.localeCompare(b.date));

  sortedWorkouts.forEach(workout => {
    workout.exercises.forEach((exercise, exerciseIndex) => {
      exercise.sets.forEach((set, setIndex) => {
        // Пропускаем подходы без веса или с нулевым весом (собственный вес)
        if (!set.weight || set.weight <= 0) return;
        
        const currentRecord = records.get(exercise.name);
        const volume = set.weight * set.reps;
        
        // Данные о текущем подходе
        const setData: RecordData = {
          value: set.weight,
          reps: set.reps,
          date: workout.date,
          workoutId: workout.id,
          setIndex: setIndex
        };
        
        const volumeData: RecordData = {
          value: volume,
          reps: set.reps,
          date: workout.date,
          workoutId: workout.id,
          setIndex: setIndex
        };
        
        if (!currentRecord) {
          // Первое упражнение - создаём запись только с weightRecord
          // volumeRecord будет добавлен позже, если найдётся другой подход с большим объёмом
          records.set(exercise.name, {
            exerciseName: exercise.name,
            workoutType: workout.type,
            weightRecord: { ...setData, value: set.weight },
            prevWeightRecord: null,
            volumeRecord: null,
            prevVolumeRecord: null
          });
        } else {
          // Обновляем существующую запись
          const updated: PersonalRecord = { ...currentRecord };
          
          // Проверяем рекорд по весу
          const isWeightRecord = isBetterWeightRecord(set.weight, set.reps, currentRecord.weightRecord);
          
          if (isWeightRecord) {
            updated.prevWeightRecord = currentRecord.weightRecord;
            updated.weightRecord = { ...setData, value: set.weight };
            // Если новый рекорд по весу совпадает с текущим рекордом по объёму - удаляем volumeRecord
            if (isSameRecord(updated.weightRecord, updated.volumeRecord)) {
              updated.prevVolumeRecord = updated.volumeRecord;
              updated.volumeRecord = null;
            }
          }
          
          // Проверяем рекорд по объёму (строго больше)
          const isVolumeRecord = isBetterVolumeRecord(volume, currentRecord.volumeRecord);
          
          if (isVolumeRecord) {
            // Проверяем, что это не тот же подход, что и текущий рекорд по весу
            if (!isSameRecord(updated.weightRecord, volumeData)) {
              updated.prevVolumeRecord = currentRecord.volumeRecord;
              updated.volumeRecord = volumeData;
            }
          }
          
          records.set(exercise.name, updated);
        }
      });
    });
  });

  return Array.from(records.values()).sort((a, b) => 
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
  currentSetIndex: number,
  currentWorkoutId: string
): 'weight' | 'volume' | null => {
  if (weight <= 0) return null;
  
  const record = getPersonalRecord(exerciseName);
  if (!record) return null;
  
  const volume = weight * reps;
  
  // Проверяем рекорд по весу - только если это именно тот подход, который установил рекорд
  if (record.weightRecord) {
    const isWeightMatch = 
      weight === record.weightRecord.value &&
      reps === record.weightRecord.reps &&
      currentWorkoutId === record.weightRecord.workoutId &&
      currentSetIndex === record.weightRecord.setIndex;
    
    if (isWeightMatch) return 'weight';
  }
  
  // Проверяем рекорд по объёму - только если это именно тот подход
  if (record.volumeRecord) {
    const isVolumeMatch = 
      volume === record.volumeRecord.value &&
      reps === record.volumeRecord.reps &&
      currentWorkoutId === record.volumeRecord.workoutId &&
      currentSetIndex === record.volumeRecord.setIndex;
    
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
