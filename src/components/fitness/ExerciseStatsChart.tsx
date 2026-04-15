'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDownIcon } from '@/components/icons/Icons';
import { EquipmentType, GripType, PositionType, EQUIPMENT_TYPES, GRIP_TYPES, POSITION_TYPES, WeightUnit, WEIGHT_UNITS } from '@/lib/types';
import { cn } from '@/lib/utils';
import { isDefaultFont } from '@/lib/storage';

// Информация о подходе для фильтрации
export interface SetInfo {
  weight: number;
  reps: number;
  time?: number;
  equipmentType?: EquipmentType;
  gripType?: GripType;
  positionType?: PositionType;
  setId: string;
}

export interface ChartDataPoint {
  date: string;
  setsInfo: SetInfo[]; // информация о всех подходах
  userWeight?: number;
  workoutId: string;
  weightUnit: WeightUnit; // единица измерения для этой точки
}

// Данные графика с вычисленными значениями
interface ProcessedChartDataPoint extends ChartDataPoint {
  maxWeight: number;
  maxWeightSetId?: string;
  totalVolume: number;
}

interface ExerciseStatsChartProps {
  data: ChartDataPoint[];
  color: string;
  textColor: string;
  currentWorkoutId: string;
  exerciseName: string;
  currentUnit?: WeightUnit; // текущая единица измерения упражнения
  onNavigateToDate?: (date: string, exerciseName: string, setId?: string) => void;
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

export function ExerciseStatsChart({ data, color, textColor, currentWorkoutId, exerciseName, currentUnit, onNavigateToDate }: ExerciseStatsChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isDefaultStyle, setIsDefaultStyle] = useState(true);

  // Проверяем стиль при монтировании
  useEffect(() => {
    setIsDefaultStyle(isDefaultFont());
  }, []);

  // Состояние видимости графиков
  const [showMaxWeight, setShowMaxWeight] = useState(true);
  const [showUserWeight, setShowUserWeight] = useState(false);
  const [showTotalVolume, setShowTotalVolume] = useState(false);

  // Состояние для выбранной единицы измерения - по умолчанию текущая единица упражнения
  const [selectedUnit, setSelectedUnit] = useState<WeightUnit>(currentUnit || 'kg');

  // Фильтры по тегам
  const [filterPosition, setFilterPosition] = useState<PositionType | 'all'>('all');
  const [filterEquipment, setFilterEquipment] = useState<EquipmentType | 'all'>('all');
  const [filterGrip, setFilterGrip] = useState<GripType | 'all'>('all');

  // Состояния для открытия пикеров фильтров
  const [showUnitFilter, setShowUnitFilter] = useState(false);
  const [showPositionFilter, setShowPositionFilter] = useState(false);
  const [showEquipmentFilter, setShowEquipmentFilter] = useState(false);
  const [showGripFilter, setShowGripFilter] = useState(false);
  const [filterPickerPosition, setFilterPickerPosition] = useState({ top: 0, left: 0, width: 0, openUpward: false, bottom: 0 });
  const unitFilterRef = useRef<HTMLButtonElement>(null);
  const positionFilterRef = useRef<HTMLButtonElement>(null);
  const equipmentFilterRef = useRef<HTMLButtonElement>(null);
  const gripFilterRef = useRef<HTMLButtonElement>(null);

  // Синхронизация с текущей единицей при открытии модального окна
  useEffect(() => {
    if (currentUnit) {
      setSelectedUnit(currentUnit);
    }
  }, [currentUnit]);

  // Определяем доступные теги в данных
  const availableTags = useMemo(() => {
    const positions = new Set<PositionType>();
    const equipments = new Set<EquipmentType>();
    const grips = new Set<GripType>();

    data.forEach(d => {
      d.setsInfo.forEach(set => {
        if (set.positionType) positions.add(set.positionType);
        if (set.equipmentType) equipments.add(set.equipmentType);
        if (set.gripType) grips.add(set.gripType);
      });
    });

    return { positions, equipments, grips };
  }, [data]);

