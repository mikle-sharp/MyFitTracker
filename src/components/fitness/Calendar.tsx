'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, getDay, isSameMonth, subMonths, addMonths } from 'date-fns';
import { ru } from 'date-fns/locale';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFitnessStore } from '@/lib/store';
import { WORKOUT_TYPE_COLORS, WorkoutType } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';

// Минимальная дистанция свайпа для переключения месяца (в пикселях)
const SWIPE_THRESHOLD = 40;

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
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null);
  
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  
  const { selectedDate, setSelectedDate, loadWorkoutForDate, clearSelection, workouts } = useFitnessStore();

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
    // Понедельник = 0, воскресенье = 6
    const prefixDays = Array(startDay === 0 ? 6 : startDay - 1).fill(null);

    return [...prefixDays, ...allDays];
  }, [currentMonth]);

  // Автоматически выделять сегодняшнюю дату при отображении текущего месяца
  useEffect(() => {
    const today = new Date();
    const todayStr = format(today, 'yyyy-MM-dd');

    // Если отображается текущий месяц и выбранная дата пустая
    if (isSameMonth(currentMonth, today) && !selectedDate) {
      setSelectedDate(todayStr);
      loadWorkoutForDate(todayStr);
    }
  }, [currentMonth, selectedDate, setSelectedDate, loadWorkoutForDate]);

  const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

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

    // Проверяем, входит ли selectedDate в новый месяц
    if (selectedDate) {
      const selectedMonth = new Date(selectedDate).getMonth();
      const selectedYear = new Date(selectedDate).getFullYear();
      if (selectedMonth !== monthIndex || selectedYear !== currentMonth.getFullYear()) {
        clearSelection();
      }
    }
  };

  const goToYear = (year: number) => {
    const newDate = new Date(currentMonth);
    newDate.setFullYear(year);
    setCurrentMonth(newDate);
    setShowYearPicker(false);

    // Проверяем, входит ли selectedDate в новый год
    if (selectedDate) {
      const selectedYear = new Date(selectedDate).getFullYear();
      if (selectedYear !== year) {
        clearSelection();
      }
    }
  };

  const goToPrevMonth = () => {
    setSlideDirection('right');
    const newDate = subMonths(currentMonth, 1);
    setCurrentMonth(newDate);
    if (selectedDate) {
      const selected = new Date(selectedDate);
      if (!isSameMonth(selected, newDate)) {
        clearSelection();
      }
    }
  };

  const goToNextMonth = () => {
    setSlideDirection('left');
    const newDate = addMonths(currentMonth, 1);
    setCurrentMonth(newDate);
    if (selectedDate) {
      const selected = new Date(selectedDate);
      if (!isSameMonth(selected, newDate)) {
        clearSelection();
      }
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = Math.abs(touch.clientY - touchStartRef.current.y);
    
    // Проверяем, что свайп горизонтальный (не вертикальный скролл)
    // и достаточно длинный
    if (deltaY < 70 && Math.abs(deltaX) > SWIPE_THRESHOLD) {
      if (deltaX > 0) {
        // Свайп вправо → предыдущий месяц
        goToPrevMonth();
      } else {
        // Свайп влево → следующий месяц
        goToNextMonth();
      }
    }
    
    touchStartRef.current = null;
  };

  const currentMonthIndex = currentMonth.getMonth();
  const currentYear = currentMonth.getFullYear();

  return (
    <div 
      className="w-full bg-zinc-900/50 rounded-lg p-4 border border-zinc-800"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
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
            {MONTHS[currentMonthIndex]}
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
                className="absolute top-full right-0 mt-2 bg-zinc-800 rounded-lg border border-zinc-700 shadow-xl z-50 overflow-hidden"
              >
                <div className="grid grid-cols-3 gap-1 p-2 min-w-[240px]">
                  {MONTHS.map((month, index) => (
                    <button
                      key={month}
                      onClick={() => goToMonth(index)}
                      className="px-2 py-1.5 text-xs rounded-lg transition-colors text-zinc-300 hover:bg-zinc-700 text-center whitespace-nowrap"
                      style={currentMonthIndex === index ? {
                        backgroundColor: '#072f18',
                        color: '#fff'
                      } : undefined}
                    >
                      {month}
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
                className="absolute top-full right-0 mt-2 bg-zinc-800 rounded-lg border border-zinc-700 shadow-xl z-50 overflow-hidden max-h-[200px] overflow-y-auto"
              >
                <div className="flex flex-col gap-1 p-2">
                  {YEARS().map(year => (
                    <button
                      key={year}
                      onClick={() => goToYear(year)}
                      className="px-4 py-1.5 text-xs rounded-lg transition-colors whitespace-nowrap text-zinc-300 hover:bg-zinc-700"
                      style={currentYear === year ? {
                        backgroundColor: '#072f18',
                        color: '#fff'
                      } : undefined}
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
      <AnimatePresence mode="wait" custom={slideDirection}>
        <motion.div
          key={currentMonth.toISOString()}
          custom={slideDirection}
          initial={{ opacity: 0, x: slideDirection === 'left' ? 30 : slideDirection === 'right' ? -30 : 0 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: slideDirection === 'left' ? -30 : slideDirection === 'right' ? 30 : 0 }}
          transition={{ duration: 0.15 }}
          className="grid grid-cols-7 gap-1"
        >
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
                isSelected && 'ring-2',
                isTodayDate && !isSelected && !workoutType && 'bg-zinc-700/30',
                workoutType && 'border'
              )}
              style={isSelected ? {
                ringColor: '#037b34',
                backgroundColor: workoutType && colors ? colors.bg : undefined,
                borderColor: workoutType && colors ? colors.border : undefined
              } : workoutType && colors ? {
                backgroundColor: colors.bg,
                borderColor: colors.border
              } : undefined}
            >
              <span
                style={{
                  color: isSelected ? '#fff' : isTodayDate ? '#fff' : '#d4d4d8',
                  fontSize: isSelected ? '18px' : '14px',
                  fontWeight: isSelected ? 'bold' : 'normal',
                  WebkitTextStroke: isSelected ? '1px #fff' : undefined
                }}
              >
                {format(day, 'd')}
              </span>
              {workoutType && marker && (
                <span
                  className="text-[10px] font-bold absolute bottom-1 right-1 leading-none"
                  style={{ color: colors?.text || '#a1a1aa' }}
                >
                  {marker}
                </span>
              )}
              {/* Индикатор заметки - кружок (обычный стиль) или пиксельный крестик (retro) */}
              {hasNotes && (
                <>
                  {/* Кружок для обычного стиля */}
                  <div
                    className="absolute top-1 left-1 w-1.5 h-1.5 rounded-full note-marker-circle"
                    style={{ backgroundColor: colors?.text || '#a1a1aa' }}
                  />
                  {/* Пиксельный крестик для retro стиля */}
                  <svg
                    className="absolute top-1 left-1 w-1.5 h-1.5 hidden note-marker-cross"
                    viewBox="0 0 6 6"
                    style={{ color: colors?.text || '#a1a1aa' }}
                  >
                    <rect x="2" y="0" width="2" height="6" fill="currentColor" />
                    <rect x="0" y="2" width="6" height="2" fill="currentColor" />
                  </svg>
                </>
              )}
            </button>
          );
        })}
        </motion.div>
      </AnimatePresence>

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
