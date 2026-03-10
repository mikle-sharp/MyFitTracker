'use client';

import { useState, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, getDay } from 'date-fns';
import { ru } from 'date-fns/locale';
import { ChevronDown, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFitnessStore } from '@/lib/store';
import { WORKOUT_TYPE_COLORS, WorkoutType } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';

const MONTHS = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
];

// Годы с 2020 до текущего + 5 лет в будущее
const YEARS = () => {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: currentYear - 2020 + 6 }, (_, i) => 2020 + i);
};

// Маркеры для типов тренировок
const WORKOUT_MARKERS: Record<WorkoutType, string> = {
  chest: 'Г',
  back: 'С',
  legs: 'Н',
  fullbody: 'Ф',
};

export function Calendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);
  
  const { selectedDate, setSelectedDate, loadWorkoutForDate, workouts } = useFitnessStore();

  const workoutDates = useMemo(() => {
    const dateMap = new Map<string, { type: WorkoutType; hasNotes: boolean }>();
    workouts.forEach(w => {
      dateMap.set(w.date, { type: w.type, hasNotes: !!w.notes });
    });
    return dateMap;
  }, [workouts]);

  const days = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const allDays = eachDayOfInterval({ start, end });
    
    const startDay = getDay(start);
    const prefixDays = Array(startDay).fill(null);
    
    return [...prefixDays, ...allDays];
  }, [currentMonth]);

  const weekDays = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

  const handleDateClick = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    setSelectedDate(dateStr);
    loadWorkoutForDate(dateStr);
  };

  const goToMonth = (monthIndex: number) => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(monthIndex);
    setCurrentMonth(newDate);
    setShowMonthPicker(false);
  };

  const goToYear = (year: number) => {
    const newDate = new Date(currentMonth);
    newDate.setFullYear(year);
    setCurrentMonth(newDate);
    setShowYearPicker(false);
  };

  const currentMonthIndex = currentMonth.getMonth();
  const currentYear = currentMonth.getFullYear();

  return (
    <div className="w-full bg-zinc-900/50 rounded-xl p-4 border border-zinc-800">
      {/* Month/Year selectors - справа */}
      <div className="flex justify-end items-center gap-2 mb-4">
        {/* Month selector */}
        <div className="relative">
          <button
            onClick={() => {
              setShowMonthPicker(!showMonthPicker);
              setShowYearPicker(false);
            }}
            className={cn(
              'flex items-center gap-1 px-2 py-1 rounded transition-colors',
              'text-xs text-zinc-400',
              showMonthPicker ? 'bg-zinc-700 text-zinc-300' : 'hover:bg-zinc-800 hover:text-zinc-300'
            )}
          >
            {MONTHS[currentMonthIndex].slice(0, 3)}
            <ChevronDown className={cn(
              'w-3 h-3 transition-transform',
              showMonthPicker && 'rotate-180'
            )} />
          </button>
          
          <AnimatePresence>
            {showMonthPicker && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full right-0 mt-2 bg-zinc-800 rounded-xl border border-zinc-700 shadow-xl z-50 overflow-hidden"
              >
                <div className="grid grid-cols-3 gap-1 p-2 min-w-[200px]">
                  {MONTHS.map((month, index) => (
                    <button
                      key={month}
                      onClick={() => goToMonth(index)}
                      className={cn(
                        'px-2 py-1.5 text-xs rounded-lg transition-colors',
                        currentMonthIndex === index
                          ? 'bg-emerald-600 text-white'
                          : 'text-zinc-300 hover:bg-zinc-700'
                      )}
                    >
                      {month.slice(0, 3)}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Year selector */}
        <div className="relative">
          <button
            onClick={() => {
              setShowYearPicker(!showYearPicker);
              setShowMonthPicker(false);
            }}
            className={cn(
              'flex items-center gap-1 px-2 py-1 rounded transition-colors',
              'text-xs text-zinc-400',
              showYearPicker ? 'bg-zinc-700 text-zinc-300' : 'hover:bg-zinc-800 hover:text-zinc-300'
            )}
          >
            {currentYear}
            <ChevronDown className={cn(
              'w-3 h-3 transition-transform',
              showYearPicker && 'rotate-180'
            )} />
          </button>
          
          <AnimatePresence>
            {showYearPicker && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full right-0 mt-2 bg-zinc-800 rounded-xl border border-zinc-700 shadow-xl z-50 overflow-hidden max-h-[200px] overflow-y-auto"
              >
                <div className="flex flex-col gap-1 p-2">
                  {YEARS().map(year => (
                    <button
                      key={year}
                      onClick={() => goToYear(year)}
                      className={cn(
                        'px-4 py-1.5 text-xs rounded-lg transition-colors whitespace-nowrap',
                        currentYear === year
                          ? 'bg-emerald-600 text-white'
                          : 'text-zinc-300 hover:bg-zinc-700'
                      )}
                    >
                      {year}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Week days header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map(day => (
          <div
            key={day}
            className="text-center text-xs font-medium text-zinc-500 py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => {
          if (!day) {
            return <div key={`empty-${index}`} className="aspect-square" />;
          }

          const dateStr = format(day, 'yyyy-MM-dd');
          const workoutInfo = workoutDates.get(dateStr);
          const workoutType = workoutInfo?.type;
          const hasNotes = workoutInfo?.hasNotes;
          const isSelected = selectedDate === dateStr;
          const isTodayDate = isToday(day);
          const colors = workoutType ? WORKOUT_TYPE_COLORS[workoutType] : null;
          const marker = workoutType ? WORKOUT_MARKERS[workoutType] : null;

          return (
            <button
              key={dateStr}
              onClick={() => handleDateClick(day)}
              className={cn(
                'aspect-square rounded-lg flex flex-col items-center justify-center relative transition-all duration-200',
                'hover:bg-zinc-700/50 active:scale-95',
                isSelected && 'ring-2 ring-emerald-500 bg-emerald-500/20',
                isTodayDate && !isSelected && 'bg-zinc-700/30',
                workoutType && !isSelected && colors && `${colors.bg} ${colors.border} border`
              )}
            >
              <span
                className={cn(
                  'text-sm font-medium',
                  isSelected ? 'text-emerald-400' :
                  isTodayDate ? 'text-white' :
                  'text-zinc-300'
                )}
              >
                {format(day, 'd')}
              </span>
              {workoutType && marker && (
                <span 
                  className={cn(
                    'text-sm font-bold absolute bottom-1 right-1 leading-none',
                    colors?.text || 'text-zinc-400'
                  )}
                >
                  {marker}
                </span>
              )}
              {/* Индикатор заметки */}
              {hasNotes && (
                <Circle 
                  className={cn(
                    'absolute top-1 right-1 w-1.5 h-1.5 fill-current',
                    isSelected ? 'text-emerald-400' : 'text-zinc-400'
                  )}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Click outside to close pickers */}
      {(showMonthPicker || showYearPicker) && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => {
            setShowMonthPicker(false);
            setShowYearPicker(false);
          }}
        />
      )}
    </div>
  );
}