  // Функция для вычисления maxWeight и totalVolume из подходов с учётом фильтров
  const computeSetStats = useMemo(() => {
    return (setsInfo: SetInfo[]) => {
      // Фильтруем подходы по выбранным тегам
      const filteredSets = setsInfo.filter(set => {
        if (filterPosition !== 'all' && set.positionType !== filterPosition) return false;
        if (filterEquipment !== 'all' && set.equipmentType !== filterEquipment) return false;
        if (filterGrip !== 'all' && set.gripType !== filterGrip) return false;
        return true;
      });

      if (filteredSets.length === 0) {
        return { maxWeight: 0, maxWeightSetId: undefined, totalVolume: 0 };
      }

      const maxWeight = Math.max(...filteredSets.map(s => s.weight));
      const maxWeightSet = filteredSets.find(s => s.weight === maxWeight);
      const totalVolume = filteredSets.reduce((sum, s) => sum + (s.weight * s.reps), 0);

      return { maxWeight, maxWeightSetId: maxWeightSet?.setId, totalVolume };
    };
  }, [filterPosition, filterEquipment, filterGrip]);

  // Фильтруем данные по выбранной единице и вычисляем значения
  const filteredData = useMemo((): ProcessedChartDataPoint[] => {
    return data.filter(d => d.weightUnit === selectedUnit).map(d => ({
      ...d,
      ...computeSetStats(d.setsInfo),
    }));
  }, [data, selectedUnit, computeSetStats]);

  // Определяем доступные единицы измерения (те, для которых есть данные)
  const availableUnits = useMemo(() => {
    const units = new Set<WeightUnit>();
    data.forEach(d => units.add(d.weightUnit));
    return units;
  }, [data]);

  // Состояние для диапазона отображаемых данных
  // Показываем последние N тренировок по умолчанию
  const [rangeStart, setRangeStart] = useState(Math.max(0, filteredData.length - DEFAULT_VISIBLE_COUNT));
  const [rangeEnd, setRangeEnd] = useState(filteredData.length);

  // Refs для pinch-to-zoom
  const lastPinchDistanceRef = useRef<number | null>(null);
  const touchStartPosRef = useRef<{ x: number; y: number } | null>(null);

  // Refs для двойного клика
  const clickCountRef = useRef(0);
  const lastClickTimeRef = useRef(0);

  // Сброс диапазона при смене единицы или фильтров
  useEffect(() => {
    setRangeStart(Math.max(0, filteredData.length - DEFAULT_VISIBLE_COUNT));
    setRangeEnd(filteredData.length);
    setSelectedIndex(null);
  }, [selectedUnit, filterPosition, filterEquipment, filterGrip, filteredData.length]);

  // Видимые данные на основе диапазона
  const visibleData = filteredData.slice(rangeStart, rangeEnd);
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

  if (filteredData.length === 0) {
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
      const clampedCount = Math.max(3, Math.min(filteredData.length, newCount));

      if (clampedCount !== visibleCount) {
        // Центрируем zoom вокруг текущей позиции
        const centerIndex = rangeStart + Math.floor(visibleCount / 2);
        let newStart = Math.round(centerIndex - clampedCount / 2);
        newStart = Math.max(0, Math.min(filteredData.length - clampedCount, newStart));

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
    const newCount = Math.max(3, Math.min(filteredData.length, visibleCount + delta));

    if (newCount !== visibleCount) {
      // Центрируем zoom
      const centerIndex = rangeStart + Math.floor(visibleCount / 2);
      let newStart = Math.round(centerIndex - newCount / 2);
      newStart = Math.max(0, Math.min(filteredData.length - newCount, newStart));

      setRangeStart(newStart);
      setRangeEnd(newStart + newCount);
    }
  };

  // Выбранные данные
  const selectedData = selectedIndex !== null ? visibleData[selectedIndex] : null;

  // Обработчик двойного клика по маркеру - открывает мини-карточку с подсветкой подхода
  const handleMarkerDoubleClick = () => {
    if (!onNavigateToDate || !selectedData) return;

    const now = Date.now();
    const timeDiff = now - lastClickTimeRef.current;

    // Если прошло меньше 400мс с последнего клика - увеличиваем счётчик
    if (timeDiff < 400) {
      clickCountRef.current += 1;
    } else {
      // Иначе сбрасываем счётчик
      clickCountRef.current = 1;
    }

    lastClickTimeRef.current = now;

    // Если два клика - открываем мини-карточку
    if (clickCountRef.current >= 2) {
      onNavigateToDate(selectedData.date, exerciseName, selectedData.maxWeightSetId);
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
  const generateLinePoints = (getValue: (d: ProcessedChartDataPoint) => number, show: boolean) => {
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
              <span className="font-medium" style={{ color: CHART_COLORS.maxWeight }}>{selectedData.maxWeight} {WEIGHT_UNITS[selectedUnit].short}</span>
            )}
            {showUserWeight && selectedData.userWeight && selectedData.userWeight > 0 && (
              <span className="font-medium" style={{ color: CHART_COLORS.userWeight }}>{selectedData.userWeight} кг</span>
            )}
            {showTotalVolume && selectedData.totalVolume > 0 && (
              <span className="font-medium" style={{ color: CHART_COLORS.totalVolume }}>{selectedData.totalVolume} {WEIGHT_UNITS[selectedUnit].short}</span>
            )}
          </div>
        </div>
      )}

