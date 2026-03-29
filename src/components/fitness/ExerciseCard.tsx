'use client';

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Trash2Icon, PlusIcon, CheckIcon, ClockIcon, RefreshCwIcon, UserIcon, WeightIcon, ChevronUpIcon, ChevronDownIcon, XIcon, ZapIcon, Repeat2Icon, TrendingUpIcon } from '@/components/icons/Icons';
import { Exercise, WorkoutSet, getExerciseType, WORKOUT_TYPE_COLORS, WorkoutType, ExerciseType, EquipmentType, GripType, EQUIPMENT_TYPES, GRIP_TYPES } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { getPersonalRecord, getRecordType } from '@/lib/pr';
import { useFitnessStore } from '@/lib/store';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { getPreviousSetData } from '@/lib/storage';

// Компонент для названия упражнения с авто-размером шрифта
function ExerciseNameHeader({ name }: { name: string }) {
  const ref = useRef<HTMLHeadingElement>(null);
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
    <h3 ref={ref} className={`font-semibold text-white ${fontSize}`}>{name}</h3>
  );
}

// Компонент графика статистики упражнения
interface ChartDataPoint {
  date: string;
  maxWeight: number;
  userWeight?: number;
  totalVolume: number;
  workoutId: string;
}

interface ExerciseStatsChartProps {
  data: ChartDataPoint[];
  color: string;
  textColor: string;
  currentWorkoutId: string;
  exerciseName: string;
  onNavigateToDate?: (date: string, exerciseName: string) => void;
}

const DEFAULT_VISIBLE_COUNT = 9;

// Цвета для графиков
const CHART_COLORS = {
  maxWeight: 'rgb(201, 56, 67)',     // красный
  maxWeightMarker: 'rgb(57, 16, 19)', // тёмно-красный для маркера
  userWeight: 'rgb(25, 166, 85)',    // зелёный
  userWeightMarker: 'rgb(7, 47, 24)', // тёмно-зелёный для маркера
  totalVolume: 'rgb(255, 185, 0)',   // жёлтый/оранжевый
  totalVolumeMarker: 'rgb(115, 66, 0)', // коричневый для маркера
};

// Цвета для активных тэгов
const TAG_ACTIVE_COLORS = {
  userWeight: { bg: 'rgb(7, 47, 24)', text: 'rgb(25, 166, 85)' },
  maxWeight: { bg: 'rgb(57, 16, 19)', text: 'rgb(201, 56, 67)' },
  totalVolume: { bg: 'rgb(115, 66, 0)', text: 'rgb(255, 185, 0)' },
};

