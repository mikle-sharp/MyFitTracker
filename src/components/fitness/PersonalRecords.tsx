'use client';

import { useMemo, useRef, useState, useEffect } from 'react';
import { calculatePersonalRecords } from '@/lib/pr';
import { motion } from 'framer-motion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { EXERCISE_TYPE_COLORS, EXERCISE_TYPE_NAMES, ExerciseType, WEIGHT_UNITS, WeightUnit, EquipmentType, GripType, PositionType } from '@/lib/types';
import { getExerciseTypeFromBase, isDefaultFont } from '@/lib/storage';
import { DumbbellIcon, TargetIcon, LegsIcon, HeartIcon, SearchIcon, ClockIcon, TrendingUpIcon } from '@/components/icons/Icons';
import { ExerciseStatsChart, SetInfo, ChartDataPoint } from './ExerciseStatsChart';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { XIcon } from '@/components/icons/Icons';
import { useFitnessStore } from '@/lib/store';
import { ExerciseHistoryModal } from './ExerciseHistoryModal';

// Компонент иконки типа упражнения
function ExerciseTypeIcon({ type, color, isDefaultStyle }: { type: ExerciseType; color: string; isDefaultStyle: boolean }) {
  const iconStyle = { color: color };

  if (isDefaultStyle) {
    switch (type) {
      case 'chest': return <DumbbellIcon className="w-6 h-6" style={iconStyle} />;
      case 'back': return <TargetIcon className="w-6 h-6" style={iconStyle} />;
      case 'legs': return <LegsIcon className="w-6 h-6" style={iconStyle} />;
      case 'common': return <HeartIcon className="w-6 h-6" style={iconStyle} />;
    }
  }
  switch (type) {
    case 'chest': return <DumbbellIcon className="w-6 h-6" style={iconStyle} />;
    case 'back': return <TargetIcon className="w-6 h-6" style={iconStyle} />;
    case 'legs': return <LegsIcon className="w-6 h-6" style={iconStyle} />;
    case 'common': return <HeartIcon className="w-6 h-6" style={iconStyle} />;
  }
}