      {/* Фильтры по тегам - селекторы (всегда видны, неактивны если нет тегов) */}
      <div className="flex" onTouchStart={(e) => e.stopPropagation()}>
        <div className="w-[40px] shrink-0"></div>
        <div className="flex-1 flex gap-1">
          {/* Фильтр единиц измерения */}
          <button
            ref={unitFilterRef}
            type="button"
            onTouchStart={(e) => e.stopPropagation()}
            onClick={() => {
              if (!showUnitFilter && unitFilterRef.current) {
                const rect = unitFilterRef.current.getBoundingClientRect();
                setFilterPickerPosition({
                  top: rect.bottom + 2,
                  bottom: rect.top,
                  left: rect.left,
                  width: rect.width,
                  openUpward: false
                });
              }
              setShowUnitFilter(!showUnitFilter);
              setShowPositionFilter(false);
              setShowEquipmentFilter(false);
              setShowGripFilter(false);
            }}
            className={cn(
              'flex-1 flex items-center justify-between gap-1 px-2 py-1 transition-colors text-xs',
              isDefaultStyle ? 'rounded-lg' : 'rounded-sm',
              showUnitFilter
                ? 'bg-zinc-700 text-zinc-300'
                : 'bg-zinc-700/50 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-300'
            )}
          >
            <span className="truncate">{WEIGHT_UNITS[selectedUnit].short}</span>
            <ChevronDownIcon className={cn('w-3 h-3 transition-transform shrink-0', showUnitFilter && 'rotate-180')} />
          </button>

          {/* Фильтр позиции */}
          <button
            ref={positionFilterRef}
            type="button"
            disabled={availableTags.positions.size === 0}
            onTouchStart={(e) => e.stopPropagation()}
            onClick={() => {
              if (availableTags.positions.size === 0) return;
              if (!showPositionFilter && positionFilterRef.current) {
                const rect = positionFilterRef.current.getBoundingClientRect();
                setFilterPickerPosition({
                  top: rect.bottom + 2,
                  bottom: rect.top,
                  left: rect.left,
                  width: rect.width,
                  openUpward: false
                });
              }
              setShowPositionFilter(!showPositionFilter);
              setShowUnitFilter(false);
              setShowEquipmentFilter(false);
              setShowGripFilter(false);
            }}
            className={cn(
              'flex-1 flex items-center justify-between gap-1 px-2 py-1 transition-colors text-xs',
              isDefaultStyle ? 'rounded-lg' : 'rounded-sm',
              availableTags.positions.size === 0
                ? 'bg-zinc-800/30 text-zinc-600 cursor-not-allowed'
                : showPositionFilter
                  ? 'bg-zinc-700 text-zinc-300'
                  : 'bg-zinc-700/50 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-300'
            )}
          >
            <span className="truncate">{filterPosition === 'all' ? 'Позиция' : POSITION_TYPES[filterPosition].short}</span>
            <ChevronDownIcon className={cn('w-3 h-3 transition-transform shrink-0', showPositionFilter && 'rotate-180')} />
          </button>

