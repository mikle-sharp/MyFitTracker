import { Workout, PersonalRecord, WorkoutSet } from './types';
import { getWorkouts } from './storage';

// Расчет всех личных рекордов
export const calculatePersonalRecords = (): PersonalRecord[] => {
  const workouts = getWorkouts();
  const records: Map<string, PersonalRecord> = new Map();

  workouts.forEach(workout => {
    workout.exercises.forEach(exercise => {
      exercise.sets.forEach(set => {
        // Пропускаем подходы без веса или с нулевым весом (собственный вес)
        if (!set.weight || set.weight <= 0) return;
        
        const currentRecord = records.get(exercise.name);
        
        // Рекорд - максимальный вес
        // Если вес больше текущего рекорда, обновляем
        if (!currentRecord || set.weight > currentRecord.maxWeight) {
          records.set(exercise.name, {
            exerciseName: exercise.name,
            maxWeight: set.weight,
            reps: set.reps,
            date: workout.date,
            workoutId: workout.id,
            workoutType: workout.type,
          });
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

// Проверка, является ли вес новым рекордом
export const isNewPersonalRecord = (
  exerciseName: string,
  weight: number
): boolean => {
  const currentRecord = getPersonalRecord(exerciseName);
  return !currentRecord || weight > currentRecord.maxWeight;
};

// Форматирование рекорда для отображения
export const formatPersonalRecord = (record: PersonalRecord): string => {
  return `${record.reps} × ${record.maxWeight} кг`;
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