function ExerciseStatsChart({ data, color, textColor, currentWorkoutId, exerciseName, onNavigateToDate }: ExerciseStatsChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  // Состояние видимости графиков
  const [showMaxWeight, setShowMaxWeight] = useState(true);
  const [showUserWeight, setShowUserWeight] = useState(false);
  const [showTotalVolume, setShowTotalVolume] = useState(false);
  
  // Состояние для диапазона отображаемых данных
  // Показываем последние N тренировок по умолчанию
  const [rangeStart, setRangeStart] = useState(Math.max(0, data.length - DEFAULT_VISIBLE_COUNT));
  const [rangeEnd, setRangeEnd] = useState(data.length);
  
  // Refs для pinch-to-zoom
  const lastPinchDistanceRef = useRef<number | null>(null);
  const touchStartPosRef = useRef<{ x: number; y: number } | null>(null);
  
  // Refs для тройного клика
  const clickCountRef = useRef(0);
  const lastClickTimeRef = useRef(0);
  
  // Видимые данные на основе диапазона
  const visibleData = data.slice(rangeStart, rangeEnd);
  const visibleCount = rangeEnd - rangeStart;
  
  // Находим индекс текущей тренировки в видимых данных
  const currentVisibleIndex = visibleData.findIndex(d => d.workoutId === currentWorkoutId);
  
  // Инициализируем выбранный индекс
  useEffect(() => {
    if (visibleData.length > 0 && selectedIndex === null) {
      // Если текущая тренировка в видимом диапазоне - выбираем её
      if (currentVisibleIndex >= 0) {
        setSelectedIndex(currentVisibleIndex);
      } else {
        // Иначе выбираем последнюю точку
        setSelectedIndex(visibleData.length - 1);
      }
    }
  }, [visibleData.length, currentVisibleIndex, selectedIndex]);
  
  // Сброс selectedIndex при изменении видимого диапазона
  useEffect(() => {
    if (selectedIndex !== null && selectedIndex >= visibleData.length) {
      setSelectedIndex(Math.max(0, visibleData.length - 1));
    }
  }, [visibleData.length, selectedIndex]);
  
  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-zinc-500">
        Нет данных для отображения
      </div>
    );
  }

  // Собираем все значения для расчёта масштаба
  const allValues: number[] = [];
  visibleData.forEach(d => {
    if (showMaxWeight && d.maxWeight > 0) allValues.push(d.maxWeight);
    if (showUserWeight && d.userWeight && d.userWeight > 0) allValues.push(d.userWeight);
    if (showTotalVolume && d.totalVolume > 0) allValues.push(d.totalVolume);
  });
  
  // Расчёт диапазона для видимых данных
  const minValue = allValues.length > 0 ? Math.min(...allValues) : 0;
  const maxValue = allValues.length > 0 ? Math.max(...allValues) : 100;
  const valueRange = maxValue - minValue || 1;
  const padding = valueRange * 0.1;
  const chartMinValue = Math.max(0, minValue - padding);
  const chartMaxValue = maxValue + padding;
  const chartRange = chartMaxValue - chartMinValue;

  const formatDisplayDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
  };

  const formatDateShort = (dateStr: string) => {
    const date = new Date(dateStr);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString().slice(-2);
    return `${day}.${month}.${year}`;
  };

  // Расчёт расстояния между двумя касаниями
  const getPinchDistance = (touches: React.TouchList): number => {
    if (touches.length < 2) return 0;
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // Начинаем pinch-to-zoom
      lastPinchDistanceRef.current = getPinchDistance(e.touches);
      setIsDragging(false);
    } else if (e.touches.length === 1) {
      // Начинаем drag для выбора точки
      setIsDragging(true);
      touchStartPosRef.current = { 
        x: e.touches[0].clientX, 
        y: e.touches[0].clientY 
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && lastPinchDistanceRef.current !== null) {
      // Pinch-to-zoom
      const currentDistance = getPinchDistance(e.touches);
      const scale = lastPinchDistanceRef.current / currentDistance;
      lastPinchDistanceRef.current = currentDistance;
      
      // Вычисляем новый размер видимого диапазона
      const newCount = Math.round(visibleCount * scale);
      const clampedCount = Math.max(3, Math.min(data.length, newCount));
      
      if (clampedCount !== visibleCount) {
        // Центрируем zoom вокруг текущей позиции
        const centerIndex = rangeStart + Math.floor(visibleCount / 2);
        let newStart = Math.round(centerIndex - clampedCount / 2);
        newStart = Math.max(0, Math.min(data.length - clampedCount, newStart));
        
        setRangeStart(newStart);
        setRangeEnd(newStart + clampedCount);
      }
    } else if (isDragging && e.touches.length === 1 && containerRef.current) {
      // Перемещение точки
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.touches[0].clientX - rect.left;
      const width = rect.width;
      
      const relativeX = Math.max(0, Math.min(1, x / width));
      const newIndex = Math.round(relativeX * (visibleData.length - 1));
      setSelectedIndex(newIndex);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    lastPinchDistanceRef.current = null;
    touchStartPosRef.current = null;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;
    
    const relativeX = Math.max(0, Math.min(1, x / width));
    const newIndex = Math.round(relativeX * (visibleData.length - 1));
    setSelectedIndex(newIndex);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  // Обработка колёсика мыши для zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    
    const delta = e.deltaY > 0 ? 1 : -1;
    const newCount = Math.max(3, Math.min(data.length, visibleCount + delta));
    
    if (newCount !== visibleCount) {
      // Центрируем zoom
      const centerIndex = rangeStart + Math.floor(visibleCount / 2);
      let newStart = Math.round(centerIndex - newCount / 2);
      newStart = Math.max(0, Math.min(data.length - newCount, newStart));
      
      setRangeStart(newStart);
      setRangeEnd(newStart + newCount);
    }
  };

  // Выбранные данные
  const selectedData = selectedIndex !== null ? visibleData[selectedIndex] : null;
  
  // Обработчик тройного клика по маркеру
  const handleMarkerClick = () => {
    if (!onNavigateToDate || !selectedData) return;
    
    const now = Date.now();
    const timeDiff = now - lastClickTimeRef.current;
    
    // Если прошло меньше 500мс с последнего клика - увеличиваем счётчик
    if (timeDiff < 500) {
      clickCountRef.current += 1;
    } else {
      // Иначе сбрасываем счётчик
      clickCountRef.current = 1;
    }
    
    lastClickTimeRef.current = now;
    
    // Если три клика - навигируем
    if (clickCountRef.current >= 3) {
      onNavigateToDate(selectedData.date, exerciseName);
      clickCountRef.current = 0;
    }
  };

  // Функция для вычисления Y позиции
  const getYPosition = (value: number) => {
    return 100 - ((value - chartMinValue) / chartRange) * 100;
  };

  // Функция для вычисления X позиции
  const getXPosition = (index: number) => {
    return visibleData.length > 1 ? 5 + (index / (visibleData.length - 1)) * 90 : 50;
  };

  // Генерируем точки для линий графиков
  const generateLinePoints = (getValue: (d: ChartDataPoint) => number, show: boolean) => {
    if (!show) return '';
    return visibleData.map((d, i) => {
      const value = getValue(d);
      if (value <= 0) return '';
      const x = getXPosition(i);
      const y = getYPosition(value);
      return `${x},${y}`;
    }).filter(p => p).join(' ');
  };

  const maxWeightPoints = generateLinePoints(d => d.maxWeight, showMaxWeight);
  const userWeightPoints = generateLinePoints(d => d.userWeight || 0, showUserWeight);
  const totalVolumePoints = generateLinePoints(d => d.totalVolume, showTotalVolume);

  return (
    <div className="flex flex-col gap-4">
      {/* Информация о выбранной точке */}
      {selectedData && (
        <div className="flex items-center">
          <div className="w-[40px]"></div>
          <div className="text-sm text-zinc-400">{formatDateShort(selectedData.date)}</div>
          <div className="flex-1"></div>
          <div className="flex gap-3 text-sm">
            {showMaxWeight && selectedData.maxWeight > 0 && (
              <span className="font-medium" style={{ color: CHART_COLORS.maxWeight }}>{selectedData.maxWeight} кг</span>
            )}
            {showUserWeight && selectedData.userWeight && selectedData.userWeight > 0 && (
              <span className="font-medium" style={{ color: CHART_COLORS.userWeight }}>{selectedData.userWeight} кг</span>
            )}
            {showTotalVolume && selectedData.totalVolume > 0 && (
              <span className="font-medium" style={{ color: CHART_COLORS.totalVolume }}>{selectedData.totalVolume} кг</span>
            )}
          </div>
        </div>
      )}

      {/* График */}
      <div className="flex">
        {/* Ось Y с делениями - фиксированная ширина под 5-значное число */}
        <div className="flex flex-col justify-between h-48 pr-2 text-xs text-zinc-500 w-[40px] items-end">
          <span>{chartMaxValue.toFixed(0)}</span>
          <span>{((chartMaxValue + chartMinValue) / 2).toFixed(0)}</span>
          <span>{chartMinValue.toFixed(0)}</span>
        </div>
        
        <div 
          ref={containerRef}
          className="relative flex-1 h-48 bg-zinc-800 rounded-lg overflow-hidden touch-none select-none"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onWheel={handleWheel}
        >
          <svg 
            viewBox="0 0 100 100" 
            preserveAspectRatio="none"
            className="absolute inset-0 w-full h-full"
          >
            {/* Линия общего объёма */}
            {showTotalVolume && totalVolumePoints && (
              <polyline
                points={totalVolumePoints}
                fill="none"
                stroke={CHART_COLORS.totalVolume}
                strokeWidth="0.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.7"
              />
            )}
            
            {/* Линия веса пользователя */}
            {showUserWeight && userWeightPoints && (
              <polyline
                points={userWeightPoints}
                fill="none"
                stroke={CHART_COLORS.userWeight}
                strokeWidth="0.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.7"
              />
            )}
            
            {/* Линия максимального веса */}
            {showMaxWeight && maxWeightPoints && (
              <polyline
                points={maxWeightPoints}
                fill="none"
                stroke={CHART_COLORS.maxWeight}
                strokeWidth="0.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.7"
              />
            )}
            
            {/* Точки на графике - общий объём */}
            {showTotalVolume && visibleData.map((d, i) => {
              if (d.totalVolume <= 0) return null;
              const x = getXPosition(i);
              const y = getYPosition(d.totalVolume);
              const isSelected = i === selectedIndex;
              
              return (
                <circle
                  key={`volume-${i}`}
                  cx={x}
                  cy={y}
                  r={isSelected ? 1.2 : 0.6}
                  fill={isSelected ? CHART_COLORS.totalVolume : '#71717a'}
                  className="transition-all duration-150 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedIndex(i);
                  }}
                />
              );
            })}
            
            {/* Точки на графике - вес пользователя */}
            {showUserWeight && visibleData.map((d, i) => {
              if (!d.userWeight || d.userWeight <= 0) return null;
              const x = getXPosition(i);
              const y = getYPosition(d.userWeight);
              const isSelected = i === selectedIndex;
              
              return (
                <circle
                  key={`userweight-${i}`}
                  cx={x}
                  cy={y}
                  r={isSelected ? 1.2 : 0.6}
                  fill={isSelected ? CHART_COLORS.userWeight : '#71717a'}
                  className="transition-all duration-150 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedIndex(i);
                  }}
                />
              );
            })}
            
            {/* Точки на графике - максимальный вес */}
            {showMaxWeight && visibleData.map((d, i) => {
              if (d.maxWeight <= 0) return null;
              const x = getXPosition(i);
              const y = getYPosition(d.maxWeight);
              const isSelected = i === selectedIndex;
              const isCurrent = d.workoutId === currentWorkoutId;
              
              return (
                <circle
                  key={`maxweight-${i}`}
                  cx={x}
                  cy={y}
                  r={isSelected ? 1.2 : 0.6}
                  fill={isSelected || isCurrent ? CHART_COLORS.maxWeight : '#71717a'}
                  className="transition-all duration-150 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedIndex(i);
                  }}
                />
              );
            })}
          </svg>

          {/* Выбранная точка - максимальный вес */}
          {selectedIndex !== null && selectedData && selectedData.maxWeight > 0 && showMaxWeight && (
            <div
              onClick={handleMarkerClick}
              className="absolute w-4 h-4 rounded-full -translate-x-1/2 -translate-y-1/2 transition-all duration-150 cursor-pointer"
              style={{
                left: `${getXPosition(selectedIndex)}%`,
                top: `${getYPosition(selectedData.maxWeight)}%`,
                backgroundColor: CHART_COLORS.maxWeight,
                border: '3px solid #27272a',
              }}
            />
          )}

          {/* Выбранная точка - вес пользователя */}
          {selectedIndex !== null && selectedData && selectedData.userWeight && selectedData.userWeight > 0 && showUserWeight && (
            <div
              onClick={handleMarkerClick}
              className="absolute w-4 h-4 rounded-full -translate-x-1/2 -translate-y-1/2 transition-all duration-150 cursor-pointer"
              style={{
                left: `${getXPosition(selectedIndex)}%`,
                top: `${getYPosition(selectedData.userWeight)}%`,
                backgroundColor: CHART_COLORS.userWeight,
                border: '3px solid #27272a',
              }}
            />
          )}

          {/* Выбранная точка - общий объём */}
          {selectedIndex !== null && selectedData && selectedData.totalVolume > 0 && showTotalVolume && (
            <div
              onClick={handleMarkerClick}
              className="absolute w-4 h-4 rounded-full -translate-x-1/2 -translate-y-1/2 transition-all duration-150 cursor-pointer"
              style={{
                left: `${getXPosition(selectedIndex)}%`,
                top: `${getYPosition(selectedData.totalVolume)}%`,
                backgroundColor: CHART_COLORS.totalVolume,
                border: '3px solid #27272a',
              }}
            />
          )}
        </div>
      </div>

      {/* Даты по оси X - выровнены с графиком */}
      <div className="flex items-center">
        <div className="w-[40px] pr-2" style={{ visibility: 'hidden' }}>
          <span className="text-xs">00000</span>
        </div>
        <div className="flex-1 flex text-xs text-zinc-500 leading-tight">
          {visibleData.length > 0 && (
            <>
              <span>{formatDisplayDate(visibleData[0].date)}</span>
              <span className="ml-auto">{formatDisplayDate(visibleData[visibleData.length - 1].date)}</span>
            </>
          )}
        </div>
      </div>

      {/* Слайдер для выбора диапазона */}
      <div className="flex">
        <div className="w-[40px] pr-2" style={{ visibility: 'hidden' }}>
          <span className="text-xs">00000</span>
        </div>
          <div className="flex-1 relative py-2 px-2">
            <div className="relative w-full h-[10px] bg-zinc-600 rounded">
              {/* Выбранный диапазон */}
              <div 
                className="absolute h-full rounded"
                style={{ 
                  left: `${(rangeStart / data.length) * 100}%`,
                  width: `${((rangeEnd - rangeStart) / data.length) * 100}%`,
                  backgroundColor: textColor,
                  opacity: 0.5
                }}
              />
              
              {/* Левый ползунок */}
              <div 
                className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded"
                style={{ 
                  left: `calc(${(rangeStart / data.length) * 100}% - 10px)`,
                  backgroundColor: color,
                  border: '2px solid #18181b'
                }}
                onTouchStart={(e) => {
                  e.preventDefault();
                  const startX = e.touches[0].clientX;
                  const startRange = rangeStart;
                  const sliderRect = (e.target as HTMLElement).parentElement!.getBoundingClientRect();
                  
                  const handleMove = (moveE: TouchEvent) => {
                    const delta = ((moveE.touches[0].clientX - startX) / sliderRect.width) * data.length;
                    const newStart = Math.min(Math.round(startRange + delta), rangeEnd - 3);
                    setRangeStart(Math.max(0, newStart));
                  };
                  
                  const handleEnd = () => {
                    document.removeEventListener('touchmove', handleMove);
                    document.removeEventListener('touchend', handleEnd);
                  };
                  
                  document.addEventListener('touchmove', handleMove, { passive: false });
                  document.addEventListener('touchend', handleEnd);
                }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  const startX = e.clientX;
                  const startRange = rangeStart;
                  const sliderRect = (e.target as HTMLElement).parentElement!.getBoundingClientRect();
                  
                  const handleMove = (moveE: MouseEvent) => {
                    const delta = ((moveE.clientX - startX) / sliderRect.width) * data.length;
                    const newStart = Math.min(Math.round(startRange + delta), rangeEnd - 3);
                    setRangeStart(Math.max(0, newStart));
                  };
                  
                  const handleUp = () => {
                    document.removeEventListener('mousemove', handleMove);
                    document.removeEventListener('mouseup', handleUp);
                  };
                  
                  document.addEventListener('mousemove', handleMove);
                  document.addEventListener('mouseup', handleUp);
                }}
              />
              
              {/* Правый ползунок */}
              <div 
                className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded"
                style={{ 
                  left: `calc(${(rangeEnd / data.length) * 100}% - 10px)`,
                  backgroundColor: color,
                  border: '2px solid #18181b'
                }}
                onTouchStart={(e) => {
                  e.preventDefault();
                  const startX = e.touches[0].clientX;
                  const startRange = rangeEnd;
                  const sliderRect = (e.target as HTMLElement).parentElement!.getBoundingClientRect();
                  
                  const handleMove = (moveE: TouchEvent) => {
                    const delta = ((moveE.touches[0].clientX - startX) / sliderRect.width) * data.length;
                    const newEnd = Math.max(Math.round(startRange + delta), rangeStart + 3);
                    setRangeEnd(Math.min(data.length, newEnd));
                  };
                  
                  const handleEnd = () => {
                    document.removeEventListener('touchmove', handleMove);
                    document.removeEventListener('touchend', handleEnd);
                  };
                  
                  document.addEventListener('touchmove', handleMove, { passive: false });
                  document.addEventListener('touchend', handleEnd);
                }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  const startX = e.clientX;
                  const startRange = rangeEnd;
                  const sliderRect = (e.target as HTMLElement).parentElement!.getBoundingClientRect();
                  
                  const handleMove = (moveE: MouseEvent) => {
                    const delta = ((moveE.clientX - startX) / sliderRect.width) * data.length;
                    const newEnd = Math.max(Math.round(startRange + delta), rangeStart + 3);
                    setRangeEnd(Math.min(data.length, newEnd));
                  };
                  
                  const handleUp = () => {
                    document.removeEventListener('mousemove', handleMove);
                    document.removeEventListener('mouseup', handleUp);
                  };
                  
                  document.addEventListener('mousemove', handleMove);
                  document.addEventListener('mouseup', handleUp);
                }}
              />
            </div>
          </div>
        </div>

      {/* Тэги включения/отключения графиков */}
      <div className="flex gap-3">
        <div className="w-[40px]"></div>
        <div className="flex-1 flex justify-center gap-3">
        <div
          onClick={() => {
            const newState = !showUserWeight;
            setShowUserWeight(newState);
            if (newState) setShowTotalVolume(false);
          }}
          className={cn(
            'px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors',
            !showUserWeight && 'bg-zinc-700/50 text-zinc-400',
            showUserWeight && 'text-white'
          )}
          style={showUserWeight ? { backgroundColor: TAG_ACTIVE_COLORS.userWeight.bg, color: TAG_ACTIVE_COLORS.userWeight.text } : undefined}
        >
          Мой вес
        </div>
        <div
          onClick={() => {
            const newState = !showMaxWeight;
            setShowMaxWeight(newState);
            if (newState) setShowTotalVolume(false);
          }}
          className={cn(
            'px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors',
            !showMaxWeight && 'bg-zinc-700/50 text-zinc-400',
            showMaxWeight && 'text-white'
          )}
          style={showMaxWeight ? { backgroundColor: TAG_ACTIVE_COLORS.maxWeight.bg, color: TAG_ACTIVE_COLORS.maxWeight.text } : undefined}
        >
          Макс. вес
        </div>
        <div
          onClick={() => {
            const newState = !showTotalVolume;
            setShowTotalVolume(newState);
            if (newState) {
              setShowMaxWeight(false);
              setShowUserWeight(false);
            }
          }}
          className={cn(
            'px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors',
            !showTotalVolume && 'bg-zinc-700/50 text-zinc-400',
            showTotalVolume && 'text-white'
          )}
          style={showTotalVolume ? { backgroundColor: TAG_ACTIVE_COLORS.totalVolume.bg, color: TAG_ACTIVE_COLORS.totalVolume.text } : undefined}
        >
          Объём
        </div>
        </div>
      </div>
    </div>
  );
}