          {/* Фильтр снаряда */}
          <button
            ref={equipmentFilterRef}
            type="button"
            disabled={availableTags.equipments.size === 0}
            onTouchStart={(e) => e.stopPropagation()}
            onClick={() => {
              if (availableTags.equipments.size === 0) return;
              if (!showEquipmentFilter && equipmentFilterRef.current) {
                const rect = equipmentFilterRef.current.getBoundingClientRect();
                setFilterPickerPosition({
                  top: rect.bottom + 2,
                  bottom: rect.top,
                  left: rect.left,
                  width: rect.width,
                  openUpward: false
                });
              }
              setShowEquipmentFilter(!showEquipmentFilter);
              setShowUnitFilter(false);
              setShowPositionFilter(false);
              setShowGripFilter(false);
            }}
            className={cn(
              'flex-1 flex items-center justify-between gap-1 px-2 py-1 transition-colors text-xs',
              isDefaultStyle ? 'rounded-lg' : 'rounded-sm',
              availableTags.equipments.size === 0
                ? 'bg-zinc-800/30 text-zinc-600 cursor-not-allowed'
                : showEquipmentFilter
                  ? 'bg-zinc-700 text-zinc-300'
                  : 'bg-zinc-700/50 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-300'
            )}
          >
            <span className="truncate">{filterEquipment === 'all' ? 'Снаряд' : EQUIPMENT_TYPES[filterEquipment].short}</span>
            <ChevronDownIcon className={cn('w-3 h-3 transition-transform shrink-0', showEquipmentFilter && 'rotate-180')} />
          </button>

          {/* Фильтр хвата */}
          <button
            ref={gripFilterRef}
            type="button"
            disabled={availableTags.grips.size === 0}
            onTouchStart={(e) => e.stopPropagation()}
            onClick={() => {
              if (availableTags.grips.size === 0) return;
              if (!showGripFilter && gripFilterRef.current) {
                const rect = gripFilterRef.current.getBoundingClientRect();
                setFilterPickerPosition({
                  top: rect.bottom + 2,
                  bottom: rect.top,
                  left: rect.left,
                  width: rect.width,
                  openUpward: false
                });
              }
              setShowGripFilter(!showGripFilter);
              setShowUnitFilter(false);
              setShowPositionFilter(false);
              setShowEquipmentFilter(false);
            }}
            className={cn(
              'flex-1 flex items-center justify-between gap-1 px-2 py-1 transition-colors text-xs',
              isDefaultStyle ? 'rounded-lg' : 'rounded-sm',
              availableTags.grips.size === 0
                ? 'bg-zinc-800/30 text-zinc-600 cursor-not-allowed'
                : showGripFilter
                  ? 'bg-zinc-700 text-zinc-300'
                  : 'bg-zinc-700/50 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-300'
            )}
          >
            <span className="truncate">{filterGrip === 'all' ? 'Хват' : GRIP_TYPES[filterGrip].short}</span>
            <ChevronDownIcon className={cn('w-3 h-3 transition-transform shrink-0', showGripFilter && 'rotate-180')} />
          </button>
        </div>
      </div>

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
          style={(showUnitFilter || showPositionFilter || showEquipmentFilter || showGripFilter) ? { pointerEvents: 'none' } : undefined}
          onTouchStart={(e) => {
            if (showUnitFilter || showPositionFilter || showEquipmentFilter || showGripFilter) return;
            handleTouchStart(e);
          }}
          onTouchMove={(e) => {
            if (showUnitFilter || showPositionFilter || showEquipmentFilter || showGripFilter) return;
            handleTouchMove(e);
          }}
          onTouchEnd={(e) => {
            if (showUnitFilter || showPositionFilter || showEquipmentFilter || showGripFilter) return;
            handleTouchEnd();
          }}
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
          </svg>