// Компонент для названия упражнения с авто-размером шрифта
function ExerciseName({ name }: { name: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [fontSize, setFontSize] = useState<'text-base' | 'text-sm'>('text-base');

  useEffect(() => {
    if (ref.current) {
      const lineHeight = parseFloat(getComputedStyle(ref.current).lineHeight);
      const height = ref.current.scrollHeight;
      const lines = height / lineHeight;
      if (lines > 2) {
        setFontSize('text-sm');
      }
    }
  }, [name]);

  return (
    <span ref={ref} className={`font-medium text-white break-words ${fontSize}`}>{name}</span>
  );
}

const WEIGHT_RECORD_COLOR = '#ffb900';
const VOLUME_RECORD_COLOR = '#cd7f32';

interface PersonalRecordsProps {
  onNavigateToWorkout?: (date: string, exerciseName: string, setId: string) => void;
}


export function PersonalRecords({ onNavigateToWorkout }: PersonalRecordsProps) {
  const allRecords = useMemo(() => calculatePersonalRecords(), []);
  const [isDefaultStyle, setIsDefaultStyle] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [exerciseTypeFilter, setExerciseTypeFilter] = useState<ExerciseType | null>(null);
  
  // Состояние для статистики
  const [statsExercise, setStatsExercise] = useState<string | null>(null);
  const { workouts } = useFitnessStore();

  // Состояние для мини-карточки из статистики
  const [showHistoryFromStats, setShowHistoryFromStats] = useState(false);
  const [historyFromDate, setHistoryFromDate] = useState<string>('');
  const [historyHighlightSetId, setHistoryHighlightSetId] = useState<string | undefined>(undefined);
  const [historyExerciseName, setHistoryExerciseName] = useState<string>('');

  // Проверяем стиль при монтировании
  useEffect(() => {
    setIsDefaultStyle(isDefaultFont());
  }, []);

  // Фильтрация записей
  const filteredRecords = useMemo(() => {
    let result = allRecords;

    // Фильтр по типу упражнения
    if (exerciseTypeFilter) {
      result = result.filter(record => {
        const exerciseType = getExerciseTypeFromBase(record.exerciseName);
        return exerciseType === exerciseTypeFilter;
      });
    }

    // Фильтр по поиску
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(record => 
        record.exerciseName.toLowerCase().includes(query)
      );
    }

    // Сортировка: сначала по тегу, затем по алфавиту
    const typeOrder: ExerciseType[] = ['chest', 'back', 'legs', 'common'];
    result = [...result].sort((a, b) => {
      const typeA = getExerciseTypeFromBase(a.exerciseName);
      const typeB = getExerciseTypeFromBase(b.exerciseName);
      const orderA = typeOrder.indexOf(typeA);
      const orderB = typeOrder.indexOf(typeB);
      if (orderA !== orderB) {
        return orderA - orderB;
      }
      return a.exerciseName.localeCompare(b.exerciseName, 'ru');
    });

    return result;
  }, [allRecords, exerciseTypeFilter, searchQuery]);

  // Получаем историю упражнения для статистики
  const statsExerciseHistory = useMemo(() => {
    if (!statsExercise || !workouts) return [];

    const history: ChartDataPoint[] = [];

    workouts.forEach(w => {
      const exerciseInWorkout = w.exercises.find(e => e.name === statsExercise);
      if (exerciseInWorkout && exerciseInWorkout.sets.length > 0) {
        const setsByUnit = new Map<WeightUnit, typeof exerciseInWorkout.sets>();

        exerciseInWorkout.sets.forEach(set => {
          if (set.isWarmup || set.weight === 0) return;
          const unit = set.weightUnit || 'kg';
          const existing = setsByUnit.get(unit) || [];
          existing.push(set);
          setsByUnit.set(unit, existing);
        });

        setsByUnit.forEach((sets, unit) => {
          // Сохраняем информацию о всех подходах для фильтрации
          const setsInfo: SetInfo[] = sets.map(s => ({
            weight: s.weight,
            reps: s.reps,
            time: s.time,
            equipmentType: s.equipmentType,
            gripType: s.gripType,
            positionType: s.positionType,
            setId: s.id,
          }));

          history.push({
            date: w.date,
            setsInfo,
            userWeight: w.weight,
            workoutId: w.id,
            weightUnit: unit,
          });
        });
      }
    });

    return history.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [statsExercise, workouts]);

  // Получаем цвета для упражнения статистики
  const statsExerciseType = statsExercise ? getExerciseTypeFromBase(statsExercise) : 'common';
  const statsExerciseTypeToWorkoutType: Record<ExerciseType, 'chest' | 'back' | 'legs' | 'fullbody'> = {
    chest: 'chest',
    back: 'back',
    legs: 'legs',
    common: 'fullbody',
  };
  const statsColors = EXERCISE_TYPE_COLORS[statsExerciseType];

  if (allRecords.length === 0) {
    return (
      <div className="bg-zinc-900/50 rounded-lg border border-zinc-800 p-4 text-center">
        <p className="text-zinc-500">У Вас пока нет рекордов</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-0 gap-4">
      {/* Search */}
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Поиск упражнения..."
          className="!bg-zinc-900/50 border border-zinc-700 rounded-lg text-white placeholder:text-[10px] pl-9"
          autoComplete="off"
          inputMode="search"
        />
      </div>

      {/* Type filter tags */}
      <div className="flex gap-3">
        {(['chest', 'back', 'legs', 'common'] as ExerciseType[]).map((type) => {
          const typeColors = EXERCISE_TYPE_COLORS[type];
          const isSelected = exerciseTypeFilter === type;
          return (
            <button
              key={type}
              type="button"
              onClick={() => setExerciseTypeFilter(isSelected ? null : type)}
              className="flex items-center justify-center px-2 py-1 rounded-lg text-sm font-medium transition-colors flex-1"
              style={isSelected ? {
                backgroundColor: typeColors.bg,
                color: typeColors.text,
              } : {
                backgroundColor: 'rgb(63 63 70 / 0.5)',
                color: '#d4d4d8',
              }}
            >
              <span className="truncate">{EXERCISE_TYPE_NAMES[type]}</span>
            </button>
          );
        })}
      </div>

      {/* Records list */}
      <div className="flex-1 min-h-0 bg-zinc-900/50 rounded-lg border border-zinc-800 overflow-hidden">
        <ScrollArea>
          <div className="p-2 space-y-2">
            {filteredRecords.length > 0 ? (
              filteredRecords.map((record, index) => {
                const exerciseType = getExerciseTypeFromBase(record.exerciseName);
                const colors = EXERCISE_TYPE_COLORS[exerciseType];
                
                // Собираем все рекорды по единицам измерения
                const units: WeightUnit[] = ['kg', 'lb', 'lvl'];
                const recordsByUnit = units.map(unit => ({
                  unit,
                  weightRecord: record[unit].weightRecord,
                  volumeRecord: record[unit].volumeRecord,
                })).filter(r => r.weightRecord || r.volumeRecord);
                
                return (
                  <motion.div
                    key={record.exerciseName}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="rounded-lg bg-zinc-800 border-l-4 overflow-hidden"
                    style={{ 
                      borderLeftColor: colors.border,
                    }}
                  >
                    {/* Строка 1: Иконка + Название */}
                    <div className="flex items-start gap-3 px-3 py-2">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(0,0,0,0.35)' }}>
                        <ExerciseTypeIcon type={exerciseType} color={colors.border} isDefaultStyle={isDefaultStyle} />
                      </div>
                      <ExerciseName name={record.exerciseName} />
                    </div>
                    
                    {/* Рекорды по каждой единице измерения */}
                    <div className="flex px-3 pb-2 gap-1">
                      {/* Кнопка статистики - по вертикальному центру всех строк */}
                      <div className="w-9 flex items-center justify-center shrink-0 self-center">
                        <button
                          type="button"
                          data-slot="button"
                          onClick={() => setStatsExercise(record.exerciseName)}
                          className="inline-flex items-center justify-center shrink-0 text-zinc-500 hover:text-white active:text-white hover:!bg-transparent active:!bg-transparent p-0 w-7 h-7"
                          title="Статистика упражнения"
                        >
                          <TrendingUpIcon className="w-4 h-4" />
                        </button>
                      </div>
                      
                      {/* Рекорды */}
                      <div className="flex-1 flex flex-col gap-0.5">
                        {recordsByUnit.map(({ unit, weightRecord, volumeRecord }) => (
                          <div key={unit} className="grid grid-cols-2 gap-1">
                            {/* Рекорд по весу */}
                            <div className="flex flex-col items-start">
                              {weightRecord && (
                                <>
                                  <button
                                    onClick={() => onNavigateToWorkout?.(
                                      weightRecord!.date,
                                      record.exerciseName,
                                      weightRecord!.setId
                                    )}
                                    className="inline-flex items-center gap-1 hover:bg-zinc-700/50 active:bg-zinc-700/50 transition-colors rounded-lg px-1 -ml-1"
                                  >
                                    <span style={{ color: WEIGHT_RECORD_COLOR }} className="font-medium text-sm">
                                      {weightRecord.value} {WEIGHT_UNITS[unit].short}
                                    </span>
                                    {weightRecord.time && weightRecord.time > 0 ? (
                                      <>
                                        <ClockIcon className="w-2 h-2 text-zinc-500" />
                                        <span style={{ color: WEIGHT_RECORD_COLOR }} className="font-medium text-sm">
                                          {Math.floor(weightRecord.time / 60)}:{(weightRecord.time % 60).toString().padStart(2, '0')}
                                        </span>
                                      </>
                                    ) : (
                                      <>
                                        <span className="text-zinc-500 text-sm">×</span>
                                        <span style={{ color: WEIGHT_RECORD_COLOR }} className="font-medium text-sm">
                                          {weightRecord.reps}
                                        </span>
                                      </>
                                    )}
                                  </button>
                                  <span className="text-[10px] text-zinc-500">По весу</span>
                                </>
                              )}
                            </div>
                            
                            {/* Рекорд по объёму */}
                            <div className="flex flex-col items-start">
                              {volumeRecord && (() => {
                                const vr = volumeRecord;

                                let displayContent: React.ReactNode;

                                // Вес + время (без повторений): volume = weight * time
                                // Но НЕ bodyweight (тогда weight=0, и это просто время)
                                if (vr.time && vr.time > 0 && vr.reps === 0 && !vr.isBodyweight) {
                                  const weight = vr.value / vr.time;
                                  const weightStr = Number.isInteger(weight) ? String(weight) : weight.toFixed(1);
                                  const mins = Math.floor(vr.time / 60);
                                  const secs = vr.time % 60;
                                  const timeStr = `${mins}:${secs.toString().padStart(2, '0')}`;
                                  displayContent = (
                                    <>
                                      <span style={{ color: VOLUME_RECORD_COLOR }} className="font-medium text-sm">
                                        {weightStr} {WEIGHT_UNITS[unit].short}
                                      </span>
                                      <ClockIcon className="w-2 h-2 text-zinc-500" />
                                      <span style={{ color: VOLUME_RECORD_COLOR }} className="font-medium text-sm">
                                        {timeStr}
                                      </span>
                                    </>
                                  );
                                } else if (vr.time && vr.time > 0) {
                                  // Только время (без веса) - bodyweight или просто время
                                  const mins = Math.floor(vr.time / 60);
                                  const secs = vr.time % 60;
                                  const timeStr = `${mins}:${secs.toString().padStart(2, '0')}`;
                                  displayContent = (
                                    <>
                                      <ClockIcon className="w-2 h-2 text-zinc-500" />
                                      <span style={{ color: VOLUME_RECORD_COLOR }} className="font-medium text-sm">
                                        {timeStr}
                                      </span>
                                    </>
                                  );
                                } else if (vr.reps > 0 && vr.value === vr.reps) {
                                  displayContent = (
                                    <>
                                      <span style={{ color: VOLUME_RECORD_COLOR }} className="font-medium text-sm">
                                        {vr.reps}
                                      </span>
                                      <span className="text-zinc-500 text-[10px] ml-1">повт</span>
                                    </>
                                  );
                                } else if (vr.reps > 0) {
                                  const weight = vr.value / vr.reps;
                                  const weightStr = Number.isInteger(weight) ? String(weight) : weight.toFixed(1);
                                  displayContent = (
                                    <>
                                      <span style={{ color: VOLUME_RECORD_COLOR }} className="font-medium text-sm">
                                        {weightStr} {WEIGHT_UNITS[unit].short}
                                      </span>
                                      <span className="text-zinc-500 text-sm">×</span>
                                      <span style={{ color: VOLUME_RECORD_COLOR }} className="font-medium text-sm">
                                        {vr.reps}
                                      </span>
                                    </>
                                  );
                                } else {
                                  displayContent = (
                                    <span style={{ color: VOLUME_RECORD_COLOR }} className="font-medium text-sm">
                                      {vr.value}
                                    </span>
                                  );
                                }

                                return (
                                  <>
                                    <button
                                      onClick={() => onNavigateToWorkout?.(
                                        volumeRecord!.date,
                                        record.exerciseName,
                                        volumeRecord!.setId
                                      )}
                                      className="inline-flex items-center gap-1 hover:bg-zinc-700/50 active:bg-zinc-700/50 transition-colors rounded-lg px-1 -ml-1"
                                    >
                                      {displayContent}
                                    </button>
                                    <span className="text-[10px] text-zinc-500">По объёму</span>
                                  </>
                                );
                              })()}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <p className="text-center text-zinc-500 py-4">Нет упражнений</p>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Statistics modal */}
      <Dialog open={!!statsExercise} onOpenChange={(open) => !open && setStatsExercise(null)}>
        <DialogContent
          className="bg-zinc-900 border !p-0 !gap-0 max-w-[95vw]"
          style={{ borderColor: statsColors.border }}
          showCloseButton={false}
        >
          <div className="flex items-center justify-between px-4 pt-4">
            <DialogTitle className="text-white font-medium text-base">Динамика весов упражнения</DialogTitle>
            <button
              type="button"
              onClick={() => setStatsExercise(null)}
              className="text-zinc-500 hover:text-white active:text-white transition-colors p-1"
              data-slot="dialog-close"
            >
              <XIcon className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4">
            {statsExerciseHistory.length > 0 ? (
              <ExerciseStatsChart
                data={statsExerciseHistory}
                color={statsColors.border}
                textColor={statsColors.text}
                currentWorkoutId=""
                exerciseName={statsExercise || ''}
                currentUnit="kg"
                onNavigateToDate={(date, exerciseName, setId) => {
                  // Сначала сохраняем имя упражнения, потом закрываем статистику
                  setHistoryExerciseName(exerciseName);
                  setHistoryFromDate(date);
                  setHistoryHighlightSetId(setId);
                  setStatsExercise(null); // Закрываем статистику
                  setShowHistoryFromStats(true);
                }}
              />
            ) : (
              <div className="text-center py-8 text-zinc-500">
                Нет данных для отображения
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Exercise history modal from stats */}
      <ExerciseHistoryModal
        open={showHistoryFromStats}
        onOpenChange={setShowHistoryFromStats}
        exerciseName={historyExerciseName}
        initialDate={historyFromDate}
        highlightSetId={historyHighlightSetId}
        enableSwipe={false}
      />
    </div>
  );
}
