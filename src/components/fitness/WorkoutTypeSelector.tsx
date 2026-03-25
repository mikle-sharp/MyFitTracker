'use client';

import { DumbbellIcon, HeartIcon, TargetIcon, LegsIcon } from '@/components/icons/Icons';
import { WorkoutType, WORKOUT_TYPE_COLORS, WORKOUT_TYPE_NAMES } from '@/lib/types';
import { cn } from '@/lib/utils';

interface WorkoutTypeSelectorProps {
  selectedType: WorkoutType | null;
  onSelect: (type: WorkoutType) => void;
  isDefaultStyle?: boolean;
}

const typeDescriptions: Record<WorkoutType, string> = {
  chest: 'Жимы, сведения, разведения',
  back: 'Тяги, подтягивания, шраги',
  legs: 'Приседания, сгибания, разгибания',
  fullbody: 'Комплексная тренировка',
};

export function WorkoutTypeSelector({ selectedType, onSelect, isDefaultStyle = true }: WorkoutTypeSelectorProps) {
  const types: WorkoutType[] = ['chest', 'back', 'legs', 'fullbody'];

  // Иконки в зависимости от стиля
  const getTypeIcon = (type: WorkoutType) => {
    switch (type) {
      case 'chest': return <DumbbellIcon className="w-6 h-6" />;
      case 'back': return <TargetIcon className="w-6 h-6" />;
      case 'legs': return <LegsIcon className="w-6 h-6" />;
      case 'fullbody': return <HeartIcon className="w-6 h-6" />;
    }
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      {types.map((type) => {
        const colors = WORKOUT_TYPE_COLORS[type];
        const isSelected = selectedType === type;

        return (
          <button
            key={type}
            onClick={() => onSelect(type)}
            className={cn(
              'relative p-4 rounded-lg border-2 transition-all duration-200',
              'flex flex-col items-center gap-2',
              'min-h-[100px]',
              'hover:scale-[1.02] active:scale-95',
              isSelected
                ? ''
                : 'bg-zinc-800/50 border-zinc-700 text-zinc-300 hover:border-zinc-500'
            )}
            style={isSelected ? {
              backgroundColor: colors.bg,
              borderColor: colors.border,
              color: colors.text
            } : undefined}
          >
            <div
              className="p-2 rounded-lg"
              style={{ backgroundColor: 'rgba(0,0,0,0.35)' }}
            >
              {getTypeIcon(type)}
            </div>
            <div className="text-center">
              <div className="font-semibold text-sm">{WORKOUT_TYPE_NAMES[type]}</div>
              <div className="text-xs opacity-70 mt-0.5">{typeDescriptions[type]}</div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