          {/* Точки на графике - общий объём (div для сохранения пропорций) */}
          {showTotalVolume && visibleData.map((d, i) => {
            if (d.totalVolume <= 0) return null;
            const isSelected = i === selectedIndex;
            const activeSize = 8; // w-2 = 8px
            const inactiveSize = activeSize / 2;
            const size = isSelected ? activeSize : inactiveSize;

            // Инвертированные цвета для неактивных: fill=фон, stroke=цвет графика
            const style: React.CSSProperties = isSelected ? {
              left: `${getXPosition(i)}%`,
              top: `${getYPosition(d.totalVolume)}%`,
              width: size,
              height: size,
              backgroundColor: CHART_COLORS.totalVolume,
              border: '2px solid #27272a',
            } : {
              left: `${getXPosition(i)}%`,
              top: `${getYPosition(d.totalVolume)}%`,
              width: size,
              height: size,
              backgroundColor: '#27272a',
              border: `1px solid ${CHART_COLORS.totalVolume}`,
            };

            return (
              <div
                key={`volume-${i}`}
                onClick={() => setSelectedIndex(i)}
                className={`absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-150 cursor-pointer ${isDefaultStyle ? 'rounded-full' : 'rounded-sm'}`}
                style={style}
              />
            );
          })}

          {/* Точки на графике - вес пользователя (div для сохранения пропорций) */}
          {showUserWeight && visibleData.map((d, i) => {
            if (!d.userWeight || d.userWeight <= 0) return null;
            const isSelected = i === selectedIndex;
            const activeSize = 8;
            const inactiveSize = activeSize / 2;
            const size = isSelected ? activeSize : inactiveSize;

            const style: React.CSSProperties = isSelected ? {
              left: `${getXPosition(i)}%`,
              top: `${getYPosition(d.userWeight!)}%`,
              width: size,
              height: size,
              backgroundColor: CHART_COLORS.userWeight,
              border: '2px solid #27272a',
            } : {
              left: `${getXPosition(i)}%`,
              top: `${getYPosition(d.userWeight!)}%`,
              width: size,
              height: size,
              backgroundColor: '#27272a',
              border: `1px solid ${CHART_COLORS.userWeight}`,
            };

            return (
              <div
                key={`userweight-${i}`}
                onClick={() => setSelectedIndex(i)}
                className={`absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-150 cursor-pointer ${isDefaultStyle ? 'rounded-full' : 'rounded-sm'}`}
                style={style}
              />
            );
          })}

          {/* Точки на графике - максимальный вес (div для сохранения пропорций) */}
          {showMaxWeight && visibleData.map((d, i) => {
            if (d.maxWeight <= 0) return null;
            const isSelected = i === selectedIndex;
            const isCurrent = d.workoutId === currentWorkoutId;
            const isActive = isSelected || isCurrent;
            const activeSize = 8;
            const inactiveSize = activeSize / 2;
            const size = isActive ? activeSize : inactiveSize;

            const style: React.CSSProperties = isActive ? {
              left: `${getXPosition(i)}%`,
              top: `${getYPosition(d.maxWeight)}%`,
              width: size,
              height: size,
              backgroundColor: CHART_COLORS.maxWeight,
              border: '2px solid #27272a',
            } : {
              left: `${getXPosition(i)}%`,
              top: `${getYPosition(d.maxWeight)}%`,
              width: size,
              height: size,
              backgroundColor: '#27272a',
              border: `1px solid ${CHART_COLORS.maxWeight}`,
            };

            return (
              <div
                key={`maxweight-${i}`}
                onClick={() => setSelectedIndex(i)}
                className={`absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-150 cursor-pointer ${isDefaultStyle ? 'rounded-full' : 'rounded-sm'}`}
                style={style}
              />
            );
          })}