interface ExerciseCardProps {
  exercise: Exercise;
  workoutId: string;
  index: number;
  totalExercises: number;
  workoutType?: WorkoutType; // тип тренировки для определения цвета упражнения
  onReplace?: (exerciseId: string, exerciseName: string) => void;
  onMoveUp?: (exerciseId: string) => void;
  onMoveDown?: (exerciseId: string) => void;
  // Drag-and-drop props
  isDragging?: boolean;
  dragY?: number;
  shiftDirection?: 'up' | 'down' | null;
  onDragStart?: (exerciseId: string, index: number, startY: number) => void;
  onDragMove?: (currentY: number) => void;
  onDragEnd?: () => void;
  // Highlight specific set (for navigation from records)
  highlightSetIndex?: number;
}

// Форматирование времени из секунд в MM:SS
const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export function ExerciseCard({ 
  exercise, 
  workoutId, 
  index, 
  totalExercises,
  workoutType,
  onReplace, 
  onMoveUp,
  onMoveDown,
  // Drag-and-drop props
  isDragging = false,
  dragY = 0,
  shiftDirection = null,
  onDragStart,
  onDragMove,
  onDragEnd,
  // Highlight props
  highlightSetIndex
}: ExerciseCardProps) {
  // State for adding new set
  const [newReps, setNewReps] = useState('');
  const [newWeight, setNewWeight] = useState('');
  const [newTimeMinutes, setNewTimeMinutes] = useState('');
  const [newTimeSeconds, setNewTimeSeconds] = useState('');
  const [isAddingSet, setIsAddingSet] = useState(false);
  const [isWarmup, setIsWarmup] = useState(false);
  
  // State for editing set
  const [editingSetId, setEditingSetId] = useState<string | null>(null);
  const [editReps, setEditReps] = useState('');
  const [editWeight, setEditWeight] = useState('');
  const [editTimeMinutes, setEditTimeMinutes] = useState('');
  const [editTimeSeconds, setEditTimeSeconds] = useState('');
  const [editEquipment, setEditEquipment] = useState<EquipmentType | null>(null);
  const [editGrip, setEditGrip] = useState<GripType | null>(null);

  // State for input type
  const [useBodyweight, setUseBodyweight] = useState(false);
  const [useReps, setUseReps] = useState(true);
  const [useTime, setUseTime] = useState(false);
  
  // State for equipment and grip tags
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentType | null>(null);
  const [selectedGrip, setSelectedGrip] = useState<GripType | null>(null);
  const [showEquipmentPicker, setShowEquipmentPicker] = useState(false);
  const [showGripPicker, setShowGripPicker] = useState(false);
  const [pickerPosition, setPickerPosition] = useState({ top: 0, left: 0, width: 0, openUpward: false, bottom: 0 });
  const equipmentButtonRef = useRef<HTMLButtonElement>(null);
  const gripButtonRef = useRef<HTMLButtonElement>(null);
  const editEquipmentButtonRef = useRef<HTMLButtonElement>(null);
  const editGripButtonRef = useRef<HTMLButtonElement>(null);
  
  // Block scroll when picker is open
  useEffect(() => {
    if (showEquipmentPicker || showGripPicker) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [showEquipmentPicker, showGripPicker]);
  
  // State for delete confirmation
  const [showDeleteExerciseConfirm, setShowDeleteExerciseConfirm] = useState(false);
  const [showDeleteSetConfirm, setShowDeleteSetConfirm] = useState(false);
  const [setToDelete, setSetToDelete] = useState<string | null>(null);
  
  // State for statistics modal
  const [showStats, setShowStats] = useState(false);

  // Drag-and-drop state
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartPosRef = useRef<{ x: number; y: number } | null>(null);
  const isDragActiveRef = useRef(false);
  const hasMovedRef = useRef(false);
  const dragHandleRef = useRef<HTMLDivElement>(null);
  
  // Ref for highlighted set scrolling
  const highlightedSetRef = useRef<HTMLDivElement>(null);
  
  // Scroll to highlighted set when it changes
  useEffect(() => {
    if (highlightSetIndex === undefined) return;
    
    // Retry scrolling until the element is available
    let attempts = 0;
    const maxAttempts = 10;
    const intervalMs = 100;
    
    const tryScroll = () => {
      if (highlightedSetRef.current) {
        highlightedSetRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
        return true;
      }
      return false;
    };
    
    // Try immediately
    if (tryScroll()) return;
    
    // If not available, retry periodically
    const interval = setInterval(() => {
      attempts++;
      if (tryScroll() || attempts >= maxAttempts) {
        clearInterval(interval);
      }
    }, intervalMs);
    
    return () => clearInterval(interval);
  }, [highlightSetIndex]);

  const { addSet, removeSet, updateSet, removeExercise, currentWorkout, workouts, setSelectedDate } = useFitnessStore();
  const pr = getPersonalRecord(exercise.name);
  
  // История упражнения для графика
  const exerciseHistory = useMemo(() => {
    if (!workouts) return [];
    
    const history: ChartDataPoint[] = [];
    
    workouts.forEach(w => {
      const exerciseInWorkout = w.exercises.find(e => e.name === exercise.name);
      if (exerciseInWorkout && exerciseInWorkout.sets.length > 0) {
        // Находим максимальный вес среди рабочих подходов (не разминочных)
        const workingSets = exerciseInWorkout.sets.filter(s => !s.isWarmup && s.weight > 0);
        // Вычисляем общий объём (сумма вес × повторения для всех подходов)
        const totalVolume = exerciseInWorkout.sets.reduce((sum, s) => sum + (s.weight * s.reps), 0);
        
        if (workingSets.length > 0) {
          const maxWeight = Math.max(...workingSets.map(s => s.weight));
          history.push({
            date: w.date,
            maxWeight,
            userWeight: w.weight, // вес пользователя на дату тренировки
            totalVolume,
            workoutId: w.id
          });
        }
      }
    });
    
    // Сортируем по дате
    return history.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [workouts, exercise.name]);
  
  // Disable text selection on iOS during drag
  useEffect(() => {
    if (isDragging) {
      document.body.style.webkitUserSelect = 'none';
      document.body.style.userSelect = 'none';
      document.body.style.webkitTouchCallout = 'none';
    } else {
      document.body.style.webkitUserSelect = '';
      document.body.style.userSelect = '';
      document.body.style.webkitTouchCallout = '';
    }
    return () => {
      document.body.style.webkitUserSelect = '';
      document.body.style.userSelect = '';
      document.body.style.webkitTouchCallout = '';
    };
  }, [isDragging]);
  
  // Автозаполнение данных при открытии диалога добавления подхода
  const autofillSetData = useCallback((forWarmup: boolean) => {
    // Если есть подходы того же типа в текущем упражнении - берём из последнего
    const sameTypeSets = exercise.sets.filter(s => forWarmup ? s.isWarmup : !s.isWarmup);
    if (sameTypeSets.length > 0) {
      const lastSet = sameTypeSets[sameTypeSets.length - 1];
      if (lastSet.weight === 0) {
        setUseBodyweight(true);
        setNewWeight('');
      } else {
        setUseBodyweight(false);
        setNewWeight(String(lastSet.weight));
      }
      setNewReps(String(lastSet.reps));
      if (lastSet.time && lastSet.time > 0) {
        setUseTime(true);
        const mins = Math.floor(lastSet.time / 60);
        const secs = lastSet.time % 60;
        setNewTimeMinutes(String(mins));
        setNewTimeSeconds(String(secs));
      } else {
        setUseTime(false);
        setNewTimeMinutes('');
        setNewTimeSeconds('');
      }
      setUseReps(lastSet.reps > 0);
      
      // Наследуем теги снаряда и хвата от последнего подхода
      // Снаряд наследуем только если не bodyweight
      if (lastSet.weight !== 0 && lastSet.equipmentType) {
        setSelectedEquipment(lastSet.equipmentType);
      } else {
        setSelectedEquipment(null);
      }
      // Хват наследуем только если не time-only
      if (!lastSet.time && lastSet.gripType) {
        setSelectedGrip(lastSet.gripType);
      } else {
        setSelectedGrip(null);
      }
      return;
    }
    
    // Иначе ищем в предыдущих тренировках
    const setNumber = sameTypeSets.length + 1;
    const prevData = getPreviousSetData(exercise.name, setNumber, forWarmup);
    if (prevData) {
      if (prevData.isBodyweight) {
        setUseBodyweight(true);
        setNewWeight('');
      } else {
        setUseBodyweight(false);
        setNewWeight(prevData.weight > 0 ? String(prevData.weight) : '');
      }
      setNewReps(prevData.reps > 0 ? String(prevData.reps) : '');
      if (prevData.time > 0) {
        setUseTime(true);
        const mins = Math.floor(prevData.time / 60);
        const secs = prevData.time % 60;
        setNewTimeMinutes(String(mins));
        setNewTimeSeconds(String(secs));
      } else {
        setUseTime(false);
        setNewTimeMinutes('');
        setNewTimeSeconds('');
      }
      setUseReps(prevData.reps > 0);
      // Теги не наследуем из предыдущих тренировок
      setSelectedEquipment(null);
      setSelectedGrip(null);
      return;
    }
    
    // Если данных нет - оставляем пустыми
    setNewReps('');
    setNewWeight('');
    setNewTimeMinutes('');
    setNewTimeSeconds('');
    setUseBodyweight(false);
    setUseReps(true);
    setUseTime(false);
    setSelectedEquipment(null);
    setSelectedGrip(null);
  }, [exercise.sets, exercise.name]);
  
  // Автозаполнение при переключении типа подхода (разминочный/рабочий)
  useEffect(() => {
    if (isAddingSet) {
      autofillSetData(isWarmup);
    }
  }, [isWarmup, isAddingSet, autofillSetData]);
  
  // Начать добавление подхода с автозаполнением
  const handleStartAddingSet = useCallback(() => {
    // По умолчанию добавляем рабочий подход
    const defaultIsWarmup = false;
    setIsWarmup(defaultIsWarmup);
    
    // Автозаполняем данные
    autofillSetData(defaultIsWarmup);
    
    setIsAddingSet(true);
  }, [autofillSetData]);
  
  // Drag handlers for touch
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    // Prevent default to avoid iOS gesture interference
    const touch = e.touches[0];
    touchStartPosRef.current = { x: touch.clientX, y: touch.clientY };
    hasMovedRef.current = false;
    isDragActiveRef.current = false;
    
    // Start long press timer
    longPressTimerRef.current = setTimeout(() => {
      // Check if finger hasn't moved more than 10px
      if (!hasMovedRef.current && touchStartPosRef.current) {
        isDragActiveRef.current = true;
        // Vibrate
        if (navigator.vibrate) {
          navigator.vibrate(50);
        }
        // Notify parent
        onDragStart?.(exercise.id, index, touch.clientY);
      }
    }, 200);
  }, [exercise.id, index, onDragStart]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    
    // Check movement before long press activates
    if (touchStartPosRef.current && !isDragActiveRef.current) {
      const dx = Math.abs(touch.clientX - touchStartPosRef.current.x);
      const dy = Math.abs(touch.clientY - touchStartPosRef.current.y);
      if (dx > 10 || dy > 10) {
        hasMovedRef.current = true;
        // Cancel long press timer
        if (longPressTimerRef.current) {
          clearTimeout(longPressTimerRef.current);
          longPressTimerRef.current = null;
        }
      }
    }
    
    // If drag is active, notify parent of movement
    if (isDragActiveRef.current) {
      e.preventDefault();
      onDragMove?.(touch.clientY);
    }
  }, [onDragMove]);

  const handleTouchEnd = useCallback(() => {
    // Clear timer
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    
    // End drag if active
    if (isDragActiveRef.current) {
      isDragActiveRef.current = false;
      onDragEnd?.();
    }
    
    touchStartPosRef.current = null;
    hasMovedRef.current = false;
  }, [onDragEnd]);
  
  // Определяем тип упражнения для цветовой маркировки
  // Приоритет: 1) явный тип упражнения, 2) вычисленный по названию
  const exerciseType = exercise.exerciseType || getExerciseType(exercise.name);
  
  // Маппинг exerciseType к workoutType для получения ярких цветов
  const exerciseTypeToWorkoutType: Record<ExerciseType, WorkoutType> = {
    chest: 'chest',
    back: 'back',
    legs: 'legs',
    common: 'fullbody', // для common используем фиолетовый как для fullbody
  };
  
  const workoutTypeForColor = exerciseTypeToWorkoutType[exerciseType] || 'fullbody';
  const exerciseColors = WORKOUT_TYPE_COLORS[workoutTypeForColor];
  
  // Вычисляем номер следующего подхода и получаем предыдущие значения
  const nextWorkingSetNumber = exercise.sets.filter(s => !s.isWarmup).length + 1;
  const nextWarmupSetNumber = exercise.sets.filter(s => s.isWarmup).length + 1;
  
  // Получаем предыдущие значения для следующего подхода
  const prevWorkingSetData = getPreviousSetData(exercise.name, nextWorkingSetNumber, false);
  const prevWarmupSetData = getPreviousSetData(exercise.name, nextWarmupSetNumber, true);
  
  // Цвета для рекордов
  const WEIGHT_RECORD_COLOR = '#ffb900';
  const VOLUME_RECORD_COLOR = '#cd7f32';

  // Определение типа рекорда для подхода
  const getSetRecordType = (weight: number, reps: number, setId: string, time?: number): 'weight' | 'volume' | null => {
    return getRecordType(exercise.name, weight, reps, setId, workoutId, time);
  };

  const handleAddSet = () => {
    const reps = parseInt(newReps) || 0;
    const weight = useBodyweight ? 0 : (parseFloat(newWeight) || 0);
    const time = useTime ? ((parseInt(newTimeMinutes) || 0) * 60 + (parseInt(newTimeSeconds) || 0)) : 0;

    // Validate - нужен хотя бы один показатель
    if (!useReps && !useTime) return;
    if (useReps && reps <= 0 && !useBodyweight) return;
    if (!useBodyweight && useReps && weight <= 0 && !useTime) return;
    if (useTime && time <= 0 && !useReps) return;

    addSet(workoutId, exercise.id, reps, weight, time > 0 ? time : undefined, isWarmup, selectedEquipment ?? undefined, selectedGrip ?? undefined);
    
    // Reset form
    setNewReps('');
    setNewWeight('');
    setNewTimeMinutes('');
    setNewTimeSeconds('');
    setIsAddingSet(false);
    setIsWarmup(false);
    setSelectedEquipment(null);
    setSelectedGrip(null);
    setShowEquipmentPicker(false);
    setShowGripPicker(false);
  };

  const handleUpdateSet = (setId: string, originalSet: WorkoutSet) => {
    const reps = parseInt(editReps) || 0;
    // Если оригинальный вес был > 0, берём из поля ввода, иначе оставляем 0 (собственный вес)
    const weight = originalSet.weight > 0 ? (parseFloat(editWeight) || 0) : 0;
    const time = ((parseInt(editTimeMinutes) || 0) * 60 + (parseInt(editTimeSeconds) || 0));

    if (reps <= 0 && time <= 0) return;

    updateSet(workoutId, exercise.id, setId, reps, weight, time > 0 ? time : undefined, editEquipment ?? undefined, editGrip ?? undefined);
    
    setEditingSetId(null);
    setEditReps('');
    setEditWeight('');
    setEditTimeMinutes('');
    setEditTimeSeconds('');
    setEditEquipment(null);
    setEditGrip(null);
    setShowEquipmentPicker(false);
    setShowGripPicker(false);
  };

  const handleRemoveSet = (setId: string) => {
    setSetToDelete(setId);
    setShowDeleteSetConfirm(true);
  };

  const confirmDeleteSet = () => {
    if (setToDelete) {
      removeSet(workoutId, exercise.id, setToDelete);
      setSetToDelete(null);
    }
    setShowDeleteSetConfirm(false);
  };

  const startEditingSet = (set: WorkoutSet) => {
    setEditingSetId(set.id);
    setEditReps(String(set.reps));
    setEditWeight(String(set.weight));
    if (set.time) {
      const mins = Math.floor(set.time / 60);
      const secs = set.time % 60;
      setEditTimeMinutes(String(mins));
      setEditTimeSeconds(String(secs));
    }
    setEditEquipment(set.equipmentType || null);
    setEditGrip(set.gripType || null);
    setShowEquipmentPicker(false);
    setShowGripPicker(false);
  };

  const handleDeleteExercise = () => {
    removeExercise(workoutId, exercise.id);
    setShowDeleteExerciseConfirm(false);
  };

  // Render set display
  const renderSetDisplay = (set: WorkoutSet, setIndex: number) => {
    const isBodyweight = set.weight === 0;
    const hasReps = set.reps > 0;
    const hasTime = set.time && set.time > 0;
    const recordType = getSetRecordType(set.weight, set.reps, set.id, set.time);
    const isTimeOnly = hasTime && !hasReps;

    // Определяем цвет для рекорда
    const getRecordColor = () => {
      if (recordType === 'weight') return WEIGHT_RECORD_COLOR;
      if (recordType === 'volume') return VOLUME_RECORD_COLOR;
      return '#fff';
    };

    return (
      <div className="flex items-center">
        {/* Столбец 1: Вес / Иконка User */}
        <span className="inline-block w-8 text-left font-medium text-sm">
          {isBodyweight ? (
            <UserIcon className="w-4 h-4 inline" style={{ color: '#19a655' }} />
          ) : (
            <span style={{ color: getRecordColor() }}>{set.weight}</span>
          )}
        </span>

        {/* Столбец 2: "кг" */}
        <span className="inline-block w-5 text-center text-xs text-zinc-500">
          {!isBodyweight && set.weight > 0 && 'кг'}
        </span>

        {/* Столбец 3: "×" / Иконка Clock */}
        <span className="inline-flex w-4 h-7 items-center justify-center text-xs" style={{ color: '#71717a' }}>
          {isTimeOnly ? (
            <ClockIcon className="w-2 h-2" />
          ) : hasReps ? (
            '×'
          ) : (
            ''
          )}
        </span>

        {/* Столбец 4: Повторения / Время */}
        <span
          className="inline-block w-6 text-left font-medium text-sm"
          style={isTimeOnly ? { color: '#944ad4' } : recordType ? { color: getRecordColor() } : undefined}
        >
          {isTimeOnly ? formatTime(set.time!) : hasReps ? set.reps : ''}
        </span>

        {/* Столбец 5: Время (если есть и повторения, и время) */}
        {hasReps && hasTime && (
          <>
            <span className="inline-flex w-4 h-7 items-center justify-center text-sm" style={{ color: '#71717a' }}>
              <ClockIcon className="w-2 h-2" />
            </span>
            <span className="inline-block font-medium text-sm" style={{ color: '#944ad4' }}>
              {formatTime(set.time!)}
            </span>
          </>
        )}
      </div>
    );
  };

  return (
    <>
      <div
        className="rounded-lg overflow-hidden bg-zinc-800 relative"
        style={{
          borderLeftWidth: '4px',
          borderLeftColor: exerciseColors.border,
          background: `linear-gradient(to right, ${exerciseColors.border}, transparent) top left / 100% 1px no-repeat,
                      linear-gradient(to right, ${exerciseColors.border}, transparent) bottom left / 100% 1px no-repeat,
                      #27272a`,
          userSelect: isDragging ? 'none' : undefined,
          WebkitUserSelect: isDragging ? 'none' : undefined,
          touchAction: isDragging ? 'none' : undefined,
          position: isDragging ? 'relative' : undefined,
          // Transform for drag
          transform: isDragging
            ? `translateY(${dragY}px) scale(0.9)`
            : shiftDirection
              ? `translateY(${shiftDirection === 'down' ? 80 : -80}px)`
              : undefined,
          transformOrigin: 'center top',
          transition: isDragging ? 'none' : undefined,
          willChange: isDragging || shiftDirection ? 'transform' : undefined,
          zIndex: isDragging ? 1000 : shiftDirection ? 1 : undefined,
          opacity: 1,
        }}
      >
        {/* Overlay to block clicks while adding set */}
        {isAddingSet && (
          <div className="absolute inset-0 z-10" onClick={(e) => e.stopPropagation()} />
        )}
        <div className="flex">
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center justify-between gap-2 py-2 pl-2 pr-4" style={{ background: `linear-gradient(to right, ${exerciseColors.border}, transparent) bottom left / 100% 1px no-repeat` }}>
              <div className="flex items-center gap-2">
                {/* Move buttons / Drag handle */}
                {currentWorkout && (
                  <div
                    ref={dragHandleRef}
                    className="flex flex-col gap-0.5"
                    style={{
                      touchAction: 'none',
                      WebkitTouchCallout: 'none',
                      WebkitUserSelect: 'none',
                      userSelect: 'none',
                      WebkitTapHighlightColor: 'transparent',
                    }}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    onTouchCancel={handleTouchEnd}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onMoveUp?.(exercise.id)}
                      disabled={index === 0}
                      className="h-7 w-7 text-zinc-500 hover:text-white active:text-white hover:bg-zinc-700 active:bg-zinc-700 disabled:opacity-30"
                    >
                      <ChevronUpIcon className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onMoveDown?.(exercise.id)}
                      disabled={index === totalExercises - 1}
                      className="h-7 w-7 text-zinc-500 hover:text-white active:text-white hover:bg-zinc-700 active:bg-zinc-700 disabled:opacity-30"
                    >
                      <ChevronDownIcon className="w-4 h-4" />
                    </Button>
                  </div>
                )}
                
                <div>
                  <ExerciseNameHeader name={exercise.name} />
                </div>
              </div>

              {currentWorkout && (
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    onClick={() => setShowStats(true)}
                    className="text-zinc-500 hover:text-white active:text-white hover:!bg-transparent dark:hover:!bg-transparent active:!bg-transparent h-7 w-7 p-0"
                    title="Статистика упражнения"
                  >
                    <TrendingUpIcon className="w-4 h-4" />
                  </Button>

                  {onReplace && (
                    <Button
                      variant="ghost"
                      onClick={() => onReplace(exercise.id, exercise.name)}
                      className="text-zinc-500 hover:text-white active:text-white hover:!bg-transparent dark:hover:!bg-transparent active:!bg-transparent h-7 w-7 p-0"
                      title="Заменить упражнение"
                    >
                      <RefreshCwIcon className="w-4 h-4" />
                    </Button>
                  )}
                  
                  <Button
                    variant="ghost"
                    onClick={() => setShowDeleteExerciseConfirm(true)}
                    className="text-zinc-500 hover:text-red-400 active:text-red-400 hover:!bg-transparent dark:hover:!bg-transparent active:!bg-transparent h-7 w-7 p-0"
                    title="Удалить упражнение"
                  >
                    <Trash2Icon className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>

            {/* Sets */}
            <div className={cn("flex flex-col", exercise.sets.length > 0 || !isAddingSet ? "py-4" : "pb-4")} style={{ paddingLeft: '44px', paddingRight: '16px' }}>
              <div className="space-y-2">
              {exercise.sets.map((set, setIndex) => {
                // Вычисляем номер рабочего подхода (не учитывая разминочные)
                let workingSetNumber = 0;
                for (let i = 0; i <= setIndex; i++) {
                  if (!exercise.sets[i].isWarmup) workingSetNumber++;
                }
                
                const isLastSet = setIndex === exercise.sets.length - 1;
                const isHighlighted = highlightSetIndex === setIndex;

                return (
                <div
                  key={set.id}
                  ref={isHighlighted ? highlightedSetRef : null}
                  className={cn(
                    'flex transition-all duration-500',
                    editingSetId === set.id ? 'items-start bg-zinc-700/30 -mx-2 px-2 rounded-lg relative z-[10000] gap-2' : 'items-center gap-3',
                    isHighlighted ? 'bg-amber-500/20 -mx-2 px-2 rounded-lg ring-1 ring-amber-500/50' : ''
                  )}
                >
                  <div className={cn(
                    'w-7 h-7 rounded-lg flex items-center justify-center text-xs font-medium shrink-0',
                    set.isWarmup
                      ? 'bg-transparent text-zinc-500 border border-zinc-500'
                      : 'bg-zinc-700 text-zinc-300'
                  )}>
                    {set.isWarmup ? 'Р' : workingSetNumber}
                  </div>
                  
                  {editingSetId === set.id ? (
                    <>
                      <div className="flex flex-col gap-2 flex-1">
                        {/* Первая строка: вес, повторения, время, галка */}
                        <div className="flex items-center gap-3">
                          {/* Вес и повторения */}
                          {(set.weight > 0 || set.reps > 0) && (
                            <div className="flex items-center gap-3 relative">
                              {set.weight > 0 && (
                                <Input
                                  type="number"
                                  step="0.5"
                                  min="0.1"
                                  value={editWeight}
                                  onChange={(e) => setEditWeight(e.target.value)}
                                  placeholder="кг"
                                  className="w-12 h-7 bg-zinc-700 border-zinc-600 text-white text-xs placeholder:text-[10px] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                />
                              )}
                              
                              {set.weight > 0 && set.reps > 0 && (
                                <span className="absolute left-1/2 -translate-x-1/2 text-zinc-500 text-xs">×</span>
                              )}
                              
                              {set.reps > 0 && (
                                <Input
                                  type="number"
                                  min="1"
                                  value={editReps}
                                  onChange={(e) => setEditReps(e.target.value)}
                                  placeholder="повт."
                                  className="w-12 h-7 bg-zinc-700 border-zinc-600 text-white text-xs placeholder:text-[10px] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                />
                              )}
                            </div>
                          )}
                          
                          {/* Время */}
                          {set.time && set.time > 0 && (
                            <div className="flex items-center gap-3 relative">
                              <Input
                                type="number"
                                min="0"
                                value={editTimeMinutes}
                                onChange={(e) => setEditTimeMinutes(e.target.value)}
                                placeholder="мин."
                                className="w-12 h-7 bg-zinc-700 border-zinc-600 text-white text-xs text-center placeholder:text-[10px] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              />
                              <span className="absolute left-1/2 -translate-x-1/2 text-zinc-500 text-xs">:</span>
                              <Input
                                type="number"
                                min="0"
                                max={59}
                                value={editTimeSeconds}
                                onChange={(e) => setEditTimeSeconds(e.target.value)}
                                placeholder="сек."
                                className="w-12 h-7 bg-zinc-700 border-zinc-600 text-white text-xs text-center placeholder:text-[10px] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              />
                            </div>
                          )}
                          
                          <Button
                            size="sm"
                            onClick={() => handleUpdateSet(set.id, set)}
                            className="h-7 w-7 p-0 flex items-center justify-center bg-[#19a655]"
                          >
                            <CheckIcon className="w-3 h-3" />
                          </Button>
                        </div>
                        
                        {/* Вторая строка: Снаряд */}
                        {set.weight > 0 && (
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] text-zinc-500 w-16 shrink-0">Снаряд</span>
                            <button
                              ref={editEquipmentButtonRef}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (!showEquipmentPicker && editEquipmentButtonRef.current) {
                                  const rect = editEquipmentButtonRef.current.getBoundingClientRect();
                                  const viewportHeight = window.innerHeight;
                                  const listHeight = 320;
                                  const spaceBelow = viewportHeight - rect.bottom;
                                  const spaceAbove = rect.top;
                                  const openUpward = spaceBelow < listHeight && spaceAbove > spaceBelow;
                                  
                                  setPickerPosition({ 
                                    top: rect.bottom + 2,
                                    bottom: rect.top,
                                    left: rect.left, 
                                    width: rect.width,
                                    openUpward
                                  });
                                }
                                setShowEquipmentPicker(!showEquipmentPicker);
                                setShowGripPicker(false);
                              }}
                              className={cn(
                                'flex items-center justify-between gap-1 px-2 py-1.5 rounded-lg transition-colors text-xs w-[140px] sm:w-[160px]',
                                showEquipmentPicker ? 'bg-zinc-700 text-zinc-300' : 'bg-zinc-700/50 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-300'
                              )}
                            >
                              <span className="truncate overflow-hidden">{editEquipment ? EQUIPMENT_TYPES[editEquipment].full : 'Не выбран'}</span>
                              <ChevronDownIcon className={cn(
                                'w-3 h-3 transition-transform shrink-0',
                                showEquipmentPicker && 'rotate-180'
                              )} />
                            </button>
                          </div>
                        )}
                        
                        {/* Третья строка: Тип хвата */}
                        {!set.time && set.reps > 0 && (
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] text-zinc-500 w-16 shrink-0">Тип хвата</span>
                            <button
                              ref={editGripButtonRef}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (!showGripPicker && editGripButtonRef.current) {
                                  const rect = editGripButtonRef.current.getBoundingClientRect();
                                  const viewportHeight = window.innerHeight;
                                  const listHeight = 200;
                                  const spaceBelow = viewportHeight - rect.bottom;
                                  const spaceAbove = rect.top;
                                  const openUpward = spaceBelow < listHeight && spaceAbove > spaceBelow;
                                  
                                  setPickerPosition({ 
                                    top: rect.bottom + 2,
                                    bottom: rect.top,
                                    left: rect.left, 
                                    width: rect.width,
                                    openUpward
                                  });
                                }
                                setShowGripPicker(!showGripPicker);
                                setShowEquipmentPicker(false);
                              }}
                              className={cn(
                                'flex items-center justify-between gap-1 px-2 py-1.5 rounded-lg transition-colors text-xs w-[140px] sm:w-[160px]',
                                showGripPicker ? 'bg-zinc-700 text-zinc-300' : 'bg-zinc-700/50 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-300'
                              )}
                            >
                              <span className="truncate overflow-hidden">{editGrip ? GRIP_TYPES[editGrip].full : 'Не выбран'}</span>
                              <ChevronDownIcon className={cn(
                                'w-3 h-3 transition-transform shrink-0',
                                showGripPicker && 'rotate-180'
                              )} />
                            </button>
                          </div>
                        )}
                      </div>
                      
                      {/* Крестик отмены в том же столбце что и кнопка удаления */}
                      <Button
                        variant="ghost"
                        onClick={() => setEditingSetId(null)}
                        className="text-zinc-500 hover:text-white active:text-white hover:!bg-transparent dark:hover:!bg-transparent active:!bg-transparent h-7 w-7 shrink-0 p-0"
                      >
                        <XIcon className="w-4 h-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <div
                        onClick={() => startEditingSet(set)}
                        className="flex-1 h-7 flex items-center cursor-pointer hover:bg-zinc-700/30 active:bg-zinc-700/30 px-2 -ml-2 rounded-lg transition-colors"
                      >
                        {renderSetDisplay(set, setIndex)}
                      </div>
                      
                      {/* Equipment and grip tags */}
                      <div className="flex items-center gap-1">
                        {set.equipmentType && (
                          <div className="h-7 flex-1 min-w-[44px] px-1 rounded-lg text-[11px] font-medium flex items-center justify-center text-primary-foreground whitespace-nowrap"
                               style={{ backgroundColor: exerciseColors.border }}>
                            {EQUIPMENT_TYPES[set.equipmentType].short}
                          </div>
                        )}
                        {set.gripType && (
                          <div className="h-7 flex-1 min-w-[44px] px-1 rounded-lg text-[11px] font-medium flex items-center justify-center text-primary-foreground whitespace-nowrap"
                               style={{ backgroundColor: exerciseColors.border }}>
                            {GRIP_TYPES[set.gripType].short}
                          </div>
                        )}
                      </div>
                      
                      <Button
                        variant="ghost"
                        onClick={() => handleRemoveSet(set.id)}
                        className="text-zinc-500 hover:text-red-400 active:text-red-400 hover:!bg-transparent dark:hover:!bg-transparent active:!bg-transparent h-7 w-7 shrink-0 p-0"
                      >
                        <Trash2Icon className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </div>
              );})}
              </div>

              {/* Overlay to block clicks while adding or editing set */}
              {(isAddingSet || editingSetId) && (
                <div className="fixed inset-0 z-[9999] bg-black/50" onClick={(e) => e.stopPropagation()} />
              )}
              {isAddingSet ? (
                <div className="pt-4 relative z-[10000]">
                  {/* Toggle tags */}
                  <div className="flex gap-2 flex-wrap items-center mb-2">
                    {!exercise.sets.some(s => s.isWarmup) && (
                      <div
                        onClick={() => setIsWarmup(!isWarmup)}
                        className={cn(
                          'flex items-center gap-1 px-2 py-1 rounded-lg cursor-pointer transition-colors',
                          isWarmup ? '' : 'bg-zinc-700/50'
                        )}
                        style={isWarmup ? { backgroundColor: '#734200' } : undefined}
                      >
                        <ZapIcon className="w-3 h-3" style={{ color: isWarmup ? '#ffb900' : '#a1a1aa' }} />
                        <span className="text-[9px]" style={{ color: isWarmup ? '#ffb900' : '#d4d4d8' }}>Разм.</span>
                      </div>
                    )}

                    <div
                      onClick={() => setUseBodyweight(!useBodyweight)}
                      className={cn(
                        'flex items-center gap-1 px-2 py-1 rounded-lg cursor-pointer transition-colors',
                        useBodyweight ? '' : 'bg-zinc-700/50'
                      )}
                      style={useBodyweight ? { backgroundColor: '#072f18' } : undefined}
                    >
                      <UserIcon className="w-3 h-3" style={{ color: useBodyweight ? '#19a655' : '#a1a1aa' }} />
                      <span className="text-[9px]" style={{ color: useBodyweight ? '#19a655' : '#d4d4d8' }}>Собст. вес</span>
                    </div>

                    <div
                      onClick={() => setUseReps(!useReps)}
                      className={cn(
                        'flex items-center gap-1 px-2 py-1 rounded-lg cursor-pointer transition-colors',
                        useReps ? '' : 'bg-zinc-700/50'
                      )}
                      style={useReps ? { backgroundColor: '#391013' } : undefined}
                    >
                      <Repeat2Icon className="w-3 h-3" style={{ color: useReps ? '#c93843' : '#a1a1aa' }} />
                      <span className="text-[9px]" style={{ color: useReps ? '#c93843' : '#d4d4d8' }}>Повт.</span>
                    </div>

                    <div
                      onClick={() => setUseTime(!useTime)}
                      className={cn(
                        'flex items-center gap-1 px-2 py-1 rounded-lg cursor-pointer transition-colors',
                        useTime ? '' : 'bg-zinc-700/50'
                      )}
                      style={useTime ? { backgroundColor: '#2a153c' } : undefined}
                    >
                      <ClockIcon className="w-3 h-3" style={{ color: useTime ? '#944ad4' : '#a1a1aa' }} />
                      <span className="text-[9px]" style={{ color: useTime ? '#944ad4' : '#d4d4d8' }}>Вр.</span>
                    </div>
                  </div>

                  {/* Input fields */}
                  <div className="flex items-center gap-2 mb-2 -ml-9">
                    <div className={cn(
                      'w-7 h-7 rounded-lg flex items-center justify-center text-xs font-medium shrink-0',
                      isWarmup
                        ? 'bg-transparent text-zinc-500 border border-zinc-500'
                        : 'bg-zinc-700 text-zinc-300'
                    )}>
                      {isWarmup ? 'Р' : exercise.sets.filter(s => !s.isWarmup).length + 1}
                    </div>

                    {(!useBodyweight || useReps) && (
                      <div className="flex items-center gap-3 relative">
                        {!useBodyweight && (
                          <Input
                            type="number"
                            step="0.5"
                            min="0.1"
                            value={newWeight}
                            onChange={(e) => setNewWeight(e.target.value)}
                            placeholder="кг"
                            className="w-14 h-7 bg-zinc-700 border-zinc-600 text-white text-xs placeholder:text-[10px] text-zinc-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                        )}

                        {!useBodyweight && useReps && (
                          <span className="absolute left-1/2 -translate-x-1/2 text-zinc-500 text-sm">×</span>
                        )}

                        {useReps && (
                          <Input
                            type="number"
                            min="1"
                            value={newReps}
                            onChange={(e) => setNewReps(e.target.value)}
                            placeholder="повт."
                            className="w-14 h-7 bg-zinc-700 border-zinc-600 text-white text-xs placeholder:text-[10px] text-zinc-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                        )}
                      </div>
                    )}

                    {useTime && (
                      <div className="flex items-center gap-3 relative">
                        <Input
                          type="number"
                          min="0"
                          value={newTimeMinutes}
                          onChange={(e) => setNewTimeMinutes(e.target.value)}
                          placeholder="мин."
                          className="w-14 h-7 bg-zinc-700 border-zinc-600 text-white text-xs text-center placeholder:text-[10px] text-zinc-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <span className="absolute left-1/2 -translate-x-1/2 text-zinc-500 text-xs">:</span>
                        <Input
                          type="number"
                          min="0"
                          max={59}
                          value={newTimeSeconds}
                          onChange={(e) => setNewTimeSeconds(e.target.value)}
                          placeholder="сек."
                          className="w-14 h-7 bg-zinc-700 border-zinc-600 text-white text-xs text-center placeholder:text-[10px] text-zinc-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                      </div>
                    )}
                  </div>

                  {/* Previous values hint */}
                  {(() => {
                    const prevData = isWarmup ? prevWarmupSetData : prevWorkingSetData;
                    if (!prevData) return null;

                    return (
                      <div className="flex items-center text-[10px] text-zinc-500 -ml-9 gap-2 mb-2">
                        <div className="w-7 text-center">Было</div>
                        {(!useBodyweight || useReps) && (
                          <div className="flex items-center gap-3 relative">
                            {!useBodyweight && (
                              <div className="w-14 text-center">
                                {prevData.isBodyweight ? (
                                  <span>Собст. вес</span>
                                ) : prevData.weight > 0 ? (
                                  <span>{prevData.weight} кг</span>
                                ) : null}
                              </div>
                            )}
                            {!useBodyweight && useReps && (
                              <span className="absolute left-1/2 -translate-x-1/2 text-center">×</span>
                            )}
                            {useReps && (
                              <div className="w-14 text-center">
                                {prevData.reps > 0 ? `${prevData.reps} повт.` : ''}
                              </div>
                            )}
                          </div>
                        )}
                        {useTime && (
                          <div className="flex items-center gap-3 relative">
                            <div className="w-14 text-center">
                              {prevData.time > 0 ? Math.floor(prevData.time / 60) : ''}
                            </div>
                            <span className="absolute left-1/2 -translate-x-1/2 text-xs">:</span>
                            <div className="w-14 text-center">
                              {prevData.time > 0 ? (prevData.time % 60).toString().padStart(2, '0') : ''}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* Equipment and grip selection */}
                  {!useBodyweight && (
                    <div className="flex items-center gap-1 mb-2">
                      <span className="text-[10px] text-zinc-500 w-16 shrink-0">Снаряд</span>
                      <button
                        ref={equipmentButtonRef}
                        type="button"
                        onClick={() => {
                          if (!showEquipmentPicker && equipmentButtonRef.current) {
                            const rect = equipmentButtonRef.current.getBoundingClientRect();
                            const viewportHeight = window.innerHeight;
                            const listHeight = 320; // увеличенная высота для вертикальных устройств
                            const spaceBelow = viewportHeight - rect.bottom;
                            const spaceAbove = rect.top;
                            const openUpward = spaceBelow < listHeight && spaceAbove > spaceBelow;
                            
                            setPickerPosition({ 
                              top: rect.bottom + 2,
                              bottom: rect.top,
                              left: rect.left, 
                              width: rect.width,
                              openUpward
                            });
                          }
                          setShowEquipmentPicker(!showEquipmentPicker);
                          setShowGripPicker(false);
                        }}
                        className={cn(
                          'flex items-center justify-between gap-1 px-2 py-1.5 rounded-lg transition-colors text-xs w-[140px] sm:w-[160px]',
                          showEquipmentPicker ? 'bg-zinc-700 text-zinc-300' : 'bg-zinc-700/50 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-300'
                        )}
                      >
                        <span className="truncate overflow-hidden">{selectedEquipment ? EQUIPMENT_TYPES[selectedEquipment].full : 'Не выбран'}</span>
                        <ChevronDownIcon className={cn(
                          'w-3 h-3 transition-transform shrink-0',
                          showEquipmentPicker && 'rotate-180'
                        )} />
                      </button>
                    </div>
                  )}
                  
                  {!useTime && (
                    <div className="flex items-center gap-1 mb-2">
                      <span className="text-[10px] text-zinc-500 w-16 shrink-0">Тип хвата</span>
                      <button
                        ref={gripButtonRef}
                        type="button"
                        onClick={() => {
                          if (!showGripPicker && gripButtonRef.current) {
                            const rect = gripButtonRef.current.getBoundingClientRect();
                            const viewportHeight = window.innerHeight;
                            const listHeight = 200; // 6 пунктов легко влезают без прокрутки
                            const spaceBelow = viewportHeight - rect.bottom;
                            const spaceAbove = rect.top;
                            const openUpward = spaceBelow < listHeight && spaceAbove > spaceBelow;
                            
                            setPickerPosition({ 
                              top: rect.bottom + 2,
                              bottom: rect.top,
                              left: rect.left, 
                              width: rect.width,
                              openUpward
                            });
                          }
                          setShowGripPicker(!showGripPicker);
                          setShowEquipmentPicker(false);
                        }}
                        className={cn(
                          'flex items-center justify-between gap-1 px-2 py-1.5 rounded-lg transition-colors text-xs w-[140px] sm:w-[160px]',
                          showGripPicker ? 'bg-zinc-700 text-zinc-300' : 'bg-zinc-700/50 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-300'
                        )}
                      >
                        <span className="truncate overflow-hidden">{selectedGrip ? GRIP_TYPES[selectedGrip].full : 'Не выбран'}</span>
                        <ChevronDownIcon className={cn(
                          'w-3 h-3 transition-transform shrink-0',
                          showGripPicker && 'rotate-180'
                        )} />
                      </button>
                    </div>
                  )}

                  {/* Buttons */}
                  <div className="flex justify-end items-center gap-2 pt-4">
                    <Button
                      onClick={() => {
                        setIsAddingSet(false);
                        setNewReps('');
                        setNewWeight('');
                        setNewTimeMinutes('');
                        setNewTimeSeconds('');
                        setUseBodyweight(false);
                        setUseReps(true);
                        setIsWarmup(false);
                        setSelectedEquipment(null);
                        setSelectedGrip(null);
                        setShowEquipmentPicker(false);
                        setShowGripPicker(false);
                      }}
                      className="bg-zinc-700 text-zinc-300 border-0 hover:bg-zinc-700 hover:text-zinc-300 active:bg-zinc-700 active:text-zinc-300 retro-large-text"
                    >
                      Отмена
                    </Button>
                    <Button
                      onClick={handleAddSet}
                      disabled={
                        (useReps && !newReps) || 
                        (!useBodyweight && useReps && !newWeight) ||
                        (!useReps && !newTimeMinutes && !newTimeSeconds)
                      }
                      style={{ backgroundColor: '#19a655' }}
                      className="retro-large-text"
                    >
                      Добавить
                    </Button>
                  </div>
                </div>
              ) : (
                <div className={cn("flex justify-end", exercise.sets.length > 0 && "mt-4")}>
                  <Button
                    onClick={handleStartAddingSet}
                    style={{ backgroundColor: '#19a655' }}
                    className="retro-large-text"
                  >
                    Добавить подход
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete exercise confirmation */}
      <ConfirmDialog
        open={showDeleteExerciseConfirm}
        onOpenChange={setShowDeleteExerciseConfirm}
        title="Удалить упражнение?"
        description={
          <>
            Упражнение <strong className="text-white">"{exercise.name}"</strong> и все его подходы на текущей дате будут удалены.<br />
            Это действие нельзя отменить.
          </>
        }
        confirmText="Удалить"
        onConfirm={handleDeleteExercise}
        borderColor={exerciseColors.border}
      />

      {/* Delete set confirmation */}
      <ConfirmDialog
        open={showDeleteSetConfirm}
        onOpenChange={(open) => {
          setShowDeleteSetConfirm(open);
          if (!open) setSetToDelete(null);
        }}
        title="Удалить подход?"
        description={
          <>
            {setToDelete && (() => {
              const setToDeleteData = exercise.sets.find(s => s.id === setToDelete);
              if (!setToDeleteData) return null;
              
              if (setToDeleteData.isWarmup) {
                return (
                  <>
                    <strong className="text-white">Разминочный</strong> подход будет удалён.<br />
                    Это действие нельзя отменить.
                  </>
                );
              }
              
              // Вычисляем номер рабочего подхода (как в UI)
              let workingSetNumber = 0;
              for (let i = 0; i < exercise.sets.length; i++) {
                if (!exercise.sets[i].isWarmup) workingSetNumber++;
                if (exercise.sets[i].id === setToDelete) break;
              }
              
              return (
                <>
                  Подход <strong className="text-white">#{workingSetNumber}</strong> будет удалён.<br />
                  Это действие нельзя отменить.
                </>
              );
            })()}
          </>
        }
        confirmText="Удалить"
        onConfirm={confirmDeleteSet}
        borderColor={exerciseColors.border}
      />

      {/* Exercise statistics modal */}
      <Dialog open={showStats} onOpenChange={setShowStats}>
        <DialogContent 
          className="bg-zinc-900 border !p-0 !gap-0 max-w-[95vw]"
          style={{ borderColor: exerciseColors.border }}
          showCloseButton={false}
        >
          <div className="flex items-center justify-between px-4 pt-4">
            <DialogTitle className="text-white font-medium text-base">Динамика весов упражнения</DialogTitle>
            <button
              type="button"
              onClick={() => setShowStats(false)}
              className="text-zinc-500 hover:text-white active:text-white transition-colors p-1"
              data-slot="dialog-close"
            >
              <XIcon className="w-5 h-5" />
            </button>
          </div>
          
          <div className="p-4">
            {exerciseHistory.length > 0 ? (
              <ExerciseStatsChart 
                data={exerciseHistory} 
                color={exerciseColors.border}
                textColor={exerciseColors.text}
                currentWorkoutId={workoutId}
                exerciseName={exercise.name}
                onNavigateToDate={(date) => {
                  setShowStats(false);
                  setSelectedDate(date);
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

      {/* Portal for dropdown pickers - rendered at top level for both add and edit modes */}
      {(showEquipmentPicker || showGripPicker) && createPortal(
        <>
          <div 
            className="fixed inset-0 z-[10000]" 
            onClick={() => {
              setShowEquipmentPicker(false);
              setShowGripPicker(false);
            }}
          />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={cn(
              "fixed bg-zinc-800 rounded-lg border border-zinc-700 shadow-xl z-[10001]",
              showEquipmentPicker ? "max-h-[320px] overflow-y-auto" : "overflow-hidden"
            )}
            style={{ 
              top: pickerPosition.openUpward ? pickerPosition.bottom : pickerPosition.top,
              left: pickerPosition.left,
              minWidth: Math.max(pickerPosition.width, 160),
              transform: pickerPosition.openUpward ? 'translateY(-100%) translateY(-2px)' : undefined
            }}
          >
            <div className="flex flex-col gap-1 p-2">
              {showEquipmentPicker ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      if (editingSetId) {
                        setEditEquipment(null);
                      } else {
                        setSelectedEquipment(null);
                      }
                      setShowEquipmentPicker(false);
                    }}
                    className="px-3 py-1.5 text-xs rounded-lg transition-colors text-left text-zinc-300 hover:bg-zinc-700"
                  >
                    Не выбран
                  </button>
                  {(Object.keys(EQUIPMENT_TYPES) as EquipmentType[]).map((type) => {
                    const currentEquipment = editingSetId ? editEquipment : selectedEquipment;
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => {
                          if (editingSetId) {
                            setEditEquipment(type);
                          } else {
                            setSelectedEquipment(type);
                          }
                          setShowEquipmentPicker(false);
                        }}
                        className="px-3 py-1.5 text-xs rounded-lg transition-colors text-left text-zinc-300 hover:bg-zinc-700"
                        style={currentEquipment === type ? {
                          backgroundColor: '#072f18',
                          color: '#fff'
                        } : undefined}
                      >
                        {EQUIPMENT_TYPES[type].full}
                      </button>
                    );
                  })}
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      if (editingSetId) {
                        setEditGrip(null);
                      } else {
                        setSelectedGrip(null);
                      }
                      setShowGripPicker(false);
                    }}
                    className="px-3 py-1.5 text-xs rounded-lg transition-colors text-left text-zinc-300 hover:bg-zinc-700"
                  >
                    Не выбран
                  </button>
                  {(Object.keys(GRIP_TYPES) as GripType[]).map((type) => {
                    const currentGrip = editingSetId ? editGrip : selectedGrip;
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => {
                          if (editingSetId) {
                            setEditGrip(type);
                          } else {
                            setSelectedGrip(type);
                          }
                          setShowGripPicker(false);
                        }}
                        className="px-3 py-1.5 text-xs rounded-lg transition-colors text-left text-zinc-300 hover:bg-zinc-700"
                        style={currentGrip === type ? {
                          backgroundColor: '#072f18',
                          color: '#fff'
                        } : undefined}
                      >
                        {GRIP_TYPES[type].full}
                      </button>
                    );
                  })}
                </>
              )}
            </div>
          </motion.div>
        </>,
        document.body
      )}
    </>
  );
}
