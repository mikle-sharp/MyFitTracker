'use client';

import { Dumbbell, Heart, Target, Zap } from 'lucide-react';
import { WorkoutType, WORKOUT_TYPE_COLORS, WORKOUT_TYPE_NAMES } from '@/lib/types';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface WorkoutTypeSelectorProps {
  selectedType: WorkoutType | null;
  onSelect: (type: WorkoutType) => void;
}

const typeIcons: Record<WorkoutType, React.ReactNode> = {
  chest: <Dumbbell className="w-6 h-6" />,
  back: <Target className="w-6 h-6" />,
  legs: <Zap className="w-6 h-6" />,
  fullbody: <Heart className="w-6 h-6" />,
};

const typeDescriptions: Record<WorkoutType, string> = {
  chest: 'Жим, разводка, отжимания',
  back: 'Тяги, подтягивания',
  legs: 'Приседания, выпады',
  fullbody: 'Комплексная тренировка',
};

export function WorkoutTypeSelector({ selectedType, onSelect }: WorkoutTypeSelectorProps) {
  const types: WorkoutType[] = ['chest', 'back', 'legs', 'fullbody'];

  return (
    <div className="grid grid-cols-2 gap-3">
      {types.map((type) => {
        const colors = WORKOUT_TYPE_COLORS[type];
        const isSelected = selectedType === type;

        return (
          <motion.button
            key={type}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(type)}
            className={cn(
              'relative p-4 rounded-xl border-2 transition-all duration-300',
              'flex flex-col items-center gap-2',
              'min-h-[100px]',
              isSelected
                ? `${colors.bg} ${colors.border} ${colors.text}`
                : 'bg-zinc-800/50 border-zinc-700 text-zinc-300 hover:border-zinc-500'
            )}
          >
            <div className={cn(
              'p-2 rounded-lg',
              isSelected ? colors.bg : 'bg-zinc-700/50'
            )}>
              {typeIcons[type]}
            </div>
            <div className="text-center">
              <div className="font-semibold text-sm">{WORKOUT_TYPE_NAMES[type]}</div>
              <div className="text-xs opacity-70 mt-0.5">{typeDescriptions[type]}</div>
            </div>
            
            {isSelected && (
              <motion.div
                layoutId="selected-indicator"
                className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center"
              >
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </motion.div>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