          {/* Выбранная точка - максимальный вес (большой маркер) */}
          {selectedIndex !== null && selectedData && selectedData.maxWeight > 0 && showMaxWeight && (
            <div
              onClick={(e) => {
                e.stopPropagation();
              }}
              onDoubleClick={(e) => {
                e.stopPropagation();
                if (onNavigateToDate && selectedData) {
                  onNavigateToDate(selectedData.date, exerciseName, selectedData.maxWeightSetId);
                }
              }}
              onTouchEnd={(e) => {
                e.stopPropagation();
                const now = Date.now();
                if (now - lastClickTimeRef.current < 300) {
                  // Двойной тап
                  if (onNavigateToDate && selectedData) {
                    onNavigateToDate(selectedData.date, exerciseName, selectedData.maxWeightSetId);
                  }
                  lastClickTimeRef.current = 0;
                } else {
                  lastClickTimeRef.current = now;
                }
              }}
              className={`absolute w-4 h-4 -translate-x-1/2 -translate-y-1/2 transition-all duration-150 cursor-pointer z-10 ${isDefaultStyle ? 'rounded-full' : 'rounded-sm'}`}
              style={{
                left: `${getXPosition(selectedIndex)}%`,
                top: `${getYPosition(selectedData.maxWeight)}%`,
                backgroundColor: CHART_COLORS.maxWeight,
                border: '3px solid #27272a',
              }}
            />
          )}

          {/* Выбранная точка - вес пользователя (большой маркер) */}
          {selectedIndex !== null && selectedData && selectedData.userWeight && selectedData.userWeight > 0 && showUserWeight && (
            <div
              onClick={(e) => {
                e.stopPropagation();
              }}
              onDoubleClick={(e) => {
                e.stopPropagation();
                if (onNavigateToDate && selectedData) {
                  onNavigateToDate(selectedData.date, exerciseName, selectedData.maxWeightSetId);
                }
              }}
              onTouchEnd={(e) => {
                e.stopPropagation();
                const now = Date.now();
                if (now - lastClickTimeRef.current < 300) {
                  if (onNavigateToDate && selectedData) {
                    onNavigateToDate(selectedData.date, exerciseName, selectedData.maxWeightSetId);
                  }
                  lastClickTimeRef.current = 0;
                } else {
                  lastClickTimeRef.current = now;
                }
              }}
              className={`absolute w-4 h-4 -translate-x-1/2 -translate-y-1/2 transition-all duration-150 cursor-pointer z-10 ${isDefaultStyle ? 'rounded-full' : 'rounded-sm'}`}
              style={{
                left: `${getXPosition(selectedIndex)}%`,
                top: `${getYPosition(selectedData.userWeight)}%`,
                backgroundColor: CHART_COLORS.userWeight,
                border: '3px solid #27272a',
              }}
            />
          )}

