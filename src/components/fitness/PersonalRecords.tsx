'use client';

import { useMemo } from 'react';
import { User, Clock } from 'lucide-react';
import { calculatePersonalRecords } from '@/lib/pr';
import { format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { WORKOUT_TYPE_COLORS, WORKOUT_TYPE_ICONS, PersonalRecord } from '@/lib/types';
import { cn } from '@/lib/utils';

// Компонент для отображения значения рекорда в формате таблицы
function RecordValue({ record }: { record: PersonalRecord }) {
  // Рекорд по времени
  if (record.time && record.time > 0) {
    const mins = Math.floor(record.time / 60);
    const secs = record.time % 60;
    return (
      <div className="flex items-center gap-1 font-bold text-amber-400">
        <Clock className="w-4 h-4 text-purple-400" />
        <span>{mins}:{secs.toString().padStart(2, '0')}</span>
      </div>
    );
  }
  
  // Рекорд собственного веса - иконка + повторения
  if (record.maxWeight === 0 && record.reps > 0) {
    return (
      <div className="flex items-center gap-1 font-bold text-amber-400">
        <User className="w-4 h-4 text-emerald-400" />
        <span>{record.reps}</span>
      </div>
    );
  }
  
  // Рекорд с весом - формат "Вес × Повторения" с выравниванием колонок
  if (record.maxWeight > 0) {
    return (
      <div className="flex items-baseline gap-1 font-bold text-amber-400">
        <span className="w-14 text-right">{record.maxWeight}</span>
        <span className="w-4 text-center text-amber-400/70">кг</span>
        <span className="w-3 text-center text-amber-400/70">×</span>
        <span className="w-6 text-left">{record.reps}</span>
      </div>
    );
  }
  
  return null;
}

export function PersonalRecords() {
  const records = useMemo(() => calculatePersonalRecords(), []);

  if (records.length === 0) {
    return (
      <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-4 text-center">
        <p className="text-zinc-500">У Вас пока нет рекордов</p>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 overflow-hidden">
      <div className="p-3 flex items-center justify-center">
        <h3 className="text-lg font-semibold text-white">Личные рекорды</h3>
      </div>

      <ScrollArea>
        <div className="p-2">
          {records.map((record, index) => {
            const colors = WORKOUT_TYPE_COLORS[record.workoutType];
            const icon = WORKOUT_TYPE_ICONS[record.workoutType];
            return (
              <motion.div
                key={record.exerciseName}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg transition-colors border-l-2",
                  colors.bg,
                  colors.border,
                  "hover:bg-zinc-800/50"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", colors.bg)}>
                    <span className="text-base">{icon}</span>
                  </div>
                  <div>
                    <div className="font-medium text-white">{record.exerciseName}</div>
                    <div className="text-xs text-zinc-500">
                      {format(parseISO(record.date), 'd MMM yyyy', { locale: ru })}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <RecordValue record={record} />
                </div>
              </motion.div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