          {/* Выбранная точка - общий объём (большой маркер) */}
          {selectedIndex !== null && selectedData && selectedData.totalVolume > 0 && showTotalVolume && (
            <div
              onClick={(e) => {
                e.stopPropagation();
              }}
              onDoubleClick={(e) => {
                e.stopPropagation();
                if (onNavigateToDate && selectedData) {
                  onNavigateToDate(selectedData.date, exerciseName, selectedData.maxWeightSetId);
                }
              }}
              onTouchEnd={(e) => {
                e.stopPropagation();
                const now = Date.now();
                if (now - lastClickTimeRef.current < 300) {
                  if (onNavigateToDate && selectedData) {
                    onNavigateToDate(selectedData.date, exerciseName, selectedData.maxWeightSetId);
                  }
                  lastClickTimeRef.current = 0;
                } else {
                  lastClickTimeRef.current = now;
                }
              }}
              className={`absolute w-4 h-4 -translate-x-1/2 -translate-y-1/2 transition-all duration-150 cursor-pointer z-10 ${isDefaultStyle ? 'rounded-full' : 'rounded-sm'}`}
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
      <div className="flex items-center -mt-1">
        <div className="w-[40px]" style={{ visibility: 'hidden' }}>
          <span className="text-xs">00000</span>
        </div>
        <div className="flex-1 flex text-xs text-zinc-500 leading-tight px-0">
          {visibleData.length > 0 && (
            <>
              <span>{formatDisplayDate(visibleData[0].date)}</span>
              <span className="ml-auto">{formatDisplayDate(visibleData[visibleData.length - 1].date)}</span>
            </>
          )}
        </div>
      </div>

      {/* Слайдер для выбора диапазона */}
      <div
        className="flex"
        style={(showUnitFilter || showPositionFilter || showEquipmentFilter || showGripFilter) ? { pointerEvents: 'none' } : undefined}
      >
        <div className="w-[40px] pr-2" style={{ visibility: 'hidden' }}>
          <span className="text-xs">00000</span>
        </div>
        <div className="flex-1 relative py-2 px-2">
          <div className="relative w-full h-[10px] bg-zinc-600 rounded">
            {/* Выбранный диапазон */}
            <div
              className="absolute h-full rounded"
              style={{
                left: `${(rangeStart / filteredData.length) * 100}%`,
                width: `${((rangeEnd - rangeStart) / filteredData.length) * 100}%`,
                backgroundColor: textColor,
                opacity: 0.5
              }}
            />

            {/* Левый ползунок */}
            <div
              className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded"
              style={{
                left: `calc(${(rangeStart / filteredData.length) * 100}% - 10px)`,
                backgroundColor: color,
                border: '2px solid #18181b'
              }}
              onTouchStart={(e) => {
                e.preventDefault();
                const startX = e.touches[0].clientX;
                const startRange = rangeStart;
                const sliderRect = (e.target as HTMLElement).parentElement!.getBoundingClientRect();

                const handleMove = (moveE: TouchEvent) => {
                  const delta = ((moveE.touches[0].clientX - startX) / sliderRect.width) * filteredData.length;
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
                  const delta = ((moveE.clientX - startX) / sliderRect.width) * filteredData.length;
                  const newStart = Math.min(Math.round(startRange + delta), rangeEnd - 3);
                  setRangeStart(Math.max(0, newStart));
                };

                const handleEnd = () => {
                  document.removeEventListener('mousemove', handleMove);
                  document.removeEventListener('mouseup', handleEnd);
                };

                document.addEventListener('mousemove', handleMove);
                document.addEventListener('mouseup', handleEnd);
              }}
            />

            {/* Правый ползунок */}
            <div
              className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded"
              style={{
                left: `calc(${(rangeEnd / filteredData.length) * 100}% - 10px)`,
                backgroundColor: color,
                border: '2px solid #18181b'
              }}
              onTouchStart={(e) => {
                e.preventDefault();
                const startX = e.touches[0].clientX;
                const startRange = rangeEnd;
                const sliderRect = (e.target as HTMLElement).parentElement!.getBoundingClientRect();

                const handleMove = (moveE: TouchEvent) => {
                  const delta = ((moveE.touches[0].clientX - startX) / sliderRect.width) * filteredData.length;
                  const newEnd = Math.max(Math.round(startRange + delta), rangeStart + 3);
                  setRangeEnd(Math.min(filteredData.length, newEnd));
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
                  const delta = ((moveE.clientX - startX) / sliderRect.width) * filteredData.length;
                  const newEnd = Math.max(Math.round(startRange + delta), rangeStart + 3);
                  setRangeEnd(Math.min(filteredData.length, newEnd));
                };

                const handleEnd = () => {
                  document.removeEventListener('mousemove', handleMove);
                  document.removeEventListener('mouseup', handleEnd);
                };

                document.addEventListener('mousemove', handleMove);
                document.addEventListener('mouseup', handleEnd);
              }}
            />
          </div>
        </div>
      </div>

      {/* Dropdown для выбора единицы измерения */}
      {(showUnitFilter || showPositionFilter || showEquipmentFilter || showGripFilter) && createPortal(
        <div
          className="fixed inset-0 z-50"
          onClick={() => {
            setShowUnitFilter(false);
            setShowPositionFilter(false);
            setShowEquipmentFilter(false);
            setShowGripFilter(false);
          }}
          onTouchStart={(e) => {
            e.stopPropagation();
            setShowUnitFilter(false);
            setShowPositionFilter(false);
            setShowEquipmentFilter(false);
            setShowGripFilter(false);
          }}
        >
          <div
            className="absolute bg-zinc-800 border border-zinc-600 rounded-lg shadow-lg py-1 max-h-[200px] overflow-y-auto"
            style={{
              top: filterPickerPosition.top,
              left: filterPickerPosition.left,
              width: Math.max(filterPickerPosition.width, 120),
            }}
            onClick={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
          >
            {showUnitFilter && (
              <>
                {Array.from(availableUnits).map((unit) => (
                  <button
                    key={unit}
                    type="button"
                    style={{ touchAction: 'manipulation', pointerEvents: 'auto', ...(selectedUnit === unit ? { backgroundColor: '#3f3f46', color: '#fff' } : {}) }}
                    onClick={() => { setSelectedUnit(unit); setShowUnitFilter(false); }}
                    className="px-3 py-1.5 text-xs rounded-lg transition-colors text-left text-zinc-300 hover:bg-zinc-700"
                  >
                    {WEIGHT_UNITS[unit].full}
                  </button>
                ))}
              </>
            )}
            {showPositionFilter && (
              <>
                <button
                  type="button"
                  style={{ touchAction: 'manipulation', pointerEvents: 'auto', ...(filterPosition === 'all' ? { backgroundColor: '#3f3f46', color: '#fff' } : {}) }}
                  onClick={() => { setFilterPosition('all'); setShowPositionFilter(false); }}
                  className="px-3 py-1.5 text-xs rounded-lg transition-colors text-left text-zinc-300 hover:bg-zinc-700"
                >
                  Все
                </button>
                {Array.from(availableTags.positions).map((position) => (
                  <button
                    key={position}
                    type="button"
                    style={{ touchAction: 'manipulation', pointerEvents: 'auto', ...(filterPosition === position ? { backgroundColor: '#3f3f46', color: '#fff' } : {}) }}
                    onClick={() => { setFilterPosition(position); setShowPositionFilter(false); }}
                    className="px-3 py-1.5 text-xs rounded-lg transition-colors text-left text-zinc-300 hover:bg-zinc-700"
                  >
                    {POSITION_TYPES[position].full}
                  </button>
                ))}
              </>
            )}
            {showEquipmentFilter && (
              <>
                <button
                  type="button"
                  style={{ touchAction: 'manipulation', pointerEvents: 'auto', ...(filterEquipment === 'all' ? { backgroundColor: '#3f3f46', color: '#fff' } : {}) }}
                  onClick={() => { setFilterEquipment('all'); setShowEquipmentFilter(false); }}
                  className="px-3 py-1.5 text-xs rounded-lg transition-colors text-left text-zinc-300 hover:bg-zinc-700"
                >
                  Все
                </button>
                {Array.from(availableTags.equipments).map((equipment) => (
                  <button
                    key={equipment}
                    type="button"
                    style={{ touchAction: 'manipulation', pointerEvents: 'auto', ...(filterEquipment === equipment ? { backgroundColor: '#3f3f46', color: '#fff' } : {}) }}
                    onClick={() => { setFilterEquipment(equipment); setShowEquipmentFilter(false); }}
                    className="px-3 py-1.5 text-xs rounded-lg transition-colors text-left text-zinc-300 hover:bg-zinc-700"
                  >
                    {EQUIPMENT_TYPES[equipment].full}
                  </button>
                ))}
              </>
            )}
            {showGripFilter && (
              <>
                <button
                  type="button"
                  style={{ touchAction: 'manipulation', pointerEvents: 'auto', ...(filterGrip === 'all' ? { backgroundColor: '#3f3f46', color: '#fff' } : {}) }}
                  onClick={() => { setFilterGrip('all'); setShowGripFilter(false); }}
                  className="px-3 py-1.5 text-xs rounded-lg transition-colors text-left text-zinc-300 hover:bg-zinc-700"
                >
                  Все
                </button>
                {Array.from(availableTags.grips).map((grip) => (
                  <button
                    key={grip}
                    type="button"
                    style={{ touchAction: 'manipulation', pointerEvents: 'auto', ...(filterGrip === grip ? { backgroundColor: '#3f3f46', color: '#fff' } : {}) }}
                    onClick={() => { setFilterGrip(grip); setShowGripFilter(false); }}
                    className="px-3 py-1.5 text-xs rounded-lg transition-colors text-left text-zinc-300 hover:bg-zinc-700"
                  >
                    {GRIP_TYPES[grip].full}
                  </button>
                ))}
              </>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
